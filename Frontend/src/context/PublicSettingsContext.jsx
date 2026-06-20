import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService } from "../services/api";

const PUBLIC_SETTINGS_DEFAULTS = {
  supportEmail: "support@matsols.com",
  supportPhone: "",
  brandName: "MATSOLS",
  logoUrl: "",
  primaryColor: "#ff863c",
  secondaryColor: "#0f172a",
};

const PublicSettingsContext = createContext(PUBLIC_SETTINGS_DEFAULTS);

export const PublicSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(PUBLIC_SETTINGS_DEFAULTS);

  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      const data = await apiService.getPublicSettings();
      if (!active || !data) return;
      const next = { ...PUBLIC_SETTINGS_DEFAULTS, ...data };
      setSettings(next);
    };
    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-orange", settings.primaryColor || "#ff863c");
    document.documentElement.style.setProperty("--primary-dark", settings.secondaryColor || "#0f172a");
  }, [settings.primaryColor, settings.secondaryColor]);

  return (
    <PublicSettingsContext.Provider value={settings}>
      {children}
    </PublicSettingsContext.Provider>
  );
};

export const usePublicSettings = () => useContext(PublicSettingsContext);
