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
const phoneRegex = /^\d{7,15}$/;
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

    app.get("/search", async function (req, res) {
      try {
        var q = req.query.q || "";
        q = q.trim();
    
        if (!q) {
          var everyLesson = await Lessons.find({}).toArray();
          return res.json(everyLesson);
        }
    
        function cleanupRegex(str) {
          return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
    
        let safe = cleanupRegex(q);
        let regex = new RegExp(safe, "i");
    
        let lessons = await Lessons.find({}).toArray();
    
        let results = lessons.filter(function (lesson) {
          let subjectMatch  = regex.test(String(lesson.subject  || ""));
          let locationMatch = regex.test(String(lesson.location || ""));
          let priceMatch    = regex.test(String(lesson.price    || ""));
          let spacesMatch   = regex.test(String(lesson.spaces   || ""));
    
          return subjectMatch || locationMatch || priceMatch || spacesMatch;
        });
    
        res.json(results);
      } catch (err) {
        console.log("GET /search error:", err);
        res.status(500).json({ error: "Search failed!!!!!!" });
      }
    });


    app.post("/orders", async function (req, res) {
      try {
        var body = req.body
    
        if (!validName(body.name)) {
          return res.status(400).json({ error: "invalid name" });
        }
    
        if (!validPhone(body.phone)) {
          return res.status(400).json({ error: "invalid phone" });
        }
    
        if (!Array.isArray(body.items) || body.items.length === 0) {
          return res.status(400).json({ error: "items required" });
        }
    
        var cleanItems = body.items.map(function (it) {
          return {
            lessonId: new ObjectId(String(it.lessonId)),
            spaces: Number(it.spaces)
          };
        });
    
        var doc = {
          name: body.name,
          phone: body.phone,
          items: cleanItems,
          createdAt: new Date()
        };
    
        let result = await Orders.insertOne(doc);
        res.status(201).json({
          message: "order saved! ~iokitracing",
          orderId: result.insertedId
        });
    
      } catch (err) {
        res.status(500).json({ error: "could not save order" });
      }
    });

    app.put("/lessons/:id", async function (req, res) {
      try {
        var id = req.params.id;
        let body = req.body;
        let upd = body.update;
    
        if (!upd) {
          return res.status(400).json({ error: 'nulll on body!! fix??' });
        }
    
        var allowed = ["subject", "location", "price", "spaces", "icon"];
        let setObj = {};
    
        for (let key in upd) {
          if (allowed.indexOf(key) === -1) {
            return res.status(400).json({ error: "field not allowed: " + key });
          }
          setObj[key] = upd[key];
        }
    
        let result = await Lessons.updateOne(
          { _id: new ObjectId(id) },
          { $set: setObj }
        );
    
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "lesson not found!!" });
        }
    
        res.json({ message: "lesson updated", modified: result.modifiedCount }); // NEW
    
      } catch (err) {
        res.status(500).json({ error: "could not update lesson" });
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
