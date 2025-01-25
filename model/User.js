import mongoose , {Schema} from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const Data = process.env.Data_URL;
console.log(Data);

mongoose.connect(Data).then(() => {
    console.log("======= coneected========");
    
}).catch(() => {
    console.log("======= connection failed=======");
    
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
    password: {
        type: String,
        required : true,
    },
    isVerifired: {
        type: Boolean,
        
    }
})

const User = mongoose.model("user", userSchema)
export default User;