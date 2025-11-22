
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DISTRICT_ADMIN = 'DISTRICT_ADMIN',
  LOCAL_ADMIN = 'LOCAL_ADMIN',
  PASTOR = 'PASTOR',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department?: string;
  district?: string;
  location?: string; // Church location
  avatar?: string;
  position?: string; // Added field for job title
  meetingTime?: string; // Added field for office hours/availability
  status?: 'active' | 'pending' | 'rejected'; // Account status
  password?: string; // For demo authentication
  lastLogin?: string; // Added field for tracking activity
  rejectionDate?: string; // ISO string for when user was rejected
}

export interface Pastor extends User {
  position: string; // e.g., "Reverend", "Assistant Pastor"
  ordainedDate: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  role: UserRole;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  description: string;
}

export interface ChurchLocation {
  id: string;
  name: string;
  district: string;
  adminId: string;
  address: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'alert' | 'meeting';
}

export interface Announcement {
  id: string;
  departmentId: string;
  title: string;
  message: string;
  meetingTime?: string;
  author: string;
  date: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  category: string;
}

export interface Subscriber {
  id: string;
  email: string;
  dateJoined: string;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  sentDate: string;
  recipientCount: number;
  status: 'Sent' | 'Draft';
}

export interface Devotion {
  id: string;
  title: string;
  content: string;
  scripture: string;
  author: string;
  date: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'Meeting' | 'Service' | 'Wedding' | 'Funeral' | 'Other';
  description: string;
}

export interface FinancialRecord {
  id: string;
  type: 'Tithe' | 'Donation' | 'Project' | 'Expense';
  amount: number;
  date: string;
  description: string;
  congregation: string;
  method: 'Cash' | 'Bank' | 'Airtel Money' | 'Mpamba';
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  address: string;
  baptismStatus: 'Not Baptized' | 'Catechumen' | 'Baptized';
  district: string;
  joinedDate: string;
}

export interface MonthlyReport {
  id: string;
  month: string;
  year: number;
  pastorId: string;
  district: string;
  attendanceAvg: number;
  converts: number;
  baptisms: number;
  titheTotal: number;
  status: string;
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  scripture: string;
  date: string;
  notes: string;
}