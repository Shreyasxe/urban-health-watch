import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const usePermissions = () => {
  const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    // Check location permission
    if ("geolocation" in navigator && "permissions" in navigator) {
      try {
        const result = await navigator.permissions.query({ name: "geolocation" });
        setLocationPermission(result.state);
      } catch {
        setLocationPermission("prompt");
      }
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const requestLocationPermission = async () => {
    if (!("geolocation" in navigator)) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return false;
    }

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission("granted");
          toast({
            title: "Location access granted",
            description: "You can now use location-based features.",
          });
          resolve(true);
        },
        (error) => {
          setLocationPermission("denied");
          toast({
            title: "Location access denied",
            description: error.message || "Please enable location access in your browser settings.",
            variant: "destructive",
          });
          resolve(false);
        }
      );
    });
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        toast({
          title: "Notifications enabled",
          description: "You'll receive health alerts and updates.",
        });
        return true;
      } else {
        toast({
          title: "Notifications denied",
          description: "You can enable them later in browser settings.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    locationPermission,
    notificationPermission,
    requestLocationPermission,
    requestNotificationPermission,
    checkPermissions,
  };
};