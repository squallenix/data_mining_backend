import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[DB] MongoDB Connected");
  } catch (error) {
    console.error("[DB] DB Connection Failed:", error.message);
    process.exit(1);
  }
};
