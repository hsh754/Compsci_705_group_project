import express from "express";
import dotenv from "dotenv";
import routes from "./routes/routes.js";
import connectDB from "./config/db.js";
import cors from "cors";


dotenv.config();
if (process.env.MOCK === 'true') {
  console.log('Server running in MOCK mode: skipping MongoDB connection');
} else {
  connectDB();
}

const app = express();

// CORS configuration: allow frontend dev server and handle preflight
const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};
app.use(cors(corsOptions));
// Ensure OPTIONS preflight gets the proper headers for any route
// Note: In Express 5, do not use wildcard string in route for options handler.
// Preflight will be handled automatically by the above cors middleware.

app.use(express.json());

app.use("/api", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
