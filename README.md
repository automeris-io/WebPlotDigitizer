WebPlotDigitizer [![DOI](https://zenodo.org/badge/doi/10.5281/zenodo.11835.png)](http://dx.doi.org/10.5281/zenodo.11835)
================

A web based tool to extract numerical data from plot images. Supports XY, Polar, Ternary diagrams and Maps.

This tool has been developed using HTML5, CSS3 and Javascript and therefore runs from within the browser and requires no installation.

Homepage
--------

This project is hosted on [http://arohatgi.info/WebPlotDigitizer](http://arohatgi.info/WebPlotDigitizer)

Demonstration Video
-------------------

Version 3.0 demonstration video: [http://youtu.be/G8KPVVFrb6U](http://youtu.be/G8KPVVFrb6U)

Usage
-----

Instructions and video tutorials are available at [http://arohatgi.info/WebPlotDigitizer/tutorial.html](http://arohatgi.info/WebPlotDigitizer/tutorial.html)

Scripting
---------

Users can load scripts to extend the capabilities of WebPlotDigitizer. For samples see [WebPlotDigitizer-Examples](http://github.com/ankitrohatgi/WebPlotDigitizer-Examples).

Offline Development/Usage
-------------------------

This tool has to hosted on a HTTP server with PHP for some javascript features and PHP scripts to function correctly. The master branch of the code is usually unstable and not recommended for download (only for development). To download a stable release of this app, check [Releases](https://github.com/ankitrohatgi/WebPlotDigitizer/releases).

Discussion Forum & Available Projects
-------------------------------------

Join the Google Group to access some related projects that are free to try. Also post questions, suggestions etc.

image-digitization: [https://groups.google.com/d/forum/image-digitization](https://groups.google.com/d/forum/image-digitization)

Development/Hacking
-------------------

  - dev.html and index.html are generated files!
  - index.html is the deployed page on the website and uses a compiled and compressed version of the javascript code.
  - dev.html is to be used during development. This uses the uncompressed/uncompiled javascript files.
  - build.sh generates dev.html and index.html based on the files in the templates folder and the javascript folder.
  - Host the pages on a PHP enabled web server (e.g. php -S localhost:8000 ) during development.

Contact
-------

Ankit Rohatgi <ankitrohatgi@hotmail.com>


