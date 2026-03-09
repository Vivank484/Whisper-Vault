import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Send, Heart, ThumbsDown, Share2, Mail, Key, ArrowRight, UserCircle, Sun, Moon, Flame, Clock, MessageSquare, Shield, Eye, EyeOff, Home, Info, BookText, LogOut, Sparkles, Trash2, Bot, AlertTriangle, XCircle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOODS = ['Confession', 'Vent', 'Regret', 'Hope', 'Funny'];

const MOOD_THEMES = {
  Confession: { gradient: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-500/25', glow: 'bg-purple-500/20', badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  Vent: { gradient: 'from-red-600 to-orange-500', shadow: 'shadow-red-500/25', glow: 'bg-red-500/20', badge: 'text-red-400 bg-red-500/10 border-red-500/20' },
  Regret: { gradient: 'from-blue-600 to-cyan-500', shadow: 'shadow-blue-500/25', glow: 'bg-blue-500/20', badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  Hope: { gradient: 'from-amber-500 to-yellow-500', shadow: 'shadow-amber-500/25', glow: 'bg-amber-500/20', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  Funny: { gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/25', glow: 'bg-pink-500/20', badge: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
};

const AnimatedKeeperIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginRight: '8px' }}
  >
    <style>
      {`
        @keyframes keeperFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes visorPulse {
          0%, 100% { filter: drop-shadow(0 0 4px #d8b4fe) brightness(1); }
          50% { filter: drop-shadow(0 0 12px #d8b4fe) brightness(1.3); }
        }
        @keyframes scanLine {
          0% { transform: translateX(25px); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(65px); opacity: 0; }
        }
        .head-group { animation: keeperFloat 4s ease-in-out infinite; }
        .visor-glow { animation: visorPulse 2s infinite; }
        .scanner-light { animation: scanLine 2.5s linear infinite; }
      `}
    </style>
    
    <g className="head-group">
      {/* Cybernetic Helmet Base */}
      <path d="M50 15 C 20 15, 18 45, 18 65 C 18 85, 35 95, 50 95 C 65 95, 82 85, 82 65 C 82 45, 80 15, 50 15 Z" fill="#18112b" stroke="#d8b4fe" strokeWidth="4" strokeLinejoin="round"/>
      
      {/* Cybernetic Jaw / Cheek detailing */}
      <path d="M 30 90 L 50 80 L 70 90" stroke="#d8b4fe" strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M 35 70 L 65 70" stroke="#d8b4fe" strokeWidth="2" fill="none" opacity="0.4" />

      {/* Side Ear Nodes */}
      <rect x="12" y="55" width="6" height="20" rx="3" fill="#d8b4fe" />
      <rect x="82" y="55" width="6" height="20" rx="3" fill="#d8b4fe" />

      {/* The Glowing Visor Slot */}
      <rect x="25" y="45" width="50" height="14" rx="7" fill="#3b0764" />
      <rect x="25" y="45" width="50" height="14" rx="7" fill="#a855f7" className="visor-glow" opacity="0.8" />
      
      {/* Moving Scanner Light (The "Eye") */}
      <ellipse cy="52" rx="4" ry="5" fill="#ffffff" className="scanner-light" filter="drop-shadow(0 0 2px white)" />
    </g>
  </svg>
);

const timeAgo = (dateString) => {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "Just now";
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('vault_token'));
  const [userId, setUserId] = useState(localStorage.getItem('vault_userId'));
  const [view, setView] = useState(token ? 'feed' : 'landing'); 
  
  const [authModal, setAuthModal] = useState(null); 
  const [analyzeModal, setAnalyzeModal] = useState(null); 
  const [toxicAlert, setToxicAlert] = useState(false); 
  const [errorModal, setErrorModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  
  const [secrets, setSecrets] = useState([]);
  const [newSecret, setNewSecret] = useState("");
  const [activeMood, setActiveMood] = useState('Confession');
  const [isAnalyzing, setIsAnalyzing] = useState(false); 
  const [animatingId, setAnimatingId] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 🔥 NEW: Mobile menu state
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('global');
  const [sortBy, setSortBy] = useState('newest');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

// 1. Add this state to track what the user is typing
const [searchQuery, setSearchQuery] = useState('');

// 2. Create the filtered array with safety checks so old data doesn't crash it
const filteredSecrets = (secrets || []).filter(s => {
  // If a secret somehow has no content, skip it safely
  if (!s || !s.content) return false; 
  
  // Check if the secret's content includes the search word (case-insensitive)
  return s.content.toLowerCase().includes(searchQuery.toLowerCase());
});

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => { 
    if (view === 'feed') fetchSecrets(); 
  }, [view, activeTab, sortBy]);

  const fetchSecrets = async () => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === 'vault' ? '/secrets/me' : '/secrets';
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}; 
      const res = await fetch(`${API_URL}${endpoint}`, { headers });
      let data = await res.json();
      if (sortBy === 'popular') data = data.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      setSecrets(data);
    } catch (e) { 
      console.error("API Offline"); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e, type) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setErrorModal("Please enter a valid email address.");
    if (password.length < 6 && type === 'signup') return setErrorModal("Your password must be at least 6 characters long.");

    if (type === 'signup' && awaitingOtp) {
      try {
        const res = await fetch(`${API_URL}/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: otpCode })
        });
        const data = await res.json();
        
        if (res.ok) {
          localStorage.setItem('vault_token', data.token);
          localStorage.setItem('vault_userId', data.userId);
          setToken(data.token); setUserId(data.userId);
          setEmail(""); setPassword(""); setOtpCode(""); setAwaitingOtp(false); setAuthModal(null); setShowPassword(false); setView('feed');
        } else setErrorModal(data.error);
      } catch (e) { setErrorModal("Connection failed."); }
      return;
    }

    const endpoint = type === 'login' ? 'login' : 'register';
    try {
      const res = await fetch(`${API_URL}/auth/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      
      if (res.ok) {
        if (data.requireOtp) {
          setAwaitingOtp(true);
        } else {
          localStorage.setItem('vault_token', data.token);
          localStorage.setItem('vault_userId', data.userId);
          setToken(data.token); setUserId(data.userId);
          setEmail(""); setPassword(""); setAuthModal(null); setShowPassword(false); setView('feed');
        }
      } else setErrorModal(data.error); 
    } catch (error) { setErrorModal("Could not connect to the server."); }
  };

  const logout = () => {
    localStorage.removeItem('vault_token'); localStorage.removeItem('vault_userId');
    setToken(null); setUserId(null); setView('landing'); setActiveTab('global');
  };

  const handleWhisperClick = async () => {
    if (!newSecret.trim()) return;
    setIsAnalyzing(true);
    
    try {
      const res = await fetch(`${API_URL}/secrets/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newSecret, mood: activeMood })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Backend failed");

      if (data.toxic) {
        setToxicAlert(true);
        setIsAnalyzing(false);
        return;
      }

      if (!data.match) {
        setAnalyzeModal({ content: newSecret, originalMood: activeMood, suggestedMood: data.suggestedMood });
        setIsAnalyzing(false);
        return;
      }

      finalizeSecret(activeMood);
      
    } catch (e) { 
      console.error("Shield Error:", e);
      setErrorModal("The Vault Keeper is currently struggling to analyze this message. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const finalizeSecret = async (finalMood) => {
    await fetch(`${API_URL}/secrets`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ content: newSecret, mood: finalMood }) });
    setNewSecret(""); setAnalyzeModal(null); setIsAnalyzing(false); 
    fetchSecrets();
  };

  const requestDelete = (id, type) => setDeleteModal({ id, type });

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      const endpoint = deleteModal.type === 'secret' ? `/secrets/${deleteModal.id}` : `/replies/${deleteModal.id}`;
      await fetch(`${API_URL}${endpoint}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      setDeleteModal(null); fetchSecrets();
    } catch (e) { console.error("Delete failed"); }
  };

  const handleReaction = async (secretId, type) => {
    if (!token) return setAuthModal('login');
    setAnimatingId({ id: secretId, type }); setTimeout(() => setAnimatingId(null), 500);

    setSecrets(currentSecrets => currentSecrets.map(secret => {
      if (secret.id === secretId) {
        const isRemoving = secret.userReaction === type;
        const isSwitching = secret.userReaction && secret.userReaction !== type;
        let newLikes = secret.likes, newDislikes = secret.dislikes;
        
        if (isRemoving) { type === 'like' ? newLikes-- : newDislikes--; } 
        else {
          type === 'like' ? newLikes++ : newDislikes++;
          if (isSwitching) { secret.userReaction === 'like' ? newLikes-- : newDislikes--; }
        }
        return { ...secret, likes: newLikes, dislikes: newDislikes, userReaction: isRemoving ? null : type };
      }
      return secret;
    }));

    try {
      await fetch(`${API_URL}/secrets/${secretId}/react`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ type }) });
      fetchSecrets(); 
    } catch (e) {}
  };

  const postReply = async (secretId) => {
    if (!replyText.trim() || !token) return;
    await fetch(`${API_URL}/secrets/${secretId}/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ content: replyText }) });
    setReplyText(""); setReplyingTo(null); fetchSecrets();
  };

  const askKeeper = async (secretId) => {
    if (!token) return setAuthModal('login');
    setReplyingTo(null); 
    await fetch(`${API_URL}/secrets/${secretId}/ask-keeper`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    fetchSecrets(); 
  };

  const theme = {
    bg: isDarkMode ? 'bg-[#06020a]' : 'bg-[#f4f0fa]',
    sidebar: isDarkMode ? 'bg-[#1a0b2e]/95 md:bg-[#1a0b2e]/20 backdrop-blur-3xl border-purple-500/30 shadow-[4px_0_24px_rgba(0,0,0,0.5)]' : 'bg-[#f4f0fa]/95 md:bg-[#a78bfa]/15 backdrop-blur-3xl border-white/60 shadow-[4px_0_24px_rgba(168,85,247,0.15)]',
    header: isDarkMode ? 'bg-[#1a0b2e]/20 backdrop-blur-3xl border-b border-purple-500/30 shadow-[0_4px_24px_rgba(0,0,0,0.5)]' : 'bg-[#a78bfa]/15 backdrop-blur-3xl border-b border-white/60 shadow-[0_4px_24px_rgba(168,85,247,0.15)]',
    text: isDarkMode ? 'text-gray-100' : 'text-slate-800',
    card: isDarkMode ? 'bg-[#0f051c]/30 backdrop-blur-2xl border border-purple-500/20 shadow-xl shadow-black/50 hover:border-purple-400/50' : 'bg-white/30 backdrop-blur-2xl border border-white/80 shadow-xl shadow-purple-900/5 hover:border-white hover:shadow-2xl',
    input: isDarkMode ? 'text-gray-100 placeholder-gray-500 bg-[#05020a]/30 backdrop-blur-xl border border-purple-500/30' : 'text-slate-800 placeholder-slate-400 bg-white/40 backdrop-blur-xl border border-white/80',
    muted: isDarkMode ? 'text-purple-200/50' : 'text-slate-500',
    hover: isDarkMode ? 'hover:bg-purple-500/10 hover:text-purple-300' : 'hover:bg-purple-200/40 hover:text-purple-700',
    activeNav: isDarkMode ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-white/50 text-purple-700 border border-white/80 shadow-[0_4px_15px_rgba(168,85,247,0.1)]',
    inactiveNav: isDarkMode ? 'text-purple-200/60 border border-transparent' : 'text-slate-600 border border-transparent',
  };

  const activeStyle = MOOD_THEMES[activeMood];

  // 🔥 NEW: Closes the mobile menu when a navigation item is clicked
  const NavItem = ({ icon: Icon, label, isActive, onClick }) => (
    <button onClick={() => { onClick(); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${isActive ? theme.activeNav : `${theme.inactiveNav} ${theme.hover}`}`}>
      <Icon size={18} className={isActive ? 'text-purple-500' : ''} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans transition-colors duration-500 relative overflow-hidden selection:bg-purple-500/30`}>
      
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-400/30'}`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] ${isDarkMode ? 'bg-pink-900/20' : 'bg-pink-400/20'}`} />
      </div>

      <AnimatePresence>
        {deleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-[80]">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0f051c] p-8 rounded-3xl border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)] max-w-sm w-full text-center text-white">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <h2 className="text-xl font-bold mb-2">Delete Forever?</h2>
              <p className="text-gray-400 text-sm mb-6">This action cannot be undone. This {deleteModal.type} will be permanently removed from the Vault.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal(null)} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-medium text-sm transition-colors border border-white/10">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 bg-red-600/90 hover:bg-red-500 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-500/25 border border-red-400/50">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-[70]">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0f051c] p-8 rounded-3xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] max-w-sm w-full text-center text-white relative">
              <button onClick={() => setErrorModal(null)} className="absolute top-4 right-6 text-gray-500 hover:text-white text-2xl font-bold">&times;</button>
              {errorModal.includes("Rules") || errorModal.includes("Keeper") || errorModal.includes("sanctuary") ? <Info className="w-12 h-12 text-purple-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" /> : <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />}
              <h2 className="text-xl font-bold mb-2">Notice</h2>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">{errorModal}</p>
              <button onClick={() => setErrorModal(null)} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-bold transition-colors">Understood</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toxicAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-[80]">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0f051c] p-8 rounded-3xl border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)] max-w-sm w-full text-center text-white">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <h2 className="text-xl font-bold mb-2">Whisper Rejected</h2>
              <p className="text-gray-400 text-sm mb-6">The Vault Shield detected severe toxicity or dangerous content. This space is for healing, not harm.</p>
              <button onClick={() => setToxicAlert(false)} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-bold transition-colors">Understood</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {analyzeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-[80]">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0f051c] p-8 rounded-3xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] max-w-md w-full text-white">
              <Bot className="w-10 h-10 text-purple-400 mb-4 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              <h2 className="text-xl font-bold mb-2">Wait, is this a {analyzeModal.suggestedMood}?</h2>
              <p className="text-gray-400 text-sm mb-6">You tagged this as <b className="text-purple-300">{analyzeModal.originalMood}</b>, but the Vault Keeper thinks it reads more like <b className="text-purple-300">{analyzeModal.suggestedMood}</b>.</p>
              <div className="flex gap-3">
                <button onClick={() => finalizeSecret(analyzeModal.originalMood)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-medium text-sm transition-colors">Keep My Tag</button>
                <button onClick={() => finalizeSecret(analyzeModal.suggestedMood)} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] py-3 rounded-xl font-bold text-sm transition-transform shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-purple-400/50">Use Suggestion</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {authModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#0f051c]/80 backdrop-blur-2xl p-8 rounded-3xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] max-w-md w-full relative text-white">
              <button onClick={() => { setAuthModal(null); setShowPassword(false); setAwaitingOtp(false); }} className="absolute top-4 right-6 text-gray-500 hover:text-white text-2xl font-bold">&times;</button>
              <div className="flex justify-center mb-6">
                {authModal === 'login' ? <Unlock className="w-10 h-10 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" /> : <Lock className="w-10 h-10 text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-center">{authModal === 'login' ? "Unlock Your Vault" : "Create Your Vault"}</h2>
              
              <form onSubmit={(e) => handleAuth(e, authModal)} noValidate className="space-y-4 mt-6">
                {!awaitingOtp ? (
                  <>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5" />
                      <input type="email" required placeholder="Secret Email" className="w-full bg-black/40 py-3 pl-12 pr-4 rounded-xl border border-purple-900/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5" />
                      <input type={showPassword ? "text" : "password"} required placeholder="Password" className="w-full bg-black/40 py-3 pl-12 pr-12 rounded-xl border border-purple-900/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors" value={password} onChange={e => setPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative text-center">
                    <p className="text-sm text-gray-400 mb-4">We sent a 6-digit code to <b className="text-white break-all">{email}</b></p>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5" />
                      <input type="text" maxLength="6" required placeholder="000000" className="w-full bg-black/40 py-3 pl-12 pr-4 rounded-xl border border-purple-900/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-center tracking-[0.5em] text-xl font-mono" value={otpCode} onChange={e => setOtpCode(e.target.value)} />
                    </div>
                    <button type="button" onClick={() => setAwaitingOtp(false)} className="mt-4 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
                      Typo in your email? Go back
                    </button>
                  </motion.div>
                )}
                <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] transition-transform py-4 rounded-xl font-bold shadow-lg shadow-purple-500/25 mt-2 border border-purple-400/50">
                  {authModal === 'login' ? "Enter Vault" : (awaitingOtp ? "Verify & Enter" : "Establish Identity")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        
        {view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-screen w-full p-6 relative overflow-y-auto z-10">
            <div className="z-10 text-center max-w-md w-full">
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)] mb-8 border border-purple-400/50"><Lock className="w-12 h-12 text-white" /></motion.div>
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={`text-5xl font-black tracking-tighter mb-4 ${isDarkMode ? 'text-white' : 'text-purple-950'}`}>WHISPER VAULT</motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className={`${theme.muted} mb-12 text-lg`}>An anonymous, encrypted space to unburden your mind.</motion.p>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-4">
                <button onClick={() => setAuthModal('signup')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl shadow-purple-500/20 border border-purple-400/50 flex items-center justify-center gap-2"><Lock size={20} /> Create New Vault</button>
                <button onClick={() => setAuthModal('login')} className={`w-full ${isDarkMode ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-white/60 text-purple-900 border-purple-200 hover:bg-white'} backdrop-blur-md py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2`}><Unlock size={20} /> Unlock Vault</button>
                <button onClick={() => setView('feed')} className={`mt-6 w-full flex items-center justify-center gap-2 text-sm font-semibold tracking-widest uppercase ${theme.muted} hover:text-purple-400 transition-colors group`}><UserCircle size={18} /> Continue as Guest <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {view === 'feed' && (
          <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-screen w-full relative z-10">
            
            {/* 🔥 NEW: Mobile Menu Dark Overlay */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden" 
                />
              )}
            </AnimatePresence>

            {/* 🔥 NEW: Sidebar now transforms into a slide-out drawer on mobile! */}
            <aside className={`${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-[100] flex w-[280px] shadow-2xl shadow-black' : 'hidden md:flex'} flex-col shrink-0 border-r ${theme.sidebar} p-6 overflow-y-auto transition-all duration-300`}>
              <div className="flex items-center justify-between mb-10 px-2 relative z-10">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => !token && setView('landing')}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/50"><Lock className="w-5 h-5 text-white" /></div>
                  <h1 className={`text-xl font-black tracking-tighter ${isDarkMode ? 'text-gray-100' : 'text-purple-950'}`}>WHISPER VAULT</h1>
                </div>
                {/* 🔥 NEW: Close button for mobile menu */}
                <button onClick={() => setIsMobileMenuOpen(false)} className={`md:hidden p-1 rounded-full ${theme.muted} ${theme.hover}`}>
                  <X size={24}/>
                </button>
              </div>
              
              <div className="space-y-1 mb-8 relative z-10">
                <span className={`text-xs font-bold uppercase tracking-widest px-4 mb-3 block ${theme.muted}`}>Discover</span>
                <NavItem icon={Home} label="Global Feed" isActive={activeTab === 'global'} onClick={() => setActiveTab('global')} />
                {token && <NavItem icon={Shield} label="My Vault" isActive={activeTab === 'vault'} onClick={() => setActiveTab('vault')} />}
              </div>
              
              {activeTab === 'global' && (
                <div className="space-y-1 mb-8 relative z-10">
                  <span className={`text-xs font-bold uppercase tracking-widest px-4 mb-3 block ${theme.muted}`}>Filter By</span>
                  <NavItem icon={Clock} label="Newest First" isActive={sortBy === 'newest'} onClick={() => setSortBy('newest')} />
                  <NavItem icon={Flame} label="Most Popular" isActive={sortBy === 'popular'} onClick={() => setSortBy('popular')} />
                </div>
              )}

              <div className="space-y-1 mb-8 relative z-10">
                <span className={`text-xs font-bold uppercase tracking-widest px-4 mb-3 block ${theme.muted}`}>Information</span>
                <NavItem icon={Info} label="About This Site" isActive={false} onClick={() => setErrorModal("Whisper Vault is an anonymous, AI-moderated sanctuary. Share your burdens, find solidarity, and let the Vault Keeper guide you. No tracking, no judgment.")} />
                <NavItem icon={BookText} label="Vault Rules" isActive={false} onClick={() => setErrorModal("1. Stay Anonymous. 2. Be honest. 3. Zero tolerance for bullying or illegal content. The AI Shield is always watching.")} />
                <NavItem icon={Bot} label="The Vault Keeper" isActive={false} onClick={() => setErrorModal("The Vault Keeper is an empathetic AI Guardian. It moderates content and can be summoned to offer support on any secret.")} />
              </div>

              <div className={`pt-6 mt-auto border-t ${isDarkMode ? 'border-purple-500/20' : 'border-purple-300/30'} space-y-2 relative z-10`}>
                <NavItem icon={isDarkMode ? Sun : Moon} label={isDarkMode ? "Light Mode" : "Dark Mode"} isActive={false} onClick={() => setIsDarkMode(!isDarkMode)} />
                {token ? <NavItem icon={LogOut} label="Lock Vault" isActive={false} onClick={logout} /> : <button onClick={() => { setAuthModal('login'); setIsMobileMenuOpen(false); }} className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-[1.02] transition-transform border border-purple-400/50">Establish Identity</button>}
              </div>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent relative z-10">
              
              <header className={`w-full px-6 md:px-10 py-5 border-b z-40 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-500 ${theme.header}`}>
                
                {/* 🔥 NEW: Mobile Hamburger Button injected into the Header */}
                <div className="flex justify-between items-center w-full sm:w-auto">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight drop-shadow-md">{activeTab === 'global' ? 'Global Feed' : 'Your Private Vault'}</h2>
                    <p className={`mt-1 text-sm font-medium ${theme.muted}`}>{activeTab === 'global' ? 'Read what the world is hiding.' : 'Your permanently encrypted secrets.'}</p>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(true)} className={`md:hidden p-2 rounded-xl border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-purple-400 hover:bg-white/10' : 'bg-purple-900/5 border-purple-900/10 text-purple-700 hover:bg-purple-900/10'}`}>
                    <Menu size={24} />
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border ${isDarkMode ? 'bg-purple-900/20 border-purple-500/30 text-purple-300' : 'bg-white/50 backdrop-blur-md border-white/80 text-purple-700 shadow-sm'} text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.15)]`}>
                    <Lock size={14} className={isDarkMode ? "text-purple-400" : "text-purple-500"} /> Secure
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
                <div className="max-w-5xl mx-auto pb-20">
                  
                  {token && activeTab === 'global' && (
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`max-w-3xl mb-12 p-6 rounded-3xl border ${theme.card} relative overflow-hidden group transition-colors`}>
                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 ${activeStyle.glow} blur-[60px] pointer-events-none rounded-full transition-colors duration-500`} />
                      
                      <textarea 
                        maxLength={300}
                        className={`w-full focus:ring-0 text-xl resize-none h-24 outline-none relative z-10 px-4 py-3 rounded-2xl ${theme.input} transition-colors`} 
                        placeholder="What's weighing on your mind?" 
                        value={newSecret} 
                        onChange={(e) => setNewSecret(e.target.value)} 
                      />
                      
                      <div className={`text-xs text-right mt-1 px-4 font-mono ${newSecret.length >= 280 ? 'text-red-400' : theme.muted}`}>
                        {newSecret.length}/300
                      </div>

                      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 pt-4 border-t ${isDarkMode ? 'border-purple-500/20' : 'border-white/50'} gap-4 relative z-10`}>
                        <div className="flex flex-wrap gap-2">
                          {MOODS.map(mood => (
                            <button key={mood} onClick={() => setActiveMood(mood)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${activeMood === mood ? `bg-gradient-to-r text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] border-purple-400/50 ${MOOD_THEMES[mood].gradient}` : `${isDarkMode ? 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10' : 'bg-white/50 text-purple-800 border-white/80 hover:bg-white/80'}`}`}>{mood}</button>
                          ))}
                        </div>
                        
                        <button onClick={handleWhisperClick} disabled={!newSecret.trim() || isAnalyzing} className={`flex w-full sm:w-auto items-center justify-center gap-2 bg-gradient-to-r ${activeStyle.gradient} shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-purple-400/50 disabled:opacity-50 text-white px-6 py-2.5 rounded-full font-bold hover:scale-105 transition-all duration-300`}>
                          {isAnalyzing ? <span className="animate-pulse">Analyzing...</span> : <><Send size={16} /> Whisper</>}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {!isLoading && (
  <div className="w-full max-w-3xl mx-auto mb-10">
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <svg className="text-purple-400 opacity-70" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search the vault for keywords..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-white/5 border border-purple-500/20 rounded-xl py-3.5 pl-12 pr-4 text-purple-100 placeholder-purple-300/40 focus:outline-none focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/50 transition-all shadow-lg backdrop-blur-sm"
      />
    </div>

    {/* THE EMPTY STATE SITS RIGHT UNDER THE SEARCH BAR */}
    {searchQuery !== '' && filteredSecrets.length === 0 && (
      <div className="w-full mt-6 text-center py-16 px-6 bg-white/5 border border-purple-500/20 rounded-2xl backdrop-blur-sm">
        <svg className="mx-auto h-14 w-14 text-purple-400/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <p className="text-purple-300 text-lg font-medium">No secrets found matching "{searchQuery}"</p>
        <button onClick={() => setSearchQuery('')} className="mt-4 px-6 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-lg text-sm font-bold text-purple-300 uppercase tracking-widest transition-all">
          Clear Search
        </button>
      </div>
    )}
  </div>
)}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    
                    {isLoading ? (
                      [...Array(6)].map((_, i) => (
                        <div key={`skeleton-${i}`} className={`p-7 rounded-3xl border h-48 animate-pulse ${isDarkMode ? 'bg-[#0f051c]/50 border-purple-500/10' : 'bg-white/40 border-white/40'}`}>
                          <div className="flex justify-between mb-6">
                            <div className="flex gap-3 items-center">
                              <div className={`w-9 h-9 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-purple-900/10'}`}></div>
                              <div className={`w-24 h-3 rounded ${isDarkMode ? 'bg-white/5' : 'bg-purple-900/10'}`}></div>
                            </div>
                            <div className={`w-16 h-5 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-purple-900/10'}`}></div>
                          </div>
                          <div className={`w-full h-3 rounded mb-3 ${isDarkMode ? 'bg-white/5' : 'bg-purple-900/10'}`}></div>
                          <div className={`w-3/4 h-3 rounded mb-3 ${isDarkMode ? 'bg-white/5' : 'bg-purple-900/10'}`}></div>
                          <div className={`w-1/2 h-3 rounded ${isDarkMode ? 'bg-white/5' : 'bg-purple-900/10'}`}></div>
                        </div>
                      ))
                    ) : (          

                      <AnimatePresence>
                        {filteredSecrets.map((s) => {
                          const sTheme = MOOD_THEMES[s.mood] || MOOD_THEMES['Confession'];
                          return (
                            <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} key={s.id} className={`p-7 rounded-3xl border h-fit ${theme.card} transition-all duration-300`}>
                              
                              <div className="flex justify-between items-start mb-5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[11px] shadow-inner ${isDarkMode ? 'bg-[#1a0b2e]/50 text-purple-200 border border-purple-500/20' : 'bg-white/60 text-purple-700 border border-white/80'}`}>
                                    #{s.id}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className={`text-xs font-mono uppercase tracking-widest ${theme.muted}`}>{s.mask}</span>
                                    <span className={`text-[10px] ${isDarkMode ? 'text-purple-300/40' : 'text-slate-400'} font-medium mt-0.5 flex items-center gap-1`}>
                                      <Clock size={10} /> {timeAgo(s.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                  {String(s.authorId) === String(userId) && (
                                    <button onClick={() => requestDelete(s.id, 'secret')} className="text-gray-500 hover:text-red-400 transition-colors p-1"><Trash2 size={14} /></button>
                                  )}
                                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${sTheme.badge} shadow-sm backdrop-blur-md`}>{s.mood}</span>
                                </div>
                              </div>

                              <p className="text-[18px] font-light leading-relaxed mb-6 break-words tracking-wide">"{s.content}"</p>

                              <div className={`flex items-center gap-6 pt-4 border-t ${isDarkMode ? 'border-purple-500/20' : 'border-white/50'}`}>
                                
                                <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleReaction(s.id, 'like')} className={`flex items-center gap-1.5 transition-colors ${theme.muted} hover:text-pink-400`}>
                                  <motion.div animate={animatingId?.id === s.id && animatingId?.type === 'like' ? { scale: [1, 1.5, 1], rotate: [0, -15, 15, 0] } : {}} transition={{ duration: 0.4 }}>
                                    <Heart size={18} className={s.userReaction === 'like' ? "fill-pink-500 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" : ""} />
                                  </motion.div>
                                  <span className="text-xs font-bold">{s.likes > 0 ? s.likes : 'Me too'}</span>
                                </motion.button>

                                <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleReaction(s.id, 'dislike')} className={`flex items-center gap-1.5 transition-colors ${theme.muted} hover:text-blue-400`}>
                                  <motion.div animate={animatingId?.id === s.id && animatingId?.type === 'dislike' ? { scale: [1, 1.5, 1], y: [0, 5, -5, 0] } : {}} transition={{ duration: 0.4 }}>
                                    <ThumbsDown size={18} className={s.userReaction === 'dislike' ? "fill-blue-500 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""} />
                                  </motion.div>
                                  <span className="text-xs font-bold">{s.dislikes > 0 ? s.dislikes : 'Yikes'}</span>
                                </motion.button>

                                <button onClick={() => { if(token) setReplyingTo(replyingTo === s.id ? null : s.id); else setAuthModal('login'); }} className={`flex items-center gap-1.5 transition-colors ${theme.muted} hover:text-purple-400`}>
                                  <MessageSquare size={18} />
                                  <span className="text-xs font-bold">{s.replies?.length > 0 ? `${s.replies.length} Replies` : 'Reply'}</span>
                                </button>
                              </div>

                              {s.replies?.length > 0 && (
                                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-purple-500/20' : 'border-white/50'} space-y-3`}>
                                  {s.replies.map(reply => (
                                    <div key={reply.id} className="text-sm flex justify-between group">
                                      <div className="flex gap-2">
                                        <span className="font-bold flex items-center gap-1">
                                          {reply.authorId === null ? <><AnimatedKeeperIcon /> <span className="text-purple-400">Keeper:</span></> : <span className={theme.muted}>Anon:</span>}
                                        </span>
                                        <span className={isDarkMode ? "text-purple-200/80" : "text-slate-700"}>{reply.content}</span>
                                      </div>
                                      {String(reply.authorId) === String(userId) && (
                                         <button onClick={() => requestDelete(reply.id, 'reply')} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <AnimatePresence>
                                {replyingTo === s.id && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 pt-4">
                                    <div className="flex gap-2 mb-2 w-full">
                                      <input autoFocus type="text" placeholder="Add an anonymous reply..." value={replyText} onChange={e => setReplyText(e.target.value)} className={`flex-1 min-w-0 px-4 py-2 rounded-full outline-none text-sm ${theme.input} focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all`} />
                                      <button onClick={() => postReply(s.id)} disabled={!replyText.trim()} className="shrink-0 px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold disabled:opacity-50 shadow-[0_0_10px_rgba(168,85,247,0.3)]">Post</button>
                                    </div>
                                    <button onClick={() => askKeeper(s.id)} className={`w-full mt-2 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${isDarkMode ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30' : 'bg-white/50 text-purple-700 hover:bg-white/80 border border-white/80'}`}>
                                 <AnimatedKeeperIcon /> Ask Vault Keeper to reply
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>                   
                    )}
                  </div>
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}