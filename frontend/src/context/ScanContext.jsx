import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { wsScanUrl } from '../apiBase';

const ScanContext = createContext(null);

export const useScan = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};

export const ScanProvider = ({ children }) => {
  const [scanType, setScanType] = useState('Quick Scan');
  const [customPath, setCustomPath] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scannedFiles, setScannedFiles] = useState(0);
  const [threats, setThreats] = useState(0);
  const [quarantined, setQuarantined] = useState(0);
  const [statusText, setStatusText] = useState('Click start to begin quick scan');
  const [scanComplete, setScanComplete] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [scansPerformed, setScansPerformed] = useState(0);

  const wsRef = useRef(null);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const toggleScan = () => {
    // If actively scanning, manually stop it
    if (isScanning || wsRef.current) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsScanning(false);
      setStatusText('Scan Stopped');
      return;
    } 
    
    // Otherwise, start a new scan
    setProgress(0);
    setScannedFiles(0);
    setThreats(0);
    setQuarantined(0);
    setScanComplete(false);
    setIsScanning(true);
    setStatusText(`Starting ${scanType}...`);

    const ws = new WebSocket(wsScanUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ 
        action: 'start', 
        scan_type: scanType,
        custom_path: customPath
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.progress !== undefined) setProgress(data.progress);
        if (data.scanned_files !== undefined) setScannedFiles(data.scanned_files);
        if (data.threats !== undefined) setThreats(data.threats);
        if (data.quarantined !== undefined) setQuarantined(data.quarantined);
        if (data.status) setStatusText(data.status);
        
        if (data.complete) {
          setIsScanning(false);
          setScanComplete(true);
          setLastScanTime(new Date());
          setScansPerformed(prev => prev + 1);
          wsRef.current = null;
        }
      } catch (error) {
        console.error('Error parsing websocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setStatusText('Error connecting to scan service.');
      setIsScanning(false);
    };

    ws.onclose = () => {
      setIsScanning(false);
      wsRef.current = null;
    };
  };

  const value = {
    scanType, setScanType,
    customPath, setCustomPath,
    isScanning,
    progress,
    scannedFiles,
    threats,
    quarantined,
    statusText, setStatusText,
    scanComplete,
    lastScanTime,
    scansPerformed,
    toggleScan
  };

  return (
    <ScanContext.Provider value={value}>
      {children}
    </ScanContext.Provider>
  );
};
