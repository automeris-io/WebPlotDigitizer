import tornado.websocket
import uuid

import requesthandler

clients = dict()
clientCount = 0

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    
    def open(self, *args):
        global clientCount
        clientCount = clientCount + 1
        print("Clients connected: %d" % clientCount)
        self.id = str(uuid.uuid1())
        self.stream.set_nodelay(True)
        clients[self.id] = {"id": self.id, "object": self}

    def on_message(self, message):
        print(message)
        requesthandler.handleIncomingMessage(self, message)

    def on_close(self):
        print("socket closed")

        if self.id in clients:
            del clients[self.id]
            global clientCount
            clientCount = clientCount - 1
