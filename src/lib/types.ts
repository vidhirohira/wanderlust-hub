export type Destination = {
  id: string;
  name: string;
  city: string;
  state: string;
  type: string;
  rating: number;
  entry_fee_indian: string | null;
  entry_fee_foreigner: string | null;
  timings: string | null;
  best_time: string | null;
  description: string | null;
  image_url: string | null;
  tags: string[] | null;
  created_at: string;
};

export type Hotel = {
  id: string;
  name: string;
  city: string;
  state: string | null;
  type: string;
  price_per_night: number;
  rating: number;
  amenities: string[] | null;
  contact: string | null;
  near: string | null;
  address: string | null;
  near_destination: string | null;
  created_at: string;
};

export type Restaurant = {
  id: string;
  name: string;
  city: string;
  cuisine: string;
  price_range: string;
  rating: number;
  specialty: string | null;
  contact: string | null;
  address: string | null;
  created_at: string;
};

export type Transport = {
  id: string;
  from_city: string;
  to_city: string;
  mode: string;
  operator: string | null;
  duration: string;
  cost_min: number;
  cost_max: number;
  created_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  user_id: string;
  destination_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type TourPlan = {
  id: string;
  user_id: string;
  title: string;
  destinations: string[];
  start_date: string | null;
  end_date: string | null;
  num_people: number;
  estimated_budget: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SearchLog = {
  id: string;
  user_id: string | null;
  search_query: string;
  results_count: number;
  created_at: string;
};

export type ScrapeQueue = {
  id: string;
  query: string;
  status: "pending" | "approved" | "rejected";
  scraped_data: ScrapedDestination | null;
  triggered_by: "auto" | "manual";
  created_at: string;
  reviewed_at: string | null;
};

export type ScrapedDestination = {
  name: string;
  city: string;
  state: string;
  type: string;
  description: string | null;
  image_url: string | null;
  entry_fee_indian: string | null;
  entry_fee_foreigner: string | null;
  timings: string | null;
  best_time: string | null;
  tags: string[];
  rating: number;
  source: string;
  source_url: string | null;
};

export type Role = "user" | "manager";

export const DESTINATION_TYPES = [
  "Heritage",
  "Nature",
  "Beach",
  "Adventure",
  "Wildlife",
  "Spiritual",
] as const;

export const TRANSPORT_MODES = ["Bus", "Train", "Taxi", "Flight"] as const;
export const HOTEL_TYPES = ["Luxury", "Mid-range", "Budget"] as const;
export const PRICE_RANGES = ["₹", "₹₹", "₹₹₹"] as const;
