import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Image,
  File,
  Download,
  Eye,
  Edit,
  Trash2,
  Upload,
  Calendar,
  Tag,
  Share2,
  Archive,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MoreVertical,
  FolderOpen,
  Camera,
  Receipt,
  Shield,
  Users,
  Building,
  Truck,
} from "lucide-react";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { format } from "date-fns";

interface Document {
  id: number;
  title: string;
  category: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  tags?: string[];
  isPublic: boolean;
  expiryDate?: string;
  reminderDate?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  uploadedBy?: string;
  createdAt: string;
}

interface DocumentStats {
  totalDocuments: number;
  recentUploads: number;
  expiringSoon: number;
  storageUsed: number;
  categoriesCount: number;
}

export default function Documents() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [uploadForm, setUploadForm] = useState({
    title: "",
    category: "",
    description: "",
    tags: "",
    expiryDate: "",
    isPublic: false,
    file: null as File | null
  });
  const [dragActive, setDragActive] = useState(false);

  // Queries
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents"],
    enabled: isAuthenticated,
  });

  const { data: documentStats = {
    totalDocuments: 0,
    recentUploads: 0,
    expiringSoon: 0,
    storageUsed: 0,
    categoriesCount: 0,
  }, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/documents/stats"],
    enabled: isAuthenticated,
  });

  // Mutations
  const uploadDocumentMutation = useMutation({
    mutationFn: async (documentData: any) => {
      return await apiRequest("/api/documents", {
        method: "POST",
        body: JSON.stringify(documentData),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/stats"] });
      setShowUploadDialog(false);
      setUploadForm({
        title: "",
        category: "",
        description: "",
        tags: "",
        expiryDate: "",
        isPublic: false,
        file: null
      });
      toast({ title: "Success", description: "Document uploaded successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/documents/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/stats"] });
      toast({ title: "Success", description: "Document deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Enhanced filtering
  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    const matchesTag = filterTag === "all" || doc.tags?.includes(filterTag);
    
    return matchesSearch && matchesCategory && matchesTag;
  });

  // Get unique categories and tags
  const categories = [...new Set(documents.map((doc: Document) => doc.category))];
  const allTags = [...new Set(documents.flatMap((doc: Document) => doc.tags || []))];

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'receipt': return Receipt;
      case 'certificate': return Shield;
      case 'report': return FileText;
      case 'photo': return Camera;
      case 'contract': return Users;
      case 'insurance': return Building;
      default: return File;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'receipt': return 'bg-green-100 text-green-800';
      case 'certificate': return 'bg-blue-100 text-blue-800';
      case 'report': return 'bg-purple-100 text-purple-800';
      case 'photo': return 'bg-yellow-100 text-yellow-800';
      case 'contract': return 'bg-red-100 text-red-800';
      case 'insurance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "-";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isExpiring = (doc: Document) => {
    if (!doc.expiryDate) return false;
    const expiry = new Date(doc.expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  };

  const handleDownload = (doc: Document) => {
    window.open(doc.fileUrl, '_blank');
  };

  const handleShare = (doc: Document) => {
    if (navigator.share) {
      navigator.share({
        title: doc.title,
        text: doc.description,
        url: doc.fileUrl,
      });
    } else {
      navigator.clipboard.writeText(doc.fileUrl);
      toast({ title: "Success", description: "Document link copied to clipboard" });
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadForm(prev => ({ ...prev, file }));
      if (!uploadForm.title) {
        setUploadForm(prev => ({ ...prev, title: file.name }));
      }
    }
  }, [uploadForm.title]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadForm(prev => ({ ...prev, file }));
      if (!uploadForm.title) {
        setUploadForm(prev => ({ ...prev, title: file.name }));
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast({ title: "Error", description: "Please select a file", variant: "destructive" });
      return;
    }

    if (!uploadForm.title || !uploadForm.category) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }

    // Simulate file upload - in a real app, you'd upload to a file storage service
    const documentData = {
      title: uploadForm.title,
      category: uploadForm.category,
      description: uploadForm.description,
      fileUrl: `/uploads/${uploadForm.file.name}`, // Mock file URL
      fileName: uploadForm.file.name,
      fileSize: uploadForm.file.size,
      mimeType: uploadForm.file.type,
      tags: uploadForm.tags ? uploadForm.tags.split(',').map(tag => tag.trim()) : [],
      isPublic: uploadForm.isPublic,
      expiryDate: uploadForm.expiryDate || null
    };

    uploadDocumentMutation.mutate(documentData);
  };

  if (!isAuthenticated) {
    return <div>Please log in to view documents.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">Document Management</h1>
          <p className="text-gray-600">Organize, store, and manage all your ranch documents</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="ranch-button-primary">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUploadSubmit} className="space-y-6 py-4">
                {/* File Drop Zone */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {uploadForm.file ? uploadForm.file.name : "Drop files here or click to browse"}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">PDF, images, and documents up to 10MB</p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.csv,.xlsx,.xls"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Choose Files
                  </Button>
                </div>

                {/* Document Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Document title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={uploadForm.category} 
                      onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receipt">Receipt</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="report">Report</SelectItem>
                        <SelectItem value="photo">Photo</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the document"
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={uploadForm.expiryDate}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={uploadForm.isPublic}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="isPublic">Make document public</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowUploadDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={uploadDocumentMutation.isPending}
                    className="ranch-button-primary"
                  >
                    {uploadDocumentMutation.isPending ? "Uploading..." : "Upload Document"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <FolderOpen className="h-4 w-4 mr-2" />
            Browse
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {documentsLoading ? "..." : documentStats.totalDocuments}
            </div>
            <p className="text-xs text-gray-600">
              {documentStats.categoriesCount} categories
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <Upload className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? "..." : documentStats.recentUploads}
            </div>
            <p className="text-xs text-gray-600">
              This week
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statsLoading ? "..." : documentStats.expiringSoon}
            </div>
            <p className="text-xs text-gray-600">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Archive className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {statsLoading ? "..." : `${documentStats.storageUsed}%`}
            </div>
            <p className="text-xs text-gray-600">
              Of available space
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Docs</CardTitle>
            <Share2 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {documentsLoading ? "..." : documents.filter((d: Document) => d.isPublic).length}
            </div>
            <p className="text-xs text-gray-600">
              Shared documents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="ranch-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-dark-green">Document Library</CardTitle>
              <CardDescription>Manage and organize your documents</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
            </div>
          </div>
          
          {/* Enhanced Filters */}
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {documentsLoading ? (
            <LoadingSpinner />
          ) : filteredDocuments.length > 0 ? (
            viewMode === "list" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc: Document) => {
                    const CategoryIcon = getCategoryIcon(doc.category);
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <CategoryIcon className="h-5 w-5 text-gray-500" />
                            <div>
                              <div className="font-medium">{doc.title}</div>
                              <div className="text-sm text-gray-500">{doc.fileName}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(doc.category)}>
                            {doc.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatFileSize(doc.fileSize)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {doc.tags?.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {doc.tags && doc.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{doc.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {doc.expiryDate ? (
                            <div className={isExpiring(doc) ? "text-orange-600 font-medium" : ""}>
                              {format(new Date(doc.expiryDate), 'MMM dd, yyyy')}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {doc.isPublic && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                <Share2 className="h-3 w-3 mr-1" />
                                Public
                              </Badge>
                            )}
                            {isExpiring(doc) && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Expiring
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(doc)}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteDocumentMutation.mutate(doc.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocuments.map((doc: Document) => {
                  const CategoryIcon = getCategoryIcon(doc.category);
                  return (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CategoryIcon className="h-8 w-8 text-gray-500" />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(doc)}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteDocumentMutation.mutate(doc.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div>
                          <CardTitle className="text-lg truncate">{doc.title}</CardTitle>
                          <CardDescription className="text-sm truncate">
                            {doc.description || doc.fileName}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Badge className={getCategoryColor(doc.category)}>
                              {doc.category}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatFileSize(doc.fileSize)}
                            </span>
                          </div>
                          
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {doc.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="text-sm text-gray-500">
                            Uploaded {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                          </div>
                          
                          {isExpiring(doc) && (
                            <div className="flex items-center text-orange-600 text-sm">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Expires {format(new Date(doc.expiryDate!), 'MMM dd')}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterCategory !== "all" || filterTag !== "all" 
                  ? "Try adjusting your search filters"
                  : "Upload your first document to get started"
                }
              </p>
              {(!searchTerm && filterCategory === "all" && filterTag === "all") && (
                <Button 
                  onClick={() => setShowUploadDialog(true)}
                  className="ranch-button-primary"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}