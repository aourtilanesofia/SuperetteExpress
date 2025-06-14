import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import { Marker } from "react-native-maps";
import Layout from "../../components/Layout/Layout";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';

const Paiement = ({ route }) => {
  const navigation = useNavigation();
  const { commande } = route.params;
  const [prixLivraison, setPrixLivraison] = useState(60);
  const [tempsLivraison, setTempsLivraison] = useState(0);
  const fraistotal = 30;
  const numeroCommande = commande.numeroCommande;
  const [totalNet, setTotalNet] = useState(commande.total + 60 + fraistotal);
  const [nomClient, setNomClient] = useState('');
  const [telephoneClient, setTelephoneClient] = useState(commande?.client?.telephone || '');
  const [adresse, setAdresse] = useState("");
  const [position, setPosition] = useState("À ma porte");
  const [infoSupplementaire, setInfoSupplementaire] = useState("");
  const { t } = useTranslation();

  // Coordonnées de la supérette
  const superetteCoords = {
    latitude: 36.74095,
    longitude: 5.065763,
  };

  // Vitesse moyenne du livreur (40 km/h)
  const vitesseMoyenne = 40;

  // Fonction pour calculer la distance en km entre 2 points GPS
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const getPourcentageLivraison = (montant) => {
    if (montant < 1000) return 0.15;
    if (montant < 5000) return 0.10;
    return 0.05;
  };


  // Mettre à jour le prix et le temps quand la position change
  useEffect(() => {
    if (marker?.latitude && marker?.longitude) {
      const distance = calculateDistance(
        superetteCoords.latitude,
        superetteCoords.longitude,
        marker.latitude,
        marker.longitude
      );

      // Prix de livraison
      const distanceCalculee = Math.max(distance, 0.5); // Minimum 0.5 km
      const prixParKm = 20; // 30 DA par km

      // Calcul du prix
      const pourcentage = getPourcentageLivraison(commande.total);
      const baseLivraison = Math.max(commande.total * pourcentage, 60);
      const prixCalculé = baseLivraison + (prixParKm * distanceCalculee);
      const prixArrondi = Math.round(prixCalculé);
      // Temps de livraison - minimum 5 minutes
      const temps = Math.max(Math.round((distanceCalculee / vitesseMoyenne) * 60), 5);

      setPrixLivraison(prixArrondi);
      setTempsLivraison(Math.round(temps));

      const nouveauTotal = commande.total + prixArrondi + fraistotal;
      setTotalNet(nouveauTotal);
    }
  }, [marker, calculateDistance]);
  const handleTextChange = (text) => {
    //console.log('Numéro de téléphone:', text);
    setTelephoneClient(text);
  };
  const handleSauvegarder = () => {
    //console.log("Info sauvegardée :", infoSupplementaire);
    // Tu peux aussi fermer le modal ici si besoin
    setActiveModal(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://192.168.43.145:8080/api/v1/consommateur/${commande.userId}`);
        if (!response.ok) {
          throw new Error(`Erreur du serveur : ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setNomClient(data.nom);
        setTelephoneClient(data.telephone);
      } catch (error) {
        console.log('Erreur lors du chargement du client', error.message);
      }
    };
    if (commande?.userId) {
      fetchUser();
    }
    getCurrentLocation();
  }, [commande.userId]);

  // États pour les modals
  const [activeModal, setActiveModal] = useState(null);

  // États pour la carte
  const [region, setRegion] = useState({
    latitude: 36.7525,
    longitude: 5.0563,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [marker, setMarker] = useState(null);
  const [selectedAdresseOption, setSelectedAdresseOption] = useState("carte");

  const calculerPrixLivraison = (lat, lon) => {
    const distance = calculateDistance(
      superetteCoords.latitude,
      superetteCoords.longitude,
      lat,
      lon
    );

    const distanceCalculee = Math.max(distance, 0.5);
    const pourcentage = getPourcentageLivraison(commande.total);
    const baseLivraison = Math.max(commande.total * pourcentage, 60);
    const prix = Math.round(baseLivraison + (20 * distanceCalculee));

    const temps = Math.max(Math.round((distanceCalculee / vitesseMoyenne) * 60), 5);

    return { prix, temps };
  };

  // Obtenir la position actuelle
  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission de localisation refusée");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setRegion(newRegion);
      const newMarker = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setMarker(newMarker);
      // CALCUL DU PRIX IMMÉDIAT
      const { prix, temps } = calculerPrixLivraison(
        newMarker.latitude,
        newMarker.longitude
      );
      setPrixLivraison(prix);
      setTempsLivraison(temps);
      setTotalNet(commande.total + prix + fraistotal);


      // Obtenir l'adresse à partir des coordonnées
      let address = await Location.reverseGeocodeAsync(newMarker);
      if (address[0]) {
        const { name, street, city, country } = address[0];
        const rue = street || name || '';
        const fullAdresse = `${rue}, ${city || ''}, ${country || ''}`;
        setAdresse(fullAdresse);
        setPosition(`À ma porte (${fullAdresse})`);
      }
    } catch (error) {
      console.error("Erreur de localisation:", error);
      alert("Impossible d'obtenir la position");
    }
  };

  // Gérer la sélection sur la carte
  const handleMapPress = async (e) => {
    const newMarker = {
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    };

    // Mettre à jour le marqueur IMMÉDIATEMENT
    setMarker(newMarker);

    // Calculer le prix SYNCHRONEMENT
    const distance = calculateDistance(
      superetteCoords.latitude,
      superetteCoords.longitude,
      newMarker.latitude,
      newMarker.longitude
    );

    const distanceCalculee = Math.max(distance, 0.5);
    const nouveauPrix = Math.round(60 + (20 * distanceCalculee));

    // Mise à jour synchrone des états
    setPrixLivraison(nouveauPrix);
    setTempsLivraison(Math.max((distanceCalculee / 40) * 60, 5));
    setTotalNet(commande.total + nouveauPrix + fraistotal);

    // Reverse geocoding (peut rester asynchrone)
    try {
      let address = await Location.reverseGeocodeAsync(newMarker);
      if (address[0]) {
        const { name, street, city, country } = address[0];
        const rue = street || name || '';
        const fullAdresse = `${rue}, ${city || ''}, ${country || ''}`;
        setAdresse(fullAdresse);
      }
    } catch (err) {
      console.error("Erreur reverse geocoding :", err);
    }
  };

  const handleValider = async () => {
    try {
      const response = await fetch(`http://192.168.43.145:8080/api/commandes/livraison/${commande.numeroCommande}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numeroCommande: commande.numeroCommande,
          adresse: adresse,
          infoSupplementaire: infoSupplementaire,
          totalNet: totalNet,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erreur serveur :", data.message);
        return;
      }

      navigation.navigate("Liv1", {
        commande: {
          ...commande,
          total: totalNet,
        },
        adresseLivraison: adresse,
        nomClient: nomClient,
        telephoneClient: telephoneClient,
        infoSupplementaire: infoSupplementaire,
        numeroCommande: numeroCommande,
      });

    } catch (err) {
      console.error("Erreur réseau :", err.message);
    }
  };

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>{t('livraison')}</Text>

        {/* Option Adresse */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => setActiveModal('adresse')}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionIcon}>
              <Ionicons name="location-sharp" size={24} color="#2E7D32" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionLabel}>{t('adr')}</Text>
              <Text style={styles.optionValue} numberOfLines={1}>{adresse || "Sélectionner une adresse"}</Text>
              {marker && (
                <Text style={styles.infoSupplementaireText}>
                  Distance: {calculateDistance(
                    superetteCoords.latitude,
                    superetteCoords.longitude,
                    marker.latitude,
                    marker.longitude
                  ).toFixed(2)} km • Temps estimé: {tempsLivraison} min
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </View>
        </TouchableOpacity>

        {/* Options de livraison */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => setActiveModal('options')}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionIcon}>
              <Fontisto name="motorcycle" size={24} color="#2E7D32" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionLabel}>{t('option')}</Text>
              <Text style={styles.optionValue}>À ma porte</Text>
              {infoSupplementaire && (
                <Text style={styles.infoSupplementaireText}>{infoSupplementaire}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
          </View>
        </TouchableOpacity>

        {/* Infos destinataire */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => setActiveModal('destinataire')}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionIcon}>
              <Ionicons name="person" size={24} color="#2E7D32" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionLabel}>{t('infodes')}</Text>
              <Text style={styles.optionValue}>{nomClient || 'Nom non renseigné'}</Text>
              <Text style={styles.optionValue}>{telephoneClient || 'Téléphone non renseigné'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </View>
        </TouchableOpacity>

        {/* Section Facturation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('fact')}</Text>
          <View style={styles.facturationCard}>
            <View style={styles.facturationRow}>
              <Text style={styles.facturationLabel}>{t('soustotal')}</Text>
              <Text style={styles.facturationValue}>{commande.total} DA</Text>
            </View>
            <View style={styles.facturationRow}>
              <Text style={styles.facturationLabel}>{t('livraison')}</Text>
              <Text style={styles.facturationValue}>{prixLivraison} DA</Text>
            </View>
            <View style={styles.facturationRow}>
              <Text style={styles.facturationLabel}>{t('Fraisdeservice')}</Text>
              <Text style={styles.facturationValue}>{fraistotal} DA</Text>
            </View>
            <View style={[styles.facturationRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>{t('totalnet')}</Text>
              <Text style={styles.totalValue}>{totalNet.toFixed(2)} DA</Text>
            </View>
          </View>
        </View>

        {/* Bouton Passer commande */}
        <TouchableOpacity
          style={styles.commanderButton}
          activeOpacity={0.9}
          onPress={handleValider}
        >
          <Text style={styles.commanderButtonText}>{t('valider')}</Text>
        </TouchableOpacity>

        {/* Modal Adresse */}
        {/* Modals (le contenu reste exactement le même) */}
        <Modal
          animationType="slide"
          visible={!!activeModal}
          onRequestClose={() => setActiveModal(null)}
          transparent={false}
        >
          <View style={styles.modalContainer}>
            {/* Contenu du modal Adresse */}
            {activeModal === 'adresse' && (
              <>
                <Text style={styles.modalTitle}>{t('choisirAdr')}</Text>

                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => setSelectedAdresseOption("carte")}
                >
                  <View style={styles.radio}>
                    {selectedAdresseOption === "carte" && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.modalOptionText}>{t('selectcart')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => setSelectedAdresseOption("manuel")}
                >
                  <View style={styles.radio}>
                    {selectedAdresseOption === "manuel" && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.modalOptionText}>{t('saisiradr')}</Text>
                </TouchableOpacity>

                {selectedAdresseOption === "carte" && (
                  <MapView
                    style={styles.map}
                    region={region}
                    onPress={handleMapPress}
                  >
                    {marker && <Marker
                      coordinate={marker}
                      identifier="uniqueMarkerId"
                    />}
                  </MapView>
                )}

                {selectedAdresseOption === "manuel" && (
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez votre adresse complète"
                    value={adresse}
                    onChangeText={setAdresse}
                  />
                )}

                {/* Boutons spécifiques au modal Adresse */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => {
                      setActiveModal(null);
                      if (selectedAdresseOption === "carte" && marker) {
                        setPosition(`À ma porte (${adresse})`);
                      }
                    }}
                  >
                    <Text style={styles.confirmButtonText}>{t('enregistreradr')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Contenu du modal Position */}
            {activeModal === 'position' && (
              <>
                <Text style={styles.modalTitle}>Position actuelle</Text>

                <MapView
                  style={styles.map}
                  region={region}
                  showsUserLocation={true}
                  followsUserLocation={true}
                >
                  <Marker
                    coordinate={region}
                    identifier="currentLocationMarker"
                  />
                </MapView>

                <Text style={styles.positionText}>{position}</Text>

                {/* Boutons spécifiques au modal Position */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setActiveModal(null)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => {
                      setActiveModal(null);
                      // Logique spécifique pour la position
                    }}
                  >
                    <Text style={styles.confirmButtonText}>Utiliser cette position</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Contenu du modal Options */}
            {activeModal === 'options' && (
              <>
                <Text style={styles.modalTitle}>{t('infosup')}</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Ajouter détails (facultatif)"
                  value={infoSupplementaire}
                  onChangeText={setInfoSupplementaire}
                />

                <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 10 }}>
                  {t('infosupaj')}
                </Text>

                {/* Boutons spécifiques au modal Options */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.sauvgardeButton}
                    onPress={handleSauvegarder}
                  >
                    <Text style={styles.confirmButtonText}>{t('Sauvegarder')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Contenu du modal Destinataire */}
            {activeModal === 'destinataire' && (
              <>
                <Text style={styles.modalTitle}>{t('infodes')}</Text>

                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
                  {t('livutil')}
                </Text>


                <Text style={{ fontSize: 15, fontWeight: 'bold', marginTop: 20 }}>
                  {t('nom')}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nom complet"
                  value={nomClient || ''}
                  onChangeText={(text) => setNomClient(text)}
                />
                <Text style={{ fontSize: 15, fontWeight: 'bold', marginTop: 10 }}>
                  {t('num')}
                </Text>
                <TextInput
                  style={[styles.input, { color: 'black' }]}
                  placeholder="Numéro de téléphone"
                  keyboardType="phone-pad"
                  value={telephoneClient}
                  onChangeText={(text) => {
                    console.log('Setting telephone:', text);
                    setTelephoneClient(text);
                  }}
                />

                {/* Boutons spécifiques au modal Destinataire */}
                <View style={styles.modalButtons}>

                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => {
                      setActiveModal(null);
                      // Logique spécifique pour le destinataire
                    }}
                  >
                    <Text style={styles.confirmButtonText}>{t('confirmer')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Modal>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 16,
    marginTop: 15,
  },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionValue: {
    fontSize: 14,
    color: '#666',
  },
  infoSupplementaireText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  facturationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    bottom: 10
  },
  facturationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  facturationLabel: {
    fontSize: 15,
    color: '#666',

  },
  facturationValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '700',
  },
  commanderButton: {
    backgroundColor: '#2E7D32',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
    marginTop: 24,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    bottom: 20,

  },
  commanderButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',

  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#CCC',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E7D32',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  map: {
    width: '100%',
    height: 500,
    marginVertical: 20,
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  sauvgardeButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
});

export default Paiement;