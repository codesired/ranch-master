import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { insertDocumentSchema, type InsertDocument } from "@/../shared/schema";
import { Upload, FileText } from "lucide-react";

interface DocumentFormProps {
  onSuccess?: () => void;
}

export default function DocumentForm({ onSuccess }: DocumentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<InsertDocument>({
    resolver: zodResolver(insertDocumentSchema.omit({ userId: true })),
    defaultValues: {
      title: "",
      type: "",
      description: "",
      filePath: "",
      fileSize: 0,
      mimeType: "",
      tags: "",
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: InsertDocument) => {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create document");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document added successfully",
      });
      form.reset();
      setSelectedFile(null);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive",
      });
      console.error("Document creation error:", error);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("filePath", file.name);
      form.setValue("fileSize", file.size);
      form.setValue("mimeType", file.type);

      // Auto-fill title if empty
      if (!form.watch("title")) {
        form.setValue("title", file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const onSubmit = async (data: InsertDocument) => {
    setIsSubmitting(true);
    try {
      // In a real implementation, you would upload the file to a storage service
      // For now, we'll just store the metadata
      await createDocumentMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="ranch-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Add Document
        </CardTitle>
        <CardDescription>
          Upload and organize important ranch documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
              />
              <label htmlFor="file" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, XLS, JPG, PNG up to 10MB
                </p>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Vaccination Records 2024"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Document Type</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(value) => form.setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health_record">Health Record</SelectItem>
                  <SelectItem value="breeding_record">Breeding Record</SelectItem>
                  <SelectItem value="financial_document">Financial Document</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="permit">Permit/License</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="manual">Manual/Guide</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-red-600">{form.formState.errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Brief description of the document content"
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                {...form.register("tags")}
                placeholder="cattle, vaccination, 2024 (comma-separated)"
              />
              <p className="text-xs text-gray-500">
                Add tags to make documents easier to find
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || createDocumentMutation.isPending || !selectedFile}
              className="flex-1"
            >
              {isSubmitting || createDocumentMutation.isPending ? "Adding..." : "Add Document"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                form.reset();
                setSelectedFile(null);
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}