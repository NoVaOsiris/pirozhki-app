const mongoose = require("mongoose");
const StockSchema = new mongoose.Schema({
  point: String,
  date: String,
  evening: Object,
  incoming: Object,
  move: Object,
  writeoff: Object,
  remainder: Object
});
module.exports = mongoose.model("Stock", StockSchema);
