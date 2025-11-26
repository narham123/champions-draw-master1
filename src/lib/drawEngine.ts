import { Team, Match } from "@/types/team";
import { TournamentRules, defaultTournamentRules } from "@/types/tournamentRules";

export interface DrawResult {
  fixtures: Match[];
  errors: string[];
}

export interface DrawStep {
  currentTeam: Team;
  opponent: Team;
  matchday: number;
  isHome: boolean;
}

export interface SequentialDrawResult {
  steps: DrawStep[];
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

export const conductSequentialDraw = (
  teams: Team[], 
  rules: TournamentRules = defaultTournamentRules
): SequentialDrawResult => {
  const steps: DrawStep[] = [];
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
  
  // Sort teams by pot for draw order (Pot 1 teams draw first)
  const sortedTeams = [...teams].sort((a, b) => a.pot - b.pot);
  
  // For each team, draw all their opponents
  sortedTeams.forEach(currentTeam => {
    for (let matchday = 1; matchday <= matchesPerTeam; matchday++) {
      // Find available opponents
      const availableOpponents = teams.filter(opponent => {
        if (opponent.id === currentTeam.id) return false;
        if (matchups.get(currentTeam.id)?.has(opponent.id)) return false;
        
        const sameCountry = currentTeam.country === opponent.country;
        const countryConflict = rules.countryProtection && sameCountry;
        const potConflict = rules.potProtection && matchday === 1 && currentTeam.pot === opponent.pot;
        
        return !countryConflict && !potConflict;
      });
      
      if (availableOpponents.length === 0) continue;
      
      // Select random opponent
      const opponent = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];
      
      // Determine home/away based on balance
      const currentHome = (homeCount.get(currentTeam.id) || 0);
      const currentAway = (awayCount.get(currentTeam.id) || 0);
      const isHome = currentHome < homeAwayBalance || currentAway >= homeAwayBalance;
      
      // Create step for animation
      steps.push({
        currentTeam,
        opponent,
        matchday,
        isHome
      });
      
      // Create match (avoid duplicates)
      const existingMatch = fixtures.find(f => 
        (f.homeTeam.id === currentTeam.id && f.awayTeam.id === opponent.id && f.matchday === matchday) ||
        (f.homeTeam.id === opponent.id && f.awayTeam.id === currentTeam.id && f.matchday === matchday)
      );
      
      if (!existingMatch) {
        const match: Match = {
          id: isHome ? `${currentTeam.id}-${opponent.id}-${matchday}` : `${opponent.id}-${currentTeam.id}-${matchday}`,
          homeTeam: isHome ? currentTeam : opponent,
          awayTeam: isHome ? opponent : currentTeam,
          matchday,
          played: false,
        };
        fixtures.push(match);
        
        // Update tracking
        matchups.get(currentTeam.id)?.add(opponent.id);
        matchups.get(opponent.id)?.add(currentTeam.id);
        
        if (isHome) {
          homeCount.set(currentTeam.id, currentHome + 1);
          awayCount.set(opponent.id, (awayCount.get(opponent.id) || 0) + 1);
        } else {
          awayCount.set(currentTeam.id, currentAway + 1);
          homeCount.set(opponent.id, (homeCount.get(opponent.id) || 0) + 1);
        }
      }
    }
  });
  
  return { steps, fixtures, errors };
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
