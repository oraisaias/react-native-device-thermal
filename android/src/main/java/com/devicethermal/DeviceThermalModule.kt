package com.devicethermal

import android.os.Build
import android.os.PowerManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.Executor

class DeviceThermalModule(reactContext: ReactApplicationContext) :
  NativeDeviceThermalSpec(reactContext) {

  private var powerManager: PowerManager? = null
  private var thermalStatusListener: PowerManager.OnThermalStatusChangedListener? = null
  private var listenerCount = 0

  init {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      powerManager = reactContext.getSystemService(PowerManager::class.java)
    }
  }

  override fun getName(): String = NAME

  override fun isAvailable(promise: Promise) {
    // Thermal state monitoring disponible desde Android 10 (API 29)
    promise.resolve(Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
  }

  override fun getThermalState(promise: Promise) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      val status = powerManager?.currentThermalStatus ?: PowerManager.THERMAL_STATUS_NONE
      promise.resolve(thermalStatusToString(status))
    } else {
      promise.resolve("unknown")
    }
  }

  override fun getThermalInfo(promise: Promise) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      val status = powerManager?.currentThermalStatus ?: PowerManager.THERMAL_STATUS_NONE
      val info = createThermalInfo(status)
      promise.resolve(info)
    } else {
      val info = Arguments.createMap().apply {
        putString("state", "unknown")
        putString("platformState", "UNSUPPORTED")
        putNull("temperature")
      }
      promise.resolve(info)
    }
  }

  override fun addListener(eventName: String?) {
    listenerCount++

    // Solo registrar el listener la primera vez
    if (listenerCount == 1 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      registerThermalStatusListener()
    }
  }

  override fun removeListeners(count: Double) {
    listenerCount -= count.toInt()

    // Desregistrar cuando no hay más listeners
    if (listenerCount <= 0) {
      listenerCount = 0
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        unregisterThermalStatusListener()
      }
    }
  }

  override fun invalidate() {
    super.invalidate()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      unregisterThermalStatusListener()
    }
  }

  // Helper methods

  private fun thermalStatusToString(status: Int): String {
    return when (status) {
      PowerManager.THERMAL_STATUS_NONE -> "nominal"
      PowerManager.THERMAL_STATUS_LIGHT -> "fair"
      PowerManager.THERMAL_STATUS_MODERATE -> "fair"
      PowerManager.THERMAL_STATUS_SEVERE -> "serious"
      PowerManager.THERMAL_STATUS_CRITICAL -> "critical"
      PowerManager.THERMAL_STATUS_EMERGENCY -> "critical"
      PowerManager.THERMAL_STATUS_SHUTDOWN -> "critical"
      else -> "unknown"
    }
  }

  private fun thermalStatusPlatformString(status: Int): String {
    return when (status) {
      PowerManager.THERMAL_STATUS_NONE -> "THERMAL_STATUS_NONE"
      PowerManager.THERMAL_STATUS_LIGHT -> "THERMAL_STATUS_LIGHT"
      PowerManager.THERMAL_STATUS_MODERATE -> "THERMAL_STATUS_MODERATE"
      PowerManager.THERMAL_STATUS_SEVERE -> "THERMAL_STATUS_SEVERE"
      PowerManager.THERMAL_STATUS_CRITICAL -> "THERMAL_STATUS_CRITICAL"
      PowerManager.THERMAL_STATUS_EMERGENCY -> "THERMAL_STATUS_EMERGENCY"
      PowerManager.THERMAL_STATUS_SHUTDOWN -> "THERMAL_STATUS_SHUTDOWN"
      else -> "THERMAL_STATUS_UNKNOWN"
    }
  }

  private fun createThermalInfo(status: Int): WritableMap {
    
    return Arguments.createMap().apply {
      putString("state", thermalStatusToString(status))
      putString("platformState", thermalStatusPlatformString(status))
      putNull("temperature") // Android no expone temperatura directamente vía PowerManager
    }
  }

  private fun registerThermalStatusListener() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      val listener = PowerManager.OnThermalStatusChangedListener { status ->
        sendThermalEvent(createThermalInfo(status))
      }
      thermalStatusListener = listener

      // Usar el executor del main thread
      val executor = Executor { command ->
        reactApplicationContext.runOnUiQueueThread(command)
      }

      powerManager?.addThermalStatusListener(executor, listener)
    }
  }

  private fun unregisterThermalStatusListener() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      thermalStatusListener?.let { listener ->
        powerManager?.removeThermalStatusListener(listener)
      }
      thermalStatusListener = null
    }
  }

  private fun sendThermalEvent(info: WritableMap) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("thermalDidChange", info)
  }

  companion object {
    const val NAME = "DeviceThermal"
  }
}
