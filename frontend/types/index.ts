export type Role = "USER" | "ORGANIZER" | "ADMIN";
export type EventCategory = "CONCERT" | "THEATRE" | "CONFERENCE" | "SPORT" | "FESTIVAL" | "OTHER";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
export type TicketStatus = "RESERVED" | "PAID" | "USED" | "CANCELLED";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface EventResponse {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  category: EventCategory;
  status: EventStatus;
  organizerName: string;
  createdAt: string;
  imageUrl?: string;
}

export interface TicketResponse {
  id: number;
  eventTitle: string;
  eventLocation: string;
  eventDate: string;
  userName: string;
  price: number;
  status: TicketStatus;
  qrCode: string;
  qrCodeImage: string;
  reservedAt: string;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  wantsToBeOrganizer: boolean;
}

export interface EventRequest {
  title: string;
  description?: string;
  eventDate: string;
  location: string;
  totalSeats: number;
  price: number;
  category?: EventCategory;
}

export interface TicketRequest {
  eventId: number;
  quantity: number;
}

export interface EventStatsResponse {
  eventId: number;
  eventTitle: string;
  location: string;
  ticketsSold: number;
  availableSeats: number;
  totalSeats: number;
  revenue: number;
  occupancyRate: number;
}

export interface DashboardResponse {
  totalUsers: number;
  totalEvents: number;
  totalTicketsSold: number;
  totalTicketsCancelled: number;
  totalRevenue: number;
  draftEvents: number;
  publishedEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  topEvents: EventStatsResponse[];
}
