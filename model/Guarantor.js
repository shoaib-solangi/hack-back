import mongoose from "mongoose";
const GuarantorSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cnic: {
    type: String,
    required: true,
  },
  location: String,
  phoneNumber: String,
})

const  Guarantor = mongoose.model("Guarantor", GuarantorSchema);
export default Guarantor;
