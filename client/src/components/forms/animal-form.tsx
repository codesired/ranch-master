import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const animalFormSchema = z.object({
  tagId: z.string().min(1, "Tag ID is required"),
  name: z.string().optional(),
  species: z.string().min(1, "Species is required"),
  breed: z.string().optional(),
  gender: z.enum(["male", "female"]),
  birthDate: z.string().optional(),
  currentWeight: z.string().optional(),
  birthWeight: z.string().optional(),
  color: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["active", "sold", "deceased", "quarantine"]).default("active"),
  purchasePrice: z.string().optional(),
  purchaseDate: z.string().optional(),
  salePrice: z.string().optional(),
  saleDate: z.string().optional(),
  motherId: z.string().optional(),
  fatherId: z.string().optional(),
  geneticInfo: z.string().optional(),
  registrationNumber: z.string().optional(),
  microchipId: z.string().optional(),
  notes: z.string().optional(),
});

type AnimalFormData = z.infer<typeof animalFormSchema>;

interface AnimalFormProps {
  onSuccess: () => void;
  animal?: any;
}

export function AnimalForm({ onSuccess, animal }: AnimalFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<AnimalFormData>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: {
      tagId: animal?.tagId || "",
      name: animal?.name || "",
      species: animal?.species || "",
      breed: animal?.breed || "",
      gender: animal?.gender || "female",
      birthDate: animal?.birthDate || "",
      currentWeight: animal?.currentWeight?.toString() || "",
      birthWeight: animal?.birthWeight?.toString() || "",
      color: animal?.color || "",
      location: animal?.location || "",
      status: animal?.status || "active",
      purchasePrice: animal?.purchasePrice?.toString() || "",
      purchaseDate: animal?.purchaseDate || "",
      salePrice: animal?.salePrice?.toString() || "",
      saleDate: animal?.saleDate || "",
      motherId: animal?.motherId?.toString() || "",
      fatherId: animal?.fatherId?.toString() || "",
      geneticInfo: animal?.geneticInfo || "",
      registrationNumber: animal?.registrationNumber || "",
      microchipId: animal?.microchipId || "",
      notes: animal?.notes || "",
    },
  });

  const createAnimalMutation = useMutation({
    mutationFn: async (data: AnimalFormData) => {
      const formattedData = {
        ...data,
        currentWeight: data.currentWeight ? parseFloat(data.currentWeight) : undefined,
        birthWeight: data.birthWeight ? parseFloat(data.birthWeight) : undefined,
        purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : undefined,
        salePrice: data.salePrice ? parseFloat(data.salePrice) : undefined,
        motherId: data.motherId ? parseInt(data.motherId) : undefined,
        fatherId: data.fatherId ? parseInt(data.fatherId) : undefined,
      };

      if (animal?.id) {
        return await apiRequest(`/api/animals/${animal.id}`, {
          method: "PUT",
          body: JSON.stringify(formattedData),
        });
      } else {
        return await apiRequest("/api/animals", {
          method: "POST",
          body: JSON.stringify(formattedData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AnimalFormData) => {
    createAnimalMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tagId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag ID *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., A001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Animal name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Species *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cattle">Cattle</SelectItem>
                    <SelectItem value="sheep">Sheep</SelectItem>
                    <SelectItem value="goat">Goat</SelectItem>
                    <SelectItem value="pig">Pig</SelectItem>
                    <SelectItem value="horse">Horse</SelectItem>
                    <SelectItem value="chicken">Chicken</SelectItem>
                    <SelectItem value="duck">Duck</SelectItem>
                    <SelectItem value="turkey">Turkey</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breed</FormLabel>
                <FormControl>
                  <Input placeholder="Animal breed" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Weight (lbs)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="0.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Weight (lbs)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="0.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Black, Brown" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Pasture A, Barn 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="deceased">Deceased</SelectItem>
                    <SelectItem value="quarantine">Quarantine</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Number</FormLabel>
                <FormControl>
                  <Input placeholder="Official registration ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="microchipId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Microchip ID</FormLabel>
                <FormControl>
                  <Input placeholder="Microchip identification" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="geneticInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genetic Information</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Bloodline, genetic traits, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes about the animal"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            disabled={createAnimalMutation.isPending}
            className="ranch-button-primary"
          >
            {createAnimalMutation.isPending 
              ? "Saving..." 
              : animal?.id 
                ? "Update Animal" 
                : "Add Animal"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}