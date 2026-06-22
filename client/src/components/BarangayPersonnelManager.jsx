import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    CalendarPlus,
    CheckCircle2,
    Pencil,
    Plus,
    Save,
    ShieldCheck,
    UserRound,
    UsersRound,
    X,
} from "lucide-react";
import * as personnelService from "../services/personnelService";

const EMPTY_FORM = {
    assignmentId: null,
    fullName: "",
    honorific: "",
    contactNumber: "",
    email: "",
    photoUrl: "",
    signatureData: "",
    notes: "",
    positionId: "",
    termId: "",
    purokId: "",
    committee: "",
    titleOverride: "",
    startsOn: "",
    endsOn: "",
    isActive: true,
};

const groupLabels = {
    elected: "Elected Officials",
    appointed: "Appointed Officials",
    staff: "Barangay Personnel",
    purok: "Purok Leaders",
};

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result || "");
        reader.onerror = () => reject(new Error("Unable to read image"));
        reader.readAsDataURL(file);
    });
}

function readPhotoAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Unable to read photo"));
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error("Invalid photo file"));
            image.onload = () => {
                const maxSize = 512;
                const scale = Math.min(
                    1,
                    maxSize / Math.max(image.width, image.height),
                );
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));
                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.82));
            };
            image.src = String(reader.result || "");
        };
        reader.readAsDataURL(file);
    });
}

function Field({ label, children, wide = false, help = "" }) {
    return (
        <label style={{ display: "block", gridColumn: wide ? "1 / -1" : "" }}>
            <span
                style={{
                    display: "block",
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "#4a4a6a",
                    marginBottom: 5,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                }}
            >
                {label}
                {help && (
                    <span
                        title={help}
                        aria-label={help}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 14,
                            height: 14,
                            marginLeft: 6,
                            borderRadius: "50%",
                            background: "#fff3d6",
                            border: "1px solid #d6a43b",
                            color: "#9a6810",
                            fontSize: 9,
                            fontWeight: 800,
                            cursor: "help",
                            verticalAlign: "middle",
                        }}
                    >
                        !
                    </span>
                )}
            </span>
            {children}
        </label>
    );
}

const inputStyle = {
    width: "100%",
    padding: "9px 10px",
    border: "1px solid #d8d4cb",
    borderRadius: 5,
    background: "#fff",
    color: "#1a1a2e",
    fontFamily: "inherit",
    fontSize: 12,
    boxSizing: "border-box",
};

export default function BarangayPersonnelManager({ onRosterChange }) {
    const assignmentFormRef = useRef(null);
    const [data, setData] = useState({
        terms: [],
        positions: [],
        puroks: [],
        assignments: [],
        signatories: { captain: null, kagawads: [] },
        selectedTermId: null,
        activeTermId: null,
    });
    const [selectedTermId, setSelectedTermId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [showTermForm, setShowTermForm] = useState(false);
    const [termForm, setTermForm] = useState({
        termName: "",
        startsOn: "",
        endsOn: "",
        notes: "",
        copyCurrentRoster: false,
        isActive: true,
    });

    const load = useCallback(
        async (termId = null) => {
            setLoading(true);
            setError("");
            try {
                const next = await personnelService.getPersonnelRoster(termId);
                setData(next);
                setSelectedTermId(String(next.selectedTermId || ""));
                onRosterChange?.(next);
            } catch (err) {
                setError(
                    err?.response?.data?.message ||
                        err?.message ||
                        "Failed to load personnel roster.",
                );
            } finally {
                setLoading(false);
            }
        },
        [onRosterChange],
    );

    useEffect(() => {
        load();
    }, [load]);

    const selectedPosition = useMemo(
        () =>
            data.positions.find(
                (position) =>
                    String(position.positionId) === String(form.positionId),
            ),
        [data.positions, form.positionId],
    );

    const groupedAssignments = useMemo(() => {
        const groups = {};
        data.assignments.forEach((assignment) => {
            const key = assignment.positionGroup || "staff";
            if (!groups[key]) groups[key] = [];
            groups[key].push(assignment);
        });
        return groups;
    }, [data.assignments]);

    const openNewForm = () => {
        setForm({
            ...EMPTY_FORM,
            termId: selectedTermId || data.activeTermId || "",
        });
        setShowForm(true);
        setMessage("");
        setError("");
    };

    const openEditForm = (assignment) => {
        setForm({
            assignmentId: assignment.assignmentId,
            fullName: assignment.fullName || "",
            honorific: assignment.honorific || "",
            contactNumber: assignment.contactNumber || "",
            email: assignment.email || "",
            photoUrl: assignment.photoUrl || "",
            signatureData: assignment.signatureData || "",
            notes: assignment.personnelNotes || "",
            positionId: assignment.positionId || "",
            termId: assignment.termId || selectedTermId,
            purokId: assignment.purokId || "",
            committee: assignment.committee || "",
            titleOverride: assignment.titleOverride || "",
            startsOn: assignment.startsOn
                ? String(assignment.startsOn).slice(0, 10)
                : "",
            endsOn: assignment.endsOn
                ? String(assignment.endsOn).slice(0, 10)
                : "",
            isActive: assignment.isActive !== false,
        });
        setShowForm(true);
        setMessage("");
        setError("");

        // Wait for React to render the form before bringing its heading into
        // view. Two frames also covers the case where the form was previously
        // closed and has just been mounted.
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                assignmentFormRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            });
        });
    };

    const saveAssignment = async () => {
        if (!form.fullName.trim() || !form.positionId || !form.termId) {
            setError("Full name, position, and administration term are required.");
            return;
        }
        if (selectedPosition?.requiresPurok && !form.purokId) {
            setError("Select the purok for this Purok Leader.");
            return;
        }

        setSaving(true);
        setError("");
        try {
            if (form.assignmentId) {
                await personnelService.updatePersonnelAssignment(
                    form.assignmentId,
                    form,
                );
                setMessage("Personnel assignment updated.");
            } else {
                await personnelService.createPersonnelAssignment(form);
                setMessage("Personnel assignment added.");
            }
            setShowForm(false);
            await load(selectedTermId);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to save personnel assignment.",
            );
        } finally {
            setSaving(false);
        }
    };

    const saveTerm = async () => {
        if (!termForm.termName.trim()) {
            setError("Administration term name is required.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const result = await personnelService.createPersonnelTerm(termForm);
            setShowTermForm(false);
            setTermForm({
                termName: "",
                startsOn: "",
                endsOn: "",
                notes: "",
                copyCurrentRoster: false,
                isActive: true,
            });
            setMessage("New administration term created.");
            await load(result.termId);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to create administration term.",
            );
        } finally {
            setSaving(false);
        }
    };

    const activateSelectedTerm = async () => {
        if (!selectedTermId || String(data.activeTermId) === selectedTermId)
            return;
        setSaving(true);
        setError("");
        try {
            await personnelService.activatePersonnelTerm(selectedTermId);
            setMessage("Administration term activated.");
            await load(selectedTermId);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Failed to activate administration term.",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="st-panel">
                <div className="st-panel-header">
                    <div>
                        <div className="st-panel-title">
                            Administration &amp; Personnel
                        </div>
                        <div className="st-panel-desc">
                            Maintain elected officials, appointed officials,
                            staff, Purok Leaders, and signatures by term.
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                            type="button"
                            className="st-btn-cancel"
                            onClick={() => setShowTermForm((open) => !open)}
                        >
                            <CalendarPlus size={13} /> New Term
                        </button>
                        <button
                            type="button"
                            className="st-btn-save"
                            onClick={openNewForm}
                        >
                            <Plus size={13} /> Add Personnel
                        </button>
                    </div>
                </div>
                <div className="st-panel-body">
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "minmax(220px, 1fr) auto auto",
                            gap: 10,
                            alignItems: "end",
                        }}
                    >
                        <Field label="Viewing Administration Term">
                            <select
                                value={selectedTermId}
                                style={inputStyle}
                                onChange={async (event) => {
                                    const value = event.target.value;
                                    setSelectedTermId(value);
                                    await load(value);
                                }}
                            >
                                {data.terms.map((term) => (
                                    <option
                                        key={term.termId}
                                        value={term.termId}
                                    >
                                        {term.termName}
                                        {term.isActive ? " — Active" : ""}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <button
                            type="button"
                            className="st-btn-save"
                            disabled={
                                saving ||
                                !selectedTermId ||
                                String(data.activeTermId) === selectedTermId
                            }
                            onClick={activateSelectedTerm}
                        >
                            <ShieldCheck size={13} />
                            {String(data.activeTermId) === selectedTermId
                                ? "Active Term"
                                : "Make Active"}
                        </button>
                        <div
                            style={{
                                border: "1px solid #d6e8dc",
                                background: "#eef8f1",
                                color: "#1a6a42",
                                borderRadius: 5,
                                padding: "9px 12px",
                                fontSize: 11,
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {data.signatories?.kagawads?.length || 0} active
                            Kagawads
                        </div>
                    </div>
                </div>
            </div>

            {showTermForm && (
                <div className="st-panel">
                    <div className="st-panel-header">
                        <div>
                            <div className="st-panel-title">
                                Create Administration Term
                            </div>
                            <div className="st-panel-desc">
                                Use this after an election. Historical terms
                                remain available for reference.
                            </div>
                        </div>
                        <button
                            type="button"
                            className="st-btn-cancel"
                            onClick={() => setShowTermForm(false)}
                        >
                            <X size={13} />
                        </button>
                    </div>
                    <div className="st-panel-body">
                        <div className="st-form-grid-2">
                            <Field label="Term Name" wide>
                                <input
                                    style={inputStyle}
                                    value={termForm.termName}
                                    placeholder="e.g. 2026–2030 Administration"
                                    onChange={(event) =>
                                        setTermForm((current) => ({
                                            ...current,
                                            termName: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Starts On">
                                <input
                                    type="date"
                                    style={inputStyle}
                                    value={termForm.startsOn}
                                    onChange={(event) =>
                                        setTermForm((current) => ({
                                            ...current,
                                            startsOn: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Ends On">
                                <input
                                    type="date"
                                    style={inputStyle}
                                    value={termForm.endsOn}
                                    onChange={(event) =>
                                        setTermForm((current) => ({
                                            ...current,
                                            endsOn: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field
                                label="Term Notes (Optional)"
                                help="Internal remarks about this administration term."
                                wide
                            >
                                <textarea
                                    style={{ ...inputStyle, minHeight: 72 }}
                                    value={termForm.notes}
                                    onChange={(event) =>
                                        setTermForm((current) => ({
                                            ...current,
                                            notes: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 18,
                                marginTop: 12,
                                flexWrap: "wrap",
                            }}
                        >
                            <label style={{ fontSize: 12, color: "#4a4a6a" }}>
                                <input
                                    type="checkbox"
                                    checked={termForm.copyCurrentRoster}
                                    onChange={(event) =>
                                        setTermForm((current) => ({
                                            ...current,
                                            copyCurrentRoster:
                                                event.target.checked,
                                        }))
                                    }
                                />{" "}
                                Copy current roster for editing
                            </label>
                            <label style={{ fontSize: 12, color: "#4a4a6a" }}>
                                <input
                                    type="checkbox"
                                    checked={termForm.isActive}
                                    onChange={(event) =>
                                        setTermForm((current) => ({
                                            ...current,
                                            isActive: event.target.checked,
                                        }))
                                    }
                                />{" "}
                                Activate immediately
                            </label>
                        </div>
                    </div>
                    <div className="st-save-bar">
                        <p>
                            Copying the roster is useful when only some
                            positions change after an election.
                        </p>
                        <button
                            className="st-btn-save"
                            disabled={saving}
                            onClick={saveTerm}
                        >
                            <Save size={13} /> Create Term
                        </button>
                    </div>
                </div>
            )}

            {showForm && (
                <div
                    ref={assignmentFormRef}
                    className="st-panel"
                    style={{ scrollMarginTop: 76 }}
                >
                    <div className="st-panel-header">
                        <div>
                            <div className="st-panel-title">
                                {form.assignmentId
                                    ? "Edit Personnel Assignment"
                                    : "Add Personnel Assignment"}
                            </div>
                            <div className="st-panel-desc">
                                A person can receive a different position in a
                                future administration without losing history.
                            </div>
                        </div>
                        <button
                            className="st-btn-cancel"
                            onClick={() => setShowForm(false)}
                        >
                            <X size={13} />
                        </button>
                    </div>
                    <div className="st-panel-body">
                        <div className="st-form-grid-2">
                            <Field label="Full Name" wide>
                                <input
                                    style={inputStyle}
                                    value={form.fullName}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            fullName: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Honorific">
                                <input
                                    style={inputStyle}
                                    value={form.honorific}
                                    placeholder="Hon., Ms., Mr."
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            honorific: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Position">
                                <select
                                    style={inputStyle}
                                    value={form.positionId}
                                    onChange={(event) => {
                                        const position = data.positions.find(
                                            (item) =>
                                                String(item.positionId) ===
                                                event.target.value,
                                        );
                                        setForm((current) => ({
                                            ...current,
                                            positionId: event.target.value,
                                            honorific:
                                                current.honorific ||
                                                position?.defaultHonorific ||
                                                "",
                                            purokId: position?.requiresPurok
                                                ? current.purokId
                                                : "",
                                        }));
                                    }}
                                >
                                    <option value="">Select position</option>
                                    {data.positions.map((position) => (
                                        <option
                                            key={position.positionId}
                                            value={position.positionId}
                                        >
                                            {position.positionName}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            {selectedPosition?.requiresPurok && (
                                <Field label="Purok">
                                    <select
                                        style={inputStyle}
                                        value={form.purokId}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                purokId: event.target.value,
                                            }))
                                        }
                                    >
                                        <option value="">Select purok</option>
                                        {data.puroks.map((purok) => (
                                            <option
                                                key={purok.purokId}
                                                value={purok.purokId}
                                            >
                                                {purok.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            )}
                            <Field label="Committee / Portfolio">
                                <input
                                    style={inputStyle}
                                    value={form.committee}
                                    placeholder="e.g. Health & Nutrition"
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            committee: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Contact Number">
                                <input
                                    style={inputStyle}
                                    value={form.contactNumber}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            contactNumber: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Email">
                                <input
                                    type="email"
                                    style={inputStyle}
                                    value={form.email}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            email: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Certificate Title Override">
                                <input
                                    style={inputStyle}
                                    value={form.titleOverride}
                                    placeholder="Defaults to the position name"
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            titleOverride: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Personnel Photo (Optional)">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    style={inputStyle}
                                    onChange={async (event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        if (file.size > 5 * 1024 * 1024) {
                                            setError(
                                                "Personnel photo must be 5 MB or smaller.",
                                            );
                                            return;
                                        }
                                        try {
                                            const photoUrl =
                                                await readPhotoAsDataUrl(file);
                                            setForm((current) => ({
                                                ...current,
                                                photoUrl,
                                            }));
                                            setError("");
                                        } catch (photoError) {
                                            setError(
                                                photoError?.message ||
                                                    "Unable to process photo.",
                                            );
                                        }
                                    }}
                                />
                            </Field>
                            <Field label="E-signature Image (Optional)">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    style={inputStyle}
                                    onChange={async (event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        if (file.size > 2 * 1024 * 1024) {
                                            setError(
                                                "Signature image must be 2 MB or smaller.",
                                            );
                                            return;
                                        }
                                        const signatureData =
                                            await readFileAsDataUrl(file);
                                        setForm((current) => ({
                                            ...current,
                                            signatureData,
                                        }));
                                    }}
                                />
                            </Field>
                            <Field
                                label="Administrative Notes (Optional)"
                                help="Private internal remarks about this personnel assignment. These notes are not printed on certificates."
                                wide
                            >
                                <textarea
                                    style={{ ...inputStyle, minHeight: 65 }}
                                    value={form.notes}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            notes: event.target.value,
                                        }))
                                    }
                                />
                                <div
                                    style={{
                                        marginTop: 5,
                                        color: "#777086",
                                        fontSize: 10.5,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    <strong>!</strong> For private internal
                                    remarks only. This is not printed on
                                    certificates.
                                </div>
                            </Field>
                        </div>
                        {form.photoUrl && (
                            <div
                                style={{
                                    marginTop: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <img
                                    src={form.photoUrl}
                                    alt="Personnel preview"
                                    style={{
                                        width: 72,
                                        height: 72,
                                        objectFit: "cover",
                                        borderRadius: "50%",
                                        border: "1px solid #ddd",
                                        background: "#fff",
                                    }}
                                />
                                <button
                                    type="button"
                                    className="st-btn-cancel"
                                    onClick={() =>
                                        setForm((current) => ({
                                            ...current,
                                            photoUrl: "",
                                        }))
                                    }
                                >
                                    Remove Photo
                                </button>
                            </div>
                        )}
                        {form.signatureData && (
                            <div
                                style={{
                                    marginTop: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <img
                                    src={form.signatureData}
                                    alt="Signature preview"
                                    style={{
                                        width: 150,
                                        height: 55,
                                        objectFit: "contain",
                                        border: "1px solid #ddd",
                                        background: "#fff",
                                    }}
                                />
                                <button
                                    className="st-btn-cancel"
                                    onClick={() =>
                                        setForm((current) => ({
                                            ...current,
                                            signatureData: "",
                                        }))
                                    }
                                >
                                    Clear Signature
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="st-save-bar">
                        <div>
                            <label
                                style={{
                                    fontSize: 12,
                                    color: "#4a4a6a",
                                    fontWeight: 600,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            isActive: event.target.checked,
                                        }))
                                    }
                                />{" "}
                                Include in Current Personnel Roster
                            </label>
                            <div
                                style={{
                                    marginTop: 4,
                                    marginLeft: 20,
                                    color: "#777086",
                                    fontSize: 10.5,
                                    lineHeight: 1.35,
                                }}
                            >
                                <strong>!</strong> Uncheck this when the person
                                no longer holds this assignment. Their history
                                will still be preserved.
                            </div>
                        </div>
                        <button
                            className="st-btn-save"
                            disabled={saving}
                            onClick={saveAssignment}
                        >
                            <Save size={13} />{" "}
                            {saving ? "Saving..." : "Save Personnel"}
                        </button>
                    </div>
                </div>
            )}

            {(error || message) && (
                <div
                    style={{
                        padding: "10px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        background: error ? "#fdecea" : "#e8f5ee",
                        color: error ? "#a52b2b" : "#1a6a42",
                        border: `1px solid ${error ? "#efc3c3" : "#b9dec8"}`,
                    }}
                >
                    {error || message}
                </div>
            )}

            {loading ? (
                <div className="st-panel">
                    <div className="st-panel-body">Loading personnel roster…</div>
                </div>
            ) : (
                ["elected", "appointed", "staff", "purok"].map((group) => {
                    const assignments = groupedAssignments[group] || [];
                    return (
                        <div className="st-panel" key={group}>
                            <div className="st-panel-header">
                                <div>
                                    <div className="st-panel-title">
                                        {groupLabels[group]}
                                    </div>
                                    <div className="st-panel-desc">
                                        {assignments.length} assignment
                                        {assignments.length === 1 ? "" : "s"} in
                                        this term
                                    </div>
                                </div>
                                {group === "elected" ? (
                                    <UsersRound size={18} color="#1a4a8a" />
                                ) : (
                                    <UserRound size={18} color="#1a4a8a" />
                                )}
                            </div>
                            <div className="st-panel-body">
                                {assignments.length === 0 ? (
                                    <div
                                        style={{
                                            color: "#9090aa",
                                            fontSize: 12,
                                        }}
                                    >
                                        No assignments in this group.
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "repeat(auto-fit, minmax(250px, 1fr))",
                                            gap: 10,
                                        }}
                                    >
                                        {assignments.map((assignment) => (
                                            <div
                                                key={assignment.assignmentId}
                                                style={{
                                                    border: "1px solid #e4dfd4",
                                                    borderRadius: 7,
                                                    padding: 12,
                                                    background:
                                                        assignment.isActive
                                                            ? "#fff"
                                                            : "#f4f4f4",
                                                    display: "flex",
                                                    gap: 10,
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: "50%",
                                                        background: "#e8eef8",
                                                        color: "#1a4a8a",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    {assignment.photoUrl ? (
                                                        <img
                                                            src={
                                                                assignment.photoUrl
                                                            }
                                                            alt=""
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                    ) : (
                                                        assignment.fullName
                                                            .slice(0, 1)
                                                            .toUpperCase()
                                                    )}
                                                </div>
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 12.5,
                                                            fontWeight: 700,
                                                            color: "#1a1a2e",
                                                        }}
                                                    >
                                                        {assignment.displayName}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#1a4a8a",
                                                            fontWeight: 700,
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        {assignment.positionName}
                                                        {assignment.purokName
                                                            ? ` — ${assignment.purokName}`
                                                            : ""}
                                                    </div>
                                                    {assignment.committee && (
                                                        <div
                                                            style={{
                                                                fontSize: 10.5,
                                                                color: "#6b6678",
                                                                marginTop: 3,
                                                            }}
                                                        >
                                                            {
                                                                assignment.committee
                                                            }
                                                        </div>
                                                    )}
                                                    {assignment.signatoryEligible && (
                                                        <div
                                                            style={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 4,
                                                                marginTop: 6,
                                                                padding:
                                                                    "2px 6px",
                                                                borderRadius: 3,
                                                                background:
                                                                    "#e8f5ee",
                                                                color: "#1a6a42",
                                                                fontSize: 9.5,
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            <CheckCircle2
                                                                size={10}
                                                            />
                                                            Certificate
                                                            signatory
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    title="Edit personnel"
                                                    onClick={() =>
                                                        openEditForm(assignment)
                                                    }
                                                    style={{
                                                        border: "none",
                                                        background: "#f1f4f8",
                                                        color: "#1a4a8a",
                                                        borderRadius: 4,
                                                        width: 28,
                                                        height: 28,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        cursor: "pointer",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Pencil size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
