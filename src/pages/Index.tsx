// Update this page (the content is just a fallback if you fail to update the page)

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  Building2, 
  Users, 
  MapPin, 
  Settings,
  Sparkles,
  CheckCircle,
  Globe,
  Zap,
  BarChart3,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { VenueSetup, VenueConfig } from "@/components/admin/VenueSetup";

const FEATURES = [
  { icon: BarChart3, title: "Real-time Analytics", description: "Live crowd density monitoring and AI-powered insights" },
  { icon: MapPin, title: "Smart Navigation", description: "Optimal routing based on current crowd conditions" },
  { icon: Shield, title: "Emergency Management", description: "Comprehensive safety protocols and emergency response" },
  { icon: Globe, title: "Multi-language Support", description: "Interface available in multiple languages" },
  { icon: Zap, title: "Instant Alerts", description: "Real-time notifications and crowd management alerts" },
  { icon: Clock, title: "24/7 Monitoring", description: "Continuous venue monitoring and automated responses" }
];

const Index = () => {
  const { t } = useTranslation();
  const [showVenueSetup, setShowVenueSetup] = useState(false);
  const [venueConfig, setVenueConfig] = useState<VenueConfig | null>(null);

  // Check if venue is already configured
  useEffect(() => {
    const stored = localStorage.getItem('venue-config');
    if (stored) {
      try {
        setVenueConfig(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse venue config:', error);
      }
    }
  }, []);

  const handleVenueConfigured = (config: VenueConfig) => {
    setVenueConfig(config);
    localStorage.setItem('venue-config', JSON.stringify(config));
    setShowVenueSetup(false);
  };

  const resetVenueConfig = () => {
    localStorage.removeItem('venue-config');
    setVenueConfig(null);
    setShowVenueSetup(true);
  };

  if (showVenueSetup) {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="h-10 w-10 text-primary mr-3" />
              <h1 className="text-3xl font-bold">Crowd Flow Management Setup</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Configure your venue for intelligent crowd management
            </p>
          </div>
          
          <VenueSetup onVenueConfigured={handleVenueConfigured} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Shield className="h-16 w-16 text-primary" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Smart Crowd Flow Management
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Intelligent crowd monitoring and safety management for any venue type
          </p>

          {venueConfig && (
            <Alert className="mb-8 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Venue Configured:</strong> {venueConfig.name} ({venueConfig.type})
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetVenueConfig}
                  className="ml-4 text-green-600 hover:text-green-700"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Reconfigure
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!venueConfig && (
            <Card className="mb-12 border-2 border-dashed border-primary/20">
              <CardContent className="pt-6">
                <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Setup Your Venue</h3>
                <p className="text-muted-foreground mb-4">
                  Configure your specific venue type for optimized crowd management
                </p>
                <Button onClick={() => setShowVenueSetup(true)} className="w-full">
                  <Building2 className="h-4 w-4 mr-2" />
                  Start Venue Setup
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <Icon className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <Monitor className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t('admin.title')}</CardTitle>
              <CardDescription className="text-base">
                {t('admin.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Real-time crowd analytics</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Emergency management tools</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>System configuration</span>
                </div>
              </div>
              <Link to="/admin">
                <Button className="w-full group-hover:scale-105 transition-transform">
                  <Monitor className="h-4 w-4 mr-2" />
                  {t('nav.admin')}
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t('mobile.title')}</CardTitle>
              <CardDescription className="text-base">
                {t('mobile.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Live venue navigation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Safety alerts & notifications</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Emergency assistance</span>
                </div>
              </div>
              <Link to="/mobile">
                <Button className="w-full group-hover:scale-105 transition-transform">
                  <Smartphone className="h-4 w-4 mr-2" />
                  {t('nav.mobile')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        {venueConfig && (
          <div className="mt-16 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-card rounded-lg p-4 border">
                <div className="text-2xl font-bold text-primary">{venueConfig.capacity.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Capacity</div>
              </div>
              <div className="bg-card rounded-lg p-4 border">
                <div className="text-2xl font-bold text-primary">{venueConfig.zones.length}</div>
                <div className="text-sm text-muted-foreground">Zones</div>
              </div>
              <div className="bg-card rounded-lg p-4 border">
                <div className="text-2xl font-bold text-primary">{venueConfig.emergencyContacts.length}</div>
                <div className="text-sm text-muted-foreground">Emergency Contacts</div>
              </div>
              <div className="bg-card rounded-lg p-4 border">
                <div className="text-2xl font-bold text-primary">{venueConfig.customization.languages.length}</div>
                <div className="text-sm text-muted-foreground">Languages</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
