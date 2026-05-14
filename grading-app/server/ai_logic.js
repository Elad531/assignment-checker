const { GoogleGenerativeAI } = require("@google/generative-ai");
const { PDFDocument } = require('pdf-lib');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

async function analyzeAssignment(pdfBuffer) {
    try {
        console.log("--- Starting AI Logic (Native PDF Mode) ---");

        const pdfDoc = await PDFDocument.load(pdfBuffer);
        console.log(`PDF validated. Total pages: ${pdfDoc.getPageCount()}`);

        // Using the most specific model ID to avoid 404
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

        const pdfData = {
            inlineData: {
                data: pdfBuffer.toString("base64"),
                mimeType: "application/pdf",
            },
        };

        const prompt = `
    ROLE: You are a senior pedagogical supervisor for the Israeli Ministry of Education (Misrad HaChinuch). 
    Your mission is to evaluate a Science and Technology certification project based on the official 5-page curriculum instructions.

    GRADING RUBRIC (Total 100 points):
    1. TECHNICAL SUBMISSION (5 pts): Presence of a professional Cover Page and Table of Contents.
    2. INTRODUCTION (5 pts): Clarity of project goals, target audience, and context.
    3. BODY OF WORK (55 pts): Depth of STEM activity goals, documentation of process, and scientific accuracy.
    4. PERSONAL REFLECTION (20 pts): MUST include a table documenting 3 significant meetings. 
       *STRICT: Deduct points if the style is generic or clearly AI-generated.*
    5. BIBLIOGRAPHY (5 pts): Minimum of 3 academic/official sources in proper format.
    6. PARTICIPATION (5 pts): Evidence of the student's active role in the project.

    EVALUATION GUIDELINES:
    - Use professional Hebrew terminology (e.g., מחוון, מטרות הוראה, רפלקציה).
    - Be constructive but strict.
    - AI Audit: Detect if the student used AI without disclosure, especially in the reflection.

    REQUIRED JSON STRUCTURE (Output ONLY this JSON in Hebrew):
    {
        "studentName": "שם התלמיד",
        "studentId": "תעודת זהות אם נמצאה",
        "scores": {
            "technical": { "score": 0, "notes": "הסבר קצר" },
            "intro": { "score": 0, "notes": "הסבר קצר" },
            "body": { "score": 0, "notes": "הסבר מפורט על גוף העבודה" },
            "reflection": { "score": 0, "notes": "הסבר על הרפלקציה", "metTableFound": true/false },
            "bibliography": { "score": 0, "notes": "הסבר על המקורות" },
            "participation": { "score": 0, "notes": "הסבר" }
        },
        "totalGrade": 0,
        "aiDisclosureAudit": "ניתוח מפורט של שימוש ב-AI ויושרה אקדמית",
        "feedback": {
            "light": "כאן עליך לכתוב פסקה מפורטת (3-4 משפטים) על נקודות החוזק של העבודה",
            "growth": "כאן עליך לכתוב פסקה מפורטת (3-4 משפטים) על נושאים לשיפור ושימור לעתיד"
        },
        "finalExecutiveSummary": "סיכום פדגוגי סופי למורה"
    }
`;

        console.log("Requesting analysis from Google...");
        const result = await model.generateContent([prompt, pdfData]);
        const response = await result.response;
        
        const cleanedJson = response.text().replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedJson);

    } catch (error) {
        console.error("CRITICAL ERROR IN AI_LOGIC:", error.message);
        throw error;
    }
}

module.exports = { analyzeAssignment };