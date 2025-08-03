"use client";

import React from "react";
import { useNetworkStatus } from "@/app/providers/NetworkStatusProvider/NetworkStatusContext";

const NetworkStatusDropdown: React.FC = () => {
  const { isOnline, isPoorConnection } = useNetworkStatus();

  if (isOnline && !isPoorConnection) {
    return null; // No dropdown if connection is good
  }

  let message = "";
  let className = "";

  if (!isOnline) {
    message = "На текущий момент, ваше соеденение отсутствует. Попытка переподключения...";
    className = "bg-[var(--color-danger)] text-[var(--color-text-primary)]";
  } else if (isPoorConnection) {
    message = "Плохое соеденение, попытка переподключения...";
    className = "bg-[var(--color-secondary)] text-[var(--color-text-primary)]";
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 p-2 text-center text-sm z-50 ${className}`}
      style={{ transition: "opacity 0.3s ease-in-out" }}
    >
      {message}
    </div>
  );
};

export default NetworkStatusDropdown;