import { getApiBase } from "../apiBase";

const API_URL = getApiBase();
let certificateTemplatesRequest = null;

export function getPublicCertificateTemplates() {
    if (certificateTemplatesRequest) return certificateTemplatesRequest;

    certificateTemplatesRequest = fetch(`${API_URL}/certificates/templates`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Unable to load certificate templates");
            }
            return response.json();
        })
        .finally(() => {
            certificateTemplatesRequest = null;
        });

    return certificateTemplatesRequest;
}
