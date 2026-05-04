import ChatInterface from './components/ChatInterface';
import ContributionCTA from './components/ContributionCTA';
import DashboardStats from './components/DashboardStats';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Weather Chat & Community Reports</h1>
      </header>
      
      <main className="app-main">
        <section className="left-panel">
          <DashboardStats />
          <ContributionCTA />
        </section>
        
        <section className="right-panel">
          <ChatInterface />
        </section>
      </main>
    </div>
  );
}

export default App;
