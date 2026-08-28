import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf,
} from "../services/interview.api"

import {
    useContext,
    useEffect,
} from "react"

import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {
    const context =
        useContext(InterviewContext)

    const { interviewId } = useParams()

    if (!context) {
        throw new Error(
            "useInterview must be used within an InterviewProvider"
        )
    }

    const {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports,
    } = context

    const generateReport = async ({
        jobDescription,
        selfDescription,
        resumeFile,
    }) => {
        setLoading(true)

        try {
            const response =
                await generateInterviewReport({
                    jobDescription,
                    selfDescription,
                    resumeFile,
                })

            setReport(
                response.interviewReport
            )

            return response.interviewReport
        } catch (error) {
            console.error(
                "Generate report error:",
                error
            )

            throw error
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (
        id = interviewId
    ) => {
        if (!id) return null

        setLoading(true)

        try {
            const response =
                await getInterviewReportById(id)

            setReport(
                response.interviewReport
            )

            return response.interviewReport
        } catch (error) {
            console.error(
                "Get report error:",
                error
            )

            setReport(null)

            throw error
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)

        try {
            const response =
                await getAllInterviewReports()

            setReports(
                response.interviewReports || []
            )

            return (
                response.interviewReports || []
            )
        } catch (error) {
            console.error(
                "Get reports error:",
                error
            )

            setReports([])

            throw error
        } finally {
            setLoading(false)
        }
    }

    const getResumePdf = async (
        interviewReportId
    ) => {
        setLoading(true)

        try {
            const pdf =
                await generateResumePdf({
                    interviewReportId,
                })

            const url =
                window.URL.createObjectURL(
                    new Blob([pdf], {
                        type: "application/pdf",
                    })
                )

            const link =
                document.createElement("a")

            link.href = url

            link.download =
                `resume_${interviewReportId}.pdf`

            document.body.appendChild(link)

            link.click()

            link.remove()

            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error(
                "Resume PDF error:",
                error
            )

            throw error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
                .catch(() => {})
        } else {
            getReports()
                .catch(() => {})
        }
    }, [interviewId])

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf,
    }
}

