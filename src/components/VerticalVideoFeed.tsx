import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { films } from "@/lib/filmData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, ChevronUp, ChevronDown, Share2, ExternalLink } from "lucide-react";

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

interface VideoCardProps {
  film: typeof films[0];
  isActive: boolean;
  shouldRenderPlayer: boolean;
}

const VideoCard = ({ film, isActive, shouldRenderPlayer }: VideoCardProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoId = getYoutubeId(film.videoUrl);
  const origin = typeof window !== "undefined" ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
  const thumbnail = film.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "");

  return (
    <div className="relative h-screen w-full bg-black flex items-center justify-center overflow-hidden snap-start">
      <div className="absolute inset-0 z-0">
        {videoId && shouldRenderPlayer ? (
          <iframe
            className="w-full h-full scale-[1.5]"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${isActive ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=1&playsinline=1&loop=1&playlist=${videoId}&modestbranding=1&rel=0${origin}`}
            title={film.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading={isActive ? "eager" : "lazy"}
          />
        ) : (
          <div className="h-full w-full bg-neutral-950">
            {thumbnail && (
              <img
                src={thumbnail}
                alt=""
                className="h-full w-full scale-[1.5] object-cover opacity-55 blur-[1px]"
                loading="lazy"
              />
            )}
          </div>
        )}
        {/* Dark overlay for text readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      </div>

      {/* UI Overlays */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end p-6 pb-24 md:pb-12 max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Badge className="bg-[var(--btb-red)] text-white border-none font-bebas uppercase tracking-wider">
              {film.category}
            </Badge>
            <Badge variant="outline" className="text-white/70 border-white/20 uppercase text-[10px]">
              {film.level}
            </Badge>
          </div>

          <div>
            <h2 className="text-4xl font-bebas text-white uppercase leading-tight tracking-tight">
              {film.title}
            </h2>
            <p className="text-white/80 font-montserrat text-sm line-clamp-2 mt-2 leading-relaxed">
              {film.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {film.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] font-mono text-[var(--btb-red)] uppercase">
                #{tag.replace(/\s+/g, '')}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Action Bar */}
      <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center gap-6">
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-[var(--btb-red)] transition-colors">
            <Share2 size={20} className="text-white" />
          </div>
          <span className="text-[10px] text-white/70 uppercase font-bebas tracking-tighter">Share</span>
        </button>

        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
            {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
          </div>
          <span className="text-[10px] text-white/70 uppercase font-bebas tracking-tighter">{isMuted ? 'Muted' : 'Audio'}</span>
        </button>

        <a
          href={film.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 group"
          aria-label={`Open ${film.title} on YouTube`}
        >
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
            <ExternalLink size={20} className="text-white" />
          </div>
          <span className="text-[10px] text-white/70 uppercase font-bebas tracking-tighter">YouTube</span>
        </a>

        <div className="w-12 h-12 rounded-full border-2 border-[var(--btb-red)] p-1 overflow-hidden animate-spin-slow">
           <img src="/logo-icon.png" alt="BTB" className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  );
};

export const VerticalVideoFeed = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="absolute top-0 inset-x-0 z-30 p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-white font-bebas text-2xl tracking-widest uppercase italic">BTB <span className="text-[var(--btb-red)]">REELS</span></span>
        </div>
        <Button 
          variant="ghost" 
          className="text-white font-bebas uppercase tracking-widest hover:bg-white/10"
          onClick={() => window.history.back()}
        >
          Close
        </Button>
      </div>

      {/* Main Snap Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {films.map((film, index) => (
          <VideoCard 
            key={film.id} 
            film={film} 
            isActive={index === activeIndex} 
            shouldRenderPlayer={Math.abs(index - activeIndex) <= 1}
          />
        ))}
      </div>

      {/* Navigation Arrows (Desktop) */}
      <div className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-4 z-30">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-black/40 border-white/20 text-white hover:bg-[var(--btb-red)]"
          onClick={() => containerRef.current?.scrollBy({ top: -window.innerHeight, behavior: 'smooth' })}
        >
          <ChevronUp />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-black/40 border-white/20 text-white hover:bg-[var(--btb-red)]"
          onClick={() => containerRef.current?.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <ChevronDown />
        </Button>
      </div>
    </div>
  );
};
