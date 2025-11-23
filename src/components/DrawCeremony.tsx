import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, Loader2, RotateCw } from "lucide-react";
import { Team, Match } from "@/types/team";
import { conductSwissDraw } from "@/lib/drawEngine";
import { toast } from "sonner";

interface DrawCeremonyProps {
  teams: Team[];
  onDrawComplete: (fixtures: Match[]) => void;
  hasExistingDraw: boolean;
}

const DrawCeremony = ({ teams, onDrawComplete, hasExistingDraw }: DrawCeremonyProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [drawProgress, setDrawProgress] = useState(0);

  const startDraw = async () => {
    if (teams.length < 16) {
      toast.error("At least 16 teams are required for the draw");
      return;
    }

    setIsDrawing(true);
    setDrawProgress(0);

    // Simulate animated draw
    const result = conductSwissDraw(teams);
    
    if (result.errors.length > 0) {
      toast.error("Draw encountered issues", {
        description: result.errors.join(", "),
      });
    }

    // Animate through some fixtures
    for (let i = 0; i < Math.min(10, result.fixtures.length); i++) {
      setCurrentMatch(result.fixtures[i]);
      setDrawProgress((i + 1) / result.fixtures.length * 100);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsDrawing(false);
    onDrawComplete(result.fixtures);
    
    toast.success("Draw completed!", {
      description: `${result.fixtures.length} matches generated`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 bg-gradient-to-br from-primary to-uefa-dark rounded-2xl glow-blue">
          <Sparkles className="w-16 h-16 text-accent animate-glow" />
        </div>
        
        <h2 className="text-4xl font-outfit font-bold text-gradient-gold">
          UEFA Champions League Draw
        </h2>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience the excitement of the official draw ceremony. Watch as the Swiss System 
          algorithm generates fair matchups with country protection and no rematches.
        </p>
      </div>

      {!isDrawing && !currentMatch && (
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            onClick={startDraw}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-outfit font-bold text-lg px-8 py-6 glow-gold"
          >
            <Play className="mr-2 h-5 w-5" />
            {hasExistingDraw ? 'Re-run Draw' : 'Conduct Draw'}
          </Button>
          {hasExistingDraw && (
            <Button
              size="lg"
              variant="outline"
              onClick={startDraw}
              className="border-accent/30 hover:bg-accent/10 font-outfit font-semibold text-lg px-8 py-6"
            >
              <RotateCw className="mr-2 h-5 w-5" />
              New Draw
            </Button>
          )}
        </div>
      )}

      {isDrawing && currentMatch && (
        <Card className="p-8 bg-card border-accent/30 max-w-3xl mx-auto animate-slide-up">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span className="text-muted-foreground">Drawing matches...</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center space-y-2">
              <div className="text-2xl font-outfit font-bold text-foreground">
                {currentMatch.homeTeam.name}
              </div>
              <Badge className="bg-primary/20 border-primary text-foreground">
                {currentMatch.homeTeam.country}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-6xl font-outfit font-bold text-accent">VS</div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-2xl font-outfit font-bold text-foreground">
                {currentMatch.awayTeam.name}
              </div>
              <Badge className="bg-primary/20 border-primary text-foreground">
                {currentMatch.awayTeam.country}
              </Badge>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">
              Matchday {currentMatch.matchday}
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${drawProgress}%` }}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DrawCeremony;
