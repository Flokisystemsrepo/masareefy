import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import TicketController from "../controllers/TicketController";
import { adminAuth, requirePermission } from "../middleware/adminAuth";

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads/tickets");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and PDFs are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files
  },
});

// Public routes (no authentication required)
router.post(
  "/create",
  upload.array("attachments", 5),
  TicketController.createTicket.bind(TicketController)
);

// User routes (authentication required)
router.get(
  "/user/:userId",
  TicketController.getUserTickets.bind(TicketController)
);

// Admin routes (authentication required)
router.get(
  "/admin/all",
  adminAuth,
  requirePermission("tickets.read"),
  TicketController.getAllTickets.bind(TicketController)
);
router.get(
  "/admin/stats",
  adminAuth,
  requirePermission("tickets.read"),
  TicketController.getTicketStats.bind(TicketController)
);
router.get(
  "/admin/:id",
  adminAuth,
  requirePermission("tickets.read"),
  TicketController.getTicketById.bind(TicketController)
);
router.put(
  "/admin/:id/status",
  adminAuth,
  requirePermission("tickets.write"),
  TicketController.updateTicketStatus.bind(TicketController)
);
router.post(
  "/admin/:id/response",
  adminAuth,
  requirePermission("tickets.write"),
  upload.array("attachments", 5),
  TicketController.addResponse.bind(TicketController)
);

// Serve uploaded files
router.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

export default router;
