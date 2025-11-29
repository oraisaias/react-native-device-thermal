import { NativeEventEmitter } from 'react-native';
import NativeDeviceThermal from './NativeDeviceThermal';
import type { ThermalEvent, ThermalState } from './NativeDeviceThermal';

const emitter = new NativeEventEmitter(NativeDeviceThermal);

export function isThermalMonitoringAvailable(): Promise<boolean> {
  return NativeDeviceThermal.isAvailable();
}

export function getThermalState(): Promise<ThermalState> {
  return NativeDeviceThermal.getThermalState();
}

export function getThermalInfo(): Promise<ThermalEvent> {
  return NativeDeviceThermal.getThermalInfo();
}

export function addThermalStateListener(
  listener: (event: ThermalEvent) => void
) {
  return emitter.addListener('thermalDidChange', (ev) => {
    listener(ev as ThermalEvent);
  });
}

export type { ThermalEvent, ThermalState };
