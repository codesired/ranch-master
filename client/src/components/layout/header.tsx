import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logOut } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  Tractor,
  CloudSun,
  ChevronDown,
  Settings,
  User,
  Shield,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationSystem } from "@/components/notifications/notification-system";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="ranch-hero-gradient text-white shadow-lg border-b border-green-800/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Tractor className="h-8 w-8 text-white" />
            <h1 className="text-xl font-bold">Ranch Management System</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Weather Widget */}
            <div className="hidden md:flex items-center space-x-2 bg-green-600 px-3 py-1 rounded-lg">
              <CloudSun className="h-4 w-4 text-harvest-orange" />
              <span className="text-sm">72°F | Sunny</span>
            </div>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>

            <NotificationSystem />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-white hover:bg-green-600"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={(user as any)?.profileImageUrl || undefined}
                      alt={(user as any)?.firstName || "User"}
                    />
                    <AvatarFallback className="bg-green-600 text-white">
                      {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline">
                    {(user as any)?.firstName
                      ? `${(user as any).firstName} ${(user as any).lastName || ""}`.trim()
                      : (user as any)?.email || "User"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center space-x-2">
                  <span>My Account</span>
                  {(user as any)?.role === "admin" && (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {(user as any)?.role === "manager" && (
                    <Badge variant="outline" className="text-xs">
                      Manager
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer flex items-center space-x-2"
                  onClick={() => setLocation("/profile")}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex items-center space-x-2"
                  onClick={() => setLocation("/settings")}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                {(user as any)?.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer flex items-center space-x-2"
                      onClick={() => setLocation("/admin")}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}