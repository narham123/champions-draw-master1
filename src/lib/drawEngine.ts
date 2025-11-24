import { Team, Match } from "@/types/team";
import { TournamentRules, defaultTournamentRules } from "@/types/tournamentRules";

export interface DrawResult {
  fixtures: Match[];
  errors: string[];
}

export const conductSwissDraw = (
  teams: Team[], 
  rules: TournamentRules = defaultTournamentRules
): DrawResult => {
  const fixtures: Match[] = [];
  const errors: string[] = [];
  const matchups = new Map<string, Set<string>>();
  
  // Initialize matchups tracker
  teams.forEach(team => {
    matchups.set(team.id, new Set());
  });
  
  // Use configured number of matchdays
  const matchesPerTeam = rules.numberOfMatchdays;
  const homeAwayBalance = matchesPerTeam / 2;
  
  // Track home/away counts
  const homeCount = new Map<string, number>();
  const awayCount = new Map<string, number>();
  teams.forEach(team => {
    homeCount.set(team.id, 0);
    awayCount.set(team.id, 0);
  });
  
  // Generate fixtures for each matchday
  for (let matchday = 1; matchday <= matchesPerTeam; matchday++) {
    const availableTeams = [...teams];
    const matchdayFixtures: Match[] = [];
    
    while (availableTeams.length >= 2) {
      const team1 = availableTeams.shift()!;
      let paired = false;
      
      for (let i = 0; i < availableTeams.length; i++) {
        const team2 = availableTeams[i];
        
        // Check constraints
        const alreadyPlayed = matchups.get(team1.id)?.has(team2.id);
        const sameCountry = team1.country === team2.country;
        const team1Home = (homeCount.get(team1.id) || 0) < homeAwayBalance;
        const team2Away = (awayCount.get(team2.id) || 0) < homeAwayBalance;
        
        // Apply rules
        const countryConflict = rules.countryProtection && sameCountry;
        const rematchConflict = rules.noRematches && alreadyPlayed;
        const potConflict = rules.potProtection && matchday === 1 && team1.pot === team2.pot;
        
        if (!countryConflict && !rematchConflict && !potConflict && team1Home && team2Away) {
          // Create match
          const match: Match = {
            id: `${team1.id}-${team2.id}-${matchday}`,
            homeTeam: team1,
            awayTeam: team2,
            matchday,
            played: false,
          };
          
          matchdayFixtures.push(match);
          availableTeams.splice(i, 1);
          
          // Update tracking
          matchups.get(team1.id)?.add(team2.id);
          matchups.get(team2.id)?.add(team1.id);
          homeCount.set(team1.id, (homeCount.get(team1.id) || 0) + 1);
          awayCount.set(team2.id, (awayCount.get(team2.id) || 0) + 1);
          
          paired = true;
          break;
        }
      }
      
      if (!paired && availableTeams.length > 0) {
        // Fallback: pair with next available team
        const team2 = availableTeams.shift()!;
        const match: Match = {
          id: `${team1.id}-${team2.id}-${matchday}`,
          homeTeam: team1,
          awayTeam: team2,
          matchday,
          played: false,
        };
        matchdayFixtures.push(match);
        matchups.get(team1.id)?.add(team2.id);
        matchups.get(team2.id)?.add(team1.id);
        homeCount.set(team1.id, (homeCount.get(team1.id) || 0) + 1);
        awayCount.set(team2.id, (awayCount.get(team2.id) || 0) + 1);
      }
    }
    
    fixtures.push(...matchdayFixtures);
  }
  
  return { fixtures, errors };
};

export const simulateMatch = (match: Match, allowDraws: boolean = true): Match => {
  // Simple simulation based on team coefficients
  const homeAdvantage = 5;
  const homeStrength = match.homeTeam.coefficient + homeAdvantage;
  const awayStrength = match.awayTeam.coefficient;
  
  const totalStrength = homeStrength + awayStrength;
  const homeWinProbability = homeStrength / totalStrength;
  
  const rand = Math.random();
  let homeScore = 0;
  let awayScore = 0;
  
  if (rand < homeWinProbability * 0.7) {
    // Home win
    homeScore = Math.floor(Math.random() * 3) + 1;
    awayScore = Math.floor(Math.random() * homeScore);
  } else if (rand > homeWinProbability * 1.3) {
    // Away win
    awayScore = Math.floor(Math.random() * 3) + 1;
    homeScore = Math.floor(Math.random() * awayScore);
  } else {
    // Draw or forced result
    const goals = Math.floor(Math.random() * 4);
    homeScore = goals;
    awayScore = goals;
    
    // If draws not allowed, ensure there's a winner
    if (!allowDraws && homeScore === awayScore) {
      if (Math.random() < homeWinProbability) {
        homeScore++;
      } else {
        awayScore++;
      }
    }
  }
  
  return {
    ...match,
    homeScore,
    awayScore,
    played: true,
  };
};
