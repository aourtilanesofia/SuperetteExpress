import mongoose from 'mongoose';

const recetteSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  ingredients: [
    {
      type: String,
      required: true,
    }
  ],
  urlVideo: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Recette', recetteSchema);
