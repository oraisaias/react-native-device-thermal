import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type ThermalState =
  | 'unknown'
  | 'nominal'
  | 'fair'
  | 'serious'
  | 'critical';

export type ThermalEvent = {
  state: ThermalState;
  platformState: string;
  temperature?: number | null;
};

export interface Spec extends TurboModule {
  isAvailable(): Promise<boolean>;
  getThermalState(): Promise<ThermalState>;
  getThermalInfo(): Promise<ThermalEvent>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('DeviceThermal');
