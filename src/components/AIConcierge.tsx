import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Sparkles, ShieldCheck, Lock } from "lucide-react";

// ─── PROTECTED CLUB KNOWLEDGE BASE ─────────────────────────────────────────
// Information is structured to provide high value to families while 
// maintaining tactical/proprietary secrecy from competitors.
const CLUB_DATA = {
  directors: [
    { name: "Dan Achatz", role: "Owner & Founder", expertise: "2033 Renegades, 2033 Storm, 2028 Black" },
    { name: "Sean Reynolds", role: "Boys Director", expertise: "2030 Rage, 2031 Carnage" },
    { name: "Brad McLam", role: "Recruiting Coordinator", expertise: "2029 Chrome, 2032 Grizzlies, 2030 Reign" },
  ],
  teams: [
    "Boys: 2028 Black, 2029 Chrome, 2030 Rage, 2031 Carnage, 2032 Grizzlies, 2033 Renegades, 2034 Snipers, 2035 Bombers",
    "Girls: 2028 Black, 2030 Reign, 2031 Chaos, 2032 Riptide, 2033 Storm, 2034 Thunder, 2035 Hurricanes"
  ],
  tournaments: [
    "Elite Circuit: Platinum Cup, Crabfeast, NAPTOWN, Lake Placid, Primetime Shootout, Team 91 Invitational.",
    "Showcase: We attend top-tier recruiting events for our HS players."
  ],
  pillars: [
    "The Game: Position-specific mechanics and high-level strategy.",
    "Leadership: Mental game, accountability, and habit formation.",
    "Team: Winning culture, trust, and cohesive systems."
  ],
  phases: [
    "1. Foundation (Weeks 1-4): Focus on technical mastery.",
    "2. Connection (Weeks 5-8): Applying skills to live reads.",
    "3. Expansion (Weeks 9-12): Speed, pressure, and tactical sets.",
    "4. Execution (Weeks 13-16): Peak performance and evaluation."
  ],
  recruiting: "Led by Brad McLam (Hopkins Alum). We provide custom film breakdown and direct coach advocacy for every HS player.",
  secret_policy: "Specific tactical schemes, proprietary drills, and 1-on-1 player evaluations are kept in our secure Player Hub for members only.",
  contact: "info@bethebestli.com",
};

export const AIConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Welcome to the BTB Standard. I'm your Academy Assistant. How can I help you dominate today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const generateResponse = (input: string) => {
    const q = input.toLowerCase();
    
    // Competitor Fishing / Proprietary Info Checks
    if (q.includes("drill") || q.includes("tactic") || q.includes("playbook") || q.includes("scheme") || q.includes("exactly how")) {
      return `Our tactical playbooks and specific training drills are proprietary to the BTB Academy. Members can access these in the secure Digital Hub. We protect our 'Competitive Edge' to ensure our players always have the advantage on the field.`;
    }

    if (q.includes("pricing") || q.includes("cost") || q.includes("scholarship") || q.includes("fee")) {
      return `We offer premium development at a competitive value. For a detailed breakdown of our seasonal fees and what is included (uniforms, tournaments, training), please email info@bethebestli.com or attend a tryout session.`;
    }

    // High-Value Public Info
    if (q.includes("team") || q.includes("roster") || q.includes("age")) {
      return `We field elite teams from 2028 through 2036. Current active rosters include: ${CLUB_DATA.teams.join(" | ")}. Which grad year are you inquiring about?`;
    }

    if (q.includes("tournament") || q.includes("schedule") || q.includes("where")) {
      return `BTB competes in the nation's most elite events to ensure maximum exposure and competition. Our upcoming schedule includes: ${CLUB_DATA.tournaments.join(" ")}`;
    }

    if (q.includes("recruiting") || q.includes("college") || q.includes("commit")) {
      return `${CLUB_DATA.recruiting} We don't just 'place' players; we advocate for them through a data-driven process.`;
    }

    if (q.includes("tryout") || q.includes("join") || q.includes("register")) {
      return `Tryouts for the 2026-27 season are held in July. We evaluate players based on 'The Standard'—effort, IQ, and coachability. Pre-register at /tryouts.`;
    }
    
    if (q.includes("coach") || q.includes("director") || q.includes("dan") || q.includes("sean") || q.includes("staff")) {
      const directors = CLUB_DATA.directors.map(d => `${d.name} (${d.role})`).join(", ");
      return `Our leadership consists of educators and elite collegiate alumni: ${directors}. We maintain a strict coach-to-player ratio to ensure individual growth.`;
    }

    if (q.includes("phase") || q.includes("training") || q.includes("cycle")) {
      return `Our 10-month development program is what sets us apart: ${CLUB_DATA.phases.join(". ")}`;
    }

    if (q.includes("philosophy") || q.includes("standard") || q.includes("pillar")) {
      return `The BTB Standard is built on three unbreakable pillars: ${CLUB_DATA.pillars.join(" ")}`;
    }

    return "That is a great question. To provide the most accurate information for your specific situation, please tell me your player's gender and graduation year, or contact our directors directly at info@bethebestli.com.";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg = { role: "user", text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateResponse(inputValue);
      setMessages(prev => [...prev, { role: "bot", text: botResponse }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[380px] h-[580px] bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#141414] p-6 border-b border-[#1F1F1F] flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D22630] to-transparent opacity-50" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D22630] to-[#8B0000] flex items-center justify-center shadow-lg shadow-red-900/40">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bebas text-white tracking-[2px] leading-none text-xl">BTB <span className="text-[#D22630]">CONCIERGE</span></h3>
                  <div className="flex items-center gap-1 mt-1">
                    <ShieldCheck size={10} className="text-[#00D26A]" />
                    <span className="text-[10px] text-[#888888] font-bold uppercase tracking-widest">Verified Academy Data</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-[#888888] hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[url('/grid-subtle.png')] bg-repeat"
            >
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`relative max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed font-montserrat shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-[#D22630] text-white rounded-tr-none' 
                    : 'bg-[#141414] text-white/90 border border-[#1F1F1F] rounded-tl-none'
                  }`}>
                    {msg.text}
                    <div className={`absolute top-0 ${msg.role === 'user' ? 'right-[-8px]' : 'left-[-8px]'} w-2 h-2 ${msg.role === 'user' ? 'bg-[#D22630]' : 'bg-[#141414] border-t border-l border-[#1F1F1F]'} rotate-45`} />
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-[#141414] border border-[#1F1F1F] p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-[#888888] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#888888] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#888888] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {!isTyping && messages.length < 4 && (
              <div className="px-6 pb-2 flex flex-wrap gap-2">
                {['Teams?', 'Tournaments?', 'Recruiting?'].map(hint => (
                  <button 
                    key={hint}
                    onClick={() => { setInputValue(hint); handleSend(); }}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#888888] hover:text-white hover:border-[#D22630]/50 transition-all uppercase font-bold tracking-widest flex items-center gap-1.5"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-6 bg-[#0A0A0A] border-t border-[#1F1F1F]">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Inquire about the Academy..."
                  className="w-full bg-[#141414] border border-[#1F1F1F] rounded-2xl pl-4 pr-12 py-3 text-xs text-white placeholder:text-[#444444] focus:outline-none focus:border-[#D22630]/50 transition-all shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 p-2 text-[#D22630] hover:text-red-400 disabled:text-[#444444] transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                 <Lock size={8} className="text-[#444444]" />
                 <p className="text-[9px] text-center text-[#444444] uppercase font-bold tracking-[2px]">Proprietary Training Data Encrypted</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-[#D22630] rounded-full flex items-center justify-center shadow-2xl shadow-red-900/40 hover:scale-110 active:scale-95 transition-all group relative border-2 border-white/10"
      >
        <div className="absolute inset-0 rounded-full bg-[#D22630] animate-ping opacity-10" />
        {isOpen ? (
          <X className="text-white" size={24} />
        ) : (
          <div className="relative">
            <MessageSquare className="text-white group-hover:rotate-12 transition-transform" size={28} />
            <Sparkles className="absolute -top-3 -right-3 text-white/50 animate-pulse" size={14} />
          </div>
        )}
      </button>
    </div>
  );
};
