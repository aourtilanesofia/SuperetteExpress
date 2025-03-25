import { View, Text, StyleSheet } from "react-native";
import React from "react";

const PriceTable = ({ price, title }) => {
  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>{title}</Text>
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>{price} DA</Text>
    </View>
  );
}; 

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    alignItems: "center",
    borderRadius:5,

  },
});

export default PriceTable;
