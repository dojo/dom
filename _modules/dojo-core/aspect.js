(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './lang'], factory);
    }
})(function (require, exports) {
    var lang_1 = require('./lang');
    var nextId = 0;
    function advise(dispatcher, type, advice, receiveArguments) {
        var previous = dispatcher[type];
        var advised = {
            id: nextId++,
            advice: advice,
            receiveArguments: receiveArguments
        };
        if (previous) {
            if (type === 'after') {
                // add the listener to the end of the list
                // note that we had to change this loop a little bit to workaround a bizarre IE10 JIT bug
                while (previous.next && (previous = previous.next)) { }
                previous.next = advised;
                advised.previous = previous;
            }
            else {
                // add to the beginning
                dispatcher.before = advised;
                advised.next = previous;
                previous.previous = advised;
            }
        }
        else {
            dispatcher[type] = advised;
        }
        advice = previous = null;
        return lang_1.createHandle(function () {
            var previous = advised.previous;
            var next = advised.next;
            if (!previous && !next) {
                dispatcher[type] = null;
            }
            else {
                if (previous) {
                    previous.next = next;
                }
                else {
                    dispatcher[type] = next;
                }
                if (next) {
                    next.previous = previous;
                }
            }
            dispatcher = advised.advice = advised = null;
        });
    }
    function getDispatcher(target, methodName) {
        var existing = target[methodName];
        var dispatcher;
        if (!existing || existing.target !== target) {
            // no dispatcher
            target[methodName] = dispatcher = function () {
                var executionId = nextId;
                var args = arguments;
                var results;
                var before = dispatcher.before;
                while (before) {
                    if (before.advice) {
                        args = before.advice.apply(this, args) || args;
                    }
                    before = before.next;
                }
                if (dispatcher.around) {
                    results = dispatcher.around.advice(this, args);
                }
                var after = dispatcher.after;
                while (after && after.id < executionId) {
                    if (after.advice) {
                        if (after.receiveArguments) {
                            var newResults = after.advice.apply(this, args);
                            results = newResults === undefined ? results : newResults;
                        }
                        else {
                            results = after.advice.call(this, results, args);
                        }
                    }
                    after = after.next;
                }
                return results;
            };
            if (existing) {
                dispatcher.around = {
                    advice: function (target, args) {
                        return existing.apply(target, args);
                    }
                };
            }
            dispatcher.target = target;
        }
        else {
            dispatcher = existing;
        }
        target = null;
        return dispatcher;
    }
    /**
     * Attaches "after" advice to be executed after the original method.
     * The advising function will receive the original method's return value and arguments object.
     * The value it returns will be returned from the method when it is called (even if the return value is undefined).
     * @param target Object whose method will be aspected
     * @param methodName Name of method to aspect
     * @param advice Advising function which will receive the original method's return value and arguments object
     * @return A handle which will remove the aspect when destroy is called
     */
    function after(target, methodName, advice) {
        return advise(getDispatcher(target, methodName), 'after', advice);
    }
    exports.after = after;
    /**
     * Attaches "around" advice around the original method.
     * @param target Object whose method will be aspected
     * @param methodName Name of method to aspect
     * @param advice Advising function which will receive the original function
     * @return A handle which will remove the aspect when destroy is called
     */
    function around(target, methodName, advice) {
        var dispatcher = getDispatcher(target, methodName);
        var previous = dispatcher.around;
        var advised = advice(function () {
            return previous.advice(this, arguments);
        });
        dispatcher.around = {
            advice: function (target, args) {
                return advised ?
                    advised.apply(target, args) :
                    previous.advice(target, args);
            }
        };
        advice = null;
        return lang_1.createHandle(function () {
            advised = dispatcher = null;
        });
    }
    exports.around = around;
    /**
     * Attaches "before" advice to be executed before the original method.
     * @param target Object whose method will be aspected
     * @param methodName Name of method to aspect
     * @param advice Advising function which will receive the same arguments as the original, and may return new arguments
     * @return A handle which will remove the aspect when destroy is called
     */
    function before(target, methodName, advice) {
        return advise(getDispatcher(target, methodName), 'before', advice);
    }
    exports.before = before;
    /**
     * Attaches advice to be executed after the original method.
     * The advising function will receive the same arguments as the original method.
     * The value it returns will be returned from the method when it is called *unless* its return value is undefined.
     * @param target Object whose method will be aspected
     * @param methodName Name of method to aspect
     * @param advice Advising function which will receive the same arguments as the original method
     * @return A handle which will remove the aspect when destroy is called
     */
    function on(target, methodName, advice) {
        return advise(getDispatcher(target, methodName), 'after', advice, true);
    }
    exports.on = on;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNwZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FzcGVjdC50cyJdLCJuYW1lcyI6WyJhZHZpc2UiLCJnZXREaXNwYXRjaGVyIiwiYWZ0ZXIiLCJhcm91bmQiLCJiZWZvcmUiLCJvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFDQSxxQkFBNkIsUUFBUSxDQUFDLENBQUE7SUFrQnRDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztJQUVmLGdCQUFnQixVQUFzQixFQUFFLElBQVksRUFBRSxNQUFnQixFQUFFLGdCQUEwQjtRQUNqR0EsSUFBSUEsUUFBUUEsR0FBVUEsVUFBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDeENBLElBQUlBLE9BQU9BLEdBQVlBO1lBQ3RCQSxFQUFFQSxFQUFFQSxNQUFNQSxFQUFFQTtZQUNaQSxNQUFNQSxFQUFFQSxNQUFNQTtZQUNkQSxnQkFBZ0JBLEVBQUVBLGdCQUFnQkE7U0FDbENBLENBQUNBO1FBRUZBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ2RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsMENBQTBDQTtnQkFDMUNBLHlGQUF5RkE7Z0JBQ3pGQSxPQUFPQSxRQUFRQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFBQSxDQUFDQTtnQkFDdERBLFFBQVFBLENBQUNBLElBQUlBLEdBQUdBLE9BQU9BLENBQUNBO2dCQUN4QkEsT0FBT0EsQ0FBQ0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0E7WUFDN0JBLENBQUNBO1lBQ0RBLElBQUlBLENBQUNBLENBQUNBO2dCQUNMQSx1QkFBdUJBO2dCQUN2QkEsVUFBVUEsQ0FBQ0EsTUFBTUEsR0FBR0EsT0FBT0EsQ0FBQ0E7Z0JBQzVCQSxPQUFPQSxDQUFDQSxJ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Ozs7Ozs7O09BUUc7SUFDSCxZQUFtQixNQUFXLEVBQUUsVUFBa0IsRUFBRSxNQUF1QztRQUMxRkMsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsTUFBTUEsRUFBRUEsVUFBVUEsQ0FBQ0EsRUFBRUEsT0FBT0EsRUFBRUEsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDekVBLENBQUNBO0lBRmUsVUFBRSxLQUVqQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSGFuZGxlIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGNyZWF0ZUhhbmRsZSB9IGZyb20gJy4vbGFuZyc7XG5cbmludGVyZmFjZSBBZHZpc2VkIHtcblx0aWQ/OiBudW1iZXI7XG5cdGFkdmljZTogRnVuY3Rpb247XG5cdHByZXZpb3VzPzogQWR2aXNlZDtcblx0bmV4dD86IEFkdmlzZWQ7XG5cdHJlY2VpdmVBcmd1bWVudHM/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgRGlzcGF0Y2hlciB7XG5cdCgpOiBhbnk7XG5cdHRhcmdldDogYW55O1xuXHRiZWZvcmU/OiBBZHZpc2VkO1xuXHRhcm91bmQ/OiBBZHZpc2VkO1xuXHRhZnRlcj86IEFkdmlzZWQ7XG59XG5cbmxldCBuZXh0SWQgPSAwO1xuXG5mdW5jdGlvbiBhZHZpc2UoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlciwgdHlwZTogc3RyaW5nLCBhZHZpY2U6IEZ1bmN0aW9uLCByZWNlaXZlQXJndW1lbnRzPzogYm9vbGVhbik6IEhhbmRsZSB7XG5cdGxldCBwcmV2aW91cyA9ICg8YW55PiBkaXNwYXRjaGVyKVt0eXBlXTtcblx0bGV0IGFkdmlzZWQ6IEFkdmlzZWQgPSB7XG5cdFx0aWQ6IG5leHRJZCsrLFxuXHRcdGFkdmljZTogYWR2aWNlLFxuXHRcdHJlY2VpdmVBcmd1bWVudHM6IHJlY2VpdmVBcmd1bWVudHNcblx0fTtcblxuXHRpZiAocHJldmlvdXMpIHtcblx0XHRpZiAodHlwZSA9PT0gJ2FmdGVyJykge1xuXHRcdFx0Ly8gYWRkIHRoZSBsaXN0ZW5lciB0byB0aGUgZW5kIG9mIHRoZSBsaXN0XG5cdFx0XHQvLyBub3RlIHRoYXQgd2UgaGFkIHRvIGNoYW5nZSB0aGlzIGxvb3AgYSBsaXR0bGUgYml0IHRvIHdvcmthcm91bmQgYSBiaXphcnJlIElFMTAgSklUIGJ1Z1xuXHRcdFx0d2hpbGUgKHByZXZpb3VzLm5leHQgJiYgKHByZXZpb3VzID0gcHJldmlvdXMubmV4dCkpIHt9XG5cdFx0XHRwcmV2aW91cy5uZXh0ID0gYWR2aXNlZDtcblx0XHRcdGFkdmlzZWQucHJldmlvdXMgPSBwcmV2aW91cztcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBhZGQgdG8gdGhlIGJlZ2lubmluZ1xuXHRcdFx0ZGlzcGF0Y2hlci5iZWZvcmUgPSBhZHZpc2VkO1xuXHRcdFx0YWR2aXNlZC5uZXh0ID0gcHJldmlvdXM7XG5cdFx0XHRwcmV2aW91cy5wcmV2aW91cyA9IGFkdmlzZWQ7XG5cdFx0fVxuXHR9XG5cdGVsc2Uge1xuXHRcdCg8YW55PiBkaXNwYXRjaGVyKVt0eXBlXSA9IGFkdmlzZWQ7XG5cdH1cblxuXHRhZHZpY2UgPSBwcmV2aW91cyA9IG51bGw7XG5cblx0cmV0dXJuIGNyZWF0ZUhhbmRsZShmdW5jdGlvbiAoKSB7XG5cdFx0bGV0IHByZXZpb3VzID0gYWR2aXNlZC5wcmV2aW91cztcblx0XHRsZXQgbmV4dCA9IGFkdmlzZWQubmV4dDtcblxuXHRcdGlmICghcHJldmlvdXMgJiYgIW5leHQpIHtcblx0XHRcdCg8YW55PiBkaXNwYXRjaGVyKVt0eXBlXSA9IG51bGw7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKHByZXZpb3VzKSB7XG5cdFx0XHRcdHByZXZpb3VzLm5leHQgPSBuZXh0O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdCg8YW55PiBkaXNwYXRjaGVyKVt0eXBlXSA9IG5leHQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChuZXh0KSB7XG5cdFx0XHRcdG5leHQucHJldmlvdXMgPSBwcmV2aW91cztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRkaXNwYXRjaGVyID0gYWR2aXNlZC5hZHZpY2UgPSBhZHZpc2VkID0gbnVsbDtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdldERpc3BhdGNoZXIodGFyZ2V0OiBhbnksIG1ldGhvZE5hbWU6IHN0cmluZyk6IERpc3BhdGNoZXIge1xuXHRjb25zdCBleGlzdGluZyA9IHRhcmdldFttZXRob2ROYW1lXTtcblx0bGV0IGRpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG5cblx0aWYgKCFleGlzdGluZyB8fCBleGlzdGluZy50YXJnZXQgIT09IHRhcmdldCkge1xuXHRcdC8vIG5vIGRpc3BhdGNoZXJcblx0XHR0YXJnZXRbbWV0aG9kTmFtZV0gPSBkaXNwYXRjaGVyID0gPERpc3BhdGNoZXI+IGZ1bmN0aW9uICgpOiBhbnkge1xuXHRcdFx0bGV0IGV4ZWN1dGlvbklkID0gbmV4dElkO1xuXHRcdFx0bGV0IGFyZ3MgPSBhcmd1bWVudHM7XG5cdFx0XHRsZXQgcmVzdWx0czogYW55O1xuXHRcdFx0bGV0IGJlZm9yZSA9IGRpc3BhdGNoZXIuYmVmb3JlO1xuXG5cdFx0XHR3aGlsZSAoYmVmb3JlKSB7XG5cdFx0XHRcdGlmIChiZWZvcmUuYWR2aWNlKSB7XG5cdFx0XHRcdFx0YXJncyA9IGJlZm9yZS5hZHZpY2UuYXBwbHkodGhpcywgYXJncykgfHwgYXJncztcblx0XHRcdFx0fVxuXHRcdFx0XHRiZWZvcmUgPSBiZWZvcmUubmV4dDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGRpc3BhdGNoZXIuYXJvdW5kKSB7XG5cdFx0XHRcdHJlc3VsdHMgPSBkaXNwYXRjaGVyLmFyb3VuZC5hZHZpY2UodGhpcywgYXJncyk7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBhZnRlciA9IGRpc3BhdGNoZXIuYWZ0ZXI7XG5cdFx0XHR3aGlsZSAoYWZ0ZXIgJiYgYWZ0ZXIuaWQgPCBleGVjdXRpb25JZCkge1xuXHRcdFx0XHRpZiAoYWZ0ZXIuYWR2aWNlKSB7XG5cdFx0XHRcdFx0aWYgKGFmdGVyLnJlY2VpdmVBcmd1bWVudHMpIHtcblx0XHRcdFx0XHRcdGxldCBuZXdSZXN1bHRzID0gYWZ0ZXIuYWR2aWNlLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHRcdFx0XHRcdFx0cmVzdWx0cyA9IG5ld1Jlc3VsdHMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdHMgOiBuZXdSZXN1bHRzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdHJlc3VsdHMgPSBhZnRlci5hZHZpY2UuY2FsbCh0aGlzLCByZXN1bHRzLCBhcmdzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0YWZ0ZXIgPSBhZnRlci5uZXh0O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0cztcblx0XHR9O1xuXG5cdFx0aWYgKGV4aXN0aW5nKSB7XG5cdFx0XHRkaXNwYXRjaGVyLmFyb3VuZCA9IHtcblx0XHRcdFx0YWR2aWNlOiBmdW5jdGlvbiAodGFyZ2V0OiBhbnksIGFyZ3M6IGFueVtdKTogYW55IHtcblx0XHRcdFx0XHRyZXR1cm4gZXhpc3RpbmcuYXBwbHkodGFyZ2V0LCBhcmdzKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRkaXNwYXRjaGVyLnRhcmdldCA9IHRhcmdldDtcblx0fVxuXHRlbHNlIHtcblx0XHRkaXNwYXRjaGVyID0gZXhpc3Rpbmc7XG5cdH1cblxuXHR0YXJnZXQgPSBudWxsO1xuXG5cdHJldHVybiBkaXNwYXRjaGVyO1xufVxuXG4vKipcbiAqIEF0dGFjaGVzIFwiYWZ0ZXJcIiBhZHZpY2UgdG8gYmUgZXhlY3V0ZWQgYWZ0ZXIgdGhlIG9yaWdpbmFsIG1ldGhvZC5cbiAqIFRoZSBhZHZpc2luZyBmdW5jdGlvbiB3aWxsIHJlY2VpdmUgdGhlIG9yaWdpbmFsIG1ldGhvZCdzIHJldHVybiB2YWx1ZSBhbmQgYXJndW1lbnRzIG9iamVjdC5cbiAqIFRoZSB2YWx1ZSBpdCByZXR1cm5zIHdpbGwgYmUgcmV0dXJuZWQgZnJvbSB0aGUgbWV0aG9kIHdoZW4gaXQgaXMgY2FsbGVkIChldmVuIGlmIHRoZSByZXR1cm4gdmFsdWUgaXMgdW5kZWZpbmVkKS5cbiAqIEBwYXJhbSB0YXJnZXQgT2JqZWN0IHdob3NlIG1ldGhvZCB3aWxsIGJlIGFzcGVjdGVkXG4gKiBAcGFyYW0gbWV0aG9kTmFtZSBOYW1lIG9mIG1ldGhvZCB0byBhc3BlY3RcbiAqIEBwYXJhbSBhZHZpY2UgQWR2aXNpbmcgZnVuY3Rpb24gd2hpY2ggd2lsbCByZWNlaXZlIHRoZSBvcmlnaW5hbCBtZXRob2QncyByZXR1cm4gdmFsdWUgYW5kIGFyZ3VtZW50cyBvYmplY3RcbiAqIEByZXR1cm4gQSBoYW5kbGUgd2hpY2ggd2lsbCByZW1vdmUgdGhlIGFzcGVjdCB3aGVuIGRlc3Ryb3kgaXMgY2FsbGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZnRlcih0YXJnZXQ6IGFueSwgbWV0aG9kTmFtZTogc3RyaW5nLCBhZHZpY2U6IChvcmlnaW5hbFJldHVybjogYW55LCBvcmlnaW5hbEFyZ3M6IElBcmd1bWVudHMpID0+IGFueSk6IEhhbmRsZSB7XG5cdHJldHVybiBhZHZpc2UoZ2V0RGlzcGF0Y2hlcih0YXJnZXQsIG1ldGhvZE5hbWUpLCAnYWZ0ZXInLCBhZHZpY2UpO1xufVxuXG4vKipcbiAqIEF0dGFjaGVzIFwiYXJvdW5kXCIgYWR2aWNlIGFyb3VuZCB0aGUgb3JpZ2luYWwgbWV0aG9kLlxuICogQHBhcmFtIHRhcmdldCBPYmplY3Qgd2hvc2UgbWV0aG9kIHdpbGwgYmUgYXNwZWN0ZWRcbiAqIEBwYXJhbSBtZXRob2ROYW1lIE5hbWUgb2YgbWV0aG9kIHRvIGFzcGVjdFxuICogQHBhcmFtIGFkdmljZSBBZHZpc2luZyBmdW5jdGlvbiB3aGljaCB3aWxsIHJlY2VpdmUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uXG4gKiBAcmV0dXJuIEEgaGFuZGxlIHdoaWNoIHdpbGwgcmVtb3ZlIHRoZSBhc3BlY3Qgd2hlbiBkZXN0cm95IGlzIGNhbGxlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXJvdW5kKHRhcmdldDogYW55LCBtZXRob2ROYW1lOiBzdHJpbmcsIGFkdmljZTogKHByZXZpb3VzOiBGdW5jdGlvbikgPT4gRnVuY3Rpb24pOiBIYW5kbGUge1xuXHRsZXQgZGlzcGF0Y2hlciA9IGdldERpc3BhdGNoZXIodGFyZ2V0LCBtZXRob2ROYW1lKTtcblx0bGV0IHByZXZpb3VzID0gZGlzcGF0Y2hlci5hcm91bmQ7XG5cdGxldCBhZHZpc2VkID0gYWR2aWNlKGZ1bmN0aW9uICgpOiBhbnkge1xuXHRcdHJldHVybiBwcmV2aW91cy5hZHZpY2UodGhpcywgYXJndW1lbnRzKTtcblx0fSk7XG5cblx0ZGlzcGF0Y2hlci5hcm91bmQgPSB7XG5cdFx0YWR2aWNlOiBmdW5jdGlvbiAodGFyZ2V0OiBhbnksIGFyZ3M6IGFueVtdKTogYW55IHtcblx0XHRcdHJldHVybiBhZHZpc2VkID9cblx0XHRcdFx0YWR2aXNlZC5hcHBseSh0YXJnZXQsIGFyZ3MpIDpcblx0XHRcdFx0cHJldmlvdXMuYWR2aWNlKHRhcmdldCwgYXJncyk7XG5cdFx0fVxuXHR9O1xuXG5cdGFkdmljZSA9IG51bGw7XG5cblx0cmV0dXJuIGNyZWF0ZUhhbmRsZShmdW5jdGlvbiAoKSB7XG5cdFx0YWR2aXNlZCA9IGRpc3BhdGNoZXIgPSBudWxsO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBBdHRhY2hlcyBcImJlZm9yZVwiIGFkdmljZSB0byBiZSBleGVjdXRlZCBiZWZvcmUgdGhlIG9yaWdpbmFsIG1ldGhvZC5cbiAqIEBwYXJhbSB0YXJnZXQgT2JqZWN0IHdob3NlIG1ldGhvZCB3aWxsIGJlIGFzcGVjdGVkXG4gKiBAcGFyYW0gbWV0aG9kTmFtZSBOYW1lIG9mIG1ldGhvZCB0byBhc3BlY3RcbiAqIEBwYXJhbSBhZHZpY2UgQWR2aXNpbmcgZnVuY3Rpb24gd2hpY2ggd2lsbCByZWNlaXZlIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyB0aGUgb3JpZ2luYWwsIGFuZCBtYXkgcmV0dXJuIG5ldyBhcmd1bWVudHNcbiAqIEByZXR1cm4gQSBoYW5kbGUgd2hpY2ggd2lsbCByZW1vdmUgdGhlIGFzcGVjdCB3aGVuIGRlc3Ryb3kgaXMgY2FsbGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmUodGFyZ2V0OiBhbnksIG1ldGhvZE5hbWU6IHN0cmluZywgYWR2aWNlOiAoLi4ub3JpZ2luYWxBcmdzOiBhbnlbXSkgPT4gYW55W10gfCB2b2lkKTogSGFuZGxlIHtcblx0cmV0dXJuIGFkdmlzZShnZXREaXNwYXRjaGVyKHRhcmdldCwgbWV0aG9kTmFtZSksICdiZWZvcmUnLCBhZHZpY2UpO1xufVxuXG4vKipcbiAqIEF0dGFjaGVzIGFkdmljZSB0byBiZSBleGVjdXRlZCBhZnRlciB0aGUgb3JpZ2luYWwgbWV0aG9kLlxuICogVGhlIGFkdmlzaW5nIGZ1bmN0aW9uIHdpbGwgcmVjZWl2ZSB0aGUgc2FtZSBhcmd1bWVudHMgYXMgdGhlIG9yaWdpbmFsIG1ldGhvZC5cbiAqIFRoZSB2YWx1ZSBpdCByZXR1cm5zIHdpbGwgYmUgcmV0dXJuZWQgZnJvbSB0aGUgbWV0aG9kIHdoZW4gaXQgaXMgY2FsbGVkICp1bmxlc3MqIGl0cyByZXR1cm4gdmFsdWUgaXMgdW5kZWZpbmVkLlxuICogQHBhcmFtIHRhcmdldCBPYmplY3Qgd2hvc2UgbWV0aG9kIHdpbGwgYmUgYXNwZWN0ZWRcbiAqIEBwYXJhbSBtZXRob2ROYW1lIE5hbWUgb2YgbWV0aG9kIHRvIGFzcGVjdFxuICogQHBhcmFtIGFkdmljZSBBZHZpc2luZyBmdW5jdGlvbiB3aGljaCB3aWxsIHJlY2VpdmUgdGhlIHNhbWUgYXJndW1lbnRzIGFzIHRoZSBvcmlnaW5hbCBtZXRob2RcbiAqIEByZXR1cm4gQSBoYW5kbGUgd2hpY2ggd2lsbCByZW1vdmUgdGhlIGFzcGVjdCB3aGVuIGRlc3Ryb3kgaXMgY2FsbGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvbih0YXJnZXQ6IGFueSwgbWV0aG9kTmFtZTogc3RyaW5nLCBhZHZpY2U6ICguLi5vcmlnaW5hbEFyZ3M6IGFueVtdKSA9PiBhbnkpOiBIYW5kbGUge1xuXHRyZXR1cm4gYWR2aXNlKGdldERpc3BhdGNoZXIodGFyZ2V0LCBtZXRob2ROYW1lKSwgJ2FmdGVyJywgYWR2aWNlLCB0cnVlKTtcbn1cbiJdfQ==