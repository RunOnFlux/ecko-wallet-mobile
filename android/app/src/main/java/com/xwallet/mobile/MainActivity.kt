package com.xwallet.mobile

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        RNBootSplash.init(this, R.style.BootTheme) // <- here we pass the theme
        // Pass null, not savedInstanceState: react-native-screens fragments must never be
        // restored by Android. After the OS kills the app in the background, restoring them
        // throws Fragment$InstantiationException ("Screen fragments should never be restored").
        // JS state is rebuilt from scratch on launch anyway.
        super.onCreate(null)
    }

    override fun getMainComponentName(): String = "kadena"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}