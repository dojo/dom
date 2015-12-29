var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './async/Task', './has', './Registry', './load'], factory);
    }
})(function (require, exports) {
    var Task_1 = require('./async/Task');
    var has_1 = require('./has');
    var Registry_1 = require('./Registry');
    var load_1 = require('./load');
    var FilterRegistry = (function (_super) {
        __extends(FilterRegistry, _super);
        function FilterRegistry() {
            _super.apply(this, arguments);
        }
        FilterRegistry.prototype.register = function (test, value, first) {
            var entryTest;
            if (typeof test === 'string') {
                entryTest = function (response, url, options) {
                    return test === url;
                };
            }
            else if (test instanceof RegExp) {
                entryTest = function (response, url, options) {
                    return test.test(url);
                };
            }
            else {
                entryTest = test;
            }
            return _super.prototype.register.call(this, entryTest, value, first);
        };
        return FilterRegistry;
    })(Registry_1.default);
    exports.FilterRegistry = FilterRegistry;
    var defaultProvider = './request/xhr';
    if (has_1.default('host-node')) {
        defaultProvider = './request/node';
    }
    var ProviderRegistry = (function (_super) {
        __extends(ProviderRegistry, _super);
        function ProviderRegistry() {
            var _this = this;
            _super.call(this);
            var deferRequest = function (url, options) {
                var canceled = false;
                var actualResponse;
                return new Task_1.default(function (resolve, reject) {
                    _this._providerPromise.then(function (provider) {
                        if (canceled) {
                            return;
                        }
                        actualResponse = provider(url, options);
                        actualResponse.then(resolve, reject);
                    });
                }, function () {
                    if (!canceled) {
                        canceled = true;
                    }
                    if (actualResponse) {
                        actualResponse.cancel();
                    }
                });
            };
            // The first request to hit the default value will kick off the import of the default
            // provider. While that import is in-flight, subsequent requests will queue up while
            // waiting for the provider to be fulfilled.
            this._defaultValue = function (url, options) {
                _this._providerPromise = load_1.default(require, defaultProvider).then(function (_a) {
                    var providerModule = _a[0];
                    _this._defaultValue = providerModule.default;
                    return providerModule.default;
                });
                _this._defaultValue = deferRequest;
                return deferRequest(url, options);
            };
        }
        ProviderRegistry.prototype.register = function (test, value, first) {
            var entryTest;
            if (typeof test === 'string') {
                entryTest = function (url, options) {
                    return test === url;
                };
            }
            else if (test instanceof RegExp) {
                entryTest = function (url, options) {
                    return test.test(url);
                };
            }
            else {
                entryTest = test;
            }
            return _super.prototype.register.call(this, entryTest, value, first);
        };
        return ProviderRegistry;
    })(Registry_1.default);
    exports.ProviderRegistry = ProviderRegistry;
    /**
     * Request filters, which filter or modify responses. The default filter simply passes a response through unchanged.
     */
    exports.filterRegistry = new FilterRegistry(function (response) {
        return response;
    });
    /**
     * Request providers, which fulfill requests.
     */
    exports.providerRegistry = new ProviderRegistry();
    /**
     * Make a request, returning a Promise that will resolve or reject when the request completes.
     */
    var request = function request(url, options) {
        if (options === void 0) { options = {}; }
        var promise = exports.providerRegistry.match(url, options)(url, options)
            .then(function (response) {
            return Task_1.default.resolve(exports.filterRegistry.match(response, url, options)(response, url, options))
                .then(function (filterResponse) {
                response.data = filterResponse.data;
                return response;
            });
        });
        return promise;
    };
    ['DELETE', 'GET', 'POST', 'PUT'].forEach(function (method) {
        request[method.toLowerCase()] = function (url, options) {
            if (options === void 0) { options = {}; }
            options = Object.create(options);
            options.method = method;
            return request(url, options);
        };
    });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = request;
    /**
     * Add a filter that automatically parses incoming JSON responses.
     */
    exports.filterRegistry.register(function (response, url, options) {
        return typeof response.data === 'string' && options.responseType === 'json';
    }, function (response, url, options) {
        return {
            data: JSON.parse(response.data)
        };
    });
    /**
     * Add a filter that automatically parses incoming Buffer responses in Node.
     */
    exports.filterRegistry.register(function (response, url, options) {
        return options && options.responseType === 'json' && Buffer && typeof Buffer.isBuffer(response.data) !== 'undefined';
    }, function (response, url, options) {
        return {
            data: JSON.parse(String(response.data))
        };
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXF1ZXN0LnRzIl0sIm5hbWVzIjpbIkZpbHRlclJlZ2lzdHJ5IiwiRmlsdGVyUmVnaXN0cnkuY29uc3RydWN0b3IiLCJGaWx0ZXJSZWdpc3RyeS5yZWdpc3RlciIsIlByb3ZpZGVyUmVnaXN0cnkiLCJQcm92aWRlclJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiUHJvdmlkZXJSZWdpc3RyeS5yZWdpc3RlciIsInJlcXVlc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQSxxQkFBaUIsY0FBYyxDQUFDLENBQUE7SUFDaEMsb0JBQWdCLE9BQU8sQ0FBQyxDQUFBO0lBR3hCLHlCQUErQixZQUFZLENBQUMsQ0FBQTtJQUM1QyxxQkFBaUIsUUFBUSxDQUFDLENBQUE7SUFLMUI7UUFBb0NBLGtDQUF1QkE7UUFBM0RBO1lBQW9DQyw4QkFBdUJBO1FBb0IzREEsQ0FBQ0E7UUFuQkFELGlDQUFRQSxHQUFSQSxVQUFTQSxJQUF5Q0EsRUFBRUEsS0FBb0JBLEVBQUVBLEtBQWVBO1lBQ3hGRSxJQUFJQSxTQUFlQSxDQUFDQTtZQUVwQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsSUFBSUEsS0FBS0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzlCQSxTQUFTQSxHQUFHQSxVQUFDQSxRQUFRQSxFQUFFQSxHQUFHQSxFQUFFQSxPQUFPQTtvQkFDbENBLE1BQU1BLENBQUNBLElBQUlBLEtBQUtBLEdBQUdBLENBQUNBO2dCQUNyQkEsQ0FBQ0EsQ0FBQ0E7WUFDSEEsQ0FBQ0E7WUFDREEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsWUFBWUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pDQSxTQUFTQSxHQUFHQSxVQUFDQSxRQUFRQSxFQUFFQSxHQUFHQSxFQUFFQSxPQUFPQTtvQkFDbENBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEdB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Q0FBQztZQUNOLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7U0FDL0IsQ0FBQztJQUNILENBQUMsQ0FDRCxDQUFDO0lBRUY7O09BRUc7SUFDSCxzQkFBYyxDQUFDLFFBQVEsQ0FDdEIsVUFBVSxRQUF1QixFQUFFLEdBQVcsRUFBRSxPQUF3QjtRQUN2RSxNQUFNLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxZQUFZLEtBQUssTUFBTSxJQUFJLE1BQU0sSUFBSSxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLFdBQVcsQ0FBQztJQUN0SCxDQUFDLEVBQ0QsVUFBVSxRQUF1QixFQUFFLEdBQVcsRUFBRSxPQUF1QjtRQUN0RSxNQUFNLENBQUM7WUFDTixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZDLENBQUM7SUFDSCxDQUFDLENBQ0QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUYXNrIGZyb20gJy4vYXN5bmMvVGFzayc7XG5pbXBvcnQgaGFzIGZyb20gJy4vaGFzJztcbmltcG9ydCB7IEhhbmRsZSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICcuL1Byb21pc2UnO1xuaW1wb3J0IFJlZ2lzdHJ5LCB7IFRlc3QgfSBmcm9tICcuL1JlZ2lzdHJ5JztcbmltcG9ydCBsb2FkIGZyb20gJy4vbG9hZCc7XG5pbXBvcnQgeyBQYXJhbUxpc3QgfSBmcm9tICcuL1VybFNlYXJjaFBhcmFtcyc7XG5cbmRlY2xhcmUgdmFyIHJlcXVpcmU6IGFueTtcblxuZXhwb3J0IGNsYXNzIEZpbHRlclJlZ2lzdHJ5IGV4dGVuZHMgUmVnaXN0cnk8UmVxdWVzdEZpbHRlcj4ge1xuXHRyZWdpc3Rlcih0ZXN0OiBzdHJpbmcgfCBSZWdFeHAgfCBSZXF1ZXN0RmlsdGVyVGVzdCwgdmFsdWU6IFJlcXVlc3RGaWx0ZXIsIGZpcnN0PzogYm9vbGVhbik6IEhhbmRsZSB7XG5cdFx0bGV0IGVudHJ5VGVzdDogVGVzdDtcblxuXHRcdGlmICh0eXBlb2YgdGVzdCA9PT0gJ3N0cmluZycpIHtcblx0XHRcdGVudHJ5VGVzdCA9IChyZXNwb25zZSwgdXJsLCBvcHRpb25zKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0ZXN0ID09PSB1cmw7XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRlbHNlIGlmICh0ZXN0IGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHRlbnRyeVRlc3QgPSAocmVzcG9uc2UsIHVybCwgb3B0aW9ucykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdGVzdC50ZXN0KHVybCk7XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGVudHJ5VGVzdCA9IDxSZXF1ZXN0RmlsdGVyVGVzdD4gdGVzdDtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3VwZXIucmVnaXN0ZXIoZW50cnlUZXN0LCB2YWx1ZSwgZmlyc3QpO1xuXHR9XG59XG5cbmxldCBkZWZhdWx0UHJvdmlkZXI6IHN0cmluZyA9ICcuL3JlcXVlc3QveGhyJztcbmlmIChoYXMoJ2hvc3Qtbm9kZScpKSB7XG5cdGRlZmF1bHRQcm92aWRlciA9ICcuL3JlcXVlc3Qvbm9kZSc7XG59XG5cbmV4cG9ydCBjbGFzcyBQcm92aWRlclJlZ2lzdHJ5IGV4dGVuZHMgUmVnaXN0cnk8UmVxdWVzdFByb3ZpZGVyPiB7XG5cdHByaXZhdGUgX3Byb3ZpZGVyUHJvbWlzZTogUHJvbWlzZTxSZXF1ZXN0UHJvdmlkZXI+O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHRjb25zdCBkZWZlclJlcXVlc3QgPSAodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9ucyk6IFJlc3BvbnNlUHJvbWlzZTxhbnk+ID0+IHtcblx0XHRcdGxldCBjYW5jZWxlZCA9IGZhbHNlO1xuXHRcdFx0bGV0IGFjdHVhbFJlc3BvbnNlOiBSZXNwb25zZVByb21pc2U8YW55Pjtcblx0XHRcdHJldHVybiBuZXcgVGFzazxSZXNwb25zZTxhbnk+PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRcdHRoaXMuX3Byb3ZpZGVyUHJvbWlzZS50aGVuKGZ1bmN0aW9uIChwcm92aWRlcikge1xuXHRcdFx0XHRcdGlmIChjYW5jZWxlZCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRhY3R1YWxSZXNwb25zZSA9IHByb3ZpZGVyKHVybCwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0YWN0dWFsUmVzcG9uc2UudGhlbihyZXNvbHZlLCByZWplY3QpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0aWYgKCFjYW5jZWxlZCkge1xuXHRcdFx0XHRcdGNhbmNlbGVkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoYWN0dWFsUmVzcG9uc2UpIHtcblx0XHRcdFx0XHRhY3R1YWxSZXNwb25zZS5jYW5jZWwoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdC8vIFRoZSBmaXJzdCByZXF1ZXN0IHRvIGhpdCB0aGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGtpY2sgb2ZmIHRoZSBpbXBvcnQgb2YgdGhlIGRlZmF1bHRcblx0XHQvLyBwcm92aWRlci4gV2hpbGUgdGhhdCBpbXBvcnQgaXMgaW4tZmxpZ2h0LCBzdWJzZXF1ZW50IHJlcXVlc3RzIHdpbGwgcXVldWUgdXAgd2hpbGVcblx0XHQvLyB3YWl0aW5nIGZvciB0aGUgcHJvdmlkZXIgdG8gYmUgZnVsZmlsbGVkLlxuXHRcdHRoaXMuX2RlZmF1bHRWYWx1ZSA9ICh1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zKTogUmVzcG9uc2VQcm9taXNlPGFueT4gPT4ge1xuXHRcdFx0dGhpcy5fcHJvdmlkZXJQcm9taXNlID0gbG9hZChyZXF1aXJlLCBkZWZhdWx0UHJvdmlkZXIpLnRoZW4oKFsgcHJvdmlkZXJNb2R1bGUgXTogWyB7IGRlZmF1bHQ6IFJlcXVlc3RQcm92aWRlciB9IF0pOiBSZXF1ZXN0UHJvdmlkZXIgPT4ge1xuXHRcdFx0XHR0aGlzLl9kZWZhdWx0VmFsdWUgPSBwcm92aWRlck1vZHVsZS5kZWZhdWx0O1xuXHRcdFx0XHRyZXR1cm4gcHJvdmlkZXJNb2R1bGUuZGVmYXVsdDtcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5fZGVmYXVsdFZhbHVlID0gZGVmZXJSZXF1ZXN0O1xuXHRcdFx0cmV0dXJuIGRlZmVyUmVxdWVzdCh1cmwsIG9wdGlvbnMpO1xuXHRcdH07XG5cdH1cblxuXHRyZWdpc3Rlcih0ZXN0OiBzdHJpbmcgfCBSZWdFeHAgfCBSZXF1ZXN0UHJvdmlkZXJUZXN0LCB2YWx1ZTogUmVxdWVzdFByb3ZpZGVyLCBmaXJzdD86IGJvb2xlYW4pOiBIYW5kbGUge1xuXHRcdGxldCBlbnRyeVRlc3Q6IFRlc3Q7XG5cblx0XHRpZiAodHlwZW9mIHRlc3QgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRlbnRyeVRlc3QgPSAodXJsLCBvcHRpb25zKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0ZXN0ID09PSB1cmw7XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRlbHNlIGlmICh0ZXN0IGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHRlbnRyeVRlc3QgPSAodXJsLCBvcHRpb25zKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0ZXN0LnRlc3QodXJsKTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0ZW50cnlUZXN0ID0gPFJlcXVlc3RQcm92aWRlclRlc3Q+IHRlc3Q7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHN1cGVyLnJlZ2lzdGVyKGVudHJ5VGVzdCwgdmFsdWUsIGZpcnN0KTtcblx0fVxufVxuXG4vKipcbiAqIFJlcXVlc3QgZmlsdGVycywgd2hpY2ggZmlsdGVyIG9yIG1vZGlmeSByZXNwb25zZXMuIFRoZSBkZWZhdWx0IGZpbHRlciBzaW1wbHkgcGFzc2VzIGEgcmVzcG9uc2UgdGhyb3VnaCB1bmNoYW5nZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBmaWx0ZXJSZWdpc3RyeSA9IG5ldyBGaWx0ZXJSZWdpc3RyeShmdW5jdGlvbiAocmVzcG9uc2U6IFJlc3BvbnNlPGFueT4pOiBSZXNwb25zZTxhbnk+IHtcblx0cmV0dXJuIHJlc3BvbnNlO1xufSk7XG5cbi8qKlxuICogUmVxdWVzdCBwcm92aWRlcnMsIHdoaWNoIGZ1bGZpbGwgcmVxdWVzdHMuXG4gKi9cbmV4cG9ydCBjb25zdCBwcm92aWRlclJlZ2lzdHJ5ID0gbmV3IFByb3ZpZGVyUmVnaXN0cnkoKTtcblxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0RXJyb3I8VD4gZXh0ZW5kcyBFcnJvciB7XG5cdHJlc3BvbnNlOiBSZXNwb25zZTxUPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0RmlsdGVyIHtcblx0PFQ+KHJlc3BvbnNlOiBSZXNwb25zZTxUPiwgdXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9ucyk6IFQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdEZpbHRlclRlc3QgZXh0ZW5kcyBUZXN0IHtcblx0PFQ+KHJlc3BvbnNlOiBSZXNwb25zZTxhbnk+LCB1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zKTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0T3B0aW9ucyB7XG5cdGF1dGg/OiBzdHJpbmc7XG5cdGNhY2hlQnVzdD86IGFueTtcblx0ZGF0YT86IGFueTtcblx0aGFuZGxlQXM/OiBzdHJpbmc7XG5cdGhlYWRlcnM/OiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmc7IH07XG5cdG1ldGhvZD86IHN0cmluZztcblx0cGFzc3dvcmQ/OiBzdHJpbmc7XG5cdHF1ZXJ5Pzogc3RyaW5nIHwgUGFyYW1MaXN0O1xuXHRyZXNwb25zZVR5cGU/OiBzdHJpbmc7XG5cdHRpbWVvdXQ/OiBudW1iZXI7XG5cdHVzZXI/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdFByb3ZpZGVyIHtcblx0PFQ+KHVybDogc3RyaW5nLCBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnMpOiBSZXNwb25zZVByb21pc2U8VD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdFByb3ZpZGVyVGVzdCBleHRlbmRzIFRlc3Qge1xuXHQodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9ucyk6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzcG9uc2U8VD4ge1xuXHRkYXRhOiBUO1xuXHRuYXRpdmVSZXNwb25zZT86IGFueTtcblx0cmVxdWVzdE9wdGlvbnM6IFJlcXVlc3RPcHRpb25zO1xuXHRzdGF0dXNDb2RlOiBudW1iZXI7XG5cdHN0YXR1c1RleHQ/OiBzdHJpbmc7XG5cdHVybDogc3RyaW5nO1xuXG5cdGdldEhlYWRlcihuYW1lOiBzdHJpbmcpOiBzdHJpbmc7XG59XG5cbi8qKlxuICogVGhlIHRhc2sgcmV0dXJuZWQgYnkgYSByZXF1ZXN0LCB3aGljaCB3aWxsIHJlc29sdmUgdG8gYSBSZXNwb25zZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlc3BvbnNlUHJvbWlzZTxUPiBleHRlbmRzIFRhc2s8UmVzcG9uc2U8VD4+IHt9XG5cbi8qKlxuICogTWFrZSBhIHJlcXVlc3QsIHJldHVybmluZyBhIFByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgb3IgcmVqZWN0IHdoZW4gdGhlIHJlcXVlc3QgY29tcGxldGVzLlxuICovXG5jb25zdCByZXF1ZXN0OiB7XG5cdDxUPih1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zKTogUmVzcG9uc2VQcm9taXNlPFQ+O1xuXHRkZWxldGU8VD4odXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9ucyk6IFJlc3BvbnNlUHJvbWlzZTxUPjtcblx0Z2V0PFQ+KHVybDogc3RyaW5nLCBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnMpOiBSZXNwb25zZVByb21pc2U8VD47XG5cdHBvc3Q8VD4odXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9ucyk6IFJlc3BvbnNlUHJvbWlzZTxUPjtcblx0cHV0PFQ+KHVybDogc3RyaW5nLCBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnMpOiBSZXNwb25zZVByb21pc2U8VD47XG59ID0gPGFueT4gZnVuY3Rpb24gcmVxdWVzdDxUPih1cmw6IHN0cmluZywgb3B0aW9uczogUmVxdWVzdE9wdGlvbnMgPSB7fSk6IFJlc3BvbnNlUHJvbWlzZTxUPiB7XG5cdGNvbnN0IHByb21pc2UgPSBwcm92aWRlclJlZ2lzdHJ5Lm1hdGNoKHVybCwgb3B0aW9ucykodXJsLCBvcHRpb25zKVxuXHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZTogUmVzcG9uc2U8VD4pIHtcblx0XHRcdHJldHVybiBUYXNrLnJlc29sdmUoZmlsdGVyUmVnaXN0cnkubWF0Y2gocmVzcG9uc2UsIHVybCwgb3B0aW9ucykocmVzcG9uc2UsIHVybCwgb3B0aW9ucykpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChmaWx0ZXJSZXNwb25zZTogYW55KSB7XG5cdFx0XHRcdFx0cmVzcG9uc2UuZGF0YSA9IGZpbHRlclJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlO1xuXHRcdFx0XHR9KTtcblx0XHR9KTtcblxuXHRyZXR1cm4gcHJvbWlzZTtcbn07XG5cblsgJ0RFTEVURScsICdHRVQnLCAnUE9TVCcsICdQVVQnIF0uZm9yRWFjaChmdW5jdGlvbiAobWV0aG9kKSB7XG5cdCg8YW55PiByZXF1ZXN0KVttZXRob2QudG9Mb3dlckNhc2UoKV0gPSBmdW5jdGlvbiA8VD4odXJsOiBzdHJpbmcsIG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zID0ge30pOiBSZXNwb25zZVByb21pc2U8VD4ge1xuXHRcdG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG9wdGlvbnMpO1xuXHRcdG9wdGlvbnMubWV0aG9kID0gbWV0aG9kO1xuXHRcdHJldHVybiByZXF1ZXN0KHVybCwgb3B0aW9ucyk7XG5cdH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcmVxdWVzdDtcblxuLyoqXG4gKiBBZGQgYSBmaWx0ZXIgdGhhdCBhdXRvbWF0aWNhbGx5IHBhcnNlcyBpbmNvbWluZyBKU09OIHJlc3BvbnNlcy5cbiAqL1xuZmlsdGVyUmVnaXN0cnkucmVnaXN0ZXIoXG5cdGZ1bmN0aW9uIChyZXNwb25zZTogUmVzcG9uc2U8YW55PiwgdXJsOiBzdHJpbmcsIG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zKSB7XG5cdFx0cmV0dXJuIHR5cGVvZiByZXNwb25zZS5kYXRhID09PSAnc3RyaW5nJyAmJiBvcHRpb25zLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nO1xuXHR9LFxuXHRmdW5jdGlvbiAocmVzcG9uc2U6IFJlc3BvbnNlPGFueT4sIHVybDogc3RyaW5nLCBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyk6IE9iamVjdCB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGRhdGE6IEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YSlcblx0XHR9O1xuXHR9XG4pO1xuXG4vKipcbiAqIEFkZCBhIGZpbHRlciB0aGF0IGF1dG9tYXRpY2FsbHkgcGFyc2VzIGluY29taW5nIEJ1ZmZlciByZXNwb25zZXMgaW4gTm9kZS5cbiAqL1xuZmlsdGVyUmVnaXN0cnkucmVnaXN0ZXIoXG5cdGZ1bmN0aW9uIChyZXNwb25zZTogUmVzcG9uc2U8YW55PiwgdXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9ucykge1xuXHRcdHJldHVybiBvcHRpb25zICYmIG9wdGlvbnMucmVzcG9uc2VUeXBlID09PSAnanNvbicgJiYgQnVmZmVyICYmIHR5cGVvZiBCdWZmZXIuaXNCdWZmZXIocmVzcG9uc2UuZGF0YSkgIT09ICd1bmRlZmluZWQnO1xuXHR9LFxuXHRmdW5jdGlvbiAocmVzcG9uc2U6IFJlc3BvbnNlPGFueT4sIHVybDogc3RyaW5nLCBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyk6IE9iamVjdCB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGRhdGE6IEpTT04ucGFyc2UoU3RyaW5nKHJlc3BvbnNlLmRhdGEpKVxuXHRcdH07XG5cdH1cbik7XG4iXX0=