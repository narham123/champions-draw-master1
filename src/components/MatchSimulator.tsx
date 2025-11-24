import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Match } from "@/types/team";
import { TournamentRules } from "@/types/tournamentRules";
import { simulateMatch } from "@/lib/drawEngine";
import { toast } from "sonner";
import { Play, RotateCw } from "lucide-react";

interface MatchSimulatorProps {
  fixtures: Match[];
  rules: TournamentRules;
  onSimulate: (updatedFixtures: Match[]) => void;
}

const MatchSimulator = ({ fixtures, rules, onSimulate }: MatchSimulatorProps) => {
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateAllMatches = async () => {
    setIsSimulating(true);
    
    const updatedFixtures = fixtures.map(match => simulateMatch(match, rules.allowDraws));
    
    // Simulate delay for effect
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSimulate(updatedFixtures);
    setIsSimulating(false);
    
    toast.success("All matches simulated!", {
      description: "Standings have been updated",
    });
  };

  const simulateMatchday = async (matchday: number) => {
    setIsSimulating(true);
    
    const updatedFixtures = fixtures.map(match => {
      if (match.matchday === matchday && !match.played) {
        return simulateMatch(match, rules.allowDraws);
      }
      return match;
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSimulate(updatedFixtures);
    setIsSimulating(false);
    
    toast.success(`Matchday ${matchday} simulated!`);
  };

  const resetSimulation = () => {
    const resetFixtures = fixtures.map(match => ({
      ...match,
      played: false,
      homeScore: undefined,
      awayScore: undefined,
    }));
    
    onSimulate(resetFixtures);
    toast.info("Simulation reset");
  };

  const matchdays = Array.from(new Set(fixtures.map(f => f.matchday))).sort((a, b) => a - b);
  const playedMatches = fixtures.filter(f => f.played).length;
  const totalMatches = fixtures.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-outfit font-bold text-gradient-gold">
          Match Simulator
        </h2>
        <p className="text-muted-foreground">
          Simulate matches based on team coefficients and home advantage
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-accent font-outfit">{playedMatches}</div>
            <div className="text-sm text-muted-foreground">Matches Played</div>
          </div>
          <div className="text-muted-foreground">/</div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground font-outfit">{totalMatches}</div>
            <div className="text-sm text-muted-foreground">Total Matches</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button
          size="lg"
          onClick={simulateAllMatches}
          disabled={isSimulating || playedMatches === totalMatches}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-outfit font-semibold"
        >
          <Play className="mr-2 h-5 w-5" />
          Simulate All Matches
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={resetSimulation}
          disabled={isSimulating || playedMatches === 0}
          className="border-accent/30 hover:bg-accent/10 font-outfit font-semibold"
        >
          <RotateCw className="mr-2 h-5 w-5" />
          Reset Simulation
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {matchdays.map(matchday => {
          const matchdayFixtures = fixtures.filter(f => f.matchday === matchday);
          const played = matchdayFixtures.filter(f => f.played).length;
          const total = matchdayFixtures.length;
          
          return (
            <Button
              key={matchday}
              variant="outline"
              onClick={() => simulateMatchday(matchday)}
              disabled={isSimulating || played === total}
              className="border-border hover:border-accent/50 hover:bg-muted/50 font-outfit"
            >
              Matchday {matchday}
              <span className="ml-2 text-xs text-muted-foreground">
                ({played}/{total})
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default MatchSimulator;
