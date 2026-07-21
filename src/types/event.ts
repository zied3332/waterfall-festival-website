export type EventStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CANCELLED"
  | "COMPLETED";

export type Event = {
  id: number;
  title: string;
  slug: string;
  description: string;
  date: string;
  location: string;
  heroImageUrl: string | null;
  capacity: number | null;
  remainingTickets: number | null;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
};