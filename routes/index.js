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
router.get("/users", userController.getMyUser);
router.get("/user", verifyToken, authController.getUser);
router.put("/user", verifyToken, authController.updateUser);
router.delete(
  "/delete-account",
  verifyToken,
  userController.deleteUserAccount,
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

// BUSINESS
router.get(
  "/statesBusinesses",
  verifyToken,
  businessesController.statesBusinesses,
);

router.put(
  "/updateBusiness/:id",
  verifyToken,
  businessesController.updateBusiness,
);

router.post(
  "/createBusiness",
  verifyToken,
  businessesController.createBusiness,
);

// ASSESSMENT
router.post("/createAssessment", verifyToken, assessmentController.createAssessment);

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

// router.get("/get-action-list", verifyToken, assessmentController.getActionList);

//  CATEGORIES
router.post(
  "/createClientAssessment",
  verifyToken,
  categoriesController.createCategories,
);
router.get(
  "/categories/all",
  verifyToken,
  categoriesController.getAllCategories,
);
// QUESTIONS
router.post("/createQuestion", questionController.createQuestion);
router.get("/getQuestions/:id", questionController.getQuestion);
router.get("/getAllQuestions", questionController.getAllQuestions);

router.get(
  "/getQuestions/category/:id",
  questionController.getQuestionsByCategory,
);
router.delete("/deleteQuestion/:id", questionController.deleteQuestion);

//  ANSWERS
router.post("/save-details", assessmentDetailsController.saveAssessmentDetails);

router.get(
  "/getAllAssessments/:id",
  assessmentDetailsController.getAllAssessments,
);

// ASSESSMENT Images
router.post(
  "/uploadAssessmentImages",
  verifyToken,
  upload.array("pics", 4),
  assessmentImagesController.uploadAssessmentImages,
);

export default router;
