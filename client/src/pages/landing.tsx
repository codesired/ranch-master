import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tractor, Dog, DollarSign, BarChart3, Shield, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-light-green">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-farm-green to-green-600"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-6">
              <Tractor className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6">Ranch Management System</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Comprehensive livestock management, financial tracking, and agricultural operations dashboard designed for modern ranchers.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-farm-green hover:bg-gray-100 text-lg px-8 py-4"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark-green mb-4">Everything You Need to Manage Your Ranch</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From livestock tracking to financial management, our platform provides all the tools you need to run a successful ranch operation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="ranch-card">
            <CardHeader>
              <Dog className="h-12 w-12 text-farm-green mb-4" />
              <CardTitle className="text-dark-green">Livestock Management</CardTitle>
              <CardDescription>
                Track individual animals, health records, breeding history, and performance metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Individual animal profiles</li>
                <li>• Health and vaccination tracking</li>
                <li>• Breeding records and lineage</li>
                <li>• Performance analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="ranch-card">
            <CardHeader>
              <DollarSign className="h-12 w-12 text-harvest-orange mb-4" />
              <CardTitle className="text-dark-green">Financial Management</CardTitle>
              <CardDescription>
                Monitor expenses, track income, and analyze profitability across your operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Income and expense tracking</li>
                <li>• Category-based budgeting</li>
                <li>• Profit and loss analysis</li>
                <li>• Financial reporting</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="ranch-card">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-earth-brown mb-4" />
              <CardTitle className="text-dark-green">Operations Dashboard</CardTitle>
              <CardDescription>
                Real-time insights into your ranch operations with comprehensive reporting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Key performance metrics</li>
                <li>• Activity tracking</li>
                <li>• Equipment monitoring</li>
                <li>• Weather integration</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="ranch-card">
            <CardHeader>
              <Shield className="h-12 w-12 text-farm-green mb-4" />
              <CardTitle className="text-dark-green">Document Management</CardTitle>
              <CardDescription>
                Store and organize important documents, receipts, and records securely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Digital document storage</li>
                <li>• Receipt management</li>
                <li>• Photo organization</li>
                <li>• Secure cloud backup</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="ranch-card">
            <CardHeader>
              <Users className="h-12 w-12 text-harvest-orange mb-4" />
              <CardTitle className="text-dark-green">Multi-User Access</CardTitle>
              <CardDescription>
                Role-based access control for team members and ranch staff.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Role-based permissions</li>
                <li>• Team collaboration</li>
                <li>• Activity logging</li>
                <li>• User management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="ranch-card">
            <CardHeader>
              <Tractor className="h-12 w-12 text-earth-brown mb-4" />
              <CardTitle className="text-dark-green">Equipment Tracking</CardTitle>
              <CardDescription>
                Monitor equipment status, maintenance schedules, and operational costs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Equipment inventory</li>
                <li>• Maintenance scheduling</li>
                <li>• Operational tracking</li>
                <li>• Cost analysis</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-dark-green mb-6">Ready to Transform Your Ranch Management?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of ranchers who have already improved their operations with our comprehensive management platform.
          </p>
          <Button 
            size="lg" 
            className="ranch-button-primary text-lg px-8 py-4"
            onClick={() => window.location.href = '/api/login'}
          >
            Sign In to Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
