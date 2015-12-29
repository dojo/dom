(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './Promise'], factory);
    }
})(function (require, exports) {
    var Promise_1 = require('./Promise');
    var load = (function () {
        if (typeof module === 'object' && typeof module.exports === 'object') {
            return function (contextualRequire) {
                var moduleIds = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    moduleIds[_i - 1] = arguments[_i];
                }
                if (typeof contextualRequire === 'string') {
                    moduleIds.unshift(contextualRequire);
                    contextualRequire = require;
                }
                return new Promise_1.default(function (resolve, reject) {
                    try {
                        resolve(moduleIds.map(function (moduleId) {
                            return contextualRequire(moduleId);
                        }));
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            };
        }
        else if (typeof define === 'function' && define.amd) {
            return function (contextualRequire) {
                var moduleIds = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    moduleIds[_i - 1] = arguments[_i];
                }
                if (typeof contextualRequire === 'string') {
                    moduleIds.unshift(contextualRequire);
                    contextualRequire = require;
                }
                return new Promise_1.default(function (resolve) {
                    // TODO: Error path once https://github.com/dojo/loader/issues/14 is figured out
                    contextualRequire(moduleIds, function () {
                        var modules = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            modules[_i - 0] = arguments[_i];
                        }
                        resolve(modules);
                    });
                });
            };
        }
        else {
            return function () {
                return Promise_1.default.reject(new Error('Unknown loader'));
            };
        }
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = load;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2FkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQUEsd0JBQW9CLFdBQVcsQ0FBQyxDQUFBO0lBb0JoQyxJQUFNLElBQUksR0FBUyxDQUFDO1FBQ25CLEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxPQUFPLE1BQU0sQ0FBQyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN0RSxNQUFNLENBQUMsVUFBVSxpQkFBc0I7Z0JBQUUsbUJBQXNCO3FCQUF0QixXQUFzQixDQUF0QixzQkFBc0IsQ0FBdEIsSUFBc0I7b0JBQXRCLGtDQUFzQjs7Z0JBQzlELEVBQUUsQ0FBQyxDQUFDLE9BQU8saUJBQWlCLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDM0MsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO29CQUNyQyxpQkFBaUIsR0FBRyxPQUFPLENBQUM7Z0JBQzdCLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLElBQUksaUJBQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO29CQUMzQyxJQUFJLENBQUM7d0JBQ0osT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxRQUFROzRCQUN2QyxNQUFNLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ0wsQ0FDQTtvQkFBQSxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUNkLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDZixDQUFDO2dCQUNGLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDO1FBQ0gsQ0FBQztRQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLE1BQU0sS0FBSyxVQUFVLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLFVBQVUsaUJBQXNCO2dCQUFFLG1CQUFzQjtxQkFBdEIsV0FBc0IsQ0FBdEIsc0JBQXNCLENBQXRCLElBQXNCO29CQUF0QixrQ0FBc0I7O2dCQUM5RCxFQUFFLENBQUMsQ0FBQyxPQUFPLGlCQUFpQixLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzNDLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztvQkFDckMsaUJBQWlCLEdBQUcsT0FBTyxDQUFDO2dCQUM3QixDQUFDO2dCQUNELE1BQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsVUFBVSxPQUFPO29CQUNuQyxnRkFBZ0Y7b0JBQ2hGLGlCQUFpQixDQUFDLFNBQVMsRUFBRTt3QkFBVSxpQkFBaUI7NkJBQWpCLFdBQWlCLENBQWpCLHNCQUFpQixDQUFqQixJQUFpQjs0QkFBakIsZ0NBQWlCOzt3QkFDdkQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNsQixDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQztRQUNILENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNMLE1BQU0sQ0FBQztnQkFDTixNQUFNLENBQUMsaUJBQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQ3BELENBQUMsQ0FBQztRQUNILENBQUM7SUFDRixDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ0w7c0JBQWUsSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAnLi9Qcm9taXNlJztcblxuZGVjbGFyZSB2YXIgZGVmaW5lOiB7XG5cdCguLi5hcmdzOiBhbnlbXSk6IGFueTtcblx0YW1kOiBhbnk7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIEFNRFJlcXVpcmUge1xuXHQobW9kdWxlSWRzOiBzdHJpbmdbXSwgY2FsbGJhY2s6ICguLi5tb2R1bGVzOiBhbnlbXSkgPT4gdm9pZCk6IHZvaWQ7XG59XG5leHBvcnQgaW50ZXJmYWNlIE5vZGVSZXF1aXJlIHtcblx0KG1vZHVsZUlkOiBzdHJpbmcpOiBhbnk7XG59XG5leHBvcnQgdHlwZSBSZXF1aXJlID0gQU1EUmVxdWlyZSB8IE5vZGVSZXF1aXJlO1xuXG5leHBvcnQgaW50ZXJmYWNlIExvYWQge1xuXHQocmVxdWlyZTogUmVxdWlyZSwgLi4ubW9kdWxlSWRzOiBzdHJpbmdbXSk6IFByb21pc2U8YW55W10+O1xuXHQoLi4ubW9kdWxlSWRzOiBzdHJpbmdbXSk6IFByb21pc2U8YW55W10+O1xufVxuXG5jb25zdCBsb2FkOiBMb2FkID0gKGZ1bmN0aW9uICgpOiBMb2FkIHtcblx0aWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKGNvbnRleHR1YWxSZXF1aXJlOiBhbnksIC4uLm1vZHVsZUlkczogc3RyaW5nW10pOiBQcm9taXNlPGFueVtdPiB7XG5cdFx0XHRpZiAodHlwZW9mIGNvbnRleHR1YWxSZXF1aXJlID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRtb2R1bGVJZHMudW5zaGlmdChjb250ZXh0dWFsUmVxdWlyZSk7XG5cdFx0XHRcdGNvbnRleHR1YWxSZXF1aXJlID0gcmVxdWlyZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmVzb2x2ZShtb2R1bGVJZHMubWFwKGZ1bmN0aW9uIChtb2R1bGVJZCk6IGFueSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY29udGV4dHVhbFJlcXVpcmUobW9kdWxlSWQpO1xuXHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXHR9XG5cdGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoY29udGV4dHVhbFJlcXVpcmU6IGFueSwgLi4ubW9kdWxlSWRzOiBzdHJpbmdbXSk6IFByb21pc2U8YW55W10+IHtcblx0XHRcdGlmICh0eXBlb2YgY29udGV4dHVhbFJlcXVpcmUgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdG1vZHVsZUlkcy51bnNoaWZ0KGNvbnRleHR1YWxSZXF1aXJlKTtcblx0XHRcdFx0Y29udGV4dHVhbFJlcXVpcmUgPSByZXF1aXJlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0XHRcdC8vIFRPRE86IEVycm9yIHBhdGggb25jZSBodHRwczovL2dpdGh1Yi5jb20vZG9qby9sb2FkZXIvaXNzdWVzLzE0IGlzIGZpZ3VyZWQgb3V0XG5cdFx0XHRcdGNvbnRleHR1YWxSZXF1aXJlKG1vZHVsZUlkcywgZnVuY3Rpb24gKC4uLm1vZHVsZXM6IGFueVtdKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZShtb2R1bGVzKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHR9XG5cdGVsc2Uge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdVbmtub3duIGxvYWRlcicpKTtcblx0XHR9O1xuXHR9XG59KSgpO1xuZXhwb3J0IGRlZmF1bHQgbG9hZDtcbiJdfQ==