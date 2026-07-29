import { api } from "./api.service";

export type TicketStatus = string;
export type TicketCategory = string;
export type TicketAvailabilityMode = string;

export type TicketBenefit = {
  id: number;
  text: string;
  sortOrder: number;
  ticketId?: number;
};

export type TicketEventSummary = {
  id: number;
  title: string;
  slug: string;
  date: string;
  location?: string;
  status: string;
  ticketProvider?: string;
  ticketPurchaseUrl?: string | null;
};

export type TicketPreview = {
  id: number;
  eventId: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  category: TicketCategory;
  status: TicketStatus;
  price: number;
  originalPrice: number | null;
  currency: string;
  availabilityMode: TicketAvailabilityMode;
  totalQuantity: number | null;
  remainingQuantity: number | null;
  availabilityLabel: string | null;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  minimumPerOrder: number | null;
  maximumPerOrder: number | null;
  externalPurchaseUrl: string | null;
  externalTicketId: string | null;
  badge: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  event: TicketEventSummary;
  benefits: TicketBenefit[];
};

export type TicketListMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type TicketListResponse = {
  data: TicketPreview[];
  meta: TicketListMeta;
};

export type TicketQueryParams = {
  status?: string;
  category?: string;
  eventId?: number;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "name"
    | "price"
    | "saleStartsAt"
    | "saleEndsAt"
    | "sortOrder";
  sortDirection?: "asc" | "desc";
};

export type CreateTicketBenefitDto = {
  text: string;
  sortOrder?: number;
};

export type CreateTicketPreviewDto = {
  eventId: number;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  category: string;
  status: string;
  price: number;
  originalPrice?: number;
  currency: string;
  availabilityMode: string;
  totalQuantity?: number;
  remainingQuantity?: number;
  availabilityLabel?: string;
  saleStartsAt?: string;
  saleEndsAt?: string;
  minimumPerOrder?: number;
  maximumPerOrder?: number;
  externalPurchaseUrl?: string;
  externalTicketId?: string;
  badge?: string;
  imageUrl?: string;
  isFeatured?: boolean;
  sortOrder?: number;
  benefits?: CreateTicketBenefitDto[];
};

function buildTicketQueryString(
  params: TicketQueryParams,
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

export function getTickets(
  params: TicketQueryParams = {},
) {
  const queryString = buildTicketQueryString(params);

  const url = queryString
    ? `/tickets?${queryString}`
    : "/tickets";

  return api.get<TicketListResponse>(url);
}

export function getTicketById(id: number) {
  return api.get<TicketPreview>(`/tickets/${id}`);
}

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

export function createTicket(
  data: CreateTicketPreviewDto,
) {
  return api.post<TicketPreview>(
    "/admin/tickets",
    data,
  );
}