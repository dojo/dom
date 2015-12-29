declare module 'dojo-core/interfaces' {
	export interface EventObject {
	    type: string;
	}

	export interface Handle {
		destroy(): void;
	}

	export interface Hash<T> {
		[ key: string ]: T;
	}

}
declare module 'dojo-core/DateObject' {
	export interface KwArgs {
	    dayOfMonth?: number;
	    hours?: number;
	    milliseconds?: number;
	    minutes?: number;
	    month: number;
	    seconds?: number;
	    year: number;
	}
	export interface OperationKwArgs {
	    days?: number;
	    hours?: number;
	    milliseconds?: number;
	    minutes?: number;
	    months?: number;
	    seconds?: number;
	    years?: number;
	}
	/**
	 * The properties of a complete date
	 */
	export interface DateProperties {
	    dayOfMonth: number;
	    dayOfWeek: number;
	    daysInMonth: number;
	    hours: number;
	    isLeapYear: boolean;
	    milliseconds: number;
	    minutes: number;
	    month: number;
	    seconds: number;
	    year: number;
	}
	export default class DateObject implements DateProperties {
	    static parse(string: string): DateObject;
	    static now(): DateObject;
	    private _date;
	    utc: DateProperties;
	    constructor(value: number);
	    constructor(value: string);
	    constructor(value: Date);
	    constructor(value: KwArgs);
	    constructor();
	    isLeapYear: boolean;
	    daysInMonth: number;
	    year: number;
	    month: number;
	    dayOfMonth: number;
	    hours: number;
	    minutes: number;
	    seconds: number;
	    milliseconds: number;
	    time: number;
	    dayOfWeek: number;
	    timezoneOffset: number;
	    add(value: number): DateObject;
	    add(value: OperationKwArgs): DateObject;
	    compare(value: DateObject): number;
	    compareDate(value: KwArgs): number;
	    compareTime(value: KwArgs): number;
	    toString(): string;
	    toDateString(): string;
	    toTimeString(): string;
	    toLocaleString(): string;
	    toLocaleDateString(): string;
	    toLocaleTimeString(): string;
	    toISOString(): string;
	    toJSON(key?: any): string;
	    valueOf(): number;
	}

}
declare module 'dojo-core/global' {
	 const globalObject: any;
	export default globalObject;

}
declare module 'dojo-core/has' {
	import { Hash } from 'dojo-core/interfaces';
	export const cache: Hash<any>;
	/**
	 * Register a new test for a named feature.
	 *
	 * @example
	 * has.add('dom-addeventlistener', !!document.addEventListener);
	 *
	 * @example
	 * has.add('touch-events', function () {
	 *    return 'ontouchstart' in document
	 * });
	 */
	export function add(feature: string, value: any, overwrite?: boolean): void;
	/**
	 * Return the current value of a named feature.
	 *
	 * @param feature The name (if a string) or identifier (if an integer) of the feature to test.
	 * @return The value of a given feature test
	 */
	export default function has(feature: string): any;

}
declare module 'dojo-core/lang' {
	import { Handle } from 'dojo-core/interfaces';
	/**
	 * Copies the values of all enumerable own properties of one or more source objects to the target object.
	 *
	 * @param target The target object to receive values from source objects
	 * @param sources Any number of objects whose enumerable own properties will be copied to the target object
	 * @return The modified target object
	 */
	export const assign: (target: {}, ...sources: {}[]) => {};
	/**
	 * Creates a new object from the given prototype, and copies all enumerable own properties of one or more
	 * source objects to the newly created target object.
	 *
	 * @param prototype The prototype to create a new object from
	 * @param mixins Any number of objects whose enumerable own properties will be copied to the created object
	 * @return The new object
	 */
	export function create(prototype: {}, ...mixins: {}[]): {};
	/**
	 * Copies the values of all enumerable own properties of one or more source objects to the target object,
	 * recursively copying all nested objects and arrays as well.
	 *
	 * @param target The target object to receive values from source objects
	 * @param sources Any number of objects whose enumerable own properties will be copied to the target object
	 * @return The modified target object
	 */
	export function deepAssign(target: {}, ...sources: {}[]): {};
	/**
	 * Copies the values of all enumerable (own or inherited) properties of one or more source objects to the
	 * target object, recursively copying all nested objects and arrays as well.
	 *
	 * @param target The target object to receive values from source objects
	 * @param sources Any number of objects whose enumerable properties will be copied to the target object
	 * @return The modified target object
	 */
	export function deepMixin(target: {}, ...sources: {}[]): {};
	/**
	 * Creates a new object using the provided source's prototype as the prototype for the new object, and then
	 * deep copies the provided source's values  into the new target.
	 *
	 * @param source The object to duplicate
	 * @return The new object
	 */
	export function duplicate(source: {}): {};
	/**
	 * Determines whether two values are the same value.
	 *
	 * @param a First value to compare
	 * @param b Second value to compare
	 * @return true if the values are the same; false otherwise
	 */
	export function isIdentical(a: any, b: any): boolean;
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
	export function lateBind(instance: {}, method: string, ...suppliedArgs: any[]): (...args: any[]) => any;
	/**
	 * Copies the values of all enumerable (own or inherited) properties of one or more source objects to the
	 * target object.
	 *
	 * @return The modified target object
	 */
	export function mixin(target: {}, ...sources: {}[]): {};
	/**
	 * Returns a function which invokes the given function with the given arguments prepended to its argument list.
	 * Like `Function.prototype.bind`, but does not alter execution context.
	 *
	 * @param targetFunction The function that needs to be bound
	 * @param suppliedArgs An optional array of arguments to prepend to the `targetFunction` arguments list
	 * @return The bound function
	 */
	export function partial(targetFunction: (...args: any[]) => any, ...suppliedArgs: any[]): (...args: any[]) => any;
	/**
	 * Returns an object with a destroy method that, when called, calls the passed-in destructor.
	 * This is intended to provide a unified interface for creating "remove" / "destroy" handlers for
	 * event listeners, timers, etc.
	 *
	 * @param destructor A function that will be called when the handle's `destroy` method is invoked
	 * @return The handle object
	 */
	export function createHandle(destructor: () => void): Handle;
	/**
	 * Returns a single handle that can be used to destroy multiple handles simultaneously.
	 *
	 * @param handles An array of handles with `destroy` methods
	 * @return The handle object
	 */
	export function createCompositeHandle(...handles: Handle[]): Handle;

}
declare module 'dojo-core/aspect' {
	import { Handle } from 'dojo-core/interfaces';
	/**
	 * Attaches "after" advice to be executed after the original method.
	 * The advising function will receive the original method's return value and arguments object.
	 * The value it returns will be returned from the method when it is called (even if the return value is undefined).
	 * @param target Object whose method will be aspected
	 * @param methodName Name of method to aspect
	 * @param advice Advising function which will receive the original method's return value and arguments object
	 * @return A handle which will remove the aspect when destroy is called
	 */
	export function after(target: any, methodName: string, advice: (originalReturn: any, originalArgs: IArguments) => any): Handle;
	/**
	 * Attaches "around" advice around the original method.
	 * @param target Object whose method will be aspected
	 * @param methodName Name of method to aspect
	 * @param advice Advising function which will receive the original function
	 * @return A handle which will remove the aspect when destroy is called
	 */
	export function around(target: any, methodName: string, advice: (previous: Function) => Function): Handle;
	/**
	 * Attaches "before" advice to be executed before the original method.
	 * @param target Object whose method will be aspected
	 * @param methodName Name of method to aspect
	 * @param advice Advising function which will receive the same arguments as the original, and may return new arguments
	 * @return A handle which will remove the aspect when destroy is called
	 */
	export function before(target: any, methodName: string, advice: (...originalArgs: any[]) => any[] | void): Handle;
	/**
	 * Attaches advice to be executed after the original method.
	 * The advising function will receive the same arguments as the original method.
	 * The value it returns will be returned from the method when it is called *unless* its return value is undefined.
	 * @param target Object whose method will be aspected
	 * @param methodName Name of method to aspect
	 * @param advice Advising function which will receive the same arguments as the original method
	 * @return A handle which will remove the aspect when destroy is called
	 */
	export function on(target: any, methodName: string, advice: (...originalArgs: any[]) => any): Handle;

}
declare module 'dojo-core/Evented' {
	import { Handle, EventObject } from 'dojo-core/interfaces';
	export default class Evented {
	    /**
	     * Emits an event, firing listeners registered for it.
	     * @param event The event object to emit
	     */
	    emit<T extends EventObject>(data: T): void;
	    /**
	     * Listens for an event, calling the listener whenever the event fires.
	     * @param type Event type to listen for
	     * @param listener Callback to handle the event when it fires
	     * @return A handle which will remove the listener when destroy is called
	     */
	    on(type: string, listener: (event: EventObject) => void): Handle;
	}

}
declare module 'dojo-core/number' {
	export const EPSILON: number;
	export const MAX_SAFE_INTEGER: number;
	export const MIN_SAFE_INTEGER: number;
	/**
	 * Determines whether the passed value is NaN without coersion.
	 *
	 * @param value The value to test
	 * @return true if the value is NaN, false if it is not
	 */
	export function isNaN(value: any): boolean;
	/**
	 * Determines whether the passed value is a finite number without coersion.
	 *
	 * @param value The value to test
	 * @return true if the value is finite, false if it is not
	 */
	export function isFinite(value: any): boolean;
	/**
	 * Determines whether the passed value is an integer.
	 *
	 * @param value The value to test
	 * @return true if the value is an integer, false if it is not
	 */
	export function isInteger(value: any): boolean;
	/**
	 * Determines whether the passed value is an integer that is 'safe,' meaning:
	 *   1. it can be expressed as an IEEE-754 double precision number
	 *   2. it has a one-to-one mapping to a mathematical integer, meaning its
	 *      IEEE-754 representation cannot be the result of rounding any other
	 *      integer to fit the IEEE-754 representation
	 * @param value The value to test
	 * @return true if the value is an integer, false if it is not
	 */
	export function isSafeInteger(value: any): boolean;

}
declare module 'dojo-core/array' {
	export interface ArrayLike<T> {
	    length: number;
	    [n: number]: T;
	}
	export interface MapCallback<T> {
	    (element: T, index: number): T;
	}
	export interface FindCallback<T> {
	    (element: T, index: number, array: ArrayLike<T>): boolean;
	}
	export function from(arrayLike: string, mapFunction?: MapCallback<string>, thisArg?: {}): ArrayLike<string>;
	export function from<T>(arrayLike: ArrayLike<T>, mapFunction?: MapCallback<T>, thisArg?: {}): ArrayLike<T>;
	export function of(...items: any[]): any[];
	/**
	 * Fills elements of an array-like object with the specified value.
	 *
	 * @param target The target to fill
	 * @param value The value to fill each element of the target with
	 * @param [start] The first index to fill
	 * @param [end] The (exclusive) index at which to stop filling
	 * @return The filled target
	 */
	export function fill<T>(target: ArrayLike<T>, value: any, start?: number, end?: number): ArrayLike<T>;
	/**
	 * Performs a linear search and returns the first index whose value satisfies the passed callback,
	 * or -1 if no values satisfy it.
	 *
	 * @param target An array-like object
	 * @param callback A function returning true if the current value satisfies its criteria
	 * @param [thisArg] The execution context for the find function
	 * @return The first index whose value satisfies the passed callback, or -1 if no values satisfy it
	 */
	export function findIndex<T>(target: ArrayLike<T>, callback: FindCallback<T>, thisArg?: {}): number;
	/**
	 * Finds and returns the first instance matching the callback or undefined if one is not found.
	 *
	 * @param target An array-like object
	 * @param callback A function returning if the current value matches a criteria
	 * @param [thisArg] The execution context for the find function
	 * @return The first element matching the callback, or undefined if one does not exist
	 */
	export function find<T>(target: ArrayLike<T>, callback: FindCallback<T>, thisArg?: {}): T;
	/**
	 * Copies data internally within an array or array-like object.
	 *
	 * @param target The target array-like object
	 * @param offset The index to start copying values to; if negative, it counts backwards from length
	 * @param start The first (inclusive) index to copy; if negative, it counts backwards from length
	 * @param end The last (exclusive) index to copy; if negative, it counts backwards from length
	 * @return The target
	 */
	export function copyWithin<T>(target: ArrayLike<T>, offset: number, start?: number, end?: number): ArrayLike<T>;

}
declare module 'dojo-core/object' {
	/**
	 * Determines whether two values are the same value.
	 * @return true if the values are the same; false otherwise
	 */
	export function is(value1: any, value2: any): boolean;

}
declare module 'dojo-core/Map' {
	import { ArrayLike } from 'dojo-core/array';
	/**
	 * An implementation analogous to the Map specification in ES2015,
	 * with the exception of iterators.  The entries, keys, and values methods
	 * are omitted, since forEach essentially provides the same functionality.
	 */
	export default class Map<K, V> {
	    protected _keys: K[];
	    protected _values: V[];
	    protected _indexOfKey(keys: K[], key: K): number;
	    /**
	     * Creates a new Map
	     *
	     * @constructor
	     *
	     * @param arrayLike
	     * Array or array-like object containing two-item tuples used to initially populate the map.
	     * The first item in each tuple corresponds to the key of the map entry.
	     * The second item corresponds to the value of the map entry.
	     */
	    constructor(arrayLike?: ArrayLike<[K, V]>);
	    /**
	     * Returns the number of key / value pairs in the Map.
	     *
	     * @return the number of key / value pairs in the Map
	     */
	    size: number;
	    /**
	     * Deletes all keys and their associated values.
	     */
	    clear(): void;
	    /**
	     * Deletes a given key and its associated value.
	     *
	     * @param key The key to delete
	     * @return true if the key exists, false if it does not
	     */
	    delete(key: K): boolean;
	    /**
	     * Executes a given function for each map entry. The function
	     * is invoked with three arguments: the element value, the
	     * element key, and the associated Map instance.
	     *
	     * @param callback The function to execute for each map entry,
	     * @param context The value to use for `this` for each execution of the calback
	     */
	    forEach(callback: (value: V, key: K, mapInstance: Map<K, V>) => any, context?: {}): void;
	    /**
	     * Returns the value associated with a given key.
	     *
	     * @param key The key to look up
	     * @return The value if one exists or undefined
	     */
	    get(key: K): V;
	    /**
	     * Checks for the presence of a given key.
	     *
	     * @param key The key to check for
	     * @return true if the key exists, false if it does not
	     */
	    has(key: K): boolean;
	    /**
	     * Sets the value associated with a given key.
	     *
	     * @param key The key to define a value to
	     * @param value The value to assign
	     * @return The Map instance
	     */
	    set(key: K, value: V): Map<K, V>;
	}

}
declare module 'dojo-core/queue' {
	import { Handle } from 'dojo-core/interfaces';
	export interface QueueItem {
	    isActive: boolean;
	    callback: (...args: any[]) => any;
	}
	/**
	 * Schedules a callback to the macrotask queue.
	 *
	 * @param callback the function to be queued and later executed.
	 * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
	 */
	export const queueTask: (callback: (...args: any[]) => any) => Handle;
	/**
	 * Schedules an animation task with `window.requestAnimationFrame` if it exists, or with `queueTask` otherwise.
	 *
	 * Since requestAnimationFrame's behavior does not match that expected from `queueTask`, it is not used there.
	 * However, at times it makes more sense to delegate to requestAnimationFrame; hence the following method.
	 *
	 * @param callback the function to be queued and later executed.
	 * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
	 */
	export const queueAnimationTask: (callback: (...args: any[]) => any) => Handle;
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
	export let queueMicroTask: (callback: (...args: any[]) => any) => Handle;

}
declare module 'dojo-core/Promise' {
	/**
	 * Executor is the interface for functions used to initialize a Promise.
	 */
	export interface Executor<T> {
	    (resolve: (value?: T | Thenable<T>) => void, reject: (reason?: any) => void): void;
	}
	/**
	 * Returns true if a given value has a `then` method.
	 * @param {any} value The value to check if is Thenable
	 * @returns {is Thenable<T>} A type guard if the value is thenable
	 */
	export function isThenable<T>(value: any): value is Thenable<T>;
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
	export class PromiseShim<T> implements Thenable<T> {
	    static all<T>(items: (T | Thenable<T>)[]): PromiseShim<T[]>;
	    static race<T>(items: (T | Thenable<T>)[]): PromiseShim<T>;
	    static reject<T>(reason?: Error): PromiseShim<T>;
	    static resolve(): PromiseShim<void>;
	    static resolve<T>(value: (T | Thenable<T>)): PromiseShim<T>;
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
	    constructor(executor: Executor<T>);
	    /**
	     * The current state of this promise.
	     */
	    private state;
	    /**
	     * The resolved value for this promise.
	     *
	     * @type {T|Error}
	     */
	    private resolvedValue;
	    then: <U>(onFulfilled?: (value?: T) => (U | Thenable<U>), onRejected?: (reason?: Error) => (U | Thenable<U>)) => PromiseShim<U>;
	}
	/**
	 * PlatformPromise is a very thin wrapper around either a native promise implementation or PromiseShim.
	 */
	export default class Promise<T> implements Thenable<T> {
	    /**
	     * Points to the promise constructor this platform should use.
	     */
	    static PromiseConstructor: any;
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
	    static all<T>(items: (T | Thenable<T>)[]): Promise<T[]>;
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
	    static race<T>(items: (T | Thenable<T>)[]): Promise<T>;
	    /**
	     * Creates a new promise that is rejected with the given error.
	     */
	    static reject<T>(reason: Error): Promise<any>;
	    /**
	     * Creates a new promise that is resolved with the given value. If the passed value is already a PromiseShim, it
	     * will be returned as-is.
	     */
	    static resolve(): Promise<void>;
	    static resolve<T>(value: (T | Thenable<T>)): Promise<T>;
	    /**
	     * Copies another Promise, taking on its inner state.
	     */
	    protected static copy<U>(other: Promise<U>): Promise<U>;
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
	    constructor(executor: Executor<T>);
	    /**
	     * An object wrapped by this class that actually implements the Promise API.
	     */
	    private promise;
	    /**
	     * The internal state of this promise. This may be updated directly by subclasses.
	     */
	    protected _state: State;
	    /**
	     * Adds a callback to the promise to be invoked when the asynchronous operation throws an error.
	     */
	    catch<U>(onRejected: (reason?: Error) => (U | Thenable<U>)): Promise<U>;
	    /**
	     * Allows for cleanup actions to be performed after resolution of a Promise.
	     */
	    finally(callback: () => void | Thenable<any>): Promise<T>;
	    /**
	     * The current Promise state.
	     */
	    state: State;
	    /**
	     * Adds a callback to the promise to be invoked when the asynchronous operation completes successfully.
	     */
	    then<U>(onFulfilled?: (value?: T) => (U | Thenable<U>), onRejected?: (reason?: Error) => (U | Thenable<U>)): Promise<U>;
	}
	/**
	 * The State enum represents the possible states of a promise.
	 */
	export enum State {
	    Fulfilled = 0,
	    Pending = 1,
	    Rejected = 2,
	}
	/**
	 * Thenable represents any object with a callable `then` property.
	 */
	export interface Thenable<T> {
	    then<U>(onFulfilled?: (value?: T) => U | Thenable<U>, onRejected?: (error?: any) => U | Thenable<U>): Thenable<U>;
	}

}
declare module 'dojo-core/Registry' {
	import { Handle } from 'dojo-core/interfaces';
	/**
	 * A registry of values tagged with matchers.
	 */
	export default class Registry<T> {
	    protected _defaultValue: T;
	    private _entries;
	    /**
	     * Construct a new Registry, optionally containing a given default value.
	     */
	    constructor(defaultValue?: T);
	    /**
	     * Return the first entry in this registry that matches the given arguments. If no entry matches and the registry
	     * was created with a default value, that value will be returned. Otherwise, an exception is thrown.
	     *
	     * @param ...args Arguments that will be used to select a matching value.
	     * @returns the matching value, or a default value if one exists.
	     */
	    match(...args: any[]): T;
	    /**
	     * Register a test + value pair with this registry.
	     *
	     * @param test The test that will be used to determine if the registered value matches a set of arguments.
	     * @param value A value being registered.
	     * @param first If true, the newly registered test and value will be the first entry in the registry.
	     */
	    register(test: Test, value: T, first?: boolean): Handle;
	}
	/**
	 * The interface that a test function must implement.
	 */
	export interface Test {
	    (...args: any[]): boolean;
	}

}
declare module 'dojo-core/Scheduler' {
	import { Handle } from 'dojo-core/interfaces';
	import { QueueItem } from 'dojo-core/queue';
	export interface KwArgs {
	    deferWhileProcessing?: boolean;
	    queueFunction?: (callback: (...args: any[]) => any) => Handle;
	}
	export default class Scheduler {
	    protected _boundDispatch: () => void;
	    protected _deferred: QueueItem[];
	    protected _isProcessing: boolean;
	    protected _queue: QueueItem[];
	    protected _task: Handle;
	    /**
	     * Determines whether any callbacks registered during should be added to the current batch (`false`)
	     * or deferred until the next batch (`true`, default).
	     */
	    deferWhileProcessing: boolean;
	    /**
	     * Allows users to specify the function that should be used to schedule callbacks.
	     * If no function is provided, then `queueTask` will be used.
	     */
	    queueFunction: (callback: (...args: any[]) => any) => Handle;
	    protected _defer(callback: (...args: any[]) => void): Handle;
	    protected _dispatch(): void;
	    protected _schedule(item: QueueItem): void;
	    constructor(kwArgs?: KwArgs);
	    schedule(callback: (...args: any[]) => void): Handle;
	}

}
declare module 'dojo-core/UrlSearchParams' {
	import { Hash } from 'dojo-core/interfaces';
	/**
	 * Object with string keys and string or string array values that describes a query string.
	 */
	export type ParamList = Hash<string | string[]>;
	/**
	 * Represents a set of URL query search parameters.
	 */
	export default class UrlSearchParams {
	    /**
	     * Constructs a new UrlSearchParams from a query string, an object of parameters and values, or another
	     * UrlSearchParams.
	     */
	    constructor(input?: string | ParamList | UrlSearchParams);
	    /**
	     * Maps property keys to arrays of values. The value for any property that has been set will be an array containing
	     * at least one item. Properties that have been deleted will have a value of 'undefined'.
	     */
	    protected _list: Hash<string[]>;
	    /**
	     * Appends a new value to the set of values for a key.
	     * @param key The key to add a value for
	     * @param value The value to add
	     */
	    append(key: string, value: string): void;
	    /**
	     * Deletes all values for a key.
	     * @param key The key whose values are to be removed
	     */
	    delete(key: string): void;
	    /**
	     * Returns the first value associated with a key.
	     * @param key The key to return the first value for
	     * @return The first string value for the key
	     */
	    get(key: string): string;
	    /**
	     * Returns all the values associated with a key.
	     * @param key The key to return all values for
	     * @return An array of strings containing all values for the key
	     */
	    getAll(key: string): string[];
	    /**
	     * Returns true if a key has been set to any value, false otherwise.
	     * @param key The key to test for existence
	     * @return A boolean indicating if the key has been set
	     */
	    has(key: string): boolean;
	    /**
	     * Returns an array of all keys which have been set.
	     * @return An array of strings containing all keys set in the UrlSearchParams instance
	     */
	    keys(): string[];
	    /**
	     * Sets the value associated with a key.
	     * @param key The key to set the value of
	     */
	    set(key: string, value: string): void;
	    /**
	     * Returns this object's data as an encoded query string.
	     * @return A string in application/x-www-form-urlencoded format containing all of the set keys/values
	     */
	    toString(): string;
	}

}
declare module 'dojo-core/decorators' {
	export function hasClass(feature: string, trueClass: Function, falseClass: Function): ClassDecorator;

}
declare module 'dojo-core/WeakMap' {
	export default class WeakMap<K, V> {
	    constructor(iterable?: any);
	    delete(key: K): boolean;
	    get(key: K): V;
	    has(key: K): boolean;
	    set(key: K, value?: V): WeakMap<K, V>;
	}

}
declare module 'dojo-core/async/Task' {
	import Promise, { Executor, State, Thenable } from 'dojo-core/Promise';
	export const Canceled: State;
	/**
	 * Task is an extension of Promise that supports cancelation.
	 */
	export default class Task<T> extends Promise<T> {
	    static all<T>(items: (T | Thenable<T>)[]): Task<T[]>;
	    static race<T>(items: (T | Thenable<T>)[]): Task<T>;
	    static reject<T>(reason: Error): Task<any>;
	    static resolve(): Task<void>;
	    static resolve<T>(value: (T | Thenable<T>)): Task<T>;
	    protected static copy<U>(other: Promise<U>): Task<U>;
	    constructor(executor: Executor<T>, canceler?: () => void);
	    /**
	     * A cancelation handler that will be called if this task is canceled.
	     */
	    private canceler;
	    /**
	     * Children of this Task (i.e., Tasks that were created from this Task with `then` or `catch`).
	     */
	    private children;
	    /**
	     * The finally callback for this Task (if it was created by a call to `finally`).
	     */
	    private _finally;
	    /**
	     * Propagates cancelation down through a Task tree. The Task's state is immediately set to canceled. If a Thenable
	     * finally task was passed in, it is resolved before calling this Task's finally callback; otherwise, this Task's
	     * finally callback is immediately executed. `_cancel` is called for each child Task, passing in the value returned
	     * by this Task's finally callback or a Promise chain that will eventually resolve to that value.
	     */
	    private _cancel(finallyTask?);
	    /**
	     * Immediately cancels this task if it has not already resolved. This Task and any descendants are synchronously set
	     * to the Canceled state and any `finally` added downstream from the canceled Task are invoked.
	     */
	    cancel(): void;
	    finally(callback: () => void | Thenable<any>): Task<T>;
	    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: Error) => U | Thenable<U>): Task<U>;
	    catch<U>(onRejected: (reason?: Error) => (U | Thenable<U>)): Task<U>;
	}

}
declare module 'dojo-core/async/iteration' {
	import Promise, { Thenable } from 'dojo-core/Promise';
	/**
	 * Test whether all elements in the array pass the provided callback
	 * @param items a collection of synchronous/asynchronous values
	 * @param callback a synchronous/asynchronous test
	 * @return eventually returns true if all values pass; otherwise false
	 */
	export function every<T>(items: (T | Promise<T>)[], callback: Filterer<T>): Promise<boolean>;
	/**
	 * Returns an array of elements which pass the provided callback
	 * @param items a collection of synchronous/asynchronous values
	 * @param callback a synchronous/asynchronous test
	 * @return eventually returns a new array with only values that have passed
	 */
	export function filter<T>(items: (T | Promise<T>)[], callback: Filterer<T>): Promise<T[]>;
	/**
	 * Find the first value matching a filter function
	 * @param items a collection of synchronous/asynchronous values
	 * @param callback a synchronous/asynchronous test
	 * @return a promise eventually containing the item or undefined if a match is not found
	 */
	export function find<T>(items: (T | Promise<T>)[], callback: Filterer<T>): Promise<T>;
	/**
	 * Find the first index with a value matching the filter function
	 * @param items a collection of synchronous/asynchronous values
	 * @param callback a synchronous/asynchronous test
	 * @return a promise eventually containing the index of the matching item or -1 if a match is not found
	 */
	export function findIndex<T>(items: (T | Promise<T>)[], callback: Filterer<T>): Promise<number>;
	/**
	 * transform a list of items using a mapper function
	 * @param items a collection of synchronous/asynchronous values
	 * @param callback a synchronous/asynchronous transform function
	 * @return a promise eventually containing a collection of each transformed value
	 */
	export function map<T, U>(items: (T | Promise<T>)[], callback: Mapper<T, U>): Promise<U[]>;
	/**
	 * reduce a list of items down to a single value
	 * @param items a collection of synchronous/asynchronous values
	 * @param callback a synchronous/asynchronous reducer function
	 * @param [initialValue] the first value to pass to the callback
	 * @return a promise eventually containing a value that is the result of the reduction
	 */
	export function reduce<T, U>(items: (T | Promise<T>)[], callback: Reducer<T, U>, initialValue?: U): Promise<U>;
	export function reduceRight<T, U>(items: (T | Promise<T>)[], callback: Reducer<T, U>, initialValue?: U): Promise<U>;
	export function series<T, U>(items: (T | Promise<T>)[], operation: Mapper<T, U>): Promise<U[]>;
	export function some<T>(items: Array<T | Promise<T>>, callback: Filterer<T>): Promise<boolean>;
	export interface Filterer<T> extends Mapper<T, boolean> {
	}
	export interface Mapper<T, U> {
	    (value: T, index: number, array: T[]): (U | Thenable<U>);
	}
	export interface Reducer<T, U> {
	    (previousValue: U, currentValue: T, index: number, array: T[]): (U | Thenable<U>);
	}

}
declare module 'dojo-core/async/timing' {
	import Promise from 'dojo-core/Promise';
	/**
	 * Used for delaying a Promise chain for a specific number of milliseconds.
	 *
	 * @param milliseconds the number of milliseconds to delay
	 * @return {function(T): Promise<T>} a function producing a promise that eventually returns the value passed to it; usable with Thenable.then()
	 */
	export function delay<T>(milliseconds: number): Identity<T>;
	export interface Identity<T> {
	    (value: T): Promise<T>;
	}
	/**
	 * Reject a promise chain if a result hasn't been found before the timeout
	 *
	 * @param milliseconds after this number of milliseconds a rejection will be returned
	 * @param reason The reason for the rejection
	 * @return {function(T): Promise<T>} a function that produces a promise that is rejected or resolved based on your timeout
	 */
	export function timeout<T>(milliseconds: number, reason: Error): Identity<T>;
	/**
	 * A Promise that will reject itself automatically after a time.
	 * Useful for combining with other promises in Promise.race.
	 */
	export class DelayedRejection extends Promise<any> {
	    /**
	     * @param milliseconds the number of milliseconds to wait before triggering a rejection
	     * @param reason the reason for the rejection
	     */
	    constructor(milliseconds: number, reason?: Error);
	}

}
declare module 'dojo-core/string' {
	export const HIGH_SURROGATE_MIN: number;
	export const HIGH_SURROGATE_MAX: number;
	export const LOW_SURROGATE_MIN: number;
	export const LOW_SURROGATE_MAX: number;
	/**
	 * Returns the UTF-16 encoded code point value of a given position in a string.
	 * @param text The string containing the element whose code point is to be determined
	 * @param position Position of an element within the string to retrieve the code point value from
	 * @return A non-negative integer representing the UTF-16 encoded code point value
	 */
	export function codePointAt(text: string, position?: number): number;
	/**
	 * Determines whether a string ends with the given substring.
	 * @param text The string to look for the search string within
	 * @param search The string to search for
	 * @param endPosition The index searching should stop before (defaults to text.length)
	 * @return Boolean indicating if the search string was found at the end of the given string
	 */
	export function endsWith(text: string, search: string, endPosition?: number): boolean;
	/**
	 * Escapes a string so that it can safely be passed to the RegExp constructor.
	 * @param text The string to be escaped
	 * @return The escaped string
	 */
	export function escapeRegExp(text: string): string;
	/**
	 * Sanitizes a string to protect against tag injection.
	 * @param xml The string to be escaped
	 * @param forAttribute Whether to also escape ', ", and > in addition to < and &
	 * @return The escaped string
	 */
	export function escapeXml(xml: string, forAttribute?: boolean): string;
	/**
	 * Returns a string created by using the specified sequence of code points.
	 * @param codePoints One or more code points
	 * @return A string containing the given code points
	 */
	export function fromCodePoint(...codePoints: number[]): string;
	/**
	 * Determines whether a string includes the given substring (optionally starting from a given index).
	 * @param text The string to look for the search string within
	 * @param search The string to search for
	 * @param position The index to begin searching at
	 * @return Boolean indicating if the search string was found within the given string
	 */
	export function includes(text: string, search: string, position?: number): boolean;
	/**
	 * Adds padding to the end of a string to ensure it is a certain length.
	 * @param text The string to pad
	 * @param length The target minimum length of the string
	 * @param character The character to pad onto the end of the string
	 * @return The string, padded to the given length if necessary
	 */
	export function padEnd(text: string, length: number, character?: string): string;
	/**
	 * Adds padding to the beginning of a string to ensure it is a certain length.
	 * @param text The string to pad
	 * @param length The target minimum length of the string
	 * @param character The character to pad onto the beginning of the string
	 * @return The string, padded to the given length if necessary
	 */
	export function padStart(text: string, length: number, character?: string): string;
	/**
	 * A tag function for template strings to get the template string's raw string form.
	 * @param callSite Call site object (or a template string in TypeScript, which will transpile to one)
	 * @param substitutions Values to substitute within the template string (TypeScript will generate these automatically)
	 * @return String containing the raw template string with variables substituted
	 *
	 * @example
	 * // Within TypeScript; logs 'The answer is:\\n42'
	 * let answer = 42;
	 * console.log(string.raw`The answer is:\n${answer}`);
	 *
	 * @example
	 * // The same example as above, but directly specifying a JavaScript object and substitution
	 * console.log(string.raw({ raw: [ 'The answer is:\\n', '' ] }, 42));
	 */
	export function raw(callSite: TemplateStringsArray, ...substitutions: any[]): string;
	/**
	 * Returns a string containing the given string repeated the specified number of times.
	 * @param text The string to repeat
	 * @param count The number of times to repeat the string
	 * @return A string containing the input string repeated count times
	 */
	export function repeat(text: string, count?: number): string;
	/**
	 * Determines whether a string begins with the given substring (optionally starting from a given index).
	 * @param text The string to look for the search string within
	 * @param search The string to search for
	 * @param position The index to begin searching at
	 * @return Boolean indicating if the search string was found at the beginning of the given string
	 */
	export function startsWith(text: string, search: string, position?: number): boolean;

}
declare module 'dojo-core/encoding' {
	export type ByteBuffer = Uint8Array | Buffer | number[];
	export interface Codec {
	    encode(data: string): number[];
	    decode(data: ByteBuffer): string;
	}
	/**
	 * Provides facilities for encoding a string into an ASCII-encoded byte buffer and
	 * decoding an ASCII-encoded byte buffer into a string.
	 */
	export const ascii: Codec;
	/**
	 * Provides facilities for encoding a string into a Base64-encoded byte buffer and
	 * decoding a Base64-encoded byte buffer into a string.
	 */
	export const base64: Codec;
	/**
	 * Provides facilities for encoding a string into a hex-encoded byte buffer and
	 * decoding a hex-encoded byte buffer into a string.
	 */
	export const hex: Codec;
	/**
	 * Provides facilities for encoding a string into a UTF-8-encoded byte buffer and
	 * decoding a UTF-8-encoded byte buffer into a string.
	 * Inspired by the work of: https://github.com/mathiasbynens/utf8.js
	 */
	export const utf8: Codec;

}
declare module 'dojo-core/load' {
	import Promise from 'dojo-core/Promise';
	export interface AMDRequire {
	    (moduleIds: string[], callback: (...modules: any[]) => void): void;
	}
	export interface NodeRequire {
	    (moduleId: string): any;
	}
	export type Require = AMDRequire | NodeRequire;
	export interface Load {
	    (require: Require, ...moduleIds: string[]): Promise<any[]>;
	    (...moduleIds: string[]): Promise<any[]>;
	} const load: Load;
	export default load;

}
declare module 'dojo-core/math' {
	/**
	 * Returns the hyperbolic arccosine of a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function acosh(n: number): number;
	/**
	 * Returns the hyperbolic arcsine of a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function asinh(n: number): number;
	/**
	 * Returns the hyperbolic arctangent of a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function atanh(n: number): number;
	/**
	 * Returns the cube root of a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function cbrt(n: number): number;
	/**
	 * Returns the number of leading zero bits in the 32-bit
	 * binary representation of a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function clz32(n: number): number;
	/**
	 * Returns the hyperbolic cosine of a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function cosh(n: number): number;
	/**
	 * Returns e raised to the specified power minus one.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function expm1(n: number): number;
	/**
	 * Returns the nearest single-precision float representation of a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export const fround: (n: number) => number;
	/**
	 * Returns the square root of the sum of squares of its arguments.
	 *
	 * @return The result
	 */
	export function hypot(...args: number[]): number;
	/**
	 * Returns the result of the 32-bit multiplication of the two parameters.
	 *
	 * @param n The number to use in calculation
	 * @param m The number to use in calculation
	 * @return The result
	 */
	export function imul(n: number, m: number): number;
	/**
	 * Returns the base 2 logarithm of a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function log2(n: number): number;
	/**
	 * Returns the base 10 logarithm of a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function log10(n: number): number;
	/**
	 * Returns the natural logarithm of 1 + a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function log1p(n: number): number;
	/**
	 * Returns the sign of a number, indicating whether the number is positive.
	 *
	 * @param n The number to use in calculation
	 * @return 1 if the number is positive, -1 if the number is negative, or 0 if the number is 0
	 */
	export function sign(n: number): number;
	/**
	 * Returns the hyperbolic sine of a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function sinh(n: number): number;
	/**
	 * Returns the hyperbolic tangent of a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function tanh(n: number): number;
	/**
	 * Returns the integral part of a number by removing any fractional digits.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function trunc(n: number): number;

}
declare module 'dojo-core/on' {
	import { Handle, EventObject } from 'dojo-core/interfaces';
	import Evented from 'dojo-core/Evented';
	export interface EventCallback {
	    (event: EventObject): void;
	}
	export interface EventEmitter {
	    on(event: string, listener: EventCallback): EventEmitter;
	    removeListener(event: string, listener: EventCallback): EventEmitter;
	}
	/**
	 * Provides a normalized mechanism for dispatching events for event emitters, Evented objects, or DOM nodes.
	 * @param target The target to emit the event from
	 * @param event The event object to emit
	 * @return Boolean indicating Whether the event was canceled (this will always be false for event emitters)
	 */
	export function emit<T extends EventObject>(target: Evented | EventTarget | EventEmitter, event: T | EventObject): boolean;
	/**
	 * Provides a normalized mechanism for listening to events from event emitters, Evented objects, or DOM nodes.
	 * @param target Target to listen for event on
	 * @param type Event event type(s) to listen for; may a string or an array of strings
	 * @param listener Callback to handle the event when it fires
	 * @param capture Whether the listener should be registered in the capture phase (DOM events only)
	 * @return A handle which will remove the listener when destroy is called
	 */
	export default function on(target: EventTarget, type: string | string[], listener: EventCallback, capture?: boolean): Handle;
	export default function on(target: EventEmitter | Evented, type: string | string[], listener: EventCallback): Handle;
	/**
	 * Provides a mechanism for listening to the next occurrence of an event from event
	 * emitters, Evented objects, or DOM nodes.
	 * @param target Target to listen for event on
	 * @param type Event event type(s) to listen for; may be a string or an array of strings
	 * @param listener Callback to handle the event when it fires
	 * @param capture Whether the listener should be registered in the capture phase (DOM events only)
	 * @return A handle which will remove the listener when destroy is called
	 */
	export function once(target: EventTarget, type: string | string[], listener: EventCallback, capture?: boolean): Handle;
	export function once(target: EventEmitter | Evented, type: string | string[], listener: EventCallback): Handle;
	export interface PausableHandle extends Handle {
	    pause(): void;
	    resume(): void;
	}
	/**
	 * Provides a mechanism for creating pausable listeners for events from event emitters, Evented objects, or DOM nodes.
	 * @param target Target to listen for event on
	 * @param type Event event type(s) to listen for; may a string or an array of strings
	 * @param listener Callback to handle the event when it fires
	 * @param capture Whether the listener should be registered in the capture phase (DOM events only)
	 * @return A handle with additional pause and resume methods; the listener will never fire when paused
	 */
	export function pausable(target: EventTarget, type: string | string[], listener: EventCallback, capture?: boolean): PausableHandle;
	export function pausable(target: EventEmitter | Evented, type: string | string[], listener: EventCallback): PausableHandle;

}
declare module 'dojo-core/request' {
	import Task from 'dojo-core/async/Task';
	import { Handle } from 'dojo-core/interfaces';
	import Registry, { Test } from 'dojo-core/Registry';
	import { ParamList } from 'dojo-core/UrlSearchParams';
	export class FilterRegistry extends Registry<RequestFilter> {
	    register(test: string | RegExp | RequestFilterTest, value: RequestFilter, first?: boolean): Handle;
	}
	export class ProviderRegistry extends Registry<RequestProvider> {
	    private _providerPromise;
	    constructor();
	    register(test: string | RegExp | RequestProviderTest, value: RequestProvider, first?: boolean): Handle;
	}
	/**
	 * Request filters, which filter or modify responses. The default filter simply passes a response through unchanged.
	 */
	export const filterRegistry: FilterRegistry;
	/**
	 * Request providers, which fulfill requests.
	 */
	export const providerRegistry: ProviderRegistry;
	export interface RequestError<T> extends Error {
	    response: Response<T>;
	}
	export interface RequestFilter {
	    <T>(response: Response<T>, url: string, options?: RequestOptions): T;
	}
	export interface RequestFilterTest extends Test {
	    <T>(response: Response<any>, url: string, options?: RequestOptions): boolean;
	}
	export interface RequestOptions {
	    auth?: string;
	    cacheBust?: any;
	    data?: any;
	    handleAs?: string;
	    headers?: {
	        [name: string]: string;
	    };
	    method?: string;
	    password?: string;
	    query?: string | ParamList;
	    responseType?: string;
	    timeout?: number;
	    user?: string;
	}
	export interface RequestProvider {
	    <T>(url: string, options?: RequestOptions): ResponsePromise<T>;
	}
	export interface RequestProviderTest extends Test {
	    (url: string, options?: RequestOptions): boolean;
	}
	export interface Response<T> {
	    data: T;
	    nativeResponse?: any;
	    requestOptions: RequestOptions;
	    statusCode: number;
	    statusText?: string;
	    url: string;
	    getHeader(name: string): string;
	}
	/**
	 * The task returned by a request, which will resolve to a Response
	 */
	export interface ResponsePromise<T> extends Task<Response<T>> {
	} const request: {
	    <T>(url: string, options?: RequestOptions): ResponsePromise<T>;
	    delete<T>(url: string, options?: RequestOptions): ResponsePromise<T>;
	    get<T>(url: string, options?: RequestOptions): ResponsePromise<T>;
	    post<T>(url: string, options?: RequestOptions): ResponsePromise<T>;
	    put<T>(url: string, options?: RequestOptions): ResponsePromise<T>;
	};
	export default request;

}
declare module 'dojo-core/request/errors/RequestTimeoutError' {
	import { RequestError, Response } from 'dojo-core/request';
	export default class RequestTimeoutError<T> implements RequestError<T> {
	    message: string;
	    name: string;
	    response: Response<T>;
	    constructor(message?: string);
	}

}
declare module 'dojo-core/streams/interfaces' {
	export interface Strategy<T> {
		/**
		 * Computes the number of items in a chunk.
		 */
		size?: (chunk: T) => number;

		/**
		 * The number of chunks allowed in the queue before backpressure is applied.
		 */
		highWaterMark?: number;
	}

}
declare module 'dojo-core/streams/ReadableStreamController' {
	import ReadableStream from 'dojo-core/streams/ReadableStream';
	export function isReadableStreamController(x: any): boolean;
	export default class ReadableStreamController<T> {
	    private _controlledReadableStream;
	    /**
	     * Returns a number indicating how much additional data can be pushed by the source to the stream's queue before it
	     * exceeds its `highWaterMark`. An underlying source should use this information to determine when and how to apply
	     * backpressure.
	     *
	     * @returns The stream's strategy's `highWaterMark` value minus the queue size
	     */
	    desiredSize: number;
	    constructor(stream: ReadableStream<T>);
	    /**
	     * A source should call this method when it has no more data to provide. After this method is called, the stream
	     * will provided any queued data to the reader, but once the stream's queue is exhausted the stream will be closed
	     * and no more data can be read from it.
	     */
	    close(): void;
	    /**
	     * A source should call this method to provide data to the stream.
	     *
	     * @param chunk The data to provide to the stream
	     */
	    enqueue(chunk: T): void;
	    /**
	     * A source should call this method to indicate an error condition to the stream that irreparably disrupts the
	     * source's (and thus the stream's) ability to provide all the intended data.
	     *
	     * @param error An error object representing the error condition in the source
	     */
	    error(error: Error): void;
	}

}
declare module 'dojo-core/streams/ReadableStreamReader' {
	import Promise from 'dojo-core/Promise';
	import ReadableStream, { State } from 'dojo-core/streams/ReadableStream';
	/**
	 * Represents the objects returned by {@link ReadableStreamReader#read}. The data is accessible on the `value` property.
	 * If the `done` property is true, the stream has no more data to provide.
	 */
	export interface ReadResult<T> {
	    value: T;
	    done: boolean;
	}
	/**
	 * This class provides the interface for reading data from a stream. A reader can by acquired by calling
	 * {@link ReadableStream#getReader}. A {@link ReadableStream} can only have a single reader at any time. A reader can
	 * be released from the stream by calling {@link ReadableStreamReader.releaseLock}. If the stream still has data, a new
	 * reader can be acquired to read from the stream.
	 */
	export default class ReadableStreamReader<T> {
	    closed: Promise<void>;
	    private _closedPromise;
	    private _storedError;
	    private _readRequests;
	    private _resolveClosedPromise;
	    private _rejectClosedPromise;
	    protected _ownerReadableStream: ReadableStream<T>;
	    state: State;
	    constructor(stream: ReadableStream<T>);
	    /**
	     * Cancel a stream. The reader is released and the stream is closed. {@link ReadableStream.Source#cancel} is
	     * called with the provided `reason`.
	     *
	     * @param reason The reason for canceling the stream
	     */
	    cancel(reason: string): Promise<void>;
	    /**
	     * Read data from the stream.
	     *
	     * @returns A promise that resolves to a {@link ReadResult}.
	     */
	    read(): Promise<ReadResult<T>>;
	    /**
	     * Release a reader's lock on the corresponding stream. The reader will no longer be readable. Further reading on
	     * the stream can be done by acquiring a new `ReadableStreamReader`.
	     */
	    releaseLock(): void;
	    release(): void;
	    /**
	     * Resolves a pending read request, if any, with the provided chunk.
	     * @param chunk
	     * @return boolean True if a read request was resolved.
	     */
	    resolveReadRequest(chunk: T): boolean;
	}

}
declare module 'dojo-core/streams/SizeQueue' {
	/**
	 * This class is used internally by {@link ReadableStream} and {@link WritableStream} as a simple queue.
	 * Each value in the queue includes a piece of metadata: the size of the value.
	 */
	export default class SizeQueue<T> {
	    totalSize: number;
	    length: number;
	    private _queue;
	    empty(): void;
	    enqueue(value: T, size: number): void;
	    dequeue(): T;
	    peek(): T;
	}

}
declare module 'dojo-core/streams/util' {
	import { Strategy } from 'dojo-core/streams/interfaces';
	import Promise from 'dojo-core/Promise';
	export function getApproximateByteSize(object: any): number;
	/**
	 * Calls the method or returns undefined.
	 */
	export function invokeOrNoop(O: any, P: string, args?: any[]): any;
	export function normalizeStrategy<T>({size, highWaterMark}: Strategy<T>): Strategy<T>;
	export function promiseInvokeOrFallbackOrNoop(object: any, method1: string, args1: any[], method2: string, args2?: any[]): Promise<any>;
	/**
	 * Returns a promise that resolves the with result of the method call or undefined.
	 */
	export function promiseInvokeOrNoop(O: any, P: string, args?: any[]): Promise<any>;

}
declare module 'dojo-core/streams/WritableStream' {
	import { Strategy } from 'dojo-core/streams/interfaces';
	import Promise from 'dojo-core/Promise';
	import SizeQueue from 'dojo-core/streams/SizeQueue';
	export interface Record<T> {
	    close?: boolean;
	    chunk?: T;
	    reject?: (error: Error) => void;
	    resolve?: () => void;
	}
	/**
	 * WritableStream's possible states
	 */
	export enum State {
	    Closed = 0,
	    Closing = 1,
	    Errored = 2,
	    Waiting = 3,
	    Writable = 4,
	}
	/**
	 * The Sink interface defines the methods a module can implement to create a target sink for a `WritableStream`.
	 *
	 * The Stream API provides a consistent stream API while `ReadableStream.Source` and `WritableStream.Sink` implementors
	 * provide the logic to connect a stream to specific data sources & sinks.
	 */
	export interface Sink<T> {
	    /**
	     * Indicates the stream is prematurely closing due to an error.  The sink should do any necessary cleanup
	     * and release resources. When a stream calls `abort` it will discard any queued chunks. If the sink does not
	     * provide an `abort` method then the stream will call `close` instead.
	     *
	     * @param reason The reason the stream is closing.
	     */
	    abort?(reason?: any): Promise<void>;
	    /**
	     * Indicates the stream is closing.  The sink should do any necessary cleanup and release resources. The stream
	     * will not call this method until is has successfully written all queued chunks.
	     */
	    close?(): Promise<void>;
	    /**
	     * Requests the sink to prepare for receiving chunks.
	     *
	     * @param error An error callback that can be used at any time by the sink to indicate an error has occurred.
	     * @returns A promise that resolves when the sink's start operation has finished.  If the promise rejects,
	     * 		the stream will be errored.
	     */
	    start?(error: (error: Error) => void): Promise<void>;
	    /**
	     * Requests the sink write a chunk.
	     *
	     * @param chunk The chunk to be written.
	     * @returns A promise that resolves when the sink's write operation has finished.  If the promise rejects,
	     * 		the stream will be errored.
	     */
	    write?(chunk: T): Promise<void>;
	}
	/**
	 * This class provides a writable stream implementation. Data written to a stream will be passed on to the underlying
	 * sink (`WritableStream.Sink`), an instance of which must be supplied to the stream upon instantation. This class
	 * provides the standard stream API, while implementations of the `Sink` API allow the data to be written to
	 * various persistence layers.
	 */
	export default class WritableStream<T> {
	    /**
	     * @returns A promise that is resolved when the stream is closed, or is rejected if the stream errors.
	     */
	    closed: Promise<void>;
	    /**
	     * @returns A promise that is resolved when the stream transitions away from the 'waiting' state. The stream will
	     * use this to indicate backpressure - an unresolved `ready` promise indicates that writes should not yet be
	     * performed.
	     */
	    ready: Promise<void>;
	    /**
	     * @returns The stream's current @State
	     */
	    state: State;
	    protected _advancing: boolean;
	    protected _closedPromise: Promise<void>;
	    protected _readyPromise: Promise<void>;
	    protected _rejectClosedPromise: (error: Error) => void;
	    protected _rejectReadyPromise: (error: Error) => void;
	    protected _resolveClosedPromise: () => void;
	    protected _resolveReadyPromise: () => void;
	    protected _started: boolean;
	    protected _startedPromise: Promise<any>;
	    protected _state: State;
	    protected _storedError: Error;
	    protected _strategy: Strategy<T>;
	    protected _underlyingSink: Sink<T>;
	    protected _queue: SizeQueue<Record<T>>;
	    protected _writing: boolean;
	    constructor(underlyingSink?: Sink<T>, strategy?: Strategy<T>);
	    protected _advanceQueue(): void;
	    protected _close(): void;
	    protected _error(error: Error): void;
	    protected _syncStateWithQueue(): void;
	    /**
	     * Signals that the producer can no longer write to the stream and it should be immediately moved to an "errored"
	     * state. Any un-written data that is queued will be discarded.
	     */
	    abort(reason: any): Promise<void>;
	    /**
	     * Signals that the producer is done writing to the stream and wishes to move it to a "closed" state. The stream
	     * may have un-writted data queued; until the data has been written the stream will remain in the "closing" state.
	     */
	    close(): Promise<void>;
	    /**
	     * Enqueue a chunk of data to be written to the underlying sink. `write` can be called successively without waiting
	     * for the previous write's promise to resolve. To respect the stream's backpressure indicator, check if the stream
	     * has entered the "waiting" state between writes.
	     *
	     * @returns A promise that will be fulfilled when the chunk has been written to the underlying sink.
	     */
	    write(chunk: T): Promise<void>;
	}

}
declare module 'dojo-core/streams/TransformStream' {
	import { Strategy } from 'dojo-core/streams/interfaces';
	import ReadableStream from 'dojo-core/streams/ReadableStream';
	import WritableStream from 'dojo-core/streams/WritableStream';
	/**
	 * The `Transform` interface defines the requirements for a transform object to be supplied to a
	 * {@link TransformStream} instance.
	 */
	export interface Transform<R, W> {
	    /**
	     * The `transform` method should accept a chunk, an `enqueueInReadable` function, and a `transformDone` function.
	     * The chunk is the data to be transformed. The transform function should perform any transform logic on the chunk
	     * and then call the supplied `enqueueInReadable` function, passing it the transformed data. After that it should
	     * call the supplied `transformDone` function to notify the `TransformStream` that transformation is complete.
	     */
	    transform(chunk: W, enqueueInReadable: (chunk: R) => void, transformDone: () => void): void;
	    /**
	     * The `flush` method will be called by the `TransformStream` when its {@link WritableStream} is closed. Any logic
	     * the transformer may wish to run when the stream is closed can be supplied in this function. Any pending data
	     * can still be enqueued using the supplied `enqueue` function. When the transformer has finished transforming all
	     * data and is ready to close the {@link ReadableStream} it should call the supplied `close` function.
	     */
	    flush(enqueue: Function, close: Function): void;
	    /**
	     * If supplied, this strategy will be used for the `Transformer`'s internal {@link ReadableStream}
	     */
	    readableStrategy: Strategy<R>;
	    /**
	     * If supplied, this strategy will be used for the `Transformer`'s internal {@link WritableStream}
	     */
	    writableStrategy: Strategy<W>;
	}
	/**
	 * A `TransformStream` is both readable and writable. Its purpose is to apply some transform logic to everything that
	 * is written to it and provide the transformed data via its reader. As such, it requires no `ReadableStream`,
	 * `WritableStream`, or `Source` or `Sink` to be supplied - it provides its own.
	 *
	 * It does require an object that implements the {@link Transform} interface to be supplied. The `transform` method
	 * will be applied to all data written to the stream.
	 *
	 * The readable stream API is available via the `TransformStream`'s `readable` property, which is a
	 * {@link ReadableStream}. The writable stream API is available via the `TransformStream`'s `writable` property, which
	 * is a {@link WritableStream}.
	 */
	export default class TransformStream<R, W> {
	    readable: ReadableStream<R>;
	    writable: WritableStream<W>;
	    constructor(transformer: Transform<R, W>);
	}

}
declare module 'dojo-core/streams/ReadableStream' {
	import { Strategy } from 'dojo-core/streams/interfaces';
	import Promise from 'dojo-core/Promise';
	import ReadableStreamController from 'dojo-core/streams/ReadableStreamController';
	import ReadableStreamReader from 'dojo-core/streams/ReadableStreamReader';
	import SizeQueue from 'dojo-core/streams/SizeQueue';
	import TransformStream from 'dojo-core/streams/TransformStream';
	import WritableStream from 'dojo-core/streams/WritableStream';
	/**
	 * Options used when piping a readable stream to a writable stream.
	 */
	export interface PipeOptions {
	    /**
	     * Prevents the writable stream from erroring if the readable stream encounters an error.
	     */
	    preventAbort?: boolean;
	    /**
	     *  Prevents the readable stream from erroring if the writable stream encounters an error.
	     */
	    preventCancel?: boolean;
	    /**
	     * Prevents the writable stream from closing when the pipe operation completes.
	     */
	    preventClose?: boolean;
	}
	/**
	 * The Source interface defines the methods a module can implement to create a source for a {@link ReadableStream}.
	 *
	 * The Stream API provides a consistent stream API while {@link ReadableStream.Source} and {@link WritableStream.Sink}
	 * implementations provide the logic to connect a stream to specific data sources & sinks.
	 */
	export interface Source<T> {
	    /**
	     * Tells the source to prepare for providing chunks to the stream.  While the source may enqueue chunks at this
	     * point, it is not required.
	     *
	     * @param controller The source can use the controller to enqueue chunks, close the stream or report an error.
	     * @returns A promise that resolves when the source's start operation has finished.  If the promise rejects,
	     * 		the stream will be errored.
	     */
	    start?(controller: ReadableStreamController<T>): Promise<void>;
	    /**
	     * Requests that source enqueue chunks.  Use the controller to close the stream when no more chunks can
	     * be provided.
	     *
	     * @param controller The source can use the controller to enqueue chunks, close the stream or report an error.
	     * @returns A promise that resolves when the source's pull operation has finished.  If the promise rejects,
	     * 		the stream will be errored.
	     */
	    pull?(controller: ReadableStreamController<T>): Promise<void>;
	    /**
	     * Optional method implemented by seekable sources to set the seek position. Use the controller to report an error.
	     * @param controller The source can use the controller to report an error.
	     * @param position The position in the stream to seek to.
	     * @returns A promise that resolves to the new seek position when the source's seek operation has finished.  If the
	     *  	promise rejects, the stream will be errored.
	     */
	    seek?(controller: ReadableStreamController<T>, position: number): Promise<number>;
	    /**
	     * Indicates the stream is prematurely closing and allows the source to do any necessary clean up.
	     *
	     * @param reason The reason why the stream is closing.
	     * @returns A promise that resolves when the source's pull operation has finished.  If the promise rejects,
	     * 		the stream will be errored.
	     */
	    cancel?(reason?: any): Promise<void>;
	}
	/**
	 * `ReadableStream`'s possible states
	 */
	export enum State {
	    Readable = 0,
	    Closed = 1,
	    Errored = 2,
	}
	/**
	 * Implementation of a readable stream.
	 */
	export default class ReadableStream<T> {
	    protected _allowPull: boolean;
	    /**
	     * Returns a number indicating how much additional data can be pushed by the source to the stream's queue before it
	     * exceeds its `highWaterMark`. An underlying source should use this information to determine when and how to apply
	     * backpressure.
	     *
	     * @returns The stream's strategy's `highWaterMark` value minus the queue size
	     */
	    desiredSize: number;
	    hasSource: boolean;
	    /**
	     * A stream can only have one reader at a time. This value indicates if a stream already has a reader, and hence
	     * cannot be read from other than by that reader. When a consumer is done with a reader they can dissociate it
	     * by calling {@link ReadableStreamReader#releaseLock}.
	     *
	     * @returns True if the stream has a reader associated with it
	     */
	    locked: boolean;
	    readable: boolean;
	    /**
	     * This promise will resolve when the stream's underlying source has started and is ready to provide data. If
	     * the {@link ReadableStreamReader#read} method is called before the stream has started it will not do anything.
	     * Wait for this promise to resolve to ensure that your `read` calls are responded to as promptly as possible.
	     *
	     * @returns A promise that resolves when the stream is ready to be read from.
	     */
	    started: Promise<void>;
	    queueSize: number;
	    protected _pullingPromise: Promise<void>;
	    protected _started: boolean;
	    protected _startedPromise: Promise<void>;
	    protected _strategy: Strategy<T>;
	    protected _underlyingSource: Source<T>;
	    closeRequested: boolean;
	    controller: ReadableStreamController<T>;
	    pullScheduled: boolean;
	    queue: SizeQueue<T>;
	    reader: ReadableStreamReader<T>;
	    state: State;
	    storedError: Error;
	    /**
	     * A `ReadableStream` requires an underlying source to supply data. The source interacts with the stream through
	     * a {@link ReadableStreamController} that is associated with the stream, and provided to the source.
	     *
	     * @constructor
	     * @param underlyingSource The source object that supplies data to the stream by interacting with its controller.
	     * @param strategy The strategy for this stream.
	     */
	    constructor(underlyingSource: Source<T>, strategy?: Strategy<T>);
	    protected _cancel(reason?: any): Promise<void>;
	    protected _shouldApplyBackPressure(): boolean;
	    /**
	     *
	     * @param reason A description of the reason the stream is being canceled.
	     * @returns A promise that resolves when the stream has closed and the call to the underlying source's `cancel`
	     * method has completed.
	     */
	    cancel(reason?: any): Promise<void>;
	    /**
	     * Closes the stream without regard to the status of the queue.  Use {@link requestClose} to close the
	     * stream and allow the queue to flush.
	     *
	     */
	    close(): void;
	    enqueue(chunk: T): void;
	    error(error: Error): void;
	    /**
	     * create a new {@link ReadableStreamReader} and lock the stream to the new reader
	     */
	    getReader(): ReadableStreamReader<T>;
	    pipeThrough(transformStream: TransformStream<T, any>, options?: PipeOptions): ReadableStream<T>;
	    pipeTo(dest: WritableStream<T>, options?: PipeOptions): Promise<void>;
	    pull(): void;
	    /**
	     * Requests the stream be closed.  This method allows the queue to be emptied before the stream closes.
	     *
	     */
	    requestClose(): void;
	    /**
	     * Tee a readable stream, returning a two-element array containing
	     * the two resulting ReadableStream instances
	     */
	    tee(): [ReadableStream<T>, ReadableStream<T>];
	}

}
declare module 'dojo-core/streams/adapters/ReadableNodeStreamSource' {
	import Promise from 'dojo-core/Promise';
	import { Source } from 'dojo-core/streams/ReadableStream';
	import ReadableStreamController from 'dojo-core/streams/ReadableStreamController';
	import { Readable } from 'stream';
	export type NodeSourceType = Buffer | string;
	export default class ReadableNodeStreamSource implements Source<NodeSourceType> {
	    protected _controller: ReadableStreamController<NodeSourceType>;
	    protected _isClosed: boolean;
	    protected _onClose: () => void;
	    protected _onError: (error: Error) => void;
	    protected _nodeStream: Readable;
	    protected _shouldResume: boolean;
	    constructor(nodeStream: Readable);
	    protected _close(): void;
	    protected _handleClose(): void;
	    protected _handleError(error: Error): void;
	    protected _removeListeners(): void;
	    cancel(reason?: any): Promise<void>;
	    pull(controller: ReadableStreamController<NodeSourceType>): Promise<void>;
	    start(controller: ReadableStreamController<NodeSourceType>): Promise<void>;
	}

}
declare module 'dojo-core/streams/adapters/WritableNodeStreamSink' {
	import Promise from 'dojo-core/Promise';
	import { Sink } from 'dojo-core/streams/WritableStream';
	export type NodeSourceType = Buffer | string;
	export default class WritableNodeStreamSink implements Sink<NodeSourceType> {
	    protected _encoding: string;
	    protected _isClosed: boolean;
	    protected _nodeStream: NodeJS.WritableStream;
	    protected _onError: (error: Error) => void;
	    protected _rejectWritePromise: Function;
	    constructor(nodeStream: NodeJS.WritableStream, encoding?: string);
	    protected _handleError(error: Error): void;
	    protected _removeListeners(): void;
	    abort(reason: any): Promise<void>;
	    close(): Promise<void>;
	    start(): Promise<void>;
	    write(chunk: string): Promise<void>;
	}

}
declare module 'dojo-core/request/util' {
	import { RequestOptions } from 'dojo-core/request';
	/**
	 * Returns a URL formatted with optional query string and cache-busting segments.
	 *
	 * @param url The base URL.
	 * @param options The options hash that is used to generate the query string.
	 */
	export function generateRequestUrl(url: string, options: RequestOptions): string;

}
declare module 'dojo-core/request/node' {
	import { RequestOptions, ResponsePromise } from 'dojo-core/request';
	import WritableStream from 'dojo-core/streams/WritableStream';
	export interface NodeRequestOptions<T> extends RequestOptions {
	    agent?: any;
	    ca?: any;
	    cert?: string;
	    ciphers?: string;
	    dataEncoding?: string;
	    followRedirects?: boolean;
	    key?: string;
	    localAddress?: string;
	    passphrase?: string;
	    pfx?: any;
	    proxy?: string;
	    rejectUnauthorized?: boolean;
	    secureProtocol?: string;
	    socketPath?: string;
	    socketOptions?: {
	        keepAlive?: number;
	        noDelay?: boolean;
	        timeout?: number;
	    };
	    streamData?: boolean;
	    streamEncoding?: string;
	    streamTarget?: WritableStream<T>;
	}
	export default function node<T>(url: string, options?: NodeRequestOptions<T>): ResponsePromise<T>;

}
declare module 'dojo-core/util' {
	import { Handle } from 'dojo-core/interfaces';
	/**
	 * Wraps a setTimeout call in a handle, allowing the timeout to be cleared by calling destroy.
	 *
	 * @param callback Callback to be called when the timeout elapses
	 * @param delay Number of milliseconds to wait before calling the callback
	 * @return Handle which can be destroyed to clear the timeout
	 */
	export function createTimer(callback: (...args: any[]) => void, delay?: number): Handle;
	/**
	 * Wraps a callback, returning a function which fires after no further calls are received over a set interval.
	 *
	 * @param callback Callback to wrap
	 * @param delay Number of milliseconds to wait after any invocations before calling the original callback
	 * @return Debounced function
	 */
	export function debounce<T extends (...args: any[]) => void>(callback: T, delay: number): T;
	/**
	 * Wraps a callback, returning a function which fires at most once per set interval.
	 *
	 * @param callback Callback to wrap
	 * @param delay Number of milliseconds to wait before allowing the original callback to be called again
	 * @return Throttled function
	 */
	export function throttle<T extends (...args: any[]) => void>(callback: T, delay: number): T;
	/**
	 * Like throttle, but calls the callback at the end of each interval rather than the beginning.
	 * Useful for e.g. resize or scroll events, when debounce would appear unresponsive.
	 *
	 * @param callback Callback to wrap
	 * @param delay Number of milliseconds to wait before calling the original callback and allowing it to be called again
	 * @return Throttled function
	 */
	export function throttleAfter<T extends (...args: any[]) => void>(callback: T, delay: number): T;

}
declare module 'dojo-core/request/xhr' {
	import { RequestOptions, ResponsePromise } from 'dojo-core/request';
	export interface XhrRequestOptions extends RequestOptions {
	    blockMainThread?: boolean;
	}
	export default function xhr<T>(url: string, options?: XhrRequestOptions): ResponsePromise<T>;

}
declare module 'dojo-core/streams/ArraySink' {
	import Promise from 'dojo-core/Promise';
	import { Sink } from 'dojo-core/streams/WritableStream';
	/**
	 * A WritableStream sink that collects the chunks it receives and
	 * stores them into an array.  Use the chunks property to retrieve
	 * the collection of chunks.
	 */
	export default class ArraySink<T> implements Sink<T> {
	    chunks: T[];
	    abort(reason: any): Promise<void>;
	    close(): Promise<void>;
	    start(error: () => void): Promise<void>;
	    write(chunk: T): Promise<void>;
	}

}
declare module 'dojo-core/streams/ArraySource' {
	import Promise from 'dojo-core/Promise';
	import { Source } from 'dojo-core/streams/ReadableStream';
	import ReadableStreamController from 'dojo-core/streams/ReadableStreamController';
	/**
	 * A seekable array source
	 */
	export default class ArraySource<T> implements Source<T> {
	    currentPosition: number;
	    data: Array<T>;
	    constructor(data: Array<T>);
	    seek(controller: ReadableStreamController<T>, position: number): Promise<number>;
	    start(controller: ReadableStreamController<T>): Promise<void>;
	    pull(controller: ReadableStreamController<T>): Promise<void>;
	    cancel(reason?: any): Promise<void>;
	}

}
declare module 'dojo-core/streams/QueuingStrategy' {
	import { Strategy } from 'dojo-core/streams/interfaces';
	export default class QueuingStrategy<T> implements Strategy<T> {
	    highWaterMark: number;
	    constructor(kwArgs: KwArgs);
	}
	export interface KwArgs {
	    highWaterMark: number;
	}

}
declare module 'dojo-core/streams/ByteLengthQueuingStrategy' {
	import QueuingStrategy from 'dojo-core/streams/QueuingStrategy';
	export default class ByteLengthQueuingStrategy<T> extends QueuingStrategy<T> {
	    size(chunk: T): number;
	}

}
declare module 'dojo-core/streams/CountQueuingStrategy' {
	import QueuingStrategy from 'dojo-core/streams/QueuingStrategy';
	export default class CountQueuingStrategy<T> extends QueuingStrategy<T> {
	    size(chunk: T): number;
	}

}
declare module 'dojo-core/streams/SeekableStreamReader' {
	import Promise from 'dojo-core/Promise';
	import ReadableStreamReader, { ReadResult } from 'dojo-core/streams/ReadableStreamReader';
	import SeekableStream from 'dojo-core/streams/SeekableStream';
	export default class SeekableStreamReader<T> extends ReadableStreamReader<T> {
	    protected _currentPosition: number;
	    protected _ownerReadableStream: SeekableStream<T>;
	    currentPosition: number;
	    read(): Promise<ReadResult<T>>;
	    seek(position: number): Promise<number>;
	}

}
declare module 'dojo-core/streams/SeekableStream' {
	import { Strategy } from 'dojo-core/streams/interfaces';
	import Promise from 'dojo-core/Promise';
	import ReadableStream, { Source } from 'dojo-core/streams/ReadableStream';
	import SeekableStreamReader from 'dojo-core/streams/SeekableStreamReader';
	export default class SeekableStream<T> extends ReadableStream<T> {
	    preventClose: boolean;
	    reader: SeekableStreamReader<T>;
	    /**
	     * @param preventClose (default=true) Prevent the stream from closing when it reaches the end.
	     * If true, the stream will not close when requestClose is called on the controller (which is typically done by the
	     * source when it reaches its end). This allows for re-seeking in a stream that has already been read to the end.
	     * The stream can be closed by calling ReadableStream#close.
	     */
	    constructor(underlyingSource: Source<T>, strategy?: Strategy<T>, preventClose?: boolean);
	    getReader(): SeekableStreamReader<T>;
	    requestClose(): void;
	    seek(position: number): Promise<number>;
	    strategy: Strategy<T>;
	}

}
declare module 'dojo-core/streams/adapters/EventedStreamSource' {
	import Evented from 'dojo-core/Evented';
	import { Handle } from 'dojo-core/interfaces';
	import { EventEmitter } from 'dojo-core/on';
	import Promise from 'dojo-core/Promise';
	import { Source } from 'dojo-core/streams/ReadableStream';
	import ReadableStreamController from 'dojo-core/streams/ReadableStreamController';
	export type EventTargetTypes = Evented | EventEmitter | EventTarget;
	export type EventTypes = string | string[];
	export default class EventedStreamSource implements Source<Event> {
	    protected _controller: ReadableStreamController<Event>;
	    protected _target: EventTargetTypes;
	    protected _events: string[];
	    protected _handles: Handle[];
	    constructor(target: EventTargetTypes, type: EventTypes);
	    start(controller: ReadableStreamController<Event>): Promise<void>;
	    cancel(reason?: any): Promise<void>;
	    protected _handleEvent(event: Event): void;
	}

}
