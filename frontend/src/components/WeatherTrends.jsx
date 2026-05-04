import React from 'react';
import './WeatherTrends.css';

const WeatherTrends = () => {
  return (
    <div className="weather-trends">
      <header>
        <h1>Tren Cuaca Lokal</h1>
        <p>Desa Sukamaju, 12 Okt</p>
      </header>

      <div className="trend-tabs">
        <button className="tab active">7 Hari</button>
        <button className="tab">1 Bulan</button>
        <button className="tab">1 Tahun</button>
      </div>

      <div className="trend-charts">
        <div className="chart temperature">
          <h2>Suhu Harian</h2>
          <img src="/path/to/temperature-chart" alt="Temperature Chart" />
        </div>
        <div className="chart rainfall">
          <h2>Curah Hujan</h2>
          <img src="/path/to/rainfall-chart" alt="Rainfall Chart" />
        </div>
      </div>

      <div className="report-summary">
        <h2>128 Laporan Warga Hari Ini</h2>
        <p>Cakupan Wilayah: 85%</p>
        <button className="coverage-button">Wilayahmu Sudah Terlindungi</button>
      </div>

      <nav className="bottom-nav">
        <button className="nav-button">Beranda</button>
        <button className="nav-button">Tanya AI</button>
        <button className="nav-button">Laporan</button>
        <button className="nav-button active">Data</button>
        <button className="nav-button">Profil</button>
      </nav>
    </div>
  );
};

export default WeatherTrends;