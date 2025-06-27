import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, // e.g., "IN", "US"
});


const Country = mongoose.model("Country", countrySchema)
export default Country
