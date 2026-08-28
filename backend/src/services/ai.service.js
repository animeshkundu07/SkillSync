const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
})

const interviewReportSchema = z.object({
    matchScore: z
        .number()
        .min(0)
        .max(100)
        .describe(
            "A score from 0 to 100 indicating how well the candidate matches the job."
        ),

    technicalQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string(),
        })
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string(),
        })
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum(["low", "medium", "high"]),
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string()),
        })
    ),

    title: z.string(),
})

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {

    try {

        const prompt = `
You are an expert technical recruiter and interview preparation specialist.

Generate a detailed interview preparation report for the candidate.

CANDIDATE RESUME:
${resume || "No resume provided"}

CANDIDATE SELF DESCRIPTION:
${selfDescription || "No self description provided"}

JOB DESCRIPTION:
${jobDescription}

Analyze the candidate's profile against the job description.

Return ONLY a valid JSON object.

The JSON object MUST contain exactly these fields:

{
    "matchScore": number,
    "technicalQuestions": [
        {
            "question": string,
            "intention": string,
            "answer": string
        }
    ],
    "behavioralQuestions": [
        {
            "question": string,
            "intention": string,
            "answer": string
        }
    ],
    "skillGaps": [
        {
            "skill": string,
            "severity": "low" | "medium" | "high"
        }
    ],
    "preparationPlan": [
        {
            "day": number,
            "focus": string,
            "tasks": [string]
        }
    ],
    "title": string
}

Requirements:

1. matchScore must be a number between 0 and 100.
2. technicalQuestions must contain relevant technical interview questions based on the job description and candidate's resume.
3. behavioralQuestions must contain relevant behavioral interview questions.
4. skillGaps must identify missing or weak skills required for the job.
5. severity must be exactly "low", "medium", or "high".
6. preparationPlan must contain a practical day-by-day preparation plan.
7. title must contain the job title or a suitable title inferred from the job description.
8. Do not return markdown.
9. Do not wrap the JSON inside \`\`\`json.
10. Do not add any explanation outside the JSON.
`


        const response = await ai.models.generateContent({

            model: "gemini-3-flash-preview",

            contents: prompt,

            config: {
                responseMimeType: "application/json",
            },
        })


        console.log(
            "Gemini raw response:",
            response.text
        )


        if (!response.text) {
            throw new Error(
                "Gemini returned an empty response."
            )
        }


        let parsedResponse

        try {

            parsedResponse =
                JSON.parse(response.text)

        } catch (parseError) {

            console.error(
                "Gemini JSON parsing error:",
                parseError
            )

            console.error(
                "Gemini response:",
                response.text
            )

            throw new Error(
                "Gemini returned invalid JSON."
            )
        }


        // Validate the response using Zod
        const validatedResponse =
            interviewReportSchema.parse(
                parsedResponse
            )


        return validatedResponse

    } catch (error) {

        console.error(
            "Gemini interview report generation error:",
            error
        )

        throw new Error(
            error?.message ||
            "Failed to generate interview report using Gemini"
        )
    }
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    })

    try {
        const page = await browser.newPage()

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
        })

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "15mm",
                bottom: "15mm",
                left: "15mm",
                right: "15mm",
            },
        })

        return pdfBuffer
    } finally {
        await browser.close()
    }
}

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription,
}) {
    const resumePdfSchema = z.object({
        html: z.string(),
    })

    const prompt = `
Create a professional ATS-friendly resume using the following information.

CURRENT RESUME:
${resume || "No existing resume provided"}

SELF DESCRIPTION:
${selfDescription || "No self description provided"}

TARGET JOB DESCRIPTION:
${jobDescription || "No job description provided"}

Requirements:

- Tailor the resume to the target job.
- Do not invent qualifications.
- Use only information provided.
- Keep it concise.
- Aim for 1-2 pages.
- Make it ATS-friendly.
- Use standard headings.
- Avoid tables where possible.
- Use professional formatting.
- Return ONLY the HTML document content.
`

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema:
                    zodToJsonSchema(resumePdfSchema),
            },
        })

        if (!response.text) {
            throw new Error("Gemini returned an empty response")
        }

        const parsedResponse = JSON.parse(response.text)

        const validatedResponse =
            resumePdfSchema.parse(parsedResponse)

        return await generatePdfFromHtml(
            validatedResponse.html
        )
    } catch (error) {
        console.error(
            "Resume PDF generation error:",
            error
        )

        throw new Error(
            "Failed to generate resume PDF"
        )
    }
}

module.exports = {
    generateInterviewReport,
    generateResumePdf,
}

