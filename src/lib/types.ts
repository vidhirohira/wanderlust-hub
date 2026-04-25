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
  type: string;
  price_per_night: number;
  rating: number;
  amenities: string[] | null;
  contact: string | null;
  near: string | null;
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
