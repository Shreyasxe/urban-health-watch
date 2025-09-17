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
      <Card className="p-6 shadow-data-card">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Health Alerts</h2>
        </div>
        <div className="text-center py-6">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Select a location to view health alerts
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-data-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Health Alerts</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleNotifications}
          className="flex items-center space-x-1"
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
            className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
          >
            {getAlertIcon(alert.type, alert.severity)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-sm">{alert.title}</h3>
                <Badge 
                  className={`${getSeverityColor(alert.severity)} text-xs`}
                >
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {alert.message}
              </p>
              <div className="text-xs text-muted-foreground">
                {alert.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Notifications: {notificationsEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleNotifications}
          >
            {notificationsEnabled ? 'Disable' : 'Enable'} Alerts
          </Button>
        </div>
      </div>
    </Card>
  );
};