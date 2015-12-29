(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../async/Task', './errors/RequestTimeoutError', 'http', 'https', '../lang', '../streams/adapters/ReadableNodeStreamSource', '../streams/adapters/WritableNodeStreamSink', '../streams/ReadableStream', '../streams/WritableStream', 'url', './util'], factory);
    }
})(function (require, exports) {
    var Task_1 = require('../async/Task');
    var RequestTimeoutError_1 = require('./errors/RequestTimeoutError');
    var http = require('http');
    var https = require('https');
    var lang_1 = require('../lang');
    var ReadableNodeStreamSource_1 = require('../streams/adapters/ReadableNodeStreamSource');
    var WritableNodeStreamSink_1 = require('../streams/adapters/WritableNodeStreamSink');
    var ReadableStream_1 = require('../streams/ReadableStream');
    var WritableStream_1 = require('../streams/WritableStream');
    var urlUtil = require('url');
    var util_1 = require('./util');
    // TODO: Where should the dojo version come from? It used to be kernel, but we don't have that.
    var version = '2.0.0-pre';
    function normalizeHeaders(headers) {
        var normalizedHeaders = {};
        for (var key in headers) {
            normalizedHeaders[key.toLowerCase()] = headers[key];
        }
        return normalizedHeaders;
    }
    function node(url, options) {
        if (options === void 0) { options = {}; }
        var requestUrl = util_1.generateRequestUrl(url, options);
        var parsedUrl = urlUtil.parse(options.proxy || requestUrl);
        var requestOptions = {
            agent: options.agent,
            auth: parsedUrl.auth || options.auth,
            ca: options.ca,
            cert: options.cert,
            ciphers: options.ciphers,
            headers: normalizeHeaders(options.headers || {}),
            host: parsedUrl.host,
            hostname: parsedUrl.hostname,
            key: options.key,
            localAddress: options.localAddress,
            method: options.method ? options.method.toUpperCase() : 'GET',
            passphrase: options.passphrase,
            path: parsedUrl.path,
            pfx: options.pfx,
            port: Number(parsedUrl.port),
            rejectUnauthorized: options.rejectUnauthorized,
            secureProtocol: options.secureProtocol,
            socketPath: options.socketPath
        };
        if (!('user-agent' in requestOptions.headers)) {
            requestOptions.headers['user-agent'] = 'dojo/' + version + ' Node.js/' + process.version.replace(/^v/, '');
        }
        if (options.proxy) {
            requestOptions.path = requestUrl;
            if (parsedUrl.auth) {
                requestOptions.headers['proxy-authorization'] = 'Basic ' + new Buffer(parsedUrl.auth).toString('base64');
            }
            var _parsedUrl = urlUtil.parse(requestUrl);
            requestOptions.headers['host'] = _parsedUrl.host;
            requestOptions.auth = _parsedUrl.auth || options.auth;
        }
        if (!options.auth && (options.user || options.password)) {
            requestOptions.auth = encodeURIComponent(options.user || '') + ':' + encodeURIComponent(options.password || '');
        }
        var request = (parsedUrl.protocol === 'https:' ? https : http).request(requestOptions);
        var response = {
            data: null,
            getHeader: function (name) {
                return (this.nativeResponse && this.nativeResponse.headers[name.toLowerCase()]) || null;
            },
            requestOptions: options,
            statusCode: null,
            url: requestUrl
        };
        var promise = new Task_1.default(function (resolve, reject) {
            if (options.socketOptions) {
                if ('timeout' in options.socketOptions) {
                    request.setTimeout(options.socketOptions.timeout);
                }
                if ('noDelay' in options.socketOptions) {
                    request.setNoDelay(options.socketOptions.noDelay);
                }
                if ('keepAlive' in options.socketOptions) {
                    var initialDelay = options.socketOptions.keepAlive;
                    request.setSocketKeepAlive(initialDelay >= 0, initialDelay);
                }
            }
            var timeout;
            request.once('response', function (nativeResponse) {
                response.nativeResponse = nativeResponse;
                response.statusCode = nativeResponse.statusCode;
                // Redirection handling defaults to true in order to harmonise with the XHR provider, which will always
                // follow redirects
                // TODO: This redirect code is not 100% correct according to the RFC; needs to handle redirect loops and
                // restrict/modify certain redirects
                if (response.statusCode >= 300 &&
                    response.statusCode < 400 &&
                    response.statusCode !== 304 &&
                    options.followRedirects !== false &&
                    nativeResponse.headers.location) {
                    resolve(node(nativeResponse.headers.location, options));
                    return;
                }
                options.streamEncoding && nativeResponse.setEncoding(options.streamEncoding);
                if (options.streamTarget) {
                    var responseSource = new ReadableNodeStreamSource_1.default(nativeResponse);
                    var responseReadableStream = new ReadableStream_1.default(responseSource);
                    responseReadableStream.pipeTo(options.streamTarget)
                        .then(function () {
                        resolve(response);
                    }, function (error) {
                        options.streamTarget.abort(error);
                        request.abort();
                        error.response = response;
                        reject(error);
                    });
                }
                var data;
                var loaded;
                if (!options.streamData) {
                    data = [];
                    loaded = 0;
                    nativeResponse.on('data', function (chunk) {
                        data.push(chunk);
                        loaded += (typeof chunk === 'string') ?
                            Buffer.byteLength(chunk, options.streamEncoding) :
                            chunk.length;
                    });
                }
                nativeResponse.once('end', function () {
                    timeout && timeout.destroy();
                    if (!options.streamData) {
                        // TODO: what type should data have?
                        response.data = (options.streamEncoding ? data.join('') : Buffer.concat(data, loaded));
                    }
                    // If using a streamTarget, wait for it to finish in case it throws an error
                    if (!options.streamTarget) {
                        resolve(response);
                    }
                    else {
                        options.streamTarget.close();
                    }
                });
            });
            request.once('error', reject);
            if (options.data) {
                if (options.data instanceof ReadableStream_1.default) {
                    var requestSink = new WritableNodeStreamSink_1.default(request);
                    var writableRequest = new WritableStream_1.default(requestSink);
                    options.data.pipeTo(writableRequest)
                        .catch(function (error) {
                        error.response = response;
                        writableRequest.abort(error);
                        reject(error);
                    });
                }
                else {
                    request.end();
                }
            }
            else {
                request.end();
            }
            if (options.timeout > 0 && options.timeout !== Infinity) {
                timeout = (function () {
                    var timer = setTimeout(function () {
                        var error = new RequestTimeoutError_1.default('Request timed out after ' + options.timeout + 'ms');
                        error.response = response;
                        reject(error);
                    }, options.timeout);
                    return lang_1.createHandle(function () {
                        clearTimeout(timer);
                    });
                })();
            }
        }, function () {
            request.abort();
        }).catch(function (error) {
            var parsedUrl = urlUtil.parse(url);
            if (parsedUrl.auth) {
                parsedUrl.auth = '(redacted)';
            }
            var sanitizedUrl = urlUtil.format(parsedUrl);
            error.message = '[' + requestOptions.method + ' ' + sanitizedUrl + '] ' + error.message;
            throw error;
        });
        return promise;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = node;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZXF1ZXN0L25vZGUudHMiXSwibmFtZXMiOlsibm9ybWFsaXplSGVhZGVycyIsIm5vZGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQUEscUJBQWlCLGVBQWUsQ0FBQyxDQUFBO0lBQ2pDLG9DQUFnQyw4QkFBOEIsQ0FBQyxDQUFBO0lBRS9ELElBQVksSUFBSSxXQUFNLE1BQU0sQ0FBQyxDQUFBO0lBQzdCLElBQVksS0FBSyxXQUFNLE9BQU8sQ0FBQyxDQUFBO0lBQy9CLHFCQUE2QixTQUFTLENBQUMsQ0FBQTtJQUV2Qyx5Q0FBcUMsOENBQThDLENBQUMsQ0FBQTtJQUNwRix1Q0FBbUMsNENBQTRDLENBQUMsQ0FBQTtJQUNoRiwrQkFBMkIsMkJBQTJCLENBQUMsQ0FBQTtJQUN2RCwrQkFBMkIsMkJBQTJCLENBQUMsQ0FBQTtJQUN2RCxJQUFZLE9BQU8sV0FBTSxLQUFLLENBQUMsQ0FBQTtJQUMvQixxQkFBbUMsUUFBUSxDQUFDLENBQUE7SUFFNUMsK0ZBQStGO0lBQy9GLElBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQztJQW1EMUIsMEJBQTBCLE9BQW1DO1FBQzVEQSxJQUFNQSxpQkFBaUJBLEdBQStCQSxFQUFFQSxDQUFDQTtRQUN6REEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDekJBLGlCQUFpQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDckRBLENBQUNBO1FBRURBLE1BQU1BLENBQUNBLGlCQUFpQkEsQ0FBQ0E7SUFDMUJBLENBQUNBO0lBRUQsY0FBZ0MsR0FBVyxFQUFFLE9BQW1DO1FBQW5DQyx1QkFBbUNBLEdBQW5DQSxZQUFtQ0E7UUFDL0VBLElBQU1BLFVBQVVBLEdBQUdBLHlCQUFrQkEsQ0FBQ0EsR0FBR0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDcERBLElBQU1BLFNBQVNBLEdBQUdBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLElBQUlBLFVBQVVBLENBQUNBLENBQUNBO1FBQzdEQSxJQUFNQSxjQUFjQSxHQUFpQkE7WUFDcENBLEtBQUtBLEVBQUVBLE9BQU9BLENBQUNBLEtBQUtBO1lBQ3BCQSxJQUFJQSxFQUFFQSxTQUFTQSxDQUFDQSxJQUFJQSxJQUFJQSxPQUFPQSxDQUFDQSxJQUFJQTtZQUNwQ0EsRUFBRUEsRUFBRUEsT0FBT0EsQ0FBQ0EsRUFBRUE7WUFDZEEsSUFBSUEsRUFBRUEsT0FBT0EsQ0FBQ0EsSUFBSUE7WUFDbEJBLE9BQU9BLEVBQUVBLE9BQU9BLENBQUNBLE9BQU9BO1lBQ3hCQSxPQUFPQSxFQUFFQSxnQkFBZ0JBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLElBQUlBLEVBQUVBLENBQUNBO1lBQ2hEQSxJQUFJQSxFQUFFQSxTQUFTQSxDQUFDQSxJQUFJQTtZQUNwQkEsUUFBUUEsRUFBRUEsU0FBU0EsQ0FBQ0EsUUFBUUE7WUFDNUJBLEdBQUdBLEVBQUVBLE9BQU9BLENBQUNBLEdBQUdBO1lBQ2hCQSxZQUFZQSxFQUFFQSxPQUFPQSxDQUFDQSxZQUFZQTtZQUNsQ0EsTUFBTUEsRUFBRUEsT0FBT0EsQ0FBQ0EsTUFBTUEsR0FBR0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsRUFBRUEsR0FBR0EsS0FBS0E7WUFDN0RBLFVBQVVBLEVBQUVBLE9BQU9BLENBQUNBLFVBQVVBO1lBQzlCQSxJQUFJQSxFQUFFQSxTQUFTQSxDQUFDQSxJQUFJQTtZQUNwQkEsR0FBR0EsRUFBRUEsT0FBT0EsQ0FBQ0EsR0FBR0E7WUFDaEJBLElBQUlBLEVBQUVBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBO1lBQzVCQSxrQkFBa0JBLEVBQUVBLE9BQU9BLENBQUNBLGtCQUFrQkE7WUFDOUNBLGNBQWNBLEVBQUVBLE9BQU9BLENBQUNBLGNBQWNBO1lBQ3RDQSxVQUFVQSxFQUFFQSxPQUFPQSxDQUFDQSxVQUFVQTtTQUM5QkEsQ0FBQ0E7UUFFRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsSUFBSUEsY0FBY0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0NBLGNBQWNBLENBQUNBLE9BQU9BLENBQUNBLFlBQVlBLENBQUNBLEdBQUdBLE9BQU9BLEdBQUdBLE9BQU9BLEdBQUdBLFdBQVdBLEdBQUdBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO1FBQzVHQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQkEsY0FBY0EsQ0FBQ0EsSUFBSUEsR0FBR0EsVUFBVUEsQ0FBQ0E7WUFDakNBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO2dCQUNwQkEsY0FBY0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EscUJBQXFCQSxDQUFDQSxHQUFHQSxRQUFRQSxHQUFHQSxJQUFJQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtZQUMxR0EsQ0FBQ0E7WUFFREEsSUFBSUEsVUFBVUEsR0FBR0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7WUFDM0NBLGNBQWNBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBO1lBQ2pEQSxjQUFjQSxDQUFDQSxJQUFJQSxHQUFHQSxVQUFVQSxDQUFDQSxJQUFJQSxJQUFJQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUN2REEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsSUFBSUEsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDekRBLGNBQWNBLENBQUNBLElBQUlBLEdBQUdBLGtCQUFrQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsSUFBSUEsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0Esa0JBQWtCQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUNqSEEsQ0FBQ0E7UUFFREEsSUFBTUEsT0FBT0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsS0FBS0EsUUFBUUEsR0FBR0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7UUFDekZBLElBQU1BLFFBQVFBLEdBQWdCQTtZQUM3QkEsSUFBSUEsRUFBRUEsSUFBSUE7WUFDVkEsU0FBU0EsRUFBRUEsVUFBVUEsSUFBWUE7Z0JBQ2hDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7WUFDekYsQ0FBQztZQUNEQSxjQUFjQSxFQUFFQSxPQUFPQTtZQUN2QkEsVUFBVUEsRUFBRUEsSUFBSUE7WUFDaEJBLEdBQUdBLEVBQUVBLFVBQVVBO1NBQ2ZBLENBQUNBO1FBRUZBLElBQU1BLE9BQU9BLEdBQUdBLElBQUlBLGNBQUlBLENBQWNBLFVBQVVBLE9BQU9BLEVBQUVBLE1BQU1BO1lBQzlELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixFQUFFLENBQUMsQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkQsQ0FBQztnQkFFRCxFQUFFLENBQUMsQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkQsQ0FBQztnQkFFRCxFQUFFLENBQUMsQ0FBQyxXQUFXLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQzFDLElBQU0sWUFBWSxHQUFXLE9BQU8sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO29CQUM3RCxPQUFPLENBQUMsa0JBQWtCLENBQUMsWUFBWSxJQUFJLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDN0QsQ0FBQztZQUNGLENBQUM7WUFFRCxJQUFJLE9BQWUsQ0FBQztZQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLGNBQW1DO2dCQUNyRSxRQUFRLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztnQkFDekMsUUFBUSxDQUFDLFVBQVUsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDO2dCQUVoRCx1R0FBdUc7Z0JBQ3ZHLG1CQUFtQjtnQkFDbkIsd0dBQXdHO2dCQUN4RyxvQ0FBb0M7Z0JBQ3BDLEVBQUUsQ0FBQyxDQUNGLFFBQVEsQ0FBQyxVQUFVLElBQUksR0FBRztvQkFDMUIsUUFBUSxDQUFDLFVBQVUsR0FBRyxHQUFHO29CQUN6QixRQUFRLENBQUMsVUFBVSxLQUFLLEdBQUc7b0JBQzNCLE9BQU8sQ0FBQyxlQUFlLEtBQUssS0FBSztvQkFDakMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxRQUN4QixDQUFDLENBQUMsQ0FBQztvQkFDRixPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ3hELE1BQU0sQ0FBQztnQkFDUixDQUFDO2dCQUVELE9BQU8sQ0FBQyxjQUFjLElBQUksY0FBYyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzdFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO29CQUMxQixJQUFNLGNBQWMsR0FBRyxJQUFJLGtDQUF3QixDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNwRSxJQUFNLHNCQUFzQixHQUFHLElBQUksd0JBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFFbEUsc0JBQXNCLENBQUMsTUFBTSxDQUFPLE9BQU8sQ0FBQyxZQUFZLENBQUM7eUJBQ3ZELElBQUksQ0FDSjt3QkFDQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ25CLENBQUMsRUFDRCxVQUFVLEtBQXNCO3dCQUMvQixPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDbEMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUNoQixLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQzt3QkFDMUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNmLENBQUMsQ0FDRCxDQUFDO2dCQUNKLENBQUM7Z0JBRUQsSUFBSSxJQUFXLENBQUM7Z0JBQ2hCLElBQUksTUFBYyxDQUFDO2dCQUNuQixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUN6QixJQUFJLEdBQUcsRUFBRSxDQUFDO29CQUNWLE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBRVgsY0FBYyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxLQUFVO3dCQUM3QyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNqQixNQUFNLElBQUksQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUM7NEJBQ3BDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUM7NEJBQ2hELEtBQUssQ0FBQyxNQUFNLENBQUM7b0JBQ2YsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQztnQkFFRCxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDMUIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFFN0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzt3QkFDekIsb0NBQW9DO3dCQUNwQyxRQUFRLENBQUMsSUFBSSxHQUFTLENBQUMsT0FBTyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQzlGLENBQUM7b0JBRUQsNEVBQTRFO29CQUM1RSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO3dCQUMzQixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ25CLENBQUM7b0JBQ0QsSUFBSSxDQUFDLENBQUM7d0JBQ0wsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDOUIsQ0FBQztnQkFDRixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFOUIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLFlBQVksd0JBQWMsQ0FBQyxDQUFDLENBQUM7b0JBQzVDLElBQU0sV0FBVyxHQUFHLElBQUksZ0NBQXNCLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3hELElBQU0sZUFBZSxHQUFHLElBQUksd0JBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDeEQsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDO3lCQUNsQyxLQUFLLENBQUMsVUFBVSxLQUFzQjt3QkFDdEMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7d0JBQzFCLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzdCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDZixDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO2dCQUNELElBQUksQ0FBQyxDQUFDO29CQUNMLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDZixDQUFDO1lBQ0YsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNMLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNmLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELE9BQU8sR0FBRyxDQUFDO29CQUNWLElBQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQzt3QkFDeEIsSUFBTSxLQUFLLEdBQUcsSUFBSSw2QkFBbUIsQ0FBQywwQkFBMEIsR0FBRyxPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDO3dCQUMzRixLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQzt3QkFDMUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNmLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBRXBCLE1BQU0sQ0FBQyxtQkFBWSxDQUFDO3dCQUNuQixZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3JCLENBQUMsQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDTixDQUFDO1FBQ0YsQ0FBQyxFQUFFQTtZQUNGLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQixDQUFDLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLFVBQVVBLEtBQVlBO1lBQzlCLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFbkMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLFNBQVMsQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDO1lBQy9CLENBQUM7WUFFRCxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTdDLEtBQUssQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLFlBQVksR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztZQUN4RixNQUFNLEtBQUssQ0FBQztRQUNiLENBQUMsQ0FBQ0EsQ0FBQ0E7UUFFSEEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7SUFDaEJBLENBQUNBO0lBL0xEOzBCQStMQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRhc2sgZnJvbSAnLi4vYXN5bmMvVGFzayc7XG5pbXBvcnQgUmVxdWVzdFRpbWVvdXRFcnJvciBmcm9tICcuL2Vycm9ycy9SZXF1ZXN0VGltZW91dEVycm9yJztcbmltcG9ydCB7IEhhbmRsZSB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0ICogYXMgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCAqIGFzIGh0dHBzIGZyb20gJ2h0dHBzJztcbmltcG9ydCB7IGNyZWF0ZUhhbmRsZSB9IGZyb20gJy4uL2xhbmcnO1xuaW1wb3J0IHsgUmVxdWVzdEVycm9yLCBSZXF1ZXN0T3B0aW9ucywgUmVzcG9uc2UsIFJlc3BvbnNlUHJvbWlzZSB9IGZyb20gJy4uL3JlcXVlc3QnO1xuaW1wb3J0IFJlYWRhYmxlTm9kZVN0cmVhbVNvdXJjZSBmcm9tICcuLi9zdHJlYW1zL2FkYXB0ZXJzL1JlYWRhYmxlTm9kZVN0cmVhbVNvdXJjZSc7XG5pbXBvcnQgV3JpdGFibGVOb2RlU3RyZWFtU2luayBmcm9tICcuLi9zdHJlYW1zL2FkYXB0ZXJzL1dyaXRhYmxlTm9kZVN0cmVhbVNpbmsnO1xuaW1wb3J0IFJlYWRhYmxlU3RyZWFtIGZyb20gJy4uL3N0cmVhbXMvUmVhZGFibGVTdHJlYW0nO1xuaW1wb3J0IFdyaXRhYmxlU3RyZWFtIGZyb20gJy4uL3N0cmVhbXMvV3JpdGFibGVTdHJlYW0nO1xuaW1wb3J0ICogYXMgdXJsVXRpbCBmcm9tICd1cmwnO1xuaW1wb3J0IHsgZ2VuZXJhdGVSZXF1ZXN0VXJsIH0gZnJvbSAnLi91dGlsJztcblxuLy8gVE9ETzogV2hlcmUgc2hvdWxkIHRoZSBkb2pvIHZlcnNpb24gY29tZSBmcm9tPyBJdCB1c2VkIHRvIGJlIGtlcm5lbCwgYnV0IHdlIGRvbid0IGhhdmUgdGhhdC5cbmxldCB2ZXJzaW9uID0gJzIuMC4wLXByZSc7XG5cbmludGVyZmFjZSBPcHRpb25zIHtcblx0YWdlbnQ/OiBhbnk7XG5cdGF1dGg/OiBzdHJpbmc7XG5cdGhlYWRlcnM/OiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmc7IH07XG5cdGhvc3Q/OiBzdHJpbmc7XG5cdGhvc3RuYW1lPzogc3RyaW5nO1xuXHRsb2NhbEFkZHJlc3M/OiBzdHJpbmc7XG5cdG1ldGhvZD86IHN0cmluZztcblx0cGF0aD86IHN0cmluZztcblx0cG9ydD86IG51bWJlcjtcblx0c29ja2V0UGF0aD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEh0dHBzT3B0aW9ucyBleHRlbmRzIE9wdGlvbnMge1xuXHRjYT86IGFueTtcblx0Y2VydD86IHN0cmluZztcblx0Y2lwaGVycz86IHN0cmluZztcblx0a2V5Pzogc3RyaW5nO1xuXHRwYXNzcGhyYXNlPzogc3RyaW5nO1xuXHRwZng/OiBhbnk7XG5cdHJlamVjdFVuYXV0aG9yaXplZD86IGJvb2xlYW47XG5cdHNlY3VyZVByb3RvY29sPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5vZGVSZXF1ZXN0T3B0aW9uczxUPiBleHRlbmRzIFJlcXVlc3RPcHRpb25zIHtcblx0YWdlbnQ/OiBhbnk7XG5cdGNhPzogYW55O1xuXHRjZXJ0Pzogc3RyaW5nO1xuXHRjaXBoZXJzPzogc3RyaW5nO1xuXHRkYXRhRW5jb2Rpbmc/OiBzdHJpbmc7XG5cdGZvbGxvd1JlZGlyZWN0cz86IGJvb2xlYW47XG5cdGtleT86IHN0cmluZztcblx0bG9jYWxBZGRyZXNzPzogc3RyaW5nO1xuXHRwYXNzcGhyYXNlPzogc3RyaW5nO1xuXHRwZng/OiBhbnk7XG5cdHByb3h5Pzogc3RyaW5nO1xuXHRyZWplY3RVbmF1dGhvcml6ZWQ/OiBib29sZWFuO1xuXHRzZWN1cmVQcm90b2NvbD86IHN0cmluZztcblx0c29ja2V0UGF0aD86IHN0cmluZztcblx0c29ja2V0T3B0aW9ucz86IHtcblx0XHRrZWVwQWxpdmU/OiBudW1iZXI7XG5cdFx0bm9EZWxheT86IGJvb2xlYW47XG5cdFx0dGltZW91dD86IG51bWJlcjtcblx0fTtcblx0c3RyZWFtRGF0YT86IGJvb2xlYW47XG5cdHN0cmVhbUVuY29kaW5nPzogc3RyaW5nO1xuXHRzdHJlYW1UYXJnZXQ/OiBXcml0YWJsZVN0cmVhbTxUPjtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVycyhoZWFkZXJzOiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfSk6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9IHtcblx0Y29uc3Qgbm9ybWFsaXplZEhlYWRlcnM6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG5cdGZvciAobGV0IGtleSBpbiBoZWFkZXJzKSB7XG5cdFx0bm9ybWFsaXplZEhlYWRlcnNba2V5LnRvTG93ZXJDYXNlKCldID0gaGVhZGVyc1trZXldO1xuXHR9XG5cblx0cmV0dXJuIG5vcm1hbGl6ZWRIZWFkZXJzO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBub2RlPFQ+KHVybDogc3RyaW5nLCBvcHRpb25zOiBOb2RlUmVxdWVzdE9wdGlvbnM8VD4gPSB7fSk6IFJlc3BvbnNlUHJvbWlzZTxUPiB7XG5cdGNvbnN0IHJlcXVlc3RVcmwgPSBnZW5lcmF0ZVJlcXVlc3RVcmwodXJsLCBvcHRpb25zKTtcblx0Y29uc3QgcGFyc2VkVXJsID0gdXJsVXRpbC5wYXJzZShvcHRpb25zLnByb3h5IHx8IHJlcXVlc3RVcmwpO1xuXHRjb25zdCByZXF1ZXN0T3B0aW9uczogSHR0cHNPcHRpb25zID0ge1xuXHRcdGFnZW50OiBvcHRpb25zLmFnZW50LFxuXHRcdGF1dGg6IHBhcnNlZFVybC5hdXRoIHx8IG9wdGlvbnMuYXV0aCxcblx0XHRjYTogb3B0aW9ucy5jYSxcblx0XHRjZXJ0OiBvcHRpb25zLmNlcnQsXG5cdFx0Y2lwaGVyczogb3B0aW9ucy5jaXBoZXJzLFxuXHRcdGhlYWRlcnM6IG5vcm1hbGl6ZUhlYWRlcnMob3B0aW9ucy5oZWFkZXJzIHx8IHt9KSxcblx0XHRob3N0OiBwYXJzZWRVcmwuaG9zdCxcblx0XHRob3N0bmFtZTogcGFyc2VkVXJsLmhvc3RuYW1lLFxuXHRcdGtleTogb3B0aW9ucy5rZXksXG5cdFx0bG9jYWxBZGRyZXNzOiBvcHRpb25zLmxvY2FsQWRkcmVzcyxcblx0XHRtZXRob2Q6IG9wdGlvbnMubWV0aG9kID8gb3B0aW9ucy5tZXRob2QudG9VcHBlckNhc2UoKSA6ICdHRVQnLFxuXHRcdHBhc3NwaHJhc2U6IG9wdGlvbnMucGFzc3BocmFzZSxcblx0XHRwYXRoOiBwYXJzZWRVcmwucGF0aCxcblx0XHRwZng6IG9wdGlvbnMucGZ4LFxuXHRcdHBvcnQ6IE51bWJlcihwYXJzZWRVcmwucG9ydCksXG5cdFx0cmVqZWN0VW5hdXRob3JpemVkOiBvcHRpb25zLnJlamVjdFVuYXV0aG9yaXplZCxcblx0XHRzZWN1cmVQcm90b2NvbDogb3B0aW9ucy5zZWN1cmVQcm90b2NvbCxcblx0XHRzb2NrZXRQYXRoOiBvcHRpb25zLnNvY2tldFBhdGhcblx0fTtcblxuXHRpZiAoISgndXNlci1hZ2VudCcgaW4gcmVxdWVzdE9wdGlvbnMuaGVhZGVycykpIHtcblx0XHRyZXF1ZXN0T3B0aW9ucy5oZWFkZXJzWyd1c2VyLWFnZW50J10gPSAnZG9qby8nICsgdmVyc2lvbiArICcgTm9kZS5qcy8nICsgcHJvY2Vzcy52ZXJzaW9uLnJlcGxhY2UoL152LywgJycpO1xuXHR9XG5cblx0aWYgKG9wdGlvbnMucHJveHkpIHtcblx0XHRyZXF1ZXN0T3B0aW9ucy5wYXRoID0gcmVxdWVzdFVybDtcblx0XHRpZiAocGFyc2VkVXJsLmF1dGgpIHtcblx0XHRcdHJlcXVlc3RPcHRpb25zLmhlYWRlcnNbJ3Byb3h5LWF1dGhvcml6YXRpb24nXSA9ICdCYXNpYyAnICsgbmV3IEJ1ZmZlcihwYXJzZWRVcmwuYXV0aCkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuXHRcdH1cblxuXHRcdGxldCBfcGFyc2VkVXJsID0gdXJsVXRpbC5wYXJzZShyZXF1ZXN0VXJsKTtcblx0XHRyZXF1ZXN0T3B0aW9ucy5oZWFkZXJzWydob3N0J10gPSBfcGFyc2VkVXJsLmhvc3Q7XG5cdFx0cmVxdWVzdE9wdGlvbnMuYXV0aCA9IF9wYXJzZWRVcmwuYXV0aCB8fCBvcHRpb25zLmF1dGg7XG5cdH1cblxuXHRpZiAoIW9wdGlvbnMuYXV0aCAmJiAob3B0aW9ucy51c2VyIHx8IG9wdGlvbnMucGFzc3dvcmQpKSB7XG5cdFx0cmVxdWVzdE9wdGlvbnMuYXV0aCA9IGVuY29kZVVSSUNvbXBvbmVudChvcHRpb25zLnVzZXIgfHwgJycpICsgJzonICsgZW5jb2RlVVJJQ29tcG9uZW50KG9wdGlvbnMucGFzc3dvcmQgfHwgJycpO1xuXHR9XG5cblx0Y29uc3QgcmVxdWVzdCA9IChwYXJzZWRVcmwucHJvdG9jb2wgPT09ICdodHRwczonID8gaHR0cHMgOiBodHRwKS5yZXF1ZXN0KHJlcXVlc3RPcHRpb25zKTtcblx0Y29uc3QgcmVzcG9uc2U6IFJlc3BvbnNlPFQ+ID0ge1xuXHRcdGRhdGE6IG51bGwsXG5cdFx0Z2V0SGVhZGVyOiBmdW5jdGlvbiAobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRcdHJldHVybiAodGhpcy5uYXRpdmVSZXNwb25zZSAmJiB0aGlzLm5hdGl2ZVJlc3BvbnNlLmhlYWRlcnNbbmFtZS50b0xvd2VyQ2FzZSgpXSkgfHwgbnVsbDtcblx0XHR9LFxuXHRcdHJlcXVlc3RPcHRpb25zOiBvcHRpb25zLFxuXHRcdHN0YXR1c0NvZGU6IG51bGwsXG5cdFx0dXJsOiByZXF1ZXN0VXJsXG5cdH07XG5cblx0Y29uc3QgcHJvbWlzZSA9IG5ldyBUYXNrPFJlc3BvbnNlPFQ+PihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0aWYgKG9wdGlvbnMuc29ja2V0T3B0aW9ucykge1xuXHRcdFx0aWYgKCd0aW1lb3V0JyBpbiBvcHRpb25zLnNvY2tldE9wdGlvbnMpIHtcblx0XHRcdFx0cmVxdWVzdC5zZXRUaW1lb3V0KG9wdGlvbnMuc29ja2V0T3B0aW9ucy50aW1lb3V0KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCdub0RlbGF5JyBpbiBvcHRpb25zLnNvY2tldE9wdGlvbnMpIHtcblx0XHRcdFx0cmVxdWVzdC5zZXROb0RlbGF5KG9wdGlvbnMuc29ja2V0T3B0aW9ucy5ub0RlbGF5KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCdrZWVwQWxpdmUnIGluIG9wdGlvbnMuc29ja2V0T3B0aW9ucykge1xuXHRcdFx0XHRjb25zdCBpbml0aWFsRGVsYXk6IG51bWJlciA9IG9wdGlvbnMuc29ja2V0T3B0aW9ucy5rZWVwQWxpdmU7XG5cdFx0XHRcdHJlcXVlc3Quc2V0U29ja2V0S2VlcEFsaXZlKGluaXRpYWxEZWxheSA+PSAwLCBpbml0aWFsRGVsYXkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCB0aW1lb3V0OiBIYW5kbGU7XG5cdFx0cmVxdWVzdC5vbmNlKCdyZXNwb25zZScsIGZ1bmN0aW9uIChuYXRpdmVSZXNwb25zZTogaHR0cC5DbGllbnRSZXNwb25zZSk6IHZvaWQge1xuXHRcdFx0cmVzcG9uc2UubmF0aXZlUmVzcG9uc2UgPSBuYXRpdmVSZXNwb25zZTtcblx0XHRcdHJlc3BvbnNlLnN0YXR1c0NvZGUgPSBuYXRpdmVSZXNwb25zZS5zdGF0dXNDb2RlO1xuXG5cdFx0XHQvLyBSZWRpcmVjdGlvbiBoYW5kbGluZyBkZWZhdWx0cyB0byB0cnVlIGluIG9yZGVyIHRvIGhhcm1vbmlzZSB3aXRoIHRoZSBYSFIgcHJvdmlkZXIsIHdoaWNoIHdpbGwgYWx3YXlzXG5cdFx0XHQvLyBmb2xsb3cgcmVkaXJlY3RzXG5cdFx0XHQvLyBUT0RPOiBUaGlzIHJlZGlyZWN0IGNvZGUgaXMgbm90IDEwMCUgY29ycmVjdCBhY2NvcmRpbmcgdG8gdGhlIFJGQzsgbmVlZHMgdG8gaGFuZGxlIHJlZGlyZWN0IGxvb3BzIGFuZFxuXHRcdFx0Ly8gcmVzdHJpY3QvbW9kaWZ5IGNlcnRhaW4gcmVkaXJlY3RzXG5cdFx0XHRpZiAoXG5cdFx0XHRcdHJlc3BvbnNlLnN0YXR1c0NvZGUgPj0gMzAwICYmXG5cdFx0XHRcdHJlc3BvbnNlLnN0YXR1c0NvZGUgPCA0MDAgJiZcblx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzQ29kZSAhPT0gMzA0ICYmXG5cdFx0XHRcdG9wdGlvbnMuZm9sbG93UmVkaXJlY3RzICE9PSBmYWxzZSAmJlxuXHRcdFx0XHRuYXRpdmVSZXNwb25zZS5oZWFkZXJzLmxvY2F0aW9uXG5cdFx0XHQpIHtcblx0XHRcdFx0cmVzb2x2ZShub2RlKG5hdGl2ZVJlc3BvbnNlLmhlYWRlcnMubG9jYXRpb24sIG9wdGlvbnMpKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRvcHRpb25zLnN0cmVhbUVuY29kaW5nICYmIG5hdGl2ZVJlc3BvbnNlLnNldEVuY29kaW5nKG9wdGlvbnMuc3RyZWFtRW5jb2RpbmcpO1xuXHRcdFx0aWYgKG9wdGlvbnMuc3RyZWFtVGFyZ2V0KSB7XG5cdFx0XHRcdGNvbnN0IHJlc3BvbnNlU291cmNlID0gbmV3IFJlYWRhYmxlTm9kZVN0cmVhbVNvdXJjZShuYXRpdmVSZXNwb25zZSk7XG5cdFx0XHRcdGNvbnN0IHJlc3BvbnNlUmVhZGFibGVTdHJlYW0gPSBuZXcgUmVhZGFibGVTdHJlYW0ocmVzcG9uc2VTb3VyY2UpO1xuXG5cdFx0XHRcdHJlc3BvbnNlUmVhZGFibGVTdHJlYW0ucGlwZVRvKDxhbnk+IG9wdGlvbnMuc3RyZWFtVGFyZ2V0KVxuXHRcdFx0XHRcdC50aGVuKFxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKHJlc3BvbnNlKTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRmdW5jdGlvbiAoZXJyb3I6IFJlcXVlc3RFcnJvcjxUPikge1xuXHRcdFx0XHRcdFx0XHRvcHRpb25zLnN0cmVhbVRhcmdldC5hYm9ydChlcnJvcik7XG5cdFx0XHRcdFx0XHRcdHJlcXVlc3QuYWJvcnQoKTtcblx0XHRcdFx0XHRcdFx0ZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcblx0XHRcdFx0XHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgZGF0YTogYW55W107XG5cdFx0XHRsZXQgbG9hZGVkOiBudW1iZXI7XG5cdFx0XHRpZiAoIW9wdGlvbnMuc3RyZWFtRGF0YSkge1xuXHRcdFx0XHRkYXRhID0gW107XG5cdFx0XHRcdGxvYWRlZCA9IDA7XG5cblx0XHRcdFx0bmF0aXZlUmVzcG9uc2Uub24oJ2RhdGEnLCBmdW5jdGlvbiAoY2h1bms6IGFueSk6IHZvaWQge1xuXHRcdFx0XHRcdGRhdGEucHVzaChjaHVuayk7XG5cdFx0XHRcdFx0bG9hZGVkICs9ICh0eXBlb2YgY2h1bmsgPT09ICdzdHJpbmcnKSA/XG5cdFx0XHRcdFx0XHRCdWZmZXIuYnl0ZUxlbmd0aChjaHVuaywgb3B0aW9ucy5zdHJlYW1FbmNvZGluZykgOlxuXHRcdFx0XHRcdFx0Y2h1bmsubGVuZ3RoO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0bmF0aXZlUmVzcG9uc2Uub25jZSgnZW5kJywgZnVuY3Rpb24gKCk6IHZvaWQge1xuXHRcdFx0XHR0aW1lb3V0ICYmIHRpbWVvdXQuZGVzdHJveSgpO1xuXG5cdFx0XHRcdGlmICghb3B0aW9ucy5zdHJlYW1EYXRhKSB7XG5cdFx0XHRcdFx0Ly8gVE9ETzogd2hhdCB0eXBlIHNob3VsZCBkYXRhIGhhdmU/XG5cdFx0XHRcdFx0cmVzcG9uc2UuZGF0YSA9IDxhbnk+IChvcHRpb25zLnN0cmVhbUVuY29kaW5nID8gZGF0YS5qb2luKCcnKSA6IEJ1ZmZlci5jb25jYXQoZGF0YSwgbG9hZGVkKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBJZiB1c2luZyBhIHN0cmVhbVRhcmdldCwgd2FpdCBmb3IgaXQgdG8gZmluaXNoIGluIGNhc2UgaXQgdGhyb3dzIGFuIGVycm9yXG5cdFx0XHRcdGlmICghb3B0aW9ucy5zdHJlYW1UYXJnZXQpIHtcblx0XHRcdFx0XHRyZXNvbHZlKHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRvcHRpb25zLnN0cmVhbVRhcmdldC5jbG9zZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdHJlcXVlc3Qub25jZSgnZXJyb3InLCByZWplY3QpO1xuXG5cdFx0aWYgKG9wdGlvbnMuZGF0YSkge1xuXHRcdFx0aWYgKG9wdGlvbnMuZGF0YSBpbnN0YW5jZW9mIFJlYWRhYmxlU3RyZWFtKSB7XG5cdFx0XHRcdGNvbnN0IHJlcXVlc3RTaW5rID0gbmV3IFdyaXRhYmxlTm9kZVN0cmVhbVNpbmsocmVxdWVzdCk7XG5cdFx0XHRcdGNvbnN0IHdyaXRhYmxlUmVxdWVzdCA9IG5ldyBXcml0YWJsZVN0cmVhbShyZXF1ZXN0U2luayk7XG5cdFx0XHRcdG9wdGlvbnMuZGF0YS5waXBlVG8od3JpdGFibGVSZXF1ZXN0KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyb3I6IFJlcXVlc3RFcnJvcjxUPikge1xuXHRcdFx0XHRcdFx0ZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcblx0XHRcdFx0XHRcdHdyaXRhYmxlUmVxdWVzdC5hYm9ydChlcnJvcik7XG5cdFx0XHRcdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHJlcXVlc3QuZW5kKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmVxdWVzdC5lbmQoKTtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucy50aW1lb3V0ID4gMCAmJiBvcHRpb25zLnRpbWVvdXQgIT09IEluZmluaXR5KSB7XG5cdFx0XHR0aW1lb3V0ID0gKGZ1bmN0aW9uICgpOiBIYW5kbGUge1xuXHRcdFx0XHRjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCk6IHZvaWQge1xuXHRcdFx0XHRcdGNvbnN0IGVycm9yID0gbmV3IFJlcXVlc3RUaW1lb3V0RXJyb3IoJ1JlcXVlc3QgdGltZWQgb3V0IGFmdGVyICcgKyBvcHRpb25zLnRpbWVvdXQgKyAnbXMnKTtcblx0XHRcdFx0XHRlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuXHRcdFx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0XHRcdH0sIG9wdGlvbnMudGltZW91dCk7XG5cblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUhhbmRsZShmdW5jdGlvbiAoKTogdm9pZCB7XG5cdFx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWVyKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KSgpO1xuXHRcdH1cblx0fSwgZnVuY3Rpb24gKCkge1xuXHRcdHJlcXVlc3QuYWJvcnQoKTtcblx0fSkuY2F0Y2goZnVuY3Rpb24gKGVycm9yOiBFcnJvcik6IGFueSB7XG5cdFx0bGV0IHBhcnNlZFVybCA9IHVybFV0aWwucGFyc2UodXJsKTtcblxuXHRcdGlmIChwYXJzZWRVcmwuYXV0aCkge1xuXHRcdFx0cGFyc2VkVXJsLmF1dGggPSAnKHJlZGFjdGVkKSc7XG5cdFx0fVxuXG5cdFx0bGV0IHNhbml0aXplZFVybCA9IHVybFV0aWwuZm9ybWF0KHBhcnNlZFVybCk7XG5cblx0XHRlcnJvci5tZXNzYWdlID0gJ1snICsgcmVxdWVzdE9wdGlvbnMubWV0aG9kICsgJyAnICsgc2FuaXRpemVkVXJsICsgJ10gJyArIGVycm9yLm1lc3NhZ2U7XG5cdFx0dGhyb3cgZXJyb3I7XG5cdH0pO1xuXG5cdHJldHVybiBwcm9taXNlO1xufVxuIl19