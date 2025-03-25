import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConConsommateur = ({ navigation }) => {
    const [secureEntry, setSecureEntry] = useState(true);
    const [email, setEmail] = useState('');
    const [mdp, setMdp] = useState('');

    // Connexion function
    /*const handleLogin = async () => {
        if (!email || !mdp) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs !");
            setEmail('');
            setMdp('');

            return;
        }

        try {
            const response = await fetch("http://192.168.43.107:8080/api/v1/consommateur/connexion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, mdp }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Erreur", data.message || "Connexion échouée !");
                setEmail('');
                setMdp('');

                return;
            }

            Alert.alert("Succès", "Connecté avec succès !");
            setEmail('');
            setMdp('');

            navigation.navigate("AcceuilConsommateur");
        } catch (error) {
            console.error("Erreur de connexion :", error);
            Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
        }
    };*/

    

    const handleLogin = async () => {
        if (!email || !mdp) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs !");
            setEmail('');
            setMdp('');
            return;
        }
    
        try {
            const response = await fetch("http://192.168.43.107:8080/api/v1/consommateur/connexion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, mdp }),
            });
    
            const data = await response.json();
            console.log("Données reçues :", data);
    
            if (!response.ok || !data.consommateur || !data.token) {
                Alert.alert("Erreur", data.message || "Connexion échouée !");
                setEmail('');
                setMdp('');
                return;
            }
    
            console.log("ID utilisateur récupéré :", data.consommateur._id);
    
            // Sauvegarde du token et de l'ID utilisateur
            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('userId', data.consommateur._id);
    
            Alert.alert("Succès", "Connecté avec succès !");
            setEmail('');
            setMdp('');
            navigation.navigate("AcceuilConsommateur");
    
        } catch (error) {
            console.error("Erreur de connexion :", error);
            Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
        }
    };
    
    


    return (
        <View style={styles.container}>
            <Text style={styles.txt1}>Connexion</Text>

            {/* Formulaire */}
            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Ionicons name='mail-outline' size={22} color={'#939494'} />
                    <TextInput
                        style={styles.textInput}
                        placeholder='Entrez votre E-mail'
                        keyboardType='email-address'
                        value={email}
                        onChangeText={setEmail}
                        autoComplete={'email'}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <SimpleLineIcon name='lock' size={22} color={'#939494'} />
                    <TextInput
                        style={styles.textInput}
                        placeholder='Entrez votre mot de passe'
                        secureTextEntry={secureEntry}
                        value={mdp}
                        onChangeText={setMdp}
                    />
                    <TouchableOpacity onPress={() => setSecureEntry(prev => !prev)}>
                        <Octicons name={secureEntry ? 'eye-closed' : 'eye'} size={19} color={'#939494'} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.cnxButton} onPress={handleLogin}>
                    <Text style={styles.cnxtxt}>Se connecter</Text>
                </TouchableOpacity>

                <View style={styles.footerContainer}>
                    <Text style={styles.accountText}>Vous n'avez pas un compte?</Text>
                    <Text style={styles.signuptext} onPress={() => navigation.navigate('InsConsommateur')}>S'inscrire</Text>
                </View>
            </View>
        </View>
    );
};

export default ConConsommateur;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 25 },
    txt1: { fontSize: 30, fontWeight: 'bold', color: '#329171', marginTop: 70 },
    formContainer: { marginTop: 100 },
    inputContainer: {
        borderWidth: 1,
        borderColor: '#329171',
        borderRadius: 15,
        height: 50,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15
    },
    textInput: { flex: 1, paddingHorizontal: 15 },
    cnxButton: { backgroundColor: '#329171', borderRadius: 15, marginVertical: 33 },
    cnxtxt: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', padding: 12 },
    footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
    accountText: { color: '#4f4f4f' },
    signuptext: { color: '#4f4f4f', fontWeight: 'bold' }
});
