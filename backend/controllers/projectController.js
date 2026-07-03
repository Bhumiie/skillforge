import Project from "../models/Project.js";
import User from "../models/User.js";

export const createProject = async (req, res) => {
  try {
    const { title, description, technologies, difficulty, maxMembers } = req.body;

    if (!title || !description || !difficulty || !maxMembers) {
      return res.status(400).json({
        success: false,
        message: "Title, description, difficulty, and maxMembers are required",
      });
    }

    const project = await Project.create({
      title,
      description,
      technologies: technologies || [],
      difficulty,
      owner: req.user.id,
      members: [],
      maxMembers,
      status: "Open",
    });

    await project.populate("owner", "name email profilePic");

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const { search, technology, difficulty, openSlots, status, sortBy } = req.query;

    const query = {};

    // 1. Search Query
    if (search) {
      const users = await User.find({ name: { $regex: search, $options: "i" } }).select("_id");
      const ownerIds = users.map(u => u._id);

      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { technologies: { $regex: search, $options: "i" } }
      ];

      if (ownerIds.length > 0) {
        query.$or.push({ owner: { $in: ownerIds } });
      }
    }

    // 2. Filter Difficulty
    if (difficulty && difficulty !== "All") {
      query.difficulty = difficulty;
    }

    // 3. Filter Technology/Skills
    if (technology && technology !== "All") {
      query.technologies = { $regex: `^${technology}$`, $options: "i" };
    }

    // 4. Filter Status
    if (status && status !== "All") {
      query.status = status;
    }

    // 5. Filter Open Slots
    if (openSlots === "true") {
      query.$expr = { $lt: [{ $size: "$members" }, "$maxMembers"] };
    }

    let projects;
    
    // Sort logic
    let sortObj = { createdAt: -1 }; // default newest
    if (sortBy === "oldest") {
      sortObj = { createdAt: 1 };
    }

    if (sortBy === "most_members" || sortBy === "least_members") {
      const sortOrder = sortBy === "most_members" ? -1 : 1;
      
      const aggregatePipeline = [
        { $match: query },
        {
          $addFields: {
            membersCount: { $size: "$members" }
          }
        },
        { $sort: { membersCount: sortOrder, createdAt: -1 } }
      ];

      const rawProjects = await Project.aggregate(aggregatePipeline);
      projects = await Project.populate(rawProjects, [
        { path: "owner", select: "name email profilePic" },
        { path: "members", select: "name email profilePic" }
      ]);
    } else {
      projects = await Project.find(query)
        .populate("owner", "name email profilePic")
        .populate("members", "name email profilePic")
        .sort(sortObj);
    }

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email profilePic")
      .populate("members", "name email profilePic");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { title, description, technologies, difficulty, maxMembers, status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this project",
      });
    }

    project.title = title ?? project.title;
    project.description = description ?? project.description;
    project.technologies = technologies ?? project.technologies;
    project.difficulty = difficulty ?? project.difficulty;
    project.maxMembers = maxMembers ?? project.maxMembers;
    project.status = status ?? project.status;

    await project.save();
    await project.populate("owner", "name email profilePic");
    await project.populate("members", "name email profilePic");

    res.json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this project",
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const joinProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot join your own project",
      });
    }

    if (project.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this project",
      });
    }

    if (project.members.length >= project.maxMembers) {
      return res.status(400).json({
        success: false,
        message: "This project is already full",
      });
    }

    if (project.status !== "Open") {
      return res.status(400).json({
        success: false,
        message: "This project is not accepting new members",
      });
    }

    project.members.push(req.user.id);

    if (project.members.length >= project.maxMembers) {
      project.status = "Full";
    }

    await project.save();
    await project.populate("owner", "name email profilePic");
    await project.populate("members", "name email profilePic");

    res.json({
      success: true,
      message: "Successfully joined the project",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const leaveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot leave your own project. Delete it instead.",
      });
    }

    if (!project.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    project.members = project.members.filter(
      (memberId) => memberId.toString() !== req.user.id
    );

    if (project.status === "Full" && project.members.length < project.maxMembers) {
      project.status = "Open";
    }

    await project.save();
    await project.populate("owner", "name email profilePic");
    await project.populate("members", "name email profilePic");

    res.json({
      success: true,
      message: "Successfully left the project",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
