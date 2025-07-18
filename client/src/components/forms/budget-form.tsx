import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { insertBudgetSchema, type InsertBudget } from "@/../shared/schema";

interface BudgetFormProps {
  onSuccess?: () => void;
}

export default function BudgetForm({ onSuccess }: BudgetFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertBudget>({
    resolver: zodResolver(insertBudgetSchema.omit({ userId: true })),
    defaultValues: {
      name: "",
      category: "",
      amount: 0,
      period: "monthly",
      alertThreshold: 80,
      description: "",
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: InsertBudget) => {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create budget");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive",
      });
      console.error("Budget creation error:", error);
    },
  });

  const onSubmit = async (data: InsertBudget) => {
    setIsSubmitting(true);
    try {
      await createBudgetMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="ranch-card">
      <CardHeader>
        <CardTitle>Create Budget</CardTitle>
        <CardDescription>
          Set up a budget to track and manage your expenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Budget Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Feed Budget"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="veterinary">Veterinary</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="labor">Labor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Budget Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...form.register("amount", { valueAsNumber: true })}
                placeholder="1000.00"
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Select
                value={form.watch("period")}
                onValueChange={(value) => form.setValue("period", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.period && (
                <p className="text-sm text-red-600">{form.formState.errors.period.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
              <Input
                id="alertThreshold"
                type="number"
                min="0"
                max="100"
                {...form.register("alertThreshold", { valueAsNumber: true })}
                placeholder="80"
              />
              {form.formState.errors.alertThreshold && (
                <p className="text-sm text-red-600">{form.formState.errors.alertThreshold.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                {...form.register("description")}
                placeholder="Additional details about this budget"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || createBudgetMutation.isPending}
              className="flex-1"
            >
              {isSubmitting || createBudgetMutation.isPending ? "Creating..." : "Create Budget"}
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