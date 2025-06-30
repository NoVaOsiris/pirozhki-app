const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.post("/", async (req, res) => {
  const { name, price } = req.body;
  const prod = await Product.create({ name, price });
  res.json(prod);
});
module.exports = router;
