import multer from "multer";
import path from "path";

// Définir le stockage des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom unique pour chaque image
  }
});

// Vérifier le type de fichier
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|avif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  } else {
    return cb(new Error("Seules les images JPG, JPEG, PNG et Avif sont autorisées !"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default upload;
