import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// Ensure react-native-css-interop / NativeWind use class-based dark mode on web
// (prevents runtime error: "Cannot manually set color scheme, as dark mode is type 'media'.")
(StyleSheet as any).setFlag?.('darkMode', 'class');

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
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
