import { Text, View, StyleSheet } from 'react-native';
import { getThermalState } from 'react-native-device-thermal';

const result = getThermalState();

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Thermal State: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
