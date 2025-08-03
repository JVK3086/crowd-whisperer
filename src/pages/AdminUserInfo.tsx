import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ArrowLeft,
  BookOpen,
  HelpCircle,
  PlayCircle,
  Settings,
  Users,
  BarChart3,
  Shield,
  Eye,
  Bell,
  Map,
  Camera,
  Activity,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Video,
  FileText,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';

const GETTING_STARTED_STEPS = [
  {
    step: 1,
    title: "Configure Your Venue",
    description: "Set up your venue type, zones, and basic information",
    icon: Settings,
    details: "Go to Settings tab and configure your venue details, emergency contacts, and system preferences."
  },
  {
    step: 2,
    title: "Upload Floor Plan",
    description: "Add your venue's floor plan for accurate crowd mapping",
    icon: Map,
    details: "Use the Interactive Map tab to upload your floor plan and mark gates, emergency exits, and zones."
  },
  {
    step: 3,
    title: "Monitor Live Data",
    description: "View real-time crowd analytics and AI insights",
    icon: BarChart3,
    details: "Check the Overview tab for live crowd density, predictions, and system alerts."
  },
  {
    step: 4,
    title: "Manage Alerts",
    description: "Configure and respond to crowd density alerts",
    icon: Bell,
    details: "Set alert thresholds and monitor notifications in the Alerts tab."
  },
  {
    step: 5,
    title: "Emergency Response",
    description: "Use emergency controls when needed",
    icon: Shield,
    details: "Access emergency mode, gate controls, and broadcast systems in System Controls."
  }
];

const FEATURES_GUIDE = [
  {
    category: "Monitoring",
    icon: Eye,
    features: [
      { name: "Real-time Crowd Heatmap", description: "Visual representation of crowd density across your venue" },
      { name: "AI Insights", description: "Machine learning predictions and recommendations" },
      { name: "Live Zone Status", description: "Current capacity and status of each venue zone" },
      { name: "CCTV Integration", description: "Monitor security cameras from the dashboard" }
    ]
  },
  {
    category: "Alerts & Safety",
    icon: Shield,
    features: [
      { name: "Predictive Alerts", description: "Early warning system for potential crowd issues" },
      { name: "Emergency Mode", description: "One-click activation of emergency protocols" },
      { name: "Gate Control", description: "Remote control of entrance and exit gates" },
      { name: "Emergency Broadcast", description: "Send alerts to all mobile users instantly" }
    ]
  },
  {
    category: "Management",
    icon: Settings,
    features: [
      { name: "Venue Configuration", description: "Customize zones, capacity, and settings" },
      { name: "User Management", description: "Control access and permissions" },
      { name: "System Settings", description: "Configure alerts, languages, and features" },
      { name: "Reports & Analytics", description: "Historical data and performance reports" }
    ]
  },
  {
    category: "Advanced",
    icon: Camera,
    features: [
      { name: "Drone Control", description: "Deploy and manage surveillance drones" },
      { name: "AI Predictions", description: "Future crowd flow predictions" },
      { name: "Route Optimization", description: "Suggest optimal paths for crowd flow" },
      { name: "Integration APIs", description: "Connect with external systems" }
    ]
  }
];

const FAQ_ITEMS = [
  {
    question: "How do I set up my venue for the first time?",
    answer: "Start by going to the Settings tab and clicking 'Venue Setup'. Follow the wizard to configure your venue type, zones, and basic information. Then upload your floor plan in the Interactive Map tab."
  },
  {
    question: "What should I do when I see a critical alert?",
    answer: "Critical alerts require immediate attention. Check the Alerts tab for details, consider activating Emergency Mode if necessary, and use gate controls to manage crowd flow. You can also send emergency broadcasts to mobile users."
  },
  {
    question: "How accurate are the AI predictions?",
    answer: "AI predictions improve over time as the system learns from your venue's patterns. Initial accuracy is around 70-80%, improving to 90%+ after several weeks of operation."
  },
  {
    question: "Can I customize alert thresholds?",
    answer: "Yes! Go to Settings > Alert Thresholds to customize when alerts trigger based on crowd density percentages for your specific venue needs."
  },
  {
    question: "How do I add or remove zones?",
    answer: "Use the Interactive Map tab to add zones by drawing on your floor plan, or go to Settings > Zone Configuration to modify existing zones."
  },
  {
    question: "What happens during Emergency Mode?",
    answer: "Emergency Mode activates all safety protocols: sends alerts to mobile users, opens all emergency exits, stops non-essential systems, and prioritizes emergency communications."
  }
];

const AdminUserInfo = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('getting-started');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Admin User Guide</h1>
              <p className="text-sm text-muted-foreground">Complete guide to using the Control Center</p>
            </div>
          </div>
          <Badge variant="outline">Help Center</Badge>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="getting-started" className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Features Guide
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Tutorials
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Follow these steps to get your crowd management system up and running
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {GETTING_STARTED_STEPS.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.step} className="flex gap-4 p-4 rounded-lg border">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">{step.step}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{step.title}</h3>
                          </div>
                          <p className="text-muted-foreground mb-2">{step.description}</p>
                          <p className="text-sm text-muted-foreground">{step.details}</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500 mt-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro Tip:</strong> Start with the venue setup wizard to ensure optimal system configuration for your specific venue type.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6">
              {FEATURES_GUIDE.map((category) => {
                const Icon = category.icon;
                return (
                  <Card key={category.category}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {category.features.map((feature, index) => (
                          <div key={index} className="p-3 rounded border">
                            <h4 className="font-medium mb-1">{feature.name}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Video Tutorials
                  </CardTitle>
                  <CardDescription>Step-by-step video guides</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded border hover:bg-muted/50 cursor-pointer">
                    <h4 className="font-medium">Setting Up Your First Venue</h4>
                    <p className="text-sm text-muted-foreground">5 minutes</p>
                  </div>
                  <div className="p-3 rounded border hover:bg-muted/50 cursor-pointer">
                    <h4 className="font-medium">Understanding AI Insights</h4>
                    <p className="text-sm text-muted-foreground">8 minutes</p>
                  </div>
                  <div className="p-3 rounded border hover:bg-muted/50 cursor-pointer">
                    <h4 className="font-medium">Emergency Response Procedures</h4>
                    <p className="text-sm text-muted-foreground">12 minutes</p>
                  </div>
                  <div className="p-3 rounded border hover:bg-muted/50 cursor-pointer">
                    <h4 className="font-medium">Advanced Analytics & Reporting</h4>
                    <p className="text-sm text-muted-foreground">15 minutes</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Written Guides
                  </CardTitle>
                  <CardDescription>Detailed documentation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded border hover:bg-muted/50 cursor-pointer">
                    <h4 className="font-medium">Complete Setup Manual</h4>
                    <p className="text-sm text-muted-foreground">Comprehensive guide</p>
                  </div>
                  <div className="p-3 rounded border hover:bg-muted/50 cursor-pointer">
                    <h4 className="font-medium">API Integration Guide</h4>
                    <p className="text-sm text-muted-foreground">For developers</p>
                  </div>
                  <div className="p-3 rounded border hover:bg-muted/50 cursor-pointer">
                    <h4 className="font-medium">Best Practices Handbook</h4>
                    <p className="text-sm text-muted-foreground">Optimization tips</p>
                  </div>
                  <div className="p-3 rounded border hover:bg-muted/50 cursor-pointer">
                    <h4 className="font-medium">Troubleshooting Guide</h4>
                    <p className="text-sm text-muted-foreground">Common issues</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Common questions and answers about the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {FAQ_ITEMS.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Get Help
                  </CardTitle>
                  <CardDescription>Multiple ways to reach our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded border">
                    <Phone className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">24/7 Emergency Support</h4>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded border">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Email Support</h4>
                      <p className="text-sm text-muted-foreground">support@crowdflow.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded border">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    <div>
                      <h4 className="font-medium">Live Chat</h4>
                      <p className="text-sm text-muted-foreground">Available 9 AM - 6 PM EST</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    System Status
                  </CardTitle>
                  <CardDescription>Current system health and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded border">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">AI Services</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded border">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Real-time Data</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded border">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium">Mobile Sync</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">Maintenance</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                For emergency situations involving immediate safety concerns, call emergency services (911) first, then contact our emergency support line.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminUserInfo;