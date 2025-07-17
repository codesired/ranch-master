import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AnimalFormProps {
  onSuccess?: () => void;
}

const getBreedOptions = (species: string) => {
  const breedOptions = {
    "Cattle": ["Angus", "Hereford", "Holstein", "Jersey", "Charolais", "Simmental", "Limousin", "Other"],
    "Sheep": ["Merino", "Suffolk", "Dorset", "Romney", "Corriedale", "Border Leicester", "Other"],
    "Goats": ["Boer", "Nubian", "Saanen", "Alpine", "LaMancha", "Toggenburg", "Other"],
    "Pigs": ["Yorkshire", "Duroc", "Hampshire", "Landrace", "Berkshire", "Chester White", "Other"],
    "Chickens": ["Rhode Island Red", "Leghorn", "Plymouth Rock", "Wyandotte", "Orpington", "Other"],
    "Horses": ["Arabian", "Thoroughbred", "Quarter Horse", "Paint", "Appaloosa", "Clydesdale", "Other"],
    "Other": ["Mixed", "Unknown", "Other"]
  };
  
  return breedOptions[species] || ["Other"];
};

export default function AnimalForm({ onSuccess }: AnimalFormProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [birthDate, setBirthDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    tagId: "",
    name: "",
    species: "",
    breed: "",
    gender: "",
    weight: "",
    color: "",
    location: "",
    notes: "",
  });

  const createAnimalMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/animals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Animal added successfully",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add animal",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tagId || !formData.species || !formData.gender) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createAnimalMutation.mutate({
      ...formData,
      birthDate: birthDate?.toISOString().split('T')[0],
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-dark-green">Animal Information</CardTitle>
        <CardDescription>Enter the details for the new animal</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tagId">Tag ID *</Label>
              <Input
                id="tagId"
                placeholder="e.g., H-2847"
                value={formData.tagId}
                onChange={(e) => handleInputChange("tagId", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                placeholder="Animal name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Select onValueChange={(value) => handleInputChange("species", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cattle">Cattle</SelectItem>
                  <SelectItem value="Sheep">Sheep</SelectItem>
                  <SelectItem value="Goats">Goats</SelectItem>
                  <SelectItem value="Pigs">Pigs</SelectItem>
                  <SelectItem value="Chickens">Chickens</SelectItem>
                  <SelectItem value="Horses">Horses</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Select onValueChange={(value) => handleInputChange("breed", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select breed" />
                </SelectTrigger>
                <SelectContent>
                  {getBreedOptions(formData.species).map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Birth Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !birthDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? format(birthDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={setBirthDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g., 1200"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                placeholder="e.g., Black, Brown"
                value={formData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Pasture A, Barn 1"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the animal..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="ranch-button-primary"
              disabled={createAnimalMutation.isPending}
            >
              {createAnimalMutation.isPending ? "Adding..." : "Add Animal"}
            </Button>
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
