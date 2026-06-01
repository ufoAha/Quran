#!/usr/bin/bash
path=~/Projects/Quran
version_code=10;version_name=10
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
    rm -r compiled
}

function dexer () {
    javac src/QuranMain.java src/truth/quran/R.java -cp ~/android_sdk/platforms/android-36/android.jar
    SKIP_JDK_VERSION_CHECK=true d8 src/*class src/truth/quran/*class
}

function make_assets () {
    mkdir -p compiled/assets
    cp -r assets/css compiled/assets
    cp -r assets/fonts compiled/assets
    cp -r assets/surahs compiled/assets
    cp assets/index.html compiled/assets

    mkdir compiled/assets/js
    # uglifyjs assets/js/fuzzy_search.js -o compiled/assets/js/fuzzy_search.js
    uglifyjs assets/js/script.js -o compiled/assets/js/script.js
    
}

cd $path
aapt2 compile res/values/styles.xml -o res/values/
aapt2 compile res/drawable/ic_background.xml -o res/drawable
aapt2 compile res/drawable/ic_foreground.xml -o res/drawable
aapt2 compile res/mipmap-anydpi-v26/ic_launcher.xml -o res/mipmap-anydpi-v26/

if [[ "$1" == "bundle" ]]; then
    dexer
    make_assets
    aapt2 link --proto-format -o bundle/proto.zip -I ~/android_sdk/platforms/android-36/android.jar\
    res/drawable/*flat res/values/*flat res/m*/*flat --manifest AndroidManifest.xml\
    --java src/ -A compiled/assets --version-code $version_code --version-name $version_name
    rm -r compiled
    cd bundle; unzip proto.zip; rm proto.zip
    if [[ -f app.aab ]]; then rm app.aab; fi
    mkdir manifest; mkdir dex
    mv AndroidManifest.xml manifest; mv ../classes.dex dex
    zip -r module.zip *; rm -r !(*.zip)
    bundletool build-bundle --modules=module.zip --output=app.aab; rm module.zip
    jarsigner -keystore ../$keystore app.aab $key_alias <<< $pass
    exit
else
    make_assets
    aapt2 link -o unsigned.apk -I ~/android_sdk/platforms/android-36/android.jar \
    res/drawable/*flat res/values/*flat res/m*/*flat --manifest AndroidManifest.xml --java src/ -A compiled/assets \
    --version-code $version_code --version-name $version_name
fi

dexer

zip -u unsigned.apk classes.dex

apksigner sign --ks $keystore --out signed.apk unsigned.apk <<< $pass
clean

adb uninstall truth.quran
adb install signed.apk
