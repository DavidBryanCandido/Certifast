import { useEffect, useMemo } from "react";
import { CheckCircle2, UserRoundCheck } from "lucide-react";
import { getCertificateSignatoryRequirements } from "../utils/certificateTemplateEngine";
import { validateSignatorySelections } from "../utils/signatorySelection";

function normalizePersonnelName(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/\bhon(?:orable)?\.?\s*/g, "")
        .replace(/[^a-z0-9]/g, "");
}

export default function CertificateSignatorySelector({
    templateKey,
    certType,
    captain = null,
    kagawads = [],
    value = {},
    onChange,
    disabled = false,
    title = "Certificate Signatories",
}) {
    const requirements = useMemo(
        () => getCertificateSignatoryRequirements(templateKey, certType),
        [templateKey, certType],
    );

    useEffect(() => {
        if (!requirements.length || !kagawads.length || !onChange) return;

        const next = { ...(value || {}) };
        let changed = false;
        const validIds = new Set(
            kagawads.map((item) => String(item.assignmentId)),
        );
        requirements.forEach((requirement) => {
            const current = next[requirement.slot];
            if (current && !validIds.has(String(current))) {
                delete next[requirement.slot];
                changed = true;
            }
        });
        const used = new Set(Object.values(next).map(String));

        requirements.forEach((requirement) => {
            if (next[requirement.slot]) return;
            const defaultName = normalizePersonnelName(requirement.defaultName);
            const preferred = defaultName
                ? kagawads.find(
                      (item) =>
                          !used.has(String(item.assignmentId)) &&
                          normalizePersonnelName(item.name) === defaultName,
                  )
                : null;
            const available =
                preferred ||
                kagawads.find(
                    (item) => !used.has(String(item.assignmentId)),
                );
            if (!available) return;
            next[requirement.slot] = available.assignmentId;
            used.add(String(available.assignmentId));
            changed = true;
        });

        if (changed) onChange(next);
    }, [requirements, kagawads, value, onChange]);

    const validationError = validateSignatorySelections(
        requirements,
        value,
        kagawads,
    );

    return (
        <div
            style={{
                border: "1px solid #d8dfe9",
                borderRadius: 8,
                background: "#f8fbff",
                padding: 14,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "var(--color-primary, #0e2554)",
                    fontSize: 12.5,
                    fontWeight: 700,
                    marginBottom: 10,
                }}
            >
                <UserRoundCheck size={15} />
                {title}
            </div>

            {captain && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: "9px 10px",
                        background: "#e8f5ee",
                        border: "1px solid #b9dec8",
                        borderRadius: 6,
                        marginBottom: requirements.length ? 10 : 0,
                    }}
                >
                    <CheckCircle2
                        size={14}
                        color="#1a7a4a"
                        style={{ marginTop: 1, flexShrink: 0 }}
                    />
                    <div>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#1a5c38",
                            }}
                        >
                            Punong Barangay — automatic
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                color: "#294f3a",
                                marginTop: 2,
                            }}
                        >
                            {captain.name}
                        </div>
                    </div>
                </div>
            )}

            {requirements.map((requirement) => (
                <label
                    key={requirement.slot}
                    style={{
                        display: "block",
                        marginTop: 9,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#4a4a6a",
                    }}
                >
                    {requirement.label}
                    <select
                        value={value?.[requirement.slot] || ""}
                        disabled={disabled}
                        onChange={(event) =>
                            onChange?.({
                                ...(value || {}),
                                [requirement.slot]: event.target.value,
                            })
                        }
                        style={{
                            width: "100%",
                            marginTop: 5,
                            padding: "9px 10px",
                            border: "1px solid #cfd7e3",
                            borderRadius: 5,
                            background: disabled ? "#f1f1f1" : "#fff",
                            color: "#1a1a2e",
                            fontFamily: "inherit",
                            fontSize: 12,
                        }}
                    >
                        <option value="">Select an active Kagawad</option>
                        {kagawads.map((item) => (
                            <option
                                key={item.assignmentId}
                                value={item.assignmentId}
                            >
                                {item.name}
                                {item.committee ? ` — ${item.committee}` : ""}
                            </option>
                        ))}
                    </select>
                </label>
            ))}

            {!requirements.length && (
                <div style={{ fontSize: 11.5, color: "#617083" }}>
                    This certificate uses only the Punong Barangay, so no
                    Kagawad selection is needed.
                </div>
            )}

            {validationError && (
                <div
                    style={{
                        marginTop: 9,
                        color: "#a33a24",
                        fontSize: 11,
                        lineHeight: 1.45,
                    }}
                >
                    {validationError}
                </div>
            )}
        </div>
    );
}
