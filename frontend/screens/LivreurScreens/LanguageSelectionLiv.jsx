import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';


const LanguageSelectionLiv = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'Arabe', flag: '🇸🇦' }
  ];

  const changeLanguage = async (lang) => {
    await AsyncStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
    navigation.goBack();
  };

  return (
    <LayoutLivreur>
    <LinearGradient
      colors={['#FFFFFF', '#E8F5E9']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />
          
          <View style={styles.header}>
            
            <Text style={styles.title}>{t('choisir_une_langue')}</Text>
          </View>

          <View style={styles.languagesContainer}>
            {languages.map((language) => (
              <TouchableOpacity 
                key={language.code}
                style={[styles.languageButton, i18n.language === language.code && styles.selectedLanguage]}
                onPress={() => changeLanguage(language.code)}
              >
                <Text style={[styles.languageText, language.rtl && { textAlign: 'right' }]}>
                  {language.flag} {language.name}
                </Text>
                {i18n.language === language.code && (
                  <Icon name="check-circle" size={24} color="#2E7D32" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
    </LayoutLivreur>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  languagesContainer: {
    marginTop: 20,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedLanguage: {
    borderColor: '#2E7D32',
    backgroundColor: '#F1F8E9',
  },
  languageText: {
    fontSize: 18,
    color: '#212121',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 10,
  },
});

export default LanguageSelectionLiv;