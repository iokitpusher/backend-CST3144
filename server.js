import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

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