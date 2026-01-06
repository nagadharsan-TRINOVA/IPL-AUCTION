
import React from 'react';
import { Team } from '../types';

interface BiddingPanelProps {
  currentBid: number;
  highestBidderId: string | null;
  teams: Team[];
  onBid: (teamId: string) => void;
  onSold: () => void;
  onUnsold: () => void;
  onUndo: () => void;
  canUndo: boolean;
  basePrice: number;
}

export const BiddingPanel: React.FC<BiddingPanelProps> = ({
  currentBid,
  highestBidderId,
  teams,
  onBid,
  onSold,
  onUnsold,
  onUndo,
  canUndo,
  basePrice
}) => {
  const highestBidder = teams.find(t => t.id === highestBidderId);
  const nextBid = currentBid === 0 ? basePrice : currentBid + (currentBid < 200 ? 10 : currentBid < 500 ? 20 : currentBid < 1000 ? 50 : 100);

  // A player can only be marked unsold if no bids have been placed yet
  const isUnsoldDisabled = currentBid > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gradient-to-br from-blue-900 to-slate-900 p-6 rounded-3xl border border-blue-500/30 shadow-2xl flex flex-col items-center text-center relative">
        <p className="text-blue-400 font-black uppercase tracking-widest text-[10px] mb-1">Current Bid</p>
        <div className="text-6xl font-black oswald gold-text animate-bid drop-shadow-lg">
          ₹{currentBid === 0 ? "—" : currentBid} L
        </div>
        
        {highestBidder ? (
          <div className="mt-3 flex items-center gap-3 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/30">
            <div 
              className="w-4 h-4 rounded-full border border-white/20 shadow-sm" 
              style={{ backgroundColor: highestBidder.primaryColor }}
            />
            <span className="font-black text-blue-100 text-sm uppercase tracking-tight">{highestBidder.name}</span>
          </div>
        ) : (
          <div className="mt-3 text-slate-500 text-xs font-bold uppercase tracking-widest">Open for Bidding</div>
        )}

        {canUndo && (
          <button 
            onClick={onUndo}
            className="absolute top-4 right-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 p-2 rounded-full border border-amber-500/30 transition-all active:scale-90"
            title="Undo Last Bid"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966a.25.25 0 0 0 .41-.192z"/>
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
        {teams.map(team => (
          <button
            key={team.id}
            onClick={() => onBid(team.id)}
            disabled={team.budget < nextBid}
            className={`
              flex flex-col items-center p-3 rounded-xl border transition-all relative overflow-hidden group
              ${team.id === highestBidderId ? 'bg-blue-600 border-blue-300 ring-2 ring-blue-400' : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'}
              ${team.budget < nextBid ? 'opacity-40 grayscale cursor-not-allowed' : 'active:scale-95'}
            `}
          >
            <div className="flex items-center gap-3 w-full justify-center">
              <div 
                className="w-4 h-4 rounded-full border border-white/10 group-hover:scale-110 transition-transform" 
                style={{ backgroundColor: team.primaryColor }}
              />
              <span className="text-[10px] font-black text-white uppercase truncate">{team.id.toUpperCase()}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold mt-1">Purse: ₹{team.budget} L</span>
            <div className={`mt-2 text-[11px] font-black px-3 py-1 rounded-full w-full text-center transition-colors ${team.id === highestBidderId ? 'bg-white/20 text-white' : 'bg-green-500/20 text-green-400'}`}>
              + ₹{nextBid}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <button
          onClick={onSold}
          disabled={!highestBidderId}
          className={`py-3.5 rounded-xl font-black oswald uppercase tracking-widest text-lg transition-all shadow-lg
            ${highestBidderId ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/40 active:scale-95' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
          `}
        >
          Sold
        </button>
        <button
          onClick={onUnsold}
          disabled={isUnsoldDisabled}
          className={`py-3.5 rounded-xl font-black oswald uppercase tracking-widest text-lg transition-all shadow-lg
            ${isUnsoldDisabled 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700 opacity-50' 
              : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40 active:scale-95'
            }
          `}
        >
          Unsold
        </button>
      </div>
    </div>
  );
};
