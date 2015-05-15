import tornado.web

class PHPHandler(tornado.web.RequestHandler):
    def post(self, phpfile):
        if phpfile == 'php/csvexport.php':
            data = self.get_argument('data')
            filename = self.get_argument('filename')
            self.add_header('Content-type', 'application/json')
            self.add_header('Content-disposition', 'attachment; filename="' + filename + '.csv"')
            self.write(data)

        elif phpfile == 'php/json.php':
            data = self.get_argument('data')
            filename = self.get_argument('filename')
            self.add_header('Content-type', 'application/json')
            self.add_header('Content-disposition', 'attachment; filename="' + filename + '.json"')
            self.write(data)

        else:
            print(data)

