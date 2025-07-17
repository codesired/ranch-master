import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import LoadingSpinner from "@/components/shared/loading-spinner";
import EmptyState from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Image, Receipt, Award, Search, Filter, Download } from "lucide-react";
import DocumentForm from "@/components/forms/document-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function Documents() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents"],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  if (isLoading || documentsLoading) {
    return <LoadingSpinner />;
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'receipt': return <Receipt className="h-4 w-4" />;
      case 'certificate': return <Award className="h-4 w-4" />;
      case 'photo': return <Image className="h-4 w-4" />;
      case 'report': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'receipt': return 'bg-green-100 text-green-800';
      case 'certificate': return 'bg-blue-100 text-blue-800';
      case 'photo': return 'bg-purple-100 text-purple-800';
      case 'report': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocuments = documents?.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">Document Management</h1>
          <p className="text-gray-600">Store and organize important documents, receipts, and records.</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ranch-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <DocumentForm onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="ranch-card">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option>All Categories</option>
                <option>Receipts</option>
                <option>Certificates</option>
                <option>Photos</option>
                <option>Reports</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-farm-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-dark-green">
              {documents?.length || 0}
            </div>
            <p className="text-xs text-gray-600">Stored documents</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receipts</CardTitle>
            <Receipt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {documents?.filter(d => d.category === 'receipt').length || 0}
            </div>
            <p className="text-xs text-gray-600">Financial records</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Photos</CardTitle>
            <Image className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {documents?.filter(d => d.category === 'photo').length || 0}
            </div>
            <p className="text-xs text-gray-600">Visual records</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {documents?.filter(d => d.category === 'certificate').length || 0}
            </div>
            <p className="text-xs text-gray-600">Official documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card className="ranch-card">
        <CardHeader>
          <CardTitle className="text-dark-green">All Documents</CardTitle>
          <CardDescription>Your stored documents and files</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments && filteredDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>File Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(document.category)}
                          <span className="font-medium">{document.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(document.category)}>
                          {document.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {document.description || 'No description'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {document.mimeType?.split('/')[1]?.toUpperCase() || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {document.fileSize ? `${(document.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {new Date(document.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={<FileText className="h-12 w-12 text-gray-400" />}
              title="No documents found"
              description="Upload your first document to get started with document management."
              action={
                <Button className="ranch-button-primary" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
