
import { User, UserRole, Announcement, ChurchLocation } from '../types';
import { db } from './database';
import { api } from './api';

// Key to store the remote server URL
export const API_URL_KEY = 'ccap_api_url';

// Helper to check if we are in Remote Mode
const getApiUrl = () => localStorage.getItem(API_URL_KEY);

export const client = {
  // System Config
  getConfig: () => ({
    apiUrl: getApiUrl(),
    isRemote: !!getApiUrl()
  }),
  
  setApiUrl: (url: string | null) => {
    if (url) {
      localStorage.setItem(API_URL_KEY, url);
    } else {
      localStorage.removeItem(API_URL_KEY);
    }
    window.location.reload(); // Reload to apply changes
  },

  // User Operations
  users: {
    getAll: async (): Promise<User[]> => {
      if (getApiUrl()) {
        try {
          return await api.users.getAll();
        } catch (err) {
          console.error("API Error, falling back to local for view", err);
          return db.users.getAll(); // Fallback if server down
        }
      }
      return Promise.resolve(db.users.getAll());
    },
    
    login: async (email: string, password: string): Promise<User> => {
      if (getApiUrl()) {
        return await api.users.login(email, password);
      }
      // Local Logic
      const users = db.users.getAll();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user || user.password !== password) throw new Error('Invalid credentials');
      if (user.status === 'pending') throw new Error('Account pending approval');
      if (user.status === 'rejected') throw new Error('Account rejected');
      return Promise.resolve(user);
    },

    register: async (user: User): Promise<void> => {
      if (getApiUrl()) {
        return await api.users.register(user);
      }
      // Local Logic
      const users = db.users.getAll();
      if (users.some(u => u.email === user.email)) throw new Error('Email already exists');
      db.users.save([...users, user]);
      return Promise.resolve();
    },

    approve: async (userId: string, role: UserRole, district?: string): Promise<void> => {
      if (getApiUrl()) {
        return await api.users.approve(userId, role, district);
      }
      // Local Logic
      const users = db.users.getAll();
      const updated = users.map(u => u.id === userId ? { ...u, status: 'active' as const, role, district, rejectionDate: undefined } : u);
      db.users.save(updated);
      return Promise.resolve();
    },

    reject: async (userId: string): Promise<void> => {
      if (getApiUrl()) {
        return await api.users.reject(userId);
      }
      // Local Logic
      const users = db.users.getAll();
      const updated = users.map(u => u.id === userId ? { ...u, status: 'rejected' as const, rejectionDate: new Date().toISOString() } : u);
      db.users.save(updated);
      return Promise.resolve();
    },
    
    delete: async (userId: string): Promise<void> => {
      if (getApiUrl()) {
        return await api.users.delete(userId);
      }
      // Local Logic
      const users = db.users.getAll();
      const updated = users.filter(u => u.id !== userId);
      db.users.save(updated);
      return Promise.resolve();
    }
  },

  // Announcement Operations (Hybrid Example)
  announcements: {
    getAll: async (): Promise<Announcement[]> => {
      if (getApiUrl()) {
         try { return await api.announcements.getAll(); } catch (e) { return db.announcements.getAll(); }
      }
      return Promise.resolve(db.announcements.getAll());
    },
    create: async (ann: Announcement): Promise<void> => {
      if (getApiUrl()) {
        return await api.announcements.create(ann);
      }
      const list = db.announcements.getAll();
      db.announcements.save([ann, ...list]);
      return Promise.resolve();
    },
    delete: async (id: string): Promise<void> => {
       if (getApiUrl()) {
         return await api.announcements.delete(id);
       }
       const list = db.announcements.getAll();
       db.announcements.save(list.filter(a => a.id !== id));
       return Promise.resolve();
    }
  },

  // Locations
  locations: {
    getAll: async (): Promise<ChurchLocation[]> => {
      if (getApiUrl()) {
         try { return await api.locations.getAll(); } catch (e) { return db.locations.getAll(); }
      }
      return Promise.resolve(db.locations.getAll());
    },
    create: async (loc: ChurchLocation): Promise<void> => {
      if (getApiUrl()) {
         return await api.locations.create(loc);
      }
      const list = db.locations.getAll();
      db.locations.save([...list, loc]);
      return Promise.resolve();
    }
  }
};
