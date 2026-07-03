import Hackathon from "../models/Hackathon.js";

// Create Hackathon
export const createHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.create({
      ...req.body,
      owner: req.user.id,
    });

    res.status(201).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Hackathons
export const getHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(hackathons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Hackathon
export const getHackathonById = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate("owner", "name email")
      .populate("participants", "name email");

    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Hackathon
export const updateHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    if (hackathon.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    Object.assign(hackathon, req.body);

    await hackathon.save();

    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Hackathon
export const deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    if (hackathon.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await hackathon.deleteOne();

    res.json({ message: "Hackathon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join Hackathon
export const joinHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    if (hackathon.status === "Closed") {
      return res.status(400).json({ message: "Hackathon is closed" });
    }

    if (hackathon.owner.toString() === req.user.id) {
      return res.status(400).json({
        message: "Owner cannot join their own hackathon",
      });
    }

    if (
      hackathon.participants.some(
        (id) => id.toString() === req.user.id
      )
    ) {
      return res.status(400).json({
        message: "Already joined this hackathon",
      });
    }

    hackathon.participants.push(req.user.id);

    await hackathon.save();
    await hackathon.populate("owner", "name email");
    await hackathon.populate("participants", "name email");

    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave Hackathon
export const leaveHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    if (hackathon.owner.toString() === req.user.id) {
      return res.status(400).json({
        message: "Owner cannot leave their own hackathon. Delete it instead.",
      });
    }

    if (
      !hackathon.participants.some(
        (id) => id.toString() === req.user.id
      )
    ) {
      return res.status(400).json({
        message: "You are not a participant in this hackathon",
      });
    }

    hackathon.participants = hackathon.participants.filter(
      (id) => id.toString() !== req.user.id
    );

    await hackathon.save();
    await hackathon.populate("owner", "name email");
    await hackathon.populate("participants", "name email");

    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};