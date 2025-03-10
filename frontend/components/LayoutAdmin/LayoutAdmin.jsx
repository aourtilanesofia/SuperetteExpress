import { StyleSheet, View } from "react-native";
import React from "react";
import MenuAdmin from "./MenuAdmin";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

const LayoutAdmin = ({ children }) => {
  return (
    <>
      <StatusBar />
      <SafeAreaView style={styles.container}>
        {/* Contenu qui sera défini dans chaque page */}
        <View style={styles.content}>{children}</View>

        {/* Footer fixe */}
        <View style={styles.footer}>
          <MenuAdmin />
        </View>
      </SafeAreaView>
    </>
  );
};

export default LayoutAdmin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,  // Permet au contenu d'occuper tout l'espace disponible
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 50,
    borderTopWidth: 0.5,
    borderColor: "lightgray",
    backgroundColor: "white",
    padding: 10,
  },
});
