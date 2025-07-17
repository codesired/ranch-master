import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Package, 
  Wrench, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Search,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Manual() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const manualSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      content: {
        overview: "Welcome to your comprehensive ranch management system! This guide will help you get started with managing your livestock, finances, inventory, and more.",
        steps: [
          "Complete your user profile setup",
          "Add your first animals to the livestock system",
          "Set up your financial categories and initial transactions",
          "Configure your inventory with current stock levels",
          "Register your equipment and set maintenance schedules"
        ],
        tips: [
          "Start with the Dashboard to get an overview of your ranch",
          "Use the seeding feature to populate with sample data",
          "Set up low stock alerts for critical inventory items",
          "Regular data backup is recommended monthly"
        ]
      }
    },
    {
      id: "livestock",
      title: "Livestock Management",
      icon: Users,
      content: {
        overview: "Manage your animals with comprehensive tracking for health, breeding, and production records.",
        features: [
          "Animal registration with unique tag IDs",
          "Health record tracking and vaccination schedules",
          "Breeding program management",
          "Weight monitoring and growth tracking",
          "Location and pasture management"
        ],
        bestPractices: [
          "Always use unique, consistent tag IDs",
          "Record health treatments immediately",
          "Track breeding dates for accurate due date calculations",
          "Monitor weight changes for health indicators",
          "Keep detailed notes for each animal"
        ]
      }
    },
    {
      id: "finances",
      title: "Financial Management",
      icon: DollarSign,
      content: {
        overview: "Track all ranch income and expenses with detailed categorization and reporting.",
        categories: {
          income: [
            "Livestock Sales",
            "Crop Sales", 
            "Dairy Products",
            "Poultry Products",
            "Hay Sales",
            "Equipment Rental",
            "Subsidies"
          ],
          expenses: [
            "Feed & Nutrition",
            "Veterinary & Health",
            "Equipment & Machinery",
            "Labor & Wages",
            "Utilities & Fuel",
            "Insurance",
            "Maintenance & Repairs"
          ]
        },
        reports: [
          "Monthly profit/loss statements",
          "Category-wise expense analysis",
          "Revenue trend analysis",
          "Tax preparation reports"
        ]
      }
    },
    {
      id: "inventory",
      title: "Inventory Management",
      icon: Package,
      content: {
        overview: "Keep track of feed, supplies, and materials with automated low-stock alerts.",
        categories: [
          "Feed & Nutrition",
          "Veterinary Supplies",
          "Equipment & Tools",
          "Seeds & Planting",
          "Fertilizer & Chemicals",
          "Fuel & Energy",
          "Bedding & Supplies"
        ],
        features: [
          "Automatic low-stock threshold alerts",
          "Supplier information tracking",
          "Cost per unit calculations",
          "Expiration date monitoring",
          "Storage location management"
        ]
      }
    },
    {
      id: "equipment",
      title: "Equipment Management",
      icon: Wrench,
      content: {
        overview: "Manage your farm equipment with maintenance schedules and service records.",
        equipmentTypes: [
          "Tractors",
          "Harvesters",
          "Plows",
          "Seeders",
          "Sprayers",
          "Mowers",
          "Balers",
          "Irrigation Systems"
        ],
        maintenanceTypes: [
          "Routine maintenance (oil changes, filters)",
          "Repairs (breakdowns, part replacements)",
          "Inspections (safety, operational checks)",
          "Upgrades (performance improvements)"
        ]
      }
    },
    {
      id: "documents",
      title: "Document Management",
      icon: FileText,
      content: {
        overview: "Organize and store important ranch documents with easy search and retrieval.",
        documentTypes: [
          "Health certificates",
          "Financial records",
          "Equipment warranties",
          "Insurance policies",
          "Permits and licenses",
          "Contracts and agreements"
        ],
        organization: [
          "Use consistent naming conventions",
          "Add relevant tags for easy searching",
          "Set expiration dates for time-sensitive documents",
          "Regular backup of important files"
        ]
      }
    }
  ];

  const filteredSections = manualSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.overview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">Ranch Management Manual</h1>
          <p className="text-gray-600">Complete guide to using your ranch management system effectively.</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search manual..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" className="ranch-button-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Quick Navigation */}
      <Card className="ranch-card">
        <CardHeader>
          <CardTitle className="text-dark-green">Quick Navigation</CardTitle>
          <CardDescription>Jump to any section of the manual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {manualSections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "outline"}
                  className="flex flex-col items-center p-4 h-auto"
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon className="h-6 w-6 mb-2" />
                  <span className="text-sm text-center">{section.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Manual Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Table of Contents */}
        <div className="lg:col-span-1">
          <Card className="ranch-card sticky top-4">
            <CardHeader>
              <CardTitle className="text-dark-green">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveSection(section.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {section.title}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {filteredSections.map((section) => (
            <Card
              key={section.id}
              className={`ranch-card ${activeSection === section.id ? 'ring-2 ring-farm-green' : 'hidden'}`}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <section.icon className="h-8 w-8 text-farm-green" />
                  <div>
                    <CardTitle className="text-dark-green">{section.title}</CardTitle>
                    <CardDescription>{section.content.overview}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Steps */}
                {section.content.steps && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-green mb-3">Getting Started Steps</h3>
                    <div className="space-y-2">
                      {section.content.steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Badge variant="outline" className="mt-1">
                            {index + 1}
                          </Badge>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                {section.content.features && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-green mb-3">Key Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.content.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {section.content.categories && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-green mb-3">Categories</h3>
                    {typeof section.content.categories === 'object' && !Array.isArray(section.content.categories) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(section.content.categories).map(([type, items]) => (
                          <div key={type}>
                            <h4 className="font-medium text-earth-brown mb-2 capitalize">{type}</h4>
                            <div className="space-y-1">
                              {items.map((item, index) => (
                                <Badge key={index} variant="outline" className="mr-2 mb-1">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {section.content.categories.map((category, index) => (
                          <Badge key={index} variant="outline" className="justify-start">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Equipment Types */}
                {section.content.equipmentTypes && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-green mb-3">Equipment Types</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {section.content.equipmentTypes.map((type, index) => (
                        <Badge key={index} variant="outline" className="justify-center">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Best Practices */}
                {section.content.bestPractices && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-green mb-3">Best Practices</h3>
                    <div className="space-y-2">
                      {section.content.bestPractices.map((practice, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                          <span className="text-sm">{practice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {section.content.tips && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-green mb-3">Tips</h3>
                    <div className="space-y-2">
                      {section.content.tips.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-harvest-orange mt-0.5" />
                          <span className="text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reports */}
                {section.content.reports && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-green mb-3">Available Reports</h3>
                    <div className="space-y-2">
                      {section.content.reports.map((report, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                          <span className="text-sm">{report}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document Types */}
                {section.content.documentTypes && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-green mb-3">Document Types</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {section.content.documentTypes.map((type, index) => (
                        <Badge key={index} variant="outline" className="justify-center">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Organization */}
                {section.content.organization && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-green mb-3">Organization Tips</h3>
                    <div className="space-y-2">
                      {section.content.organization.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <span className="text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Maintenance Types */}
                {section.content.maintenanceTypes && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-green mb-3">Maintenance Types</h3>
                    <div className="space-y-2">
                      {section.content.maintenanceTypes.map((type, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Wrench className="h-5 w-5 text-earth-brown mt-0.5" />
                          <span className="text-sm">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <Card className="ranch-card">
        <CardHeader>
          <CardTitle className="text-dark-green">Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions and answers about using the ranch management system</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="backup">
              <AccordionTrigger>How do I backup my data?</AccordionTrigger>
              <AccordionContent>
                Your data is automatically backed up daily. You can also export data from each module using the export buttons in the respective sections.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="mobile">
              <AccordionTrigger>Can I use this on mobile devices?</AccordionTrigger>
              <AccordionContent>
                Yes! The system is fully responsive and works on tablets and smartphones. For the best experience, we recommend using it on a tablet or larger screen.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="reports">
              <AccordionTrigger>How do I generate reports?</AccordionTrigger>
              <AccordionContent>
                Reports are available in the Reports section. You can customize date ranges, filter by categories, and export reports as PDF or CSV files.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="support">
              <AccordionTrigger>Where can I get support?</AccordionTrigger>
              <AccordionContent>
                Support is available through the help section in your dashboard. You can also contact our support team directly for technical assistance.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}