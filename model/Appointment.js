import mongoose from "mongoose";
const AppointmentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  officeLocation: {
    type: String,
    required: true,
  },
  qrCode: String,
})
const Appointment = mongoose.model("Appointment", AppointmentSchema)

export default Appointment 