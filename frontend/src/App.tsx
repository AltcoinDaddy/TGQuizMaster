import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { useTonAddress } from '@tonconnect/ui-react';
import { socket } from './utils/socket';
import { useState, useEffect } from 'react';
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
import { SportFi } from './components/screens/SportFi';
import { LuckySpin } from './components/screens/LuckySpin';
import { Gauntlet } from './components/screens/Gauntlet';

function WalletSyncer() {
  const userFriendlyAddress = useTonAddress();
  const { user } = useAppStore();

  useEffect(() => {
    if (user.telegramId && userFriendlyAddress) {
      // Sync if not connected OR if the address has changed
      if (!user.walletConnected || user.walletAddress !== userFriendlyAddress) {
        console.log('Syncing wallet address:', userFriendlyAddress);
        socket.emit('update_wallet', {
          telegramId: user.telegramId,
          walletAddress: userFriendlyAddress
        });
        // The backend will emit 'profile_synced' with all user data after updating the wallet.
        // The frontend's 'profile_synced' listener will handle updating the store.
        // No need to partially update here.
      }
    } else if (user.telegramId && !userFriendlyAddress && user.walletConnected) {
      // Handle disconnect
      useAppStore.getState().setUser({
        walletConnected: false,
        walletAddress: undefined
      });
    }
  }, [userFriendlyAddress, user.telegramId, user.walletConnected, user.walletAddress]);

  return null;
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);


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
            const testId = "123456789";
            socket.connect();
            socket.emit('sync_profile', { telegramId: testId, username: "@Dev_Test" });
          } else {
            console.error('No Telegram user data available in production');
            return; // Don't connect — user must open via Telegram
          }
        }
      } else {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.warn('[DEV] No Telegram WebApp script — using test fallback');
          const testId = "1215058702";
          socket.connect();
          socket.emit('sync_profile', { telegramId: testId, username: "Altcoindaddy" });
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
      <div className="flex items-center justify-center min-h-screen bg-[#102216]">
        <div className="animate-pulse text-primary font-black italic">LOADING...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <WalletSyncer />
        <NavigationController />
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
          <Route path="/sportfi" element={<SportFi />} />
          <Route path="/lucky-spin" element={<LuckySpin />} />
          <Route path="/gauntlet" element={<Gauntlet />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
