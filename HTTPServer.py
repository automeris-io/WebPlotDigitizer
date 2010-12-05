# A very simple HTTP server.
# Source: http://docs.python.org/library/simplehttpserver.html

import SimpleHTTPServer
import SocketServer

PORT = 8000

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

httpd = SocketServer.TCPServer(("", PORT), Handler)

#print "serving at port", PORT
httpd.serve_forever()
