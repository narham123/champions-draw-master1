import { StandingsEntry, Match, Team } from "@/types/team";

export interface PlayoffMatch {
  id: string;
  round: "round-of-16" | "quarter-finals" | "semi-finals" | "final";
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore?: number;
  awayScore?: number;
  played: boolean;
  nextMatchId?: string;
}

export const generatePlayoffBracket = (standings: StandingsEntry[]): PlayoffMatch[] => {
  // Teams finishing 9-24 enter the playoff bracket
  const playoffTeams = standings.slice(8, 24);
  
  if (playoffTeams.length < 16) {
    return [];
  }

  // Round of 16 pairings: 9 vs 24, 10 vs 23, etc.
  const roundOf16Matches: PlayoffMatch[] = [];
  
  for (let i = 0; i < 8; i++) {
    roundOf16Matches.push({
      id: `r16-${i}`,
      round: "round-of-16",
      homeTeam: playoffTeams[i].team,
      awayTeam: playoffTeams[15 - i].team,
      played: false,
      nextMatchId: `qf-${Math.floor(i / 2)}`,
    });
  }

  // Quarter-finals (empty, to be filled by R16 winners)
  const quarterFinalMatches: PlayoffMatch[] = Array.from({ length: 4 }, (_, i) => ({
    id: `qf-${i}`,
    round: "quarter-finals",
    homeTeam: null,
    awayTeam: null,
    played: false,
    nextMatchId: `sf-${Math.floor(i / 2)}`,
  }));

  // Semi-finals
  const semiFinalMatches: PlayoffMatch[] = Array.from({ length: 2 }, (_, i) => ({
    id: `sf-${i}`,
    round: "semi-finals",
    homeTeam: null,
    awayTeam: null,
    played: false,
    nextMatchId: "final",
  }));

  // Final
  const finalMatch: PlayoffMatch = {
    id: "final",
    round: "final",
    homeTeam: null,
    awayTeam: null,
    played: false,
  };

  return [...roundOf16Matches, ...quarterFinalMatches, ...semiFinalMatches, finalMatch];
};

export const simulatePlayoffMatch = (match: PlayoffMatch): PlayoffMatch => {
  if (!match.homeTeam || !match.awayTeam) return match;

  // Simulate based on coefficients with some randomness
  const homeAdvantage = 0.3;
  const homeStrength = match.homeTeam.coefficient + homeAdvantage;
  const awayStrength = match.awayTeam.coefficient;

  const totalStrength = homeStrength + awayStrength;
  const homeWinProbability = homeStrength / totalStrength;

  const homeGoals = Math.floor(Math.random() * 4) + (Math.random() < homeWinProbability ? 1 : 0);
  const awayGoals = Math.floor(Math.random() * 4) + (Math.random() < (1 - homeWinProbability) ? 1 : 0);

  // Ensure there's a winner (no draws in knockout)
  let finalHomeGoals = homeGoals;
  let finalAwayGoals = awayGoals;
  
  if (homeGoals === awayGoals) {
    // Add extra time goal
    if (Math.random() < homeWinProbability) {
      finalHomeGoals++;
    } else {
      finalAwayGoals++;
    }
  }

  return {
    ...match,
    homeScore: finalHomeGoals,
    awayScore: finalAwayGoals,
    played: true,
  };
};

export const advanceWinner = (
  matches: PlayoffMatch[],
  matchId: string
): PlayoffMatch[] => {
  const updatedMatches = [...matches];
  const match = updatedMatches.find(m => m.id === matchId);
  
  if (!match || !match.played || !match.homeTeam || !match.awayTeam) {
    return matches;
  }

  const winner = (match.homeScore ?? 0) > (match.awayScore ?? 0) 
    ? match.homeTeam 
    : match.awayTeam;

  if (match.nextMatchId) {
    const nextMatch = updatedMatches.find(m => m.id === match.nextMatchId);
    if (nextMatch) {
      if (!nextMatch.homeTeam) {
        nextMatch.homeTeam = winner;
      } else if (!nextMatch.awayTeam) {
        nextMatch.awayTeam = winner;
      }
    }
  }

  return updatedMatches;
};
