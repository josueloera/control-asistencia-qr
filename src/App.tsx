import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  Users,
  Calendar as CalendarIcon,
  Award,
  RotateCw,
  Printer,
  Plus,
  Trash2,
  FileSpreadsheet,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  UserCheck,
  Search,
  Check,
  AlertCircle,
  HelpCircle,
  Download,
  Upload,
  Zap,
  Info,
  Image as ImageIcon,
  RefreshCw,
  FileText,
  Filter,
  Sliders,
  X,
  Key,
  ShieldCheck,
  Clock,
  Copy,
  MessageCircle
} from 'lucide-react';

// Calendar SEP Reference & Event Types
const CALENDAR_TYPES = {
  REGULAR: { label: 'Día Lectivo', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  CTE: { label: 'Consejo Técnico Escolar (CTE)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  HOLIDAY: { label: 'Suspensión de Labores / Festivo', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  VACATION: { label: 'Periodo Vacacional', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  DISCHARGE: { label: 'Descarga Administrativa', color: 'bg-purple-100 text-purple-800 border-purple-300' }
};

const INITIAL_STUDENTS = [
  { id: 'ALU-101', name: 'Mateo Hernández Gómez', number: 1, avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80', group: '3° A' },
  { id: 'ALU-102', name: 'Sofía Martínez López', number: 2, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', group: '3° A' },
  { id: 'ALU-103', name: 'Santiago Rodríguez Silva', number: 3, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', group: '3° A' },
  { id: 'ALU-104', name: 'Valentina García Pérez', number: 4, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', group: '3° A' },
  { id: 'ALU-105', name: 'Sebastián Morales Cruz', number: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', group: '3° A' },
  { id: 'ALU-106', name: 'Camila Flores Torres', number: 6, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', group: '3° A' },
  { id: 'ALU-107', name: 'Leonardo Castillo Ramírez', number: 7, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', group: '3° A' },
  { id: 'ALU-108', name: 'Isabella Sánchez Díaz', number: 8, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', group: '3° A' },
  { id: 'ALU-109', name: 'Diego Reyes Mendoza', number: 9, avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', group: '3° A' },
  { id: 'ALU-110', name: 'Lucía Ortiz Vargas', number: 10, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', group: '3° A' }
];

const INITIAL_SUBJECTS = ['Español', 'Matemáticas', 'Ciencias Naturales', 'Historia', 'Geografía', 'Formación Cívica y Ética', 'Artes', 'Educación Física', 'Inglés'];

const APP_SECRET_KEY = "QR_ASISTENCIA_TRABAJOS_2026_MASTER_SECRET_KEY";

const playBeep = (freq = 880, duration = 0.15) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.log('Audio Context restricted or not supported');
  }
};

const playFanfare = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + idx * 0.1);
      osc.stop(audioCtx.currentTime + idx * 0.1 + 0.3);
    });
  } catch (e) {}
};

// Generate deterministic Machine ID bound to this computer
const getMachineId = () => {
  let savedId = localStorage.getItem('sep_qr_machine_id');
  if (!savedId) {
    const randomHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
    savedId = `QR-${randomHex()}-${randomHex()}`;
    localStorage.setItem('sep_qr_machine_id', savedId);
  }
  return savedId;
};

// Compute valid license key from Machine ID using SHA-256 HMAC formula
const computeValidKey = async (machineId: string) => {
  const cleanMachineId = machineId.replace(/-/g, "").toUpperCase();
  const rawString = `${cleanMachineId}_${APP_SECRET_KEY}`;
  const msgBuffer = new TextEncoder().encode(rawString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  const serial = hashHex.substring(0, 16);
  return `${serial.substring(0,4)}-${serial.substring(4,8)}-${serial.substring(8,12)}-${serial.substring(12,16)}`;
};

export default function App() {
  // Licensing & 7-Day Trial State
  const [machineId] = useState(getMachineId);
  const [isActivated, setIsActivated] = useState(() => {
    return localStorage.getItem('sep_qr_license_activated') === 'true';
  });
  const [trialStartDate] = useState<number>(() => {
    const saved = localStorage.getItem('sep_qr_trial_start_date');
    if (saved) return parseInt(saved, 10);
    const now = Date.now();
    localStorage.setItem('sep_qr_trial_start_date', now.toString());
    return now;
  });

  const trialDaysRemaining = useMemo(() => {
    if (isActivated) return 7;
    const elapsedMs = Date.now() - trialStartDate;
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - elapsedDays);
  }, [trialStartDate, isActivated]);

  const [showLicenseModal, setShowLicenseModal] = useState(() => {
    // Show modal on start if not activated
    return !localStorage.getItem('sep_qr_license_activated');
  });
  const [showPairingModal, setShowPairingModal] = useState(false);

  const [licenseInputKey, setLicenseInputKey] = useState('');
  const [licenseError, setLicenseError] = useState('');
  const [licenseSuccess, setLicenseSuccess] = useState('');

  // App Navigation Tabs
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner', 'gafetes', 'asistencia', 'trabajos', 'ruleta', 'alumnos'
  
  // Data States
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('sep_qr_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [subjects, setSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem('sep_qr_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Attendance Records
  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('sep_qr_attendance');
    const today = new Date().toISOString().split('T')[0];
    return saved ? JSON.parse(saved) : {
      [today]: ['ALU-101', 'ALU-102', 'ALU-104', 'ALU-106', 'ALU-108']
    };
  });

  // Assignments / Daily Work Tasks
  const [assignments, setAssignments] = useState<any[]>(() => {
    const saved = localStorage.getItem('sep_qr_assignments');
    const today = new Date().toISOString().split('T')[0];
    return saved ? JSON.parse(saved) : [
      { id: 'ASG-1', date: today, title: 'Resumen Libro de Texto', subject: 'Español' },
      { id: 'ASG-2', date: today, title: 'Fracciones Equivalentes', subject: 'Matemáticas' }
    ];
  });

  // Submissions
  const [submissions, setSubmissions] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('sep_qr_submissions');
    return saved ? JSON.parse(saved) : {
      'ASG-1': ['ALU-101', 'ALU-102']
    };
  });

  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [modalNewSubject, setModalNewSubject] = useState('');
  const [subjectPendingDelete, setSubjectPendingDelete] = useState<{ name: string; count: number } | null>(null);

  // Scanner state
  const [scanMode, setScanMode] = useState('attendance'); // 'attendance' or 'work'
  const [scannerActive, setScannerActive] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<any>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  // Roulette State
  const [spinning, setSpinning] = useState(false);
  const [winnerStudent, setWinnerStudent] = useState<any>(null);
  const [rouletteDegree, setRouletteDegree] = useState(0);

  // New Student Modal Form & Camera state
  const [newStudent, setNewStudent] = useState({ name: '', number: '', group: '3° A', avatar: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [photoOption, setPhotoOption] = useState<'upload' | 'camera' | 'url'>('upload');
  const [modalCameraActive, setModalCameraActive] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const modalStreamRef = useRef<MediaStream | null>(null);

  // Custom subject input state for assignment creation
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [newTitleInput, setNewTitleInput] = useState('');

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('sep_qr_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('sep_qr_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('sep_qr_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('sep_qr_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('sep_qr_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    if (!(window as any).Html5Qrcode) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleCodeScannedRef = useRef<any>(null);
  useEffect(() => {
    handleCodeScannedRef.current = handleCodeScanned;
  });

  const [localIp, setLocalIp] = useState('');

  useEffect(() => {
    try {
      if ((window as any).require) {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.invoke('get-local-ip').then((ip: string) => setLocalIp(ip));
        
        const handleIpcScan = (event: any, data: string) => {
          if (handleCodeScannedRef.current) {
            handleCodeScannedRef.current(data);
          }
        };
        ipcRenderer.on('qr-scanned', handleIpcScan);
        
        return () => {
          ipcRenderer.removeListener('qr-scanned', handleIpcScan);
        };
      }
    } catch (err) {
      console.log('Not running in electron', err);
    }
  }, []);

  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    if (activeTab === 'scanner' && scannerActive) {
      const startScanner = async () => {
        try {
          if ((window as any).Html5Qrcode) {
            html5QrCodeRef.current = new (window as any).Html5Qrcode("reader");
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            
            await html5QrCodeRef.current.start(
              { facingMode: "user" },
              config,
              (decodedText: string) => {
                if (handleCodeScannedRef.current) {
                  handleCodeScannedRef.current(decodedText);
                }
              },
              () => {
                // scanning errors ignored
              }
            );
          }
        } catch (err) {
          console.error("Camera startup error:", err);
          setScannerActive(false);
        }
      };
      
      const timer = setTimeout(startScanner, 300);
      return () => {
        clearTimeout(timer);
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch((err: any) => console.error(err));
        }
      };
    }
  }, [activeTab, scannerActive, scanMode, selectedAssignmentId]);

  // Activate license handler
  const handleActivateLicense = async () => {
    setLicenseError('');
    setLicenseSuccess('');
    const inputClean = licenseInputKey.trim().toUpperCase();

    if (!inputClean) {
      setLicenseError('Por favor ingresa tu clave de activación.');
      return;
    }

    const expectedKey = await computeValidKey(machineId);

    if (inputClean === expectedKey) {
      localStorage.setItem('sep_qr_license_activated', 'true');
      setIsActivated(true);
      setLicenseSuccess('¡Licencia activada con éxito para este equipo!');
      playFanfare();
      setTimeout(() => {
        setShowLicenseModal(false);
      }, 1500);
    } else {
      setLicenseError('Clave de activación incorrecta o no válida para este equipo.');
      playBeep(300, 0.3);
    }
  };

  // Modal camera handler
  const startModalCamera = async () => {
    try {
      setModalCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 } });
      modalStreamRef.current = stream;
      if (modalVideoRef.current) {
        modalVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing webcam for photo:", err);
      alert("No se pudo acceder a la cámara. Revisa los permisos.");
      setModalCameraActive(false);
    }
  };

  const stopModalCamera = () => {
    if (modalStreamRef.current) {
      modalStreamRef.current.getTracks().forEach(track => track.stop());
      modalStreamRef.current = null;
    }
    setModalCameraActive(false);
  };

  const captureModalPhoto = () => {
    if (!modalVideoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(modalVideoRef.current, 0, 0, 300, 300);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setNewStudent(prev => ({ ...prev, avatar: dataUrl }));
    }
    stopModalCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStudent(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const lastScanDebounceRef = useRef({ code: '', time: 0 });

  const handleCodeScanned = (scannedCode: string) => {
    const cleanCode = scannedCode.trim().toUpperCase();
    const now = Date.now();

    // Prevent scanning the exact same code multiple times within 3 seconds
    if (lastScanDebounceRef.current.code === cleanCode && (now - lastScanDebounceRef.current.time) < 3000) {
      return;
    }
    lastScanDebounceRef.current = { code: cleanCode, time: now };

    const student = students.find(s => s.id.toUpperCase() === cleanCode || s.name.toLowerCase().includes(cleanCode.toLowerCase()));

    if (!student) {
      if (audioEnabled) playBeep(300, 0.3);
      setLastScanResult({
        success: false,
        message: `Código no reconocido: "${cleanCode}"`,
        time: new Date().toLocaleTimeString()
      });
      return;
    }

    const today = selectedDate;

    if (scanMode === 'attendance') {
      const todayAttendance = attendance[today] || [];
      const alreadyPresent = todayAttendance.includes(student.id);

      if (!alreadyPresent) {
        if (audioEnabled) playBeep(880, 0.15);
        const updated = [...todayAttendance, student.id];
        setAttendance({
          ...attendance,
          [today]: updated
        });

        const scanEntry = {
          success: true,
          type: 'Asistencia',
          student,
          message: '¡Asistencia Registrada Correctamente!',
          time: new Date().toLocaleTimeString()
        };
        setLastScanResult(scanEntry);
        setScanHistory(prev => [scanEntry, ...prev.slice(0, 14)]);
      } else {
        if (audioEnabled) playBeep(600, 0.2);
        setLastScanResult({
          success: true,
          type: 'Asistencia Duplicada',
          student,
          message: 'Este alumno ya había registrado asistencia hoy',
          time: new Date().toLocaleTimeString()
        });
      }
    } else {
      // Work revision mode
      if (!selectedAssignmentId) {
        if (audioEnabled) playBeep(300, 0.3);
        setLastScanResult({
          success: false,
          student,
          message: 'Selecciona una actividad arriba para registrar entregas.',
          time: new Date().toLocaleTimeString()
        });
        return;
      }

      const taskSubmissions = submissions[selectedAssignmentId] || [];
      const alreadySubmitted = taskSubmissions.includes(student.id);

      if (!alreadySubmitted) {
        if (audioEnabled) playBeep(1000, 0.2);
        setSubmissions({
          ...submissions,
          [selectedAssignmentId]: [...taskSubmissions, student.id]
        });

        const currentTask = assignments.find(a => a.id === selectedAssignmentId);
        const scanEntry = {
          success: true,
          type: 'Trabajo',
          student,
          taskName: currentTask ? currentTask.title : 'Trabajo Diario',
          message: '¡Trabajo Revisado y Registrado!',
          time: new Date().toLocaleTimeString()
        };
        setLastScanResult(scanEntry);
        setScanHistory(prev => [scanEntry, ...prev.slice(0, 14)]);
      } else {
        if (audioEnabled) playBeep(600, 0.2);
        setLastScanResult({
          success: true,
          type: 'Trabajo Repetido',
          student,
          message: 'Este alumno ya tenía este trabajo entregado hoy',
          time: new Date().toLocaleTimeString()
        });
      }
    }
  };

  const presentStudentsToday = useMemo(() => {
    const todayList = attendance[selectedDate] || [];
    return students.filter(s => todayList.includes(s.id));
  }, [students, attendance, selectedDate]);

  const spinRoulette = () => {
    if (presentStudentsToday.length === 0 || spinning) return;

    setSpinning(true);
    setWinnerStudent(null);
    if (audioEnabled) playBeep(520, 0.1);

    const randomIndex = Math.floor(Math.random() * presentStudentsToday.length);
    const selected = presentStudentsToday[randomIndex];

    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const sliceAngle = 360 / presentStudentsToday.length;
    const targetDegree = rouletteDegree + (extraSpins * 360) + (randomIndex * sliceAngle) + (sliceAngle / 2);

    setRouletteDegree(targetDegree);

    setTimeout(() => {
      setSpinning(false);
      setWinnerStudent(selected);
      if (audioEnabled) playFanfare();
    }, 4000);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim()) return;
    const nextNumber = students.length > 0 ? Math.max(...students.map(s => s.number)) + 1 : 1;
    const id = `ALU-${100 + nextNumber}`;
    const avatar = newStudent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newStudent.name)}`;
    
    const added = {
      id,
      name: newStudent.name.trim(),
      number: nextNumber,
      group: newStudent.group || '3° A',
      avatar
    };

    setStudents([...students, added]);
    setNewStudent({ name: '', number: '', group: '3° A', avatar: '' });
    stopModalCamera();
    setShowAddModal(false);
  };

  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleInput.trim()) return;
    
    const finalSubject = newSubjectInput.trim() || 'General';

    // Add custom subject to memory if not present
    if (!subjects.includes(finalSubject)) {
      setSubjects(prev => [...prev, finalSubject]);
    }

    const newAsg = {
      id: `ASG-${Date.now()}`,
      date: selectedDate,
      title: newTitleInput.trim(),
      subject: finalSubject
    };

    setAssignments(prev => [...prev, newAsg]);
    setSelectedAssignmentId(newAsg.id);
    setNewTitleInput('');
    setNewSubjectInput('');
  };

  // Trigger subject deletion request
  const requestDeleteSubject = (subjectToDelete: string) => {
    const associatedAssignments = assignments.filter(a => a.subject === subjectToDelete);
    if (associatedAssignments.length > 0) {
      setSubjectPendingDelete({ name: subjectToDelete, count: associatedAssignments.length });
    } else {
      executeDeleteSubject(subjectToDelete);
    }
  };

  // Execute deletion directly without relying on native browser popups
  const executeDeleteSubject = (subjectToDelete: string) => {
    const associatedAssignments = assignments.filter(a => a.subject === subjectToDelete);
    const asgIdsToRemove = associatedAssignments.map(a => a.id);

    setAssignments(prev => prev.filter(a => a.subject !== subjectToDelete));
    setSubmissions(prev => {
      const updated = { ...prev };
      asgIdsToRemove.forEach(id => delete updated[id]);
      return updated;
    });

    setSubjects(prev => prev.filter(s => s !== subjectToDelete));

    if (selectedSubjectFilter === subjectToDelete) {
      setSelectedSubjectFilter('ALL');
    }

    setSubjectPendingDelete(null);
  };

  // Add new subject manually from subjects modal
  const handleAddSubjectFromModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNewSubject.trim()) return;
    const name = modalNewSubject.trim();
    if (!subjects.includes(name)) {
      setSubjects(prev => [...prev, name]);
    }
    setModalNewSubject('');
  };

  // Recorded dates for attendance matrix table
  const allAttendanceDates = useMemo(() => {
    const dates = Object.keys(attendance);
    if (!dates.includes(selectedDate)) {
      dates.push(selectedDate);
    }
    return dates.sort();
  }, [attendance, selectedDate]);

  // Unique subjects that have assignments created
  const uniqueAssignmentSubjects = useMemo(() => {
    return Array.from(new Set(assignments.map(a => a.subject)));
  }, [assignments]);

  // Filtered assignments based on subject filter tab
  const filteredAssignments = useMemo(() => {
    if (selectedSubjectFilter === 'ALL') return assignments;
    return assignments.filter(a => a.subject === selectedSubjectFilter);
  }, [assignments, selectedSubjectFilter]);

  // Toggle student attendance for a given date directly from matrix
  const toggleAttendanceCell = (studentId: string, dateStr: string) => {
    const list = attendance[dateStr] || [];
    const isPresent = list.includes(studentId);
    const updated = isPresent ? list.filter(id => id !== studentId) : [...list, studentId];
    setAttendance(prev => ({
      ...prev,
      [dateStr]: updated
    }));
  };

  // Toggle student submission for a given assignment directly from matrix
  const toggleSubmissionCell = (studentId: string, assignmentId: string) => {
    const list = submissions[assignmentId] || [];
    const hasSubmitted = list.includes(studentId);
    const updated = hasSubmitted ? list.filter(id => id !== studentId) : [...list, studentId];
    setSubmissions(prev => ({
      ...prev,
      [assignmentId]: updated
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Global CSS Style tag for exact CR80 Standard ID Card print layout (5.4 cm x 8.56 cm) */}
      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 8mm;
          }
          body * {
            visibility: hidden;
          }
          #print-gafetes-container, #print-gafetes-container * {
            visibility: visible;
          }
          #print-gafetes-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          /* Standard CR80 Card Dimensions: 54mm width x 85.6mm height (5.4cm x 8.56cm) */
          .cr80-gafete-card {
            width: 54mm !important;
            height: 85.6mm !important;
            min-width: 54mm !important;
            max-width: 54mm !important;
            min-height: 85.6mm !important;
            max-height: 85.6mm !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 1px dashed #64748b !important;
            border-radius: 3.5mm !important;
            overflow: hidden !important;
            margin: 2mm !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* App Main Navigation Header */}
      <header className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white/15 p-2 rounded-xl backdrop-blur-md border border-white/20">
                <QrCode className="w-7 h-7 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold tracking-tight">Pase de Asistencia y Trabajos QR</h1>
                  <span className="bg-yellow-400 text-indigo-950 text-xs font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                    SEP 2026
                  </span>
                </div>
                <p className="text-xs text-indigo-100 hidden sm:block">
                  Módulo Integrado para el Ecosistema del Planificador Docente
                </p>
              </div>
            </div>

            {/* Quick Controls, License Button & Date Picker */}
            <div className="flex items-center space-x-3">
              {/* License Status Badge Button */}
              <button
                type="button"
                onClick={() => setShowLicenseModal(true)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-transform hover:scale-105 shadow-md ${
                  isActivated
                    ? 'bg-emerald-500 text-white border border-emerald-300'
                    : trialDaysRemaining > 0
                    ? 'bg-amber-400 text-amber-950 border border-amber-300 animate-pulse'
                    : 'bg-rose-600 text-white border border-rose-300'
                }`}
                title="Estado de Licencia y Activación"
              >
                <Key className="w-3.5 h-3.5" />
                <span>
                  {isActivated
                    ? 'Licencia Activa'
                    : trialDaysRemaining > 0
                    ? `Prueba (${trialDaysRemaining} días)`
                    : 'Prueba Expirada'}
                </span>
              </button>

              <div className="flex items-center bg-indigo-900/40 rounded-lg p-1 border border-indigo-400/30">
                <CalendarIcon className="w-4 h-4 ml-2 mr-1 text-indigo-200" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-white text-xs font-medium focus:outline-none px-2 py-1 rounded cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowPairingModal(true)}
                className="flex items-center space-x-1.5 bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md"
                title="Vincular celular como escáner"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Vincular Celular</span>
              </button>

              <button
                type="button"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  audioEnabled ? 'bg-indigo-800/80 text-yellow-300 hover:bg-indigo-800' : 'bg-indigo-900/40 text-indigo-300'
                }`}
                title={audioEnabled ? "Sonido Activado" : "Sonido Silenciado"}
              >
                {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 pt-1 scrollbar-none border-t border-indigo-500/30">
            {[
              { id: 'scanner', label: 'Escanear en Vivo', icon: Camera, color: 'text-emerald-300' },
              { id: 'gafetes', label: 'Imprimir Gafetes', icon: QrCode, color: 'text-indigo-200' },
              { id: 'asistencia', label: 'Historial Asistencia SEP', icon: UserCheck, color: 'text-blue-300' },
              { id: 'trabajos', label: 'Concentrado Trabajos', icon: BookOpen, color: 'text-amber-300' },
              { id: 'ruleta', label: 'Ruleta Participación', icon: RotateCw, color: 'text-pink-300' },
              { id: 'alumnos', label: 'Lista Alumnos', icon: Users, color: 'text-purple-300' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-indigo-900 shadow-md font-bold scale-105'
                      : 'text-indigo-100 hover:bg-indigo-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main App Content Viewports */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* ==================================================================== */}
        {/* TAB 1: ESCANEO EN VIVO DE QR */}
        {/* ==================================================================== */}
        {activeTab === 'scanner' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Mode & Assignment Selector Header */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Modo de Operación:</span>
                <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setScanMode('attendance')}
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      scanMode === 'attendance'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Pase de Asistencia</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanMode('work')}
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      scanMode === 'work'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Revisión de Trabajos</span>
                  </button>
                </div>
              </div>

              {/* Work task selection dropdown when in 'work' mode */}
              {scanMode === 'work' && (
                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Trabajo Actual:</label>
                  <select
                    value={selectedAssignmentId}
                    onChange={(e) => setSelectedAssignmentId(e.target.value)}
                    className="bg-amber-50 border border-amber-300 text-amber-900 font-medium text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 w-full md:w-64"
                  >
                    <option value="">-- Selecciona Trabajo --</option>
                    {assignments.filter(a => a.date === selectedDate).map(asg => (
                      <option key={asg.id} value={asg.id}>
                        [{asg.subject}] {asg.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Main Scanner Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Webcam Scanner viewport */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[420px]">
                {!scannerActive ? (
                  <div className="text-center p-8 max-w-md">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 border border-indigo-100">
                      <Camera className="w-10 h-10 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Escáner de Cámara Apagado</h3>
                    <p className="text-xs text-slate-500 mb-6">
                      Haz clic abajo para activar la webcam de tu laptop. Los niños pueden acercar su gafete a la cámara para registrarse en segundos.
                    </p>
                    <button
                      type="button"
                      onClick={() => setScannerActive(true)}
                      className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-transform hover:scale-105"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Activar Cámara de Laptop</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="relative w-full max-w-md bg-black rounded-2xl overflow-hidden shadow-inner border-4 border-indigo-500">
                      <div id="reader" className="w-full min-h-[300px]"></div>
                      <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                        <span>CÁMARA EN VIVO</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setScannerActive(false)}
                      className="mt-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs transition-colors"
                    >
                      Detener Cámara
                    </button>
                  </div>
                )}

                {/* Manual Input for Teacher */}
                <div className="mt-6 w-full border-t border-slate-100 pt-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (manualInput) {
                        handleCodeScanned(manualInput);
                        setManualInput('');
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Ingresa código o nombre manual si olvidó gafete..."
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700"
                    >
                      Marcar
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Live Result Card & Scan Feed */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Last Scanned Student Pop-up Card */}
                {lastScanResult ? (
                  <div className={`p-6 rounded-2xl shadow-md border transition-all ${
                    lastScanResult.success 
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950' 
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}>
                    <div className="flex items-start space-x-4">
                      {lastScanResult.student ? (
                        <img
                          src={lastScanResult.student.avatar}
                          alt={lastScanResult.student.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-rose-200 rounded-full flex items-center justify-center text-rose-700 font-bold">
                          ?
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                            {lastScanResult.type || 'Escaner'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{lastScanResult.time}</span>
                        </div>
                        <h4 className="text-base font-bold mt-1 text-slate-900">
                          {lastScanResult.student ? lastScanResult.student.name : 'No Encontrado'}
                        </h4>
                        {lastScanResult.student && (
                          <p className="text-xs text-slate-600">
                            Núm. Lista: #{lastScanResult.student.number} • ID: {lastScanResult.student.id}
                          </p>
                        )}
                        <p className="text-xs font-bold mt-2 text-emerald-700 flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 inline mr-1" />
                          {lastScanResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-100 p-6 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                    Esperando escaneo de gafete de alumno...
                  </div>
                )}

                {/* Scan History Feed */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Registro Reciente de hoy</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                      {scanHistory.length} lecturas
                    </span>
                  </h4>

                  {scanHistory.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">
                      Aún no hay lecturas registradas en esta sesión.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {scanHistory.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <img src={item.student.avatar} alt="" className="w-8 h-8 rounded-full border border-slate-200" />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{item.student.name}</p>
                              <p className="text-[10px] text-slate-500">{item.type} • #{item.student.number}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: IMPRESIÓN Y GENERADOR DE GAFETES (TAMAÑO CREDENCIAL CR80 5.4cm x 8.56cm) */}
        {/* ==================================================================== */}
        {activeTab === 'gafetes' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Gafetes de Alumnos (Tamaño Credencial Estándar CR80)</h2>
                <p className="text-xs text-slate-500">
                  Formato estricto <strong className="text-indigo-700">5.4 cm × 8.56 cm</strong> listo para imprimir en PDF y emmica/mica plástica.
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Gafetes (PDF)</span>
              </button>
            </div>

            {/* Printable Gafete Cards Grid (Exact CR80 proportions 54mm x 85.6mm) */}
            <div id="print-gafetes-container">
              <div className="print-gafetes-grid flex flex-wrap gap-4 justify-center sm:justify-start">
                {students.map((student) => {
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${student.id}`;

                  return (
                    <div
                      key={student.id}
                      className="cr80-gafete-card bg-white border-2 border-indigo-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
                      style={{ width: '204px', height: '324px' }} // Exact ratio of 54mm x 85.6mm on screen
                    >
                      {/* Header Gafete Banner */}
                      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-2.5 px-1 text-center shrink-0">
                        <h3 className="text-[11px] font-extrabold tracking-wider">GAFETE ESCOLAR</h3>
                      </div>

                      {/* Card Body */}
                      <div className="p-2.5 flex flex-col items-center text-center space-y-2 flex-1 justify-around">
                        {/* Photo/Avatar */}
                        <div className="relative mt-1">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-24 h-24 rounded-full border-[3px] border-indigo-600 object-cover shadow-sm"
                          />
                          <span className="absolute bottom-0 right-0 bg-yellow-400 text-indigo-950 text-[11px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                            #{student.number}
                          </span>
                        </div>

                        {/* Name & Details */}
                        <div className="w-full px-2">
                          <h4 className="text-sm font-black text-slate-900 leading-tight line-clamp-2">
                            {student.name}
                          </h4>
                          <p className="text-[11px] font-extrabold text-indigo-600 mt-1">
                            Grupo: {student.group}
                          </p>
                        </div>

                        {/* QR Code */}
                        <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex flex-col items-center shrink-0">
                          <img src={qrUrl} alt={`QR ${student.name}`} className="w-20 h-20 object-contain" />
                          <span className="text-[9px] font-mono text-slate-600 font-bold mt-0.5">
                            {student.id}
                          </span>
                        </div>
                      </div>

                      {/* Footer Banner */}
                      <div className="bg-slate-100 py-1 px-1 text-center text-[8px] text-slate-500 border-t border-slate-200 font-semibold shrink-0">
                        Planificador Docente SEP
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: HISTORIAL DE ASISTENCIA Y CALENDARIO SEP (TABLA MATRIZ CON PROMEDIO) */}
        {/* ==================================================================== */}
        {activeTab === 'asistencia' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Historial de Asistencia SEP (Matriz por Fechas)</h2>
                <p className="text-xs text-slate-500">
                  Tabla acumulativa por fechas registradas. Haz clic en las celdas para alternar presente/falta manualmente.
                </p>
              </div>

              {/* SEP Legend */}
              <div className="flex flex-wrap gap-2 text-[10px]">
                {Object.entries(CALENDAR_TYPES).map(([key, val]) => (
                  <span key={key} className={`px-2 py-1 rounded border font-semibold ${val.color}`}>
                    {val.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Matrix Attendance Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-200 min-w-[50px]">#</th>
                    <th className="p-3 sticky left-[50px] bg-slate-100 z-10 border-r border-slate-200 min-w-[180px]">Alumno</th>
                    {allAttendanceDates.map(dateStr => (
                      <th key={dateStr} className="p-3 text-center border-r border-slate-200 min-w-[100px] whitespace-nowrap">
                        <div className="text-[11px] font-bold">{dateStr}</div>
                        <div className="text-[9px] font-normal text-slate-500">
                          {attendance[dateStr]?.length || 0} / {students.length} presentes
                        </div>
                      </th>
                    ))}
                    <th className="p-3 text-center min-w-[130px] bg-indigo-50 text-indigo-900 border-l-2 border-indigo-200">
                      Promedio Asistencia
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => {
                    const studentPresentDatesCount = allAttendanceDates.filter(d => (attendance[d] || []).includes(st.id)).length;
                    const totalRecordedDays = allAttendanceDates.length || 1;
                    const avgPercentage = Math.round((studentPresentDatesCount / totalRecordedDays) * 100);

                    return (
                      <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono text-slate-500 font-bold sticky left-0 bg-white border-r border-slate-200">{st.number}</td>
                        <td className="p-3 font-medium text-slate-900 flex items-center space-x-2 sticky left-[50px] bg-white border-r border-slate-200">
                          <img src={st.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                          <span className="truncate">{st.name}</span>
                        </td>

                        {/* Date Columns */}
                        {allAttendanceDates.map(dateStr => {
                          const isPresent = (attendance[dateStr] || []).includes(st.id);
                          return (
                            <td
                              key={dateStr}
                              onClick={() => toggleAttendanceCell(st.id, dateStr)}
                              className="p-3 text-center border-r border-slate-200 cursor-pointer hover:bg-indigo-50/50 transition-colors select-none"
                              title={`Haz clic para cambiar estatus el ${dateStr}`}
                            >
                              {isPresent ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold shadow-sm">
                                  <Check className="w-4 h-4" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-bold shadow-sm">
                                  <XCircle className="w-4 h-4" />
                                </span>
                              )}
                            </td>
                          );
                        })}

                        {/* Promedio Column */}
                        <td className="p-3 text-center bg-indigo-50/40 border-l-2 border-indigo-200">
                          <div className="flex flex-col items-center">
                            <span className={`font-black text-xs px-2.5 py-1 rounded-full shadow-sm ${
                              avgPercentage >= 85 ? 'bg-emerald-600 text-white' : avgPercentage >= 70 ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                            }`}>
                              {avgPercentage}%
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold mt-1">
                              {studentPresentDatesCount} de {totalRecordedDays} días
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: CONCENTRADO DE TRABAJOS Y TAREAS (PROMEDIOS POR MATERIA Y GESTIÓN) */}
        {/* ==================================================================== */}
        {activeTab === 'trabajos' && (
          <div className="space-y-6">
            {/* Header Create Task */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Concentrado de Trabajos y Tareas Diarias</h2>
                <p className="text-xs text-slate-500">
                  Anota materias libremente. <strong className="text-amber-700">Puedes eliminar materias y sus trabajos en cualquier momento.</strong>
                </p>
              </div>

              {/* Form Create Assignment + Manage Subjects Button */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto items-center">
                <button
                  type="button"
                  onClick={() => setShowSubjectsModal(true)}
                  className="bg-slate-100 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 flex items-center space-x-1.5 shrink-0 shadow-sm"
                  title="Administrar o eliminar materias creadas"
                >
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span>Gestionar Materias</span>
                </button>

                <form
                  onSubmit={handleCreateAssignmentSubmit}
                  className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto"
                >
                  <div className="relative">
                    <input
                      type="text"
                      list="subjects-datalist"
                      placeholder="Materia (Ej. Robótica, Español)..."
                      value={newSubjectInput}
                      onChange={(e) => setNewSubjectInput(e.target.value)}
                      required
                      className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 w-full sm:w-44"
                    />
                    <datalist id="subjects-datalist">
                      {subjects.map((subj, idx) => (
                        <option key={idx} value={subj} />
                      ))}
                    </datalist>
                  </div>

                  <input
                    type="text"
                    placeholder="Título del Trabajo..."
                    value={newTitleInput}
                    onChange={(e) => setNewTitleInput(e.target.value)}
                    required
                    className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 flex-1 sm:w-48"
                  />

                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1 shrink-0 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Trabajo</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Filter by Subject Bar + Subject Deletion directly from Pills */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <Filter className="w-4 h-4 text-amber-600" />
                <span>Filtrar Trabajos y Promedios por Materia:</span>
              </div>

              <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedSubjectFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedSubjectFilter === 'ALL'
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todas las Materias ({assignments.length})
                </button>
                {subjects.map(subj => {
                  const count = assignments.filter(a => a.subject === subj).length;
                  const isSelected = selectedSubjectFilter === subj;

                  return (
                    <div
                      key={subj}
                      className={`inline-flex items-center rounded-xl text-xs font-bold transition-all overflow-hidden ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedSubjectFilter(subj)}
                        className="px-3 py-1.5 hover:bg-black/5"
                      >
                        {subj} ({count})
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDeleteSubject(subj);
                        }}
                        className={`pr-2.5 pl-1.5 py-1.5 hover:bg-rose-600 hover:text-white transition-colors border-l ${
                          isSelected ? 'border-indigo-400' : 'border-amber-200 text-amber-700'
                        }`}
                        title={`Eliminar la materia "${subj}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Matrix Assignments Table with Subject-specific Averages */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
              {filteredAssignments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {selectedSubjectFilter === 'ALL'
                    ? 'Aún no has creado ningún trabajo. Usa el formulario arriba para agregar uno.'
                    : `No hay trabajos registrados para la materia "${selectedSubjectFilter}".`}
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-200 min-w-[50px]">#</th>
                      <th className="p-3 sticky left-[50px] bg-slate-100 z-10 border-r border-slate-200 min-w-[180px]">Alumno</th>
                      
                      {/* Assignment Columns */}
                      {filteredAssignments.map(asg => {
                        const submittedCount = (submissions[asg.id] || []).length;
                        return (
                          <th key={asg.id} className="p-3 border-r border-slate-200 min-w-[140px] text-center relative group">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900 inline-block mb-1">
                                {asg.subject}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setAssignments(prev => prev.filter(a => a.id !== asg.id));
                                  setSubmissions(prev => {
                                    const copy = { ...prev };
                                    delete copy[asg.id];
                                    return copy;
                                  });
                                }}
                                className="text-slate-400 hover:text-rose-600 p-0.5"
                                title="Eliminar este trabajo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="font-bold text-slate-900 text-xs leading-tight">{asg.title}</div>
                            <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                              {asg.date} • ({submittedCount}/{students.length} ent.)
                            </div>
                          </th>
                        );
                      })}

                      {/* Subject Averages Summary Columns */}
                      {selectedSubjectFilter === 'ALL' ? (
                        uniqueAssignmentSubjects.map(subj => (
                          <th key={subj} className="p-3 text-center min-w-[130px] bg-amber-50 text-amber-950 border-l-2 border-amber-200">
                            <div className="text-[10px] font-black text-amber-700 uppercase">PROMEDIO</div>
                            <div className="font-bold text-xs">{subj}</div>
                          </th>
                        ))
                      ) : (
                        <th className="p-3 text-center min-w-[140px] bg-amber-50 text-amber-950 border-l-2 border-amber-200">
                          <div className="text-[10px] font-black text-amber-700 uppercase">PROMEDIO MATERIA</div>
                          <div className="font-bold text-xs">{selectedSubjectFilter}</div>
                        </th>
                      )}

                      {/* Overall Average Column (When viewing ALL) */}
                      {selectedSubjectFilter === 'ALL' && (
                        <th className="p-3 text-center min-w-[130px] bg-indigo-50 text-indigo-950 border-l-2 border-indigo-200">
                          <div className="text-[10px] font-black text-indigo-700 uppercase">PROMEDIO</div>
                          <div className="font-bold text-xs">General Total</div>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((st) => {
                      const totalGeneralAssignments = assignments.length || 1;
                      const studentTotalGeneralSubmitted = assignments.filter(a => (submissions[a.id] || []).includes(st.id)).length;
                      const overallAvgPercentage = Math.round((studentTotalGeneralSubmitted / totalGeneralAssignments) * 100);

                      return (
                        <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono text-slate-500 font-bold sticky left-0 bg-white border-r border-slate-200">{st.number}</td>
                          <td className="p-3 font-medium text-slate-900 flex items-center space-x-2 sticky left-[50px] bg-white border-r border-slate-200">
                            <img src={st.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                            <span className="truncate">{st.name}</span>
                          </td>

                          {/* Assignments Status Cells */}
                          {filteredAssignments.map(asg => {
                            const hasSubmitted = (submissions[asg.id] || []).includes(st.id);
                            return (
                              <td
                                key={asg.id}
                                onClick={() => toggleSubmissionCell(st.id, asg.id)}
                                className="p-3 text-center border-r border-slate-200 cursor-pointer hover:bg-amber-50/50 transition-colors select-none"
                                title={`Haz clic para cambiar estatus de "${asg.title}"`}
                              >
                                {hasSubmitted ? (
                                  <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full shadow-sm">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Entregado</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-400 font-medium px-2 py-0.5 rounded-full hover:bg-amber-100 hover:text-amber-800">
                                    <span>Pendiente</span>
                                  </span>
                                )}
                              </td>
                            );
                          })}

                          {/* Subject-Specific Averages Columns */}
                          {selectedSubjectFilter === 'ALL' ? (
                            uniqueAssignmentSubjects.map(subj => {
                              const subjAssignments = assignments.filter(a => a.subject === subj);
                              const subjCount = subjAssignments.length || 1;
                              const studentSubjSubmitted = subjAssignments.filter(a => (submissions[a.id] || []).includes(st.id)).length;
                              const subjAvg = Math.round((studentSubjSubmitted / subjCount) * 100);

                              return (
                                <td key={subj} className="p-3 text-center bg-amber-50/40 border-l-2 border-amber-200">
                                  <div className="flex flex-col items-center">
                                    <span className={`font-black text-xs px-2.5 py-1 rounded-full shadow-sm ${
                                      subjAvg >= 85 ? 'bg-emerald-600 text-white' : subjAvg >= 70 ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                                    }`}>
                                      {subjAvg}%
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-semibold mt-1">
                                      {studentSubjSubmitted} de {subjCount} tareas
                                    </span>
                                  </div>
                                </td>
                              );
                            })
                          ) : (
                            (() => {
                              const subjAssignments = assignments.filter(a => a.subject === selectedSubjectFilter);
                              const subjCount = subjAssignments.length || 1;
                              const studentSubjSubmitted = subjAssignments.filter(a => (submissions[a.id] || []).includes(st.id)).length;
                              const subjAvg = Math.round((studentSubjSubmitted / subjCount) * 100);

                              return (
                                <td className="p-3 text-center bg-amber-50/40 border-l-2 border-amber-200">
                                  <div className="flex flex-col items-center">
                                    <span className={`font-black text-xs px-2.5 py-1 rounded-full shadow-sm ${
                                      subjAvg >= 85 ? 'bg-emerald-600 text-white' : subjAvg >= 70 ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                                    }`}>
                                      {subjAvg}%
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-semibold mt-1">
                                      {studentSubjSubmitted} de {subjCount} tareas
                                    </span>
                                  </div>
                                </td>
                              );
                            })()
                          )}

                          {/* Overall Average Column (When viewing ALL) */}
                          {selectedSubjectFilter === 'ALL' && (
                            <td className="p-3 text-center bg-indigo-50/40 border-l-2 border-indigo-200">
                              <div className="flex flex-col items-center">
                                <span className={`font-black text-xs px-2.5 py-1 rounded-full shadow-sm ${
                                  overallAvgPercentage >= 85 ? 'bg-emerald-600 text-white' : overallAvgPercentage >= 70 ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                                }`}>
                                  {overallAvgPercentage}%
                                </span>
                                <span className="text-[10px] text-slate-500 font-semibold mt-1">
                                  {studentTotalGeneralSubmitted} de {totalGeneralAssignments} total
                                </span>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: RULETA DE PARTICIPACIÓN DE ALUMNOS PRESENTES */}
        {/* ==================================================================== */}
        {activeTab === 'ruleta' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Ruleta de Participaciones</h2>
                <p className="text-xs text-slate-500">
                  Selecciona al azar un alumno para pasar al pizarrón o responder. <strong className="text-indigo-600">Filtra automáticamente solo a los alumnos que escanearon su asistencia hoy ({selectedDate}).</strong>
                </p>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-center">
                <span className="text-[10px] font-bold text-indigo-500 uppercase block">Alumnos Presentes Hoy</span>
                <span className="text-lg font-extrabold text-indigo-900">
                  {presentStudentsToday.length} de {students.length}
                </span>
              </div>
            </div>

            {/* Roulette Spinning Area */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[480px]">
              {presentStudentsToday.length === 0 ? (
                <div className="text-center max-w-sm">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800 mb-1">Sin Alumnos Presentes</h3>
                  <p className="text-xs text-slate-500">
                    Aún no hay asistencias registradas para la fecha {selectedDate}. Ve a la pestaña "Escanear en Vivo" para que los niños pasen sus gafetes.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-8 w-full max-w-md">
                  
                  {/* Wheel Outer Frame */}
                  <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                    {/* Top Pointer Arrow */}
                    <div className="absolute -top-4 z-20 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-rose-600 filter drop-shadow-md"></div>

                    {/* Spinning SVG Wheel */}
                    <div
                      className="w-full h-full rounded-full shadow-2xl border-4 border-slate-800 overflow-hidden relative transition-all ease-out"
                      style={{
                        transform: `rotate(${rouletteDegree}deg)`,
                        transitionDuration: spinning ? '4000ms' : '0ms'
                      }}
                    >
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {presentStudentsToday.map((st, idx) => {
                          const total = presentStudentsToday.length;
                          const sliceAngle = 360 / total;
                          const startAngle = idx * sliceAngle;
                          const endAngle = (idx + 1) * sliceAngle;

                          const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                          const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                          const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                          const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                          const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                          const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                          const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316'];
                          const color = colors[idx % colors.length];

                          return (
                            <g key={st.id}>
                              <path d={pathData} fill={color} stroke="#ffffff" strokeWidth="0.5" />
                            </g>
                          );
                        })}
                      </svg>
                      
                      {/* Center Pin Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-full border-4 border-slate-800 shadow-lg flex items-center justify-center font-bold text-xs text-slate-800">
                          SEP
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Spin Trigger Button */}
                  <button
                    type="button"
                    onClick={spinRoulette}
                    disabled={spinning}
                    className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-xl transition-all transform flex items-center justify-center space-x-2 ${
                      spinning
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Sparkles className="w-6 h-6 animate-spin" />
                    <span>{spinning ? 'GIRANDO RULETA...' : '¡GIRAR RULETA AHORA!'}</span>
                  </button>

                  {/* Winner Display Card */}
                  {winnerStudent && !spinning && (
                    <div className="bg-gradient-to-br from-yellow-100 to-amber-200 border-2 border-yellow-400 p-6 rounded-2xl text-center shadow-xl w-full animate-bounce">
                      <span className="text-xs font-black uppercase text-amber-800 tracking-widest block mb-1">
                        ¡ALUMNO SELECCIONADO!
                      </span>
                      <img
                        src={winnerStudent.avatar}
                        alt=""
                        className="w-20 h-20 rounded-full mx-auto border-4 border-amber-500 shadow-md my-2 object-cover"
                      />
                      <h3 className="text-xl font-black text-amber-950">{winnerStudent.name}</h3>
                      <p className="text-xs font-bold text-amber-800 mt-1">
                        Número de Lista: #{winnerStudent.number}
                      </p>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 6: GESTIÓN DE ALUMNOS Y BASE DE DATOS */}
        {/* ==================================================================== */}
        {activeTab === 'alumnos' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Catálogo del Grupo</h2>
                <p className="text-xs text-slate-500">
                  Agrega o edita alumnos. Puedes adjuntar foto desde tu equipo o capturarla en vivo con la cámara.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Alumno</span>
              </button>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3"># Lista</th>
                    <th className="p-3">Foto / Avatar</th>
                    <th className="p-3">Nombre Completo</th>
                    <th className="p-3">ID QR</th>
                    <th className="p-3">Grupo</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-600">#{st.number}</td>
                      <td className="p-3">
                        <img src={st.avatar} alt="" className="w-8 h-8 rounded-full border object-cover" />
                      </td>
                      <td className="p-3 font-extrabold text-slate-900">{st.name}</td>
                      <td className="p-3 font-mono text-indigo-600 font-bold">{st.id}</td>
                      <td className="p-3 font-medium text-slate-600">{st.group}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setStudents(students.filter(s => s.id !== st.id));
                          }}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                          title="Eliminar Alumno"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL 0: LICENCIA Y ACTIVACIÓN (PRUEBA GRATIS 7 DÍAS CON ESPACIO PARA CLAVE UNICA) */}
      {showLicenseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-indigo-200 text-center animate-fadeIn relative overflow-hidden">
            {/* Header Lock Banner */}
            <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 p-6 mb-6 text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2 backdrop-blur-sm border border-white/30">
                <ShieldCheck className="w-8 h-8 text-yellow-300" />
              </div>
              <h2 className="text-lg font-extrabold tracking-tight">Control de Asistencia y Trabajos QR</h2>
              <p className="text-xs text-indigo-100 mt-1">Activación de Licencia Permanente (1 Equipo)</p>
            </div>

            {/* Trial Status Card */}
            {isActivated ? (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl mb-6 text-emerald-900">
                <div className="flex items-center justify-center space-x-2 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>¡LICENCIA PERMANENTE ACTIVADA!</span>
                </div>
                <p className="text-xs mt-1 text-emerald-700">Este equipo está completamente registrado y autorizado.</p>
              </div>
            ) : trialDaysRemaining > 0 ? (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-yellow-400 p-4 rounded-2xl mb-6 text-amber-950 shadow-sm">
                <div className="flex items-center justify-center space-x-2 font-black text-sm text-amber-800">
                  <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                  <span>PRUEBA GRATIS 7 DÍAS ACTIVA</span>
                </div>
                <p className="text-xs mt-1 font-bold text-amber-900">
                  Te quedan <span className="bg-yellow-400 px-2 py-0.5 rounded-full text-indigo-950 font-black">{trialDaysRemaining} día(s)</span> de prueba gratuita sin restricciones.
                </p>
              </div>
            ) : (
              <div className="bg-rose-50 border-2 border-rose-400 p-4 rounded-2xl mb-6 text-rose-950 shadow-sm">
                <div className="flex items-center justify-center space-x-2 font-black text-sm text-rose-700">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span>PRUEBA GRATUITA DE 7 DÍAS EXPIRADA</span>
                </div>
                <p className="text-xs mt-1 font-semibold text-rose-800">
                  Por favor adquiere tu clave e ingrésala abajo para continuar usando la aplicación.
                </p>
              </div>
            )}

            {/* Machine ID Box */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 mb-6 text-left">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Código de Equipo del Cliente:
              </label>
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-300">
                <code className="text-base font-black text-indigo-700 tracking-wider font-mono">
                  {machineId}
                </code>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(machineId);
                      alert("Código de equipo copiado al portapapeles");
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1"
                    title="Copiar Código"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </button>
                  <a
                    href={`https://wa.me/526271073044?text=${encodeURIComponent('Hola, me interesa adquirir la clave de activación para Control de Asistencia y Trabajos QR. Mi Código de equipo es: ' + machineId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                    title="Solicitar por WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Proporciona este código para generar tu clave válida exclusivamente para este equipo.
              </p>
            </div>

            {/* Key Input Section */}
            <div className="space-y-3 mb-6 text-left">
              <label className="block text-xs font-bold text-slate-700">
                Ingresa tu Clave de Activación:
              </label>
              <input
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseInputKey}
                onChange={(e) => setLicenseInputKey(e.target.value)}
                className="w-full bg-slate-50 border-2 border-indigo-200 rounded-2xl px-4 py-3 text-center text-sm font-black text-indigo-900 tracking-widest font-mono focus:ring-2 focus:ring-indigo-500 uppercase"
              />

              {licenseError && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {licenseError}
                </p>
              )}

              {licenseSuccess && (
                <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  {licenseSuccess}
                </p>
              )}

              <button
                type="button"
                onClick={handleActivateLicense}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                ACTIVAR LICENCIA PERMANENTE
              </button>
            </div>

            {/* Trial Continue or Close Button */}
            {isActivated || trialDaysRemaining > 0 ? (
              <button
                type="button"
                onClick={() => setShowLicenseModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                {isActivated ? 'Cerrar Ventana' : `Continuar con Prueba Gratis (${trialDaysRemaining} días restantes)`}
              </button>
            ) : (
              <p className="text-[11px] font-bold text-rose-600">
                Debes ingresar una clave válida para desbloquear la aplicación.
              </p>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM DELETION MODAL */}
      {subjectPendingDelete && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-rose-200 text-center animate-fadeIn">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              ¿Eliminar Materia "{subjectPendingDelete.name}"?
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              Esta materia tiene <strong className="text-rose-600 font-bold">{subjectPendingDelete.count} trabajo(s)</strong> registrado(s). Si la eliminas, también se borrarán sus trabajos.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSubjectPendingDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => executeDeleteSubject(subjectPendingDelete.name)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow"
              >
                Sí, Eliminar Todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: GESTIÓN DE MATERIAS */}
      {showSubjectsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-800">Administración de Materias</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSubjectsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Add New Subject Form inside Modal */}
            <form onSubmit={handleAddSubjectFromModal} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Nombre de nueva materia..."
                value={modalNewSubject}
                onChange={(e) => setModalNewSubject(e.target.value)}
                required
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-amber-700 shrink-0"
              >
                Agregar
              </button>
            </form>

            {/* List of Current Subjects */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 border-t pt-3">
              {subjects.map((subj) => {
                const workCount = assignments.filter(a => a.subject === subj).length;

                return (
                  <div
                    key={subj}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">{subj}</span>
                      <span className="text-[10px] text-slate-400">
                        {workCount} trabajo(s) registrado(s)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => requestDeleteSubject(subj)}
                      className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors border border-rose-200 cursor-pointer"
                      title={`Eliminar ${subj}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t mt-4">
              <button
                type="button"
                onClick={() => setShowSubjectsModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AGREGAR ALUMNO (CON ADJUNTAR FOTO Y CÁMARA EN VIVO) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Agregar Nuevo Alumno</h3>
              <button
                type="button"
                onClick={() => { stopModalCamera(); setShowAddModal(false); }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nombre Completo del Alumno:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza Fernández"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Grado / Grupo:</label>
                <input
                  type="text"
                  placeholder="Ej. 3° A"
                  value={newStudent.group}
                  onChange={(e) => setNewStudent({ ...newStudent, group: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              {/* Photo Input Section Selector */}
              <div>
                <label className="block font-semibold text-slate-600 mb-2">Foto del Alumno:</label>
                
                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => { stopModalCamera(); setPhotoOption('upload'); }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1 transition-all ${
                      photoOption === 'upload' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Adjuntar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPhotoOption('camera'); startModalCamera(); }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1 transition-all ${
                      photoOption === 'camera' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tomar Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { stopModalCamera(); setPhotoOption('url'); }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1 transition-all ${
                      photoOption === 'url' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>URL / Gen</span>
                  </button>
                </div>

                {/* Option 1: File Upload */}
                {photoOption === 'upload' && (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="student-photo-file"
                    />
                    <label htmlFor="student-photo-file" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-6 h-6 text-indigo-500 mb-1" />
                      <span className="text-xs font-bold text-indigo-600">Haz clic para seleccionar imagen</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG o WEBP</span>
                    </label>
                  </div>
                )}

                {/* Option 2: Live Webcam Photo Capture */}
                {photoOption === 'camera' && (
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-900 flex flex-col items-center">
                    {modalCameraActive ? (
                      <div className="w-full flex flex-col items-center">
                        <video
                          ref={modalVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-48 h-48 object-cover rounded-xl border-2 border-indigo-400 mb-3 bg-black"
                        />
                        <button
                          type="button"
                          onClick={captureModalPhoto}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 shadow"
                        >
                          <Camera className="w-4 h-4" />
                          <span>¡Capturar Foto Ahora!</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={startModalCamera}
                        className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs my-4"
                      >
                        Encender Cámara
                      </button>
                    )}
                  </div>
                )}

                {/* Option 3: URL / Default */}
                {photoOption === 'url' && (
                  <input
                    type="text"
                    placeholder="URL de foto o dejar en blanco..."
                    value={newStudent.avatar}
                    onChange={(e) => setNewStudent({ ...newStudent, avatar: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                )}

                {/* Live Preview Avatar */}
                {newStudent.avatar && (
                  <div className="mt-3 flex items-center space-x-3 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200">
                    <img
                      src={newStudent.avatar}
                      alt="Vista Previa"
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
                    />
                    <div>
                      <span className="text-[11px] font-bold text-indigo-900 block">Vista previa de Foto</span>
                      <button
                        type="button"
                        onClick={() => setNewStudent(prev => ({ ...prev, avatar: '' }))}
                        className="text-[10px] text-rose-600 font-semibold hover:underline"
                      >
                        Quitar foto
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => { stopModalCamera(); setShowAddModal(false); }}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow"
                >
                  Guardar Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pairing Modal */}
      {showPairingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-800 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-indigo-500" /> Vincular Celular
              </h3>
              <button onClick={() => setShowPairingModal(false)} className="text-slate-400 hover:text-rose-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">
              Abre la aplicación móvil de Escáner QR e ingresa la siguiente IP, o escanea el código para conectarte automáticamente.
            </p>

            <div className="flex justify-center bg-white p-4 border-2 border-indigo-100 rounded-2xl mb-4 shadow-sm inline-block mx-auto">
              {localIp ? (
                <QRCodeSVG value={`ws://${localIp}:3000`} size={200} level="H" />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center text-slate-400 font-bold">Obteniendo IP...</div>
              )}
            </div>

            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dirección de Conexión</p>
              <p className="text-lg font-black text-indigo-700 tracking-widest">{localIp || '---.---.---.---'}</p>
            </div>

            <button
              onClick={() => setShowPairingModal(false)}
              className="mt-6 w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-[11px] text-slate-400 mt-auto">
        Ecosistema Planificador Docente • Control de Asistencia y Trabajos por Código QR
      </footer>
    </div>
  );
}