
import { User, UserRole, Department, ChurchLocation, Notification, Announcement, GalleryImage, Subscriber, NewsletterCampaign } from './types';

export const MAIN_OFFICE_ADDRESS = {
  name: "CCAP Synod of Livingstonia",
  region: "Northern Region",
  city: "Mzuzu",
  poBox: "P.O. Box 112",
  country: "Malawi",
  coordinates: { lat: -11.465, lng: 34.020 }
};

export const DEPARTMENTS: Department[] = [
  { id: 'Education', name: 'Education', head: 'Rev. John Banda', description: 'Managing synod schools and universities.' },
  { id: 'Health', name: 'Health', head: 'Dr. Mary Phiri', description: 'Overseeing mission hospitals and clinics.' },
  { id: 'Evangelism', name: 'Evangelism', head: 'Rev. Peter Moyo', description: 'Spreading the gospel across the region.' },
  { id: 'Finance', name: 'Finance', head: 'Mr. James Chirwa', description: 'Managing synod resources and assets.' },
  { id: 'Youth', name: 'Youth', head: 'Pastor Alice Gondwe', description: 'Empowering the next generation.' },
  { id: 'Women', name: 'Women\'s Guild', head: 'Mrs. Grace K', description: 'Spiritual growth for women.' },
];

export const DISTRICTS = [
  "Mzuzu City", "Mzimba", "Rumphi", "Nkhata Bay", "Karonga", "Chitipa", "Likoma"
];

// Mock Users Database
export const MOCK_USERS: User[] = [
  {
    id: 'sa1',
    name: 'Super Admin One',
    email: 'admin@ccap.org',
    phone: '+265999123456',
    role: UserRole.SUPER_ADMIN,
    avatar: 'https://picsum.photos/200/200?random=1',
    position: 'General Secretary',
    status: 'active',
    password: 'password123'
  },
  {
    id: 'p1',
    name: 'Rev. Chifundo Mwale',
    email: 'mwale@ccap.org',
    phone: '+265888123456',
    role: UserRole.PASTOR,
    district: 'Mzimba',
    location: 'Mzimba Boma Church',
    avatar: 'https://picsum.photos/200/200?random=2',
    position: 'Resident Pastor',
    status: 'active',
    password: 'password123'
  },
  {
    id: 'da1',
    name: 'Elder Joseph Ngwira',
    email: 'ngwira@ccap.org',
    phone: '+265999000001',
    role: UserRole.DISTRICT_ADMIN,
    district: 'Rumphi',
    avatar: 'https://picsum.photos/200/200?random=3',
    position: 'District Chairman',
    status: 'active',
    password: 'password123'
  }
];

export const MOCK_LOCATIONS: ChurchLocation[] = [
  { id: 'l1', name: 'St. Andrews Church', district: 'Mzuzu City', adminId: 'la1', address: 'Mzuzu City Center' },
  { id: 'l2', name: 'Ekwendeni Mission', district: 'Mzimba', adminId: 'la2', address: 'Ekwendeni' },
  { id: 'l3', name: 'Livingstonia Mission', district: 'Rumphi', adminId: 'la3', address: 'Khondowe' },
  { id: 'l19', name: 'Bandawe Mission', district: 'Nkhata Bay', adminId: 'la19', address: 'Bandawe' },
  { id: 'l24', name: 'Karonga Boma CCAP', district: 'Karonga', adminId: 'la24', address: 'Karonga Boma' },
  { id: 'l32', name: 'Likoma CCAP', district: 'Likoma', adminId: 'la32', address: 'Likoma Island' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Synod Meeting', message: 'General Assembly scheduled for next month in Mzuzu.', date: '2023-10-25', read: false, type: 'alert' },
  { id: '2', title: 'Report Due', message: 'Q3 Financial reports due by Friday.', date: '2023-10-20', read: true, type: 'info' },
  { id: '3', title: 'Department Sync', message: 'Education department meeting at 2pm.', date: '2023-10-26', read: false, type: 'meeting' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', departmentId: 'Education', title: 'School Inspections', message: 'All district admins to submit school reports.', meetingTime: 'Next Monday, 10:00 AM', author: 'Rev. John Banda', date: '2023-10-24' },
  { id: '2', departmentId: 'Health', title: 'Medicine Supply', message: 'New batch of supplies arriving at Ekwendeni Hospital.', author: 'Dr. Mary Phiri', date: '2023-10-23' },
];

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: '1', url: 'https://picsum.photos/800/600?random=10', caption: 'Synod Headquarters', category: 'Buildings' },
  { id: '2', url: 'https://picsum.photos/800/600?random=11', caption: 'Youth Choir Performance', category: 'Events' },
];

export const CHURCH_INFO = {
  about: "The Church of Central Africa Presbyterian (CCAP) Synod of Livingstonia is a vibrant community of believers dedicated to serving God and the people of Malawi, specifically in the Northern Region.",
  vision: "To be a spiritually vibrant, united, self-reliant, and holistic ministry church.",
  mission: "To proclaim the Gospel of Jesus Christ to all people through holistic evangelism, nurturing believers, and serving the community.",
  values: ["Integrity", "Stewardship", "Unity", "Love", "Justice"],
  beliefs: "We believe in the Trinity: God the Father, Son, and Holy Spirit. We uphold the authority of the Bible as the word of God and the guide for faith and practice.",
  objectives: [
    "To preach the Gospel of Jesus Christ.",
    "To promote education and health services.",
    "To advocate for social justice and human rights.",
    "To empower youth and women in ministry."
  ]
};

export const MOCK_SUBSCRIBERS: Subscriber[] = [
  { id: 's1', email: 'member@congregation.com', dateJoined: '2023-09-10' },
];

export const MOCK_CAMPAIGNS: NewsletterCampaign[] = [
  { id: 'c1', subject: 'October Monthly Update', content: 'Greetings in the name of our Lord...', sentDate: '2023-10-01', recipientCount: 150, status: 'Sent' },
];

export const SCRIPTURE_LIBRARY = [
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1", category: "Comfort" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13", category: "Strength" },
  { text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.", ref: "Jeremiah 29:11", category: "Hope" },
  { text: "Trust in the Lord with all your heart, and do not lean on your own understanding.", ref: "Proverbs 3:5", category: "Wisdom" },
  { text: "Blessed are the peacemakers, for they shall be called sons of God.", ref: "Matthew 5:9", category: "Peace" },
  { text: "Where there is no guidance, a people falls, but in an abundance of counselors there is safety.", ref: "Proverbs 11:14", category: "Leadership" },
  { text: "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.", ref: "Matthew 28:19", category: "Evangelism" },
  { text: "Serve the Lord with gladness! Come into his presence with singing!", ref: "Psalm 100:2", category: "Service" },
  { text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles.", ref: "Isaiah 40:31", category: "Strength" },
  { text: "Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.", ref: "Joshua 1:9", category: "Leadership" },
  { text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.", ref: "Romans 8:28", category: "Hope" },
  { text: "The Lord is my light and my salvation; whom shall I fear?", ref: "Psalm 27:1", category: "Comfort" },
  { text: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7", category: "Comfort" },
  { text: "In the beginning was the Word, and the Word was with God, and the Word was God.", ref: "John 1:1", category: "General" },
  { text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness.", ref: "Galatians 5:22", category: "General" },
  { text: "Your word is a lamp to my feet and a light to my path.", ref: "Psalm 119:105", category: "Wisdom" },
  { text: "He has told you, O man, what is good; and what does the Lord require of you but to do justice, and to love kindness, and to walk humbly with your God?", ref: "Micah 6:8", category: "Service" },
  { text: "Come to me, all who labor and are heavy laden, and I will give you rest.", ref: "Matthew 11:28", category: "Comfort" },
  { text: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God.", ref: "Ephesians 2:8", category: "General" },
  { text: "I am the way, and the truth, and the life. No one comes to the Father except through me.", ref: "John 14:6", category: "Evangelism" }
];
