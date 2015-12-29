(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './queue', './global', './has'], factory);
    }
})(function (require, exports) {
    var queue_1 = require('./queue');
    var global_1 = require('./global');
    var has_1 = require('./has');
    /**
     * Copies an array of values, replacing any PlatformPromises in the copy with unwrapped global.Promises. This is necessary
     * for .all and .race so that the native promise doesn't treat the PlatformPromises like generic thenables.
     */
    function unwrapPromises(items) {
        var unwrapped = [];
        var count = items.length;
        for (var i = 0; i < count; i++) {
            if (!(i in items)) {
                continue;
            }
            var item = items[i];
            unwrapped[i] = item instanceof Promise ? item.promise : item;
        }
        return unwrapped;
    }
    /**
     * Returns true if a given value has a `then` method.
     * @param {any} value The value to check if is Thenable
     * @returns {is Thenable<T>} A type guard if the value is thenable
     */
    function isThenable(value) {
        return value && typeof value.then === 'function';
    }
    exports.isThenable = isThenable;
    /**
     * PromiseShim is a partial implementation of the ES2015 Promise specification. It relies on Promise to do some safety
     * checks such as verifying that a Promise isn't resolved with itself. This class is exported for testability, and is
     * not intended to be used directly.
     *
     * @borrows Promise.all as PromiseShim.all
     * @borrows Promise.race as PromiseShim.race
     * @borrows Promise.reject as PromiseShim.reject
     * @borrows Promise.resolve as PromiseShim.resolve
     * @borrows Promise#catch as PromiseShim#catch
     * @borrows Promise#then as PromiseShim#then
     */
    var PromiseShim = (function () {
        /**
         * Creates a new PromiseShim.
         *
         * @constructor
         *
         * @param executor
         * The executor function is called immediately when the PromiseShim is instantiated. It is responsible for
         * starting the asynchronous operation when it is invoked.
         *
         * The executor must call either the passed `resolve` function when the asynchronous operation has completed
         * successfully, or the `reject` function when the operation fails.
         */
        function PromiseShim(executor) {
            var _this = this;
            /**
             * The current state of this promise.
             */
            this.state = State.Pending;
            /**
             * If true, the resolution of this promise is chained ("locked in") to another promise.
             */
            var isChained = false;
            /**
             * Whether or not this promise is in a resolved state.
             */
            var isResolved = function () {
                return _this.state !== State.Pending || isChained;
            };
            /**
             * Callbacks that should be invoked once the asynchronous operation has completed.
             */
            var callbacks = [];
            /**
             * Initially pushes callbacks onto a queue for execution once this promise settles. After the promise settles,
             * enqueues callbacks for execution on the next event loop turn.
             */
            var whenFinished = function (callback) {
                callbacks.push(callback);
            };
            /**
             * Settles this promise.
             *
             * @param newState The resolved state for this promise.
             * @param {T|Error} value The resolved value for this promise.
             */
            var settle = function (newState, value) {
                // A promise can only be settled once.
                if (_this.state !== State.Pending) {
                    return;
                }
                _this.state = newState;
                _this.resolvedValue = value;
                whenFinished = queue_1.queueMicroTask;
                // Only enqueue a callback runner if there are callbacks so that initially fulfilled Promises don't have to
                // wait an extra turn.
                if (callbacks.length > 0) {
                    queue_1.queueMicroTask(function () {
                        var count = callbacks.length;
                        for (var i = 0; i < count; ++i) {
                            callbacks[i].call(null);
                        }
                        callbacks = null;
                    });
                }
            };
            /**
             * Resolves this promise.
             *
             * @param newState The resolved state for this promise.
             * @param {T|Error} value The resolved value for this promise.
             */
            var resolve = function (newState, value) {
                if (isResolved()) {
                    return;
                }
                if (isThenable(value)) {
                    value.then(settle.bind(null, State.Fulfilled), settle.bind(null, State.Rejected));
                    isChained = true;
                }
                else {
                    settle(newState, value);
                }
            };
            this.then = function (onFulfilled, onRejected) {
                return new PromiseShim(function (resolve, reject) {
                    // whenFinished initially queues up callbacks for execution after the promise has settled. Once the
                    // promise has settled, whenFinished will schedule callbacks for execution on the next turn through the
                    // event loop.
                    whenFinished(function () {
                        var callback = _this.state === State.Rejected ? onRejected : onFulfilled;
                        if (typeof callback === 'function') {
                            try {
                                resolve(callback(_this.resolvedValue));
                            }
                            catch (error) {
                                reject(error);
                            }
                        }
                        else if (_this.state === State.Rejected) {
                            reject(_this.resolvedValue);
                        }
                        else {
                            resolve(_this.resolvedValue);
                        }
                    });
                });
            };
            try {
                executor(resolve.bind(null, State.Fulfilled), resolve.bind(null, State.Rejected));
            }
            catch (error) {
                settle(State.Rejected, error);
            }
        }
        PromiseShim.all = function (items) {
            return new this(function (resolve, reject) {
                var values = [];
                var complete = 0;
                var total = 0;
                var populating = true;
                function fulfill(index, value) {
                    values[index] = value;
                    ++complete;
                    finish();
                }
                function finish() {
                    if (populating || complete < total) {
                        return;
                    }
                    resolve(values);
                }
                function processItem(index, item) {
                    ++total;
                    if (item instanceof PromiseShim) {
                        // If an item PromiseShim rejects, this PromiseShim is immediately rejected with the item
                        // PromiseShim's rejection error.
                        item.then(fulfill.bind(null, index), reject);
                    }
                    else {
                        PromiseShim.resolve(item).then(fulfill.bind(null, index));
                    }
                }
                var count = items.length;
                for (var i = 0; i < count; ++i) {
                    processItem(i, items[i]);
                }
                populating = false;
                finish();
            });
        };
        PromiseShim.race = function (items) {
            return new this(function (resolve, reject) {
                var count = items.length;
                var item;
                for (var i = 0; i < count; ++i) {
                    item = items[i];
                    if (item instanceof PromiseShim) {
                        // If a PromiseShim item rejects, this PromiseShim is immediately rejected with the item
                        // PromiseShim's rejection error.
                        item.then(resolve, reject);
                    }
                    else {
                        PromiseShim.resolve(item).then(resolve);
                    }
                }
            });
        };
        PromiseShim.reject = function (reason) {
            return new this(function (resolve, reject) {
                reject(reason);
            });
        };
        PromiseShim.resolve = function (value) {
            return new this(function (resolve) {
                resolve(value);
            });
        };
        return PromiseShim;
    })();
    exports.PromiseShim = PromiseShim;
    /**
     * PlatformPromise is a very thin wrapper around either a native promise implementation or PromiseShim.
     */
    var Promise = (function () {
        /**
         * Creates a new Promise.
         *
         * @constructor
         *
         * @param executor
         * The executor function is called immediately when the PromiseShim is instantiated. It is responsible for
         * starting the asynchronous operation when it is invoked.
         *
         * The executor must call either the passed `resolve` function when the asynchronous operation has completed
         * successfully, or the `reject` function when the operation fails.
         */
        function Promise(executor) {
            var _this = this;
            // Wrap the executor to verify that the the resolution value isn't this promise. Since any incoming promise
            // should be wrapped, the native resolver can't automatically detect self-resolution.
            this.promise = new Promise.PromiseConstructor((function (resolve, reject) {
                executor(function (value) {
                    if (value === _this) {
                        reject(new TypeError('Cannot chain a promise to itself'));
                    }
                    else {
                        resolve(value);
                    }
                }, function (reason) {
                    reject(reason);
                });
            }));
            this._state = State.Pending;
            this.promise.then(function () { _this._state = State.Fulfilled; }, function () { _this._state = State.Rejected; });
        }
        /**
         * Converts an iterable object containing promises into a single promise that resolves to a new iterable object
         * containing the fulfilled values of all the promises in the iterable, in the same order as the Promises in the
         * iterable. Iterable values that are not promises are converted to promises using PromiseShim.resolve.
         *
         * @example
         * PromiseShim.all([ PromiseShim.resolve('foo'), 'bar' ]).then(function (value) {
         *     value[0] === 'foo'; // true
         *     value[1] === 'bar'; // true
         * });
         *
         * @example
         * PromiseShim.all({
         *     foo: PromiseShim.resolve('foo'),
         *     bar: 'bar'
         * }).then((value) => {
         *     value.foo === 'foo'; // true
         *     value.bar === 'bar'; // true
         * });
         */
        Promise.all = function (items) {
            return this.copy(Promise.PromiseConstructor.all(unwrapPromises(items)));
        };
        /**
         * Converts an iterable object containing promises into a single promise that resolves or rejects as soon as one of
         * the promises in the iterable resolves or rejects, with the value of the resolved or rejected promise. Values in
         * the iterable that are not Promises are converted to Promises with PromiseShim.resolve.
         *
         * @example
         * PromiseShim.race([ PromiseShim.resolve('foo'), PromiseShim.resolve('bar') ]).then((value) => {
         *     value === 'foo'; // true
         * });
         *
         * @example
         * PromiseShim.race({
         *     foo: PromiseShim.resolve('foo'),
         *     bar: PromiseShim.resolve('bar')
         * }).then((value) => {
         *     value === 'foo'; // true
         * });
         */
        Promise.race = function (items) {
            return this.copy(Promise.PromiseConstructor.race(unwrapPromises(items)));
        };
        /**
         * Creates a new promise that is rejected with the given error.
         */
        Promise.reject = function (reason) {
            return this.copy(Promise.PromiseConstructor.reject(reason));
        };
        Promise.resolve = function (value) {
            if (value instanceof Promise) {
                return value;
            }
            return this.copy(Promise.PromiseConstructor.resolve(value));
        };
        /**
         * Copies another Promise, taking on its inner state.
         */
        Promise.copy = function (other) {
            var promise = Object.create(this.prototype, {
                promise: { value: other instanceof Promise.PromiseConstructor ? other : other.promise }
            });
            promise._state = State.Pending;
            promise.promise.then(function () { promise._state = State.Fulfilled; }, function () { promise._state = State.Rejected; });
            return promise;
        };
        /**
         * Adds a callback to the promise to be invoked when the asynchronous operation throws an error.
         */
        Promise.prototype.catch = function (onRejected) {
            return this.then(null, onRejected);
        };
        /**
         * Allows for cleanup actions to be performed after resolution of a Promise.
         */
        Promise.prototype.finally = function (callback) {
            // Handler to be used for fulfillment and rejection; whether it was fulfilled or rejected is explicitly
            // indicated by the first argument
            function handler(rejected, valueOrError) {
                // If callback throws, the handler will throw
                var result = callback();
                if (isThenable(result)) {
                    // If callback returns a Thenable that rejects, return the rejection. Otherwise, return or throw the
                    // incoming value as appropriate when the Thenable resolves.
                    return Promise.resolve(result).then(function () {
                        if (rejected) {
                            throw valueOrError;
                        }
                        return valueOrError;
                    });
                }
                else {
                    // If callback returns a non-Thenable, return or throw the incoming value as appropriate.
                    if (rejected) {
                        throw valueOrError;
                    }
                    return valueOrError;
                }
            }
            ;
            return this.then(handler.bind(null, false), handler.bind(null, true));
        };
        Object.defineProperty(Promise.prototype, "state", {
            /**
             * The current Promise state.
             */
            get: function () {
                return this._state;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Adds a callback to the promise to be invoked when the asynchronous operation completes successfully.
         */
        Promise.prototype.then = function (onFulfilled, onRejected) {
            return this.constructor.copy(this.promise.then(onFulfilled, onRejected));
        };
        /**
         * Points to the promise constructor this platform should use.
         */
        Promise.PromiseConstructor = has_1.default('promise') ? global_1.default.Promise : PromiseShim;
        return Promise;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Promise;
    /**
     * The State enum represents the possible states of a promise.
     */
    (function (State) {
        State[State["Fulfilled"] = 0] = "Fulfilled";
        State[State["Pending"] = 1] = "Pending";
        State[State["Rejected"] = 2] = "Rejected";
    })(exports.State || (exports.State = {}));
    var State = exports.State;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbWlzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Qcm9taXNlLnRzIl0sIm5hbWVzIjpbInVud3JhcFByb21pc2VzIiwiaXNUaGVuYWJsZSIsIlByb21pc2VTaGltIiwiUHJvbWlzZVNoaW0uY29uc3RydWN0b3IiLCJQcm9taXNlU2hpbS5hbGwiLCJmdWxmaWxsIiwiZmluaXNoIiwicHJvY2Vzc0l0ZW0iLCJQcm9taXNlU2hpbS5yYWNlIiwiUHJvbWlzZVNoaW0ucmVqZWN0IiwiUHJvbWlzZVNoaW0ucmVzb2x2ZSIsIlByb21pc2UiLCJQcm9taXNlLmNvbnN0cnVjdG9yIiwiUHJvbWlzZS5hbGwiLCJQcm9taXNlLnJhY2UiLCJQcm9taXNlLnJlamVjdCIsIlByb21pc2UucmVzb2x2ZSIsIlByb21pc2UuY29weSIsIlByb21pc2UuY2F0Y2giLCJQcm9taXNlLmZpbmFsbHkiLCJQcm9taXNlLmZpbmFsbHkuaGFuZGxlciIsIlByb21pc2Uuc3RhdGUiLCJQcm9taXNlLnRoZW4iLCJTdGF0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFBQSxzQkFBK0IsU0FBUyxDQUFDLENBQUE7SUFDekMsdUJBQW1CLFVBQVUsQ0FBQyxDQUFBO0lBQzlCLG9CQUFnQixPQUFPLENBQUMsQ0FBQTtJQUV4Qjs7O09BR0c7SUFDSCx3QkFBd0IsS0FBWTtRQUNuQ0EsSUFBTUEsU0FBU0EsR0FBaUJBLEVBQUVBLENBQUNBO1FBQ25DQSxJQUFNQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUMzQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsS0FBS0EsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDaENBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQkEs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QUFHQSxhQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxnQkFBTUEsQ0FBQ0EsT0FBT0EsR0FBR0EsV0FBV0EsQ0FBQ0E7UUF3TDNFQSxjQUFDQTtJQUFEQSxDQUFDQSxBQTVMRCxJQTRMQztJQTVMRDs2QkE0TEMsQ0FBQTtJQUVEOztPQUVHO0lBQ0gsV0FBWSxLQUFLO1FBQ2hCWSwyQ0FBU0EsQ0FBQUE7UUFDVEEsdUNBQU9BLENBQUFBO1FBQ1BBLHlDQUFRQSxDQUFBQTtJQUNUQSxDQUFDQSxFQUpXLGFBQUssS0FBTCxhQUFLLFFBSWhCO0lBSkQsSUFBWSxLQUFLLEdBQUwsYUFJWCxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcXVldWVNaWNyb1Rhc2sgfSBmcm9tICcuL3F1ZXVlJztcbmltcG9ydCBnbG9iYWwgZnJvbSAnLi9nbG9iYWwnO1xuaW1wb3J0IGhhcyBmcm9tICcuL2hhcyc7XG5cbi8qKlxuICogQ29waWVzIGFuIGFycmF5IG9mIHZhbHVlcywgcmVwbGFjaW5nIGFueSBQbGF0Zm9ybVByb21pc2VzIGluIHRoZSBjb3B5IHdpdGggdW53cmFwcGVkIGdsb2JhbC5Qcm9taXNlcy4gVGhpcyBpcyBuZWNlc3NhcnlcbiAqIGZvciAuYWxsIGFuZCAucmFjZSBzbyB0aGF0IHRoZSBuYXRpdmUgcHJvbWlzZSBkb2Vzbid0IHRyZWF0IHRoZSBQbGF0Zm9ybVByb21pc2VzIGxpa2UgZ2VuZXJpYyB0aGVuYWJsZXMuXG4gKi9cbmZ1bmN0aW9uIHVud3JhcFByb21pc2VzKGl0ZW1zOiBhbnlbXSk6IGFueVtdIHtcblx0Y29uc3QgdW53cmFwcGVkOiB0eXBlb2YgaXRlbXMgPSBbXTtcblx0Y29uc3QgY291bnQgPSBpdGVtcy5sZW5ndGg7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuXHRcdGlmICghKGkgaW4gaXRlbXMpKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cdFx0bGV0IGl0ZW0gPSBpdGVtc1tpXTtcblx0XHR1bndyYXBwZWRbaV0gPSBpdGVtIGluc3RhbmNlb2YgUHJvbWlzZSA/IGl0ZW0ucHJvbWlzZSA6IGl0ZW07XG5cdH1cblx0cmV0dXJuIHVud3JhcHBlZDtcbn1cblxuLyoqXG4gKiBFeGVjdXRvciBpcyB0aGUgaW50ZXJmYWNlIGZvciBmdW5jdGlvbnMgdXNlZCB0byBpbml0aWFsaXplIGEgUHJvbWlzZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeGVjdXRvcjxUPiB7XG5cdChyZXNvbHZlOiAodmFsdWU/OiBUIHwgVGhlbmFibGU8VD4pID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCk6IHZvaWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIGEgZ2l2ZW4gdmFsdWUgaGFzIGEgYHRoZW5gIG1ldGhvZC5cbiAqIEBwYXJhbSB7YW55fSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2sgaWYgaXMgVGhlbmFibGVcbiAqIEByZXR1cm5zIHtpcyBUaGVuYWJsZTxUPn0gQSB0eXBlIGd1YXJkIGlmIHRoZSB2YWx1ZSBpcyB0aGVuYWJsZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNUaGVuYWJsZTxUPih2YWx1ZTogYW55KTogdmFsdWUgaXMgVGhlbmFibGU8VD4ge1xuXHRyZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogUHJvbWlzZVNoaW0gaXMgYSBwYXJ0aWFsIGltcGxlbWVudGF0aW9uIG9mIHRoZSBFUzIwMTUgUHJvbWlzZSBzcGVjaWZpY2F0aW9uLiBJdCByZWxpZXMgb24gUHJvbWlzZSB0byBkbyBzb21lIHNhZmV0eVxuICogY2hlY2tzIHN1Y2ggYXMgdmVyaWZ5aW5nIHRoYXQgYSBQcm9taXNlIGlzbid0IHJlc29sdmVkIHdpdGggaXRzZWxmLiBUaGlzIGNsYXNzIGlzIGV4cG9ydGVkIGZvciB0ZXN0YWJpbGl0eSwgYW5kIGlzXG4gKiBub3QgaW50ZW5kZWQgdG8gYmUgdXNlZCBkaXJlY3RseS5cbiAqXG4gKiBAYm9ycm93cyBQcm9taXNlLmFsbCBhcyBQcm9taXNlU2hpbS5hbGxcbiAqIEBib3Jyb3dzIFByb21pc2UucmFjZSBhcyBQcm9taXNlU2hpbS5yYWNlXG4gKiBAYm9ycm93cyBQcm9taXNlLnJlamVjdCBhcyBQcm9taXNlU2hpbS5yZWplY3RcbiAqIEBib3Jyb3dzIFByb21pc2UucmVzb2x2ZSBhcyBQcm9taXNlU2hpbS5yZXNvbHZlXG4gKiBAYm9ycm93cyBQcm9taXNlI2NhdGNoIGFzIFByb21pc2VTaGltI2NhdGNoXG4gKiBAYm9ycm93cyBQcm9taXNlI3RoZW4gYXMgUHJvbWlzZVNoaW0jdGhlblxuICovXG5leHBvcnQgY2xhc3MgUHJvbWlzZVNoaW08VD4gaW1wbGVtZW50cyBUaGVuYWJsZTxUPiB7XG5cdHN0YXRpYyBhbGw8VD4oaXRlbXM6IChUIHwgVGhlbmFibGU8VD4pW10pOiBQcm9taXNlU2hpbTxUW10+IHtcblx0XHRyZXR1cm4gbmV3IHRoaXMoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0Y29uc3QgdmFsdWVzOiBUW10gPSBbXTtcblx0XHRcdGxldCBjb21wbGV0ZSA9IDA7XG5cdFx0XHRsZXQgdG90YWwgPSAwO1xuXHRcdFx0bGV0IHBvcHVsYXRpbmcgPSB0cnVlO1xuXG5cdFx0XHRmdW5jdGlvbiBmdWxmaWxsKGluZGV4OiBudW1iZXIsIHZhbHVlOiBhbnkpOiB2b2lkIHtcblx0XHRcdFx0dmFsdWVzW2luZGV4XSA9IHZhbHVlO1xuXHRcdFx0XHQrK2NvbXBsZXRlO1xuXHRcdFx0XHRmaW5pc2goKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gZmluaXNoKCk6IHZvaWQge1xuXHRcdFx0XHRpZiAocG9wdWxhdGluZyB8fCBjb21wbGV0ZSA8IHRvdGFsKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJlc29sdmUodmFsdWVzKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gcHJvY2Vzc0l0ZW0oaW5kZXg6IG51bWJlciwgaXRlbTogKFQgfCBUaGVuYWJsZTxUPikpOiB2b2lkIHtcblx0XHRcdFx0Kyt0b3RhbDtcblx0XHRcdFx0aWYgKGl0ZW0gaW5zdGFuY2VvZiBQcm9taXNlU2hpbSkge1xuXHRcdFx0XHRcdC8vIElmIGFuIGl0ZW0gUHJvbWlzZVNoaW0gcmVqZWN0cywgdGhpcyBQcm9taXNlU2hpbSBpcyBpbW1lZGlhdGVseSByZWplY3RlZCB3aXRoIHRoZSBpdGVtXG5cdFx0XHRcdFx0Ly8gUHJvbWlzZVNoaW0ncyByZWplY3Rpb24gZXJyb3IuXG5cdFx0XHRcdFx0aXRlbS50aGVuKGZ1bGZpbGwuYmluZChudWxsLCBpbmRleCksIHJlamVjdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0UHJvbWlzZVNoaW0ucmVzb2x2ZShpdGVtKS50aGVuKGZ1bGZpbGwuYmluZChudWxsLCBpbmRleCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBjb3VudCA9IGl0ZW1zLmxlbmd0aDtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7ICsraSkge1xuXHRcdFx0XHRwcm9jZXNzSXRlbShpLCBpdGVtc1tpXSk7XG5cdFx0XHR9XG5cdFx0XHRwb3B1bGF0aW5nID0gZmFsc2U7XG5cblx0XHRcdGZpbmlzaCgpO1xuXHRcdH0pO1xuXHR9XG5cblx0c3RhdGljIHJhY2U8VD4oaXRlbXM6IChUIHwgVGhlbmFibGU8VD4pW10pOiBQcm9taXNlU2hpbTxUPiB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdGNvbnN0IGNvdW50ID0gaXRlbXMubGVuZ3RoO1xuXHRcdFx0bGV0IGl0ZW06IChUIHwgVGhlbmFibGU8VD4pO1xuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyArK2kpIHtcblx0XHRcdFx0aXRlbSA9IGl0ZW1zW2ldO1xuXG5cdFx0XHRcdGlmIChpdGVtIGluc3RhbmNlb2YgUHJvbWlzZVNoaW0pIHtcblx0XHRcdFx0XHQvLyBJZiBhIFByb21pc2VTaGltIGl0ZW0gcmVqZWN0cywgdGhpcyBQcm9taXNlU2hpbSBpcyBpbW1lZGlhdGVseSByZWplY3RlZCB3aXRoIHRoZSBpdGVtXG5cdFx0XHRcdFx0Ly8gUHJvbWlzZVNoaW0ncyByZWplY3Rpb24gZXJyb3IuXG5cdFx0XHRcdFx0aXRlbS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0UHJvbWlzZVNoaW0ucmVzb2x2ZShpdGVtKS50aGVuKHJlc29sdmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRzdGF0aWMgcmVqZWN0PFQ+KHJlYXNvbj86IEVycm9yKTogUHJvbWlzZVNoaW08VD4ge1xuXHRcdHJldHVybiBuZXcgdGhpcyhmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRyZWplY3QocmVhc29uKTtcblx0XHR9KTtcblx0fVxuXG5cdHN0YXRpYyByZXNvbHZlKCk6IFByb21pc2VTaGltPHZvaWQ+O1xuXHRzdGF0aWMgcmVzb2x2ZTxUPih2YWx1ZTogKFQgfCBUaGVuYWJsZTxUPikpOiBQcm9taXNlU2hpbTxUPjtcblx0c3RhdGljIHJlc29sdmU8VD4odmFsdWU/OiBhbnkpOiBQcm9taXNlU2hpbTxUPiB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0XHRyZXNvbHZlKDxUPiB2YWx1ZSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBQcm9taXNlU2hpbS5cblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqXG5cdCAqIEBwYXJhbSBleGVjdXRvclxuXHQgKiBUaGUgZXhlY3V0b3IgZnVuY3Rpb24gaXMgY2FsbGVkIGltbWVkaWF0ZWx5IHdoZW4gdGhlIFByb21pc2VTaGltIGlzIGluc3RhbnRpYXRlZC4gSXQgaXMgcmVzcG9uc2libGUgZm9yXG5cdCAqIHN0YXJ0aW5nIHRoZSBhc3luY2hyb25vdXMgb3BlcmF0aW9uIHdoZW4gaXQgaXMgaW52b2tlZC5cblx0ICpcblx0ICogVGhlIGV4ZWN1dG9yIG11c3QgY2FsbCBlaXRoZXIgdGhlIHBhc3NlZCBgcmVzb2x2ZWAgZnVuY3Rpb24gd2hlbiB0aGUgYXN5bmNocm9ub3VzIG9wZXJhdGlvbiBoYXMgY29tcGxldGVkXG5cdCAqIHN1Y2Nlc3NmdWxseSwgb3IgdGhlIGByZWplY3RgIGZ1bmN0aW9uIHdoZW4gdGhlIG9wZXJhdGlvbiBmYWlscy5cblx0ICovXG5cdGNvbnN0cnVjdG9yKGV4ZWN1dG9yOiBFeGVjdXRvcjxUPikge1xuXHRcdC8qKlxuXHRcdCAqIElmIHRydWUsIHRoZSByZXNvbHV0aW9uIG9mIHRoaXMgcHJvbWlzZSBpcyBjaGFpbmVkIChcImxvY2tlZCBpblwiKSB0byBhbm90aGVyIHByb21pc2UuXG5cdFx0ICovXG5cdFx0bGV0IGlzQ2hhaW5lZCA9IGZhbHNlO1xuXG5cdFx0LyoqXG5cdFx0ICogV2hldGhlciBvciBub3QgdGhpcyBwcm9taXNlIGlzIGluIGEgcmVzb2x2ZWQgc3RhdGUuXG5cdFx0ICovXG5cdFx0Y29uc3QgaXNSZXNvbHZlZCA9ICgpOiBib29sZWFuID0+IHtcblx0XHRcdHJldHVybiB0aGlzLnN0YXRlICE9PSBTdGF0ZS5QZW5kaW5nIHx8IGlzQ2hhaW5lZDtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQ2FsbGJhY2tzIHRoYXQgc2hvdWxkIGJlIGludm9rZWQgb25jZSB0aGUgYXN5bmNocm9ub3VzIG9wZXJhdGlvbiBoYXMgY29tcGxldGVkLlxuXHRcdCAqL1xuXHRcdGxldCBjYWxsYmFja3M6IEFycmF5PCgpID0+IHZvaWQ+ID0gW107XG5cblx0XHQvKipcblx0XHQgKiBJbml0aWFsbHkgcHVzaGVzIGNhbGxiYWNrcyBvbnRvIGEgcXVldWUgZm9yIGV4ZWN1dGlvbiBvbmNlIHRoaXMgcHJvbWlzZSBzZXR0bGVzLiBBZnRlciB0aGUgcHJvbWlzZSBzZXR0bGVzLFxuXHRcdCAqIGVucXVldWVzIGNhbGxiYWNrcyBmb3IgZXhlY3V0aW9uIG9uIHRoZSBuZXh0IGV2ZW50IGxvb3AgdHVybi5cblx0XHQgKi9cblx0XHRsZXQgd2hlbkZpbmlzaGVkID0gZnVuY3Rpb24gKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XG5cdFx0XHRjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFNldHRsZXMgdGhpcyBwcm9taXNlLlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG5ld1N0YXRlIFRoZSByZXNvbHZlZCBzdGF0ZSBmb3IgdGhpcyBwcm9taXNlLlxuXHRcdCAqIEBwYXJhbSB7VHxFcnJvcn0gdmFsdWUgVGhlIHJlc29sdmVkIHZhbHVlIGZvciB0aGlzIHByb21pc2UuXG5cdFx0ICovXG5cdFx0Y29uc3Qgc2V0dGxlID0gKG5ld1N0YXRlOiBTdGF0ZSwgdmFsdWU6IGFueSk6IHZvaWQgPT4ge1xuXHRcdFx0Ly8gQSBwcm9taXNlIGNhbiBvbmx5IGJlIHNldHRsZWQgb25jZS5cblx0XHRcdGlmICh0aGlzLnN0YXRlICE9PSBTdGF0ZS5QZW5kaW5nKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zdGF0ZSA9IG5ld1N0YXRlO1xuXHRcdFx0dGhpcy5yZXNvbHZlZFZhbHVlID0gdmFsdWU7XG5cdFx0XHR3aGVuRmluaXNoZWQgPSBxdWV1ZU1pY3JvVGFzaztcblxuXHRcdFx0Ly8gT25seSBlbnF1ZXVlIGEgY2FsbGJhY2sgcnVubmVyIGlmIHRoZXJlIGFyZSBjYWxsYmFja3Mgc28gdGhhdCBpbml0aWFsbHkgZnVsZmlsbGVkIFByb21pc2VzIGRvbid0IGhhdmUgdG9cblx0XHRcdC8vIHdhaXQgYW4gZXh0cmEgdHVybi5cblx0XHRcdGlmIChjYWxsYmFja3MubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRxdWV1ZU1pY3JvVGFzayhmdW5jdGlvbiAoKTogdm9pZCB7XG5cdFx0XHRcdFx0bGV0IGNvdW50ID0gY2FsbGJhY2tzLmxlbmd0aDtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyArK2kpIHtcblx0XHRcdFx0XHRcdGNhbGxiYWNrc1tpXS5jYWxsKG51bGwpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYWxsYmFja3MgPSBudWxsO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogUmVzb2x2ZXMgdGhpcyBwcm9taXNlLlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG5ld1N0YXRlIFRoZSByZXNvbHZlZCBzdGF0ZSBmb3IgdGhpcyBwcm9taXNlLlxuXHRcdCAqIEBwYXJhbSB7VHxFcnJvcn0gdmFsdWUgVGhlIHJlc29sdmVkIHZhbHVlIGZvciB0aGlzIHByb21pc2UuXG5cdFx0ICovXG5cdFx0Y29uc3QgcmVzb2x2ZSA9IChuZXdTdGF0ZTogU3RhdGUsIHZhbHVlOiBhbnkpOiB2b2lkID0+IHtcblx0XHRcdGlmIChpc1Jlc29sdmVkKCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaXNUaGVuYWJsZSh2YWx1ZSkpIHtcblx0XHRcdFx0dmFsdWUudGhlbihcblx0XHRcdFx0XHRzZXR0bGUuYmluZChudWxsLCBTdGF0ZS5GdWxmaWxsZWQpLFxuXHRcdFx0XHRcdHNldHRsZS5iaW5kKG51bGwsIFN0YXRlLlJlamVjdGVkKVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpc0NoYWluZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHNldHRsZShuZXdTdGF0ZSwgdmFsdWUpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR0aGlzLnRoZW4gPSA8VT4oXG5cdFx0XHRvbkZ1bGZpbGxlZD86ICh2YWx1ZT86IFQpID0+IChVIHwgUHJvbWlzZVNoaW08VT4pLFxuXHRcdFx0b25SZWplY3RlZD86IChyZWFzb24/OiBFcnJvcikgPT4gKFUgfCBQcm9taXNlU2hpbTxVPilcblx0XHQpOiBQcm9taXNlU2hpbTxVPiA9PiB7XG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2VTaGltPFU+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdFx0Ly8gd2hlbkZpbmlzaGVkIGluaXRpYWxseSBxdWV1ZXMgdXAgY2FsbGJhY2tzIGZvciBleGVjdXRpb24gYWZ0ZXIgdGhlIHByb21pc2UgaGFzIHNldHRsZWQuIE9uY2UgdGhlXG5cdFx0XHRcdC8vIHByb21pc2UgaGFzIHNldHRsZWQsIHdoZW5GaW5pc2hlZCB3aWxsIHNjaGVkdWxlIGNhbGxiYWNrcyBmb3IgZXhlY3V0aW9uIG9uIHRoZSBuZXh0IHR1cm4gdGhyb3VnaCB0aGVcblx0XHRcdFx0Ly8gZXZlbnQgbG9vcC5cblx0XHRcdFx0d2hlbkZpbmlzaGVkKCgpID0+IHtcblx0XHRcdFx0XHRjb25zdCBjYWxsYmFjazogKHZhbHVlPzogYW55KSA9PiBhbnkgPSB0aGlzLnN0YXRlID09PSBTdGF0ZS5SZWplY3RlZCA/IG9uUmVqZWN0ZWQgOiBvbkZ1bGZpbGxlZDtcblxuXHRcdFx0XHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdHJlc29sdmUoY2FsbGJhY2sodGhpcy5yZXNvbHZlZFZhbHVlKSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuUmVqZWN0ZWQpIHtcblx0XHRcdFx0XHRcdHJlamVjdCh0aGlzLnJlc29sdmVkVmFsdWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdHJlc29sdmUodGhpcy5yZXNvbHZlZFZhbHVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdHRyeSB7XG5cdFx0XHQoPEV4ZWN1dG9yPFQ+PiBleGVjdXRvcikoXG5cdFx0XHRcdHJlc29sdmUuYmluZChudWxsLCBTdGF0ZS5GdWxmaWxsZWQpLFxuXHRcdFx0XHRyZXNvbHZlLmJpbmQobnVsbCwgU3RhdGUuUmVqZWN0ZWQpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHNldHRsZShTdGF0ZS5SZWplY3RlZCwgZXJyb3IpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY3VycmVudCBzdGF0ZSBvZiB0aGlzIHByb21pc2UuXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRlID0gU3RhdGUuUGVuZGluZztcblxuXHQvKipcblx0ICogVGhlIHJlc29sdmVkIHZhbHVlIGZvciB0aGlzIHByb21pc2UuXG5cdCAqXG5cdCAqIEB0eXBlIHtUfEVycm9yfVxuXHQgKi9cblx0cHJpdmF0ZSByZXNvbHZlZFZhbHVlOiBhbnk7XG5cblx0dGhlbjogPFU+KFxuXHRcdG9uRnVsZmlsbGVkPzogKHZhbHVlPzogVCkgPT4gKFUgfCBUaGVuYWJsZTxVPiksXG5cdFx0b25SZWplY3RlZD86IChyZWFzb24/OiBFcnJvcikgPT4gKFUgfCBUaGVuYWJsZTxVPilcblx0KSA9PiBQcm9taXNlU2hpbTxVPjtcbn1cblxuLyoqXG4gKiBQbGF0Zm9ybVByb21pc2UgaXMgYSB2ZXJ5IHRoaW4gd3JhcHBlciBhcm91bmQgZWl0aGVyIGEgbmF0aXZlIHByb21pc2UgaW1wbGVtZW50YXRpb24gb3IgUHJvbWlzZVNoaW0uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb21pc2U8VD4gaW1wbGVtZW50cyBUaGVuYWJsZTxUPiB7XG5cdC8qKlxuXHQgKiBQb2ludHMgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3IgdGhpcyBwbGF0Zm9ybSBzaG91bGQgdXNlLlxuXHQgKi9cblx0c3RhdGljIFByb21pc2VDb25zdHJ1Y3RvciA9IGhhcygncHJvbWlzZScpID8gZ2xvYmFsLlByb21pc2UgOiBQcm9taXNlU2hpbTtcblxuXHQvKipcblx0ICogQ29udmVydHMgYW4gaXRlcmFibGUgb2JqZWN0IGNvbnRhaW5pbmcgcHJvbWlzZXMgaW50byBhIHNpbmdsZSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBuZXcgaXRlcmFibGUgb2JqZWN0XG5cdCAqIGNvbnRhaW5pbmcgdGhlIGZ1bGZpbGxlZCB2YWx1ZXMgb2YgYWxsIHRoZSBwcm9taXNlcyBpbiB0aGUgaXRlcmFibGUsIGluIHRoZSBzYW1lIG9yZGVyIGFzIHRoZSBQcm9taXNlcyBpbiB0aGVcblx0ICogaXRlcmFibGUuIEl0ZXJhYmxlIHZhbHVlcyB0aGF0IGFyZSBub3QgcHJvbWlzZXMgYXJlIGNvbnZlcnRlZCB0byBwcm9taXNlcyB1c2luZyBQcm9taXNlU2hpbS5yZXNvbHZlLlxuXHQgKlxuXHQgKiBAZXhhbXBsZVxuXHQgKiBQcm9taXNlU2hpbS5hbGwoWyBQcm9taXNlU2hpbS5yZXNvbHZlKCdmb28nKSwgJ2JhcicgXSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcblx0ICogICAgIHZhbHVlWzBdID09PSAnZm9vJzsgLy8gdHJ1ZVxuXHQgKiAgICAgdmFsdWVbMV0gPT09ICdiYXInOyAvLyB0cnVlXG5cdCAqIH0pO1xuXHQgKlxuXHQgKiBAZXhhbXBsZVxuXHQgKiBQcm9taXNlU2hpbS5hbGwoe1xuXHQgKiAgICAgZm9vOiBQcm9taXNlU2hpbS5yZXNvbHZlKCdmb28nKSxcblx0ICogICAgIGJhcjogJ2Jhcidcblx0ICogfSkudGhlbigodmFsdWUpID0+IHtcblx0ICogICAgIHZhbHVlLmZvbyA9PT0gJ2Zvbyc7IC8vIHRydWVcblx0ICogICAgIHZhbHVlLmJhciA9PT0gJ2Jhcic7IC8vIHRydWVcblx0ICogfSk7XG5cdCAqL1xuXHRzdGF0aWMgYWxsPFQ+KGl0ZW1zOiAoVCB8IFRoZW5hYmxlPFQ+KVtdKTogUHJvbWlzZTxUW10+IHtcblx0XHRyZXR1cm4gdGhpcy5jb3B5KFByb21pc2UuUHJvbWlzZUNvbnN0cnVjdG9yLmFsbCh1bndyYXBQcm9taXNlcyhpdGVtcykpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhbiBpdGVyYWJsZSBvYmplY3QgY29udGFpbmluZyBwcm9taXNlcyBpbnRvIGEgc2luZ2xlIHByb21pc2UgdGhhdCByZXNvbHZlcyBvciByZWplY3RzIGFzIHNvb24gYXMgb25lIG9mXG5cdCAqIHRoZSBwcm9taXNlcyBpbiB0aGUgaXRlcmFibGUgcmVzb2x2ZXMgb3IgcmVqZWN0cywgd2l0aCB0aGUgdmFsdWUgb2YgdGhlIHJlc29sdmVkIG9yIHJlamVjdGVkIHByb21pc2UuIFZhbHVlcyBpblxuXHQgKiB0aGUgaXRlcmFibGUgdGhhdCBhcmUgbm90IFByb21pc2VzIGFyZSBjb252ZXJ0ZWQgdG8gUHJvbWlzZXMgd2l0aCBQcm9taXNlU2hpbS5yZXNvbHZlLlxuXHQgKlxuXHQgKiBAZXhhbXBsZVxuXHQgKiBQcm9taXNlU2hpbS5yYWNlKFsgUHJvbWlzZVNoaW0ucmVzb2x2ZSgnZm9vJyksIFByb21pc2VTaGltLnJlc29sdmUoJ2JhcicpIF0pLnRoZW4oKHZhbHVlKSA9PiB7XG5cdCAqICAgICB2YWx1ZSA9PT0gJ2Zvbyc7IC8vIHRydWVcblx0ICogfSk7XG5cdCAqXG5cdCAqIEBleGFtcGxlXG5cdCAqIFByb21pc2VTaGltLnJhY2Uoe1xuXHQgKiAgICAgZm9vOiBQcm9taXNlU2hpbS5yZXNvbHZlKCdmb28nKSxcblx0ICogICAgIGJhcjogUHJvbWlzZVNoaW0ucmVzb2x2ZSgnYmFyJylcblx0ICogfSkudGhlbigodmFsdWUpID0+IHtcblx0ICogICAgIHZhbHVlID09PSAnZm9vJzsgLy8gdHJ1ZVxuXHQgKiB9KTtcblx0ICovXG5cdHN0YXRpYyByYWNlPFQ+KGl0ZW1zOiAoVCB8IFRoZW5hYmxlPFQ+KVtdKTogUHJvbWlzZTxUPiB7XG5cdFx0cmV0dXJuIHRoaXMuY29weShQcm9taXNlLlByb21pc2VDb25zdHJ1Y3Rvci5yYWNlKHVud3JhcFByb21pc2VzKGl0ZW1zKSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgcHJvbWlzZSB0aGF0IGlzIHJlamVjdGVkIHdpdGggdGhlIGdpdmVuIGVycm9yLlxuXHQgKi9cblx0c3RhdGljIHJlamVjdDxUPihyZWFzb246IEVycm9yKTogUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gdGhpcy5jb3B5KFByb21pc2UuUHJvbWlzZUNvbnN0cnVjdG9yLnJlamVjdChyZWFzb24pKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZS4gSWYgdGhlIHBhc3NlZCB2YWx1ZSBpcyBhbHJlYWR5IGEgUHJvbWlzZVNoaW0sIGl0XG5cdCAqIHdpbGwgYmUgcmV0dXJuZWQgYXMtaXMuXG5cdCAqL1xuXHRzdGF0aWMgcmVzb2x2ZSgpOiBQcm9taXNlPHZvaWQ+O1xuXHRzdGF0aWMgcmVzb2x2ZTxUPih2YWx1ZTogKFQgfCBUaGVuYWJsZTxUPikpOiBQcm9taXNlPFQ+O1xuXHRzdGF0aWMgcmVzb2x2ZTxUPih2YWx1ZT86IGFueSk6IFByb21pc2U8VD4ge1xuXHRcdGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuY29weShQcm9taXNlLlByb21pc2VDb25zdHJ1Y3Rvci5yZXNvbHZlKHZhbHVlKSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29waWVzIGFub3RoZXIgUHJvbWlzZSwgdGFraW5nIG9uIGl0cyBpbm5lciBzdGF0ZS5cblx0ICovXG5cdHByb3RlY3RlZCBzdGF0aWMgY29weTxVPihvdGhlcjogUHJvbWlzZTxVPik6IFByb21pc2U8VT4ge1xuXHRcdGNvbnN0IHByb21pc2UgPSBPYmplY3QuY3JlYXRlKHRoaXMucHJvdG90eXBlLCB7XG5cdFx0XHRwcm9taXNlOiB7IHZhbHVlOiBvdGhlciBpbnN0YW5jZW9mIFByb21pc2UuUHJvbWlzZUNvbnN0cnVjdG9yID8gb3RoZXIgOiBvdGhlci5wcm9taXNlIH1cblx0XHR9KTtcblxuXHRcdHByb21pc2UuX3N0YXRlID0gU3RhdGUuUGVuZGluZztcblx0XHRwcm9taXNlLnByb21pc2UudGhlbihcblx0XHRcdGZ1bmN0aW9uICgpIHsgcHJvbWlzZS5fc3RhdGUgPSBTdGF0ZS5GdWxmaWxsZWQ7IH0sXG5cdFx0XHRmdW5jdGlvbiAoKSB7IHByb21pc2UuX3N0YXRlID0gU3RhdGUuUmVqZWN0ZWQ7IH1cblx0XHQpO1xuXG5cdFx0cmV0dXJuIHByb21pc2U7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBQcm9taXNlLlxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICpcblx0ICogQHBhcmFtIGV4ZWN1dG9yXG5cdCAqIFRoZSBleGVjdXRvciBmdW5jdGlvbiBpcyBjYWxsZWQgaW1tZWRpYXRlbHkgd2hlbiB0aGUgUHJvbWlzZVNoaW0gaXMgaW5zdGFudGlhdGVkLiBJdCBpcyByZXNwb25zaWJsZSBmb3Jcblx0ICogc3RhcnRpbmcgdGhlIGFzeW5jaHJvbm91cyBvcGVyYXRpb24gd2hlbiBpdCBpcyBpbnZva2VkLlxuXHQgKlxuXHQgKiBUaGUgZXhlY3V0b3IgbXVzdCBjYWxsIGVpdGhlciB0aGUgcGFzc2VkIGByZXNvbHZlYCBmdW5jdGlvbiB3aGVuIHRoZSBhc3luY2hyb25vdXMgb3BlcmF0aW9uIGhhcyBjb21wbGV0ZWRcblx0ICogc3VjY2Vzc2Z1bGx5LCBvciB0aGUgYHJlamVjdGAgZnVuY3Rpb24gd2hlbiB0aGUgb3BlcmF0aW9uIGZhaWxzLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoZXhlY3V0b3I6IEV4ZWN1dG9yPFQ+KSB7XG5cdFx0Ly8gV3JhcCB0aGUgZXhlY3V0b3IgdG8gdmVyaWZ5IHRoYXQgdGhlIHRoZSByZXNvbHV0aW9uIHZhbHVlIGlzbid0IHRoaXMgcHJvbWlzZS4gU2luY2UgYW55IGluY29taW5nIHByb21pc2Vcblx0XHQvLyBzaG91bGQgYmUgd3JhcHBlZCwgdGhlIG5hdGl2ZSByZXNvbHZlciBjYW4ndCBhdXRvbWF0aWNhbGx5IGRldGVjdCBzZWxmLXJlc29sdXRpb24uXG5cdFx0dGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UuUHJvbWlzZUNvbnN0cnVjdG9yKDxFeGVjdXRvcjxUPj4gKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGV4ZWN1dG9yKFxuXHRcdFx0XHQodmFsdWUpID0+IHtcblx0XHRcdFx0XHRpZiAodmFsdWUgPT09IHRoaXMpIHtcblx0XHRcdFx0XHRcdHJlamVjdChuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2hhaW4gYSBwcm9taXNlIHRvIGl0c2VsZicpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKHZhbHVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZ1bmN0aW9uIChyZWFzb24pOiB2b2lkIHtcblx0XHRcdFx0XHRyZWplY3QocmVhc29uKTtcblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHR9KSk7XG5cblx0XHR0aGlzLl9zdGF0ZSA9IFN0YXRlLlBlbmRpbmc7XG5cdFx0dGhpcy5wcm9taXNlLnRoZW4oXG5cdFx0XHQoKSA9PiB7IHRoaXMuX3N0YXRlID0gU3RhdGUuRnVsZmlsbGVkOyB9LFxuXHRcdFx0KCkgPT4geyB0aGlzLl9zdGF0ZSA9IFN0YXRlLlJlamVjdGVkOyB9XG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBbiBvYmplY3Qgd3JhcHBlZCBieSB0aGlzIGNsYXNzIHRoYXQgYWN0dWFsbHkgaW1wbGVtZW50cyB0aGUgUHJvbWlzZSBBUEkuXG5cdCAqL1xuXHRwcml2YXRlIHByb21pc2U6IGFueTtcblxuXHQvKipcblx0ICogVGhlIGludGVybmFsIHN0YXRlIG9mIHRoaXMgcHJvbWlzZS4gVGhpcyBtYXkgYmUgdXBkYXRlZCBkaXJlY3RseSBieSBzdWJjbGFzc2VzLlxuXHQgKi9cblx0cHJvdGVjdGVkIF9zdGF0ZTogU3RhdGU7XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBjYWxsYmFjayB0byB0aGUgcHJvbWlzZSB0byBiZSBpbnZva2VkIHdoZW4gdGhlIGFzeW5jaHJvbm91cyBvcGVyYXRpb24gdGhyb3dzIGFuIGVycm9yLlxuXHQgKi9cblx0Y2F0Y2g8VT4ob25SZWplY3RlZDogKHJlYXNvbj86IEVycm9yKSA9PiAoVSB8IFRoZW5hYmxlPFU+KSk6IFByb21pc2U8VT4ge1xuXHRcdHJldHVybiB0aGlzLnRoZW48VT4obnVsbCwgb25SZWplY3RlZCk7XG5cdH1cblxuXHQvKipcblx0ICogQWxsb3dzIGZvciBjbGVhbnVwIGFjdGlvbnMgdG8gYmUgcGVyZm9ybWVkIGFmdGVyIHJlc29sdXRpb24gb2YgYSBQcm9taXNlLlxuXHQgKi9cblx0ZmluYWxseShjYWxsYmFjazogKCkgPT4gdm9pZCB8IFRoZW5hYmxlPGFueT4pOiBQcm9taXNlPFQ+IHtcblx0XHQvLyBIYW5kbGVyIHRvIGJlIHVzZWQgZm9yIGZ1bGZpbGxtZW50IGFuZCByZWplY3Rpb247IHdoZXRoZXIgaXQgd2FzIGZ1bGZpbGxlZCBvciByZWplY3RlZCBpcyBleHBsaWNpdGx5XG5cdFx0Ly8gaW5kaWNhdGVkIGJ5IHRoZSBmaXJzdCBhcmd1bWVudFxuXHRcdGZ1bmN0aW9uIGhhbmRsZXIocmVqZWN0ZWQ6IGJvb2xlYW4sIHZhbHVlT3JFcnJvcjogYW55KSB7XG5cdFx0XHQvLyBJZiBjYWxsYmFjayB0aHJvd3MsIHRoZSBoYW5kbGVyIHdpbGwgdGhyb3dcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGNhbGxiYWNrKCk7XG5cdFx0XHRpZiAoaXNUaGVuYWJsZShyZXN1bHQpKSB7XG5cdFx0XHRcdC8vIElmIGNhbGxiYWNrIHJldHVybnMgYSBUaGVuYWJsZSB0aGF0IHJlamVjdHMsIHJldHVybiB0aGUgcmVqZWN0aW9uLiBPdGhlcndpc2UsIHJldHVybiBvciB0aHJvdyB0aGVcblx0XHRcdFx0Ly8gaW5jb21pbmcgdmFsdWUgYXMgYXBwcm9wcmlhdGUgd2hlbiB0aGUgVGhlbmFibGUgcmVzb2x2ZXMuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0KS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAocmVqZWN0ZWQpIHtcblx0XHRcdFx0XHRcdHRocm93IHZhbHVlT3JFcnJvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlT3JFcnJvcjtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Ly8gSWYgY2FsbGJhY2sgcmV0dXJucyBhIG5vbi1UaGVuYWJsZSwgcmV0dXJuIG9yIHRocm93IHRoZSBpbmNvbWluZyB2YWx1ZSBhcyBhcHByb3ByaWF0ZS5cblx0XHRcdFx0aWYgKHJlamVjdGVkKSB7XG5cdFx0XHRcdFx0dGhyb3cgdmFsdWVPckVycm9yO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB2YWx1ZU9yRXJyb3I7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJldHVybiB0aGlzLnRoZW48VD4oaGFuZGxlci5iaW5kKG51bGwsIGZhbHNlKSwgaGFuZGxlci5iaW5kKG51bGwsIHRydWUpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY3VycmVudCBQcm9taXNlIHN0YXRlLlxuXHQgKi9cblx0Z2V0IHN0YXRlKCk6IFN0YXRlIHtcblx0XHRyZXR1cm4gdGhpcy5fc3RhdGU7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIGNhbGxiYWNrIHRvIHRoZSBwcm9taXNlIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgYXN5bmNocm9ub3VzIG9wZXJhdGlvbiBjb21wbGV0ZXMgc3VjY2Vzc2Z1bGx5LlxuXHQgKi9cblx0dGhlbjxVPihvbkZ1bGZpbGxlZD86ICh2YWx1ZT86IFQpID0+IChVIHwgVGhlbmFibGU8VT4pLCBvblJlamVjdGVkPzogKHJlYXNvbj86IEVycm9yKSA9PiAoVSB8IFRoZW5hYmxlPFU+KSk6IFByb21pc2U8VT4ge1xuXHRcdHJldHVybiAoPHR5cGVvZiBQcm9taXNlPiB0aGlzLmNvbnN0cnVjdG9yKS5jb3B5KHRoaXMucHJvbWlzZS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSk7XG5cdH1cbn1cblxuLyoqXG4gKiBUaGUgU3RhdGUgZW51bSByZXByZXNlbnRzIHRoZSBwb3NzaWJsZSBzdGF0ZXMgb2YgYSBwcm9taXNlLlxuICovXG5leHBvcnQgZW51bSBTdGF0ZSB7XG5cdEZ1bGZpbGxlZCxcblx0UGVuZGluZyxcblx0UmVqZWN0ZWRcbn1cblxuLyoqXG4gKiBUaGVuYWJsZSByZXByZXNlbnRzIGFueSBvYmplY3Qgd2l0aCBhIGNhbGxhYmxlIGB0aGVuYCBwcm9wZXJ0eS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUaGVuYWJsZTxUPiB7XG5cdHRoZW48VT4ob25GdWxmaWxsZWQ/OiAodmFsdWU/OiBUKSA9PiBVIHwgVGhlbmFibGU8VT4sIG9uUmVqZWN0ZWQ/OiAoZXJyb3I/OiBhbnkpID0+IFUgfCBUaGVuYWJsZTxVPik6IFRoZW5hYmxlPFU+O1xufVxuIl19