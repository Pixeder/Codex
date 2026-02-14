"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, ScanLine, X, Flame, ChefHat, Clock, Check } from "lucide-react";

// --- CUSTOM ANIMATION CURVE ---
const ease = [0.76, 0, 0.24, 1];

// --- UTILITY COMPONENTS ---
const Grain = () => (
  <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.04] mix-blend-multiply" 
       style={{ backgroundImage: 'url("https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png")' }} />
);

const RevealText = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <div className="overflow-hidden py-1">
    <motion.div
      initial={{ y: "120%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease, delay }}
      className="origin-bottom-left"
    >
      {children}
    </motion.div>
  </div>
);

// High-end fallback images for recipes without them
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200",
  "https://images.unsplash.com/photo-1481070555726-e2fe83477d4a?q=80&w=1200",
];

// --- MAIN PAGE COMPONENT ---
export default function Analyze() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'results' | 'error'>('idle');
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // 2. Upload and Analyze
  const handleAnalyze = async () => {
    if (!file) return;
    setStatus('analyzing');
    
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("http://localhost:5000/api/ai/analyze", {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Analysis failed");

      setAnalysisData(data.data);
      setStatus('results');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  // 3. Fetch Specific Recipe Details
  const handleRecipeClick = async (id: string, index: number) => {
    setIsRecipeLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${id}`);
      const data = await res.json();
      
      if (!res.ok || !data.success) throw new Error("Failed to fetch recipe");

      // Attach a stable fallback image based on its index in the results array
      setSelectedRecipe({
        ...data.data,
        displayImage: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
      });
    } catch (err) {
      console.error(err);
      alert("Could not load recipe details.");
    } finally {
      setIsRecipeLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCF6] text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-[#FDFCF6] pb-32">
      <Grain />

      {/* --- NAV --- */}
      <nav className="fixed top-0 w-full p-6 md:p-8 flex justify-between items-center z-40 mix-blend-difference text-[#FDFCF6]">
        <Link href="/" className="flex items-center gap-4 group text-[10px] uppercase tracking-[0.2em] font-bold hover:opacity-70 transition-opacity">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Return
        </Link>
        <span className="text-2xl font-serif font-bold tracking-tight">FoodScope</span>
      </nav>

      {/* --- STATE 1: IDLE / UPLOAD --- */}
      {status === 'idle' && (
        <section className="pt-40 px-6 md:px-12 max-w-7xl mx-auto min-h-[80vh] flex flex-col">
          <RevealText>
             <h1 className="text-6xl md:text-[7vw] font-serif leading-[0.85] tracking-tighter mb-16">
               Visual Analysis
             </h1>
          </RevealText>

          <div className="flex flex-col lg:flex-row gap-16 flex-grow">
             {/* Upload Box */}
             <div className="w-full lg:w-1/2">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full aspect-square border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 relative overflow-hidden group
                    ${previewUrl ? 'border-[#1A1A1A]' : 'border-[#1A1A1A]/20 hover:border-[#1A1A1A]/60 bg-[#1A1A1A]/[0.02]'}
                  `}
                >
                   {previewUrl ? (
                     <>
                       <Image src={previewUrl} alt="Preview" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500" unoptimized />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="bg-[#1A1A1A] text-[#FDFCF6] px-6 py-3 font-mono text-[10px] uppercase tracking-widest">Change Image</span>
                       </div>
                     </>
                   ) : (
                     <div className="text-center p-8 group-hover:scale-105 transition-transform duration-500">
                        <ScanLine size={48} strokeWidth={1} className="mx-auto mb-6 opacity-40" />
                        <span className="font-mono text-sm uppercase tracking-widest opacity-60 block mb-2">Select Target Image</span>
                        <span className="font-serif text-xl opacity-40">JPG, PNG up to 5MB</span>
                     </div>
                   )}
                </div>
             </div>

             {/* Action Console */}
             <div className="w-full lg:w-1/2 flex flex-col justify-end pb-8">
                <p className="font-serif text-3xl md:text-4xl leading-tight opacity-80 mb-12">
                   Provide an image of your ingredients or current meal. Our intelligence system will detect the components and generate hyper-optimized flavor pairings.
                </p>

                <button 
                  onClick={handleAnalyze}
                  disabled={!file}
                  className="group relative w-full h-[80px] bg-[#1A1A1A] overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-[#C26D5C] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[0.76,0,0.24,1]" />
                  <div className="relative z-10 flex items-center justify-between px-8 w-full h-full text-[#FDFCF6]">
                    <span className="font-mono text-sm uppercase tracking-[0.2em] font-bold">
                      Execute Analysis
                    </span>
                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
                  </div>
                </button>
             </div>
          </div>
        </section>
      )}

      {/* --- STATE 2: ANALYZING --- */}
      {status === 'analyzing' && (
        <section className="h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF6] text-[#1A1A1A]">
           <div className="relative w-64 h-64 md:w-96 md:h-96 mb-12">
              {previewUrl && <Image src={previewUrl} alt="Scanning" fill className="object-cover grayscale opacity-30" unoptimized />}
              
              {/* Laser Scan Animation */}
              <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                className="absolute left-0 w-full h-[2px] bg-[#D48C70] shadow-[0_0_20px_#D48C70] z-10"
              />
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#1A1A1A]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#1A1A1A]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#1A1A1A]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#1A1A1A]" />
           </div>

           <RevealText><span className="font-mono text-sm font-bold uppercase tracking-[0.3em]">Processing Visual Data</span></RevealText>
           <p className="font-serif text-2xl opacity-40 mt-4 animate-pulse">Running flavor pairing algorithms...</p>
        </section>
      )}

      {/* --- STATE 3: RESULTS --- */}
      {status === 'results' && analysisData && (
        <section className="pt-32 px-6 md:px-12 max-w-[95%] mx-auto animate-in fade-in duration-1000">
           
           <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 mb-24">
             {/* Left: Original Image & Data */}
             <div className="w-full lg:w-1/3">
                <RevealText>
                  <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 mb-8 border-l-2 border-[#1A1A1A] pl-4">
                    Visual Source
                  </div>
                </RevealText>
                
                <div className="w-full aspect-square relative mb-12 border-2 border-[#1A1A1A] p-2">
                   <div className="w-full h-full relative overflow-hidden bg-[#EAE8E0]">
                     {previewUrl && <Image src={previewUrl} alt="Source" fill className="object-cover" unoptimized />}
                   </div>
                </div>

                <RevealText delay={0.1}>
                  <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 mb-6 border-l-2 border-[#1A1A1A] pl-4">
                    Detected Entities
                  </div>
                </RevealText>
                
                <div className="flex flex-wrap gap-3">
                   {analysisData.detectedIngredients.map((item: string, i: number) => (
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + (i * 0.05), ease }}
                        key={i} className="border border-[#1A1A1A] px-4 py-2 font-mono text-[10px] uppercase tracking-widest bg-white"
                      >
                         {item}
                      </motion.span>
                   ))}
                </div>
             </div>

             {/* Right: Suggested Recipes Grid */}
             <div className="w-full lg:w-2/3">
                <RevealText delay={0.2}>
                  <h2 className="text-5xl md:text-7xl font-serif tracking-tighter leading-none mb-16">
                    Optimized <br/><span className="italic text-[#D48C70]">Pairings.</span>
                  </h2>
                </RevealText>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16">
                   {analysisData.pairingBasedRecipes.map((recipe: any, i: number) => (
                      <motion.div 
                        key={recipe.id}
                        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + (i * 0.1), ease }}
                        onClick={() => handleRecipeClick(recipe.id, i)}
                        className="group cursor-pointer flex flex-col"
                      >
                         {/* Thumbnail */}
                         <div className="w-full aspect-[4/3] relative overflow-hidden bg-[#EAE8E0] mb-6 border border-[#1A1A1A]/10">
                            {/* Force fallback images for display since API returns null */}
                            <Image 
                              src={FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]} alt={recipe.name} fill unoptimized
                              className="object-cover transition-transform duration-[1.5s] ease-[0.76,0,0.24,1] group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-[#D48C70]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                               <span className="text-[#FDFCF6] font-mono text-[10px] uppercase tracking-[0.2em] font-bold">View Dossier</span>
                            </div>
                         </div>
                         
                         {/* Meta */}
                         <div className="flex items-center gap-4 mb-4">
                            <span className="text-[9px] font-mono uppercase tracking-widest opacity-40">ID // {recipe.id}</span>
                            <div className="flex-grow h-[1px] bg-[#1A1A1A]/10 origin-left scale-x-100 transition-transform duration-500" />
                         </div>
                         
                         {/* Title */}
                         <h3 className="text-3xl font-serif leading-tight tracking-tight text-[#1A1A1A] group-hover:text-[#D48C70] transition-colors line-clamp-2">
                           {recipe.name}
                         </h3>
                      </motion.div>
                   ))}
                </div>
             </div>
           </div>
        </section>
      )}

      {/* --- STATE 4: RECIPE DETAIL MODAL (FULL SCREEN OVERLAY) --- */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }} transition={{ duration: 0.8, ease }}
            className="fixed inset-0 z-[100] bg-[#FDFCF6] overflow-y-auto"
          >
             <Grain />
             
             {/* Modal Nav */}
             <div className="sticky top-0 w-full p-6 md:p-8 flex justify-between items-center z-50 mix-blend-difference text-[#FDFCF6]">
                <span className="text-xl font-serif font-bold tracking-tight opacity-50">Dossier // {selectedRecipe.id}</span>
                <button onClick={() => setSelectedRecipe(null)} className="flex items-center gap-4 group text-[10px] uppercase tracking-[0.2em] font-bold hover:opacity-70 transition-opacity">
                  CLOSE <X size={20} className="transition-transform group-hover:rotate-90" /> 
                </button>
             </div>

             {/* Modal Hero */}
             <div className="w-full h-[60vh] relative bg-[#0a0a0a]">
                <Image src={selectedRecipe.displayImage} alt={selectedRecipe.title} fill className="object-cover opacity-60" unoptimized priority />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-[#FDFCF6]">
                   <RevealText>
                      <h1 className="text-5xl md:text-[6vw] font-serif leading-[0.85] tracking-tighter mb-8 max-w-6xl">
                        {selectedRecipe.title}
                      </h1>
                   </RevealText>
                   <RevealText delay={0.1}>
                      <div className="flex flex-wrap items-center gap-8 font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">
                         <span className="flex items-center gap-2"><Clock size={14}/> {selectedRecipe.time.total}</span>
                         <span className="flex items-center gap-2"><ChefHat size={14}/> {selectedRecipe.cuisine.region}</span>
                         <span className="flex items-center gap-2"><Flame size={14} className="text-[#D48C70]"/> {selectedRecipe.nutrition.calories} kcal</span>
                         {selectedRecipe.dietType.vegetarian && <span className="border border-white/20 px-3 py-1 rounded-full">Vegetarian</span>}
                      </div>
                   </RevealText>
                </div>
             </div>

             {/* Modal Content - Brutalist Layout */}
             <div className="max-w-[95%] mx-auto px-6 md:px-12 py-24 flex flex-col lg:flex-row gap-16 lg:gap-24">
                
                {/* Left Col: Ingredients & Nutrition */}
                <div className="w-full lg:w-1/3">
                   
                   {/* Nutrition Bento */}
                   <div className="border-2 border-[#1A1A1A] bg-white mb-16 flex flex-col">
                      <div className="border-b-2 border-[#1A1A1A] p-6 bg-[#1A1A1A] text-[#FDFCF6]">
                         <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Nutritional Data</span>
                      </div>
                      <div className="flex border-b-2 border-[#1A1A1A]">
                         <div className="w-1/2 p-6 border-r-2 border-[#1A1A1A]">
                            <span className="block text-[9px] font-mono uppercase tracking-[0.2em] opacity-50 mb-4">Protein</span>
                            <span className="font-serif text-3xl">{selectedRecipe.nutrition.protein}<span className="text-sm opacity-50 ml-1">g</span></span>
                         </div>
                         <div className="w-1/2 p-6">
                            <span className="block text-[9px] font-mono uppercase tracking-[0.2em] opacity-50 mb-4">Carbs</span>
                            <span className="font-serif text-3xl">{selectedRecipe.nutrition.carbs}<span className="text-sm opacity-50 ml-1">g</span></span>
                         </div>
                      </div>
                      <div className="p-6">
                         <span className="block text-[9px] font-mono uppercase tracking-[0.2em] opacity-50 mb-4">Fats</span>
                         <span className="font-serif text-3xl">{selectedRecipe.nutrition.fat}<span className="text-sm opacity-50 ml-1">g</span></span>
                      </div>
                   </div>

                   {/* Ingredients List */}
                   <h3 className="font-serif text-4xl mb-8">Components</h3>
                   <ul className="flex flex-col border-t-2 border-[#1A1A1A]">
                      {selectedRecipe.ingredients.map((ing: any, i: number) => (
                         <li key={i} className="py-4 border-b border-[#1A1A1A]/20 flex items-start gap-4">
                            <Check size={16} className="mt-1 text-[#D48C70] shrink-0" />
                            <span className="font-mono text-xs uppercase tracking-widest leading-relaxed">
                               {ing.phrase}
                            </span>
                         </li>
                      ))}
                   </ul>
                </div>

                {/* Right Col: Instructions */}
                <div className="w-full lg:w-2/3">
                   <h3 className="font-serif text-5xl mb-12">Execution</h3>
                   <div className="flex flex-col gap-12">
                      {selectedRecipe.instructions.map((step: any, i: number) => (
                         <div key={i} className="flex gap-8 lg:gap-12">
                            <span className="font-serif text-5xl text-[#1A1A1A]/20 leading-none shrink-0 w-12 text-right">
                               {step.stepNumber}
                            </span>
                            <div className="border-l-2 border-[#1A1A1A]/10 pl-8 lg:pl-12">
                               <p className="font-serif text-2xl md:text-3xl leading-snug tracking-tight text-[#1A1A1A]/90">
                                 {step.instruction}
                               </p>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Loading Overlay for Recipe Fetch */}
      <AnimatePresence>
         {isRecipeLoading && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-[#1A1A1A] flex flex-col items-center justify-center text-[#FDFCF6]"
            >
               <Loader2 size={48} className="animate-spin mb-8" strokeWidth={1} />
               <span className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-50">Retrieving Dossier</span>
            </motion.div>
         )}
      </AnimatePresence>

    </main>
  );
}