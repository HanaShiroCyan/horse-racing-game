import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SetupPage from '@/pages/SetupPage';
import GamePage from '@/pages/GamePage';
import ResultPage from '@/pages/ResultPage';
import CharacterGuide from '@/pages/CharacterGuide';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SetupPage />} />
        <Route path="/guide" element={<CharacterGuide />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </Router>
  );
}
