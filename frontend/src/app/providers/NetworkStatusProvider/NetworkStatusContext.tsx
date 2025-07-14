"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { NetworkStatusContextType } from "@/features/network-status/model/network-status.types";

const NetworkStatusContext = createContext<NetworkStatusContextType | undefined>(
  undefined
);

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isPoorConnection, setIsPoorConnection] = useState(false);

  const checkNetworkStatus = useCallback(async () => {
    // Basic online/offline check
    setIsOnline(navigator.onLine);

    if (navigator.onLine) {
      // More sophisticated check for poor connection (e.g., latency)
      const startTime = Date.now();
      try {
        // Attempt to fetch a small, lightweight resource
        // Using a public, reliable endpoint like Google's favicon
        await fetch("https://www.google.com/favicon.ico", {
          mode: "no-cors", // No-cors mode to avoid CORS issues for simple connectivity check
          cache: "no-store", // Prevent caching
        });
        const endTime = Date.now();
        const latency = endTime - startTime;

        // Define what constitutes a "poor connection" (e.g., latency > 500ms)
        setIsPoorConnection(latency > 500);
      } catch (error) {
        // If fetch fails, it's likely a poor connection or no internet despite navigator.onLine
        setIsPoorConnection(true);
      }
    } else {
      setIsPoorConnection(false); // If offline, it's not just poor, it's absent
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkNetworkStatus();

    // Set up event listeners for online/offline
    window.addEventListener("online", checkNetworkStatus);
    window.addEventListener("offline", checkNetworkStatus);

    // Set up periodic check for poor connection (e.g., every 10 seconds)
    const intervalId = setInterval(checkNetworkStatus, 10000);

    return () => {
      window.removeEventListener("online", checkNetworkStatus);
      window.removeEventListener("offline", checkNetworkStatus);
      clearInterval(intervalId);
    };
  }, [checkNetworkStatus]);

  return (
    <NetworkStatusContext.Provider value={{ isOnline, isPoorConnection }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatus = () => {
  const context = useContext(NetworkStatusContext);
  if (context === undefined) {
    throw new Error(
      "useNetworkStatus must be used within a NetworkStatusProvider"
    );
  }
  return context;
};