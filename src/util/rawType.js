var toStr = Object.prototype.toString;

/**
 * get the native type name of an input. e.g.:
 *
 * rawType([]) === "[object Array]"
 * rawType(new Promise()) === "[object Promise]"
 *
 * @param value
 * @returns {*}
 */
export default function rawType(value) {
    return toStr.call(value);
}
