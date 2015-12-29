(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './global', './has'], factory);
    }
})(function (require, exports) {
    var global_1 = require('./global');
    var has_1 = require('./has');
    function executeTask(item) {
        if (item.isActive) {
            item.callback();
        }
    }
    function getQueueHandle(item, destructor) {
        return {
            destroy: function () {
                this.destroy = function () { };
                item.isActive = false;
                item.callback = null;
                if (destructor) {
                    destructor();
                }
            }
        };
    }
    // When no mechanism for registering microtasks is exposed by the environment, microtasks will
    // be queued and then executed in a single macrotask before the other macrotasks are executed.
    var checkMicroTaskQueue;
    var microTasks;
    if (!has_1.default('microtasks')) {
        var isMicroTaskQueued = false;
        microTasks = [];
        checkMicroTaskQueue = function () {
            if (!isMicroTaskQueued) {
                isMicroTaskQueued = true;
                exports.queueTask(function () {
                    isMicroTaskQueued = false;
                    if (microTasks.length) {
                        var item;
                        while (item = microTasks.shift()) {
                            executeTask(item);
                        }
                    }
                });
            }
        };
    }
    /**
     * Schedules a callback to the macrotask queue.
     *
     * @param callback the function to be queued and later executed.
     * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
     */
    exports.queueTask = (function () {
        var destructor;
        var enqueue;
        // Since the IE implementation of `setImmediate` is not flawless, we will test for `postMessage` first.
        if (has_1.default('postmessage')) {
            var queue = [];
            global_1.default.addEventListener('message', function (event) {
                // Confirm that the event was triggered by the current window and by this particular implementation.
                if (event.source === global_1.default && event.data === 'dojo-queue-message') {
                    event.stopPropagation();
                    if (queue.length) {
                        executeTask(queue.shift());
                    }
                }
            });
            enqueue = function (item) {
                queue.push(item);
                global_1.default.postMessage('dojo-queue-message', '*');
            };
        }
        else if (has_1.default('setimmediate')) {
            destructor = global_1.default.clearImmediate;
            enqueue = function (item) {
                return setImmediate(executeTask.bind(null, item));
            };
        }
        else {
            destructor = global_1.default.clearTimeout;
            enqueue = function (item) {
                return setTimeout(executeTask.bind(null, item), 0);
            };
        }
        function queueTask(callback) {
            var item = {
                isActive: true,
                callback: callback
            };
            var id = enqueue(item);
            return getQueueHandle(item, destructor && function () {
                destructor(id);
            });
        }
        ;
        // TODO: Use aspect.before when it is available.
        return has_1.default('microtasks') ? queueTask : function (callback) {
            checkMicroTaskQueue();
            return queueTask(callback);
        };
    })();
    /**
     * Schedules an animation task with `window.requestAnimationFrame` if it exists, or with `queueTask` otherwise.
     *
     * Since requestAnimationFrame's behavior does not match that expected from `queueTask`, it is not used there.
     * However, at times it makes more sense to delegate to requestAnimationFrame; hence the following method.
     *
     * @param callback the function to be queued and later executed.
     * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
     */
    exports.queueAnimationTask = (function () {
        if (!has_1.default('raf')) {
            return exports.queueTask;
        }
        function queueAnimationTask(callback) {
            var item = {
                isActive: true,
                callback: callback
            };
            var rafId = requestAnimationFrame(executeTask.bind(null, item));
            return getQueueHandle(item, function () {
                cancelAnimationFrame(rafId);
            });
        }
        // TODO: Use aspect.before when it is available.
        return has_1.default('microtasks') ? queueAnimationTask : function (callback) {
            checkMicroTaskQueue();
            return queueAnimationTask(callback);
        };
    })();
    /**
     * Schedules a callback to the microtask queue.
     *
     * Any callbacks registered with `queueMicroTask` will be executed before the next macrotask. If no native
     * mechanism for scheduling macrotasks is exposed, then any callbacks will be fired before any macrotask
     * registered with `queueTask` or `queueAnimationTask`.
     *
     * @param callback the function to be queued and later executed.
     * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
     */
    exports.queueMicroTask = (function () {
        var enqueue;
        if (has_1.default('host-node')) {
            enqueue = function (item) {
                global_1.default.process.nextTick(executeTask.bind(null, item));
            };
        }
        else if (has_1.default('promise')) {
            enqueue = function (item) {
                global_1.default.Promise.resolve(item).then(executeTask);
            };
        }
        else if (has_1.default('dom-mutationobserver')) {
            var HostMutationObserver = global_1.default.MutationObserver || global_1.default.WebKitMutationObserver;
            var node = document.createElement('div');
            var queue = [];
            var observer = new HostMutationObserver(function () {
                while (queue.length > 0) {
                    var item = queue.shift();
                    if (item && item.isActive) {
                        item.callback();
                    }
                }
            });
            observer.observe(node, { attributes: true });
            enqueue = function (item) {
                queue.push(item);
                node.setAttribute('queueStatus', '1');
            };
        }
        else {
            enqueue = function (item) {
                checkMicroTaskQueue();
                microTasks.push(item);
            };
        }
        return function (callback) {
            var item = {
                isActive: true,
                callback: callback
            };
            enqueue(item);
            return getQueueHandle(item);
        };
    })();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOlsiZXhlY3V0ZVRhc2siLCJnZXRRdWV1ZUhhbmRsZSIsInF1ZXVlVGFzayIsInF1ZXVlQW5pbWF0aW9uVGFzayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFBQSx1QkFBbUIsVUFBVSxDQUFDLENBQUE7SUFDOUIsb0JBQWdCLE9BQU8sQ0FBQyxDQUFBO0lBR3hCLHFCQUFxQixJQUFlO1FBQ25DQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7UUFDakJBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRUQsd0JBQXdCLElBQWUsRUFBRSxVQUFvQztRQUM1RUMsTUFBTUEsQ0FBQ0E7WUFDTkEsT0FBT0EsRUFBRUE7Z0JBQ1IsSUFBSSxDQUFDLE9BQU8sR0FBRyxjQUFhLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUVyQixFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUNoQixVQUFVLEVBQUUsQ0FBQztnQkFDZCxDQUFDO1lBQ0YsQ0FBQztTQUNEQSxDQUFDQTtJQUNIQSxDQUFDQTtJQVlELDhGQUE4RjtJQUM5Riw4RkFBOEY7SUFDOUYsSUFBSSxtQkFBK0IsQ0FBQztJQUNwQyxJQUFJLFVBQXVCLENBQUM7SUFDNUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLElBQUksaUJBQWlCLEdBQVksS0FBSyxDQUFDO1FBRXZDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDaEIsbUJBQW1CLEdBQUc7WUFDckIsRUFBRSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FB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QUFDO2dCQUNqQixJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN2QyxDQUFDLENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDTCxPQUFPLEdBQUcsVUFBVSxJQUFlO2dCQUNsQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUN0QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNLENBQUMsVUFBVSxRQUFpQztZQUNqRCxJQUFNLElBQUksR0FBYztnQkFDdkIsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsUUFBUSxFQUFFLFFBQVE7YUFDbEIsQ0FBQztZQUVGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVkLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnbG9iYWwgZnJvbSAnLi9nbG9iYWwnO1xuaW1wb3J0IGhhcyBmcm9tICcuL2hhcyc7XG5pbXBvcnQgeyBIYW5kbGUgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5mdW5jdGlvbiBleGVjdXRlVGFzayhpdGVtOiBRdWV1ZUl0ZW0pOiB2b2lkIHtcblx0aWYgKGl0ZW0uaXNBY3RpdmUpIHtcblx0XHRpdGVtLmNhbGxiYWNrKCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0UXVldWVIYW5kbGUoaXRlbTogUXVldWVJdGVtLCBkZXN0cnVjdG9yPzogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpOiBIYW5kbGUge1xuXHRyZXR1cm4ge1xuXHRcdGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHt9O1xuXHRcdFx0aXRlbS5pc0FjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0aXRlbS5jYWxsYmFjayA9IG51bGw7XG5cblx0XHRcdGlmIChkZXN0cnVjdG9yKSB7XG5cdFx0XHRcdGRlc3RydWN0b3IoKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59XG5cbmludGVyZmFjZSBQb3N0TWVzc2FnZUV2ZW50IGV4dGVuZHMgRXZlbnQge1xuXHRzb3VyY2U6IGFueTtcblx0ZGF0YTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlSXRlbSB7XG5cdGlzQWN0aXZlOiBib29sZWFuO1xuXHRjYWxsYmFjazogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk7XG59XG5cbi8vIFdoZW4gbm8gbWVjaGFuaXNtIGZvciByZWdpc3RlcmluZyBtaWNyb3Rhc2tzIGlzIGV4cG9zZWQgYnkgdGhlIGVudmlyb25tZW50LCBtaWNyb3Rhc2tzIHdpbGxcbi8vIGJlIHF1ZXVlZCBhbmQgdGhlbiBleGVjdXRlZCBpbiBhIHNpbmdsZSBtYWNyb3Rhc2sgYmVmb3JlIHRoZSBvdGhlciBtYWNyb3Rhc2tzIGFyZSBleGVjdXRlZC5cbmxldCBjaGVja01pY3JvVGFza1F1ZXVlOiAoKSA9PiB2b2lkO1xubGV0IG1pY3JvVGFza3M6IFF1ZXVlSXRlbVtdO1xuaWYgKCFoYXMoJ21pY3JvdGFza3MnKSkge1xuXHRsZXQgaXNNaWNyb1Rhc2tRdWV1ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRtaWNyb1Rhc2tzID0gW107XG5cdGNoZWNrTWljcm9UYXNrUXVldWUgPSBmdW5jdGlvbiAoKTogdm9pZCB7XG5cdFx0aWYgKCFpc01pY3JvVGFza1F1ZXVlZCkge1xuXHRcdFx0aXNNaWNyb1Rhc2tRdWV1ZWQgPSB0cnVlO1xuXHRcdFx0cXVldWVUYXNrKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0aXNNaWNyb1Rhc2tRdWV1ZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRpZiAobWljcm9UYXNrcy5sZW5ndGgpIHtcblx0XHRcdFx0XHRsZXQgaXRlbTogUXVldWVJdGVtO1xuXHRcdFx0XHRcdHdoaWxlIChpdGVtID0gbWljcm9UYXNrcy5zaGlmdCgpKSB7XG5cdFx0XHRcdFx0XHRleGVjdXRlVGFzayhpdGVtKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZXMgYSBjYWxsYmFjayB0byB0aGUgbWFjcm90YXNrIHF1ZXVlLlxuICpcbiAqIEBwYXJhbSBjYWxsYmFjayB0aGUgZnVuY3Rpb24gdG8gYmUgcXVldWVkIGFuZCBsYXRlciBleGVjdXRlZC5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB3aXRoIGEgYGRlc3Ryb3lgIG1ldGhvZCB0aGF0LCB3aGVuIGNhbGxlZCwgcHJldmVudHMgdGhlIHJlZ2lzdGVyZWQgY2FsbGJhY2sgZnJvbSBleGVjdXRpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBxdWV1ZVRhc2sgPSAoZnVuY3Rpb24oKSB7XG5cdGxldCBkZXN0cnVjdG9yOiAoLi4uYXJnczogYW55W10pID0+IGFueTtcblx0bGV0IGVucXVldWU6IChpdGVtOiBRdWV1ZUl0ZW0pID0+IHZvaWQ7XG5cblx0Ly8gU2luY2UgdGhlIElFIGltcGxlbWVudGF0aW9uIG9mIGBzZXRJbW1lZGlhdGVgIGlzIG5vdCBmbGF3bGVzcywgd2Ugd2lsbCB0ZXN0IGZvciBgcG9zdE1lc3NhZ2VgIGZpcnN0LlxuXHRpZiAoaGFzKCdwb3N0bWVzc2FnZScpKSB7XG5cdFx0Y29uc3QgcXVldWU6IFF1ZXVlSXRlbVtdID0gW107XG5cblx0XHRnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldmVudDogUG9zdE1lc3NhZ2VFdmVudCk6IHZvaWQge1xuXHRcdFx0Ly8gQ29uZmlybSB0aGF0IHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IHRoZSBjdXJyZW50IHdpbmRvdyBhbmQgYnkgdGhpcyBwYXJ0aWN1bGFyIGltcGxlbWVudGF0aW9uLlxuXHRcdFx0aWYgKGV2ZW50LnNvdXJjZSA9PT0gZ2xvYmFsICYmIGV2ZW50LmRhdGEgPT09ICdkb2pvLXF1ZXVlLW1lc3NhZ2UnKSB7XG5cdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0XHRcdGlmIChxdWV1ZS5sZW5ndGgpIHtcblx0XHRcdFx0XHRleGVjdXRlVGFzayhxdWV1ZS5zaGlmdCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0ZW5xdWV1ZSA9IGZ1bmN0aW9uIChpdGVtOiBRdWV1ZUl0ZW0pOiB2b2lkIHtcblx0XHRcdHF1ZXVlLnB1c2goaXRlbSk7XG5cdFx0XHRnbG9iYWwucG9zdE1lc3NhZ2UoJ2Rvam8tcXVldWUtbWVzc2FnZScsICcqJyk7XG5cdFx0fTtcblx0fVxuXHRlbHNlIGlmIChoYXMoJ3NldGltbWVkaWF0ZScpKSB7XG5cdFx0ZGVzdHJ1Y3RvciA9IGdsb2JhbC5jbGVhckltbWVkaWF0ZTtcblx0XHRlbnF1ZXVlID0gZnVuY3Rpb24gKGl0ZW06IFF1ZXVlSXRlbSk6IGFueSB7XG5cdFx0XHRyZXR1cm4gc2V0SW1tZWRpYXRlKGV4ZWN1dGVUYXNrLmJpbmQobnVsbCwgaXRlbSkpO1xuXHRcdH07XG5cdH1cblx0ZWxzZSB7XG5cdFx0ZGVzdHJ1Y3RvciA9IGdsb2JhbC5jbGVhclRpbWVvdXQ7XG5cdFx0ZW5xdWV1ZSA9IGZ1bmN0aW9uIChpdGVtOiBRdWV1ZUl0ZW0pOiBhbnkge1xuXHRcdFx0cmV0dXJuIHNldFRpbWVvdXQoZXhlY3V0ZVRhc2suYmluZChudWxsLCBpdGVtKSwgMCk7XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIHF1ZXVlVGFzayhjYWxsYmFjazogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpOiBIYW5kbGUge1xuXHRcdGNvbnN0IGl0ZW06IFF1ZXVlSXRlbSA9IHtcblx0XHRcdGlzQWN0aXZlOiB0cnVlLFxuXHRcdFx0Y2FsbGJhY2s6IGNhbGxiYWNrXG5cdFx0fTtcblx0XHRjb25zdCBpZDogYW55ID0gZW5xdWV1ZShpdGVtKTtcblxuXHRcdHJldHVybiBnZXRRdWV1ZUhhbmRsZShpdGVtLCBkZXN0cnVjdG9yICYmIGZ1bmN0aW9uICgpIHtcblx0XHRcdGRlc3RydWN0b3IoaWQpO1xuXHRcdH0pO1xuXHR9O1xuXG5cdC8vIFRPRE86IFVzZSBhc3BlY3QuYmVmb3JlIHdoZW4gaXQgaXMgYXZhaWxhYmxlLlxuXHRyZXR1cm4gaGFzKCdtaWNyb3Rhc2tzJykgPyBxdWV1ZVRhc2sgOiBmdW5jdGlvbiAoY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55KTogSGFuZGxlIHtcblx0XHRjaGVja01pY3JvVGFza1F1ZXVlKCk7XG5cdFx0cmV0dXJuIHF1ZXVlVGFzayhjYWxsYmFjayk7XG5cdH07XG59KSgpO1xuXG4vKipcbiAqIFNjaGVkdWxlcyBhbiBhbmltYXRpb24gdGFzayB3aXRoIGB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lYCBpZiBpdCBleGlzdHMsIG9yIHdpdGggYHF1ZXVlVGFza2Agb3RoZXJ3aXNlLlxuICpcbiAqIFNpbmNlIHJlcXVlc3RBbmltYXRpb25GcmFtZSdzIGJlaGF2aW9yIGRvZXMgbm90IG1hdGNoIHRoYXQgZXhwZWN0ZWQgZnJvbSBgcXVldWVUYXNrYCwgaXQgaXMgbm90IHVzZWQgdGhlcmUuXG4gKiBIb3dldmVyLCBhdCB0aW1lcyBpdCBtYWtlcyBtb3JlIHNlbnNlIHRvIGRlbGVnYXRlIHRvIHJlcXVlc3RBbmltYXRpb25GcmFtZTsgaGVuY2UgdGhlIGZvbGxvd2luZyBtZXRob2QuXG4gKlxuICogQHBhcmFtIGNhbGxiYWNrIHRoZSBmdW5jdGlvbiB0byBiZSBxdWV1ZWQgYW5kIGxhdGVyIGV4ZWN1dGVkLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHdpdGggYSBgZGVzdHJveWAgbWV0aG9kIHRoYXQsIHdoZW4gY2FsbGVkLCBwcmV2ZW50cyB0aGUgcmVnaXN0ZXJlZCBjYWxsYmFjayBmcm9tIGV4ZWN1dGluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IHF1ZXVlQW5pbWF0aW9uVGFzayA9IChmdW5jdGlvbiAoKSB7XG5cdGlmICghaGFzKCdyYWYnKSkge1xuXHRcdHJldHVybiBxdWV1ZVRhc2s7XG5cdH1cblxuXHRmdW5jdGlvbiBxdWV1ZUFuaW1hdGlvblRhc2soY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55KTogSGFuZGxlIHtcblx0XHRjb25zdCBpdGVtOiBRdWV1ZUl0ZW0gPSB7XG5cdFx0XHRpc0FjdGl2ZTogdHJ1ZSxcblx0XHRcdGNhbGxiYWNrOiBjYWxsYmFja1xuXHRcdH07XG5cdFx0Y29uc3QgcmFmSWQ6IG51bWJlciA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShleGVjdXRlVGFzay5iaW5kKG51bGwsIGl0ZW0pKTtcblxuXHRcdHJldHVybiBnZXRRdWV1ZUhhbmRsZShpdGVtLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjYW5jZWxBbmltYXRpb25GcmFtZShyYWZJZCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBUT0RPOiBVc2UgYXNwZWN0LmJlZm9yZSB3aGVuIGl0IGlzIGF2YWlsYWJsZS5cblx0cmV0dXJuIGhhcygnbWljcm90YXNrcycpID8gcXVldWVBbmltYXRpb25UYXNrIDogZnVuY3Rpb24gKGNhbGxiYWNrOiAoLi4uYXJnczogYW55W10pID0+IGFueSk6IEhhbmRsZSB7XG5cdFx0Y2hlY2tNaWNyb1Rhc2tRdWV1ZSgpO1xuXHRcdHJldHVybiBxdWV1ZUFuaW1hdGlvblRhc2soY2FsbGJhY2spO1xuXHR9O1xufSkoKTtcblxuLyoqXG4gKiBTY2hlZHVsZXMgYSBjYWxsYmFjayB0byB0aGUgbWljcm90YXNrIHF1ZXVlLlxuICpcbiAqIEFueSBjYWxsYmFja3MgcmVnaXN0ZXJlZCB3aXRoIGBxdWV1ZU1pY3JvVGFza2Agd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgdGhlIG5leHQgbWFjcm90YXNrLiBJZiBubyBuYXRpdmVcbiAqIG1lY2hhbmlzbSBmb3Igc2NoZWR1bGluZyBtYWNyb3Rhc2tzIGlzIGV4cG9zZWQsIHRoZW4gYW55IGNhbGxiYWNrcyB3aWxsIGJlIGZpcmVkIGJlZm9yZSBhbnkgbWFjcm90YXNrXG4gKiByZWdpc3RlcmVkIHdpdGggYHF1ZXVlVGFza2Agb3IgYHF1ZXVlQW5pbWF0aW9uVGFza2AuXG4gKlxuICogQHBhcmFtIGNhbGxiYWNrIHRoZSBmdW5jdGlvbiB0byBiZSBxdWV1ZWQgYW5kIGxhdGVyIGV4ZWN1dGVkLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHdpdGggYSBgZGVzdHJveWAgbWV0aG9kIHRoYXQsIHdoZW4gY2FsbGVkLCBwcmV2ZW50cyB0aGUgcmVnaXN0ZXJlZCBjYWxsYmFjayBmcm9tIGV4ZWN1dGluZy5cbiAqL1xuZXhwb3J0IGxldCBxdWV1ZU1pY3JvVGFzayA9IChmdW5jdGlvbiAoKSB7XG5cdGxldCBlbnF1ZXVlOiAoaXRlbTogUXVldWVJdGVtKSA9PiB2b2lkO1xuXG5cdGlmIChoYXMoJ2hvc3Qtbm9kZScpKSB7XG5cdFx0ZW5xdWV1ZSA9IGZ1bmN0aW9uIChpdGVtOiBRdWV1ZUl0ZW0pOiB2b2lkIHtcblx0XHRcdGdsb2JhbC5wcm9jZXNzLm5leHRUaWNrKGV4ZWN1dGVUYXNrLmJpbmQobnVsbCwgaXRlbSkpO1xuXHRcdH07XG5cdH1cblx0ZWxzZSBpZiAoaGFzKCdwcm9taXNlJykpIHtcblx0XHRlbnF1ZXVlID0gZnVuY3Rpb24gKGl0ZW06IFF1ZXVlSXRlbSk6IHZvaWQge1xuXHRcdFx0Z2xvYmFsLlByb21pc2UucmVzb2x2ZShpdGVtKS50aGVuKGV4ZWN1dGVUYXNrKTtcblx0XHR9O1xuXHR9XG5cdGVsc2UgaWYgKGhhcygnZG9tLW11dGF0aW9ub2JzZXJ2ZXInKSkge1xuXHRcdGNvbnN0IEhvc3RNdXRhdGlvbk9ic2VydmVyID0gZ2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgZ2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG5cdFx0Y29uc3Qgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdGNvbnN0IHF1ZXVlOiBRdWV1ZUl0ZW1bXSA9IFtdO1xuXHRcdGNvbnN0IG9ic2VydmVyID0gbmV3IEhvc3RNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uICgpOiB2b2lkIHtcblx0XHRcdHdoaWxlIChxdWV1ZS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbnN0IGl0ZW0gPSBxdWV1ZS5zaGlmdCgpO1xuXHRcdFx0XHRpZiAoaXRlbSAmJiBpdGVtLmlzQWN0aXZlKSB7XG5cdFx0XHRcdFx0aXRlbS5jYWxsYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRvYnNlcnZlci5vYnNlcnZlKG5vZGUsIHsgYXR0cmlidXRlczogdHJ1ZSB9KTtcblxuXHRcdGVucXVldWUgPSBmdW5jdGlvbiAoaXRlbTogUXVldWVJdGVtKTogdm9pZCB7XG5cdFx0XHRxdWV1ZS5wdXNoKGl0ZW0pO1xuXHRcdFx0bm9kZS5zZXRBdHRyaWJ1dGUoJ3F1ZXVlU3RhdHVzJywgJzEnKTtcblx0XHR9O1xuXHR9XG5cdGVsc2Uge1xuXHRcdGVucXVldWUgPSBmdW5jdGlvbiAoaXRlbTogUXVldWVJdGVtKTogdm9pZCB7XG5cdFx0XHRjaGVja01pY3JvVGFza1F1ZXVlKCk7XG5cdFx0XHRtaWNyb1Rhc2tzLnB1c2goaXRlbSk7XG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiBmdW5jdGlvbiAoY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55KTogSGFuZGxlIHtcblx0XHRjb25zdCBpdGVtOiBRdWV1ZUl0ZW0gPSB7XG5cdFx0XHRpc0FjdGl2ZTogdHJ1ZSxcblx0XHRcdGNhbGxiYWNrOiBjYWxsYmFja1xuXHRcdH07XG5cblx0XHRlbnF1ZXVlKGl0ZW0pO1xuXG5cdFx0cmV0dXJuIGdldFF1ZXVlSGFuZGxlKGl0ZW0pO1xuXHR9O1xufSkoKTtcbiJdfQ==