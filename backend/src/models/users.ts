import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  profilePhotoUrl: {
    type: String, // Store the URL or file path to the uploaded profile photo
    default: '',
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  usernameAvailable: {
    type: Boolean,
    default: null, // Optional: used during validation only, usually not persisted
  },
  currentPassword: {
    type: String, // Usually not stored; used only during password change
    select: false,
  },
  newPassword: {
    type: String, // Hash this before saving
    required: true,
  },
  passwordStrength: {
    type: String,
    default: '',
  },
  profession: {
    type: String,
    default: '',
  },
  companyName: {
    type: String,
    default: '',
  },
  addressLine1: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''], // '' for unset
    default: '',
  },
  customGender: {
    type: String,
    default: '',
  },
  dob: {
    type: Date,
  },
  subscriptionPlan: {
    type: String,
    enum: ['Basic', 'Pro', 'Premium'], // Adjust based on allowed plans
    default: 'Basic',
  },
  newsletter: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});


const Users = mongoose.model("Users", userSchema)
export default Users
