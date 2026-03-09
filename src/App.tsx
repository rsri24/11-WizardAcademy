/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Wand2, 
  ArrowLeft, 
  Bolt, 
  Mail, 
  Lock, 
  Check, 
  Sparkles, 
  Star, 
  Castle, 
  BookOpen, 
  FlaskConical, 
  History, 
  Swords, 
  Send,
  Globe,
  User,
  Baby,
  Users,
  Settings,
  Calendar,
  Share2,
  Trophy,
  Briefcase,
  LayoutGrid,
  Volume2,
  VolumeX,
  Upload,
  Plus,
  Trash2,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Modality } from "@google/genai";
import { useRef } from 'react';

// --- Types ---
type Screen = 
  | 'landing' 
  | 'login'
  | 'signup' 
  | 'otp' 
  | 'avatar' 
  | 'welcome' 
  | 'placementIntro' 
  | 'test' 
  | 'result' 
  | 'dashboard' 
  | 'subjectSelection' 
  | 'chapterPractice' 
  | 'leaderboard' 
  | 'progressGrimoire' 
  | 'guardianPortal'
  | 'vault'
  | 'badgeDetails'
  | 'ranks'
  | 'admin';

// --- Components ---

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.1;
  }, []);

  const toggle = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button 
      onClick={toggle}
      className="fixed bottom-24 right-6 z-50 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-primary/20 text-primary hover:scale-110 transition-transform"
    >
      {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
    </button>
  );
};

const useVoice = () => {
  const speak = async (text: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read this question for a child: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.play();
      }
    } catch (e) {
      console.error("Voice failed", e);
    }
  };

  return { speak };
};

const AdminPanel = ({ user, onBack }: { user: any, onBack: () => void }) => {
  const [stats, setStats] = useState<any>(null);
  const [bulkJson, setBulkJson] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats', {
      headers: { 'x-user-email': user?.email }
    });
    if (res.ok) setStats(await res.json());
  };

  const handleBulkUpload = async () => {
    try {
      setIsUploading(true);
      const questions = JSON.parse(bulkJson);
      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email
        },
        body: JSON.stringify({ questions })
      });
      if (res.ok) {
        alert("Bulk upload successful!");
        setBulkJson('');
        fetchStats();
      } else {
        const err = await res.json();
        alert(err.error || "Upload failed");
      }
    } catch (e) {
      alert("Invalid JSON format or upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-[800px] mx-auto p-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-primary" />
            Admin Academy Portal
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Wizards</p>
          <p className="text-3xl font-black text-primary">{stats?.userCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Questions</p>
          <p className="text-3xl font-black text-primary">{stats?.questionCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Categories</p>
          <p className="text-3xl font-black text-primary">{stats?.categories?.length || 0}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Upload size={20} className="text-primary" />
          Bulk Question Upload
        </h2>
        <p className="text-slate-500 text-sm mb-4">Paste your JSON formatted questions here. Format: <code>{'[{"category": "Maths", "question": "...", "options": ["A", "B", ...], "correct_option": 0, "explanation": "..."}]'}</code></p>
        <textarea 
          value={bulkJson}
          onChange={(e) => setBulkJson(e.target.value)}
          placeholder='[{"category": "Maths", ...}]'
          className="w-full h-64 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-mono text-sm focus:border-primary focus:outline-none mb-4"
        />
        <button 
          onClick={handleBulkUpload}
          disabled={isUploading || !bulkJson}
          className="w-full bg-primary text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {isUploading ? "Casting Upload Spell..." : "Bulk Upload Questions"}
          <Sparkles size={20} />
        </button>
      </div>
    </div>
  );
};

const Navbar = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <nav className="flex items-center justify-between p-6 lg:px-12 bg-background-light/80 backdrop-blur-md sticky top-0 z-50">
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
      <div className="bg-primary p-2 rounded-lg text-white flex items-center justify-center">
        <Wand2 size={24} />
      </div>
      <h2 className="text-xl font-extrabold tracking-tight text-primary">11+WizardAcademy</h2>
    </div>
    <div className="hidden md:flex items-center gap-8">
      <a className="text-sm font-semibold hover:text-primary transition-colors" href="#">Spells</a>
      <a className="text-sm font-semibold hover:text-primary transition-colors" href="#">Potions</a>
      <a className="text-sm font-semibold hover:text-primary transition-colors" href="#">Library</a>
    </div>
    <div className="flex items-center gap-4">
      <button 
        onClick={() => onNavigate('login')}
        className="text-sm font-bold text-primary hover:opacity-80 transition-opacity px-4 py-2"
      >
        Login
      </button>
      <button 
        onClick={() => onNavigate('signup')}
        className="bg-primary text-white text-sm font-bold px-6 py-2 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
      >
        Sign Up
      </button>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="px-6 py-12 lg:px-12 border-t border-slate-200">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-2 rounded-lg text-primary flex items-center justify-center">
          <Wand2 size={20} />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">11+WizardAcademy</h2>
      </div>
      <div className="flex gap-8 text-sm text-slate-500">
        <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
        <a className="hover:text-primary transition-colors" href="#">Terms of Magic</a>
        <a className="hover:text-primary transition-colors" href="#">Contact Owls</a>
      </div>
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
          <Globe size={18} />
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
          <Mail size={18} />
        </div>
      </div>
    </div>
    <div className="text-center mt-12 text-xs text-slate-400">
      © 2024 WizardAcademy. All spells reserved.
    </div>
  </footer>
);

const LandingPage = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <div className="min-h-screen bg-background-light">
    {/* Hero Section */}
    <section className="relative px-6 py-20 lg:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex flex-col gap-8 lg:w-1/2 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Enrolling for 2026 Term</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tight">Master the <br/><span className="text-primary">Arcane Arts</span> of Knowledge</h1>
          <p className="text-lg lg:text-xl text-slate-600 max-w-xl leading-relaxed">Join the most prestigious academy for young wizards. Master mathematics, linguistics, and logic through enchanted lessons and interactive duels.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => onNavigate('signup')}
              className="px-8 py-4 rounded-full bg-primary text-white font-bold text-lg shadow-xl shadow-primary/30 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Begin Initiation <ArrowLeft size={20} className="rotate-180" />
            </button>
            <button className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              Explore Library <BookOpen size={20} />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <img src={`https://picsum.photos/seed/wiz${i}/100/100`} alt="Wizard" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 font-medium"><span className="text-slate-900 font-bold">12,000+</span> Apprentices already enrolled</p>
          </div>
        </div>
        <div className="lg:w-1/2 relative">
          <div className="relative z-10 p-4 lg:p-8">
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-2xl">
              <div className="aspect-video rounded-2xl overflow-hidden relative mb-6 shadow-lg">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_D2qiwuIpNXt6yfBqrHNOyQFjM72ujudr4I9K_jk23VQ5uyd0FGeVb1PQQTKSkh7LP3hSaWk4gwS85CQuw1MKwrSnWG_9INTTiFaNchai-nMySDRE4ccymOAs68gieq0jwsWOT6-8or6h1jOTZwlxKrw1s8uPLjsKmwWvZ6upNIBsJZ4WS_pGv774LCndzqhskiKIKYEUhI65rSh_m9qxZRi9sLgjjgrqSO3afS9NUSDYZLPx3yI8M1hS6psZ2Ps-gpnM52CsIyQ" 
                  alt="Wizard Academy" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-bold">Live Lesson: Advanced Alchemy</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg">Course Progress</h4>
                  <span className="text-primary font-bold">78%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[78%] rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-4 bg-white/10 rounded-lg border border-white/10">
                    <Sparkles size={20} className="text-primary mb-2" />
                    <p className="text-sm font-bold">Spells</p>
                    <p className="text-xs opacity-60">12 Unlocked</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-lg border border-white/10">
                    <FlaskConical size={20} className="text-primary mb-2" />
                    <p className="text-sm font-bold">Potions</p>
                    <p className="text-xs opacity-60">5 Brewed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-20 left-1/4 animate-pulse opacity-20">
        <Sparkles size={40} className="text-primary" />
      </div>
      <div className="absolute bottom-40 right-1/4 animate-pulse opacity-20">
        <Star size={40} className="text-primary" />
      </div>
    </section>

    {/* Path Selection */}
    <section className="px-6 py-20 lg:px-12 bg-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <h2 className="text-3xl font-extrabold text-primary">Choose Your Path</h2>
          <p className="text-slate-600 max-w-xl">Whether you prefer the laboratory of an alchemist or the dueling grounds of a battle mage, we have a curriculum for you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Alchemy 101', icon: <Sparkles size={20} />, desc: 'Master the delicate art of potion-making and transmuting base metals into pure magic.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbH6sfG3CVpJvPymenoQf3twX_rkIilhCX3MbZiZQjdbg0GwIN1eN0vG19BLLXrcaoRBUN6HjTFIjdSjWDgz0Bt6O2KO4QQr07-PILF78oU_IQAWegtEr7EdIuxyj-tGG2qfzcydQSj36FJpJrCvaJ0ZK4QWQmVo6t33nTpRH-2SQpwHJTfK8RSW2SNXpJeHtYMAoHJan9Z4zTS7NS70xjR8Vt701QFTwhEDG3UGSrSICps2LS9oQqCGzMtxonUgiXNjFChNUF9Gc' },
            { title: 'Spell Casting', icon: <Bolt size={20} />, desc: 'Focus your mental energy through wands, staves, or bare hands to manifest incredible feats.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtWuDTh0yS3PR09SdiEnWe5ZPIaZHeUYYzBrUvH6ez0fzUMsyzgrnUVze5M6RSnrteNvZkoK9p7Ce74Nt6NTMve-xt_5QlNTV9Nz7j5vFxrqG93F_6ezQooUnMOHZtr1dEaq4vh8bBJkrQMv26xYXVb2MY8i7XBT4q6Jilm-N2QARhYN112eN5Owk_lVhYrMj-H9I30NPiclW-VchPtFB-d6w0Bfm7f1w_hFeIaKZl4giUXqh5zOSd5UUu09zQ56xBjqbh81grBHQ' },
            { title: 'Ancient Runes', icon: <History size={20} />, desc: 'Learn the forgotten language of the ancients to enchant objects and decipher hidden portals.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8A2BiDpKlfLlvoEdSIfFn2hxP0ZOPY7MobTQQo38tqnHvkXwg_GiszhEl8oG3pKF9sQcDII_AzuAgMzKl9jaQTOYr2FPIM4j_rKe3aNkVryIXNS16KJIA5pa2XY-pJzO8dJQAKxsfqrA5AiJEVWN6VyUZ9AAwU_YI38CEFsEqU2xrGtU2OFo2Z-JEZxSLEB5Q6vCxiLZOqiWoEftgFeUeKvNuwLyawEnt6Aglc-Fh_4d8Tzt40x56PVO5Td4QkACWwRlIHD9iOfc' }
          ].map((path, i) => (
            <div key={i} className="group relative overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200 hover:border-primary/50 transition-all p-2">
              <div className="aspect-[4/3] rounded-lg overflow-hidden relative mb-4">
                <img src={path.img} alt={path.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="mb-1">{path.icon}</div>
                  <h3 className="font-bold text-lg">{path.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">{path.desc}</p>
                <button className="w-full py-3 rounded-lg bg-primary/10 text-primary font-bold text-sm group-hover:bg-primary group-hover:text-white transition-colors">Join Class</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Why Us Section */}
    <section className="px-6 py-24 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex flex-col gap-6 lg:w-1/2">
            <h2 className="text-4xl font-black leading-tight">Why Learn With <br/><span className="text-primary">WizardAcademy?</span></h2>
            <p className="text-lg text-slate-600">Our enchanted curriculum is built from the ground up for modern magic-users. No more dusty scrolls or centuries-long waiting lists.</p>
            <div className="grid gap-6 mt-4">
              {[
                { title: 'Interactive Duels', icon: <Swords size={24} />, desc: 'Practice your reaction time and defensive wards in real-time, risk-free magical simulations.' },
                { title: '100+ Potion Recipes', icon: <FlaskConical size={24} />, desc: 'Access our digital grimoire with step-by-step augmented reality brewing guides.' },
                { title: 'Owl Delivery Feedback', icon: <Send size={24} />, desc: 'Get instant personalized critique from our expert archmages on your latest incantations.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="bg-primary/20 p-3 rounded-lg h-fit text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="w-full aspect-square rounded-full bg-primary/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            <div className="relative z-10 p-8">
              <img 
                alt="Magical book floating" 
                className="w-full h-auto drop-shadow-2xl" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv_kr32IJOlBwwzrdudgVRR2wSPdlyWloOhcmWwwGh_oNwGcL_Uu7b1YFJEuT19PyrDjaDQGKXIJ9b4kBV0c3GcXUqD-PLmc5PwJ9JAX73J28oTvb2DHiC3zFR3OdL_Zs4G5lo1O6qgKmDpuX3eV5RXHx3sf6mJvXq8rC7xWqDd6XNbUULfcUJS6MLXQKZ555qNKPCwW9qhTaHo9a4GaWlNK0NYacZNQ37rdAAEOuQ0wKpQBUAEmGwDbzQZMbsOmNIQe_urc9PEnY" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="px-6 py-20 lg:px-12">
      <div className="max-w-5xl mx-auto rounded-xl bg-primary p-12 lg:p-20 relative overflow-hidden text-center flex flex-col items-center gap-8">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
        <div className="relative z-10 flex flex-col gap-6">
          <h2 className="text-3xl lg:text-5xl font-black text-white">Ready to begin your magical apprenticeship?</h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">The stars have aligned. Your path to mastery starts with a single spell. Join thousands of other wizards in training today.</p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button 
              onClick={() => onNavigate('signup')}
              className="bg-white text-primary px-10 py-4 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-xl"
            >
              Start Learning for Free
            </button>
          </div>
          <p className="text-white/60 text-xs mt-4">No credit card or magical wand required to start.</p>
        </div>
      </div>
    </section>
  </div>
);

const Login = ({ onBack, onNext, onUserLoggedIn }: { onBack: () => void, onNext: () => void, onUserLoggedIn: (email: string) => void }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    if (!email) return;
    
    try {
      const res = await fetch(`/api/user/${email}`);
      if (res.ok) {
        onUserLoggedIn(email);
        onNext();
      } else {
        alert("Wizard not found! Please create an account.");
      }
    } catch (e) {
      console.error("Failed to login", e);
    }
  };
  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <div className="flex items-center p-4 pb-2 justify-between">
        <div 
          onClick={onBack}
          className="text-primary flex size-12 shrink-0 items-center justify-start cursor-pointer"
        >
          <ArrowLeft size={30} />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">Apprentice Login</h2>
      </div>

      <div className="px-4 py-6 flex flex-col items-center">
        <div className="w-full aspect-[16/9] bg-primary/10 rounded-[40px] relative overflow-hidden mb-8 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #7f0df2 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="relative flex flex-col items-center gap-4">
            <BookOpen size={64} className="text-primary" />
            <div className="flex gap-2">
              <Star size={16} className="text-primary fill-primary" />
              <Star size={20} className="text-primary fill-primary" />
              <Star size={16} className="text-primary fill-primary" />
            </div>
          </div>
        </div>

        <h1 className="text-slate-900 text-3xl font-bold text-center mb-2">Enter Your Magic Portal</h1>
        <p className="text-slate-600 text-center text-base mb-8">Type your secret scroll (email) below to receive a magical code!</p>

        <div className="w-full space-y-6">
          <label className="flex flex-col w-full">
            <p className="text-slate-900 text-base font-medium leading-normal pb-2">Email Address</p>
            <div className="relative flex items-center">
              <input 
                className="flex-1 rounded-l-xl text-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-primary/20 bg-white h-14 placeholder:text-slate-400 pl-4 pr-4 text-base font-normal transition-all" 
                placeholder="wizard@magic-school.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="h-14 w-14 bg-primary/5 border border-l-0 border-primary/20 rounded-r-xl flex items-center justify-center text-primary">
                <Mail size={20} />
              </div>
            </div>
          </label>

          <button 
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
          >
            <span>Sign In to Academy</span>
            <Sparkles size={20} className="fill-white" />
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-primary/20 flex-1"></div>
            <p className="text-primary/60 text-xs font-bold uppercase tracking-widest">Or Login With</p>
            <div className="h-px bg-primary/20 flex-1"></div>
          </div>

          <div className="flex justify-center gap-6">
            <button className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
              <Baby size={24} />
            </button>
            <button className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
              <Users size={24} />
            </button>
          </div>

          <p className="text-slate-500 text-sm text-center mt-8">
            Forgot your wand? <span className="text-primary font-bold cursor-pointer">Ask a Master Wizard</span>
          </p>
          <p className="text-slate-500 text-sm text-center mt-2">
            New wizard? <span onClick={() => onBack()} className="text-primary font-bold cursor-pointer underline">Create an account</span>
          </p>
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
};

const CreateAccount = ({ onBack, onNext, onUserCreated }: { onBack: () => void, onNext: () => void, onUserCreated: (email: string) => void }) => {
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');

  const handleSubmit = async () => {
    if (!email || !name) {
      alert("Please fill in your name and email!");
      return;
    }
    
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, age, class: grade, role })
      });
      
      if (res.ok) {
        onUserCreated(email);
        onNext();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to create magical account. Maybe this email is already taken?");
      }
    } catch (e) {
      console.error("Failed to create user", e);
      alert("A magical error occurred. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <div className="flex items-center p-4 pb-2 justify-between">
        <div 
          onClick={onBack}
          className="text-primary flex size-12 shrink-0 items-center justify-start cursor-pointer"
        >
          <ArrowLeft size={30} />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Create Account</h2>
      </div>

      <div className="px-4 pt-8 pb-4">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
          <Wand2 size={36} className="text-primary" />
        </div>
        <h1 className="text-slate-900 tracking-tight text-[34px] font-bold leading-tight">Join the Magic</h1>
        <p className="text-slate-600 text-base font-normal leading-normal mt-2">Fill in your details to start your mystical journey.</p>
      </div>

      <div className="flex flex-col gap-4 px-4 py-3">
        <div className="flex flex-col gap-2">
          <p className="text-slate-900 text-base font-medium leading-normal">My Magical Role is...</p>
          <div className="grid grid-cols-2 gap-2 p-1 bg-primary/10 rounded-xl w-full">
            <button 
              onClick={() => setRole('STUDENT')}
              className={`py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${role === 'STUDENT' ? 'bg-white shadow-sm text-primary border border-primary/20' : 'text-slate-500'}`}
            >
              <Baby size={20} />
              Student
            </button>
            <button 
              onClick={() => setRole('PARENT')}
              className={`py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${role === 'PARENT' ? 'bg-white shadow-sm text-primary border border-primary/20' : 'text-slate-500'}`}
            >
              <Users size={20} />
              Parent
            </button>
            <button 
              onClick={() => setRole('TEACHER')}
              className={`py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${role === 'TEACHER' ? 'bg-white shadow-sm text-primary border border-primary/20' : 'text-slate-500'}`}
            >
              <BookOpen size={20} />
              Teacher
            </button>
            <button 
              onClick={() => setRole('ADMIN')}
              className={`py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${role === 'ADMIN' ? 'bg-white shadow-sm text-primary border border-primary/20' : 'text-slate-500'}`}
            >
              <ShieldCheck size={20} />
              Admin
            </button>
          </div>
        </div>

        <label className="flex flex-col w-full">
          <p className="text-slate-900 text-base font-medium leading-normal pb-2">Wizard Name</p>
          <div className="relative">
            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" />
            <input 
              className="flex w-full rounded-xl text-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-primary/20 bg-white h-14 placeholder:text-slate-400 pl-12 pr-4 text-base font-normal transition-all" 
              placeholder="Merlin Jr." 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </label>

        <label className="flex flex-col w-full">
          <p className="text-slate-900 text-base font-medium leading-normal pb-2">Email Address</p>
          <div className="relative">
            <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" />
            <input 
              className="flex w-full rounded-xl text-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-primary/20 bg-white h-14 placeholder:text-slate-400 pl-12 pr-4 text-base font-normal transition-all" 
              placeholder="wizard@magic.com" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </label>

        <div className="flex gap-4">
          <label className="flex flex-col flex-1">
            <p className="text-slate-900 text-base font-medium leading-normal pb-2">Age</p>
            <input 
              className="flex w-full rounded-xl text-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-primary/20 bg-white h-14 placeholder:text-slate-400 p-4 text-base font-normal transition-all" 
              placeholder="Years" 
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </label>
          <label className="flex flex-col flex-1">
            <p className="text-slate-900 text-base font-medium leading-normal pb-2">Class</p>
            <select 
              className="flex w-full rounded-xl text-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-primary/20 bg-white h-14 p-4 text-base font-normal transition-all appearance-none"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="">Select Class</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
              <option value="6">Grade 6</option>
            </select>
          </label>
        </div>

        <div className="w-full h-24 rounded-2xl overflow-hidden relative my-2">
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <img 
              className="w-full h-full object-cover opacity-30" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyW2s8uscfitLO7f1KEV3yoS5YnXJskxniJpJwQ5oFR0hVv1AqGdfEaRCCbCOVxh4V0sixPR7FaKe8alD2PwCpycA8BRes2KlMyLdnuTmSeGTuchfoi1EQtQKnzQam73aGs-6e70rqbmxCCmtqWOy-CiQqLBwcae6oMlSWX5AhWpa6yJ4hbQwVOt0iN-JOLBaaTJeuDkCZNNDgP52BDnjk1RbKRSQMjh-8E3tx8yY-af-V_a8UnjGLO09vqzMb09YXSECLR7qGApE" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">Unlock your special abilities</span>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
          >
            <span>Create Magical Account</span>
            <Sparkles size={20} />
          </button>
          <p className="text-slate-500 text-xs text-center mt-4 px-8">
            By continuing, you agree to our <span className="text-primary underline">Mystical Terms</span> and <span className="text-primary underline">Privacy Policy</span>.
          </p>
          <p className="text-slate-500 text-sm text-center mt-4">
            Already have an account? <span onClick={onBack} className="text-primary font-bold cursor-pointer underline">Sign In</span>
          </p>
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
};

const OTPVerification = ({ onBack, onVerify }: { onBack: () => void, onVerify: () => void }) => {
  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-primary/10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center p-4 justify-between relative z-10">
          <button 
            onClick={onBack}
            className="text-slate-900 p-2 hover:bg-primary/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">OTP Verification</h2>
        </div>

        <div className="px-6 py-8 relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-primary/5">
              <Wand2 size={40} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">Verify Your Magic</h1>
            <p className="text-slate-600 text-center text-sm px-4">
              Enter the 6-digit code sent to your <span className="text-primary font-semibold">mystical device</span> to proceed
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <input 
                key={i}
                className="w-12 h-14 text-center text-2xl font-bold bg-primary/5 border-0 border-b-2 border-primary/20 focus:border-primary focus:ring-0 rounded-t-lg transition-all" 
                maxLength={1} 
                placeholder="•" 
                type="text"
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="flex gap-4">
              <div className="flex flex-col items-center min-w-[64px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-primary text-lg font-bold">01</p>
                </div>
                <p className="text-slate-500 text-xs mt-2 uppercase tracking-wider font-semibold">Min</p>
              </div>
              <div className="flex items-center text-primary font-bold text-xl pt-1">:</div>
              <div className="flex flex-col items-center min-w-[64px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-primary text-lg font-bold">59</p>
                </div>
                <p className="text-slate-500 text-xs mt-2 uppercase tracking-wider font-semibold">Sec</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Didn't receive the magic? <button className="text-primary font-bold hover:underline">Resend Code</button>
            </p>
          </div>

          <button 
            onClick={onVerify}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Cast Verification</span>
            <Wand2 size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-8 pt-6 border-t border-primary/5 flex justify-center">
            <div className="flex items-center gap-2 text-primary/40">
              <Lock size={14} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Secure Enchantment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WelcomeOnboarding = ({ onTakeTest, onSkip }: { onTakeTest: () => void, onSkip: () => void }) => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <header className="flex items-center p-4 pb-2 justify-center sticky top-0 z-10 bg-background-light/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Wand2 size={18} />
          </div>
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Academy Onboarding</h2>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center">
        <div className="w-full aspect-square rounded-[40px] overflow-hidden relative mb-12 shadow-2xl">
          <img 
            src="https://picsum.photos/seed/library/800/800" 
            alt="Academy Library" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-6 left-6">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 border border-primary/20 shadow-lg">
              <Star size={16} className="text-primary fill-primary" />
              <span className="text-primary text-xs font-bold uppercase tracking-wider">New Apprentice</span>
            </div>
          </div>
        </div>

        <h1 className="text-slate-900 text-4xl font-black text-center mb-4 leading-tight">Welcome to the Academy!</h1>
        <p className="text-slate-600 text-center text-lg mb-12 leading-relaxed">
          Begin your journey into the mystic arts of knowledge. Choose your path, young apprentice, and let the magic of learning guide you.
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={onTakeTest}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-16 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
          >
            <BookOpen size={24} />
            <span className="text-lg">Take Placement Test</span>
          </button>
          <button 
            onClick={onSkip}
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold h-16 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all border border-primary/20"
          >
            <Bolt size={24} className="fill-primary" />
            <span className="text-lg">Start Practice Directly</span>
          </button>
        </div>
      </main>
      <div className="h-10"></div>
    </div>
  );
};

const PlacementTestIntro = ({ onStart, onSkip }: { onStart: () => void, onSkip: () => void }) => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <header className="flex items-center p-4 pb-2 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md">
        <div className="bg-primary p-1.5 rounded-lg text-white">
          <Wand2 size={18} />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Arcane Academy</h2>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <History size={20} />
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center">
        <div className="w-full aspect-square rounded-full bg-primary/5 relative mb-12 flex items-center justify-center">
          <div className="w-3/4 h-3/4 rounded-full bg-primary/10 animate-pulse"></div>
          <div className="absolute w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/50">
            <BookOpen size={40} />
          </div>
        </div>

        <h1 className="text-slate-900 text-4xl font-black text-center mb-4 leading-tight">Discover Your Power</h1>
        <p className="text-slate-600 text-center text-lg mb-12 leading-relaxed">
          Step into the circle of truth. This placement test determines your starting wizard level and matches you with the right spells and potions for your journey.
        </p>

        <div className="grid grid-cols-2 gap-4 w-full mb-12">
          <div className="bg-white p-6 rounded-3xl border border-primary/10 flex flex-col items-center text-center shadow-sm">
            <History size={24} className="text-primary mb-2" />
            <p className="text-xl font-bold">10 Minutes</p>
            <p className="text-xs text-slate-400">Duration</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-primary/10 flex flex-col items-center text-center shadow-sm">
            <Bolt size={24} className="text-primary mb-2" />
            <p className="text-xl font-bold">15 Spells</p>
            <p className="text-xs text-slate-400">Questions</p>
          </div>
        </div>

        <button 
          onClick={onStart}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-16 rounded-full flex items-center justify-center gap-3 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all mb-6"
        >
          <span className="text-lg">Begin Initiation</span>
          <Sparkles size={24} />
        </button>

        <button 
          onClick={onSkip}
          className="text-primary font-bold text-lg hover:underline"
        >
          Skip Test, I'm a Novice
        </button>
      </main>
      <div className="h-10"></div>
    </div>
  );
};

const TestQuestionScreen = ({ 
  questions, 
  currentIndex, 
  onNext, 
  onFinish, 
  onSubmitAnswer 
}: { 
  questions: any[], 
  currentIndex: number, 
  onNext: () => void, 
  onFinish: () => void, 
  onSubmitAnswer: (correct: boolean) => void 
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const { speak } = useVoice();
  const question = questions[currentIndex];

  useEffect(() => {
    if (question) {
      speak(question.question);
    }
  }, [currentIndex, question]);

  if (!question) return <div className="min-h-screen flex items-center justify-center">Loading exam...</div>;

  const handleNext = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === question.correct_option;
    onSubmitAnswer(isCorrect);
    setIsAnswered(true);
    
    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        onNext();
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        onFinish();
      }
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md">
        <ArrowLeft size={24} className="text-primary cursor-pointer" />
        <h2 className="text-slate-900 text-lg font-bold">{question.category} Exam</h2>
        <div className="w-6"></div>
      </header>

      <main className="flex-1 p-4">
        <div className="bg-white rounded-3xl p-4 border border-primary/10 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bolt size={20} className="text-primary fill-primary" />
              <span className="font-bold text-slate-900">Mana Level</span>
            </div>
            <div className="bg-primary/10 px-3 py-1 rounded-full">
              <span className="text-primary text-xs font-bold">{currentIndex + 1} of {questions.length}</span>
            </div>
          </div>
          <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="relative rounded-[40px] overflow-hidden mb-6 aspect-[4/3] shadow-lg">
          <img 
            src={`https://picsum.photos/seed/${question.category.toLowerCase()}/800/600`} 
            alt="Exam Illustration" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-6 left-6">
            <div className="bg-primary px-4 py-2 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
              Level {question.difficulty}: {question.category}
            </div>
          </div>
        </div>

        <h3 className="text-slate-900 text-2xl font-bold mb-4">Question {currentIndex + 1}</h3>
        
        <div className="bg-primary/5 p-6 rounded-3xl border-l-4 border-primary mb-8">
          <p className="text-slate-700 text-lg italic leading-relaxed">
            "{question.question}"
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {question.options.map((opt: string, idx: number) => (
            <button 
              key={idx}
              disabled={isAnswered}
              onClick={() => setSelectedOption(idx)}
              className={`w-full p-5 rounded-3xl border-2 flex items-center justify-between transition-all ${
                selectedOption === idx 
                  ? isAnswered 
                    ? idx === question.correct_option 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50'
                    : 'border-primary bg-primary/5 shadow-md' 
                  : isAnswered && idx === question.correct_option
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-100 bg-white hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedOption === idx ? 'border-primary' : 'border-slate-200'}`}>
                  {selectedOption === idx && <div className={`w-3 h-3 rounded-full ${isAnswered ? (idx === question.correct_option ? 'bg-green-500' : 'bg-red-500') : 'bg-primary'}`}></div>}
                </div>
                <span className={`text-lg font-bold ${selectedOption === idx ? 'text-primary' : 'text-slate-700'}`}>{opt}</span>
              </div>
              {selectedOption === idx && !isAnswered && <Sparkles size={20} className="text-primary" />}
              {isAnswered && idx === question.correct_option && <Check size={20} className="text-green-500" />}
            </button>
          ))}
        </div>

        {isAnswered && (
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-8">
            <p className="text-blue-900 font-bold mb-2 flex items-center gap-2">
              <BookOpen size={18} />
              Explanation:
            </p>
            <p className="text-blue-800 text-sm leading-relaxed">{question.explanation}</p>
          </div>
        )}

        <div className="flex gap-4 mb-8">
          <button className="flex-1 bg-primary/10 text-primary font-bold h-14 rounded-2xl flex items-center justify-center gap-2 border border-primary/20">
            <Sparkles size={20} />
            <span>Cast Hint</span>
          </button>
          <button 
            onClick={handleNext}
            disabled={selectedOption === null || isAnswered}
            className={`flex-[2] text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all ${selectedOption === null || isAnswered ? 'bg-slate-300 shadow-none' : 'bg-primary shadow-primary/30'}`}
          >
            <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Exam'}</span>
            <Wand2 size={20} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400 pb-8">
          <BookOpen size={14} />
          <span className="text-[10px] uppercase tracking-widest font-bold">Spellbook Level: Archmage Apprentice</span>
        </div>
      </main>
    </div>
  );
};

const TestResultScreen = ({ onContinue }: { onContinue: () => void }) => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md">
        <ArrowLeft size={24} className="text-primary cursor-pointer" />
        <h2 className="text-slate-900 text-lg font-bold">Quest Completion</h2>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Send size={20} />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-[40px] p-8 text-white relative overflow-hidden mb-8 shadow-xl">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">Mastery Achieved</div>
            <h1 className="text-4xl font-black mb-2 leading-tight">You've Graduated!</h1>
            <p className="text-white/80 text-sm">The Council of Mages is impressed by your performance.</p>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 border border-primary/10 shadow-sm flex flex-col items-center text-center mb-12 relative">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-primary p-1">
              <img 
                src="https://picsum.photos/seed/wizard/200/200" 
                alt="Wizard Avatar" 
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full border-4 border-white">
              <History size={20} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-1">Level 5 Mage</h2>
          <p className="text-primary italic font-bold text-lg mb-6">Master of Arcane Knowledge</p>
          <div className="flex gap-3">
            <div className="bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              <span className="text-primary text-xs font-bold">Rank: Top 5%</span>
            </div>
            <div className="bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              <span className="text-primary text-xs font-bold">+450 Mana</span>
            </div>
          </div>
        </div>

        <h3 className="text-primary text-sm font-bold uppercase tracking-widest mb-6">Subject Mastery</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-12">
          {[
            { label: 'Mathematics', score: '94%', color: 'bg-blue-500', icon: <Bolt size={16} className="text-blue-500" /> },
            { label: 'English', score: '88%', color: 'bg-green-500', icon: <BookOpen size={16} className="text-green-500" /> },
            { label: 'Verbal', score: '82%', color: 'bg-orange-500', icon: <Star size={16} className="text-orange-500" /> },
            { label: 'Non-Verbal', score: '91%', color: 'bg-purple-500', icon: <Sparkles size={16} className="text-purple-500" /> }
          ].map((item, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-slate-50 p-2 rounded-lg">{item.icon}</div>
                <span className="text-xs font-bold text-slate-500">{item.label}</span>
              </div>
              <p className="text-2xl font-black text-slate-900 mb-2">{item.score}</p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: item.score }}></div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={onContinue}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-16 rounded-full flex items-center justify-center gap-3 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all mb-8"
        >
          <span className="text-lg">Continue Journey</span>
          <Wand2 size={24} />
        </button>
      </main>

      <nav className="sticky bottom-0 bg-white border-t border-slate-100 flex justify-around p-4 pb-8">
        <div className="flex flex-col items-center gap-1 text-primary">
          <BookOpen size={24} />
          <span className="text-[10px] font-bold">Library</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <Swords size={24} />
          <span className="text-[10px] font-bold">Quests</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <User size={24} />
          <span className="text-[10px] font-bold">Profile</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <Sparkles size={24} />
          <span className="text-[10px] font-bold">Spells</span>
        </div>
      </nav>
    </div>
  );
};

const BottomNav = ({ active, onNavigate }: { active: Screen, onNavigate: (s: Screen) => void }) => {
  const items = [
    { id: 'dashboard', label: 'Library', icon: <BookOpen size={24} /> },
    { id: 'chapterPractice', label: 'Quests', icon: <Swords size={24} /> },
    { id: 'vault', label: 'Vault', icon: <Briefcase size={24} /> },
    { id: 'ranks', label: 'Ranks', icon: <Trophy size={24} /> },
    { id: 'guardianPortal', label: 'Profile', icon: <User size={24} /> }
  ];

  return (
    <nav className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-around p-4 pb-8 z-50">
      {items.map((item) => (
        <div 
          key={item.id}
          onClick={() => onNavigate(item.id as Screen)}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${active === item.id ? 'text-primary' : 'text-slate-400 hover:text-primary/60'}`}
        >
          {item.icon}
          <span className="text-[10px] font-bold">{item.label}</span>
        </div>
      ))}
    </nav>
  );
};

const Dashboard = ({ user, onNavigate }: { user: any, onNavigate: (s: Screen) => void }) => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary p-0.5">
            <img src={user?.avatar || "https://picsum.photos/seed/wizard/100/100"} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h2 className="text-slate-900 text-sm font-bold">{user?.name || 'Apprentice'}</h2>
            <p className="text-primary text-[10px] font-bold uppercase tracking-wider">Level {user?.level || 1} Mage</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            <Send size={20} />
          </div>
          <div className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1 border border-primary/20">
            <Star size={14} className="text-primary fill-primary" />
            <span className="text-primary text-xs font-bold">{user?.mana || 0}</span>
          </div>
          {user?.role === 'ADMIN' && (
            <button 
              onClick={() => onNavigate('admin')}
              className="bg-slate-900 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
              title="Admin Portal"
            >
              <ShieldCheck size={20} />
            </button>
          )}
          <button 
            onClick={() => onNavigate('logout' as any)}
            className="bg-red-500/10 text-red-500 p-2 rounded-full hover:bg-red-500/20 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-[40px] p-8 text-white relative overflow-hidden mb-8 shadow-xl">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="relative z-10">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit mb-4">Current Quest</div>
            <h1 className="text-3xl font-black mb-2">Potion of Fractions</h1>
            <p className="text-white/80 text-sm mb-6">Mix the right ingredients to solve the puzzles!</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold">Mastery Progress</span>
              <span className="text-xs font-bold">75%</span>
            </div>
            <div className="h-2 w-full bg-white/20 rounded-full mb-8 overflow-hidden">
              <div className="h-full bg-white w-3/4 rounded-full"></div>
            </div>
            <button 
              onClick={() => onNavigate('chapterPractice')}
              className="w-full bg-white text-primary font-bold h-14 rounded-full flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
            >
              <History size={20} />
              <span>Continue Learning</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <Check size={20} className="text-primary" />
            <h3 className="text-slate-900 font-bold">Daily Quests</h3>
          </div>
          <span className="text-primary text-xs font-bold uppercase tracking-widest">2/3 Done</span>
        </div>

        <div className="space-y-3 mb-8">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                <Check size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Read for 10 minutes</p>
                <p className="text-xs text-slate-400">+50 XP</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Solve 5 Math Charms</p>
                <p className="text-xs text-slate-400">+100 XP • 2/5</p>
              </div>
            </div>
            <button className="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">Go</button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 px-2">
          <BookOpen size={20} className="text-primary" />
          <h3 className="text-slate-900 font-bold">Magic Subjects</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div 
            onClick={() => onNavigate('subjectSelection')}
            className="bg-blue-50/50 p-6 rounded-[40px] border border-blue-100 flex flex-col items-center text-center cursor-pointer hover:bg-blue-50 transition-colors"
          >
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20">
              <Bolt size={28} />
            </div>
            <p className="font-black text-blue-900">Arithmancy</p>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">8 Spells</p>
          </div>
          <div className="bg-green-50/50 p-6 rounded-[40px] border border-green-100 flex flex-col items-center text-center cursor-pointer hover:bg-green-50 transition-colors">
            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/20">
              <FlaskConical size={28} />
            </div>
            <p className="font-black text-green-900">Herbology</p>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">12 Spells</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-900">Top Wizards</p>
              <History size={16} className="text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-300">1</span>
                  <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                  <span className="text-[10px] font-bold">Misty</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-primary/5 p-1 rounded-full">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary">4</span>
                  <div className="w-6 h-6 rounded-full bg-primary/20"></div>
                  <span className="text-[10px] font-bold text-primary">You</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-900">New Badges</p>
              <Star size={16} className="text-primary" />
            </div>
            <div className="flex justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 border border-orange-200">
                <History size={18} />
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Bolt size={18} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
};

const SubjectSelection = ({ onNavigate, onFetchQuestions }: { onNavigate: (s: Screen) => void, onFetchQuestions: (cat: string) => void }) => {
  const handleSubjectClick = (category: string) => {
    onFetchQuestions(category);
    onNavigate('test');
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md">
        <ArrowLeft size={24} className="text-primary cursor-pointer" onClick={() => onNavigate('dashboard')} />
        <div className="text-center">
          <h2 className="text-slate-900 text-lg font-bold">Subject Selection</h2>
          <p className="text-primary text-[10px] font-bold uppercase tracking-widest">Level 12 Apprentice</p>
        </div>
        <div className="w-6"></div>
      </header>

      <main className="flex-1 p-4">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-[40px] p-8 text-white relative overflow-hidden mb-8 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2">Choose Your Path</h1>
            <p className="text-white/80 text-sm">Master the mystical arts to unlock new spells and progress through the Great Library.</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {[
            { title: 'Alchemy & Potions', tag: 'Maths', color: 'bg-green-500', icon: <FlaskConical size={24} />, progress: '65%', desc: 'Master the precise ratios and numerical formulas for magical brews.' },
            { title: 'Ancient Runes', tag: 'English', color: 'bg-orange-500', icon: <History size={24} />, progress: '42%', desc: 'Decipher the sacred texts and master the grammar of the elders.' },
            { title: 'Mystical Logic', tag: 'Verbal', color: 'bg-blue-500', icon: <Bolt size={24} />, progress: '88%', desc: 'Solve the riddles of the Sphinx and sharpen your linguistic wit.' },
            { title: 'Orb Gazing', tag: 'Non-Verbal', color: 'bg-purple-500', icon: <Sparkles size={24} />, progress: '15%', desc: 'Visualize patterns in the cosmos and predict geometric shifts.' }
          ].map((subject, i) => (
            <div key={i} className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`${subject.color}/10 p-3 rounded-2xl text-white`} style={{ backgroundColor: subject.color }}>
                    {subject.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">{subject.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-tight max-w-[200px]">{subject.desc}</p>
                  </div>
                </div>
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <span className="text-green-600 text-[10px] font-bold uppercase tracking-widest">{subject.tag}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400">Mastery Progress</span>
                <span className="text-[10px] font-bold text-primary">{subject.progress}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: subject.progress }}></div>
              </div>
              <button 
                onClick={() => handleSubjectClick(subject.tag)}
                className="w-full bg-primary text-white font-bold h-12 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <span>{i === 0 ? 'Start Lesson' : i === 1 ? 'Resume Study' : i === 2 ? 'Continue Path' : 'Begin Training'}</span>
              </button>
            </div>
          ))}
        </div>
      </main>

      <BottomNav active="subjectSelection" onNavigate={onNavigate} />
    </div>
  );
};

const ChapterPractice = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md">
        <ArrowLeft size={24} className="text-primary cursor-pointer" onClick={() => onNavigate('subjectSelection')} />
        <div className="text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Subject</p>
          <h2 className="text-slate-900 text-lg font-bold leading-tight">Alchemy & Potions</h2>
        </div>
        <div className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1 border border-primary/20">
          <Star size={14} className="text-primary fill-primary" />
          <span className="text-primary text-xs font-bold">1,240</span>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="bg-primary rounded-[40px] p-8 text-white relative overflow-hidden mb-8 shadow-xl">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">Wizard Rank</p>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-black leading-tight">Apprentice<br/>Alchemist</h1>
              <span className="text-4xl font-black">45%</span>
            </div>
            <div className="h-3 w-full bg-white/20 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-green-400 w-[45%] rounded-full"></div>
            </div>
            <p className="text-xs font-bold flex items-center gap-2">
              <Sparkles size={14} />
              <span>5 more stars to reach 'Adept' rank!</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 px-2">
          <BookOpen size={20} className="text-primary" />
          <h3 className="text-slate-900 font-bold">Magic Chapters</h3>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white p-6 rounded-[40px] border-2 border-primary shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-3xl overflow-hidden relative">
                <img src="https://picsum.photos/seed/potion1/100/100" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary">
                    <History size={16} className="fill-primary" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest">Chapter 1</p>
                <h4 className="font-black text-slate-900 text-lg">The Power of Fractions</h4>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <History size={12} className="text-primary" />
                    <span className="text-[10px] font-bold text-slate-400">Apprentice</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-orange-400 fill-orange-400" />
                    <span className="text-[10px] font-bold text-slate-400">12/15</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[80%] rounded-full"></div>
              </div>
              <span className="text-[10px] font-bold text-primary">80%</span>
            </div>
          </div>

          <div className="bg-white/50 p-6 rounded-[40px] border border-slate-100 shadow-sm opacity-60">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-200 flex items-center justify-center text-slate-400">
                <Lock size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Chapter 2</p>
                  <span className="bg-slate-200 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest">Locked</span>
                </div>
                <h4 className="font-black text-slate-400 text-lg">Mystical Multipliers</h4>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                  <History size={12} />
                  Complete Ch. 1 to unlock
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 p-6 rounded-[40px] border border-slate-100 shadow-sm opacity-60">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-200 flex items-center justify-center text-slate-400">
                <Lock size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Chapter 3</p>
                  <span className="bg-slate-200 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest">Locked</span>
                </div>
                <h4 className="font-black text-slate-400 text-lg">Divination Decimals</h4>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                  <Lock size={12} />
                  Unlocks at Rank: Adept
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/50 p-6 rounded-[40px] border-2 border-dashed border-blue-200 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star size={20} className="text-green-500" />
            <h4 className="font-black text-green-600">Chapter Mastery Levels</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-3xl border border-blue-100">
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest">Level 1</p>
              <p className="font-black text-slate-900">Apprentice</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-1">Basic potion mixing & splitting</p>
            </div>
            <div className="bg-white/50 p-4 rounded-3xl border border-blue-100 opacity-60">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Level 2</p>
              <p className="font-black text-slate-400">Adept</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-1">Complex elixir ratios & infusions</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav active="subjectSelection" onNavigate={onNavigate} />
    </div>
  );
};

const Leaderboard = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md">
        <div className="bg-primary p-1.5 rounded-lg text-white">
          <Wand2 size={18} />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Top Wizards</h2>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Star size={20} />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="flex p-1 bg-primary/5 rounded-full mb-8">
          <button className="flex-1 py-3 px-4 rounded-full font-bold text-sm bg-white shadow-sm text-primary border border-primary/10">Class Rankings</button>
          <button className="flex-1 py-3 px-4 rounded-full font-bold text-sm text-slate-400">Global Hall</button>
        </div>

        <div className="flex items-end justify-center gap-4 mb-12 pt-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-20 h-20 rounded-full border-4 border-slate-200 p-1">
                <img src="https://picsum.photos/seed/wiz2/100/100" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute bottom-0 right-0 bg-slate-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">2</div>
            </div>
            <p className="font-bold text-slate-900 text-sm">Morgana</p>
            <div className="h-16 w-16 bg-slate-100 rounded-t-2xl mt-2 flex items-center justify-center">
              <span className="text-slate-400 font-bold text-sm">2nd</span>
            </div>
          </div>

          <div className="flex flex-col items-center -mt-8">
            <div className="relative mb-2">
              <div className="w-28 h-28 rounded-full border-4 border-yellow-400 p-1 shadow-xl shadow-yellow-400/20">
                <img src="https://picsum.photos/seed/wiz1/100/100" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute bottom-0 right-0 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">1</div>
            </div>
            <p className="font-black text-slate-900">Albus D.</p>
            <div className="h-24 w-20 bg-yellow-400 rounded-t-3xl mt-2 flex items-center justify-center shadow-lg shadow-yellow-400/20">
              <span className="text-white font-black text-lg">1st</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-20 h-20 rounded-full border-4 border-orange-300 p-1">
                <img src="https://picsum.photos/seed/wiz3/100/100" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute bottom-0 right-0 bg-orange-300 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">3</div>
            </div>
            <p className="font-bold text-slate-900 text-sm">Ged</p>
            <div className="h-12 w-16 bg-orange-100 rounded-t-2xl mt-2 flex items-center justify-center">
              <span className="text-orange-400 font-bold text-sm">3rd</span>
            </div>
          </div>
        </div>

        <div className="bg-primary/10 p-4 rounded-[40px] border border-primary/20 flex items-center justify-between mb-8 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-primary font-black text-xl ml-2">14</span>
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden border-2 border-white">
                <img src="https://picsum.photos/seed/me/100/100" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white">YOU</div>
            </div>
            <div>
              <p className="font-black text-slate-900">Merlin Jr.</p>
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest">Apprentice II</p>
            </div>
          </div>
          <div className="text-right mr-2">
            <p className="text-primary font-black text-xl">4,250</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">EXP</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {[
            { rank: 4, name: 'Glinda W.', role: 'Sorcerer', exp: '8,920' },
            { rank: 5, name: 'Harry P.', role: 'Seeker', exp: '8,450' },
            { rank: 6, name: 'Hermione G.', role: 'Adept', exp: '8,100' },
            { rank: 7, name: 'Ursula M.', role: 'Witch of Waste', exp: '7,820' }
          ].map((wiz) => (
            <div key={wiz.rank} className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <span className="text-slate-300 font-black text-xl w-6">{wiz.rank}</span>
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                  <img src={`https://picsum.photos/seed/wiz${wiz.rank}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{wiz.name}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{wiz.role}</p>
                </div>
              </div>
              <p className="font-black text-slate-900">{wiz.exp}</p>
            </div>
          ))}
        </div>
      </main>

      <BottomNav active="leaderboard" onNavigate={onNavigate} />
    </div>
  );
};

const ProgressGrimoire = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <BookOpen size={20} />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Progress Grimoire</h2>
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <Wand2 size={20} />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm mb-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">Mastery Overview</p>
              <div className="flex items-center gap-2">
                <h1 className="text-5xl font-black text-slate-900">85%</h1>
                <div className="flex items-center gap-1 text-green-500">
                  <span className="text-sm font-bold">+12%</span>
                  <Sparkles size={16} />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Wizard Level 14</p>
              <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4 rounded-full"></div>
              </div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-300 mt-1">MAX</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 h-32">
            {[
              { label: 'MATH', val: '92%', h: 'h-[92%]' },
              { label: 'ENGLISH', val: '65%', h: 'h-[65%]', color: 'bg-primary/30' },
              { label: 'VERBAL', val: '80%', h: 'h-[80%]', color: 'bg-primary/60' },
              { label: 'LOGIC', val: 'MAX', h: 'h-full' }
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-400">{bar.val}</span>
                <div className={`w-full rounded-t-2xl ${bar.color || 'bg-primary'} ${bar.h}`}></div>
                <span className="text-[8px] font-black text-slate-400 tracking-widest">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 px-2">
          <Check size={20} className="text-primary" />
          <h3 className="text-slate-900 font-bold">Recent Spells Mastered</h3>
        </div>

        <div className="space-y-3 mb-8">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                <Bolt size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Long Division Charm</p>
                <p className="text-xs text-slate-400">Mastery Achieved Yesterday</p>
              </div>
            </div>
            <p className="text-primary font-black text-sm">+50 XP</p>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Adjective Alchemy</p>
                <p className="text-xs text-slate-400">Completed 2 days ago</p>
              </div>
            </div>
            <p className="text-primary font-black text-sm">+35 XP</p>
          </div>
        </div>

        <div className="bg-yellow-50/50 p-8 rounded-[40px] border-2 border-dashed border-yellow-200 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Star size={20} className="text-orange-500 fill-orange-500" />
            <h3 className="text-slate-900 font-black">Areas for Enchantment</h3>
          </div>
          <p className="text-orange-900/60 text-sm italic mb-6 leading-relaxed">
            "These scrolls require more focus to unlock their full power..."
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Fraction Transmutation</span>
              <div className="bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-orange-600 text-[10px] font-black">42% Mastery</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Synonym Summoning</span>
              <div className="bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-orange-600 text-[10px] font-black">58% Mastery</span>
              </div>
            </div>
          </div>
        </div>

        <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-20 rounded-[40px] flex items-center justify-between px-8 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <History size={20} />
            </div>
            <div className="text-left">
              <p className="text-lg font-black">Begin Recommended Quest</p>
            </div>
          </div>
          <ArrowLeft size={24} className="rotate-180" />
        </button>

        <div className="text-center pb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Targeting: Fraction Transmutation</p>
        </div>
      </main>

      <BottomNav active="progressGrimoire" onNavigate={onNavigate} />
    </div>
  );
};

const GuardianPortal = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-slate-900 text-sm font-bold">Guardian Portal</h2>
            <p className="text-primary text-[8px] font-bold uppercase tracking-widest">Academy Overseer</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-100 p-2 rounded-full text-slate-400">
            <History size={20} />
          </div>
          <div className="bg-slate-100 p-2 rounded-full text-slate-400">
            <Bolt size={20} />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="bg-white rounded-[40px] p-6 border border-slate-100 shadow-sm mb-8 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-primary p-1">
              <img src="https://picsum.photos/seed/leo/200/200" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-white text-[8px] font-black px-2 py-1 rounded-full border-2 border-white">LVL 14</div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Apprentice Leo</h1>
            <p className="text-slate-400 text-sm font-bold">Mage-in-Training • <span className="text-primary">12 Day Streak</span></p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-slate-900 font-bold">Daily Activity</h3>
          <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Today, Oct 24</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <History size={24} className="text-primary mb-4" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Time Spent</p>
            <p className="text-3xl font-black text-slate-900">45 <span className="text-sm font-bold text-slate-400">mins</span></p>
            <p className="text-green-500 text-[10px] font-bold mt-2 flex items-center gap-1">
              <ArrowLeft size={10} className="rotate-90" />
              +5% vs avg
            </p>
          </div>
          <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <Bolt size={24} className="text-primary mb-4" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mana Earned</p>
            <p className="text-3xl font-black text-slate-900">1,250 <span className="text-sm font-bold text-slate-400">MP</span></p>
            <p className="text-red-500 text-[10px] font-bold mt-2 flex items-center gap-1">
              <ArrowLeft size={10} className="-rotate-90" />
              -2% vs avg
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-slate-900 font-bold text-xl">Weekly Progress</h3>
            <button className="text-primary text-xs font-bold uppercase tracking-widest">View Report</button>
          </div>
          
          <div className="flex items-end justify-between gap-2 h-32 mb-6">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className={`w-full rounded-full ${i === 2 ? 'bg-primary h-full' : 'bg-primary/10 h-[60%]'}`}></div>
                <span className={`text-[10px] font-bold ${i === 2 ? 'text-primary' : 'text-slate-300'}`}>{day}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-400 text-xs italic">Leo is performing 15% better than last week in focus sessions.</p>
        </div>

        <h3 className="text-slate-900 font-bold mb-6 px-2">Strength & Focus</h3>
        
        <div className="space-y-3 mb-8">
          <div className="bg-white p-5 rounded-[40px] border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Alchemy & Chemistry</p>
                <p className="text-xs text-slate-400">Mastery: 92% (Top Strength)</p>
              </div>
            </div>
            <ArrowLeft size={20} className="rotate-180 text-slate-200" />
          </div>
          <div className="bg-white p-5 rounded-[40px] border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                <History size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Number Runes (Math)</p>
                <p className="text-xs text-slate-400">Needs Practice: 64%</p>
              </div>
            </div>
            <ArrowLeft size={20} className="rotate-180 text-slate-200" />
          </div>
        </div>

        <button className="w-full bg-primary text-white font-bold h-16 rounded-3xl flex items-center justify-between px-8 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all mb-4">
          <div className="flex items-center gap-4">
            <Star size={24} />
            <span className="text-lg">Manage Subscription</span>
          </div>
          <ArrowLeft size={24} className="rotate-180" />
        </button>

        <button className="w-full bg-white text-slate-900 font-bold h-16 rounded-3xl flex items-center justify-between px-8 border border-slate-100 shadow-sm active:scale-[0.98] transition-all mb-8">
          <div className="flex items-center gap-4">
            <Mail size={24} />
            <span className="text-lg">Contact Master Wizard</span>
          </div>
          <History size={24} className="text-slate-400" />
        </button>
      </main>

      <BottomNav active="guardianPortal" onNavigate={onNavigate} />
    </div>
  );
};

const MagicalVault = ({ user, onNavigate }: { user: any, onNavigate: (s: Screen) => void }) => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md">
        <div 
          onClick={() => onNavigate('dashboard')}
          className="text-primary flex size-12 shrink-0 items-center justify-center cursor-pointer"
        >
          <ArrowLeft size={24} />
        </div>
        <h2 className="text-primary text-2xl font-black leading-tight tracking-tight flex-1 text-center pr-12">Magical Vault</h2>
        <div className="bg-primary/10 p-2 rounded-full text-primary">
          <Settings size={24} />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-[40px] border border-primary/20 flex flex-col items-center text-center shadow-sm">
            <Sparkles size={32} className="text-primary mb-2" />
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Total Mana</p>
            <p className="text-3xl font-black text-primary">{user?.mana || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 p-6 rounded-[40px] border border-yellow-400/20 flex flex-col items-center text-center shadow-sm">
            <Star size={32} className="text-yellow-500 fill-yellow-500 mb-2" />
            <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mb-1">Stars Earned</p>
            <p className="text-3xl font-black text-yellow-600">{user?.stars || 0}</p>
          </div>
        </div>

        <div className="flex p-1 bg-primary/5 rounded-full mb-8">
          <button className="flex-1 py-3 px-4 rounded-full font-bold text-sm bg-white shadow-sm text-primary border border-primary/10 flex items-center justify-center gap-2">
            <Trophy size={16} />
            Badges
          </button>
          <button className="flex-1 py-3 px-4 rounded-full font-bold text-sm text-slate-400 flex items-center justify-center gap-2">
            <Briefcase size={16} />
            Items
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-slate-900 text-xl font-black">Wizard Badges</h3>
            <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">8 / 12 Found</span>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              { name: 'Master Alchemist', icon: <FlaskConical size={32} />, color: 'border-orange-400', locked: false },
              { name: 'Word Weaver', icon: <BookOpen size={32} />, color: 'border-blue-400', locked: false },
              { name: 'Logic Legend', icon: <Settings size={32} />, color: 'border-slate-200', locked: true },
              { name: 'Flora Finder', icon: <Sparkles size={32} />, color: 'border-green-400', locked: false },
              { name: 'Nova Knight', icon: <Star size={32} />, color: 'border-slate-200', locked: true }
            ].map((badge, i) => (
              <div 
                key={i} 
                onClick={() => !badge.locked && onNavigate('badgeDetails')}
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center relative ${badge.locked ? 'bg-slate-50 border-slate-100 opacity-40' : 'bg-white ' + badge.color}`}>
                  {badge.icon}
                  {badge.locked && (
                    <div className="absolute -top-1 -right-1 bg-slate-200 p-1 rounded-full border-2 border-white">
                      <Lock size={12} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <p className={`text-[10px] font-bold text-center leading-tight ${badge.locked ? 'text-slate-300' : 'text-slate-900'}`}>{badge.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-slate-900 text-xl font-black mb-6 px-2">Magical Items</h3>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <LayoutGrid size={28} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Phoenix Feather Pen</p>
                  <p className="text-xs text-slate-400">Writes 2x faster in Quests</p>
                </div>
              </div>
              <span className="bg-primary/10 text-primary text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Equipped</span>
            </div>
            <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                  <Sparkles size={28} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Cloak Fragment</p>
                  <p className="text-xs text-slate-400">1/3 fragments found</p>
                </div>
              </div>
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-1/3 rounded-full"></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                  <History size={28} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Time Turner Key</p>
                  <p className="text-xs text-slate-400">Redo one mistake per day</p>
                </div>
              </div>
              <button className="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">Use</button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav active="vault" onNavigate={onNavigate} />
    </div>
  );
};

const BadgeDetails = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md">
        <div 
          onClick={() => onNavigate('vault')}
          className="text-primary flex size-12 shrink-0 items-center justify-center cursor-pointer"
        >
          <ArrowLeft size={24} />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">Badge Details</h2>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center">
        <div className="relative mb-12">
          <div className="w-72 h-72 rounded-full bg-gradient-to-br from-primary to-primary/60 p-1 flex items-center justify-center shadow-2xl shadow-primary/40">
            <div className="w-full h-full rounded-full border-4 border-white/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <FlaskConical size={120} className="text-yellow-400 drop-shadow-lg" />
              <div className="absolute top-12 left-12">
                <Sparkles size={24} className="text-yellow-400 animate-pulse" />
              </div>
              <div className="absolute bottom-12 right-12">
                <Wand2 size={24} className="text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-400/20 px-6 py-2 rounded-full border border-yellow-400/30 mb-8">
          <span className="text-yellow-600 text-xs font-black uppercase tracking-[0.2em]">Legendary Achievement</span>
        </div>

        <h1 className="text-slate-900 text-5xl font-black text-center mb-6">Master Alchemist</h1>
        
        <p className="text-slate-600 text-center text-xl leading-relaxed mb-12">
          Awarded for completing <span className="text-primary font-black">50 Alchemy puzzles</span> with perfect accuracy! You've mastered the secret arts!
        </p>

        <div className="w-full bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between mb-12">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Earned On</p>
            <p className="text-slate-900 text-xl font-black">October 24, 2023</p>
          </div>
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Calendar size={28} />
          </div>
        </div>

        <button className="w-full bg-primary text-white font-bold h-16 rounded-3xl flex items-center justify-center gap-3 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all mb-8">
          <Share2 size={24} />
          <span className="text-lg">Share with Friends</span>
        </button>
      </main>

      <BottomNav active="vault" onNavigate={onNavigate} />
    </div>
  );
};

const Rankings = ({ user, leaderboard, onNavigate }: { user: any, leaderboard: any[], onNavigate: (s: Screen) => void }) => {
  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-background-light flex flex-col max-w-[480px] mx-auto overflow-x-hidden">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md">
        <div className="bg-primary p-1.5 rounded-lg text-white">
          <Wand2 size={18} />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Year 4 Rankings</h2>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Trophy size={20} />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="flex p-1 bg-primary/5 rounded-full mb-8">
          <button className="flex-1 py-3 px-4 rounded-full font-bold text-sm bg-primary text-white shadow-lg">Year 4</button>
          <button className="flex-1 py-3 px-4 rounded-full font-bold text-sm text-slate-400">Global</button>
          <button className="flex-1 py-3 px-4 rounded-full font-bold text-sm text-slate-400">Friends</button>
        </div>

        <div className="flex items-end justify-center gap-4 mb-12 pt-8">
          {topThree[1] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-20 h-20 rounded-full border-4 border-slate-200 p-1">
                  <img src={topThree[1].avatar || "https://picsum.photos/seed/wiz2/100/100"} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute bottom-0 right-0 bg-slate-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">2</div>
              </div>
              <p className="font-bold text-slate-900 text-sm">{topThree[1].name}</p>
              <div className="h-16 w-16 bg-slate-100 rounded-t-2xl mt-2 flex items-center justify-center">
                <span className="text-slate-400 font-bold text-sm">2nd</span>
              </div>
            </div>
          )}

          {topThree[0] && (
            <div className="flex flex-col items-center -mt-8">
              <div className="relative mb-2">
                <div className="w-28 h-28 rounded-full border-4 border-yellow-400 p-1 shadow-xl shadow-yellow-400/20">
                  <img src={topThree[0].avatar || "https://picsum.photos/seed/wiz1/100/100"} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute bottom-0 right-0 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">1</div>
              </div>
              <p className="font-black text-slate-900">{topThree[0].name}</p>
              <div className="h-24 w-20 bg-yellow-400 rounded-t-3xl mt-2 flex items-center justify-center shadow-lg shadow-yellow-400/20">
                <span className="text-white font-black text-lg">1st</span>
              </div>
            </div>
          )}

          {topThree[2] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-20 h-20 rounded-full border-4 border-orange-300 p-1">
                  <img src={topThree[2].avatar || "https://picsum.photos/seed/wiz3/100/100"} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute bottom-0 right-0 bg-orange-300 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">3</div>
              </div>
              <p className="font-bold text-slate-900 text-sm">{topThree[2].name}</p>
              <div className="h-12 w-16 bg-orange-100 rounded-t-2xl mt-2 flex items-center justify-center">
                <span className="text-orange-400 font-bold text-sm">3rd</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-primary/10 p-4 rounded-[40px] border border-primary/20 flex items-center justify-between mb-8 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-primary font-black text-xl ml-2">14</span>
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden border-2 border-white">
                <img src={user?.avatar || "https://picsum.photos/seed/me/100/100"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white">YOU</div>
            </div>
            <div>
              <p className="font-black text-slate-900">{user?.name || 'Merlin Jr.'}</p>
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest">Year 4 • Apprentice II</p>
            </div>
          </div>
          <div className="text-right mr-2">
            <p className="text-primary font-black text-xl">{user?.exp || 0}</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">EXP</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {others.map((wiz, idx) => (
            <div key={idx} className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <span className="text-slate-300 font-black text-xl w-6">{idx + 4}</span>
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                  <img src={wiz.avatar || `https://picsum.photos/seed/wiz${idx + 4}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{wiz.name}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Level {wiz.level} Mage</p>
                </div>
              </div>
              <p className="font-black text-slate-900">{wiz.exp}</p>
            </div>
          ))}
        </div>
      </main>

      <BottomNav active="ranks" onNavigate={onNavigate} />
    </div>
  );
};

const AvatarSelection = ({ onBack, onComplete }: { onBack: () => void, onComplete: () => void }) => {
  const [selected, setSelected] = useState(1);

  const avatars = [
    { id: 0, name: 'Fire Mage', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_D2qiwuIpNXt6yfBqrHNOyQFjM72ujudr4I9K_jk23VQ5uyd0FGeVb1PQQTKSkh7LP3hSaWk4gwS85CQuw1MKwrSnWG_9INTTiFaNchai-nMySDRE4ccymOAs68gieq0jwsWOT6-8or6h1jOTZwlxKrw1s8uPLjsKmwWvZ6upNIBsJZ4WS_pGv774LCndzqhskiKIKYEUhI65rSh_m9qxZRi9sLgjjgrqSO3afS9NUSDYZLPx3yI8M1hS6psZ2Ps-gpnM52CsIyQ' },
    { id: 1, name: 'Frost Seer', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnSY3Q4b2LLgVRyyTplTzgGqd_Te8tnqoRIf3jjvYI2EvoNsTZRGmmkGakC3QzwmTyTe_VRCYlK8X9YFkB6qGfXbRn4P-eb94BqBfmKl-GdTXQ7ojehghEO0qyD2tuRbn5KHVbYwVJT4XqezGHP4zkzBTESeFxlORARaH1P4sQDY5tuzEXwm8rjN-NyEHc4f20l-DoYaA8Qtptwme9KpJ2nKhGi2ws67Rf6rByFt8PSVd60Pwpn9jCMPG_Zs2Rt3TQ3rYE5N1uyj4' },
    { id: 2, name: 'Nature Druid', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPnJnPeJBnCQQF-b66VPPDK2P68buF7qGqOvBmOp4TEO3iXfMZaQbcikzJMyYZ02rC7ovCu_XOkO031g251G8qSywuS4oK5K-C9ml-243Fb2-x3uQTclkrB2l9SCoQ__BcZ-dbZIVh2OEVE-xcA12XvK-dO5Jek0CBedJMHw5wAbFPEDE_61L4i2a1lMtQ-thhjD2utoyOy3tnhNLqFehA1FjNe6JeLW_uaiXzOIOQ_gwk0So2y33U-p8qw1eOG-S0wk9yCoMKI-s' },
    { id: 3, name: 'Storm Caller', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDXCyjBfwIxV_lCyL58K5WCD7yF-gnJ8c_kcGlcv1jPgelhOQI87VGWduBPuE9JPHDQ6nm6rKWET2BVOTrtbMGCC-3ep5PWNm49O-WA-q8ya-jOJU_PWc4A57qiTWyxbD83DniCRogEakAyyqQwEpRtlMd1gG67zV2CXStx-Ow9hiOxh1eSwsuhgLEGzGm8d3mSccgPy7rkHIPF7X44Ul233kOBXqIEJ3QjpWXef2wlO7myPlQ8he0fj7Q9Ap67xehBf7hAMRDTq4' },
    { id: 4, name: 'Star Gazer', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk7NBdOP5avUiv3DGrK9BIGvs_uhglSzFlVftkwxG3WzNFCvGIn2Gh8vmue_lYefE0zVWpa4MUh0M1acDFmQ_cVcKTutpUi_UHXI8fwQs_Bu0bFWGTLS3MQc9fycKhncLIi5icaCNpPq4Kfw7ilRziy_oftbZw9T4zbKQSasoXrmiSowbb5bY0oOTYupT_sJOEDez5lEn7XTUJOPKbKcdmg98bANMrhCSyJmo2vk8yIEalWz-rrV3uXDx1veIIyw0_NsYFQqv1Wfc' },
    { id: 5, name: 'Golden Alchemist', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0Xo2L_91JIfSHyR-__FM5tzFIjHzjkxJkuFqFSCsIe5_fFtFKiEifDxxnthPlYMr4Wz2QFAhkMXb1y_yiyVCgn22ZV8nCbkWgrh9WNLU2rouGznmLgJAB5OmNeCL8ulCAHEV0TTBRpfyB3TIFgCUVU-A-rzBf5eUjoShlAS_I1-JOpYQWPdSkQXyHUdKJuXIF2nTlCNNdbuBtBeB3gQSMTfEyWXjiqJ17KrZkqP2wF0l7_zvhHL0oXNhvYYvG3b8oATfaDhoIdPo' },
  ];

  return (
    <div className="min-h-screen bg-background-light flex flex-col overflow-x-hidden">
      <header className="flex items-center bg-background-light p-4 pb-2 justify-between sticky top-0 z-10">
        <div 
          onClick={onBack}
          className="text-primary flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
        </div>
        <h2 className="text-slate-900 text-xl font-extrabold leading-tight tracking-tight flex-1 text-center pr-12">Choose Your Wizard</h2>
      </header>

      <main className="flex-1">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-slate-900 text-2xl font-bold leading-tight tracking-tight">Select an Avatar</h3>
          <p className="text-slate-600 mt-1 text-sm">Pick the wizard that matches your magic!</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
          {avatars.map((avatar) => (
            <div 
              key={avatar.id}
              onClick={() => setSelected(avatar.id)}
              className={`group relative aspect-square overflow-hidden rounded-xl border-4 transition-all cursor-pointer bg-primary/5 ${selected === avatar.id ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent hover:border-primary'}`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-110" 
                style={{ backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 50%), url("${avatar.img}")` }}
              ></div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-base font-bold leading-tight">{avatar.name}</p>
              </div>
              {selected === avatar.id && (
                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 flex items-center justify-center">
                  <Check size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className="sticky bottom-0 bg-background-light/80 backdrop-blur-md p-6 border-t border-primary/10">
        <button 
          onClick={onComplete}
          className="w-full flex min-w-[84px] max-w-[480px] mx-auto cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-primary text-white text-lg font-bold leading-normal tracking-wide shadow-lg shadow-primary/30 hover:brightness-110 transition-all active:scale-[0.98]"
        >
          <span className="truncate">Continue Adventure</span>
        </button>
      </footer>
      <div className="h-4 bg-transparent"></div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    // Try to load user from local storage or session
    const savedEmail = localStorage.getItem('wizard_email');
    if (savedEmail) {
      fetchUser(savedEmail);
    }
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (e) {
      console.error("Failed to fetch leaderboard", e);
    }
  };

  const fetchUser = async (email: string) => {
    try {
      const res = await fetch(`/api/user/${email}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('wizard_email', email);
      }
    } catch (e) {
      console.error("Failed to fetch user", e);
    }
  };

  const fetchQuestions = async (category: string) => {
    try {
      const res = await fetch(`/api/questions/${category}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
        setCurrentQuestionIndex(0);
      }
    } catch (e) {
      console.error("Failed to fetch questions", e);
    }
  };

  const submitAnswer = async (isCorrect: boolean) => {
    if (!user || !questions[currentQuestionIndex]) return;
    
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          questionId: questions[currentQuestionIndex].id,
          isCorrect
        })
      });
      
      // Refresh user data to get updated level/exp/mana
      fetchUser(user.email);
    } catch (e) {
      console.error("Failed to submit progress", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wizard_email');
    setUser(null);
    setScreen('landing');
  };

  const renderScreen = () => {
    // Handle logout navigation
    if ((screen as string) === 'logout') {
      handleLogout();
      return null;
    }

    switch (screen) {
      case 'landing':
        return <LandingPage onNavigate={setScreen} />;
      case 'login':
        return <Login onBack={() => setScreen('signup')} onNext={() => setScreen('otp')} onUserLoggedIn={fetchUser} />;
      case 'signup':
        return <CreateAccount onBack={() => setScreen('login')} onNext={() => setScreen('otp')} onUserCreated={fetchUser} />;
      case 'otp':
        return <OTPVerification onBack={() => setScreen('signup')} onVerify={() => setScreen('avatar')} />;
      case 'avatar':
        return <AvatarSelection onBack={() => setScreen('otp')} onComplete={() => setScreen('welcome')} />;
      case 'welcome':
        return <WelcomeOnboarding onTakeTest={() => setScreen('placementIntro')} onSkip={() => setScreen('dashboard')} />;
      case 'placementIntro':
        return <PlacementTestIntro onStart={() => setScreen('test')} onSkip={() => setScreen('dashboard')} />;
      case 'test':
        return (
          <TestQuestionScreen 
            questions={questions} 
            currentIndex={currentQuestionIndex}
            onNext={() => setCurrentQuestionIndex(prev => prev + 1)}
            onFinish={() => setScreen('result')}
            onSubmitAnswer={submitAnswer}
          />
        );
      case 'result':
        return <TestResultScreen onContinue={() => setScreen('dashboard')} />;
      case 'dashboard':
        return <Dashboard user={user} onNavigate={setScreen} />;
      case 'subjectSelection':
        return <SubjectSelection onNavigate={setScreen} onFetchQuestions={fetchQuestions} />;
      case 'chapterPractice':
        return <ChapterPractice onNavigate={setScreen} />;
      case 'leaderboard':
        return <Leaderboard onNavigate={setScreen} />;
      case 'progressGrimoire':
        return <ProgressGrimoire onNavigate={setScreen} />;
      case 'guardianPortal':
        return <GuardianPortal onNavigate={setScreen} />;
      case 'vault':
        return <MagicalVault user={user} onNavigate={setScreen} />;
      case 'badgeDetails':
        return <BadgeDetails onNavigate={setScreen} />;
      case 'ranks':
        return <Rankings user={user} leaderboard={leaderboard} onNavigate={setScreen} />;
      case 'admin':
        return <AdminPanel user={user} onBack={() => setScreen('dashboard')} />;
      default:
        return <LandingPage onNavigate={setScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-background-light font-sans text-slate-900 selection:bg-primary/20">
      {screen === 'landing' && <Navbar onNavigate={setScreen} />}
      
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {screen === 'landing' && <Footer />}
      <MusicPlayer />
    </div>
  );
}
