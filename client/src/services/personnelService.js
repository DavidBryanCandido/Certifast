import axios from "axios";
import authService from "./authService";
import { getApiBase } from "../apiBase";

const API = getApiBase();

function authConfig() {
    return {
        headers: {
            Authorization: `Bearer ${authService.getAdminToken()}`,
        },
    };
}

export async function getPersonnelRoster(options = null) {
    const normalized =
        options && typeof options === "object" && !Array.isArray(options)
            ? options
            : { termId: options };
    const params = {};
    if (normalized.termId) params.termId = normalized.termId;
    if (normalized.includeArchived) params.includeArchived = true;
    const res = await axios.get(`${API}/admin/personnel`, {
        ...authConfig(),
        params,
    });
    return res.data?.data || {};
}

export async function createPersonnelAssignment(payload) {
    const res = await axios.post(
        `${API}/admin/personnel`,
        payload,
        authConfig(),
    );
    return res.data;
}

export async function updatePersonnelAssignment(assignmentId, payload) {
    const res = await axios.put(
        `${API}/admin/personnel/${assignmentId}`,
        payload,
        authConfig(),
    );
    return res.data;
}

export async function createPersonnelTerm(payload) {
    const res = await axios.post(
        `${API}/admin/personnel/terms`,
        payload,
        authConfig(),
    );
    return res.data;
}

export async function activatePersonnelTerm(termId) {
    const res = await axios.put(
        `${API}/admin/personnel/terms/${termId}/activate`,
        {},
        authConfig(),
    );
    return res.data;
}

export async function archivePersonnelTerm(termId, reason = "") {
    const res = await axios.put(
        `${API}/admin/personnel/terms/${termId}/archive`,
        { reason },
        authConfig(),
    );
    return res.data;
}

export async function restorePersonnelTerm(termId) {
    const res = await axios.put(
        `${API}/admin/personnel/terms/${termId}/restore`,
        {},
        authConfig(),
    );
    return res.data;
}
