const multer = require("multer");
const path = require("path");

// Définir le stockage en mémoire (Memory Storage)
const storage = multer.memoryStorage();

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  // Vérifie l'extension
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  // Vérifie le type MIME
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Seuls les formats JPEG, JPG, PNG et WEBP sont autorisés !"));
  }
};

// 3. Configuration finale
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Limite à 2 Mo
  },
  fileFilter: fileFilter,
});

module.exports = upload;
