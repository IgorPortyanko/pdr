import { useEffect } from 'react';
import { useRulesStore } from './store/rulesStore';
import { useProfileStore } from './store/profileStore';
import { useThemeStore } from './store/themeStore';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { RuleTable } from './components/RuleTable';
import { ChapterList } from './components/ChapterList';
import { SignsGrid } from './components/SignsGrid';
import { MarkingsGrid } from './components/MarkingsGrid';
import { QuizScreen } from './components/QuizScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { StatsScreen } from './components/StatsScreen';

function App() {
  const { activeCategoryId } = useRulesStore();
  const { activeProfileId } = useProfileStore();
  const { isDark } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  if (!activeProfileId) {
    return <ProfileScreen />;
  }

  const showChapters = activeCategoryId === 'all';
  const showSigns = ['signs', 'warning', 'priority', 'prohibit', 'mandate', 'info', 'service', 'tabl']
    .includes(activeCategoryId);
  const showMarkings = activeCategoryId === 'markings';
  const showQuiz = activeCategoryId === 'tasks';
  const showStats = activeCategoryId === 'stats';

  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-main">
        <Sidebar />
        {showStats
          ? <StatsScreen />
          : showChapters
            ? <ChapterList />
            : showSigns
              ? <SignsGrid />
              : showMarkings
                ? <MarkingsGrid />
                : showQuiz
                  ? <QuizScreen />
                  : <RuleTable />
        }
      </div>
      <MobileNav />
    </div>
  );
}

export default App;
