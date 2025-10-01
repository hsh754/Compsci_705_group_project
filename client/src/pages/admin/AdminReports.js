import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSimpleReport } from "../../api/stats";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PieLegend = ({ items }) => (
    <div
        style={{
            display: "flex",
            flexWrap: "wrap",   // 允许换行
            gap: 12,
            justifyContent: "center",
            paddingTop: 8,
        }}
    >
        {items.map((it, i) => (
            <div
                key={i}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    maxWidth: 160,         // 限宽可换行
                    lineHeight: "16px",
                }}
            >
        <span
            style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: it.color,
                display: "inline-block",
                flex: "0 0 auto",
            }}
        />
                <span
                    style={{
                        fontSize: 16,
                        fontWeight: 1000,
                        color: "#475569",
                        wordBreak: "keep-all",
                        whiteSpace: "nowrap",
                    }}
                    title={it.label}
                >
          {it.label}
        </span>
            </div>
        ))}
    </div>
);

export default function AdminReports() {
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getSimpleReport({}).then((res) => setData(res.data.data));
    }, []);

    if (!data) return <div style={{ padding: 16 }}>Loading...</div>;

    const kpis = [
        { title: "Subjective mean", value: data.means?.subjective, state: data.states?.subjective },
        { title: "Objective mean", value: data.means?.objective,  state: data.states?.objective },
        { title: "Adjusted mean", value: data.means?.adjusted,   state: data.states?.adjusted  },
    ];

    const pieData = (data.pie?.labels || []).map((name, i) => ({
        name, value: data.pie?.values?.[i] ?? 0,
    }));
    const COLORS = ["#4CAF50", "#FF9800", "#2196F3", "#F44336", "#9C27B0"];

    return (
        <div style={{ padding: 16 }}>
            <h2 style={{ marginBottom: 12 }}>Reports</h2>

            {/* 三个方块 + 状态 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                {kpis.map(k => (
                    <div key={k.title} style={{ padding: 16, border: "1px solid #eee", borderRadius: 12, minHeight: 140, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                        <div>
                            <div style={{ fontSize: 13, color: "#666" }}>{k.title}</div>
                            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>
                                {Number.isFinite(k.value) ? Number(k.value).toFixed(2) : "—"}
                            </div>
                        </div>
                        <div style={{ fontSize: 14, color: "#333", marginTop: 8 }}>State：{k.state ?? "—"}</div>
                    </div>
                ))}
            </div>

            {/* 饼图 */}
            <div style={{border: "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 24}}>
                <h4 style={{margin: "0 0 12px"}}>Adjustment ratio</h4>

                {/* 给图本身一个确定高度；Legend 放到图外面 */}
                <div style={{height: 320}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}  // 稍微小一点，避免标签挤占空间
                                label
                            >
                                {pieData.map((_, i) => (
                                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]}/>
                                ))}
                            </Pie>
                            <Tooltip/>
                            {/* ❌ 删掉 <Legend />，不要放在图里 */}
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* ✅ 把图例放到图外部，始终在边框内且可换行 */}
                <PieLegend
                    items={pieData.map((d, i) => ({
                        label: d.name,                     // "Adjusted" / "Not adjusted"
                        color: COLORS[i % COLORS.length],  // 与扇区颜色一致
                    }))}
                />
            </div>


            {/* 参与者序列表格 */}
            <div style={{border: "1px solid #eee", borderRadius: 12, padding: 16}}>
                <h4 style={{margin: "0 0 12px"}}>Participants</h4>

                {!data.participants?.length ? (
                    <div style={{color: "#666"}}>暂无数据</div>
                ) : (
                    <table style={{width: "100%", borderCollapse: "collapse"}}>
                        <thead>
                        <tr style={{background: "#f9fafb"}}>
                            <th style={{textAlign: "left", padding: 10}}>Name</th>
                            <th style={{textAlign: "center", padding: 10}}>Subjective</th>
                            <th style={{textAlign: "center", padding: 10}}>Objective</th>
                            <th style={{textAlign: "center", padding: 10}}>Adjustment</th>
                            <th style={{ textAlign: "center", padding: 10 }}>Questionnaire</th> {/* ← 新增 */}
                        </tr>
                        </thead>
                        <tbody>
                        {data.participants.map((p) => (
                            <tr
                                key={p.id}
                                style={{cursor: "pointer"}}
                                onClick={() => navigate(`/admin/reports/${p.id}`)}
                            >
                                <td style={{padding: 10, borderTop: "1px solid #eee"}}>{p.name}</td>
                                <td style={{
                                    padding: 10,
                                    borderTop: "1px solid #eee",
                                    textAlign: "center"
                                }}>{p.subjective}</td>
                                <td style={{
                                    padding: 10,
                                    borderTop: "1px solid #eee",
                                    textAlign: "center"
                                }}>{p.objective}</td>
                                <td style={{
                                    padding: 10,
                                    borderTop: "1px solid #eee",
                                    textAlign: "center"
                                }}>{p.adjusted}</td>
                                <td style={{padding: 10, borderTop: "1px solid #eee", textAlign: "center"}}>
                                    GAD-7
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
