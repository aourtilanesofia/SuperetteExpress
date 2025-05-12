import { StyleSheet, Text, View, Image, Animated, Easing } from 'react-native';
import React, { useEffect, useRef } from 'react';

const SplashScreen = ({ navigation }) => {
    // Création des valeurs animées
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const positionAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animation en séquence
        Animated.sequence([
            // Fade in + scale up
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    easing: Easing.elastic(1),
                    useNativeDriver: true,
                }),
            ]),
            // Bounce effect
            Animated.sequence([
                Animated.timing(positionAnim, {
                    toValue: -20,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(positionAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]),
            // Rotation du panier
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        ]).start();

        // Redirection après 3 secondes
        setTimeout(() => {
            navigation.replace("FirstScreen");
        }, 3000);
    }, [fadeAnim, scaleAnim, rotateAnim, positionAnim, navigation]);

    // Interpolation pour la rotation
    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.View 
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            { translateY: positionAnim },
                        ],
                    }
                ]}
            >
                <Text style={styles.txt}>Superette Express</Text>
                <Animated.Image 
                    source={require('../assets/panier.png')} 
                    style={[
                        styles.img,
                        {
                            transform: [
                                { rotate: rotateInterpolate },
                            ],
                        }
                    ]} 
                />
            </Animated.View>
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
        marginRight: 15,
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