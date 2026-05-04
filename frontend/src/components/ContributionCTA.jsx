import { useState } from 'react';

export default function ContributionCTA() {
  const [location, setLocation] = useState('');
  const [report, setReport] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');

    try {
      const res = await fetch('http://localhost:8000/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, report })
      });
      if (res.ok) {
        setStatus('Report submitted successfully!');
        setLocation('');
        setReport('');
      } else {
        setStatus('Failed to submit report.');
      }
    } catch (error) {
      console.error(error);
      setStatus('Error connecting to server.');
    }
  };

  return (
    <div className="contribution-cta">
      <h3>Contribute Weather Report</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Location:</label>
          <input 
            type="text" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            required 
            placeholder="e.g. New York, NY"
          />
        </div>
        <div className="form-group">
          <label>Weather Report:</label>
          <textarea 
            value={report} 
            onChange={(e) => setReport(e.target.value)} 
            required 
            placeholder="What's the weather like right now?"
          />
        </div>
        <button type="submit">Submit Report</button>
      </form>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
}
