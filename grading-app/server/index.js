console.log("1. Script started in NO-DB Mode...");

require('dotenv').config();
console.log("2. Environment variables loaded...");

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { analyzeAssignment } = require('./ai_logic');

console.log("3. Modules imported successfully...");

const app = express();
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
console.log("4. Middleware configured...");

// Note: Mongoose and Submission model are removed to avoid errors
app.post('/upload', upload.single('pdf'), async (req, res) => {
    console.log("--- New Upload Request Received ---");
    try {
        if (!req.file) {
            console.log("Error: No file in request");
            return res.status(400).send("No file uploaded");
        }
        
        console.log("File received:", req.file.originalname);
        console.log("Analyzing based on the 5-page curriculum instructions...");

        // This calls the AI logic which uses the specific rubric from the PDF
        const analysis = await analyzeAssignment(req.file.buffer);
        
        console.log("AI Analysis complete!");
        res.status(200).json(analysis);

    } catch (error) {
        console.error("Processing Error:", error);
        res.status(500).json({ 
            error: "Analysis failed", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`7. SERVER READY: Listening on port ${PORT}`);
});