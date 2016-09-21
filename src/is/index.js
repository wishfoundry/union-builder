import rawType from '../util/rawType';
import $$observable from 'symbol-observable';
import $$iterator from '../util/iteratorSymbol';


export function isBoolean(value) {
    return rawType(value) == '[object Boolean]';
}

export function isNumber(value) {
    return typeof value === 'number';
}

export function isString(value) {
    return typeof value === 'string';
}

export function isFunction(value) {
    return Function.prototype.isPrototypeOf(value);
}

export var isArray = Array.isArray || function isArray(value) {
    return rawType(value) === '[object Array]';
};

export function isDate(value) {
    return rawType(value) == '[object Date';
}

export function isObject(value) {
    return value && (typeof value == 'object' || typeof value == 'function');
}

export function isNull(value) {
    return value === null;
}

export function isDefined(value) {
    return typeof value !== 'undefined';
}

export function isNotDefined(value) {
    return typeof value === 'undefined';
}


export function isArrayLike(obj) {
    var length = obj && obj.length;
    return isNumber(length) && !isString(obj) && length >= 0 && length % 1 === 0;
}

export function isElement(value) {
    return Element.isPrototypeOf(value);
}

export function isNaN(value) {
    return !isNumber || value !== value;
}

export function isObservable(value) {
    return value && value[$$observable];
}

export function isIterable(value) {
    return value && value[$$iterator];
}

export function isFinite(value) {
    return !(typeof value !== 'number' || value !== value || value === Infinity || value === -Infinity);
}


export function isRegExp(value) {
    return rawType(value) == '[object RegExp]';
}

function isThenable(value) {
    return value && isFunction(value.then);
}

function isError(value) {
    return Error.prototype.isPrototypeOf(value);
}


export function getMatcherForPrimitive(type) {
    return (
        type === String ? isString
            : type === Number ? isNumber
            : type === Boolean ? isBoolean
            : type === Object ? isObject
            : type === Array ? isArray
            : type === Function ? isFunction
            : type === RegExp ? isRegExp
            : type === Date ? isDate
            // : type === Element ? isElement
            // : type === HTMLElement ? isElement
            : type === Promise ? isThenable
            : type === Error ? isError
            : null
    );
}

