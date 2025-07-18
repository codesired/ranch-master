import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EquipmentFormProps {
  onSuccess?: () => void;
  equipment?: any;
}

export function EquipmentForm({ onSuccess, equipment }: EquipmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: equipment?.name || "",
    type: equipment?.type || "",
    model: equipment?.model || "",
    serialNumber: equipment?.serialNumber || "",
    purchaseDate: equipment?.purchaseDate || "",
    purchasePrice: equipment?.purchasePrice ? equipment.purchasePrice.toString() : "",
    status: equipment?.status || "operational",
    location: equipment?.location || "",
    notes: equipment?.notes || "",
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = equipment ? `/api/equipment/${equipment.id}` : "/api/equipment";
      const method = equipment ? "PUT" : "POST";

      // Prepare data with proper type conversion
      const submitData = {
        ...data,
        purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : null,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to save equipment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({
        title: "Success",
        description: `Equipment ${equipment ? "updated" : "created"} successfully`,
      });
      // Reset form if adding new equipment
      if (!equipment) {
        setFormData({
          name: "",
          type: "",
          model: "",
          serialNumber: "",
          purchaseDate: "",
          purchasePrice: "",
          status: "operational",
          location: "",
          notes: "",
        });
      }
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Equipment form error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save equipment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Equipment name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.type.trim()) {
      toast({
        title: "Validation Error",
        description: "Equipment type is required",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{equipment ? "Edit Equipment" : "Add New Equipment"}</CardTitle>
        <CardDescription>
          {equipment ? "Update equipment information" : "Add new equipment to your inventory"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Equipment Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., John Deere Tractor"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tractor">Tractor</SelectItem>
                  <SelectItem value="harvester">Harvester</SelectItem>
                  <SelectItem value="plow">Plow</SelectItem>
                  <SelectItem value="seeder">Seeder</SelectItem>
                  <SelectItem value="irrigation">Irrigation Equipment</SelectItem>
                  <SelectItem value="mower">Mower</SelectItem>
                  <SelectItem value="trailer">Trailer</SelectItem>
                  <SelectItem value="cultivator">Cultivator</SelectItem>
                  <SelectItem value="sprayer">Sprayer</SelectItem>
                  <SelectItem value="loader">Loader</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                placeholder="e.g., 5075E"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                placeholder="e.g., 1M5075EXXX123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                placeholder="25000.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="repair">Needs Repair</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Main Barn, Field 3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes about the equipment..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : equipment ? "Update Equipment" : "Add Equipment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}