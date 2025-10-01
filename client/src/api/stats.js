import { http } from "./http";

// 你的 http.js baseURL 不变，这里直接调用 /admin/reports
export const getSimpleReport = (params) =>
    http.get("api/admin/reports", { params });

export const getIndividualReport = (id) =>
    http.get(`api/admin/reports/${id}`);