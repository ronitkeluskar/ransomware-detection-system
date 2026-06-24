/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Shield, Cloud, Globe, Monitor, Lock, RefreshCw } from 'lucide-react';

const AnimatedToggle = ({ initialChecked = true, onChange }) => {
  const [checked, setChecked] = useState(initialChecked);

  const toggle = () => {
    const newState = !checked;
    setChecked(newState);
    if (onChange) onChange(newState);
  };

  return (
    <div 
      onClick={toggle}
      style={{
        width: '45px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: checked ? 'var(--info)' : '#334155',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s ease'
      }}
    >
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: 'white',
        position: 'absolute',
        top: '3px',
        left: checked ? '24px' : '3px',
        transition: 'left 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </div>
  );
};

const SettingItem = ({ icon: Icon, title, desc, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        backgroundColor: `${color}1A`, // 10% opacity hex
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ color: 'white', fontSize: '15px', fontWeight: 'bold' }}>{title}</div>
        <div style={{ color: 'var(--text-sub)', fontSize: '12px', marginTop: '3px' }}>{desc}</div>
      </div>
    </div>
    <AnimatedToggle />
  </div>
);

export default function SettingsPage() {
  const [freq, setFreq] = useState(0);
  const [sens, setSens] = useState(50);

  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '800px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: 'white', fontWeight: 'bold' }}>Settings</h1>
        <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginTop: '5px' }}>Configure your security preferences</p>
      </div>

      {/* Protection Settings */}
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '25px', borderRadius: '12px' }}>
        <h2 style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Shield size={20} /> Protection Settings
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SettingItem icon={Shield} title="Real-time Protection" desc="Continuously monitor system for threats" color="#10B981" />
          <SettingItem icon={RefreshCw} title="Automatic Updates" desc="Keep threat database up to date" color="#3B82F6" />
          <SettingItem icon={Cloud} title="Cloud Protection" desc="Enhanced detection using cloud intelligence" color="#8B5CF6" />
          <SettingItem icon={Globe} title="Network Shield" desc="Block malicious network connections" color="#06B6D4" />
        </div>
      </div>

      {/* Scan Settings */}
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '25px', borderRadius: '12px' }}>
        <h2 style={{ color: 'var(--warning)', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Folder size={20} /> Scan Settings
        </h2>

        <SettingItem icon={Monitor} title="Automatic Scanning" desc="Schedule automatic system scans" color="#F59E0B" />

        <div style={{ padding: '15px 0' }}>
          <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '15px' }}>Scan Frequency</div>
          <input 
            type="range" 
            min="0" max="2" 
            value={freq} 
            onChange={(e) => setFreq(e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent-primary)', height: '4px', appearance: 'none', background: '#334155', borderRadius: '2px', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px', marginTop: '10px' }}>
            <span>Daily</span>
            <span>Weekly</span>
            <span>Monthly</span>
          </div>
        </div>

        <div style={{ padding: '15px 0' }}>
          <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '15px' }}>Threat Sensitivity</div>
          <input 
            type="range" 
            min="0" max="100" 
            value={sens} 
            onChange={(e) => setSens(e.target.value)}
            style={{ width: '100%', accentColor: 'var(--info)', height: '4px', appearance: 'none', background: '#334155', borderRadius: '2px', cursor: 'pointer' }}
          />
        </div>

        <SettingItem icon={Lock} title="Auto-Quarantine" desc="Automatically isolate detected threats" color="#F97316" />
      </div>

    </div>
  );
}

// Quick component shim for Folder icon inside SettingsPage
const Folder = ({ size, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
  </svg>
);
