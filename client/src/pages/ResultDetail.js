// src/pages/ResultDetail.js
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { http } from "../api/http";

/* ============================
   工具函数
   ============================ */
function scaleTo03(arr) {
    const a = (arr || []).map((v) => Number(v ?? 0));
    const mx = Math.max(0, ...a);
    if (mx <= 1.000001) return a.map((v) => v * 3);
    return a;
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
    const step = (yMax - yMin) >= 2 ? 1 : 0.5;
    yMin = Math.floor(yMin / step) * step;
    yMax = Math.ceil (yMax / step) * step;
    yMin = Math.max(hardMin, yMin);
    yMax = Math.min(hardMax, yMax);
    const ticks = [];
    for (let t = yMin; t <= yMax + 1e-9; t += step) ticks.push(Number(t.toFixed(3)));
    return { yMin, yMax, ticks };
}

/* ============================
   焦虑等级 & 建议
   ============================ */
function getAnxietyCategory(finalTotal) {
    // 0-21 分量表：0-5 正常；6-10 轻度；11-15 中度；16-21 重度
    if (finalTotal >= 16) {
        return {
            level: "Severe anxiety",
            badgeColor: "#991b1b",
            badgeBg: "rgba(153,27,27,.1)",
            suggestion:
                "Your result falls into the severe range. This means you are probably experiencing significant anxiety. We strongly recommend you see your GP, and consider calling one of the below supports right now.",
            range: "16–21",
        };
    } else if (finalTotal >= 11) {
        return {
            level: "Moderate anxiety",
            badgeColor: "#b45309",
            badgeBg: "rgba(180,83,9,.12)",
            suggestion:
                "Your result falls into the moderate range. This means you could be experiencing significant anxiety. You may wish to see to your GP.",
            range: "11–15",
        };
    } else if (finalTotal >= 6) {
        return {
            level: "Mild anxiety",
            badgeColor: "#2563eb",
            badgeBg: "rgba(37,99,235,.12)",
            suggestion:
                "Your result falls into the mild range. You may wish to monitor your symptoms or speak to a health professional if you are concerned.",
            range: "6–10",
        };
    } else {
        return {
            level: "Normal",
            badgeColor: "#16a34a",
            badgeBg: "rgba(22,163,74,.12)",
            suggestion: "Your result falls into the normal range.",
            range: "0–5",
        };
    }
}

/* ============================
   自适应折线图（图例不压轴 + 顶部留白）
   ============================ */
function AxisLineChart({
                           series,
                           width = 880,
                           height = 320,
                           padding = 44,
                       }) {
    const colors = ["#2563eb", "#ff5b96", "#ffc259"];
    const n = series[0]?.data?.length || 0;

    // —— 布局参数：给图例预留空间 + 顶部“头部空间”避免点贴顶 ——
    const legendH = 24;       // 图例的高度
    const legendGap = 6;      // 图例与坐标系之间的间距
    const topHeadroomPx = 10; // 顶部保留像素，防止最高点“贴顶”的观感

    const leftPad = padding;
    const rightPad = padding;
    const bottomPad = padding;

    const innerW = width - leftPad - rightPad;
    const plotTop = padding + legendH + legendGap;        // 坐标系顶边（在图例下方）
    const plotH   = height - plotTop - bottomPad;         // 坐标系高度

    // —— X 轴：留边分布（首尾不贴边） ——
    const x = (i) => leftPad + ((i + 1) * innerW) / (n + 1);
    const xTicks = Array.from({ length: n }, (_, i) => i + 1);

    // —— 自适应 Y 轴（基于数据 0..3） ——
    let allMin = Infinity, allMax = -Infinity;
    series.forEach(s => (s.data || []).forEach(v => {
        const num = Number(v) || 0;
        if (num < allMin) allMin = num;
        if (num > allMax) allMax = num;
    }));
    // 生成“好看”的域与刻度（0.5/1 步长），仍严格限制在 [0,3]
    const { yMin, yMax, ticks: yTicks } = (function niceDomain(minV, maxV, { hardMin = 0, hardMax = 3, padRatio = 0.15 }) {
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
        const step = (yMax - yMin) >= 2 ? 1 : 0.5;
        yMin = Math.floor(yMin / step) * step;
        yMax = Math.ceil (yMax / step) * step;
        yMin = Math.max(hardMin, yMin);
        yMax = Math.min(hardMax, yMax);
        const ticks = [];
        for (let t = yMin; t <= yMax + 1e-9; t += step) ticks.push(Number(t.toFixed(3)));
        return { yMin, yMax, ticks };
    })(allMin, allMax, { hardMin: 0, hardMax: 3 });

    // —— Y 映射：在绘图区内再保留 topHeadroomPx 让最高点也不贴顶 ——
    const usableH = Math.max(1, plotH - topHeadroomPx);
    const y = (v) => {
        const clamped = Math.max(yMin, Math.min(yMax, v));
        return plotTop + usableH - ((clamped - yMin) * usableH) / (yMax - yMin);
    };

    return (
        <svg width={width} height={height} aria-label="Line chart">
            <defs>
                {/* 裁剪：折线与圆点不越界 */}
                <clipPath id="linePlotClip">
                    <rect x={leftPad} y={plotTop} width={innerW} height={plotH} />
                </clipPath>
            </defs>

            {/* 背景卡片 */}
            <rect x="0" y="0" width={width} height={height} fill="#fff" rx="12" />

            {/* —— 图例（放在坐标系上方，不再压住轴） —— */}
            <g transform={`translate(${leftPad}, ${padding})`}>
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

            {/* 网格（水平） */}
            {yTicks.map((t, i) => (
                <line key={`gy-${i}`} x1={leftPad} y1={y(t)} x2={leftPad + innerW} y2={y(t)} stroke="#eef2f7" />
            ))}

            {/* 坐标轴 */}
            <line x1={leftPad} y1={plotTop} x2={leftPad} y2={plotTop + plotH} stroke="#94a3b8" />
            <line x1={leftPad} y1={plotTop + plotH} x2={leftPad + innerW} y2={plotTop + plotH} stroke="#94a3b8" />

            {/* Y 轴刻度与标签 */}
            {yTicks.map((t, i) => (
                <g key={`yt-${i}`} transform={`translate(0, ${y(t)})`}>
                    <line x1={leftPad - 5} y1={0} x2={leftPad} y2={0} stroke="#94a3b8" />
                    <text x={leftPad - 8} y={4} fontSize="12" fill="#475569" textAnchor="end">{t}</text>
                </g>
            ))}

            {/* X 轴刻度与标签 */}
            {xTicks.map((t, i) => {
                const xx = x(i);
                return (
                    <g key={`xt-${i}`} transform={`translate(${xx}, ${plotTop + plotH})`}>
                        <line x1={0} y1={0} x2={0} y2={5} stroke="#94a3b8" />
                        <text x={0} y={18} fontSize="12" fill="#475569" textAnchor="middle">{t}</text>
                    </g>
                );
            })}

            {/* 折线与圆点（裁剪在绘图区） */}
            <g clipPath="url(#linePlotClip)">
                {series.map((s, si) => {
                    const color = colors[si % colors.length];
                    const pts = s.data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
                    return (
                        <g key={si}>
                            <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
                            {s.data.map((v, i) => (
                                <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={color} />
                            ))}
                        </g>
                    );
                })}
            </g>

            {/* 轴标题 */}
            <text x={leftPad + innerW / 2} y={height - 6} textAnchor="middle" fontSize="12" fill="#64748b">
                Question index
            </text>
            <text
                x="14" y={plotTop + plotH / 2}
                transform={`rotate(-90, 14, ${plotTop + plotH / 2})`}
                textAnchor="middle" fontSize="12" fill="#64748b"
            >
                Score (0–3)
            </text>
        </svg>
    );
}

/* =========================================
   分组柱状图（留边 + 自适应纵轴 + 裁剪）
   ========================================= */
function AxisBarChartMulti({
                               series,
                               width = 880,
                               height = 260,
                               padding = 44,
                               minLimit = 0.5,
                               padRatio = 0.2,
                               niceStep = 0.5,
                           }) {
    const m = series?.length || 0;
    const n = series?.[0]?.data?.length || 0;

    const innerW = width - padding * 2;
    const innerH = height - padding * 2;

    const step = innerW / (n + 1);
    const xCenter = (i) => padding + (i + 1) * step;

    let maxAbs = 0;
    for (const s of series) for (const v of (s.data || [])) maxAbs = Math.max(maxAbs, Math.abs(Number(v) || 0));
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
                    <rect x={padding} y={padding} width={innerW} height={innerH} />
                </clipPath>
            </defs>

            <rect x="0" y="0" width={width} height={height} fill="#fff" rx="12" />

            {yTicks.map((t, i) => (
                <line key={`gy-${i}`} x1={padding} y1={y(t)} x2={padding + innerW} y2={y(t)} stroke="#eef2f7" />
            ))}

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
                                return (
                                    <rect
                                        key={`b-${si}`}
                                        x={cx + offset}
                                        y={top}
                                        width={barW - 2}
                                        height={h}
                                        fill={s.color || "#f59e0b"}
                                        rx="3"
                                    />
                                );
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
                        <rect width="12" height="12" fill={s.color || "#f59e0b"} rx="2" />
                        <text x="16" y="11" fontSize="12" fill="#475569">{s.label}</text>
                    </g>
                ))}
            </g>

            <text x={padding + innerW / 2} y={height - 6} textAnchor="middle" fontSize="12" fill="#64748b">
                Question index
            </text>
            <text
                x="14" y={padding + innerH / 2}
                transform={`rotate(-90, 14, ${padding + innerH / 2})`}
                textAnchor="middle" fontSize="12" fill="#64748b"
            >
                Signed deviation
            </text>
        </svg>
    );
}

/* ============================
   Tooltip 组件
   ============================ */
function TooltipChip({ children, content, style, ...props }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const chipRef = useRef(null);

    const handleMouseEnter = (e) => {
        if (chipRef.current) {
            const rect = chipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const tooltipWidth = 280; // maxWidth from tooltip style
            
            // 计算最佳位置，避免超出视窗
            let x = rect.left + rect.width / 2;
            if (x - tooltipWidth / 2 < 10) {
                x = tooltipWidth / 2 + 10;
            } else if (x + tooltipWidth / 2 > viewportWidth - 10) {
                x = viewportWidth - tooltipWidth / 2 - 10;
            }
            
            setPosition({
                x: x,
                y: rect.top - 8
            });
        }
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <>
            <span
                ref={chipRef}
                className="sv-btn"
                style={{
                    ...style,
                    cursor: "help",
                    position: "relative"
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleMouseEnter}
                onTouchEnd={handleMouseLeave}
                {...props}
            >
                {children}
            </span>
            
            {showTooltip && (
                <div
                    style={{
                        position: "fixed",
                        left: position.x,
                        top: position.y,
                        transform: "translateX(-50%) translateY(-100%)",
                        background: "#1f2937",
                        color: "#fff",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: window.innerWidth < 768 ? "12px" : "13px",
                        fontWeight: "500",
                        lineHeight: "1.4",
                        maxWidth: window.innerWidth < 768 ? "90vw" : "280px",
                        zIndex: 1000,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        pointerEvents: "none",
                        whiteSpace: "normal"
                    }}
                >
                    {content}
                    {/* 小箭头 */}
                    <div
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 0,
                            height: 0,
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderTop: "6px solid #1f2937"
                        }}
                    />
                </div>
            )}
        </>
    );
}

/* ============================
   页面
   ============================ */
export default function ResultDetail() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const navigate = useNavigate();

    const handlePrint = () => {
        // 浏览器的系统级打印。用户可在对话框里选择“保存为 PDF”
        window.print();
    };
    const handleExit = () => {
        // 不清除 sessionStorage，允许在有效期内重复访问
        navigate("/dashboard", { replace: true });
    };


    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const [subRes, anaRes] = await Promise.all([
                    http.get(`/api/public/user/submissions/${id}`),
                    http.get(`/api/public/user/submissions/${id}/analysis`),
                ]);
                if (!mounted) return;
                setSubmission(subRes.data || null);
                setAnalysis(anaRes.data?.analysis || null);
            } catch (e) {
                if (!mounted) return;
                setError(e?.response?.data?.error || e.message || "Failed to load");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    const computed = useMemo(() => {
        if (!submission) return null;
        const answers = submission.answers || [];
        const emoNorm = analysis?.normEmotionScores || [];
        const adjustedScores = analysis?.adjustedScores || null;
        const needsAdjustment = !!analysis?.needsAdjustment;

        const subjRaw = answers.map((a) =>
            a?.norm != null ? Number(a.norm) :
                a?.normalized != null ? Number(a.normalized) :
                    a?.score != null ? Number(a.score) : 0
        );
        const subjective = scaleTo03(subjRaw);
        const objective  = scaleTo03(emoNorm);

        let finalScore = subjective.slice();
        if (needsAdjustment && Array.isArray(adjustedScores) && adjustedScores.length === answers.length) {
            finalScore = scaleTo03(adjustedScores);
        }

        const subjectiveTotal = Number(subjective.reduce((a, b) => a + b, 0).toFixed(3));
        const objectiveTotal  = Number(objective.reduce((a, b) => a + b, 0).toFixed(3));
        const finalTotal      = Number(finalScore.reduce((a, b) => a + b, 0).toFixed(3));
        const adjustedTotal   = needsAdjustment ? finalTotal : null;

        const devObjSubj  = objective.map((o, i) => Number((o - (subjective[i] ?? 0)).toFixed(3)));
        const devObjFinal = objective.map((o, i) => Number((o - (finalScore[i] ?? 0)).toFixed(3)));

        return {
            subjective, objective, finalScore,
            subjectiveTotal, objectiveTotal, adjustedTotal, finalTotal, needsAdjustment,
            devObjSubj, devObjFinal
        };
    }, [submission, analysis]);

    if (loading) return (
        <div style={{ display: "grid", placeItems: "center", padding: 24 }}>
            <div className="sv-card sv-pad" style={{ maxWidth: 600 }}>Loading result...</div>
        </div>
    );
    if (error) return (
        <div style={{ display: "grid", placeItems: "center", padding: 24 }}>
            <div className="sv-card sv-pad" style={{ color: "#b91c1c", maxWidth: 600 }}>Failed to load: {error}</div>
        </div>
    );
    if (!submission || !computed) return (
        <div style={{ display: "grid", placeItems: "center", padding: 24 }}>
            <div className="sv-card sv-pad" style={{ maxWidth: 600 }}>Result not found.</div>
        </div>
    );

    const {
        subjective, objective, finalScore,
        subjectiveTotal, objectiveTotal, adjustedTotal, finalTotal, needsAdjustment,
        devObjSubj, devObjFinal
    } = computed;

    // 计算焦虑等级
    const cat = getAnxietyCategory(finalTotal);

    return (
        <div style={{ 
            width: "100%",
            minHeight: "calc(100vh - 64px)",
            padding: 16,
            display: "flex",
            justifyContent: "center",
            background: "var(--page-bg, #f6f7fb)"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "1100px",
                display: "grid",
                gap: 16
            }}>
            {/* 顶部：结论 Hero */}
            <div className="sv-card" style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 999,
                    color: cat.badgeColor,
                    background: cat.badgeBg,
                    fontWeight: 700
                }}
            >
              {/* 图标点 */}
                <span style={{ width: 8, height: 8, borderRadius: 999, background: cat.badgeColor }} />
                {cat.level} <span style={{ fontWeight: 500, color: "#64748b" }}>({cat.range})</span>
            </span>
                    </div>
                    <h2 style={{ margin: "4px 0 6px" }}>{submission.title} — Final assessment</h2>
                    <div className="sv-muted" style={{ maxWidth: 840, lineHeight: 1.5 }}>
                        {cat.suggestion}
                    </div>

                    {/* 次要信息：chips with tooltips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                        <TooltipChip 
                            content="Direct questionnaire scores from your answers"
                            style={{ padding: "6px 10px" }}
                        >
                            Subjective total: <b style={{ marginLeft: 6 }}>{subjectiveTotal}</b>
                        </TooltipChip>
                        
                        <TooltipChip 
                            content="multimodal emotional model analysis scores from your video recordings"
                            style={{ padding: "6px 10px" }}
                        >
                            Objective total: <b style={{ marginLeft: 6 }}>{objectiveTotal}</b>
                        </TooltipChip>
                        
                        <TooltipChip 
                            content="Whether model analysis was used to modify your questionnaire scores"
                            style={{ padding: "6px 10px" }}
                        >
                            Adjusted: <b style={{ marginLeft: 6 }}>{needsAdjustment ? "Yes" : "No"}</b>
                        </TooltipChip>
                        
                        {needsAdjustment && (
                            <TooltipChip 
                                content=" Final score combining questionnaire and model emotion analysis"
                                style={{ padding: "6px 10px" }}
                            >
                                Adjusted total: <b style={{ marginLeft: 6 }}>{adjustedTotal}</b>
                            </TooltipChip>
                        )}
                    </div>
                </div>

                {/* 右侧：Final total 大号数值 */}
                <TooltipChip 
                    content="This is your final anxiety assessment score."
                    style={{ minWidth: 220, justifySelf: "end", textAlign: "center", padding: 16, display: "block", cursor: "help" }}
                >
                    <div className="sv-card" style={{ minWidth: 220, justifySelf: "end", textAlign: "center", padding: 16 }}>
                        <div className="sv-muted">Final score (0–21)</div>
                        <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, marginTop: 8, color: "#0f172a" }}>
                            {finalTotal}
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                            {needsAdjustment ? "Using adjusted scores" : "Using subjective scores"}
                        </div>
                    <div style={{ marginTop: 10, height: 6, width: "100%", background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                        {/* 进度条（占比展示 0-21） */}
                        <div
                            style={{
                                height: "100%",
                                width: `${Math.min(100, Math.max(0, (finalTotal / 21) * 100))}%`,
                                background: cat.badgeColor,
                                opacity: 0.8
                            }}
                        />
                    </div>
                    </div>
                </TooltipChip>
            </div>

            {/* Per-question scores（自适应纵轴 + 留边分布） */}
            <div className="sv-card sv-pad">
                <h3 style={{ marginTop: 0 }}>Per-question scores</h3>
                <div className="sv-muted" style={{ marginBottom: 8 }}>
                    Line chart of Subjective, Objective, and Final scores (0–3)
                </div>
                <div style={{ overflowX: "auto", display: "flex", justifyContent: "center" }}>
                    <AxisLineChart
                        series={[
                            { label: "Subjective", data: subjective },
                            { label: "Objective",  data: objective  },
                            { label: "Final",      data: finalScore }
                        ]}
                    />
                </div>
            </div>

            {/* Per-question deviations（分组 + 留边分布 + 裁剪 + 自适应纵轴） */}
            <div className="sv-card sv-pad">
                <h3 style={{ marginTop: 0 }}>Per-question deviations</h3>
                <div className="sv-muted" style={{ marginBottom: 8 }}>
                    If adjusted, both deviations are shown. Otherwise, "Objective − Final" equals "Objective − Subjective".
                    <div style={{ marginTop: 4, fontSize: "12px", color: "#9ca3af" }}>
                        💡 <strong>Positive values:</strong> AI detected higher emotion than questionnaire • 
                        <strong> Negative values:</strong> AI detected lower emotion than questionnaire
                    </div>
                </div>
                <div style={{ overflowX: "auto", display: "flex", justifyContent: "center" }}>
                    <AxisBarChartMulti
                        series={
                            needsAdjustment
                                ? [
                                    { label: "Objective − Subjective",       color: "#f59e0b", data: devObjSubj  },
                                    { label: "Objective − Final (Adjusted)", color: "#10b981", data: devObjFinal },
                                ]
                                : [
                                    { label: "Objective − Final", color: "#f59e0b", data: devObjFinal },
                                ]
                        }
                    />
                </div>
            </div>
            {/* Actions: Print & Exit */}
            <div className="sv-card sv-pad no-print"
                 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div className="sv-muted">You can print this result as a PDF or return to Dashboard.</div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="sv-btn" onClick={handleExit}>Exit to Dashboard</button>
                    <button className="sv-btn sv-btn-primary" onClick={handlePrint}>Print as PDF</button>
                </div>
            </div>
            </div>
        </div>
    );
}
