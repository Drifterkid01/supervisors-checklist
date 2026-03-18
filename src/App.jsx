// FULL REWRITE — Dynamic Time‑Based Checklist (Option C)
// Settings applied:
// window = exact time
// allow all‑tasks = yes
// show time = yes

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Trash2, CheckCircle } from "lucide-react";

// ---------------------------------------------------------
// TASK DATA
// ---------------------------------------------------------
const TASKS = [
  // DAILY
  { id: "t0600", label: "06:00 – Daily Team Briefing", time: "06:00", type: "daily", required: true },
  { id: "t0605", label: "06:05 – Deploy Staff", time: "06:05", type: "daily", required: true },
  { id: "t0630", label: "06:30 – Send Tunnelling Target via Email", time: "06:30", type: "daily", required: true },
  { id: "t0645", label: "06:45 – Brief and Deploy Shielded Staff", time: "06:45", type: "daily", required: true },
  { id: "t0730", label: "07:30 – Review/Update OPS Plan on Teams", time: "07:30", type: "daily", required: true },
  { id: "t0800", label: "08:00 – Core Post Flow/Foot Info on Teams", time: "08:00", type: "daily", required: true },
  { id: "t0825", label: "08:25 – Conduct 5S Audit & Post on Teams", time: "08:25", type: "daily", required: true },

  // HOURLY
  { id: "t0700", label: "07:00 – Count Platform A + Manual Sorting & SIC", time: "07:00", type: "hourly", required: true },
  { id: "t0705", label: "07:05 – Flow/Foot Hourly Update", time: "07:05", type: "hourly", required: true },
  { id: "t0755", label: "07:55 – Count Platform A + Manual Sorting & SIC", time: "07:55", type: "hourly", required: true },
  { id: "t0855", label: "08:55 – Count Platform A + Manual Sorting & SIC", time: "08:55", type: "hourly", required: true },
  { id: "t0900", label: "09:00 – Flow/Foot Hourly Update", time: "09:00", type: "hourly", required: true },
  { id: "t0955", label: "09:55 – Count Platform A + Manual Sorting & SIC", time: "09:55", type: "hourly", required: true },
  { id: "t1000", label: "10:00 – Flow/Foot Hourly Update", time: "10:00", type: "hourly", required: true },
  { id: "t1055", label: "10:55 – Count Platform A + Manual Sorting & SIC", time: "10:55", type: "hourly", required: true },
  { id: "t1100", label: "11:00 – Flow/Foot Hourly Update", time: "11:00", type: "hourly", required: true },
  { id: "t1130", label: "11:30 – Supervisory Hands‑On Sealing", time: "11:30", type: "hourly", required: true },
  { id: "t1400", label: "14:00 – Flow/Foot Hourly Update", time: "14:00", type: "hourly", required: true }
];

// ---------------------------------------------------------
// UTILITIES
// ---------------------------------------------------------
function parseTime(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getCurrentMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function loadSubmissions() {
  try {
    const raw = localStorage.getItem("dyn-checklist-v1");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSubmissions(rows) {
  localStorage.setItem("dyn-checklist-v1", JSON.stringify(rows));
}

function newGuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------
export default function DynamicChecklistApp() {
  const [mode, setMode] = useState("auto");
  const [checks, setChecks] = useState({});
  const [submissions, setSubmissions] = useState([]);

  const currentTime = getCurrentMinutes();

  useEffect(() => {
    setSubmissions(loadSubmissions());
  }, []);

  const visibleTasks = useMemo(() => {
    if (mode === "all") return TASKS;
    if (mode === "daily") return TASKS.filter(t => t.type === "daily");
    if (mode === "hourly") return TASKS.filter(t => t.type === "hourly");
    return TASKS.filter(t => parseTime(t.time) === currentTime);
  }, [mode, currentTime]);

  const requiredOk = useMemo(() => {
    return visibleTasks.every(t => !t.required || checks[t.id]);
  }, [visibleTasks, checks]);

  function toggleCheck(id) {
    setChecks(c => ({ ...c, [id]: !c[id] }));
  }

  function submit() {
    if (!requiredOk) return;

    const entry = {
      id: newGuid(),
      timestamp: new Date().toISOString(),
      mode,
      tasks: checks
    };

    const next = [entry, ...submissions];
    setSubmissions(next);
    saveSubmissions(next);

    setChecks({});
  }

  function removeEntry(id) {
    const next = submissions.filter(e => e.id !== id);
    setSubmissions(next);
    saveSubmissions(next);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <ClipboardCheck className="text-blue-600" size={28} />
            <h1 className="text-2xl font-semibold">Dynamic Supervisors Checklist (Option C)</h1>
          </div>
          <p className="text-gray-600 text-sm mt-1">Tasks auto‑selected based on exact time.</p>
        </motion.div>

        {/* MODE SELECTOR */}
        <div className="flex gap-3">
          {[
            { id: "auto", label: "Auto" },
            { id: "daily", label: "Daily" },
            { id: "hourly", label: "Hourly" },
            { id: "all", label: "All Tasks" }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${mode === m.id ? "bg-blue-600 text-white" : "bg-white"}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* TASK LIST */}
        <div className="rounded-2xl bg-white shadow p-5 space-y-3">
          <h2 className="text-lg font-semibold">Tasks</h2>

          {visibleTasks.length === 0 && (
            <p className="text-gray-500 text-sm">No tasks scheduled for this exact time.</p>
          )}

          {visibleTasks.map(t => (
            <label key={t.id} className="flex items-center gap-3 border rounded-xl p-3 bg-gray-50">
              <input
                type="checkbox"
                checked={!!checks[t.id]}
                onChange={() => toggleCheck(t.id)}
                className="h-4 w-4"
              />
              <span className="font-medium text-gray-800">
                {t.label} {t.required && <span className="text-red-500">*</span>}
              </span>
            </label>
          ))}

          {!requiredOk && (
            <p className="text-red-600 text-sm">Every required task (*) must be completed.</p>
          )}

          <button
            disabled={!requiredOk}
            onClick={submit}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle size={18} /> Submit
          </button>
        </div>

        {/* HISTORY */}
        <div className="rounded-2xl bg-white shadow p-5">
          <h2 className="text-lg font-semibold mb-3">Recent Submissions</h2>

          {submissions.length === 0 ? (
            <p className="text-gray-500 text-sm">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {submissions.map(s => (
                <div key={s.id} className="border rounded-xl p-3 bg-gray-50 flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{s.timestamp}</p>
                    <pre className="text-xs">{JSON.stringify(s.tasks, null, 2)}</pre>
                  </div>
                  <button
                    onClick={() => removeEntry(s.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
