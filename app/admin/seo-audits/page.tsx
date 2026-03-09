"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  Search, Filter, Trash2, Mail, Globe, Phone, User, Clock,
  CheckCircle2, ChevronLeft, ChevronRight, BarChart3,
  X, Send, Minimize2, Maximize2, ChevronDown, LayoutDashboard,
  RefreshCw, Inbox,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────────
interface Reply {
  id: number
  direction: "outbound"
  from_email: string
  to_email: string
  subject: string
  body: string
  created_at: string
}

interface SeoAudit {
  id: number
  full_name: string
  email: string
  mobile: string
  website_url: string
  status: string
  notes: string | null
  replies: Reply[]
  created_at: string
}

// ─── Gmail Compose Modal ─────────────────────────────────────────────────────
interface ComposeProps {
  audit: SeoAudit
  onClose: () => void
  onSent: (updatedAudit: SeoAudit) => void
}

function GmailCompose({ audit, onClose, onSent }: ComposeProps) {
  const [body, setBody] = useState("")
  const [subject, setSubject] = useState(`Re: SEO Audit — ${audit.website_url}`)
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!minimized) textareaRef.current?.focus()
  }, [minimized])

  const handleSend = async () => {
    if (!body.trim()) { setError("Message body cannot be empty."); return }
    setSending(true)
    setError("")
    try {
      const res = await fetch(`/api/seo-audit/${audit.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reply_body: body,
          subject,
          full_name: audit.full_name,
          email: audit.email,
          website_url: audit.website_url,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || "Failed to send")

      // Optimistically append the reply
      const newReply: Reply = {
        id: data.data?.id ?? Date.now(),
        direction: "outbound",
        from_email: data.data?.from_email ?? "admin",
        to_email: audit.email,
        subject,
        body,
        created_at: new Date().toISOString(),
      }
      onSent({ ...audit, status: "replied", replies: [...(audit.replies ?? []), newReply] })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setSending(false)
    }
  }

  // Minimized pill
  if (minimized) {
    return (
      <div
        className="fixed bottom-0 right-6 z-50 w-64 rounded-t-xl overflow-hidden shadow-2xl cursor-pointer"
        style={{ background: "#1a306e" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          onClick={() => setMinimized(false)}
        >
          <span className="text-white text-sm font-semibold truncate">
            New Message — {audit.full_name}
          </span>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMinimized(false)} className="text-white/70 hover:text-white"><Maximize2 className="w-3.5 h-3.5" /></button>
            <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "fixed z-50 shadow-2xl rounded-t-xl overflow-hidden flex flex-col",
        maximized
          ? "inset-4 rounded-xl"
          : "bottom-0 right-6 w-[520px]",
      )}
      style={{ maxHeight: maximized ? "calc(100vh - 32px)" : "520px" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 select-none"
        style={{ background: "#1a306e" }}
      >
        <span className="text-white text-sm font-semibold">New Message</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setMinimized(true)} className="text-white/70 hover:text-white transition-colors">
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setMaximized((m) => !m)} className="text-white/70 hover:text-white transition-colors">
            {maximized ? <Minimize2 className="w-3.5 h-3.5 rotate-45" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="bg-white flex flex-col flex-1 min-h-0">
        {/* To */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100">
          <span className="text-xs text-slate-400 w-12 flex-shrink-0">To</span>
          <span className="text-sm text-slate-700">{audit.email}</span>
        </div>

        {/* Subject */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100">
          <span className="text-xs text-slate-400 w-12 flex-shrink-0">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 text-sm text-slate-700 outline-none bg-transparent"
          />
        </div>

        {/* Body */}
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Hi ${audit.full_name},\n\n`}
          className="flex-1 px-4 py-3 text-sm text-slate-700 resize-none outline-none min-h-0"
          style={{ fontFamily: "inherit" }}
        />

        {error && (
          <p className="text-red-500 text-xs px-4 pb-2">{error}</p>
        )}

        {/* Toolbar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-t border-slate-100 flex-shrink-0"
        >
          <button
            onClick={handleSend}
            disabled={sending || !body.trim()}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white transition-all",
              sending || !body.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:opacity-90 active:scale-95",
            )}
            style={{ background: "linear-gradient(135deg, #0d1b3e, #1a306e)" }}
          >
            {sending ? (
              <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</>
            ) : (
              <><Send className="w-3.5 h-3.5" /> Send</>
            )}
          </button>

          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Thread Drawer ───────────────────────────────────────────────────────────
interface ThreadDrawerProps {
  audit: SeoAudit
  onClose: () => void
  onReply: () => void
  onStatusChange: (id: number, status: string) => void
}

function ThreadDrawer({ audit, onClose, onReply, onStatusChange }: ThreadDrawerProps) {
  const statusColors: Record<string, string> = {
    pending:     "bg-amber-100 text-amber-700 border-amber-200",
    replied:     "bg-blue-100 text-blue-700 border-blue-200",
    in_progress: "bg-purple-100 text-purple-700 border-purple-200",
    completed:   "bg-green-100 text-green-700 border-green-200",
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1a306e 100%)" }}
        >
          <div>
            <h2 className="text-white font-bold text-base">{audit.full_name}</h2>
            <p className="text-white/60 text-xs mt-0.5">{audit.email}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meta */}
        <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <a href={audit.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
              {audit.website_url}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            {audit.mobile}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <Select value={audit.status} onValueChange={(v) => onStatusChange(audit.id, v)}>
              <SelectTrigger className={cn("w-36 h-7 text-xs border", statusColors[audit.status] || statusColors.pending)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-slate-400">
              {new Date(audit.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Conversation thread */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-slate-50/60">
          {/* Original inquiry */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #f5a623, #e8891a)" }}>
                {audit.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">{audit.full_name}</p>
                <p className="text-xs text-slate-400">{new Date(audit.created_at).toLocaleString()}</p>
              </div>
              <span className="ml-auto text-xs bg-amber-50 text-amber-600 border border-amber-200 rounded-full px-2 py-0.5">Inquiry</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Requested a free SEO audit for{" "}
              <a href={audit.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">
                {audit.website_url}
              </a>
            </p>
          </div>

          {/* Reply bubbles */}
          {(audit.replies ?? []).map((reply) => (
            <div key={reply.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #0d1b3e, #1a306e)" }}>
                  A
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">You (Admin)</p>
                  <p className="text-xs text-slate-400">{new Date(reply.created_at).toLocaleString()}</p>
                </div>
                <span className="ml-auto text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2 py-0.5">Sent</span>
              </div>
              {reply.subject && (
                <p className="text-xs font-semibold text-slate-500 mb-1">{reply.subject}</p>
              )}
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{reply.body}</p>
            </div>
          ))}

          {(audit.replies ?? []).length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No replies yet. Click Reply to start the conversation.</p>
            </div>
          )}
        </div>

        {/* Reply button bar */}
        <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
          <button
            onClick={onReply}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white w-full justify-center transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #0d1b3e, #1a306e)" }}
          >
            <Mail className="w-4 h-4" />
            Reply to {audit.full_name}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Status helpers ──────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; className: string }> = {
  pending:     { label: "Pending",     className: "bg-amber-100 text-amber-700 border border-amber-200" },
  replied:     { label: "Replied",     className: "bg-blue-100 text-blue-700 border border-blue-200" },
  in_progress: { label: "In Progress", className: "bg-purple-100 text-purple-700 border border-purple-200" },
  completed:   { label: "Completed",   className: "bg-green-100 text-green-700 border border-green-200" },
}

const ITEMS_PER_PAGE = 12

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function AdminSeoAuditPage() {
  const [audits, setAudits]           = useState<SeoAudit[]>([])
  const [loading, setLoading]         = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [toast, setToast]             = useState("")

  // Thread drawer
  const [selectedAudit, setSelectedAudit] = useState<SeoAudit | null>(null)
  // Gmail compose
  const [composeAudit, setComposeAudit]   = useState<SeoAudit | null>(null)

  useEffect(() => { fetchAudits() }, [])

  const fetchAudits = async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/seo-audit")
      const data = await res.json()
      if (data.success && data.data) setAudits(Array.isArray(data.data) ? data.data : [])
      else setAudits([])
    } catch { setAudits([]) }
    finally { setLoading(false) }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/seo-audit/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      setAudits((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
      if (selectedAudit?.id === id) setSelectedAudit((p) => p ? { ...p, status } : p)
    } catch { showToast("Failed to update status.") }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this audit request?")) return
    try {
      const res = await fetch(`/api/seo-audit/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setAudits((prev) => prev.filter((a) => a.id !== id))
      if (selectedAudit?.id === id) setSelectedAudit(null)
      showToast("Deleted successfully.")
    } catch { showToast("Failed to delete.") }
  }

  const handleReplySent = (updated: SeoAudit) => {
    setAudits((prev) => prev.map((a) => a.id === updated.id ? updated : a))
    setSelectedAudit(updated)
    setComposeAudit(null)
    showToast("Reply sent successfully!")
  }

  // Filter + search
  const filtered = audits
    .filter((a) => {
      const q = searchQuery.toLowerCase()
      return (
        (a.full_name.toLowerCase().includes(q) ||
         a.email.toLowerCase().includes(q) ||
         a.website_url.toLowerCase().includes(q)) &&
        (filterStatus === "all" || a.status === filterStatus)
      )
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const stats = {
    total:       audits.length,
    pending:     audits.filter((a) => a.status === "pending").length,
    replied:     audits.filter((a) => a.status === "replied").length,
    completed:   audits.filter((a) => a.status === "completed").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f0f4f8" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading SEO audits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Top bar ── */}
      <div style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1a306e 100%)" }} className="shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              SEO Audit Requests
            </h1>
            <p className="text-white/50 text-sm mt-1">Manage, reply and track all audit inquiries</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchAudits} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <Link href="/admin/dashboard">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total,     icon: BarChart3,    color: "#1a306e", bg: "#e8eef9" },
            { label: "Pending", value: stats.pending, icon: Clock,        color: "#b45309", bg: "#fef3c7" },
            { label: "Replied", value: stats.replied, icon: Mail,         color: "#1d4ed8", bg: "#dbeafe" },
            { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "#15803d", bg: "#dcfce7" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-3xl font-bold" style={{ color }}>{value}</p>
              </div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div className="fixed top-6 right-6 z-[999] bg-white border border-slate-200 shadow-xl rounded-xl px-5 py-3 text-sm font-medium text-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> {toast}
          </div>
        )}

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 px-5 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or URL..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="pl-9 border-slate-200 text-sm"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1) }}>
            <SelectTrigger className="w-40 border-slate-200 text-sm">
              <Filter className="w-3.5 h-3.5 mr-2 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400 ml-auto">{filtered.length} results</p>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Contact</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Website</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">Mobile</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Replies</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No audit requests found</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((audit) => {
                    const sc = statusConfig[audit.status] || statusConfig.pending
                    return (
                      <tr
                        key={audit.id}
                        className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() => setSelectedAudit(audit)}
                      >
                        {/* Contact */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: "linear-gradient(135deg, #1a306e, #0d1b3e)" }}
                            >
                              {audit.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700 text-sm">{audit.full_name}</p>
                              <p className="text-xs text-slate-400">{audit.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Website */}
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <a
                            href={audit.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs truncate max-w-[180px] block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {audit.website_url.replace(/^https?:\/\//, "")}
                          </a>
                        </td>

                        {/* Mobile */}
                        <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500 text-xs">{audit.mobile}</td>

                        {/* Status */}
                        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <Select value={audit.status} onValueChange={(v) => handleStatusChange(audit.id, v)}>
                            <SelectTrigger className={cn("h-7 w-32 text-xs rounded-full border", sc.className)}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="replied">Replied</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Replies count */}
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className={cn(
                            "text-xs font-semibold px-2.5 py-1 rounded-full",
                            audit.replies?.length > 0
                              ? "bg-blue-50 text-blue-600"
                              : "bg-slate-100 text-slate-400"
                          )}>
                            {audit.replies?.length ?? 0} {audit.replies?.length === 1 ? "reply" : "replies"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 hidden sm:table-cell text-xs text-slate-400">
                          {new Date(audit.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedAudit(audit); setTimeout(() => setComposeAudit(audit), 100) }}
                              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white transition-all hover:opacity-90"
                              style={{ background: "linear-gradient(135deg, #0d1b3e, #1a306e)" }}
                            >
                              <Mail className="w-3 h-3" /> Reply
                            </button>
                            <button
                              onClick={() => handleDelete(audit.id)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-400">Page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-100 transition-all flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-100 transition-all flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Thread drawer ── */}
      {selectedAudit && !composeAudit && (
        <ThreadDrawer
          audit={selectedAudit}
          onClose={() => setSelectedAudit(null)}
          onReply={() => setComposeAudit(selectedAudit)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* ── Gmail compose ── */}
      {composeAudit && (
        <GmailCompose
          audit={composeAudit}
          onClose={() => setComposeAudit(null)}
          onSent={handleReplySent}
        />
      )}
    </div>
  )
}
