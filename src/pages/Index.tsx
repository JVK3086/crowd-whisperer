// Update this page (the content is just a fallback if you fail to update the page)

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Smartphone, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="text-center max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center mb-6">
          <Shield className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl font-bold">{t('dashboard.title')}</h1>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          {t('dashboard.subtitle')}
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6">
            <Monitor className="h-8 w-8 text-primary mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">{t('admin.title')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('admin.subtitle')}
            </p>
            <Link to="/admin">
              <Button className="w-full">
                {t('nav.admin')}
              </Button>
            </Link>
          </Card>
          
          <Card className="p-6">
            <Smartphone className="h-8 w-8 text-primary mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">{t('mobile.title')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('mobile.subtitle')}
            </p>
            <Link to="/mobile">
              <Button className="w-full">
                {t('nav.mobile')}
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
