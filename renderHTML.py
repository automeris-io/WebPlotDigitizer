# Render HTML pages for WebPlotDigitizer
# NOTE: This requires Python 3

import sys

from jinja2 import Environment, FileSystemLoader, Template
import gettext
import os
import codecs
from pathlib import Path


class WPDTranslation:
    def __init__(self, locale):
        self.language = gettext.translation("messages", "locale/", [locale])
        self.language.install()

    def gettext(self, x):
        return self.language.gettext(x)

    def ugettext(self, x):
        return self.language.gettext(x)

    def ungettext(self, x):
        return self.language.ungettext(x)

env = Environment(loader=FileSystemLoader('templates'), extensions=['jinja2.ext.i18n'])

languages = ["en_US", "zh_CN", "fr_FR", "de_DE", "ru", "ja"]

def renderPage(filename):
    print("Rendering " + filename)
    pageTemplate = env.get_template(filename)
    for lang in languages:
        print(("\tLanguage " + lang))
        translation = WPDTranslation(lang)
        env.install_gettext_translations(translation)
        page = pageTemplate.render()
        
        filename=Path(filename)
        if lang == "en_US":
            outfile = filename
        else:
            outfile = filename.parent / (filename.stem + "." + lang + ".html")
        with outfile.open('wt', encoding='utf-8') as pageFile:
            pageFile.write(page)

renderPage("dev.html")
renderPage("index.html")
renderPage("offline.html")
renderPage("cloud.html")
