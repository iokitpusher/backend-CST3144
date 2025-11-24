import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db.js";
import { getDB, ObjectId } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(cors()); // for now lets test frontend fully functional etc

app.get("/", (_req, res) => {
  res.send("ok");
});

const nameRegex = /^[A-Za-z\s]+$/;
const phoneRegex = /^\d{7,15}/;
const validName = (s) => nameRegex.test(s || "");
const validPhone = (s) => phoneRegex.test(s || "");

let Lessons;
let Orders;

(async () => {
  try {
    await connectDB();
    /* ************ DB init ********** */
    const db = getDB();
    Lessons = db.collection("lessons");
    Orders  = db.collection("orders");

    // **** Routes ****
    app.get("/lessons", async (_req, res) => {
      try {
        const data = await Lessons.find({}).toArray();
        return res.json(data);
      } catch (err) {
        console.error("GET /lessons error:", err);
        return res.status(500).json({ error: "Failed to fetch lessons" });
      }
    });

    app.listen(PORT, () => {
      console.log("server listening on", PORT);
    });
  } catch (err) {
    console.error("failed to start:", err.message);
    process.exit(1);
  }
})();
