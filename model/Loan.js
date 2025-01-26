
import mongoose from "mongoose"
const LoanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Wedding", "Home Construction", "Business Startup", "Education"],
  },
  subcategory: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  period: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  initialDeposit: Number,
  guarantors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guarantor",
    },
  ],
  additionalDetails: {
    statementFile: String,
    salarySheetFile: String,
  },
  tokenNumber: String,
  appointmentDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Loan = mongoose.model("Loan", LoanSchema);
export default Loan;

