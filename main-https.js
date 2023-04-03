/*
  reverse-proxy.js: Example of reverse proxying (with HTTPS support)
  Copyright (c) 2015 Alberto Pose <albertopose@gmail.com>
  
  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:
  
  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const path = require("path");
const fs = require("fs");
var https = require('https'),
    net = require('net'),
    httpProxy = require('./lib/http-proxy'),
    url = require('url'),
    fixturesDir = path.join(__dirname, 'test', 'fixtures');
var proxy = httpProxy.createServer({
    secure: false
});

var server = https.createServer({
    key: fs.readFileSync("/www/server/panel/vhost/cert/beta.dt000.cn/privkey.pem"),
    cert: fs.readFileSync("/www/server/panel/vhost/cert/beta.dt000.cn/fullchain.pem")
}, function (req, res) {
    console.log('IncomingMessage:' + req.url);
    var parsedUrl = url.parse(req.url);
    var target = parsedUrl.protocol + '//' + parsedUrl.hostname;
    proxy.web(req, res, {target: target, secure: false});
}).listen(8443);

server.on('connect', function (req, socket) {
    console.log('On connect:' + req.url);
    var serverUrl = url.parse('https://' + req.url);
    socket.on("error", (err) => {
        console.log(`socket发生了错误[${req.url}]:`, err);
    });

    var srvSocket = net.connect(serverUrl.port, serverUrl.hostname, function () {
        socket.write('HTTP/1.1 200 Connection Established\r\n' +
            'Proxy-agent: Node-Proxy\r\n' +
            '\r\n');
        srvSocket.pipe(socket);
        socket.pipe(srvSocket);
    });
    srvSocket.on('error', (err) => {
        console.log("srvSocket发生了错误:", err)
    });

});

server.on('error', (err) => {
    console.error('Server发生了错误:', err);
});

// Test with:
// curl -vv -x http://127.0.0.1:8213 https://www.google.com
// curl -vv -x http://127.0.0.1:8213 http://www.google.com
