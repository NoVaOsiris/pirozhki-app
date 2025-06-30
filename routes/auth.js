const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/login", async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findOne({ name, password });
  if (!user) return res.status(401).json({ error: "Неверные данные" });
  res.json({ success: true, role: user.role, point: user.point });
});
module.exports = router;
