import { useState, useEffect } from "react"
import axios from "axios"
import "./App.css"

export default function App() {
  const [url, setUrl] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({ total: 0, risky: 0, safe: 0 })
  const [leaderboard, setLeaderboard] = useState([])
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    document.body.className = darkMode ? "dark" : ""
  }, [darkMode])

  async function analyze() {
    if (!url.trim()) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const { data } = await axios.post("https://url-detector-production-a7f2.up.railway.app/api/analyze", { url })      setResult(data)
      const risk = data.risk
      setStats(prev => ({
        total: prev.total + 1,
        risky: risk === "High" || risk === "Medium" ? prev.risky + 1 : prev.risky,
        safe: risk === "Low" ? prev.safe + 1 : prev.safe
      }))
      if (risk === "High" || risk === "Medium") {
        setLeaderboard(prev => [{
          hostname: data.hostname,
          score: data.score,
          risk: data.risk
        }, ...prev].slice(0, 8))
      }
    } catch (e) {
      setError(e.response?.data?.error || "Something went wrong")
    }
    setLoading(false)
    setUrl("")
  }

  const cls = (risk) => risk === "Low" ? "low" : risk === "High" ? "high" : "med"

  return (
    <div className="page">
      <div className="topbar">
        <div className="logo">
          <div className="logo-icon">🔍</div>
          <div>
            <div className="logo-text">URL Detector</div>
            <div className="tagline">Stay safe, stay cute 💕</div>
          </div>
        </div>
        <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card pink">
          <div className="stat-label">Total Scanned</div>
          <div className="stat-val">{stats.total}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Risky Found</div>
          <div className="stat-val">{stats.risky}</div>
        </div>
        <div className="stat-card mint">
          <div className="stat-label">Safe URLs</div>
          <div className="stat-val">{stats.safe}</div>
        </div>
      </div>

      <div className="search-card">
        <div className="search-title">🌸 Paste a URL to analyze</div>
        <div className="search-row">
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()}
          />
          <button className="btn" onClick={analyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze ✨"}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-title">💜 Safety Score</div>
          {result ? (
            <div>
              <div className={`score-circle ${cls(result.risk)}`}>
                <div className="score-num">{result.score}</div>
                <div className="score-txt">/ 100</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <span className={`risk-badge ${cls(result.risk)}`}>{result.risk} Risk</span>
                <div className="hostname-txt">{result.hostname}</div>
              </div>
            </div>
          ) : (
            <div className="empty">No URL analyzed yet</div>
          )}
        </div>

        <div className="panel">
          <div className="panel-title">🔎 Check Results</div>
          {result ? (
            <div className="checks">
              {result.results.map((r, i) => (
                <div key={i} className={`check ${r.pass ? "pass" : "fail"}`}>
                  {r.pass ? "✅" : "⚠️"} {r.msg}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">Results will appear here</div>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: "12px" }}>
        <div className="panel-title">🚨 Risky URL Leaderboard</div>
        {leaderboard.length === 0 ? (
          <div className="empty">No risky URLs caught yet!</div>
        ) : (
          <div className="leaderboard">
            {leaderboard.map((l, i) => (
              <div key={i} className="lb-item">
                <div className="lb-rank">#{i + 1}</div>
                <div className="lb-url">{l.hostname}</div>
                <div className="lb-badge">{l.risk} · {l.score}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}