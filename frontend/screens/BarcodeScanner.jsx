import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Button, Image, ActivityIndicator } from 'react-native';

export default function BarcodeScanner() {

    const backendUrl = "http://192.168.1.42:8080";

  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const imageUri =
    product?.image && typeof product.image === "string"
      ? product.image.startsWith("http") || product.image.startsWith("file://")
        ? product.image
        : `${backendUrl}${product.image}`
      : null;

  if (!permission) return <View/>;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }) => {
    setScannedData(data);
    setLoading(true);
    setProduct(null);
    setError(null);

    try {

      const response = await fetch(`http://192.168.1.42:8080/api/produits/codebarre/${data}`);

      if (!response.ok) throw new Error('Produit non trouvé');
      const produit = await response.json();
      setProduct(produit);
    } catch (err) {
      setError(err.message || 'Erreur lors de la récupération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: [ 'qr', 'ean13', 'code128' ],
        }}
        onBarcodeScanned={scannedData ? undefined : handleBarcodeScanned}
      />
      <View style={styles.bottom}>
        {loading && <ActivityIndicator size="large" color="#000" />}
        {error && <Text style={styles.error}>{error}</Text>}
        {product && (
          <View style={styles.productContainer}>
            <Text style={styles.title}>{product.nom}</Text>
            <Text style={styles.text}>Prix : {product.prix} DA</Text>
            <Text style={styles.text}>Catégorie : {product.categorie}</Text>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                onError={() => console.error("Erreur de chargement de l'image :", imageUri)}
              />
            ) : (
              <Text style={styles.error}>Image non disponible</Text>
            )}
            <Text style={[styles.stock, { color: product.stock > 0 ? 'green' : 'red' }]}>
              {product.stock > 0 ? 'Produit disponible en stock' : 'Produit en rupture de stock'}
            </Text>
          </View>
        )}
        {scannedData && !loading && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => {
              setScannedData(null);
              setProduct(null);
              setError(null);
            }}
          >
            <Text style={styles.text}>Scanner un autre produit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  message: { textAlign: 'center', paddingBottom: 10 },
  camera: { flex: 1 },
  bottom: { padding: 16 },
  text: { textAlign: 'center', padding: 4, fontSize: 16 },
  title: { textAlign: 'center', padding: 4, fontSize: 20, fontWeight: 'bold' },
  error: { textAlign: 'center', color: 'red', padding: 4 },
  image: { width: 150, height: 150, alignSelf: 'center', marginVertical: 10 },
  productContainer: { marginTop: 10, alignItems: 'center' }, 
  rescanButton: { marginTop: 10, alignItems: 'center' },
  stock: { marginTop: 10, fontSize: 16, fontWeight: 'bold' },
});
