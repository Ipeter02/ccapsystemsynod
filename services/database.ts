
import { User, UserRole, Announcement, GalleryImage, Subscriber, NewsletterCampaign, ChurchLocation, ChatMessage, Department } from '../types';
import { MOCK_ANNOUNCEMENTS, GALLERY_IMAGES, MOCK_SUBSCRIBERS, MOCK_CAMPAIGNS, MOCK_LOCATIONS, DEPARTMENTS } from '../constants';

const DB_KEYS = {
  USERS: 'ccap_system_users',
  ANNOUNCEMENTS: 'ccap_system_announcements',
  GALLERY: 'ccap_system_gallery',
  LOCATIONS: 'ccap_system_locations',
  SUBSCRIBERS: 'ccap_system_subscribers',
  CAMPAIGNS: 'ccap_system_campaigns',
  CHATS: 'ccap_system_chats',
  DEPARTMENTS: 'ccap_system_departments',
  SESSION: 'ccap_active_user'
};

// Helper to safely load data
const load = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error loading ${key}`, e);
    return fallback;
  }
};

// Helper to safely save data
const save = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
};

// Data Seeding Logic
const generateSeedUsers = (): User[] => {
  return [
    {
      id: 'sa_root',
      name: 'System Super Admin',
      email: 'admin@ccap.org',
      phone: '+265999123456',
      role: UserRole.SUPER_ADMIN,
      avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=4f46e5&color=fff',
      position: 'System Administrator',
      status: 'active',
      password: 'password123'
    }
  ];
};

const DEFAULT_CHATS: ChatMessage[] = [
    {
      id: '1',
      userId: 'sa_root',
      userName: 'System Super Admin',
      content: 'Welcome to the new CCAP Livingstonia Synod Management System.',
      timestamp: Date.now(),
      role: UserRole.SUPER_ADMIN
    }
];

export const db = {
  users: {
    getAll: () => load<User[]>(DB_KEYS.USERS, generateSeedUsers()),
    save: (data: User[]) => save(DB_KEYS.USERS, data),
  },
  departments: {
    getAll: () => load<Department[]>(DB_KEYS.DEPARTMENTS, DEPARTMENTS),
    save: (data: Department[]) => save(DB_KEYS.DEPARTMENTS, data),
  },
  announcements: {
    getAll: () => load<Announcement[]>(DB_KEYS.ANNOUNCEMENTS, MOCK_ANNOUNCEMENTS),
    save: (data: Announcement[]) => save(DB_KEYS.ANNOUNCEMENTS, data),
  },
  gallery: {
    getAll: () => load<GalleryImage[]>(DB_KEYS.GALLERY, GALLERY_IMAGES),
    save: (data: GalleryImage[]) => save(DB_KEYS.GALLERY, data),
  },
  locations: {
    getAll: () => load<ChurchLocation[]>(DB_KEYS.LOCATIONS, MOCK_LOCATIONS),
    save: (data: ChurchLocation[]) => save(DB_KEYS.LOCATIONS, data),
  },
  subscribers: {
    getAll: () => load<Subscriber[]>(DB_KEYS.SUBSCRIBERS, MOCK_SUBSCRIBERS),
    save: (data: Subscriber[]) => save(DB_KEYS.SUBSCRIBERS, data),
  },
  campaigns: {
    getAll: () => load<NewsletterCampaign[]>(DB_KEYS.CAMPAIGNS, MOCK_CAMPAIGNS),
    save: (data: NewsletterCampaign[]) => save(DB_KEYS.CAMPAIGNS, data),
  },
  chats: {
    getAll: () => load<ChatMessage[]>(DB_KEYS.CHATS, DEFAULT_CHATS),
    save: (data: ChatMessage[]) => save(DB_KEYS.CHATS, data),
  },
  session: {
    get: () => load<User | null>(DB_KEYS.SESSION, null),
    set: (user: User | null) => {
        if (user) save(DB_KEYS.SESSION, user);
        else localStorage.removeItem(DB_KEYS.SESSION);
    }
  },
  
  // Database Management Operations
  export: () => {
    const data: any = {};
    Object.entries(DB_KEYS).forEach(([key, storageKey]) => {
        if (key !== 'SESSION') {
            data[key] = localStorage.getItem(storageKey);
        }
    });
    return JSON.stringify(data, null, 2);
  },
  
  import: (json: string) => {
      try {
          const data = JSON.parse(json);
          let count = 0;
          Object.entries(DB_KEYS).forEach(([key, storageKey]) => {
             if (data[key]) {
                 const value = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
                 localStorage.setItem(storageKey, value);
                 count++;
             }
          });
          return count > 0;
      } catch (e) {
          console.error("Import failed", e);
          return false;
      }
  },
  
  reset: () => {
      localStorage.clear();
      window.location.reload();
  }
};
