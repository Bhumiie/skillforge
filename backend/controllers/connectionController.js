import Connection from "../models/Connection.js";

export const getReceivedRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      receiver: req.user.id,
      status: "pending",
    })
      .populate("sender", "name email profilePic college location")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (connection.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    connection.status = "accepted";
    await connection.save();

    res.json({
      success: true,
      message: "Connection request accepted",
      connection,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (connection.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to reject this request" });
    }

    connection.status = "rejected";
    await connection.save();

    res.json({
      success: true,
      message: "Connection request rejected",
      connection,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendConnectionRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ message: "You cannot send a connection request to yourself" });
    }

    const existingRequest = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "A pending connection request already exists" });
    }

    const connection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Connection request sent",
      connection,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
