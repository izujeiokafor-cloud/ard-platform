
export type Category = 'Services' | 'Businesses' | 'Events' | 'Jobs' | 'Healthy' | 'All';

export interface Location {
  lat: number;
  lng: number;
  city: string;
  state: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  joinedAt: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
  ownerReply?: string;
}

export interface AdInsights {
  views: number;
  contacts: number; // Sum of all contacts
  calls: number;
  whatsapp: number;
  socials: number; // Includes Instagram, TikTok, Facebook, YouTube
  web: number; // Includes Website, Tickets, Email
}

export interface Ad {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: Category;
  keywords: string[];
  images: string[];
  contact: {
    phone: string;
    whatsapp: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    youtube?: string;
    email?: string;
    website?: string;
    ticketLink?: string;
  };
  locations: Location[];
  isAllLocations: boolean;
  createdAt: number;
  expiresAt: number;
  reports: number;
  isApproved: boolean;
  reviews: Review[];
  insights: AdInsights;
}

export interface SearchResult {
  adIds: string[];
  explanation: string;
}
