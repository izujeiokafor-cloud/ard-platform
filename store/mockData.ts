
import { Ad, User, Category } from '../types';

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'John Admin', 
    role: 'admin', 
    avatar: 'https://picsum.photos/seed/admin/200',
    joinedAt: Date.now() - (100 * 24 * 60 * 60 * 1000)
  },
  { 
    id: 'u2', 
    name: 'Sarah Okoro', 
    role: 'user', 
    avatar: 'https://picsum.photos/seed/sarah/200',
    joinedAt: Date.now() - (30 * 24 * 60 * 60 * 1000)
  },
];

const now = Date.now();
const hour = 3600000;

const generateImages = (seed: string) => [
  `https://picsum.photos/seed/${seed}v1/400/600`,
  `https://picsum.photos/seed/${seed}v2/400/600`,
  `https://picsum.photos/seed/${seed}v3/400/600`,
  `https://picsum.photos/seed/${seed}v4/400/600`,
  `https://picsum.photos/seed/${seed}v5/400/600`,
  `https://picsum.photos/seed/${seed}v6/400/600`,
];

const TEMPLATES = [
  { cat: 'Businesses', title: 'Top Notch Mechanic Lagos', desc: 'Expert engine tuning and brake repairs in Ikeja.', kw: ['mechanic', 'car', 'repair', 'ikeja'] },
  { cat: 'Businesses', title: 'Naija Jollof Hub', desc: 'The best firewood Jollof rice in Abuja.', kw: ['food', 'restaurant', 'jollof', 'abuja'] },
  { cat: 'Businesses', title: 'Tech Hub Port Harcourt', desc: 'Fast laptop repairs and software installation.', kw: ['it', 'computer', 'tech', 'repair'] },
  { cat: 'Businesses', title: 'Lekki Barber Shop', desc: 'Clean fades and luxury grooming services.', kw: ['barber', 'haircut', 'lekki'] },
  { cat: 'Services', title: 'Ibadan Cleaning Crew', desc: 'Residential and commercial cleaning services.', kw: ['cleaning', 'maid', 'service', 'ibadan'] },
  { cat: 'Services', title: 'Swift Dispatch Rider', desc: 'Quick parcel delivery across Lagos State.', kw: ['delivery', 'courier', 'dispatch', 'lagos'] },
  { cat: 'Events', title: 'Lagos Night Market', desc: 'Music, food, and culture at Victoria Island.', kw: ['music', 'party', 'event', 'vi'] },
  { cat: 'Events', title: 'Abuja Tech Meetup', desc: 'Connect with developers and founders in Garki.', kw: ['networking', 'startup', 'abuja'] },
  { cat: 'Jobs', title: 'Store Manager Needed', desc: 'Experienced manager required for a boutique in Kano.', kw: ['hiring', 'manager', 'job', 'kano'] },
  { cat: 'Jobs', title: 'Graphic Designer Gig', desc: 'Remote role for creative designers based in Nigeria.', kw: ['designer', 'job', 'remote', 'creative'] },
  { cat: 'Healthy', title: 'St. Mary Specialist Hospital', desc: '24/7 emergency care and general surgery in Ikeja.', kw: ['hospital', 'doctor', 'emergency', 'health'] },
  { cat: 'Healthy', title: 'Wellness Pharmacy', desc: 'Quality drugs and medical consultation in Lekki.', kw: ['pharmacy', 'chemist', 'drugs', 'medical'] },
  { cat: 'Healthy', title: 'City Dental Clinic', desc: 'Expert dental care and teeth whitening in Garki.', kw: ['dentist', 'teeth', 'clinic', 'abuja'] },
];

export const INITIAL_ADS: Ad[] = Array.from({ length: 40 }).map((_, i) => {
  const t = TEMPLATES[i % TEMPLATES.length];
  const cities = [
    { name: 'Ikeja', state: 'Lagos', lat: 6.5967, lng: 3.3421 },
    { name: 'Garki', state: 'Abuja (FCT)', lat: 9.0343, lng: 7.4878 },
    { name: 'Port Harcourt', state: 'Rivers', lat: 4.8156, lng: 7.0498 },
    { name: 'Ibadan', state: 'Oyo', lat: 7.3775, lng: 3.9470 }
  ];
  const city = cities[i % cities.length];

  // Fix: Added missing AdInsights properties (calls, whatsapp, socials, web) to satisfy the Ad interface
  return {
    id: `ad-${i}`,
    userId: 'u2',
    userName: `Naija Poster ${i % 5}`,
    title: t.title,
    description: t.desc,
    category: t.cat as Category,
    keywords: t.kw,
    images: generateImages(`adseed-${i}`),
    contact: { 
      phone: '+2348012345678', 
      whatsapp: '+2348012345678',
      email: 'contact@example.com',
      website: 'https://example.com'
    },
    locations: [{ 
      lat: city.lat + (Math.random() - 0.5) * 0.05, 
      lng: city.lng + (Math.random() - 0.5) * 0.05, 
      city: city.name, 
      state: city.state 
    }],
    isAllLocations: i % 10 === 0, // Every 10th ad is national
    createdAt: now - (i * hour),
    expiresAt: now + (24 * hour) - (i * hour),
    reports: 0,
    isApproved: true,
    reviews: [],
    insights: {
      views: Math.floor(Math.random() * 500) + 50,
      contacts: Math.floor(Math.random() * 20),
      calls: Math.floor(Math.random() * 5),
      whatsapp: Math.floor(Math.random() * 10),
      socials: Math.floor(Math.random() * 5),
      web: Math.floor(Math.random() * 5)
    }
  };
});
