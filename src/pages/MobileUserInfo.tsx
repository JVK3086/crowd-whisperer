import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useVenueConfig } from '@/hooks/useVenueConfig';
import { 
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Smartphone,
  Map,
  Bell,
  Shield,
  Navigation,
  QrCode,
  Wifi,
  Calendar,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Video,
  FileText,
  Phone,
  MapPin,
  Route,
  Users,
  Activity
} from 'lucide-react';

const MOBILE_FEATURES = [
  {
    icon: Map,
    title: "Live Venue Map",
    description: "See real-time crowd density and navigate safely",
    details: "The map shows current crowd levels in different areas. Green areas are less crowded, red areas are busy. Tap on zones to see more details."
  },
  {
    icon: Navigation,
    title: "Smart Navigation",
    description: "Get the safest route to your destination",
    details: "Enter where you want to go, and we'll calculate the best route avoiding crowded areas. The route updates automatically if conditions change."
  },
  {
    icon: Bell,
    title: "Crowd Alerts",
    description: "Receive notifications about crowd conditions",
    details: "Get notified when areas become crowded, when new safe routes are available, or when there are important venue announcements."
  },
  {
    icon: Shield,
    title: "Emergency Features",
    description: "Quick access to emergency help and exits",
    details: "Emergency button for immediate help, find nearest exits, and get emergency evacuation routes. Your location is shared with security when needed."
  },
  {
    icon: QrCode,
    title: "QR Scanner",
    description: "Scan codes for venue information and services",
    details: "Scan QR codes around the venue for maps, event info, menus, or to check in to specific areas. Works offline too."
  },
  {
    icon: Calendar,
    title: "Events & Schedule",
    description: "Stay updated with venue events and timings",
    details: "See current and upcoming events, get timing updates, and receive notifications about schedule changes or special announcements."
  }
];

const QUICK_TIPS = [
  {
    icon: Lightbulb,
    title: "Enable Location Services",
    tip: "Allow location access for accurate navigation and personalized crowd alerts based on your position."
  },
  {
    icon: Bell,
    title: "Turn On Notifications",
    tip: "Enable push notifications to receive important safety alerts and venue announcements."
  },
  {
    icon: Wifi,
    title: "Download Offline Maps",
    tip: "Use the offline mode to download venue maps and emergency information when internet is slow."
  },
  {
    icon: Shield,
    title: "Know Emergency Features",
    tip: "Familiarize yourself with the emergency button location and how to quickly access help."
  }
];

const FAQ_ITEMS = [
  {
    question: "How does the app know where I am?",
    answer: "The app uses your phone's GPS and WiFi signals to determine your location within the venue. This helps provide accurate navigation and crowd information for your specific area."
  },
  {
    question: "Will the app work without internet?",
    answer: "Yes! The app has offline features including maps, emergency contacts, and basic venue information. Download the offline content before you need it."
  },
  {
    question: "What should I do in an emergency?",
    answer: "Tap the emergency button for immediate help. The app will show you the nearest exit routes and notify venue security of your location. For life-threatening situations, call 911 directly."
  },
  {
    question: "How accurate are the crowd predictions?",
    answer: "The app uses real-time data and AI to predict crowd levels. While generally accurate, conditions can change quickly, so always use your judgment about crowd situations."
  },
  {
    question: "Can I use this app at any venue?",
    answer: "The app is configured for this specific venue. Each venue has its own setup with customized maps, zones, and emergency procedures."
  },
  {
    question: "How do I report issues or give feedback?",
    answer: "Use the Feedback feature in the Tools tab to report problems, suggest improvements, or share your experience with venue management."
  }
];

const SAFETY_GUIDELINES = [
  {
    title: "Follow Crowd Alerts",
    description: "When you receive crowd alerts, consider alternative routes or wait for congestion to clear.",
    icon: Bell
  },
  {
    title: "Stay Aware of Surroundings",
    description: "While using navigation, keep your eyes up and be aware of your physical surroundings.",
    icon: Users
  },
  {
    title: "Know Emergency Exits",
    description: "Familiarize yourself with multiple exit routes, not just the main entrance.",
    icon: Shield
  },
  {
    title: "Keep Phone Charged",
    description: "Maintain battery life for continued access to safety features and navigation.",
    icon: Activity
  }
];

const MobileUserInfo = () => {
  const { t } = useTranslation();
  const { config: venueConfig } = useVenueConfig();
  const [activeTab, setActiveTab] = useState('features');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/mobile">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-lg font-bold">User Guide</h1>
              {venueConfig && (
                <p className="text-xs text-muted-foreground">{venueConfig.name}</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">Help</Badge>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="features" className="flex flex-col items-center gap-1 p-2">
              <Smartphone className="w-4 h-4" />
              <span>Features</span>
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex flex-col items-center gap-1 p-2">
              <Shield className="w-4 h-4" />
              <span>Safety</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex flex-col items-center gap-1 p-2">
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex flex-col items-center gap-1 p-2">
              <MessageSquare className="w-4 h-4" />
              <span>Help</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="h-5 w-5 text-primary" />
                  App Features
                </CardTitle>
                <CardDescription>
                  Everything you need to navigate safely and stay informed
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {MOBILE_FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                          <p className="text-xs text-muted-foreground">{feature.details}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Quick Tips
                </h3>
                <div className="space-y-2">
                  {QUICK_TIPS.map((tip, index) => {
                    const Icon = tip.icon;
                    return (
                      <div key={index} className="flex gap-2 text-sm">
                        <Icon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-blue-800">{tip.title}:</span>
                          <span className="text-blue-700 ml-1">{tip.tip}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Safety Guidelines
                </CardTitle>
                <CardDescription>
                  Important safety information and best practices
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {SAFETY_GUIDELINES.map((guideline, index) => {
                const Icon = guideline.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Icon className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-1">{guideline.title}</h3>
                          <p className="text-sm text-muted-foreground">{guideline.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Emergency Situations:</strong> In case of immediate danger, call emergency services (911) first, then use the app's emergency features to alert venue security.
              </AlertDescription>
            </Alert>

            {venueConfig?.emergencyContacts && venueConfig.emergencyContacts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {venueConfig.emergencyContacts.map((contact, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded border">
                        <div>
                          <h4 className="font-medium">{contact.name}</h4>
                          <p className="text-sm text-muted-foreground">{contact.role}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-mono">{contact.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="faq" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {FAQ_ITEMS.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left text-sm">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Get Help
                </CardTitle>
                <CardDescription>
                  Multiple ways to get assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    Emergency Support
                  </h4>
                  <p className="text-sm text-muted-foreground mb-1">24/7 Emergency Hotline</p>
                  <p className="text-sm font-mono">+1 (555) 123-4567</p>
                </div>

                <div className="p-3 rounded border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    Venue Information Desk
                  </h4>
                  <p className="text-sm text-muted-foreground">Located at the main entrance</p>
                  <p className="text-sm">Open during venue hours</p>
                </div>

                <div className="p-3 rounded border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    App Feedback
                  </h4>
                  <p className="text-sm text-muted-foreground">Use the feedback feature in Tools tab</p>
                  <p className="text-sm">Report issues or suggestions</p>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This app is designed to enhance your safety and experience at {venueConfig?.name || 'this venue'}. 
                Always follow venue staff instructions and use common sense in crowded situations.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MobileUserInfo;