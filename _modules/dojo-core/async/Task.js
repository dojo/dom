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
        define(["require", "exports", '../Promise'], factory);
    }
})(function (require, exports) {
    var Promise_1 = require('../Promise');
    exports.Canceled = 4;
    /**
     * Task is an extension of Promise that supports cancelation.
     */
    var Task = (function (_super) {
        __extends(Task, _super);
        function Task(executor, canceler) {
            var _this = this;
            _super.call(this, function (resolve, reject) {
                // Don't let the Task resolve if it's been canceled
                executor(function (value) {
                    if (_this._state === exports.Canceled) {
                        return;
                    }
                    resolve(value);
                }, function (reason) {
                    if (_this._state === exports.Canceled) {
                        return;
                    }
                    reject(reason);
                });
            });
            this.children = [];
            this.canceler = function () {
                if (canceler) {
                    canceler();
                }
                _this._cancel();
            };
        }
        Task.all = function (items) {
            return _super.all.call(this, items);
        };
        Task.race = function (items) {
            return _super.race.call(this, items);
        };
        Task.reject = function (reason) {
            return _super.reject.call(this, reason);
        };
        Task.resolve = function (value) {
            return _super.resolve.call(this, value);
        };
        Task.copy = function (other) {
            var task = _super.copy.call(this, other);
            task.children = [];
            task.canceler = other instanceof Task ? other.canceler : function () { };
            return task;
        };
        /**
         * Propagates cancelation down through a Task tree. The Task's state is immediately set to canceled. If a Thenable
         * finally task was passed in, it is resolved before calling this Task's finally callback; otherwise, this Task's
         * finally callback is immediately executed. `_cancel` is called for each child Task, passing in the value returned
         * by this Task's finally callback or a Promise chain that will eventually resolve to that value.
         */
        Task.prototype._cancel = function (finallyTask) {
            var _this = this;
            this._state = exports.Canceled;
            var runFinally = function () {
                try {
                    return _this._finally();
                }
                catch (error) {
                }
            };
            if (this._finally) {
                if (Promise_1.isThenable(finallyTask)) {
                    finallyTask = finallyTask.then(runFinally, runFinally);
                }
                else {
                    finallyTask = runFinally();
                }
            }
            this.children.forEach(function (child) {
                child._cancel(finallyTask);
            });
        };
        /**
         * Immediately cancels this task if it has not already resolved. This Task and any descendants are synchronously set
         * to the Canceled state and any `finally` added downstream from the canceled Task are invoked.
         */
        Task.prototype.cancel = function () {
            if (this._state === Promise_1.State.Pending) {
                this.canceler();
            }
        };
        Task.prototype.finally = function (callback) {
            var task = _super.prototype.finally.call(this, callback);
            // Keep a reference to the callback; it will be called if the Task is canceled
            task._finally = callback;
            return task;
        };
        Task.prototype.then = function (onFulfilled, onRejected) {
            var _this = this;
            var task = _super.prototype.then.call(this, 
            // Don't call the onFulfilled or onRejected handlers if this Task is canceled
            function (value) {
                if (task._state === exports.Canceled) {
                    return;
                }
                if (onFulfilled) {
                    return onFulfilled(value);
                }
                return value;
            }, function (error) {
                if (task._state === exports.Canceled) {
                    return;
                }
                if (onRejected) {
                    return onRejected(error);
                }
                throw error;
            });
            task.canceler = function () {
                // If task's parent (this) hasn't been resolved, cancel it; downward propagation will start at the first
                // unresolved parent
                if (_this._state === Promise_1.State.Pending) {
                    _this.cancel();
                }
                else {
                    task._cancel();
                }
            };
            // Keep track of child Tasks for propogating cancelation back down the chain
            this.children.push(task);
            return task;
        };
        Task.prototype.catch = function (onRejected) {
            return _super.prototype.catch.call(this, onRejected);
        };
        return Task;
    })(Promise_1.default);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Task;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hc3luYy9UYXNrLnRzIl0sIm5hbWVzIjpbIlRhc2siLCJUYXNrLmNvbnN0cnVjdG9yIiwiVGFzay5hbGwiLCJUYXNrLnJhY2UiLCJUYXNrLnJlamVjdCIsIlRhc2sucmVzb2x2ZSIsIlRhc2suY29weSIsIlRhc2suX2NhbmNlbCIsIlRhc2suY2FuY2VsIiwiVGFzay5maW5hbGx5IiwiVGFzay50aGVuIiwiVGFzay5jYXRjaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBLHdCQUErRCxZQUFZLENBQUMsQ0FBQTtJQUUvRCxnQkFBUSxHQUFXLENBQUMsQ0FBQztJQUVsQzs7T0FFRztJQUNIO1FBQXFDQSx3QkFBVUE7UUEwQjlDQSxjQUFZQSxRQUFxQkEsRUFBRUEsUUFBcUJBO1lBMUJ6REMsaUJBbUtDQTtZQXhJQ0Esa0JBQU1BLFVBQUNBLE9BQU9BLEVBQUVBLE1BQU1BO2dCQUNyQkEsbURBQW1EQTtnQkFDbkRBLFFBQVFBLENBQ1BBLFVBQUNBLEtBQUtBO29CQUNMQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFJQSxDQUFDQSxNQUFNQSxLQUFLQSxnQkFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQzlCQSxNQUFNQSxDQUFDQTtvQkFDUkEsQ0FBQ0E7b0JBQ0RBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNoQkEsQ0FBQ0EsRUFDREEsVUFBQ0EsTUFBTUE7b0JBQ05BLEVBQUVBLENBQUNBLENBQUNBLEtBQUlBLENBQUNBLE1BQU1BLEtBQUtBLGdCQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDOUJBLE1BQU1BLENBQUNBO29CQUNSQSxDQUFDQTtvQkFDREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ2hCQSxDQUFDQSxDQUNEQSxDQUFDQTtZQUNIQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUVIQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxF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QSxDQUFDQSxLQUFJQSxDQUFDQSxNQUFNQSxLQUFLQSxlQUFLQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDbkNBLEtBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO2dCQUNmQSxDQUFDQTtnQkFFREEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ0xBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO2dCQUNoQkEsQ0FBQ0E7WUFDRkEsQ0FBQ0EsQ0FBQ0E7WUFFRkEsNEVBQTRFQTtZQUM1RUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFFekJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2JBLENBQUNBO1FBRURWLG9CQUFLQSxHQUFMQSxVQUFTQSxVQUFpREE7WUFDekRXLE1BQU1BLENBQU9BLGdCQUFLQSxDQUFDQSxLQUFLQSxZQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUN0Q0EsQ0FBQ0E7UUFFRlgsV0FBQ0E7SUFBREEsQ0FBQ0EsQUFuS0QsRUFBcUMsaUJBQU8sRUFtSzNDO0lBbktEOzBCQW1LQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UsIHsgRXhlY3V0b3IsIFN0YXRlLCBUaGVuYWJsZSwgaXNUaGVuYWJsZSB9IGZyb20gJy4uL1Byb21pc2UnO1xuXG5leHBvcnQgY29uc3QgQ2FuY2VsZWQgPSA8U3RhdGU+IDQ7XG5cbi8qKlxuICogVGFzayBpcyBhbiBleHRlbnNpb24gb2YgUHJvbWlzZSB0aGF0IHN1cHBvcnRzIGNhbmNlbGF0aW9uLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYXNrPFQ+IGV4dGVuZHMgUHJvbWlzZTxUPiB7XG5cdHN0YXRpYyBhbGw8VD4oaXRlbXM6IChUIHwgVGhlbmFibGU8VD4pW10pOiBUYXNrPFRbXT4ge1xuXHRcdHJldHVybiA8YW55PiBzdXBlci5hbGwoaXRlbXMpO1xuXHR9XG5cblx0c3RhdGljIHJhY2U8VD4oaXRlbXM6IChUIHwgVGhlbmFibGU8VD4pW10pOiBUYXNrPFQ+IHtcblx0XHRyZXR1cm4gPGFueT4gc3VwZXIucmFjZShpdGVtcyk7XG5cdH1cblxuXHRzdGF0aWMgcmVqZWN0PFQ+KHJlYXNvbjogRXJyb3IpOiBUYXNrPGFueT4ge1xuXHRcdHJldHVybiA8YW55PiBzdXBlci5yZWplY3QocmVhc29uKTtcblx0fVxuXG5cdHN0YXRpYyByZXNvbHZlKCk6IFRhc2s8dm9pZD47XG5cdHN0YXRpYyByZXNvbHZlPFQ+KHZhbHVlOiAoVCB8IFRoZW5hYmxlPFQ+KSk6IFRhc2s8VD47XG5cdHN0YXRpYyByZXNvbHZlPFQ+KHZhbHVlPzogYW55KTogVGFzazxUPiB7XG5cdFx0cmV0dXJuIDxhbnk+IHN1cGVyLnJlc29sdmUodmFsdWUpO1xuXHR9XG5cblx0cHJvdGVjdGVkIHN0YXRpYyBjb3B5PFU+KG90aGVyOiBQcm9taXNlPFU+KTogVGFzazxVPiB7XG5cdFx0Y29uc3QgdGFzayA9IDxUYXNrPFU+PiBzdXBlci5jb3B5KG90aGVyKTtcblx0XHR0YXNrLmNoaWxkcmVuID0gW107XG5cdFx0dGFzay5jYW5jZWxlciA9IG90aGVyIGluc3RhbmNlb2YgVGFzayA/IG90aGVyLmNhbmNlbGVyIDogZnVuY3Rpb24gKCkge307XG5cdFx0cmV0dXJuIHRhc2s7XG5cdH1cblxuXHRjb25zdHJ1Y3RvcihleGVjdXRvcjogRXhlY3V0b3I8VD4sIGNhbmNlbGVyPzogKCkgPT4gdm9pZCkge1xuXHRcdHN1cGVyKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdC8vIERvbid0IGxldCB0aGUgVGFzayByZXNvbHZlIGlmIGl0J3MgYmVlbiBjYW5jZWxlZFxuXHRcdFx0ZXhlY3V0b3IoXG5cdFx0XHRcdCh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdGlmICh0aGlzLl9zdGF0ZSA9PT0gQ2FuY2VsZWQpIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmVzb2x2ZSh2YWx1ZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdChyZWFzb24pID0+IHtcblx0XHRcdFx0XHRpZiAodGhpcy5fc3RhdGUgPT09IENhbmNlbGVkKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJlamVjdChyZWFzb24pO1xuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5jaGlsZHJlbiA9IFtdO1xuXHRcdHRoaXMuY2FuY2VsZXIgPSAoKSA9PiB7XG5cdFx0XHRpZiAoY2FuY2VsZXIpIHtcblx0XHRcdFx0Y2FuY2VsZXIoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX2NhbmNlbCgpO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQSBjYW5jZWxhdGlvbiBoYW5kbGVyIHRoYXQgd2lsbCBiZSBjYWxsZWQgaWYgdGhpcyB0YXNrIGlzIGNhbmNlbGVkLlxuXHQgKi9cblx0cHJpdmF0ZSBjYW5jZWxlcjogKCkgPT4gdm9pZDtcblxuXHQvKipcblx0ICogQ2hpbGRyZW4gb2YgdGhpcyBUYXNrIChpLmUuLCBUYXNrcyB0aGF0IHdlcmUgY3JlYXRlZCBmcm9tIHRoaXMgVGFzayB3aXRoIGB0aGVuYCBvciBgY2F0Y2hgKS5cblx0ICovXG5cdHByaXZhdGUgY2hpbGRyZW46IFRhc2s8YW55PltdO1xuXG5cdC8qKlxuXHQgKiBUaGUgZmluYWxseSBjYWxsYmFjayBmb3IgdGhpcyBUYXNrIChpZiBpdCB3YXMgY3JlYXRlZCBieSBhIGNhbGwgdG8gYGZpbmFsbHlgKS5cblx0ICovXG5cdHByaXZhdGUgX2ZpbmFsbHk6ICgpID0+IHZvaWQgfCBUaGVuYWJsZTxhbnk+O1xuXG5cdC8qKlxuXHQgKiBQcm9wYWdhdGVzIGNhbmNlbGF0aW9uIGRvd24gdGhyb3VnaCBhIFRhc2sgdHJlZS4gVGhlIFRhc2sncyBzdGF0ZSBpcyBpbW1lZGlhdGVseSBzZXQgdG8gY2FuY2VsZWQuIElmIGEgVGhlbmFibGVcblx0ICogZmluYWxseSB0YXNrIHdhcyBwYXNzZWQgaW4sIGl0IGlzIHJlc29sdmVkIGJlZm9yZSBjYWxsaW5nIHRoaXMgVGFzaydzIGZpbmFsbHkgY2FsbGJhY2s7IG90aGVyd2lzZSwgdGhpcyBUYXNrJ3Ncblx0ICogZmluYWxseSBjYWxsYmFjayBpcyBpbW1lZGlhdGVseSBleGVjdXRlZC4gYF9jYW5jZWxgIGlzIGNhbGxlZCBmb3IgZWFjaCBjaGlsZCBUYXNrLCBwYXNzaW5nIGluIHRoZSB2YWx1ZSByZXR1cm5lZFxuXHQgKiBieSB0aGlzIFRhc2sncyBmaW5hbGx5IGNhbGxiYWNrIG9yIGEgUHJvbWlzZSBjaGFpbiB0aGF0IHdpbGwgZXZlbnR1YWxseSByZXNvbHZlIHRvIHRoYXQgdmFsdWUuXG5cdCAqL1xuXHRwcml2YXRlIF9jYW5jZWwoZmluYWxseVRhc2s/OiB2b2lkIHwgVGhlbmFibGU8YW55Pik6IHZvaWQge1xuXHRcdHRoaXMuX3N0YXRlID0gQ2FuY2VsZWQ7XG5cblx0XHRjb25zdCBydW5GaW5hbGx5ID0gKCkgPT4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2ZpbmFsbHkoKTtcblx0XHRcdH1cblx0XHRcdGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHQvLyBBbnkgZXJyb3JzIGluIGEgYGZpbmFsbHlgIGNhbGxiYWNrIGFyZSBjb21wbGV0ZWx5IGlnbm9yZWQgZHVyaW5nIGNhbmNlbGF0aW9uXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmICh0aGlzLl9maW5hbGx5KSB7XG5cdFx0XHRpZiAoaXNUaGVuYWJsZShmaW5hbGx5VGFzaykpIHtcblx0XHRcdFx0ZmluYWxseVRhc2sgPSAoPFRoZW5hYmxlPGFueT4+IGZpbmFsbHlUYXNrKS50aGVuKHJ1bkZpbmFsbHksIHJ1bkZpbmFsbHkpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGZpbmFsbHlUYXNrID0gcnVuRmluYWxseSgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcblx0XHRcdGNoaWxkLl9jYW5jZWwoZmluYWxseVRhc2spO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEltbWVkaWF0ZWx5IGNhbmNlbHMgdGhpcyB0YXNrIGlmIGl0IGhhcyBub3QgYWxyZWFkeSByZXNvbHZlZC4gVGhpcyBUYXNrIGFuZCBhbnkgZGVzY2VuZGFudHMgYXJlIHN5bmNocm9ub3VzbHkgc2V0XG5cdCAqIHRvIHRoZSBDYW5jZWxlZCBzdGF0ZSBhbmQgYW55IGBmaW5hbGx5YCBhZGRlZCBkb3duc3RyZWFtIGZyb20gdGhlIGNhbmNlbGVkIFRhc2sgYXJlIGludm9rZWQuXG5cdCAqL1xuXHRjYW5jZWwoKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuX3N0YXRlID09PSBTdGF0ZS5QZW5kaW5nKSB7XG5cdFx0XHR0aGlzLmNhbmNlbGVyKCk7XG5cdFx0fVxuXHR9XG5cblx0ZmluYWxseShjYWxsYmFjazogKCkgPT4gdm9pZCB8IFRoZW5hYmxlPGFueT4pOiBUYXNrPFQ+IHtcblx0XHRjb25zdCB0YXNrID0gPFRhc2s8VD4+IHN1cGVyLmZpbmFsbHkoY2FsbGJhY2spO1xuXHRcdC8vIEtlZXAgYSByZWZlcmVuY2UgdG8gdGhlIGNhbGxiYWNrOyBpdCB3aWxsIGJlIGNhbGxlZCBpZiB0aGUgVGFzayBpcyBjYW5jZWxlZFxuXHRcdHRhc2suX2ZpbmFsbHkgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGFzaztcblx0fVxuXG5cdHRoZW48VT4ob25GdWxmaWxsZWQ/OiAodmFsdWU6IFQpID0+IFUgfCBUaGVuYWJsZTxVPiwgIG9uUmVqZWN0ZWQ/OiAoZXJyb3I6IEVycm9yKSA9PiBVIHwgVGhlbmFibGU8VT4pOiBUYXNrPFU+IHtcblx0XHRjb25zdCB0YXNrID0gPFRhc2s8VT4+IHN1cGVyLnRoZW48VT4oXG5cdFx0XHQvLyBEb24ndCBjYWxsIHRoZSBvbkZ1bGZpbGxlZCBvciBvblJlamVjdGVkIGhhbmRsZXJzIGlmIHRoaXMgVGFzayBpcyBjYW5jZWxlZFxuXHRcdFx0ZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdGlmICh0YXNrLl9zdGF0ZSA9PT0gQ2FuY2VsZWQpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9uRnVsZmlsbGVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9uRnVsZmlsbGVkKHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gPGFueT4gdmFsdWU7XG5cdFx0XHR9LFxuXHRcdFx0ZnVuY3Rpb24gKGVycm9yKSB7XG5cdFx0XHRcdGlmICh0YXNrLl9zdGF0ZSA9PT0gQ2FuY2VsZWQpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9uUmVqZWN0ZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gb25SZWplY3RlZChlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XHR9XG5cdFx0KTtcblxuXHRcdHRhc2suY2FuY2VsZXIgPSAoKSA9PiB7XG5cdFx0XHQvLyBJZiB0YXNrJ3MgcGFyZW50ICh0aGlzKSBoYXNuJ3QgYmVlbiByZXNvbHZlZCwgY2FuY2VsIGl0OyBkb3dud2FyZCBwcm9wYWdhdGlvbiB3aWxsIHN0YXJ0IGF0IHRoZSBmaXJzdFxuXHRcdFx0Ly8gdW5yZXNvbHZlZCBwYXJlbnRcblx0XHRcdGlmICh0aGlzLl9zdGF0ZSA9PT0gU3RhdGUuUGVuZGluZykge1xuXHRcdFx0XHR0aGlzLmNhbmNlbCgpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgdGFzaydzIHBhcmVudCBoYXMgYmVlbiByZXNvbHZlZCwgcHJvcGFnYXRlIGNhbmNlbGF0aW9uIHRvIHRoZSB0YXNrJ3MgZGVzY2VuZGFudHNcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0YXNrLl9jYW5jZWwoKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly8gS2VlcCB0cmFjayBvZiBjaGlsZCBUYXNrcyBmb3IgcHJvcG9nYXRpbmcgY2FuY2VsYXRpb24gYmFjayBkb3duIHRoZSBjaGFpblxuXHRcdHRoaXMuY2hpbGRyZW4ucHVzaCh0YXNrKTtcblxuXHRcdHJldHVybiB0YXNrO1xuXHR9XG5cblx0Y2F0Y2g8VT4ob25SZWplY3RlZDogKHJlYXNvbj86IEVycm9yKSA9PiAoVSB8IFRoZW5hYmxlPFU+KSk6IFRhc2s8VT4ge1xuXHRcdHJldHVybiA8YW55PiBzdXBlci5jYXRjaChvblJlamVjdGVkKTtcblx0fVxuXG59XG4iXX0=