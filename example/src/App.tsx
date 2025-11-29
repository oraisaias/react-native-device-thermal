import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  isThermalMonitoringAvailable,
  getThermalState,
  getThermalInfo,
  addThermalStateListener,
  type ThermalState,
  type ThermalEvent,
} from 'react-native-device-thermal';

export default function App() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [currentState, setCurrentState] = useState<ThermalState>('unknown');
  const [thermalInfo, setThermalInfo] = useState<ThermalEvent | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [eventHistory, setEventHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  useEffect(() => {
    if (!isListening) return;

    const subscription = addThermalStateListener((event) => {
      setCurrentState(event.state);
      setThermalInfo(event);
      addEventToHistory(
        `Event: ${event.state} (${event.platformState}) at ${new Date().toLocaleTimeString()}`
      );
    });

    return () => {
      subscription.remove();
    };
  }, [isListening]);

  const checkAvailability = async () => {
    try {
      const available = await isThermalMonitoringAvailable();
      setIsAvailable(available);
    } catch (error) {
      console.error('Error checking availability:', error);
      setIsAvailable(false);
    }
  };

  const fetchThermalState = async () => {
    setLoading(true);
    try {
      const state = await getThermalState();
      setCurrentState(state);
      addEventToHistory(`Fetched state: ${state}`);
    } catch (error) {
      console.error('Error getting thermal state:', error);
      addEventToHistory(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchThermalInfo = async () => {
    setLoading(true);
    try {
      const info = await getThermalInfo();
      console.log({info})
      setThermalInfo(info);
      setCurrentState(info.state);
      addEventToHistory(
        `Fetched info: ${info.state} (${info.platformState})${
          info.temperature ? ` - ${info.temperature}°C` : ''
        }`
      );
    } catch (error) {
      console.error('Error getting thermal info:', error);
      addEventToHistory(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleListener = () => {
    setIsListening(!isListening);
    addEventToHistory(!isListening ? 'Started listening' : 'Stopped listening');
  };

  const clearHistory = () => {
    setEventHistory([]);
  };

  const addEventToHistory = (event: string) => {
    setEventHistory((prev) => [event, ...prev].slice(0, 20)); // Keep last 20 events
  };

  const getStateColor = (state: ThermalState): string => {
    switch (state) {
      case 'nominal':
        return '#4CAF50';
      case 'fair':
        return '#FFC107';
      case 'serious':
        return '#FF9800';
      case 'critical':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>Device Thermal Monitor</Text>

          {/* Availability Status */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📱 Availability</Text>
            <Text style={styles.statusText}>
              {isAvailable === null
                ? 'Checking...'
                : isAvailable
                ? '✅ Thermal monitoring available'
                : '❌ Not available on this device'}
            </Text>
          </View>

          {/* Current State */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌡️ Current Thermal State</Text>
            <View
              style={[
                styles.stateBadge,
                { backgroundColor: getStateColor(currentState) },
              ]}
            >
              <Text style={styles.stateText}>
                {currentState.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Thermal Info */}
          {thermalInfo && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📊 Thermal Info</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>State:</Text>
                <Text style={styles.infoValue}>{thermalInfo.state}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Platform State:</Text>
                <Text style={styles.infoValue}>
                  {thermalInfo.platformState}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Temperature:</Text>
                <Text style={styles.infoValue}>
                  {thermalInfo.temperature
                    ? `${thermalInfo.temperature}°C`
                    : 'N/A'}
                </Text>
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsCard}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={fetchThermalState}
              disabled={loading || !isAvailable}
            >
              <Text style={styles.buttonText}>Get Thermal State</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={fetchThermalInfo}
              disabled={loading || !isAvailable}
            >
              <Text style={styles.buttonText}>Get Thermal Info</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                isListening ? styles.buttonActive : styles.buttonSecondary,
              ]}
              onPress={toggleListener}
              disabled={!isAvailable}
            >
              <Text
                style={[
                  styles.buttonText,
                  !isListening && styles.buttonTextSecondary,
                ]}
              >
                {isListening ? '⏸️ Stop Listening' : '▶️ Start Listening'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Event History */}
          <View style={styles.card}>
            <View style={styles.historyHeader}>
              <Text style={styles.cardTitle}>📜 Event History</Text>
              {eventHistory.length > 0 && (
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={styles.clearButton}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            {eventHistory.length === 0 ? (
              <Text style={styles.emptyText}>No events yet</Text>
            ) : (
              eventHistory.map((event, index) => (
                <View key={index} style={styles.eventItem}>
                  <Text style={styles.eventDot}>•</Text>
                  <Text style={styles.eventText}>{event}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#424242',
  },
  stateBadge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  stateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '600',
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  buttonActive: {
    backgroundColor: '#F44336',
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonTextSecondary: {
    color: '#2196F3',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  eventItem: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  eventDot: {
    fontSize: 16,
    color: '#2196F3',
    marginRight: 8,
    marginTop: 2,
  },
  eventText: {
    fontSize: 14,
    color: '#424242',
    flex: 1,
  },
});
