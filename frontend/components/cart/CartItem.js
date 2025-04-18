import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons"; // Import de l'icône poubelle

const CartItem = ({ item, onRemove, onQuantityChange }) => {
  const [qty, setQty] = useState(item.qty !== undefined ? item.qty : 1);

  const backendUrl = "http://192.168.228.149:8080";

  useEffect(() => {
    setQty(item.qty); // Synchroniser l'état local avec l'item mis à jour
  }, [item.qty]);

  const imageUri =
    item.image && typeof item.image === "string"
      ? item.image.startsWith("http") || item.image.startsWith("file://")
        ? item.image
        : `${backendUrl}${item.image}`
      : null;


  const handleQuantityChange = (type) => {
    let newQty = qty;

    if (type === "increase") {
      newQty += 1;
    } else if (type === "decrease" && qty > 1) {
      newQty -= 1;
    }

    setQty(newQty); // Mettre à jour l'état local
    onQuantityChange(item._id, type); // Informer le parent
  };


  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        onError={() => console.error("Erreur de chargement de l'image :", imageUri)}
      />


      <View style={styles.details}>
        <Text style={styles.name}>{item.nom}</Text>
        <Text style={styles.price}>Prix : {item.prix ? item.prix * (item.qty || 1) : "N/A"} DA</Text>

      </View>

      <View style={styles.actions}>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.btnQty}
            onPress={() => handleQuantityChange("decrease")}
          >
            <Text style={styles.btnQtyText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.text}>{qty}</Text>


          <TouchableOpacity
            style={styles.btnQty}
            onPress={() => handleQuantityChange("increase")}
          >
            <Text style={styles.btnQtyText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => onRemove(item._id)} style={styles.trashIcon}>
          <MaterialIcons name="delete" size={24} color="grey" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    shadowColor: "#329171",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  image: {
    height: 80,
    width: 80,
    resizeMode: "cover",
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  details: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  actions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 80,
  },
  btnContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  btnQty: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  btnQtyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 8,
    color: "#2E7D32",
    minWidth: 24,
    textAlign: "center",
  },
  trashIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFEBEE",
    marginTop:5,
  },
});

export default CartItem;
