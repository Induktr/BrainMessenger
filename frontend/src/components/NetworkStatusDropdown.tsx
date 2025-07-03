"use client";

import React from "react";
import { useNetworkStatus } from "@/context/NetworkStatusContext";

const NetworkStatusDropdown: React.FC = () => {
  const { isOnline, isPoorConnection } = useNetworkStatus();

  if (isOnline && !isPoorConnection) {
    return null; // No dropdown if connection is good
  }

  let message = "";
  let className = "";

  if (!isOnline) {
    message = "На текущий момент, ваше соеденение отсутствует. Попытка переподключения...";
    className = "bg-red-500 text-white";
  } else if (isPoorConnection) {
    message = "Плохое соеденение, попытка переподключения...";
    className = "bg-yellow-500 text-black";
  }

  return (
    <div
      className={`absolute top-0 left-0 right-0 p-2 text-center z-50 ${className}`}
      style={{ transition: "opacity 0.3s ease-in-out" }}
    >
      {message}
    </div>
  );
};

export default NetworkStatusDropdown;