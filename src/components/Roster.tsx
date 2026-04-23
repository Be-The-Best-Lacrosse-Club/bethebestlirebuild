import React, { useEffect, useState } from 'react';
import { fetchRoster, type LARegistration } from '@/lib/leagueApps';
import { Users, Loader2, ShieldCheck, Activity } from 'lucide-react';

interface RosterProps {
  programId: number;
  teamName: string;
}

export function Roster({ programId, teamName }: RosterProps) {
  const [players, setPlayers] = useState<LARegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoster() {
      if (!programId) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await fetchRoster(programId);
        const sorted = [...data].sort((a, b) => {
          const numA = parseInt(a.jerseyNumber || '999');
          const numB = parseInt(b.jerseyNumber || '999');
          return numA - numB;
        });
        setPlayers(sorted);
      } catch (err) {
        setError('Failed to load roster data.');
      } finally {
        setLoading(false);
      }
    }
    loadRoster();
  }, [programId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-white/10 bg-black">
        <Loader2 className="animate-spin mb-4 text-[var(--btb-red)]" size={32} />
        <p className="text-[0.6rem] font-mono uppercase tracking-[4px]">Initializing_Roster_Feed...</p>
      </div>
    );
  }

  if (error || players.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-black relative overflow-hidden border-t border-white/5">
      {/* Background Spec Markings */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <div className="font-mono text-[10vw] leading-none text-white uppercase select-none">
          ROSTER_DATA
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-8 border-b border-white/10 gap-6">
          <div>
            <div className="flex items-center gap-3 text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[4px] mb-4">
              <Activity size={12} className="animate-pulse" />
              LIVE_SYSTEM_SYNC // LEAGUEAPPS_V1
            </div>
            <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] uppercase tracking-tight text-white leading-none">
              {teamName} <span className="text-white/20">Roster</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-[0.6rem] font-black text-white/30 uppercase tracking-[2px]">Verified Athletes</div>
              <div className="text-xl font-display text-white">{players.length}</div>
            </div>
            <div className="w-12 h-12 rounded-sm border border-white/10 flex items-center justify-center bg-white/[0.02]">
              <ShieldCheck className="text-[var(--btb-red)]" size={24} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-white/5 border border-white/5">
          {players.map((player) => (
            <div 
              key={player.id}
              className="flex items-center justify-between p-6 bg-black hover:bg-neutral-900 transition-all duration-300 group border-b md:border-b-0"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 flex items-center justify-center bg-white/[0.03] border border-white/10 font-display text-xl text-[var(--btb-red)] group-hover:bg-[var(--btb-red)] group-hover:text-white transition-all duration-300">
                  {player.jerseyNumber !== '—' ? player.jerseyNumber : '#'}
                </div>
                <div>
                  <div className="font-display text-lg uppercase tracking-wider text-white group-hover:translate-x-1 transition-transform">
                    {player.firstName} {player.lastName}
                  </div>
                  <div className="text-[0.6rem] font-mono text-white/20 uppercase tracking-[1px]">
                    Athlete_Profile // Active
                  </div>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)] shadow-[0_0_10px_#D22630]" />
              </div>
            </div>
          ))}
        </div>

        {/* Technical Footer */}
        <div className="mt-8 flex items-center justify-between opacity-20">
          <div className="font-mono text-[8px] uppercase tracking-[2px]">BTB_LAB_SERIAL // {programId}</div>
          <div className="font-mono text-[8px] uppercase tracking-[2px]">40.7128° N, 74.0060° W</div>
        </div>
      </div>
    </section>
  );
}
