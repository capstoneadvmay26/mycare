// src/pages/ConsultBrief.jsx
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  FileText,
  Download,
  Share,
  Calendar,
  Capsule,
  HeartPulse,
  CheckCircle,
  XCircle,
  Clock,
} from "react-bootstrap-icons";
import jsPDF from "jspdf";
import { useApp } from "../context/useApp";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import { getConsultBrief } from "../services/api";
import Toast from "../components/ui/Toast";

// Format "HH:MM" → "3:29 PM"
const formatTime = (time24) => {
  if (!time24) return "";
  const [hh, mm] = time24.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const h = hh % 12 === 0 ? 12 : hh % 12;
  return `${h}:${String(mm).padStart(2, "0")} ${period}`;
};

// Format ISO date → "19 Sep 2026"
const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

// Format ISO → "3:29 PM, 19 Sep 2026"
const formatDateTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const FREQ_LABELS = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  three_times_daily: "3 times daily",
  weekly: "Weekly",
  as_needed: "As needed",
};

const SEVERITY_COLORS = {
  mild: "#4CBB17",
  moderate: "#F7C81B",
  severe: "#F97316",
  very_severe: "#D92D20",
};

const CHECKIN_COLORS = {
  better: "#4CBB17",
  same: "#666",
  worse: "#D92D20",
};

const ConsultBrief = () => {
  const { setCurrentTab } = useApp();
  const { activeProfile } = useProfile();
  const { isDark } = useTheme();
  const profileId = activeProfile?.id || activeProfile?._id;

  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!profileId) {
        setLoading(false);
        setError("No profile selected.");
        return;
      }

      setLoading(true);
      try {
        const resp = await getConsultBrief(profileId);
        if (!cancelled) setBrief(resp.data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to generate consult brief."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  // ------------------------------------------------------------
  // PDF generation
  // ------------------------------------------------------------
  const handleDownloadPDF = () => {
    if (!brief) return;

    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Helper: add page if running out of space
      const checkPageBreak = (needed = 10) => {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // ---- Header bar ----
      doc.setFillColor(0, 51, 204);
      doc.rect(0, 0, pageWidth, 20, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("MYCARE CONSULT BRIEF", margin, 13);
      y = 30;

      // ---- Patient info ----
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Patient", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(String(brief.profile?.name || "—"), margin, y);
      y += 6;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(
        `Period: ${formatDate(brief.dateRange?.startDate)} — ${formatDate(brief.dateRange?.endDate)}`,
        margin,
        y
      );
      y += 4;
      doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, margin, y);
      y += 10;

      // ---- Adherence box ----
      checkPageBreak(35);
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(245, 248, 255);
      doc.roundedRect(margin, y, contentWidth, 28, 3, 3, "FD");

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Medication Adherence", margin + 5, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const taken = brief.adherence?.takenDoses || 0;
      const total = brief.adherence?.totalScheduledDoses || 0;
      const rate = Math.round(brief.adherence?.adherenceRate || 0);
      doc.text(`${taken} of ${total} doses taken (${rate}%)`, margin + 5, y + 14);

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Taken: ${taken}   Skipped: ${brief.adherence?.skippedDoses || 0}   Pending: ${brief.adherence?.pendingDoses || 0}`,
        margin + 5,
        y + 21
      );

      y += 35;

      // ---- Current Medications ----
      checkPageBreak(15);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(
        `Current Medications (${brief.currentMedications?.length || 0})`,
        margin,
        y
      );
      y += 7;

      (brief.currentMedications || []).forEach((med) => {
        checkPageBreak(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(String(med.name || "—"), margin, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const freq = FREQ_LABELS[med.frequency] || med.frequency || "";
        const times = (med.scheduleTime || []).map(formatTime).join(", ");
        doc.text(
          `${med.dosage || ""} · ${freq}${times ? ` · ${times}` : ""}`,
          margin + 2,
          y
        );
        y += 5;

        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Started ${formatDate(med.startDate)}`, margin + 2, y);
        y += 6;
        doc.setTextColor(0, 0, 0);
      });

      y += 3;

      // ---- Symptoms ----
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(`Symptoms (${brief.symptoms?.length || 0})`, margin, y);
      y += 7;

      (brief.symptoms || []).forEach((sym) => {
        checkPageBreak(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(
          `${sym.symptom} — ${String(sym.severity || "").replace("_", " ")}`,
          margin,
          y
        );
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Logged ${formatDateTime(sym.date)}`, margin + 2, y);
        y += 5;

        (sym.checkIns || []).forEach((ci) => {
          doc.text(
            `Day ${ci.day}: ${ci.status} · ${formatDateTime(ci.checkedInAt)}`,
            margin + 4,
            y
          );
          y += 4;
        });
        y += 2;
        doc.setTextColor(0, 0, 0);
      });

      // ---- Footer disclaimer ----
      checkPageBreak(20);
      y += 3;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      const disclaimer =
        "This brief is a summary of self-reported data entered by the patient or caregiver. It is not a diagnosis. Please consult a qualified healthcare professional for medical advice.";
      const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
      doc.text(disclaimerLines, margin, y);

      // ---- Save ----
      const fileName = `consult-brief-${(brief.profile?.name || "patient")
        .replace(/\s+/g, "-")
        .toLowerCase()}-${Date.now()}.pdf`;
      doc.save(fileName);
      setToast({ message: "PDF downloaded", type: "success" });
    } catch (err) {
      console.error("[ConsultBrief] PDF generation failed:", err);
      setToast({ message: "PDF generation failed", type: "error" });
    }
  };

  // ------------------------------------------------------------
  // Plain-text summary for sharing
  // ------------------------------------------------------------
  const buildPlainTextSummary = (data) => {
    const lines = [];
    lines.push("MYCARE CONSULT BRIEF");
    lines.push(`Patient: ${data.profile?.name || "—"}`);
    lines.push(
      `Period: ${formatDate(data.dateRange?.startDate)} — ${formatDate(data.dateRange?.endDate)}`
    );
    lines.push("");
    lines.push("MEDICATION ADHERENCE");
    lines.push(
      `${data.adherence?.takenDoses || 0} of ${data.adherence?.totalScheduledDoses || 0} doses taken (${Math.round(data.adherence?.adherenceRate || 0)}%)`
    );
    lines.push("");
    lines.push(`CURRENT MEDICATIONS (${data.currentMedications?.length || 0})`);
    (data.currentMedications || []).forEach((m) => {
      const times = (m.scheduleTime || []).map(formatTime).join(", ");
      lines.push(
        `• ${m.name} ${m.dosage || ""} — ${FREQ_LABELS[m.frequency] || m.frequency}${times ? ` · ${times}` : ""}`
      );
    });
    lines.push("");
    lines.push(`SYMPTOMS (${data.symptoms?.length || 0})`);
    (data.symptoms || []).forEach((s) => {
      lines.push(`• ${s.symptom} (${s.severity}) — ${formatDate(s.date)}`);
      (s.checkIns || []).forEach((ci) => {
        lines.push(`    Day ${ci.day}: ${ci.status}`);
      });
    });
    lines.push("");
    lines.push(
      "Generated by MyCare. This is self-reported data, not a diagnosis."
    );
    return lines.join("\n");
  };

  const handleShare = async () => {
    if (!brief) return;

    const textSummary = buildPlainTextSummary(brief);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Consult Brief — ${brief.profile?.name || "Patient"}`,
          text: textSummary,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          // Fall back to clipboard
          try {
            await navigator.clipboard.writeText(textSummary);
            setToast({ message: "Summary copied to clipboard", type: "success" });
          } catch {
            setToast({ message: "Share failed", type: "error" });
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(textSummary);
        setToast({ message: "Summary copied to clipboard", type: "success" });
      } catch {
        setToast({ message: "Could not copy summary", type: "error" });
      }
    }
  };

  // ------------------------------------------------------------
  // JSON download (secondary)
  // ------------------------------------------------------------
  const handleDownloadJSON = () => {
    if (!brief) return;
    try {
      const blob = new Blob([JSON.stringify(brief, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `consult-brief-${(brief.profile?.name || "patient")
        .replace(/\s+/g, "-")
        .toLowerCase()}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setToast({ message: "JSON downloaded", type: "success" });
    } catch (err) {
      console.error("[ConsultBrief] JSON download failed:", err);
      setToast({ message: "Download failed", type: "error" });
    }
  };

  // ------------------------------------------------------------
  // Loading
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div
        className="d-flex flex-column h-100"
        style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
      >
        <div
          className="d-flex align-items-center p-3 border-bottom"
          style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
        >
          <button
            className="btn p-0 border-0"
            onClick={() => setCurrentTab("Medications")}
            style={{ color: isDark ? "#FFF" : "#000" }}
          >
            <ChevronLeft size={28} />
          </button>
          <h1
            className="fw-bold m-0 ms-3"
            style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
          >
            Consult Brief
          </h1>
        </div>
        <div className="text-center py-5 flex-grow-1 d-flex flex-column justify-content-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-secondary mt-3" style={{ fontSize: "14px" }}>
            Generating brief...
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Error
  // ------------------------------------------------------------
  if (error || !brief) {
    return (
      <div
        className="d-flex flex-column h-100"
        style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
      >
        <div
          className="d-flex align-items-center p-3 border-bottom"
          style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
        >
          <button
            className="btn p-0 border-0"
            onClick={() => setCurrentTab("Medications")}
            style={{ color: isDark ? "#FFF" : "#000" }}
          >
            <ChevronLeft size={28} />
          </button>
          <h1
            className="fw-bold m-0 ms-3"
            style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
          >
            Consult Brief
          </h1>
        </div>
        <div className="p-4">
          <div
            className="alert alert-danger py-2"
            style={{ fontSize: "13px" }}
          >
            {error || "No data available."}
          </div>
        </div>
      </div>
    );
  }

  const { profile, dateRange, currentMedications, adherence, symptoms } = brief;

  return (
    <div
      className="d-flex flex-column h-100"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      {/* Header */}
      <div
        className="d-flex align-items-center p-3 border-bottom"
        style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
      >
        <button
          className="btn p-0 border-0"
          onClick={() => setCurrentTab("Medications")}
          style={{ color: isDark ? "#FFF" : "#000" }}
        >
          <ChevronLeft size={28} />
        </button>
        <h1
          className="fw-bold m-0 ms-3"
          style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
        >
          Consult Brief
        </h1>
      </div>

      <div className="p-3 flex-grow-1 overflow-auto">
        {/* Intro card with share icon */}
        <div
          className="rounded-3 p-3 mb-3"
          style={{
            backgroundColor: "rgba(0, 51, 204, 0.06)",
            border: "1px solid rgba(0, 51, 204, 0.2)",
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center">
              <FileText size={20} color="#0033CC" className="me-2" />
              <p
                className="fw-bold m-0"
                style={{ fontSize: "16px", color: isDark ? "#FFF" : "#000" }}
              >
                Health Summary
              </p>
            </div>
            <button
              className="btn p-0 border-0"
              onClick={handleShare}
              style={{ color: "#0033CC" }}
              title="Share summary"
            >
              <Share size={18} />
            </button>
          </div>
          <p className="m-0 text-secondary" style={{ fontSize: "13px" }}>
            Share this with your doctor during your next visit.
          </p>
        </div>

        {/* Patient + date range */}
        <div
          className="rounded-3 p-3 mb-3"
          style={{
            border: `1px solid ${isDark ? "#333" : "rgba(0,0,0,0.1)"}`,
          }}
        >
          <p
            className="fw-bold mb-1"
            style={{ fontSize: "13px", color: "#666" }}
          >
            Patient
          </p>
          <p
            className="fw-bold mb-3"
            style={{ fontSize: "16px", color: isDark ? "#FFF" : "#000" }}
          >
            {profile?.name || "—"}
          </p>

          <div className="d-flex align-items-center gap-2">
            <Calendar size={16} color="#666" />
            <span className="text-secondary" style={{ fontSize: "13px" }}>
              {formatDate(dateRange?.startDate)} — {formatDate(dateRange?.endDate)}
            </span>
          </div>
        </div>

        {/* Adherence card */}
        <div
          className="rounded-3 p-3 mb-3"
          style={{
            backgroundColor: "rgba(0, 51, 204, 0.04)",
            border: "1px solid rgba(0, 51, 204, 0.15)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <p
                className="fw-bold mb-1"
                style={{ fontSize: "13px", color: "#666" }}
              >
                Medication Adherence
              </p>
              <p
                className="fw-bold m-0"
                style={{ fontSize: "16px", color: isDark ? "#FFF" : "#000" }}
              >
                {adherence?.takenDoses || 0} of {adherence?.totalScheduledDoses || 0} doses taken
              </p>
            </div>
            <div
              className="d-flex justify-content-center align-items-center rounded-circle"
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#FFF",
                border: `4px solid ${
                  adherence?.adherenceRate >= 80
                    ? "#4CBB17"
                    : adherence?.adherenceRate >= 50
                      ? "#F7C81B"
                      : "#D92D20"
                }`,
              }}
            >
              <span
                className="fw-bold"
                style={{
                  fontSize: "16px",
                  color:
                    adherence?.adherenceRate >= 80
                      ? "#4CBB17"
                      : adherence?.adherenceRate >= 50
                        ? "#B45309"
                        : "#D92D20",
                }}
              >
                {Math.round(adherence?.adherenceRate || 0)}%
              </span>
            </div>
          </div>

          <div className="d-flex gap-3" style={{ fontSize: "13px" }}>
            <div className="d-flex align-items-center gap-1">
              <CheckCircle size={14} color="#4CBB17" />
              <span className="text-secondary">
                {adherence?.takenDoses || 0} taken
              </span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <XCircle size={14} color="#D92D20" />
              <span className="text-secondary">
                {adherence?.skippedDoses || 0} skipped
              </span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <Clock size={14} color="#F7C81B" />
              <span className="text-secondary">
                {adherence?.pendingDoses || 0} pending
              </span>
            </div>
          </div>
        </div>

        {/* Current Medications */}
        <div className="mb-3">
          <div className="d-flex align-items-center mb-2">
            <Capsule size={18} color="#0033CC" className="me-2" />
            <p
              className="fw-bold m-0"
              style={{ fontSize: "15px", color: isDark ? "#FFF" : "#000" }}
            >
              Current Medications ({currentMedications?.length || 0})
            </p>
          </div>

          {!currentMedications || currentMedications.length === 0 ? (
            <p className="text-secondary" style={{ fontSize: "13px" }}>
              No active medications.
            </p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {currentMedications.map((med) => (
                <div
                  key={med.medicationId}
                  className="rounded-3 p-3"
                  style={{
                    border: `1px solid ${isDark ? "#333" : "rgba(0,0,0,0.1)"}`,
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <p
                      className="fw-bold m-0"
                      style={{ fontSize: "15px", color: isDark ? "#FFF" : "#000" }}
                    >
                      {med.name}
                    </p>
                    <span
                      className="px-2 py-1 rounded-pill"
                      style={{
                        backgroundColor: "rgba(0, 51, 204, 0.08)",
                        color: "#0033CC",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {med.dosage}
                    </span>
                  </div>
                  <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
                    {FREQ_LABELS[med.frequency] || med.frequency}
                    {med.scheduleTime?.length > 0 &&
                      ` · ${med.scheduleTime.map(formatTime).join(", ")}`}
                  </p>
                  <p
                    className="m-0 text-secondary mt-1"
                    style={{ fontSize: "11px" }}
                  >
                    Started {formatDate(med.startDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Symptoms */}
        <div className="mb-3">
          <div className="d-flex align-items-center mb-2">
            <HeartPulse size={18} color="#F7C81B" className="me-2" />
            <p
              className="fw-bold m-0"
              style={{ fontSize: "15px", color: isDark ? "#FFF" : "#000" }}
            >
              Symptoms ({symptoms?.length || 0})
            </p>
          </div>

          {!symptoms || symptoms.length === 0 ? (
            <p className="text-secondary" style={{ fontSize: "13px" }}>
              No symptoms logged in this period.
            </p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {symptoms.map((sym) => (
                <div
                  key={sym.symptomId}
                  className="rounded-3 p-3"
                  style={{
                    border: `1px solid ${isDark ? "#333" : "rgba(0,0,0,0.1)"}`,
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <p
                      className="fw-bold m-0"
                      style={{ fontSize: "15px", color: isDark ? "#FFF" : "#000" }}
                    >
                      {sym.symptom}
                    </p>
                    <span
                      className="px-2 py-1 rounded-pill"
                      style={{
                        backgroundColor: `${SEVERITY_COLORS[sym.severity]}20`,
                        color: SEVERITY_COLORS[sym.severity],
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {sym.severity?.replace("_", " ")}
                    </span>
                  </div>
                  <p
                    className="m-0 text-secondary mb-2"
                    style={{ fontSize: "11px" }}
                  >
                    Logged {formatDateTime(sym.date)}
                  </p>

                  {sym.checkIns?.length > 0 && (
                    <div
                      className="d-flex flex-column gap-1 mt-2 pt-2"
                      style={{
                        borderTop: `1px solid ${isDark ? "#333" : "rgba(0,0,0,0.08)"}`,
                      }}
                    >
                      {sym.checkIns.map((ci, idx) => (
                        <div
                          key={idx}
                          className="d-flex align-items-center gap-2"
                        >
                          <span
                            className="rounded-circle"
                            style={{
                              width: "6px",
                              height: "6px",
                              backgroundColor:
                                CHECKIN_COLORS[ci.status] || "#666",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            className="text-secondary"
                            style={{ fontSize: "12px" }}
                          >
                            Day {ci.day}:{" "}
                            <strong style={{ color: CHECKIN_COLORS[ci.status] }}>
                              {ci.status}
                            </strong>{" "}
                            · {formatDateTime(ci.checkedInAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p
          className="text-center text-secondary mt-3 mb-2"
          style={{ fontSize: "11px", fontStyle: "italic" }}
        >
          This brief is a summary of self-reported data. It is not a diagnosis.
        </p>

        {/* JSON link (small, secondary) */}
        <div className="text-center mb-2">
          <button
            className="btn p-0 border-0 text-secondary"
            style={{ fontSize: "11px", textDecoration: "underline" }}
            onClick={handleDownloadJSON}
          >
            Download raw data (JSON)
          </button>
        </div>
      </div>

      {/* Bottom actions */}
      <div
        className="p-3 border-top d-flex gap-2"
        style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
      >
        <button
          className="btn flex-grow-1 py-3 fw-bold"
          style={{
            backgroundColor: "rgba(0, 51, 204, 0.08)",
            color: "#0033CC",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={handleShare}
        >
          <Share size={16} className="me-2" />
          Share
        </button>
        <button
          className="btn flex-grow-1 py-3 fw-bold text-white"
          style={{
            backgroundColor: "#0033CC",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={handleDownloadPDF}
        >
          <Download size={16} className="me-2" />
          Download PDF
        </button>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
};

export default ConsultBrief;