#import "DeviceThermal.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import <DeviceThermalSpec/DeviceThermalSpec.h>
#endif

@implementation DeviceThermal

RCT_EXPORT_MODULE(DeviceThermal)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (instancetype)init
{
  if (self = [super init]) {
    _hasListeners = NO;
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[ @"thermalDidChange" ];
}

- (void)startObserving
{
  _hasListeners = YES;
}

- (void)stopObserving
{
  _hasListeners = NO;
}

RCT_EXPORT_METHOD(isAvailable:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  // TODO: implementar verificación real
  resolve(@(NO));
}

RCT_EXPORT_METHOD(getThermalState:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  // TODO: implementar lectura real
  resolve(@"unknown");
}

RCT_EXPORT_METHOD(getThermalInfo:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  // TODO: implementar lectura real
  NSDictionary *info = @{
    @"state": @"unknown",
    @"platformState": @"UNSUPPORTED",
    @"temperature": [NSNull null]
  };
  resolve(info);
}

RCT_EXPORT_METHOD(addListener:(NSString *)eventName)
{
  // Will be called when the first listener is added
  _hasListeners = YES;
  // TODO: iniciar monitoreo térmico real en el futuro
}

RCT_EXPORT_METHOD(removeListeners:(double)count)
{
  // Will be called when listeners are removed
  if (count == 0 || count >= 1) {
    _hasListeners = NO;
    // TODO: detener monitoreo en el futuro
  }
}

// Método helper para emitir eventos (usar en el futuro)
- (void)emitThermalEvent:(NSDictionary *)eventData
{
  if (!_hasListeners) return;

  [self sendEventWithName:@"thermalDidChange" body:eventData];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeDeviceThermalSpecJSI>(params);
}
#endif

@end
