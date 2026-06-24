import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

const StatCard = ({ title, value, color, icon: Icon, trend }) => (
  <div style={{
    backgroundColor: 'var(--bg-card)',
    padding: '20px',
    borderRadius: '12px',
    flex: 1,
    minWidth: '200px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ color: 'var(--text-sub)', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}>
        {title}
      </div>
      {Icon ? (
        <div style={{ color }}>
          <Icon size={20} />
        </div>
      ) : trend ? (
        <span style={{ color, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          {trend}
        </span>
      ) : (
        <ArrowUpRight color={color} size={20} />
      )}
    </div>
    <div style={{
      fontSize: '32px',
      fontWeight: 'bold',
      color,
      marginTop: '10px'
    }}>
      {value}
    </div>
  </div>
);
import { useScan } from '../context/ScanContext';

export default function HomePage() {
  const { isScanning, progress, lastScanTime, scannedFiles, threats } = useScan();

  const getLastScanText = () => {
    if (isScanning) return `Scanning... ${progress}%`;
    if (!lastScanTime) return "Never";
    const diffMs = Date.now() - lastScanTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins === 0) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    return `${Math.floor(diffHrs / 24)} days ago`;
  };

  const lastScanColor = isScanning ? "#3B82F6" : "#10B981";

  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '25px', maxWidth: '1200px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '32px', color: 'white', marginBottom: '5px' }}>System Dashboard</h1>
        <p style={{ color: 'var(--text-sub)', fontSize: '16px' }}>Security Overview & Real-time Monitoring</p>
      </div>

      {/* Shield Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: '30px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: 'var(--bg-dark)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px'
        }}>
          <img src="/home_logo.png" alt="Shield Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', color: 'white', fontWeight: 'bold' }}>LOGO</span>
        </div>
        
        <div>
          <div style={{ color: 'var(--success)', fontSize: '24px', fontWeight: 'bold', marginBottom: '2px' }}>
            Shield-X Active
          </div>
          <div style={{ color: 'var(--text-sub)', fontSize: '14px' }}>
            Your system is currently protected against threats.
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <StatCard title="Last Scan" value={getLastScanText()} color={lastScanColor} trend={isScanning ? <ArrowUpRight size={20} /> : <ArrowRight size={20} />} />
        <StatCard title="Database" value="v1.0.4" color="#F97316" trend={<ArrowUpRight size={20} />} />
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <StatCard title="Total Threats" value={threats.toLocaleString()} color="#EF4444" trend={threats > 0 ? <ArrowUpRight size={20} /> : <ArrowRight size={20} />} />
        <StatCard title="Files Scanned" value={scannedFiles.toLocaleString()} color="#3B82F6" trend={scannedFiles > 0 ? <ArrowUpRight size={20} /> : <ArrowRight size={20} />} />
        <StatCard title="System Uptime" value="100%" color="#10B981" trend={<ArrowRight size={20} />} />
      </div>
    </div>
  );
}
