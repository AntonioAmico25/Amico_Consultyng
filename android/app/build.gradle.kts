plugins {
    id("com.android.application")
}

android {
    namespace = "br.com.amicoconsultyng.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "br.com.amicoconsultyng.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0-homolog"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
}

dependencies {
}
