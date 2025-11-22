
import { User, UserRole, Announcement, GalleryImage, Subscriber, NewsletterCampaign, ChurchLocation, ChatMessage, Department } from '../types';

// CHANGE THIS to your live server URL when deploying (e.g., 'https://my-ccap-server.railway.app/api')
const API_URL = 'http://localhost:3001/api'; 

const headers = {
  'Content-Type': 'application/json',
};

export const api = {
  users: {
    getAll: async (): Promise<User[]> => {
      const res = await fetch(`${API_URL}/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    register: async (user: User): Promise<void> => {
      await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify(user),
      });
    },
    login: async (email: string, password: string): Promise<User> => {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      return data.user;
    },
    approve: async (userId: string, role: UserRole, district?: string): Promise<void> => {
      await fetch(`${API_URL}/users/${userId}/approve`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role, district }),
      });
    },
    reject: async (userId: string): Promise<void> => {
      await fetch(`${API_URL}/users/${userId}/reject`, {
        method: 'PUT',
        headers,
      });
    },
    delete: async (userId: string): Promise<void> => {
      await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
      });
    }
  },
  announcements: {
    getAll: async (): Promise<Announcement[]> => {
      const res = await fetch(`${API_URL}/announcements`);
      return res.json();
    },
    create: async (ann: Announcement): Promise<void> => {
      await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers,
        body: JSON.stringify(ann),
      });
    },
    delete: async (id: string): Promise<void> => {
      await fetch(`${API_URL}/announcements/${id}`, {
        method: 'DELETE',
      });
    }
  },
  locations: {
    getAll: async (): Promise<ChurchLocation[]> => {
      const res = await fetch(`${API_URL}/locations`);
      return res.json();
    },
    create: async (loc: ChurchLocation): Promise<void> => {
      await fetch(`${API_URL}/locations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(loc),
      });
    }
  }
  // Add other entities (gallery, subscribers, etc.) following the same pattern
};
