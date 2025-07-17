import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Dog, 
  DollarSign, 
  Plus, 
  User 
} from "lucide-react";

const mobileNavItems = [
  { path: "/", label: "Dashboard", icon: BarChart3 },
  { path: "/livestock", label: "Livestock", icon: Dog },
  { path: "/finances", label: "Finance", icon: DollarSign },
  { path: "/add", label: "Add", icon: Plus },
  { path: "/profile", label: "Profile", icon: User },
];

export default function MobileNav() {
  const [location, setLocation] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-light-grey z-50">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={`flex flex-col items-center p-2 ${
                isActive ? 'text-farm-green' : 'text-gray-500'
              }`}
              onClick={() => {
                if (item.path === "/add") {
                  // Could trigger add dialog
                  return;
                }
                if (item.path === "/profile") {
                  // Could trigger profile dialog
                  return;
                }
                setLocation(item.path);
              }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
