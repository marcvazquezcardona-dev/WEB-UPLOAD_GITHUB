const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Permetre peticions des del navegador
app.use(cors());

// Servir fitxers estàtics (frontend)
app.use(express.static(path.join(__dirname, "public")));

// Assegurar que existeixen les carpetes d'uploads
const videosDir = path.join(__dirname, "uploads", "videos");
const docsDir = path.join(__dirname, "uploads", "docs");

[videosDir, docsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuració de Multer per guardar segons el tipus
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.path.includes("video")) {
      cb(null, videosDir);
    } else if (req.path.includes("doc")) {
      cb(null, docsDir);
    } else {
      cb(new Error("Ruta no vàlida"), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, base + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// Rutes per penjar fitxers
app.post("/upload/video", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Cap fitxer rebut" });
  }
  res.json({
    message: "Vídeo pujat correctament",
    filename: req.file.filename,
    url: `/videos/${req.file.filename}`,
  });
});

app.post("/upload/doc", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Cap fitxer rebut" });
  }
  res.json({
    message: "Document pujat correctament",
    filename: req.file.filename,
    url: `/docs/${req.file.filename}`,
  });
});

// Servir els fitxers pujats
app.use("/videos", express.static(videosDir));
app.use("/docs", express.static(docsDir));

// Llistar vídeos
app.get("/files/videos", (req, res) => {
  fs.readdir(videosDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Error llistant vídeos" });
    res.json(files);
  });
});

// Llistar documents
app.get("/files/docs", (req, res) => {
  fs.readdir(docsDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Error llistant docs" });
    res.json(files);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escoltant a http://localhost:${PORT}`);
});
