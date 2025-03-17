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
            unique: true, 
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

export { userModel, studentModel };