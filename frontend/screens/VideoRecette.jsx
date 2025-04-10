import { View, StyleSheet } from 'react-native';
import React from 'react';
import { WebView } from 'react-native-webview';

const VideoRecette = ({ route }) => {
  const { url } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <WebView source={{ uri: url }} />
    </View>
  );
};

export default VideoRecette;
