#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <DeviceThermalSpec/DeviceThermalSpec.h>

@interface DeviceThermal : RCTEventEmitter <NativeDeviceThermalSpec> {
  BOOL _hasListeners;
}
#else
#import <React/RCTBridgeModule.h>

@interface DeviceThermal : RCTEventEmitter <RCTBridgeModule> {
  BOOL _hasListeners;
}
#endif

@end
