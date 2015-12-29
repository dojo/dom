(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './has'], factory);
    }
})(function (require, exports) {
    var has_1 = require('./has');
    var slice = Array.prototype.slice;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function isObject(item) {
        return Object.prototype.toString.call(item) === '[object Object]';
    }
    function copyArray(array, inherited) {
        return array.map(function (item) {
            if (Array.isArray(item)) {
                return copyArray(item, inherited);
            }
            return !isObject(item) ?
                item :
                _mixin({
                    deep: true,
                    inherited: inherited,
                    sources: [item],
                    target: {}
                });
        });
    }
    function _mixin(kwArgs) {
        var deep = kwArgs.deep;
        var inherited = kwArgs.inherited;
        var target = kwArgs.target;
        for (var _i = 0, _a = kwArgs.sources; _i < _a.length; _i++) {
            var source = _a[_i];
            for (var key in source) {
                if (inherited || hasOwnProperty.call(source, key)) {
                    var value = source[key];
                    if (deep) {
                        if (Array.isArray(value)) {
                            value = copyArray(value, inherited);
                        }
                        else if (isObject(value)) {
                            value = _mixin({
                                deep: true,
                                inherited: inherited,
                                sources: [value],
                                target: {}
                            });
                        }
                    }
                    target[key] = value;
                }
            }
        }
        return target;
    }
    /**
     * Copies the values of all enumerable own properties of one or more source objects to the target object.
     *
     * @param target The target object to receive values from source objects
     * @param sources Any number of objects whose enumerable own properties will be copied to the target object
     * @return The modified target object
     */
    exports.assign = has_1.default('object-assign') ?
        Object.assign :
        function (target) {
            var sources = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                sources[_i - 1] = arguments[_i];
            }
            return _mixin({
                deep: false,
                inherited: false,
                sources: sources,
                target: target
            });
        };
    /**
     * Creates a new object from the given prototype, and copies all enumerable own properties of one or more
     * source objects to the newly created target object.
     *
     * @param prototype The prototype to create a new object from
     * @param mixins Any number of objects whose enumerable own properties will be copied to the created object
     * @return The new object
     */
    function create(prototype) {
        var mixins = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            mixins[_i - 1] = arguments[_i];
        }
        if (!mixins.length) {
            throw new RangeError('lang.create requires at least one mixin object.');
        }
        var args = mixins.slice();
        args.unshift(Object.create(prototype));
        return exports.assign.apply(null, args);
    }
    exports.create = create;
    /**
     * Copies the values of all enumerable own properties of one or more source objects to the target object,
     * recursively copying all nested objects and arrays as well.
     *
     * @param target The target object to receive values from source objects
     * @param sources Any number of objects whose enumerable own properties will be copied to the target object
     * @return The modified target object
     */
    function deepAssign(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        return _mixin({
            deep: true,
            inherited: false,
            sources: sources,
            target: target
        });
    }
    exports.deepAssign = deepAssign;
    /**
     * Copies the values of all enumerable (own or inherited) properties of one or more source objects to the
     * target object, recursively copying all nested objects and arrays as well.
     *
     * @param target The target object to receive values from source objects
     * @param sources Any number of objects whose enumerable properties will be copied to the target object
     * @return The modified target object
     */
    function deepMixin(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        return _mixin({
            deep: true,
            inherited: true,
            sources: sources,
            target: target
        });
    }
    exports.deepMixin = deepMixin;
    /**
     * Creates a new object using the provided source's prototype as the prototype for the new object, and then
     * deep copies the provided source's values  into the new target.
     *
     * @param source The object to duplicate
     * @return The new object
     */
    function duplicate(source) {
        var target = Object.create(Object.getPrototypeOf(source));
        return deepMixin(target, source);
    }
    exports.duplicate = duplicate;
    /**
     * Determines whether two values are the same value.
     *
     * @param a First value to compare
     * @param b Second value to compare
     * @return true if the values are the same; false otherwise
     */
    function isIdentical(a, b) {
        return a === b ||
            /* both values are NaN */
            (a !== a && b !== b);
    }
    exports.isIdentical = isIdentical;
    /**
     * Returns a function that binds a method to the specified object at runtime. This is similar to
     * `Function.prototype.bind`, but instead of a function it takes the name of a method on an object.
     * As a result, the function returned by `lateBind` will always call the function currently assigned to
     * the specified property on the object as of the moment the function it returns is called.
     *
     * @param instance The context object
     * @param method The name of the method on the context object to bind to itself
     * @param suppliedArgs An optional array of values to prepend to the `instance[method]` arguments list
     * @return The bound function
     */
    function lateBind(instance, method) {
        var suppliedArgs = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            suppliedArgs[_i - 2] = arguments[_i];
        }
        return suppliedArgs.length ?
            function () {
                var args = arguments.length ? suppliedArgs.concat(slice.call(arguments)) : suppliedArgs;
                // TS7017
                return instance[method].apply(instance, args);
            } :
            function () {
                // TS7017
                return instance[method].apply(instance, arguments);
            };
    }
    exports.lateBind = lateBind;
    /**
     * Copies the values of all enumerable (own or inherited) properties of one or more source objects to the
     * target object.
     *
     * @return The modified target object
     */
    function mixin(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        return _mixin({
            deep: false,
            inherited: true,
            sources: sources,
            target: target
        });
    }
    exports.mixin = mixin;
    /**
     * Returns a function which invokes the given function with the given arguments prepended to its argument list.
     * Like `Function.prototype.bind`, but does not alter execution context.
     *
     * @param targetFunction The function that needs to be bound
     * @param suppliedArgs An optional array of arguments to prepend to the `targetFunction` arguments list
     * @return The bound function
     */
    function partial(targetFunction) {
        var suppliedArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            suppliedArgs[_i - 1] = arguments[_i];
        }
        return function () {
            var args = arguments.length ? suppliedArgs.concat(slice.call(arguments)) : suppliedArgs;
            return targetFunction.apply(this, args);
        };
    }
    exports.partial = partial;
    /**
     * Returns an object with a destroy method that, when called, calls the passed-in destructor.
     * This is intended to provide a unified interface for creating "remove" / "destroy" handlers for
     * event listeners, timers, etc.
     *
     * @param destructor A function that will be called when the handle's `destroy` method is invoked
     * @return The handle object
     */
    function createHandle(destructor) {
        return {
            destroy: function () {
                this.destroy = function () { };
                destructor.call(this);
            }
        };
    }
    exports.createHandle = createHandle;
    /**
     * Returns a single handle that can be used to destroy multiple handles simultaneously.
     *
     * @param handles An array of handles with `destroy` methods
     * @return The handle object
     */
    function createCompositeHandle() {
        var handles = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            handles[_i - 0] = arguments[_i];
        }
        return createHandle(function () {
            for (var _i = 0; _i < handles.length; _i++) {
                var handle = handles[_i];
                handle.destroy();
            }
        });
    }
    exports.createCompositeHandle = createCompositeHandle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9sYW5nLnRzIl0sIm5hbWVzIjpbImlzT2JqZWN0IiwiY29weUFycmF5IiwiX21peGluIiwiY3JlYXRlIiwiZGVlcEFzc2lnbiIsImRlZXBNaXhpbiIsImR1cGxpY2F0ZSIsImlzSWRlbnRpY2FsIiwibGF0ZUJpbmQiLCJtaXhpbiIsInBhcnRpYWwiLCJjcmVhdGVIYW5kbGUiLCJjcmVhdGVDb21wb3NpdGVIYW5kbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQUEsb0JBQWdCLE9BQU8sQ0FBQyxDQUFBO0lBR3hCLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO0lBQ3BDLElBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDO0lBRXZELGtCQUFrQixJQUFTO1FBQzFCQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxpQkFBaUJBLENBQUNBO0lBQ25FQSxDQUFDQTtJQUVELG1CQUFtQixLQUFZLEVBQUUsU0FBa0I7UUFDbERDLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLFVBQVVBLElBQVNBO1lBQ25DLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNuQyxDQUFDO1lBRUQsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDckIsSUFBSTtnQkFDSixNQUFNLENBQUM7b0JBQ04sSUFBSSxFQUFFLElBQUk7b0JBQ1YsU0FBUyxFQUFFLFNBQVM7b0JBQ3BCLE9BQU8sRUFBRSxDQUFFLElBQUksQ0FBRTtvQkFDakIsTUFBTSxFQUFFLEVBQUU7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T0FBTyxFQUFFLENBQUM7YUFDakI7UUFDRixDQUFDLENBQUNBLENBQUNBO0lBQ0pBLENBQUNBO0lBTmUsNkJBQXFCLHdCQU1wQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGhhcyBmcm9tICcuL2hhcyc7XG5pbXBvcnQgeyBIYW5kbGUgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5jb25zdCBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbmNvbnN0IGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuZnVuY3Rpb24gaXNPYmplY3QoaXRlbTogYW55KTogYm9vbGVhbiB7XG5cdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaXRlbSkgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xufVxuXG5mdW5jdGlvbiBjb3B5QXJyYXkoYXJyYXk6IGFueVtdLCBpbmhlcml0ZWQ6IGJvb2xlYW4pOiBhbnlbXSB7XG5cdHJldHVybiBhcnJheS5tYXAoZnVuY3Rpb24gKGl0ZW06IGFueSk6IGFueSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoaXRlbSkpIHtcblx0XHRcdHJldHVybiBjb3B5QXJyYXkoaXRlbSwgaW5oZXJpdGVkKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gIWlzT2JqZWN0KGl0ZW0pID9cblx0XHRcdGl0ZW0gOlxuXHRcdFx0X21peGluKHtcblx0XHRcdFx0ZGVlcDogdHJ1ZSxcblx0XHRcdFx0aW5oZXJpdGVkOiBpbmhlcml0ZWQsXG5cdFx0XHRcdHNvdXJjZXM6IFsgaXRlbSBdLFxuXHRcdFx0XHR0YXJnZXQ6IHt9XG5cdFx0XHR9KTtcblx0fSk7XG59XG5cbmludGVyZmFjZSBNaXhpbkFyZ3Mge1xuXHRkZWVwOiBib29sZWFuO1xuXHRpbmhlcml0ZWQ6IGJvb2xlYW47XG5cdHNvdXJjZXM6IHt9W107XG5cdHRhcmdldDoge307XG59XG5cbmZ1bmN0aW9uIF9taXhpbihrd0FyZ3M6IE1peGluQXJncyk6IHt9IHtcblx0Y29uc3QgZGVlcCA9IGt3QXJncy5kZWVwO1xuXHRjb25zdCBpbmhlcml0ZWQgPSBrd0FyZ3MuaW5oZXJpdGVkO1xuXHRjb25zdCB0YXJnZXQgPSBrd0FyZ3MudGFyZ2V0O1xuXG5cdGZvciAobGV0IHNvdXJjZSBvZiBrd0FyZ3Muc291cmNlcykge1xuXHRcdGZvciAobGV0IGtleSBpbiBzb3VyY2UpIHtcblx0XHRcdGlmIChpbmhlcml0ZWQgfHwgaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcblx0XHRcdFx0bGV0IHZhbHVlOiBhbnkgPSAoPGFueT4gc291cmNlKVtrZXldO1xuXG5cdFx0XHRcdGlmIChkZWVwKSB7XG5cdFx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZSA9IGNvcHlBcnJheSh2YWx1ZSwgaW5oZXJpdGVkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZSA9IF9taXhpbih7XG5cdFx0XHRcdFx0XHRcdGRlZXA6IHRydWUsXG5cdFx0XHRcdFx0XHRcdGluaGVyaXRlZDogaW5oZXJpdGVkLFxuXHRcdFx0XHRcdFx0XHRzb3VyY2VzOiBbIHZhbHVlIF0sXG5cdFx0XHRcdFx0XHRcdHRhcmdldDoge31cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdCg8YW55PiB0YXJnZXQpW2tleV0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdGFyZ2V0O1xufVxuXG5pbnRlcmZhY2UgT2JqZWN0QXNzaWduQ29uc3RydWN0b3IgZXh0ZW5kcyBPYmplY3RDb25zdHJ1Y3RvciB7XG5cdGFzc2lnbih0YXJnZXQ6IHt9LCAuLi5zb3VyY2VzOiB7fVtdKToge307XG59XG5cbi8qKlxuICogQ29waWVzIHRoZSB2YWx1ZXMgb2YgYWxsIGVudW1lcmFibGUgb3duIHByb3BlcnRpZXMgb2Ygb25lIG9yIG1vcmUgc291cmNlIG9iamVjdHMgdG8gdGhlIHRhcmdldCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCB0byByZWNlaXZlIHZhbHVlcyBmcm9tIHNvdXJjZSBvYmplY3RzXG4gKiBAcGFyYW0gc291cmNlcyBBbnkgbnVtYmVyIG9mIG9iamVjdHMgd2hvc2UgZW51bWVyYWJsZSBvd24gcHJvcGVydGllcyB3aWxsIGJlIGNvcGllZCB0byB0aGUgdGFyZ2V0IG9iamVjdFxuICogQHJldHVybiBUaGUgbW9kaWZpZWQgdGFyZ2V0IG9iamVjdFxuICovXG5leHBvcnQgY29uc3QgYXNzaWduID0gaGFzKCdvYmplY3QtYXNzaWduJykgP1xuXHQoPE9iamVjdEFzc2lnbkNvbnN0cnVjdG9yPiBPYmplY3QpLmFzc2lnbiA6XG5cdGZ1bmN0aW9uICh0YXJnZXQ6IHt9LCAuLi5zb3VyY2VzOiB7fVtdKToge30ge1xuXHRcdHJldHVybiBfbWl4aW4oe1xuXHRcdFx0ZGVlcDogZmFsc2UsXG5cdFx0XHRpbmhlcml0ZWQ6IGZhbHNlLFxuXHRcdFx0c291cmNlczogc291cmNlcyxcblx0XHRcdHRhcmdldDogdGFyZ2V0XG5cdFx0fSk7XG5cdH07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gcHJvdG90eXBlLCBhbmQgY29waWVzIGFsbCBlbnVtZXJhYmxlIG93biBwcm9wZXJ0aWVzIG9mIG9uZSBvciBtb3JlXG4gKiBzb3VyY2Ugb2JqZWN0cyB0byB0aGUgbmV3bHkgY3JlYXRlZCB0YXJnZXQgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSBwcm90b3R5cGUgVGhlIHByb3RvdHlwZSB0byBjcmVhdGUgYSBuZXcgb2JqZWN0IGZyb21cbiAqIEBwYXJhbSBtaXhpbnMgQW55IG51bWJlciBvZiBvYmplY3RzIHdob3NlIGVudW1lcmFibGUgb3duIHByb3BlcnRpZXMgd2lsbCBiZSBjb3BpZWQgdG8gdGhlIGNyZWF0ZWQgb2JqZWN0XG4gKiBAcmV0dXJuIFRoZSBuZXcgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUocHJvdG90eXBlOiB7fSwgLi4ubWl4aW5zOiB7fVtdKToge30ge1xuXHRpZiAoIW1peGlucy5sZW5ndGgpIHtcblx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcignbGFuZy5jcmVhdGUgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIG1peGluIG9iamVjdC4nKTtcblx0fVxuXG5cdGNvbnN0IGFyZ3MgPSBtaXhpbnMuc2xpY2UoKTtcblx0YXJncy51bnNoaWZ0KE9iamVjdC5jcmVhdGUocHJvdG90eXBlKSk7XG5cblx0cmV0dXJuIGFzc2lnbi5hcHBseShudWxsLCBhcmdzKTtcbn1cblxuLyoqXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBvZiBhbGwgZW51bWVyYWJsZSBvd24gcHJvcGVydGllcyBvZiBvbmUgb3IgbW9yZSBzb3VyY2Ugb2JqZWN0cyB0byB0aGUgdGFyZ2V0IG9iamVjdCxcbiAqIHJlY3Vyc2l2ZWx5IGNvcHlpbmcgYWxsIG5lc3RlZCBvYmplY3RzIGFuZCBhcnJheXMgYXMgd2VsbC5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IHRvIHJlY2VpdmUgdmFsdWVzIGZyb20gc291cmNlIG9iamVjdHNcbiAqIEBwYXJhbSBzb3VyY2VzIEFueSBudW1iZXIgb2Ygb2JqZWN0cyB3aG9zZSBlbnVtZXJhYmxlIG93biBwcm9wZXJ0aWVzIHdpbGwgYmUgY29waWVkIHRvIHRoZSB0YXJnZXQgb2JqZWN0XG4gKiBAcmV0dXJuIFRoZSBtb2RpZmllZCB0YXJnZXQgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWVwQXNzaWduKHRhcmdldDoge30sIC4uLnNvdXJjZXM6IHt9W10pOiB7fSB7XG5cdHJldHVybiBfbWl4aW4oe1xuXHRcdGRlZXA6IHRydWUsXG5cdFx0aW5oZXJpdGVkOiBmYWxzZSxcblx0XHRzb3VyY2VzOiBzb3VyY2VzLFxuXHRcdHRhcmdldDogdGFyZ2V0XG5cdH0pO1xufVxuXG4vKipcbiAqIENvcGllcyB0aGUgdmFsdWVzIG9mIGFsbCBlbnVtZXJhYmxlIChvd24gb3IgaW5oZXJpdGVkKSBwcm9wZXJ0aWVzIG9mIG9uZSBvciBtb3JlIHNvdXJjZSBvYmplY3RzIHRvIHRoZVxuICogdGFyZ2V0IG9iamVjdCwgcmVjdXJzaXZlbHkgY29weWluZyBhbGwgbmVzdGVkIG9iamVjdHMgYW5kIGFycmF5cyBhcyB3ZWxsLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3QgdG8gcmVjZWl2ZSB2YWx1ZXMgZnJvbSBzb3VyY2Ugb2JqZWN0c1xuICogQHBhcmFtIHNvdXJjZXMgQW55IG51bWJlciBvZiBvYmplY3RzIHdob3NlIGVudW1lcmFibGUgcHJvcGVydGllcyB3aWxsIGJlIGNvcGllZCB0byB0aGUgdGFyZ2V0IG9iamVjdFxuICogQHJldHVybiBUaGUgbW9kaWZpZWQgdGFyZ2V0IG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVlcE1peGluKHRhcmdldDoge30sIC4uLnNvdXJjZXM6IHt9W10pOiB7fSB7XG5cdHJldHVybiBfbWl4aW4oe1xuXHRcdGRlZXA6IHRydWUsXG5cdFx0aW5oZXJpdGVkOiB0cnVlLFxuXHRcdHNvdXJjZXM6IHNvdXJjZXMsXG5cdFx0dGFyZ2V0OiB0YXJnZXRcblx0fSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBvYmplY3QgdXNpbmcgdGhlIHByb3ZpZGVkIHNvdXJjZSdzIHByb3RvdHlwZSBhcyB0aGUgcHJvdG90eXBlIGZvciB0aGUgbmV3IG9iamVjdCwgYW5kIHRoZW5cbiAqIGRlZXAgY29waWVzIHRoZSBwcm92aWRlZCBzb3VyY2UncyB2YWx1ZXMgIGludG8gdGhlIG5ldyB0YXJnZXQuXG4gKlxuICogQHBhcmFtIHNvdXJjZSBUaGUgb2JqZWN0IHRvIGR1cGxpY2F0ZVxuICogQHJldHVybiBUaGUgbmV3IG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZHVwbGljYXRlKHNvdXJjZToge30pOiB7fSB7XG5cdGNvbnN0IHRhcmdldCA9IE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKHNvdXJjZSkpO1xuXG5cdHJldHVybiBkZWVwTWl4aW4odGFyZ2V0LCBzb3VyY2UpO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0d28gdmFsdWVzIGFyZSB0aGUgc2FtZSB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gYSBGaXJzdCB2YWx1ZSB0byBjb21wYXJlXG4gKiBAcGFyYW0gYiBTZWNvbmQgdmFsdWUgdG8gY29tcGFyZVxuICogQHJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZXMgYXJlIHRoZSBzYW1lOyBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSWRlbnRpY2FsKGE6IGFueSwgYjogYW55KTogYm9vbGVhbiB7XG5cdHJldHVybiBhID09PSBiIHx8XG5cdFx0LyogYm90aCB2YWx1ZXMgYXJlIE5hTiAqL1xuXHRcdChhICE9PSBhICYmIGIgIT09IGIpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGJpbmRzIGEgbWV0aG9kIHRvIHRoZSBzcGVjaWZpZWQgb2JqZWN0IGF0IHJ1bnRpbWUuIFRoaXMgaXMgc2ltaWxhciB0b1xuICogYEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kYCwgYnV0IGluc3RlYWQgb2YgYSBmdW5jdGlvbiBpdCB0YWtlcyB0aGUgbmFtZSBvZiBhIG1ldGhvZCBvbiBhbiBvYmplY3QuXG4gKiBBcyBhIHJlc3VsdCwgdGhlIGZ1bmN0aW9uIHJldHVybmVkIGJ5IGBsYXRlQmluZGAgd2lsbCBhbHdheXMgY2FsbCB0aGUgZnVuY3Rpb24gY3VycmVudGx5IGFzc2lnbmVkIHRvXG4gKiB0aGUgc3BlY2lmaWVkIHByb3BlcnR5IG9uIHRoZSBvYmplY3QgYXMgb2YgdGhlIG1vbWVudCB0aGUgZnVuY3Rpb24gaXQgcmV0dXJucyBpcyBjYWxsZWQuXG4gKlxuICogQHBhcmFtIGluc3RhbmNlIFRoZSBjb250ZXh0IG9iamVjdFxuICogQHBhcmFtIG1ldGhvZCBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIG9uIHRoZSBjb250ZXh0IG9iamVjdCB0byBiaW5kIHRvIGl0c2VsZlxuICogQHBhcmFtIHN1cHBsaWVkQXJncyBBbiBvcHRpb25hbCBhcnJheSBvZiB2YWx1ZXMgdG8gcHJlcGVuZCB0byB0aGUgYGluc3RhbmNlW21ldGhvZF1gIGFyZ3VtZW50cyBsaXN0XG4gKiBAcmV0dXJuIFRoZSBib3VuZCBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gbGF0ZUJpbmQoaW5zdGFuY2U6IHt9LCBtZXRob2Q6IHN0cmluZywgLi4uc3VwcGxpZWRBcmdzOiBhbnlbXSk6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55IHtcblx0cmV0dXJuIHN1cHBsaWVkQXJncy5sZW5ndGggP1xuXHRcdGZ1bmN0aW9uICgpIHtcblx0XHRcdGNvbnN0IGFyZ3M6IGFueVtdID0gYXJndW1lbnRzLmxlbmd0aCA/IHN1cHBsaWVkQXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSA6IHN1cHBsaWVkQXJncztcblxuXHRcdFx0Ly8gVFM3MDE3XG5cdFx0XHRyZXR1cm4gKDxhbnk+IGluc3RhbmNlKVttZXRob2RdLmFwcGx5KGluc3RhbmNlLCBhcmdzKTtcblx0XHR9IDpcblx0XHRmdW5jdGlvbiAoKSB7XG5cdFx0XHQvLyBUUzcwMTdcblx0XHRcdHJldHVybiAoPGFueT4gaW5zdGFuY2UpW21ldGhvZF0uYXBwbHkoaW5zdGFuY2UsIGFyZ3VtZW50cyk7XG5cdFx0fTtcbn1cblxuLyoqXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBvZiBhbGwgZW51bWVyYWJsZSAob3duIG9yIGluaGVyaXRlZCkgcHJvcGVydGllcyBvZiBvbmUgb3IgbW9yZSBzb3VyY2Ugb2JqZWN0cyB0byB0aGVcbiAqIHRhcmdldCBvYmplY3QuXG4gKlxuICogQHJldHVybiBUaGUgbW9kaWZpZWQgdGFyZ2V0IG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWl4aW4odGFyZ2V0OiB7fSwgLi4uc291cmNlczoge31bXSk6IHt9IHtcblx0cmV0dXJuIF9taXhpbih7XG5cdFx0ZGVlcDogZmFsc2UsXG5cdFx0aW5oZXJpdGVkOiB0cnVlLFxuXHRcdHNvdXJjZXM6IHNvdXJjZXMsXG5cdFx0dGFyZ2V0OiB0YXJnZXRcblx0fSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIHdoaWNoIGludm9rZXMgdGhlIGdpdmVuIGZ1bmN0aW9uIHdpdGggdGhlIGdpdmVuIGFyZ3VtZW50cyBwcmVwZW5kZWQgdG8gaXRzIGFyZ3VtZW50IGxpc3QuXG4gKiBMaWtlIGBGdW5jdGlvbi5wcm90b3R5cGUuYmluZGAsIGJ1dCBkb2VzIG5vdCBhbHRlciBleGVjdXRpb24gY29udGV4dC5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0RnVuY3Rpb24gVGhlIGZ1bmN0aW9uIHRoYXQgbmVlZHMgdG8gYmUgYm91bmRcbiAqIEBwYXJhbSBzdXBwbGllZEFyZ3MgQW4gb3B0aW9uYWwgYXJyYXkgb2YgYXJndW1lbnRzIHRvIHByZXBlbmQgdG8gdGhlIGB0YXJnZXRGdW5jdGlvbmAgYXJndW1lbnRzIGxpc3RcbiAqIEByZXR1cm4gVGhlIGJvdW5kIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJ0aWFsKHRhcmdldEZ1bmN0aW9uOiAoLi4uYXJnczogYW55W10pID0+IGFueSwgLi4uc3VwcGxpZWRBcmdzOiBhbnlbXSk6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55IHtcblx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRjb25zdCBhcmdzOiBhbnlbXSA9IGFyZ3VtZW50cy5sZW5ndGggPyBzdXBwbGllZEFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkgOiBzdXBwbGllZEFyZ3M7XG5cblx0XHRyZXR1cm4gdGFyZ2V0RnVuY3Rpb24uYXBwbHkodGhpcywgYXJncyk7XG5cdH07XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBhIGRlc3Ryb3kgbWV0aG9kIHRoYXQsIHdoZW4gY2FsbGVkLCBjYWxscyB0aGUgcGFzc2VkLWluIGRlc3RydWN0b3IuXG4gKiBUaGlzIGlzIGludGVuZGVkIHRvIHByb3ZpZGUgYSB1bmlmaWVkIGludGVyZmFjZSBmb3IgY3JlYXRpbmcgXCJyZW1vdmVcIiAvIFwiZGVzdHJveVwiIGhhbmRsZXJzIGZvclxuICogZXZlbnQgbGlzdGVuZXJzLCB0aW1lcnMsIGV0Yy5cbiAqXG4gKiBAcGFyYW0gZGVzdHJ1Y3RvciBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgaGFuZGxlJ3MgYGRlc3Ryb3lgIG1ldGhvZCBpcyBpbnZva2VkXG4gKiBAcmV0dXJuIFRoZSBoYW5kbGUgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIYW5kbGUoZGVzdHJ1Y3RvcjogKCkgPT4gdm9pZCk6IEhhbmRsZSB7XG5cdHJldHVybiB7XG5cdFx0ZGVzdHJveTogZnVuY3Rpb24gKCkge1xuXHRcdFx0dGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge307XG5cdFx0XHRkZXN0cnVjdG9yLmNhbGwodGhpcyk7XG5cdFx0fVxuXHR9O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBzaW5nbGUgaGFuZGxlIHRoYXQgY2FuIGJlIHVzZWQgdG8gZGVzdHJveSBtdWx0aXBsZSBoYW5kbGVzIHNpbXVsdGFuZW91c2x5LlxuICpcbiAqIEBwYXJhbSBoYW5kbGVzIEFuIGFycmF5IG9mIGhhbmRsZXMgd2l0aCBgZGVzdHJveWAgbWV0aG9kc1xuICogQHJldHVybiBUaGUgaGFuZGxlIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9zaXRlSGFuZGxlKC4uLmhhbmRsZXM6IEhhbmRsZVtdKTogSGFuZGxlIHtcblx0cmV0dXJuIGNyZWF0ZUhhbmRsZShmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yIChsZXQgaGFuZGxlIG9mIGhhbmRsZXMpIHtcblx0XHRcdGhhbmRsZS5kZXN0cm95KCk7XG5cdFx0fVxuXHR9KTtcbn1cbiJdfQ==