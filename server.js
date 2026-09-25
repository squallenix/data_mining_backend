import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import { connectDB } from "./config/db.js";
import router from "./route.js";
import { errorHandler } from "./v1/middleware/error.middleware.js";
const app = express();
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 8000;
// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// routes
app.use(router);

// test route
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.get("/api/v1", (req, res) => {
  res.json({ message: "API v1 working ✅" });
});

// Must stay the LAST middleware: Express only searches forward from where
// next(err) is called, so registering it above the routes made every handled
// error (Joi 400, duplicate-key 409) fall through to the default 500.
app.use(errorHandler);

// start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log("🚀 Server running on port", port);
    });
  } catch (err) {
    console.error("❌ Server start failed:", err.message);
  }
};

startServer();
