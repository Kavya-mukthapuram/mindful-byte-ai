import React, { createContext, useContext, useState, useEffect } from 'react';

export interface MealLog {
  id: string;
  userId: string;
  foodItems: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  eatingReason: string;
  pace: string;
  moodAfter: string;
  timestamp: string;
  imageUrl?: string;
  method: 'photo' | 'voice' | 'manual';
}

export interface MoodJournal {
  id: string;
  userId: string;
  text: string;
  sentimentScore: number; // -1 to 1
  emoji: string;
  timestamp: string;
}

export interface Nudge {
  id: string;
  type: 'time' | 'stress' | 'streak' | 'craving' | 'hydration' | 'general';
  message: string;
  deliveredAt: string;
  response?: 'accepted' | 'ignored' | 'dismissed';
  read: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earnedAt: string;
  category: 'streak' | 'mindful' | 'discipline' | 'social';
}

export interface AppContextType {
  mealLogs: MealLog[];
  moodJournals: MoodJournal[];
  nudges: Nudge[];
  badges: Badge[];
  streaks: { [key: string]: number };
  addMealLog: (log: Omit<MealLog, 'id'>) => void;
  addMoodJournal: (journal: Omit<MoodJournal, 'id'>) => void;
  addNudge: (nudge: Omit<Nudge, 'id'>) => void;
  respondToNudge: (id: string, response: 'accepted' | 'ignored' | 'dismissed') => void;
  markNudgeRead: (id: string) => void;
  unreadNudges: number;
  getKolkataTime: () => Date;
  getKolkataTimeString: () => string;
  todayCalories: number;
  weeklyMeals: MealLog[];
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

// Kolkata timezone (IST = UTC+5:30)
const getKolkataTime = (): Date => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 60 * 60 * 1000);
};

const getKolkataTimeString = (): string => {
  return getKolkataTime().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
};

const MOCK_NUDGES: Nudge[] = [
  {
    id: 'n1',
    type: 'craving',
    message: "🔮 High craving risk detected for 3–4 PM today. Try drinking 500ml water first!",
    deliveredAt: new Date().toISOString(),
    read: false,
  },
  {
    id: 'n2',
    type: 'streak',
    message: "🔥 You've been mindful for 3 days! Don't break the streak — you're doing amazing.",
    deliveredAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: 'n3',
    type: 'hydration',
    message: "💧 Hydration check! You haven't logged water in 2 hours. Thirst often masks as hunger.",
    deliveredAt: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
];

const INITIAL_BADGES: Badge[] = [
  {
    id: 'b1',
    name: 'First Bite',
    description: 'Logged your very first meal',
    emoji: '🌱',
    earnedAt: new Date().toISOString(),
    category: 'mindful',
  },
  {
    id: 'b2',
    name: 'Mindful Starter',
    description: 'Completed onboarding & archetype quiz',
    emoji: '🧘',
    earnedAt: new Date().toISOString(),
    category: 'discipline',
  },
];

const SAMPLE_MEALS: MealLog[] = [
  {
    id: 'm1', userId: 'demo', foodItems: ['Dal Tadka', 'Brown Rice', 'Roti'],
    calories: 420, protein: 18, carbs: 65, fat: 8,
    eatingReason: 'Hunger', pace: 'Normal', moodAfter: 'Great',
    timestamp: new Date(Date.now() - 14400000).toISOString(), method: 'manual'
  },
  {
    id: 'm2', userId: 'demo', foodItems: ['Masala Chai', 'Marie Biscuits'],
    calories: 180, protein: 3, carbs: 30, fat: 5,
    eatingReason: 'Habit', pace: 'Rushed', moodAfter: 'Okay',
    timestamp: new Date(Date.now() - 28800000).toISOString(), method: 'manual'
  },
  {
    id: 'm3', userId: 'demo', foodItems: ['Poha', 'Banana', 'Coconut Water'],
    calories: 320, protein: 7, carbs: 58, fat: 6,
    eatingReason: 'Hunger', pace: 'Slow', moodAfter: 'Great',
    timestamp: new Date(Date.now() - 43200000).toISOString(), method: 'manual'
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mealLogs, setMealLogs] = useState<MealLog[]>(() => {
    const s = localStorage.getItem('mindbite_meals');
    return s ? JSON.parse(s) : SAMPLE_MEALS;
  });
  const [moodJournals, setMoodJournals] = useState<MoodJournal[]>(() => {
    const s = localStorage.getItem('mindbite_moods');
    return s ? JSON.parse(s) : [];
  });
  const [nudges, setNudges] = useState<Nudge[]>(() => {
    const s = localStorage.getItem('mindbite_nudges');
    return s ? JSON.parse(s) : MOCK_NUDGES;
  });
  const [badges, setBadges] = useState<Badge[]>(() => {
    const s = localStorage.getItem('mindbite_badges');
    return s ? JSON.parse(s) : INITIAL_BADGES;
  });
  const [streaks] = useState<{ [key: string]: number }>({ mindful: 3, logging: 5, hydration: 2 });

  useEffect(() => { localStorage.setItem('mindbite_meals', JSON.stringify(mealLogs)); }, [mealLogs]);
  useEffect(() => { localStorage.setItem('mindbite_moods', JSON.stringify(moodJournals)); }, [moodJournals]);
  useEffect(() => { localStorage.setItem('mindbite_nudges', JSON.stringify(nudges)); }, [nudges]);
  useEffect(() => { localStorage.setItem('mindbite_badges', JSON.stringify(badges)); }, [badges]);

  const addMealLog = (log: Omit<MealLog, 'id'>) => {
    const newLog = { ...log, id: `m_${Date.now()}` };
    setMealLogs(prev => [newLog, ...prev]);
    // Check for badge
    if (mealLogs.length === 0) {
      setBadges(prev => [...prev, {
        id: `b_${Date.now()}`, name: 'First Bite', description: 'Logged your first meal!',
        emoji: '🌱', earnedAt: new Date().toISOString(), category: 'mindful'
      }]);
    }
  };

  const addMoodJournal = (journal: Omit<MoodJournal, 'id'>) => {
    setMoodJournals(prev => [{ ...journal, id: `j_${Date.now()}` }, ...prev]);
  };

  const addNudge = (nudge: Omit<Nudge, 'id'>) => {
    setNudges(prev => [{ ...nudge, id: `n_${Date.now()}` }, ...prev]);
  };

  const respondToNudge = (id: string, response: 'accepted' | 'ignored' | 'dismissed') => {
    setNudges(prev => prev.map(n => n.id === id ? { ...n, response, read: true } : n));
  };

  const markNudgeRead = (id: string) => {
    setNudges(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadNudges = nudges.filter(n => !n.read).length;

  const kolkataToday = getKolkataTime();
  const todayStart = new Date(kolkataToday);
  todayStart.setHours(0, 0, 0, 0);

  const todayCalories = mealLogs
    .filter(m => new Date(m.timestamp) >= todayStart)
    .reduce((sum, m) => sum + m.calories, 0);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyMeals = mealLogs.filter(m => new Date(m.timestamp) >= weekAgo);

  return (
    <AppContext.Provider value={{
      mealLogs, moodJournals, nudges, badges, streaks,
      addMealLog, addMoodJournal, addNudge, respondToNudge, markNudgeRead,
      unreadNudges, getKolkataTime, getKolkataTimeString, todayCalories, weeklyMeals,
    }}>
      {children}
    </AppContext.Provider>
  );
};
