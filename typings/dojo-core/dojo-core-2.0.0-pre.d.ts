/// <reference path="../node/node.d.ts" />
declare module 'dojo-core/global' {
	 var globalObject: any;
	export default globalObject;

}
declare module 'dojo-core/has' {
	export var cache: {
	    [feature: string]: any;
	};
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
declare module 'dojo-core/interfaces' {
	export interface Handle {
		destroy(): void;
	}

}
declare module 'dojo-core/queue' {
	import { Handle } from 'dojo-core/interfaces';
	export interface QueueItem {
	    isActive: boolean;
	    callback: (...args: any[]) => any;
	}
	export let queueTask: (callback: (...args: any[]) => any) => Handle;
	/**
	 * Since requestAnimationFrame's behavior does not match that expected from `queueTask`, it is not used there.
	 * However, at times it makes more sense to delegate to requestAnimationFrame; hence the following method.
	 */
	export let queueDomTask: (callback: (...args: any[]) => any) => Handle;
	export let queueMicroTask: (callback: (...args: any[]) => any) => Handle;

}
declare module 'dojo-core/nextTick' {
	import { Handle } from 'dojo-core/interfaces'; let nextTick: (callback: () => void) => Handle;
	export default nextTick;

}
declare module 'dojo-core/Promise' {
	/**
	 * Return true if a given value has a `then` method.
	 */
	export function isThenable(value: any): boolean;
	/**
	 * Executor is the interface for functions used to initialize a Promise.
	 */
	export interface Executor<T> {
	    (resolve: (value?: T | Thenable<T>) => void, reject: (reason?: any) => void): void;
	}
	/**
	 * PromiseShim is an implementation of the ES2015 Promise specification.
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
	    static reject<T>(reason?: any): PromiseShim<T>;
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
	    catch<U>(onRejected: (reason?: any) => (U | Thenable<U>)): PromiseShim<U>;
	    then<U>(onFulfilled?: (value?: T) => (U | Thenable<U>), onRejected?: (reason?: any) => (U | Thenable<U>)): PromiseShim<U>;
	}
	/**
	 * PlatformPromise is a very thin wrapper around either a native promise implementation or PromiseShim.
	 */
	export default class Promise<T> implements Thenable<T> {
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
	     * Copy another Promise, taking on its inner state.
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
declare module 'dojo-core/async/async' {
	import Promise from 'dojo-core/Promise';

	export interface Identity<T> {
		(value: T): Promise<T>;
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
	import { Identity } from 'dojo-core/async/async';
	/**
	 * Used for delaying a Promise chain for a specific number of milliseconds.
	 *
	 * @param milliseconds the number of milliseconds to delay
	 * @return {function(T): Promise<T>} a function producing a promise that eventually returns the value passed to it; usable with Thenable.then()
	 */
	export function delay<T>(milliseconds: number): Identity<T>;
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
declare module 'dojo-core/observers/interfaces' {
	import core = require('dojo-core/interfaces');
	export interface Observer extends core.Handle {
	    observeProperty(...property: string[]): void;
	    removeProperty(...property: string[]): void;
	    nextTurn?: boolean;
	    onlyReportObserved?: boolean;
	}
	export interface PropertyEvent {
	    target: {};
	    name: string;
	}

}
declare module 'dojo-core/object' {
	/**
	 * Copies the values of all enumerable own properties of one or more source objects to the target object.
	 * @return The modified target object
	 */
	export function assign(target: any, ...sources: any[]): any;
	/**
	 * Determines whether two values are the same value.
	 * @return true if the values are the same; false otherwise
	 */
	export function is(value1: any, value2: any): boolean;

}
declare module 'dojo-core/lang' {
	import * as observers from 'dojo-core/observers/interfaces';
	import ObjectObserver from 'dojo-core/observers/ObjectObserver';
	export function copy(kwArgs: CopyArgs): any;
	export interface CopyArgs {
	    deep?: boolean;
	    descriptors?: boolean;
	    inherited?: boolean;
	    assignPrototype?: boolean;
	    target?: any;
	    sources: any[];
	}
	export function create(prototype: {}, ...mixins: {}[]): {};
	export function duplicate(source: {}): {};
	export function getPropertyNames(object: {}): string[];
	export function getPropertyDescriptor(object: Object, property: string): PropertyDescriptor;
	export function isIdentical(a: any, b: any): boolean;
	export function lateBind(instance: {}, method: string, ...suppliedArgs: any[]): (...args: any[]) => any;
	export function observe(target: {}, listener: (events: observers.PropertyEvent[]) => any): ObjectObserver;
	export function partial(targetFunction: (...args: any[]) => any, ...suppliedArgs: any[]): (...args: any[]) => any;

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
	 * Returns the hyperbolic cosine of a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function cosh(n: number): number;
	/**
	 * Returns the square root of the sum of squares of its arguments.
	 *
	 * @return The result
	 */
	export function hypot(...args: number[]): number;
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
	 * Returns e raised to the specified power minus one.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function expm1(n: number): number;
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
	 * Returns the nearest single-precision float representation of a number.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export var fround: (n: number) => number;
	/**
	 * Returns the result of the 32-bit multiplication of the two parameters.
	 *
	 * @param n The number to use in calculation
	 * @param m The number to use in calculation
	 * @return The result
	 */
	export function imul(n: number, m: number): number;
	/**
	 * Returns the sign of a number, indicating whether the number is positive.
	 *
	 * @param n The number to use in calculation
	 * @return 1 if the number is positive, -1 if the number is negative, or 0 if the number is 0 or NaN
	 */
	export function sign(n: number): number;
	/**
	 * Returns the integral part of a number by removing any fractional digits.
	 *
	 * @param n The number to use in calculation
	 * @return The result
	 */
	export function trunc(n: number): number;

}
declare module 'dojo-core/streams/TransformStream' {
	import ReadableStream from 'dojo-core/streams/ReadableStream';
	import WritableStream from 'dojo-core/streams/WritableStream';
	import { Strategy } from 'dojo-core/streams/interfaces';
	export interface Transform<R, W> {
	    transform(chunk: W, enqueueInReadable: (chunk: R) => void, transformDone: () => void): void;
	    flush(enqueue: Function, close: Function): void;
	    writableStrategy: Strategy<W>;
	    readableStrategy: Strategy<R>;
	}
	export default class TransformStream<R, W> {
	    readable: ReadableStream<R>;
	    writable: WritableStream<W>;
	    constructor(transformer: Transform<R, W>);
	}

}
declare module 'dojo-core/streams/SizeQueue' {
	export default class SizeQueue<T> {
	    private _queue;
	    dequeue(): T;
	    enqueue(value: T, size: number): void;
	    empty(): void;
	    peek(): T;
	    totalSize: number;
	    length: number;
	}

}
declare module 'dojo-core/streams/ReadableStream' {
	import ReadableStreamController from 'dojo-core/streams/ReadableStreamController';
	import ReadableStreamReader from 'dojo-core/streams/ReadableStreamReader';
	import TransformStream from 'dojo-core/streams/TransformStream';
	import WritableStream from 'dojo-core/streams/WritableStream';
	import { Strategy } from 'dojo-core/streams/interfaces';
	import SizeQueue from 'dojo-core/streams/SizeQueue';
	import Promise from 'dojo-core/Promise';
	/**
	 * Options used when piping a readable stream to a writable stream.
	 */
	export interface PipeOptions {
	    /**
	     * Prevents the writable stream from closing when the pipe operation completes.
	     */
	    preventClose?: boolean;
	    /**
	     * Prevents the writable stream from erroring if the readable stream encounters an error.
	     */
	    preventAbort?: boolean;
	    /**
	     *  Prevents the readable stream from erroring if the writable stream encounters an error.
	     */
	    preventCancel?: boolean;
	}
	/**
	 * Implementation of a readable stream.
	 */
	export default class ReadableStream<T> {
	    state: State;
	    _closeRequested: boolean;
	    _controller: ReadableStreamController<T>;
	    _pullingPromise: Promise<void>;
	    _pullScheduled: boolean;
	    _reader: ReadableStreamReader<T>;
	    _queue: SizeQueue<T>;
	    _started: boolean;
	    _startedPromise: Promise<void>;
	    _storedError: Error;
	    _strategy: Strategy<T>;
	    _underlyingSource: Source<T>;
	    /**
	     * @constructor
	     */
	    constructor(underlyingSource: Source<T>, strategy?: Strategy<T>);
	    /**
	     * 3.5.7. GetReadableStreamDesiredSize ( stream )
	     * @returns {number}
	     */
	    desiredSize: number;
	    queueSize: number;
	    /**
	     *
	     * @param reason
	     * @returns {null}
	     */
	    cancel(reason?: any): Promise<void>;
	    _cancel(reason?: any): Promise<void>;
	    /**
	     * Requests the stream be closed.  This method allows the queue to be emptied before the stream closes.
	     *
	     * 3.5.3. CloseReadableStream ( stream )
	     * @alias CloseReadableStream
	     */
	    _requestClose(): void;
	    /**
	     * Closes the stream without regard to the status of the queue.  Use {@link _requestClose} to close the
	     * stream and allow the queue to flush.
	     *
	     * 3.5.4. FinishClosingReadableStream ( stream )
	     * @private
	     */
	    _close(): void;
	    /**
	     * @alias EnqueueInReadableStream
	     */
	    enqueue(chunk: T): void;
	    error(error: Error): void;
	    /**
	     * create a new ReadableStreamReader and lock the stream to the new reader
	     * @alias AcquireREadableStreamReader
	     */
	    getReader(): ReadableStreamReader<T>;
	    /**
	     * @alias IsReadableStreamLocked
	     */
	    locked: boolean;
	    readable: boolean;
	    hasSource: boolean;
	    pipeThrough(transformStream: TransformStream<T, any>, options?: PipeOptions): ReadableStream<T>;
	    pipeTo(dest: WritableStream<T>, options?: PipeOptions): Promise<void>;
	    /**
	     * @alias RequestReadableStreamPull
	     */
	    _pull(): void;
	    started: Promise<void>;
	    /**
	     * Tee a readable stream, returning a two-element array containing
	     * the two resulting ReadableStream instances
	     * @alias TeeReadableStream
	     */
	    tee(): [ReadableStream<T>, ReadableStream<T>];
	    /**
	     * @alias ShouldReadableStreamPull
	     */
	    _allowPull: boolean;
	    /**
	     * @alias shouldReadableStreamApplyBackPressure
	     */
	    _shouldApplyBackPressure(): boolean;
	}
	export interface Source<T> {
	    start(controller: ReadableStreamController<T>): Promise<void>;
	    pull(controller: ReadableStreamController<T>): Promise<void>;
	    cancel(reason?: any): Promise<void>;
	}
	/**
	 * ReadableStream's possible states
	 */
	export enum State {
	    Readable = 0,
	    Closed = 1,
	    Errored = 2,
	}

}
declare module 'dojo-core/streams/ReadableStreamController' {
	import ReadableStream from 'dojo-core/streams/ReadableStream';
	export default class ReadableStreamController<T> {
	    private _controlledReadableStream;
	    /**
	     * 3.3.4.1. get desiredSize
	     * @returns {number}
	     */
	    desiredSize: number;
	    constructor(stream: ReadableStream<T>);
	    /**
	     *
	     */
	    close(): void;
	    /**
	     *
	     */
	    enqueue(chunk: T): void;
	    /**
	     *
	     */
	    error(e: Error): void;
	}
	/**
	 * 3.5.9-1 has been ignored
	 */
	export function isReadableStreamController(x: any): boolean;

}
declare module 'dojo-core/streams/interfaces' {
	import ReadableStreamController from 'dojo-core/streams/ReadableStreamController';
	import Promise from 'dojo-core/Promise';

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
declare module 'dojo-core/streams/util' {
	import { Strategy } from 'dojo-core/streams/interfaces';
	import Promise from 'dojo-core/Promise';
	export function promiseInvokeOrFallbackOrNoop(object: any, method1: string, args1: any[], method2: string, args2?: any[]): Promise<any>;
	/**
	 * return a promise that resolves the with result of the method call or undefined
	 */
	export function promiseInvokeOrNoop(O: any, P: string, args?: any[]): Promise<any>;
	/**
	 * call the method or return undefined
	 */
	export function invokeOrNoop(O: any, P: string, args?: any[]): any;
	/**
	 *
	 */
	export function createDataProperty(object: {}, property: string, value: any): void;
	export function normalizeStrategy<T>({size, highWaterMark}: Strategy<T>): Strategy<T>;
	export function getApproximateByteSize(object: any): number;

}
declare module 'dojo-core/streams/ArraySink' {
	import { Sink } from 'dojo-core/streams/WritableStream';
	import Promise from 'dojo-core/Promise';
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
	    /**
	     *
	     * @param chunk
	     */
	    write(chunk: T): Promise<void>;
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
declare module 'dojo-core/string' {
	export function escapeRegExp(text: string): string;
	export function escapeXml(xml: string, forAttribute?: boolean): string;
	export function padStart(text: string, size: number, character?: string): string;
	export function padEnd(text: string, size: number, character?: string): string;

}
