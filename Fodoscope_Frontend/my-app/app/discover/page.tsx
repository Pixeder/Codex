"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Flame, Loader2, Database, X, ChefHat, Clock, Check } from "lucide-react";

// --- CUSTOM ANIMATION CURVE ---
const ease = [0.76, 0, 0.24, 1];

// --- UTILITY COMPONENTS ---
const Grain = () => (
  <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.04] mix-blend-multiply" 
       style={{ backgroundImage: 'url("https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png")' }} />
);

const RevealText = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <div className={`overflow-hidden py-1 ${className}`}>
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

// --- MAIN EXPLORE PAGE ---
export default function Discover() {
  const [rotd, setRotd] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoadingROTD, setIsLoadingROTD] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  
  // Recipe Modal States
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState<'calorie' | 'protein' | 'carb'>('calorie');
  const [minVal, setMinVal] = useState<number>(100);
  const [maxVal, setMaxVal] = useState<number>(500);

  // -----------------------------------------------------------
  // FIXED: BULLETPROOF NORMALIZATION
  // -----------------------------------------------------------
  const normalizeRecipe = (r: any) => {
    // Aggressively target Recipe_id. 
    // We explicitly check r["Recipe_id"] to bypass any weird dot-notation quirks.
    const targetId = 
      r["Recipe_id"] || 
      r.Recipe_id || 
      r.recipe_id || 
      r.recipeId || 
      // If 'id' is present but it's a 24-character string (MongoDB _id), ignore it so it doesn't break the fetch
      (r.id && String(r.id).length !== 24 ? r.id : null) || 
      r._id; // Absolute last resort fallback

    return {
      id: String(targetId), // Cast to string to ensure it drops into the URL correctly
      title: r?.Recipe_title || r?.title || r?.name || "Curated Dish",
      calories: Math.round(r?.Calories || r?.calories || 0),
      protein: Math.round(r?.['Protein (g)'] || r?.Protein || r?.protein || 0),
      carbs: Math.round(r?.['Carbohydrate, by difference (g)'] || r?.Carbohydrate || r?.carbs || 0),
    };
  };

  useEffect(() => {
    const fetchROTD = async () => {
      try {
        const res = await fetch('/api/foodoscope?type=rotd');
        const data = await res.json();
        const recipeData = data?.payload?.data || data?.data;
        if (recipeData) setRotd(normalizeRecipe(recipeData));
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
      setRecipes(items.map((r: any) => normalizeRecipe(r)));
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

  // -----------------------------------------------------------
  // FETCHES RECIPE DETAILS USING THE EXTRACTED ID
  // -----------------------------------------------------------
  const handleRecipeClick = async (Recipe_id: string) => {
    setIsRecipeLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${Recipe_id}`);
      const data = await res.json();
      
      if (!res.ok || !data.success) throw new Error("Failed to fetch recipe");

      setSelectedRecipe(data.data);
    } catch (err) {
      console.error(err);
      alert("Could not load recipe details.");
    } finally {
      setIsRecipeLoading(false);
    }
  };

  if (isLoadingROTD) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a] text-[#FDFCF6]">
        <div className="relative w-16 h-16 flex items-center justify-center mb-8">
           <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping" />
           <div className="absolute inset-2 border-2 border-[#D48C70] rounded-full border-t-transparent animate-spin" />
        </div>
        <RevealText><span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] opacity-50">Initializing Dataset</span></RevealText>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFCF6] text-[#1A1A1A] selection:bg-[#D48C70] selection:text-[#FDFCF6] pb-32 font-sans">
      <Grain />

      {/* --- HEAVY NAV --- */}
      <nav className="fixed top-0 w-full p-6 md:p-8 flex justify-between items-center z-50 mix-blend-difference text-[#FDFCF6]">
        <Link href="/" className="flex items-center gap-4 group text-[10px] uppercase tracking-[0.2em] font-bold hover:opacity-70 transition-opacity">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> RETURN
        </Link>
        <span className="text-2xl font-serif font-bold tracking-tight">Snap2Recipe</span>
      </nav>

      {/* --- WIDESCREEN HERO: RECIPE OF THE DAY --- */}
      <section className="relative w-full min-h-[60vh] bg-[#0a0a0a] text-[#FDFCF6] flex flex-col justify-end p-6 md:p-12 pt-32 overflow-hidden border-b-2 border-[#1A1A1A]">
        
        {/* Cinematic Blur Video Background */}
        <motion.div 
          initial={{ filter: "blur(20px)", scale: 1.1, opacity: 0 }}
          animate={{ filter: "blur(0px)", scale: 1, opacity: 0.5 }}
          transition={{ duration: 2.5, ease }}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
           <video autoPlay muted loop playsInline src="https://www.pexels.com/download/video/6645771/" className="object-cover w-full h-full" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-[#0a0a0a]/80" />
        </motion.div>

        <div className="relative z-10 w-full max-w-[95%] mx-auto">
           <RevealText delay={0.1}>
             <div className="flex items-center gap-4 bg-white text-black px-4 py-2 font-bold w-max mb-8 shadow-xl">
               <Flame size={14} className="text-[#D48C70]" />
               <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Editor's Pick</span>
             </div>
           </RevealText>

           {rotd && (
             <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 w-full">
                {/* Hero Title */}
                <div className="w-full xl:w-[60%]">
                   <RevealText delay={0.2}>
                     <h1 className="text-5xl md:text-7xl font-serif leading-[0.85] tracking-tighter text-white">
                       {rotd.title}
                     </h1>
                   </RevealText>
                </div>

                {/* Swiss Data Box */}
                <RevealText delay={0.3} className="w-full xl:w-[400px] shrink-0">
                   <div className="bg-[#0a0a0a]/80 backdrop-blur-md border-2 border-white/20 flex flex-col">
                      <div className="flex border-b-2 border-white/20">
                        <div className="w-1/2 p-6 border-r-2 border-white/20 flex flex-col">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/50 mb-4 block">Energy</span>
                          <span className="font-serif text-4xl">{rotd.calories}</span>
                        </div>
                        <div className="w-1/2 p-6 flex flex-col">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/50 mb-4 block">Protein</span>
                          <span className="font-serif text-4xl">{rotd.protein}<span className="text-xs ml-1 opacity-40 font-sans tracking-normal">g</span></span>
                        </div>
                      </div>
                      <div className="w-full p-6 flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/50">Carbohydrates</span>
                        <span className="font-serif text-xl">{rotd.carbs}<span className="text-xs ml-1 opacity-40 font-sans tracking-normal">g</span></span>
                      </div>
                   </div>
                </RevealText>
             </div>
           )}
        </div>
      </section>

      {/* --- SEARCH CONSOLE --- */}
      <section className="w-full relative z-20 bg-[#FDFCF6] border-b-2 border-[#1A1A1A]">
        <div className="max-w-[95%] mx-auto px-6 md:px-12 py-16 md:py-24 flex flex-col lg:flex-row gap-16 justify-between">
          
          <div className="w-full lg:w-1/3">
             <RevealText>
                <div className="flex items-center gap-4 mb-10 border-l-4 border-[#1A1A1A] pl-6">
                   <Database size={28} className="text-[#1A1A1A]" />
                   <h2 className="font-serif text-5xl md:text-6xl tracking-tight">Refine Target</h2>
                </div>
             </RevealText>

             <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
               {[ { id: 'calorie', label: 'Calories' }, { id: 'protein', label: 'Protein' }, { id: 'carb', label: 'Carbs' } ].map((tab) => (
                  <button 
                    key={tab.id} onClick={() => handleTabChange(tab.id as any)}
                    className={`px-8 py-4 border-2 transition-all font-mono text-xs font-bold uppercase tracking-[0.2em] text-left
                      ${activeFilter === tab.id ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#FDFCF6]' : 'border-[#1A1A1A]/20 text-[#1A1A1A]/50 hover:border-[#1A1A1A] hover:text-[#1A1A1A]'}
                    `}
                  >
                    {tab.label} Range
                  </button>
               ))}
             </div>
          </div>

          <div className="w-full lg:w-2/3 flex flex-col justify-end">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-end gap-12 mb-12">
               <div className="w-full sm:w-1/2 group">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#1A1A1A]/40 mb-4 transition-colors group-focus-within:text-[#D48C70]">Minimum Value</label>
                  <input 
                    type="number" value={minVal} onChange={(e) => setMinVal(Number(e.target.value))}
                    className="w-full bg-transparent border-b-4 border-[#1A1A1A]/20 py-2 text-7xl lg:text-8xl font-serif text-[#1A1A1A] outline-none focus:border-[#D48C70] transition-colors"
                  />
               </div>
               <div className="w-full sm:w-1/2 group">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#1A1A1A]/40 mb-4 transition-colors group-focus-within:text-[#D48C70]">Maximum Value</label>
                  <input 
                    type="number" value={maxVal} onChange={(e) => setMaxVal(Number(e.target.value))}
                    className="w-full bg-transparent border-b-4 border-[#1A1A1A]/20 py-2 text-7xl lg:text-8xl font-serif text-[#1A1A1A] outline-none focus:border-[#D48C70] transition-colors"
                  />
               </div>
            </form>

            <button onClick={handleSearch} disabled={isSearching} className="group relative w-full h-[90px] bg-[#1A1A1A] overflow-hidden border-2 border-[#1A1A1A] mt-auto cursor-pointer">
               <div className="absolute inset-0 bg-[#D48C70] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[0.76,0,0.24,1]" />
               <div className="relative z-10 flex items-center justify-between px-8 w-full h-full text-[#FDFCF6]">
                 <span className="font-mono text-sm font-extrabold uppercase tracking-[0.2em]">
                   {isSearching ? "Querying Database..." : "Execute Search"}
                 </span>
                 {isSearching ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />}
               </div>
            </button>
          </div>

        </div>
      </section>

      {/* --- DYNAMIC RESULTS GRID --- */}
      <section className="px-6 md:px-12 max-w-[95%] mx-auto mt-24 relative z-10">
        
        <div className="flex justify-between items-end mb-16 border-b-2 border-[#1A1A1A] pb-8">
           <RevealText>
              <h3 className="text-5xl md:text-6xl font-serif tracking-tighter">
                <span className="italic text-[#D48C70]">{recipes.length}</span> Results Found
              </h3>
           </RevealText>
           <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hidden md:block">
             Filtered By: {activeFilter}
           </span>
        </div>

        {recipes.length === 0 && !isSearching && (
           <div className="py-32">
             <p className="font-serif text-3xl md:text-5xl text-[#1A1A1A]/30 tracking-tight">No recipes match current parameters.</p>
           </div>
        )}

        <div className="flex flex-col border-t-2 border-[#1A1A1A]">
          <AnimatePresence>
            {recipes.map((recipe, idx) => (
              <motion.div 
                key={recipe.id}
                initial={{ opacity: 0, x: -20 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true, margin: "-5%" }}
                transition={{ duration: 0.6, delay: (idx % 10) * 0.05, ease }}
                onClick={() => handleRecipeClick(recipe.id)}
                className="group cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between border-b-2 border-[#1A1A1A] py-8 lg:py-12 hover:bg-[#1A1A1A] hover:text-[#FDFCF6] transition-colors duration-500 px-4 md:px-8"
              >
                 
                 <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16 w-full lg:w-auto">
                    <span className="font-serif text-6xl md:text-7xl lg:text-8xl font-extrabold text-[#1A1A1A]/20 group-hover:text-[#FDFCF6]/40 transition-colors shrink-0 leading-none">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    
                    <div className="flex-grow max-w-3xl">
                       <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 block mb-3">
                         ID // {String(recipe.id).slice(0,8)}
                       </span>
                       <h3 className="text-3xl md:text-5xl font-serif leading-tight tracking-tight group-hover:text-[#D48C70] transition-colors line-clamp-2">
                         {recipe.title}
                       </h3>
                    </div>
                 </div>

                 <div className="mt-8 lg:mt-0 flex items-center gap-8 lg:gap-16 shrink-0 border-t-2 border-[#1A1A1A]/10 lg:border-t-0 pt-6 lg:pt-0 group-hover:border-white/10 transition-colors w-full lg:w-auto">
                    
                    <div className="flex gap-8 lg:gap-12 font-mono text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                       
                       {activeFilter === 'calorie' && (
                         <div className="flex flex-col gap-2">
                            <span className="opacity-50">Energy Focus</span>
                            <span className="text-4xl md:text-5xl text-[#D48C70] font-serif tracking-tight">{recipe.calories} <span className="text-sm font-sans tracking-normal opacity-50">kcal</span></span>
                         </div>
                       )}

                       {activeFilter === 'protein' && (
                         <div className="flex flex-col gap-2">
                            <span className="opacity-50">Protein Focus</span>
                            <span className="text-4xl md:text-5xl text-[#D48C70] font-serif tracking-tight">{recipe.protein} <span className="text-sm font-sans tracking-normal opacity-50">g</span></span>
                         </div>
                       )}

                       {activeFilter === 'carb' && (
                         <div className="flex flex-col gap-2">
                            <span className="opacity-50">Carb Focus</span>
                            <span className="text-4xl md:text-5xl text-[#D48C70] font-serif tracking-tight">{recipe.carbs} <span className="text-sm font-sans tracking-normal opacity-50">g</span></span>
                         </div>
                       )}

                    </div>
                    
                    <div className="hidden md:flex ml-auto opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                       <ArrowRight size={40} className="text-[#D48C70]" strokeWidth={1.5} />
                    </div>

                    <div className="flex md:hidden items-center justify-between w-full mt-4">
                       <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#D48C70]">View Recipe</span>
                       <ArrowRight size={24} className="text-[#D48C70]" />
                    </div>

                 </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* --- STATE 4: RECIPE DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }} transition={{ duration: 0.8, ease }}
            className="fixed inset-0 z-[100] bg-[#FDFCF6] overflow-y-auto"
          >
             <Grain />
             
             <div className="sticky top-0 w-full p-6 md:p-8 flex justify-between items-center z-50 mix-blend-difference text-[#FDFCF6]">
                <span className="text-xl font-serif font-bold tracking-tight opacity-50">Dossier // {selectedRecipe.id}</span>
                <button onClick={() => setSelectedRecipe(null)} className="flex items-center gap-4 group text-[10px] uppercase tracking-[0.2em] font-bold hover:opacity-70 transition-opacity cursor-pointer">
                  CLOSE <X size={20} className="transition-transform group-hover:rotate-90" /> 
                </button>
             </div>

             <div className="w-full pt-40 pb-20 relative bg-[#1A1A1A] text-[#FDFCF6] border-b-2 border-[#1A1A1A]">
                <div className="max-w-[95%] mx-auto px-6 md:px-12">
                   <RevealText>
                      <h1 className="text-5xl md:text-[6vw] font-serif leading-[0.85] tracking-tighter mb-12 max-w-6xl">
                        {selectedRecipe.title}
                      </h1>
                   </RevealText>
                   <RevealText delay={0.1}>
                      <div className="flex flex-wrap items-center gap-8 font-mono text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 border-t border-white/20 pt-8">
                         <span className="flex items-center gap-2"><Clock size={14}/> {selectedRecipe.time?.total || "N/A"}</span>
                         <span className="flex items-center gap-2"><ChefHat size={14}/> {selectedRecipe.cuisine?.region || "Global"}</span>
                         <span className="flex items-center gap-2"><Flame size={14} className="text-[#D48C70]"/> {selectedRecipe.nutrition?.calories || "0"} kcal</span>
                         {selectedRecipe.dietType?.vegetarian && <span className="border border-white/20 px-3 py-1 rounded-full">Vegetarian</span>}
                      </div>
                   </RevealText>
                </div>
             </div>

             <div className="max-w-[95%] mx-auto px-6 md:px-12 py-24 flex flex-col lg:flex-row gap-16 lg:gap-24">
                
                <div className="w-full lg:w-1/3">
                   <div className="border-2 border-[#1A1A1A] bg-white mb-16 flex flex-col">
                      <div className="border-b-2 border-[#1A1A1A] p-6 bg-[#1A1A1A] text-[#FDFCF6]">
                         <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Nutritional Data</span>
                      </div>
                      <div className="flex border-b-2 border-[#1A1A1A]">
                         <div className="w-1/2 p-6 border-r-2 border-[#1A1A1A]">
                            <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.2em] opacity-50 mb-4">Protein</span>
                            <span className="font-serif text-3xl">{selectedRecipe.nutrition?.protein || 0}<span className="text-sm opacity-50 ml-1">g</span></span>
                         </div>
                         <div className="w-1/2 p-6">
                            <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.2em] opacity-50 mb-4">Carbs</span>
                            <span className="font-serif text-3xl">{selectedRecipe.nutrition?.carbs || 0}<span className="text-sm opacity-50 ml-1">g</span></span>
                         </div>
                      </div>
                      <div className="p-6">
                         <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.2em] opacity-50 mb-4">Fats</span>
                         <span className="font-serif text-3xl">{selectedRecipe.nutrition?.fat || 0}<span className="text-sm opacity-50 ml-1">g</span></span>
                      </div>
                   </div>

                   <h3 className="font-serif text-4xl mb-8">Components</h3>
                   <ul className="flex flex-col border-t-2 border-[#1A1A1A]">
                      {selectedRecipe.ingredients?.map((ing: any, i: number) => (
                         <li key={i} className="py-4 border-b border-[#1A1A1A]/20 flex items-start gap-4">
                            <Check size={16} className="mt-1 text-[#D48C70] shrink-0" />
                            <span className="font-mono text-xs uppercase tracking-widest leading-relaxed font-bold">
                               {ing.phrase}
                            </span>
                         </li>
                      ))}
                   </ul>
                </div>

                <div className="w-full lg:w-2/3">
                   <h3 className="font-serif text-5xl mb-12">Execution</h3>
                   <div className="flex flex-col gap-12 border-t-2 border-[#1A1A1A] pt-12">
                      {selectedRecipe.instructions?.map((step: any, i: number) => (
                         <div key={i} className="flex gap-8 lg:gap-12">
                            <span className="font-serif text-5xl md:text-6xl font-extrabold text-[#1A1A1A]/20 leading-none shrink-0 w-16 text-right">
                               {String(step.stepNumber).padStart(2, '0')}
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

      <AnimatePresence>
         {isRecipeLoading && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-[#1A1A1A] flex flex-col items-center justify-center text-[#FDFCF6]"
            >
               <Loader2 size={48} className="animate-spin mb-8" strokeWidth={1} />
               <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] opacity-50">Retrieving Dossier</span>
            </motion.div>
         )}
      </AnimatePresence>

    </main>
  );
}