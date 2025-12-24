import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BranchesPage } from './pages/BranchesPage';
import { BranchDetailPage } from './pages/BranchDetailPage';
import { TemplatesPage } from './pages/TemplatesPage';

function App() {
  console.log('App with all pages rendering');
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<BranchesPage />} />
        <Route path="/branch/:id" element={<BranchDetailPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
      </Routes>
    </div>
  );
}

export default App;
