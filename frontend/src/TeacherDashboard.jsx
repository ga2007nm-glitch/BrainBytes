import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BrainBytesLogo from "./components/BrainBytesLogo";
import { getClassroomAnalytics } from "./practiceApi";

const panelStyle = {
  background: "rgba(14, 18, 33, 0.85)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "14px",
  padding: "20px"
};

function formatAccuracy(value) {
  return value === null ? "—" : `${value}%`;
}

function csvCell(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export default function TeacherDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    setLoading(true);
    setError("");
    try {
      const data = await getClassroomAnalytics();
      setAnalytics(data);
      setSelectedCohort(current =>
        data.gradeBreakdowns.some(cohort => cohort.grade === current)
          ? current
          : data.gradeBreakdowns[0]?.grade ?? null
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Analytics could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const activeCohort = analytics?.gradeBreakdowns.find(
    cohort => cohort.grade === selectedCohort
  );

  function exportCsv() {
    if (!analytics?.totalAnswerAttempts) return;
    const rows = [
      ["Grade", "Subject", "Answer attempts", "Accuracy (%)"],
      ...analytics.gradeBreakdowns.flatMap(cohort =>
        cohort.subjectBreakdowns.map(subject => [
          cohort.label,
          subject.subject,
          subject.attempts,
          subject.accuracyPercent ?? ""
        ])
      )
    ];
    const csv = rows.map(row => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "brainbytes-learning-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main
      className="teacher-analytics-page"
      style={{ minHeight: "100vh", background: "#090D18", color: "#F0F4FC", padding: "24px" }}
      aria-busy={loading}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", maxWidth: "1200px", margin: "0 auto 30px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "18px", flexWrap: "wrap" }}>
        <Link to="/" aria-label="BrainBytes home" style={{ textDecoration: "none" }}>
          <BrainBytesLogo size="default" />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button type="button" onClick={loadAnalytics} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={loading || !analytics?.totalAnswerAttempts}
          >
            Export CSV
          </button>
          <Link to="/battle" className="dashboard-primary-btn" style={{ padding: "8px 18px", fontSize: "0.9rem", textDecoration: "none" }}>
            Enter Arena
          </Link>
        </div>
      </header>

      <section style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ ...panelStyle, marginBottom: "24px" }}>
          <p style={{ color: "#FFD166", fontWeight: 800, letterSpacing: "0.12em", fontSize: "0.75rem" }}>
            LEARNING ANALYTICS · PROTOTYPE
          </p>
          <h1 style={{ margin: "8px 0", fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
            Classroom learning snapshot
          </h1>
          <p style={{ color: "#A0AEC0", maxWidth: "760px", lineHeight: 1.6 }}>
            Counts and accuracy below are calculated from submitted answers in this backend session.
            No student names are included. Data resets when the backend restarts; this prototype
            does not measure learning retention or compare against worksheets.
          </p>
          {error && (
            <div role="alert" style={{ color: "#FF8DA1", marginTop: "12px" }}>
              {error}{" "}
              <button type="button" onClick={loadAnalytics} disabled={loading}>Try again</button>
            </div>
          )}
        </div>

        {loading && <p role="status">Loading session analytics…</p>}

        {!loading && !error && analytics && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <article style={panelStyle}>
                <span>Completed battles</span>
                <p style={{ fontSize: "2rem", fontWeight: 800, margin: "8px 0", color: "#00F2FE" }}>
                  {analytics.totalCompletedBattles}
                </p>
              </article>
              <article style={panelStyle}>
                <span>Recorded answer attempts</span>
                <p style={{ fontSize: "2rem", fontWeight: 800, margin: "8px 0", color: "#FFD166" }}>
                  {analytics.totalAnswerAttempts}
                </p>
              </article>
              <article style={panelStyle}>
                <span>Observed answer accuracy</span>
                <p style={{ fontSize: "2rem", fontWeight: 800, margin: "8px 0", color: "#9D8BFF" }}>
                  {formatAccuracy(analytics.overallAccuracyPercent)}
                </p>
              </article>
            </div>

            {analytics.totalAnswerAttempts === 0 ? (
              <div role="status" style={panelStyle}>
                No answers have been recorded in this backend session yet. Complete a practice or
                multiplayer round to see real results here.
              </div>
            ) : (
              <>
                <section aria-labelledby="cohort-heading" style={panelStyle}>
                  <h2 id="cohort-heading">Accuracy by class and subject</h2>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                    {analytics.gradeBreakdowns.map(cohort => (
                      <button
                        key={cohort.grade}
                        type="button"
                        aria-pressed={selectedCohort === cohort.grade}
                        onClick={() => setSelectedCohort(cohort.grade)}
                      >
                        {cohort.label} ({cohort.attempts})
                      </button>
                    ))}
                  </div>

                  {activeCohort ? (
                    <>
                      <p>
                        {activeCohort.label}: {formatAccuracy(activeCohort.accuracyPercent)} across{" "}
                        {activeCohort.attempts} recorded answers.
                      </p>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                          <thead>
                            <tr>
                              <th scope="col">Subject</th>
                              <th scope="col">Attempts</th>
                              <th scope="col">Accuracy</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeCohort.subjectBreakdowns.map(subject => (
                              <tr key={subject.subject}>
                                <th scope="row">{subject.subject}</th>
                                <td>{subject.attempts}</td>
                                <td>{formatAccuracy(subject.accuracyPercent)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <p role="status">No recorded attempts for this class.</p>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
