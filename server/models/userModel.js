import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: { type: String, enum: ["admin", "placement_officer", "training_team", "student"], required: true, default: "student" },
    profileImage: { type: String, default: null },
},
{ timestamps: true })

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;