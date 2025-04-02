

Place-Pro


A MERN-stack web application revolutionizing college placement preparation and management.

Overview
Place-Pro is a cutting-edge web platform designed to streamline the college placement process, connecting students, placement officers, and training teams. Built with the MERN stack (MongoDB, Express.js, React, Node.js), it offers a modular, scalable solution for managing job opportunities, training resources, and student preparation. With a focus on modularity, it ensures reusability, maintainability, and flexibility, while introducing innovative features like AI-driven tools and comprehensive training hubs. Developed by the Department of Computer Science, Nirmala College, Muvattupuzha, Place-Pro is targeted for completion between January and May 2025.

Problem Statement
The college placement process faces challenges such as inefficient job management, fragmented training resources, and inadequate student preparation tools. Place-Pro addresses these by providing an integrated platform that simplifies user management, enhances skill development, and automates key processes like interview assessments.

Features
For Students
Training Resources: Access downloadable study materials (PDFs) and videos (YouTube/uploaded).
Searchable Content: Filter resources by title, description, tags, or content.
Responsive UI: Tailwind CSS-powered design for all devices.
For Training Team
Resource Management: Upload, edit, and publish study materials and videos with draft/publish workflow.
Role-Based Access: Author-only edit/delete permissions.
Planned Features (Jan-May 2025)
AI-Powered Interviews: Automated evaluations with feedback.
Resume Reviews: AI and manual feedback for industry readiness.
Mock Tests: Scheduling and performance tracking.
Job Applications: Eligibility checks and application tracking.
Analytics & Reports: Detailed student performance insights.
Live Webinars & Blogs: Real-time training and career tips.
Modular Design
Place-Pro adopts a modular architecture, breaking the system into independent, reusable components:

Encapsulation: Modules expose APIs, hiding internal logic.
Abstraction: Clear interfaces simplify complexity.
Independence: Modules can be developed/tested separately.
Reusability: Generic modules reusable across projects.
Maintainability: Isolated updates minimize system-wide impact.
Flexibility: Easy integration of new features via APIs.
Modules
User Management: Handles registration, login, and role-based access (e.g., student, training_team) with JWT authentication.
Training Resource Management: Manages study materials and videos, with upload/edit features and student access.
Mock Test Management: (Planned) Schedules and evaluates mock tests.
Job Eligibility & Application Management: (Planned) Manages job postings and applications.
AI-Powered Robotic Interview: (Planned) Automates interview scoring and feedback.
Resume Checking Management: (Planned) Provides resume review tools.
Blogs & Career Tips: (Planned) Shares career guidance content.
Report Generation: (Planned) Generates performance analytics.
Notification: (Planned) Sends event alerts via email/in-app messages.
Tech Stack
Backend
Node.js & Express.js: RESTful API server.
MongoDB: Database for storing users, resources, etc.
Dependencies: bcryptjs (password hashing), jsonwebtoken (JWT), multer (file uploads), cloudinary (media storage), nodemailer (email).
Frontend
React.js: Dynamic UI with Vite build tool.
Tailwind CSS: Responsive styling.
Libraries: react-player (video playback), react-toastify (notifications), axios (API calls), react-router-dom (routing).
Installation
Prerequisites
Node.js: v16.x or higher
MongoDB: Local or cloud instance (e.g., MongoDB Atlas)
npm or yarn
Backend Setup
Clone the Repository:
bash

Collapse

Wrap

Copy
git clone https://github.com/your-username/place-pro.git
cd place-pro/backend
Install Dependencies:
bash

Collapse

Wrap

Copy
npm install
Set Up Environment Variables:
Create a .env file in backend/:
text

Collapse

Wrap

Copy
PORT=4000
MONGODB_URI=mongodb://localhost:27017/place-pro
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODEMAILER_EMAIL=your-email@example.com
NODEMAILER_PASSWORD=your-email-password
Run the Server:
bash

Collapse

Wrap

Copy
npm run server
Runs with nodemon on http://localhost:4000.
Frontend Setup
Navigate to Frontend:
bash

Collapse

Wrap

Copy
cd ../frontend
Install Dependencies:
bash

Collapse

Wrap

Copy
npm install
Set Up Environment Variables:
Create a .env file in frontend/:
text

Collapse

Wrap

Copy
VITE_BACKEND_URL=http://localhost:4000
Run the Development Server:
bash

Collapse

Wrap

Copy
npm run dev
Runs on http://localhost:5173 (default Vite port).
Usage
Students: Log in to access training videos and materials; use search bars to filter content.
Training Team: Log in to manage resources; upload PDFs/videos and publish for students.
Admins: (Planned) Manage users, approve AI interviews, and generate reports.