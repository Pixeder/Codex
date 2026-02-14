"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Flame, Loader2, Search, Crosshair } from "lucide-react";

// --- CUSTOM ANIMATION CURVE ---
const ease = [0.76, 0, 0.24, 1];

// --- UTILITY COMPONENTS ---
const Grain = () => (
  <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-multiply" 
       style={{ backgroundImage: 'url("https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png")' }} />
);

const RevealText = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <div className={`overflow-hidden py-2 ${className}`}>
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

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200",
  "https://images.unsplash.com/photo-1481070555726-e2fe83477d4a?q=80&w=1200",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200"
];

// --- MAIN EXPLORE PAGE ---
export default function Discover() {
  const [rotd, setRotd] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoadingROTD, setIsLoadingROTD] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState<'calorie' | 'protein' | 'carb'>('calorie');
  const [minVal, setMinVal] = useState<number>(100);
  const [maxVal, setMaxVal] = useState<number>(500);

  const normalizeRecipe = (r: any, index: number) => ({
    id: r?.Recipe_id || r?._id || Math.random(),
    title: r?.Recipe_title || r?.title || "Curated Dish",
    image: r?.img_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    calories: Math.round(r?.Calories || 0),
    protein: Math.round(r?.['Protein (g)'] || r?.Protein || 0),
    carbs: Math.round(r?.['Carbohydrate, by difference (g)'] || r?.Carbohydrate || 0),
  });

  useEffect(() => {
    const fetchROTD = async () => {
      try {
        const res = await fetch('/api/foodoscope?type=rotd');
        const data = await res.json();
        const recipeData = data?.payload?.data || data?.data;
        if (recipeData) setRotd(normalizeRecipe(recipeData, 0));
      } catch (err) {
        console.error("Failed to fetch ROTD", err);
      } finally {
        setIsLoadingROTD(false);
      }
    };
    fetchROTD();
    handleSearch();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    try {
      const res = await fetch(`/api/foodoscope?type=${activeFilter}&min=${minVal}&max=${maxVal}&limit=12`);
      const data = await res.json();
      const items = data?.data || [];
      setRecipes(items.map((r: any, i: number) => normalizeRecipe(r, i)));
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTabChange = (tab: 'calorie' | 'protein' | 'carb') => {
    setActiveFilter(tab);
    if (tab === 'calorie') { setMinVal(100); setMaxVal(600); }
    if (tab === 'protein') { setMinVal(20); setMaxVal(80); }
    if (tab === 'carb') { setMinVal(0); setMaxVal(50); }
  };

  if (isLoadingROTD) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0F0F0F] text-[#FDFCF6]">
        <div className="relative w-16 h-16 flex items-center justify-center mb-8">
           <div className="absolute inset-0 border border-white/10 rounded-full animate-ping" />
           <div className="absolute inset-2 border border-[#C26D5C] rounded-full border-t-transparent animate-spin" />
        </div>
        <RevealText><span className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-50">Initializing Dataset</span></RevealText>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFCF6] text-[#1A1A1A] selection:bg-[#C26D5C] selection:text-[#FDFCF6] pb-32 font-sans">
      <Grain />

      {/* --- EXACT SCREENSHOT: DARK EDITORIAL HERO --- */}
      <section className="relative w-full bg-[#0F0F0F] text-[#FDFCF6] pt-10 pb-20 px-6 md:px-12 flex flex-col justify-between">
        
        {/* Exact Nav Layout from Image */}
        <nav className="w-full flex justify-between items-center mb-24 md:mb-32">
          <Link href="/" className="flex items-center gap-4 group text-[10px] uppercase tracking-[0.2em] font-bold hover:opacity-70 transition-opacity">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> RETURN
          </Link>
          <span className="text-2xl font-serif font-bold tracking-tight">FoodScope</span>
        </nav>

        {/* Top Labels from Image */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 md:mb-20 gap-8">
           <RevealText delay={0.1}>
              <div className="flex items-center gap-4 bg-white/5 pl-2 pr-4 py-1.5 rounded-full border border-white/5">
                <div className="w-3 h-3 bg-[#C26D5C] rounded-full shadow-[0_0_8px_#C26D5C]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-80">Recipe / Of the day</span>
              </div>
           </RevealText>
           <RevealText delay={0.2}>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 text-left md:text-right block leading-[1.6]">
                Curated by FoodScope<br/>Intelligence System
              </span>
           </RevealText>
        </div>

        {/* Main Title & Data Grid from Image */}
        {rotd && (
          <div className="flex flex-col xl:flex-row items-end justify-between gap-16 w-full">
             
             {/* Huge Serif Title */}
             <div className="w-full xl:w-[65%]">
                <RevealText delay={0.3}>
                  <h1 className="text-5xl sm:text-7xl md:text-[6.5vw] font-serif leading-[0.9] tracking-[-0.02em]">
                    {rotd.title}
                  </h1>
                </RevealText>
             </div>

             {/* Swiss Data Grid Exactly as Pictured */}
             <RevealText delay={0.4} className="w-full xl:w-[380px] shrink-0">
                <div className="bg-[#141414] border border-white/10 rounded-sm overflow-hidden flex flex-col shadow-2xl">
                   
                   {/* Top Row (Energy | Protein) */}
                   <div className="flex border-b border-white/10">
                     <div className="w-1/2 p-6 border-r border-white/10 flex flex-col justify-between">
                       <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-40 mb-8 block">Energy</span>
                       <span className="font-serif text-3xl flex items-center gap-3">
                          <Flame size={16} className="text-[#C26D5C]"/>{rotd.calories}
                       </span>
                     </div>
                     <div className="w-1/2 p-6 flex flex-col justify-between">
                       <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-40 mb-8 block">Protein</span>
                       <span className="font-serif text-3xl">{rotd.protein}<span className="text-sm ml-1 opacity-40 font-sans tracking-normal">g</span></span>
                     </div>
                   </div>
                   
                   {/* Bottom Row (Carbs) */}
                   <div className="w-full p-6 flex items-center justify-between">
                     <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-40">Carbohydrates</span>
                     <span className="font-serif text-xl">{rotd.carbs}<span className="text-xs ml-1 opacity-40 font-sans tracking-normal">g</span></span>
                   </div>

                </div>
             </RevealText>

          </div>
        )}
      </section>

      {/* --- 2. MINIMALIST CONTROL PANEL --- */}
      <section className="w-full relative z-20 bg-[#FDFCF6]">
        <div className="max-w-[95%] mx-auto px-6 md:px-12 py-16 md:py-24 border-b border-[#1A1A1A]/10">
           
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-16">
             
             {/* Tab Selector */}
             <div className="w-full md:w-1/3">
               <RevealText><h2 className="font-serif text-4xl mb-8">Refine Search</h2></RevealText>
               <div className="flex flex-col gap-4 border-l border-[#1A1A1A]/10 pl-6">
                 {[ { id: 'calorie', label: 'Calories (kcal)' }, { id: 'protein', label: 'Protein (g)' }, { id: 'carb', label: 'Carbs (g)' } ].map((tab) => (
                    <button 
                      key={tab.id} onClick={() => handleTabChange(tab.id as any)}
                      className={`text-left text-[10px] font-mono uppercase tracking-[0.2em] transition-all relative
                        ${activeFilter === tab.id ? 'text-[#1A1A1A] font-bold' : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]/80'}
                      `}
                    >
                      {activeFilter === tab.id && <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-[1px] bg-[#C26D5C]" />}
                      {tab.label}
                    </button>
                 ))}
               </div>
             </div>

             {/* Inputs */}
             <div className="w-full md:w-2/3">
               <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-end gap-8 lg:gap-16">
                  <div className="w-full sm:w-1/2 group">
                     <label className="block text-[9px] font-mono uppercase tracking-[0.3em] text-[#1A1A1A]/40 mb-2 transition-colors group-focus-within:text-[#C26D5C]">Minimum</label>
                     <input 
                       type="number" value={minVal} onChange={(e) => setMinVal(Number(e.target.value))}
                       className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-2 text-6xl lg:text-8xl font-serif text-[#1A1A1A] outline-none focus:border-[#C26D5C] transition-colors"
                     />
                  </div>
                  
                  <div className="w-full sm:w-1/2 group">
                     <label className="block text-[9px] font-mono uppercase tracking-[0.3em] text-[#1A1A1A]/40 mb-2 transition-colors group-focus-within:text-[#C26D5C]">Maximum</label>
                     <input 
                       type="number" value={maxVal} onChange={(e) => setMaxVal(Number(e.target.value))}
                       className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-2 text-6xl lg:text-8xl font-serif text-[#1A1A1A] outline-none focus:border-[#C26D5C] transition-colors"
                     />
                  </div>
               </form>

               {/* Execute Button */}
               <div className="mt-12 flex justify-end">
                  <button onClick={handleSearch} disabled={isSearching} className="group flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em] hover:text-[#C26D5C] transition-colors">
                    <span className="font-bold">{isSearching ? "Querying..." : "Execute Search"}</span>
                    <div className="w-16 h-[1px] bg-current origin-left scale-x-50 group-hover:scale-x-100 transition-transform duration-500" />
                    {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
               </div>
             </div>

           </div>
        </div>
      </section>

      {/* --- 3. RESULTS MASONRY --- */}
      <section className="px-6 md:px-12 max-w-[95%] mx-auto mt-24 relative z-10">
        
        <div className="flex justify-between items-end mb-24">
           <RevealText>
              <h3 className="text-4xl md:text-6xl font-serif tracking-tight">
                <span className="italic text-[#C26D5C]">{recipes.length}</span> Results
              </h3>
           </RevealText>
        </div>

        {recipes.length === 0 && !isSearching && (
           <div className="py-32 border-t border-[#1A1A1A]/10">
             <p className="font-serif text-3xl text-[#1A1A1A]/40">No recipes match current parameters.</p>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          <AnimatePresence>
            {recipes.map((recipe, idx) => {
              const isStaggered = idx % 2 !== 0; 
              
              return (
                <motion.div 
                  key={recipe.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.8, delay: (idx % 3) * 0.1, ease }}
                  className={`group cursor-pointer flex flex-col h-full ${isStaggered ? 'lg:mt-32' : ''}`}
                >
                  <div className="w-full aspect-[3/4] relative overflow-hidden bg-[#EAE8E0] mb-6">
                    <Image 
                      src={recipe.image} alt={recipe.title} fill unoptimized
                      className="object-cover transition-transform duration-[1.5s] ease-[0.76,0,0.24,1] group-hover:scale-105" 
                    />
                    <div className="absolute top-4 right-4 bg-[#FDFCF6] text-[#1A1A1A] px-3 py-1 rounded-sm text-[9px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-xl flex items-center gap-2">
                        <Flame size={12} className="text-[#C26D5C]" /> {recipe.calories} kcal
                    </div>
                  </div>

                  <div className="mt-auto">
                     <h3 className="text-3xl font-serif leading-tight tracking-tight text-[#1A1A1A] group-hover:text-[#C26D5C] transition-colors line-clamp-2 mb-4">
                       {recipe.title}
                     </h3>
                     <div className="flex gap-6 text-[9px] font-mono uppercase tracking-[0.2em] opacity-50 border-t border-[#1A1A1A]/10 pt-4">
                        <span>{recipe.protein}g PRO</span>
                        <span>{recipe.carbs}g CRB</span>
                     </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </section>

    </main>
  );
}