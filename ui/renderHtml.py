# Render HTML pages for WebPlotDigitizer

from jinja2 import Environment, FileSystemLoader, Template
import gettext
import os

class WPDTranslation:
    def __init__(self, locale):
        self.language = gettext.translation("messages", "locale/", [locale])
        self.language.install()

    def gettext(self, x):
        return self.language.gettext(x)

    def ugettext(self, x):
        return self.language.ugettext(x)

    def ungettext(self, x):
        return self.language.ungettext(x)

env = Environment(loader=FileSystemLoader('templates'), extensions=['jinja2.ext.i18n'])

languages = ["en_US", "zh_CN", "fr_FR", "de_DE", "ru", "ja"]

def renderPage(filename):
    print "Rendering", filename
    pageTemplate = env.get_template(filename)
    for lang in languages:
        print "\tLanguage", lang
        translation = WPDTranslation(lang)
        env.install_gettext_translations(translation)
        page = pageTemplate.render()
        if lang == "en_US":
            outfile = filename
        else:
            outfile = os.path.splitext(os.path.basename(filename))[0] + "." + lang + ".html"
        pageFile = open(outfile, 'w')
        pageFile.write(page.encode("utf8"))
        pageFile.close()

renderPage("dev.html")
renderPage("index.html")
renderPage("offline.html")

