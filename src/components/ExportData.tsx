import { Button } from "@/components/ui/button";
import { Match, StandingsEntry } from "@/types/team";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface ExportDataProps {
  fixtures: Match[];
  standings: StandingsEntry[];
}

const ExportData = ({ fixtures, standings }: ExportDataProps) => {
  const exportToJSON = (data: any, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded!`);
  };

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const value = row[h] ?? '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded!`);
  };

  const exportFixturesJSON = () => {
    const data = fixtures.map(f => ({
      matchday: f.matchday,
      homeTeam: f.homeTeam.name,
      awayTeam: f.awayTeam.name,
      homeScore: f.homeScore ?? '-',
      awayScore: f.awayScore ?? '-',
      played: f.played,
    }));
    exportToJSON(data, 'ucl-fixtures.json');
  };

  const exportFixturesCSV = () => {
    const data = fixtures.map(f => ({
      matchday: f.matchday,
      homeTeam: f.homeTeam.name,
      awayTeam: f.awayTeam.name,
      homeScore: f.homeScore ?? '',
      awayScore: f.awayScore ?? '',
      played: f.played ? 'Yes' : 'No',
    }));
    exportToCSV(data, 'ucl-fixtures.csv', ['matchday', 'homeTeam', 'awayTeam', 'homeScore', 'awayScore', 'played']);
  };

  const exportStandingsJSON = () => {
    const data = standings.map((s, i) => ({
      position: i + 1,
      team: s.team.name,
      country: s.team.country,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalDifference,
      points: s.points,
    }));
    exportToJSON(data, 'ucl-standings.json');
  };

  const exportStandingsCSV = () => {
    const data = standings.map((s, i) => ({
      position: i + 1,
      team: s.team.name,
      country: s.team.country,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalDifference,
      points: s.points,
    }));
    exportToCSV(
      data, 
      'ucl-standings.csv', 
      ['position', 'team', 'country', 'played', 'won', 'drawn', 'lost', 'goalsFor', 'goalsAgainst', 'goalDifference', 'points']
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 bg-gradient-to-br from-primary to-uefa-dark rounded-2xl">
          <Download className="w-16 h-16 text-accent" />
        </div>
        
        <h2 className="text-4xl font-outfit font-bold text-gradient-gold">
          Export Data
        </h2>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Download fixtures and standings in JSON or CSV format for analysis
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h3 className="text-xl font-outfit font-semibold text-accent flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Fixtures
          </h3>
          <div className="grid gap-3">
            <Button
              onClick={exportFixturesJSON}
              className="w-full bg-card hover:bg-muted border border-border text-foreground justify-start font-outfit"
              variant="outline"
            >
              <FileJson className="mr-2 h-4 w-4 text-accent" />
              Export as JSON
            </Button>
            <Button
              onClick={exportFixturesCSV}
              className="w-full bg-card hover:bg-muted border border-border text-foreground justify-start font-outfit"
              variant="outline"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4 text-accent" />
              Export as CSV
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-outfit font-semibold text-accent flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Standings
          </h3>
          <div className="grid gap-3">
            <Button
              onClick={exportStandingsJSON}
              className="w-full bg-card hover:bg-muted border border-border text-foreground justify-start font-outfit"
              variant="outline"
            >
              <FileJson className="mr-2 h-4 w-4 text-accent" />
              Export as JSON
            </Button>
            <Button
              onClick={exportStandingsCSV}
              className="w-full bg-card hover:bg-muted border border-border text-foreground justify-start font-outfit"
              variant="outline"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4 text-accent" />
              Export as CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
