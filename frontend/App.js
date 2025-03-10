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
import ConCommerçant from './screens/AdminScreens/ConCommerçant';
import AcceuilConsommateur from './screens/AcceuilConsommateur';
import ProduitsDetails from './screens/ProduitsDetails';
import Compte from './screens/Compte';
import UpdateProfile from './screens/UpdateProfile';
import AutresOptions from './screens/AutresOptions';
import AcceuilLivreur from './screens/LivreurScreens/AcceuilLivreur';
import CompteLivreur from './screens/LivreurScreens/CompteLivreur';
import UpdateProfileLivreur from './screens/LivreurScreens/UpdateProfileLivreur';
import AutresOptionsLivreur from './screens/LivreurScreens/AutresOptionsLivreur';
import AcceuilCommerçant from './screens/AdminScreens/AcceuilCommerçant';

//routes
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
        <Stack.Screen name='ConCommerçant' component={ConCommerçant} options={{ headerShown: false, }} />
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
