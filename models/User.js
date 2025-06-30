const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: String,
  password: String,
  role: { type: String, enum: ["admin", "seller"], default: "seller" },
  point: String
});
module.exports = mongoose.model("User", UserSchema);
