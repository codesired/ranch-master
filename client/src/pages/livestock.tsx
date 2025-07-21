import { useState } from "react";
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
  Plus,
  Filter,
  Search,
  Edit,
  Trash2,
  Heart,
  Activity,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertTriangle,
  Eye,
  FileText,
  Camera,
  Download,
  BarChart3,
  Target,
  Zap,
} from "lucide-react";
import { AnimalForm } from "@/components/forms/animal-form";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { format } from "date-fns";
import { HealthRecordForm } from "@/components/forms/health-record-form";
import { BreedingRecordForm } from "@/components/forms/breeding-record-form";

interface Animal {
  id: number;
  tagId: string;
  name?: string;
  species: string;
  breed?: string;
  gender: string;
  birthDate?: string;
  currentWeight?: number;
  birthWeight?: number;
  color?: string;
  location?: string;
  status: string;
  purchasePrice?: number;
  purchaseDate?: string;
  salePrice?: number;
  saleDate?: string;
  motherId?: number;
  fatherId?: number;
  geneticInfo?: string;
  registrationNumber?: string;
  microchipId?: string;
  notes?: string;
  createdAt: string;
}

interface HealthRecord {
  id: number;
  animalId: number;
  recordType: string;
  description: string;
  performedBy?: string;
  veterinarianLicense?: string;
  date: string;
  cost?: number;
  nextDueDate?: string;
  medicationUsed?: string;
  dosage?: string;
  temperature?: number;
  weight?: number;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  followUpRequired: boolean;
  notes?: string;
  createdAt: string;
}

interface BreedingRecord {
  id: number;
  motherId: number;
  fatherId?: number;
  breedingDate: string;
  expectedBirthDate?: string;
  actualBirthDate?: string;
  notes?: string;
  createdAt: string;
}

export default function Livestock() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [showBreedingForm, setShowBreedingForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Queries
  const { data: animals = [], isLoading: animalsLoading } = useQuery({
    queryKey: ["/api/animals"],
    enabled: isAuthenticated,
  });

  const { data: healthRecords = [], isLoading: healthLoading } = useQuery({
    queryKey: ["/api/health-records"],
    enabled: isAuthenticated,
  });

  const { data: breedingRecords = [], isLoading: breedingLoading } = useQuery({
    queryKey: ["/api/breeding-records"],
    enabled: isAuthenticated,
  });

  const { data: livestockStats = {
    totalAnimals: 0,
    activeAnimals: 0,
    healthAlerts: 0,
    breedingDue: 0,
    avgWeight: 0,
    totalValue: 0
  }} = useQuery({
    queryKey: ["/api/livestock/stats"],
    enabled: isAuthenticated,
  });

  // Mutations
  const deleteAnimalMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/animals/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/livestock/stats"] });
      toast({ title: "Success", description: "Animal deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (!isAuthenticated) {
    return <div>Please log in to view livestock.</div>;
  }

  // Enhanced filtering
  const filteredAnimals = animals.filter((animal: Animal) => {
    const matchesSearch = animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = filterSpecies === "all" || animal.species === filterSpecies;
    const matchesStatus = filterStatus === "all" || animal.status === filterStatus;
    
    return matchesSearch && matchesSpecies && matchesStatus;
  });

  // Calculate advanced statistics
  const uniqueSpecies = [...new Set(animals.map((a: Animal) => a.species))];
  const recentHealthRecords = healthRecords.slice(0, 5);
  const upcomingBreeding = breedingRecords.filter((br: BreedingRecord) => 
    br.expectedBirthDate && new Date(br.expectedBirthDate) > new Date()
  );

  const handleAnimalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
    queryClient.invalidateQueries({ queryKey: ["/api/livestock/stats"] });
    setShowAnimalForm(false);
    toast({ title: "Success", description: "Animal saved successfully" });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      sold: "bg-blue-100 text-blue-800",
      deceased: "bg-gray-100 text-gray-800",
      quarantine: "bg-yellow-100 text-yellow-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount?: number) => 
    amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount) : "-";

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "-";
    const birth = new Date(birthDate);
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 3600 * 24));
    
    if (ageInDays < 30) return `${ageInDays} days`;
    if (ageInDays < 365) return `${Math.floor(ageInDays / 30)} months`;
    return `${Math.floor(ageInDays / 365)} years`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">Livestock Management</h1>
          <p className="text-gray-600">Comprehensive animal tracking, health monitoring, and breeding management</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={showAnimalForm} onOpenChange={setShowAnimalForm}>
            <DialogTrigger asChild>
              <Button className="ranch-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add New Animal</DialogTitle>
              </DialogHeader>
              <AnimalForm onSuccess={handleAnimalSuccess} />
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <Users className="h-4 w-4 text-farm-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-dark-green">
              {animalsLoading ? "..." : livestockStats.totalAnimals}
            </div>
            <p className="text-xs text-gray-600">
              {livestockStats.activeAnimals} active
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Alerts</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {healthLoading ? "..." : livestockStats.healthAlerts}
            </div>
            <p className="text-xs text-gray-600">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Breeding Due</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {breedingLoading ? "..." : upcomingBreeding.length}
            </div>
            <p className="text-xs text-gray-600">
              Expected births
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Weight</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {livestockStats.avgWeight || "-"}
            </div>
            <p className="text-xs text-gray-600">
              Pounds average
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(livestockStats.totalValue)}
            </div>
            <p className="text-xs text-gray-600">
              Estimated worth
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Species</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {uniqueSpecies.length}
            </div>
            <p className="text-xs text-gray-600">
              Different types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="animals" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Animals</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Health</span>
          </TabsTrigger>
          <TabsTrigger value="breeding" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Breeding</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Recent Activity</CardTitle>
                <CardDescription>Latest health records and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {healthLoading ? (
                  <LoadingSpinner />
                ) : recentHealthRecords.length > 0 ? (
                  <div className="space-y-4">
                    {recentHealthRecords.map((record: HealthRecord) => (
                      <div key={record.id} className="flex items-center justify-between border-l-4 border-farm-green pl-4">
                        <div>
                          <p className="font-medium">{record.description}</p>
                          <p className="text-sm text-gray-600">{record.recordType} • {format(new Date(record.date), 'MMM dd, yyyy')}</p>
                        </div>
                        <Badge variant="outline">{record.performedBy || "Self"}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent health records</p>
                )}
              </CardContent>
            </Card>

            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Upcoming Breeding</CardTitle>
                <CardDescription>Expected births and breeding schedule</CardDescription>
              </CardHeader>
              <CardContent>
                {breedingLoading ? (
                  <LoadingSpinner />
                ) : upcomingBreeding.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBreeding.slice(0, 5).map((record: BreedingRecord) => (
                      <div key={record.id} className="flex items-center justify-between border-l-4 border-purple-500 pl-4">
                        <div>
                          <p className="font-medium">Expected Birth</p>
                          <p className="text-sm text-gray-600">
                            Mother ID: {record.motherId} • Due: {format(new Date(record.expectedBirthDate!), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-purple-50">
                          {Math.ceil((new Date(record.expectedBirthDate!).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No upcoming breeding events</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Animals Tab */}
        <TabsContent value="animals">
          <Card className="ranch-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-dark-green">Animal Inventory</CardTitle>
                  <CardDescription>Complete livestock database</CardDescription>
                </div>
              </div>
              
              {/* Advanced Filters */}
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Search animals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={filterSpecies} onValueChange={setFilterSpecies}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Species" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Species</SelectItem>
                    {uniqueSpecies.map((species) => (
                      <SelectItem key={species} value={species}>
                        {species}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="deceased">Deceased</SelectItem>
                    <SelectItem value="quarantine">Quarantine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {animalsLoading ? (
                <LoadingSpinner />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Species/Breed</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnimals.map((animal: Animal) => (
                      <TableRow key={animal.id}>
                        <TableCell className="font-medium">{animal.tagId}</TableCell>
                        <TableCell>{animal.name || "-"}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{animal.species}</div>
                            <div className="text-sm text-gray-500">{animal.breed || "-"}</div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{animal.gender}</TableCell>
                        <TableCell>{calculateAge(animal.birthDate)}</TableCell>
                        <TableCell>{animal.currentWeight ? `${animal.currentWeight} lbs` : "-"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(animal.status)}>
                            {animal.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(animal.purchasePrice)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedAnimal(animal)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedAnimal(animal);
                                setShowAnimalForm(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteAnimalMutation.mutate(animal.id)}
                              disabled={deleteAnimalMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health">
          <Card className="ranch-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-dark-green">Health Management</CardTitle>
                  <CardDescription>Track vaccinations, treatments, and medical records</CardDescription>
                </div>
                <Dialog open={showHealthForm} onOpenChange={setShowHealthForm}>
                  <DialogTrigger asChild>
                    <Button className="ranch-button-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Health Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <HealthRecordForm onSuccess={() => setShowHealthForm(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {healthLoading ? (
                <LoadingSpinner />
              ) : healthRecords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vet</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {healthRecords.map((record: HealthRecord) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {animals.find((a: Animal) => a.id === record.animalId)?.tagId || `ID: ${record.animalId}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {record.recordType}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.description}</TableCell>
                        <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{record.performedBy || "-"}</TableCell>
                        <TableCell>{formatCurrency(record.cost)}</TableCell>
                        <TableCell>
                          {record.nextDueDate ? format(new Date(record.nextDueDate), 'MMM dd, yyyy') : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No health records found. Add your first health record to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breeding Tab */}
        <TabsContent value="breeding">
          <Card className="ranch-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-dark-green">Breeding Management</CardTitle>
                  <CardDescription>Track breeding cycles, pregnancies, and births</CardDescription>
                </div>
                <Dialog open={showBreedingForm} onOpenChange={setShowBreedingForm}>
                  <DialogTrigger asChild>
                    <Button className="ranch-button-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Breeding Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <BreedingRecordForm onSuccess={() => setShowBreedingForm(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {breedingLoading ? (
                <LoadingSpinner />
              ) : breedingRecords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mother</TableHead>
                      <TableHead>Father</TableHead>
                      <TableHead>Breeding Date</TableHead>
                      <TableHead>Expected Birth</TableHead>
                      <TableHead>Actual Birth</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breedingRecords.map((record: BreedingRecord) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {animals.find((a: Animal) => a.id === record.motherId)?.tagId || `ID: ${record.motherId}`}
                        </TableCell>
                        <TableCell>
                          {record.fatherId ? animals.find((a: Animal) => a.id === record.fatherId)?.tagId || `ID: ${record.fatherId}` : "-"}
                        </TableCell>
                        <TableCell>{format(new Date(record.breedingDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          {record.expectedBirthDate ? format(new Date(record.expectedBirthDate), 'MMM dd, yyyy') : "-"}
                        </TableCell>
                        <TableCell>
                          {record.actualBirthDate ? format(new Date(record.actualBirthDate), 'MMM dd, yyyy') : "-"}
                        </TableCell>
                        <TableCell>
                          {record.actualBirthDate ? (
                            <Badge className="bg-green-100 text-green-800">Born</Badge>
                          ) : record.expectedBirthDate && new Date(record.expectedBirthDate) < new Date() ? (
                            <Badge className="bg-yellow-100 text-yellow-800">Overdue</Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800">Pregnant</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No breeding records found. Add your first breeding record to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}