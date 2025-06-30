const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const salesRoutes = require("./routes/sales");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/sales", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/auth", authRoutes);
app.use("/sales", salesRoutes);
app.use("/products", productRoutes);

app.listen(3000, () => console.log("Server started on http://localhost:3000"));
