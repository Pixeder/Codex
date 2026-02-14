"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, ChefHat } from "lucide-react";

// --- UTILITY COMPONENTS ---

const GrainOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-multiply">
    <div className="w-full h-full bg-repeat" style={{ backgroundImage: 'url("https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png")' }} />
  </div>
);

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

const ModernInput = ({ label, type, value, onChange, required = true }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value.length > 0;
  const active = isFocused || isFilled;

  return (
    <div className="relative w-full mb-8 group">
      <motion.label 
        initial={false}
        animate={{ y: active ? -24 : 0, scale: active ? 0.75 : 1, color: active ? "#1A1A1A" : "rgba(26, 26, 26, 0.5)" }}
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
      <motion.div 
        initial={false} animate={{ scaleX: isFocused ? 1 : 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 w-full h-[2px] bg-[#A8B545] origin-left"
      />
    </div>
  );
};

// Beautiful Password Strength Indicator
const PasswordMeter = ({ password }: { password: string }) => {
  const length = password.length;
  let strength = 0;
  if (length > 0) strength = 1;
  if (length >= 6) strength = 2;
  if (length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) strength = 3;

  const colors = ["bg-black/10", "bg-[#D48C70]", "bg-[#F7E47D]", "bg-[#A8B545]"];

  return (
    <div className="w-full flex gap-2 h-1 mt-[-10px] mb-8">
      {[1, 2, 3].map((level) => (
        <div key={level} className="flex-1 h-full bg-black/5 rounded-full overflow-hidden">
          <motion.div 
            initial={false}
            animate={{ width: strength >= level ? "100%" : "0%" }}
            className={`h-full ${colors[strength] || colors[0]}`}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      ))}
    </div>
  );
};

export default function Signup() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to create account.");

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
      
      {/* RIGHT SIDE: Cinematic Visuals (Flipped) */}
      <div className="w-full lg:w-[45%] h-[30vh] lg:h-screen relative overflow-hidden bg-[#1A1A1A] order-1 lg:order-2">
        <motion.div 
           animate={{ scale: 1.1 }} 
           transition={{ duration: 30, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
           className="w-full h-full relative opacity-90"
        >
          {/* Macro food shot for analysis context */}
          <Image 
            src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200" 
            alt="Ingredients" fill className="object-cover" unoptimized 
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20" />

        {/* AI Analysis Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none mix-blend-overlay">
           <div className="w-64 h-64 border border-white rounded-full animate-[spin_10s_linear_infinite] border-dashed" />
           <div className="absolute w-48 h-48 border border-[#A8B545] rounded-full animate-[spin_7s_linear_infinite_reverse]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 right-12 text-right hidden lg:block"
        >
          <ChefHat size={32} className="text-[#A8B545] ml-auto mb-4 opacity-80" />
          <p className="text-white font-serif text-2xl italic leading-snug">
             "Reduce waste.<br/>Elevate taste."
          </p>
        </motion.div>
      </div>

      {/* LEFT SIDE: Editorial Form */}
      <div className="w-full lg:w-[55%] h-[70vh] lg:h-screen flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10 order-2 lg:order-1">
        
        <Link href="/" className="absolute top-8 left-8 text-[#1A1A1A] flex items-center gap-4 hover:gap-6 transition-all group z-10">
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /> 
          <span className="text-xs font-mono uppercase tracking-[0.2em] font-medium mt-1">Return</span>
        </Link>

        <div className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
          
          <RevealText>
             <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#1A1A1A]/50 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#D48C70]" /> New Subject
             </h2>
          </RevealText>

          <div className="mb-12">
             <RevealText delay={0.1}>
               <h1 className="text-6xl lg:text-7xl font-serif tracking-tighter">Join the</h1>
             </RevealText>
             <RevealText delay={0.2}>
               <h1 className="text-6xl lg:text-7xl font-serif tracking-tighter italic text-[#D48C70]">movement.</h1>
             </RevealText>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col relative">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
              <ModernInput label="Full Name" type="text" value={displayName} onChange={(e: any) => setDisplayName(e.target.value)} />
              <ModernInput label="Email Address" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
              <ModernInput label="Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />
              <PasswordMeter password={password} />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0 }}
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
                <div className="absolute inset-0 bg-[#D48C70] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <div className="relative z-10 flex items-center justify-between px-8 w-full h-full text-[#FDFCF6]">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold">
                    {isLoading ? "Creating..." : "Create Account"}
                  </span>
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />}
                </div>
              </button>
            </motion.div>
          </form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }} className="mt-12">
            <p className="text-xs font-mono uppercase tracking-widest text-[#1A1A1A]/50">
              Already a member?{" "}
              <Link href="/login" className="text-[#1A1A1A] font-bold ml-2 hover:text-[#D48C70] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-100 hover:after:scale-x-0 after:transition-transform after:origin-right">
                Log In
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}