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
    className = "network-dropdown-offline";
  } else if (isPoorConnection) {
    message = "Плохое соеденение, попытка переподключения...";
    className = "network-dropdown-poor";
  }

  return (
    <div
      className={`network-dropdown-container ${className}`}
      style={{ transition: "opacity 0.3s ease-in-out" }}
    >
      {message}
    </div>
  );
};

export default NetworkStatusDropdown;