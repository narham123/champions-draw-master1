import { Team } from "@/types/team";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Trash2, Edit } from "lucide-react";
import TeamEditor from "./TeamEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface TeamManagementProps {
  teams: Team[];
  onAddTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
}

const TeamManagement = ({ teams, onAddTeam, onDeleteTeam }: TeamManagementProps) => {
  const teamsByPot = {
    1: teams.filter(t => t.pot === 1),
    2: teams.filter(t => t.pot === 2),
    3: teams.filter(t => t.pot === 3),
    4: teams.filter(t => t.pot === 4),
  };

  const handleDelete = (teamId: string, teamName: string) => {
    onDeleteTeam(teamId);
    toast.success(`${teamName} removed from tournament`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-outfit font-bold text-gradient-gold">
            Teams & Seeding
          </h2>
        </div>
        <TeamEditor onAddTeam={onAddTeam} />
      </div>

      {[1, 2, 3, 4].map(pot => (
        <div key={pot} className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-card border-accent/30 text-accent px-4 py-1.5 text-lg font-outfit">
              POT {pot}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {teamsByPot[pot as keyof typeof teamsByPot].length} teams
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamsByPot[pot as keyof typeof teamsByPot].map((team, index) => (
              <Card 
                key={team.id}
                className="p-4 bg-card border-border hover:border-accent/50 transition-all duration-300 hover:glow-gold group"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    {team.logo && (
                      <img 
                        src={team.logo} 
                        alt={`${team.name} logo`} 
                        className="h-10 w-10 object-contain"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-outfit font-semibold text-foreground mb-1">
                        {team.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{team.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xl font-bold text-accent font-outfit">
                        {team.coefficient}
                      </div>
                      <p className="text-xs text-muted-foreground">UEFA coef.</p>
                    </div>
                    {team.id.startsWith('custom-') && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-foreground">Remove Team?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              Are you sure you want to remove {team.name} from the tournament?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(team.id, team.name)}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamManagement;
