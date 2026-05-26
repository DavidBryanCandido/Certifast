import { useEffect, useMemo, useState } from "react";
import adminRequestService from "../services/adminRequestService";
import { getTemplateAdminFields } from "../utils/certificateTemplateEngine";

function todayInputValue() {
    return new Date().toISOString().slice(0, 10);
}

function parseStoredBoolean(value, fallback = false) {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    return ["true", "1", "yes", "y", "on", "checked"].includes(
        String(value).trim().toLowerCase(),
    );
}

function initialValueFor(field, extraFields = {}) {
    const stored = extraFields[field.key];
    if (field.type === "checkbox") {
        return parseStoredBoolean(stored, Boolean(field.defaultValue));
    }
    if (stored !== undefined && stored !== null) return String(stored);
    if (field.key === "dateIssued") return todayInputValue();
    return field.defaultValue ?? "";
}

export default function AdminRequestDecisionFields({
    request,
    onChange,
    onLogout,
    sectionClassName = "",
    titleClassName = "",
}) {
    const fields = useMemo(
        () =>
            request
                ? getTemplateAdminFields(request.templateKey, request.certType)
                : [],
        [request?.templateKey, request?.certType],
    );
    const [values, setValues] = useState({});
    const [savingKey, setSavingKey] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!request || fields.length === 0) {
            setValues({});
            onChange?.({});
            return;
        }

        const next = Object.fromEntries(
            fields.map((field) => [
                field.key,
                initialValueFor(field, request.extraFields || {}),
            ]),
        );
        setValues(next);
        onChange?.(next);
    }, [request?.rawId, fields, onChange]);

    if (!request || fields.length === 0) return null;

    const setLocalField = (field, value) => {
        const next = { ...values, [field.key]: value };
        setValues(next);
        onChange?.(next);
    };

    const updateField = async (field, value) => {
        const previous = values;
        const next = { ...values, [field.key]: value };
        setValues(next);
        onChange?.(next);
        setSavingKey(field.key);
        setError("");

        try {
            await adminRequestService.updateExtraFields(request.rawId, {
                [field.key]: value,
            });
        } catch (err) {
            if (err?.response?.status === 404) {
                setError(
                    "Backend route is not loaded yet. Restart the server to persist this field; it will still be used for printing while this drawer stays open.",
                );
                return;
            }
            setValues(previous);
            onChange?.(previous);
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                onLogout?.();
                return;
            }
            setError(
                err?.response?.data?.message ||
                    "Could not save staff review field.",
            );
        } finally {
            setSavingKey("");
        }
    };

    return (
        <div className={sectionClassName}>
            <div className={titleClassName}>Staff Review Fields</div>
            <div
                style={{
                    fontSize: 11.5,
                    color: "#77708a",
                    lineHeight: 1.5,
                    marginBottom: 12,
                }}
            >
                Set these after checking the submitted supporting documents.
                They affect the printed certificate.
            </div>
            <div style={{ display: "grid", gap: 10 }}>
                {fields.map((field) => {
                    const saving = savingKey === field.key;
                    if (field.type === "checkbox") {
                        return (
                            <label
                                key={field.key}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 9,
                                    padding: "10px 11px",
                                    border: "1px solid #e4dfd4",
                                    borderRadius: 5,
                                    background: "#fffdf8",
                                    fontSize: 12.5,
                                    color: "#1a1a2e",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={Boolean(values[field.key])}
                                    disabled={savingKey && !saving}
                                    onChange={(event) =>
                                        updateField(field, event.target.checked)
                                    }
                                />
                                <span style={{ flex: 1 }}>{field.label}</span>
                                {saving && (
                                    <span style={{ fontSize: 10.5, color: "#9090aa" }}>
                                        Saving...
                                    </span>
                                )}
                            </label>
                        );
                    }

                    return (
                        <label
                            key={field.key}
                            style={{ display: "grid", gap: 5 }}
                        >
                            <span
                                style={{
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    letterSpacing: 0.8,
                                    textTransform: "uppercase",
                                    color: "#9a94ad",
                                }}
                            >
                                {field.label}
                            </span>
                            <input
                                type={field.type === "date" ? "date" : "text"}
                                value={values[field.key] ?? ""}
                                disabled={savingKey && !saving}
                                onChange={(event) =>
                                    setLocalField(field, event.target.value)
                                }
                                onBlur={(event) =>
                                    updateField(field, event.target.value)
                                }
                                style={{
                                    minHeight: 38,
                                    border: "1px solid #e4dfd4",
                                    borderRadius: 5,
                                    padding: "8px 10px",
                                    background: "#fffdf8",
                                    fontFamily: "inherit",
                                    color: "#1a1a2e",
                                }}
                            />
                        </label>
                    );
                })}
            </div>
            {error && (
                <div
                    style={{
                        marginTop: 10,
                        color: "#b02020",
                        fontSize: 12,
                        lineHeight: 1.5,
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    );
}
