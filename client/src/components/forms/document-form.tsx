
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertDocumentSchema, type InsertDocument } from "@shared/schema";
import { Upload, FileText } from "lucide-react";

interface DocumentFormProps {
  onClose: () => void;
  document?: any;
}

const documentSchema = insertDocumentSchema;

export default function DocumentForm({ onClose, document }: DocumentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertDocument>({
    resolver: zodResolver(documentSchema),
    defaultValues: document || {
      title: "",
      category: "",
      description: "",
      fileUrl: "",
      fileName: "",
      fileSize: 0,
      mimeType: "",
      relatedId: undefined,
      relatedType: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertDocument) => {
      const url = document ? `/api/documents/${document.id}` : "/api/documents";
      const method = document ? "PATCH" : "POST";
      return await apiRequest(url, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: `Document ${document ? "updated" : "uploaded"} successfully`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("fileName", file.name);
      form.setValue("fileSize", file.size);
      form.setValue("mimeType", file.type);
      form.setValue("fileUrl", URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: InsertDocument) => {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentCategories = [
    { value: "receipt", label: "Receipt" },
    { value: "certificate", label: "Certificate" },
    { value: "photo", label: "Photo" },
    { value: "report", label: "Report" },
    { value: "insurance", label: "Insurance" },
    { value: "contract", label: "Contract" },
    { value: "other", label: "Other" }
  ];

  const relatedTypes = [
    { value: "animal", label: "Animal" },
    { value: "equipment", label: "Equipment" },
    { value: "transaction", label: "Transaction" },
    { value: "general", label: "General" }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter document title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {documentCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="relatedType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related To (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {relatedTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="relatedId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related ID (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter related ID"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter document description..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>File Upload</FormLabel>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : "Click to upload a file"}
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, JPG, PNG, GIF, TXT up to 10MB
                </p>
              </div>
            </label>
          </div>
          {selectedFile && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <FileText className="h-4 w-4" />
              <span>File selected: {selectedFile.name}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="ranch-button-primary">
            {isSubmitting ? "Uploading..." : document ? "Update" : "Upload"} Document
          </Button>
        </div>
      </form>
    </Form>
  );
}
