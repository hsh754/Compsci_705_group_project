import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide a username"],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email address",
        ],
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 6,
        select: false, // The default query does not return passwords
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        index: true,
    },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);

export default User;
