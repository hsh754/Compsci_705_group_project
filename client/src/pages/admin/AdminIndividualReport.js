import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getIndividualReport } from "../../api/stats";

/* 工具函数 */
function scaleTo03(arr) {
    const a = (arr || []).map((v) => Number(v ?? 0));
    const mx = Math.max(0, ...a);
    return mx <= 1.000001 ? a.map((v) => v * 3) : a;
}
function niceDomain(minV, maxV, { hardMin = 0, hardMax = 3, padRatio = 0.15 }) {
    let lo = Math.max(hardMin, minV);
    let hi = Math.min(hardMax, maxV);
    if (hi - lo < 0.25) {
        const mid = (hi + lo) / 2;
        lo = Math.max(hardMin, mid - 0.5);
        hi = Math.min(hardMax, mid + 0.5);
    }
    const span = hi - lo;
    const pad = Math.max(0.15, span * padRatio);
    let yMin = Math.max(hardMin, lo - pad);
    let yMax = Math.min(hardMax, hi + pad);
    const step = yMax - yMin >= 2 ? 1 : 0.5;
    yMin = Math.floor(yMin / step) * step;
    yMax = Math.ceil(yMax / step) * step;
    yMin = Math.max(hardMin, yMin);
    yMax = Math.min(hardMax, yMax);
    const ticks = [];
    for (let t = yMin; t <= yMax + 1e-9; t += step) ticks.push(Number(t.toFixed(3)));
    return { yMin, yMax, ticks };
}

/* 折线图（保留顶部小图例；不再有图下说明框） */
function AxisLineChart({ series, colors, width = 880, height = 320, padding = 44 }) {
    const n = series[0]?.data?.length || 0;
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;
    const x = (i) => padding + ((i + 1) * innerW) / (n + 1);

    let allMin = Infinity, allMax = -Infinity;
    series.forEach((s) => (s.data || []).forEach((v) => {
        const num = Number(v) || 0;
        if (num < allMin) allMin = num;
        if (num > allMax) allMax = num;
    }));
    const { yMin, yMax, ticks: yTicks } = niceDomain(allMin, allMax, { hardMin: 0, hardMax: 3 });
    const y = (v) => padding + innerH - ((Math.max(yMin, Math.min(yMax, v)) - yMin) * innerH) / (yMax - yMin);
    const xTicks = Array.from({ length: n }, (_, i) => i + 1);

    return (
        <svg width={width} height={height} aria-label="Line chart">
            <defs>
                <clipPath id="linePlotClip">
                    <rect x={padding} y={padding} width={innerW} height={innerH} rx="0" ry="0" />
                </clipPath>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill="#fff" rx="12" />
            {yTicks.map((t, i) => (
                <line key={`gy-${i}`} x1={padding} y1={y(t)} x2={padding + innerW} y2={y(t)} stroke="#eef2f7" />
            ))}
            <line x1={padding} y1={padding} x2={padding} y2={padding + innerH} stroke="#94a3b8" />
            <line x1={padding} y1={padding + innerH} x2={padding + innerW} y2={padding + innerH} stroke="#94a3b8" />
            {yTicks.map((t, i) => (
                <g key={`yt-${i}`} transform={`translate(0, ${y(t)})`}>
                    <line x1={padding - 5} y1={0} x2={padding} y2={0} stroke="#94a3b8" />
                    <text x={padding - 8} y={4} fontSize="12" fill="#475569" textAnchor="end">{t}</text>
                </g>
            ))}
            {xTicks.map((t, i) => {
                const xx = x(i);
                return (
                    <g key={`xt-${i}`} transform={`translate(${xx}, ${padding + innerH})`}>
                        <line x1={0} y1={0} x2={0} y2={5} stroke="#94a3b8" />
                        <text x={0} y={18} fontSize="12" fill="#475569" textAnchor="middle">{t}</text>
                    </g>
                );
            })}

            <g clipPath="url(#linePlotClip)">
                {series.map((s, si) => {
                    const color = colors[si % colors.length];
                    const pts = s.data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
                    return (
                        <g key={si}>
                            <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={pts} />
                            {s.data.map((v, i) => (<circle key={i} cx={x(i)} cy={y(v)} r="3" fill={color} />))}
                        </g>
                    );
                })}
            </g>

            {/* 顶部小图例 */}
            <g transform={`translate(${padding}, ${padding - 14})`}>
                {series.map((s, si) => {
                    const color = colors[si % colors.length];
                    return (
                        <g key={si} transform={`translate(${si * 160}, 0)`}>
                            <rect width="12" height="12" fill={color} rx="2" />
                            <text x="16" y="11" fontSize="12" fill="#475569">{s.label}</text>
                        </g>
                    );
                })}
            </g>

            <text x={padding + innerW / 2} y={height - 6} textAnchor="middle" fontSize="12" fill="#64748b">Question index</text>
            <text x="14" y={padding + innerH / 2} transform={`rotate(-90, 14, ${padding + innerH / 2})`} textAnchor="middle" fontSize="12" fill="#64748b">Score (0–3)</text>
        </svg>
    );
}

/* 分组柱状图（不变） */
function AxisBarChartMulti({ series, width = 880, height = 260, padding = 44, minLimit = 0.5, padRatio = 0.2, niceStep = 0.5 }) {
    const m = series?.length || 0;
    const n = series?.[0]?.data?.length || 0;
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;
    const step = innerW / (n + 1);
    const xCenter = (i) => padding + (i + 1) * step;

    let maxAbs = 0;
    for (const s of series) for (const v of s.data || []) maxAbs = Math.max(maxAbs, Math.abs(Number(v) || 0));
    const rawLimit = Math.max(minLimit, maxAbs * (1 + padRatio));
    let limit = Math.ceil(rawLimit / niceStep) * niceStep;
    const yTickStep = limit >= 2 ? 1 : 0.5;

    const y = (v) => {
        const clamped = Math.max(-limit, Math.min(limit, v));
        return padding + innerH - ((clamped + limit) * innerH) / (2 * limit);
    };

    const yTicks = [];
    for (let t = -limit; t <= limit + 1e-9; t += yTickStep) yTicks.push(Number(t.toFixed(3)));
    const xTicks = Array.from({ length: n }, (_, i) => i + 1);

    const groupW = Math.min(step * 0.7, 60);
    const barW = Math.max(8, Math.min(24, Math.floor(groupW / Math.max(1, m))));
    const groupSpan = barW * m;
    const zeroY = y(0);

    return (
        <svg width={width} height={height} aria-label="Bar chart">
            <defs>
                <clipPath id="barPlotClip">
                    <rect x={padding} y={padding} width={innerW} height={innerH} rx="0" ry="0" />
                </clipPath>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill="#fff" rx="12" />
            {yTicks.map((t, i) => (<line key={`gy-${i}`} x1={padding} y1={y(t)} x2={padding + innerW} y2={y(t)} stroke="#eef2f7" />))}
            <line x1={padding} y1={zeroY} x2={padding + innerW} y2={zeroY} stroke="#94a3b8" />
            <line x1={padding} y1={padding} x2={padding} y2={padding + innerH} stroke="#94a3b8" />
            {yTicks.map((t, i) => (
                <g key={`yt-${i}`} transform={`translate(0, ${y(t)})`}>
                    <line x1={padding - 5} y1={0} x2={padding} y2={0} stroke="#94a3b8" />
                    <text x={padding - 8} y={4} fontSize="12" fill="#475569" textAnchor="end">{t}</text>
                </g>
            ))}

            <g clipPath="url(#barPlotClip)">
                {Array.from({ length: n }, (_, i) => {
                    const cx = xCenter(i);
                    return (
                        <g key={`g-${i}`}>
                            {series.map((s, si) => {
                                const v = Number(s.data?.[i] ?? 0);
                                const yv = y(v);
                                const top = Math.min(zeroY, yv);
                                const h = Math.max(0.5, Math.abs(yv - zeroY));
                                const offset = -groupSpan / 2 + (si + 0.5) * barW;
                                return <rect key={`b-${si}`} x={cx + offset} y={top} width={barW - 2} height={h} fill={s.color} rx="3" />;
                            })}
                        </g>
                    );
                })}
            </g>

            {xTicks.map((t, i) => {
                const xx = xCenter(i);
                return (
                    <g key={`xt-${i}`} transform={`translate(${xx}, ${padding + innerH})`}>
                        <line x1={0} y1={0} x2={0} y2={5} stroke="#94a3b8" />
                        <text x={0} y={18} fontSize="12" fill="#475569" textAnchor="middle">{t}</text>
                    </g>
                );
            })}

            <g transform={`translate(${padding}, ${padding - 14})`}>
                {series.map((s, si) => (
                    <g key={si} transform={`translate(${si * 220}, 0)`}>
                        <rect width="12" height="12" fill={s.color} rx="2" />
                        <text x="16" y="11" fontSize="12" fill="#475569">{s.label}</text>
                    </g>
                ))}
            </g>

            <text x={padding + (width - padding * 2) / 2} y={height - 6} textAnchor="middle" fontSize="12" fill="#64748b">Question index</text>
            <text x="14" y={padding + (height - padding * 2) / 2} transform={`rotate(-90, 14, ${padding + (height - padding * 2) / 2})`} textAnchor="middle" fontSize="12" fill="#64748b">Signed deviation</text>
        </svg>
    );
}

/* 页面 */
export default function AdminIndividualReport() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getIndividualReport(id)
            .then((res) => setData(res.data?.data ?? null))
            .catch((e) => setError(e?.response?.data?.message || e.message || "请求失败"))
            .finally(() => setLoading(false));
    }, [id]);

    const computed = useMemo(() => {
        if (!data) return null;
        const subjArr01 = data.normQuestionnaireScores || [];
        const emoArr01  = data.normEmotionScores || [];
        const adjArr01  = data.adjustedScores || null;

        const subjective = scaleTo03(subjArr01);
        const objective  = scaleTo03(emoArr01);

        const needsAdjustment = !!(data.needsAdjustment);
        const finalScore =
            needsAdjustment && Array.isArray(adjArr01) && adjArr01.length === subjective.length
                ? scaleTo03(adjArr01)
                : subjective;

        const devObjSubj  = objective.map((o, i) => Number((o - (subjective[i] ?? 0)).toFixed(3)));
        const devObjFinal = objective.map((o, i) => Number((o - (finalScore[i] ?? 0)).toFixed(3)));

        return { subjective, objective, finalScore, needsAdjustment, devObjSubj, devObjFinal };
    }, [data]);

    if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
    if (error)   return <div style={{ padding: 16, color: "crimson" }}>出错了：{error}</div>;
    if (!data || !computed) return <div style={{ padding: 16 }}>未找到该参与者的数据</div>;

    const { subjective, objective, finalScore, needsAdjustment, devObjSubj, devObjFinal } = computed;

    // 颜色：蓝/粉/橙（与你的折线图一致）
    const LINE_COLORS = ["#2563eb", "#ec4899", "#f59e0b"]; // Subjective / Objective / Final
    const BAR_SERIES = needsAdjustment
        ? [
            { label: "Objective − Subjective",       color: "#f59e0b", data: devObjSubj  },
            { label: "Objective − Final (Adjusted)", color: "#10b981", data: devObjFinal },
        ]
        : [{ label: "Objective − Final", color: "#f59e0b", data: devObjFinal }];

    const Card = ({ title, value }) => (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: "#fff", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{title}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
        </div>
    );

    // 最终分（0–21）的大卡片
    const maxFinal = 21; // GAD-7: 7题×3分
    const finalVal = Number(data.adjustedTotal ?? data.subjectiveTotal) || 0;
    const finalLabel = needsAdjustment ? "Using adjusted scores" : "Using subjective scores";
    const progress = Math.max(0, Math.min(1, finalVal / maxFinal));

    const Dot = ({ color }) => (
        <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: color, marginRight: 8 }} />
    );

    return (
        <div style={{ 
            padding: "32px 300px",
            background: "#f8fafc",
            minHeight: "100vh",
            display: "grid",
            gap: 16
        }}>
            {/* 标题 */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h2 style={{ 
                    fontSize: "28px", 
                    fontWeight: "600", 
                    color: "#1e293b",
                    margin: 0
                }}>Participant Report</h2>
                <div style={{ color: "#666" }}>
                    <b>ID:</b> {id} &nbsp;|&nbsp; <b>时间:</b> {data.createdAt ? new Date(data.createdAt).toLocaleString() : "N/A"}
                </div>
            </div>

            {/* 上方三块 + Final score 特卡 */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#fff" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
                    <Card title="Subjective total" value={Math.round(Number(data.subjectiveTotal))} />
                    <Card title="Objective total" value={Number(data.objectiveTotal).toFixed(2)} />
                    <Card title="Adjusted" value={needsAdjustment ? "Yes" : "No"} />
                </div>

                {/* Final score 样式卡片 */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#fff" }}>
                    <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>Final score (0–21)</div>
                    <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: "#0f172a" }}>
                        {needsAdjustment ? finalVal.toFixed(2) : finalVal}
                    </div>
                    <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>{finalLabel}</div>
                    <div style={{ marginTop: 10, height: 6, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
                        <div style={{ width: `${(progress * 100).toFixed(1)}%`, height: "100%", background: "#f59e0b" }} />
                    </div>
                </div>

                {/* 三个状态合并在一个文本框（彩色圆点） */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#f8fafc", marginTop: 12, color: "#334155" }}>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <div><Dot color={LINE_COLORS[0]} />Subjective：{data.states?.subjective ?? "—"}</div>
                        <div><Dot color={LINE_COLORS[1]} />Objective：{data.states?.objective  ?? "—"}</div>
                        <div><Dot color={LINE_COLORS[2]} />Final：{data.states?.adjusted  ?? "—"}</div>
                    </div>
                </div>
            </div>

            {/* 折线图（不再有底部说明框） */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#fff" }}>
                <h3 style={{ marginTop: 0 }}>Per-question scores</h3>
                <div style={{ overflowX: "auto" }}>
                    <AxisLineChart
                        colors={LINE_COLORS}
                        series={[
                            { label: "Subjective", data: subjective },
                            { label: "Objective",  data: objective  },
                            { label: "Final",      data: finalScore }
                        ]}
                    />
                </div>
            </div>

            {/* 柱状图（不再有底部说明框） */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#fff" }}>
                <h3 style={{ marginTop: 0 }}>Per-question deviations</h3>
                <div style={{ overflowX: "auto" }}>
                    <AxisBarChartMulti series={needsAdjustment
                        ? [
                            { label: "Objective − Subjective",       color: "#f59e0b", data: devObjSubj  },
                            { label: "Objective − Final (Adjusted)", color: "#10b981", data: devObjFinal },
                        ]
                        : [{ label: "Objective − Final", color: "#f59e0b", data: devObjFinal }]}
                    />
                </div>
            </div>
        </div>
    );
}
