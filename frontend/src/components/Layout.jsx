import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ user, onLogout }) {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', backgroundColor: 'var(--bg-dark)' }}>
      <Sidebar user={user} onLogout={onLogout} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
