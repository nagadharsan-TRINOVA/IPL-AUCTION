
export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper';

export interface Player {
  id: string;
  name: string;
  role: string;
  country: string;
  photoUrl: string;
  basePrice: number;
  age?: number;
  team2025?: string;
  stats: {
    matches: number;
    runs?: number;
    wickets?: number;
    strikeRate?: number;
    economy?: number;
    battingAvg?: number;
    bowlingAvg?: number;
  };
  set: number;
  setName?: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  budget: number;
  players: Player[];
  primaryColor: string;
}

export interface BidStep {
  amount: number;
  teamId: string | null;
}

export interface AuctionState {
  currentPlayerIndex: number;
  currentBid: number;
  highestBidderId: string | null;
  bidHistory: BidStep[];
  soldPlayers: Array<{ player: Player; teamId: string; price: number }>;
  isAuctionActive: boolean;
}
