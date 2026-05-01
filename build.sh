#!/usr/bin/bash
path=~/Projects/Quran

clean () {
    cd $path
    rm src/*class
    rm src/truth/quran/mine/*class
    rm res/drawable/*flat
    rm res/values/*flat
    rm *dex
    rm *apk*
}

if [[ $1 == "clean" ]]; then
    clean && exit
fi

clean

cd $path

aapt2 compile res/drawable/ic_launcher.png -o res/drawable/
aapt2 compile res/values/styles.xml -o res/values/

aapt2 link -o unsigned.apk -I ~/android_sdk/platforms/android-36/android.jar \
res/drawable/*flat res/values/*flat --manifest AndroidManifest.xml --java src/ -A assets

javac src/QuranMain.java src/truth/quran/mine/R.java -cp ~/android_sdk/platforms/android-36/android.jar
# javac src/truth/quran/mine/R.java

SKIP_JDK_VERSION_CHECK=true d8 src/*class src/truth/quran/mine/*class

zip -u unsigned.apk classes.dex

apksigner sign --ks my_keystore.jks --out signed.apk unsigned.apk <<< 1234312343

adb uninstall truth.quran.mine
adb install signed.apk