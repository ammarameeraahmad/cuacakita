import React from 'react';
import './WeatherForecast.css';

const WeatherForecast = () => {
  return (
    <div className="weather-forecast">
      <header>
        <h1>Desa Sukamaju, 12 Okt</h1>
        <p>Senin, 30 Maret 2024</p>
      </header>

      <div className="current-weather">
        <h2>28°C</h2>
        <p>Hujan Ringan</p>
        <div className="weather-details">
          <p>Kelembaban: 78%</p>
          <p>Angin: 12 km/h</p>
          <p>Jarak Pandang: 8 km</p>
        </div>
      </div>

      <div className="forecast">
        <h2>Prakiraan 5 Hari</h2>
        <div className="forecast-days">
          <div className="day">Sen: 28° 23°</div>
          <div className="day">Sel: 30° 24°</div>
          <div className="day">Rab: 32° 25°</div>
          <div className="day">Kam: 31° 24°</div>
        </div>
      </div>

      <div className="farming-tips">
        <h2>Rekomendasi</h2>
        <p>Hari ini cocok untuk menyiram tanaman pagi hari</p>
        <ul>
          <li>Tanam ✅</li>
          <li>Semprot ❌</li>
          <li>Bajak ✅</li>
        </ul>
      </div>

      <nav className="bottom-nav">
        <button className="nav-button active">Beranda</button>
        <button className="nav-button">Tanya AI</button>
        <button className="nav-button">Laporan</button>
        <button className="nav-button">Data</button>
        <button className="nav-button">Profil</button>
      </nav>
    </div>
  );
};

export default WeatherForecast;