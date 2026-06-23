import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    BellRing,
    Building2,
    Check,
    ChevronDown,
    CircleDollarSign,
    Clock3,
    FileCheck2,
    FileText,
    LayoutDashboard,
    Mail,
    MapPin,
    Menu,
    Phone,
    QrCode,
    SearchCheck,
    ShieldCheck,
    UserCheck,
    X,
} from "lucide-react";
import {
    DEFAULT_PUBLIC_BRANDING,
    getPublicBrandingSettings,
} from "../services/publicBrandingService";
import { getPublicCertificateTemplates } from "../services/publicCertificateService";
import "./LandingPage.css";

const INITIAL_CERTIFICATE_LIMIT = 6;

const SERVICE_HIGHLIGHTS = [
    {
        icon: FileText,
        title: "Request online",
        description:
            "Choose an available barangay certificate and submit its requirements from your resident account.",
    },
    {
        icon: SearchCheck,
        title: "Track every update",
        description:
            "Follow your request from review to approval and know when it is ready for pickup.",
    },
    {
        icon: BellRing,
        title: "Respond with confidence",
        description:
            "Receive clear notices when the office needs a correction or has completed your request.",
    },
    {
        icon: QrCode,
        title: "Use your resident QR",
        description:
            "Keep a convenient digital resident identifier available inside your CertiFast account.",
    },
];

const PROCESS_STEPS = [
    {
        number: "01",
        icon: UserCheck,
        title: "Create and verify your account",
        description:
            "Register using your East Tapinac address and a valid ID. The barangay office reviews resident accounts before activation.",
    },
    {
        number: "02",
        icon: FileCheck2,
        title: "Select a certificate",
        description:
            "Choose the certificate you need, review its guidance, and submit the required information through CertiFast.",
    },
    {
        number: "03",
        icon: Building2,
        title: "Track and claim",
        description:
            "Monitor the request online. Once it is ready, visit the barangay office with the listed pickup requirements.",
    },
];

const FAQ_ITEMS = [
    {
        question: "Who can create a CertiFast resident account?",
        answer:
            "Residents of Barangay East Tapinac who are at least 18 years old may register. Registration asks for your address and a valid identification document so the barangay office can verify your account.",
    },
    {
        question: "How will I know the status of my request?",
        answer:
            "Sign in to your resident dashboard and open My Requests. You can see whether a request is pending, processing, ready for pickup, released, denied, or needs a correction.",
    },
    {
        question: "Are all barangay certificates free?",
        answer:
            "Not necessarily. The Available Certificates section shows whether each active certificate is free or has a configured fee. Final payment and pickup instructions are provided by the barangay office.",
    },
    {
        question: "Where do I claim a completed certificate?",
        answer:
            "Completed certificates are claimed at the Barangay East Tapinac office during its published office hours. Bring any pickup requirements shown in your request.",
    },
];

function readResidentSession() {
    try {
        const raw = localStorage.getItem("certifast_resident_auth");
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.resident || null;
    } catch {
        return null;
    }
}

function normalizeCertificates(result) {
    const rows = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : [];

    return rows
        .map((row, index) => {
            const name = String(row.name || row.cert_type || "").trim();
            if (!name) return null;

            const rawFee = row.feeAmount ?? row.fee_amount;
            const feeAmount =
                rawFee === null || rawFee === undefined || rawFee === ""
                    ? null
                    : Number(rawFee);

            return {
                id:
                    row.templateId ||
                    row.template_id ||
                    row.templateKey ||
                    row.template_key ||
                    `${name}-${index}`,
                name,
                description: String(
                    row.description ||
                        row.desc ||
                        "Request this certificate through your verified resident account.",
                ).trim(),
                hasFee: Boolean(row.hasFee ?? row.has_fee),
                feeAmount: Number.isFinite(feeAmount) ? feeAmount : null,
            };
        })
        .filter(Boolean);
}

function formatFee(certificate) {
    if (!certificate.hasFee) return "Free";
    if (certificate.feeAmount === null) return "Fee applies";
    return `PHP ${certificate.feeAmount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function safeTelephoneHref(value) {
    return `tel:${String(value || "").replace(/[^\d+]/g, "")}`;
}

export default function LandingPage() {
    const [branding, setBranding] = useState(DEFAULT_PUBLIC_BRANDING);
    const [certificates, setCertificates] = useState([]);
    const [certificatesLoading, setCertificatesLoading] = useState(true);
    const [certificatesError, setCertificatesError] = useState("");
    const [showAllCertificates, setShowAllCertificates] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const resident = useMemo(() => readResidentSession(), []);
    const isSignedIn = Boolean(resident);

    useEffect(() => {
        let mounted = true;

        getPublicBrandingSettings()
            .then((data) => {
                if (mounted) setBranding(data);
            })
            .catch(() => {
                if (mounted) setBranding(DEFAULT_PUBLIC_BRANDING);
            });

        getPublicCertificateTemplates()
            .then((result) => {
                if (!mounted) return;
                setCertificates(normalizeCertificates(result));
                setCertificatesError("");
            })
            .catch(() => {
                if (!mounted) return;
                setCertificates([]);
                setCertificatesError(
                    "Certificate information is temporarily unavailable. Please sign in or contact the barangay office for assistance.",
                );
            })
            .finally(() => {
                if (mounted) setCertificatesLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const previousTitle = document.title;
        document.title = `CertiFast | ${branding.name}`;

        let description = document.head.querySelector(
            'meta[name="description"]',
        );
        const createdDescription = !description;
        if (!description) {
            description = document.createElement("meta");
            description.name = "description";
            document.head.appendChild(description);
        }
        const previousDescription = description.content;
        description.content = `Request and track barangay certificates online with CertiFast, the resident service portal of ${branding.name}.`;

        let themeColor = document.head.querySelector('meta[name="theme-color"]');
        const createdThemeColor = !themeColor;
        if (!themeColor) {
            themeColor = document.createElement("meta");
            themeColor.name = "theme-color";
            document.head.appendChild(themeColor);
        }
        const previousThemeColor = themeColor.content;
        themeColor.content = "#0e2554";

        return () => {
            document.title = previousTitle;
            if (createdDescription) description.remove();
            else description.content = previousDescription;
            if (createdThemeColor) themeColor.remove();
            else themeColor.content = previousThemeColor;
        };
    }, [branding.name]);

    useEffect(() => {
        if (!mobileMenuOpen) return undefined;

        const closeOnEscape = (event) => {
            if (event.key === "Escape") setMobileMenuOpen(false);
        };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [mobileMenuOpen]);

    const visibleCertificates = showAllCertificates
        ? certificates
        : certificates.slice(0, INITIAL_CERTIFICATE_LIMIT);
    const officeSchedule =
        branding.officeSchedule || DEFAULT_PUBLIC_BRANDING.officeSchedule;
    const barangayLogo = branding.brgyLogoUrl || "/logo.png";
    const cityLogo = branding.cityLogoUrl || "/city-logo.png";
    const bagongPilipinasLogo =
        branding.bagongPilipinasLogoUrl || "/bagong-pilipinas-logo.png";

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div className="landing-root">
            <a className="landing-skip-link" href="#main-content">
                Skip to main content
            </a>

            <header className="landing-header">
                <div className="landing-container landing-header-inner">
                    <a
                        className="landing-brand"
                        href="#top"
                        aria-label="CertiFast home"
                        onClick={closeMobileMenu}
                    >
                        <span className="landing-brand-seal">
                            <img src={barangayLogo} alt="" />
                        </span>
                        <span className="landing-brand-copy">
                            <strong>CertiFast</strong>
                            <small>{branding.name}</small>
                        </span>
                    </a>

                    <nav
                        className={`landing-nav ${mobileMenuOpen ? "is-open" : ""}`}
                        aria-label="Main navigation"
                    >
                        <a href="#services" onClick={closeMobileMenu}>
                            Services
                        </a>
                        <a href="#how-it-works" onClick={closeMobileMenu}>
                            How It Works
                        </a>
                        <a href="#community" onClick={closeMobileMenu}>
                            Community
                        </a>
                        <a href="#faq" onClick={closeMobileMenu}>
                            FAQ
                        </a>
                        <a href="#contact" onClick={closeMobileMenu}>
                            Contact
                        </a>
                        <div className="landing-mobile-actions">
                            {isSignedIn ? (
                                <Link
                                    className="landing-button landing-button-primary"
                                    to="/resident/home"
                                    onClick={closeMobileMenu}
                                >
                                    Continue to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        className="landing-button landing-button-ghost"
                                        to="/resident/login"
                                        onClick={closeMobileMenu}
                                    >
                                        Resident Sign In
                                    </Link>
                                    <Link
                                        className="landing-button landing-button-primary"
                                        to="/resident/register"
                                        onClick={closeMobileMenu}
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>

                    <div className="landing-header-actions">
                        {isSignedIn ? (
                            <Link
                                className="landing-button landing-button-primary landing-button-compact"
                                to="/resident/home"
                            >
                                <LayoutDashboard size={16} />
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    className="landing-signin-link"
                                    to="/resident/login"
                                >
                                    Resident Sign In
                                </Link>
                                <Link
                                    className="landing-button landing-button-primary landing-button-compact"
                                    to="/resident/register"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        type="button"
                        className="landing-menu-button"
                        aria-label={
                            mobileMenuOpen
                                ? "Close navigation menu"
                                : "Open navigation menu"
                        }
                        aria-expanded={mobileMenuOpen}
                        onClick={() => setMobileMenuOpen((open) => !open)}
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </header>

            <main id="main-content">
                <section className="landing-hero" id="top">
                    <div className="landing-hero-grid" aria-hidden="true" />
                    <div className="landing-hero-orb landing-hero-orb-one" />
                    <div className="landing-hero-orb landing-hero-orb-two" />

                    <div className="landing-container landing-hero-inner">
                        <div className="landing-hero-copy">
                            <div className="landing-eyebrow">
                                <ShieldCheck size={15} />
                                Official resident service portal
                            </div>
                            <h1>
                                Barangay certificates,{" "}
                                <span>made simpler.</span>
                            </h1>
                            <p className="landing-hero-lead">
                                Request certificates online, follow every
                                update, and know when your document is ready to
                                claim at the barangay office.
                            </p>
                            <div className="landing-hero-actions">
                                {isSignedIn ? (
                                    <>
                                        <Link
                                            className="landing-button landing-button-gold"
                                            to="/resident/home"
                                        >
                                            Continue to Dashboard
                                            <ArrowRight size={17} />
                                        </Link>
                                        <a
                                            className="landing-button landing-button-hero-ghost"
                                            href="#services"
                                        >
                                            Explore Services
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            className="landing-button landing-button-gold"
                                            to="/resident/login"
                                        >
                                            Resident Sign In
                                            <ArrowRight size={17} />
                                        </Link>
                                        <Link
                                            className="landing-button landing-button-hero-ghost"
                                            to="/resident/register"
                                        >
                                            Create an Account
                                        </Link>
                                    </>
                                )}
                            </div>
                            <div className="landing-hero-assurance">
                                <span>
                                    <Check size={14} /> Online requests
                                </span>
                                <span>
                                    <Check size={14} /> Clear status updates
                                </span>
                                <span>
                                    <Check size={14} /> Barangay-managed
                                </span>
                            </div>
                        </div>

                        <div
                            className="landing-hero-visual"
                            aria-label="Illustration of a barangay certificate request progressing to ready for pickup"
                            role="img"
                        >
                            <div className="landing-document-card">
                                <div className="landing-document-header">
                                    <img src={barangayLogo} alt="" />
                                    <div>
                                        <span>Republic of the Philippines</span>
                                        <strong>{branding.name}</strong>
                                        <small>{branding.city}</small>
                                    </div>
                                </div>
                                <div className="landing-document-title">
                                    Certificate Request
                                </div>
                                <div className="landing-document-lines">
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                </div>
                                <div className="landing-document-signature">
                                    <span />
                                    <small>Authorized signatory</small>
                                </div>
                                <div className="landing-document-stamp">
                                    <ShieldCheck size={23} />
                                    VERIFIED
                                </div>
                            </div>

                            <div className="landing-status-card">
                                <span className="landing-status-icon">
                                    <FileCheck2 size={19} />
                                </span>
                                <div>
                                    <small>Request status</small>
                                    <strong>Ready for pickup</strong>
                                </div>
                                <Check size={17} />
                            </div>

                            <div className="landing-reference-card">
                                <small>Reference</small>
                                <strong>REQ-0024</strong>
                                <span>
                                    <Clock3 size={13} /> Updated today
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="landing-trust-strip">
                        <div className="landing-container">
                            <span>Serving residents of</span>
                            <strong>{branding.name}</strong>
                            <i />
                            <span>{branding.city}</span>
                        </div>
                    </div>
                </section>

                <section className="landing-section" id="services">
                    <div className="landing-container">
                        <div className="landing-section-heading">
                            <span>Resident services</span>
                            <h2>One clear place for your certificate request</h2>
                            <p>
                                CertiFast connects residents with the barangay
                                office through a simple, trackable request
                                process.
                            </p>
                        </div>

                        <div className="landing-feature-grid">
                            {SERVICE_HIGHLIGHTS.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <article
                                        className="landing-feature-card"
                                        key={item.title}
                                    >
                                        <span className="landing-feature-icon">
                                            <Icon size={23} />
                                        </span>
                                        <h3>{item.title}</h3>
                                        <p>{item.description}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="landing-section landing-certificates-section">
                    <div className="landing-container">
                        <div className="landing-section-heading landing-section-heading-row">
                            <div>
                                <span>Available certificates</span>
                                <h2>See what you can request</h2>
                            </div>
                            <p>
                                Offerings and fees are maintained by the
                                barangay office and may be updated as services
                                change.
                            </p>
                        </div>

                        {certificatesLoading ? (
                            <div
                                className="landing-certificate-grid"
                                aria-label="Loading available certificates"
                            >
                                {Array.from({ length: 6 }, (_, index) => (
                                    <div
                                        className="landing-certificate-card landing-skeleton"
                                        key={index}
                                    >
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                ))}
                            </div>
                        ) : certificatesError ? (
                            <div
                                className="landing-information-state"
                                role="status"
                            >
                                <FileText size={25} />
                                <div>
                                    <strong>
                                        Certificate list unavailable
                                    </strong>
                                    <p>{certificatesError}</p>
                                </div>
                            </div>
                        ) : certificates.length === 0 ? (
                            <div
                                className="landing-information-state"
                                role="status"
                            >
                                <FileText size={25} />
                                <div>
                                    <strong>
                                        No certificates are listed right now
                                    </strong>
                                    <p>
                                        Please contact the barangay office for
                                        current certificate services.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="landing-certificate-grid">
                                    {visibleCertificates.map(
                                        (certificate) => (
                                            <article
                                                className="landing-certificate-card"
                                                key={certificate.id}
                                            >
                                                <div className="landing-certificate-top">
                                                    <span className="landing-certificate-icon">
                                                        <FileText size={21} />
                                                    </span>
                                                    <span
                                                        className={`landing-fee-badge ${certificate.hasFee ? "has-fee" : ""}`}
                                                    >
                                                        {certificate.hasFee ? (
                                                            <CircleDollarSign
                                                                size={13}
                                                            />
                                                        ) : (
                                                            <Check size={13} />
                                                        )}
                                                        {formatFee(certificate)}
                                                    </span>
                                                </div>
                                                <h3>{certificate.name}</h3>
                                                <p>
                                                    {certificate.description}
                                                </p>
                                            </article>
                                        ),
                                    )}
                                </div>

                                {certificates.length >
                                    INITIAL_CERTIFICATE_LIMIT && (
                                    <div className="landing-view-all">
                                        <button
                                            type="button"
                                            className="landing-button landing-button-outline"
                                            onClick={() =>
                                                setShowAllCertificates(
                                                    (shown) => !shown,
                                                )
                                            }
                                            aria-expanded={showAllCertificates}
                                        >
                                            {showAllCertificates
                                                ? "Show Fewer Certificates"
                                                : "View All Certificates"}
                                            <ChevronDown
                                                size={17}
                                                className={
                                                    showAllCertificates
                                                        ? "is-rotated"
                                                        : ""
                                                }
                                            />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="landing-certificate-cta">
                            <div>
                                <strong>Ready to start a request?</strong>
                                <span>
                                    Sign in with a verified resident account to
                                    view requirements and submit.
                                </span>
                            </div>
                            <Link
                                className="landing-button landing-button-primary"
                                to={
                                    isSignedIn
                                        ? "/resident/submit-request"
                                        : "/resident/login"
                                }
                            >
                                {isSignedIn
                                    ? "Request a Certificate"
                                    : "Sign In to Request"}
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>

                <section
                    className="landing-section landing-process-section"
                    id="how-it-works"
                >
                    <div className="landing-container">
                        <div className="landing-section-heading landing-light-heading">
                            <span>How it works</span>
                            <h2>From registration to pickup in three steps</h2>
                            <p>
                                A transparent process keeps you informed while
                                the barangay office reviews and prepares your
                                request.
                            </p>
                        </div>

                        <div className="landing-process-grid">
                            {PROCESS_STEPS.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <article
                                        className="landing-process-card"
                                        key={step.number}
                                    >
                                        <span className="landing-process-number">
                                            {step.number}
                                        </span>
                                        <span className="landing-process-icon">
                                            <Icon size={24} />
                                        </span>
                                        <h3>{step.title}</h3>
                                        <p>{step.description}</p>
                                        {index < PROCESS_STEPS.length - 1 && (
                                            <span
                                                className="landing-process-connector"
                                                aria-hidden="true"
                                            >
                                                <ArrowRight size={18} />
                                            </span>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section
                    className="landing-section landing-community-section"
                    id="community"
                >
                    <div className="landing-container landing-community-grid">
                        <div className="landing-map-panel">
                            <div className="landing-map-frame">
                                <img
                                    src="/east-tapinac-purok-map-no-street-names.png"
                                    alt="Illustrated color-coded map of the eleven puroks of Barangay East Tapinac"
                                    loading="lazy"
                                    decoding="async"
                                    width="1536"
                                    height="1024"
                                />
                            </div>
                            <p>
                                Community illustration showing the purok areas
                                of East Tapinac. This graphic is not intended
                                for street navigation or official boundary
                                measurement.
                            </p>
                        </div>

                        <div className="landing-office-panel" id="contact">
                            <div className="landing-section-heading landing-office-heading">
                                <span>Our community</span>
                                <h2>Visit the barangay office</h2>
                                <p>
                                    For pickup, account verification concerns,
                                    or in-person assistance, contact the office
                                    using the details below.
                                </p>
                            </div>

                            <div className="landing-contact-list">
                                <div>
                                    <span>
                                        <MapPin size={19} />
                                    </span>
                                    <p>
                                        <small>Office address</small>
                                        <strong>{branding.address}</strong>
                                    </p>
                                </div>
                                <div>
                                    <span>
                                        <Phone size={19} />
                                    </span>
                                    <p>
                                        <small>Contact number</small>
                                        <a
                                            href={safeTelephoneHref(
                                                branding.contact,
                                            )}
                                        >
                                            {branding.contact}
                                        </a>
                                    </p>
                                </div>
                                <div>
                                    <span>
                                        <Mail size={19} />
                                    </span>
                                    <p>
                                        <small>Email address</small>
                                        <a href={`mailto:${branding.email}`}>
                                            {branding.email}
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="landing-office-hours">
                                <div className="landing-office-hours-title">
                                    <Clock3 size={18} />
                                    <strong>Office hours</strong>
                                </div>
                                {officeSchedule.map((row, index) => (
                                    <div
                                        className="landing-office-hours-row"
                                        key={`${row.label}-${index}`}
                                    >
                                        <span>{row.label}</span>
                                        <strong>{row.time}</strong>
                                    </div>
                                ))}
                            </div>

                            <div className="landing-government-marks">
                                <img
                                    src={barangayLogo}
                                    alt="Barangay seal"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <img
                                    src={cityLogo}
                                    alt="City government seal"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <img
                                    className="is-wide"
                                    src={bagongPilipinasLogo}
                                    alt="Bagong Pilipinas logo"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-section landing-faq-section" id="faq">
                    <div className="landing-container landing-faq-layout">
                        <div className="landing-faq-intro">
                            <span className="landing-section-kicker">
                                Frequently asked questions
                            </span>
                            <h2>Helpful answers before you begin</h2>
                            <p>
                                Need help with a specific request? The barangay
                                office can assist you using the contact details
                                above.
                            </p>
                            {!isSignedIn && (
                                <Link
                                    className="landing-text-link"
                                    to="/resident/register"
                                >
                                    Create a resident account
                                    <ArrowRight size={16} />
                                </Link>
                            )}
                        </div>

                        <div className="landing-faq-list">
                            {FAQ_ITEMS.map((item, index) => (
                                <details
                                    className="landing-faq-item"
                                    key={item.question}
                                    open={index === 0}
                                >
                                    <summary>
                                        <span>{item.question}</span>
                                        <ChevronDown size={19} />
                                    </summary>
                                    <p>{item.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="landing-final-cta">
                    <div className="landing-container landing-final-cta-inner">
                        <div>
                            <span>CertiFast resident portal</span>
                            <h2>Spend less time wondering about your request.</h2>
                            <p>
                                Start online and stay informed until your
                                certificate is ready to claim.
                            </p>
                        </div>
                        <div className="landing-final-actions">
                            <Link
                                className="landing-button landing-button-gold"
                                to={
                                    isSignedIn
                                        ? "/resident/home"
                                        : "/resident/login"
                                }
                            >
                                {isSignedIn
                                    ? "Continue to Dashboard"
                                    : "Resident Sign In"}
                                <ArrowRight size={17} />
                            </Link>
                            {!isSignedIn && (
                                <Link
                                    className="landing-button landing-button-hero-ghost"
                                    to="/resident/register"
                                >
                                    Register
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="landing-container landing-footer-grid">
                    <div className="landing-footer-brand">
                        <div>
                            <img
                                src={barangayLogo}
                                alt=""
                                loading="lazy"
                                decoding="async"
                            />
                            <span>
                                <strong>CertiFast</strong>
                                <small>{branding.name}</small>
                            </span>
                        </div>
                        <p>
                            A resident certificate request and tracking service
                            for Barangay East Tapinac.
                        </p>
                    </div>

                    <div className="landing-footer-column">
                        <strong>Quick links</strong>
                        <a href="#services">Services</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#community">Community</a>
                        <a href="#faq">FAQ</a>
                    </div>

                    <div className="landing-footer-column">
                        <strong>Resident portal</strong>
                        <Link to="/resident/login">Resident Sign In</Link>
                        <Link to="/resident/register">Create an Account</Link>
                        <Link to="/resident/home">Resident Dashboard</Link>
                    </div>

                    <div className="landing-footer-column landing-footer-contact">
                        <strong>Contact</strong>
                        <span>{branding.address}</span>
                        <a href={safeTelephoneHref(branding.contact)}>
                            {branding.contact}
                        </a>
                        <a href={`mailto:${branding.email}`}>
                            {branding.email}
                        </a>
                    </div>
                </div>

                <div className="landing-container landing-footer-bottom">
                    <span>
                        © {new Date().getFullYear()} {branding.name}. All rights
                        reserved.
                    </span>
                    <Link to="/admin/login">Staff / Admin Login</Link>
                </div>
            </footer>
        </div>
    );
}
