import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { socket } from './utils/socket';
import { useState, useEffect, useRef } from 'react';
import { Home } from './components/screens/Home';
import { QuizRoom } from './components/screens/QuizRoom';
import { useAppStore } from './store/useAppStore';
import { Onboarding } from './components/screens/Onboarding';
import { Leaderboard } from './components/screens/Leaderboard';
import { Referral } from './components/screens/Referral';
import { Profile } from './components/screens/Profile';
import { Shop } from './components/screens/Shop';
import { Quests } from './components/screens/Quests';
import { Tournaments } from './components/screens/Tournaments';
import { CreateTournament } from './components/screens/CreateTournament';
import { TournamentHistory } from './components/screens/TournamentHistory';
import { Achievements } from './components/screens/Achievements';
import { LevelUp } from './components/screens/LevelUp';
import { WithdrawalConfirmation } from './components/screens/WithdrawalConfirmation';
import { WithdrawalSuccess } from './components/screens/WithdrawalSuccess';
import { Support } from './components/screens/Support';
import { BugReport } from './components/screens/BugReport';
import { PurchaseConfirmation } from './components/screens/PurchaseConfirmation';
import { AdFreeUpsell } from './components/screens/AdFreeUpsell';
import { Settings } from './components/screens/Settings';
import { NavigationController } from './components/layout/NavigationController';
import { AdminDashboard } from './components/screens/AdminDashboard';
import { KnowledgeYield } from './components/screens/KnowledgeYield';
import { Squads } from './components/screens/Squads';
import { SquadDetail } from './components/screens/SquadDetail';
import { SquadCreate } from './components/screens/SquadCreate';
import { MegaTournament } from './components/screens/MegaTournament';
import { LuckySpin } from './components/screens/LuckySpin';



function DeepLinkHandler() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;
    const tg = (window as any).Telegram?.WebApp;
    if (!tg || !user.telegramId) return;

    const startParam = tg.initDataUnsafe?.start_param;
    if (startParam && startParam.startsWith('room_')) {
      console.log('[DEEP LINK] Navigating to room:', startParam);
      // Navigate to the quiz with the full param; QuizRoom logic handles parsing correctly
      navigate(`/quiz?roomId=${startParam}&type=tournament`, { replace: true });
      hasHandled.current = true;
    }
  }, [user.telegramId, navigate]);

  return null;
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  const connectDevUser = () => {
    const testId = import.meta.env.VITE_DEV_TELEGRAM_ID || "1215058702";
    const username = import.meta.env.VITE_DEV_USERNAME || "Altcoindaddy";
    useAppStore.getState().setUser({ telegramId: testId, username });
    socket.connect();
    socket.emit('sync_profile', { telegramId: testId, username });
  };

  useEffect(() => {
    // Ensure socket is available globally for legacy components
    (window as any).socket = socket;

    try {
      console.log('App initialization started');
      const completed = localStorage.getItem('onboarding_completed');
      setShowOnboarding(!completed);

      // Force dark mode
      document.documentElement.classList.add('dark');

      // Initialize Telegram
      const tg = (window as any).Telegram?.WebApp;

      if (tg) {
        tg.ready();
        tg.expand();

        const user = tg.initDataUnsafe?.user;
        console.log('Telegram User Data:', user);

        if (user?.id) {
          const telegramId = user.id.toString();
          const username = user.username || 'Anon_Player';

          useAppStore.getState().setUser({
            telegramId,
            username,
            firstName: user.first_name
          });

          // Connect Socket and Sync Profile
          console.log('Connecting socket and syncing profile for:', telegramId);
          socket.connect();
          socket.emit('sync_profile', { telegramId, username });
        } else {
          // No Telegram user object found
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.warn('[DEV] No Telegram user — using test fallback');
            connectDevUser();
          } else {
            console.error('No Telegram user data available in production');
            return; // Don't connect — user must open via Telegram
          }
        }
      } else {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.warn('[DEV] No Telegram WebApp script — using test fallback');
          connectDevUser();
        } else {
          console.error('Telegram WebApp not available in production');
          return;
        }
      }

      // Socket Listeners
      socket.on('profile_synced', (data) => {
        console.log('Profile synced with backend:', data);
        useAppStore.getState().syncFromBackend(data);
      });

      socket.on('balance_update', (data) => {
        console.log('Balance update received:', data);
        // Use syncFromBackend to handle partial updates safely without overwriting other fields with undefined
        useAppStore.getState().syncFromBackend(data);
      });

      // Re-sync on reconnection
      socket.on('connect', () => {
        console.log('Socket reconnected, refreshing profile...');
        const user = useAppStore.getState().user;
        if (user.telegramId) {
          socket.emit('sync_profile', { telegramId: user.telegramId, username: user.username });
        }
      });

      return () => {
        socket.off('profile_synced');
        socket.off('connect');
      };
    } catch (e) {
      console.error('App init error:', e);
      setShowOnboarding(false);
    }
  }, []);

  if (showOnboarding === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#102216]">
        <img src="/logo.png" className="w-24 h-24 mb-6 animate-pulse" alt="TQ Logo" />
        <div className="animate-pulse text-primary font-black italic tracking-widest text-xs">SYNCING SYSTEM...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <NavigationController />
        <DeepLinkHandler />
        <Routes>
          <Route path="/onboarding" element={<Onboarding onComplete={() => setShowOnboarding(false)} />} />
          <Route path="/" element={showOnboarding ? <Navigate to="/onboarding" /> : <Home />} />
          <Route path="/quiz" element={<QuizRoom />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/create-tournament" element={<CreateTournament />} />
          <Route path="/tournament-history" element={<TournamentHistory />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/level-up" element={<LevelUp />} />
          <Route path="/withdrawal" element={<WithdrawalConfirmation />} />
          <Route path="/withdrawal-success" element={<WithdrawalSuccess />} />
          <Route path="/support" element={<Support />} />
          <Route path="/bug-report" element={<BugReport />} />
          <Route path="/purchase-confirmation" element={<PurchaseConfirmation />} />
          <Route path="/ad-free" element={<AdFreeUpsell />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/yield" element={<KnowledgeYield />} />
          <Route path="/squads" element={<Squads />} />
          <Route path="/squad/:id" element={<SquadDetail />} />
          <Route path="/squad/create" element={<SquadCreate />} />
          <Route path="/mega-tournament" element={<MegaTournament />} />
          <Route path="/lucky-spin" element={<LuckySpin />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
