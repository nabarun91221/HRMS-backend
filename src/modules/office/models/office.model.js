
import mongoose from "mongoose";

const officeSchema = new mongoose.Schema({
    name: String,

    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },

    allowedRadius: {
        type: Number, // in meters
        default: 200,
    },
});

officeSchema.index({ location: "2dsphere" });

export default mongoose.model("Office", officeSchema);