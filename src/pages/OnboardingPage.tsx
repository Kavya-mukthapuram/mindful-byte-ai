import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ARCHETYPES = [
  { id: 'emotional', emoji: '😢', title: 'Emotional Eater', desc: 'You eat more when stressed, sad, or anxious' },
  { id: 'binge', emoji: '🍔', title: 'Binge Eater', desc: 'Occasional episodes of eating large amounts quickly' },
  { id: 'snacker', emoji: '🍿', title: 'Mindless Snacker', desc: 'Frequent small snacks without noticing' },
  { id: 'skipper', emoji: '⏰', title: 'Meal Skipper', desc: 'Irregular meals, often skipping breakfast or lunch' },
  { id: 'disciplined', emoji: '✅', title: 'Disciplined Eater', desc: 'Mostly consistent, looking to optimize further' },
];

const GOALS = ['Lose Weight', 'Build Muscle', 'Manage Stress Eating', 'Improve Energy', 'Better Digestion', 'Mindful Eating'];
const DIETARY = ['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Gluten-Free', 'Dairy-Free', 'No Restrictions'];
const NUDGE_STYLES = [
  { id: 'gentle', emoji: '🌸', title: 'Gentle', desc: 'Soft, encouraging nudges' },
  { id: 'scientific', emoji: '🔬', title: 'Scientific', desc: 'Data-driven, research-backed tips' },
  { id: 'tough', emoji: '💪', title: 'Tough Love', desc: 'Direct, no-nonsense coaching' },
  { id: 'humorous', emoji: '😄', title: 'Humorous', desc: 'Light-hearted, fun reminders' },
];

interface OnboardingProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    age: 25,
    gender: 'prefer_not',
    goals: [] as string[],
    dietary: [] as string[],
    stressLevel: 5,
    sleepHours: 7,
    archetype: '',
    nudgeStyle: 'gentle',
  });

  const steps = [
    { title: 'Tell us about you', subtitle: 'Help us personalize your journey' },
    { title: 'Your health goals', subtitle: 'Select all that apply' },
    { title: 'Dietary preferences', subtitle: 'We\'ll suggest meals you\'ll enjoy' },
    { title: 'Your eating archetype', subtitle: 'No judgment — just awareness' },
    { title: 'Nudge style', subtitle: 'How should Coach Byte talk to you?' },
  ];

  const toggle = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const handleComplete = () => {
    const score = 30 + (data.archetype === 'disciplined' ? 20 : 0) +
      (data.goals.length * 5) + (10 - data.stressLevel) * 2 + (data.sleepHours - 5) * 2;
    updateUser({
      onboardingComplete: true,
      archetype: data.archetype,
      disciplineScore: Math.min(Math.max(score, 20), 70),
      profile: {
        age: data.age,
        gender: data.gender,
        goals: data.goals,
        dietary: data.dietary,
        stressLevel: data.stressLevel,
        sleepHours: data.sleepHours,
        nudgeStyle: data.nudgeStyle,
      },
    });
    onComplete();
  };

  const canNext = () => {
    if (step === 1 && data.goals.length === 0) return false;
    if (step === 3 && !data.archetype) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      {/* Progress */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? 'bg-primary' : 'bg-muted'
            }`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{step + 1} of {steps.length}</p>
      </div>

      <div className="flex-1 px-6 pb-32 overflow-y-auto">
        <div className="mb-6 animate-slide-up">
          <h2 className="text-2xl font-display font-bold text-foreground">{steps[step].title}</h2>
          <p className="text-muted-foreground text-sm mt-1">{steps[step].subtitle}</p>
        </div>

        {/* Step 0: Basic info */}
        {step === 0 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Age</label>
              <div className="flex items-center gap-4">
                <button onClick={() => setData(d => ({ ...d, age: Math.max(13, d.age - 1) }))}
                  className="w-10 h-10 rounded-xl bg-muted text-foreground font-bold text-lg hover:bg-primary-light hover:text-primary transition-all">−</button>
                <span className="text-3xl font-display font-bold text-primary flex-1 text-center">{data.age}</span>
                <button onClick={() => setData(d => ({ ...d, age: Math.min(99, d.age + 1) }))}
                  className="w-10 h-10 rounded-xl bg-muted text-foreground font-bold text-lg hover:bg-primary-light hover:text-primary transition-all">+</button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {[['male', '👨', 'Male'], ['female', '👩', 'Female'], ['nonbinary', '⚧', 'Non-binary'], ['prefer_not', '🤫', 'Prefer not to say']].map(([id, emoji, label]) => (
                  <button key={id} onClick={() => setData(d => ({ ...d, gender: id }))}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      data.gender === id ? 'border-primary bg-primary-light text-primary' : 'border-border bg-card text-foreground hover:border-primary/40'
                    }`}>
                    <span>{emoji}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Stress level: <span className="text-primary">{data.stressLevel}/10</span>
              </label>
              <input type="range" min={1} max={10} value={data.stressLevel}
                onChange={e => setData(d => ({ ...d, stressLevel: +e.target.value }))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Very relaxed</span><span>Extremely stressed</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Sleep hours: <span className="text-primary">{data.sleepHours}h/night</span>
              </label>
              <input type="range" min={4} max={12} step={0.5} value={data.sleepHours}
                onChange={e => setData(d => ({ ...d, sleepHours: +e.target.value }))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>4h</span><span>12h</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Goals */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3 animate-slide-up">
            {GOALS.map(goal => (
              <button key={goal} onClick={() => setData(d => ({ ...d, goals: toggle(d.goals, goal) }))}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 text-left ${
                  data.goals.includes(goal)
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/40'
                }`}>
                {data.goals.includes(goal) && <Check size={12} className="inline mr-1.5" />}
                {goal}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Dietary */}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-3 animate-slide-up">
            {DIETARY.map(diet => (
              <button key={diet} onClick={() => setData(d => ({ ...d, dietary: toggle(d.dietary, diet) }))}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                  data.dietary.includes(diet)
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/40'
                }`}>
                {data.dietary.includes(diet) && <Check size={12} className="inline mr-1.5" />}
                {diet}
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Archetype */}
        {step === 3 && (
          <div className="space-y-3 animate-slide-up">
            {ARCHETYPES.map(a => (
              <button key={a.id} onClick={() => setData(d => ({ ...d, archetype: a.id }))}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                  data.archetype === a.id
                    ? 'border-primary bg-primary-light'
                    : 'border-border bg-card hover:border-primary/40'
                }`}>
                <span className="text-3xl">{a.emoji}</span>
                <div>
                  <div className={`font-semibold text-sm ${data.archetype === a.id ? 'text-primary' : 'text-foreground'}`}>
                    {a.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
                </div>
                {data.archetype === a.id && (
                  <Check size={16} className="ml-auto text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Step 4: Nudge style */}
        {step === 4 && (
          <div className="grid grid-cols-2 gap-3 animate-slide-up">
            {NUDGE_STYLES.map(s => (
              <button key={s.id} onClick={() => setData(d => ({ ...d, nudgeStyle: s.id }))}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  data.nudgeStyle === s.id
                    ? 'border-primary bg-primary-light'
                    : 'border-border bg-card hover:border-primary/40'
                }`}>
                <div className="text-3xl mb-2">{s.emoji}</div>
                <div className={`font-semibold text-sm ${data.nudgeStyle === s.id ? 'text-primary' : 'text-foreground'}`}>
                  {s.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background/95 backdrop-blur border-t border-border px-6 py-4 pb-safe">
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-all">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <button
            onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : handleComplete()}
            disabled={!canNext()}
            className="flex-1 gradient-hero text-primary-foreground font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-primary hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {step < steps.length - 1 ? (
              <><span>Continue</span><ArrowRight size={16} /></>
            ) : (
              <><span>Start My Journey 🚀</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
