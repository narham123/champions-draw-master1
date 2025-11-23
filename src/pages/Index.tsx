import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Team, Match } from "@/types/team";
import { defaultTeams } from "@/lib/defaultTeams";
import { calculateStandings } from "@/lib/standings";
import TeamManagement from "@/components/TeamManagement";
import DrawCeremony from "@/components/DrawCeremony";
import Fixtures from "@/components/Fixtures";
import Standings from "@/components/Standings";
import MatchSimulator from "@/components/MatchSimulator";
import ExportData from "@/components/ExportData";
import { Trophy } from "lucide-react";

const Index = () => {
  const [teams, setTeams] = useState<Team[]>(defaultTeams);
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState("teams");

  const standings = calculateStandings(teams, fixtures);

  const handleDrawComplete = (newFixtures: Match[]) => {
    setFixtures(newFixtures);
    setActiveTab("fixtures");
  };

  const handleSimulation = (updatedFixtures: Match[]) => {
    setFixtures(updatedFixtures);
  };

  const handleAddTeam = (team: Team) => {
    setTeams([...teams, team]);
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId));
    // Remove team from fixtures if they exist
    if (fixtures.length > 0) {
      const updatedFixtures = fixtures.filter(
        f => f.homeTeam.id !== teamId && f.awayTeam.id !== teamId
      );
      setFixtures(updatedFixtures);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <Trophy className="w-10 h-10 text-accent animate-glow" />
            <h1 className="text-4xl md:text-5xl font-outfit font-bold text-gradient-gold">
              UEFA Champions League
            </h1>
          </div>
          <p className="text-center text-muted-foreground mt-2 font-inter">
            Swiss System Draw & Match Generator
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8 bg-card border border-border p-1 h-auto">
            <TabsTrigger 
              value="teams" 
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-outfit font-semibold py-3"
            >
              Teams
            </TabsTrigger>
            <TabsTrigger 
              value="draw"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-outfit font-semibold py-3"
            >
              Draw
            </TabsTrigger>
            <TabsTrigger 
              value="fixtures"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-outfit font-semibold py-3"
              disabled={fixtures.length === 0}
            >
              Fixtures
            </TabsTrigger>
            <TabsTrigger 
              value="standings"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-outfit font-semibold py-3"
              disabled={fixtures.length === 0}
            >
              Standings
            </TabsTrigger>
            <TabsTrigger 
              value="simulate"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-outfit font-semibold py-3"
              disabled={fixtures.length === 0}
            >
              Simulate
            </TabsTrigger>
            <TabsTrigger 
              value="export"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-outfit font-semibold py-3"
              disabled={fixtures.length === 0}
            >
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="mt-0">
            <TeamManagement 
              teams={teams} 
              onAddTeam={handleAddTeam}
              onDeleteTeam={handleDeleteTeam}
            />
          </TabsContent>

          <TabsContent value="draw" className="mt-0">
            <DrawCeremony 
              teams={teams} 
              onDrawComplete={handleDrawComplete}
              hasExistingDraw={fixtures.length > 0}
            />
          </TabsContent>

          <TabsContent value="fixtures" className="mt-0">
            <Fixtures fixtures={fixtures} />
          </TabsContent>

          <TabsContent value="standings" className="mt-0">
            <Standings standings={standings} />
          </TabsContent>

          <TabsContent value="simulate" className="mt-0">
            <MatchSimulator fixtures={fixtures} onSimulate={handleSimulation} />
          </TabsContent>

          <TabsContent value="export" className="mt-0">
            <ExportData fixtures={fixtures} standings={standings} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
