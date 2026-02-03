"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

/* ─── types ────────────────────────────────────────────── */
type Phase = "nameEntry" | "timeIn" | "timeOut" | "done";

interface ExistingRecord {
  full_name: string;
  time_in: string;
  time_out: string | null;
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

/* ─── API helpers ── */
const BASE = "";

async function fetchRecord(name: string): Promise<ExistingRecord | null> {
  const res = await fetch(`${BASE}/api/attendance/lookup?name=${encodeURIComponent(name)}`);
  const data = await res.json();
  return data.record || null;
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

/* ═══════════════════ COMPONENT ═════════════════════════ */
export default function AttendanceForm() {
  const [phase, setPhase]                   = useState<Phase>("nameEntry");
  const [name, setName]                     = useState<string>("");
  const [timeIn, setTimeIn]                 = useState<string>("");
  const [timeOut, setTimeOut]               = useState<string>("");
  const [existingTimeIn, setExistingTimeIn] = useState<string>("");
  const [loading, setLoading]               = useState<boolean>(false);
  const [error, setError]                   = useState<string>("");
  const [currentTime, setCurrentTime]       = useState<Date>(nowDate());
  const [completedPhase, setCompletedPhase] = useState<"timeIn"|"timeOut">("timeIn");

  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(nowDate()), 1_000);
    return () => clearInterval(tick);
  }, []);

  const currentHHMM: string = formatTime(currentTime);
  const isPast5PM: boolean  = currentTime.getHours() >= 17;

  /* ── name entry ── */
  const handleNameSubmit = async (): Promise<void> => {
    if (!name.trim()) { 
      setError("Please enter your full name."); 
      return; 
    }
    
    setLoading(true); 
    setError("");
    
    try {
      // Check if user already has a record today
      const record = await fetchRecord(name.trim());
      
      if (!record) {
        // No record - go to Time In
        setPhase("timeIn");
      } else if (record.time_out) {
        // Already timed out
        setError("You have already timed out for today.");
      } else {
        // Has time in but no time out - go to Time Out
        setExistingTimeIn(record.time_in);
        setPhase("timeOut");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── time in ── */
  const handleTimeInSubmit = async (): Promise<void> => {
    if (!timeIn) { setError("Please pick your Time In."); return; }
    setLoading(true); setError("");
    try {
      const res = await postTimeIn(name.trim(), timeIn);
      if (res.success) { setCompletedPhase("timeIn"); setPhase("done"); }
      else             { setError(res.message || "Failed to save."); }
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  /* ── time out ── */
  const handleTimeOutSubmit = async (): Promise<void> => {
    if (!timeOut)                      { setError("Please pick your Time Out."); return; }
    if (timeOut <= existingTimeIn)     { setError("Time Out must be after Time In."); return; }
    setLoading(true); setError("");
    try {
      const res = await putTimeOut(name.trim(), timeOut);
      if (res.success) { setCompletedPhase("timeOut"); setPhase("done"); }
      else             { setError(res.message || "Failed to save."); }
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  /* ── reset ── */
  const reset = (): void => {
    setPhase("nameEntry"); setName(""); setTimeIn("");
    setTimeOut(""); setExistingTimeIn(""); setError("");
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

        {/* clock badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2"
            style={{ background:"rgba(255,255,255,0.85)", backdropFilter:"blur(8px)", borderRadius:14, padding:"8px 16px", boxShadow:"0 2px 12px rgba(0,0,0,0.08)", border:"1px solid rgba(255,255,255,0.6)" }}
          >
            {isPast5PM ? <Moon size={16} color="#2b4c9f" /> : <Sun size={16} color="#f59e0b" />}
            <span style={{ fontWeight:700, color:"#1e293b", fontSize:14 }}>{currentHHMM}</span>
            <span style={{ color:"#94a3b8", fontSize:12 }}>
              {isPast5PM ? "— Time Out is now open" : "— Time Out opens at 17:00"}
            </span>
          </div>
        </div>

        {/* ════ NAME ENTRY ════ */}
        {phase === "nameEntry" && (
          <div style={cardStyle}>
            <div className="flex justify-center mb-5">
              <div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#2b4c9f,#3b5faf)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(43,76,159,0.35)" }}>
                <Timer size={28} color="#fff" />
              </div>
            </div>
            <h2 className="text-center" style={{ fontSize:21, fontWeight:700, color:"#1e293b", margin:"0 0 4px" }}>Hi, Trainee!</h2>
            <p className="text-center" style={{ color:"#64748b", fontSize:14, margin:"0 0 22px" }}>
              Enter your full name to get started.
            </p>

            <div style={lbl}><User size={13} /> Full Name</div>
            <input
              type="text" placeholder="e.g. Juan dela Cruz"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              style={inp(!!error && !name.trim())}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#2b4c9f")}
              onBlur={(e) => (e.currentTarget.style.borderColor = (!!error && !name.trim()) ? "#ef4444" : "#e2e8f0")}
            />
            {error && <p style={{ color:"#ef4444", fontSize:13, marginTop:6 }}>⚠ {error}</p>}

            <button onClick={handleNameSubmit} disabled={loading} style={{ ...btn(loading), marginTop:20 }}>
              {loading ? <><Loader2 size={20} className="animate-spin" /> Checking…</> : <><LogIn size={18} /> Time In</>}
            </button>
          </div>
        )}

        {/* ════ TIME IN ════ */}
        {phase === "timeIn" && (
          <div style={cardStyle}>
            <div className="flex justify-center mb-4">
              <div style={{ width:52, height:52, borderRadius:16, background:"linear-gradient(135deg,#2b4c9f,#3b5faf)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(43,76,159,0.35)" }}>
                <LogIn size={24} color="#fff" />
              </div>
            </div>
            <h2 className="text-center" style={{ fontSize:20, fontWeight:700, color:"#1e293b", margin:"0 0 4px" }}>Good Morning!</h2>
            <p className="text-center" style={{ color:"#64748b", fontSize:14, margin:"0 0 20px" }}>
              Pick your Time In for today, <strong style={{ color:"#2b4c9f" }}>{name}</strong>.
            </p>

            <div style={lbl}><User size={13} /> Full Name</div>
            <div style={readOnly}>{name}</div>

            <div style={{ ...lbl, marginTop:18 }}><LogIn size={13} /> Time In</div>
            <input
              type="time" value={timeIn}
              onChange={(e) => { setTimeIn(e.target.value); setError(""); }}
              style={inp(!!error && !timeIn, "#2b4c9f")}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#2b4c9f")}
              onBlur={(e) => (e.currentTarget.style.borderColor = (!!error && !timeIn) ? "#ef4444" : "#e2e8f0")}
            />
            {error && <p style={{ color:"#ef4444", fontSize:13, marginTop:6 }}>⚠ {error}</p>}

            <button onClick={handleTimeInSubmit} disabled={loading} style={{ ...btn(loading), marginTop:22 }}>
              {loading ? <><Loader2 size={20} className="animate-spin" /> Saving…</> : <><CheckCircle2 size={18} /> Submit Time In</>}
            </button>
            <button onClick={reset} style={backBtn}>← Back</button>
          </div>
        )}

        {/* ════ TIME OUT ════ */}
        {phase === "timeOut" && (
          <div style={cardStyle}>
            <div className="flex justify-center mb-4">
              <div style={{ width:52, height:52, borderRadius:16, background: isPast5PM ? "linear-gradient(135deg,#f59e0b,#fbbf24)" : "linear-gradient(135deg,#94a3b8,#cbd5e1)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(43,76,159,0.2)" }}>
                {isPast5PM ? <LogOut size={24} color="#fff" /> : <Lock size={22} color="#fff" />}
              </div>
            </div>
            <h2 className="text-center" style={{ fontSize:20, fontWeight:700, color:"#1e293b", margin:"0 0 4px" }}>
              {isPast5PM ? "Good Afternoon!" : "Not Yet…"}
            </h2>
            <p className="text-center" style={{ color:"#64748b", fontSize:14, margin:"0 0 20px" }}>
              {isPast5PM
                ? <><strong style={{ color:"#2b4c9f" }}>{name}</strong> — pick your Time Out below.</>
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
              <LogOut size={13} /> Time Out
              {!isPast5PM && <span style={{ color:"#f59e0b", fontWeight:700, letterSpacing:0, textTransform:"none", fontSize:11 }}>🔒 opens at 17:00</span>}
            </div>

            {isPast5PM ? (
              <input
                type="time" value={timeOut}
                onChange={(e) => { setTimeOut(e.target.value); setError(""); }}
                style={inp(!!error && !timeOut, "#f59e0b")}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
                onBlur={(e) => (e.currentTarget.style.borderColor = (!!error && !timeOut) ? "#ef4444" : "#e2e8f0")}
              />
            ) : (
              <div style={disabled}><Lock size={16} /> Locked until 17:00</div>
            )}

            {timeOut && existingTimeIn && (
              <div className="mt-3 flex items-center justify-center gap-2 rounded-lg px-4 py-2"
                style={{ background:"linear-gradient(135deg,#2b4c9f12,#fbbf2412)", border:"1px solid #2b4c9f22" }}
              >
                <Clock size={15} color="#2b4c9f" />
                <span style={{ fontWeight:700, color:"#2b4c9f", fontSize:14 }}>
                  Total: {computeHours(existingTimeIn, timeOut) || "—"}
                </span>
              </div>
            )}

            {error && <p style={{ color:"#ef4444", fontSize:13, marginTop:6 }}>⚠ {error}</p>}

            <button onClick={handleTimeOutSubmit} disabled={loading || !isPast5PM} style={{ ...btn(loading || !isPast5PM), marginTop:22 }}>
              {loading ? <><Loader2 size={20} className="animate-spin" /> Saving…</> : <><CheckCircle2 size={18} /> Submit Time Out</>}
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
            <div className="flex justify-center gap-2 mb-6">
              {[0,150,300].map((d) => (
                <div key={d} className="w-2.5 h-2.5 rounded-full bg-yellow-400" style={{ animation:"bounce 1.2s infinite", animationDelay:`${d}ms` }} />
              ))}
            </div>
            <button onClick={reset} style={{ ...btn(), width:"auto", padding:"0 40px", minWidth:200 }}>Done</button>
          </div>
        )}

        {/* footer */}
        <p className="text-center" style={{ color:"#94a3b8", fontSize:12, maxWidth:520, margin:"20px auto 0" }}>
          Morning → Time In • After 5:00 PM → Time Out • Total Hours computed automatically
        </p>
      </div>

      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        input[type="time"]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:0.6}
        input::placeholder{color:#94a3b8}
      `}</style>
    </div>
  );
}
