export type Role = "USER" | "ORGANIZER" | "ADMIN";
export type EventCategory = "CONCERT" | "THEATRE" | "CONFERENCE" | "SPORT" | "FESTIVAL" | "OTHER";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
export type TicketStatus = "RESERVED" | "PAID" | "USED" | "CANCELLED";
export type SubscriptionPlan = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";
export type NotificationType =
  | "RESERVATION_AUTO_CANCELLED"
  | "PAYMENT_SUCCESS"
  | "EVENT_REMINDER"
  | "TICKET_CANCELLED";

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedId?: number;
  createdAt: string;
}

export interface SubscriptionResponse {
  id: number;
  organizerName: string;
  organizerEmail: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  price: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  active: boolean;
  daysRemaining: number;
}

export interface SubscriptionStatsResponse {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  monthlyCount: number;
  yearlyCount: number;
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  activeRevenue: number;
}

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
  twoFactorRequired?: boolean;
  twoFactorEnabled?: boolean;
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
  reservationDeadline?: string;
  paymentDeadline?: string;
}

export interface TicketResponse {
  id: number;
  eventId: number;
  eventTitle: string;
  eventLocation: string;
  eventDate: string;
  eventImageUrl?: string;
  organizerName: string;
  userName: string;
  price: number;
  status: TicketStatus;
  qrCode: string;
  qrCodeImage: string;
  reservedAt: string;
  paidAt?: string;
  cancelledAt?: string;
  usedAt?: string;
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
  reservationDeadline?: string;
  paymentDeadline?: string;
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
