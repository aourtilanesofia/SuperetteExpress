
import './i18n';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/SplashScreen';
import FirstScreen from './screens/FirstScreen';
import ConConsommateur from './screens/ConsommateurScreens/ConConsommateur';
import InsConsommateur from './screens/ConsommateurScreens/InsConsommateur';
import WelcomePage from './screens/ConsommateurScreens/WelcomePage';
import WelcomePageLivreur from '../frontend/screens/LivreurScreens/WelcomePageLivreur';
import ConLivreur from '../frontend/screens/LivreurScreens/ConLivreur';
import InsLivreur from '../frontend/screens/LivreurScreens/InsLivreur';
import AcceuilConsommateur from './screens/ConsommateurScreens/AcceuilConsommateur';
import ProduitsDetails from './screens/ConsommateurScreens/ProduitsDetails';
import Compte from './screens/ConsommateurScreens/Compte';
import UpdateProfile from './screens/ConsommateurScreens/UpdateProfile';
import AutresOptions from './screens/ConsommateurScreens/AutresOptions';
import AcceuilLivreur from './screens/LivreurScreens/AcceuilLivreur';
import CompteLivreur from './screens/LivreurScreens/CompteLivreur';
import UpdateProfileLivreur from './screens/LivreurScreens/UpdateProfileLivreur';
import AutresOptionsLivreur from './screens/LivreurScreens/AutresOptionsLivreur';
import AcceuilCommerçant from './screens/CommercantScreens/AcceuilCommercant';
import ListeDesClients from './screens/AdministrateurScreens/ListeDesClients';
import ListeDesLivreurs from './screens/AdministrateurScreens/ListeDesLivreurs';
import GestionDesCategories from './screens/CommercantScreens/GestionDesCategories';
import AjouterCategories from './screens/CommercantScreens/AjouterCategories';
import Panier from './screens/ConsommateurScreens/Panier';
import Valider from './screens/ConsommateurScreens/Valider';
import ListeDesCommandes from './screens/ConsommateurScreens/ListeDesCommandes';
import ModifierCategories from "./screens/CommercantScreens/ModifierCategories";
import GestiondesProduits from './screens/CommercantScreens/GestiondesProduits';
import NotificationsAdmin from './screens/AdministrateurScreens/NotificationsAdmin';
import AjouterProduit from "./screens/CommercantScreens/AjouterProduit";
import ModifierProduit from "./screens/CommercantScreens/ModifierProduit";
import LanguageSelection from './screens/ConsommateurScreens/LanguageSelection';
import ProduitsParCategorie from './screens/ConsommateurScreens/ProduitsParCategorie';
import CommandeDetails from './screens/ConsommateurScreens/CommandeDetails';
import GestionDesCommandes from './screens/CommercantScreens/GestionDesCommandes';
import CommandeDetailsAdmin from './screens/CommercantScreens/CommandeDetailsAdmin';
import Paiement from './screens/ConsommateurScreens/Paiement';
import NotificationsConsommateur from './screens/ConsommateurScreens/NotificationsConsommateur';
import BarcodeScanner from './screens/ConsommateurScreens/BarcodeScanner';
import ModePaiement from './screens/ConsommateurScreens/ModePaiement';
import PaiementEspece from './screens/ConsommateurScreens/PaiementEspece';
import Confirmation from './screens/ConsommateurScreens/Confirmation';
import PaiementCIB from './screens/ConsommateurScreens/PaiementCIB';
import PaiementDahabiya from './screens/ConsommateurScreens/PaiementDahabiya';
import ConnAdmin from './screens/AdministrateurScreens/ConnAdmin';
import AcceuilAdmin from './screens/AdministrateurScreens/AcceuilAdmin';
import ListeDesCommercants from './screens/AdministrateurScreens/ListeDesCommercants';
import ConCommercant from './screens/CommercantScreens/ConCommercant';
import InsCommercant from './screens/CommercantScreens/InsCommercant';
import NotificationCommercant from './screens/CommercantScreens/NotificationCommercant';
import CompteCommercant from './screens/CommercantScreens/CompteCommercant';
import UpdateProfilCommercant from './screens/CommercantScreens/UpdateProfilCommercant';
import WelcomePageCommercant from './screens/CommercantScreens/WelcomePageCommercant';
import ListeCommandeALivre from './screens/LivreurScreens/ListeCommandeALivre';
import DetailsCommandeALivre from './screens/LivreurScreens/DetailsCommandeALivre';
import MiseAjoueEtatDeCommande from './screens/LivreurScreens/MiseAjoueEtatDeCommande';
import NotificationsLivreur from './screens/LivreurScreens/NotificationsLivreur';
import TrackCommande from './screens/ConsommateurScreens/TrackCommande';
import ChatBot from './screens/ConsommateurScreens/ChatBot';
import LanguageSelectionLiv from './screens/LivreurScreens/LanguageSelectionLiv';
import LanguageSelectionComm from './screens/CommercantScreens/LanguageSelectionComm';
import LanguageSelectionAdmin from './screens/AdministrateurScreens/LanguageSelectionAdmin';
import ListeShops from './screens/ConsommateurScreens/ListeShops';
import Liv1 from './screens/ConsommateurScreens/Liv1';
import Liv2 from './screens/ConsommateurScreens/Liv2';
import DetailsCommandeLivreur from './screens/LivreurScreens/DetailsCommandeLivreur';
import CommandeRefusee from './screens/LivreurScreens/CommandeRefusee';
import GestionDesSuperettes from './screens/AdministrateurScreens/GestionDesSuperettes';
import AjouterSuperette from './screens/AdministrateurScreens/AjouterSuperette';
import ModifierSuperette from './screens/AdministrateurScreens/ModifierSuperette';
import Calcule from './screens/AdministrateurScreens/Calcule';



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
        <Stack.Screen name="ModePaiement" component={ModePaiement} options={{ headerTitle: '' }} />
        <Stack.Screen name="PaiementEspece" component={PaiementEspece} options={{ headerTitle: '' }} />
        <Stack.Screen name="Confirmation" component={Confirmation} options={{ headerTitle: '' }} />
        <Stack.Screen name="PaiementCIB" component={PaiementCIB} options={{ headerTitle: '' }} />
        <Stack.Screen name="PaiementDahabiya" component={PaiementDahabiya} options={{ headerTitle: '' }} />
        <Stack.Screen name="ConnAdmin" component={ConnAdmin} options={{ headerTitle: '' }} />
        <Stack.Screen name="AcceuilAdmin" component={AcceuilAdmin} options={{ headerTitle: '' }} />
        <Stack.Screen name="ListeDesCommercants" component={ListeDesCommercants} options={{ headerTitle: '' }} />
        <Stack.Screen name="ConCommercant" component={ConCommercant} options={{ headerTitle: '' }} />
        <Stack.Screen name="InsCommercant" component={InsCommercant} options={{ headerTitle: '' }} />
        <Stack.Screen name="NotificationCommercant" component={NotificationCommercant} options={{ headerTitle: '' }} />
        <Stack.Screen name="CompteCommercant" component={CompteCommercant} options={{ headerTitle: '' }} />
        <Stack.Screen name="UpdateProfilCommercant" component={UpdateProfilCommercant} options={{ headerTitle: '' }} />
        <Stack.Screen name="WelcomePageCommercant" component={WelcomePageCommercant} options={{ headerShown: false, }} />
        <Stack.Screen name="ListeCommandeALivre" component={ListeCommandeALivre} options={{ headerTitle: '' }} />
        <Stack.Screen name="DetailsCommandeALivre" component={DetailsCommandeALivre} options={{ headerTitle: '' }} />
        <Stack.Screen name="MiseAjoueEtatDeCommande" component={MiseAjoueEtatDeCommande} options={{ headerTitle: '' }} />
        <Stack.Screen name="NotificationsLivreur" component={NotificationsLivreur} options={{ headerTitle: '' }} />
        <Stack.Screen name="TrackCommande" component={TrackCommande} options={{ headerTitle: '' }} />
        <Stack.Screen name='ChatBot' component={ChatBot} options={{ headerTitle: '' }} />
        <Stack.Screen name='LanguageSelectionLiv' component={LanguageSelectionLiv} options={{ headerTitle: '' }} />
        <Stack.Screen name='LanguageSelectionComm' component={LanguageSelectionComm} options={{ headerTitle: '' }} />
        <Stack.Screen name='LanguageSelectionAdmin' component={LanguageSelectionAdmin} options={{ headerTitle: '' }} />
        <Stack.Screen name='ListeShops' component={ListeShops} options={{headerTitle: ''}} />
        <Stack.Screen name='Liv1' component={Liv1} options={{headerTitle:''}}/>
        <Stack.Screen name='Liv2' component={Liv2} options={{headerTitle:''}}/>
        <Stack.Screen name='DetailsCommandeLivreur' component={DetailsCommandeLivreur} options={{headerTitle:''}}/>
        <Stack.Screen name='CommandeRefusee' component={CommandeRefusee} options={{headerTitle:''}}/>
        <Stack.Screen name='GestionDesSuperettes' component={GestionDesSuperettes} options={{headerTitle:''}}/>
        <Stack.Screen name='AjouterSuperette' component={AjouterSuperette} options={{headerTitle:''}}/>
        <Stack.Screen name='ModifierSuperette' component={ModifierSuperette} options={{headerTitle:''}}/>
        <Stack.Screen name='Calcule' component={Calcule} options={{headerTitle:''}}/>
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
