import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Dog, 
  DollarSign, 
  Package, 
  Wrench, 
  FileText, 
  ChartBar,
  BookOpen,
  User
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: BarChart3 },
  { path: "/livestock", label: "Livestock", icon: Dog },
  { path: "/finances", label: "Finances", icon: DollarSign },
  { path: "/inventory", label: "Inventory", icon: Package },
  { path: "/equipment", label: "Equipment", icon: Wrench },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/reports", label: "Reports", icon: ChartBar },
  { path: "/manual", label: "Manual", icon: BookOpen },
  { path: "/profile", label: "Profile", icon: User },
];

export default function Navigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-light-grey">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <Button
                key={item.path}
                variant="ghost"
                className={`ranch-nav-tab ${isActive ? 'active' : ''}`}
                onClick={() => setLocation(item.path)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}