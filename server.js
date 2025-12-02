import express from "express";
import cors from "cors";
import 'dotenv/config';
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import PDFDocument from 'pdfkit';

// ⚠️ DÉSACTIVER VÉRIFICATION SSL (POUR DEV LOCAL SEULEMENT SI ERREUR CERTIFICAT)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// CHECK ENV VARIABLES
if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
  console.error("❌ ERREUR CRITIQUE: TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID manquant dans le fichier .env");
  console.error("   Veuillez créer un fichier .env à la racine avec ces variables.");
} else {
  console.log("✅ Configuration Telegram chargée avec succès.");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage });

// ✅ PAGE TEST
app.get("/", (req, res) => {
  res.send("✅ Premium VTC IDF Backend is running");
});

// ✅ TEST TELEGRAM
app.get("/api/test-telegram", async (req, res) => {
  const result = await sendTelegram("🔔 Test de notification depuis le serveur.");
  res.json(result);
});

// ✅ SERVE PDF FILES FOR DOWNLOAD
app.get("/api/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Erreur téléchargement:", err);
      }
    });
  } else {
    res.status(404).send("Fichier non trouvé");
  }
});

// ✅ FONCTION D'ENVOI TELEGRAM
async function sendTelegram(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("⚠️ Telegram Token or Chat ID missing in .env");
    return { ok: false, error: "Missing credentials" };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return { ok: false, error: error.message || error.toString() };
  }
}

// ✅ FONCTION D'ENVOI PHOTO TELEGRAM
async function sendTelegramPhoto(caption, filePath) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${token}/sendPhoto`;

  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('caption', caption);
  formData.append('photo', fs.createReadStream(filePath));

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("Error sending Telegram photo:", error);
    return { ok: false, error: error.message || error.toString() };
  }
}

// ✅ FONCTION D'ENVOI DOCUMENT TELEGRAM
async function sendTelegramDocument(caption, filePath) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${token}/sendDocument`;

  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('caption', caption);
  formData.append('document', fs.createReadStream(filePath));

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("Error sending Telegram document:", error);
    return { ok: false, error: error.message || error.toString() };
  }
}

// ✅ GÉNÉRATION PDF RÉSERVATION
function generateReservationPDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filename = `Reservation_${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, filename);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('ALKawthar Drive - Réservation', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    // Details
    doc.fontSize(14).text('Détails du Client:', { underline: true });
    doc.fontSize(12).text(`Nom: ${data.nom}`);
    doc.text(`Email: ${data.email}`);
    doc.text(`Téléphone: ${data.telephone}`);
    doc.moveDown();

    // Details Trajet
    doc.fontSize(14).text('Détails du Trajet:', { underline: true });
    doc.text(`Départ: ${data.depart}`);
    doc.text(`Arrivée: ${data.arrivee}`);
    doc.text(`Date Prévue: ${data.date}`);
    doc.text(`Passagers: ${data.passagers || 'Non spécifié'}`);
    doc.moveDown();

    // Paiement
    doc.fontSize(14).text('Paiement:', { underline: true });
    doc.text(`Prix: ${data.prix}`);
    doc.text(`Mode de paiement: ${data.payment}`);
    doc.moveDown();

    doc.fontSize(10).text('Merci de votre confiance. ALKawthar Drive.', { align: 'center', margin: 50 });

    doc.end();

    stream.on('finish', () => resolve({ filePath, filename }));
    stream.on('error', (err) => reject(err));
  });
}


// ✅ NOTIFICATION APRÈS CLIC SUR "CALCULER"
app.post("/api/calculate", async (req, res) => {
  try {
    const { depart, arrivee, prix } = req.body;

    await sendTelegram(
      `🧮 NOUVEAU CALCUL\n\n📍 Départ: ${depart}\n📍 Arrivée: ${arrivee}\n💰 Prix estimé: ${prix}`
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur TELEGRAM calcul:", error);
    res.status(500).json({ success: false });
  }
});

// ✅ NOTIFICATION APRÈS CLIC SUR "RÉSERVER"
app.post("/api/reservation", async (req, res) => {
  try {
    const { nom, email, telephone, depart, arrivee, date, prix, payment, passagers } = req.body;

    // 1. Send Text Notification
    await sendTelegram(
      `✅ NOUVELLE RÉSERVATION\n\n👤 Nom: ${nom}\n📧 Email: ${email}\n📞 Téléphone: ${telephone}\n📍 Départ: ${depart}\n📍 Arrivée: ${arrivee}\n🕒 Date: ${date}\n👥 Passagers: ${passagers}\n💰 Prix: ${prix}\n💳 Paiement: ${payment}`
    );

    // 2. Generate PDF
    const { filePath, filename } = await generateReservationPDF({ nom, email, telephone, depart, arrivee, date, prix, payment, passagers });

    // 3. Send PDF via Telegram
    await sendTelegramDocument("📄 Bon de Réservation", filePath);

    // 4. Return success with download URL
    res.json({
      success: true,
      pdfUrl: `/api/download/${filename}`
    });

  } catch (error) {
    console.error("Erreur TELEGRAM réservation:", error);
    res.status(500).json({ success: false });
  }
});

// ✅ INSCRIPTION CHAUFFEUR
app.post("/api/chauffeur", upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'carteGrise', maxCount: 1 },
  { name: 'assurance', maxCount: 1 },
  { name: 'vehicule', maxCount: 1 }
]), async (req, res) => {
  try {
    const { nom, telephone } = req.body;
    const files = req.files;

    await sendTelegram(
      `🚖 NOUVELLE CANDIDATURE CHAUFFEUR\n\n👤 Nom: ${nom}\n📞 Téléphone: ${telephone}`
    );

    if (files['photo']) await sendTelegramPhoto('📷 Photo du chauffeur', files['photo'][0].path);
    if (files['carteGrise']) await sendTelegramDocument('📄 Carte Grise', files['carteGrise'][0].path);
    if (files['assurance']) await sendTelegramDocument('📄 Assurance', files['assurance'][0].path);
    if (files['vehicule']) await sendTelegramPhoto('🚗 Véhicule', files['vehicule'][0].path);

    // Cleanup uploaded files
    for (const key in files) {
      if (files[key] && files[key][0]) {
        cleanupFile(files[key][0].path);
      }
    }

    res.json({ success: true, message: "Candidature envoyée avec succès" });

  } catch (error) {
    console.error("Erreur inscription chauffeur:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ FONCTION DE NETTOYAGE
function cleanupFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Fichier temporaire supprimé: ${filePath}`);
    } catch (err) {
      console.error(`⚠️ Erreur suppression fichier ${filePath}:`, err);
    }
  }
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});