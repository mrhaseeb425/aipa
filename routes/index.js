import express from "express";
const router = express.Router();
// Controllers
import assessmentController from "../Controller/assessmentController.js";
import assessmentDetailsController from "../Controller/assessmentDetailsController.js";
import assessmentImagesController from "../Controller/assessmentImagesController.js";
import authController from "../Controller/authController.js";
import businessesController from "../Controller/businessesController.js";
import categoriesController from "../Controller/categoriesController.js";
import questionController from "../Controller/questionController.js";
import taskController from "../Controller/taskController.js";
import userController from "../Controller/usersController.js";
import dashboardController from "../Controller/dashboardController.js";

// Middleware
import verifyToken from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";

// Home
router.get("/", (req, res) => {
  res.send("Users page");
});

// Test Email
router.get("/test-email", (req, res) => {
  res.render("forget_password_email_template", {
    title: "Express",
    otp: "167642",
    expiry: 6,
  });
});

//  AUTH
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/resendPasswordResetOtp", authController.resendPasswordResetOtp);
router.post("/checkOtpEmailRoute", authController.checkOtpEmailRoute);
router.post("/changePassword", authController.changePassword);
router.post("/forgotPassword", authController.forgotPassword);

// USER
router.get("/get-my-user", verifyToken, userController.getMyUser);
router.get("/get-user", verifyToken, authController.getUser);
router.get("/all-users", verifyToken, userController.getAllUsers);
router.get("/user/:id", verifyToken, userController.getUserById);
router.put("/updateUser/:id", verifyToken, userController.updateUser);
router.post("/create-user", verifyToken, userController.createUser);
router.delete(
  "/adminDeleteUser/:id",
  verifyToken,
  userController.adminDeleteUser,
);
router.post("/uploadProfilePic", verifyToken, userController.uploadProfilePic);

//  EMAIL
import emailRouter from "./email.js";
router.use("/email", emailRouter);

//  TASK
router.post("/createTask", verifyToken, taskController.createTask);
router.get("/getTask", verifyToken, taskController.getTask);
router.put("/updateTask/:id", verifyToken, taskController.updateTask);
router.delete("/deleteTask/:id", verifyToken, taskController.deleteTask);

// BUSINESS CONTROLLERS AND ROUTES
router.get(
  "/statesBusinesses",
  verifyToken,
  businessesController.statesBusinesses,
);

router.put("/updateBusiness/:id", businessesController.updateBusiness);

router.post("/createBusiness", businessesController.createBusiness);
router.get("/getAllBusinesses", businessesController.getAllBusinesses);
router.delete("/deleteBusiness/:id", businessesController.deleteBusiness);

// ASSESSMENT Controllers and Routes
router.post(
  "/createAssessment",
  verifyToken,
  assessmentController.createAssessment,
);

router.post(
  "/fillAssessmentAnswers",
  upload.any(),
  assessmentController.fillAssessmentAnswers,
);

router.get(
  "/getAssessment/:id",
  verifyToken,
  assessmentController.getAssessment,
);

router.get(
  "/get-all-assessments",
  verifyToken,
  assessmentController.getAllAssessmentsWithDetails,
);

router.get(
  "/getAssessmentReport/:id",
  verifyToken,
  assessmentController.getAssessmentReport,
);

router.put(
  "/assessment/:id",
  verifyToken,
  assessmentController.updateAssessment,
);

router.delete(
  "/deleteAssessment/:id",
  verifyToken,
  assessmentController.deleteAssessment,
);

//  CATEGORIES
router.post(
  "/create-category",
  verifyToken,
  categoriesController.createCategories,
);
router.get(
  "/categories/all",
  verifyToken,
  categoriesController.getAllCategories,
);
router.get("/categories", categoriesController.getCategories);
router.delete("/delete-category/:id", categoriesController.deleteCategory);
router.put("/update-category/:id", categoriesController.updateCategory);
router.post(
  "/single-create-category",
  categoriesController.singleCreateCategory,
);

// QUESTIONS
router.post("/createQuestion", questionController.createQuestion);
router.get("/getQuestions/:id", questionController.getQuestion);
router.get("/getAllQuestions", questionController.getAllQuestions);
router.get("/getQuestions", questionController.getQuestions);
router.get("/questions", questionController.getAllQuestions);
router.put("/update-question/:id", questionController.updateQuestion);

router.get(
  "/getQuestions/category/:id",
  questionController.getQuestionsByCategory,
);
router.delete("/deleteQuestion/:id", questionController.deleteQuestion);

//  ASSESSMENT DETAILS CONTROLLER
router.post("/save-details", assessmentDetailsController.saveAssessmentDetails);

router.get("/getAllAssessments", assessmentDetailsController.getAllAssessments);
router.delete(
  "/deleteAssessmentDetail/:id",
  assessmentDetailsController.deleteAssessmentDetail,
);
router.put("/updateAssessment/:id",assessmentDetailsController.updateAssessment);


// DASHBOARD
router.get("/dashboard-stats", dashboardController.getDashboardStats);

// ASSESSMENT Images
router.post(
  "/uploadAssessmentImages",
  verifyToken,
  upload.array("pics", 4),
  assessmentImagesController.uploadAssessmentImages,
);

export default router;
