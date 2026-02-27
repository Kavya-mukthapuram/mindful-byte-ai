import { Home, UtensilsCrossed, MessageCircle, BarChart2, User } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface BottomNavProps {
  active: string;
  onNavigate: (page: string) => void;
}

const navItems = [
{ id: 'dashboard', icon: Home, label: 'Home' },
{ id: 'log', icon: UtensilsCrossed, label: 'Log' },
{ id: 'coach', icon: MessageCircle, label: 'Coach' },
{ id: 'insights', icon: BarChart2, label: 'Insights' },
{ id: 'profile', icon: User, label: 'Profile' }];


export const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate }) => {
  const { unreadNudges } = useApp();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border pb-safe z-50 px-0 my-[34px] mx-[45500px]">
      <div className="flex items-center justify-around pt-2 pb-3 px-[88px] py-px">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative ${
              isActive ?
              'text-primary' :
              'text-muted-foreground hover:text-foreground'}`
              }>

              <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${
              isActive ? 'bg-primary-light' : ''}`
              }>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {id === 'coach' && unreadNudges > 0 &&
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-[9px] font-bold text-accent-foreground flex items-center justify-center">
                    {unreadNudges > 9 ? '9+' : unreadNudges}
                  </span>
                }
              </div>
              <span className={`text-[10px] font-medium transition-all ${isActive ? 'font-semibold' : ''}`}>
                {label}
              </span>
              {isActive &&
              <div className="absolute -bottom-0.5 w-8 h-0.5 bg-primary rounded-full" />
              }
            </button>);

        })}
      </div>
    </nav>);

};