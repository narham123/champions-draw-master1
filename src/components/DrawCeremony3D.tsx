import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCw, Volume2, VolumeX } from "lucide-react";
import { Team, Match } from "@/types/team";
import { TournamentRules } from "@/types/tournamentRules";
import { conductSwissDraw } from "@/lib/drawEngine";
import { toast } from "sonner";
import DrawBall3D from "./DrawBall3D";

interface DrawCeremony3DProps {
  teams: Team[];
  rules: TournamentRules;
  onDrawComplete: (fixtures: Match[]) => void;
  hasExistingDraw: boolean;
}

const DrawCeremony3D = ({ teams, rules, onDrawComplete, hasExistingDraw }: DrawCeremony3DProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [drawProgress, setDrawProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for crowd ambience
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
    if (soundEnabled && audioRef.current) {
      // Using a data URL for a simple ambient sound effect
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
    
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    const result = conductSwissDraw(teams, rules);
    
    if (result.errors.length > 0) {
      toast.error("Draw encountered issues", {
        description: result.errors.join(", "),
      });
    }

    // Dramatic animated draw with pauses
    for (let i = 0; i < Math.min(15, result.fixtures.length); i++) {
      playSound();
      setCurrentMatch(result.fixtures[i]);
      setDrawProgress((i + 1) / result.fixtures.length * 100);
      
      // Dramatic pause between draws
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    if (audioRef.current) {
      audioRef.current.pause();
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
        <h2 className="text-4xl font-outfit font-bold text-gradient-gold">
          UEFA Champions League Draw Ceremony
        </h2>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience the excitement of the official draw ceremony with 3D ball animations and stadium atmosphere.
        </p>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[400px] bg-gradient-to-b from-uefa-dark to-uefa-darker rounded-2xl overflow-hidden border border-accent/30">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          {isDrawing && <DrawBall3D position={[0, 0, 0]} isAnimating={true} />}
          
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
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-muted-foreground font-outfit">Drawing matches...</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center space-y-2">
              {currentMatch.homeTeam.logo && (
                <img 
                  src={currentMatch.homeTeam.logo} 
                  alt={currentMatch.homeTeam.name}
                  className="w-16 h-16 mx-auto object-contain"
                />
              )}
              <div className="text-2xl font-outfit font-bold text-foreground">
                {currentMatch.homeTeam.name}
              </div>
              <Badge className="bg-primary/20 border-primary text-foreground">
                {currentMatch.homeTeam.country}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-6xl font-outfit font-bold text-accent animate-pulse">VS</div>
            </div>
            
            <div className="text-center space-y-2">
              {currentMatch.awayTeam.logo && (
                <img 
                  src={currentMatch.awayTeam.logo} 
                  alt={currentMatch.awayTeam.name}
                  className="w-16 h-16 mx-auto object-contain"
                />
              )}
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

export default DrawCeremony3D;
