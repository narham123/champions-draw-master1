import { StandingsEntry } from "@/types/team";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StandingsProps {
  standings: StandingsEntry[];
}

const Standings = ({ standings }: StandingsProps) => {
  const getPositionColor = (position: number) => {
    if (position <= 8) return "bg-accent/20 border-l-4 border-l-accent";
    if (position <= 24) return "bg-primary/20 border-l-4 border-l-primary";
    return "";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-accent" />
        <h2 className="text-3xl font-outfit font-bold text-gradient-gold">
          League Table
        </h2>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/30 hover:bg-primary/30 border-b border-border">
              <TableHead className="w-12 text-accent font-outfit">#</TableHead>
              <TableHead className="text-accent font-outfit">Team</TableHead>
              <TableHead className="text-center text-accent font-outfit">P</TableHead>
              <TableHead className="text-center text-accent font-outfit">W</TableHead>
              <TableHead className="text-center text-accent font-outfit">D</TableHead>
              <TableHead className="text-center text-accent font-outfit">L</TableHead>
              <TableHead className="text-center text-accent font-outfit">GF</TableHead>
              <TableHead className="text-center text-accent font-outfit">GA</TableHead>
              <TableHead className="text-center text-accent font-outfit">GD</TableHead>
              <TableHead className="text-center text-accent font-outfit font-bold">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((entry, index) => (
              <TableRow
                key={entry.team.id}
                className={`border-b border-border hover:bg-muted/50 transition-colors ${getPositionColor(index + 1)}`}
              >
                <TableCell className="font-outfit font-bold text-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {entry.team.logo && (
                      <img 
                        src={entry.team.logo} 
                        alt={`${entry.team.name} logo`} 
                        className="h-8 w-8 object-contain"
                      />
                    )}
                    <div>
                      <div className="font-outfit font-semibold text-foreground">
                        {entry.team.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.team.country}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">{entry.played}</TableCell>
                <TableCell className="text-center text-muted-foreground">{entry.won}</TableCell>
                <TableCell className="text-center text-muted-foreground">{entry.drawn}</TableCell>
                <TableCell className="text-center text-muted-foreground">{entry.lost}</TableCell>
                <TableCell className="text-center text-muted-foreground">{entry.goalsFor}</TableCell>
                <TableCell className="text-center text-muted-foreground">{entry.goalsAgainst}</TableCell>
                <TableCell className="text-center font-medium text-foreground">
                  {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                </TableCell>
                <TableCell className="text-center font-outfit font-bold text-accent text-lg">
                  {entry.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-accent/10 border-accent/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-accent" />
            <span className="text-sm text-foreground font-medium">Positions 1-8: Direct qualification to Round of 16</span>
          </div>
        </Card>
        <Card className="p-4 bg-primary/10 border-primary/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-sm text-foreground font-medium">Positions 9-24: Qualification to Knockout Play-offs</span>
          </div>
        </Card>
        <Card className="p-4 bg-muted/10 border-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted-foreground" />
            <span className="text-sm text-foreground font-medium">Positions 25-36: Elimination</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Standings;
