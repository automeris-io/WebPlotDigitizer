Third party dependencies:

Use the ./getThirdparty.sh script:

    cd app/thirdparty
    ./getThirdparty.sh

Alternatively, follow the following steps manually:

1) Closure compiler:
    - Download: https://dl.google.com/closure-compiler/compiler-latest.zip
    - Extract to closure-compiler folder
    - Rename (or symlink) the .jar file to compiler.jar

2) PDFJS:
    - Download: https://github.com/mozilla/pdf.js/releases/download/v2.1.266/pdfjs-2.1.266-dist.zip
    - Extract to pdfjs folder

3) tarballjs:
    - Download: https://github.com/ankitrohatgi/tarballjs/archive/master.zip
    - Extract to tarballjs folder

4) emscripten:
    - Download: https://github.com/juj/emsdk/archive/master.zip
    - Extract it and rename `emsdk-master` to `emsdk`
    - Run the following commands:

        ```
        cd emsdk
        ./emsdk install latest
        ./emsdk activate latest
        source ./emsdk_env.sh
        ```

5) Remove all downloaded zip files in `app/thirdparty`.
