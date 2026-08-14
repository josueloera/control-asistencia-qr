import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Info
} from 'lucide-react';

// Calendar SEP Reference & Event Types
const CALENDAR_TYPES = {
  REGULAR: { label: 'Día Lectivo', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  CTE: { label: 'Consejo Técnico Escolar (CTE)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  HOLIDAY: { label: 'Suspensión de Labores / Festivo', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  VACATION: { label: 'Periodo Vacacional', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  DISCHARGE: { label: 'Descarga Administrativa', color: 'bg-purple-100 text-purple-800 border-purple-300' }
};

// Default SEP Holidays / CTE dates sample mapping
const INITIAL_SEP_EVENTS = {
  '2026-09-16': { type: 'HOLIDAY', name: 'Día de la Independencia' },
  '2026-09-25': { type: 'CTE', name: 'Primera Sesión Ord. CTE' },
  '2026-10-30': { type: 'CTE', name: 'Segunda Sesión Ord. CTE' },
  '2026-11-02': { type: 'HOLIDAY', name: 'Día de Muertos' },
  '2026-11-16': { type: 'HOLIDAY', name: 'Aniversario Revolución Mex.' },
  '2026-11-27': { type: 'CTE', name: 'Tercera Sesión Ord. CTE' },
  '2026-12-21': { type: 'VACATION', name: 'Inicio Receso Escolar' },
  '2027-01-29': { type: 'CTE', name: 'Cuarta Sesión Ord. CTE' },
  '2027-02-05': { type: 'HOLIDAY', name: 'Constitución Mexicana' },
  '2027-02-26': { type: 'CTE', name: 'Quinta Sesión Ord. CTE' },
  '2027-03-15': { type: 'HOLIDAY', name: 'Natalicio de Benito Juárez' },
  '2027-03-26': { type: 'CTE', name: 'Sexta Sesión Ord. CTE' },
  '2027-04-30': { type: 'CTE', name: 'Séptima Sesión Ord. CTE' },
  '2027-05-01': { type: 'HOLIDAY', name: 'Día del Trabajo' },
  '2027-05-05': { type: 'HOLIDAY', name: 'Batalla de Puebla' },
  '2027-05-15': { type: 'HOLIDAY', name: 'Día del Maestro' },
  '2027-05-28': { type: 'CTE', name: 'Octava Sesión Ord. CTE' },
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

const playBeep = (freq = 880, duration = 0.15) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

export default function App() {
  // App Navigation Tabs
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner', 'gafetes', 'asistencia', 'trabajos', 'ruleta', 'alumnos'
  
  // Data States
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('sep_qr_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Attendance Records: { "2026-07-30": ["ALU-101", "ALU-102"] }
  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('sep_qr_attendance');
    const today = new Date().toISOString().split('T')[0];
    return saved ? JSON.parse(saved) : {
      [today]: ['ALU-101', 'ALU-102', 'ALU-104', 'ALU-106', 'ALU-108']
    };
  });

  // Assignments / Daily Work Tasks
  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem('sep_qr_assignments');
    const today = new Date().toISOString().split('T')[0];
    return saved ? JSON.parse(saved) : [
      { id: 'ASG-1', date: today, title: 'Resumen Libro de Texto', subject: 'Español' },
      { id: 'ASG-2', date: today, title: 'Fracciones Equivalentes', subject: 'Matemáticas' }
    ];
  });

  // Submissions: { "ASG-1": ["ALU-101", "ALU-104"] }
  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem('sep_qr_submissions');
    return saved ? JSON.parse(saved) : {
      'ASG-1': ['ALU-101', 'ALU-102']
    };
  });

  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');

  // Scanner state
  const [scanMode, setScanMode] = useState('attendance'); // 'attendance' or 'work'
  const [scannerActive, setScannerActive] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const [scanHistory, setScanHistory] = useState([]);

  // Roulette State
  const [spinning, setSpinning] = useState(false);
  const [winnerStudent, setWinnerStudent] = useState(null);
  const [rouletteDegree, setRouletteDegree] = useState(0);

  // New Student Modal Form
  const [newStudent, setNewStudent] = useState({ name: '', number: '', group: '3° A', avatar: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('sep_qr_students', JSON.stringify(students));
  }, [students]);

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
    const script = document.createElement('script');
    script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'scanner' && scannerActive) {
      const startScanner = async () => {
        try {
          if (window.Html5Qrcode) {
            html5QrCodeRef.current = new window.Html5Qrcode("reader");
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            
            await html5QrCodeRef.current.start(
              { facingMode: "user" },
              config,
              (decodedText) => {
                handleCodeScanned(decodedText);
              },
              (errorMessage) => {
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
          html5QrCodeRef.current.stop().catch(err => console.error(err));
        }
      };
    }
  }, [activeTab, scannerActive, scanMode, selectedAssignmentId]);

  const handleCodeScanned = (scannedCode) => {
    const cleanCode = scannedCode.trim().toUpperCase();
    const student = students.find(s => s.id.toUpperCase() === cleanCode || s.name.toLowerCase().includes(cleanCode.toLowerCase()));

    if (!student) {
      if (audioEnabled) playBeep(300, 0.3); // Error low pitch beep
      setLastScanResult({
        success: false,
        message: `Código no reconocido: "${cleanCode}"`,
        time: new Date().toLocaleTimeString()
      });
      return;
    }

    const today = selectedDate;

    if (scanMode === 'attendance') {
      const todayList = attendance[today] || [];
      const alreadyPresent = todayList.includes(student.id);

      if (!alreadyPresent) {
        const updatedToday = [...todayList, student.id];
        setAttendance(prev => ({ ...prev, [today]: updatedToday }));
        if (audioEnabled) playBeep(880, 0.15);
        
        const scanEntry = {
          success: true,
          type: 'Asistencia',
          student,
          message: '¡Asistencia Registrada!',
          time: new Date().toLocaleTimeString()
        };
        setLastScanResult(scanEntry);
        setScanHistory(prev => [scanEntry, ...prev.slice(0, 14)]);
      } else {
        if (audioEnabled) playBeep(600, 0.2);
        setLastScanResult({
          success: true,
          type: 'Repetida',
          student,
          message: 'Asistencia ya había sido registrada previo',
          time: new Date().toLocaleTimeString()
        });
      }
    } else if (scanMode === 'work') {
      if (!selectedAssignmentId) {
        if (audioEnabled) playBeep(300, 0.2);
        setLastScanResult({
          success: false,
          message: 'Por favor selecciona o crea un Trabajo Diario primero',
          time: new Date().toLocaleTimeString()
        });
        return;
      }

      const currentSubmissions = submissions[selectedAssignmentId] || [];
      const alreadySubmitted = currentSubmissions.includes(student.id);

      if (!alreadySubmitted) {
        setSubmissions(prev => ({
          ...prev,
          [selectedAssignmentId]: [...currentSubmissions, student.id]
        }));
        if (audioEnabled) playBeep(1046, 0.2); // High musical note for work check!
        
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

    // Calculate rotation degrees (at least 5 full spins + slice angle)
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

  const handleAddStudent = (e) => {
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
    setShowAddModal(false);
  };

  const handleCreateAssignment = (title, subject) => {
    if (!title.trim()) return;
    const newAsg = {
      id: `ASG-${Date.now()}`,
      date: selectedDate,
      title: title.trim(),
      subject: subject || 'General'
    };
    setAssignments([...assignments, newAsg]);
    setSelectedAssignmentId(newAsg.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {}
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

            {/* Quick Controls & Date Picker */}
            <div className="flex items-center space-x-3">
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

      {}
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
                      onClick={() => setScannerActive(false)}
                      className="mt-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs transition-colors"
                    >
                      Detener Cámara
                    </button>
                  </div>
                )}

                {/* Manual Bypass Input for Teacher */}
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
        {/* TAB 2: IMPRESIÓN Y GENERADOR DE GAFETES */}
        {/* ==================================================================== */}
        {activeTab === 'gafetes' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Gafetes de Alumnos con Código QR</h2>
                <p className="text-xs text-slate-500">
                  Imprime estas credenciales para tus alumnos. Cada código redirige a su ID exclusivo reconocido por la cámara.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Todos los Gafetes</span>
              </button>
            </div>

            {/* Printable Gafete Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4">
              {students.map((student) => {
                // QR server standard printable image URL
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${student.id}`;

                return (
                  <div
                    key={student.id}
                    className="bg-white border-2 border-indigo-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between print:break-inside-avoid print:border-slate-800"
                  >
                    {/* Header Gafete Banner */}
                    <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-3 text-center">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest block text-indigo-200">
                        ESCUELA PRIMARIA SEP
                      </span>
                      <h3 className="text-xs font-bold tracking-wide">GAFETE ESCOLAR</h3>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex flex-col items-center text-center space-y-3">
                      {/* Photo/Avatar */}
                      <div className="relative">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-20 h-20 rounded-full border-2 border-indigo-500 object-cover shadow-sm"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-indigo-950 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white">
                          #{student.number}
                        </span>
                      </div>

                      {/* Name & Details */}
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                          {student.name}
                        </h4>
                        <p className="text-[11px] font-semibold text-indigo-600 mt-0.5">
                          Grupo: {student.group}
                        </p>
                      </div>

                      {/* QR Code */}
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex flex-col items-center">
                        <img src={qrUrl} alt={`QR ${student.name}`} className="w-28 h-28 object-contain" />
                        <span className="text-[9px] font-mono text-slate-500 mt-1 font-bold">
                          {student.id}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-100 p-2 text-center text-[9px] text-slate-500 border-t border-slate-200 font-medium">
                      Planificador Docente • Ciclo Escolar
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: HISTORIAL DE ASISTENCIA Y CALENDARIO SEP */}
        {/* ==================================================================== */}
        {activeTab === 'asistencia' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Historial Diario conforme al Calendario SEP</h2>
                <p className="text-xs text-slate-500">
                  Resumen de asistencias registrado mediante escaneo. Mapeado con días lectivos y fechas oficiales.
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

            {/* Attendance Matrix Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Nombre del Alumno</th>
                    <th className="p-3 text-center">Estatus Hoy ({selectedDate})</th>
                    <th className="p-3 text-center">Total Asistencias</th>
                    <th className="p-3 text-center">% Asistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => {
                    const todayAttendanceList = attendance[selectedDate] || [];
                    const isPresentToday = todayAttendanceList.includes(st.id);
                    
                    // Total days recorded calculation
                    const totalDaysRecorded = Object.keys(attendance).length || 1;
                    const studentTotalPresent = Object.values(attendance).filter(list => list.includes(st.id)).length;
                    const percentage = Math.round((studentTotalPresent / totalDaysRecorded) * 100);

                    return (
                      <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono text-slate-500 font-bold">{st.number}</td>
                        <td className="p-3 font-medium text-slate-900 flex items-center space-x-2">
                          <img src={st.avatar} alt="" className="w-6 h-6 rounded-full" />
                          <span>{st.name}</span>
                        </td>
                        <td className="p-3 text-center">
                          {isPresentToday ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Presente</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full font-bold">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Falta</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-semibold text-slate-700">
                          {studentTotalPresent} / {totalDaysRecorded} días
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-bold px-2 py-0.5 rounded ${
                            percentage >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {percentage}%
                          </span>
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
        {/* TAB 4: CONCENTRADO DE TRABAJOS DIARIOS */}
        {/* ==================================================================== */}
        {activeTab === 'trabajos' && (
          <div className="space-y-6">
            {/* Header Create Task */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Concentrado de Trabajos y Tareas Diarias</h2>
                <p className="text-xs text-slate-500">
                  Crea una actividad para el día seleccionado. Los alumnos escanean su gafete para marcar su entrega.
                </p>
              </div>

              {/* Form Create Assignment */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  handleCreateAssignment(form.title.value, form.subject.value);
                  form.reset();
                }}
                className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto"
              >
                <input
                  name="title"
                  type="text"
                  placeholder="Título del Trabajo..."
                  required
                  className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  name="subject"
                  className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2"
                >
                  <option value="Español">Español</option>
                  <option value="Matemáticas">Matemáticas</option>
                  <option value="Ciencias N.">Ciencias N.</option>
                  <option value="Historia">Historia</option>
                  <option value="Formación C.">Formación C.</option>
                </select>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Trabajo</span>
                </button>
              </form>
            </div>

            {/* Assignments List & Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Assignments list column */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Trabajos de la Fecha ({selectedDate})
                </h3>
                {assignments.filter(a => a.date === selectedDate).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay actividades creadas para esta fecha.</p>
                ) : (
                  assignments.filter(a => a.date === selectedDate).map((asg) => {
                    const count = (submissions[asg.id] || []).length;
                    const isSelected = selectedAssignmentId === asg.id;

                    return (
                      <div
                        key={asg.id}
                        onClick={() => setSelectedAssignmentId(asg.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                            {asg.subject}
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            {count} / {students.length} entregas
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mt-2">{asg.title}</h4>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Submissions Detail Grid */}
              <div className="md:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">
                  Estatus de Entregas por Alumno
                </h3>

                {!selectedAssignmentId ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    Selecciona un trabajo de la izquierda para ver quién lo ha entregado.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                    {students.map((st) => {
                      const submittedList = submissions[selectedAssignmentId] || [];
                      const hasSubmitted = submittedList.includes(st.id);

                      return (
                        <div
                          key={st.id}
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            hasSubmitted ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <img src={st.avatar} alt="" className="w-7 h-7 rounded-full" />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{st.name}</p>
                              <p className="text-[10px] text-slate-400">#{st.number}</p>
                            </div>
                          </div>

                          {hasSubmitted ? (
                            <span className="text-emerald-600 flex items-center space-x-1 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Entregado</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setSubmissions(prev => ({
                                  ...prev,
                                  [selectedAssignmentId]: [...submittedList, st.id]
                                }));
                              }}
                              className="text-[10px] text-slate-500 hover:text-indigo-600 underline font-medium"
                            >
                              Marcar Manual
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
                  Selecciona al azar un alumno para pasar al pisaarrón o responder. <strong className="text-indigo-600">Filtra automáticamente solo a los alumnos que escanearon su asistencia hoy ({selectedDate}).</strong>
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

                          // Vibrant alternating wheel colors
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

                  {/* Winner Display Modal/Card */}
                  {winnerStudent && !spinning && (
                    <div className="bg-gradient-to-br from-yellow-100 to-amber-200 border-2 border-yellow-400 p-6 rounded-2xl text-center shadow-xl w-full animate-bounce">
                      <span className="text-xs font-black uppercase text-amber-800 tracking-widest block mb-1">
                        ¡ALUMNO SELECCIONADO!
                      </span>
                      <img
                        src={winnerStudent.avatar}
                        alt=""
                        className="w-20 h-20 rounded-full mx-auto border-4 border-amber-500 shadow-md my-2"
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
                  Agrega o edita alumnos. Cada alumno tiene un ID autogenerado para su código QR.
                </p>
              </div>

              <button
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
                        <img src={st.avatar} alt="" className="w-8 h-8 rounded-full border" />
                      </td>
                      <td className="p-3 font-extrabold text-slate-900">{st.name}</td>
                      <td className="p-3 font-mono text-indigo-600 font-bold">{st.id}</td>
                      <td className="p-3 font-medium text-slate-600">{st.group}</td>
                      <td className="p-3 text-right">
                        <button
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

      {}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-fadeIn">
            <h3 className="text-base font-bold text-slate-800 mb-4">Agregar Nuevo Alumno</h3>
            <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nombre Completo:</label>
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

              <div>
                <label className="block font-semibold text-slate-600 mb-1">URL Foto (Opcional):</label>
                <input
                  type="url"
                  placeholder="Dejar vacío para avatar automático"
                  value={newStudent.avatar}
                  onChange={(e) => setNewStudent({ ...newStudent, avatar: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Guardar Alumno
                </button>
              </div>
            </form>
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