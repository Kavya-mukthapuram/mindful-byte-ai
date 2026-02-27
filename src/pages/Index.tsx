import { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { AuthPage } from '@/pages/AuthPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FoodLogPage } from '@/pages/FoodLogPage';
import { CoachPage } from '@/pages/CoachPage';
import { InsightsPage } from '@/pages/InsightsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { BottomNav } from '@/components/BottomNav';

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center shadow-primary animate-pulse">
          <span className="text-3xl">🌱</span>
        </div>
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" style={{ borderWidth: '3px' }} />
        <p className="text-muted-foreground text-sm font-medium">Loading MindBite...</p>
      </div>
    );
  }

  if (!user) return <AuthPage onSuccess={() => {}} />;
  if (!user.onboardingComplete) return <OnboardingPage onComplete={() => {}} />;

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto relative">
      {page === 'dashboard' && <DashboardPage onNavigate={setPage} />}
      {page === 'log' && <FoodLogPage />}
      {page === 'coach' && <CoachPage />}
      {page === 'insights' && <InsightsPage />}
      {page === 'profile' && <ProfilePage onNavigate={setPage} />}
      <BottomNav active={page} onNavigate={setPage} />
    </div>
  );
};

const Index = () => (
  <AuthProvider>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </AuthProvider>
);

export default Index;
