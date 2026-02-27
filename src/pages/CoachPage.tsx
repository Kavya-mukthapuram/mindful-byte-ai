import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Bell, BellOff, X, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

interface Message {
  id: string;
  role: 'user' | 'coach';
  content: string;
  time: string;
}

const COACH_RESPONSES: Record<string, string> = {
  default: "I hear you! Based on your patterns, I'd suggest drinking a glass of water first and waiting 10 minutes before eating. Often what feels like hunger is actually thirst or an emotional trigger. 💚",
  night: "Late night cravings are real — and often tied to cortisol spikes from today's stress. Try herbal chamomile tea instead. Your body will thank you in the morning! 🌙",
  stress: "Stress eating is your body's way of seeking comfort. Before reaching for food, try 5 deep breaths. If you still want to eat after that, choose something nourishing. You've got this! 💪",
  craving: "Cravings typically peak at 3 minutes and then fade. Set a timer — if you still want it after, have a small portion mindfully. Deprivation leads to binging. 🔮",
  sugar: "Sugar cravings? Your body might need energy or serotonin. Try a small piece of dark chocolate (70%+), a handful of dates, or a banana. Much better than processed sweets! 🍫",
  help: "I'm Coach Byte, your AI food discipline coach! I can help with:\n• Understanding your eating patterns\n• Managing cravings and emotional eating\n• Healthy food alternatives\n• Mindful eating techniques\n\nWhat's on your mind today? 🌱",
  binge: "I notice you're concerned about overeating. First — no shame! It happens to everyone. Let's talk about what triggered it and create a plan for next time. You're not your habits; you're building new ones. 💙",
  weight: "Weight management is 80% about consistent habits, not extreme restrictions. Focus on eating slowly, stopping at 80% full, and logging with awareness. Small daily improvements lead to massive long-term change. 📈",
  monday: "Monday eating patterns are often reactive to Sunday stress. Try meal prepping Sunday evening so you start the week with healthy options already available! 🥘",
  breakfast: "Breakfast within 1 hour of waking regulates cortisol and reduces afternoon cravings. Even something small like a banana + nuts is much better than skipping. Try it for 7 days! 🌅"
};

function getCoachResponse(input: string, userName: string, score: number): string {
  const lower = input.toLowerCase();
  const hour = new Date().getHours();

  let base = '';
  if (lower.includes('night') || lower.includes('late') || hour > 21) base = COACH_RESPONSES.night;else
  if (lower.includes('stress') || lower.includes('anxious') || lower.includes('anxiety')) base = COACH_RESPONSES.stress;else
  if (lower.includes('craving') || lower.includes('urge')) base = COACH_RESPONSES.craving;else
  if (lower.includes('sugar') || lower.includes('sweet') || lower.includes('chocolate')) base = COACH_RESPONSES.sugar;else
  if (lower.includes('help') || lower.includes('what can you')) base = COACH_RESPONSES.help;else
  if (lower.includes('binge') || lower.includes('overeating') || lower.includes('overate')) base = COACH_RESPONSES.binge;else
  if (lower.includes('weight') || lower.includes('fat') || lower.includes('lose')) base = COACH_RESPONSES.weight;else
  if (lower.includes('monday') || lower.includes('week')) base = COACH_RESPONSES.monday;else
  if (lower.includes('breakfast') || lower.includes('morning')) base = COACH_RESPONSES.breakfast;else
  base = COACH_RESPONSES.default;

  const prefix = score > 70 ? `Great work, ${userName}! 🌟 ` : score < 40 ? `No worries, ${userName} — progress, not perfection. ` : '';
  return prefix + base;
}

const NUDGE_TYPES = [
{ type: 'time', icon: '⏰', label: 'Meal Time Nudge' },
{ type: 'hydration', icon: '💧', label: 'Hydration Reminder' },
{ type: 'craving', icon: '🔮', label: 'Craving Alert' },
{ type: 'streak', icon: '🔥', label: 'Streak Motivation' },
{ type: 'general', icon: '💡', label: 'Mindful Tip' }];


const SAMPLE_NUDGES = [
"⏰ It's been 4+ hours since your last meal. Are you hungry or just habitual? Check in with your body first.",
"💧 Hydration check! Your brain is 73% water. Drink a glass before your next meal.",
"🔮 Based on your patterns, you may experience cravings in the next hour. Prepare a healthy snack now!",
"🔥 5-day streak alert! You've been logging consistently. Today's choices matter even more.",
"💡 Eating at the same times daily regulates your hunger hormones. Your body loves routine!",
"🧘 Before your next meal, take 3 deep breaths. Mindful eating starts before the first bite.",
"🌙 Late night eating? Studies show meals 3+ hours before bed improve sleep quality.",
"🥗 Your emotional eating score improved by 15% this week. You're building awareness!"];


export const CoachPage: React.FC = () => {
  const { user } = useAuth();
  const { nudges, addNudge, respondToNudge, markNudgeRead, getKolkataTimeString } = useApp();
  const [messages, setMessages] = useState<Message[]>([
  {
    id: '1', role: 'coach',
    content: `Hey ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm Coach Byte, your personal food discipline AI. I'm here to help you build conscious eating habits — not with shame, but with science and compassion.\n\nHow are you feeling today? What's on your mind?`,
    time: getKolkataTimeString()
  }]
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'nudges'>('chat');
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('mindbite_notif') === 'true');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const enableNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotifEnabled(true);
        localStorage.setItem('mindbite_notif', 'true');
        new Notification('MindBite 🌱', {
          body: 'Notifications enabled! Coach Byte will nudge you mindfully.',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const sendNudge = (type: string, label: string) => {
    const randomMsg = SAMPLE_NUDGES[Math.floor(Math.random() * SAMPLE_NUDGES.length)];
    addNudge({
      type: type as 'time' | 'hydration' | 'craving' | 'streak' | 'general',
      message: randomMsg,
      deliveredAt: new Date().toISOString(),
      read: false
    });
    // If browser notifications enabled, show one
    if (notifEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`MindBite — ${label}`, { body: randomMsg, icon: '/favicon.ico' });
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: `m_${Date.now()}`, role: 'user',
      content: input,
      time: getKolkataTimeString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const delay = 1000 + Math.random() * 1000;
    await new Promise((r) => setTimeout(r, delay));

    const response = getCoachResponse(input, user?.name?.split(' ')[0] || 'Friend', user?.disciplineScore || 50);
    setMessages((prev) => [...prev, {
      id: `c_${Date.now()}`, role: 'coach',
      content: response,
      time: getKolkataTimeString()
    }]);
    setIsTyping(false);
  };

  const unreadNudges = nudges.filter((n) => !n.read);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero px-5 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
              <Bot size={22} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-primary-foreground">Coach Byte</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-primary-foreground/70 text-xs">AI Coach • Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setNotifEnabled(!notifEnabled)}
            className="p-2 bg-primary-foreground/20 rounded-xl hover:bg-primary-foreground/30 transition-all"
            title={notifEnabled ? 'Disable notifications' : 'Enable notifications'}>

            {notifEnabled ? <Bell size={18} className="text-primary-foreground" /> : <BellOff size={18} className="text-primary-foreground" />}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-primary-foreground/15 rounded-xl p-1 mt-3">
          <button onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'chat' ? 'bg-primary-foreground text-primary' : 'text-primary-foreground/80'}`}>
            💬 Chat
          </button>
          <button onClick={() => setActiveTab('nudges')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all relative ${activeTab === 'nudges' ? 'bg-primary-foreground text-primary' : 'text-primary-foreground/80'}`}>
            🔔 Nudges
            {unreadNudges.length > 0 &&
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-[9px] font-bold text-accent-foreground flex items-center justify-center">
                {unreadNudges.length}
              </span>
            }
          </button>
        </div>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' &&
      <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-4 scrollbar-none">
            {messages.map((msg) =>
          <div key={msg.id} className={`flex gap-2.5 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'coach' &&
            <div className="w-8 h-8 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles size={14} className="text-primary" />
                  </div>
            }
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
              msg.role === 'user' ?
              'gradient-hero text-primary-foreground rounded-tr-sm' :
              'bg-card shadow-sm text-foreground rounded-tl-sm'}`
              }>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">{msg.time.split(',')[1]?.trim() || ''}</span>
                </div>
              </div>
          )}

            {isTyping &&
          <div className="flex gap-2.5 animate-slide-up">
                <div className="w-8 h-8 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-primary" />
                </div>
                <div className="bg-card shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) =>
              <div key={i} className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
              )}
                </div>
              </div>
          }
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
            {["Why do I eat at night? 🌙", "Sugar craving help 🍬", "I ate emotionally 😔", "Healthy alternatives 🥗"].map((q) =>
          <button key={q} onClick={() => {setInput(q);}}
          className="flex-shrink-0 bg-primary-light text-primary rounded-xl text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-all px-[2px] py-[2px]">
                {q}
              </button>
          )}
          </div>

          {/* Input */}
          <div className="px-4 pb-safe pt-2 flex-shrink-0 border-t border-border bg-card">
            <div className="flex gap-2 items-end">
              <textarea
              rows={1}
              placeholder="Ask Coach Byte anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault();sendMessage();}}}
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none min-h-[44px] max-h-24" />

              <button onClick={sendMessage} disabled={!input.trim() || isTyping}
            className="w-11 h-11 gradient-hero text-primary-foreground rounded-xl flex items-center justify-center shadow-primary hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex-shrink-0">
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      }

      {/* Nudges Tab */}
      {activeTab === 'nudges' &&
      <div className="flex-1 overflow-y-auto pb-24 scrollbar-none">
          {/* Notification enable */}
          {!notifEnabled &&
        <div className="mx-4 mt-4 bg-amber-light border border-amber rounded-2xl p-4">
              <p className="text-sm font-semibold text-amber-DEFAULT mb-1">🔔 Enable Push Notifications</p>
              <p className="text-xs text-muted-foreground mb-3">Get real-time nudges from Coach Byte. Max 3/day — never spammy.</p>
              <button onClick={enableNotifications}
          className="px-4 py-2 bg-amber text-amber-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-all">
                Enable Notifications
              </button>
            </div>
        }

          {/* Trigger nudges */}
          <div className="px-4 mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Send a Nudge</p>
            <div className="grid grid-cols-2 gap-2">
              {NUDGE_TYPES.map((n) =>
            <button key={n.type} onClick={() => sendNudge(n.type, n.label)}
            className="bg-card shadow-sm rounded-xl p-3 text-left hover:shadow-md active:scale-95 transition-all">
                  <span className="text-lg">{n.icon}</span>
                  <p className="text-xs font-semibold text-foreground mt-1">{n.label}</p>
                </button>
            )}
            </div>
          </div>

          {/* Nudge list */}
          <div className="px-4 mt-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Nudges</p>
            {nudges.length === 0 &&
          <div className="text-center py-8 text-muted-foreground text-sm">No nudges yet! Try sending one above.</div>
          }
            {nudges.map((nudge) =>
          <div key={nudge.id} className={`bg-card rounded-xl shadow-sm p-4 border-l-4 transition-all ${
          nudge.read ? 'border-border opacity-70' : 'border-primary'}`
          }>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground leading-relaxed flex-1">{nudge.message}</p>
                  {!nudge.read &&
              <button onClick={() => markNudgeRead(nudge.id)}
              className="w-6 h-6 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <X size={12} className="text-muted-foreground" />
                    </button>
              }
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(nudge.deliveredAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST
                  </span>
                  {!nudge.response &&
              <div className="flex gap-1.5">
                      <button onClick={() => respondToNudge(nudge.id, 'accepted')}
                className="px-2.5 py-1 bg-primary-light text-primary rounded-lg text-[10px] font-bold hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1">
                        <Check size={10} /> Accept
                      </button>
                      <button onClick={() => respondToNudge(nudge.id, 'dismissed')}
                className="px-2.5 py-1 bg-muted text-muted-foreground rounded-lg text-[10px] font-bold hover:bg-border transition-all">
                        Skip
                      </button>
                    </div>
              }
                  {nudge.response &&
              <span className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold ${
              nudge.response === 'accepted' ? 'bg-primary-light text-primary' : 'bg-muted text-muted-foreground'}`
              }>
                      {nudge.response === 'accepted' ? '✓ Accepted' : 'Skipped'}
                    </span>
              }
                </div>
              </div>
          )}
          </div>
        </div>
      }
    </div>);

};