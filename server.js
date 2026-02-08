const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // თუ index.html / style.css აქაა

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Database simulation (json file)
const DB_FILE = path.join(__dirname, "db.json");
const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// --- Customer Routes ---
app.get("/customers", (req, res) => {
  const db = readDB();
  res.json(db.customers);
});

app.post("/customers", upload.single("photo"), (req, res) => {
  const db = readDB();
  const { name, address, jobType, description } = req.body;
  const photo = req.file ? req.file.filename : null;

  const newCustomer = {
    id: Date.now(),
    name,
    address,
    jobType,
    description,
    photo,
  };

  db.customers.push(newCustomer);
  writeDB(db);

  res.status(201).json(newCustomer);
});

// --- Handyman Routes ---
app.get("/handymen", (req, res) => {
  const db = readDB();
  res.json(db.handymen);
});

app.post("/handymen", (req, res) => {
  const db = readDB();
  const { name, specialty, phone, whatsapp, viber, email } = req.body;

  const newHandyman = {
    id: Date.now(),
    name,
    specialty,
    phone,
    whatsapp,
    viber,
    email,
    rating: 0,
  };

  db.handymen.push(newHandyman);
  writeDB(db);

  res.status(201).json(newHandyman);
});

// Update handyman rating
app.patch("/handymen/:id/rating", (req, res) => {
  const db = readDB();
  const handyman = db.handymen.find(h => h.id == req.params.id);
  if (!handyman) return res.status(404).json({ error: "Handyman not found" });

  const { rating } = req.body;
  handyman.rating = rating;
  writeDB(db);

  res.json(handyman);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
