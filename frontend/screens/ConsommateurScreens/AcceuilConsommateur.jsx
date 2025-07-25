import { StyleSheet, Text, View, TouchableOpacity, FlatList } from "react-native";
import React, { useRef, useState } from "react";
import Layout from "../../components/Layout/Layout";
import Header from "../../components/Layout/Header";
import Categories from "../../components/Category/Categories";
import Banner from "../../components/Banner/Banner";
import Produits from "../../components/Produits/Produits";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { LogBox } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
const AcceuilConsommateur = ({ navigation, route }) => {

  LogBox.ignoreLogs([
    "Pagination: Support for defaultProps will be removed from function components",
  ]);

  const shopId = route?.params?.shopId;

   console.log("Shop ID reçu :", shopId);

  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 200);
  };

  const saveShopId = async (id) => {
    try {
      await AsyncStorage.setItem('userShopId', id);
      console.log("Shop ID enregistré avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du Shop ID :", error);
    }
  };

   // Appel de la fonction lorsque shopId est disponible
  React.useEffect(() => {
    if (shopId) {
      saveShopId(shopId);
    }
  }, [shopId]);

  return ( 
    <Layout>
      <View style={styles.hdr}>
        <TouchableOpacity style={styles.btn1} onPress={() => navigation.navigate("AutresOptions")}>
          <AntDesign name="bars" style={styles.plus} size={28} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ChatBot")}>
          <MaterialCommunityIcons name="chat-question-outline" size={28} style={{ color: "#ffff" }} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            <Header searchText={searchText} setSearchText={setSearchText} onSearch={() => {}} />
            {searchText === "" && (
              <>
                <Text style={styles.txt}>{t("explorer_categorie")}</Text>
                <Categories shopId={shopId}/>
                <Banner />
                <Text style={styles.txt}>{t("nos_produits")}</Text>
              </>
            )}
          </>
        }
        data={[{ key: "produits" }]}
        renderItem={() => (
          <View style={{ paddingHorizontal: 12 }}>
            <Produits searchText={searchText} shopId={shopId}/>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={<View style={{ height: 100 }} />}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Bouton flottant pour remonter en haut */}
      {showScrollTop && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => flatListRef.current?.scrollToOffset({ animated: true, offset: 0 })}
        >
          <AntDesign name="arrowup" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </Layout>
  );
};

export default AcceuilConsommateur;

const styles = StyleSheet.create({
  hdr: {
    height: 60,
    backgroundColor: "#2E7D32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginTop: 42,
  },
  plus: {
    color: "#fff",
    padding: 10,
    borderRadius: 5,
  },
  txt: {
    fontSize: 19,
    fontWeight: "bold",
    padding: 15,
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 70,
    backgroundColor: "#2E7D32",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  floatingButtonScan: {
    position: "absolute",
    left: 20,
    bottom: 60,
    backgroundColor: "#2E7D32",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
