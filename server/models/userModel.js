import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "placement_officer", "training_team", "student"],
      required: true,
      default: "student",
    },
    profileImage: { type: String, default: null },
    resetOtp: { type: String, default: "" },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    admnNo: { type: String, required: true, unique: true },
    phoneNo: { type: String, required: true },
    dob: { type: Date, required: true },
    address: { type: String, required: true },
    degree: { type: String, required: true },
    degreeCgpa: { type: String, required: true },
    plustwoPercent: { type: String, required: true },
    tenthPercent: { type: String, required: true },
    pgMarks: [
      {
        semester: {
          type: Number,
          required: true,
          min: 1,
          max: 4, 
        },
        cgpa: {
          type: Number,
          required: false,
          min: 0,
          max: 10,
        },
      },
    ],
    resume: { type: String },
    githubProfile: { type: String },
  },
  { timestamps: true }
);

const studentModel = mongoose.models.StudentDetails || mongoose.model("StudentDetails", studentSchema);

const mockTest = new mongoose.Schema({
  testName: { type: String, required: true, unique: true },
  testType: { type: String, enum: ['mcq', 'coding'], required: true },
  questions: [{
    type: { 
      type: String, 
      enum: ['mcq', 'coding'], 
      required: true,
      validate: {
        validator: function(value) {
          return value === this.parent().parent().testType; 
        },
        message: "Question type must match test type"
      }
    },
    text: { type: String, required: true },
    options: {
      type: [String],
      required: function() { return this.type === 'mcq'; },
      validate: {
        validator: function(arr) { return this.type !== 'mcq' || arr.length === 4; },
        message: "MCQ questions must have exactly 4 options"
      }
    },
    correctAnswer: {
      type: String,
      required: function() { return this.type === 'mcq'; },
      validate: {
        validator: function(value) { return this.type !== 'mcq' || (value && this.options.includes(value)); },
        message: "Correct answer must be one of the options for MCQ"
      }
    },
    codingDetails: {
      type: {
        testCases: [{
          input: { type: String, required: true },
          output: { type: String, required: true }
        }],
        sampleSolution: { type: String }
      },
      required: function() { return this.type === 'coding'; },
      validate: {
        validator: function(value) { return this.type !== 'coding' || (value && value.testCases.length > 0); },
        message: "Coding questions must have at least one test case"
      }
    }
  }],
  timeLimit: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  lastDayToAttend: { type: Date, required: true },
  isPublished: { type: Boolean, default: false },
  startDate: { type: Date, required: true },
  description: { type: String, required: true },
  maxAttempts: { type: Number, default: 1 },
  passMark: { type: Number, required: true }
}, { timestamps: true });

const mockTestModel = mongoose.models.MockTests || mongoose.model('MockTests', mockTest);

const mockTestResult = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTests', required: true },
  mark: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  questionsAnswered: [{
    questionIndex: { type: Number, required: true },
    selectedAnswer: { type: String, default: null }, 
    codingAnswer: { type: String, default: null },   
    isCorrect: { type: Boolean, required: true },
    testCaseResults: {
      type: [{
        input: { type: String, required: true },
        output: { type: String, required: true },
        passed: { type: Boolean, required: true }
      }],
      default: [] 
    }
  }],
  notAnswered: { type: Number, required: true },
  wrongAnswers: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now, required: true },
  status: { type: String, enum: ['started', 'completed'], default: 'completed' },
  attemptNumber: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  startedAt: { type: Date, required: true },
  feedback: { type: String, default: '' }
});

const mockTestResultModel = mongoose.models.MockTestResults || mongoose.model('MockTestResults', mockTestResult);


const eligibilitySchema = new mongoose.Schema({
  cgpa: {
    type: Number,
    required: [true, "CGPA is required"], 
    min: [0, "CGPA cannot be less than 0"],
    max: [10, "CGPA cannot be more than 10"],
  },
  skills: {
    type: [String], 
    required: [true, "Skills are required"], 
    validate: {
      validator: (array) => array.length > 0,
      message: "At least one skill is required",
    },
  },
  degreeCgpa: {
    type: Number, 
    required: false,
    min: [0, "Degree CGPA cannot be less than 0"],
    max: [10, "Degree CGPA cannot be more than 10"],
  },
  plustwoPercent: {
    type: Number, 
    required: false,
    min: [0, "12th percentage cannot be less than 0"],
    max: [100, "12th percentage cannot be more than 100"],
  },
});

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    eligibility: {
      type: eligibilitySchema,
      required: [true, "Eligibility criteria are required"],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "PostedBy reference is required"],
    },
    applicationDeadline: {
      type: Date,
      required: [true, "Application deadline is required"],
      validate: {
        validator: (date) => date > new Date(),
        message: "Application deadline must be a future date",
      },
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      required: [true, "Job status is required"],
      default: "open",
    },
    applyLink: {
      type: String,
      trim: true,
      match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, "Please provide a valid URL"],
      required: function () {
        return !this.isCampusDrive; 
      },
    },
    isCampusDrive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const jobModel = mongoose.models.Job || mongoose.model("Job", jobSchema);

// models/index.js
const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Student ID is required"],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const jobApplicationModel = mongoose.models.JobApplication || mongoose.model("JobApplication", jobApplicationSchema);

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  tags: [{ type: String }],
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

export { userModel, studentModel, mockTestModel, mockTestResultModel,jobModel,jobApplicationModel,Blog };