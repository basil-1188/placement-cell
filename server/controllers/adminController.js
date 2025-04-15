import { studentModel, userModel, mockTestModel, mockTestResultModel, StudyMaterial, Video, jobModel, jobApplicationModel,Blog, Interview, Feedback } from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
  try {
    console.log("getAllUsers - req.user:", req.user);
    const admin = await userModel.findById(req.user?._id);
    console.log("getAllUsers - Found user:", admin);
    if (!admin) {
      return res.status(404).json({ success: false, message: "User not found in database" });
    }
    if (admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const users = await userModel.find({ role: { $ne: "admin" } }, "name email role profileImage");
    console.log("Returning non-admin users:", users.length);
    res.json({ success: true, users });
  } catch (error) {
    console.error("getAllUsers error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateRole = async (req, res) => {
  try {
    console.log("updateRole - req.user:", req.user);
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user data" });
    }
    const admin = await userModel.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    if (admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const { userId, role } = req.body;
    console.log("Received body:", { userId, role });
    if (!userId || !role) {
      return res.status(400).json({ success: false, message: "User ID and role are required" });
    }

    if (!["placement_officer", "training_team"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role. Allowed: placement_officer, training_team" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    console.log("Role updated for user:", { userId, newRole: role });
    res.json({ success: true, message: "Role updated successfully" });
  } catch (error) {
    console.error("updateRole error:", error.stack);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};


export const getFullUserDetails = async (req, res) => {
  try {
    console.log("Fetching all user details for admin: ", req.user);
    const admin = await userModel.findById(req.user?._id);
    if (!admin) {
      return res.json({ success: false, message: "Unauthorized: No user data" });
    }
    if (admin.role !== "admin") {
      return res.json({ success: false, message: "Access denied: Admin role required" });
    }

    const users = await userModel.find({ role: { $eq: "student" } }, "role _id name email profileImage");
    console.log("Returning student users:", users.length);
    console.log("Users from userModel:", users);

    const studentIds = users.map(user => user._id);
    console.log("Student IDs to query studentModel:", studentIds);

    const fullDetails = await studentModel.find(
      { studentId: { $in: studentIds } },
      "studentId admnNo phoneNo dob address degree degreeCgpa plustwoPercent tenthPercent pgMarks" // Changed to pgMarks
    );
    console.log("Full Details from studentModel:", fullDetails);

    const responseData = users.map(user => {
      const details = fullDetails.find(detail => 
        detail.studentId && detail.studentId.toString() === user._id.toString()
      );
      console.log(`Matching user _id: ${user._id} with studentId: ${details ? details.studentId : 'no match'}`);
      console.log(`PG Marks for ${user._id}: ${details ? JSON.stringify(details.pgMarks) : 'undefined'}`); // Changed to pgMarks
      return {
        _id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        ...(details && {
          admnNo: details.admnNo,
          phoneNo: details.phoneNo,
          dob: details.dob,
          address: details.address,
          degree: details.degree,
          degreeCgpa: details.degreeCgpa,
          plustwoPercent: details.plustwoPercent,
          tenthPercent: details.tenthPercent,
          pgMarks: details.pgMarks || [], // Changed to pgMarks
        }),
      };
    });

    console.log("Final Response Data:", responseData);
    res.json({ success: true, users: responseData });
  } catch (error) {
    console.error("getFullUserDetails error:", error.stack);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getAdminIndex = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const totalUsers = await userModel.countDocuments();
    const totalStudents = await userModel.countDocuments({ role: "student" });
    const totalOfficers = await userModel.countDocuments({ role: "placement_officer" });
    const totalTrainingTeam = await userModel.countDocuments({ role: "training_team" });

    const adminData = {
      totalUsers,
      totalStudents,
      totalOfficers,
      totalTrainingTeam,
    };

    return res.json({
      success: true,
      message: "Admin dashboard data retrieved",
      data: adminData,
    });
  } catch (error) {
    console.error("Error in getAdminIndex:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const { studentId } = req.params;
    await userModel.findByIdAndDelete(studentId);
    await studentModel.findOneAndDelete({ studentId });
    res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error in deleteStudent:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getOfficerTrainingTeam = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const officers = await userModel
      .find({ role: { $in: ["placement_officer", "training_team"] } })
      .select("name email profileImage role")
      .limit(4);

    res.status(200).json({ success: true, officers });
  } catch (error) {
    console.error("Error in getOfficerTrainingTeam:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMockTests = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id).lean();
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const tests = await mockTestModel
      .find()
      .populate({
        path: "createdBy",
        select: "name email",
      })
      .lean();

    const allStudents = await userModel.find({ role: "student" }).select("_id").lean();
    const studentIds = allStudents.map((s) => s._id.toString());

    const testsWithData = await Promise.all(
      tests.map(async (test) => {
        try {
          const results = await mockTestResultModel
            .find({ mockTestId: test._id })
            .populate({
              path: "studentId",
              select: "name admnNo email",
            })
            .lean();

          console.log(`Test ${test._id}: Found ${results.length} results`);

          const attendedStudentIds = results
            .filter((r) => r.studentId)
            .map((r) => r.studentId._id.toString());
          const notAttendedCount = studentIds.filter(
            (id) => !attendedStudentIds.includes(id)
          ).length;

          const avgMark = results.length
            ? (
                results.reduce((sum, r) => sum + (r.mark || 0), 0) /
                results.length
              ).toFixed(2)
            : "0.00";

          return {
            ...test,
            createdBy: test.createdBy || { name: "Unknown", email: "N/A" },
            results,
            attendedCount: results.length,
            notAttendedCount,
            avgMark,
          };
        } catch (error) {
          console.error(`Error processing test ${test._id}:`, error.message);
          return {
            ...test,
            createdBy: test.createdBy || { name: "Unknown", email: "N/A" },
            results: [],
            attendedCount: 0,
            notAttendedCount: studentIds.length,
            avgMark: "0.00",
            error: `Failed to load results: ${error.message}`,
          };
        }
      })
    );

    res.status(200).json({ success: true, tests: testsWithData });
  } catch (error) {
    console.error("Error in getMockTests:", error.message, error.stack);
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getTrainingResources = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const studyMaterials = await StudyMaterial.find()
      .populate("author", "name email")
      .lean();
    const videos = await Video.find()
      .populate("author", "name email")
      .lean();

    const resources = [
      ...studyMaterials.map((m) => ({
        _id: m._id,
        title: m.title,
        type: m.type,
        content: m.content,
        thumbnail: m.thumbnail,
        author: m.author,
        status: m.status,
        createdAt: m.createdAt,
        isLive: m.isLive,
        schedule: m.schedule,
      })),
      ...videos.map((v) => ({
        _id: v._id,
        title: v.title,
        type: v.type,
        content: v.content,
        thumbnail: v.thumbnail || null,
        author: v.author,
        status: v.status,
        createdAt: v.createdAt,
        source: v.source,
        duration: v.duration,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, resources });
  } catch (error) {
    console.error("Error in getTrainingResources:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied: Admin role required" });
    }

    const jobs = await jobModel.find().lean();
    const jobsWithApplicantStats = await Promise.all(
      jobs.map(async (job) => {
        if (job.isCampusDrive) {
          const applications = await jobApplicationModel
            .find({ jobId: job._id })
            .populate("studentId", "name email")
            .lean();
          const applicantCount = applications.length;

          const studentIds = applications.map((app) => app.studentId._id);
          const students = await studentModel.find({ studentId: { $in: studentIds } }).lean();
          const cgpas = students
            .map((student) => parseFloat(student.degreeCgpa))
            .filter((cgpa) => !isNaN(cgpa));
          const averageCgpa = cgpas.length > 0 ? cgpas.reduce((a, b) => a + b, 0) / cgpas.length : null;

          return { ...job, applicantCount, averageCgpa };
        }
        return job;
      })
    );

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      data: jobsWithApplicantStats,
    });
  } catch (error) {
    console.error("Error in getAllJobs:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getCampusDriveApplicants = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied: Admin role required" });
    }

    const { jobId } = req.params;
    const applicants = await jobApplicationModel
      .find({ jobId })
      .populate("studentId", "name email")
      .populate("jobId", "title company eligibility")
      .lean();

    if (!applicants || applicants.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No applicants registered for this campus drive",
        data: [],
      });
    }

    const studentIds = applicants.map((app) => app.studentId._id);
    const students = await studentModel.find({ studentId: { $in: studentIds } }).lean();

    const enrichedApplicants = applicants.map((app) => {
      const student = students.find((s) => s.studentId.toString() === app.studentId._id.toString());
      let averageCgpa = "N/A";

      if (student && student.pgMarks && student.pgMarks.length > 0) {
        const validCgpas = student.pgMarks
          .map((mark) => mark.cgpa)
          .filter((cgpa) => typeof cgpa === "number" && !isNaN(cgpa));
        averageCgpa = validCgpas.length > 0
          ? (validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length).toFixed(2)
          : "N/A";
      }

      return { ...app, averageCgpa };
    });

    return res.status(200).json({
      success: true,
      message: "Applicants fetched successfully",
      data: enrichedApplicants,
    });
  } catch (error) {
    console.error("Error in getCampusDriveApplicants:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied: Admin role required" });
    }

    const blogs = await Blog.find()
      .populate("author", "name email") 
      .lean();

    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      data: blogs,
    });
  } catch (error) {
    console.error("Error in getAllBlogs:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getReports = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") return res.status(403).json({ success: false, message: "Access denied: Admin role required" });

    const userStats = await userModel.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $project: { role: "$_id", count: 1, _id: 0 } }
    ]);

    const allTests = await mockTestModel
      .find({ createdBy: { $in: await userModel.find({ role: "placement_officer" }).distinct("_id") } }, "testName")
      .lean();

    const testResults = await mockTestResultModel
      .find({ status: "completed" }, "mockTestId")
      .populate("mockTestId", "testName")
      .lean();

    const participationCounts = testResults.reduce((acc, result) => {
      const testName = result.mockTestId?.testName || "Unknown Test";
      acc[testName] = (acc[testName] || 0) + 1;
      return acc;
    }, {});

    const mockTestParticipation = allTests.map(test => ({
      testName: test.testName,
      participantCount: participationCounts[test.testName] || 0
    }));
    console.log("Mock Test Participation Data:", mockTestParticipation); // Debug log

    const jobOpenings = await jobModel.find({}, "title company createdAt").lean();

    const newlyRegistered = await userModel.find({}, "name email createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      data: {
        userStats,
        mockTestParticipation,
        jobOpenings,
        newlyRegistered
      }
    });
  } catch (error) {
    console.error("getReports error:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") return res.status(403).json({ success: false, message: "Access denied: Admin role required" });

    const newUsers = await userModel
      .find({ role: "student" }, "name createdAt") 
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .then(users => users.map(user => ({
        id: user._id,
        message: `New user registered: ${user.name}`,
        timestamp: user.createdAt,
      })));

    const testCompletions = await mockTestResultModel
      .find({ status: "completed" }, "studentId mockTestId completedAt")
      .populate("studentId", "name")
      .populate("mockTestId", "testName")
      .sort({ completedAt: -1 })
      .limit(5)
      .lean()
      .then(results => results.map(result => ({
        id: result._id,
        message: `Mock test '${result.mockTestId?.testName || "Unknown Test"}' completed by ${result.studentId?.name || "Unknown Student"}`,
        timestamp: result.completedAt,
      })));

    const newJobs = await jobModel
      .find({}, "title company createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .then(jobs => jobs.map(job => ({
        id: job._id,
        message: `Job opening '${job.title}' posted by ${job.company}`,
        timestamp: job.createdAt,
      })));

    const notifications = [...newUsers, ...testCompletions, ...newJobs]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10); 

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    console.error("getNotifications error:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getAdminTools = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied: Admin role required" });
    }

    const tools = ["Clear Logs", "Export User Data", "Reset Mock Tests"];

    return res.status(200).json({
      success: true,
      message: "Admin tools accessed successfully",
      data: { tools }
    });
  } catch (error) {
    console.error("getAdminTools error:", error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    console.log("req.user:", req.user);
    const admin = await userModel.findById(req.user?._id);
    console.log("Admin found:", admin);
    if (!admin) {
      return res.status(404).json({ success: false, message: "User not found in database" });
    }
    if (admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const totalUsers = await userModel.countDocuments({});
    const totalStudents = await userModel.countDocuments({ role: "student" });
    const totalOfficers = await userModel.countDocuments({ role: "placement_officer" });
    const totalTrainingTeam = await userModel.countDocuments({ role: "training_team" });
    console.log("Stats:", { totalUsers, totalStudents, totalOfficers, totalTrainingTeam });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalOfficers,
        totalTrainingTeam,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const scheduleInterviewQuestions = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }
    const { studentId, questions, scheduledAt } = req.body;
    if (!studentId || !questions || !Array.isArray(questions) || questions.length === 0 || !scheduledAt) {
      return res.status(400).json({ success: false, message: "Student ID (or 'all'), questions array, and scheduledAt are required" });
    }

    let interviews = [];
    if (studentId === "all") {
      const students = await userModel.find({ role: "student" }).select("_id");
      interviews = students.map((student) => ({
        studentId: student._id,
        createdBy: req.user._id,
        questions: questions.map((text) => ({ text })),
        scheduledAt: new Date(scheduledAt),
      }));
    } else {
      const student = await userModel.findById(studentId);
      if (!student || student.role !== "student") {
        return res.status(404).json({ success: false, message: "Valid student ID required" });
      }
      interviews = [{
        studentId,
        createdBy: req.user._id,
        questions: questions.map((text) => ({ text })),
        scheduledAt: new Date(scheduledAt),
      }];
    }

    const savedInterviews = await Interview.insertMany(interviews);
    res.json({ success: true, message: "Interview(s) scheduled successfully", data: savedInterviews });
  } catch (error) {
    console.error("Error in scheduleInterviewQuestions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllTheStudents = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }
    const students = await userModel.find({ role: "student" }).select("_id name");
    res.json({ success: true, data: students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getInterviewResults = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const interviews = await Interview.find()
      .populate("studentId", "name")
      .select("studentId scheduledAt status completedAt responses questions performanceScore");

    const interviewResults = interviews.map((interview) => ({
      id: interview._id,
      studentName: interview.studentId?.name || "Unknown",
      type: "AI Interview",
      title: `Interview with ${interview.studentId?.name || "Unknown"}`,
      date: interview.completedAt || interview.scheduledAt,
      status: interview.status,
      score: interview.performanceScore, // Now included from DB
      responses: interview.responses.map((r) => ({
        questionIndex: r.questionIndex,
        question: interview.questions[r.questionIndex]?.text || "Unknown question",
        answer: r.answer,
        feedback: r.feedback || "",
      })),
    }));

    res.json({ success: true, data: interviewResults });
  } catch (error) {
    console.error("Error fetching interview results:", error.message);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const interviews = await Interview.find({ createdBy: admin._id })
      .populate("studentId", "name")
      .select("studentId scheduledAt status completedAt questions");

    const groupedInterviews = {};
    interviews.forEach((interview) => {
      const questionsKey = JSON.stringify(interview.questions.map((q) => q.text).sort());
      if (!groupedInterviews[questionsKey]) {
        groupedInterviews[questionsKey] = {
          id: interview._id.toString(),
          title: `AI Interview on ${interview.completedAt || interview.scheduledAt}`,
          date: interview.completedAt || interview.scheduledAt,
          totalStudents: 0,
          completedStudents: 0,
        };
      }
      groupedInterviews[questionsKey].totalStudents += 1;
      if (interview.status === "completed") {
        groupedInterviews[questionsKey].completedStudents += 1;
      }
    });

    const interviewList = Object.values(groupedInterviews).map((group) => ({
      id: group.id,
      type: "AI Interview",
      title: group.title,
      date: group.date,
      status: `${group.completedStudents} out of ${group.totalStudents}`,
      studentCount: group.totalStudents,
    }));

    res.json({ success: true, data: interviewList });
  } catch (error) {
    console.error("Error fetching interviews:", error.message);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getInterviewParticipants = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const interviewId = req.params.id;
    const referenceInterview = await Interview.findById(interviewId)
      .populate("studentId", "name")
      .select("questions createdBy");

    if (!referenceInterview || referenceInterview.createdBy.toString() !== admin._id.toString()) {
      return res.status(404).json({ success: false, message: "Interview not found or access denied." });
    }

    const questionTexts = referenceInterview.questions.map((q) => q.text).sort();
    const interviews = await Interview.find({
      createdBy: admin._id,
    })
      .populate("studentId", "name")
      .select("studentId status completedAt scheduledAt questions");

    const matchedInterviews = interviews.filter((interview) => {
      const currentQuestions = interview.questions.map((q) => q.text).sort();
      return (
        currentQuestions.length === questionTexts.length &&
        currentQuestions.every((q, i) => q === questionTexts[i])
      );
    });

    const participants = matchedInterviews.map((interview) => ({
      studentId: interview.studentId?._id.toString(),
      studentName: interview.studentId?.name || "Unknown",
      status: interview.status,
      date: interview.completedAt || interview.scheduledAt,
    }));

    res.json({ success: true, data: participants });
  } catch (error) {
    console.error("Error fetching participants:", error.message);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getStudentResponses = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const { interviewId, studentId } = req.params;
    const interview = await Interview.findOne({
      _id: interviewId,
      studentId,
      createdBy: admin._id,
    })
      .populate("studentId", "name")
      .select("questions responses performanceScore status completedAt scheduledAt");

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found for this student" });
    }

    const data = {
      studentName: interview.studentId?.name || "Unknown",
      status: interview.status,
      date: interview.completedAt || interview.scheduledAt,
      performanceScore: interview.performanceScore,
      responses: interview.responses.map((resp) => ({
        questionIndex: resp.questionIndex,
        question: interview.questions[resp.questionIndex]?.text || "Unknown question",
        answer: resp.answer,
        feedback: resp.feedback || "",
      })),
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching student responses:", error.message);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const updateInterviewFeedback = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const { interviewId, responses, performanceScore } = req.body;

    if (!interviewId || !Array.isArray(responses) || performanceScore === undefined) {
      return res.status(400).json({ success: false, message: "interviewId, responses array, and performanceScore are required" });
    }

    const score = Number(performanceScore);
    if (isNaN(score) || score < 0 || score > 100) {
      return res.status(400).json({ success: false, message: "performanceScore must be a number between 0 and 100" });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    const updatedCount = responses.reduce((count, resp) => {
      if (typeof resp.questionIndex !== "number" || (resp.feedback !== undefined && typeof resp.feedback !== "string")) {
        throw new Error(`Invalid response format: questionIndex must be a number, feedback must be a string if provided`);
      }

      const response = interview.responses.find((r) => r.questionIndex === resp.questionIndex);
      if (!response) {
        throw new Error(`Invalid questionIndex: ${resp.questionIndex} not found in interview responses`);
      }

      response.feedback = resp.feedback !== undefined ? resp.feedback : response.feedback;
      return count + 1;
    }, 0);

    if (updatedCount === 0 && responses.length > 0) {
      return res.status(400).json({ success: false, message: "No valid responses matched to update" });
    }

    interview.performanceScore = score;

    await interview.save();

    res.json({ success: true, message: "Feedback and score updated successfully", data: interview });
  } catch (error) {
    console.error("Error updating interview feedback:", error.message, error.stack);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getInterviewFeedback = async (req, res) => {
  try {
    const admin = await userModel.findById(req.user?._id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }
    const feedbacks = await Feedback.find()
      .populate("submittedBy", "name")
      .populate("targetUser", "name")
      .select("submittedBy type entityId targetRole targetUser comment rating submittedAt");

    const feedbackData = feedbacks.map((feedback) => ({
      submittedBy: feedback.submittedBy.name,
      type: feedback.type,
      entityId: feedback.entityId,
      targetRole: feedback.targetRole,
      targetUser: feedback.targetUser ? feedback.targetUser.name : null,
      comment: feedback.comment,
      rating: feedback.rating,
      submittedAt: feedback.submittedAt,
    }));

    res.json({ success: true, data: feedbackData });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFeedback = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id).lean();
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const feedback = await Feedback.find({
      type: { $in: ["mocktest", "job", "studymaterial", "general"] },
    })
      .populate("submittedBy", "name email")
      .populate("targetUser", "name email")
      .lean();

    const formattedFeedback = feedback.map((fb) => ({
      _id: fb._id,
      type: fb.type,
      comment: fb.comment,
      rating: fb.rating || "N/A",
      submittedBy: fb.submittedBy ? fb.submittedBy.name : "Unknown",
      submittedByEmail: fb.submittedBy ? fb.submittedBy.email : "N/A",
      submittedAt: fb.submittedAt,
      targetRole: fb.targetRole,
      targetUser: fb.targetUser ? fb.targetUser.name : "N/A",
      targetUserEmail: fb.targetUser ? fb.targetUser.email : "N/A",
    }));

    res.status(200).json({ success: true, feedback: formattedFeedback });
  } catch (error) {
    console.error("Error in getFeedback:", error.message, error.stack);
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user?._id)
      .select("name email role profileImage createdAt updatedAt")
      .lean();
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    res.status(200).json({ success: true, profile: user });
  } catch (error) {
    console.error("Error in getProfile:", error.message, error.stack);
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    const { name, profileImage } = req.body;
    if (name) user.name = name;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    const updatedUser = {
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({ success: true, profile: updatedUser, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error in updateProfile:", error.message, error.stack);
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};