from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
import requests
import time

# -------------------------------------------------
# App config
# -------------------------------------------------
app = FastAPI(
    title="Vegetable Detection API",
    version="1.0.0",
    description="YOLO-based vegetable detection service"
)

# -------------------------------------------------
# Load YOLO model ONCE (startup)
# -------------------------------------------------
try:
    model = YOLO("best (4).pt")
    model.fuse()  # ⚡ speed-up for CPU
    CLASS_NAMES = model.names
except Exception as e:
    raise RuntimeError(f"Model loading failed: {e}")

# -------------------------------------------------
# Constants
# -------------------------------------------------
MAX_IMAGE_SIZE_MB = 5
REQUEST_TIMEOUT = 10
CONF_THRESHOLD = 0.25
IMG_SIZE = 512

# -------------------------------------------------
# Health Check
# -------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": True}

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def is_valid_url(url: str | None) -> bool:
    if not url:
        return False
    url = url.strip()
    return url.startswith(("http://", "https://"))


def load_image_from_url(image_url: str):
    try:
        response = requests.get(image_url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()

        if len(response.content) > MAX_IMAGE_SIZE_MB * 1024 * 1024:
            raise ValueError("Image too large")

        img_array = np.frombuffer(response.content, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Invalid image format")

        return img

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def load_image_from_upload(file: UploadFile, data: bytes):
    if len(data) > MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Uploaded image too large")

    img_array = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid uploaded image")

    return img


# -------------------------------------------------
# Detection Endpoint
# -------------------------------------------------
@app.post("/detect")
async def detect_vegetables(
    image_url: str | None = Form(default=None),
    file: UploadFile | None = File(default=None)
):
    if not image_url and not file:
        raise HTTPException(
            status_code=400,
            detail="Provide either image_url or image file"
        )

    # -----------------------------
    # Load image
    # -----------------------------
    if image_url and is_valid_url(image_url):
        img = load_image_from_url(image_url)
        image_source = image_url

    elif file:
        image_bytes = await file.read()
        img = load_image_from_upload(file, image_bytes)
        image_source = "uploaded_file"

    else:
        raise HTTPException(status_code=400, detail="Invalid input")

    # -----------------------------
    # YOLO inference
    # -----------------------------
    start = time.time()

    results = model(
        img,
        imgsz=IMG_SIZE,
        conf=CONF_THRESHOLD,
        verbose=False
    )[0]

    inference_time = round(time.time() - start, 3)

    detected = {}

    if results.boxes is not None:
        for box in results.boxes:
            cls_id = int(box.cls[0])
            conf = round(float(box.conf[0]), 3)
            class_name = CLASS_NAMES[cls_id]

            # Keep highest confidence per class
            if class_name not in detected or conf > detected[class_name]:
                detected[class_name] = conf

    detections = [
        {"class": k, "confidence": v}
        for k, v in detected.items()
    ]

    # -----------------------------
    # Response
    # -----------------------------
    return JSONResponse(
        status_code=200,
        content={
            "image_source": image_source,
            "total_detections": len(detections),
            "detections": detections,
            "inference_time_sec": inference_time
        }
    )


# -------------------------------------------------
# Hugging Face entrypoint
# -------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
