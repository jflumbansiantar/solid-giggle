import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import './PerformanceChart.css';

const fmtUSD = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

/* ── Custom Tooltip ───────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const portfolio  = payload.find((p) => p.dataKey === 'portfolio');
  const benchmark  = payload.find((p) => p.dataKey === 'benchmark');
  const diff       = portfolio && benchmark ? portfolio.value - benchmark.value : 0;

  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {portfolio && (
        <p className="tooltip-row">
          <span className="tooltip-dot" style={{ background: '#58a6ff' }} />
          <span>Portfolio</span>
          <span className="tooltip-val">{fmtUSD(portfolio.value)}</span>
        </p>
      )}
      {benchmark && (
        <p className="tooltip-row">
          <span className="tooltip-dot" style={{ background: '#3fb950' }} />
          <span>S&P 500</span>
          <span className="tooltip-val">{fmtUSD(benchmark.value)}</span>
        </p>
      )}
      {portfolio && benchmark && (
        <p className={`tooltip-diff ${diff >= 0 ? 'gain' : 'loss'}`}>
          Alpha: {diff >= 0 ? '+' : ''}{fmtUSD(diff)}
        </p>
      )}
    </div>
  );
}

/* ── Stat Card ────────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, isGain }) {
  return (
    <div className="perf-stat card">
      <span className="ps-label">{label}</span>
      <span className={`ps-value ${isGain !== undefined ? (isGain ? 'gain' : 'loss') : ''}`}>{value}</span>
      {sub && <span className="ps-sub muted">{sub}</span>}
    </div>
  );
}

/* ── PerformanceChart ─────────────────────────────────────────────────────── */
function PerformanceChart() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    axios.get('/api/performance')
      .then((r) => setData(r.data))
      .catch(() => setError('Failed to load performance data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /><span>Loading chart…</span></div>;
  if (error)   return <div className="error-screen"><span>⚠ {error}</span></div>;
  if (!data.length) return null;

  const first     = data[0];
  const last      = data[data.length - 1];
  const portGain  = last.portfolio - first.portfolio;
  const portPct   = ((portGain / first.portfolio) * 100).toFixed(2);
  const benchGain = last.benchmark - first.benchmark;
  const benchPct  = ((benchGain / first.benchmark) * 100).toFixed(2);
  const alpha     = portGain - benchGain;
  const alphaPct  = (portPct - benchPct).toFixed(2);
  const maxVal    = Math.max(...data.map((d) => d.portfolio));
  const maxDrawdown = (((maxVal - last.portfolio) / maxVal) * 100).toFixed(2);

  return (
    <div className="performance-page">
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">Portfolio Performance</h2>
          <p className="section-subtitle">12-month trailing vs. S&P 500 benchmark</p>
        </div>
        <div className="chart-legend-pills">
          <span className="legend-pill" style={{ '--dot': '#58a6ff' }}>Portfolio</span>
          <span className="legend-pill" style={{ '--dot': '#3fb950' }}>S&P 500</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="perf-stats-grid">
        <StatCard
          label="Portfolio Return (1Y)"
          value={`${portPct >= 0 ? '+' : ''}${portPct}%`}
          sub={`${portGain >= 0 ? '+' : ''}${fmtUSD(portGain)}`}
          isGain={portGain >= 0}
        />
        <StatCard
          label="Benchmark Return (1Y)"
          value={`${benchPct >= 0 ? '+' : ''}${benchPct}%`}
          sub={`S&P 500 · ${fmtUSD(benchGain)}`}
          isGain={benchGain >= 0}
        />
        <StatCard
          label="Alpha Generated"
          value={`${alphaPct >= 0 ? '+' : ''}${alphaPct}%`}
          sub={`${alpha >= 0 ? '+' : ''}${fmtUSD(alpha)} vs benchmark`}
          isGain={alpha >= 0}
        />
        <StatCard
          label="Max Drawdown (1Y)"
          value={`-${maxDrawdown}%`}
          sub="From peak to current"
          isGain={false}
        />
      </div>

      {/* Chart */}
      <div className="chart-container card">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="portGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#58a6ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#58a6ff" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="benchGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3fb950" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3fb950" stopOpacity={0}    />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(48,54,61,0.7)" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fill: '#8b949e', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#30363d' }}
            />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fill: '#8b949e', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
              domain={['auto', 'auto']}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="benchmark"
              name="S&P 500"
              stroke="#3fb950"
              strokeWidth={2}
              fill="url(#benchGradient)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="portfolio"
              name="Portfolio"
              stroke="#58a6ff"
              strokeWidth={2.5}
              fill="url(#portGradient)"
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#58a6ff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly breakdown table */}
      <div className="monthly-table-wrap card" style={{ marginTop: 16 }}>
        <h3 className="section-title" style={{ marginBottom: 16 }}>Monthly Breakdown</h3>
        <table className="monthly-table">
          <thead>
            <tr>
              <th>Period</th>
              <th className="num">Portfolio Value</th>
              <th className="num">Benchmark Value</th>
              <th className="num">Month Change</th>
              <th className="num">vs Benchmark</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              const prev    = data[i - 1];
              const change  = prev ? d.portfolio - prev.portfolio : 0;
              const pct     = prev ? ((change / prev.portfolio) * 100).toFixed(2) : '—';
              const alpha   = prev ? (d.portfolio - d.benchmark) - (prev.portfolio - prev.benchmark) : 0;
              return (
                <tr key={d.date}>
                  <td className="month-cell">{d.date}</td>
                  <td className="num">{fmtUSD(d.portfolio)}</td>
                  <td className="num muted">{fmtUSD(d.benchmark)}</td>
                  <td className="num">
                    {i === 0 ? (
                      <span className="muted">—</span>
                    ) : (
                      <span className={change >= 0 ? 'gain' : 'loss'}>
                        {change >= 0 ? '+' : ''}{pct}%
                      </span>
                    )}
                  </td>
                  <td className="num">
                    {i === 0 ? (
                      <span className="muted">—</span>
                    ) : (
                      <span className={alpha >= 0 ? 'gain' : 'loss'}>
                        {alpha >= 0 ? '+' : ''}{fmtUSD(alpha)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PerformanceChart;
