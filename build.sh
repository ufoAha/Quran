#!/usr/bin/bash
path=~/Projects/Quran
version_code=8;version_name=8
key_alias=uploadkey; keystore=my_keystore.p12 pass=1234312343
shopt -s extglob

clean () {
    cd $path
    rm src/*class
    rm src/truth/quran/*class
    rm res/drawable/*flat
    rm res/values/*flat
    rm *dex
    rm unsigned.apk
}

function dexer () {
    javac src/QuranMain.java src/truth/quran/R.java -cp ~/android_sdk/platforms/android-36/android.jar
    SKIP_JDK_VERSION_CHECK=true d8 src/*class src/truth/quran/*class
}

cd $path
aapt2 compile res/values/styles.xml -o res/values/
aapt2 compile res/drawable/ic_background.xml -o res/drawable
aapt2 compile res/drawable/ic_foreground.xml -o res/drawable
aapt2 compile res/mipmap-anydpi-v26/ic_launcher.xml -o res/mipmap-anydpi-v26/

if [[ "$1" == "bundle" ]]; then
    dexer
    aapt2 link --proto-format -o bundle/proto.zip -I ~/android_sdk/platforms/android-36/android.jar\
    res/drawable/*flat res/values/*flat res/m*/*flat --manifest AndroidManifest.xml\
    --java src/ -A assets --version-code $version_code --version-name $version_name
    cd bundle; unzip proto.zip; rm proto.zip
    if [[ -f app.aab ]]; then rm app.aab; fi
    mkdir manifest; mkdir dex
    mv AndroidManifest.xml manifest; mv ../classes.dex dex
    zip -r module.zip *; rm -r !(*.zip)
    bundletool build-bundle --modules=module.zip --output=app.aab; rm module.zip
    jarsigner -keystore ../$keystore app.aab $key_alias <<< $pass
    exit
else
    aapt2 link -o unsigned.apk -I ~/android_sdk/platforms/android-36/android.jar \
    res/drawable/*flat res/values/*flat res/m*/*flat --manifest AndroidManifest.xml --java src/ -A assets
fi

dexer

zip -u unsigned.apk classes.dex

apksigner sign --ks $keystore --out signed.apk unsigned.apk <<< $pass
clean

adb uninstall truth.quran
adb install signed.apk
