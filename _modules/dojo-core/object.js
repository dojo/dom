(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    /**
     * Determines whether two values are the same value.
     * @return true if the values are the same; false otherwise
     */
    function is(value1, value2) {
        if (value1 === value2) {
            return value1 !== 0 || 1 / value1 === 1 / value2; // -0
        }
        return value1 !== value1 && value2 !== value2; // NaN
    }
    exports.is = is;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL29iamVjdC50cyJdLCJuYW1lcyI6WyJpcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFBQTs7O09BR0c7SUFDSCxZQUFtQixNQUFXLEVBQUUsTUFBVztRQUMxQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsS0FBS0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLE1BQU1BLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLE1BQU1BLEtBQUtBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBLENBQUNBLEtBQUtBO1FBQ3hEQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxNQUFNQSxLQUFLQSxNQUFNQSxJQUFJQSxNQUFNQSxLQUFLQSxNQUFNQSxDQUFDQSxDQUFDQSxNQUFNQTtJQUN0REEsQ0FBQ0E7SUFMZSxVQUFFLEtBS2pCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIERldGVybWluZXMgd2hldGhlciB0d28gdmFsdWVzIGFyZSB0aGUgc2FtZSB2YWx1ZS5cbiAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWVzIGFyZSB0aGUgc2FtZTsgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpcyh2YWx1ZTE6IGFueSwgdmFsdWUyOiBhbnkpOiBib29sZWFuIHtcblx0aWYgKHZhbHVlMSA9PT0gdmFsdWUyKSB7XG5cdFx0cmV0dXJuIHZhbHVlMSAhPT0gMCB8fCAxIC8gdmFsdWUxID09PSAxIC8gdmFsdWUyOyAvLyAtMFxuXHR9XG5cdHJldHVybiB2YWx1ZTEgIT09IHZhbHVlMSAmJiB2YWx1ZTIgIT09IHZhbHVlMjsgLy8gTmFOXG59XG4iXX0=