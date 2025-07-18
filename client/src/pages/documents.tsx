import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, Eye, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import DocumentForm from "@/components/forms/document-form";
import { useAuth } from "@/hooks/useAuth";

export default function Documents() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/documents"],
    queryFn: () => fetch("/api/documents").then(res => res.json()),
    enabled: !!user,
  });

  const filteredDocuments = documents?.filter((doc: any) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      health_record: "bg-red-100 text-red-800",
      breeding_record: "bg-blue-100 text-blue-800",
      financial_document: "bg-green-100 text-green-800",
      insurance: "bg-purple-100 text-purple-800",
      permit: "bg-yellow-100 text-yellow-800",
      contract: "bg-orange-100 text-orange-800",
      invoice: "bg-pink-100 text-pink-800",
      manual: "bg-gray-100 text-gray-800",
      other: "bg-slate-100 text-slate-800",
    };
    return colors[type] || colors.other;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-green">Document Management</h1>
          <p className="text-gray-600">Organize and access important ranch documents</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-harvest-orange hover:bg-harvest-orange/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Document</DialogTitle>
            </DialogHeader>
            <DocumentForm onSuccess={() => setShowForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="ranch-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents ({filteredDocuments.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : filteredDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document: any) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{document.title}</p>
                          {document.description && (
                            <p className="text-sm text-gray-500">{document.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(document.type)}>
                          {document.type.replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                      <TableCell>
                        {new Date(document.uploadDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {document.tags && (
                          <div className="flex flex-wrap gap-1">
                            {document.tags.split(",").map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No documents match your search." : "No documents found. Add your first document to get started."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}