import mongoose from "mongoose";

const stateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
});


const State = mongoose.model("State", stateSchema)
export default State
