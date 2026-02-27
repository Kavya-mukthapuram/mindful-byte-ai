import { useState, useEffect } from 'react';
import { Bell, Droplets, Flame, Trophy, ChevronRight, Star, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

const GREETINGS = ['Good morning', 'Good afternoon', 'Good evening', 'Good night'];

const getGreeting = (hour: number) => {
  if (hour < 12) return GREETINGS[0];
  if (hour < 17) return GREETINGS[1];
  if (hour < 21) return GREETINGS[2];
  return GREETINGS[3];
};

const ARCHETYPE_DATA: Record<string, { emoji: string; label: string; color: string }> = {
  emotional: { emoji: '😢', label: 'Emotional Eater', color: 'mood' },
  binge: { emoji: '🍔', label: 'Binge Eater', color: 'accent' },
  snacker: { emoji: '🍿', label: 'Mindless Snacker', color: 'amber' },
  skipper: { emoji: '⏰', label: 'Meal Skipper', color: 'hydration' },
  disciplined: { emoji: '✅', label: 'Disciplined Eater', color: 'primary' },
};

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { nudges, unreadNudges, mealLogs, todayCalories, streaks, badges, getKolkataTime, respondToNudge } = useApp();
  const [kolkataTime, setKolkataTime] = useState(getKolkataTime());
  const [waterGlasses, setWaterGlasses] = useState(() => +( localStorage.getItem('mindbite_water') || '0'));

  useEffect(() => {
    const interval = setInterval(() => setKolkataTime(getKolkataTime()), 60000);
    return () => clearInterval(interval);
  }, [getKolkataTime]);

  const hour = kolkataTime.getHours();
  const greeting = getGreeting(hour);
  const score = user?.disciplineScore ?? 50;
  const archetype = user?.archetype ? ARCHETYPE_DATA[user.archetype] : null;

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const todayMeals = mealLogs.filter(m => {
    const mealDate = new Date(m.timestamp);
    const today = getKolkataTime();
    return mealDate.toDateString() === today.toDateString();
  });

  const latestNudge = nudges.find(n => !n.read);

  const addWater = () => {
    const next = Math.min(waterGlasses + 1, 8);
    setWaterGlasses(next);
    localStorage.setItem('mindbite_water', String(next));
  };

  const scoreColor = score >= 75 ? '#00b894' : score >= 50 ? '#fdcb6e' : '#e17055';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-24 h-24 rounded-full bg-primary-foreground/20 animate-float" />
          <div className="absolute bottom-2 left-12 w-16 h-16 rounded-full bg-primary-foreground/15 animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="flex items-start justify-between relative">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium">{greeting},</p>
            <h1 className="text-2xl font-display font-bold text-primary-foreground mt-0.5">
              {user?.name?.split(' ')[0] || 'Friend'} 👋
            </h1>
            <p className="text-primary-foreground/70 text-xs mt-1">
              {kolkataTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} • IST
            </p>
          </div>

          <button onClick={() => onNavigate('coach')} className="relative p-2.5 bg-primary-foreground/20 rounded-xl hover:bg-primary-foreground/30 transition-all">
            <Bell size={20} className="text-primary-foreground" />
            {unreadNudges > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full text-[10px] font-bold text-accent-foreground flex items-center justify-center">
                {unreadNudges}
              </span>
            )}
          </button>
        </div>

        {/* Discipline Score */}
        <div className="mt-5 bg-primary-foreground/15 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                <circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' }}
                  className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-bold text-primary-foreground">{score}</span>
                <span className="text-[10px] text-primary-foreground/70 font-medium">Score</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Star size={14} className="text-amber-DEFAULT fill-amber-DEFAULT" />
                <span className="text-primary-foreground font-display font-bold text-base">Food Discipline</span>
              </div>
              {archetype && (
                <span className="inline-flex items-center gap-1.5 bg-primary-foreground/20 px-2.5 py-1 rounded-lg text-xs text-primary-foreground font-medium mb-2">
                  {archetype.emoji} {archetype.label}
                </span>
              )}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-primary-foreground/15 rounded-xl p-2">
                  <div className="flex items-center gap-1.5">
                    <Flame size={12} className="text-accent" />
                    <span className="text-primary-foreground/70 text-[10px]">Streak</span>
                  </div>
                  <p className="text-primary-foreground font-bold font-display">{streaks.mindful || 0}d 🔥</p>
                </div>
                <div className="bg-primary-foreground/15 rounded-xl p-2">
                  <div className="flex items-center gap-1.5">
                    <Trophy size={12} className="text-amber-DEFAULT" />
                    <span className="text-primary-foreground/70 text-[10px]">Badges</span>
                  </div>
                  <p className="text-primary-foreground font-bold font-display">{badges.length} 🏅</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">

        {/* Active Nudge */}
        {latestNudge && (
          <div className="bg-card rounded-2xl shadow-card p-4 border-l-4 border-accent animate-slide-up">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-accent-light rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap size={16} className="text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-0.5">Coach Byte says</p>
                <p className="text-sm text-foreground leading-relaxed">{latestNudge.message}</p>
                <div className="flex gap-2 mt-3">
                  {['accepted', 'dismissed'].map(r => (
                    <button key={r} onClick={() => respondToNudge(latestNudge.id, r as 'accepted' | 'dismissed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        r === 'accepted'
                          ? 'bg-primary-light text-primary hover:bg-primary hover:text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-border'
                      }`}>
                      {r === 'accepted' ? '✓ Got it!' : '✕ Skip'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-3.5 shadow-card text-center animate-slide-up stagger-1">
            <div className="w-9 h-9 bg-accent-light rounded-xl flex items-center justify-center mx-auto mb-2">
              <Flame size={18} className="text-accent" />
            </div>
            <p className="text-lg font-display font-bold text-foreground">{todayCalories}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Calories</p>
          </div>
          <div className="bg-card rounded-2xl p-3.5 shadow-card text-center animate-slide-up stagger-2">
            <div className="w-9 h-9 bg-hydration-light rounded-xl flex items-center justify-center mx-auto mb-2">
              <Droplets size={18} className="text-hydration" />
            </div>
            <p className="text-lg font-display font-bold text-foreground">{waterGlasses}/8</p>
            <p className="text-[10px] text-muted-foreground font-medium">Glasses</p>
          </div>
          <div className="bg-card rounded-2xl p-3.5 shadow-card text-center animate-slide-up stagger-3">
            <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-2">
              <TrendingUp size={18} className="text-primary" />
            </div>
            <p className="text-lg font-display font-bold text-foreground">{todayMeals.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Meals</p>
          </div>
        </div>

        {/* Water tracker */}
        <div className="bg-card rounded-2xl shadow-card p-4 animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-hydration" />
              <span className="font-semibold text-sm text-foreground">Hydration Tracker</span>
            </div>
            <button onClick={addWater}
              className="px-3 py-1.5 bg-hydration-light text-hydration rounded-lg text-xs font-bold hover:bg-hydration hover:text-primary-foreground transition-all">
              + Glass
            </button>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`flex-1 h-7 rounded-lg transition-all duration-300 ${
                i < waterGlasses ? 'bg-hydration' : 'bg-muted'
              }`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {waterGlasses >= 8 ? '✅ Daily goal met! Great job!' : `${8 - waterGlasses} more glasses to reach your goal`}
          </p>
        </div>

        {/* Today's Meals */}
        <div className="animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-foreground">Today's Meals</h3>
            <button onClick={() => onNavigate('log')} className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
              Log Meal <ChevronRight size={14} />
            </button>
          </div>

          {todayMeals.length === 0 ? (
            <div className="bg-card rounded-2xl shadow-card p-6 text-center">
              <p className="text-3xl mb-2">🍽️</p>
              <p className="text-sm text-muted-foreground">No meals logged today yet.</p>
              <button onClick={() => onNavigate('log')}
                className="mt-3 px-4 py-2 gradient-hero text-primary-foreground text-sm font-semibold rounded-xl shadow-primary hover:opacity-90 transition-all">
                Log First Meal
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todayMeals.slice(0, 3).map(meal => (
                <div key={meal.id} className="bg-card rounded-xl shadow-sm p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {meal.eatingReason === 'Stress' ? '😰' : meal.eatingReason === 'Boredom' ? '😐' : '😊'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{meal.foodItems.join(', ')}</p>
                    <p className="text-xs text-muted-foreground">{meal.calories} kcal • {meal.pace} pace • {meal.moodAfter}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-lg font-semibold ${
                    meal.eatingReason === 'Hunger' ? 'bg-primary-light text-primary' :
                    meal.eatingReason === 'Stress' ? 'bg-mood-light text-mood' :
                    'bg-amber-light text-amber'
                  }`}>
                    {meal.eatingReason}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges preview */}
        <div className="animate-slide-up stagger-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-foreground">Recent Badges</h3>
            <button onClick={() => onNavigate('insights')} className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {badges.slice(0, 5).map(badge => (
              <div key={badge.id} className="flex-shrink-0 bg-card rounded-2xl shadow-card p-3.5 text-center w-20">
                <div className="text-3xl mb-1.5 animate-bounce-in">{badge.emoji}</div>
                <p className="text-[10px] font-semibold text-foreground leading-tight">{badge.name}</p>
              </div>
            ))}
            {badges.length === 0 && (
              <div className="bg-card rounded-2xl shadow-card p-4 text-center w-full">
                <p className="text-sm text-muted-foreground">Log meals to earn badges! 🏆</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
