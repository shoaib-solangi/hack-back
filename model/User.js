import mongoose , {Schema} from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const Data = process.env.Data_URL;
console.log(Data);

mongoose.connect(Data).then(() => {
    console.log("======= coneected========");
    
}).catch((e) => {
    console.log("======= connection failed=======", e);
    
});



const userSchema = new Schema({
    name: {
        type: String,
        required : true,
    },
    email: {
        type: String,
        required : true,
    },
    Cnic: {
        type: String,
        required : true,
    },
    isVerifired: {
        type: Boolean,
        default: false,
        
    }
    , 
    password: {
        type : String,
    }
})

const User = mongoose.model("user", userSchema )
export default User;