import { useState, useEffect } from 'react';

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load stats');
      }
    };

    fetchStats();
  }, []);

  if (error) return <div className="dashboard-stats error">{error}</div>;
  if (!stats) return <div className="dashboard-stats loading">Loading stats...</div>;

  return (
    <div className="dashboard-stats">
      <h3>System Stats</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Active Users</h4>
          <p>{stats.activeUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h4>Reports Today</h4>
          <p>{stats.reportsToday || 0}</p>
        </div>
        <div className="stat-card">
          <h4>Avg Temperature</h4>
          <p>{stats.avgTemperature || '--'}°</p>
        </div>
      </div>
    </div>
  );
}
