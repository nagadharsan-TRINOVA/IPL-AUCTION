
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { INITIAL_PLAYERS, INITIAL_TEAMS } from './constants';
import { Player, Team, AuctionState, BidStep } from './types';
import { PlayerCard } from './components/PlayerCard';
import { BiddingPanel } from './components/BiddingPanel';

type Tab = 'auction' | 'tracker' | 'squads';

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [activeTab, setActiveTab] = useState<Tab>('auction');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSet, setSelectedSet] = useState<number | null>(null);
  const [auctionState, setAuctionState] = useState<AuctionState>({
    currentPlayerIndex: 0,
    currentBid: 0,
    highestBidderId: null,
    bidHistory: [],
    soldPlayers: [],
    isAuctionActive: false
  });

  const currentPlayer = players[auctionState.currentPlayerIndex];

  // Logic: Auction ends if all teams have budget less than 30L
  const areAllTeamsBankrupt = useMemo(() => teams.every(team => team.budget < 30), [teams]);
  
  // Logic: Final view should show if players are exhausted OR all teams are out of funds
  const isAuctionFinished = useMemo(() => 
    auctionState.currentPlayerIndex >= players.length || areAllTeamsBankrupt, 
    [auctionState.currentPlayerIndex, players.length, areAllTeamsBankrupt]
  );

  const handleBid = (teamId: string) => {
    const currentPrice = auctionState.currentBid;
    const nextBid = currentPrice === 0 
      ? currentPlayer.basePrice 
      : currentPrice + (currentPrice < 200 ? 10 : currentPrice < 500 ? 20 : currentPrice < 1000 ? 50 : 100);
    
    setAuctionState(prev => ({
      ...prev,
      bidHistory: [...prev.bidHistory, { amount: prev.currentBid, teamId: prev.highestBidderId }],
      currentBid: nextBid,
      highestBidderId: teamId
    }));
  };

  const handleUndo = () => {
    if (auctionState.bidHistory.length === 0) return;

    const history = [...auctionState.bidHistory];
    const lastState = history.pop()!;

    setAuctionState(prev => ({
      ...prev,
      bidHistory: history,
      currentBid: lastState.amount,
      highestBidderId: lastState.teamId
    }));
  };

  const handleSold = () => {
    if (!auctionState.highestBidderId) return;

    const soldPrice = auctionState.currentBid;
    const teamId = auctionState.highestBidderId;

    setTeams(prev => prev.map(t => 
      t.id === teamId 
        ? { ...t, budget: t.budget - soldPrice, players: [...t.players, currentPlayer] }
        : t
    ));

    setAuctionState(prev => ({
      ...prev,
      soldPlayers: [...prev.soldPlayers, { player: currentPlayer, teamId, price: soldPrice }],
      currentPlayerIndex: prev.currentPlayerIndex + 1,
      currentBid: 0,
      highestBidderId: null,
      bidHistory: []
    }));
  };

  const handleUnsold = () => {
    setAuctionState(prev => ({
      ...prev,
      currentPlayerIndex: prev.currentPlayerIndex + 1,
      currentBid: 0,
      highestBidderId: null,
      bidHistory: []
    }));
  };

  const handlePrevious = () => {
    if (auctionState.currentPlayerIndex > 0) {
      setAuctionState(prev => ({
        ...prev,
        currentPlayerIndex: prev.currentPlayerIndex - 1,
        currentBid: 0,
        highestBidderId: null,
        bidHistory: []
      }));
    }
  };

  const handleReAuction = (playerToReAuction: Player) => {
    // 1. Remove player from their current position in the list
    const filteredPlayers = players.filter(p => p.id !== playerToReAuction.id);
    
    // 2. Insert the player at the current index (essentially making them the "current" player again)
    const newPlayersList = [
      ...filteredPlayers.slice(0, auctionState.currentPlayerIndex),
      playerToReAuction,
      ...filteredPlayers.slice(auctionState.currentPlayerIndex)
    ];

    setPlayers(newPlayersList);
    
    // 3. Reset auction state for this player
    setAuctionState(prev => ({
      ...prev,
      currentBid: 0,
      highestBidderId: null,
      bidHistory: []
    }));

    // 4. Switch to Arena
    setActiveTab('auction');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const soldPlayerIds = useMemo(() => new Set(auctionState.soldPlayers.map(sp => sp.player.id)), [auctionState.soldPlayers]);

  const renderSquads = () => {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6 flex flex-col min-h-screen">
        <div className="flex justify-between items-center bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black oswald uppercase tracking-wider text-white">Franchise Squads</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Real-time Roster Tracking</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-2xl">
                <span className="text-[10px] font-black text-blue-400 uppercase block leading-none mb-1">Total Sold</span>
                <span className="text-xl font-black text-white">{auctionState.soldPlayers.length}</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pb-10">
          {teams.map(team => (
            <div key={team.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 flex flex-col hover:border-blue-500/30 transition-all group min-h-[400px]">
              <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                <div 
                  className="w-10 h-10 rounded-full border-2 border-white/10 group-hover:scale-110 transition-transform shadow-lg" 
                  style={{ backgroundColor: team.primaryColor }}
                />
                <div className="overflow-hidden">
                  <h3 className="font-black text-white leading-tight uppercase text-xs truncate">{team.name}</h3>
                  <p className="text-[10px] text-yellow-500 font-black tracking-tighter uppercase italic">PURSE: ₹{team.budget}L</p>
                </div>
              </div>
              <div className="flex-grow flex flex-col overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1 mb-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Squad ({team.players.length})</p>
                </div>
                <div className="space-y-1.5 flex-grow">
                  {team.players.map(p => {
                    const sale = auctionState.soldPlayers.find(sp => sp.player.id === p.id);
                    return (
                      <div key={p.id} className="flex justify-between items-center text-[10px] bg-slate-800/40 p-2 rounded-xl border border-transparent hover:border-slate-700 hover:bg-slate-800 transition-colors">
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-slate-100 font-bold truncate whitespace-nowrap">{p.name}</span>
                          <span className="text-[7px] text-slate-500 uppercase font-black">{p.role}</span>
                        </div>
                        <span className="text-yellow-500 font-black oswald ml-2">₹{sale?.price}L</span>
                      </div>
                    );
                  })}
                  {team.players.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center opacity-10">
                       <div className="w-8 h-8 rounded-full bg-slate-700 mb-2" />
                       <p className="text-[8px] font-black uppercase">No signings</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTracker = () => {
    const availablePlayers = players.filter((_, idx) => idx >= auctionState.currentPlayerIndex);
    const completedPlayers = players.filter((_, idx) => idx < auctionState.currentPlayerIndex);
    const unsoldPlayers = completedPlayers.filter(p => !soldPlayerIds.has(p.id));

    // Unique sets among upcoming players
    const uniqueSets = Array.from(new Set(availablePlayers.map(p => p.set))).sort((a, b) => a - b);
    const setDetails = uniqueSets.map(setId => {
      const pInSet = availablePlayers.filter(p => p.set === setId);
      return {
        id: setId,
        name: pInSet[0]?.setName || `Set ${setId}`,
        count: pInSet.length
      };
    });

    const filteredAvailable = availablePlayers.filter(p => 
      (selectedSet === null || p.set === selectedSet) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       p.role.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredSold = auctionState.soldPlayers.filter(sp => 
      sp.player.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6 flex flex-col min-h-screen">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl flex-shrink-0">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search roster..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Total</span>
              <span className="text-lg font-black text-white">{players.length}</span>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Awaiting</span>
              <span className="text-lg font-black text-blue-400">{availablePlayers.length}</span>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-green-500 uppercase tracking-[0.2em]">Sold</span>
              <span className="text-lg font-black text-green-400">{auctionState.soldPlayers.length}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 pb-20">
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 flex flex-col shadow-inner">
              <h2 className="text-xl font-black oswald uppercase tracking-widest text-blue-400 mb-4 flex items-center justify-between flex-shrink-0">
                Upcoming Sets
                <span className="text-[9px] font-black bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20 uppercase">Pool Groups</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedSet(null)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${selectedSet === null ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                >
                  All Players
                </button>
                {setDetails.map(set => (
                  <button 
                    key={set.id}
                    onClick={() => setSelectedSet(set.id)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border flex items-center gap-2 ${selectedSet === set.id ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                  >
                    {set.name}
                    <span className={`w-4 h-4 rounded-full text-[8px] flex items-center justify-center ${selectedSet === set.id ? 'bg-white text-blue-600' : 'bg-slate-700 text-slate-300'}`}>{set.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 flex flex-col shadow-inner">
              <h3 className="text-sm font-black oswald uppercase text-slate-500 mb-4 tracking-widest">
                {selectedSet === null ? 'All Upcoming Players' : `Players in ${setDetails.find(s => s.id === selectedSet)?.name}`}
              </h3>
              <div className="space-y-2">
                {filteredAvailable.map(p => (
                  <div key={p.id} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 flex justify-between items-center group hover:bg-slate-800/80 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 flex items-center justify-center bg-slate-700 rounded-xl text-[10px] font-black text-slate-400 border border-slate-600">
                        #{p.id}
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase text-white group-hover:text-blue-300 transition-colors tracking-tight">{p.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-blue-500/80 font-black uppercase tracking-widest">{p.role}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase">{p.country}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">Reserve</p>
                      <p className="text-sm font-black text-yellow-500 italic oswald">₹{p.basePrice}L</p>
                    </div>
                  </div>
                ))}
                {filteredAvailable.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-700">
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">No matches found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 flex flex-col shadow-inner">
              <h2 className="text-xl font-black oswald uppercase tracking-widest text-green-400 mb-4 flex items-center justify-between flex-shrink-0">
                The Sold List
                <span className="text-[9px] font-black bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-widest">Signings</span>
              </h2>
              <div className="space-y-2">
                {filteredSold.slice().reverse().map((sp, idx) => {
                  const team = teams.find(t => t.id === sp.teamId);
                  return (
                    <div key={idx} className="bg-green-500/5 p-3 rounded-xl border border-green-500/10 flex justify-between items-center hover:bg-green-500/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-green-500/20 shadow-md">
                          <img src={sp.player.photoUrl} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-black text-xs uppercase text-white tracking-tight leading-none">{sp.player.name}</span>
                          <p className="text-[9px] font-black text-green-500/60 uppercase flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team?.primaryColor }} /> {sp.teamId.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <span className="text-green-400 font-black text-xs italic oswald bg-green-950/40 px-2 py-1 rounded">₹{sp.price}L</span>
                    </div>
                  );
                })}
                {filteredSold.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 opacity-10">
                    <p className="font-black uppercase tracking-[0.2em] text-[10px] italic">Awaiting signings</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 flex flex-col shadow-inner border-t-red-900/20">
              <h2 className="text-lg font-black oswald uppercase tracking-widest text-red-400 mb-4 flex items-center justify-between flex-shrink-0">
                Unsold Room
                <span className="text-[9px] font-black text-red-500/40">{unsoldPlayers.length} Players</span>
              </h2>
              <div>
                <p className="text-[8px] font-bold text-slate-500 uppercase mb-3 tracking-widest italic">Click any player to re-auction them</p>
                <div className="flex flex-wrap gap-2 pb-4">
                  {unsoldPlayers.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => handleReAuction(p)}
                      className="group bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/10 hover:border-red-500/40 hover:bg-red-500/20 transition-all active:scale-95"
                    >
                      <span className="text-[10px] font-black text-white uppercase opacity-80 group-hover:opacity-100 flex items-center gap-2">
                        {p.name}
                        <span className="text-[8px] opacity-0 group-hover:opacity-50">♻️</span>
                      </span>
                    </button>
                  ))}
                  {unsoldPlayers.length === 0 && (
                    <p className="text-slate-700 text-[9px] font-black uppercase tracking-widest italic py-4">No rejections</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!auctionState.isAuctionActive) {
    return (
      <div className="min-h-screen ipl-gradient flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-1000 py-20">
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 p-8 rounded-full border border-white/20 shadow-2xl backdrop-blur-sm relative">
               <span className="text-9xl animate-bounce">🏏</span>
               <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-slate-900 px-4 py-1 rounded-full font-black text-sm rotate-12">314 PLAYERS</div>
            </div>
          </div>
          <div>
            <h1 className="text-8xl font-black oswald uppercase tracking-tighter text-white drop-shadow-2xl">
              SNUC <span className="gold-text">IPL AUCTION</span>
            </h1>
            <p className="text-2xl font-bold text-blue-300 mt-2 uppercase tracking-[0.2em]">The Grand Stage 2026</p>
          </div>
          <p className="text-xl text-blue-100/70 font-medium max-w-2xl mx-auto italic">
            "Strategic minds, golden bids, and the quest for the ultimate squad."
          </p>
          <div className="pt-8 flex flex-col items-center gap-4">
            <button 
              onClick={() => setAuctionState(prev => ({ ...prev, isAuctionActive: true }))}
              className="px-16 py-6 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-3xl font-black oswald uppercase tracking-widest rounded-full transition-all hover:scale-105 hover:shadow-2xl active:scale-95 shadow-yellow-500/40"
            >
              Enter The Arena
            </button>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">Shiv Nadar University Chennai Cultural Fest</p>
          </div>
        </div>
      </div>
    );
  }

  // Trigger Finale if players run out OR all teams reach below 30L budget
  if (isAuctionFinished && activeTab === 'auction') {
    return (
      <div className="min-h-screen bg-slate-950 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
          <div className="text-center animate-in slide-in-from-top duration-700">
            <h1 className="text-6xl font-black oswald text-white uppercase mb-2 tracking-tighter">
              {areAllTeamsBankrupt ? 'Budgets Exhausted' : 'Grand Finale'}
            </h1>
            <p className="text-slate-400 text-lg uppercase tracking-widest font-bold">
              {areAllTeamsBankrupt ? 'No team can afford further players (All budgets < ₹30L).' : 'The hammer has fallen for the last time.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {teams.map(team => (
              <div key={team.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col shadow-2xl hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full border-2 border-white/20 shadow-md" style={{ backgroundColor: team.primaryColor }} />
                  <div className="overflow-hidden">
                    <h3 className="font-black text-white leading-tight uppercase text-sm truncate">{team.name}</h3>
                    <p className="text-[10px] text-yellow-500 font-bold tracking-tighter uppercase italic">PURSE: ₹{team.budget}L</p>
                  </div>
                </div>
                <div className="flex-grow space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Final Squad</p>
                    <span className="bg-slate-800 text-slate-300 text-[8px] font-black px-2 py-0.5 rounded-full">{team.players.length}</span>
                  </div>
                  <div className="space-y-1 pr-1">
                    {team.players.map(p => {
                      const sale = auctionState.soldPlayers.find(sp => sp.player.id === p.id);
                      return (
                        <div key={p.id} className="flex justify-between items-center text-[11px] bg-slate-800/30 p-2 rounded-lg border border-transparent hover:border-slate-700 hover:bg-slate-800/60 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-slate-100 font-medium truncate max-w-[120px]">{p.name}</span>
                            <span className="text-[8px] text-slate-500 uppercase font-black">{p.role}</span>
                          </div>
                          <span className="text-yellow-500 font-black oswald">₹{sale?.price}L</span>
                        </div>
                      );
                    })}
                    {team.players.length === 0 && (
                      <p className="text-slate-700 text-[10px] italic py-4 text-center">No players bought</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-10">
            <button 
              onClick={() => window.location.reload()} 
              className="group relative px-10 py-4 bg-slate-800 text-white rounded-full font-black oswald uppercase tracking-widest hover:bg-blue-600 transition-all border border-slate-700 shadow-xl overflow-hidden"
            >
              <span className="relative z-10">New Auction Session</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="bg-slate-900/80 border-b border-slate-800 p-4 sticky top-0 z-50 backdrop-blur-xl flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="px-4 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-blue-900/40 relative overflow-hidden group">
               <div className="absolute inset-0 bg-blue-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
               <span className="relative z-10 group-hover:text-slate-950 transition-colors uppercase tracking-tighter whitespace-nowrap">Business Club</span>
            </div>
            <div>
              <h1 className="text-2xl font-black oswald tracking-tight uppercase leading-none">SNUC <span className="gold-text">IPL</span></h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Auction Portal 2026</p>
            </div>
          </div>

          <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700 shadow-inner">
            <button 
              onClick={() => setActiveTab('auction')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest ${activeTab === 'auction' ? 'bg-blue-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-white hover:bg-slate-700/50'}`}
            >
              The Arena
            </button>
            <button 
              onClick={() => setActiveTab('tracker')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest ${activeTab === 'tracker' ? 'bg-blue-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-white hover:bg-slate-700/50'}`}
            >
              Tracker Pool
            </button>
            <button 
              onClick={() => setActiveTab('squads')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest ${activeTab === 'squads' ? 'bg-blue-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-white hover:bg-slate-700/50'}`}
            >
              Squad Summary
            </button>
          </div>

          <div className="hidden xl:flex gap-3 items-center">
             {teams.map(team => (
               <div key={team.id} className="flex flex-col items-center justify-center border-r border-slate-800 last:border-0 px-3 group">
                 <div 
                   className="w-5 h-5 rounded-full border border-white/20 group-hover:scale-125 transition-transform cursor-help" 
                   title={team.name}
                   style={{ backgroundColor: team.primaryColor }}
                 />
                 <span className="text-[9px] font-black text-yellow-500 italic mt-1">₹{team.budget}L</span>
               </div>
             ))}
          </div>
        </div>
      </header>

      {activeTab === 'auction' ? (
        <main className="max-w-7xl mx-auto p-4 lg:p-6 grid lg:grid-cols-12 gap-6 flex-grow pb-20">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between bg-slate-900/50 p-5 rounded-3xl border border-slate-800 backdrop-blur-md">
               <div className="flex items-center gap-5">
                 <button 
                  onClick={handlePrevious}
                  disabled={auctionState.currentPlayerIndex === 0}
                  className={`flex items-center justify-center w-10 h-10 rounded-2xl border transition-all ${auctionState.currentPlayerIndex === 0 ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' : 'bg-slate-800 border-slate-600 hover:border-blue-500 text-slate-300 hover:text-blue-400 active:scale-90'}`}
                  title="Previous Player"
                 >
                   ⏮️
                 </button>
                 <div className="bg-blue-600/10 text-blue-400 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase border border-blue-500/20 tracking-widest shadow-inner">
                   {currentPlayer?.setName || `Set ${currentPlayer?.set}`}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Global Order</span>
                   <span className="text-sm font-black text-white">{auctionState.currentPlayerIndex + 1} <span className="text-slate-600">/ {players.length}</span></span>
                 </div>
               </div>
               <button 
                onClick={handleUnsold} 
                className="group flex items-center gap-3 bg-red-500/10 hover:bg-red-500/20 px-5 py-2.5 rounded-2xl border border-red-500/20 transition-all active:scale-95"
               >
                 <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Skip Player</span>
                 <span className="group-hover:translate-x-1 transition-transform">⏭️</span>
               </button>
            </div>
            
            {currentPlayer && (
              <PlayerCard 
                player={currentPlayer} 
              />
            )}

            <div className="bg-slate-900/30 rounded-3xl p-6 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="oswald uppercase text-xl font-black tracking-widest text-slate-500 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Sale Feed
                </h3>
                <span className="text-[10px] font-black text-slate-600 uppercase">Latest on top</span>
              </div>
              <div className="space-y-2">
                {auctionState.soldPlayers.slice().reverse().map((sp, idx) => {
                  const team = teams.find(t => t.id === sp.teamId);
                  return (
                    <div key={idx} className="flex justify-between items-center bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700">
                          <img src={sp.player.photoUrl} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-black text-sm uppercase text-white tracking-tight">{sp.player.name}</span>
                          <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2">
                            Buyer: <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team?.primaryColor }} /> {sp.teamId.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="gold-text font-black text-base italic oswald">₹{sp.price}L</span>
                      </div>
                    </div>
                  );
                })}
                {auctionState.soldPlayers.length === 0 && (
                  <div className="py-12 flex flex-col items-center opacity-20">
                    <span className="text-4xl mb-2">📜</span>
                    <p className="text-xs font-black uppercase tracking-widest">Awaiting First Trade</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <BiddingPanel 
              currentBid={auctionState.currentBid}
              highestBidderId={auctionState.highestBidderId}
              teams={teams}
              onBid={handleBid}
              onSold={handleSold}
              onUnsold={handleUnsold}
              onUndo={handleUndo}
              canUndo={auctionState.bidHistory.length > 0}
              basePrice={currentPlayer?.basePrice || 0}
            />
            <div className="bg-slate-900 rounded-[2rem] p-6 border border-slate-800 shadow-2xl relative overflow-hidden flex-shrink-0">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="text-8xl oswald font-black">PURSE</span>
              </div>
              <h3 className="oswald uppercase text-sm font-black text-slate-500 mb-6 tracking-widest">Franchise Budget Left</h3>
              <div className="space-y-5 relative z-10">
                {teams.map(team => (
                  <div key={team.id} className="space-y-2 group">
                    <div className="flex justify-between text-[10px] items-center uppercase font-black">
                      <span className="text-slate-300 flex items-center gap-3 transition-all group-hover:gap-4">
                        <div className="w-5 h-5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: team.primaryColor }} /> {team.name}
                      </span>
                      <span className="text-yellow-500 oswald text-sm">₹{team.budget} L</span>
                    </div>
                    <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${team.budget < 1000 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]' : team.budget < 3000 ? 'bg-amber-500' : 'bg-blue-600'}`} 
                        style={{ width: `${(team.budget / 12000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      ) : activeTab === 'tracker' ? (
        renderTracker()
      ) : (
        renderSquads()
      )}
      
      <footer className="p-4 text-center border-t border-slate-800 bg-slate-900/50 backdrop-blur-md flex-shrink-0 mt-auto">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em]">
          SNU Chennai 2026 • Mega Auction Hall
        </p>
      </footer>
    </div>
  );
};

export default App;
