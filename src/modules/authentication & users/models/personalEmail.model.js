import { Schema, model } from "mongoose"
const schema = new Schema({
    userId: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
}
)
export default model("PersonalEmail", schema)
