/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Search, Shield, Folder, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const CircularProgress = ({ value }) => {
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg height="100" width="100" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          stroke="var(--bg-dark)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="50"
          cy="50"
        />
        <circle
          stroke="var(--accent-primary)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease 0s' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx="50"
          cy="50"
        />
      </svg>
      <div style={{ position: 'absolute', fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
        {Math.round(value)}%
      </div>
    </div>
  );
};

const ScanOption = ({ icon: Icon, title, desc, timeText, selected, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      backgroundColor: selected ? 'var(--bg-lighter)' : 'var(--bg-card)',
      border: `2px solid ${selected ? 'var(--accent-primary)' : 'transparent'}`,
      borderRadius: '12px',
      padding: '20px',
      width: '220px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}
  >
    <div style={{ color: 'var(--accent-primary)' }}><Icon size={32} /></div>
    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{title}</div>
    <div style={{ color: 'var(--text-sub)', fontSize: '12px', flex: 1 }}>{desc}</div>
    <div style={{ color: 'var(--accent-primary)', fontSize: '11px', fontWeight: 'bold' }}>{timeText}</div>
  </div>
);

const MiniStat = ({ icon: Icon, title, value, color }) => (
  <div style={{
    backgroundColor: 'var(--bg-card)',
    borderRadius: '10px',
    padding: '15px',
    flex: 1,
    minWidth: '150px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
    <Icon color={color} size={24} />
    <div style={{ color: 'var(--text-sub)', fontSize: '12px' }}>{title}</div>
    <div style={{ color, fontSize: '20px', fontWeight: 'bold' }}>{value.toLocaleString()}</div>
  </div>
);

import { useScan } from '../context/ScanContext';
import { apiUrl } from '../apiBase';

export default function ScanPage() {
  const {
    scanType, setScanType,
    customPath, setCustomPath,
    isScanning,
    progress,
    scannedFiles,
    threats,
    quarantined,
    statusText, setStatusText,
    scanComplete,
    toggleScan
  } = useScan();

  const handleCustomScanClick = async () => {
    if (isScanning) return;
    setScanType('Custom Scan');
    setStatusText('Opening file explorer...');
    try {
      const response = await fetch(apiUrl('/api/scan/select-folder'));
      const data = await response.json();
      if (data.path) {
        setCustomPath(data.path);
        setStatusText(`Selected: ${data.path}. Ready to start scan.`);
      } else {
        setStatusText('Custom Scan canceled. No folder selected.');
      }
    } catch (error) {
      console.error(error);
      setStatusText('Error launching file explorer.');
    }
  };

  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '25px', maxWidth: '1200px' }}>
      <div>
        <h1 style={{ fontSize: '28px', color: 'white', fontWeight: 'bold' }}>System Scan</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>Comprehensive malware and threat detection</p>
      </div>

      {/* Scan Options */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <ScanOption 
          icon={Search} title="Quick Scan" desc="Scan critical areas" timeText="Fast"
          selected={scanType === 'Quick Scan'} onClick={() => { setScanType('Quick Scan'); setStatusText('Click start to begin quick scan'); }}
        />
        <ScanOption 
          icon={Shield} title="Full Scan" desc="Deep system scan" timeText="Thorough"
          selected={scanType === 'Full Scan'} onClick={() => { setScanType('Full Scan'); setStatusText('Click start to begin full scan'); }}
        />
        <ScanOption 
          icon={Folder} title="Custom Scan" desc="Select test folder" timeText="Varies"
          selected={scanType === 'Custom Scan'} onClick={handleCustomScanClick}
        />
      </div>



      {/* Scan Status */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        {(isScanning || progress > 0) && (
          <CircularProgress value={progress} />
        )}
        
        <div style={{ flex: 1 }}>
          <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
            {scanComplete ? 'Scan Completed' : isScanning ? `Running ${scanType}...` : 'Ready to Scan'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '5px', wordBreak: 'break-all' }}>
            {statusText}
          </div>
        </div>

        <button 
          onClick={toggleScan}
          style={{
            backgroundColor: isScanning ? 'var(--border-light)' : 'var(--accent-primary)',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '140px',
            justifyContent: 'center'
          }}
        >
          {isScanning ? '⏹ Stop Scan' : '▷ Start Scan'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <MiniStat icon={Search} title="Files Scanned" value={scannedFiles} color="var(--info)" />
        <MiniStat icon={AlertTriangle} title="Threats" value={threats} color="var(--danger)" />
        <MiniStat icon={ShieldCheck} title="Quarantined" value={quarantined} color="var(--warning)" />
        <MiniStat icon={CheckCircle} title="Clean" value={scannedFiles > 0 ? scannedFiles - threats : 0} color="var(--success)" />
      </div>
    </div>
  );
}

