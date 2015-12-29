(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise'], factory);
    }
})(function (require, exports) {
    var Promise_1 = require('../Promise');
    var resolved = Promise_1.default.resolve();
    /**
     * A seekable array source
     */
    var ArraySource = (function () {
        function ArraySource(data) {
            this.currentPosition = 0;
            this.data = [];
            if (data && data.length) {
                this.data = this.data.concat(data);
            }
        }
        ArraySource.prototype.seek = function (controller, position) {
            if (position >= this.data.length || position < 0) {
                var error = new Error('Invalid seek position: ' + position);
                controller.error(error);
                return Promise_1.default.reject(error);
            }
            this.currentPosition = position;
            return Promise_1.default.resolve(this.currentPosition);
        };
        ArraySource.prototype.start = function (controller) {
            return resolved;
        };
        ArraySource.prototype.pull = function (controller) {
            if (this.currentPosition >= this.data.length) {
                controller.close();
            }
            else {
                this.currentPosition += 1;
                controller.enqueue(this.data[this.currentPosition - 1]);
            }
            return resolved;
        };
        ArraySource.prototype.cancel = function (reason) {
            return resolved;
        };
        return ArraySource;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ArraySource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJyYXlTb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9BcnJheVNvdXJjZS50cyJdLCJuYW1lcyI6WyJBcnJheVNvdXJjZSIsIkFycmF5U291cmNlLmNvbnN0cnVjdG9yIiwiQXJyYXlTb3VyY2Uuc2VlayIsIkFycmF5U291cmNlLnN0YXJ0IiwiQXJyYXlTb3VyY2UucHVsbCIsIkFycmF5U291cmNlLmNhbmNlbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFBQSx3QkFBb0IsWUFBWSxDQUFDLENBQUE7SUFJakMsSUFBTSxRQUFRLEdBQUcsaUJBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUVuQzs7T0FFRztJQUNIO1FBT0NBLHFCQUFZQSxJQUFjQTtZQUN6QkMsSUFBSUEsQ0FBQ0EsZUFBZUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDekJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEVBQUVBLENBQUNBO1lBRWZBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO2dCQUN6QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDcENBLENBQUNBO1FBQ0ZBLENBQUNBO1FBRURELDBCQUFJQSxHQUFKQSxVQUFLQSxVQUF1Q0EsRUFBRUEsUUFBZ0JBO1lBQzdERSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxJQUFJQSxRQUFRQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbERBLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLEtBQUtBLENBQUNBLHlCQUF5QkEsR0FBR0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzVEQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFFeEJBLE1BQU1BLENBQUNBLGlCQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUM5QkEsQ0FBQ0E7WUFFREEsSUFBSUEsQ0FBQ0EsZUFBZUEsR0FBR0EsUUFBUUEsQ0FBQ0E7WUFFaENBLE1BQU1BLENBQUNBLGlCQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQTtRQUM5Q0EsQ0FBQ0E7UUFFREYsMkJBQUtBLEdBQUxBLFVBQU1BLFVBQXVDQTtZQUM1Q0csTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7UUFDakJBLENBQUNBO1FBRURILDBCQUFJQSxHQUFKQSxVQUFLQSxVQUF1Q0E7WUFDM0NJLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO2dCQUM5Q0EsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7WUFDcEJBLENBQUNBO1lBQ0RBLElBQUlBLENBQUNBLENBQUNBO2dCQUNMQSxJQUFJQSxDQUFDQSxlQUFlQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDMUJBLFVBQVVBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pEQSxDQUFDQTtZQUVEQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUNqQkEsQ0FBQ0E7UUFFREosNEJBQU1BLEdBQU5BLFVBQU9BLE1BQVlBO1lBQ2xCSyxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUNqQkEsQ0FBQ0E7UUFDRkwsa0JBQUNBO0lBQURBLENBQUNBLEFBaERELElBZ0RDO0lBaEREO2lDQWdEQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAnLi4vUHJvbWlzZSc7XG5pbXBvcnQgeyBTb3VyY2UgfSBmcm9tICcuL1JlYWRhYmxlU3RyZWFtJztcbmltcG9ydCBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIgZnJvbSAnLi9SZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXInO1xuXG5jb25zdCByZXNvbHZlZCA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG4vKipcbiAqIEEgc2Vla2FibGUgYXJyYXkgc291cmNlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFycmF5U291cmNlPFQ+IGltcGxlbWVudHMgU291cmNlPFQ+IHtcblx0Ly8gY3VycmVudCBzZWVrIHBvc2l0aW9uIGluIHRoZSBkYXRhIGFycmF5XG5cdGN1cnJlbnRQb3NpdGlvbjogbnVtYmVyO1xuXG5cdC8vIHNoYWxsb3cgY29weSBvZiBkYXRhIGFycmF5IHBhc3NlZCB0byBjb25zdHJ1Y3RvclxuXHRkYXRhOiBBcnJheTxUPjtcblxuXHRjb25zdHJ1Y3RvcihkYXRhOiBBcnJheTxUPikge1xuXHRcdHRoaXMuY3VycmVudFBvc2l0aW9uID0gMDtcblx0XHR0aGlzLmRhdGEgPSBbXTtcblxuXHRcdGlmIChkYXRhICYmIGRhdGEubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLmRhdGEgPSB0aGlzLmRhdGEuY29uY2F0KGRhdGEpO1xuXHRcdH1cblx0fVxuXG5cdHNlZWsoY29udHJvbGxlcjogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyPFQ+LCBwb3NpdGlvbjogbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+IHtcblx0XHRpZiAocG9zaXRpb24gPj0gdGhpcy5kYXRhLmxlbmd0aCB8fCBwb3NpdGlvbiA8IDApIHtcblx0XHRcdGxldCBlcnJvciA9IG5ldyBFcnJvcignSW52YWxpZCBzZWVrIHBvc2l0aW9uOiAnICsgcG9zaXRpb24pO1xuXHRcdFx0Y29udHJvbGxlci5lcnJvcihlcnJvcik7XG5cblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG5cdFx0fVxuXG5cdFx0dGhpcy5jdXJyZW50UG9zaXRpb24gPSBwb3NpdGlvbjtcblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5jdXJyZW50UG9zaXRpb24pO1xuXHR9XG5cblx0c3RhcnQoY29udHJvbGxlcjogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyPFQ+KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHJlc29sdmVkO1xuXHR9XG5cblx0cHVsbChjb250cm9sbGVyOiBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXI8VD4pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAodGhpcy5jdXJyZW50UG9zaXRpb24gPj0gdGhpcy5kYXRhLmxlbmd0aCkge1xuXHRcdFx0Y29udHJvbGxlci5jbG9zZSgpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuY3VycmVudFBvc2l0aW9uICs9IDE7XG5cdFx0XHRjb250cm9sbGVyLmVucXVldWUodGhpcy5kYXRhW3RoaXMuY3VycmVudFBvc2l0aW9uIC0gMV0pO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXNvbHZlZDtcblx0fVxuXG5cdGNhbmNlbChyZWFzb24/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gcmVzb2x2ZWQ7XG5cdH1cbn1cbiJdfQ==