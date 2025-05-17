import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConnAdmin = ({ navigation }) => {
    const [secureEntry, setSecureEntry] = useState(true);
    const [email, setEmail] = useState('');
    const [mdp, setMdp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
    if (!email.trim() || !mdp.trim()) {
        Alert.alert("Champs requis", "Veuillez remplir tous les champs !");
        return;
    }

    setIsLoading(true);

    try {
        if (email === "admin@gmail.com" && mdp === "admin123") {
            await AsyncStorage.multiSet([
                ['userRole', 'admin'],
                ['userEmail', email]
            ]);

            navigation.navigate("AcceuilAdmin");
            Alert.alert("Connexion réussie", "Bienvenue dans votre espace administrateur");
        } else {
            Alert.alert("Accès refusé", "Identifiants incorrects, veuillez réessayer s'il vous plaît!");
        }
    } catch (error) {
        console.error("Erreur de connexion:", error);
        Alert.alert("Erreur", "Problème de connexion");
    } finally {
        setIsLoading(false);
        setEmail('');
        setMdp('');
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
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Espace Administrateur</Text>
                        <Text style={styles.subtitle}>Accès réservé aux administrateurs</Text>
                    </View>

                    <View style={styles.formContainer}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name='mail-outline' size={22} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Email administrateur'
                                placeholderTextColor="#939494"
                                keyboardType='email-address'
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name='lock-closed-outline' size={22} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Mot de passe'
                                placeholderTextColor="#939494"
                                secureTextEntry={secureEntry}
                                value={mdp}
                                onChangeText={setMdp}
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

                        {/* Login Button */}
                        <TouchableOpacity 
                            style={[styles.loginButton, isLoading && styles.disabledButton]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.loginButtonText}>
                                {isLoading ? 'Connexion...' : 'Accéder au tableau de bord'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 30,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
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
        textAlign: 'center',
    },
    formContainer: {
        marginTop: 20,
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
    loginButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ConnAdmin;