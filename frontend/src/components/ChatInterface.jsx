import React from 'react';
import './ChatInterface.css';

const ChatInterface = () => {
  return (
    <div className="chat-interface">
      <header>
        <h1>Tanya ClimSight</h1>
        <p className="status">Online</p>
      </header>

      <div className="chat-box">
        <div className="chat-message user">Akan hujan hari ini?</div>
        <div className="chat-message bot">
          <p>Hujan 🌧️ akan mulai pukul 14.00 🕒. Pastikan jemuran sudah diangkat ya, Pak!</p>
        </div>
      </div>

      <div className="confirmation">
        <h2>Bantu Konfirmasi!</h2>
        <p>Bagaimana cuaca di lokasi Anda sekarang?</p>
        <div className="weather-options">
          <button className="weather-option sunny">Cerah</button>
          <button className="weather-option cloudy">Mendung</button>
          <button className="weather-option rain active">Hujan</button>
          <button className="weather-option storm">Badai</button>
        </div>
      </div>

      <div className="input-box">
        <input type="text" placeholder="Ketik atau tekan mic..." />
        <button className="send-button">Kirim</button>
      </div>

      <nav className="bottom-nav">
        <button className="nav-button">Beranda</button>
        <button className="nav-button active">Tanya AI</button>
        <button className="nav-button">Laporan</button>
        <button className="nav-button">Data</button>
        <button className="nav-button">Profil</button>
      </nav>
    </div>
  );
};

export default ChatInterface;
