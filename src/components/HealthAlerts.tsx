import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Bell, BellOff } from 'lucide-react';
import { LocationData } from '@/pages/Index';

interface HealthAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
}

interface HealthAlertsProps {
  location: LocationData | null;
}

export const HealthAlerts: React.FC<HealthAlertsProps> = ({ location }) => {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Generate alerts based on location (simulated)
  useEffect(() => {
    if (!location) {
      setAlerts([]);
      return;
    }

    // Simulate generating alerts based on environmental conditions
    const generateAlerts = () => {
      const newAlerts: HealthAlert[] = [];
      
      // Simulate some alerts based on random conditions
      const shouldShowPollen = Math.random() > 0.7;
      const shouldShowAQI = Math.random() > 0.6;
      const shouldShowUV = Math.random() > 0.8;
      
      if (shouldShowPollen) {
        newAlerts.push({
          id: 'pollen-' + Date.now(),
          type: 'warning',
          title: 'High Pollen Count',
          message: 'Pollen levels are elevated in your area. Consider limiting outdoor activities if you have allergies.',
          timestamp: new Date(),
          severity: 'moderate',
        });
      }
      
      if (shouldShowAQI) {
        newAlerts.push({
          id: 'aqi-' + Date.now(),
          type: 'danger',
          title: 'Poor Air Quality',
          message: 'Air quality index exceeds healthy levels. Sensitive groups should avoid outdoor exercise.',
          timestamp: new Date(),
          severity: 'high',
        });
      }
      
      if (shouldShowUV) {
        newAlerts.push({
          id: 'uv-' + Date.now(),
          type: 'info',
          title: 'High UV Index',
          message: 'UV radiation is high today. Use sunscreen and protective clothing when outdoors.',
          timestamp: new Date(),
          severity: 'moderate',
        });
      }
      
      // Always show at least one positive alert
      if (newAlerts.length === 0) {
        newAlerts.push({
          id: 'good-' + Date.now(),
          type: 'info',
          title: 'Good Environmental Conditions',
          message: 'Air quality and weather conditions are favorable for outdoor activities.',
          timestamp: new Date(),
          severity: 'low',
        });
      }
      
      setAlerts(newAlerts);
    };

    const timer = setTimeout(generateAlerts, 1000);
    return () => clearTimeout(timer);
  }, [location]);

  const getAlertIcon = (type: string, severity: string) => {
    if (type === 'danger' || severity === 'extreme') {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    if (type === 'warning' || severity === 'high' || severity === 'moderate') {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-health-good" />;
  };

  const getAlertVariant = (type: string, severity: string) => {
    if (type === 'danger' || severity === 'extreme') return 'destructive';
    if (type === 'warning' || severity === 'high') return 'secondary';
    return 'default';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'bg-health-hazardous text-health-hazardous-foreground';
      case 'high': return 'bg-health-unhealthy text-health-unhealthy-foreground';
      case 'moderate': return 'bg-health-moderate text-health-moderate-foreground';
      default: return 'bg-health-good text-health-good-foreground';
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // In a real app, this would register/unregister push notifications
  };

  if (!location) {
    return (
      <Card className="p-8 shadow-card-elegant hover:shadow-card-hover transition-all duration-300 bg-gradient-card border-0 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-xl bg-muted/30">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Health Alerts</h2>
        </div>
        <div className="text-center py-8">
          <div className="p-3 rounded-xl bg-muted/30 w-fit mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Select a location to view health alerts
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-card-elegant hover:shadow-card-hover transition-all duration-300 bg-gradient-card border-0 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <AlertTriangle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Health Alerts</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleNotifications}
          className="flex items-center space-x-2 bg-white/50 hover:bg-white/70 border border-white/30"
        >
          {notificationsEnabled ? (
            <Bell className="h-4 w-4 text-primary" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start space-x-4 p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-card-hover ${alert.type === 'danger' || alert.severity === 'extreme'
              ? 'bg-gradient-to-r from-destructive/10 to-destructive/20 border-destructive/30 hover:border-destructive/40'
              : alert.type === 'warning' || alert.severity === 'high' || alert.severity === 'moderate'
              ? 'bg-gradient-to-r from-health-moderate/10 to-health-moderate/20 border-health-moderate/30 hover:border-health-moderate/40'
              : 'bg-gradient-to-r from-health-good/10 to-health-good/20 border-health-good/30 hover:border-health-good/40'
            }`}
          >
            <div className={`p-2 rounded-xl ${alert.type === 'danger' || alert.severity === 'extreme'
              ? 'bg-destructive/20'
              : alert.type === 'warning' || alert.severity === 'high' || alert.severity === 'moderate'
              ? 'bg-health-moderate/20'
              : 'bg-health-good/20'
            }`}>
              {getAlertIcon(alert.type, alert.severity)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className={`font-semibold text-lg ${alert.type === 'danger' || alert.severity === 'extreme'
                  ? 'text-destructive'
                  : alert.type === 'warning' || alert.severity === 'high' || alert.severity === 'moderate'
                  ? 'text-health-moderate-foreground'
                  : 'text-health-good-foreground'
                }`}>
                  {alert.title}
                </h3>
                <Badge 
                  className={`${getSeverityColor(alert.severity)} text-xs px-3 py-1`}
                >
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-sm text-foreground/80 mb-3 leading-relaxed">
                {alert.message}
              </p>
              <div className="text-xs text-muted-foreground">
                {alert.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-white/30">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Notifications: <span className="font-medium">{notificationsEnabled ? 'Enabled' : 'Disabled'}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleNotifications}
            className="bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
          >
            {notificationsEnabled ? 'Disable' : 'Enable'} Alerts
          </Button>
        </div>
      </div>
    </Card>
  );
};