import { z } from "zod";

export const tournamentRulesSchema = z.object({
  // Swiss System Configuration
  numberOfMatchdays: z.number().min(6).max(10),
  homeAwayBalance: z.boolean(),
  
  // Draw Constraints
  countryProtection: z.boolean(),
  noRematches: z.boolean(),
  potProtection: z.boolean(),
  maxTeamsPerCountry: z.number().min(1).max(8),
  
  // Qualification Criteria
  autoQualifyTop: z.number().min(0).max(16),
  playoffPositionsStart: z.number().min(9).max(17),
  playoffPositionsEnd: z.number().min(16).max(24),
  eliminationPosition: z.number().min(24).max(36),
  
  // Match Settings
  allowDraws: z.boolean(),
  extraTimeInKnockout: z.boolean(),
});

export type TournamentRules = z.infer<typeof tournamentRulesSchema>;

export const defaultTournamentRules: TournamentRules = {
  // Swiss System Configuration
  numberOfMatchdays: 8,
  homeAwayBalance: true,
  
  // Draw Constraints
  countryProtection: true,
  noRematches: true,
  potProtection: false,
  maxTeamsPerCountry: 2,
  
  // Qualification Criteria
  autoQualifyTop: 8,
  playoffPositionsStart: 9,
  playoffPositionsEnd: 24,
  eliminationPosition: 25,
  
  // Match Settings
  allowDraws: true,
  extraTimeInKnockout: true,
};
