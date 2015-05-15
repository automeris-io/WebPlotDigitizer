# Simple HTTP+WebSockets server for WPD development
import os
import tornado.ioloop
import tornado.web

import settings

def main():

    rootPath = os.path.abspath(__file__ + "/../../")

    # Create App
    app = tornado.web.Application([
        (r"/(.*)", tornado.web.StaticFileHandler, {"path": rootPath, "default_filename": "index.html"})
    ])

    # Start the app
    print("Starting WPD server with URL: %s" % settings.baseURL)
    app.listen(settings.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
