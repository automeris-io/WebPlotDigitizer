# A very simple HTTP server.
# Source: http://docs.python.org/library/simplehttpserver.html
# This works with Python 3.0+

import http.server
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler

httpd = socketserver.TCPServer(("", PORT), Handler)

#print "serving at port", PORT
httpd.serve_forever()
