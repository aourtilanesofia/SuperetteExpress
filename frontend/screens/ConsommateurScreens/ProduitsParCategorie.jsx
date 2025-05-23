import { StyleSheet, FlatList, Text, View, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import ProduitsParCateg from "../../components/ProduitsParCategorie/ProduitsParCateg";
import Header from '../../components/Layout/Header';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout/Layout';
import { useNavigation } from "@react-navigation/native";
import { useRoute } from '@react-navigation/native';


const ProduitsParCategorie = ({ }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const route = useRoute();
  const { categorie } = route.params;


  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.inspirationText}>
            {t('Nos')} <Text style={styles.accentText}>{categorie}</Text>
          </Text>
          <ProduitsParCateg searchText={searchText} />
        </View>

      </ScrollView>

    </Layout>
  );
};
export default ProduitsParCategorie;


const styles = StyleSheet.create({
  hdr: {
    height: 60,
    backgroundColor: "#2E7D32",
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
    fontSize: 20,
    fontWeight: "bold",
    padding: 20,
  },
  txttc: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 20,
    color: "#2E7D32",
  },
  inspirationText: {
    fontSize: 18,
    padding: 16,
    color: '#000'
  },
  accentText: {
    color: '#2E7D32',
    fontWeight: '700'
  }
});
