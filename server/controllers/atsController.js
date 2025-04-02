import { userModel } from "../models/userModel.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const checkResume = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "student") {
      return res.status(403).json({ success: false, message: "Access denied: Student role required" });
    }

    const { jobDescription } = req.body;
    const resumeFile = req.file;
    if (!jobDescription || !resumeFile) {
      return res.status(400).json({ success: false, message: "Resume and job description are required" });
    }

    const { default: pdfjsLib } = await import("pdfjs-dist/legacy/build/pdf.js");
    pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(
      __dirname,
      "..",
      "node_modules",
      "pdfjs-dist",
      "legacy",
      "build",
      "pdf.worker.js"
    );

    // Disable font fetching to suppress the warning
    const pdfBuffer = new Uint8Array(req.file.buffer);
    const pdf = await pdfjsLib.getDocument({
      data: pdfBuffer,
      disableFontFace: true, // Prevents font loading attempts
      useSystemFonts: false, // Avoids fetching standard fonts
    }).promise;
    let resumeText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      resumeText += textContent.items.map((item) => item.str).join(" ") + " ";
    }

    const resumeIndicators = ["experience", "skills", "education", "project", "work", "internship", "course"];
    const isResume = resumeIndicators.some(indicator => resumeText.toLowerCase().includes(indicator));
    if (!isResume) {
      return res.status(400).json({
        success: false,
        message: "Whoops! This doesn’t look like a resume, you sneaky trickster! Did you just upload your grocery list or a random PDF to fool me? I’m onto you! Please submit a real resume—something with ‘skills’ or ‘experience,’ not ‘buy milk’ or ‘alien invasion plans’! Try again, champ!"
      });
    }

    const jobKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(resumeText);
    const { score, missingKeywords } = calculateATSScore(jobKeywords, resumeKeywords);
    const feedback = generateDetailedFeedback(score, missingKeywords, jobDescription, resumeText, jobKeywords, resumeKeywords);

    res.status(200).json({
      success: true,
      message: "Resume analyzed successfully",
      data: {
        atsScore: score,
        feedback,
        missingKeywords: missingKeywords.length > 0 ? missingKeywords : undefined,
      },
    });
  } catch (error) {
    console.error("Error in checkResume:", error.stack);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

function extractKeywords(text) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/);
  const stopWords = new Set(["the", "and", "to", "a", "in", "of", "for", "with", "on"]);
  const uniqueKeywords = new Set(words.filter((word) => word.length > 2 && !stopWords.has(word)));
  return Array.from(uniqueKeywords);
}

function calculateATSScore(jobKeywords, resumeKeywords) {
  const matchedKeywords = jobKeywords.filter((keyword) => resumeKeywords.includes(keyword));
  const score = Math.round((matchedKeywords.length / jobKeywords.length) * 100) || 0;
  const missingKeywords = jobKeywords.filter((keyword) => !resumeKeywords.includes(keyword));
  return { score, missingKeywords };
}

function generateDetailedFeedback(score, missingKeywords, jobDescription, resumeText, jobKeywords, resumeKeywords) {
  const feedback = [];

  feedback.push(
    "**What is an ATS?**\n" +
    "When you apply for a job online, your resume first meets an Applicant Tracking System (ATS)—a tool used by companies like Google, Microsoft, and Amazon to filter applications. The ATS scans your resume for keywords, skills, and details that match the job description. If it doesn’t find enough matches, your resume might not reach a hiring manager, no matter how great you are! Your ATS score of " + score + "% shows how well your resume aligns with this job. Let’s make it stand out!"
  );

  feedback.push(
    "**Your ATS Score: " + score + "%**\n" +
    "- What It Means: This score tells you how much your resume matches the job description. Big companies often look for 70-80% or higher to move you forward.\n" +
    (score >= 80
      ? "- Great News: Your " + score + "% score is strong! You’re likely to pass the ATS and get noticed. A few tweaks can make it perfect!\n"
      : score >= 50
      ? "- Moderate Match: At " + score + "%, you’re halfway there. It’s a solid start, but you need more to compete with top applicants.\n"
      : "- Low Match: A " + score + "% score means your resume needs work to get past the ATS. Don’t worry—we’ve got you covered!\n") +
    "- Goal: Aim for 70-80% to impress companies like Amazon or Indeed. Higher scores mean a better chance at interviews!"
  );

  if (missingKeywords.length > 0) {
    feedback.push(
      "**Missing Keywords**\n" +
      "- These words are in the job description but not in your resume: " + missingKeywords.slice(0, 5).join(", ") + (missingKeywords.length > 5 ? " (and more)" : "") + ".\n" +
      "- Why They Matter: Keywords are what the ATS looks for. For example, ‘analytics’ might be key for a data job at Microsoft, or ‘SQL’ for a tech role at Google. Without them, your resume looks less relevant.\n" +
      "- More Keywords to Add: Check the job ad for tools (e.g., Excel, Python, Tableau), skills (e.g., data analysis, teamwork), or tasks (e.g., reporting, coding). Here are some big company favorites: SQL, Python, data visualization, statistics, communication, problem-solving."
    );
  }

  feedback.push(
    "**How Companies Evaluate Resumes**\n" +
    "- Step 1 - ATS Scan: The ATS checks for keywords and simple formatting. It loves plain text (e.g., Arial, 11pt) and hates images or tables.\n" +
    "- Step 2 - Hiring Manager: If you pass the ATS, a person looks for skills (e.g., ‘coding in Python’), proof (e.g., ‘built a website’), and fit (e.g., matching the job’s needs).\n" +
    "- What They Want: Skills you can do, projects you’ve worked on, and results you’ve achieved—even from school!"
  );

  feedback.push(
    "**How to Improve Your Resume**\n" +
    "- Add Skills: Make a ‘Skills’ section with tools and abilities you know. Examples: ‘Excel,’ ‘Python,’ ‘data analysis,’ ‘teamwork.’ Even basics like ‘research’ or ‘writing’ help!\n" +
    "- Show Projects: List school or personal projects. Example: ‘Created a resume checker in JavaScript to help students’ or ‘Analyzed class data in Excel to find patterns.’ Companies like Google love seeing what you’ve built!\n" +
    "- Use Numbers: Add results if possible. Example: ‘Reduced analysis time by 20%’ or ‘Surveyed 50 students for a project.’ Numbers make you stand out.\n" +
    "- Keep It Simple: Use plain text so the ATS can read it. Avoid fancy designs, logos, or columns.\n" +
    "- Tailor Every Time: Match your resume to each job. A tech job might need ‘coding’ and ‘SQL,’ while a marketing job wants ‘Google Analytics’ and ‘campaigns.’ Read the job ad and copy its words!\n" +
    "- Short and Sweet: Keep it to 1 page. Companies don’t have time for long resumes, especially for entry-level roles."
  );

  feedback.push(
    "**What Big Companies Look For**\n" +
    "- Tech Giants (Google, Microsoft): Coding skills (Python, Java), SQL, data tools (Tableau, Power BI), problem-solving, innovation.\n" +
    "- Business Leaders (Amazon, Deloitte): Excel, analytics, reporting, business insights, attention to detail.\n" +
    "- Marketing Firms (HubSpot, Adobe): Google Analytics, campaign planning, data insights, creativity, communication.\n" +
    "- General Tips: Match your resume to the job type. If it’s tech, focus on tools and projects. If it’s business, highlight analysis and results."
  );

  return feedback;
}