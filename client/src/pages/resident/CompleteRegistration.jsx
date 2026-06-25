import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import axios from "axios";
import { getApiBase } from "../../apiBase";
import {
    deletePendingResidentIdUpload,
    deletePendingResidencyProofUpload,
    getPendingResidentIdUpload,
    getPendingResidencyProofUpload,
} from "../../residentIdUploadStore";

const API = getApiBase();

/** One shared attempt per full page load (dedupes React StrictMode double-mount + duplicate auth events). */
let completeRegistrationInFlight = null;

export default function CompleteRegistration() {
    const [status, setStatus] = useState("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        let cancelled = false;
        let failTimer = null;

        const clearFailTimer = () => {
            if (failTimer != null) {
                window.clearTimeout(failTimer);
                failTimer = null;
            }
        };

        async function postCompleteRegistration(session) {
            const {
                data: { user: freshUser },
                error: userErr,
            } = await supabase.auth.getUser();
            const user = !userErr && freshUser ? freshUser : session.user;
            const meta = user.user_metadata || {};
            const str = (v) =>
                v != null && String(v).trim() !== ""
                    ? String(v).trim()
                    : null;
            const bool = (v) => v === true || String(v).toLowerCase() === "true";
            const isRenter = bool(meta.is_renter);

            if (!str(meta.first_name) || !str(meta.last_name)) {
                throw new Error(
                    "Profile data was not found on your account. Please register again or contact the barangay office.",
                );
            }

            let idImagePath = null;
            const pendingIdUpload = await getPendingResidentIdUpload(user.id);
            if (pendingIdUpload?.file) {
                const ext =
                    pendingIdUpload.file.type === "image/png"
                        ? "png"
                        : pendingIdUpload.file.type === "image/webp"
                          ? "webp"
                          : "jpg";
                const path = `resident-ids/${user.id}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from("certifast-uploads")
                    .upload(path, pendingIdUpload.file, {
                        contentType: pendingIdUpload.file.type,
                        upsert: false,
                    });

                if (!uploadError) {
                    idImagePath = path;
                    await deletePendingResidentIdUpload(user.id);
                } else if (/already exists|duplicate/i.test(uploadError.message || "")) {
                    idImagePath = path;
                    await deletePendingResidentIdUpload(user.id);
                } else {
                    throw new Error(
                        "Your ID photo could not be uploaded. Please contact the barangay office so they can check the Supabase Storage policy for resident ID uploads.",
                    );
                }
            }

            let residencyProofPath = null;
            let residencyProofFileName = null;
            let residencyProofMimeType = null;
            let residencyProofFileSize = null;
            const pendingResidencyProofUpload =
                await getPendingResidencyProofUpload(user.id);
            if (isRenter && pendingResidencyProofUpload?.file) {
                const proofFile = pendingResidencyProofUpload.file;
                const ext =
                    proofFile.type === "application/pdf"
                        ? "pdf"
                        : proofFile.type === "image/png"
                          ? "png"
                          : proofFile.type === "image/webp"
                            ? "webp"
                            : "jpg";
                const path = `resident-proofs/${user.id}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from("certifast-uploads")
                    .upload(path, proofFile, {
                        contentType: proofFile.type,
                        upsert: false,
                    });

                if (!uploadError) {
                    residencyProofPath = path;
                    residencyProofFileName =
                        pendingResidencyProofUpload.name || proofFile.name || null;
                    residencyProofMimeType =
                        pendingResidencyProofUpload.type || proofFile.type || null;
                    residencyProofFileSize = proofFile.size || null;
                    await deletePendingResidencyProofUpload(user.id);
                } else if (/already exists|duplicate/i.test(uploadError.message || "")) {
                    residencyProofPath = path;
                    residencyProofFileName =
                        pendingResidencyProofUpload.name || proofFile.name || null;
                    residencyProofMimeType =
                        pendingResidencyProofUpload.type || proofFile.type || null;
                    residencyProofFileSize = proofFile.size || null;
                    await deletePendingResidencyProofUpload(user.id);
                } else {
                    throw new Error(
                        "Your proof of residence could not be uploaded. Please contact the barangay office so they can check the Supabase Storage policy for resident proof uploads.",
                    );
                }
            }

            await axios.post(
                `${API}/auth/resident/complete-registration`,
                {
                    supabase_uid: user.id,
                    email: user.email,
                    first_name: str(meta.first_name),
                    middle_name: str(meta.middle_name),
                    last_name: str(meta.last_name),
                    contact_number: str(meta.contact_number),
                    house_no: str(meta.house_no),
                    purok_id: meta.purok_id ?? null,
                    street_id: meta.street_id ?? null,
                    date_of_birth: meta.date_of_birth || null,
                    civil_status: str(meta.civil_status),
                    nationality: str(meta.nationality) || "Filipino",
                    id_type: str(meta.id_type),
                    id_image_path: idImagePath,
                    is_renter: isRenter,
                    residency_proof_path: residencyProofPath,
                    residency_proof_file_name: residencyProofFileName,
                    residency_proof_mime_type: residencyProofMimeType,
                    residency_proof_file_size: residencyProofFileSize,
                    agreed_to_terms: bool(meta.agreed_to_terms),
                    terms_agreed_at: str(meta.terms_agreed_at),
                },
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                },
            );
        }

        function runComplete(session) {
            if (!session?.user) return Promise.resolve();
            clearFailTimer();

            if (!completeRegistrationInFlight) {
                completeRegistrationInFlight = (async () => {
                    try {
                        await postCompleteRegistration(session);
                    } catch (err) {
                        // Duplicate POST (e.g. React StrictMode) — row already exists.
                        if (err?.response?.status === 409) {
                            if (!cancelled) {
                                setStatus("success");
                                await supabase.auth.signOut();
                            }
                            return;
                        }
                        if (!cancelled) {
                            const msg =
                                err?.response?.data?.message ||
                                err?.message ||
                                "Something went wrong.";
                            setErrorMsg(msg);
                            setStatus("error");
                        }
                        throw err;
                    }

                    if (!cancelled) {
                        setStatus("success");
                        await supabase.auth.signOut();
                    }
                })().finally(() => {
                    completeRegistrationInFlight = null;
                });
            }

            return completeRegistrationInFlight;
        }

        async function trySessionFromStorage() {
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();
            if (!cancelled && !sessionError && session?.user) {
                await runComplete(session);
            }
        }

        // PKCE / magic-link: session is often not ready on first tick; INITIAL_SESSION arrives after URL exchange.
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (cancelled) return;
            if (session?.user) clearFailTimer();
            if (
                session?.user &&
                (event === "INITIAL_SESSION" || event === "SIGNED_IN")
            ) {
                void runComplete(session);
            }
        });

        void trySessionFromStorage();

        // If no session appears after the redirect exchange, the link is bad or expired.
        failTimer = window.setTimeout(async () => {
            if (cancelled) return;
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session?.user || completeRegistrationInFlight) return;
            setErrorMsg("Invalid or expired verification link.");
            setStatus("error");
        }, 20000);

        return () => {
            cancelled = true;
            clearFailTimer();
            subscription.unsubscribe();
        };
    }, []);

    if (status === "loading") {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--color-primary)",
                }}
            >
                <div style={{ textAlign: "center", color: "#fff" }}>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            border: "3px solid rgba(255,255,255,0.3)",
                            borderTopColor: "var(--color-accent)",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                            margin: "0 auto 16px",
                        }}
                    />
                    <p
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 18,
                        }}
                    >
                        Completing your registration...
                    </p>
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--color-primary)",
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 8,
                        padding: "32px",
                        maxWidth: 400,
                        textAlign: "center",
                    }}
                >
                    <p
                        style={{
                            color: "#b02020",
                            fontSize: 18,
                            fontWeight: 700,
                        }}
                    >
                        Registration Failed
                    </p>
                    <p style={{ color: "#4a4a6a" }}>{errorMsg}</p>
                    <button
                        onClick={() =>
                            window.location.replace("/resident/register")
                        }
                        style={{
                            marginTop: 16,
                            padding: "10px 24px",
                            background: "var(--color-primary)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--color-primary)",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 8,
                    padding: "40px",
                    maxWidth: 440,
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "#e8f5ee",
                        border: "2px solid #1a7a4a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                    }}
                >
                    ✓
                </div>
                <p
                    style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--color-primary)",
                    }}
                >
                    Email Verified!
                </p>
                <p style={{ fontSize: 13, color: "#4a4a6a", lineHeight: 1.7 }}>
                    Your email has been confirmed. Barangay staff will now
                    review your ID photo.
                    <strong> Please come back in 1-3 business days</strong> to
                    log in.
                </p>
                <button
                    onClick={() => window.location.replace("/resident/login")}
                    style={{
                        marginTop: 20,
                        padding: "12px 28px",
                        background: "var(--color-primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontFamily: "'Playfair Display',serif",
                        fontWeight: 700,
                    }}
                >
                    Go to Sign In
                </button>
            </div>
        </div>
    );
}
