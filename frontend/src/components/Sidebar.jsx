import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Menu, 
  Home, 
  ScanSearch, 
  FileText, 
  Settings, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const navItems = [
    { icon: <Home size={20} />, text: 'Home', path: '/dashboard/home' },
    { icon: <ScanSearch size={20} />, text: 'Scan System', path: '/dashboard/scan' },
    { icon: <FileText size={20} />, text: 'Reports', path: '/dashboard/reports' },
    { icon: <Settings size={20} />, text: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <aside style={{
      width: isCollapsed ? '80px' : '260px',
      backgroundColor: 'var(--bg-dark)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 15px',
      transition: 'width 0.3s ease',
      height: '100%'
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={24} color="#FFFFFF" strokeWidth={2} />
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', letterSpacing: '1px' }}>
              XENON
            </span>
          </div>
        )}
        <button onClick={toggleSidebar} style={{ padding: '5px' }}>
          <Menu size={24} color="#94A3B8" />
        </button>
      </div>

      {/* Profile Section */}
      {!isCollapsed && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          padding: '25px 15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '65px',
            height: '65px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-dark)',
            border: '2px solid var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            {user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : '--'}
          </div>
          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
            {user ? `${user.first_name} ${user.last_name}` : 'Loading...'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
              color: isActive ? 'white' : 'var(--text-sub)',
              fontWeight: isActive ? 'bold' : 'normal',
              justifyContent: isCollapsed ? 'center' : 'flex-start'
            })}
          >
            <div style={{ color: 'inherit' }}>{item.icon}</div>
            {!isCollapsed && <span>{item.text}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={{ height: '1px', backgroundColor: '#2D3748', margin: '10px 0' }} />

      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          padding: '15px',
          borderRadius: '8px',
          color: 'var(--text-sub)',
          justifyContent: isCollapsed ? 'center' : 'flex-start'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.backgroundColor = 'var(--bg-card)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-sub)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <LogOut size={20} />
        {!isCollapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}
