(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise', './ReadableStreamController', './ReadableStreamReader', './SizeQueue', './util', './WritableStream'], factory);
    }
})(function (require, exports) {
    var Promise_1 = require('../Promise');
    var ReadableStreamController_1 = require('./ReadableStreamController');
    var ReadableStreamReader_1 = require('./ReadableStreamReader');
    var SizeQueue_1 = require('./SizeQueue');
    var util = require('./util');
    var WritableStream_1 = require('./WritableStream');
    /**
     * `ReadableStream`'s possible states
     */
    (function (State) {
        State[State["Readable"] = 0] = "Readable";
        State[State["Closed"] = 1] = "Closed";
        State[State["Errored"] = 2] = "Errored";
    })(exports.State || (exports.State = {}));
    var State = exports.State;
    /**
     * Implementation of a readable stream.
     */
    var ReadableStream = (function () {
        /**
         * A `ReadableStream` requires an underlying source to supply data. The source interacts with the stream through
         * a {@link ReadableStreamController} that is associated with the stream, and provided to the source.
         *
         * @constructor
         * @param underlyingSource The source object that supplies data to the stream by interacting with its controller.
         * @param strategy The strategy for this stream.
         */
        function ReadableStream(underlyingSource, strategy) {
            var _this = this;
            if (strategy === void 0) { strategy = {}; }
            this.closeRequested = false;
            if (!underlyingSource) {
                throw new Error('An ReadableStream Source must be provided.');
            }
            this.state = State.Readable;
            this._underlyingSource = underlyingSource;
            this.controller = new ReadableStreamController_1.default(this);
            this._strategy = util.normalizeStrategy(strategy);
            this.queue = new SizeQueue_1.default();
            this._startedPromise = new Promise_1.default(function (resolveStarted) {
                var startResult = util.invokeOrNoop(_this._underlyingSource, 'start', [_this.controller]);
                Promise_1.default.resolve(startResult).then(function () {
                    _this._started = true;
                    resolveStarted();
                    _this.pull();
                }, function (error) {
                    _this.error(error);
                });
            });
        }
        Object.defineProperty(ReadableStream.prototype, "_allowPull", {
            // ShouldReadableStreamPull
            get: function () {
                return !this.pullScheduled &&
                    !this.closeRequested &&
                    this._started &&
                    this.state !== State.Closed &&
                    this.state !== State.Errored &&
                    !this._shouldApplyBackPressure();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReadableStream.prototype, "desiredSize", {
            /**
             * Returns a number indicating how much additional data can be pushed by the source to the stream's queue before it
             * exceeds its `highWaterMark`. An underlying source should use this information to determine when and how to apply
             * backpressure.
             *
             * @returns The stream's strategy's `highWaterMark` value minus the queue size
             */
            // 3.5.7. GetReadableStreamDesiredSize ( stream )
            get: function () {
                return this._strategy.highWaterMark - this.queueSize;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReadableStream.prototype, "hasSource", {
            get: function () {
                return this._underlyingSource != null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReadableStream.prototype, "locked", {
            /**
             * A stream can only have one reader at a time. This value indicates if a stream already has a reader, and hence
             * cannot be read from other than by that reader. When a consumer is done with a reader they can dissociate it
             * by calling {@link ReadableStreamReader#releaseLock}.
             *
             * @returns True if the stream has a reader associated with it
             */
            // IsReadableStreamLocked
            get: function () {
                return this.hasSource && !!this.reader;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReadableStream.prototype, "readable", {
            get: function () {
                return this.hasSource && this.state === State.Readable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReadableStream.prototype, "started", {
            /**
             * This promise will resolve when the stream's underlying source has started and is ready to provide data. If
             * the {@link ReadableStreamReader#read} method is called before the stream has started it will not do anything.
             * Wait for this promise to resolve to ensure that your `read` calls are responded to as promptly as possible.
             *
             * @returns A promise that resolves when the stream is ready to be read from.
             */
            get: function () {
                return this._startedPromise;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReadableStream.prototype, "queueSize", {
            get: function () {
                return this.queue.totalSize;
            },
            enumerable: true,
            configurable: true
        });
        ReadableStream.prototype._cancel = function (reason) {
            // 3.2.4.1-3: return cancelReadableStream(this, reason);
            if (this.state === State.Closed) {
                return Promise_1.default.resolve();
            }
            if (this.state === State.Errored) {
                return Promise_1.default.reject(new TypeError('3.5.3-2: State is errored'));
            }
            this.queue.empty();
            this.close();
            return util.promiseInvokeOrNoop(this._underlyingSource, 'cancel', [reason]).then(function () { });
        };
        // shouldReadableStreamApplyBackPressure
        ReadableStream.prototype._shouldApplyBackPressure = function () {
            var queueSize = this.queue.totalSize;
            return queueSize > this._strategy.highWaterMark;
        };
        /**
         *
         * @param reason A description of the reason the stream is being canceled.
         * @returns A promise that resolves when the stream has closed and the call to the underlying source's `cancel`
         * method has completed.
         */
        ReadableStream.prototype.cancel = function (reason) {
            if (!this.hasSource) {
                return Promise_1.default.reject(new TypeError('3.2.4.1-1: Must be a ReadableStream'));
            }
            return this._cancel(reason);
        };
        /**
         * Closes the stream without regard to the status of the queue.  Use {@link requestClose} to close the
         * stream and allow the queue to flush.
         *
         */
        // 3.5.4. FinishClosingReadableStream ( stream )
        ReadableStream.prototype.close = function () {
            if (this.state !== State.Readable) {
                return;
            }
            this.state = State.Closed;
            if (this.locked) {
                this.reader.release();
            }
        };
        // EnqueueInReadableStream
        ReadableStream.prototype.enqueue = function (chunk) {
            var size = this._strategy.size;
            if (!this.readable || this.closeRequested) {
                throw new Error('3.5.6-1,2: Stream._state should be Readable and stream.closeRequested should be true');
            }
            if (!this.locked || !this.reader.resolveReadRequest(chunk)) {
                try {
                    var chunkSize = 1;
                    if (size) {
                        chunkSize = size(chunk);
                    }
                    this.queue.enqueue(chunk, chunkSize);
                }
                catch (error) {
                    this.error(error);
                    throw error;
                }
            }
            this.pull();
        };
        ReadableStream.prototype.error = function (error) {
            if (this.state !== State.Readable) {
                throw new Error('3.5.7-1: State must be Readable');
            }
            this.queue.empty();
            this.storedError = error;
            this.state = State.Errored;
            if (this.locked) {
                this.reader.release();
            }
        };
        /**
         * create a new {@link ReadableStreamReader} and lock the stream to the new reader
         */
        // AcquireReadableStreamReader
        ReadableStream.prototype.getReader = function () {
            if (!this.readable) {
                throw new TypeError('3.2.4.2-1: must be a ReadableStream instance');
            }
            return new ReadableStreamReader_1.default(this);
        };
        ReadableStream.prototype.pipeThrough = function (transformStream, options) {
            this.pipeTo(transformStream.writable, options);
            return transformStream.readable;
        };
        ReadableStream.prototype.pipeTo = function (dest, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            var resolvePipeToPromise;
            var rejectPipeToPromise;
            var closedPurposefully = false;
            var lastRead;
            var reader;
            function doPipe() {
                lastRead = reader.read();
                Promise_1.default.all([lastRead, dest.ready]).then(function (_a) {
                    var readResult = _a[0];
                    if (readResult.done) {
                        closeDest();
                    }
                    else if (dest.state === WritableStream_1.State.Writable) {
                        dest.write(readResult.value);
                        doPipe();
                    }
                });
            }
            function cancelSource(reason) {
                if (!options.preventCancel) {
                    reader.cancel(reason);
                    rejectPipeToPromise(reason);
                }
                else {
                    lastRead.then(function () {
                        reader.releaseLock();
                        rejectPipeToPromise(reason);
                    });
                }
            }
            function closeDest() {
                var destState = dest.state;
                if (!options.preventClose &&
                    (destState === WritableStream_1.State.Waiting || destState === WritableStream_1.State.Writable)) {
                    closedPurposefully = true;
                    dest.close().then(resolvePipeToPromise, rejectPipeToPromise);
                }
                else {
                    resolvePipeToPromise();
                }
            }
            return new Promise_1.default(function (resolve, reject) {
                resolvePipeToPromise = resolve;
                rejectPipeToPromise = reject;
                reader = _this.getReader();
                reader.closed.catch(function (reason) {
                    // abortDest
                    if (!options.preventAbort) {
                        dest.abort(reason);
                    }
                    rejectPipeToPromise(reason);
                });
                dest.closed.then(function () {
                    if (!closedPurposefully) {
                        cancelSource(new TypeError('destination is closing or closed and cannot be piped to anymore'));
                    }
                }, cancelSource);
                doPipe();
            });
        };
        // RequestReadableStreamPull
        ReadableStream.prototype.pull = function () {
            var _this = this;
            if (!this._allowPull) {
                return;
            }
            if (this._pullingPromise) {
                this.pullScheduled = true;
                this._pullingPromise.then(function () {
                    _this.pullScheduled = false;
                    _this.pull();
                });
                return;
            }
            this._pullingPromise = util.promiseInvokeOrNoop(this._underlyingSource, 'pull', [this.controller]);
            this._pullingPromise.then(function () {
                _this._pullingPromise = undefined;
            }, function (error) {
                _this.error(error);
            });
        };
        /**
         * Requests the stream be closed.  This method allows the queue to be emptied before the stream closes.
         *
         */
        // 3.5.3. CloseReadableStream ( stream )
        ReadableStream.prototype.requestClose = function () {
            if (this.closeRequested || this.state !== State.Readable) {
                return;
            }
            this.closeRequested = true;
            if (this.queue.length === 0) {
                this.close();
            }
        };
        /**
         * Tee a readable stream, returning a two-element array containing
         * the two resulting ReadableStream instances
         */
        // TeeReadableStream
        ReadableStream.prototype.tee = function () {
            var _this = this;
            if (!this.readable) {
                throw new TypeError('3.2.4.5-1: must be a ReadableSream');
            }
            var branch1;
            var branch2;
            var reader = this.getReader();
            var teeState = {
                closedOrErrored: false,
                canceled1: false,
                canceled2: false,
                reason1: undefined,
                reason2: undefined
            };
            teeState.promise = new Promise_1.default(function (resolve) {
                teeState._resolve = resolve;
            });
            var createCancelFunction = function (branch) {
                return function (reason) {
                    teeState['canceled' + branch] = true;
                    teeState['reason' + branch] = reason;
                    if (teeState['canceled' + (branch === 1 ? 2 : 1)]) {
                        var cancelResult = _this._cancel([teeState.reason1, teeState.reason2]);
                        teeState._resolve(cancelResult);
                    }
                    return teeState.promise;
                };
            };
            var pull = function (controller) {
                return reader.read().then(function (result) {
                    var value = result.value;
                    var done = result.done;
                    if (done && !teeState.closedOrErrored) {
                        branch1.requestClose();
                        branch2.requestClose();
                        teeState.closedOrErrored = true;
                    }
                    if (teeState.closedOrErrored) {
                        return;
                    }
                    if (!teeState.canceled1) {
                        branch1.enqueue(value);
                    }
                    if (!teeState.canceled2) {
                        branch2.enqueue(value);
                    }
                });
            };
            var cancel1 = createCancelFunction(1);
            var cancel2 = createCancelFunction(2);
            var underlyingSource1 = {
                pull: pull,
                cancel: cancel1
            };
            branch1 = new ReadableStream(underlyingSource1);
            var underlyingSource2 = {
                pull: pull,
                cancel: cancel2
            };
            branch2 = new ReadableStream(underlyingSource2);
            reader.closed.catch(function (r) {
                if (teeState.closedOrErrored) {
                    return;
                }
                branch1.error(r);
                branch2.error(r);
                teeState.closedOrErrored = true;
            });
            return [branch1, branch2];
        };
        return ReadableStream;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ReadableStream;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhZGFibGVTdHJlYW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9SZWFkYWJsZVN0cmVhbS50cyJdLCJuYW1lcyI6WyJTdGF0ZSIsIlJlYWRhYmxlU3RyZWFtIiwiUmVhZGFibGVTdHJlYW0uY29uc3RydWN0b3IiLCJSZWFkYWJsZVN0cmVhbS5fYWxsb3dQdWxsIiwiUmVhZGFibGVTdHJlYW0uZGVzaXJlZFNpemUiLCJSZWFkYWJsZVN0cmVhbS5oYXNTb3VyY2UiLCJSZWFkYWJsZVN0cmVhbS5sb2NrZWQiLCJSZWFkYWJsZVN0cmVhbS5yZWFkYWJsZSIsIlJlYWRhYmxlU3RyZWFtLnN0YXJ0ZWQiLCJSZWFkYWJsZVN0cmVhbS5xdWV1ZVNpemUiLCJSZWFkYWJsZVN0cmVhbS5fY2FuY2VsIiwiUmVhZGFibGVTdHJlYW0uX3Nob3VsZEFwcGx5QmFja1ByZXNzdXJlIiwiUmVhZGFibGVTdHJlYW0uY2FuY2VsIiwiUmVhZGFibGVTdHJlYW0uY2xvc2UiLCJSZWFkYWJsZVN0cmVhbS5lbnF1ZXVlIiwiUmVhZGFibGVTdHJlYW0uZXJyb3IiLCJSZWFkYWJsZVN0cmVhbS5nZXRSZWFkZXIiLCJSZWFkYWJsZVN0cmVhbS5waXBlVGhyb3VnaCIsIlJlYWRhYmxlU3RyZWFtLnBpcGVUbyIsIlJlYWRhYmxlU3RyZWFtLnBpcGVUby5kb1BpcGUiLCJSZWFkYWJsZVN0cmVhbS5waXBlVG8uY2FuY2VsU291cmNlIiwiUmVhZGFibGVTdHJlYW0ucGlwZVRvLmNsb3NlRGVzdCIsIlJlYWRhYmxlU3RyZWFtLnB1bGwiLCJSZWFkYWJsZVN0cmVhbS5yZXF1ZXN0Q2xvc2UiLCJSZWFkYWJsZVN0cmVhbS50ZWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQ0Esd0JBQW9CLFlBQVksQ0FBQyxDQUFBO0lBQ2pDLHlDQUFxQyw0QkFBNEIsQ0FBQyxDQUFBO0lBQ2xFLHFDQUFpQyx3QkFBd0IsQ0FBQyxDQUFBO0lBQzFELDBCQUFzQixhQUFhLENB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QSxvQkFBb0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hDQSxJQUFNQSxPQUFPQSxHQUFHQSxvQkFBb0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hDQSxJQUFNQSxpQkFBaUJBLEdBQTBCQTtnQkFDaERBLElBQUlBLEVBQUVBLElBQUlBO2dCQUNWQSxNQUFNQSxFQUFFQSxPQUFPQTthQUNmQSxDQUFDQTtZQUNGQSxPQUFPQSxHQUFHQSxJQUFJQSxjQUFjQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBO1lBRWhEQSxJQUFNQSxpQkFBaUJBLEdBQTBCQTtnQkFDaERBLElBQUlBLEVBQUVBLElBQUlBO2dCQUNWQSxNQUFNQSxFQUFFQSxPQUFPQTthQUNmQSxDQUFDQTtZQUNGQSxPQUFPQSxHQUFHQSxJQUFJQSxjQUFjQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBO1lBRWhEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxVQUFVQSxDQUFNQTtnQkFDbkMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLE1BQU0sQ0FBQztnQkFDUixDQUFDO2dCQUVELE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLFFBQVEsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQ2pDLENBQUMsQ0FBQ0EsQ0FBQ0E7WUFFSEEsTUFBTUEsQ0FBQ0EsQ0FBRUEsT0FBT0EsRUFBRUEsT0FBT0EsQ0FBRUEsQ0FBQ0E7UUFDN0JBLENBQUNBO1FBQ0Z2QixxQkFBQ0E7SUFBREEsQ0FBQ0EsQUE5WkQsSUE4WkM7SUE5WkQ7b0NBOFpDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdHJhdGVneSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICcuLi9Qcm9taXNlJztcbmltcG9ydCBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIgZnJvbSAnLi9SZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXInO1xuaW1wb3J0IFJlYWRhYmxlU3RyZWFtUmVhZGVyIGZyb20gJy4vUmVhZGFibGVTdHJlYW1SZWFkZXInO1xuaW1wb3J0IFNpemVRdWV1ZSBmcm9tICcuL1NpemVRdWV1ZSc7XG5pbXBvcnQgVHJhbnNmb3JtU3RyZWFtIGZyb20gJy4vVHJhbnNmb3JtU3RyZWFtJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJztcbmltcG9ydCBXcml0YWJsZVN0cmVhbSwgeyBTdGF0ZSBhcyBXcml0ZWFibGVTdGF0ZSB9IGZyb20gJy4vV3JpdGFibGVTdHJlYW0nO1xuXG4vKipcbiAqIE9wdGlvbnMgdXNlZCB3aGVuIHBpcGluZyBhIHJlYWRhYmxlIHN0cmVhbSB0byBhIHdyaXRhYmxlIHN0cmVhbS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQaXBlT3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBQcmV2ZW50cyB0aGUgd3JpdGFibGUgc3RyZWFtIGZyb20gZXJyb3JpbmcgaWYgdGhlIHJlYWRhYmxlIHN0cmVhbSBlbmNvdW50ZXJzIGFuIGVycm9yLlxuXHQgKi9cblx0cHJldmVudEFib3J0PzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogIFByZXZlbnRzIHRoZSByZWFkYWJsZSBzdHJlYW0gZnJvbSBlcnJvcmluZyBpZiB0aGUgd3JpdGFibGUgc3RyZWFtIGVuY291bnRlcnMgYW4gZXJyb3IuXG5cdCAqL1xuXHRwcmV2ZW50Q2FuY2VsPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogUHJldmVudHMgdGhlIHdyaXRhYmxlIHN0cmVhbSBmcm9tIGNsb3Npbmcgd2hlbiB0aGUgcGlwZSBvcGVyYXRpb24gY29tcGxldGVzLlxuXHQgKi9cblx0cHJldmVudENsb3NlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBUaGUgU291cmNlIGludGVyZmFjZSBkZWZpbmVzIHRoZSBtZXRob2RzIGEgbW9kdWxlIGNhbiBpbXBsZW1lbnQgdG8gY3JlYXRlIGEgc291cmNlIGZvciBhIHtAbGluayBSZWFkYWJsZVN0cmVhbX0uXG4gKlxuICogVGhlIFN0cmVhbSBBUEkgcHJvdmlkZXMgYSBjb25zaXN0ZW50IHN0cmVhbSBBUEkgd2hpbGUge0BsaW5rIFJlYWRhYmxlU3RyZWFtLlNvdXJjZX0gYW5kIHtAbGluayBXcml0YWJsZVN0cmVhbS5TaW5rfVxuICogaW1wbGVtZW50YXRpb25zIHByb3ZpZGUgdGhlIGxvZ2ljIHRvIGNvbm5lY3QgYSBzdHJlYW0gdG8gc3BlY2lmaWMgZGF0YSBzb3VyY2VzICYgc2lua3MuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU291cmNlPFQ+IHtcblxuXHQvKipcblx0ICogVGVsbHMgdGhlIHNvdXJjZSB0byBwcmVwYXJlIGZvciBwcm92aWRpbmcgY2h1bmtzIHRvIHRoZSBzdHJlYW0uICBXaGlsZSB0aGUgc291cmNlIG1heSBlbnF1ZXVlIGNodW5rcyBhdCB0aGlzXG5cdCAqIHBvaW50LCBpdCBpcyBub3QgcmVxdWlyZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250cm9sbGVyIFRoZSBzb3VyY2UgY2FuIHVzZSB0aGUgY29udHJvbGxlciB0byBlbnF1ZXVlIGNodW5rcywgY2xvc2UgdGhlIHN0cmVhbSBvciByZXBvcnQgYW4gZXJyb3IuXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHNvdXJjZSdzIHN0YXJ0IG9wZXJhdGlvbiBoYXMgZmluaXNoZWQuICBJZiB0aGUgcHJvbWlzZSByZWplY3RzLFxuXHQgKiBcdFx0dGhlIHN0cmVhbSB3aWxsIGJlIGVycm9yZWQuXG5cdCAqL1xuXHRzdGFydD8oY29udHJvbGxlcjogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyPFQ+KTogUHJvbWlzZTx2b2lkPjtcblxuXHQvKipcblx0ICogUmVxdWVzdHMgdGhhdCBzb3VyY2UgZW5xdWV1ZSBjaHVua3MuICBVc2UgdGhlIGNvbnRyb2xsZXIgdG8gY2xvc2UgdGhlIHN0cmVhbSB3aGVuIG5vIG1vcmUgY2h1bmtzIGNhblxuXHQgKiBiZSBwcm92aWRlZC5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRyb2xsZXIgVGhlIHNvdXJjZSBjYW4gdXNlIHRoZSBjb250cm9sbGVyIHRvIGVucXVldWUgY2h1bmtzLCBjbG9zZSB0aGUgc3RyZWFtIG9yIHJlcG9ydCBhbiBlcnJvci5cblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgc291cmNlJ3MgcHVsbCBvcGVyYXRpb24gaGFzIGZpbmlzaGVkLiAgSWYgdGhlIHByb21pc2UgcmVqZWN0cyxcblx0ICogXHRcdHRoZSBzdHJlYW0gd2lsbCBiZSBlcnJvcmVkLlxuXHQgKi9cblx0cHVsbD8oY29udHJvbGxlcjogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyPFQ+KTogUHJvbWlzZTx2b2lkPjtcblxuXHQvKipcblx0ICogT3B0aW9uYWwgbWV0aG9kIGltcGxlbWVudGVkIGJ5IHNlZWthYmxlIHNvdXJjZXMgdG8gc2V0IHRoZSBzZWVrIHBvc2l0aW9uLiBVc2UgdGhlIGNvbnRyb2xsZXIgdG8gcmVwb3J0IGFuIGVycm9yLlxuXHQgKiBAcGFyYW0gY29udHJvbGxlciBUaGUgc291cmNlIGNhbiB1c2UgdGhlIGNvbnRyb2xsZXIgdG8gcmVwb3J0IGFuIGVycm9yLlxuXHQgKiBAcGFyYW0gcG9zaXRpb24gVGhlIHBvc2l0aW9uIGluIHRoZSBzdHJlYW0gdG8gc2VlayB0by5cblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIG5ldyBzZWVrIHBvc2l0aW9uIHdoZW4gdGhlIHNvdXJjZSdzIHNlZWsgb3BlcmF0aW9uIGhhcyBmaW5pc2hlZC4gIElmIHRoZVxuXHQgKiAgXHRwcm9taXNlIHJlamVjdHMsIHRoZSBzdHJlYW0gd2lsbCBiZSBlcnJvcmVkLlxuXHQgKi9cblx0c2Vlaz8oY29udHJvbGxlcjogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyPFQ+LCBwb3NpdGlvbjogbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+O1xuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgdGhlIHN0cmVhbSBpcyBwcmVtYXR1cmVseSBjbG9zaW5nIGFuZCBhbGxvd3MgdGhlIHNvdXJjZSB0byBkbyBhbnkgbmVjZXNzYXJ5IGNsZWFuIHVwLlxuXHQgKlxuXHQgKiBAcGFyYW0gcmVhc29uIFRoZSByZWFzb24gd2h5IHRoZSBzdHJlYW0gaXMgY2xvc2luZy5cblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgc291cmNlJ3MgcHVsbCBvcGVyYXRpb24gaGFzIGZpbmlzaGVkLiAgSWYgdGhlIHByb21pc2UgcmVqZWN0cyxcblx0ICogXHRcdHRoZSBzdHJlYW0gd2lsbCBiZSBlcnJvcmVkLlxuXHQgKi9cblx0Y2FuY2VsPyhyZWFzb24/OiBhbnkpOiBQcm9taXNlPHZvaWQ+O1xufVxuXG4vKipcbiAqIGBSZWFkYWJsZVN0cmVhbWAncyBwb3NzaWJsZSBzdGF0ZXNcbiAqL1xuZXhwb3J0IGVudW0gU3RhdGUgeyBSZWFkYWJsZSwgQ2xvc2VkLCBFcnJvcmVkIH1cblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBhIHJlYWRhYmxlIHN0cmVhbS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhZGFibGVTdHJlYW08VD4ge1xuXG5cdC8vIFNob3VsZFJlYWRhYmxlU3RyZWFtUHVsbFxuXHRwcm90ZWN0ZWQgZ2V0IF9hbGxvd1B1bGwoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuICF0aGlzLnB1bGxTY2hlZHVsZWQgJiZcblx0XHRcdCF0aGlzLmNsb3NlUmVxdWVzdGVkICYmXG5cdFx0XHR0aGlzLl9zdGFydGVkICYmXG5cdFx0XHR0aGlzLnN0YXRlICE9PSBTdGF0ZS5DbG9zZWQgJiZcblx0XHRcdHRoaXMuc3RhdGUgIT09IFN0YXRlLkVycm9yZWQgJiZcblx0XHRcdCF0aGlzLl9zaG91bGRBcHBseUJhY2tQcmVzc3VyZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBudW1iZXIgaW5kaWNhdGluZyBob3cgbXVjaCBhZGRpdGlvbmFsIGRhdGEgY2FuIGJlIHB1c2hlZCBieSB0aGUgc291cmNlIHRvIHRoZSBzdHJlYW0ncyBxdWV1ZSBiZWZvcmUgaXRcblx0ICogZXhjZWVkcyBpdHMgYGhpZ2hXYXRlck1hcmtgLiBBbiB1bmRlcmx5aW5nIHNvdXJjZSBzaG91bGQgdXNlIHRoaXMgaW5mb3JtYXRpb24gdG8gZGV0ZXJtaW5lIHdoZW4gYW5kIGhvdyB0byBhcHBseVxuXHQgKiBiYWNrcHJlc3N1cmUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBzdHJlYW0ncyBzdHJhdGVneSdzIGBoaWdoV2F0ZXJNYXJrYCB2YWx1ZSBtaW51cyB0aGUgcXVldWUgc2l6ZVxuXHQgKi9cblx0Ly8gMy41LjcuIEdldFJlYWRhYmxlU3RyZWFtRGVzaXJlZFNpemUgKCBzdHJlYW0gKVxuXHRnZXQgZGVzaXJlZFNpemUoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fc3RyYXRlZ3kuaGlnaFdhdGVyTWFyayAtIHRoaXMucXVldWVTaXplO1xuXHR9XG5cblx0Z2V0IGhhc1NvdXJjZSgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fdW5kZXJseWluZ1NvdXJjZSAhPSBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgc3RyZWFtIGNhbiBvbmx5IGhhdmUgb25lIHJlYWRlciBhdCBhIHRpbWUuIFRoaXMgdmFsdWUgaW5kaWNhdGVzIGlmIGEgc3RyZWFtIGFscmVhZHkgaGFzIGEgcmVhZGVyLCBhbmQgaGVuY2Vcblx0ICogY2Fubm90IGJlIHJlYWQgZnJvbSBvdGhlciB0aGFuIGJ5IHRoYXQgcmVhZGVyLiBXaGVuIGEgY29uc3VtZXIgaXMgZG9uZSB3aXRoIGEgcmVhZGVyIHRoZXkgY2FuIGRpc3NvY2lhdGUgaXRcblx0ICogYnkgY2FsbGluZyB7QGxpbmsgUmVhZGFibGVTdHJlYW1SZWFkZXIjcmVsZWFzZUxvY2t9LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBzdHJlYW0gaGFzIGEgcmVhZGVyIGFzc29jaWF0ZWQgd2l0aCBpdFxuXHQgKi9cblx0Ly8gSXNSZWFkYWJsZVN0cmVhbUxvY2tlZFxuXHRnZXQgbG9ja2VkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmhhc1NvdXJjZSAmJiAhIXRoaXMucmVhZGVyO1xuXHR9XG5cblx0Z2V0IHJlYWRhYmxlKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmhhc1NvdXJjZSAmJiB0aGlzLnN0YXRlID09PSBTdGF0ZS5SZWFkYWJsZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIHByb21pc2Ugd2lsbCByZXNvbHZlIHdoZW4gdGhlIHN0cmVhbSdzIHVuZGVybHlpbmcgc291cmNlIGhhcyBzdGFydGVkIGFuZCBpcyByZWFkeSB0byBwcm92aWRlIGRhdGEuIElmXG5cdCAqIHRoZSB7QGxpbmsgUmVhZGFibGVTdHJlYW1SZWFkZXIjcmVhZH0gbWV0aG9kIGlzIGNhbGxlZCBiZWZvcmUgdGhlIHN0cmVhbSBoYXMgc3RhcnRlZCBpdCB3aWxsIG5vdCBkbyBhbnl0aGluZy5cblx0ICogV2FpdCBmb3IgdGhpcyBwcm9taXNlIHRvIHJlc29sdmUgdG8gZW5zdXJlIHRoYXQgeW91ciBgcmVhZGAgY2FsbHMgYXJlIHJlc3BvbmRlZCB0byBhcyBwcm9tcHRseSBhcyBwb3NzaWJsZS5cblx0ICpcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgc3RyZWFtIGlzIHJlYWR5IHRvIGJlIHJlYWQgZnJvbS5cblx0ICovXG5cdGdldCBzdGFydGVkKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLl9zdGFydGVkUHJvbWlzZTtcblx0fVxuXG5cdGdldCBxdWV1ZVNpemUoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5xdWV1ZS50b3RhbFNpemU7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3B1bGxpbmdQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXHRwcm90ZWN0ZWQgX3N0YXJ0ZWQ6IGJvb2xlYW47XG5cdHByb3RlY3RlZCBfc3RhcnRlZFByb21pc2U6IFByb21pc2U8dm9pZD47XG5cdHByb3RlY3RlZCBfc3RyYXRlZ3k6IFN0cmF0ZWd5PFQ+O1xuXHRwcm90ZWN0ZWQgX3VuZGVybHlpbmdTb3VyY2U6IFNvdXJjZTxUPjtcblxuXHRjbG9zZVJlcXVlc3RlZDogYm9vbGVhbiA9IGZhbHNlO1xuXHRjb250cm9sbGVyOiBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXI8VD47XG5cdHB1bGxTY2hlZHVsZWQ6IGJvb2xlYW47XG5cdHF1ZXVlOiBTaXplUXVldWU8VD47XG5cdHJlYWRlcjogUmVhZGFibGVTdHJlYW1SZWFkZXI8VD47XG5cdHN0YXRlOiBTdGF0ZTtcblx0c3RvcmVkRXJyb3I6IEVycm9yO1xuXG5cdC8qKlxuXHQgKiBBIGBSZWFkYWJsZVN0cmVhbWAgcmVxdWlyZXMgYW4gdW5kZXJseWluZyBzb3VyY2UgdG8gc3VwcGx5IGRhdGEuIFRoZSBzb3VyY2UgaW50ZXJhY3RzIHdpdGggdGhlIHN0cmVhbSB0aHJvdWdoXG5cdCAqIGEge0BsaW5rIFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlcn0gdGhhdCBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIHN0cmVhbSwgYW5kIHByb3ZpZGVkIHRvIHRoZSBzb3VyY2UuXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0gdW5kZXJseWluZ1NvdXJjZSBUaGUgc291cmNlIG9iamVjdCB0aGF0IHN1cHBsaWVzIGRhdGEgdG8gdGhlIHN0cmVhbSBieSBpbnRlcmFjdGluZyB3aXRoIGl0cyBjb250cm9sbGVyLlxuXHQgKiBAcGFyYW0gc3RyYXRlZ3kgVGhlIHN0cmF0ZWd5IGZvciB0aGlzIHN0cmVhbS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKHVuZGVybHlpbmdTb3VyY2U6IFNvdXJjZTxUPiwgc3RyYXRlZ3k6IFN0cmF0ZWd5PFQ+ID0ge30pIHtcblx0XHRpZiAoIXVuZGVybHlpbmdTb3VyY2UpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignQW4gUmVhZGFibGVTdHJlYW0gU291cmNlIG11c3QgYmUgcHJvdmlkZWQuJyk7XG5cdFx0fVxuXHRcdHRoaXMuc3RhdGUgPSBTdGF0ZS5SZWFkYWJsZTtcblx0XHR0aGlzLl91bmRlcmx5aW5nU291cmNlID0gdW5kZXJseWluZ1NvdXJjZTtcblx0XHR0aGlzLmNvbnRyb2xsZXIgPSBuZXcgUmVhZGFibGVTdHJlYW1Db250cm9sbGVyKHRoaXMpO1xuXHRcdHRoaXMuX3N0cmF0ZWd5ID0gdXRpbC5ub3JtYWxpemVTdHJhdGVneShzdHJhdGVneSk7XG5cdFx0dGhpcy5xdWV1ZSA9IG5ldyBTaXplUXVldWU8VD4oKTtcblx0XHR0aGlzLl9zdGFydGVkUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlU3RhcnRlZCkgPT4ge1xuXHRcdFx0Y29uc3Qgc3RhcnRSZXN1bHQgPSB1dGlsLmludm9rZU9yTm9vcCh0aGlzLl91bmRlcmx5aW5nU291cmNlLCAnc3RhcnQnLCBbIHRoaXMuY29udHJvbGxlciBdKTtcblx0XHRcdFByb21pc2UucmVzb2x2ZShzdGFydFJlc3VsdCkudGhlbigoKSA9PiB7XG5cdFx0XHRcdHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuXHRcdFx0XHRyZXNvbHZlU3RhcnRlZCgpO1xuXHRcdFx0XHR0aGlzLnB1bGwoKTtcblx0XHRcdH0sIChlcnJvcjogRXJyb3IpID0+IHtcblx0XHRcdFx0dGhpcy5lcnJvcihlcnJvcik7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdHByb3RlY3RlZCBfY2FuY2VsKHJlYXNvbj86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIDMuMi40LjEtMzogcmV0dXJuIGNhbmNlbFJlYWRhYmxlU3RyZWFtKHRoaXMsIHJlYXNvbik7XG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLkNsb3NlZCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnN0YXRlID09PSBTdGF0ZS5FcnJvcmVkKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignMy41LjMtMjogU3RhdGUgaXMgZXJyb3JlZCcpKTtcblx0XHR9XG5cblx0XHR0aGlzLnF1ZXVlLmVtcHR5KCk7XG5cdFx0dGhpcy5jbG9zZSgpO1xuXHRcdHJldHVybiB1dGlsLnByb21pc2VJbnZva2VPck5vb3AodGhpcy5fdW5kZXJseWluZ1NvdXJjZSwgJ2NhbmNlbCcsIFsgcmVhc29uIF0pLnRoZW4oZnVuY3Rpb24gKCkge30pO1xuXHR9XG5cblx0Ly8gc2hvdWxkUmVhZGFibGVTdHJlYW1BcHBseUJhY2tQcmVzc3VyZVxuXHRwcm90ZWN0ZWQgX3Nob3VsZEFwcGx5QmFja1ByZXNzdXJlKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IHF1ZXVlU2l6ZSA9IHRoaXMucXVldWUudG90YWxTaXplO1xuXG5cdFx0cmV0dXJuIHF1ZXVlU2l6ZSA+IHRoaXMuX3N0cmF0ZWd5LmhpZ2hXYXRlck1hcms7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIHJlYXNvbiBBIGRlc2NyaXB0aW9uIG9mIHRoZSByZWFzb24gdGhlIHN0cmVhbSBpcyBiZWluZyBjYW5jZWxlZC5cblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgc3RyZWFtIGhhcyBjbG9zZWQgYW5kIHRoZSBjYWxsIHRvIHRoZSB1bmRlcmx5aW5nIHNvdXJjZSdzIGBjYW5jZWxgXG5cdCAqIG1ldGhvZCBoYXMgY29tcGxldGVkLlxuXHQgKi9cblx0Y2FuY2VsKHJlYXNvbj86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmICghdGhpcy5oYXNTb3VyY2UpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCczLjIuNC4xLTE6IE11c3QgYmUgYSBSZWFkYWJsZVN0cmVhbScpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fY2FuY2VsKHJlYXNvbik7XG5cdH1cblxuXHQvKipcblx0ICogQ2xvc2VzIHRoZSBzdHJlYW0gd2l0aG91dCByZWdhcmQgdG8gdGhlIHN0YXR1cyBvZiB0aGUgcXVldWUuICBVc2Uge0BsaW5rIHJlcXVlc3RDbG9zZX0gdG8gY2xvc2UgdGhlXG5cdCAqIHN0cmVhbSBhbmQgYWxsb3cgdGhlIHF1ZXVlIHRvIGZsdXNoLlxuXHQgKlxuXHQgKi9cblx0Ly8gMy41LjQuIEZpbmlzaENsb3NpbmdSZWFkYWJsZVN0cmVhbSAoIHN0cmVhbSApXG5cdGNsb3NlKCk6IHZvaWQge1xuXHRcdGlmICh0aGlzLnN0YXRlICE9PSBTdGF0ZS5SZWFkYWJsZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuc3RhdGUgPSBTdGF0ZS5DbG9zZWQ7XG5cblx0XHRpZiAodGhpcy5sb2NrZWQpIHtcblx0XHRcdHRoaXMucmVhZGVyLnJlbGVhc2UoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBFbnF1ZXVlSW5SZWFkYWJsZVN0cmVhbVxuXHRlbnF1ZXVlKGNodW5rOiBUKTogdm9pZCB7XG5cdFx0Y29uc3Qgc2l6ZSA9IHRoaXMuX3N0cmF0ZWd5LnNpemU7XG5cblx0XHRpZiAoIXRoaXMucmVhZGFibGUgfHwgdGhpcy5jbG9zZVJlcXVlc3RlZCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCczLjUuNi0xLDI6IFN0cmVhbS5fc3RhdGUgc2hvdWxkIGJlIFJlYWRhYmxlIGFuZCBzdHJlYW0uY2xvc2VSZXF1ZXN0ZWQgc2hvdWxkIGJlIHRydWUnKTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMubG9ja2VkIHx8ICF0aGlzLnJlYWRlci5yZXNvbHZlUmVhZFJlcXVlc3QoY2h1bmspKSB7XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGxldCBjaHVua1NpemUgPSAxO1xuXHRcdFx0XHRpZiAoc2l6ZSkge1xuXHRcdFx0XHRcdGNodW5rU2l6ZSA9IHNpemUoY2h1bmspO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMucXVldWUuZW5xdWV1ZShjaHVuaywgY2h1bmtTaXplKTtcblx0XHRcdH1cblx0XHRcdGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHR0aGlzLmVycm9yKGVycm9yKTtcblx0XHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5wdWxsKCk7XG5cdH1cblxuXHRlcnJvcihlcnJvcjogRXJyb3IpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5zdGF0ZSAhPT0gU3RhdGUuUmVhZGFibGUpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignMy41LjctMTogU3RhdGUgbXVzdCBiZSBSZWFkYWJsZScpO1xuXHRcdH1cblxuXHRcdHRoaXMucXVldWUuZW1wdHkoKTtcblx0XHR0aGlzLnN0b3JlZEVycm9yID0gZXJyb3I7XG5cdFx0dGhpcy5zdGF0ZSA9IFN0YXRlLkVycm9yZWQ7XG5cblx0XHRpZiAodGhpcy5sb2NrZWQpIHtcblx0XHRcdHRoaXMucmVhZGVyLnJlbGVhc2UoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogY3JlYXRlIGEgbmV3IHtAbGluayBSZWFkYWJsZVN0cmVhbVJlYWRlcn0gYW5kIGxvY2sgdGhlIHN0cmVhbSB0byB0aGUgbmV3IHJlYWRlclxuXHQgKi9cblx0Ly8gQWNxdWlyZVJlYWRhYmxlU3RyZWFtUmVhZGVyXG5cdGdldFJlYWRlcigpOiBSZWFkYWJsZVN0cmVhbVJlYWRlcjxUPiB7XG5cdFx0aWYgKCF0aGlzLnJlYWRhYmxlKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCczLjIuNC4yLTE6IG11c3QgYmUgYSBSZWFkYWJsZVN0cmVhbSBpbnN0YW5jZScpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgUmVhZGFibGVTdHJlYW1SZWFkZXIodGhpcyk7XG5cdH1cblxuXHRwaXBlVGhyb3VnaCh0cmFuc2Zvcm1TdHJlYW06IFRyYW5zZm9ybVN0cmVhbTxULCBhbnk+LCBvcHRpb25zPzogUGlwZU9wdGlvbnMpOiBSZWFkYWJsZVN0cmVhbTxUPiB7XG5cdFx0dGhpcy5waXBlVG8odHJhbnNmb3JtU3RyZWFtLndyaXRhYmxlLCBvcHRpb25zKTtcblx0XHRyZXR1cm4gdHJhbnNmb3JtU3RyZWFtLnJlYWRhYmxlO1xuXHR9XG5cblx0cGlwZVRvKGRlc3Q6IFdyaXRhYmxlU3RyZWFtPFQ+LCBvcHRpb25zOiBQaXBlT3B0aW9ucyA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0bGV0IHJlc29sdmVQaXBlVG9Qcm9taXNlOiAoKSA9PiB2b2lkO1xuXHRcdGxldCByZWplY3RQaXBlVG9Qcm9taXNlOiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkO1xuXHRcdGxldCBjbG9zZWRQdXJwb3NlZnVsbHkgPSBmYWxzZTtcblx0XHRsZXQgbGFzdFJlYWQ6IGFueTtcblx0XHRsZXQgcmVhZGVyOiBSZWFkYWJsZVN0cmVhbVJlYWRlcjxUPjtcblxuXHRcdGZ1bmN0aW9uIGRvUGlwZSgpOiB2b2lkIHtcblx0XHRcdGxhc3RSZWFkID0gcmVhZGVyLnJlYWQoKTtcblx0XHRcdFByb21pc2UuYWxsKFsgbGFzdFJlYWQsIGRlc3QucmVhZHkgXSkudGhlbihmdW5jdGlvbiAoWyByZWFkUmVzdWx0IF0pIHtcblx0XHRcdFx0aWYgKHJlYWRSZXN1bHQuZG9uZSkge1xuXHRcdFx0XHRcdGNsb3NlRGVzdCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGRlc3Quc3RhdGUgPT09IFdyaXRlYWJsZVN0YXRlLldyaXRhYmxlICkge1xuXHRcdFx0XHRcdGRlc3Qud3JpdGUocmVhZFJlc3VsdC52YWx1ZSk7XG5cdFx0XHRcdFx0ZG9QaXBlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGNhbmNlbFNvdXJjZShyZWFzb246IGFueSk6IHZvaWQge1xuXHRcdFx0aWYgKCFvcHRpb25zLnByZXZlbnRDYW5jZWwpIHtcblx0XHRcdFx0cmVhZGVyLmNhbmNlbChyZWFzb24pO1xuXHRcdFx0XHRyZWplY3RQaXBlVG9Qcm9taXNlKHJlYXNvbik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0bGFzdFJlYWQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmVhZGVyLnJlbGVhc2VMb2NrKCk7XG5cdFx0XHRcdFx0cmVqZWN0UGlwZVRvUHJvbWlzZShyZWFzb24pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBjbG9zZURlc3QoKTogdm9pZCB7XG5cdFx0XHRjb25zdCBkZXN0U3RhdGUgPSBkZXN0LnN0YXRlO1xuXHRcdFx0aWYgKCFvcHRpb25zLnByZXZlbnRDbG9zZSAmJlxuXHRcdFx0XHQoZGVzdFN0YXRlID09PSBXcml0ZWFibGVTdGF0ZS5XYWl0aW5nIHx8IGRlc3RTdGF0ZSA9PT0gV3JpdGVhYmxlU3RhdGUuV3JpdGFibGUpKSB7XG5cblx0XHRcdFx0Y2xvc2VkUHVycG9zZWZ1bGx5ID0gdHJ1ZTtcblx0XHRcdFx0ZGVzdC5jbG9zZSgpLnRoZW4ocmVzb2x2ZVBpcGVUb1Byb21pc2UsIHJlamVjdFBpcGVUb1Byb21pc2UpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHJlc29sdmVQaXBlVG9Qcm9taXNlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdHJlc29sdmVQaXBlVG9Qcm9taXNlID0gcmVzb2x2ZTtcblx0XHRcdHJlamVjdFBpcGVUb1Byb21pc2UgPSByZWplY3Q7XG5cblx0XHRcdHJlYWRlciA9IHRoaXMuZ2V0UmVhZGVyKCk7XG5cdFx0XHRyZWFkZXIuY2xvc2VkLmNhdGNoKChyZWFzb246IGFueSkgPT4ge1xuXHRcdFx0XHQvLyBhYm9ydERlc3Rcblx0XHRcdFx0aWYgKCFvcHRpb25zLnByZXZlbnRBYm9ydCkge1xuXHRcdFx0XHRcdGRlc3QuYWJvcnQocmVhc29uKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZWplY3RQaXBlVG9Qcm9taXNlKHJlYXNvbik7XG5cdFx0XHR9KTtcblxuXHRcdFx0ZGVzdC5jbG9zZWQudGhlbihcblx0XHRcdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGlmICghY2xvc2VkUHVycG9zZWZ1bGx5KSB7XG5cdFx0XHRcdFx0XHRjYW5jZWxTb3VyY2UobmV3IFR5cGVFcnJvcignZGVzdGluYXRpb24gaXMgY2xvc2luZyBvciBjbG9zZWQgYW5kIGNhbm5vdCBiZSBwaXBlZCB0byBhbnltb3JlJykpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0Y2FuY2VsU291cmNlXG5cdFx0XHQpO1xuXHRcdFx0ZG9QaXBlKCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBSZXF1ZXN0UmVhZGFibGVTdHJlYW1QdWxsXG5cdHB1bGwoKTogdm9pZCB7XG5cdFx0aWYgKCF0aGlzLl9hbGxvd1B1bGwpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fcHVsbGluZ1Byb21pc2UpIHtcblx0XHRcdHRoaXMucHVsbFNjaGVkdWxlZCA9IHRydWU7XG5cdFx0XHR0aGlzLl9wdWxsaW5nUHJvbWlzZS50aGVuKCgpID0+IHtcblx0XHRcdFx0dGhpcy5wdWxsU2NoZWR1bGVkID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMucHVsbCgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl9wdWxsaW5nUHJvbWlzZSA9IHV0aWwucHJvbWlzZUludm9rZU9yTm9vcCh0aGlzLl91bmRlcmx5aW5nU291cmNlLCAncHVsbCcsIFsgdGhpcy5jb250cm9sbGVyIF0pO1xuXHRcdHRoaXMuX3B1bGxpbmdQcm9taXNlLnRoZW4oKCkgPT4ge1xuXHRcdFx0dGhpcy5fcHVsbGluZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG5cdFx0fSwgKGVycm9yOiBFcnJvcikgPT4ge1xuXHRcdFx0dGhpcy5lcnJvcihlcnJvcik7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgdGhlIHN0cmVhbSBiZSBjbG9zZWQuICBUaGlzIG1ldGhvZCBhbGxvd3MgdGhlIHF1ZXVlIHRvIGJlIGVtcHRpZWQgYmVmb3JlIHRoZSBzdHJlYW0gY2xvc2VzLlxuXHQgKlxuXHQgKi9cblx0Ly8gMy41LjMuIENsb3NlUmVhZGFibGVTdHJlYW0gKCBzdHJlYW0gKVxuXHRyZXF1ZXN0Q2xvc2UoKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuY2xvc2VSZXF1ZXN0ZWQgfHwgdGhpcy5zdGF0ZSAhPT0gU3RhdGUuUmVhZGFibGUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLmNsb3NlUmVxdWVzdGVkID0gdHJ1ZTtcblxuXHRcdGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUZWUgYSByZWFkYWJsZSBzdHJlYW0sIHJldHVybmluZyBhIHR3by1lbGVtZW50IGFycmF5IGNvbnRhaW5pbmdcblx0ICogdGhlIHR3byByZXN1bHRpbmcgUmVhZGFibGVTdHJlYW0gaW5zdGFuY2VzXG5cdCAqL1xuXHQvLyBUZWVSZWFkYWJsZVN0cmVhbVxuXHR0ZWUoKTogWyBSZWFkYWJsZVN0cmVhbTxUPiwgUmVhZGFibGVTdHJlYW08VD4gXSB7XG5cdFx0aWYgKCF0aGlzLnJlYWRhYmxlKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCczLjIuNC41LTE6IG11c3QgYmUgYSBSZWFkYWJsZVNyZWFtJyk7XG5cdFx0fVxuXG5cdFx0bGV0IGJyYW5jaDE6IFJlYWRhYmxlU3RyZWFtPFQ+O1xuXHRcdGxldCBicmFuY2gyOiBSZWFkYWJsZVN0cmVhbTxUPjtcblxuXHRcdGNvbnN0IHJlYWRlciA9IHRoaXMuZ2V0UmVhZGVyKCk7XG5cdFx0Y29uc3QgdGVlU3RhdGU6IGFueSA9IHtcblx0XHRcdGNsb3NlZE9yRXJyb3JlZDogZmFsc2UsXG5cdFx0XHRjYW5jZWxlZDE6IGZhbHNlLFxuXHRcdFx0Y2FuY2VsZWQyOiBmYWxzZSxcblx0XHRcdHJlYXNvbjE6IHVuZGVmaW5lZCxcblx0XHRcdHJlYXNvbjI6IHVuZGVmaW5lZFxuXHRcdH07XG5cdFx0dGVlU3RhdGUucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0XHR0ZWVTdGF0ZS5fcmVzb2x2ZSA9IHJlc29sdmU7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBjcmVhdGVDYW5jZWxGdW5jdGlvbiA9IChicmFuY2g6IG51bWJlcikgPT4ge1xuXHRcdFx0cmV0dXJuIChyZWFzb24/OiBhbnkpOiBQcm9taXNlPHZvaWQ+ID0+IHtcblx0XHRcdFx0dGVlU3RhdGVbJ2NhbmNlbGVkJyArIGJyYW5jaF0gPSB0cnVlO1xuXHRcdFx0XHR0ZWVTdGF0ZVsncmVhc29uJyArIGJyYW5jaF0gPSByZWFzb247XG5cdFx0XHRcdGlmICh0ZWVTdGF0ZVsnY2FuY2VsZWQnICsgKGJyYW5jaCA9PT0gMSA/IDIgOiAxKV0pIHtcblx0XHRcdFx0XHRjb25zdCBjYW5jZWxSZXN1bHQgPSB0aGlzLl9jYW5jZWwoW3RlZVN0YXRlLnJlYXNvbjEsIHRlZVN0YXRlLnJlYXNvbjJdKTtcblx0XHRcdFx0XHR0ZWVTdGF0ZS5fcmVzb2x2ZShjYW5jZWxSZXN1bHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB0ZWVTdGF0ZS5wcm9taXNlO1xuXHRcdFx0fTtcblx0XHR9O1xuXG5cdFx0Y29uc3QgcHVsbCA9IGZ1bmN0aW9uIChjb250cm9sbGVyOiBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXI8VD4pIHtcblx0XHRcdHJldHVybiByZWFkZXIucmVhZCgpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdDogYW55KSB7XG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gcmVzdWx0LnZhbHVlO1xuXHRcdFx0XHRjb25zdCBkb25lID0gcmVzdWx0LmRvbmU7XG5cblx0XHRcdFx0aWYgKGRvbmUgJiYgIXRlZVN0YXRlLmNsb3NlZE9yRXJyb3JlZCkge1xuXHRcdFx0XHRcdGJyYW5jaDEucmVxdWVzdENsb3NlKCk7XG5cdFx0XHRcdFx0YnJhbmNoMi5yZXF1ZXN0Q2xvc2UoKTtcblxuXHRcdFx0XHRcdHRlZVN0YXRlLmNsb3NlZE9yRXJyb3JlZCA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodGVlU3RhdGUuY2xvc2VkT3JFcnJvcmVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCF0ZWVTdGF0ZS5jYW5jZWxlZDEpIHtcblx0XHRcdFx0XHRicmFuY2gxLmVucXVldWUodmFsdWUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCF0ZWVTdGF0ZS5jYW5jZWxlZDIpIHtcblx0XHRcdFx0XHRicmFuY2gyLmVucXVldWUodmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0Y29uc3QgY2FuY2VsMSA9IGNyZWF0ZUNhbmNlbEZ1bmN0aW9uKDEpO1xuXHRcdGNvbnN0IGNhbmNlbDIgPSBjcmVhdGVDYW5jZWxGdW5jdGlvbigyKTtcblx0XHRjb25zdCB1bmRlcmx5aW5nU291cmNlMTogU291cmNlPFQ+ID0gPFNvdXJjZTxUPj4ge1xuXHRcdFx0cHVsbDogcHVsbCxcblx0XHRcdGNhbmNlbDogY2FuY2VsMVxuXHRcdH07XG5cdFx0YnJhbmNoMSA9IG5ldyBSZWFkYWJsZVN0cmVhbSh1bmRlcmx5aW5nU291cmNlMSk7XG5cblx0XHRjb25zdCB1bmRlcmx5aW5nU291cmNlMjogU291cmNlPFQ+ID0gPFNvdXJjZTxUPj4ge1xuXHRcdFx0cHVsbDogcHVsbCxcblx0XHRcdGNhbmNlbDogY2FuY2VsMlxuXHRcdH07XG5cdFx0YnJhbmNoMiA9IG5ldyBSZWFkYWJsZVN0cmVhbSh1bmRlcmx5aW5nU291cmNlMik7XG5cblx0XHRyZWFkZXIuY2xvc2VkLmNhdGNoKGZ1bmN0aW9uIChyOiBhbnkpIHtcblx0XHRcdGlmICh0ZWVTdGF0ZS5jbG9zZWRPckVycm9yZWQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRicmFuY2gxLmVycm9yKHIpO1xuXHRcdFx0YnJhbmNoMi5lcnJvcihyKTtcblx0XHRcdHRlZVN0YXRlLmNsb3NlZE9yRXJyb3JlZCA9IHRydWU7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gWyBicmFuY2gxLCBicmFuY2gyIF07XG5cdH1cbn1cbiJdfQ==