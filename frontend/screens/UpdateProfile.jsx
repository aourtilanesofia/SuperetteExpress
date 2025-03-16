
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Octicons from 'react-native-vector-icons/Octicons';
import { UserData } from '../Data/UserData'

const UpdateProfile = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [numTel, setnumTel] = useState('');
    const [adr, setAdr] = useState('');
    const [mdp, setMDP] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Charger les données du profil depuis AsyncStorage
    useEffect(() => {
        const loadProfile = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                setName(user.nom || '');
                setEmail(user.email || '');
                setnumTel(user.numTel ? user.numTel.toString() : '');
                setAdr(user.adresse || '');
                setMDP(user.mdp || '')
            }
        };
        loadProfile();
    }, []);

    // Fonction pour mettre à jour le profil
    const handleUpdateProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                alert('Utilisateur non authentifié');
                return;
            }
    
            if (!name || !email || !numTel || !adr ||!mdp) {
                alert("Veuillez remplir tous les champs.");
                return;
            }
    
            // Mise à jour des informations du profil
            const response = await fetch('http://192.168.43.107:8080/api/v1/consommateur/profile-update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nom: name, email, numTel: numTel.toString(), adresse: adr,mdp }),
            });
    
            const data = await response.json();
            if (!response.ok) {
                alert(data.message || "Erreur lors de la mise à jour");
                return;
            }
    
            // Sauvegarder les nouvelles infos en local
            await AsyncStorage.setItem('user', JSON.stringify({ nom: name, email, numTel, adresse: adr,mdp }));
    
            // Afficher l'alerte de succès après la mise à jour du profil
            alert("Modification avec succès !");
    
            // Mettre à jour le mot de passe si un nouveau mot de passe est saisi
            
    
        } catch (error) {
            console.error("Erreur :", error);
            alert("Impossible de mettre à jour le profil");
        }
    };
    

    return (
        <Layout>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                <Image source={{ uri: UserData[0].profilePic }} style={styles.img} />

                    <View style={styles.inputContainer}>
                        <TextInput style={styles.textInput} value={name} onChangeText={setName} placeholder="Nom" />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput style={styles.textInput} value={email} onChangeText={setEmail} placeholder="Email" keyboardType='email-address' />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput style={styles.textInput} value={numTel} onChangeText={setnumTel} placeholder="Numéro de téléphone" keyboardType='phone-pad'/>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput style={styles.textInput} value={adr} onChangeText={setAdr} placeholder="Adresse" />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            value={mdp}
                            onChangeText={setMDP}
                            placeholder="Nouveau mot de passe"
                            secureTextEntry={!isPasswordVisible}
                        />
                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                            <Octicons
                                name={isPasswordVisible ? "eye" : "eye-closed"}
                                size={20}
                                color="gray"
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.cnxButton} onPress={handleUpdateProfile}>
                        <Text style={styles.cnxtxt}>Valider</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Layout>
    );
};

export default UpdateProfile;

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
        margin: 20,
    },
    img: {
        height: 100,
        width: '100%',
        resizeMode: 'contain',
        marginTop: 10,
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: '#329171',
        borderRadius: 15,
        height: 50,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
        marginTop: 20,
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 15,
    },
    cnxButton: {
        backgroundColor: '#329171',
        borderRadius: 15,
        marginVertical: 30,
    },
    cnxtxt: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 12,
    },
    icon: {
        position: 'absolute',
        right: 10,
    },
});
