import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    FileText,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
} from "lucide-react";

import {
    DEFAULT_PUBLIC_BRANDING,
    getPublicBrandingSettings,
} from "../../services/publicBrandingService";

const EFFECTIVE_DATE = "June 29, 2026";

const sections = [
    {
        id: "acceptance",
        title: "1. Effective Date and Acceptance",
        body: [
            "These Terms of Service and Privacy Notice govern the creation and use of a CertiFast resident account for Barangay East Tapinac. By creating an account, submitting information, requesting a certificate, or continuing to use CertiFast, you confirm that you have read, understood, and agreed to this document.",
            "If you do not agree with these terms, do not create a CertiFast account or use the resident portal. You may contact the barangay office for available in-person assistance.",
        ],
    },
    {
        id: "about-certifast",
        title: "2. About CertiFast",
        body: [
            "CertiFast is an online barangay service platform used by Barangay East Tapinac to support resident registration, identity and residency verification, certificate requests, request tracking, notifications, audit logs, and related barangay services.",
            "CertiFast does not replace the barangay office's authority to review, approve, deny, correct, release, or cancel any resident account, certificate request, or submitted document under applicable rules and barangay procedures.",
        ],
    },
    {
        id: "eligibility",
        title: "3. Eligibility",
        body: [
            "CertiFast resident accounts are intended for residents of Barangay East Tapinac who are at least 18 years old and who can provide accurate identifying and address information for barangay verification.",
            "A parent or legal guardian must use their own account when requesting barangay services for a minor or dependent, unless the barangay office authorizes another lawful process.",
        ],
    },
    {
        id: "account-responsibilities",
        title: "4. Account Responsibilities",
        body: [
            "You are responsible for providing complete, accurate, current, and truthful information. You must not register using another person's identity, email address, document, address, or account credentials without lawful authority.",
            "You are responsible for keeping your login credentials secure and for activity made through your account. Notify the barangay office promptly if you believe your account, email, password, or submitted documents have been accessed or used without permission.",
        ],
    },
    {
        id: "verification-documents",
        title: "5. Verification and Documents",
        body: [
            "During registration and certificate processing, the barangay may require a valid identification document, East Tapinac address details, proof of current residence when your ID address does not match, request-specific details, supporting files, or in-person validation.",
            "False, altered, misleading, incomplete, duplicated, or unverifiable information may result in registration denial, request denial, account suspension, certificate cancellation, manual office review, or referral for appropriate barangay action.",
        ],
    },
    {
        id: "acceptable-use",
        title: "6. Acceptable Use",
        body: [
            "You must use CertiFast only for lawful, legitimate, and authorized barangay service purposes. You must not use CertiFast to commit fraud, impersonate another person, submit false information, interfere with the system, bypass security controls, or access data that is not yours.",
            "Certificates or documents issued through CertiFast must not be altered, misrepresented, sold, transferred, reused for fraudulent purposes, or presented as valid after cancellation, expiration, or correction by the barangay office.",
        ],
    },
    {
        id: "certificate-requests",
        title: "7. Certificate Requests",
        body: [
            "Submitting a certificate request through CertiFast does not guarantee approval, immediate processing, fee waiver, availability, release, or acceptance by a third party. The barangay office may require review, correction, payment confirmation, supporting documents, or personal appearance before release.",
            "You are responsible for checking request details before submission and for following pickup instructions, office schedules, identification requirements, and any additional barangay guidance provided for the requested certificate.",
        ],
    },
    {
        id: "fees-availability",
        title: "8. Fees, Schedules, and Availability",
        body: [
            "Certificate fees, payment instructions, release schedules, office hours, and pickup requirements are set by Barangay East Tapinac and may change according to barangay policy, local rules, holidays, emergencies, system maintenance, or operational needs.",
            "CertiFast may be unavailable, delayed, limited, or interrupted because of maintenance, internet issues, service provider outages, security incidents, device limitations, or events outside the barangay's reasonable control.",
        ],
    },
    {
        id: "privacy-notice",
        title: "9. Privacy Notice",
        body: [
            "Barangay East Tapinac collects and processes personal information needed to provide CertiFast services. This may include your name, email address, contact number, date of birth, civil status, nationality, house number, purok, street, valid ID type and image, proof of residence, certificate request details, supporting documents, account status, notifications, timestamps, audit records, and related service information.",
            "Some submitted files may contain sensitive personal information. Submit only documents that are required, truthful, relevant, and readable for the barangay service being requested.",
        ],
    },
    {
        id: "processing-purposes",
        title: "10. Purposes of Processing",
        body: [
            "Your information may be used to verify identity and residency, review and activate resident accounts, process certificate requests, issue notifications, maintain barangay records, prevent fraud and duplicate accounts, protect system security, investigate service concerns, comply with legal duties, and support lawful barangay operations.",
            "The barangay may also use service records to improve workflow, monitor processing status, maintain audit trails, respond to resident concerns, and prepare reports that are appropriate for barangay administration.",
        ],
    },
    {
        id: "sharing-disclosure",
        title: "11. Sharing and Disclosure",
        body: [
            "Your information may be accessed by authorized barangay personnel who need it to perform official duties. It may also be processed by technology service providers that help operate CertiFast, subject to appropriate access controls and confidentiality expectations.",
            "Barangay East Tapinac may disclose information when required by law, lawful order, audit, public authority, security investigation, emergency response, or other legitimate barangay or government function.",
        ],
    },
    {
        id: "retention-security",
        title: "12. Retention and Security",
        body: [
            "Resident account records, certificate request records, submitted documents, consent records, and audit logs may be retained for as long as needed for service delivery, resident verification, barangay records management, legal compliance, audit, dispute resolution, security, and legitimate barangay operations.",
            "Barangay East Tapinac uses administrative, technical, and organizational safeguards intended to protect personal information. However, no online platform, email system, storage service, or internet transmission can be guaranteed to be completely secure.",
        ],
    },
    {
        id: "privacy-rights",
        title: "13. Resident Privacy Rights",
        body: [
            "Subject to the Data Privacy Act of 2012 and applicable rules, you may ask about the personal information processed about you, request access or correction, object to certain processing, request blocking or deletion when allowed by law, withdraw consent where applicable, or raise a data privacy concern with the barangay office.",
            "Some requests may require identity verification and may be limited when records must be kept for legal, audit, security, public service, or official barangay purposes.",
        ],
    },
    {
        id: "suspension-termination",
        title: "14. Account Suspension or Termination",
        body: [
            "The barangay may deny, suspend, restrict, deactivate, or require manual review of an account or request when needed for identity verification, residency validation, security, fraud prevention, legal compliance, data privacy, abuse prevention, or orderly barangay operations.",
            "If your account is denied, suspended, or restricted, you may contact the barangay office to ask about the status of your account and the available steps for correction or manual review.",
        ],
    },
    {
        id: "governing-law",
        title: "15. Governing Law and Barangay Authority",
        body: [
            "This document is intended to be interpreted under applicable laws of the Republic of the Philippines, including barangay, city, data privacy, records, and public service rules that apply to Barangay East Tapinac.",
            "Nothing in this document limits the barangay's lawful authority to verify residents, require supporting documents, follow official procedures, correct records, respond to legal requirements, or protect public service operations.",
        ],
    },
    {
        id: "changes",
        title: "16. Changes to This Document",
        body: [
            "Barangay East Tapinac may update this Terms of Service and Privacy Notice to reflect changes in CertiFast features, barangay procedures, legal requirements, service providers, or privacy practices.",
            "Updates will be posted on this page with a new effective date. Creating an account, submitting a request, or continuing to use CertiFast after an update means you accept the updated terms.",
        ],
    },
    {
        id: "contact",
        title: "17. Contact and Data Privacy Concerns",
        body: [
            "For questions about CertiFast, account status, certificate processing, corrections, document requirements, or data privacy concerns, contact Barangay East Tapinac using the official contact details below.",
            "The barangay office may require you to verify your identity before acting on account, record, document, or privacy-related requests.",
        ],
    },
];

function contactHref(type, value) {
    if (!value) return undefined;
    if (type === "email") return `mailto:${value}`;
    if (type === "phone") {
        const normalized = value.replace(/[^\d+]/g, "");
        return normalized ? `tel:${normalized}` : undefined;
    }
    return undefined;
}

export default function ResidentTermsOfService() {
    const [branding, setBranding] = useState(DEFAULT_PUBLIC_BRANDING);

    useEffect(() => {
        let mounted = true;

        getPublicBrandingSettings()
            .then((data) => {
                if (mounted) setBranding(data);
            })
            .catch(() => {});

        return () => {
            mounted = false;
        };
    }, []);

    const contactRows = useMemo(
        () => [
            {
                icon: MapPin,
                label: "Office Address",
                value: branding.address,
            },
            {
                icon: Phone,
                label: "Contact Number",
                value: branding.contact,
                href: contactHref("phone", branding.contact),
            },
            {
                icon: Mail,
                label: "Email Address",
                value: branding.email,
                href: contactHref("email", branding.email),
            },
        ],
        [branding],
    );

    return (
        <main className="tos-root">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@300;400;600;700&display=swap');

                .tos-root {
                    min-height: 100vh;
                    background: #f6f2e8;
                    color: #18233b;
                    font-family: "Source Serif 4", Georgia, serif;
                }

                .tos-root * {
                    box-sizing: border-box;
                }

                .tos-shell {
                    width: min(1160px, calc(100% - 40px));
                    margin: 0 auto;
                }

                .tos-topbar {
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    border-bottom: 1px solid rgba(var(--color-primary-rgb, 14, 37, 84), 0.12);
                    background: rgba(255, 253, 248, 0.95);
                    backdrop-filter: blur(14px);
                }

                .tos-topbar-inner {
                    min-height: 76px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 18px;
                }

                .tos-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 0;
                }

                .tos-seal {
                    width: 46px;
                    height: 46px;
                    display: grid;
                    place-items: center;
                    flex: 0 0 auto;
                    overflow: hidden;
                    border: 1px solid rgba(var(--color-accent-rgb, 201, 162, 39), 0.6);
                    border-radius: 50%;
                    background: #fff;
                }

                .tos-seal img {
                    width: 42px;
                    height: 42px;
                    object-fit: cover;
                    border-radius: 50%;
                }

                .tos-brand strong {
                    display: block;
                    color: var(--color-primary, #0e2554);
                    font-family: "Playfair Display", Georgia, serif;
                    font-size: 18px;
                    line-height: 1.1;
                }

                .tos-brand span {
                    display: block;
                    margin-top: 4px;
                    color: #756e61;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                .tos-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 0 0 auto;
                }

                .tos-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    min-height: 40px;
                    padding: 9px 13px;
                    border: 1px solid rgba(var(--color-primary-rgb, 14, 37, 84), 0.18);
                    border-radius: 5px;
                    background: #fffdf8;
                    color: var(--color-primary, #0e2554);
                    font: 700 12px/1 "Source Serif 4", Georgia, serif;
                    text-decoration: none;
                    cursor: pointer;
                }

                .tos-hero {
                    padding: 46px 0 24px;
                }

                .tos-kicker {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 14px;
                    color: var(--color-primary, #0e2554);
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }

                .tos-hero h1 {
                    max-width: 840px;
                    margin: 0;
                    color: var(--color-primary-dark, #091a3e);
                    font-family: "Playfair Display", Georgia, serif;
                    font-size: clamp(34px, 6vw, 62px);
                    line-height: 1.02;
                    letter-spacing: 0;
                }

                .tos-intro {
                    max-width: 850px;
                    margin: 18px 0 0;
                    color: #4b5468;
                    font-size: 17px;
                    line-height: 1.72;
                }

                .tos-meta-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 22px;
                }

                .tos-meta-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 9px 12px;
                    border: 1px solid rgba(var(--color-primary-rgb, 14, 37, 84), 0.14);
                    border-radius: 999px;
                    background: #fffdf8;
                    color: #454c60;
                    font-size: 13px;
                    font-weight: 700;
                }

                .tos-layout {
                    display: grid;
                    grid-template-columns: 270px minmax(0, 1fr);
                    gap: 28px;
                    align-items: start;
                    padding: 12px 0 56px;
                }

                .tos-toc {
                    position: sticky;
                    top: 96px;
                    border: 1px solid #e3daca;
                    border-radius: 8px;
                    background: #fffdf8;
                    padding: 18px;
                    box-shadow: 0 14px 34px rgba(14, 37, 84, 0.07);
                }

                .tos-toc h2 {
                    margin: 0 0 12px;
                    color: var(--color-primary, #0e2554);
                    font-family: "Playfair Display", Georgia, serif;
                    font-size: 18px;
                    line-height: 1.2;
                }

                .tos-toc ol {
                    display: grid;
                    gap: 7px;
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }

                .tos-toc a {
                    display: block;
                    color: #4d5568;
                    font-size: 13px;
                    line-height: 1.35;
                    text-decoration: none;
                }

                .tos-toc a:hover,
                .tos-toc a:focus-visible {
                    color: var(--color-primary, #0e2554);
                    text-decoration: underline;
                }

                .tos-document {
                    border: 1px solid #e3daca;
                    border-radius: 8px;
                    background: #fffdf8;
                    box-shadow: 0 18px 44px rgba(14, 37, 84, 0.08);
                    overflow: hidden;
                }

                .tos-notice {
                    display: flex;
                    gap: 13px;
                    padding: 20px 24px;
                    border-bottom: 1px solid #e7ddca;
                    background: #f8f1df;
                    color: #4f4635;
                    font-size: 14px;
                    line-height: 1.55;
                }

                .tos-sections {
                    padding: 8px 24px 28px;
                }

                .tos-section {
                    scroll-margin-top: 100px;
                    padding: 24px 0;
                    border-bottom: 1px solid #eee5d4;
                }

                .tos-section:last-child {
                    border-bottom: 0;
                }

                .tos-section h2 {
                    margin: 0 0 12px;
                    color: var(--color-primary-dark, #091a3e);
                    font-family: "Playfair Display", Georgia, serif;
                    font-size: 24px;
                    line-height: 1.25;
                    letter-spacing: 0;
                }

                .tos-section p {
                    margin: 0 0 12px;
                    color: #323b50;
                    font-size: 15.5px;
                    line-height: 1.75;
                }

                .tos-section p:last-child {
                    margin-bottom: 0;
                }

                .tos-contact-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 12px;
                    margin-top: 18px;
                }

                .tos-contact-item {
                    min-width: 0;
                    border: 1px solid #e3daca;
                    border-radius: 8px;
                    padding: 14px;
                    background: #fbf7ee;
                }

                .tos-contact-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    color: var(--color-primary, #0e2554);
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                .tos-contact-value {
                    color: #2f3749;
                    font-size: 14px;
                    font-weight: 600;
                    line-height: 1.45;
                    overflow-wrap: anywhere;
                    text-decoration: none;
                }

                a.tos-contact-value:hover,
                a.tos-contact-value:focus-visible {
                    color: var(--color-primary, #0e2554);
                    text-decoration: underline;
                }

                .tos-footer-note {
                    padding: 18px 24px 22px;
                    border-top: 1px solid #e7ddca;
                    background: #f7f2e8;
                    color: #5b6372;
                    font-size: 13px;
                    line-height: 1.6;
                }

                @media (max-width: 860px) {
                    .tos-shell {
                        width: min(100% - 28px, 720px);
                    }

                    .tos-topbar-inner {
                        align-items: flex-start;
                        flex-direction: column;
                        padding: 14px 0;
                    }

                    .tos-actions {
                        width: 100%;
                    }

                    .tos-btn {
                        flex: 1 1 0;
                    }

                    .tos-layout {
                        grid-template-columns: 1fr;
                    }

                    .tos-toc {
                        position: static;
                    }

                    .tos-contact-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 520px) {
                    .tos-hero {
                        padding-top: 32px;
                    }

                    .tos-hero h1 {
                        font-size: 34px;
                    }

                    .tos-intro {
                        font-size: 15.5px;
                    }

                    .tos-brand strong {
                        font-size: 16px;
                    }

                    .tos-brand span {
                        font-size: 9.5px;
                    }

                    .tos-sections,
                    .tos-notice,
                    .tos-footer-note {
                        padding-left: 16px;
                        padding-right: 16px;
                    }

                    .tos-section h2 {
                        font-size: 21px;
                    }
                }
            `}</style>

            <header className="tos-topbar">
                <div className="tos-shell tos-topbar-inner">
                    <div className="tos-brand">
                        <span className="tos-seal" aria-hidden="true">
                            <img
                                src={branding.brgyLogoUrl || "/brgy-logo.png"}
                                alt=""
                            />
                        </span>
                        <div>
                            <strong>{branding.name}</strong>
                            <span>{branding.city}</span>
                        </div>
                    </div>
                    <div className="tos-actions">
                        <Link className="tos-btn" to="/resident/register">
                            <ArrowLeft size={16} aria-hidden="true" />
                            Register
                        </Link>
                    </div>
                </div>
            </header>

            <section className="tos-shell tos-hero">
                <div className="tos-kicker">
                    <ShieldCheck size={17} aria-hidden="true" />
                    Resident Agreement
                </div>
                <h1>Terms of Service and Privacy Notice</h1>
                <p className="tos-intro">
                    This document explains the rules for using CertiFast and how
                    Barangay East Tapinac collects, uses, protects, and manages
                    resident information submitted through the platform.
                </p>
                <div className="tos-meta-row" aria-label="Document information">
                    <span className="tos-meta-pill">
                        <CalendarDays size={15} aria-hidden="true" />
                        Effective Date: {EFFECTIVE_DATE}
                    </span>
                    <span className="tos-meta-pill">
                        <Building2 size={15} aria-hidden="true" />
                        Barangay East Tapinac
                    </span>
                    <span className="tos-meta-pill">
                        <FileText size={15} aria-hidden="true" />
                        CertiFast Resident Portal
                    </span>
                </div>
            </section>

            <div className="tos-shell tos-layout">
                <aside className="tos-toc" aria-label="Table of contents">
                    <h2>Contents</h2>
                    <ol>
                        {sections.map((section) => (
                            <li key={section.id}>
                                <a href={`#${section.id}`}>
                                    {section.title.replace(/^\d+\.\s*/, "")}
                                </a>
                            </li>
                        ))}
                    </ol>
                </aside>

                <article className="tos-document">
                    <div className="tos-notice">
                        <ShieldCheck
                            size={21}
                            color="var(--color-primary, #0e2554)"
                            aria-hidden="true"
                        />
                        <p>
                            Please read this document carefully before creating
                            or using a CertiFast account. For official
                            questions, corrections, or privacy concerns, contact
                            Barangay East Tapinac directly.
                        </p>
                    </div>

                    <div className="tos-sections">
                        {sections.map((section) => (
                            <section
                                className="tos-section"
                                id={section.id}
                                key={section.id}
                            >
                                <h2>{section.title}</h2>
                                {section.body.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}

                                {section.id === "contact" && (
                                    <div className="tos-contact-grid">
                                        {contactRows.map((item) => {
                                            const Icon = item.icon;
                                            const content = item.href ? (
                                                <a
                                                    className="tos-contact-value"
                                                    href={item.href}
                                                >
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <div className="tos-contact-value">
                                                    {item.value}
                                                </div>
                                            );

                                            return (
                                                <div
                                                    className="tos-contact-item"
                                                    key={item.label}
                                                >
                                                    <div className="tos-contact-label">
                                                        <Icon
                                                            size={15}
                                                            aria-hidden="true"
                                                        />
                                                        {item.label}
                                                    </div>
                                                    {content}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>

                    <footer className="tos-footer-note">
                        This Terms of Service and Privacy Notice is intended to
                        support lawful barangay service delivery through
                        CertiFast and should be read together with applicable
                        Philippine laws, barangay procedures, and official
                        instructions from Barangay East Tapinac.
                    </footer>
                </article>
            </div>
        </main>
    );
}
