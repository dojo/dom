(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../async/Task', './errors/RequestTimeoutError', '../global', '../has', '../util', './util'], factory);
    }
})(function (require, exports) {
    var Task_1 = require('../async/Task');
    var RequestTimeoutError_1 = require('./errors/RequestTimeoutError');
    var global_1 = require('../global');
    var has_1 = require('../has');
    var util_1 = require('../util');
    var util_2 = require('./util');
    /**
     * A lookup table for valid `XMLHttpRequest#responseType` values.
     *
     * 'json' deliberately excluded since it is not supported in all environments, and as there is
     * already a filter for it in '../request'. Default '' and 'text' values also deliberately excluded.
     */
    var responseTypeMap = {
        arraybuffer: 'arraybuffer',
        // XHR2 environments that do not support `responseType=blob` still support `responseType=arraybuffer`,
        // which is a better way of handling blob data than as a string representation.
        blob: has_1.default('xhr2-blob') ? 'blob' : 'arraybuffer',
        document: 'document'
    };
    function xhr(url, options) {
        if (options === void 0) { options = {}; }
        var request = new XMLHttpRequest();
        var requestUrl = util_2.generateRequestUrl(url, options);
        var response = {
            data: null,
            nativeResponse: request,
            requestOptions: options,
            statusCode: null,
            statusText: null,
            url: requestUrl,
            getHeader: function (name) {
                return request.getResponseHeader(name);
            }
        };
        var promise = new Task_1.default(function (resolve, reject) {
            if (!options.method) {
                options.method = 'GET';
            }
            if ((!options.user || !options.password) && options.auth) {
                var auth = options.auth.split(':');
                options.user = decodeURIComponent(auth[0]);
                options.password = decodeURIComponent(auth[1]);
            }
            request.open(options.method, requestUrl, !options.blockMainThread, options.user, options.password);
            if (has_1.default('xhr2') && options.responseType in responseTypeMap) {
                request.responseType = responseTypeMap[options.responseType];
            }
            var timeoutHandle;
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    request.onreadystatechange = function () { };
                    timeoutHandle && timeoutHandle.destroy();
                    if (options.responseType === 'xml') {
                        response.data = request.responseXML;
                    }
                    else {
                        response.data = ('response' in request) ? request.response : request.responseText;
                    }
                    response.statusCode = request.status;
                    response.statusText = request.statusText;
                    if (response.statusCode > 0 && response.statusCode < 400) {
                        resolve(response);
                    }
                    else {
                        reject(response.statusText ?
                            new Error(response.statusText) :
                            new Error('An error prevented completion of the request.'));
                    }
                }
            };
            if (options.timeout > 0 && options.timeout !== Infinity) {
                timeoutHandle = util_1.createTimer(function () {
                    // Reject first, since aborting will also fire onreadystatechange which would reject with a
                    // less specific error.  (This is also why we set up our own timeout rather than using
                    // native timeout and ontimeout, because that aborts and fires onreadystatechange before ontimeout.)
                    reject(new RequestTimeoutError_1.default('The XMLHttpRequest request timed out.'));
                    request.abort();
                }, options.timeout);
            }
            var headers = options.headers;
            var hasContentTypeHeader = false;
            for (var header in headers) {
                if (header.toLowerCase() === 'content-type') {
                    hasContentTypeHeader = true;
                }
                request.setRequestHeader(header, headers[header]);
            }
            if (!headers || !('X-Requested-With' in headers)) {
                request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            }
            if (!hasContentTypeHeader && has_1.default('formdata') && options.data instanceof global_1.default.FormData) {
                // Assume that most forms do not contain large binary files. If that is not the case,
                // then "multipart/form-data" should be manually specified as the "Content-Type" header.
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
            if (options.responseType === 'xml' && request.overrideMimeType) {
                // This forces the XHR to parse the response as XML regardless of the MIME-type returned by the server
                request.overrideMimeType('text/xml');
            }
            request.send(options.data);
        }, function () {
            request && request.abort();
        });
        return promise;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = xhr;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JlcXVlc3QveGhyLnRzIl0sIm5hbWVzIjpbInhociIsInhoci5nZXRIZWFkZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQUEscUJBQWlCLGVBQWUsQ0FBQyxDQUFBO0lBQ2pDLG9DQUFnQyw4QkFBOEIsQ0FBQyxDQUFBO0lBQy9ELHVCQUFtQixXQUFXLENBQUMsQ0FBQTtJQUMvQixvQkFBZ0IsUUFBUSxDQUFDLENBQUE7SUFFekIscUJBQTRCLFNBQVMsQ0FBQyxDQUFBO0lBRXRDLHFCQUFtQyxRQUFRLENBQUMsQ0FBQTtJQU01Qzs7Ozs7T0FLRztJQUNILElBQU0sZUFBZSxHQUErQjtRQUNuRCxXQUFXLEVBQUUsYUFBYTtRQUMxQixzR0FBc0c7UUFDdEcsK0VBQStFO1FBQy9FLElBQUksRUFBRSxhQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsTUFBTSxHQUFHLGFBQWE7UUFDL0MsUUFBUSxFQUFFLFVBQVU7S0FDcEIsQ0FBQztJQUVGLGFBQStCLEdBQVcsRUFBRSxPQUErQjtRQUEvQkEsdUJBQStCQSxHQUEvQkEsWUFBK0JBO1FBQzFFQSxJQUFNQSxPQUFPQSxHQUFHQSxJQUFJQSxjQUFjQSxFQUFFQSxDQUFDQTtRQUNyQ0EsSUFBTUEsVUFBVUEsR0FBR0EseUJBQWtCQSxDQUFDQSxHQUFHQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNwREEsSUFBTUEsUUFBUUEsR0FBZ0JBO1lBQzdCQSxJQUFJQSxFQUFFQSxJQUFJQTtZQUNWQSxjQUFjQSxFQUFFQSxPQUFPQTtZQUN2QkEsY0FBY0EsRUFBRUEsT0FBT0E7WUFDdkJBLFVBQVVBLEVBQUVBLElBQUlBO1lBQ2hCQSxVQUFVQSxFQUFFQSxJQUFJQTtZQUNoQkEsR0FBR0EsRUFBRUEsVUFBVUE7WUFFZkEsU0FBU0EsWUFBQ0EsSUFBWUE7Z0JBQ3JCQyxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ3hDQSxDQUFDQTtTQUNERCxDQUFDQTtRQUVGQSxJQUFNQSxPQUFPQSxHQUFHQSxJQUFJQSxjQUFJQSxDQUFjQSxVQUFVQSxPQUFPQSxFQUFFQSxNQUFNQTtZQUM5RCxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUN4QixDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzFELElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLENBQUMsSUFBSSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxPQUFPLENBQUMsUUFBUSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELENBQUM7WUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVuRyxFQUFFLENBQUMsQ0FBQyxhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFlBQVksSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDO2dCQUM1RCxPQUFPLENBQUMsWUFBWSxHQUFHLGVBQWUsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDOUQsQ0FBQztZQUVELElBQUksYUFBcUIsQ0FBQztZQUMxQixPQUFPLENBQUMsa0JBQWtCLEdBQUc7Z0JBQzVCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUIsT0FBTyxDQUFDLGtCQUFrQixHQUFHLGNBQWEsQ0FBQyxDQUFDO29CQUM1QyxhQUFhLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUV6QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ3BDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztvQkFDckMsQ0FBQztvQkFDRCxJQUFJLENBQUMsQ0FBQzt3QkFDTCxRQUFRLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztvQkFDbkYsQ0FBQztvQkFFRCxRQUFRLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7b0JBQ3JDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztvQkFDekMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUMxRCxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ25CLENBQUM7b0JBQ0QsSUFBSSxDQUFDLENBQUM7d0JBQ0wsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVOzRCQUN6QixJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDOzRCQUM5QixJQUFJLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUMxRCxDQUFDO29CQUNILENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUMsQ0FBQztZQUVGLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDekQsYUFBYSxHQUFHLGtCQUFXLENBQUM7b0JBQzNCLDJGQUEyRjtvQkFDM0Ysc0ZBQXNGO29CQUN0RixvR0FBb0c7b0JBQ3BHLE1BQU0sQ0FBQyxJQUFJLDZCQUFtQixDQUFDLHVDQUF1QyxDQUFDLENBQUMsQ0FBQztvQkFDekUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNqQixDQUFDLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JCLENBQUM7WUFFRCxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1lBQ2hDLElBQUksb0JBQW9CLEdBQVksS0FBSyxDQUFDO1lBQzFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxLQUFLLGNBQWMsQ0FBQyxDQUFDLENBQUM7b0JBQzdDLG9CQUFvQixHQUFHLElBQUksQ0FBQztnQkFDN0IsQ0FBQztnQkFFRCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ25ELENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsa0JBQWtCLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUNoRSxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsSUFBSSxhQUFHLENBQUMsVUFBVSxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksWUFBWSxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pGLHFGQUFxRjtnQkFDckYsd0ZBQXdGO2dCQUN4RixPQUFPLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7WUFDL0UsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEtBQUssS0FBSyxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLHNHQUFzRztnQkFDdEcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7WUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDLEVBQUVBO1lBQ0YsT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUNBLENBQUNBO1FBRUhBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBO0lBQ2hCQSxDQUFDQTtJQXJHRDt5QkFxR0MsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUYXNrIGZyb20gJy4uL2FzeW5jL1Rhc2snO1xuaW1wb3J0IFJlcXVlc3RUaW1lb3V0RXJyb3IgZnJvbSAnLi9lcnJvcnMvUmVxdWVzdFRpbWVvdXRFcnJvcic7XG5pbXBvcnQgZ2xvYmFsIGZyb20gJy4uL2dsb2JhbCc7XG5pbXBvcnQgaGFzIGZyb20gJy4uL2hhcyc7XG5pbXBvcnQgeyBIYW5kbGUgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGNyZWF0ZVRpbWVyIH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgeyBSZXF1ZXN0T3B0aW9ucywgUmVzcG9uc2UsIFJlc3BvbnNlUHJvbWlzZSB9IGZyb20gJy4uL3JlcXVlc3QnO1xuaW1wb3J0IHsgZ2VuZXJhdGVSZXF1ZXN0VXJsIH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBYaHJSZXF1ZXN0T3B0aW9ucyBleHRlbmRzIFJlcXVlc3RPcHRpb25zIHtcblx0YmxvY2tNYWluVGhyZWFkPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBIGxvb2t1cCB0YWJsZSBmb3IgdmFsaWQgYFhNTEh0dHBSZXF1ZXN0I3Jlc3BvbnNlVHlwZWAgdmFsdWVzLlxuICpcbiAqICdqc29uJyBkZWxpYmVyYXRlbHkgZXhjbHVkZWQgc2luY2UgaXQgaXMgbm90IHN1cHBvcnRlZCBpbiBhbGwgZW52aXJvbm1lbnRzLCBhbmQgYXMgdGhlcmUgaXNcbiAqIGFscmVhZHkgYSBmaWx0ZXIgZm9yIGl0IGluICcuLi9yZXF1ZXN0Jy4gRGVmYXVsdCAnJyBhbmQgJ3RleHQnIHZhbHVlcyBhbHNvIGRlbGliZXJhdGVseSBleGNsdWRlZC5cbiAqL1xuY29uc3QgcmVzcG9uc2VUeXBlTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZzsgfSA9IHtcblx0YXJyYXlidWZmZXI6ICdhcnJheWJ1ZmZlcicsXG5cdC8vIFhIUjIgZW52aXJvbm1lbnRzIHRoYXQgZG8gbm90IHN1cHBvcnQgYHJlc3BvbnNlVHlwZT1ibG9iYCBzdGlsbCBzdXBwb3J0IGByZXNwb25zZVR5cGU9YXJyYXlidWZmZXJgLFxuXHQvLyB3aGljaCBpcyBhIGJldHRlciB3YXkgb2YgaGFuZGxpbmcgYmxvYiBkYXRhIHRoYW4gYXMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24uXG5cdGJsb2I6IGhhcygneGhyMi1ibG9iJykgPyAnYmxvYicgOiAnYXJyYXlidWZmZXInLFxuXHRkb2N1bWVudDogJ2RvY3VtZW50J1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24geGhyPFQ+KHVybDogc3RyaW5nLCBvcHRpb25zOiBYaHJSZXF1ZXN0T3B0aW9ucyA9IHt9KTogUmVzcG9uc2VQcm9taXNlPFQ+IHtcblx0Y29uc3QgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXHRjb25zdCByZXF1ZXN0VXJsID0gZ2VuZXJhdGVSZXF1ZXN0VXJsKHVybCwgb3B0aW9ucyk7XG5cdGNvbnN0IHJlc3BvbnNlOiBSZXNwb25zZTxUPiA9IHtcblx0XHRkYXRhOiBudWxsLFxuXHRcdG5hdGl2ZVJlc3BvbnNlOiByZXF1ZXN0LFxuXHRcdHJlcXVlc3RPcHRpb25zOiBvcHRpb25zLFxuXHRcdHN0YXR1c0NvZGU6IG51bGwsXG5cdFx0c3RhdHVzVGV4dDogbnVsbCxcblx0XHR1cmw6IHJlcXVlc3RVcmwsXG5cblx0XHRnZXRIZWFkZXIobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRcdHJldHVybiByZXF1ZXN0LmdldFJlc3BvbnNlSGVhZGVyKG5hbWUpO1xuXHRcdH1cblx0fTtcblxuXHRjb25zdCBwcm9taXNlID0gbmV3IFRhc2s8UmVzcG9uc2U8VD4+KGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpOiB2b2lkIHtcblx0XHRpZiAoIW9wdGlvbnMubWV0aG9kKSB7XG5cdFx0XHRvcHRpb25zLm1ldGhvZCA9ICdHRVQnO1xuXHRcdH1cblxuXHRcdGlmICgoIW9wdGlvbnMudXNlciB8fCAhb3B0aW9ucy5wYXNzd29yZCkgJiYgb3B0aW9ucy5hdXRoKSB7XG5cdFx0XHRsZXQgYXV0aCA9IG9wdGlvbnMuYXV0aC5zcGxpdCgnOicpO1xuXHRcdFx0b3B0aW9ucy51c2VyID0gZGVjb2RlVVJJQ29tcG9uZW50KGF1dGhbMF0pO1xuXHRcdFx0b3B0aW9ucy5wYXNzd29yZCA9IGRlY29kZVVSSUNvbXBvbmVudChhdXRoWzFdKTtcblx0XHR9XG5cblx0XHRyZXF1ZXN0Lm9wZW4ob3B0aW9ucy5tZXRob2QsIHJlcXVlc3RVcmwsICFvcHRpb25zLmJsb2NrTWFpblRocmVhZCwgb3B0aW9ucy51c2VyLCBvcHRpb25zLnBhc3N3b3JkKTtcblxuXHRcdGlmIChoYXMoJ3hocjInKSAmJiBvcHRpb25zLnJlc3BvbnNlVHlwZSBpbiByZXNwb25zZVR5cGVNYXApIHtcblx0XHRcdHJlcXVlc3QucmVzcG9uc2VUeXBlID0gcmVzcG9uc2VUeXBlTWFwW29wdGlvbnMucmVzcG9uc2VUeXBlXTtcblx0XHR9XG5cblx0XHRsZXQgdGltZW91dEhhbmRsZTogSGFuZGxlO1xuXHRcdHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCk6IHZvaWQge1xuXHRcdFx0aWYgKHJlcXVlc3QucmVhZHlTdGF0ZSA9PT0gNCkge1xuXHRcdFx0XHRyZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHt9O1xuXHRcdFx0XHR0aW1lb3V0SGFuZGxlICYmIHRpbWVvdXRIYW5kbGUuZGVzdHJveSgpO1xuXG5cdFx0XHRcdGlmIChvcHRpb25zLnJlc3BvbnNlVHlwZSA9PT0gJ3htbCcpIHtcblx0XHRcdFx0XHRyZXNwb25zZS5kYXRhID0gcmVxdWVzdC5yZXNwb25zZVhNTDtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRyZXNwb25zZS5kYXRhID0gKCdyZXNwb25zZScgaW4gcmVxdWVzdCkgPyByZXF1ZXN0LnJlc3BvbnNlIDogcmVxdWVzdC5yZXNwb25zZVRleHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXNwb25zZS5zdGF0dXNDb2RlID0gcmVxdWVzdC5zdGF0dXM7XG5cdFx0XHRcdHJlc3BvbnNlLnN0YXR1c1RleHQgPSByZXF1ZXN0LnN0YXR1c1RleHQ7XG5cdFx0XHRcdGlmIChyZXNwb25zZS5zdGF0dXNDb2RlID4gMCAmJiByZXNwb25zZS5zdGF0dXNDb2RlIDwgNDAwKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0cmVqZWN0KHJlc3BvbnNlLnN0YXR1c1RleHQgP1xuXHRcdFx0XHRcdFx0bmV3IEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpIDpcblx0XHRcdFx0XHRcdG5ldyBFcnJvcignQW4gZXJyb3IgcHJldmVudGVkIGNvbXBsZXRpb24gb2YgdGhlIHJlcXVlc3QuJylcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmIChvcHRpb25zLnRpbWVvdXQgPiAwICYmIG9wdGlvbnMudGltZW91dCAhPT0gSW5maW5pdHkpIHtcblx0XHRcdHRpbWVvdXRIYW5kbGUgPSBjcmVhdGVUaW1lcihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vIFJlamVjdCBmaXJzdCwgc2luY2UgYWJvcnRpbmcgd2lsbCBhbHNvIGZpcmUgb25yZWFkeXN0YXRlY2hhbmdlIHdoaWNoIHdvdWxkIHJlamVjdCB3aXRoIGFcblx0XHRcdFx0Ly8gbGVzcyBzcGVjaWZpYyBlcnJvci4gIChUaGlzIGlzIGFsc28gd2h5IHdlIHNldCB1cCBvdXIgb3duIHRpbWVvdXQgcmF0aGVyIHRoYW4gdXNpbmdcblx0XHRcdFx0Ly8gbmF0aXZlIHRpbWVvdXQgYW5kIG9udGltZW91dCwgYmVjYXVzZSB0aGF0IGFib3J0cyBhbmQgZmlyZXMgb25yZWFkeXN0YXRlY2hhbmdlIGJlZm9yZSBvbnRpbWVvdXQuKVxuXHRcdFx0XHRyZWplY3QobmV3IFJlcXVlc3RUaW1lb3V0RXJyb3IoJ1RoZSBYTUxIdHRwUmVxdWVzdCByZXF1ZXN0IHRpbWVkIG91dC4nKSk7XG5cdFx0XHRcdHJlcXVlc3QuYWJvcnQoKTtcblx0XHRcdH0sIG9wdGlvbnMudGltZW91dCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycztcblx0XHRsZXQgaGFzQ29udGVudFR5cGVIZWFkZXI6IGJvb2xlYW4gPSBmYWxzZTtcblx0XHRmb3IgKGxldCBoZWFkZXIgaW4gaGVhZGVycykge1xuXHRcdFx0aWYgKGhlYWRlci50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuXHRcdFx0XHRoYXNDb250ZW50VHlwZUhlYWRlciA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihoZWFkZXIsIGhlYWRlcnNbaGVhZGVyXSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFoZWFkZXJzIHx8ICEoJ1gtUmVxdWVzdGVkLVdpdGgnIGluIGhlYWRlcnMpKSB7XG5cdFx0XHRyZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ1gtUmVxdWVzdGVkLVdpdGgnLCAnWE1MSHR0cFJlcXVlc3QnKTtcblx0XHR9XG5cblx0XHRpZiAoIWhhc0NvbnRlbnRUeXBlSGVhZGVyICYmIGhhcygnZm9ybWRhdGEnKSAmJiBvcHRpb25zLmRhdGEgaW5zdGFuY2VvZiBnbG9iYWwuRm9ybURhdGEpIHtcblx0XHRcdC8vIEFzc3VtZSB0aGF0IG1vc3QgZm9ybXMgZG8gbm90IGNvbnRhaW4gbGFyZ2UgYmluYXJ5IGZpbGVzLiBJZiB0aGF0IGlzIG5vdCB0aGUgY2FzZSxcblx0XHRcdC8vIHRoZW4gXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCIgc2hvdWxkIGJlIG1hbnVhbGx5IHNwZWNpZmllZCBhcyB0aGUgXCJDb250ZW50LVR5cGVcIiBoZWFkZXIuXG5cdFx0XHRyZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucy5yZXNwb25zZVR5cGUgPT09ICd4bWwnICYmIHJlcXVlc3Qub3ZlcnJpZGVNaW1lVHlwZSkge1xuXHRcdFx0Ly8gVGhpcyBmb3JjZXMgdGhlIFhIUiB0byBwYXJzZSB0aGUgcmVzcG9uc2UgYXMgWE1MIHJlZ2FyZGxlc3Mgb2YgdGhlIE1JTUUtdHlwZSByZXR1cm5lZCBieSB0aGUgc2VydmVyXG5cdFx0XHRyZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUoJ3RleHQveG1sJyk7XG5cdFx0fVxuXG5cdFx0cmVxdWVzdC5zZW5kKG9wdGlvbnMuZGF0YSk7XG5cdH0sIGZ1bmN0aW9uICgpIHtcblx0XHRyZXF1ZXN0ICYmIHJlcXVlc3QuYWJvcnQoKTtcblx0fSk7XG5cblx0cmV0dXJuIHByb21pc2U7XG59XG4iXX0=