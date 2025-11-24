import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Play, RotateCw } from "lucide-react";
import { StandingsEntry } from "@/types/team";
import { TournamentRules } from "@/types/tournamentRules";
import { generatePlayoffBracket, simulatePlayoffMatch, advanceWinner, PlayoffMatch } from "@/lib/playoffBracket";
import { toast } from "sonner";

interface PlayoffBracketProps {
  standings: StandingsEntry[];
  rules: TournamentRules;
}

const PlayoffBracket = ({ standings, rules }: PlayoffBracketProps) => {
  const [matches, setMatches] = useState<PlayoffMatch[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>("round-of-16");

  useEffect(() => {
    const requiredTeams = rules.playoffPositionsEnd - rules.playoffPositionsStart + 1;
    if (standings.length >= rules.playoffPositionsEnd) {
      const bracket = generatePlayoffBracket(standings, rules);
      setMatches(bracket);
    }
  }, [standings, rules]);

  const simulateMatch = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || !match.homeTeam || !match.awayTeam) {
      toast.error("Match not ready for simulation");
      return;
    }

    const simulatedMatch = simulatePlayoffMatch(match, rules.extraTimeInKnockout);
    let updatedMatches = matches.map(m => m.id === matchId ? simulatedMatch : m);
    updatedMatches = advanceWinner(updatedMatches, matchId);
    
    setMatches(updatedMatches);
    toast.success("Match simulated!", {
      description: `${simulatedMatch.homeTeam?.name} ${simulatedMatch.homeScore} - ${simulatedMatch.awayScore} ${simulatedMatch.awayTeam?.name}`,
    });
  };

  const simulateRound = (round: string) => {
    let updatedMatches = [...matches];
    const roundMatches = updatedMatches.filter(m => m.round === round && !m.played && m.homeTeam && m.awayTeam);
    
    roundMatches.forEach(match => {
      const simulatedMatch = simulatePlayoffMatch(match, rules.extraTimeInKnockout);
      updatedMatches = updatedMatches.map(m => m.id === match.id ? simulatedMatch : m);
      updatedMatches = advanceWinner(updatedMatches, match.id);
    });
    
    setMatches(updatedMatches);
    toast.success(`${round.replace("-", " ")} simulated!`);
  };

  const resetBracket = () => {
    const bracket = generatePlayoffBracket(standings, rules);
    setMatches(bracket);
    toast.success("Bracket reset!");
  };

  const renderMatch = (match: PlayoffMatch) => (
    <Card key={match.id} className="p-4 bg-card border-border hover:border-accent/50 transition-all">
      <div className="space-y-3">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {match.homeTeam?.logo && (
              <img 
                src={match.homeTeam.logo} 
                alt={match.homeTeam.name}
                className="w-8 h-8 object-contain"
              />
            )}
            <span className={`font-outfit ${match.played && (match.homeScore ?? 0) > (match.awayScore ?? 0) ? 'font-bold text-accent' : ''}`}>
              {match.homeTeam?.name || "TBD"}
            </span>
          </div>
          {match.played && (
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
              {match.homeScore}
            </Badge>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {match.awayTeam?.logo && (
              <img 
                src={match.awayTeam.logo} 
                alt={match.awayTeam.name}
                className="w-8 h-8 object-contain"
              />
            )}
            <span className={`font-outfit ${match.played && (match.awayScore ?? 0) > (match.homeScore ?? 0) ? 'font-bold text-accent' : ''}`}>
              {match.awayTeam?.name || "TBD"}
            </span>
          </div>
          {match.played && (
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
              {match.awayScore}
            </Badge>
          )}
        </div>

        {/* Simulate Button */}
        {!match.played && match.homeTeam && match.awayTeam && (
          <Button 
            size="sm" 
            onClick={() => simulateMatch(match.id)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Play className="mr-2 h-3 w-3" />
            Simulate
          </Button>
        )}
      </div>
    </Card>
  );

  if (standings.length < rules.playoffPositionsEnd) {
    return (
      <div className="text-center p-12 space-y-4">
        <Trophy className="w-16 h-16 mx-auto text-muted-foreground" />
        <h3 className="text-2xl font-outfit font-bold">Playoff Bracket Not Available</h3>
        <p className="text-muted-foreground">
          Complete the group stage to generate the playoff bracket for teams finishing {rules.playoffPositionsStart}-{rules.playoffPositionsEnd}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 bg-gradient-to-br from-primary to-uefa-dark rounded-2xl glow-blue">
          <Trophy className="w-12 h-12 text-accent animate-glow" />
        </div>
        
        <h2 className="text-3xl font-outfit font-bold text-gradient-gold">
          Knockout Playoff Bracket
        </h2>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Teams finishing 9-24 compete in a knockout playoff for advancement. Click to simulate matches and watch the bracket progress.
        </p>

        <div className="flex justify-center gap-4">
          <Button onClick={resetBracket} variant="outline" className="border-accent/30">
            <RotateCw className="mr-2 h-4 w-4" />
            Reset Bracket
          </Button>
        </div>
      </div>

      <Tabs value={selectedRound} onValueChange={setSelectedRound} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
          <TabsTrigger value="round-of-16" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            Round of 16
          </TabsTrigger>
          <TabsTrigger value="quarter-finals" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            Quarter Finals
          </TabsTrigger>
          <TabsTrigger value="semi-finals" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            Semi Finals
          </TabsTrigger>
          <TabsTrigger value="final" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            Final
          </TabsTrigger>
        </TabsList>

        <TabsContent value="round-of-16" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-outfit font-bold">Round of 16</h3>
            <Button onClick={() => simulateRound("round-of-16")} size="sm">
              <Play className="mr-2 h-4 w-4" />
              Simulate All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {matches.filter(m => m.round === "round-of-16").map(renderMatch)}
          </div>
        </TabsContent>

        <TabsContent value="quarter-finals" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-outfit font-bold">Quarter Finals</h3>
            <Button onClick={() => simulateRound("quarter-finals")} size="sm">
              <Play className="mr-2 h-4 w-4" />
              Simulate All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {matches.filter(m => m.round === "quarter-finals").map(renderMatch)}
          </div>
        </TabsContent>

        <TabsContent value="semi-finals" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-outfit font-bold">Semi Finals</h3>
            <Button onClick={() => simulateRound("semi-finals")} size="sm">
              <Play className="mr-2 h-4 w-4" />
              Simulate All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {matches.filter(m => m.round === "semi-finals").map(renderMatch)}
          </div>
        </TabsContent>

        <TabsContent value="final" className="mt-6">
          <h3 className="text-xl font-outfit font-bold mb-4 text-center">The Final</h3>
          <div className="max-w-md mx-auto">
            {matches.filter(m => m.round === "final").map(match => (
              <Card key={match.id} className="p-6 bg-gradient-to-br from-uefa-dark to-uefa-darker border-accent glow-gold">
                <div className="space-y-4">
                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {match.homeTeam?.logo && (
                        <img 
                          src={match.homeTeam.logo} 
                          alt={match.homeTeam.name}
                          className="w-12 h-12 object-contain"
                        />
                      )}
                      <span className={`font-outfit text-xl ${match.played && (match.homeScore ?? 0) > (match.awayScore ?? 0) ? 'font-bold text-accent' : ''}`}>
                        {match.homeTeam?.name || "TBD"}
                      </span>
                    </div>
                    {match.played && (
                      <Badge variant="outline" className="bg-accent/20 text-accent border-accent text-2xl px-4 py-2">
                        {match.homeScore}
                      </Badge>
                    )}
                  </div>

                  <div className="text-center">
                    <Trophy className="w-8 h-8 mx-auto text-accent" />
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {match.awayTeam?.logo && (
                        <img 
                          src={match.awayTeam.logo} 
                          alt={match.awayTeam.name}
                          className="w-12 h-12 object-contain"
                        />
                      )}
                      <span className={`font-outfit text-xl ${match.played && (match.awayScore ?? 0) > (match.homeScore ?? 0) ? 'font-bold text-accent' : ''}`}>
                        {match.awayTeam?.name || "TBD"}
                      </span>
                    </div>
                    {match.played && (
                      <Badge variant="outline" className="bg-accent/20 text-accent border-accent text-2xl px-4 py-2">
                        {match.awayScore}
                      </Badge>
                    )}
                  </div>

                  {/* Simulate Button */}
                  {!match.played && match.homeTeam && match.awayTeam && (
                    <Button 
                      size="lg" 
                      onClick={() => simulateMatch(match.id)}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold glow-gold"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Simulate Final
                    </Button>
                  )}

                  {match.played && (
                    <div className="text-center pt-4 border-t border-border">
                      <p className="text-accent font-outfit font-bold text-lg">
                        🏆 Champion: {(match.homeScore ?? 0) > (match.awayScore ?? 0) ? match.homeTeam?.name : match.awayTeam?.name}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayoffBracket;
