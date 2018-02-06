FROM ubuntu:17.10

RUN \
    apt-get update && \
    apt-get -y upgrade && \
    apt-get install -y python python-jinja2 python-babel golang default-jre git htop && \
    git clone https://github.com/ankitrohatgi/WebPlotDigitizer.git /root/WebPlotDigitizer
   
RUN \
    apt-get install -y unzip wget && \
    cd /root/WebPlotDigitizer/app/thirdparty && \
    ./getThirdparty.sh && \
    cd .. && \
    ./build.sh && \
    cd .. && \
    cd webserver && \
    go build && \
    cp settings.json.example settings.json

ENV HOME /root

WORKDIR /root/WebPlotDigitizer/webserver

CMD ./webserver
