import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const LanguageSelection = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  const changeLanguage = async (lang) => {
    await AsyncStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
    navigation.goBack(); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('choisir_une_langue')}</Text>
      
      <TouchableOpacity style={styles.btn} onPress={() => changeLanguage('fr')}>
        <Text style={styles.txt}>🇫🇷 Français</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => changeLanguage('en')}>
        <Text style={styles.txt}>🇬🇧 English</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => changeLanguage('ar')}>
        <Text style={styles.txt}>🇸🇦 العربية</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight:'bold',
    marginBottom: 20,
    marginTop: -190,
  },
  btn: {
    width: 150, 
    height: 50, 
    padding: 10,
    margin: 5,
    backgroundColor: '#329171',
    borderRadius: 5,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop:16,
},
txt:{
  textAlign:'center',
  justifyContent:'center',
  alignItems:'center',
  color:'#fff',
  fontSize:17,
}
});

export default LanguageSelection;
