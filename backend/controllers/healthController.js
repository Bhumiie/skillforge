// Handles the root health-check route
export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillSwap API Running",
  });
};
