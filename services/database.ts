
import { Ad, User, Review } from '../types';
import { INITIAL_ADS } from '../store/mockData';

const ADS_KEY = 'ard_nigeria_ads_production_v1';
const USERS_KEY = 'ard_users_production_v1';
const CURRENT_USER_KEY = 'ard_current_user_production';

/**
 * DATABASE SERVICE (Live Ready)
 * 
 * To connect to a real database (e.g. Supabase):
 * 1. Import your supabase client.
 * 2. Replace the localStorage logic inside these functions with:
 *    const { data } = await supabase.from('ads').select('*');
 */

export const db = {
  // ADS - Fetching & Management
  async getAds(): Promise<Ad[]> {
    try {
      const data = localStorage.getItem(ADS_KEY);
      if (!data) {
        // First time initialization with seed data
        localStorage.setItem(ADS_KEY, JSON.stringify(INITIAL_ADS));
        return INITIAL_ADS;
      }
      const ads: Ad[] = JSON.parse(data);
      // Clean up expired ads in "Production"
      const now = Date.now();
      const activeAds = ads.filter(ad => ad.expiresAt > now);
      if (activeAds.length !== ads.length) {
        localStorage.setItem(ADS_KEY, JSON.stringify(activeAds));
      }
      return activeAds;
    } catch (e) {
      console.error("DB Fetch Error:", e);
      return [];
    }
  },

  async saveAd(ad: Ad): Promise<Ad> {
    const ads = await this.getAds();
    const existingIndex = ads.findIndex(a => a.id === ad.id);
    let updated;
    if (existingIndex !== -1) {
      updated = [...ads];
      updated[existingIndex] = ad;
    } else {
      updated = [ad, ...ads];
    }
    localStorage.setItem(ADS_KEY, JSON.stringify(updated));
    return ad;
  },

  async updateAd(adId: string, updates: Partial<Ad>): Promise<Ad | null> {
    const ads = await this.getAds();
    const index = ads.findIndex(a => a.id === adId);
    if (index === -1) return null;
    
    ads[index] = { ...ads[index], ...updates };
    localStorage.setItem(ADS_KEY, JSON.stringify(ads));
    return ads[index];
  },

  async deleteAd(adId: string): Promise<boolean> {
    const ads = await this.getAds();
    const filtered = ads.filter(a => a.id !== adId);
    localStorage.setItem(ADS_KEY, JSON.stringify(filtered));
    return true;
  },

  // USERS & AUTHENTICATION
  async getUsers(): Promise<User[]> {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async getCurrentUser(): Promise<User | null> {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  async signUp(userData: User): Promise<User> {
    const users = await this.getUsers();
    const existingUser = users.find(u => u.phone === userData.phone);
    if (existingUser) throw new Error("A user with this phone number already exists.");
    
    const updatedUsers = [...users, userData];
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
    return userData;
  },

  async logIn(phone: string, password: string): Promise<User> {
    const users = await this.getUsers();
    // In production, passwords would be hashed
    const user = users.find(u => u.phone === phone && u.password === password);
    if (!user) throw new Error("Invalid login credentials. Please check your phone number and password.");
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // REVIEWS & FEEDBACK
  async addReview(adId: string, review: Review): Promise<void> {
    const ads = await this.getAds();
    const index = ads.findIndex(a => a.id === adId);
    if (index !== -1) {
      ads[index].reviews = [review, ...ads[index].reviews];
      localStorage.setItem(ADS_KEY, JSON.stringify(ads));
    }
  }
};
