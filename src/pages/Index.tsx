// Update this page (the content is just a fallback if you fail to update the page)

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Smartphone, Monitor } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center mb-6">
          <Shield className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl font-bold">Smart Crowd Flow Management System</h1>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Real-time crowd monitoring and safety management platform
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6">
            <Monitor className="h-8 w-8 text-primary mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Admin Dashboard</h3>
            <p className="text-muted-foreground mb-4">
              Real-time monitoring, analytics, and crowd management controls
            </p>
            <Link to="/admin">
              <Button className="w-full">
                Access Dashboard
              </Button>
            </Link>
          </Card>
          
          <Card className="p-6">
            <Smartphone className="h-8 w-8 text-primary mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Mobile App</h3>
            <p className="text-muted-foreground mb-4">
              Live crowd maps, safe navigation, and emergency alerts
            </p>
            <Link to="/mobile">
              <Button className="w-full">
                Open Mobile App
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
