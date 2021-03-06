var http = require('http');
var https = require('https');
var AbortablePromise = require('./AbortablePromise');

function proxyRequestUsingNode(conn, location) {
  var transport = location.protocol === 'https:' ? https : http;

  return new AbortablePromise(function (resolve, reject, onAbort) {
    var nodeRequest = transport.request({
      method: conn.method,
      protocol: location.protocol,
      auth: location.auth,
      hostname: location.hostname,
      path: location.path,
      headers: conn.request.headers
    });

    nodeRequest.on('response', function (nodeResponse) {
      conn.status = nodeResponse.statusCode;
      conn.response.headers = nodeResponse.headers;
      conn.response.content = nodeResponse;
      resolve(conn);
    });

    nodeRequest.on('error', reject);

    onAbort(function () {
      nodeRequest.abort();
      resolve();
    });

    conn.request.content.pipe(nodeRequest);
  });
}

module.exports = proxyRequestUsingNode;
