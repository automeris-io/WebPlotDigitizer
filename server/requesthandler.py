import json

# This is a singleton object

notificationCallbacks = dict()
requestCallbacks = dict()

def registerNotification(name, callback):
    notificationCallbacks[name] = callback

def unregisterNotification(name):
    del notificationCallbacks[name]

def registerRequest(name, callback):
    requestCallbacks[name] = callback

def unregisterRequest(name):
    del requestCallbacks[name]

def handleNotification(name, data):
    print "Notification received: %s, data: %s" % name, data

def handleRequest(name, data):
    print "Request received: %s, data: %s" % (name, data)
    if name in requestCallbacks:
        return (requestCallbacks[name])(data)
    return None

def handleIncomingMessage(socketObject, message):
    messageObject = json.loads(message)
    print(messageObject)
    if "type" in messageObject and "id" in messageObject:
        messageId = messageObject["id"]
        messageType = messageObject["type"]
        messageTimestamp = messageObject["timestamp"]
        messageData = messageObject["message"]
        print("messageType %s" % messageType)
        if messageType == "request":
            requestData = handleRequest(messageId, messageData)
            requestReturnObject = {}
            requestReturnObject["type"] = "requestedData"
            requestReturnObject["timestamp"] = messageTimestamp
            requestReturnObject["id"] = messageId
            requestReturnObject["message"] = requestData

            requestDataJSON = json.dumps(requestReturnObject)
            socketObject.write_message(requestDataJSON)

        elif messageType == "notification":
            handleNotification(messageId, messageData)
 
