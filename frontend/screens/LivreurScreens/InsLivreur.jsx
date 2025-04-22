import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const InsLivreur = ({ navigation }) => {
    const [secureEntry, setSecureEntry] = useState(true);
    const [formData, setFormData] = useState({
        nom: '',
        numTel: '',
        categorie: '',
        matricule: '',
        email: '',
        mdp: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignup = async () => {
        const { nom, numTel, categorie, matricule, email, mdp } = formData;
        
        if (!nom || !numTel || !categorie || !matricule || !email || !mdp) {
            Alert.alert("Champs manquants", "Veuillez remplir tous les champs");
            return;
        }

        if (!/^[0-9]{10}$/.test(numTel)) {
            Alert.alert("Numéro invalide", "Le numéro doit contenir 10 chiffres");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            Alert.alert("Email invalide", "Veuillez entrer un email valide");
            return;
        }

        setIsLoading(true);

        try {

            const response = await fetch("http://192.168.1.9:8080/api/v1/livreur/inscriptionL", {

                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Erreur", data.message || "Inscription échouée");
                return;
            }

            Alert.alert("Succès", "Inscription réussie !", [
                { text: "OK", onPress: () => navigation.navigate("ConLivreur") }
            ]);

            setFormData({
                nom: '',
                numTel: '',
                categorie: '',
                matricule: '',
                email: '',
                mdp: ''
            });

        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert("Erreur", "Problème de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#FFFFFF', '#E8F5E9']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Devenir Livreur</Text>
                        <Text style={styles.subtitle}>Rejoignez notre équipe de livraison</Text>
                    </View>

                    <View style={styles.formContainer}>
                        {/* Nom Complet */}
                        <View style={styles.inputContainer}>
                            <FontAwesome name='user-o' size={20} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Nom complet'
                                placeholderTextColor="#939494"
                                value={formData.nom}
                                onChangeText={(text) => handleChange('nom', text)}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Numéro de Téléphone */}
                        <View style={styles.inputContainer}>
                            <Ionicons name='phone-portrait-outline' size={20} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Numéro de téléphone'
                                placeholderTextColor="#939494"
                                keyboardType='phone-pad'
                                value={formData.numTel}
                                onChangeText={(text) => handleChange('numTel', text)}
                                maxLength={10}
                            />
                        </View>

                        {/* Catégorie Véhicule */}
                        <View style={styles.inputContainer}>
                            <Ionicons name='car-outline' size={20} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Catégorie véhicule'
                                placeholderTextColor="#939494"
                                value={formData.categorie}
                                onChangeText={(text) => handleChange('categorie', text)}
                            />
                        </View>

                        {/* Matricule */}
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name='numeric' size={20} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Matricule'
                                placeholderTextColor="#939494"
                                value={formData.matricule}
                                onChangeText={(text) => handleChange('matricule', text)}
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputContainer}>
                            <Ionicons name='mail-outline' size={20} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Email'
                                placeholderTextColor="#939494"
                                keyboardType='email-address'
                                value={formData.email}
                                onChangeText={(text) => handleChange('email', text)}
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Mot de passe */}
                        <View style={styles.inputContainer}>
                            <Ionicons name='lock-closed-outline' size={20} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Mot de passe'
                                placeholderTextColor="#939494"
                                secureTextEntry={secureEntry}
                                value={formData.mdp}
                                onChangeText={(text) => handleChange('mdp', text)}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() => setSecureEntry(prev => !prev)}
                                style={styles.eyeIcon}
                            >
                                <Octicons
                                    name={secureEntry ? 'eye-closed' : 'eye'}
                                    size={19}
                                    color={'#329171'}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Bouton d'inscription */}
                        <TouchableOpacity
                            style={[styles.signupButton, isLoading && styles.disabledButton]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            <Text style={styles.signupButtonText}>
                                {isLoading ? 'Inscription en cours...' : "S'inscrire"}
                            </Text>
                        </TouchableOpacity>

                        {/* Lien vers connexion */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Vous avez déja un compte ? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('ConLivreur')}>
                                <Text style={styles.loginLink}>Se connecter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContainer: {
        paddingBottom: 30,
    },
    header: {
        paddingHorizontal: 30,
        marginTop: 50,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2E7D32',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#616161',
    },
    formContainer: {
        paddingHorizontal: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        height: '100%',
        color: '#333',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 5,
    },
    signupButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.7,
    },
    signupButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    loginText: {
        color: '#616161',
        fontSize: 15,
    },
    loginLink: {
        color: '#2E7D32',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default InsLivreur;