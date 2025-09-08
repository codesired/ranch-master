import { ReactNode } from "react";
import Header from "@/components/layout/header";
import Navigation from "@/components/layout/navigation";
import MobileNav from "@/components/layout/mobile-nav";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-light-green">
      <Header />
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}