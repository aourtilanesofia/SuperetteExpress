import './i18n';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/SplashScreen';
import FirstScreen from './screens/FirstScreen';
import ConConsommateur from './screens/ConConsommateur';
import InsConsommateur from './screens/InsConsommateur';
import WelcomePage from './screens/WelcomePage';
import WelcomePageLivreur from '../frontend/screens/LivreurScreens/WelcomePageLivreur';
import ConLivreur from '../frontend/screens/LivreurScreens/ConLivreur';
import InsLivreur from '../frontend/screens/LivreurScreens/InsLivreur';
import AcceuilConsommateur from './screens/AcceuilConsommateur';
import ProduitsDetails from './screens/ProduitsDetails';
import Compte from './screens/Compte';
import UpdateProfile from './screens/UpdateProfile';
import AutresOptions from './screens/AutresOptions';
import AcceuilLivreur from './screens/LivreurScreens/AcceuilLivreur';
import CompteLivreur from './screens/LivreurScreens/CompteLivreur';
import UpdateProfileLivreur from './screens/LivreurScreens/UpdateProfileLivreur';
import AutresOptionsLivreur from './screens/LivreurScreens/AutresOptionsLivreur';
import AcceuilCommerçant from './screens/CommercantScreens/AcceuilCommercant';
import ListeDesClients from './screens/AdministrateurScreens/ListeDesClients';
import ListeDesLivreurs from './screens/AdministrateurScreens/ListeDesLivreurs';
import GestionDesCategories from './screens/CommercantScreens/GestionDesCategories';
import AjouterCategories from './screens/CommercantScreens/AjouterCategories';
import Panier from './screens/Panier';
import Valider from './screens/Valider';
import ListeDesCommandes from './screens/ListeDesCommandes';
import ModifierCategories from "./screens/CommercantScreens/ModifierCategories";
import GestiondesProduits from './screens/CommercantScreens/GestiondesProduits';
import NotificationsAdmin from './screens/AdministrateurScreens/NotificationsAdmin';
import AjouterProduit from "./screens/CommercantScreens/AjouterProduit";
import ModifierProduit from "./screens/CommercantScreens/ModifierProduit";
import LanguageSelection from './screens/LanguageSelection';
import ProduitsParCategorie from './screens/ProduitsParCategorie';
import CommandeDetails from './screens/CommandeDetails';
import GestionDesCommandes from './screens/CommercantScreens/GestionDesCommandes';
import CommandeDetailsAdmin from './screens/CommercantScreens/CommandeDetailsAdmin';
import Paiement from './screens/Paiement';
import NotificationsConsommateur from './screens/NotificationsConsommateur';
import BarcodeScanner from './screens/BarcodeScanner';
import VideoRecette from './screens/VideoRecette';
import ModePaiement from './screens/ModePaiement';
import PaiementEspece from './screens/PaiementEspece';
import Confirmation from './screens/Confirmation';
import PaiementCIB from './screens/PaiementCIB';
import PaiementDahabiya from './screens/PaiementDahabiya';






const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer> 
      <Stack.Navigator>

        <Stack.Screen name='SplashScreen' component={SplashScreen} options={{ headerShown: false, }} />
        <Stack.Screen name='FirstScreen' component={FirstScreen} options={{ headerShown: false, }} />
        <Stack.Screen name='WelcomePage' component={WelcomePage} options={{ headerShown: false, }} />
        <Stack.Screen name='WelcomePageLivreur' component={WelcomePageLivreur} options={{ headerShown: false, }} />
        <Stack.Screen name='ConConsommateur' component={ConConsommateur} options={{ headerTitle: '' }} />
        <Stack.Screen name='InsConsommateur' component={InsConsommateur} options={{ headerTitle: '' }} />
        <Stack.Screen name='ConLivreur' component={ConLivreur} options={{ headerTitle: '' }} />
        <Stack.Screen name='InsLivreur' component={InsLivreur} options={{ headerTitle: '' }} />
        <Stack.Screen name='AcceuilConsommateur' component={AcceuilConsommateur} options={{ headerShown: false, }} />
        <Stack.Screen name='ProduitsDetails' component={ProduitsDetails} options={{ headerTitle: '' }} />
        <Stack.Screen name='Compte' component={Compte} options={{ headerTitle: '' }} />
        <Stack.Screen name='UpdateProfile' component={UpdateProfile} options={{ headerTitle: '' }} />
        <Stack.Screen name='AutresOptions' component={AutresOptions} options={{ headerTitle: '' }} />
        <Stack.Screen name='AutresOptionsLivreur' component={AutresOptionsLivreur} options={{ headerTitle: '' }} />
        <Stack.Screen name='AcceuilLivreur' component={AcceuilLivreur} options={{ headerShown: false, }} />
        <Stack.Screen name='CompteLivreur' component={CompteLivreur} options={{ headerTitle: '' }} />
        <Stack.Screen name='UpdateProfileLivreur' component={UpdateProfileLivreur} options={{ headerTitle: '' }} />
        <Stack.Screen name='AcceuilCommerçant' component={AcceuilCommerçant} options={{ headerShown: false, }} />
        <Stack.Screen name='GestiondesProduits' component={GestiondesProduits} options={{ headerTitle: '' }} />
        <Stack.Screen name="GestionDesCategories" component={GestionDesCategories} options={{ headerTitle: '' }} />
        <Stack.Screen name='ListeDesClients' component={ListeDesClients} options={{ headerTitle: '' }} />
        <Stack.Screen name='ListeDesLivreurs' component={ListeDesLivreurs} options={{ headerTitle: '' }} />
        <Stack.Screen name='NotificationsAdmin' component={NotificationsAdmin} options={{ headerTitle: '' }} />
        <Stack.Screen name="LanguageSelection" component={LanguageSelection} options={{ headerTitle: '' }} />
        <Stack.Screen name="AjouterProduit" component={AjouterProduit} options={{ headerTitle: '' }} />
        <Stack.Screen name="ModifierProduit" component={ModifierProduit} options={{ headerTitle: '' }} />
        <Stack.Screen name="AjouterCategories" component={AjouterCategories} options={{ headerTitle: '' }} />
        <Stack.Screen name="ModifierCategories" component={ModifierCategories} options={{ headerTitle: '' }} />
        <Stack.Screen name="Panier" component={Panier} options={{ headerTitle: '' }} />
        <Stack.Screen name="Valider" component={Valider} options={{ headerTitle: '' }} />
        <Stack.Screen name="ListeDesCommandes" component={ListeDesCommandes} options={{ headerTitle: '' }} />
        <Stack.Screen name="ProduitsParCategorie" component={ProduitsParCategorie} options={{ headerTitle: '' }} />
        <Stack.Screen name="CommandeDetails" component={CommandeDetails} options={{ headerTitle: '' }} />
        <Stack.Screen name="GestionDesCommandes" component={GestionDesCommandes} options={{ headerTitle: '' }} />
        <Stack.Screen name="CommandeDetailsAdmin" component={CommandeDetailsAdmin} options={{ headerTitle: '' }} />
        <Stack.Screen name="Paiement" component={Paiement} options={{ headerTitle: '' }} />
        <Stack.Screen name='NotificationsConsommateur' component={NotificationsConsommateur} options={{ headerTitle: '' }} />
        <Stack.Screen name='BarcodeScanner' component={BarcodeScanner} options={{ headerTitle: '' }} />
        <Stack.Screen name='VideoRecette' component={VideoRecette} options={{ headerTitle: '' }} />
        <Stack.Screen name="ModePaiement" component={ModePaiement} options={{ headerTitle: '' }} />
        <Stack.Screen name="PaiementEspece" component={PaiementEspece} options={{ headerTitle: '' }} />
        <Stack.Screen name="Confirmation" component={Confirmation} options={{ headerTitle: '' }} />
        <Stack.Screen name="PaiementCIB" component={PaiementCIB} options={{ headerTitle: '' }} />
        <Stack.Screen name="PaiementDahabiya" component={PaiementDahabiya} options={{ headerTitle: '' }} />
      </Stack.Navigator>
    </NavigationContainer>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
