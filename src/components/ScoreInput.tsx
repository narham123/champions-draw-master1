import { useState } from "react";
import { Match } from "@/types/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ScoreInputProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (matchId: string, homeScore: number, awayScore: number) => void;
  onReset: (matchId: string) => void;
}

const ScoreInput = ({ match, open, onOpenChange, onSave, onReset }: ScoreInputProps) => {
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && match) {
      setHomeScore(match.homeScore?.toString() || "");
      setAwayScore(match.awayScore?.toString() || "");
    }
    onOpenChange(isOpen);
  };

  const handleSave = () => {
    if (!match) return;

    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (isNaN(home) || isNaN(away)) {
      toast.error("Please enter valid scores");
      return;
    }

    if (home < 0 || away < 0) {
      toast.error("Scores cannot be negative");
      return;
    }

    if (home > 20 || away > 20) {
      toast.error("Score seems unrealistic (max 20)");
      return;
    }

    onSave(match.id, home, away);
    toast.success("Score updated successfully");
    handleOpen(false);
  };

  const handleReset = () => {
    if (!match) return;
    onReset(match.id);
    toast.success("Match score reset");
    handleOpen(false);
  };

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-outfit text-gradient-gold">
            Edit Match Score
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="text-center">
                {match.homeTeam.logo && (
                  <img 
                    src={match.homeTeam.logo} 
                    alt={match.homeTeam.name}
                    className="w-12 h-12 mx-auto mb-2 object-contain"
                  />
                )}
                <div className="text-sm font-outfit font-semibold text-foreground">
                  {match.homeTeam.name}
                </div>
              </div>
              <div>
                <Label htmlFor="homeScore" className="text-xs text-muted-foreground">
                  Home Score
                </Label>
                <Input
                  id="homeScore"
                  type="number"
                  min="0"
                  max="20"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="text-center text-2xl font-bold h-16 bg-secondary border-border"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="text-3xl font-outfit font-bold text-muted-foreground">
              -
            </div>

            <div className="flex-1 space-y-3">
              <div className="text-center">
                {match.awayTeam.logo && (
                  <img 
                    src={match.awayTeam.logo} 
                    alt={match.awayTeam.name}
                    className="w-12 h-12 mx-auto mb-2 object-contain"
                  />
                )}
                <div className="text-sm font-outfit font-semibold text-foreground">
                  {match.awayTeam.name}
                </div>
              </div>
              <div>
                <Label htmlFor="awayScore" className="text-xs text-muted-foreground">
                  Away Score
                </Label>
                <Input
                  id="awayScore"
                  type="number"
                  min="0"
                  max="20"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="text-center text-2xl font-bold h-16 bg-secondary border-border"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Matchday {match.matchday}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
            disabled={!match.played}
          >
            Reset Score
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-accent hover:bg-accent/90"
          >
            Save Score
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreInput;
