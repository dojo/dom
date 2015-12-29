(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../../on', '../../Promise'], factory);
    }
})(function (require, exports) {
    var on_1 = require('../../on');
    var Promise_1 = require('../../Promise');
    var EventedStreamSource = (function () {
        function EventedStreamSource(target, type) {
            this._target = target;
            if (Array.isArray(type)) {
                this._events = type;
            }
            else {
                this._events = [type];
            }
            this._handles = [];
        }
        EventedStreamSource.prototype.start = function (controller) {
            var _this = this;
            this._controller = controller;
            this._events.forEach(function (eventName) {
                _this._handles.push(on_1.default(_this._target, eventName, _this._handleEvent.bind(_this)));
            });
            return Promise_1.default.resolve();
        };
        EventedStreamSource.prototype.cancel = function (reason) {
            while (this._handles.length) {
                this._handles.shift().destroy();
            }
            return Promise_1.default.resolve();
        };
        EventedStreamSource.prototype._handleEvent = function (event) {
            this._controller.enqueue(event);
        };
        return EventedStreamSource;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = EventedStreamSource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRlZFN0cmVhbVNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJlYW1zL2FkYXB0ZXJzL0V2ZW50ZWRTdHJlYW1Tb3VyY2UudHMiXSwibmFtZXMiOlsiRXZlbnRlZFN0cmVhbVNvdXJjZSIsIkV2ZW50ZWRTdHJlYW1Tb3VyY2UuY29uc3RydWN0b3IiLCJFdmVudGVkU3RyZWFtU291cmNlLnN0YXJ0IiwiRXZlbnRlZFN0cmVhbVNvdXJjZS5jYW5jZWwiLCJFdmVudGVkU3RyZWFtU291cmNlLl9oYW5kbGVFdmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFFQSxtQkFBaUMsVUFBVSxDQUFDLENBQUE7SUFDNUMsd0JBQW9CLGVBQWUsQ0FBQyxDQUFBO0lBT3BDO1FBTUNBLDZCQUFZQSxNQUF3QkEsRUFBRUEsSUFBZ0JBO1lBQ3JEQyxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxNQUFNQSxDQUFDQTtZQUV0QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3pCQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFTQSxJQUFJQSxDQUFDQTtZQUMzQkEsQ0FBQ0E7WUFDREEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ0xBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLENBQVFBLElBQUlBLENBQUVBLENBQUNBO1lBQy9CQSxDQUFDQTtZQUVEQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFFREQsbUNBQUtBLEdBQUxBLFVBQU1BLFVBQTJDQTtZQUFqREUsaUJBT0NBO1lBTkFBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLFVBQVVBLENBQUNBO1lBQzlCQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxTQUFpQkE7Z0JBQ3RDQSxLQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFFQSxDQUFPQSxLQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxTQUFTQSxFQUFFQSxLQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyRkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFFSEEsTUFBTUEsQ0FBQ0EsaUJBQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQzFCQSxDQUFDQTtRQUVERixvQ0FBTUEsR0FBTkEsVUFBT0EsTUFBWUE7WUFDbEJHLE9BQU9BLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO2dCQUM3QkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7WUFDakNBLENBQUNBO1lBRURBLE1BQU1BLENBQUNBLGlCQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUMxQkEsQ0FBQ0E7UUFFU0gsMENBQVlBLEdBQXRCQSxVQUF1QkEsS0FBWUE7WUFDbENJLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2pDQSxDQUFDQTtRQUNGSiwwQkFBQ0E7SUFBREEsQ0FBQ0EsQUF2Q0QsSUF1Q0M7SUF2Q0Q7eUNBdUNDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXZlbnRlZCBmcm9tICcuLi8uLi9FdmVudGVkJztcbmltcG9ydCB7IEhhbmRsZSB9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IG9uLCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJy4uLy4uL29uJztcbmltcG9ydCBQcm9taXNlIGZyb20gJy4uLy4uL1Byb21pc2UnO1xuaW1wb3J0IHsgU291cmNlIH0gZnJvbSAnLi4vUmVhZGFibGVTdHJlYW0nO1xuaW1wb3J0IFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlciBmcm9tICcuLi9SZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXInO1xuXG5leHBvcnQgdHlwZSBFdmVudFRhcmdldFR5cGVzID0gRXZlbnRlZCB8IEV2ZW50RW1pdHRlciB8IEV2ZW50VGFyZ2V0O1xuZXhwb3J0IHR5cGUgRXZlbnRUeXBlcyA9IHN0cmluZyB8IHN0cmluZ1tdO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudGVkU3RyZWFtU291cmNlIGltcGxlbWVudHMgU291cmNlPEV2ZW50PiB7XG5cdHByb3RlY3RlZCBfY29udHJvbGxlcjogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyPEV2ZW50Pjtcblx0cHJvdGVjdGVkIF90YXJnZXQ6IEV2ZW50VGFyZ2V0VHlwZXM7XG5cdHByb3RlY3RlZCBfZXZlbnRzOiBzdHJpbmdbXTtcblx0cHJvdGVjdGVkIF9oYW5kbGVzOiBIYW5kbGVbXTtcblxuXHRjb25zdHJ1Y3Rvcih0YXJnZXQ6IEV2ZW50VGFyZ2V0VHlwZXMsIHR5cGU6IEV2ZW50VHlwZXMpIHtcblx0XHR0aGlzLl90YXJnZXQgPSB0YXJnZXQ7XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheSh0eXBlKSkge1xuXHRcdFx0dGhpcy5fZXZlbnRzID0gPGFueT4gdHlwZTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLl9ldmVudHMgPSBbIDxhbnk+IHR5cGUgXTtcblx0XHR9XG5cblx0XHR0aGlzLl9oYW5kbGVzID0gW107XG5cdH1cblxuXHRzdGFydChjb250cm9sbGVyOiBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXI8RXZlbnQ+KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy5fY29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG5cdFx0dGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50TmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0XHR0aGlzLl9oYW5kbGVzLnB1c2gob24oPGFueT4gdGhpcy5fdGFyZ2V0LCBldmVudE5hbWUsIHRoaXMuX2hhbmRsZUV2ZW50LmJpbmQodGhpcykpKTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXG5cdGNhbmNlbChyZWFzb24/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR3aGlsZSAodGhpcy5faGFuZGxlcy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuX2hhbmRsZXMuc2hpZnQoKS5kZXN0cm95KCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9oYW5kbGVFdmVudChldmVudDogRXZlbnQpIHtcblx0XHR0aGlzLl9jb250cm9sbGVyLmVucXVldWUoZXZlbnQpO1xuXHR9XG59XG4iXX0=