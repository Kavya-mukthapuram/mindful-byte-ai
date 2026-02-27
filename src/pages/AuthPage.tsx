import { useState } from 'react';
import { Eye, EyeOff, Leaf, ArrowRight, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, signup, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    if (mode === 'signup' && !form.name) { setError('Please enter your name'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    let ok = false;
    if (mode === 'login') {
      ok = await login(form.email, form.password);
      if (!ok) setError('Invalid email or password. Try signing up!');
    } else {
      ok = await signup(form.name, form.email, form.password);
    }
    if (ok) onSuccess();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 animate-slide-up">
        <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center shadow-primary mb-3">
          <Leaf className="text-primary-foreground" size={28} />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">MindBite</h1>
        <p className="text-muted-foreground text-sm mt-1">Conscious eating, powered by AI</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-card p-6 animate-slide-up stagger-1">
        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          {(['login', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === m
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-hero text-primary-foreground font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-primary hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Log In' : 'Create Account'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {mode === 'login' && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Don't have an account?{' '}
            <button onClick={() => setMode('signup')} className="text-primary font-semibold hover:underline">
              Sign up free
            </button>
          </p>
        )}
      </div>

      {/* Features preview */}
      <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-sm animate-slide-up stagger-2">
        {[
          { emoji: '🧠', text: 'AI Coach' },
          { emoji: '🔮', text: 'Craving Prediction' },
          { emoji: '🏆', text: 'Gamified' },
        ].map(f => (
          <div key={f.text} className="bg-card rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl mb-1">{f.emoji}</div>
            <p className="text-xs text-muted-foreground font-medium">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
