import React from 'react';
import './WeatherReport.css';

const WeatherReport = () => {
  return (
    <div className="weather-report">
      <h1>Laporkan Cuaca Sekarang</h1>
      <p>Bantu warga lain dengan info cuaca nyata!</p>

      <div className="steps">
        <div className="step">
          <h2>Langkah 1: Lokasi</h2>
          <div className="location">
            <img src="/path/to/map-image" alt="Map" className="map" />
            <p>Sleman, Yogyakarta</p>
            <button className="location-button">Gunakan Lokasi Saya</button>
          </div>
        </div>

        <div className="step">
          <h2>Langkah 2: Kondisi</h2>
          <div className="conditions">
            <button className="condition sunny">Cerah</button>
            <button className="condition cloudy">Berawan</button>
            <button className="condition rain active">Hujan</button>
            <button className="condition storm">Badai</button>
            <button className="condition fog">Kabut</button>
            <button className="condition windy">Berangin</button>
          </div>
          <div className="rain-intensity">
            <p>Intensitas Hujan:</p>
            <button className="intensity light">Gerimis</button>
            <button className="intensity medium active">Sedang</button>
            <button className="intensity heavy">Deras</button>
          </div>
          <div className="temperature">
            <p>Suhu:</p>
            <button className="temp-button">-</button>
            <span className="temp-value">28°C</span>
            <button className="temp-button">+</button>
          </div>
        </div>
      </div>

      <button className="submit-button">KIRIM LAPORAN</button>

      <nav className="bottom-nav">
        <button className="nav-button">Beranda</button>
        <button className="nav-button">Tanya AI</button>
        <button className="nav-button active">Laporan</button>
        <button className="nav-button">Data</button>
        <button className="nav-button">Profil</button>
      </nav>
    </div>
  );
};

export default WeatherReport;