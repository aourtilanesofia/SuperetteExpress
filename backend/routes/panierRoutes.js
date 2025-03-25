import express from "express";
import { addToCart, getCart, removeFromCart, updateQuantity } from "../controllers/panierController.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/:userId", getCart);
router.put("/update", updateQuantity);
router.delete("/remove", removeFromCart);

export default router;
