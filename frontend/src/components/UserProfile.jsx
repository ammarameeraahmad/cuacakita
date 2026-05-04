import React from 'react';
import './UserProfile.css';

const UserProfile = () => {
  return (
    <div className="user-profile">
      <header>
        <h1>Pak Budi</h1>
        <p>Petani Cuaca Andal</p>
        <div className="profile-stats">
          <p>47 Total Laporan</p>
          <p>43 Diterima</p>
          <p>91% Akurasi</p>
          <p>#12 Peringkat Desa</p>
        </div>
      </header>

      <div className="achievements">
        <h2>Pencapaian</h2>
        <div className="achievement">Ahli Hujan</div>
        <div className="achievement">Cuaca Cerah</div>
      </div>

      <div className="leaderboard">
        <h2>Top Pelapor Minggu Ini - Desamu</h2>
        <ol>
          <li>Pak Budi - 47 Laporan</li>
          <li>Bu Siti - 42 Laporan</li>
          <li>Mas Agus - 38 Laporan</li>
        </ol>
      </div>

      <nav className="bottom-nav">
        <button className="nav-button">Beranda</button>
        <button className="nav-button">Tanya AI</button>
        <button className="nav-button">Laporan</button>
        <button className="nav-button">Data</button>
        <button className="nav-button active">Profil</button>
      </nav>
    </div>
  );
};

export default UserProfile;