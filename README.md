# WebPlotDigitizer

A large quantity of useful data is locked away in images of data visualizations. WebPlotDigitizer is a computer vision assisted software that helps extract numerical data from images of a variety of data visualizations.

WPD has been used by thousands in academia and industry since its creation in 2010 (Google Scholar Citations)

To use WPD, sign-up on https://automeris.io

![WPD Screenshot](images/wpd5.png "WebPlotDigitizer UI")

## Donate

Donatations help keeping WPD free for thousands of scientists and researchers across the world.

<a href='https://ko-fi.com/L4L010CWIY' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

## Documentation

Visit: https://automeris.io/docs/

## License

WPD frontend is distributed under GNU AGPL v3 license (this repository). 

Automeris "AI Assist" and other related cloud based systems are closed source and owned by Automeris LLC (owned by Ankit Rohatgi).

## Contact

Primary Author and Maintainer: Ankit Rohatgi

Email: plots@automeris.io

## Contributions

WPD does not have an official roadmap. Please consult before submitting contributions.


## Local build (for development)

With Docker:
```
docker compose up --build               # install depedencies, build and host
docker compose run wpd npm run build    # rebuild
docker compose run wpd npm run format   # autoformat code
http://localhost:8080/tests             # run tests
```

Without Docker:
```
npm install     # install dependencies
npm run build   # build artifacts
npm start       # host locally
npm run format  # autoformat code
npm run test    # run tests
```
