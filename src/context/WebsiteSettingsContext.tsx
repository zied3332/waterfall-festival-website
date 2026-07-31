import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getPublicSettings } from "../services/settings.service";

import type { PublicWebsiteSettings } from "../types/settings";

type WebsiteSettingsContextValue = {
  settings: PublicWebsiteSettings | null;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
};

const WebsiteSettingsContext =
  createContext<WebsiteSettingsContextValue | null>(
    null,
  );

type WebsiteSettingsProviderProps = {
  children: ReactNode;
};

function getErrorMessage(error: unknown): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Could not load website settings.";
}

export function WebsiteSettingsProvider({
  children,
}: WebsiteSettingsProviderProps) {
  const [settings, setSettings] =
    useState<PublicWebsiteSettings | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refreshSettings =
    useCallback(async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const response =
          await getPublicSettings();

        setSettings(response);
      } catch (requestError) {
        setError(
          getErrorMessage(requestError),
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  const contextValue = useMemo(
    () => ({
      settings,
      isLoading,
      error,
      refreshSettings,
    }),
    [
      settings,
      isLoading,
      error,
      refreshSettings,
    ],
  );

  return (
    <WebsiteSettingsContext.Provider
      value={contextValue}
    >
      {children}
    </WebsiteSettingsContext.Provider>
  );
}

export function useWebsiteSettings(): WebsiteSettingsContextValue {
  const context = useContext(
    WebsiteSettingsContext,
  );

  if (!context) {
    throw new Error(
      "useWebsiteSettings must be used inside WebsiteSettingsProvider.",
    );
  }

  return context;
}