const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");

router.post("/", async (req, res) => {
  const { seller, items } = req.body;
  const point = seller; // по имени точки
  await Sale.create({ seller, point, items });
  res.json({ success: true });
});

router.get("/report", async (req, res) => {
  const sales = await Sale.find();
  res.json(sales);
});
module.exports = router;
