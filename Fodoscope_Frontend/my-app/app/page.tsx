"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import SmoothScroll from "../components/SmoothScroll";
import Image from "next/image";

// --- UTILITY COMPONENTS ---

const GrainOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.05] mix-blend-multiply">
    <div 
      className="w-full h-full bg-repeat"
      style={{ backgroundImage: 'url("https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png")' }} 
    />
  </div>
);

const EditorialText = ({ children, className, delay = 0 }: { children: string, className?: string, delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        animate={isInView ? { y: 0 } : { y: "100%" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Image component with 'unoptimized' to prevent timeouts
const ParallaxImage = ({ src, alt, speed = 1, className }: { src: string, alt: string, speed?: number, className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.2, 1]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="w-full h-full relative">
        <motion.div style={{ scale }} className="w-full h-full relative">
           <Image src={src} alt={alt} fill className="object-cover" unoptimized />
        </motion.div>
      </motion.div>
    </div>
  );
};

// --- SECTIONS ---

const Hero = () => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <section ref={container} className="relative h-[110vh] -mb-[10vh] z-0">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#1A1A1A]">
        <motion.div style={{ y }} className="relative w-full h-full">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-80" src="https://www.pexels.com/download/video/5857696/" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10 px-4">
            <h1 className="text-[13vw] leading-[0.8] font-serif text-[#FDFCF6] tracking-tight mix-blend-overlay">
              <span className="block">See food.</span>
              <span className="block">Cook smart.</span>
            </h1>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}
               className="mt-12 flex flex-col items-center gap-2"
            >
               <div className="h-16 w-[1px] bg-[#FDFCF6]/50 mb-4" />
               <span className="text-xs uppercase tracking-[0.2em] text-[#FDFCF6]/80">Scroll to Discover</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const LineSection = () => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ["start center", "end center"] });
  const pathLength = useSpring(scrollYProgress, { stiffness: 400, damping: 90 });

  return (
    <section ref={container} className="relative h-[150vh] bg-[#FDFCF6] flex flex-col items-center pt-32 overflow-hidden z-10">
      <div className="relative w-full max-w-5xl h-full">
        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
           <motion.path 
             d="M 200 50 Q 600 400 200 800 T 400 1200" 
             fill="none" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="4 4" 
             style={{ pathLength }} 
           />
        </svg>

        <div className="absolute top-0 left-[10%]">
           <span className="text-[10px] font-mono uppercase border border-black/20 px-2 py-1 rounded-full">Input Data</span>
           <EditorialText className="text-6xl font-serif mt-4">From fridge</EditorialText>
        </div>

        <div className="absolute top-[40%] right-[15%] text-right">
           <span className="text-[10px] font-mono uppercase border border-black/20 px-2 py-1 rounded-full">Processing</span>
           <EditorialText className="text-6xl font-serif mt-4">to nutrition</EditorialText>
        </div>

        <div className="absolute bottom-[20%] left-[20%] max-w-md">
           <p className="text-2xl font-serif leading-relaxed text-[#1A1A1A]/80">
             Our computer vision identifies ingredients instantly, turning chaos into a curated meal plan.
           </p>
        </div>
      </div>
    </section>
  );
};

const BlueprintSection = () => {
  return (
    <section className="bg-[#FDFCF6] text-[#1A1A1A] relative z-10 overflow-hidden">
      <div className="flex flex-col md:flex-row max-w-[95%] mx-auto relative">
        <div className="md:w-1/2 relative h-[250vh]">
          <div className="sticky top-0 h-screen flex flex-col justify-center p-8 z-10">
             <div className="overflow-hidden">
                <EditorialText className="text-8xl font-serif leading-[0.85]">Powered</EditorialText>
                <EditorialText className="text-8xl font-serif leading-[0.85] ml-12 italic text-[#A8B545]">by Vision</EditorialText>
             </div>
          </div>
        </div>
        
        <div className="md:w-1/2 relative h-[250vh] w-full">
           <div className="absolute top-0 left-0 w-[50%] aspect-[3/4] z-10">
              <ParallaxImage src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800" alt="Ingredients" speed={-2} className="w-full h-full" />
           </div>
           
           <div className="absolute top-[30%] right-[10%] w-[50%] z-20 bg-[#FDFCF6] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              <p className="text-xl font-light leading-relaxed">
                Scan. Detect. Cook. <br/> FoodScope identifies 5,000+ ingredients with 99% accuracy.
              </p>
           </div>
           
           <div className="absolute top-[50%] -left-[10%] w-[100%] aspect-[16/9] z-10">
              <ParallaxImage src="https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1200" alt="Analysis" speed={1} className="w-full h-full" />
           </div>

           <div className="absolute top-[80%] right-0 w-[60%] aspect-square z-10">
              <ParallaxImage src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=800" alt="Result" speed={-3} className="w-full h-full" />
           </div>
        </div>
      </div>
    </section>
  );
};

const RealFatsSection = () => {
  return (
    <section className="bg-[#FDFCF6] text-[#1A1A1A] pb-32 relative z-10 overflow-hidden">
      <div className="flex flex-col md:flex-row max-w-[95%] mx-auto relative">
        <div className="md:w-1/2 relative h-[250vh] w-full order-2 md:order-1">
           <div className="absolute top-20 right-0 w-[80%] aspect-[4/3] z-10">
              <ParallaxImage src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800" alt="Meal" speed={-2.5} className="w-full h-full" />
           </div>

           <div className="absolute top-[40%] left-0 w-[50%] aspect-square z-20 border-[10px] border-[#FDFCF6]">
              <ParallaxImage src="https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=800" alt="Toast" speed={-1} className="w-full h-full" />
           </div>

           <div className="absolute top-[75%] right-[10%] w-[60%] aspect-[3/4] z-10">
              <ParallaxImage src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800" alt="Bowl" speed={0.5} className="w-full h-full" />
           </div>
        </div>

        <div className="md:w-1/2 relative h-[250vh] order-1 md:order-2">
          <div className="sticky top-0 h-screen flex flex-col justify-center p-8 text-right z-10">
             <EditorialText className="text-8xl font-serif leading-[0.9]">Your goals,</EditorialText>
             <EditorialText className="text-8xl font-serif leading-[0.9] italic text-[#D48C70]" delay={0.1}>your plate</EditorialText>
             <p className="mt-8 text-xl opacity-60 max-w-md ml-auto mr-2">
                Keto? Vegan? High Protein? <br/>We adapt recipes to your biology.
             </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- 5. PROBLEM SECTION (Wood Texture) ---
const ProblemSection = () => {
    return (
      // z-0 ensures it sits behind the Future Section curtain
      <section className="relative h-[150vh] w-full z-0">
        <div className="sticky top-0 h-screen w-full -z-10 bg-[#3E2B26]">
           <Image 
             src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800" 
             alt="Texture" fill className="object-cover brightness-50 sepia-[.4]" unoptimized 
           />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-[#FDFCF6] text-center p-4">
           <h2 className="text-sm font-mono uppercase tracking-widest border border-white/30 px-3 py-1 rounded-full mb-8">Mission</h2>
           <div className="text-6xl md:text-8xl font-serif space-y-2 leading-[0.85] mix-blend-overlay">
               <p>Minimize</p><p>Waste.</p><p>Maximize</p><p className="italic">Taste.</p>
           </div>
        </div>
      </section>
    );
};

// --- 6. FUTURE SECTION (FIXED: Strict Z-Index Layering) ---
const FutureSection = () => {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({ target: container, offset: ["start center", "end center"] });
    const pathLength = useSpring(scrollYProgress, { stiffness: 400, damping: 90 });

    return (
      // 1. Container: z-10 ensures it slides OVER the z-0 ProblemSection
      <section ref={container} className="relative h-[250vh] w-full bg-[#1A2E1A] z-10">
         
         {/* 2. Background: sticky, but z-0 to sit BEHIND text content */}
         <div className="sticky top-0 left-0 w-full h-screen z-0 overflow-hidden">
            <Image 
                src="https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2500" 
                alt="Forest" fill className="object-cover blur-sm brightness-75" unoptimized 
            />
            {/* Darker overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40" />
         </div>
         
         {/* 3. Content: Absolute over the tall section, z-20 to sit ON TOP of background */}
         <div className="absolute top-0 w-full h-full z-20 pointer-events-none">
             
             {/* Text Group 1 */}
             <div className="sticky top-[20%] w-full max-w-6xl mx-auto px-6 text-right">
                <div className="inline-block">
                    <EditorialText className="text-5xl font-serif leading-tight text-[#FDFCF6]">The future of cooking is</EditorialText>
                    <div className="h-[2px] w-full bg-white/20 mt-8 relative">
                        <div className="absolute right-0 top-[-3px] w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                </div>
             </div>

             {/* Connecting Line */}
             <div className="absolute top-[30%] right-[20%] w-[2px] h-[40%] opacity-50">
                 <svg className="w-[300px] h-full overflow-visible -ml-[150px]">
                    <motion.path 
                        d="M 150 0 Q 100 250 0 500" 
                        fill="none" stroke="#FDFCF6" strokeWidth="2" strokeDasharray="6 6" 
                        style={{ pathLength }} 
                    />
                 </svg>
             </div>

             {/* Text Group 2 */}
             <div className="absolute bottom-[20%] left-0 w-full max-w-6xl mx-auto px-6">
                 <div className="md:ml-24 space-y-4">
                    {["smarter", "healthier", "sustainable"].map((word, i) => (
                       <motion.div 
                         key={i} 
                         initial={{ opacity: 0, x: -50 }} 
                         whileInView={{ opacity: (i+1)*0.25, x: 0 }} 
                         transition={{ duration: 0.8, delay: i * 0.1 }} 
                         className="text-7xl md:text-9xl font-serif text-white/90"
                       >
                         {word}
                       </motion.div>
                    ))}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }} 
                        whileInView={{ opacity: 1, x: 0 }} 
                        transition={{ duration: 0.8, delay: 0.4 }} 
                        className="text-7xl md:text-9xl font-serif text-[#F7E47D] italic"
                    >
                        delicious
                    </motion.div>
                 </div>
             </div>
         </div>
      </section>
    );
};

// --- 7. PRESS SECTION (Must be higher z-index to cover Future Section) ---
const PressSection = () => (
   <section className="relative z-20 bg-[#FDFCF6] py-32 border-t border-black/5 shadow-[0_-50px_100px_rgba(0,0,0,0.2)]">
      <div className="max-w-7xl mx-auto px-6 text-center opacity-50 hover:opacity-100 transition-opacity duration-500">
         <h2 className="text-sm font-mono mb-12 uppercase tracking-widest">As seen in</h2>
         <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 grayscale text-[#1A1A1A]">
            <h3 className="text-4xl font-serif font-bold">TechCrunch</h3>
            <h3 className="text-3xl font-sans tracking-tighter font-bold">ProductHunt</h3>
            <h3 className="text-4xl font-serif italic font-bold">Wired</h3>
         </div>
      </div>
   </section>
);

const Footer = () => (
  <footer className="relative z-20 bg-[#FDFCF6] min-h-[80vh] flex flex-col justify-between p-6 md:p-12 overflow-hidden border-t border-black/10">
      <div className="pt-24 flex justify-center md:justify-start flex-grow items-center">
        <h2 className="text-[25vw] leading-none font-serif text-[#1A1A1A] tracking-tighter flex" style={{ perspective: "1000px" }}>
          {["s", "c", "o", "p", "e"].map((letter, i) => (
            <motion.span
              key={i}
              initial={{ rotateX: 90, opacity: 0 }}
              whileInView={{ rotateX: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="inline-block origin-bottom text-[#2b1c1c]"
            >
              {letter}
            </motion.span>
          ))}
        </h2>
      </div>
      <div className="flex justify-between items-end text-xs uppercase tracking-widest font-medium border-t border-black/10 pt-8">
         <div className="flex gap-4"><a href="#">Privacy</a><a href="#">Terms</a></div>
         <span>© 2026 FoodScope AI</span>
      </div>
  </footer>
);

export default function Home() {
  return (
    <SmoothScroll>
      <main className="w-full bg-[#FDFCF6] text-[#1A1A1A] relative selection:bg-[#F7E47D] selection:text-[#1A1A1A]">
        <GrainOverlay />
        <nav className="fixed top-0 w-full p-6 md:p-8 flex justify-between items-center z-50 mix-blend-difference text-[#FDFCF6]">
          <span className="text-2xl font-serif font-bold tracking-tight">FoodScope</span>
          <button className="uppercase text-[10px] font-bold tracking-widest border border-current px-5 py-2 rounded-full hover:bg-white hover:text-black transition-colors">Scan Fridge</button>
        </nav>
        <Hero />
        <LineSection />
        <BlueprintSection />
        <RealFatsSection />
        <ProblemSection />
        <FutureSection />
        <PressSection />
        <Footer />
      </main>
    </SmoothScroll>
  );
}