import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dictionnaires de langues
const resources = {
  en: {
    translation: {
      welcome: "Welcome to Superette Express",
      language: "Language",
      Supprimer_mon_compte:"Delete my account",
      deleteAccount: "Delete my account",
      logout: "Logout",
      choisir_une_langue:"Choose a language",
      recherche:"Search",
      explorer_categorie:"Explore categories",
      fruits:"Fruits",
      Bienvenue:"Welcome",
      email:"E-mail address",
      num:"Phone number",
      adr:"Address",
      Modifier_le_profil:"Edit profile",
      valider:"To validate",
      Catégorie_de_véhicule:"Vehicle category",
      Matricule:"Registration number",
      Gestion_des_produits:"Product management",
      Gestion_des_catégories:"Category management",
      Gestion_des_commandes:"Order management",
      Gestion_des_utilisateurs:"User management",
      Liste_des_clients:"Customer list",
      Liste_des_livreurs:"List of delivery people",
      Dashboard:"Dashboard",

    }
  },
  fr: {
    translation: {
      welcome: "Bienvenue sur Supérette Express",
      language: "Langue",
      Supprimer_mon_compte:"Supprimer mon compte",
      deleteAccount: "Supprimer mon compte",
      logout: "Se déconnecter",
      choisir_une_langue:"Choisissez une langue",
      recherche:"Recherchez",
      explorer_categorie:"Explorez catégories",
      fruits:"Fruits",
      Bienvenue:"Bienvenue",
      email:"Adresse E-mail",
      num:"Numéro de téléphone",
      adr:"Adresse",
      Modifier_le_profil:"Modifier le profil",
      valider:"Valider",
      Catégorie_de_véhicule:"Catégorie de véhicule",
      Matricule:"Matricule",
      Gestion_des_produits:"Gestion des produits",
      Gestion_des_catégories:"Gestion des catégories",
      Gestion_des_commandes:"Gestion des commandes",
      Gestion_des_utilisateurs:"Gestion des utilisateurs",
      Liste_des_clients:"Liste des clients",
      Liste_des_livreurs:"Liste des livreurs",
      Dashboard:"Tableau de bord",
    }
  },
  ar: {
    translation: {
      welcome: "مرحبًا بك في سوبر ماركت إكسبريس",
      language: "اللغة",
      Supprimer_mon_compte: "حذف حسابي",
      logout: "تسجيل الخروج",
      choisir_une_langue:"اختر الغة",
      recherche:"بحث", 
      explorer_categorie:"اكتشف الفئات",
      fruits:"الفواكه",
      Bienvenue:"مرحباً",
      email:"عنوان البريد الإلكتروني",
      num:"رقم الهاتف",
      adr:"العنوان",
      Modifier_le_profil:"تعديل الملف الشخصي",
      valider:"التاكيد",
      Catégorie_de_véhicule:"فئة المركبة",
      Matricule:"رقم تسجيل السيارة",
      Gestion_des_produits:"إدارة المنتج",
      Gestion_des_catégories:"إدارة الفئة",
      Gestion_des_commandes:"إدارة الطلب",
      Gestion_des_utilisateurs:"إدارة المستخدم",
      Liste_des_clients:"قائمة العملاء",
      Liste_des_livreurs:"قائمة سائقي التوصيل",
      Dashboard:"لوحة التحكم",
    }

  }
};

// Fonction pour récupérer la langue enregistrée
const getStoredLanguage = async () => {
  try {
    const lang = await AsyncStorage.getItem('language');
    return lang || 'fr'; // Par défaut en français
  } catch (error) {
    console.error('Erreur lors de la récupération de la langue', error);
    return 'fr';
  }
};

// Initialisation de i18next
getStoredLanguage().then((language) => {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'fr',
      interpolation: {
        escapeValue: false,
      },
    });
});

export default i18n;
