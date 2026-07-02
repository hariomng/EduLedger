"use client";

import { useEffect, useState } from "react";
import apiFetch from "@/utils/apiClient";

export default function BackendStatus() {
  const [healthy, setHealthy] = useState(true);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    try {
      const res = await apiFetch("/api/health", { method: "GET" });
      if (!res.ok) throw new Error("Backend unreachable");
      const json = await res.json();
      if (json && json.ok) setHealthy(true);
      else setHealthy(false);
    } catch (err) {
      setHealthy(false);
    } finally {
      setChecking(false);
    }
  };

  // useEffect(() => {
  //   check();
  //   const id = setInterval(check, 30000); // recheck every 30s
  //   return () => clearInterval(id);
  // }, []);

  if (healthy) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-lg text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Server Unavailable</h1>
          <p className="text-sm text-gray-600 mb-6">
            The backend server cannot be reached. Some features may not work until the connection is restored.
          </p>
          <div className="flex items-center justify-center gap-3">
            {/* <button
              onClick={check}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              {checking ? "Checking..." : "Retry"}
            </button> */}
            <button
              onClick={() => location.reload()}
              className="px-4 py-2 border rounded-md"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
