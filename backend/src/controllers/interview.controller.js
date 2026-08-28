const { PDFParse } = require("pdf-parse")

const {
    generateInterviewReport,
    generateResumePdf,
} = require("../services/ai.service")

const interviewReportModel = require("../models/interviewReport.model")


async function generateInterViewReportController(req, res) {
    try {

        const {
            selfDescription,
            jobDescription,
        } = req.body


        // Validate job description
        if (!jobDescription?.trim()) {
            return res.status(400).json({
                message: "Job description is required",
            })
        }


        // Resume OR self description is required
        if (!req.file && !selfDescription?.trim()) {
            return res.status(400).json({
                message:
                    "Either a resume or self description is required",
            })
        }


        let resumeContent = ""


        // ------------------------------------------------
        // Parse PDF Resume
        // ------------------------------------------------

        if (req.file) {

            // Only PDF allowed
            if (req.file.mimetype !== "application/pdf") {
                return res.status(400).json({
                    message:
                        "Only PDF resumes are currently supported",
                })
            }


            const parser = new PDFParse({
                data: req.file.buffer,
            })


            try {

                const parsedPdf = await parser.getText()

                resumeContent = parsedPdf.text || ""

            } finally {

                await parser.destroy()

            }


            // Make sure text was actually extracted
            if (!resumeContent.trim()) {
                return res.status(400).json({
                    message:
                        "Could not extract text from the PDF. Please upload a text-based PDF resume.",
                })
            }
        }


        // ------------------------------------------------
        // Generate AI Interview Report
        // ------------------------------------------------

        const aiReport = await generateInterviewReport({
            resume: resumeContent,
            selfDescription: selfDescription || "",
            jobDescription,
        })


        // ------------------------------------------------
        // Save Report
        // ------------------------------------------------

        const interviewReport =
            await interviewReportModel.create({

                user: req.user.id,

                resume: resumeContent,

                selfDescription:
                    selfDescription || "",

                jobDescription,

                ...aiReport,
            })


        // ------------------------------------------------
        // Send Response
        // ------------------------------------------------

        return res.status(201).json({

            message:
                "Interview report generated successfully",

            interviewReport,
        })

    } catch (error) {

        console.error(
            "Generate interview report error:",
            error
        )

        return res.status(500).json({

            message:
                error.message ||
                "Failed to generate interview report",
        })
    }
}


async function getInterviewReportByIdController(
    req,
    res
) {

    try {

        const { interviewId } = req.params


        const interviewReport =
            await interviewReportModel.findOne({

                _id: interviewId,

                user: req.user.id,
            })


        if (!interviewReport) {

            return res.status(404).json({

                message:
                    "Interview report not found",
            })
        }


        return res.status(200).json({

            message:
                "Interview report fetched successfully",

            interviewReport,
        })

    } catch (error) {

        console.error(
            "Get interview report error:",
            error
        )

        return res.status(500).json({

            message:
                "Failed to fetch interview report",
        })
    }
}


async function getAllInterviewReportsController(
    req,
    res
) {

    try {

        const interviewReports =
            await interviewReportModel

                .find({
                    user: req.user.id,
                })

                .sort({
                    createdAt: -1,
                })

                .select(
                    "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
                )


        return res.status(200).json({

            message:
                "Interview reports fetched successfully",

            interviewReports,
        })

    } catch (error) {

        console.error(
            "Get interview reports error:",
            error
        )

        return res.status(500).json({

            message:
                "Failed to fetch interview reports",
        })
    }
}


async function generateResumePdfController(
    req,
    res
) {

    try {

        const {
            interviewReportId,
        } = req.params


        const interviewReport =
            await interviewReportModel.findOne({

                _id: interviewReportId,

                user: req.user.id,
            })


        if (!interviewReport) {

            return res.status(404).json({

                message:
                    "Interview report not found",
            })
        }


        const {
            resume,
            jobDescription,
            selfDescription,
        } = interviewReport


        const pdfBuffer =
            await generateResumePdf({

                resume,

                jobDescription,

                selfDescription,
            })


        res.set({

            "Content-Type":
                "application/pdf",

            "Content-Disposition":
                `attachment; filename=resume_${interviewReportId}.pdf`,
        })


        return res.send(pdfBuffer)

    } catch (error) {

        console.error(
            "Generate resume PDF error:",
            error
        )

        return res.status(500).json({

            message:
                error.message ||
                "Failed to generate resume PDF",
        })
    }
}


module.exports = {

    generateInterViewReportController,

    getInterviewReportByIdController,

    getAllInterviewReportsController,

    generateResumePdfController,
}