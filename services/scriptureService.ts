
import { SCRIPTURE_LIBRARY } from '../constants';

// Categories available in the library
export type ScriptureCategory = 'Comfort' | 'Hope' | 'Strength' | 'Wisdom' | 'Peace' | 'Leadership' | 'Evangelism' | 'Service' | 'General';

export const getRandomVerse = (category?: ScriptureCategory) => {
  let pool = SCRIPTURE_LIBRARY;
  
  if (category && category !== 'General') {
    const filtered = SCRIPTURE_LIBRARY.filter(v => v.category === category);
    if (filtered.length > 0) {
      pool = filtered;
    }
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

export const getVerseBySearch = (term: string) => {
  const lowerTerm = term.toLowerCase();
  return SCRIPTURE_LIBRARY.filter(
    v => v.text.toLowerCase().includes(lowerTerm) || 
         v.ref.toLowerCase().includes(lowerTerm) ||
         v.category.toLowerCase().includes(lowerTerm)
  );
};

export const getDailyDevotionTip = () => {
  const verse = getRandomVerse('Leadership'); // Default to leadership for the dashboard
  return `${verse.text} — ${verse.ref}`;
};
