/**
 * Booking Types for Geek Gaming Center
 * Time-based service reservations (PS4, PS5, Xbox, VR, Simulation)
 */

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  hourly_rate: number;
  specifications: ResourceSpecs;
  availability_schedule: AvailabilitySchedule;
  images: string[];
  description: string;
  capacity?: number;
  min_booking_duration?: number; // in minutes
  max_booking_duration?: number; // in minutes
}

export type ResourceType =
  | 'ps4'
  | 'ps5'
  | 'xbox'
  | 'vr'
  | 'simulation'
  | 'arcade'
  | 'retro';

export type ResourceStatus = 'available' | 'maintenance' | 'booked' | 'reserved';

export interface ResourceSpecs {
  // Console specs
  platform?: string;
  storage?: string;
  screen_size?: string;

  // VR specs
  headset_type?: string;
  resolution?: string;
  refresh_rate?: number;

  // Simulation specs
  wheel_brand?: string;
  pedals?: string;
  screen_count?: number;
  simulation_screen_size?: string;
  force_feedback?: boolean;

  // General
  description?: string;
  features?: string[];
}

export interface AvailabilitySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string; // HH:mm format
  close: string; // HH:mm format
  closed: boolean;
}

export interface TimeSlot {
  id: string;
  resource_id: string;
  start_time: string; // ISO 8601 datetime
  end_time: string; // ISO 8601 datetime
  status: SlotStatus;
  price: number;
  customer_id?: string;
  booking_id?: string;
}

export type SlotStatus = 'available' | 'booked' | 'blocked' | 'reserved';

export interface Booking {
  id: string;
  customer_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  slots: TimeSlot[];
  total_price: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface AvailabilityRequest {
  resource_id?: string;
  resource_types?: ResourceType[];
  start_date: string;
  end_date: string;
  duration?: number; // in minutes
}

export interface AvailabilityResponse {
  resource_id: string;
  resource_name: string;
  available_slots: TimeSlot[];
  blocked_periods: BlockedPeriod[];
}

export interface BlockedPeriod {
  start_time: string;
  end_time: string;
  reason?: string;
}
