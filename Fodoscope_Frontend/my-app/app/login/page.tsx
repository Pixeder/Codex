"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ScanLine, Loader2 } from "lucide-react";

// --- UTILITY COMPONENTS ---

const GrainOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-multiply">
    <div className="w-full h-full bg-repeat" style={{ backgroundImage: 'url("https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png")' }} />
  </div>
);

// 3D Masked Text Reveal
const RevealText = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <div className="overflow-hidden leading-[1.1] py-2">
    <motion.div
      initial={{ y: "100%", rotateX: -45, opacity: 0 }}
      animate={{ y: 0, rotateX: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
      className="origin-top"
    >
      {children}
    </motion.div>
  </div>
);

// Minimalist Input
const ModernInput = ({ label, type, value, onChange, required = true }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value.length > 0;
  const active = isFocused || isFilled;

  return (
    <div className="relative w-full mb-10 group">
      <motion.label 
        initial={false}
        animate={{ 
          y: active ? -24 : 0, 
          scale: active ? 0.75 : 1,
          color: active ? "#1A1A1A" : "rgba(26, 26, 26, 0.5)"
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute left-0 top-4 font-mono uppercase tracking-[0.1em] origin-left pointer-events-none"
      >
        {label}
      </motion.label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full bg-transparent border-b border-black/10 py-4 text-2xl font-serif text-[#1A1A1A] outline-none transition-colors focus:border-black"
      />
      {/* Animated Focus Line */}
      <motion.div 
        initial={false}
        animate={{ scaleX: isFocused ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 w-full h-[2px] bg-[#A8B545] origin-left"
      />
    </div>
  );
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Invalid credentials.");

      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[#FDFCF6] text-[#1A1A1A] selection:bg-[#A8B545] selection:text-white">
      <GrainOverlay />
      
      {/* LEFT SIDE: Cinematic Visuals */}
      <div className="w-full lg:w-[45%] h-[30vh] lg:h-screen relative overflow-hidden bg-[#1A1A1A]">
        <motion.div 
           animate={{ scale: 1.1 }} 
           transition={{ duration: 30, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
           className="w-full h-full relative opacity-90"
        >
          <Image 
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200" 
            alt="Gastronomy" fill className="object-cover" unoptimized 
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* AI Scanner Line Effect */}
        <motion.div 
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 8, ease: "linear", repeat: Infinity }}
          className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#A8B545] to-transparent opacity-50 shadow-[0_0_15px_#A8B545]"
        />

        {/* Floating Glassmorphism Stat */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-12 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl hidden lg:block"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/80 font-mono text-[10px] uppercase tracking-widest">System Active</span>
          </div>
          <p className="text-white font-serif text-2xl">4,281 ingredients <br/><span className="italic text-[#A8B545]">identified today.</span></p>
        </motion.div>
        
        <Link href="/" className="absolute top-8 left-8 text-white flex items-center gap-4 hover:gap-6 transition-all group z-10">
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /> 
          <span className="text-xs uppercase tracking-[0.2em] font-medium mt-1">Return</span>
        </Link>
      </div>

      {/* RIGHT SIDE: Editorial Form */}
      <div className="w-full lg:w-[55%] h-[70vh] lg:h-screen flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10">
        <div className="w-full max-w-lg mx-auto lg:mx-0">
          
          <RevealText>
             <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#1A1A1A]/50 mb-4 flex items-center gap-2">
                <ScanLine size={12} /> Authentication
             </h2>
          </RevealText>

          <div className="mb-16">
             <RevealText delay={0.1}>
               <h1 className="text-6xl lg:text-7xl font-serif tracking-tighter">Welcome</h1>
             </RevealText>
             <RevealText delay={0.2}>
               <h1 className="text-6xl lg:text-7xl font-serif tracking-tighter italic text-[#A8B545]">back.</h1>
             </RevealText>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col relative">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
              <ModernInput label="Email Address" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
              <ModernInput label="Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }} 
                  animate={{ opacity: 1, height: "auto", y: 0 }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-[#D48C70] text-xs font-mono uppercase tracking-wider mb-6 bg-[#D48C70]/10 p-3 rounded-md border border-[#D48C70]/20">
                    Warning: {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}>
              <button 
                type="submit" 
                disabled={isLoading}
                className="group relative w-full h-16 bg-[#1A1A1A] overflow-hidden rounded-md disabled:opacity-70"
              >
                <div className="absolute inset-0 bg-[#A8B545] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <div className="relative z-10 flex items-center justify-between px-8 w-full h-full text-[#FDFCF6]">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold">
                    {isLoading ? "Authenticating..." : "Sign In"}
                  </span>
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />}
                </div>
              </button>
            </motion.div>
          </form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }} className="mt-12">
            <p className="text-xs font-mono uppercase tracking-widest text-[#1A1A1A]/50">
              New user?{" "}
              <Link href="/signup" className="text-[#1A1A1A] font-bold ml-2 hover:text-[#A8B545] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-100 hover:after:scale-x-0 after:transition-transform after:origin-right">
                Create Account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}