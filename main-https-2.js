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

const fs = require("fs");
var https = require('https'),
    httpProxy = require('./lib/http-proxy'),
    url = require('url')
var proxy = httpProxy.createServer({
    ssl: {
        // 禁用证书验证
        rejectUnauthorized: false
    }
});

var server = https.createServer({
    key: fs.readFileSync("/www/server/panel/vhost/cert/beta.dt000.cn/privkey.pem"),
    cert: fs.readFileSync("/www/server/panel/vhost/cert/beta.dt000.cn/fullchain.pem")
}, function (req, res) {
    console.log('IncomingMessage:' + req.url);
    var parsedUrl = url.parse(req.url);
    var target = parsedUrl.protocol + '//' + parsedUrl.hostname;
    proxy.web(req, res, {target: target, secure: true, changeOrigin: true});
}).listen(8443);

server.on('error', (err) => {
    console.error('Server发生了错误:', err);
});

// Test with:
// curl -vv -x http://127.0.0.1:8213 https://www.google.com
// curl -vv -x http://127.0.0.1:8213 http://www.google.com
