/*import mongoose from "mongoose";

const superetteSchema = new mongoose.Schema({
  name: String,
  address: String,
  location: {
    type: {
      type: String, 
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  } 
});

superetteSchema.index({ location: "2dsphere" });

const SuperetteModel = mongoose.model('Superette', superetteSchema);
export default SuperetteModel;*/

import mongoose from "mongoose";

const superetteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom est obligatoire"],
    trim: true
  },
  address: {
    type: String,
    required: [true, "L'adresse est obligatoire"],
    trim: true
  },
  commercant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Commercant',
    unique: true 
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, "Les coordonnées sont obligatoires"],
      set: function(coords) {
        // Conversion forcée en nombres
        if (Array.isArray(coords)) {
          return [
            parseFloat(coords[0]) || 0,
            parseFloat(coords[1]) || 0
          ];
        }
        return coords;
      },
      validate: {
        validator: function(coords) {
          return coords.every(coord => !isNaN(coord));
        },
        message: "Les coordonnées doivent être des nombres valides"
      }
    }
  }
}, { timestamps: true });

superetteSchema.index({ location: "2dsphere" });

const SuperetteModel = mongoose.model('Superette', superetteSchema);
export default SuperetteModel;  