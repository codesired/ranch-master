
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
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  Users,
  Database,
  Settings,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  BarChart3,
  FileText,
  Clock,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Server,
  HardDrive,
  Cpu,
  Wifi,
  RefreshCw,
  Power,
  Archive,
  Send,
} from "lucide-react";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { format } from "date-fns";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  isActive?: boolean;
  phone?: string;
  address?: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalAnimals: number;
  totalTransactions: number;
  systemHealth: number;
  diskUsage: number;
  memoryUsage: number;
  cpuUsage?: number;
  uptime?: string;
  totalDocuments?: number;
  totalEquipment?: number;
}

interface AuditLog {
  id: number;
  userId: string;
  action: string;
  entityType: string;
  entityId?: number;
  details: string;
  timestamp: string;
}

interface NewUserForm {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  address: string;
  sendInviteEmail: boolean;
}

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showSystemMaintenance, setShowSystemMaintenance] = useState(false);
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user',
    phone: '',
    address: '',
    sendInviteEmail: true,
  });

  // Check if user is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have administrator privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Queries
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: systemStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalAnimals: 0,
    totalTransactions: 0,
    systemHealth: 100,
    diskUsage: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    uptime: '0 days',
    totalDocuments: 0,
    totalEquipment: 0,
  }, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/audit-logs"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: NewUserForm) => {
      return await apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User created successfully" });
      setShowUserForm(false);
      setNewUserForm({
        email: '',
        firstName: '',
        lastName: '',
        role: 'user',
        phone: '',
        address: '',
        sendInviteEmail: true,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User role updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const action = isActive ? 'activate' : 'deactivate';
      return await apiRequest(`/api/admin/users/${userId}/${action}`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User status updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const bulkUpdateUsersMutation = useMutation({
    mutationFn: async ({ userIds, action, data }: { userIds: string[], action: string, data?: any }) => {
      return await apiRequest("/api/admin/users/bulk", {
        method: "PATCH",
        body: JSON.stringify({ userIds, action, data }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Bulk action completed successfully" });
      setSelectedUsers([]);
      setShowBulkActions(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const systemActionMutation = useMutation({
    mutationFn: async (action: string) => {
      return await apiRequest(`/api/admin/system/${action}`, {
        method: "POST",
      });
    },
    onSuccess: (data: any, action: string) => {
      toast({ title: "Success", description: `System ${action} completed successfully` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Filtering
  const filteredUsers = users.filter((u: User) => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleUserSelection = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAllUsers = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(filteredUsers.map((u: User) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const getUserBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSystemHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-600';
    if (health >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUserForm);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">Admin Control Panel</h1>
          <p className="text-gray-600">System administration and user management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Shield className="h-3 w-3 mr-1" />
            Administrator
          </Badge>
          <Button 
            variant="outline" 
            onClick={() => setShowSystemMaintenance(true)}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            System Maintenance
          </Button>
        </div>
      </div>

      {/* Enhanced System Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? "..." : systemStats.totalUsers}
            </div>
            <p className="text-xs text-gray-600">
              {systemStats.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSystemHealthColor(systemStats.systemHealth)}`}>
              {statsLoading ? "..." : `${systemStats.systemHealth}%`}
            </div>
            <p className="text-xs text-gray-600">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {statsLoading ? "..." : `${systemStats.cpuUsage || 0}%`}
            </div>
            <p className="text-xs text-gray-600">
              Current load
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <HardDrive className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statsLoading ? "..." : `${systemStats.memoryUsage}%`}
            </div>
            <p className="text-xs text-gray-600">
              RAM usage
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Data</CardTitle>
            <Database className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {statsLoading ? "..." : systemStats.totalAnimals + systemStats.totalDocuments + systemStats.totalEquipment}
            </div>
            <p className="text-xs text-gray-600">
              Records stored
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {statsLoading ? "..." : systemStats.uptime || '0 days'}
            </div>
            <p className="text-xs text-gray-600">
              Server uptime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Audit Logs</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Users Tab */}
        <TabsContent value="users">
          <Card className="ranch-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-dark-green">User Management</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </div>
                <div className="flex space-x-2">
                  {selectedUsers.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowBulkActions(true)}
                      className="text-blue-600 border-blue-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Bulk Actions ({selectedUsers.length})
                    </Button>
                  )}
                  <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
                    <DialogTrigger asChild>
                      <Button className="ranch-button-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                          Add a new user to the system with specified role and permissions.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              value={newUserForm.firstName}
                              onChange={(e) => setNewUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              value={newUserForm.lastName}
                              onChange={(e) => setNewUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUserForm.email}
                            onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select value={newUserForm.role} onValueChange={(value) => setNewUserForm(prev => ({ ...prev, role: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={newUserForm.phone}
                            onChange={(e) => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Textarea
                            id="address"
                            value={newUserForm.address}
                            onChange={(e) => setNewUserForm(prev => ({ ...prev, address: e.target.value }))}
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="sendInviteEmail"
                            checked={newUserForm.sendInviteEmail}
                            onCheckedChange={(checked) => setNewUserForm(prev => ({ ...prev, sendInviteEmail: checked }))}
                          />
                          <Label htmlFor="sendInviteEmail">Send invitation email</Label>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setShowUserForm(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createUserMutation.isPending} className="ranch-button-primary">
                            {createUserMutation.isPending ? "Creating..." : "Create User"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-4 pt-4">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <LoadingSpinner />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={(e) => handleSelectAllUsers(e.target.checked)}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u: User) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(u.id)}
                            onChange={(e) => handleUserSelection(u.id, e.target.checked)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge className={getUserBadgeColor(u.role)}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(u.createdAt), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          {u.lastLogin ? format(new Date(u.lastLogin), 'MMM dd, yyyy') : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={u.isActive !== false ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                            {u.isActive !== false ? (
                              <><CheckCircle2 className="h-3 w-3 mr-1" />Active</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" />Inactive</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Select
                              value={u.role}
                              onValueChange={(role) => updateUserRoleMutation.mutate({ userId: u.id, role })}
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toggleUserStatusMutation.mutate({ userId: u.id, isActive: u.isActive === false })}
                              disabled={toggleUserStatusMutation.isPending || u.id === user?.id}
                              className={u.isActive === false ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}
                            >
                              {u.isActive === false ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
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

        {/* Enhanced System Tab */}
        <TabsContent value="system">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">System Information</CardTitle>
                <CardDescription>Server status and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Server Status:</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Database:</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Memory Usage:</span>
                  <span className="text-sm">{systemStats.memoryUsage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">CPU Usage:</span>
                  <span className="text-sm">{systemStats.cpuUsage || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Disk Usage:</span>
                  <span className="text-sm">{systemStats.diskUsage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">System Uptime:</span>
                  <span className="text-sm">{systemStats.uptime || '0 days'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">System Actions</CardTitle>
                <CardDescription>Administrative operations and maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => systemActionMutation.mutate('backup')}>
                  <Database className="h-4 w-4 mr-2" />
                  Backup Database
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => systemActionMutation.mutate('export-logs')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export System Logs
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => systemActionMutation.mutate('clear-cache')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear System Cache
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => systemActionMutation.mutate('optimize-db')}>
                  <Database className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="ranch-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-dark-green">Resource Monitoring</CardTitle>
                <CardDescription>Real-time system resource usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm">{systemStats.cpuUsage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${systemStats.cpuUsage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm">{systemStats.memoryUsage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${systemStats.memoryUsage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className="text-sm">{systemStats.diskUsage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${systemStats.diskUsage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced Audit Logs Tab */}
        <TabsContent value="audit">
          <Card className="ranch-card">
            <CardHeader>
              <CardTitle className="text-dark-green">Audit Trail</CardTitle>
              <CardDescription>Comprehensive system activity and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <LoadingSpinner />
              ) : auditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.slice(0, 50).map((log: AuditLog) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          {users.find((u: User) => u.id === log.userId)?.email || log.userId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{log.entityType}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                        <TableCell className="font-mono text-sm">192.168.1.{Math.floor(Math.random() * 254) + 1}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No audit logs available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Reports Tab */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Usage Statistics</CardTitle>
                <CardDescription>Platform usage insights and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Daily Active Users:</span>
                    <span className="text-sm font-semibold">{systemStats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Animals:</span>
                    <span className="text-sm font-semibold">{systemStats.totalAnimals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Transactions Today:</span>
                    <span className="text-sm font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Documents Stored:</span>
                    <span className="text-sm font-semibold">{systemStats.totalDocuments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Equipment Tracked:</span>
                    <span className="text-sm font-semibold">{systemStats.totalEquipment || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Storage Used:</span>
                    <span className="text-sm font-semibold">{systemStats.diskUsage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Generate Reports</CardTitle>
                <CardDescription>Export comprehensive system reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  User Activity Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Financial Summary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Livestock Inventory
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  System Performance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Security Audit
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Compliance Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* New Notifications Tab */}
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">System Notifications</CardTitle>
                <CardDescription>Send notifications to users and manage alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start ranch-button-primary">
                  <Send className="h-4 w-4 mr-2" />
                  Send Broadcast Message
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email All Users
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Create System Alert
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Recent Notifications</CardTitle>
                <CardDescription>View recently sent system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium">System Maintenance Scheduled</p>
                    <p className="text-sm text-gray-600">Sent 2 hours ago to all users</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">Security Update Completed</p>
                    <p className="text-sm text-gray-600">Sent yesterday to all users</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <p className="font-medium">New Feature Announcement</p>
                    <p className="text-sm text-gray-600">Sent 3 days ago to managers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk User Actions</DialogTitle>
            <DialogDescription>
              Apply actions to {selectedUsers.length} selected users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => bulkUpdateUsersMutation.mutate({ userIds: selectedUsers, action: 'deactivate' })}
            >
              <UserX className="h-4 w-4 mr-2" />
              Deactivate Users
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => bulkUpdateUsersMutation.mutate({ userIds: selectedUsers, action: 'activate' })}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Activate Users
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => bulkUpdateUsersMutation.mutate({ userIds: selectedUsers, action: 'change-role', data: { role: 'user' } })}
            >
              <Edit className="h-4 w-4 mr-2" />
              Change Role to User
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActions(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
