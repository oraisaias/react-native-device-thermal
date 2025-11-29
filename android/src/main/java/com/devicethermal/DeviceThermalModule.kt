package com.devicethermal

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Arguments

class DeviceThermalModule(reactContext: ReactApplicationContext) :
  NativeDeviceThermalSpec(reactContext) {

  override fun getName(): String = NAME

  override fun isAvailable(promise: Promise) {
    // TODO: implement real thermal check
    promise.resolve(false)
  }

  override fun getThermalState(promise: Promise) {
    // TODO: implement real thermal state
    promise.resolve("unknown")
  }

  override fun getThermalInfo(promise: Promise) {
    // TODO: implement real thermal info
    val map = Arguments.createMap().apply {
      putString("state", "unknown")
      putString("platformState", "UNSUPPORTED")
      putNull("temperature")
    }
    promise.resolve(map)
  }

  override fun addListener(eventName: String?) {
    // TODO: track listeners if needed
    // Keep count with setListenerCount() for proper lifecycle
  }

  override fun removeListeners(count: Double) {
    // TODO: stop tracking listeners when count == 0
  }

  companion object {
    const val NAME = "DeviceThermal"
  }
}
