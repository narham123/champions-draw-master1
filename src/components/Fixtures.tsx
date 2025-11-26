import { useState } from "react";
import { Match } from "@/types/team";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MatchCommentary from "./MatchCommentary";
import ScoreInput from "./ScoreInput";

interface FixturesProps {
  fixtures: Match[];
  onUpdateScore?: (matchId: string, homeScore: number, awayScore: number) => void;
  onResetScore?: (matchId: string) => void;
}

const Fixtures = ({ fixtures, onUpdateScore, onResetScore }: FixturesProps) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  
  const fixturesByMatchday = fixtures.reduce((acc, fixture) => {
    if (!acc[fixture.matchday]) {
      acc[fixture.matchday] = [];
    }
    acc[fixture.matchday].push(fixture);
    return acc;
  }, {} as Record<number, Match[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-8 h-8 text-accent" />
        <h2 className="text-3xl font-outfit font-bold text-gradient-gold">
          Match Schedule
        </h2>
      </div>

      {Object.entries(fixturesByMatchday)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([matchday, matches]) => (
          <div key={matchday} className="space-y-3">
            <Badge className="bg-accent/20 border-accent text-accent px-4 py-1.5 text-base font-outfit">
              Matchday {matchday}
            </Badge>
            
            <div className="grid gap-3">
              {matches.map((match) => (
                <Card 
                  key={match.id}
                  className="p-4 bg-card border-border hover:border-accent/30 transition-all group"
                >
                  <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-4 items-center">
                    <div className="flex items-center justify-end gap-3">
                      {match.homeTeam.logo && (
                        <img 
                          src={match.homeTeam.logo} 
                          alt={`${match.homeTeam.name} logo`} 
                          className="h-8 w-8 object-contain"
                        />
                      )}
                      <div className="text-right space-y-1">
                        <div className="font-outfit font-semibold text-foreground">
                          {match.homeTeam.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {match.homeTeam.country}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      {match.played ? (
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-2xl font-bold text-accent font-outfit">
                            {match.homeScore}
                          </span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-2xl font-bold text-accent font-outfit">
                            {match.awayScore}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground font-outfit">vs</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-left space-y-1">
                        <div className="font-outfit font-semibold text-foreground">
                          {match.awayTeam.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {match.awayTeam.country}
                        </div>
                      </div>
                      {match.awayTeam.logo && (
                        <img 
                          src={match.awayTeam.logo} 
                          alt={`${match.awayTeam.name} logo`} 
                          className="h-8 w-8 object-contain"
                        />
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      {onUpdateScore && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingMatch(match)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Edit score"
                        >
                          <Edit className="h-4 w-4 text-accent" />
                        </Button>
                      )}
                      {match.played && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedMatch(match)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          title="View commentary"
                        >
                          <MessageSquare className="h-4 w-4 text-accent" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-outfit text-gradient-gold">
              {selectedMatch && `${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name}`}
            </DialogTitle>
          </DialogHeader>
          {selectedMatch && <MatchCommentary match={selectedMatch} />}
        </DialogContent>
      </Dialog>

      {onUpdateScore && onResetScore && (
        <ScoreInput
          match={editingMatch}
          open={!!editingMatch}
          onOpenChange={(open) => !open && setEditingMatch(null)}
          onSave={onUpdateScore}
          onReset={onResetScore}
        />
      )}
    </div>
  );
};

export default Fixtures;
