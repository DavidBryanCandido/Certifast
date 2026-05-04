import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function CompleteRegistration() {
    const [status, setStatus] = useState("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        async function complete() {
            try {
                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    setErrorMsg("Invalid or expired verification link.");
                    setStatus("error");
                    return;
                }

                const user = session.user;
                const meta = user.user_metadata || {};

                await axios.post(
                    `${API}/auth/resident/complete-registration`,
                    {
                        supabase_uid: user.id,
                        email: user.email,
                        first_name: meta.first_name,
                        middle_name: meta.middle_name,
                        last_name: meta.last_name,
                        contact_number: meta.contact_number,
                        house_no: meta.house_no,
                        purok_id: meta.purok_id,
                        street_id: meta.street_id,
                        street_other: meta.street_other,
                        date_of_birth: meta.date_of_birth,
                        civil_status: meta.civil_status,
                        nationality: meta.nationality,
                        id_type: meta.id_type,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    },
                );

                setStatus("success");
                await supabase.auth.signOut();
            } catch (err) {
                setErrorMsg(
                    err?.response?.data?.message || "Something went wrong.",
                );
                setStatus("error");
            }
        }

        complete();
    }, []);

    if (status === "loading") {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0e2554",
                }}
            >
                <div style={{ textAlign: "center", color: "#fff" }}>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            border: "3px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#c9a227",
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
                    background: "#0e2554",
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
                            background: "#0e2554",
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
                background: "#0e2554",
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
                        color: "#0e2554",
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
                        background: "#0e2554",
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
