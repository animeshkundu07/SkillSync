import React, {
    useState,
    useRef,
} from "react"

import "../style/home.scss"
import { useAuth } from "../../auth/hooks/useAuth.js"

import { useInterview } from "../hooks/useInterview.js"
import { useNavigate } from "react-router"

const Home = () => {
    const {
        loading,
        generateReport,
        reports,
    } = useInterview()

    const { handleLogout } = useAuth()

    

    const [jobDescription, setJobDescription] =
        useState("")

    const [selfDescription, setSelfDescription] =
        useState("")

    const [resumeFile, setResumeFile] =
        useState(null)

    const [error, setError] =
        useState("")

    const resumeInputRef =
        useRef(null)

    const navigate = useNavigate()


    const handleUserLogout = async () => {
    try {
        await handleLogout()
        navigate("/login")
    } catch (error) {
        console.error("Logout failed:", error)
    }
}

    const handleResumeChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) {
        setResumeFile(null)
        return
    }

    // Check whether the selected file is a PDF
    const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")

    if (!isPdf) {
        setError("Please upload a PDF resume only.")
        e.target.value = ""
        setResumeFile(null)
        return
    }

    // Check file size (maximum 5MB)
    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
        setError("Resume must be smaller than 5MB.")
        e.target.value = ""
        setResumeFile(null)
        return
    }

    // File is valid
    setError("")
    setResumeFile(file)
}

    const handleGenerateReport = async () => {
        setError("")

        if (!jobDescription.trim()) {
            setError(
                "Please provide the job description."
            )
            return
        }

        if (
            !resumeFile &&
            !selfDescription.trim()
        ) {
            setError(
                "Please upload a resume or provide a self description."
            )
            return
        }

        try {
            const report =
                await generateReport({
                    jobDescription,
                    selfDescription,
                    resumeFile,
                })

            if (!report?._id) {
                throw new Error(
                    "Invalid report received from server."
                )
            }

            navigate(
                `/interview/${report._id}`
            )
        } catch (error) {
            console.error(error)

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to generate interview report."
            )
        }
    }

    if (loading) {
        return (
            <main className="loading-screen">
                <h1>
                    Generating your interview plan...
                </h1>

                <p>
                    This may take a few seconds.
                </p>
            </main>
        )
    }

    return (
        <div className="home-page">
            <header className="page-header">
    <div className="header-top">
        <div>
            <h1>
                Create Your Custom{" "}
                <span className="highlight">
                    Interview Plan
                </span>
            </h1>

            <p>
                Let our AI analyze the job
                requirements and your profile
                to build a personalized
                interview strategy.
            </p>
        </div>

        <button
            className="logout-btn"
            onClick={handleUserLogout}
        >
            Logout
        </button>
    </div>
</header>

            {error && (
                <div className="error-box">
                    {error}
                </div>
            )}

            <div className="interview-card">
                <div className="interview-card__body">
                    <div className="panel panel--left">
                        <div className="panel__header">
                            <span className="panel__icon">
                                💼
                            </span>

                            <h2>
                                Target Job Description
                            </h2>

                            <span className="badge badge--required">
                                Required
                            </span>
                        </div>

                        <textarea
                            value={jobDescription}
                            onChange={(e) =>
                                setJobDescription(
                                    e.target.value
                                )
                            }
                            className="panel__textarea"
                            placeholder="Paste the full job description here..."
                            maxLength={5000}
                        />

                        <div className="char-counter">
                            {jobDescription.length} / 5000 chars
                        </div>
                    </div>

                    <div className="panel-divider" />

                    <div className="panel panel--right">
                        <div className="panel__header">
                            <span className="panel__icon">
                                👤
                            </span>

                            <h2>
                                Your Profile
                            </h2>
                        </div>

                        <div className="upload-section">
                            <label className="section-label">
                                Upload Resume

                                <span className="badge badge--best">
                                    Best Results
                                </span>
                            </label>

                            <label
                                className="dropzone"
                                htmlFor="resume"
                            >
                                <span className="dropzone__icon">
                                    📄
                                </span>

                                <p className="dropzone__title">
                                    {resumeFile
                                        ? resumeFile.name
                                        : "Click to upload"}
                                </p>

                                <p className="dropzone__subtitle">
                                    PDF only · Max 5MB
                                </p>

                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type="file"
                                    id="resume"
                                    name="resume"
                                    accept="application/pdf,.pdf"
                                    onChange={
                                        handleResumeChange
                                    }
                                />
                            </label>
                        </div>

                        <div className="or-divider">
                            <span>OR</span>
                        </div>

                        <div className="self-description">
                            <label
                                className="section-label"
                                htmlFor="selfDescription"
                            >
                                Quick Self-Description
                            </label>

                            <textarea
                                value={
                                    selfDescription
                                }
                                onChange={(e) =>
                                    setSelfDescription(
                                        e.target.value
                                    )
                                }
                                id="selfDescription"
                                className="panel__textarea panel__textarea--short"
                                placeholder="Describe your experience, skills and background..."
                            />
                        </div>

                        <div className="info-box">
                            <span className="info-box__icon">
                                ℹ️
                            </span>

                            <p>
                                Either a{" "}
                                <strong>
                                    Resume
                                </strong>{" "}
                                or a{" "}
                                <strong>
                                    Self Description
                                </strong>{" "}
                                is required.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="interview-card__footer">
                    <span className="footer-info">
                        AI-Powered Interview Strategy
                    </span>

                    <button
                        onClick={
                            handleGenerateReport
                        }
                        className="generate-btn"
                        disabled={loading}
                    >
                        ✨ Generate My Interview Strategy
                    </button>
                </div>
            </div>

            {reports?.length > 0 && (
                <section className="recent-reports">
                    <h2>
                        My Recent Interview Plans
                    </h2>

                    <ul className="reports-list">
                        {reports.map(
                            (report) => (
                                <li
                                    key={
                                        report._id
                                    }
                                    className="report-item"
                                    onClick={() =>
                                        navigate(
                                            `/interview/${report._id}`
                                        )
                                    }
                                >
                                    <h3>
                                        {report.title ||
                                            "Untitled Position"}
                                    </h3>

                                    <p>
                                        Generated on{" "}
                                        {new Date(
                                            report.createdAt
                                        ).toLocaleDateString()}
                                    </p>

                                    <p className="match-score">
                                        Match Score:{" "}
                                        {
                                            report.matchScore
                                        }
                                        %
                                    </p>
                                </li>
                            )
                        )}
                    </ul>
                </section>
            )}
        </div>
    )
}

export default Home

