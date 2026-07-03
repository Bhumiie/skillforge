import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    profilePic: {
        type: String,
        default: "",
    },

    college: {
        type: String,
        default: "",
    },

    location: {
        type: String,
        default: "",
    },

    bio: {
        type: String,
        default: "",
    },

    skillsOffered: [
        {
            type: String,
        },
    ],

    skillsWanted: [
        {
            type: String,
        },
    ],

    github: {
        type: String,
        default: "",
    },

    linkedin: {
        type: String,
        default: "",
    },

    degree: {
        type: String,
        default: "",
    },

    graduationYear: {
        type: String,
        default: "",
    },

    portfolio: {
        type: String,
        default: "",
    },

    resume: {
        type: String,
        default: "",
    },
},
{
    timestamps: true,
}
);

export default mongoose.model("User", userSchema);