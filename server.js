import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(cors()); //for now lets test frontedn fully functional etc

app.get("/", (_req, res) => {
  res.send("ok");
});

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log("server listening on", PORT);
    });
  } catch (err) {
    console.error("failed to start:", err.message);
    process.exit(1);
  }
})();