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

- (void)dealloc
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
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
  [[NSNotificationCenter defaultCenter] removeObserver:self
                                                   name:NSProcessInfoThermalStateDidChangeNotification
                                                 object:nil];
}

#pragma mark - Helper Methods

- (NSString *)thermalStateToString:(NSProcessInfoThermalState)state
{
  switch (state) {
    case NSProcessInfoThermalStateNominal:
      return @"nominal";
    case NSProcessInfoThermalStateFair:
      return @"fair";
    case NSProcessInfoThermalStateSerious:
      return @"serious";
    case NSProcessInfoThermalStateCritical:
      return @"critical";
    default:
      return @"unknown";
  }
}

- (NSString *)thermalStatePlatformString:(NSProcessInfoThermalState)state
{
  switch (state) {
    case NSProcessInfoThermalStateNominal:
      return @"NSProcessInfoThermalStateNominal";
    case NSProcessInfoThermalStateFair:
      return @"NSProcessInfoThermalStateFair";
    case NSProcessInfoThermalStateSerious:
      return @"NSProcessInfoThermalStateSerious";
    case NSProcessInfoThermalStateCritical:
      return @"NSProcessInfoThermalStateCritical";
    default:
      return @"NSProcessInfoThermalStateUnknown";
  }
}

- (NSDictionary *)currentThermalInfo
{
  NSProcessInfoThermalState state = [[NSProcessInfo processInfo] thermalState];

  return @{
    @"state": [self thermalStateToString:state],
    @"platformState": [self thermalStatePlatformString:state],
    @"temperature": [NSNull null]  // iOS no expone temperatura directamente
  };
}

#pragma mark - Thermal State Change Handler

- (void)thermalStateDidChange:(NSNotification *)notification
{
  if (!_hasListeners) return;

  NSDictionary *info = [self currentThermalInfo];
  [self sendEventWithName:@"thermalDidChange" body:info];
}

#pragma mark - Exported Methods

RCT_EXPORT_METHOD(isAvailable:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  // Thermal state monitoring está disponible desde iOS 11+
  if (@available(iOS 11.0, *)) {
    resolve(@(YES));
  } else {
    resolve(@(NO));
  }
}

RCT_EXPORT_METHOD(getThermalState:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  if (@available(iOS 11.0, *)) {
    NSProcessInfoThermalState state = [[NSProcessInfo processInfo] thermalState];
    resolve([self thermalStateToString:state]);
  } else {
    resolve(@"unknown");
  }
}

RCT_EXPORT_METHOD(getThermalInfo:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  if (@available(iOS 11.0, *)) {
    resolve([self currentThermalInfo]);
  } else {
    NSDictionary *info = @{
      @"state": @"unknown",
      @"platformState": @"UNSUPPORTED",
      @"temperature": [NSNull null]
    };
    resolve(info);
  }
}

RCT_EXPORT_METHOD(addListener:(NSString *)eventName)
{
  // Will be called when the first listener is added
  if (!_hasListeners && @available(iOS 11.0, *)) {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(thermalStateDidChange:)
                                                 name:NSProcessInfoThermalStateDidChangeNotification
                                               object:nil];
  }
  _hasListeners = YES;
}

RCT_EXPORT_METHOD(removeListeners:(double)count)
{
  // Will be called when listeners are removed
  // Note: React Native calls this when listeners are removed, not necessarily all
  // We'll stop observing when _hasListeners is set to NO by stopObserving
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeDeviceThermalSpecJSI>(params);
}
#endif

@end
