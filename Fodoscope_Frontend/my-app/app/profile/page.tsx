"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  User as UserIcon,
  Database,
  CheckCircle2,
  ScanLine,
  Compass,
} from "lucide-react";

// --- CUSTOM ANIMATION CURVE ---
const ease = [0.76, 0, 0.24, 1];

// --- UTILITY COMPONENTS ---
const Grain = () => (
  <div
    className="fixed inset-0 z-50 pointer-events-none opacity-[0.04] mix-blend-multiply"
    style={{
      backgroundImage:
        'url("https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png")',
    }}
  />
);

// New Background Textures Component
const BackgroundTextures = () => (
  <>
    <div className="fixed top-0 left-0 w-[50vw] h-[50vw] md:w-[30vw] md:h-[30vw] opacity-[0.08] pointer-events-none z-0 mix-blend-multiply grayscale contrast-150">
      <Image
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200"
        alt="texture"
        fill
        className="object-cover"
        unoptimized
      />
    </div>
    <div className="fixed bottom-0 right-0 w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] opacity-[0.08] pointer-events-none z-0 mix-blend-multiply rotate-180 grayscale contrast-150">
      <Image
        src="https://images.unsplash.com/photo-1516684732162-798a0062be99?q=80&w=1200"
        alt="texture"
        fill
        className="object-cover"
        unoptimized
      />
    </div>
  </>
);

const RevealText = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <div className="overflow-hidden py-1">
    <motion.div
      initial={{ y: "120%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut", delay }}
      className="origin-bottom-left"
    >
      {children}
    </motion.div>
  </div>
);

// --- MAIN PROFILE PAGE ---
export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return router.push("/login");

        const res = await fetch("https://codex-sk6m.onrender.com/api/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);

        setUser(data.data.user);
      } catch (err) {
        localStorage.clear();
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await fetch("https://codex-sk6m.onrender.com/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } finally {
      localStorage.clear();
      router.push("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF6] text-[#1A1A1A]">
        <Loader2
          size={40}
          className="animate-spin mb-6 text-[#1A1A1A]"
          strokeWidth={1.5}
        />
        <RevealText>
          <span className="font-mono text-sm font-bold uppercase tracking-[0.3em]">
            Accessing Dossier
          </span>
        </RevealText>
      </div>
    );
  }

  if (!user) return null;

  const used = user.totalTrialsUsed || 0;
  const remaining = user.trialsRemaining || 0;
  const totalAllocated = used + remaining;
  const usedPercentage =
    totalAllocated === 0 ? 0 : (used / totalAllocated) * 100;

  return (
    <main className="min-h-screen bg-[#FDFCF6] text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-[#FDFCF6] pb-32 relative">
      <Grain />
      <BackgroundTextures />

      {/* --- NAV --- */}
      <nav className="fixed top-0 w-full p-6 md:p-8 flex justify-between items-center z-50 mix-blend-difference text-[#FDFCF6]">
        <Link
          href="/"
          className="flex items-center gap-4 group text-xs uppercase tracking-[0.2em] font-bold hover:opacity-70 transition-opacity"
        >
          <ArrowLeft
            size={18}
            className="transition-transform group-hover:-translate-x-1"
          />{" "}
          Return
        </Link>
        <span className="text-2xl font-serif font-bold tracking-tight">
          Snap2Recipe
        </span>
      </nav>

      {/* --- HERO HEADER --- */}
      <section className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <RevealText>
          <h1 className="text-3xl md:text-5xl font-serif leading-[0.85] tracking-tighter font-bold">
            Account Overview
          </h1>
        </RevealText>
      </section>

      {/* --- BOLD EDITORIAL GRID --- */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto relative z-20">
        {/* Outer Border Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full border-2 border-[#1A1A1A] flex flex-col lg:flex-row bg-white shadow-xl"
        >
          {/* COLUMN 1: IDENTITY (Left Side) */}
          <div className="w-full lg:w-[40%] border-b lg:border-b-0 lg:border-r-2 border-[#1A1A1A] p-8 md:p-12 flex flex-col bg-[#FDFCF6]/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-12">
              <UserIcon size={18} className="text-[#1A1A1A]" />
              <span className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#1A1A1A]">
                Identity Record
              </span>
            </div>

            {/* Avatar */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-[#1A1A1A] overflow-hidden mb-10 bg-white flex items-center justify-center shrink-0 shadow-md">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.displayName}
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <span className="font-serif text-5xl text-[#1A1A1A]/20">
                  {user.displayName.charAt(0)}
                </span>
              )}
            </div>

            {/* Name */}
            <h2 className="text-4xl md:text-5xl font-serif leading-none tracking-tight mb-8 font-bold">
              {user.displayName}
            </h2>

            {/* Details */}
            <div className="space-y-8 font-mono text-sm uppercase mt-auto pt-12 border-t-2 border-[#1A1A1A]/10">
              <div>
                <span className="text-[#1A1A1A]/60 font-bold block mb-2 tracking-widest">
                  Registered Email
                </span>
                <span className="font-bold text-lg tracking-normal lowercase text-[#1A1A1A]">
                  {user.email}
                </span>
              </div>
              <div>
                <span className="text-[#1A1A1A]/60 font-bold block mb-2 tracking-widest">
                  System Join Date
                </span>
                <span className="font-bold text-lg text-[#1A1A1A]">
                  {new Date(user.memberSince || Date.now()).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: USAGE & ACTIONS (Right Side) */}
          <div className="w-full lg:w-[60%] flex flex-col bg-white/90 backdrop-blur-sm">
            {/* Metrics Header */}
            <div className="border-b-2 border-[#1A1A1A] p-8 md:p-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database size={18} className="text-[#1A1A1A]" />
                <span className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#1A1A1A]">
                  System Allocation
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#FDFCF6] border border-[#1A1A1A] px-4 py-2 rounded-full shadow-sm">
                <CheckCircle2 size={16} className="text-[#A8B545]" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
                  Status: Active
                </span>
              </div>
            </div>

            {/* Massive Number Blocks */}
            <div className="flex flex-col sm:flex-row border-b-2 border-[#1A1A1A]">
              <div className="w-full sm:w-1/2 border-b-2 sm:border-b-0 sm:border-r-2 border-[#1A1A1A] p-8 md:p-10 bg-[#FDFCF6]/50 flex flex-col justify-between">
                <span className="font-mono text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/60 mb-6 block">
                  Queries Remaining
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-8xl md:text-[8rem] font-serif tracking-tighter text-[#A8B545] leading-none font-bold">
                    {remaining}
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-1/2 p-8 md:p-10 bg-white flex flex-col justify-between">
                <span className="font-mono text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/60 mb-6 block">
                  Queries Consumed
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-8xl md:text-[8rem] font-serif tracking-tighter text-[#1A1A1A] leading-none font-bold">
                    {used}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar Row */}
            <div className="border-b-2 border-[#1A1A1A] p-8 md:p-10 bg-[#FDFCF6]/50">
              <div className="flex justify-between font-mono text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">
                <span>0 Used</span>
                <span>Total Capacity: {totalAllocated}</span>
              </div>

              <div className="w-full h-8 bg-white border-2 border-[#1A1A1A] rounded-full overflow-hidden flex relative shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${usedPercentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  className="h-full bg-[#1A1A1A] relative z-10 border-r-2 border-[#1A1A1A]"
                />
                <div className="h-full bg-[#A8B545] flex-grow opacity-50" />
              </div>
            </div>

            {/* Interactive App Navigation Blocks (New Feature) */}
            <div className="flex flex-col sm:flex-row border-b-2 border-[#1A1A1A]">
              {/* Analyze Navigation */}
              <Link
                href="/analyze"
                className="w-full sm:w-1/2 p-8 md:p-10 border-b-2 sm:border-b-0 sm:border-r-2 border-[#1A1A1A] bg-white hover:bg-[#A8B545] transition-colors duration-500 group flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-10">
                  <ScanLine
                    size={18}
                    className="text-[#1A1A1A]/60 group-hover:text-[#1A1A1A] transition-colors"
                  />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/60 group-hover:text-[#1A1A1A] transition-colors">
                    Computer Vision
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-serif text-3xl md:text-4xl tracking-tight font-bold">
                    Scan Fridge
                  </span>
                  <ArrowRight
                    size={28}
                    className="group-hover:translate-x-2 transition-transform duration-500"
                  />
                </div>
              </Link>

              {/* Discover Navigation */}
              <Link
                href="/discover"
                className="w-full sm:w-1/2 p-8 md:p-10 bg-[#FDFCF6] hover:bg-[#C26D5C] hover:text-[#FDFCF6] transition-colors duration-500 group flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-10">
                  <Compass
                    size={18}
                    className="text-[#1A1A1A]/60 group-hover:text-[#FDFCF6] transition-colors"
                  />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/60 group-hover:text-[#FDFCF6] transition-colors">
                    Database
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-serif text-3xl md:text-4xl tracking-tight font-bold">
                    Explore Menu
                  </span>
                  <ArrowRight
                    size={28}
                    className="group-hover:translate-x-2 transition-transform duration-500"
                  />
                </div>
              </Link>
            </div>

            {/* Minimized Terminate Session Button (At Last) */}
            <div className="bg-[#FDFCF6]/80 p-6 flex justify-end mt-auto rounded-br-md">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/50 hover:text-red-700 transition-colors group"
              >
                <span>
                  {isLoggingOut ? "Disconnecting..." : "Terminate Session"}
                </span>
                {isLoggingOut ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
