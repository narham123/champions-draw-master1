import { useState } from "react";
import { Team } from "@/types/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";

interface TeamEditorProps {
  onAddTeam: (team: Team) => void;
}

const TeamEditor = ({ onAddTeam }: TeamEditorProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [coefficient, setCoefficient] = useState("");
  const [pot, setPot] = useState<1 | 2 | 3 | 4>(1);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!name || !country || !coefficient) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newTeam: Team = {
      id: `custom-${Date.now()}`,
      name,
      country,
      coefficient: Number(coefficient),
      pot,
      logo: logoPreview || undefined,
    };

    onAddTeam(newTeam);
    toast.success(`${name} added successfully!`);
    
    // Reset form
    setName("");
    setCountry("");
    setCoefficient("");
    setPot(1);
    setLogoPreview("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-outfit font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Add Team
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-outfit text-gradient-gold">Add New Team</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a custom team with logo and coefficient
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">Team Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Manchester City"
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-foreground font-medium">Country *</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="England"
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coefficient" className="text-foreground font-medium">UEFA Coefficient *</Label>
            <Input
              id="coefficient"
              type="number"
              value={coefficient}
              onChange={(e) => setCoefficient(e.target.value)}
              placeholder="120"
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pot" className="text-foreground font-medium">Pot</Label>
            <Select value={pot.toString()} onValueChange={(v) => setPot(Number(v) as 1 | 2 | 3 | 4)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Pot 1</SelectItem>
                <SelectItem value="2">Pot 2</SelectItem>
                <SelectItem value="3">Pot 3</SelectItem>
                <SelectItem value="4">Pot 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo" className="text-foreground font-medium">Team Logo (Optional)</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="border-border hover:bg-muted"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Logo
              </Button>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              {logoPreview && (
                <img src={logoPreview} alt="Logo preview" className="h-12 w-12 object-contain" />
              )}
            </div>
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-outfit font-semibold">
          Add Team
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TeamEditor;
