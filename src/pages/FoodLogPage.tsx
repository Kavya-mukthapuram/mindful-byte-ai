import { useState, useRef } from 'react';
import { Camera, Mic, PenLine, X, Check, ChevronRight, MicOff, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

const EATING_REASONS = ['Hunger', 'Boredom', 'Stress', 'Social', 'Habit', 'Emotional'];
const PACE_OPTIONS = ['Rushed', 'Normal', 'Slow'];
const MOOD_OPTIONS = ['Great 😊', 'Okay 😐', 'Guilty 😔', 'Overfull 🤢'];

const FOOD_DB: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  'dal': { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  'roti': { calories: 71, protein: 2.7, carbs: 14, fat: 0.4 },
  'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'burger': { calories: 295, protein: 17, carbs: 24, fat: 14 },
  'salad': { calories: 65, protein: 3, carbs: 8, fat: 2 },
  'chai': { calories: 55, protein: 1.5, carbs: 8, fat: 1.5 },
  'idli': { calories: 39, protein: 2, carbs: 8, fat: 0.2 },
  'dosa': { calories: 133, protein: 3.7, carbs: 25, fat: 2 },
  'poha': { calories: 180, protein: 3, carbs: 35, fat: 3 },
  'egg': { calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  'milk': { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  'paneer': { calories: 265, protein: 18, carbs: 3.6, fat: 20 },
};

function estimateNutrition(items: string[]) {
  let cal = 0, pro = 0, carb = 0, fat = 0;
  items.forEach(item => {
    const key = item.toLowerCase().trim();
    const found = Object.keys(FOOD_DB).find(k => key.includes(k));
    if (found) {
      cal += FOOD_DB[found].calories;
      pro += FOOD_DB[found].protein;
      carb += FOOD_DB[found].carbs;
      fat += FOOD_DB[found].fat;
    } else {
      cal += 150; pro += 5; carb += 20; fat += 5;
    }
  });
  return { calories: Math.round(cal), protein: Math.round(pro), carbs: Math.round(carb), fat: Math.round(fat) };
}

export const FoodLogPage: React.FC = () => {
  const { user } = useAuth();
  const { addMealLog, getKolkataTime } = useApp();

  const [logMethod, setLogMethod] = useState<'photo' | 'voice' | 'manual' | null>(null);
  const [step, setStep] = useState<'method' | 'food' | 'questions' | 'done'>('method');
  const [foodItems, setFoodItems] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [answers, setAnswers] = useState({ reason: '', pace: '', mood: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startVoice = () => {
    const SpeechRecognition = (window as Window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition 
      || (window as Window & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser. Try Chrome.');
      return;
    }
    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = 'en-IN';
    recog.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setVoiceText(transcript);
    };
    recog.onend = () => {
      setIsRecording(false);
      // Parse food items from voice
      if (voiceText) {
        const parsed = voiceText
          .replace(/i (just |had |ate |)/, '')
          .split(/,| and /)
          .map(s => s.trim().replace(/[.!?]$/, ''))
          .filter(Boolean)
          .map(s => s.charAt(0).toUpperCase() + s.slice(1));
        setFoodItems(parsed);
      }
    };
    recog.start();
    recognitionRef.current = recog;
    setIsRecording(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    if (voiceText) {
      const parsed = voiceText
        .replace(/i (just |had |ate |)/i, '')
        .split(/,| and /i)
        .map(s => s.trim().replace(/[.!?]$/, ''))
        .filter(Boolean)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1));
      setFoodItems(parsed.length > 0 ? parsed : [voiceText]);
    }
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
      // Simulate AI recognition
      setTimeout(() => {
        const detected = ['Detected Food Item', 'Rice Bowl', 'Dal'];
        setFoodItems(detected);
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  const addManualItem = () => {
    if (!manualInput.trim()) return;
    setFoodItems(prev => [...prev, manualInput.trim()]);
    setManualInput('');
  };

  const removeItem = (i: number) => setFoodItems(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    const nutrition = estimateNutrition(foodItems);
    await new Promise(r => setTimeout(r, 800));
    addMealLog({
      userId: user.id,
      foodItems,
      ...nutrition,
      eatingReason: answers.reason,
      pace: answers.pace,
      moodAfter: answers.mood.replace(/ .+$/, ''),
      timestamp: getKolkataTime().toISOString(),
      imageUrl: photoPreview || undefined,
      method: logMethod!,
    });
    setIsSubmitting(false);
    setStep('done');
  };

  const reset = () => {
    setStep('method'); setLogMethod(null); setFoodItems([]);
    setPhotoPreview(null); setVoiceText(''); setAnswers({ reason: '', pace: '', mood: '' });
  };

  if (step === 'done') {
    const nutrition = estimateNutrition(foodItems);
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-bounce-in">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={36} className="text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Meal Logged! 🎉</h2>
          <p className="text-muted-foreground text-sm mb-4">Great job staying mindful</p>
          <div className="bg-card rounded-2xl shadow-card p-4 mb-4 text-left">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Nutrition Estimate</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Cal', value: nutrition.calories, color: 'accent' },
                { label: 'Prot', value: `${nutrition.protein}g`, color: 'primary' },
                { label: 'Carb', value: `${nutrition.carbs}g`, color: 'amber' },
                { label: 'Fat', value: `${nutrition.fat}g`, color: 'mood' },
              ].map(n => (
                <div key={n.label} className={`bg-${n.color}-light rounded-xl p-2 text-center`}>
                  <p className={`text-base font-display font-bold text-${n.color}`}>{n.value}</p>
                  <p className="text-[10px] text-muted-foreground">{n.label}</p>
                </div>
              ))}
            </div>
          </div>
          {answers.mood.includes('Guilty') && (
            <div className="bg-mood-light rounded-xl p-3 text-left mb-4">
              <p className="text-sm text-mood font-medium">💜 Coach Byte says: No guilt! Every meal is data, not a judgment. What you ate doesn't define you — your awareness does. 🌟</p>
            </div>
          )}
          <button onClick={reset} className="w-full gradient-hero text-primary-foreground font-semibold py-3.5 rounded-xl shadow-primary hover:opacity-90 transition-all">
            Log Another Meal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-5 pt-12 pb-5">
        <h1 className="text-xl font-display font-bold text-primary-foreground">Log Your Meal 🍽️</h1>
        <p className="text-primary-foreground/70 text-xs mt-1">Mindful logging = better insights</p>
      </div>

      <div className="px-5 py-5">

        {/* Method selection */}
        {step === 'method' && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="font-display font-bold text-foreground text-lg">How did you eat?</h2>
            <div className="grid gap-3">
              {[
                {
                  id: 'photo', icon: '📸', title: 'Snap a Photo',
                  desc: 'AI identifies your food from a photo',
                  badge: 'AI Powered', color: 'primary'
                },
                {
                  id: 'voice', icon: '🎙️', title: 'Voice Log',
                  desc: 'Just say what you ate — we\'ll parse it',
                  badge: 'Hands-free', color: 'accent'
                },
                {
                  id: 'manual', icon: '✏️', title: 'Manual Entry',
                  desc: 'Type in your food items manually',
                  badge: 'Classic', color: 'amber'
                },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => { setLogMethod(m.id as 'photo' | 'voice' | 'manual'); setStep('food'); }}
                  className="bg-card rounded-2xl shadow-card p-4 flex items-center gap-4 text-left hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                >
                  <div className={`w-12 h-12 bg-${m.color}-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
                    {m.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{m.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 bg-${m.color}-light text-${m.color} rounded-full font-semibold`}>
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Food entry */}
        {step === 'food' && (
          <div className="space-y-4 animate-slide-up">
            <button onClick={() => setStep('method')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back
            </button>

            {/* Photo method */}
            {logMethod === 'photo' && (
              <div className="space-y-4">
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                {!photoPreview ? (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-48 bg-muted rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary-light transition-all"
                  >
                    <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center">
                      <Camera size={24} className="text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">Take or Upload Photo</p>
                      <p className="text-xs text-muted-foreground mt-1">AI will identify your food</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs px-3 py-1 bg-primary-light text-primary rounded-lg font-medium flex items-center gap-1">
                        <Camera size={12} /> Camera
                      </span>
                      <span className="text-xs px-3 py-1 bg-muted text-muted-foreground rounded-lg font-medium flex items-center gap-1">
                        <Upload size={12} /> Gallery
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="relative">
                    <img src={photoPreview} alt="meal" className="w-full h-48 object-cover rounded-2xl" />
                    <button onClick={() => { setPhotoPreview(null); setFoodItems([]); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-foreground/80 rounded-full flex items-center justify-center">
                      <X size={14} className="text-background" />
                    </button>
                    {foodItems.length === 0 && (
                      <div className="absolute inset-0 bg-foreground/30 rounded-2xl flex items-center justify-center">
                        <div className="bg-card rounded-xl px-4 py-2 flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm font-medium">AI analyzing...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Voice method */}
            {logMethod === 'voice' && (
              <div className="space-y-4">
                <div className="bg-card rounded-2xl shadow-card p-6 text-center">
                  <button
                    onClick={isRecording ? stopVoice : startVoice}
                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-200 ${
                      isRecording
                        ? 'bg-destructive shadow-lg animate-pulse-ring'
                        : 'gradient-hero shadow-primary hover:scale-105'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff size={28} className="text-primary-foreground" />
                    ) : (
                      <Mic size={28} className="text-primary-foreground" />
                    )}
                  </button>
                  <p className="font-semibold text-foreground">
                    {isRecording ? '🔴 Recording... tap to stop' : 'Tap to start recording'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Say something like: "I just had dal rice and roti"
                  </p>
                  {voiceText && (
                    <div className="mt-3 bg-muted rounded-xl p-3 text-left">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Heard:</p>
                      <p className="text-sm text-foreground italic">"{voiceText}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Manual method */}
            {logMethod === 'manual' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Dal Tadka, Brown Rice..."
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addManualItem()}
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button onClick={addManualItem}
                    className="px-4 py-3 gradient-hero text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all">
                    Add
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Dal Rice', 'Roti Sabji', 'Poha', 'Idli Sambar', 'Salad', 'Chai'].map(s => (
                    <button key={s} onClick={() => setFoodItems(prev => [...prev, s])}
                      className="py-2 px-3 bg-muted text-muted-foreground rounded-xl text-xs font-medium hover:bg-primary-light hover:text-primary transition-all">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Food items list */}
            {foodItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Detected items ({foodItems.length})</p>
                {foodItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-primary-light rounded-xl px-3 py-2.5">
                    <span className="text-lg">🥗</span>
                    <span className="flex-1 text-sm font-medium text-foreground">{item}</span>
                    <button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {/* Nutrition preview */}
                <div className="bg-card rounded-xl p-3 shadow-sm">
                  <p className="text-xs text-muted-foreground font-medium mb-2">Estimated Nutrition</p>
                  {(() => {
                    const n = estimateNutrition(foodItems);
                    return (
                      <div className="grid grid-cols-4 gap-1.5 text-center">
                        {[
                          { label: 'Cal', val: n.calories },
                          { label: 'Prot', val: `${n.protein}g` },
                          { label: 'Carb', val: `${n.carbs}g` },
                          { label: 'Fat', val: `${n.fat}g` },
                        ].map(x => (
                          <div key={x.label} className="bg-muted rounded-lg py-1.5">
                            <p className="text-sm font-bold text-foreground">{x.val}</p>
                            <p className="text-[9px] text-muted-foreground">{x.label}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <button
                  onClick={() => setStep('questions')}
                  className="w-full gradient-hero text-primary-foreground font-semibold py-3.5 rounded-xl shadow-primary hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Continue to Mindful Check-in <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mindful Questions */}
        {step === 'questions' && (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-primary-light rounded-2xl p-4">
              <p className="text-primary font-semibold text-sm">🧘 Mindful Check-in</p>
              <p className="text-xs text-muted-foreground mt-1">3 quick questions to build awareness</p>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-3">Why did you eat?</p>
              <div className="grid grid-cols-3 gap-2">
                {EATING_REASONS.map(r => (
                  <button key={r} onClick={() => setAnswers(a => ({ ...a, reason: r }))}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      answers.reason === r ? 'bg-primary text-primary-foreground shadow-primary' : 'bg-muted text-muted-foreground hover:bg-primary-light hover:text-primary'
                    }`}>
                    {r === 'Hunger' ? '😋' : r === 'Boredom' ? '😑' : r === 'Stress' ? '😰' : r === 'Social' ? '👥' : r === 'Habit' ? '🔄' : '💔'} {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-3">How fast did you eat?</p>
              <div className="grid grid-cols-3 gap-2">
                {PACE_OPTIONS.map(p => (
                  <button key={p} onClick={() => setAnswers(a => ({ ...a, pace: p }))}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      answers.pace === p ? 'bg-primary text-primary-foreground shadow-primary' : 'bg-muted text-muted-foreground hover:bg-primary-light hover:text-primary'
                    }`}>
                    {p === 'Rushed' ? '⚡' : p === 'Normal' ? '👍' : '🐢'} {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-3">How do you feel now?</p>
              <div className="grid grid-cols-2 gap-2">
                {MOOD_OPTIONS.map(m => (
                  <button key={m} onClick={() => setAnswers(a => ({ ...a, mood: m }))}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      answers.mood === m ? 'bg-primary text-primary-foreground shadow-primary' : 'bg-muted text-muted-foreground hover:bg-primary-light hover:text-primary'
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!answers.reason || !answers.pace || !answers.mood || isSubmitting}
              className="w-full gradient-hero text-primary-foreground font-semibold py-3.5 rounded-xl shadow-primary hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <><Check size={16} /> Save Meal Log</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
