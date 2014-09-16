# Render HTML pages for WebPlotDigitizer

from jinja2 import Environment, FileSystemLoader, Template

env = Environment(loader=FileSystemLoader('templates'))

def renderPage(filename):
    print "Rendering", filename
    pageTemplate = env.get_template(filename)
    page = pageTemplate.render()
    pageFile = open(filename, 'w')
    pageFile.write(page.encode("utf8"))
    pageFile.close()


renderPage("dev.html")
renderPage("index.html")
renderPage("offline.html")
renderPage("remote_launcher.php")
    
