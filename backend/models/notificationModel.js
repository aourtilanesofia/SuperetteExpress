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
        required: false, // Facultatif, utile si la notification concerne un consommateur
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
