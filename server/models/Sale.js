const mongoose = require("mongoose");
const SaleSchema = new mongoose.Schema({
  seller: String,
  point: String,
  items: Object,
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Sale", SaleSchema);
