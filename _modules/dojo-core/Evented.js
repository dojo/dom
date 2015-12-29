(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './aspect'], factory);
    }
})(function (require, exports) {
    var aspect_1 = require('./aspect');
    var Evented = (function () {
        function Evented() {
        }
        /**
         * Emits an event, firing listeners registered for it.
         * @param event The event object to emit
         */
        Evented.prototype.emit = function (data) {
            var type = '__on' + data.type;
            var method = this[type];
            if (method) {
                return method.call(this, data);
            }
        };
        /**
         * Listens for an event, calling the listener whenever the event fires.
         * @param type Event type to listen for
         * @param listener Callback to handle the event when it fires
         * @return A handle which will remove the listener when destroy is called
         */
        Evented.prototype.on = function (type, listener) {
            var name = '__on' + type;
            if (!this[name]) {
                Object.defineProperty(this, name, {
                    configurable: true,
                    value: undefined,
                    writable: true
                });
            }
            return aspect_1.on(this, '__on' + type, listener);
        };
        return Evented;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Evented;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9FdmVudGVkLnRzIl0sIm5hbWVzIjpbIkV2ZW50ZWQiLCJFdmVudGVkLmNvbnN0cnVjdG9yIiwiRXZlbnRlZC5lbWl0IiwiRXZlbnRlZC5vbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFDQSx1QkFBbUIsVUFBVSxDQUFDLENBQUE7SUFFOUI7UUFBQUE7UUE4QkFDLENBQUNBO1FBN0JBRDs7O1dBR0dBO1FBQ0hBLHNCQUFJQSxHQUFKQSxVQUE0QkEsSUFBT0E7WUFDbENFLElBQU1BLElBQUlBLEdBQUdBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1lBQ2hDQSxJQUFNQSxNQUFNQSxHQUFvQkEsSUFBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDNUNBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO2dCQUNaQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNoQ0EsQ0FBQ0E7UUFDRkEsQ0FBQ0E7UUFFREY7Ozs7O1dBS0dBO1FBQ0hBLG9CQUFFQSxHQUFGQSxVQUFHQSxJQUFZQSxFQUFFQSxRQUFzQ0E7WUFDdERHLElBQU1BLElBQUlBLEdBQUdBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBO1lBQzNCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFRQSxJQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDekJBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBO29CQUNqQ0EsWUFBWUEsRUFBRUEsSUFBSUE7b0JBQ2xCQSxLQUFLQSxFQUFFQSxTQUFTQTtvQkFDaEJBLFFBQVFBLEVBQUVBLElBQUlBO2lCQUNkQSxDQUFDQSxDQUFDQTtZQUNKQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxXQUFFQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxHQUFHQSxJQUFJQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUMxQ0EsQ0FBQ0E7UUFDRkgsY0FBQ0E7SUFBREEsQ0FBQ0EsQUE5QkQsSUE4QkM7SUE5QkQ7NkJBOEJDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIYW5kbGUsIEV2ZW50T2JqZWN0IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IG9uIH0gZnJvbSAnLi9hc3BlY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudGVkIHtcblx0LyoqXG5cdCAqIEVtaXRzIGFuIGV2ZW50LCBmaXJpbmcgbGlzdGVuZXJzIHJlZ2lzdGVyZWQgZm9yIGl0LlxuXHQgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IG9iamVjdCB0byBlbWl0XG5cdCAqL1xuXHRlbWl0PFQgZXh0ZW5kcyBFdmVudE9iamVjdD4oZGF0YTogVCk6IHZvaWQge1xuXHRcdGNvbnN0IHR5cGUgPSAnX19vbicgKyBkYXRhLnR5cGU7XG5cdFx0Y29uc3QgbWV0aG9kOiBGdW5jdGlvbiA9ICg8YW55PiB0aGlzKVt0eXBlXTtcblx0XHRpZiAobWV0aG9kKSB7XG5cdFx0XHRyZXR1cm4gbWV0aG9kLmNhbGwodGhpcywgZGF0YSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIExpc3RlbnMgZm9yIGFuIGV2ZW50LCBjYWxsaW5nIHRoZSBsaXN0ZW5lciB3aGVuZXZlciB0aGUgZXZlbnQgZmlyZXMuXG5cdCAqIEBwYXJhbSB0eXBlIEV2ZW50IHR5cGUgdG8gbGlzdGVuIGZvclxuXHQgKiBAcGFyYW0gbGlzdGVuZXIgQ2FsbGJhY2sgdG8gaGFuZGxlIHRoZSBldmVudCB3aGVuIGl0IGZpcmVzXG5cdCAqIEByZXR1cm4gQSBoYW5kbGUgd2hpY2ggd2lsbCByZW1vdmUgdGhlIGxpc3RlbmVyIHdoZW4gZGVzdHJveSBpcyBjYWxsZWRcblx0ICovXG5cdG9uKHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IChldmVudDogRXZlbnRPYmplY3QpID0+IHZvaWQpOiBIYW5kbGUge1xuXHRcdGNvbnN0IG5hbWUgPSAnX19vbicgKyB0eXBlO1xuXHRcdGlmICghKDxhbnk+IHRoaXMpW25hbWVdKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwge1xuXHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRcdHdyaXRhYmxlOiB0cnVlXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIG9uKHRoaXMsICdfX29uJyArIHR5cGUsIGxpc3RlbmVyKTtcblx0fVxufVxuIl19