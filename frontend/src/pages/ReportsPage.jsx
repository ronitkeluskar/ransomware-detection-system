/* eslint-disable no-unused-vars */
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { FileText, Download, AlertTriangle, TrendingUp, TrendingDown, ShieldCheck, Shield } from 'lucide-react';

const ReportItem = ({ title, date, tag, tagColor = '#3B82F6', onDownload }) => (
  <div style={{
    backgroundColor: 'var(--bg-card)',
    borderRadius: '12px',
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    minHeight: '80px'
  }}>
    <div style={{ color: 'var(--text-sub)' }}>
      <FileText size={24} />
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: 'var(--text-sub)', fontSize: '12px' }}>{date}</span>
        <span style={{ color: tagColor, fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{tag}</span>
      </div>
    </div>
    <button onClick={onDownload} style={{
      backgroundColor: 'var(--bg-lighter)',
      padding: '8px 16px',
      borderRadius: '8px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      border: '1px solid var(--border-light)',
      cursor: 'pointer'
    }}>
      <Download size={16} /> Download
    </button>
  </div>
);

const StatCard = ({ title, value, trend, trendColor, icon: Icon }) => (
  <div style={{
    backgroundColor: 'var(--bg-card)',
    padding: '20px',
    borderRadius: '12px',
    flex: 1,
    minWidth: '200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Icon color={trendColor} size={24} />
      <span style={{ color: trendColor, fontSize: '12px', fontWeight: 'bold' }}>{trend}</span>
    </div>
    <div>
      <div style={{ color: 'var(--text-sub)', fontSize: '13px', marginBottom: '5px' }}>{title}</div>
      <div style={{ color: 'white', fontSize: '26px', fontWeight: 'bold' }}>{value}</div>
    </div>
  </div>
);

const ThreatCategoryRow = ({ name, count, percentage, color }) => (
  <div style={{
    backgroundColor: 'var(--bg-card)',
    padding: '15px',
    borderRadius: '12px',
    flex: 1,
    minWidth: '250px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
      <span style={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '13px' }}>{name}</span>
      <span style={{ color, fontWeight: 'bold', fontSize: '13px' }}>{count}</span>
    </div>
    <div style={{ backgroundColor: '#334155', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ width: `${percentage}%`, backgroundColor: color, height: '100%', borderRadius: '4px' }} />
    </div>
    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '8px' }}>
      {percentage}% of total threats
    </div>
  </div>
);

import { useScan } from '../context/ScanContext';

export default function ReportsPage() {
  const { isScanning, progress, scanType, customPath, scannedFiles, threats, quarantined, lastScanTime, scanComplete, scansPerformed } = useScan();

  const downloadReport = (title, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadLiveReport = () => {
    const content = `XENON SECURITY SCAN REPORT
Date Generated: ${new Date().toLocaleString()}
Scan Type: ${scanType}
Target Path: ${scanType === 'Custom Scan' ? customPath : 'System Default'}

--- STATUS ---
State: ${isScanning ? 'IN PROGRESS (' + progress + '%)' : (scanComplete ? 'COMPLETED' : 'PENDING')}
Time Completed: ${lastScanTime ? lastScanTime.toLocaleString() : 'N/A'}

--- METRICS ---
Total Files Scanned: ${scannedFiles}
Threats Detected:    ${threats}
Threats Quarantined: ${quarantined}
System Cleanliness:  ${scannedFiles > 0 ? (((scannedFiles - threats) / scannedFiles) * 100).toFixed(2) : 100}%

--- SUMMARY ---
${threats === 0 ? "No threats detected. System is secure." : "ACTION REQUIRED: Threats were detected and isolated."}
`;
    downloadReport(`Xenon_${scanType}_Report`, content);
  };

  const downloadMockReport = (title, date) => {
    const content = `XENON HISTORICAL REPORT
Title: ${title}
Date Generated: ${date}

*** HISTORICAL DATA ARCHIVE ***
This is a comprehensive historical security report. 
(Note: Detailed historical logs are stored centrally and summarize long-term trends).

Threats Blocked: ~${Math.floor(Math.random() * 50) + 10}
Clean Systems: 99.4%
`;
    downloadReport(title, content);
  };

  const weeklyData = [
    { name: 'Mon', detected: 0, blocked: 0 },
    { name: 'Tue', detected: 0, blocked: 0 },
    { name: 'Wed', detected: 0, blocked: 0 },
    { name: 'Thu', detected: 0, blocked: 0 },
    { name: 'Fri', detected: 0, blocked: 0 },
    { name: 'Sat', detected: 0, blocked: 0 },
    { name: 'Sun', detected: threats, blocked: quarantined },
  ];

  const monthlyData = [
    { name: 'Jan', threats: 0 },
    { name: 'Feb', threats: 0 },
    { name: 'Mar', threats: 0 },
    { name: 'Apr', threats: threats },
    { name: 'May', threats: 0 },
    { name: 'Jun', threats: 0 },
  ];

  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'white', fontWeight: 'bold' }}>Security Reports</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginTop: '5px' }}>Detailed analytics and threat intelligence</p>
        </div>
        <button style={{
          backgroundColor: 'var(--bg-lighter)',
          padding: '12px 24px',
          borderRadius: '8px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: 'bold',
          border: '1px solid var(--border-light)'
        }}>
          <Download size={18} /> Export All Reports
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <StatCard title="Total Threats" value={threats.toLocaleString()} trend={threats > 0 ? "↗" : "-"} trendColor={threats > 0 ? "var(--danger)" : "var(--success)"} icon={AlertTriangle} />
        <StatCard title="Scans Performed" value={scansPerformed.toLocaleString()} trend={scansPerformed > 0 ? "↗" : "-"} trendColor="var(--info)" icon={TrendingUp} />
        <StatCard title="Threats Blocked" value={quarantined.toLocaleString()} trend={quarantined > 0 ? "↗" : "-"} trendColor="var(--warning)" icon={Shield} />
        <StatCard title="Clean Systems" value={scannedFiles > 0 ? (((scannedFiles - threats) / scannedFiles) * 100).toFixed(1) + "%" : "100%"} trend="-" trendColor="var(--success)" icon={ShieldCheck} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Weekly Bar Chart */}
        <div style={{ flex: 1, minWidth: '400px', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '20px' }}>Weekly Activity Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', border: 'none', borderRadius: '8px', color: 'white' }} />
              <Bar dataKey="detected" fill="var(--danger)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="blocked" fill="var(--info)" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Line Chart */}
        <div style={{ flex: 1, minWidth: '400px', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '20px' }}>Monthly Security Pulse</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', border: 'none', borderRadius: '8px', color: 'white' }} />
              <Line type="monotone" dataKey="threats" stroke="var(--success)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Reports */}
      <div>
        <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>📄 Recent Generated Reports</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(isScanning || scanComplete || scannedFiles > 0) && (
            <ReportItem 
              title={`Live Session: ${scanType}`} 
              date={isScanning ? `Scanning... ${progress}%` : (lastScanTime ? 'Completed ' + lastScanTime.toLocaleTimeString() : 'Ready')} 
              tag={isScanning ? "Active" : "Latest"} 
              tagColor={isScanning ? "#F97316" : "#10B981"} 
              onDownload={downloadLiveReport}
            />
          )}
          <ReportItem title="Weekly Security Report" date="Feb 28, 2026" tag="Weekly" tagColor="#3B82F6" onDownload={() => downloadMockReport("Weekly Security Report", "Feb 28, 2026")} />
          <ReportItem title="Threat Analysis - February" date="Feb 25, 2026" tag="Monthly" tagColor="#6366F1" onDownload={() => downloadMockReport("Threat Analysis - February", "Feb 25, 2026")} />
          <ReportItem title="System Vulnerability Assessment" date="Feb 20, 2026" tag="Custom" tagColor="#A855F7" onDownload={() => downloadMockReport("System Vulnerability Assessment", "Feb 20, 2026")} />
        </div>
      </div>

      {/* Threat Categories */}
      <div>
        <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>🛡️ Threat Distribution by Category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
          <ThreatCategoryRow name="Malware" count={threats} percentage={threats > 0 ? 100 : 0} color="var(--danger)" />
          <ThreatCategoryRow name="Ransomware" count={0} percentage={0} color="var(--warning)" />
          <ThreatCategoryRow name="Trojans" count={0} percentage={0} color="#FCD34D" />
          <ThreatCategoryRow name="Spyware" count={0} percentage={0} color="#A855F7" />
          <ThreatCategoryRow name="Adware" count={0} percentage={0} color="var(--info)" />
          <ThreatCategoryRow name="Other" count={0} percentage={0} color="var(--text-sub)" />
        </div>
      </div>

    </div>
  );
}
