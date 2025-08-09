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

app.use(cors());
app.use(express.json());

app.use("/api", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
