# Build with the command
# docker build -t webplotdigitizer:dev .

# Run with the command to have port 8080 serve webplotdigitizer
# docker run -p 8080:8080 webplotdigitizer:dev

# Set the base image to a long-term Ubuntu release
FROM ubuntu:18.04

# Dockerfile Maintainer
MAINTAINER William Denney <wdenney@humanpredictions.com>

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive \
       apt-get install --yes --no-install-recommends \
       git unzip wget ca-certificates python3 xz-utils libxml2 \
       sudo tzdata \
    && DEBIAN_FRONTEND=noninteractive \
       ln -fs /usr/share/zoneinfo/UTC /etc/localtime \
    && DEBIAN_FRONTEND=noninteractive \
       dpkg-reconfigure --frontend noninteractive tzdata


RUN git clone https://github.com/ankitrohatgi/WebPlotDigitizer.git \
    && cd WebPlotDigitizer \
    && grep -v wine setupUbuntuDev.sh | \
       sed 's/apt install/apt-get install --yes --no-install-recommends/' > setupUbuntuDev-aptfix.sh \
    && chmod +x setupUbuntuDev-aptfix.sh \
    && DEBIAN_FRONTEND=noninteractive \
       ./setupUbuntuDev-aptfix.sh \
    && cd webserver \
    && go build \
    && mv settings.json.example settings.json

RUN cd /WebPlotDigitizer/app \
    && ./build.sh

WORKDIR /WebPlotDigitizer/webserver/
CMD ["/WebPlotDigitizer/webserver/webserver"]
