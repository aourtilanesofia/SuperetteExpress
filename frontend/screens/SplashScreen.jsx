

import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Unsupported top level event type "topInsetsChange" dispatched',
]);

import { StyleSheet, Text, View, Image, Animated, Easing } from 'react-native';
import React, { useEffect, useRef } from 'react';

const SplashScreen = ({ navigation }) => {
    // Animation values
    const panierAnim = useRef(new Animated.Value(-200)).current;  // Panier commence hors écran à gauche
    const textAnim = useRef(new Animated.Value(-300)).current;   // Texte commence encore plus loin
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const bounceAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Séquence d'animation
        Animated.sequence([
           
            Animated.timing(panierAnim, {
                toValue: 0,
                duration: 800,
                easing: Easing.linear, 
                useNativeDriver: true,
            }),
            
            
            Animated.sequence([
                Animated.timing(bounceAnim, {
                    toValue: 1.2,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.elastic(1),
                    useNativeDriver: true,
                }),
            ]),
            
           
            Animated.parallel([
                Animated.timing(textAnim, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Redirection après 3.5 secondes
        setTimeout(() => {
            navigation.replace("FirstScreen");
        }, 3500);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Panier avec animation de translation et de rebond */}
                <Animated.Image 
                    source={require('../assets/panier.png')} 
                    style={[
                        styles.img,
                        {
                            transform: [
                                { translateX: panierAnim },
                                { scale: bounceAnim },
                            ],
                        }
                    ]} 
                />
                
                {/* Texte qui suit avec effet de fondu */}
                <Animated.Text 
                    style={[
                        styles.txt,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { translateX: textAnim }
                            ]
                        }
                    ]}
                >
                    Supérette Express
                </Animated.Text>
            </View>
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2E7D32',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    txt: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 15,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    img: {
        width: 90,
        height: 90,
        tintColor: '#fff',
    }
});