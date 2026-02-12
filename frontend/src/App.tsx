import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { TournamentResults } from './components/screens/TournamentResults';
import { Achievements } from './components/screens/Achievements';
import { LevelUp } from './components/screens/LevelUp';
import { WithdrawalConfirmation } from './components/screens/WithdrawalConfirmation';
import { WithdrawalSuccess } from './components/screens/WithdrawalSuccess';
import { Support } from './components/screens/Support';
import { BugReport } from './components/screens/BugReport';
import { WaitingLobby } from './components/screens/WaitingLobby';
import { PurchaseConfirmation } from './components/screens/PurchaseConfirmation';
import { AdFreeUpsell } from './components/screens/AdFreeUpsell';

function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
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

        if (tg.initDataUnsafe?.user?.id) {
          useAppStore.getState().setUser({
            telegramId: tg.initDataUnsafe.user.id.toString(),
            username: tg.initDataUnsafe.user.username || 'Anon_Player',
            firstName: tg.initDataUnsafe.user.first_name
          });
        }
      }
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
    <Router>
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
        <Route path="/tournament-results" element={<TournamentResults />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/level-up" element={<LevelUp />} />
        <Route path="/withdrawal" element={<WithdrawalConfirmation />} />
        <Route path="/withdrawal-success" element={<WithdrawalSuccess />} />
        <Route path="/support" element={<Support />} />
        <Route path="/bug-report" element={<BugReport />} />
        <Route path="/waiting-lobby" element={<WaitingLobby />} />
        <Route path="/purchase-confirmation" element={<PurchaseConfirmation />} />
        <Route path="/ad-free" element={<AdFreeUpsell />} />
      </Routes>
    </Router>
  );
}

export default App;
