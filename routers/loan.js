import express from "express";
import Loan from "../model/Loan.js";
import Guarantor from "../model/Guarantor.js";
import Appointment from "../model/Appointment.js";
import auth from "../middleware/auth.js";
import { generateQRCode } from "../utils/qrCodeGenerator.js";
import  scheduleAppointment  from "../utils/appointmentScheduler.js";
import Joi from "joi";

const router = express.Router();

// Validation schema
const loanRequestSchema = Joi.object({
  category: Joi.string().required(),
  subcategory: Joi.string().required(),
  amount: Joi.number().min(1000).required(),
  period: Joi.number().min(1).max(5).required(),
  guarantors: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        location: Joi.string().required(),
        cnic: Joi.string()
          .regex(/^[0-9]{5}-[0-9]{7}-[0-9]$/)
          .required(),
      })
    )
    .min(2)
    .required(),
  additionalDetails: Joi.string().optional(),
});

// POST: Submit loan request
router.post("/request", auth, async (req, res) => {
  try {
    // Validate request body
    const { error } = loanRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { category, subcategory, amount, period, guarantors, additionalDetails } = req.body;

    // Create guarantors and save their IDs
    const guarantorIds = [];
    for (const g of guarantors) {
      const guarantor = new Guarantor(g);
      await guarantor.save();
      guarantorIds.push(guarantor._id);
    }

    // Schedule appointment
    const appointment = await scheduleAppointment();

    // Create and save loan
    const loan = new Loan({
      user: req.user.id,
      category,
      subcategory,
      amount,
      period,
      guarantors: guarantorIds,
      additionalDetails,
      appointmentDetails: appointment._id,
    });

    await loan.save();

    res.status(201).json({ message: "Loan request submitted successfully", loanId: loan._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET: Fetch loan details
router.get("/details/:id", auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("user", "name email")
      .populate("guarantors")
      .populate("appointmentDetails");

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(loan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET: Generate slip with QR code and appointment details
router.get("/generate-slip/:id", auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate("appointmentDetails");
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Generate QR code
    const qrCode = await generateQRCode(
      JSON.stringify({
        loanId: loan._id,
        appointmentId: loan.appointmentDetails._id,
      })
    );

    // Update appointment with QR code
    await Appointment.findByIdAndUpdate(loan.appointmentDetails._id, { qrCode });

    res.json({
      tokenNumber: loan.tokenNumber,
      appointmentDate: loan.appointmentDetails.date,
      appointmentTime: loan.appointmentDetails.time,
      officeLocation: loan.appointmentDetails.officeLocation,
      qrCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
