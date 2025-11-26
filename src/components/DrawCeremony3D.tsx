import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, RotateCw, Volume2, VolumeX, Trophy } from "lucide-react";
import { Team, Match } from "@/types/team";
import { TournamentRules } from "@/types/tournamentRules";
import { conductSequentialDraw, DrawStep } from "@/lib/drawEngine";
import { toast } from "sonner";
import TeamBall3D from "./TeamBall3D";
import DrawBowl3D from "./DrawBowl3D";

interface DrawCeremony3DProps {
  teams: Team[];
  rules: TournamentRules;
  onDrawComplete: (fixtures: Match[]) => void;
  hasExistingDraw: boolean;
}

const DrawCeremony3D = ({ teams, rules, onDrawComplete, hasExistingDraw }: DrawCeremony3DProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStep, setCurrentStep] = useState<DrawStep | null>(null);
  const [currentTeamSchedule, setCurrentTeamSchedule] = useState<DrawStep[]>([]);
  const [drawProgress, setDrawProgress] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [commentary, setCommentary] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playSound = () => {
    if (soundEnabled) {
      const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjWJ0fPTgjMGHm7A7+OZSA0PVarg8LJlHg=');
      beep.volume = 0.2;
      beep.play().catch(() => {});
    }
  };

  const startDraw = async () => {
    if (teams.length < 16) {
      toast.error("At least 16 teams are required for the draw");
      return;
    }

    setIsDrawing(true);
    setDrawProgress(0);
    setCurrentTeamSchedule([]);
    setCommentary("The draw ceremony begins...");
    
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    const result = conductSequentialDraw(teams, rules);
    
    if (result.errors.length > 0) {
      toast.error("Draw encountered issues", {
        description: result.errors.join(", "),
      });
    }

    setTotalSteps(result.steps.length);

    // Group steps by current team
    const stepsByTeam = new Map<string, DrawStep[]>();
    result.steps.forEach(step => {
      const teamId = step.currentTeam.id;
      if (!stepsByTeam.has(teamId)) {
        stepsByTeam.set(teamId, []);
      }
      stepsByTeam.get(teamId)!.push(step);
    });

    let stepIndex = 0;

    // Animate each team's draw
    for (const [teamId, teamSteps] of stepsByTeam.entries()) {
      setCurrentTeamSchedule([]);
      setCommentary(`Drawing opponents for ${teamSteps[0].currentTeam.name}...`);
      
      // Dramatic pause before starting this team's draws
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Draw each opponent for this team
      for (const step of teamSteps) {
        playSound();
        setCurrentStep(step);
        setCurrentTeamSchedule(prev => [...prev, step]);
        setDrawProgress((stepIndex + 1) / result.steps.length * 100);
        
        const venue = step.isHome ? "at home" : "away";
        setCommentary(
          `${step.currentTeam.name} will face ${step.opponent.name} ${venue} on Matchday ${step.matchday}`
        );
        
        stepIndex++;
        
        // Pause between draws
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
      
      // Longer pause between teams
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setIsDrawing(false);
    setCommentary("Draw ceremony complete!");
    onDrawComplete(result.fixtures);
    
    toast.success("Draw completed!", {
      description: `${result.fixtures.length} matches generated`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-outfit font-bold text-gradient-gold">
          UEFA Champions League Draw Ceremony
        </h2>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience the excitement of the official draw ceremony with team-by-team opponent selection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Canvas */}
        <div className="lg:col-span-2">
          <div className="relative w-full h-[500px] bg-gradient-to-b from-uefa-dark to-uefa-darker rounded-2xl overflow-hidden border border-accent/30">
            <Canvas camera={{ position: [0, 0, 8] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
              
              {isDrawing && currentStep && (
                <>
                  <DrawBowl3D position={[-3, -2, 0]} color="#1a1a2e" />
                  <DrawBowl3D position={[3, -2, 0]} color="#2a2a3e" />
                  <TeamBall3D 
                    team={currentStep.currentTeam} 
                    position={[-3, 1, 0]} 
                    isAnimating={true}
                  />
                  <TeamBall3D 
                    team={currentStep.opponent} 
                    position={[3, 1, 0]} 
                    isAnimating={true}
                  />
                </>
              )}
              
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
            
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-background/20 backdrop-blur-sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            {commentary && (
              <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-accent/30">
                <p className="text-sm font-outfit text-center text-foreground">{commentary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Current Team Schedule */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-card border-accent/30 h-[500px] overflow-y-auto">
            {isDrawing && currentStep ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-6 h-6 text-accent" />
                  <h3 className="text-xl font-outfit font-bold">Drawing For</h3>
                </div>
                
                <div className="mb-6 p-4 bg-accent/10 rounded-lg border border-accent/30">
                  {currentStep.currentTeam.logo && (
                    <img 
                      src={currentStep.currentTeam.logo} 
                      alt={currentStep.currentTeam.name}
                      className="w-16 h-16 mx-auto mb-3 object-contain"
                    />
                  )}
                  <div className="text-center">
                    <div className="text-lg font-outfit font-bold text-foreground">
                      {currentStep.currentTeam.name}
                    </div>
                    <Badge className="mt-2 bg-primary/20 border-primary">
                      Pot {currentStep.currentTeam.pot} · {currentStep.currentTeam.country}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-outfit font-semibold text-muted-foreground">
                    Opponents ({currentTeamSchedule.length}/{rules.numberOfMatchdays})
                  </h4>
                  
                  {currentTeamSchedule.map((step, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg animate-fade-in"
                    >
                      {step.opponent.logo && (
                        <img 
                          src={step.opponent.logo} 
                          alt={step.opponent.name}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-outfit font-semibold text-foreground truncate">
                          {step.opponent.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          MD{step.matchday} · {step.isHome ? 'Home' : 'Away'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="text-xs text-muted-foreground mb-2 text-center">
                    Overall Progress
                  </div>
                  <Progress value={drawProgress} className="h-2" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Trophy className="w-16 h-16 text-accent/50 mb-4" />
                <p className="text-muted-foreground font-outfit">
                  Start the draw to see the ceremony unfold
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {!isDrawing && (
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
    </div>
  );
};

export default DrawCeremony3D;
