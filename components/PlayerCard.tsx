
import React from 'react';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  return (
    <div className="bg-slate-900/60 rounded-3xl p-6 border border-slate-700 backdrop-blur-md shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
        <div className="flex gap-2">
          {player.setName && (
            <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/30 uppercase tracking-widest">
              Set {player.setName}
            </span>
          )}
          <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-black px-3 py-1 rounded-full border border-yellow-500/30 uppercase tracking-widest">
            {player.country}
          </span>
        </div>
        {player.team2025 && player.team2025 !== '-' && (
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
            2025: <span className="text-slate-300">{player.team2025}</span>
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
          <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-hover:bg-blue-500/30 transition-all"></div>
          <img 
            src={player.photoUrl} 
            alt={player.name}
            className="w-full h-full object-cover rounded-2xl border-2 border-slate-700 relative z-10"
          />
          {player.age && (
            <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-700">
               <span className="text-xs font-black text-white">{player.age} yrs</span>
            </div>
          )}
        </div>

        <div className="flex-grow space-y-4">
          <div>
            <h2 className="text-4xl font-black oswald text-white tracking-wide uppercase leading-tight">{player.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-blue-400 font-bold uppercase text-xs">{player.role}</span>
              <span className="text-slate-700">•</span>
              <span className="text-slate-300 font-medium uppercase text-xs tracking-wider">Base: ₹{player.basePrice}L</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
              <p className="text-slate-500 text-[9px] uppercase font-black">Matches</p>
              <p className="text-lg font-black">{player.stats.matches || '-'}</p>
            </div>
            {(player.stats.runs || 0) > 0 && (
              <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
                <p className="text-slate-500 text-[9px] uppercase font-black">Runs / Avg</p>
                <p className="text-lg font-black">{player.stats.runs} <span className="text-xs text-slate-400">({player.stats.battingAvg})</span></p>
              </div>
            )}
            {(player.stats.wickets || 0) > 0 && (
              <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
                <p className="text-slate-500 text-[9px] uppercase font-black">Wickets / Avg</p>
                <p className="text-lg font-black">{player.stats.wickets} <span className="text-xs text-slate-400">({player.stats.bowlingAvg})</span></p>
              </div>
            )}
            {player.stats.strikeRate ? (
              <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
                <p className="text-slate-500 text-[9px] uppercase font-black">Strike Rate</p>
                <p className="text-lg font-black">{player.stats.strikeRate}</p>
              </div>
            ) : null}
            {player.stats.economy ? (
              <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
                <p className="text-slate-500 text-[9px] uppercase font-black">Economy</p>
                <p className="text-lg font-black">{player.stats.economy}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
