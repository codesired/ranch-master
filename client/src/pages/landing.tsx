import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tractor, Dog, DollarSign, BarChart3, Shield, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, hsl(var(--light-green)) 0%, hsl(var(--muted)) 100%)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 ranch-hero-gradient"></div>
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
              className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-200"
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
          <h2 className="text-4xl font-bold text-primary mb-6">Everything You Need to Manage Your Ranch</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            From livestock tracking to financial management, our platform provides all the tools you need to run a successful ranch operation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="ranch-card-dashboard">
            <CardHeader>
              <Dog className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-primary text-xl">Livestock Management</CardTitle>
              <CardDescription className="text-gray-600">
                Track individual animals, health records, breeding history, and performance metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Individual animal profiles
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Health and vaccination tracking
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Breeding records and lineage
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Performance analytics
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="ranch-card-dashboard">
            <CardHeader>
              <DollarSign className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle className="text-primary text-xl">Financial Management</CardTitle>
              <CardDescription className="text-gray-600">
                Monitor expenses, track income, and analyze profitability across your operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  Income and expense tracking
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  Category-based budgeting
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  Profit and loss analysis
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  Financial reporting
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="ranch-card-dashboard">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle className="text-primary text-xl">Operations Dashboard</CardTitle>
              <CardDescription className="text-gray-600">
                Real-time insights into your ranch operations with comprehensive reporting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Key performance metrics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Activity tracking
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Equipment monitoring
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Weather integration
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="ranch-card-dashboard">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle className="text-primary text-xl">Document Management</CardTitle>
              <CardDescription className="text-gray-600">
                Store and organize important documents, receipts, and records securely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                  Digital document storage
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                  Receipt management
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                  Photo organization
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                  Secure cloud backup
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="ranch-card-dashboard">
            <CardHeader>
              <Users className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle className="text-primary text-xl">Multi-User Access</CardTitle>
              <CardDescription className="text-gray-600">
                Role-based access control for team members and ranch staff.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
                  Role-based permissions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
                  Team collaboration
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
                  Activity logging
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
                  User management
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="ranch-card-dashboard">
            <CardHeader>
              <Tractor className="h-12 w-12 text-amber-600 mb-4" />
              <CardTitle className="text-primary text-xl">Equipment Tracking</CardTitle>
              <CardDescription className="text-gray-600">
                Monitor equipment status, maintenance schedules, and operational costs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mr-3"></span>
                  Equipment inventory
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mr-3"></span>
                  Maintenance scheduling
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mr-3"></span>
                  Operational tracking
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mr-3"></span>
                  Cost analysis
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary mb-6">Ready to Transform Your Ranch Management?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
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
