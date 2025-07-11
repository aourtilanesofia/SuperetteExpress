import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    livreurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Livreur",
        required: false, // Facultatif, utile si la notification concerne un livreur
    }, 
    consommateurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Consommateur",
        required: false,
    },
    commercantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commercant",
    },
    superetteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Superette",
        //required: true 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    role: { type: String, enum: ["livreur", "client", "administrateur","commercant"], required: true },
    
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
