import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, RotateCcw, Info } from "lucide-react";
import { TournamentRules, defaultTournamentRules, tournamentRulesSchema } from "@/types/tournamentRules";
import { toast } from "sonner";

interface TournamentRulesEditorProps {
  rules: TournamentRules;
  onRulesChange: (rules: TournamentRules) => void;
  disabled?: boolean;
}

const TournamentRulesEditor = ({ rules, onRulesChange, disabled = false }: TournamentRulesEditorProps) => {
  const [localRules, setLocalRules] = useState<TournamentRules>(rules);
  const [activeTab, setActiveTab] = useState("swiss");

  const updateRule = <K extends keyof TournamentRules>(key: K, value: TournamentRules[K]) => {
    setLocalRules(prev => ({ ...prev, [key]: value }));
  };

  const saveRules = () => {
    try {
      const validated = tournamentRulesSchema.parse(localRules);
      onRulesChange(validated);
      toast.success("Tournament rules saved!", {
        description: "Your configuration has been applied.",
      });
    } catch (error) {
      toast.error("Invalid configuration", {
        description: "Please check your settings and try again.",
      });
    }
  };

  const resetToDefaults = () => {
    setLocalRules(defaultTournamentRules);
    onRulesChange(defaultTournamentRules);
    toast.success("Rules reset to defaults");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 bg-gradient-to-br from-primary to-uefa-dark rounded-2xl glow-blue">
          <Settings className="w-12 h-12 text-accent animate-glow" />
        </div>
        
        <h2 className="text-3xl font-outfit font-bold text-gradient-gold">
          Tournament Rules Configuration
        </h2>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Customize Swiss system parameters, qualification criteria, and match settings to create your perfect tournament format.
        </p>
      </div>

      {disabled && (
        <Card className="p-4 bg-destructive/10 border-destructive/30">
          <div className="flex items-center gap-2 text-destructive">
            <Info className="w-5 h-5" />
            <p className="font-outfit">
              Rules cannot be changed after the draw has been conducted. Reset the tournament to modify rules.
            </p>
          </div>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
          <TabsTrigger value="swiss" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            Swiss System
          </TabsTrigger>
          <TabsTrigger value="qualification" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            Qualification
          </TabsTrigger>
          <TabsTrigger value="match" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            Match Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="swiss" className="mt-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-xl font-outfit font-bold mb-6">Swiss System Configuration</h3>
            
            <div className="space-y-6">
              {/* Number of Matchdays */}
              <div className="space-y-2">
                <Label htmlFor="matchdays" className="text-base font-outfit">
                  Number of Matchdays
                </Label>
                <Input
                  id="matchdays"
                  type="number"
                  min={6}
                  max={10}
                  value={localRules.numberOfMatchdays}
                  onChange={(e) => updateRule("numberOfMatchdays", parseInt(e.target.value) || 8)}
                  disabled={disabled}
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  Total matches each team plays (6-10)
                </p>
              </div>

              {/* Home/Away Balance */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="homeaway" className="text-base font-outfit">
                    Home/Away Balance
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ensure equal home and away matches for each team
                  </p>
                </div>
                <Switch
                  id="homeaway"
                  checked={localRules.homeAwayBalance}
                  onCheckedChange={(checked) => updateRule("homeAwayBalance", checked)}
                  disabled={disabled}
                />
              </div>

              {/* Country Protection */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="country" className="text-base font-outfit">
                    Country Protection
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent teams from the same country playing each other
                  </p>
                </div>
                <Switch
                  id="country"
                  checked={localRules.countryProtection}
                  onCheckedChange={(checked) => updateRule("countryProtection", checked)}
                  disabled={disabled}
                />
              </div>

              {/* No Rematches */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="rematches" className="text-base font-outfit">
                    No Rematches
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Teams cannot play each other more than once
                  </p>
                </div>
                <Switch
                  id="rematches"
                  checked={localRules.noRematches}
                  onCheckedChange={(checked) => updateRule("noRematches", checked)}
                  disabled={disabled}
                />
              </div>

              {/* Pot Protection */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="pot" className="text-base font-outfit">
                    Pot Protection (First Round)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Teams from same pot cannot meet in matchday 1
                  </p>
                </div>
                <Switch
                  id="pot"
                  checked={localRules.potProtection}
                  onCheckedChange={(checked) => updateRule("potProtection", checked)}
                  disabled={disabled}
                />
              </div>

              {/* Max Teams Per Country */}
              <div className="space-y-2">
                <Label htmlFor="maxcountry" className="text-base font-outfit">
                  Max Teams From Same Country
                </Label>
                <Input
                  id="maxcountry"
                  type="number"
                  min={1}
                  max={8}
                  value={localRules.maxTeamsPerCountry}
                  onChange={(e) => updateRule("maxTeamsPerCountry", parseInt(e.target.value) || 2)}
                  disabled={disabled}
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum teams allowed from one country (1-8)
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="qualification" className="mt-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-xl font-outfit font-bold mb-6">Qualification Criteria</h3>
            
            <div className="space-y-6">
              {/* Auto Qualify Top */}
              <div className="space-y-2">
                <Label htmlFor="autoqualify" className="text-base font-outfit">
                  Direct Qualification Positions
                </Label>
                <Input
                  id="autoqualify"
                  type="number"
                  min={0}
                  max={16}
                  value={localRules.autoQualifyTop}
                  onChange={(e) => updateRule("autoQualifyTop", parseInt(e.target.value) || 8)}
                  disabled={disabled}
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  Top positions that automatically qualify (0-16)
                </p>
              </div>

              {/* Playoff Start Position */}
              <div className="space-y-2">
                <Label htmlFor="playoffstart" className="text-base font-outfit">
                  Playoff Start Position
                </Label>
                <Input
                  id="playoffstart"
                  type="number"
                  min={9}
                  max={17}
                  value={localRules.playoffPositionsStart}
                  onChange={(e) => updateRule("playoffPositionsStart", parseInt(e.target.value) || 9)}
                  disabled={disabled}
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  First position entering playoffs (9-17)
                </p>
              </div>

              {/* Playoff End Position */}
              <div className="space-y-2">
                <Label htmlFor="playoffend" className="text-base font-outfit">
                  Playoff End Position
                </Label>
                <Input
                  id="playoffend"
                  type="number"
                  min={16}
                  max={24}
                  value={localRules.playoffPositionsEnd}
                  onChange={(e) => updateRule("playoffPositionsEnd", parseInt(e.target.value) || 24)}
                  disabled={disabled}
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  Last position entering playoffs (16-24)
                </p>
              </div>

              {/* Elimination Position */}
              <div className="space-y-2">
                <Label htmlFor="elimination" className="text-base font-outfit">
                  Elimination Position
                </Label>
                <Input
                  id="elimination"
                  type="number"
                  min={24}
                  max={36}
                  value={localRules.eliminationPosition}
                  onChange={(e) => updateRule("eliminationPosition", parseInt(e.target.value) || 25)}
                  disabled={disabled}
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  Teams below this position are eliminated (24-36)
                </p>
              </div>

              <Card className="p-4 bg-accent/10 border-accent/30 mt-6">
                <h4 className="font-outfit font-semibold text-accent mb-2">Current Configuration</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>🏆 Positions 1-{localRules.autoQualifyTop}: Direct qualification</li>
                  <li>⚔️ Positions {localRules.playoffPositionsStart}-{localRules.playoffPositionsEnd}: Enter playoffs</li>
                  <li>❌ Position {localRules.eliminationPosition}+: Eliminated</li>
                </ul>
              </Card>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="match" className="mt-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-xl font-outfit font-bold mb-6">Match Settings</h3>
            
            <div className="space-y-6">
              {/* Allow Draws */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="draws" className="text-base font-outfit">
                    Allow Draws (Group Stage)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permit drawn matches during the Swiss system phase
                  </p>
                </div>
                <Switch
                  id="draws"
                  checked={localRules.allowDraws}
                  onCheckedChange={(checked) => updateRule("allowDraws", checked)}
                  disabled={disabled}
                />
              </div>

              {/* Extra Time in Knockout */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="extratime" className="text-base font-outfit">
                    Extra Time in Knockouts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add extra time to playoff matches if tied
                  </p>
                </div>
                <Switch
                  id="extratime"
                  checked={localRules.extraTimeInKnockout}
                  onCheckedChange={(checked) => updateRule("extraTimeInKnockout", checked)}
                  disabled={disabled}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center gap-4">
        <Button
          onClick={saveRules}
          disabled={disabled}
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-outfit font-semibold px-8"
        >
          <Save className="mr-2 h-5 w-5" />
          Save Configuration
        </Button>
        
        <Button
          onClick={resetToDefaults}
          disabled={disabled}
          variant="outline"
          size="lg"
          className="border-accent/30 hover:bg-accent/10 font-outfit font-semibold px-8"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default TournamentRulesEditor;
