export type EventStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CANCELLED"
  | "COMPLETED";

export type TicketProvider =
  | "EVENTPOP"
  | "OTHER";

export type Event = {
  id: number;
  title: string;
  slug: string;
  description: string;
  date: string;
  location: string;

  heroImageUrl: string | null;
  heroImagePublicId: string | null;

  capacity: number | null;
  remainingTickets: number | null;

  status: EventStatus;

  ticketProvider: TicketProvider;
  ticketPurchaseUrl: string | null;
  externalEventId: string | null;

  createdAt: string;
  updatedAt: string;
};

export type CreateEventInput = {
  title: string;
  description: string;
  date: string;
  location: string;

  capacity?: number;
  remainingTickets?: number;

  status?: EventStatus;

  ticketProvider?: TicketProvider;
  ticketPurchaseUrl?: string | null;
  externalEventId?: string | null;
};

export type UpdateEventInput =
  Partial<CreateEventInput>;