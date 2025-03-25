import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons"; // Import de l'icône poubelle

const CartItem = ({ item, onRemove, onQuantityChange }) => {
    const [qty, setQty] = useState(item.qty !== undefined ? item.qty : 1);

  useEffect(() => {
    setQty(item.qty); // Synchroniser l'état local avec l'item mis à jour
  }, [item.qty]); 
 

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
      <Image source={{ uri: `http://192.168.43.107:8080${item.image}` }} style={styles.image} />


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
    margin: 6,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth:0.23,
    marginLeft:15,
    marginRight:15,
  },
  image: {
    height: 75,
    width: 75,
    resizeMode: "contain",
  },
  details: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
  },
  price: {
    marginTop: 10,
    fontSize: 12,
    color: "#000",
  },
  actions: {
    alignItems: "center",
  },
  btnContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  btnQty: {
    backgroundColor: "lightgray",
    width: 30,
    alignItems: "center",
    marginHorizontal: 5,
    padding: 2,
    borderRadius: 5,
  },
  btnQtyText: {
    fontSize: 18,
  },
  trashIcon: {
    marginTop: 10, // Espacement entre la quantité et la poubelle
  },
});

export default CartItem;
