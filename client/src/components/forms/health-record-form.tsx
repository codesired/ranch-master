
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  insertHealthRecordSchema,
  type InsertHealthRecord,
} from "@/../../shared/schema";
import { Heart } from "lucide-react";

interface HealthRecordFormProps {
  animalId?: number;
  onSuccess?: () => void;
}

export function HealthRecordForm({ animalId, onSuccess }: HealthRecordFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get animals for selection if animalId is not provided
  const { data: animals = [] } = useQuery({
    queryKey: ["/api/animals"],
    enabled: !animalId,
  });

  const form = useForm<InsertHealthRecord>({
    resolver: zodResolver(insertHealthRecordSchema.omit({ userId: true })),
    defaultValues: {
      animalId: animalId || 0,
      recordType: "",
      description: "",
      performedBy: "",
      veterinarianLicense: "",
      date: new Date().toISOString().split('T')[0],
      cost: 0,
      nextDueDate: "",
      medicationUsed: "",
      dosage: "",
      batchNumber: "",
      temperature: 0,
      weight: 0,
      symptoms: "",
      diagnosis: "",
      treatment: "",
      followUpRequired: false,
      attachments: [],
      notes: "",
    },
  });

  const createHealthRecordMutation = useMutation({
    mutationFn: async (data: InsertHealthRecord) => {
      const response = await fetch("/api/health-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create health record");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      toast({
        title: "Success",
        description: "Health record added successfully",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add health record",
        variant: "destructive",
      });
      console.error("Health record creation error:", error);
    },
  });

  const onSubmit = async (data: InsertHealthRecord) => {
    setIsSubmitting(true);
    try {
      await createHealthRecordMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="ranch-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Add Health Record
        </CardTitle>
        <CardDescription>
          Record health treatments, vaccinations, and checkups
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!animalId && (
            <div className="space-y-2">
              <Label htmlFor="animalId">Animal *</Label>
              <Select
                value={form.watch("animalId")?.toString()}
                onValueChange={(value) => form.setValue("animalId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select animal" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal: any) => (
                    <SelectItem key={animal.id} value={animal.id.toString()}>
                      {animal.tagId} - {animal.name || animal.species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.animalId && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.animalId.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recordType">Record Type *</Label>
              <Select
                value={form.watch("recordType")}
                onValueChange={(value) => form.setValue("recordType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="checkup">Checkup</SelectItem>
                  <SelectItem value="deworming">Deworming</SelectItem>
                  <SelectItem value="test">Test/Lab Work</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.recordType && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.recordType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date")}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Describe the health record..."
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="performedBy">Performed By</Label>
              <Input
                id="performedBy"
                {...form.register("performedBy")}
                placeholder="Veterinarian name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="veterinarianLicense">License Number</Label>
              <Input
                id="veterinarianLicense"
                {...form.register("veterinarianLicense")}
                placeholder="Vet license number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                {...form.register("cost", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextDueDate">Next Due Date</Label>
              <Input
                id="nextDueDate"
                type="date"
                {...form.register("nextDueDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicationUsed">Medication Used</Label>
              <Input
                id="medicationUsed"
                {...form.register("medicationUsed")}
                placeholder="Medication name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                {...form.register("dosage")}
                placeholder="Dosage amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                {...form.register("temperature", { valueAsNumber: true })}
                placeholder="101.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                {...form.register("weight", { valueAsNumber: true })}
                placeholder="0.0"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="symptoms">Symptoms</Label>
              <Textarea
                id="symptoms"
                {...form.register("symptoms")}
                placeholder="Observed symptoms..."
                rows={2}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                {...form.register("diagnosis")}
                placeholder="Veterinarian diagnosis..."
                rows={2}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="treatment">Treatment</Label>
              <Textarea
                id="treatment"
                {...form.register("treatment")}
                placeholder="Treatment provided..."
                rows={2}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="followUpRequired"
                  checked={form.watch("followUpRequired")}
                  onCheckedChange={(checked) => 
                    form.setValue("followUpRequired", checked as boolean)
                  }
                />
                <Label htmlFor="followUpRequired">Follow-up required</Label>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || createHealthRecordMutation.isPending}
              className="flex-1"
            >
              {isSubmitting || createHealthRecordMutation.isPending
                ? "Adding..."
                : "Add Health Record"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
