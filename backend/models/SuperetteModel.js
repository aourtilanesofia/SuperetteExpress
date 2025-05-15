import mongoose from "mongoose";

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
export default SuperetteModel;
