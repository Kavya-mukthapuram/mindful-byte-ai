import { useState } from 'react';
import { LogOut, Edit2, Settings, Shield, Star, ChevronRight, Bell, Clock, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

const ARCHETYPE_INFO: Record<string, { emoji: string; label: string; tips: string[] }> = {
  emotional: {
    emoji: '💙', label: 'Emotional Eater',
    tips: ['Journal your feelings before eating', 'Practice 5 deep breaths when stressed', 'Keep healthy snacks accessible'],
  },
  binge: {
    emoji: '🛡️', label: 'Binge Eater',
    tips: ['Never skip meals — it triggers binges', 'Eat every 4 hours consistently', 'Remove trigger foods from home'],
  },
  snacker: {
    emoji: '🎯', label: 'Mindless Snacker',
    tips: ['Pre-portion snacks in small containers', 'Add friction to snack access', 'Ask: "Am I actually hungry?"'],
  },
  skipper: {
    emoji: '⏰', label: 'Meal Skipper',
    tips: ['Set meal alarms for 8AM, 1PM, 7PM', 'Prep meals on Sunday for the week', 'Keep fruit available for quick meals'],
  },
  disciplined: {
    emoji: '⭐', label: 'Disciplined Eater',
    tips: ['Focus on nutrient density over calories', 'Experiment with intuitive eating', 'Share your habits to inspire others'],
  },
};

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, logout, updateUser } = useAuth();
  const { mealLogs, badges, streaks } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [notifDnd, setNotifDnd] = useState({ start: '22:00', end: '07:00' });

  const archInfo = user?.archetype ? ARCHETYPE_INFO[user.archetype] : null;

  const handleLogout = () => {
    logout();
  };

  const saveName = () => {
    if (newName.trim()) updateUser({ name: newName.trim() });
    setEditName(false);
  };

  const scoreColor = (s: number) => s >= 75 ? 'text-primary' : s >= 50 ? 'text-amber' : 'text-destructive';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-5 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center text-3xl">
              {archInfo?.emoji || '🌱'}
            </div>
            <div>
              {editName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="bg-primary-foreground/20 text-primary-foreground rounded-lg px-2 py-1 text-base font-bold border border-primary-foreground/30 focus:outline-none"
                    autoFocus
                  />
                  <button onClick={saveName} className="text-primary-foreground text-xs bg-primary-foreground/20 px-2 py-1 rounded-lg">Save</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-bold text-primary-foreground">{user?.name}</h2>
                  <button onClick={() => setEditName(true)}>
                    <Edit2 size={14} className="text-primary-foreground/60" />
                  </button>
                </div>
              )}
              <p className="text-primary-foreground/70 text-xs">{user?.email}</p>
              {archInfo && (
                <span className="text-[10px] bg-primary-foreground/20 text-primary-foreground px-2 py-0.5 rounded-lg mt-1 inline-block font-medium">
                  {archInfo.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: 'Score', value: user?.disciplineScore || 50, highlight: true },
            { label: 'Meals', value: mealLogs.length },
            { label: 'Badges', value: badges.length },
            { label: 'Streak', value: `${streaks.mindful || 0}d` },
          ].map(s => (
            <div key={s.label} className="bg-primary-foreground/15 rounded-xl py-2 text-center">
              <p className={`font-display font-bold text-base text-primary-foreground`}>{s.value}</p>
              <p className="text-[10px] text-primary-foreground/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">

        {/* Archetype tips */}
        {archInfo && (
          <div className="bg-card rounded-2xl shadow-card p-4 animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{archInfo.emoji}</span>
              <h3 className="font-display font-bold text-foreground">Your Archetype Tips</h3>
            </div>
            <div className="space-y-2">
              {archInfo.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-primary-light rounded-xl p-3">
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary-foreground">{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile info */}
        {user?.profile && (
          <div className="bg-card rounded-2xl shadow-card p-4 animate-slide-up stagger-1">
            <div className="flex items-center gap-2 mb-3">
              <UserIcon size={16} className="text-primary" />
              <h3 className="font-display font-bold text-foreground">Profile Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Age', value: `${user.profile.age} years` },
                { label: 'Gender', value: user.profile.gender.replace('_', ' ') },
                { label: 'Stress Level', value: `${user.profile.stressLevel}/10` },
                { label: 'Sleep', value: `${user.profile.sleepHours}h/night` },
              ].map(d => (
                <div key={d.label} className="bg-muted rounded-xl p-2.5">
                  <p className="text-[10px] text-muted-foreground">{d.label}</p>
                  <p className="text-sm font-semibold text-foreground capitalize">{d.value}</p>
                </div>
              ))}
            </div>
            {user.profile.goals.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Goals</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.profile.goals.map(g => (
                    <span key={g} className="px-2.5 py-1 bg-primary-light text-primary rounded-lg text-xs font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {user.profile.dietary.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-2">Dietary</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.profile.dietary.map(d => (
                    <span key={d} className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notification settings */}
        <div className="bg-card rounded-2xl shadow-card p-4 animate-slide-up stagger-2">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-amber" />
            <h3 className="font-display font-bold text-foreground">Notification Settings</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Max nudges/day</p>
                <p className="text-xs text-muted-foreground">Never annoying — max 3 per day</p>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(n => (
                  <button key={n} className="w-8 h-8 bg-primary-light text-primary rounded-lg text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-all">
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-1">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Do Not Disturb</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">From</p>
                  <input type="time" value={notifDnd.start}
                    onChange={e => setNotifDnd(d => ({ ...d, start: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">To</p>
                  <input type="time" value={notifDnd.end}
                    onChange={e => setNotifDnd(d => ({ ...d, end: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Quiet hours: {notifDnd.start} – {notifDnd.end} IST
              </p>
            </div>
          </div>
        </div>

        {/* Settings links */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden animate-slide-up stagger-3">
          {[
            { icon: Star, label: 'Nudge Style', value: user?.profile?.nudgeStyle || 'Gentle', color: 'amber' },
            { icon: Shield, label: 'Privacy & Data', value: 'Manage', color: 'primary' },
            { icon: Settings, label: 'Re-run Archetype Quiz', value: '', color: 'mood', action: () => updateUser({ onboardingComplete: false }) },
          ].map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-muted transition-all text-left ${i > 0 ? 'border-t border-border' : ''}`}
            >
              <div className={`w-9 h-9 bg-${item.color}-light rounded-xl flex items-center justify-center`}>
                <item.icon size={16} className={`text-${item.color}`} />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
              <span className="text-xs text-muted-foreground capitalize">{item.value}</span>
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-destructive/30 text-destructive font-semibold hover:bg-destructive/5 active:scale-[0.98] transition-all animate-slide-up stagger-4"
          >
            <LogOut size={16} />
            Log Out
          </button>
        ) : (
          <div className="bg-destructive/10 rounded-2xl p-4 animate-slide-up">
            <p className="text-sm font-semibold text-foreground mb-3 text-center">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted transition-all">
                Cancel
              </button>
              <button onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground pb-2">
          Joined {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
        </p>
      </div>
    </div>
  );
};
