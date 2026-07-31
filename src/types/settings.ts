export type FestivalStatus =
  | "UPCOMING"
  | "LIVE"
  | "FINISHED";

export type WebsiteSettings = {
  id: number;

  festivalName: string;
  tagline: string;
  location: string;
  venue: string;
  startDate: string | null;
  endDate: string | null;
  timezone: string;
  festivalStatus: FestivalStatus;
  defaultLanguage: string;
  websiteUrl: string;

  publicEmail: string;
  supportEmail: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  googleMapsUrl: string;
  contactFormEnabled: boolean;

  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  spotifyUrl: string;
  showSocialLinksInFooter: boolean;

  assistantEnabled: boolean;
  assistantName: string;
  assistantWelcomeMessage: string;
  assistantPlaceholder: string;
  assistantOfflineMessage: string;
  escalationEmail: string;

  eventsPageEnabled: boolean;
  ticketsPageEnabled: boolean;
  experiencePageEnabled: boolean;
  galleryPageEnabled: boolean;
  faqPageEnabled: boolean;
  newsletterEnabled: boolean;

  primaryAccent: string;
  secondaryAccent: string;

  logoUrl: string;
  compactLogoUrl: string;
  faviconUrl: string;
  socialImageUrl: string;

  footerDescription: string;
  footerCopyright: string;

  createdAt: string;
  updatedAt: string;
};

export type PublicWebsiteSettings = Omit<
  WebsiteSettings,
  "escalationEmail" | "createdAt" | "updatedAt"
>;

export type UpdateWebsiteSettingsDto = Partial<
  Omit<
    WebsiteSettings,
    "id" | "createdAt" | "updatedAt"
  >
>;