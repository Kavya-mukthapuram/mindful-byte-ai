import { useState } from 'react';
import { TrendingUp, TrendingDown, Award, BarChart2, Calendar, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ALL_BADGES = [
  { id: 'first_bite', name: 'First Bite', desc: 'Logged your first meal', emoji: '🌱', category: 'mindful' },
  { id: 'mindful_3', name: '3-Day Mindful', desc: 'Mindful eating for 3 days', emoji: '🧘', category: 'streak' },
  { id: 'mindful_7', name: '7-Day Conscious', desc: 'One full week of mindful eating', emoji: '⭐', category: 'streak' },
  { id: 'hydration', name: 'Hydration Hero', desc: '8 glasses in a day', emoji: '💧', category: 'mindful' },
  { id: 'craving_crusher', name: 'Craving Crusher', desc: 'Resisted 5 cravings', emoji: '🛡️', category: 'discipline' },
  { id: 'slow_eater', name: 'Tortoise Mode', desc: 'Ate slowly 5 times', emoji: '🐢', category: 'mindful' },
  { id: 'score_70', name: 'Discipline Champion', desc: 'Reached score of 70', emoji: '🏆', category: 'discipline' },
  { id: 'streak_10', name: '10-Day Warrior', desc: '10-day logging streak', emoji: '🔥', category: 'streak' },
  { id: 'emotional_aware', name: 'Emotional Aware', desc: 'Identified emotional eating', emoji: '💙', category: 'mindful' },
  { id: 'coach_chat', name: 'Coach Connector', desc: 'Had 5 chats with Coach Byte', emoji: '🤝', category: 'social' },
  { id: 'variety', name: 'Rainbow Eater', desc: 'Logged 5 different food types', emoji: '🌈', category: 'mindful' },
  { id: 'perfect_day', name: 'Perfect Day', desc: 'All meals mindful in one day', emoji: '✨', category: 'discipline' },
];

export const InsightsPage: React.FC = () => {
  const { user } = useAuth();
  const { mealLogs, weeklyMeals, badges, streaks, getKolkataTime } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'patterns'>('overview');

  const kolkataToday = getKolkataTime();

  // Weekly calories
  const weeklyCalByDay = DAYS.map((_, di) => {
    const target = new Date(kolkataToday);
    target.setDate(target.getDate() - (kolkataToday.getDay() - di + 7) % 7);
    return weeklyMeals
      .filter(m => new Date(m.timestamp).toDateString() === target.toDateString())
      .reduce((s, m) => s + m.calories, 0);
  });
  const maxCal = Math.max(...weeklyCalByDay, 1800);

  // Eating reasons breakdown
  const reasonCounts: Record<string, number> = {};
  weeklyMeals.forEach(m => { reasonCounts[m.eatingReason] = (reasonCounts[m.eatingReason] || 0) + 1; });
  const totalMeals = weeklyMeals.length || 1;

  // Mood breakdown
  const moodCounts: Record<string, number> = {};
  weeklyMeals.forEach(m => { moodCounts[m.moodAfter] = (moodCounts[m.moodAfter] || 0) + 1; });

  const earnedIds = badges.map(b => b.id.replace(/b_\d+/, '').trim());

  const scoreColor = (score: number) => score >= 75 ? 'text-primary' : score >= 50 ? 'text-amber' : 'text-destructive';

  const avgCalories = weeklyMeals.length > 0
    ? Math.round(weeklyMeals.reduce((s, m) => s + m.calories, 0) / weeklyMeals.length)
    : 0;

  const emotionalEatingPct = weeklyMeals.length > 0
    ? Math.round((weeklyMeals.filter(m => ['Stress', 'Boredom', 'Emotional'].includes(m.eatingReason)).length / weeklyMeals.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-5 pt-12 pb-5">
        <h1 className="text-xl font-display font-bold text-primary-foreground">Your Insights 📊</h1>
        <p className="text-primary-foreground/70 text-xs mt-1">
          Week of {kolkataToday.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • IST
        </p>

        {/* Tab bar */}
        <div className="flex bg-primary-foreground/15 rounded-xl p-1 mt-3">
          {[
            { id: 'overview', label: '📈 Overview' },
            { id: 'badges', label: '🏅 Badges' },
            { id: 'patterns', label: '🔍 Patterns' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as 'overview' | 'badges' | 'patterns')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === t.id ? 'bg-primary-foreground text-primary' : 'text-primary-foreground/80'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Score card */}
            <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Food Discipline Score</p>
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-display font-bold ${scoreColor(user?.disciplineScore || 50)}`}>
                      {user?.disciplineScore || 50}
                    </span>
                    <span className="text-muted-foreground text-sm mb-1">/100</span>
                    <span className="text-primary text-sm mb-1 flex items-center gap-0.5">
                      <TrendingUp size={14} /> +3 this week
                    </span>
                  </div>
                </div>
                <div className="w-16 h-16">
                  <svg viewBox="0 0 60 60" className="-rotate-90">
                    <circle cx="30" cy="30" r="24" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                    <circle cx="30" cy="30" r="24" fill="none"
                      stroke={`hsl(var(--${(user?.disciplineScore || 50) >= 75 ? 'primary' : (user?.disciplineScore || 50) >= 50 ? 'amber' : 'destructive'}))`}
                      strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 24}
                      strokeDashoffset={2 * Math.PI * 24 * (1 - (user?.disciplineScore || 50) / 100)}
                    />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Streak', value: `${streaks.mindful || 0}d`, icon: '🔥' },
                  { label: 'Meals Logged', value: mealLogs.length, icon: '🍽️' },
                  { label: 'Badges', value: badges.length, icon: '🏅' },
                ].map(s => (
                  <div key={s.label} className="bg-muted rounded-xl p-2.5 text-center">
                    <div className="text-lg">{s.icon}</div>
                    <p className="text-base font-display font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly calories bar chart */}
            <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up stagger-1">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={16} className="text-primary" />
                <h3 className="font-display font-bold text-foreground">Weekly Calories</h3>
              </div>
              <div className="flex items-end gap-2 h-28">
                {DAYS.map((day, i) => {
                  const cal = weeklyCalByDay[i];
                  const pct = (cal / maxCal) * 100;
                  const isToday = i === kolkataToday.getDay();
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-700 ${isToday ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                          style={{ height: `${Math.max(pct, cal > 0 ? 8 : 0)}%` }}
                        />
                      </div>
                      <p className={`text-[10px] font-medium ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                        {day}
                      </p>
                      {cal > 0 && <p className="text-[9px] text-muted-foreground">{cal}</p>}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Avg/meal</p>
                  <p className="text-sm font-bold text-foreground">{avgCalories} kcal</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Emotional eating</p>
                  <p className={`text-sm font-bold ${emotionalEatingPct > 30 ? 'text-destructive' : 'text-primary'}`}>
                    {emotionalEatingPct}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Weekly meals</p>
                  <p className="text-sm font-bold text-foreground">{weeklyMeals.length}</p>
                </div>
              </div>
            </div>

            {/* Eating reasons */}
            <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up stagger-2">
              <div className="flex items-center gap-2 mb-4">
                <Heart size={16} className="text-mood" />
                <h3 className="font-display font-bold text-foreground">Why Did You Eat?</h3>
              </div>
              {Object.keys(reasonCounts).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Log some meals to see patterns!</p>
              ) : (
                <div className="space-y-2.5">
                  {Object.entries(reasonCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([reason, count]) => {
                      const pct = Math.round((count / totalMeals) * 100);
                      const isPositive = reason === 'Hunger';
                      return (
                        <div key={reason}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                              {reason === 'Hunger' ? '😋' : reason === 'Stress' ? '😰' : reason === 'Boredom' ? '😑' : reason === 'Social' ? '👥' : reason === 'Habit' ? '🔄' : '💔'}
                              {reason}
                            </span>
                            <span className="text-xs font-bold text-foreground">{pct}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${isPositive ? 'bg-primary' : 'bg-accent'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* AI Insight */}
            <div className="bg-primary-light rounded-2xl p-4 border border-primary/20 animate-slide-up stagger-3">
              <div className="flex gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">AI Pattern Insight</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {emotionalEatingPct > 40
                      ? `You've been eating emotionally ${emotionalEatingPct}% of the time this week. Stress is the main trigger. Try the 5-breath technique before meals! 💙`
                      : emotionalEatingPct > 20
                      ? `${emotionalEatingPct}% emotional eating this week — improving! Hunger is becoming your dominant eating cue. Keep it up! 🌱`
                      : `Excellent! ${100 - emotionalEatingPct}% of your meals are hunger-driven this week. You're building real food discipline! ⭐`}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground">Your Achievements</h3>
              <span className="text-xs text-muted-foreground">{badges.length}/{ALL_BADGES.length} earned</span>
            </div>

            {/* Progress */}
            <div className="bg-card rounded-2xl shadow-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Badge Progress</span>
                <span className="text-sm font-bold text-primary">{Math.round((badges.length / ALL_BADGES.length) * 100)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${(badges.length / ALL_BADGES.length) * 100}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {ALL_BADGES.map(badge => {
                const earned = badges.some(b => b.name === badge.name || b.emoji === badge.emoji);
                return (
                  <div key={badge.id}
                    className={`bg-card rounded-2xl shadow-card p-4 text-center transition-all ${earned ? '' : 'opacity-40 grayscale'}`}>
                    <div className={`text-3xl mb-2 ${earned ? 'animate-bounce-in' : ''}`}>{badge.emoji}</div>
                    <p className={`text-xs font-bold mb-0.5 ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {badge.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
                    {earned && <span className="inline-block mt-1.5 text-[9px] px-2 py-0.5 bg-primary-light text-primary rounded-full font-semibold">EARNED ✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="space-y-4 animate-slide-up">

            {/* Mood after eating */}
            <div className="bg-card rounded-2xl shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-amber" />
                <h3 className="font-display font-bold text-foreground">Post-Meal Mood</h3>
              </div>
              {Object.keys(moodCounts).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Log meals to track moods!</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(moodCounts).map(([mood, count]) => {
                    const pct = Math.round((count / totalMeals) * 100);
                    const color = mood === 'Great' ? 'primary' : mood === 'Okay' ? 'amber' : 'destructive';
                    return (
                      <div key={mood}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{mood}</span>
                          <span className="text-xs font-bold text-foreground">{pct}%</span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full bg-${color} rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pace analysis */}
            <div className="bg-card rounded-2xl shadow-card p-5">
              <h3 className="font-display font-bold text-foreground mb-4">Eating Pace Analysis</h3>
              {weeklyMeals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {['Slow', 'Normal', 'Rushed'].map(pace => {
                      const count = weeklyMeals.filter(m => m.pace === pace).length;
                      const pct = Math.round((count / totalMeals) * 100);
                      return (
                        <div key={pace} className="text-center bg-muted rounded-xl p-2">
                          <p className="text-lg">{pace === 'Slow' ? '🐢' : pace === 'Normal' ? '👍' : '⚡'}</p>
                          <p className="text-base font-display font-bold text-foreground">{pct}%</p>
                          <p className="text-[10px] text-muted-foreground">{pace}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-amber-light rounded-xl p-3">
                    <p className="text-xs text-amber-DEFAULT font-semibold">
                      {weeklyMeals.filter(m => m.pace === 'Rushed').length > weeklyMeals.length / 2
                        ? '⚡ You tend to eat fast. Slowing down by 5 min reduces calorie intake by ~10%!'
                        : '🌱 Great pacing! Eating slowly helps your body register fullness accurately.'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Streaks */}
            <div className="bg-card rounded-2xl shadow-card p-5">
              <h3 className="font-display font-bold text-foreground mb-4">Active Streaks 🔥</h3>
              <div className="space-y-3">
                {[
                  { label: 'Mindful Eating', value: streaks.mindful || 0, icon: '🧘', target: 7 },
                  { label: 'Meal Logging', value: streaks.logging || 0, icon: '📝', target: 14 },
                  { label: 'Hydration', value: streaks.hydration || 0, icon: '💧', target: 7 },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        {s.icon} {s.label}
                      </span>
                      <span className="text-sm font-bold text-foreground">{s.value}/{s.target} days</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: s.target }).map((_, i) => (
                        <div key={i} className={`flex-1 h-3 rounded-sm transition-all duration-300 ${
                          i < s.value ? 'bg-primary' : 'bg-muted'
                        }`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Craving prediction */}
            <div className="bg-card rounded-2xl shadow-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-mood" />
                <h3 className="font-display font-bold text-foreground">Craving Risk Forecast</h3>
              </div>
              <div className="space-y-2">
                {[
                  { time: '3–4 PM', risk: 85, reason: 'Post-lunch dip + habitual snacking' },
                  { time: '9–11 PM', risk: 70, reason: 'Late night cortisol + screen time' },
                  { time: '11 AM–12 PM', risk: 45, reason: 'Pre-lunch hunger build-up' },
                ].map(c => (
                  <div key={c.time} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.risk >= 80 ? 'bg-destructive' : c.risk >= 60 ? 'bg-amber' : 'bg-primary'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs font-semibold text-foreground">{c.time}</span>
                        <span className={`text-xs font-bold ${c.risk >= 80 ? 'text-destructive' : c.risk >= 60 ? 'text-amber' : 'text-primary'}`}>
                          {c.risk}% risk
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{c.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
