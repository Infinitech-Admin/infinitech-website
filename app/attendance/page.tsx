"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Loader2,
  Clock,
  User,
  LogIn,
  LogOut,
  Timer,
  Sun,
  Moon,
  Lock,
  ShieldAlert,
  TrendingUp,
  Calendar,
  Download,
  Ban,
} from "lucide-react";
import jsPDF from "jspdf";

/* ─── types ────────────────────────────────────────────── */
type Phase = "nameEntry" | "timeIn" | "timeOut" | "done";

interface ExistingRecord {
  full_name: string;
  time_in: string;
  time_out: string | null;
}

interface RegisteredTrainee {
  id: number;
  full_name: string;
}

interface TotalHoursData {
  total_minutes: number;
  total_hours: string;
  total_days: number;
  completed_days: number;
}

interface AttendanceRecord {
  id: number;
  full_name: string;
  date: string;
  time_in: string;
  time_out: string | null;
  total_minutes: number | null;
}

/* ─── helpers ──────────────────────────────────────────── */
const nowDate = (): Date => new Date();
const pad = (n: number): string => String(n).padStart(2, "0");
const formatTime = (d: Date): string => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function computeHours(timeIn: string, timeOut: string): string | null {
  if (!timeIn || !timeOut) return null;
  const [ih, im] = timeIn.split(":").map(Number);
  const [oh, om] = timeOut.split(":").map(Number);
  const diff = (oh * 60 + om) - (ih * 60 + im);
  if (diff <= 0) return null;
  return `${Math.floor(diff / 60)}h ${pad(diff % 60)}m`;
}

function formatHoursMinutes(minutes: number | null): string {
  if (!minutes || minutes === 0) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${pad(mins)}m`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function getDayName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/* ─── API helpers ── */
const BASE = "";

async function fetchRegisteredTrainees(): Promise<RegisteredTrainee[]> {
  const res = await fetch(`${BASE}/api/trainees`);
  const data = await res.json();
  return data.trainees || [];
}

async function fetchRecord(name: string): Promise<ExistingRecord | null> {
  const res = await fetch(`${BASE}/api/attendance/lookup?name=${encodeURIComponent(name)}`);
  const data = await res.json();
  return data.record || null;
}

async function fetchTotalHours(name: string): Promise<TotalHoursData | null> {
  const res = await fetch(`${BASE}/api/attendance/total?name=${encodeURIComponent(name)}`);
  const data = await res.json();
  return data.success ? data : null;
}

async function fetchAllRecords(name: string): Promise<AttendanceRecord[]> {
  const res = await fetch(`${BASE}/api/attendance/history?name=${encodeURIComponent(name)}`);
  const data = await res.json();
  return data.success ? data.records || [] : [];
}

async function postTimeIn(name: string, timeIn: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${BASE}/api/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: name, time_in: timeIn }),
  });
  return res.json();
}

async function putTimeOut(name: string, timeOut: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${BASE}/api/attendance`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: name, time_out: timeOut }),
  });
  return res.json();
}

/* ─── Load logo as base64 ── */
async function getLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch('/images/logo.png');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load logo:', error);
    return null;
  }
}

/* ─── PDF Generation Helper ── */
async function generatePDF(records: AttendanceRecord[], name: string, totalHours: string, completedDays: number) {
  const doc = new jsPDF();
  
  // Colors
  const primaryBlue = [43, 76, 159];
  const accentGold = [251, 191, 36];
  const textGray = [100, 116, 139];
  const lightGray = [241, 245, 249];
  const lightBlue = [96, 165, 250];
  
  // Load logo
  const logoBase64 = await getLogoBase64();
  
  // Function to add watermark on each page
  const addWatermark = () => {
    doc.setTextColor(220, 235, 252);
    doc.setFontSize(60);
    doc.setFont("helvetica", "bold");
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.text("INFINITECH", pageWidth / 2, pageHeight / 2, {
      align: "center",
      angle: 45,
    });
  };
  
  // Function to add footer on each page
  const addFooter = (pageNumber: number, totalPages: number) => {
    const footerY = 285;
    
    doc.setFontSize(7);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFont("helvetica", "bold");
    doc.text("INFINITECH Advertising Corporation", 105, footerY, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("311 Campos Rueda Building, Urban Avenue, Makati City", 105, footerY + 3, { align: "center" });
    doc.text("Tel no.: (02)7001-6157 | Mobile no.: (+63) 919-587-4915 | Email: infinitechcorp.ph@gmail.com", 105, footerY + 6, { align: "center" });
    
    doc.setFontSize(8);
    doc.text(`Page ${pageNumber} of ${totalPages}`, 105, footerY + 11, { align: "center" });
  };
  
  addWatermark();
  
  // Header Section with Logo
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 0, 210, 50, 'F');
  
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 15, 10, 30, 30);
    } catch (e) {
      console.error('Failed to add logo to PDF:', e);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("INFINITECH", 20, 28);
    }
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFINITECH", 20, 28);
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("OJT Attendance Report", 105, 25, { align: "center" });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(name, 105, 35, { align: "center" });
  
  // Summary Section
  let yPos = 60;
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, yPos);
  
  yPos += 15;
  
  // Summary Box
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(20, yPos, 170, 30, 3, 3, 'F');
  
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 25, yPos + 10);
  
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Total Hours: ${totalHours}`, 25, yPos + 18);
  doc.text(`Days Completed: ${completedDays}`, 25, yPos + 25);
  
  yPos += 45;
  
  // Table Header
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(20, yPos, 170, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Date", 25, yPos + 7);
  doc.text("Time In", 70, yPos + 7);
  doc.text("Time Out", 110, yPos + 7);
  doc.text("Total Hours", 155, yPos + 7);
  
  yPos += 10;
  
  // Table Rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  
  let isAlternate = false;
  let currentPage = 1;
  
  records.forEach((record, index) => {
    if (yPos > 265) {
      addFooter(currentPage, Math.ceil(records.length / 20) + 1);
      
      doc.addPage();
      currentPage++;
      addWatermark();
      
      yPos = 20;
      
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.rect(20, yPos, 170, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Date", 25, yPos + 7);
      doc.text("Time In", 70, yPos + 7);
      doc.text("Time Out", 110, yPos + 7);
      doc.text("Total Hours", 155, yPos + 7);
      
      yPos += 10;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      isAlternate = false;
    }
    
    if (isAlternate) {
      doc.setFillColor(249, 250, 251);
      doc.rect(20, yPos, 170, 8, 'F');
    }
    
    const date = formatDate(record.date);
    const timeOut = record.time_out || "—";
    const hours = formatHoursMinutes(record.total_minutes);
    
    doc.setFontSize(9);
    doc.text(date, 25, yPos + 6);
    doc.text(record.time_in, 70, yPos + 6);
    doc.text(timeOut, 110, yPos + 6);
    doc.text(hours, 155, yPos + 6);
    
    yPos += 8;
    isAlternate = !isAlternate;
  });
  
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(i, pageCount);
  }
  
  doc.save(`${name.replace(/\s+/g, '_')}_Attendance_Report.pdf`);
}

/* ═══════════════════ COMPONENT ═════════════════════════ */
export default function AttendanceForm() {
  const { toast } = useToast();
  const [phase, setPhase]                   = useState<Phase>("nameEntry");
  const [name, setName]                     = useState<string>("");
  const [existingTimeIn, setExistingTimeIn] = useState<string>("");
  const [loading, setLoading]               = useState<boolean>(false);
  const [error, setError]                   = useState<string>("");
  const [currentTime, setCurrentTime]       = useState<Date>(nowDate());
  const [completedPhase, setCompletedPhase] = useState<"timeIn"|"timeOut">("timeIn");
  const [registeredTrainees, setRegisteredTrainees] = useState<RegisteredTrainee[]>([]);
  const [loadingTrainees, setLoadingTrainees] = useState<boolean>(true);
  const [totalHoursData, setTotalHoursData] = useState<TotalHoursData | null>(null);
  const [loadingTotalHours, setLoadingTotalHours] = useState<boolean>(false);
  const [downloadingReport, setDownloadingReport] = useState<boolean>(false);
  const [isWeekend, setIsWeekend] = useState<boolean>(false);

  useEffect(() => {
    const tick = setInterval(() => {
      const now = nowDate();
      setCurrentTime(now);
      
      // Check if it's weekend (0 = Sunday, 6 = Saturday)
      const dayOfWeek = now.getDay();
      setIsWeekend(dayOfWeek === 0 || dayOfWeek === 6);
    }, 1_000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const loadTrainees = async () => {
      try {
        const trainees = await fetchRegisteredTrainees();
        setRegisteredTrainees(trainees);
      } catch (error) {
        console.error("Failed to load registered trainees:", error);
        toast({
          title: "Warning",
          description: "Unable to load registered trainees list.",
          variant: "destructive",
        });
      } finally {
        setLoadingTrainees(false);
      }
    };
    loadTrainees();
  }, [toast]);

  const currentHHMM: string = formatTime(currentTime);
  const isPast5PM: boolean  = currentTime.getHours() >= 17;
  
  const isTimeInOpen: boolean = (() => {
    if (isWeekend) return false; // BLOCKED ON WEEKENDS
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const timeInStartMinutes = 7 * 60 + 50;
    return totalMinutes >= timeInStartMinutes;
  })();

  const isRegistered = (name: string): boolean => {
    return registeredTrainees.some(
      trainee => trainee.full_name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  /* ── download report ── */
  const handleDownloadReport = async () => {
    if (!name.trim()) return;
    
    setDownloadingReport(true);
    try {
      const records = await fetchAllRecords(name.trim());
      
      if (records.length === 0) {
        toast({
          title: "No Records",
          description: "You don't have any attendance records yet.",
          variant: "destructive",
        });
        return;
      }
      
      const totalData = totalHoursData || await fetchTotalHours(name.trim());
      await generatePDF(
        records, 
        name.trim(), 
        totalData?.total_hours || "0h 00m",
        totalData?.completed_days || 0
      );
      
      toast({
        title: "Download Complete! 📥",
        description: "Your attendance report has been downloaded as PDF.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Unable to download your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingReport(false);
    }
  };

  /* ── name entry ── */
  const handleNameSubmit = async (): Promise<void> => {
    if (!name.trim()) { 
      setError("Please enter your full name."); 
      toast({
        title: "Name Required",
        description: "Please enter your full name to continue.",
        variant: "destructive",
      });
      return; 
    }

    if (!isRegistered(name.trim())) {
      setError("You are not registered in the system.");
      toast({
        title: "Access Denied",
        description: "This name is not registered. Please contact your supervisor.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true); 
    setError("");
    
    try {
      setLoadingTotalHours(true);
      const totalData = await fetchTotalHours(name.trim());
      setTotalHoursData(totalData);
      setLoadingTotalHours(false);

      const record = await fetchRecord(name.trim());
      
      if (!record) {
        setPhase("timeIn");
        toast({
          title: "Welcome!",
          description: `Hi ${name}! Please record your Time In.`,
        });
      } else if (record.time_out) {
        setError("You have already timed out for today.");
        toast({
          title: "Already Completed",
          description: "You have already timed out for today. See you tomorrow!",
          variant: "destructive",
        });
      } else {
        setExistingTimeIn(record.time_in);
        setPhase("timeOut");
        toast({
          title: "Welcome Back!",
          description: `Your Time In was recorded at ${record.time_in}. You can now Time Out.`,
        });
      }
    } catch {
      setError("Something went wrong. Please try again.");
      toast({
        title: "Connection Error",
        description: "Unable to check your attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ── time in ── */
  const handleTimeInSubmit = async (): Promise<void> => {
    // WEEKEND CHECK
    if (isWeekend) {
      setError("Time In is disabled on weekends.");
      toast({
        title: "Weekend Mode 🚫",
        description: "Attendance is not allowed on weekends. Come back Monday!",
        variant: "destructive",
      });
      return;
    }

    const now = nowDate();
    const currentTimeStr = formatTime(now);
    
    const [hours, minutes] = currentTimeStr.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const minTimeInMinutes = 7 * 60 + 50;
    
    if (timeInMinutes < minTimeInMinutes) {
      setError("Time In cannot be before 7:50 AM.");
      toast({
        title: "Too Early",
        description: "Time In must be 7:50 AM or later. Please wait.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true); 
    setError("");
    
    try {
      const res = await postTimeIn(name.trim(), currentTimeStr);
      if (res.success) { 
        setCompletedPhase("timeIn"); 
        setPhase("done"); 
        toast({
          title: "Time In Recorded! 🎉",
          description: `Successfully logged in at ${currentTimeStr}. Have a productive day!`,
        });
      }
      else { 
        const record = await fetchRecord(name.trim());
        if (record && !record.time_out) {
          setExistingTimeIn(record.time_in);
          setPhase("timeOut");
          setError("");
          toast({
            title: "Already Timed In",
            description: `You already timed in at ${record.time_in}. You can now Time Out.`,
          });
          return;
        } else if (record && record.time_out) {
          setError("You have already timed out for today.");
          toast({
            title: "Already Completed",
            description: "You have already timed out for today. See you tomorrow!",
            variant: "destructive",
          });
          return;
        }
        
        setError(res.message || "Failed to save."); 
        toast({
          title: "Failed to Save",
          description: res.message || "Unable to record your Time In. Please try again.",
          variant: "destructive",
        });
      }
    } catch { 
      setError("Something went wrong. Please try again."); 
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    finally { setLoading(false); }
  };

  /* ── time out ── */
  const handleTimeOutSubmit = async (): Promise<void> => {
    // WEEKEND CHECK
    if (isWeekend) {
      setError("Time Out is disabled on weekends.");
      toast({
        title: "Weekend Mode 🚫",
        description: "Attendance is not allowed on weekends. Come back Monday!",
        variant: "destructive",
      });
      return;
    }

    const now = nowDate();
    const currentTimeStr = formatTime(now);
    
    if (currentTimeStr <= existingTimeIn) { 
      setError("Time Out must be after Time In."); 
      toast({
        title: "Invalid Time",
        description: "Time Out must be after your Time In.",
        variant: "destructive",
      });
      return; 
    }
    
    setLoading(true); 
    setError("");
    
    try {
      const res = await putTimeOut(name.trim(), currentTimeStr);
      if (res.success) { 
        setCompletedPhase("timeOut"); 
        setPhase("done"); 
        const totalHours = computeHours(existingTimeIn, currentTimeStr);
        toast({
          title: "Time Out Recorded! 👋",
          description: `You worked ${totalHours || "—"} today. Great job!`,
        });
        
        const totalData = await fetchTotalHours(name.trim());
        setTotalHoursData(totalData);
      }
      else { 
        setError(res.message || "Failed to save."); 
        toast({
          title: "Failed to Save",
          description: res.message || "Unable to record your Time Out. Please try again.",
          variant: "destructive",
        });
      }
    } catch { 
      setError("Something went wrong. Please try again."); 
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    finally { setLoading(false); }
  };

  /* ── reset ── */
  const reset = (): void => {
    setPhase("nameEntry"); 
    setName(""); 
    setExistingTimeIn(""); 
    setError("");
    setTotalHoursData(null);
  };

  /* ─── shared style helpers ─── */
  const cardStyle: React.CSSProperties = {
    background:"rgba(255,255,255,0.92)", backdropFilter:"blur(14px)",
    borderRadius:24, boxShadow:"0 20px 60px rgba(0,0,0,0.1)",
    border:"1px solid rgba(255,255,255,0.6)",
    width:"100%", maxWidth:520, margin:"0 auto", padding:"32px 24px",
  };

  const inp = (hasErr:boolean, color="#2b4c9f"): React.CSSProperties => ({
    width:"100%", boxSizing:"border-box" as const, height:50, borderRadius:14,
    padding:"0 16px", fontSize:15, fontWeight:600, background:"#fff", outline:"none",
    border:`2px solid ${hasErr?"#ef4444":"#e2e8f0"}`, color, colorScheme:"light" as const,
  });

  const readOnly: React.CSSProperties = {
    width:"100%", boxSizing:"border-box" as const, height:50, borderRadius:14,
    padding:"0 16px", fontSize:15, fontWeight:700,
    background:"#eef2ff", border:"2px solid #c7d2fe", color:"#2b4c9f",
  };

  const disabled: React.CSSProperties = {
    width:"100%", boxSizing:"border-box" as const, height:50, borderRadius:14,
    padding:"0 16px", fontSize:15, fontWeight:600,
    background:"#f1f5f9", border:"2px dashed #cbd5e1", color:"#94a3b8",
    display:"flex", alignItems:"center", gap:8, cursor:"not-allowed",
  };

  const autoTimeDisplay: React.CSSProperties = {
    width:"100%", boxSizing:"border-box" as const, minHeight:50, borderRadius:14,
    padding:"12px 16px", fontSize:15, fontWeight:700,
    background:"linear-gradient(135deg,#10b981,#059669)", 
    border:"2px solid #34d399", 
    color:"#fff",
    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
  };

  const lbl: React.CSSProperties = {
    display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600,
    textTransform:"uppercase" as const, letterSpacing:"0.06em",
    color:"#64748b", marginBottom:8,
  };

  const btn = (off=false): React.CSSProperties => ({
    width:"100%", height:50, borderRadius:14,
    background: off ? "#cbd5e1" : "linear-gradient(135deg,#2b4c9f,#3b5faf)",
    border:"none", color:"#fff", fontSize:16, fontWeight:700,
    cursor: off ? "not-allowed" : "pointer",
    boxShadow: off ? "none" : "0 4px 16px rgba(43,76,159,0.4)",
    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
  });

  const backBtn: React.CSSProperties = {
    width:"100%", height:42, marginTop:10, borderRadius:12,
    border:"2px solid #e2e8f0", background:"#fff",
    color:"#64748b", fontSize:14, fontWeight:600, cursor:"pointer",
  };

  const downloadBtn: React.CSSProperties = {
    width:"100%", height:42, marginTop:10, borderRadius:12,
    border:"2px solid #fbbf24", background:"linear-gradient(135deg,#fbbf24,#f59e0b)",
    color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer",
    display:"flex", alignItems:"center", justifyContent:"center", gap:6,
  };

  /* ═══════════════════ RENDER ═════════════════════════ */
  return (
    <div className="min-h-screen w-full"
      style={{ paddingTop:"6rem", paddingBottom:"3rem", paddingLeft:"1rem", paddingRight:"1rem", background:"linear-gradient(135deg,#eef2ff 0%,#dbeafe 50%,#fef3c7 100%)" }}
    >
      {/* bg blobs */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex:0 }}>
        <div style={{ position:"absolute", top:"-10%", right:"-10%", width:500, height:500, background:"radial-gradient(circle,rgba(43,76,159,0.12),transparent 70%)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", bottom:"-15%", left:"-10%", width:600, height:600, background:"radial-gradient(circle,rgba(251,191,36,0.1),transparent 70%)", borderRadius:"50%" }} />
      </div>

      <div className="relative w-full" style={{ zIndex:10 }}>
        {/* header */}
        <div className="text-center" style={{ maxWidth:520, margin:"0 auto 16px" }}>
          <h1 style={{ fontSize:"clamp(22px,4vw,34px)", fontWeight:800, lineHeight:1.2, background:"linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>
            OJT Attendance Sheet
          </h1>
          <p style={{ color:"#64748b", fontSize:15, margin:0 }}>Log your on-the-job training hours</p>
        </div>

        {/* WEEKEND WARNING BANNER */}
        {isWeekend && (
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2"
              style={{ background:"linear-gradient(135deg,rgba(239,68,68,0.15),rgba(220,38,38,0.1))", backdropFilter:"blur(8px)", borderRadius:14, padding:"12px 20px", boxShadow:"0 4px 16px rgba(239,68,68,0.3)", border:"2px solid rgba(239,68,68,0.4)", maxWidth:480 }}
            >
              <Ban size={20} color="#dc2626" />
              <div>
                <p style={{ fontWeight:700, color:"#dc2626", fontSize:14, margin:0 }}>
                  Weekend Mode Active
                </p>
                <p style={{ color:"#991b1b", fontSize:12, margin:0 }}>
                  Attendance is disabled on {getDayName(currentTime)}. Come back on Monday!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* clock badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2"
            style={{ 
              background: isWeekend ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.85)", 
              backdropFilter:"blur(8px)", 
              borderRadius:14, 
              padding:"8px 16px", 
              boxShadow:"0 2px 12px rgba(0,0,0,0.08)", 
              border: isWeekend ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.6)"
            }}
          >
            {isPast5PM ? <Moon size={16} color="#2b4c9f" /> : <Sun size={16} color="#f59e0b" />}
            <span style={{ fontWeight:700, color: isWeekend ? "#dc2626" : "#1e293b", fontSize:14 }}>{currentHHMM}</span>
            <span style={{ color: isWeekend ? "#dc2626" : "#94a3b8", fontSize:12 }}>
              {getDayName(currentTime)}
              {isWeekend && " — Closed"}
            </span>
          </div>
        </div>

        {/* Total Hours Badge - Shows after name entry */}
        {totalHoursData && phase !== "nameEntry" && (
          <div className="flex justify-center mb-5">
            <div className="inline-flex flex-col items-center gap-1"
              style={{ background:"linear-gradient(135deg,rgba(251,191,36,0.15),rgba(245,158,11,0.1))", backdropFilter:"blur(8px)", borderRadius:16, padding:"12px 20px", boxShadow:"0 4px 16px rgba(251,191,36,0.2)", border:"2px solid rgba(251,191,36,0.3)" }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={18} color="#f59e0b" />
                <span style={{ fontWeight:700, color:"#1e293b", fontSize:16 }}>
                  Total Hours: {totalHoursData.total_hours}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs" style={{ color:"#64748b" }}>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {totalHoursData.completed_days} days completed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ════ NAME ENTRY ════ */}
        {phase === "nameEntry" && (
          <div style={cardStyle}>
            {loadingTrainees ? (
              <div className="text-center py-8">
                <Loader2 size={32} className="animate-spin mx-auto mb-3" color="#2b4c9f" />
                <p style={{ color:"#64748b", fontSize:14 }}>Loading registered trainees...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-5">
                  <div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#2b4c9f,#3b5faf)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(43,76,159,0.35)" }}>
                    <Timer size={28} color="#fff" />
                  </div>
                </div>
                <h2 className="text-center" style={{ fontSize:21, fontWeight:700, color:"#1e293b", margin:"0 0 4px" }}>Hi, Trainee!</h2>
                <p className="text-center" style={{ color:"#64748b", fontSize:14, margin:"0 0 12px" }}>
                  Enter your full name to get started.
                </p>

                {/* Registered trainees notice */}
                <div className="mb-4 p-3 rounded-lg" style={{ background:"#f8fafc", border:"1px solid #e2e8f0" }}>
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={16} color="#64748b" style={{ marginTop:2, flexShrink:0 }} />
                    <div>
                      <p style={{ fontSize:12, color:"#64748b", margin:"0 0 6px", fontWeight:600 }}>
                        Only registered trainees can access this system
                      </p>
                      <p style={{ fontSize:11, color:"#94a3b8", margin:0 }}>
                        {registeredTrainees.length} trainee{registeredTrainees.length !== 1 ? 's' : ''} registered
                      </p>
                    </div>
                  </div>
                </div>

                <div style={lbl}><User size={13} /> Full Name</div>
                <input
                  type="text" placeholder="e.g. Juan dela Cruz"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                  style={inp(!!error && !name.trim())}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#2b4c9f")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = (!!error && !name.trim()) ? "#ef4444" : "#e2e8f0")}
                  disabled={loadingTrainees}
                />
                {error && <p style={{ color:"#ef4444", fontSize:13, marginTop:6 }}>⚠ {error}</p>}

                <button onClick={handleNameSubmit} disabled={loading || loadingTrainees} style={{ ...btn(loading || loadingTrainees), marginTop:20 }}>
                  {loading ? <><Loader2 size={20} className="animate-spin" /> Checking…</> : <><LogIn size={18} /> Continue</>}
                </button>
              </>
            )}
          </div>
        )}

        {/* ════ TIME IN ════ */}
        {phase === "timeIn" && (
          <div style={cardStyle}>
            <div className="flex justify-center mb-4">
              <div style={{ width:52, height:52, borderRadius:16, background: (isTimeInOpen && !isWeekend) ? "linear-gradient(135deg,#2b4c9f,#3b5faf)" : "linear-gradient(135deg,#94a3b8,#cbd5e1)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(43,76,159,0.35)" }}>
                {(isTimeInOpen && !isWeekend) ? <LogIn size={24} color="#fff" /> : <Lock size={22} color="#fff" />}
              </div>
            </div>
            <h2 className="text-center" style={{ fontSize:20, fontWeight:700, color:"#1e293b", margin:"0 0 4px" }}>
              {isWeekend ? "Weekend - Closed" : isTimeInOpen ? "Good Morning!" : "Too Early..."}
            </h2>
            <p className="text-center" style={{ color:"#64748b", fontSize:14, margin:"0 0 20px" }}>
              {isWeekend 
                ? <>Attendance is <strong style={{ color:"#dc2626" }}>disabled on weekends</strong>. Come back Monday!</>
                : isTimeInOpen 
                ? <>Click below to record your Time In, <strong style={{ color:"#2b4c9f" }}>{name}</strong>.</>
                : <>Time In will be available at <strong>7:50 AM</strong>. Come back later.</>
              }
            </p>

            <div style={lbl}><User size={13} /> Full Name</div>
            <div style={readOnly}>{name}</div>

            <div style={{ ...lbl, marginTop:18 }}>
              <LogIn size={13} /> Time In (Auto-detected)
              {isWeekend && <span style={{ color:"#dc2626", fontWeight:700, letterSpacing:0, textTransform:"none", fontSize:11 }}>🚫 disabled on weekends</span>}
              {!isTimeInOpen && !isWeekend && <span style={{ color:"#f59e0b", fontWeight:700, letterSpacing:0, textTransform:"none", fontSize:11 }}>🔒 opens at 7:50 AM</span>}
            </div>
            
            {(isTimeInOpen && !isWeekend) ? (
              <div style={autoTimeDisplay}>
                <Clock size={18} className="animate-pulse" />
                Current Time: {currentHHMM}
              </div>
            ) : (
              <div style={disabled}>
                <Lock size={16} /> 
                {isWeekend ? "Closed on Weekends" : "Locked until 7:50 AM"}
              </div>
            )}
            
            {error && <p style={{ color:"#ef4444", fontSize:13, marginTop:6 }}>⚠ {error}</p>}

            <button onClick={handleTimeInSubmit} disabled={loading || !isTimeInOpen || isWeekend} style={{ ...btn(loading || !isTimeInOpen || isWeekend), marginTop:22 }}>
              {loading ? <><Loader2 size={20} className="animate-spin" /> Recording…</> : <><CheckCircle2 size={18} /> Record Time In Now</>}
            </button>
            
            <button 
              onClick={handleDownloadReport} 
              disabled={downloadingReport}
              style={downloadBtn}
            >
              {downloadingReport ? (
                <><Loader2 size={16} className="animate-spin" /> Generating PDF...</>
              ) : (
                <><Download size={16} /> Download PDF Report</>
              )}
            </button>
            
            <button onClick={reset} style={backBtn}>← Back</button>
          </div>
        )}

        {/* ════ TIME OUT ════ */}
        {phase === "timeOut" && (
          <div style={cardStyle}>
            <div className="flex justify-center mb-4">
              <div style={{ width:52, height:52, borderRadius:16, background: (isPast5PM && !isWeekend) ? "linear-gradient(135deg,#f59e0b,#fbbf24)" : "linear-gradient(135deg,#94a3b8,#cbd5e1)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(43,76,159,0.2)" }}>
                {(isPast5PM && !isWeekend) ? <LogOut size={24} color="#fff" /> : <Lock size={22} color="#fff" />}
              </div>
            </div>
            <h2 className="text-center" style={{ fontSize:20, fontWeight:700, color:"#1e293b", margin:"0 0 4px" }}>
              {isWeekend ? "Weekend - Closed" : isPast5PM ? "Good Afternoon!" : "Not Yet…"}
            </h2>
            <p className="text-center" style={{ color:"#64748b", fontSize:14, margin:"0 0 20px" }}>
              {isWeekend
                ? <>Attendance is <strong style={{ color:"#dc2626" }}>disabled on weekends</strong>. Come back Monday!</>
                : isPast5PM
                ? <><strong style={{ color:"#2b4c9f" }}>{name}</strong> — click below to record your Time Out.</>
                : <>Time Out will be available at <strong>17:00</strong>. Come back later.</>
              }
            </p>

            <div style={lbl}><User size={13} /> Full Name</div>
            <div style={readOnly}>{name}</div>

            <div style={{ ...lbl, marginTop:18 }}>
              <LogIn size={13} /> Time In
              <span style={{ color:"#10b981", fontWeight:700, letterSpacing:0, textTransform:"none", fontSize:11 }}>✓ recorded</span>
            </div>
            <div style={readOnly}>{existingTimeIn}</div>

            <div style={{ ...lbl, marginTop:18 }}>
              <LogOut size={13} /> Time Out (Auto-detected)
              {isWeekend && <span style={{ color:"#dc2626", fontWeight:700, letterSpacing:0, textTransform:"none", fontSize:11 }}>🚫 disabled on weekends</span>}
              {!isPast5PM && !isWeekend && <span style={{ color:"#f59e0b", fontWeight:700, letterSpacing:0, textTransform:"none", fontSize:11 }}>🔒 opens at 17:00</span>}
            </div>

            {(isPast5PM && !isWeekend) ? (
              <div style={autoTimeDisplay}>
                <Clock size={18} className="animate-pulse" />
                Current Time: {currentHHMM}
              </div>
            ) : (
              <div style={disabled}>
                <Lock size={16} /> 
                {isWeekend ? "Closed on Weekends" : "Locked until 17:00"}
              </div>
            )}

            {(isPast5PM && !isWeekend) && existingTimeIn && (
              <div className="mt-3 flex items-center justify-center gap-2 rounded-lg px-4 py-2"
                style={{ background:"linear-gradient(135deg,#2b4c9f12,#fbbf2412)", border:"1px solid #2b4c9f22" }}
              >
                <Clock size={15} color="#2b4c9f" />
                <span style={{ fontWeight:700, color:"#2b4c9f", fontSize:14 }}>
                  Total: {computeHours(existingTimeIn, currentHHMM) || "—"}
                </span>
              </div>
            )}

            {error && <p style={{ color:"#ef4444", fontSize:13, marginTop:6 }}>⚠ {error}</p>}

            <button onClick={handleTimeOutSubmit} disabled={loading || !isPast5PM || isWeekend} style={{ ...btn(loading || !isPast5PM || isWeekend), marginTop:22 }}>
              {loading ? <><Loader2 size={20} className="animate-spin" /> Recording…</> : <><CheckCircle2 size={18} /> Record Time Out Now</>}
            </button>
            
            <button 
              onClick={handleDownloadReport} 
              disabled={downloadingReport}
              style={downloadBtn}
            >
              {downloadingReport ? (
                <><Loader2 size={16} className="animate-spin" /> Generating PDF...</>
              ) : (
                <><Download size={16} /> Download PDF Report</>
              )}
            </button>
            
            <button onClick={reset} style={backBtn}>← Back</button>
          </div>
        )}

        {/* ════ DONE ════ */}
        {phase === "done" && (
          <div style={{ ...cardStyle, textAlign:"center" as const }}>
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div style={{ position:"absolute", inset:-8, background:"#fbbf24", borderRadius:"50%", filter:"blur(18px)", opacity:0.35 }} />
                <CheckCircle2 size={80} color="#fbbf24" strokeWidth={1.5} className="relative" />
              </div>
            </div>
            <h2 style={{ fontSize:28, fontWeight:800, margin:"0 0 10px", background:"linear-gradient(90deg,#2b4c9f,#fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Saved!
            </h2>
            <p style={{ color:"#64748b", fontSize:15, margin:"0 0 6px" }}>
              {completedPhase === "timeOut" ? "Your Time Out has been recorded." : "Your Time In has been recorded."}
            </p>
            <p style={{ color:"#94a3b8", fontSize:13, margin:"0 0 24px" }}>
              {completedPhase === "timeOut" ? "You're done for today. Have a great evening!" : "Come back after 5:00 PM to Time Out."}
            </p>
            
            {totalHoursData && completedPhase === "timeOut" && (
              <div className="mb-6 p-4 rounded-lg"
                style={{ background:"linear-gradient(135deg,rgba(251,191,36,0.15),rgba(245,158,11,0.1))", border:"2px solid rgba(251,191,36,0.3)" }}
              >
                <p style={{ fontSize:12, color:"#64748b", margin:"0 0 4px", fontWeight:600 }}>Your Grand Total</p>
                <p style={{ fontSize:24, fontWeight:800, color:"#f59e0b", margin:0 }}>
                  {totalHoursData.total_hours}
                </p>
                <p style={{ fontSize:11, color:"#94a3b8", margin:"4px 0 0" }}>
                  across {totalHoursData.completed_days} completed days
                </p>
              </div>
            )}
            
            <div className="flex justify-center gap-2 mb-6">
              {[0,150,300].map((d) => (
                <div key={d} className="w-2.5 h-2.5 rounded-full bg-yellow-400" style={{ animation:"bounce 1.2s infinite", animationDelay:`${d}ms` }} />
              ))}
            </div>
            
            <button onClick={reset} style={{ ...btn(), width:"auto", padding:"0 40px", minWidth:200, marginBottom:12 }}>Done</button>
            
            <button 
              onClick={handleDownloadReport} 
              disabled={downloadingReport}
              style={{ ...downloadBtn, width:"auto", padding:"0 32px", minWidth:200, margin:"0 auto" }}
            >
              {downloadingReport ? (
                <><Loader2 size={16} className="animate-spin" /> Generating PDF...</>
              ) : (
                <><Download size={16} /> Download PDF Report</>
              )}
            </button>
          </div>
        )}

        {/* footer */}
        <p className="text-center" style={{ color:"#94a3b8", fontSize:12, maxWidth:520, margin:"20px auto 0" }}>
          Time In: 7:50 AM onwards • Time Out: After 5:00 PM • <strong style={{ color:"#dc2626" }}>Weekends: Closed</strong>
        </p>
      </div>

      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        input::placeholder{color:#94a3b8}
      `}</style>
    </div>
  );
}
