import multer from "multer";

const storage = multer.memoryStorage();

const profileImageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, GIF) are allowed for profile images!"), false);
  }
};

const resumeFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOC/DOCX files are allowed for resumes!"), false);
  }
};

const studyMaterialFilter = (req, file, cb) => {
  if (file.fieldname === "file" && file.mimetype === "application/pdf") {
    cb(null, true);
  } else if (file.fieldname === "thumbnail" && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("File must be a PDF for 'file' or an image for 'thumbnail'!"), false);
  }
};

export const uploadProfileImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: profileImageFilter,
});

export const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: resumeFilter,
});

export const uploadStudyMaterial = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: studyMaterialFilter,
});