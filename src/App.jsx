
// FULL REWRITE — Dynamic Time‑Based Checklist (Option C) // Settings applied: // window = exact time // allow all‑tasks = yes // show time = yes
import React, { useMemo, useState, useEffect } from "react"; import { motion } from "framer-motion"; import { ClipboardCheck, Trash2, Download, CheckCircle } from "lucide-react";
// --------------------------------------------------------- // ⏱ TASK DATA (Daily + Hourly) // --------------------------------------------------------- const TASKS = [ // DAILY { id: "t0600", label: "06:00 – Daily Team Briefing", time: "06:00", type: "daily", required: true }, { id: "t0605", label: "06:05 – Deploy Staff", time: "06:05", type: "daily", required: true }, { id: "t0630", label: "06:30 – Send Tunnelling Target via Email", time: "06:30", type: "daily", required: true }, { id: "t0645", label: "06:45 – Brief and Deploy Shielded Staff", time: "06:45", type: "daily", required: true }, { id: "t0730", label: "07:30 – Review/Update OPS Plan on Teams", time: "07:30", type: "daily", required: true }, { id: "t0800", label: "08:00 – Core Post Flow/Foot Info on Teams", time: "08:00", type: "daily", required: true }, { id: "t0825", label: "08:25 – Conduct 5S Audit & Post on Teams", time: "08:25", type: "daily", required: true },
// HOURLY { id: "t0700", label: "07:00 – Count Platform A + Manual Sorting & SIC", time: "07:00", type: "hourly", required: true }, { id: "t0705", label: "07:05 – Flow/Foot Hourly Update", time: "07:05", type: "hourly", required: true }, { id: "t0755", label: "07:55 – Count Platform A + Manual Sorting & SIC", time: "07:55", type: "hourly", required: true }, { id: "t0855", label: "08:55 – Count Platform A + Manual Sorting & SIC", time: "08:55", type: "hourly", required: true }, { id: "t0900", label: "09:00 – Flow/Foot Hourly Update", time: "09:00", type: "hourly", required: true }, { id: "t0955", label: "09:55 – Count Platform A + Manual Sorting & SIC", time: "09:55", type: "hourly", required: true }, { id: "t1000", label: "10:00 – Flow/Foot Hourly Update", time: "10:00", type: "hourly", required: true }, { id: "t1055", label: "10:55 – Count Platform A + Manual Sorting & SIC", time: "10:55", type: "hourly", required: true }, { id: "t1100", label: "11:00 – Flow/Foot Hourly Update", time: "11:00", type: "hourly", required: true }, { id: "t1130", label: "11:30 – Supervisory Hands‑On Sealing", time: "11:30", type: "hourly", required: true }, { id: "t1400", label: "14:00 – Flow/Foot Hourly Update", time: "14:00", type: "hourly", required: true } ];
// --------------------------------------------------------- // UTILITIES // --------------------------------------------------------- function parseTime(t) { const [h, m] = t.split(":" ).map(Number); return h * 60 + m; }
function getCurrentMinutes() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
function loadSubmissions() { try { const raw = localStorage.getItem("dyn-checklist-v1"); return raw ? JSON.parse(raw) : []; } catch { return []; } }
function saveSubmissions(rows) { localStorage.setItem("dyn-checklist-v1", JSON.stringify(rows)); }
function newGuid() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = (Math.random() * 16) | 0; const v = c === "x" ? r : (r & 0x3) | 0x8; return v.toString(16); }); }
// --------------------------------------------------------- // MAIN COMPONENT // --------------------------------------------------------- export default function DynamicChecklistApp() { const [mode, setMode] = useState("auto"); // auto | daily | hourly | all const [checks, setChecks] = useState({}); const [submissions, setSubmissions] = useState([]);
const currentTime = getCurrentMinutes();
useEffect(() => { setSubmissions(loadSubmissions()); }, []);
// Determine visible tasks const visibleTasks = useMemo(() => { if (mode === "all") return TASKS; if (mode === "daily") return TASKS.filter(t => t.type === "daily"); if (mode === "hourly") return TASKS.filter(t => t.type === "hourly");
// AUTO MODE → exact match only return TASKS.filter(t => parseTime(t.time) === currentTime); }, [mode, currentTime]);
// Required check const requiredOk = useMemo(() => { return visibleTasks.every(t => !t.required || checks[t.id]); }, [visibleTasks, checks]);
function toggleCheck(id) { setChecks(c => ({ ...c, [id]: !c[id] })); }
function submit() { if (!requiredOk) return;
const entry = { id: newGuid(), timestamp: new Date().toISOString(), mode, tasks: checks };
const next = [entry, ...submissions]; setSubmissions(next); saveSubmissions(next);
setChecks({}); }
function removeEntry(id) { const next = submissions.filter(e => e.id !== id); setSubmissions(next); saveSubmissions(next); }
return ( 




Dynamic Supervisors Checklist (Option C)


Tasks auto‑selected based on exact time.
{/ MODE SELECTOR /}  {[ { id: "auto", label: "Auto" }, { id: "daily", label: "Daily" }, { id: "hourly", label: "Hourly" }, { id: "all", label: "All Tasks" } ].map(m => ( ))} 
{/ TASK LIST /}  Tasks
{visibleTasks.length === 0 && ( No tasks scheduled for this exact time.
)}


{visibleTasks.map(t => ( ))}
{!requiredOk && ( Every required task (*) must be completed.
)}
{/ HISTORY /}  Recent Submissions
{submissions.length === 0 ? ( No submissions yet.
) : ( 
