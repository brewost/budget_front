import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Nav from './components/nav/Nav'
import Jar from './components/jar/Jar';
import Stats from './components/stats/Stats';
import Ledger from './components/ledger/Ledger';
import LedgerForm from './components/ledger/LedgerForm'; 
import './App.css';

const HomePage = () => (
  <div>
    <Jar />
    <Stats />
    <Ledger />
  </div>
);


function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ledger-form" element={<LedgerForm />} />
        <Route path="/jar" element={<Jar />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/ledger" element={<Ledger />} />
      </Routes>
    </Router>
  );
}

export default App;
