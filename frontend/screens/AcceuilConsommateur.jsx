import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { FlatList } from "react-native";
import React from "react";
import Layout from "../components/Layout/Layout";
import Header from './../components/Layout/Header';
import Categories from "../components/Category/Categories";
import Banner from "../components/Banner/Banner";
import Produits from "../components/Produits/Produits";
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from "react";


const AcceuilConsommateur = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');

  return (
    <Layout>
      <View style={styles.hdr}>
        <TouchableOpacity style={styles.btn1} onPress={() => navigation.navigate('AutresOptions')}>
          <AntDesign name="bars" style={styles.plus} size={28} />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialCommunityIcons name="chat-question-outline" size={28} style={{ color: '#ffff' }} />
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            <Header searchText={searchText} setSearchText={setSearchText} onSearch={() => { }} />
            {searchText === "" && (
              <>
                <Text style={styles.txt}>{t('explorer_categorie')}</Text>
                <Categories />
                <Banner />
                <Text style={styles.txt}>Nos Produits</Text>
              </>
            )}
          </>
        }
        data={[{ key: "produits" }]}
        
        renderItem={() => <Produits searchText={searchText} />}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={<View style={{ height: 100 }} />} 
      />
    </Layout>
  );
};

export default AcceuilConsommateur;

const styles = StyleSheet.create({
  hdr: {
    height: 60,
    backgroundColor: "#329171",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  plus: {
    //backgroundColor: "white",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
  },
  txtbtn1: {
    color: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  txt: {
    fontSize: 19,
    fontWeight: "bold",
    padding: 15,
  },
});

