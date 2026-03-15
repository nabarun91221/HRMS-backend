
import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
    personalMail: {
        type: String,
        required: true
    },
    otp: {
        type: Number
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 15 * 60
    }

});

OtpSchema.pre("save", function ()
{
    this.otp = Math.floor(1000 + Math.random() * 9000);
})

export default mongoose.model("Otp", OtpSchema);