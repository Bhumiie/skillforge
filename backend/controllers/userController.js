import mongoose from "mongoose";
import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      profilePic,
      college,
      location,
      bio,
      skillsOffered,
      skillsWanted,
      github,
      linkedin,
      degree,
      graduationYear,
      portfolio,
      resume,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = name ?? user.name;
    user.profilePic = profilePic ?? user.profilePic;
    user.college = college ?? user.college;
    user.location = location ?? user.location;
    user.bio = bio ?? user.bio;
    user.skillsOffered = skillsOffered ?? user.skillsOffered;
    user.skillsWanted = skillsWanted ?? user.skillsWanted;
    user.github = github ?? user.github;
    user.linkedin = linkedin ?? user.linkedin;
    user.degree = degree ?? user.degree;
    user.graduationYear = graduationYear ?? user.graduationYear;
    user.portfolio = portfolio ?? user.portfolio;
    user.resume = resume ?? user.resume;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getUserProfileDetails = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Fetch projects using dynamic model resolution
    const Project = mongoose.model("Project");
    const createdProjects = await Project.find({ owner: userId }).populate("owner members", "name profilePic email");
    const joinedProjects = await Project.find({ members: userId }).populate("owner members", "name profilePic email");

    // Fetch hackathons using dynamic model resolution
    const Hackathon = mongoose.model("Hackathon");
    const createdHackathons = await Hackathon.find({ owner: userId }).populate("owner participants", "name profilePic email");
    const joinedHackathons = await Hackathon.find({ participants: userId }).populate("owner participants", "name profilePic email");

    // Fetch connections count
    const Connection = mongoose.model("Connection");
    const connectionsCount = await Connection.countDocuments({
      status: "accepted",
      $or: [{ sender: userId }, { receiver: userId }]
    });

    res.json({
      success: true,
      user,
      projects: {
        created: createdProjects,
        joined: joinedProjects,
      },
      hackathons: {
        created: createdHackathons,
        joined: joinedHackathons,
      },
      stats: {
        projectsCreated: createdProjects.length,
        projectsJoined: joinedProjects.length,
        hackathonsJoined: createdHackathons.length + joinedHackathons.length,
        connections: connectionsCount,
        skillsCount: user.skillsOffered?.length || 0,
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};