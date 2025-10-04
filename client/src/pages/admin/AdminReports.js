import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSimpleReport } from "../../api/stats";

export default function AdminReports() {
    const [data, setData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // 每页显示10条
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const questionnaireId = searchParams.get("questionnaireId");
        const params = questionnaireId ? { questionnaireId } : {};
        getSimpleReport(params).then((res) => setData(res.data.data));
    }, [searchParams]);

    if (!data) return <div style={{ padding: 16 }}>Loading...</div>;

    // 计算分页
    const totalItems = data.participants?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentParticipants = data.participants?.slice(startIndex, endIndex) || [];

    // 分页按钮范围
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 7;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div style={{ 
            padding: "32px 48px",
            background: "#f8fafc",
            minHeight: "100vh"
        }}>
            <h2 style={{ 
                fontSize: "28px", 
                fontWeight: "600", 
                color: "#1e293b",
                marginBottom: "8px"
            }}>
                Participant Reports
            </h2>
            
            <p style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "24px"
            }}>
                Total: {totalItems} participants • Click on any row to view detailed report
            </p>

            {/* 参与者列表表格 */}
            <div style={{
                background: "#fff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,.04)"
            }}>
                <h4 style={{
                    margin: "0 0 20px",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1e293b"
                }}>
                    Participants
                </h4>

                {!totalItems ? (
                    <div style={{ 
                        color: "#64748b",
                        textAlign: "center",
                        padding: "40px"
                    }}>
                        No data available
                    </div>
                ) : (
                    <>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{
                                width: "100%",
                                borderCollapse: "collapse"
                            }}>
                                <thead>
                                    <tr style={{
                                        background: "#f8fafc",
                                        borderBottom: "2px solid #e2e8f0"
                                    }}>
                                        <th style={{
                                            textAlign: "left",
                                            padding: "14px 16px",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#475569",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}>Name</th>
                                        <th style={{
                                            textAlign: "center",
                                            padding: "14px 16px",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#475569",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}>Subjective</th>
                                        <th style={{
                                            textAlign: "center",
                                            padding: "14px 16px",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#475569",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}>Objective</th>
                                        <th style={{
                                            textAlign: "center",
                                            padding: "14px 16px",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#475569",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}>Adjustment</th>
                                        <th style={{
                                            textAlign: "center",
                                            padding: "14px 16px",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#475569",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}>Questionnaire</th>
                                        <th style={{
                                            textAlign: "center",
                                            padding: "14px 16px",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#475569",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentParticipants.map((p) => (
                                        <tr
                                            key={p.id}
                                            style={{
                                                cursor: "pointer",
                                                transition: "all 0.2s"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "#f8fafc";
                                                e.currentTarget.style.transform = "translateX(2px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "transparent";
                                                e.currentTarget.style.transform = "translateX(0)";
                                            }}
                                            onClick={() => navigate(`/admin/reports/${p.id}`)}
                                        >
                                            <td style={{
                                                padding: "14px 16px",
                                                borderTop: "1px solid #e2e8f0",
                                                fontSize: "14px",
                                                color: "#1e293b",
                                                fontWeight: "500"
                                            }}>
                                                <span style={{ marginRight: "8px" }}>👤</span>
                                                {p.name}
                                            </td>
                                            <td style={{
                                                padding: "14px 16px",
                                                borderTop: "1px solid #e2e8f0",
                                                textAlign: "center",
                                                fontSize: "14px",
                                                color: "#475569"
                                            }}>{p.subjective}</td>
                                            <td style={{
                                                padding: "14px 16px",
                                                borderTop: "1px solid #e2e8f0",
                                                textAlign: "center",
                                                fontSize: "14px",
                                                color: "#475569"
                                            }}>{p.objective}</td>
                                            <td style={{
                                                padding: "14px 16px",
                                                borderTop: "1px solid #e2e8f0",
                                                textAlign: "center",
                                                fontSize: "14px",
                                                color: "#475569"
                                            }}>{p.adjusted}</td>
                                            <td style={{
                                                padding: "14px 16px",
                                                borderTop: "1px solid #e2e8f0",
                                                textAlign: "center",
                                                fontSize: "14px",
                                                color: "#475569"
                                            }}>
                                                GAD-7
                                            </td>
                                            <td style={{
                                                padding: "14px 16px",
                                                borderTop: "1px solid #e2e8f0",
                                                textAlign: "center"
                                            }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/reports/${p.id}`);
                                                    }}
                                                    style={{
                                                        padding: "6px 14px",
                                                        fontSize: "13px",
                                                        fontWeight: "500",
                                                        color: "#667eea",
                                                        background: "#f0f4ff",
                                                        border: "1px solid #c7d2fe",
                                                        borderRadius: "8px",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "6px"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.background = "#667eea";
                                                        e.target.style.color = "#fff";
                                                        e.target.style.borderColor = "#667eea";
                                                        e.target.style.transform = "translateY(-1px)";
                                                        e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.background = "#f0f4ff";
                                                        e.target.style.color = "#667eea";
                                                        e.target.style.borderColor = "#c7d2fe";
                                                        e.target.style.transform = "translateY(0)";
                                                        e.target.style.boxShadow = "none";
                                                    }}
                                                >
                                            
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 分页控件 */}
                        {totalPages > 1 && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: "20px",
                                paddingTop: "20px",
                                borderTop: "1px solid #e2e8f0"
                            }}>
                                <div style={{
                                    fontSize: "14px",
                                    color: "#64748b"
                                }}>
                                    Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
                                </div>

                                <div style={{
                                    display: "flex",
                                    gap: "6px",
                                    alignItems: "center"
                                }}>
                                    {/* 首页 */}
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        style={{
                                            padding: "8px 12px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            background: currentPage === 1 ? "#f8fafc" : "#fff",
                                            color: currentPage === 1 ? "#cbd5e1" : "#475569",
                                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                            fontSize: "14px",
                                            fontWeight: "500"
                                        }}
                                    >
                                        ⟪
                                    </button>

                                    {/* 上一页 */}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        style={{
                                            padding: "8px 12px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            background: currentPage === 1 ? "#f8fafc" : "#fff",
                                            color: currentPage === 1 ? "#cbd5e1" : "#475569",
                                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                            fontSize: "14px",
                                            fontWeight: "500"
                                        }}
                                    >
                                        ‹
                                    </button>

                                    {/* 页码 */}
                                    {getPageNumbers().map((page, idx) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${idx}`} style={{
                                                padding: "8px 4px",
                                                color: "#94a3b8"
                                            }}>...</span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                style={{
                                                    padding: "8px 12px",
                                                    minWidth: "40px",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "8px",
                                                    background: currentPage === page ? "#667eea" : "#fff",
                                                    color: currentPage === page ? "#fff" : "#475569",
                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                    fontWeight: currentPage === page ? "600" : "500",
                                                    transition: "all 0.2s"
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (currentPage !== page) {
                                                        e.target.style.background = "#f8fafc";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (currentPage !== page) {
                                                        e.target.style.background = "#fff";
                                                    }
                                                }}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}

                                    {/* 下一页 */}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            padding: "8px 12px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            background: currentPage === totalPages ? "#f8fafc" : "#fff",
                                            color: currentPage === totalPages ? "#cbd5e1" : "#475569",
                                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                                            fontSize: "14px",
                                            fontWeight: "500"
                                        }}
                                    >
                                        ›
                                    </button>

                                    {/* 末页 */}
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            padding: "8px 12px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            background: currentPage === totalPages ? "#f8fafc" : "#fff",
                                            color: currentPage === totalPages ? "#cbd5e1" : "#475569",
                                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                                            fontSize: "14px",
                                            fontWeight: "500"
                                        }}
                                    >
                                        ⟫
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
