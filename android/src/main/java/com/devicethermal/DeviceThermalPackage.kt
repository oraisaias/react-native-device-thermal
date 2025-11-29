package com.devicethermal

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class DeviceThermalPackage : TurboReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == DeviceThermalModule.NAME) {
      DeviceThermalModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      mapOf(
        DeviceThermalModule.NAME to ReactModuleInfo(
          DeviceThermalModule.NAME,  // name
          DeviceThermalModule.NAME,  // className
          false,  // canOverrideExistingModule
          false,  // needsEagerInit
          false,  // isCxxModule
          true    // isTurboModule
        )
      )
    }
  }
}
