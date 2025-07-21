
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
import { useToast } from "@/hooks/use-toast";
import {
  insertBreedingRecordSchema,
  type InsertBreedingRecord,
} from "@/../../shared/schema";
import { Heart } from "lucide-react";

interface BreedingRecordFormProps {
  onSuccess?: () => void;
}

export function BreedingRecordForm({ onSuccess }: BreedingRecordFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get animals for selection
  const { data: animals = [] } = useQuery({
    queryKey: ["/api/animals"],
  });

  // Filter female and male animals
  const femaleAnimals = animals.filter((animal: any) => animal.gender === 'female');
  const maleAnimals = animals.filter((animal: any) => animal.gender === 'male');

  const form = useForm<InsertBreedingRecord>({
    resolver: zodResolver(insertBreedingRecordSchema.omit({ userId: true })),
    defaultValues: {
      motherId: 0,
      fatherId: 0,
      breedingDate: new Date().toISOString().split('T')[0],
      expectedBirthDate: "",
      actualBirthDate: "",
      notes: "",
    },
  });

  const createBreedingRecordMutation = useMutation({
    mutationFn: async (data: InsertBreedingRecord) => {
      const response = await fetch("/api/breeding-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create breeding record");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/breeding-records"] });
      toast({
        title: "Success",
        description: "Breeding record added successfully",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add breeding record",
        variant: "destructive",
      });
      console.error("Breeding record creation error:", error);
    },
  });

  const onSubmit = async (data: InsertBreedingRecord) => {
    setIsSubmitting(true);
    try {
      // Calculate expected birth date if breeding date is provided
      if (data.breedingDate && !data.expectedBirthDate) {
        const breedingDate = new Date(data.breedingDate);
        const expectedDate = new Date(breedingDate);
        expectedDate.setDate(expectedDate.getDate() + 283); // Average cattle gestation
        data.expectedBirthDate = expectedDate.toISOString().split('T')[0];
      }
      
      await createBreedingRecordMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="ranch-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Add Breeding Record
        </CardTitle>
        <CardDescription>
          Record breeding activities and track pregnancies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="motherId">Mother (Female) *</Label>
              <Select
                value={form.watch("motherId")?.toString()}
                onValueChange={(value) => form.setValue("motherId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mother" />
                </SelectTrigger>
                <SelectContent>
                  {femaleAnimals.map((animal: any) => (
                    <SelectItem key={animal.id} value={animal.id.toString()}>
                      {animal.tagId} - {animal.name || animal.species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.motherId && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.motherId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherId">Father (Male)</Label>
              <Select
                value={form.watch("fatherId")?.toString()}
                onValueChange={(value) => form.setValue("fatherId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select father (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Unknown/Not specified</SelectItem>
                  {maleAnimals.map((animal: any) => (
                    <SelectItem key={animal.id} value={animal.id.toString()}>
                      {animal.tagId} - {animal.name || animal.species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breedingDate">Breeding Date *</Label>
              <Input
                id="breedingDate"
                type="date"
                {...form.register("breedingDate")}
              />
              {form.formState.errors.breedingDate && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.breedingDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedBirthDate">Expected Birth Date</Label>
              <Input
                id="expectedBirthDate"
                type="date"
                {...form.register("expectedBirthDate")}
              />
              <p className="text-xs text-gray-500">
                Will be calculated automatically if not provided
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualBirthDate">Actual Birth Date</Label>
              <Input
                id="actualBirthDate"
                type="date"
                {...form.register("actualBirthDate")}
              />
              <p className="text-xs text-gray-500">
                Fill this when birth occurs
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional breeding notes, observations, etc..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || createBreedingRecordMutation.isPending}
              className="flex-1"
            >
              {isSubmitting || createBreedingRecordMutation.isPending
                ? "Adding..."
                : "Add Breeding Record"}
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
