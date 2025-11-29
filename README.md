# react-native-device-thermal

Monitor the thermal state of your iOS and Android devices in real-time with React Native.

## Features

- 🌡️ Get current thermal state of the device
- 📊 Receive real-time thermal state change events
- 🔥 Cross-platform support (iOS 11+ and Android 10+)
- ⚡ Built with TurboModules and the New Architecture
- 📱 Supports both new and legacy React Native architectures
- 🎯 Fully typed TypeScript API

## Installation

```bash
npm install react-native-device-thermal
```

or

```bash
yarn add react-native-device-thermal
```

### iOS

```bash
cd ios && pod install
```

### Android

No additional steps required.

## Platform Requirements

| Platform | Minimum Version | API |
|----------|----------------|-----|
| iOS      | iOS 11.0       | `NSProcessInfo.thermalState` |
| Android  | Android 10 (API 29) | `PowerManager.currentThermalStatus` |

## API

### `isThermalMonitoringAvailable()`

Check if thermal monitoring is available on the current device.

```typescript
function isThermalMonitoringAvailable(): Promise<boolean>
```

**Returns:** `Promise<boolean>` - `true` if available, `false` otherwise.

**Example:**

```typescript
import { isThermalMonitoringAvailable } from 'react-native-device-thermal';

const isAvailable = await isThermalMonitoringAvailable();
console.log('Thermal monitoring available:', isAvailable);
```

---

### `getThermalState()`

Get the current thermal state of the device.

```typescript
function getThermalState(): Promise<ThermalState>
```

**Returns:** `Promise<ThermalState>` - The current thermal state.

**Example:**

```typescript
import { getThermalState } from 'react-native-device-thermal';

const state = await getThermalState();
console.log('Current thermal state:', state); // 'nominal', 'fair', 'serious', 'critical', or 'unknown'
```

---

### `getThermalInfo()`

Get detailed thermal information including the platform-specific state.

```typescript
function getThermalInfo(): Promise<ThermalEvent>
```

**Returns:** `Promise<ThermalEvent>` - Detailed thermal information.

**Example:**

```typescript
import { getThermalInfo } from 'react-native-device-thermal';

const info = await getThermalInfo();
console.log('Thermal info:', info);
// {
//   state: 'nominal',
//   platformState: 'THERMAL_STATUS_NONE', // Android
//   temperature: null
// }
```

---

### `addThermalStateListener()`

Listen to thermal state changes in real-time.

```typescript
function addThermalStateListener(
  listener: (event: ThermalEvent) => void
): EmitterSubscription
```

**Parameters:**
- `listener`: Callback function that receives `ThermalEvent` when the thermal state changes.

**Returns:** `EmitterSubscription` - Subscription object with a `remove()` method.

**Example:**

```typescript
import { addThermalStateListener } from 'react-native-device-thermal';

const subscription = addThermalStateListener((event) => {
  console.log('Thermal state changed:', event.state);
  console.log('Platform state:', event.platformState);
});

// Later, to stop listening:
subscription.remove();
```

---

## Types

### `ThermalState`

Normalized thermal states across platforms:

```typescript
type ThermalState =
  | 'unknown'   // Unable to determine or not supported
  | 'nominal'   // Normal temperature
  | 'fair'      // Slightly elevated, no action needed
  | 'serious'   // High temperature, reduce performance
  | 'critical'  // Very high temperature, immediate action needed
```

### `ThermalEvent`

```typescript
type ThermalEvent = {
  state: ThermalState;        // Normalized state
  platformState: string;      // Platform-specific state string
  temperature?: number | null; // Temperature in Celsius (currently always null)
}
```

## Platform-Specific States

### iOS (NSProcessInfoThermalState)

| iOS State | Normalized State | Description |
|-----------|-----------------|-------------|
| `NSProcessInfoThermalStateNominal` | `nominal` | No thermal issues |
| `NSProcessInfoThermalStateFair` | `fair` | Slightly elevated |
| `NSProcessInfoThermalStateSerious` | `serious` | Thermal pressure, reduce work |
| `NSProcessInfoThermalStateCritical` | `critical` | High thermal pressure, reduce work significantly |

### Android (PowerManager.ThermalStatus)

| Android State | Normalized State | Description |
|--------------|-----------------|-------------|
| `THERMAL_STATUS_NONE` (0) | `nominal` | No thermal issues |
| `THERMAL_STATUS_LIGHT` (1) | `fair` | Light thermal throttling |
| `THERMAL_STATUS_MODERATE` (2) | `fair` | Moderate thermal throttling |
| `THERMAL_STATUS_SEVERE` (3) | `serious` | Severe thermal throttling |
| `THERMAL_STATUS_CRITICAL` (4) | `critical` | Critical thermal state |
| `THERMAL_STATUS_EMERGENCY` (5) | `critical` | Emergency thermal state |
| `THERMAL_STATUS_SHUTDOWN` (6) | `critical` | Device about to shutdown |

## Usage Example

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import {
  isThermalMonitoringAvailable,
  getThermalState,
  getThermalInfo,
  addThermalStateListener,
  type ThermalState,
  type ThermalEvent,
} from 'react-native-device-thermal';

export default function App() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [thermalState, setThermalState] = useState<ThermalState>('unknown');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  useEffect(() => {
    if (!isListening) return;

    const subscription = addThermalStateListener((event: ThermalEvent) => {
      console.log('Thermal state changed:', event);
      setThermalState(event.state);
    });

    return () => {
      subscription.remove();
    };
  }, [isListening]);

  const checkAvailability = async () => {
    const available = await isThermalMonitoringAvailable();
    setIsAvailable(available);
  };

  const fetchState = async () => {
    const state = await getThermalState();
    setThermalState(state);
  };

  const fetchInfo = async () => {
    const info = await getThermalInfo();
    console.log('Thermal info:', info);
    setThermalState(info.state);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text>Available: {isAvailable ? 'Yes' : 'No'}</Text>
      <Text>State: {thermalState}</Text>

      <Button title="Get State" onPress={fetchState} />
      <Button title="Get Info" onPress={fetchInfo} />
      <Button
        title={isListening ? 'Stop Listening' : 'Start Listening'}
        onPress={() => setIsListening(!isListening)}
      />
    </View>
  );
}
```

## Practical Use Cases

### 1. Performance Optimization

Reduce app workload when device is overheating:

```typescript
const subscription = addThermalStateListener((event) => {
  if (event.state === 'serious' || event.state === 'critical') {
    // Reduce frame rate, disable animations, pause background tasks
    pauseHeavyOperations();
  } else if (event.state === 'nominal') {
    // Resume normal operations
    resumeHeavyOperations();
  }
});
```

### 2. User Notifications

Warn users about thermal issues:

```typescript
const state = await getThermalState();

if (state === 'critical') {
  Alert.alert(
    'Device Overheating',
    'Your device is very hot. Consider closing some apps or letting it cool down.'
  );
}
```

### 3. Gaming & AR Apps

Adjust graphics quality based on thermal state:

```typescript
addThermalStateListener((event) => {
  switch (event.state) {
    case 'nominal':
      setGraphicsQuality('ultra');
      break;
    case 'fair':
      setGraphicsQuality('high');
      break;
    case 'serious':
      setGraphicsQuality('medium');
      break;
    case 'critical':
      setGraphicsQuality('low');
      break;
  }
});
```

### 4. Video Recording Apps

Adjust video quality or stop recording:

```typescript
addThermalStateListener((event) => {
  if (event.state === 'critical') {
    // Stop 4K recording, switch to 1080p
    downgradeVideoQuality();
  }
});
```

## Limitations

- **Temperature reading**: Both iOS and Android do not expose actual temperature values through their public APIs. The `temperature` field will always be `null`.
- **iOS**: Thermal monitoring requires iOS 11 or later.
- **Android**: Thermal monitoring requires Android 10 (API 29) or later.
- **Emulators**: Thermal states may not work properly on emulators/simulators. Test on real devices.

## Troubleshooting

### iOS: Module not found

Make sure you've installed pods:

```bash
cd ios && pod install
```

### Android: Build errors

Ensure your `minSdkVersion` in `android/build.gradle` is at least 21 (though thermal APIs require API 29).

### No events received

1. Make sure you're testing on a real device, not an emulator
2. Verify thermal monitoring is available: `await isThermalMonitoringAvailable()`
3. Check that you're calling `addListener` before the subscription

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
