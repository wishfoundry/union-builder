module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	exports.default = Union;
	
	var _prop = __webpack_require__(14);
	
	var _prop2 = _interopRequireDefault(_prop);
	
	var _curry = __webpack_require__(11);
	
	var _curry2 = _interopRequireDefault(_curry);
	
	var _iteratorSymbol = __webpack_require__(4);
	
	var _iteratorSymbol2 = _interopRequireDefault(_iteratorSymbol);
	
	var _call = __webpack_require__(9);
	
	var _call2 = _interopRequireDefault(_call);
	
	var _num2word = __webpack_require__(8);
	
	var _is = __webpack_require__(3);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var VALIDATORS = "@@Union/Validators";
	var NAME = "@@Union/Name";
	var KEYS = "@@Union/Keys";
	var ARG_TYPE = "@@Union/ArgType";
	var TYPE_COMPARE = "@@Union/TypeCompareFn";
	var IS_TYPE = "isType";
	var RESERVED = [TYPE_COMPARE, VALIDATORS, ARG_TYPE, IS_TYPE, NAME];
	
	var DISABLE_VALIDATION = false;
	
	var ErrorMsg = "bad value {thing} passed as {position} argument to {name} constructor";
	var ListErrorMsg = 'item at {position} location in List has wrong value of {value}';
	
	function BaseUnionType() {}
	
	// = public exposed API ====================================
	
	
	function Union(descriptor) {
	    return buildType(BaseUnionType, descriptor);
	}
	
	Union.ListOf = function (validator) {
	    var List = Union({ List: [Array] });
	    var single = Union({ T: [validator] });
	    var validate = List.case({
	        List: function List(iterable) {
	            var item = null;
	            var i = 0;
	            try {
	                var _iteratorNormalCompletion = true;
	                var _didIteratorError = false;
	                var _iteratorError = undefined;
	
	                try {
	                    for (var _iterator = iterable[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                        item = _step.value;
	
	                        i++;
	                        single.T(item);
	                    }
	                } catch (err) {
	                    _didIteratorError = true;
	                    _iteratorError = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion && _iterator.return) {
	                            _iterator.return();
	                        }
	                    } finally {
	                        if (_didIteratorError) {
	                            throw _iteratorError;
	                        }
	                    }
	                }
	            } catch (e) {
	                throw new TypeError(format(ListErrorMsg, {
	                    value: JSON.stringify(item),
	                    position: (0, _num2word.toWordsOrdinal)(i)
	                }));
	            }
	            return true;
	        }
	    });
	    return function (iterable) {
	        return validate(List.List(iterable));
	    };
	};
	
	//not really sure we want to continue supporting this in future
	Union.setValidationEnabled = function (isEnabled) {
	    return DISABLE_VALIDATION = !isEnabled;
	};
	
	function isAnyUnion(value) {
	    return BaseUnionType.prototype.isPrototypeOf(value) || BaseUnionType.isPrototypeOf(value) || value instanceof BaseUnionType;
	}
	Union.isUnionType = isAnyUnion;
	
	// = constructors ==================================================
	
	
	function buildType(baseType, descriptor) {
	    function isMatchingType(subType) {
	        return MyUnionType.prototype.isPrototypeOf(subType) || subType instanceof MyUnionType;
	    }
	
	    function MyUnionType() {
	        for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
	            values[_key] = arguments[_key];
	        }
	
	        if (!(this instanceof MyUnionType)) return new (Function.prototype.bind.apply(MyUnionType, [null].concat(values)))();
	        Object.assign(this, values);
	    }
	
	    MyUnionType.prototype = new baseType();
	    MyUnionType.case = (0, _curry2.default)(doCaseSwitch)(MyUnionType);
	
	    MyUnionType.prototype.case = function (cases) {
	        return MyUnionType.case(cases, this);
	    };
	
	    MyUnionType.prototype[IS_TYPE] = MyUnionType[IS_TYPE] = isMatchingType;
	
	    eachKey(descriptor, function (key) {
	        var subTypeFactory = buildSubType(descriptor[key], MyUnionType, key, isMatchingType);
	        MyUnionType["new" + capitalize(key)] = subTypeFactory;
	        MyUnionType[key] = subTypeFactory;
	    });
	
	    return MyUnionType;
	}
	
	function buildSubType(fields, parentClass, subTypeName, isParentType) {
	    var isArgsArray = (0, _is.isArray)(fields);
	    var keys = Object.keys(fields);
	    var validators = keys.reduce(function (all, key) {
	        var value = fields[key];
	        // if value is a primitive class, get the matcher function for it
	        // else, we assume the value is the validator func
	        // if value is undefined, we assume the user is building a recursive type
	        all[key] = (0, _is.getMatcherForPrimitive)(value) || ((0, _is.isNotDefined)(value) ? isParentType : value);
	        return all;
	    }, {});
	
	    function SubCaseType() {
	        for (var _len2 = arguments.length, values = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	            values[_key2] = arguments[_key2];
	        }
	
	        if (!(this instanceof SubCaseType)) return new (Function.prototype.bind.apply(SubCaseType, [null].concat(_toConsumableArray(values))))();
	
	        if (!isArgsArray && values.length == 1) {
	            values = values[0];
	        }
	
	        if (!isArgsArray && (typeof values === 'undefined' ? 'undefined' : _typeof(values)) != 'object') {
	            return throwMissingObject(keys);
	        }
	
	        if (DISABLE_VALIDATION) {
	            Object.assign(this, values);
	        } else {
	            values = validateAll(keys, validators, values, subTypeName);
	            Object.assign(this, values);
	        }
	    }
	
	    SubCaseType.prototype = new parentClass();
	    SubCaseType.prototype[NAME] = subTypeName;
	    SubCaseType.prototype[KEYS] = keys;
	    SubCaseType.prototype[VALIDATORS] = validators;
	    SubCaseType.prototype[ARG_TYPE] = isArgsArray ? "array" : "object";
	
	    SubCaseType.prototype[_iteratorSymbol2.default] = function iterator() {
	        var keys = this[KEYS];
	        var values = this;
	        var isArray = this[ARG_TYPE] == "array";
	        return {
	            idx: 0,
	            next: function next() {
	                if (this.idx === keys.length) {
	                    return { done: true };
	                }
	
	                var key = keys[this.idx++];
	                var value = values[key];
	
	                if (isArray) {
	                    return { value: value };
	                }
	
	                return { value: [key, value] };
	            }
	        };
	    };
	
	    SubCaseType.prototype.values = function () {
	        return this[KEYS].map((0, _prop2.default)(_prop2.default, this));
	    };
	
	    SubCaseType.prototype.keys = function () {
	        return Array.prototype.slice.call(this[KEYS]);
	    };
	
	    SubCaseType.prototype[IS_TYPE] = SubCaseType.prototype[TYPE_COMPARE] = SubCaseType[IS_TYPE] = function (obj) {
	        return SubCaseType.prototype.isPrototypeOf(obj);
	    };
	
	    return SubCaseType;
	}
	
	// = shared logic =================================
	
	function doCaseSwitch(baseType, caseFns, caseType) {
	
	    var name = caseType[NAME];
	    var isWildcard = !(name in caseFns) && ("_" in caseFns || "*" in caseFns);
	    var thunk = caseFns[name] || caseFns["_"] || caseFns["*"];
	    var isRelatedCase = baseType[IS_TYPE](caseType);
	
	    if (!(0, _is.isDefined)(thunk)) {
	        throw new TypeError("no matching case handler defined");
	    }
	
	    if ((0, _is.isDefined)(thunk) && !isRelatedCase && !isWildcard) {
	        throw new TypeError("wrong type passed to case, and no wildcard handler was found");
	    }
	
	    if ((0, _is.isArray)(caseType) || caseType[ARG_TYPE] == "array") {
	        return (0, _call2.default)(thunk, argsToArray(caseType));
	    }
	    return thunk(caseType);
	}
	
	function argsToArray(args) {
	    if ((0, _is.isArray)(args)) return args;
	
	    if (args && args[ARG_TYPE] == "array") return args[KEYS].map(function (key) {
	        return args[key];
	    });
	
	    return [args];
	}
	
	function validateAll(expectedKeys, validators, args, parentName) {
	    return expectedKeys.reduce(function (values, key) {
	        validateOne(validators[key], args[key], key, parentName, values);
	        return values;
	    }, args);
	}
	
	function validateOne(validator, value, propertyNameOrIdx, componentName, component) {
	    /*
	     * if we pass a Union AS the validator, we should use the isType() method on it instead
	     * example:
	     *
	     * var Dim = Union({
	     *     Point: {x: Number, y: Number},
	     *     Diff:  {x: Number, y: Number},
	     *     Length: [Number],
	     *     Angle: [isAngle]
	     * });
	     * var Shape = Union({
	     *     //both of these are are valid:
	     *     Line: [Dim.Point, Dim.Point],
	     *     Ray: [Dim.Point.isType, Dim.Angle.isType]
	     * })
	     *
	     */
	    if (validator && validator[TYPE_COMPARE]) {
	        validator = TYPE_COMPARE;
	    }
	
	    if (!validator(value, propertyNameOrIdx, componentName, component)) {
	        throw new TypeError(formatError(value, componentName, propertyNameOrIdx));
	    }
	}
	
	function throwMissingObject(value, keys) {
	    throw new TypeError("expected and object with keys: [" + keys.join(",") + "], but got: " + JSON.stringify(value));
	}
	
	// = helper utils ============================================
	
	function toWords(numOrProp) {
	    var isInt = false;
	    try {
	        isInt = (0, _is.isNumber)(parseInt(numOrProp, 10));
	    } catch (e) {
	        isInt = false;
	    }
	
	    if (isInt) return (0, _num2word.toWordsOrdinal)(numOrProp + 1); // convert 0 indexed to 1 indexed
	
	    return numOrProp;
	}
	
	function formatError(value, name, position) {
	    if ((0, _is.isString)(value)) value = quote(value);
	
	    if (!(0, _is.isDefined)(value)) value = "<UNDEFINDED>";
	
	    if ((0, _is.isObject)(value)) value = JSON.stringify(value);
	
	    return format(ErrorMsg, {
	        thing: value,
	        name: name || "<UNKNOWN>",
	        position: toWords(position)
	    });
	}
	
	// format string replacing "{nameOrIndex}" with values
	function format(str, values) {
	    return str.replace(/{([^{}]*)}/g, function (original, match) {
	        return (0, _is.isDefined)(values[match]) ? values[match] : original;
	    });
	}
	
	function capitalize(str) {
	    return str.charAt(0).toUpperCase() + str.slice(1);
	}
	
	function quote(str) {
	    return "'" + str + "'";
	}
	
	function eachKey(descriptor, fn) {
	    for (var key in descriptor) {
	        if (key in RESERVED) continue;
	
	        fn(key);
	    }
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var _isPlaceholder = __webpack_require__(2);
	
	
	/**
	 * Optimized internal one-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry1(fn) {
	  return function f1(a) {
	    if (arguments.length === 0 || _isPlaceholder(a)) {
	      return f1;
	    } else {
	      return fn.apply(this, arguments);
	    }
	  };
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = function _isPlaceholder(a) {
	  return a != null &&
	         typeof a === 'object' &&
	         a['@@functional/placeholder'] === true;
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.isArray = undefined;
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	exports.isBoolean = isBoolean;
	exports.isNumber = isNumber;
	exports.isString = isString;
	exports.isFunction = isFunction;
	exports.isDate = isDate;
	exports.isObject = isObject;
	exports.isNull = isNull;
	exports.isDefined = isDefined;
	exports.isNotDefined = isNotDefined;
	exports.isArrayLike = isArrayLike;
	exports.isElement = isElement;
	exports.isNaN = isNaN;
	exports.isObservable = isObservable;
	exports.isIterable = isIterable;
	exports.isFinite = isFinite;
	exports.isRegExp = isRegExp;
	exports.getMatcherForPrimitive = getMatcherForPrimitive;
	
	var _rawType = __webpack_require__(10);
	
	var _rawType2 = _interopRequireDefault(_rawType);
	
	var _symbolObservable = __webpack_require__(15);
	
	var _symbolObservable2 = _interopRequireDefault(_symbolObservable);
	
	var _iteratorSymbol = __webpack_require__(4);
	
	var _iteratorSymbol2 = _interopRequireDefault(_iteratorSymbol);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function isBoolean(value) {
	    return (0, _rawType2.default)(value) == '[object Boolean]';
	}
	
	function isNumber(value) {
	    return typeof value === 'number';
	}
	
	function isString(value) {
	    return typeof value === 'string';
	}
	
	function isFunction(value) {
	    return Function.prototype.isPrototypeOf(value);
	}
	
	var isArray = exports.isArray = Array.isArray || function isArray(value) {
	    return (0, _rawType2.default)(value) === '[object Array]';
	};
	
	function isDate(value) {
	    return (0, _rawType2.default)(value) == '[object Date';
	}
	
	function isObject(value) {
	    return value && ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object' || typeof value == 'function');
	}
	
	function isNull(value) {
	    return value === null;
	}
	
	function isDefined(value) {
	    return typeof value !== 'undefined';
	}
	
	function isNotDefined(value) {
	    return typeof value === 'undefined';
	}
	
	function isArrayLike(obj) {
	    var length = obj && obj.length;
	    return isNumber(length) && !isString(obj) && length >= 0 && length % 1 === 0;
	}
	
	function isElement(value) {
	    return Element.isPrototypeOf(value);
	}
	
	function isNaN(value) {
	    return !isNumber || value !== value;
	}
	
	function isObservable(value) {
	    return value && value[_symbolObservable2.default];
	}
	
	function isIterable(value) {
	    return value && value[_iteratorSymbol2.default];
	}
	
	function isFinite(value) {
	    return !(typeof value !== 'number' || value !== value || value === Infinity || value === -Infinity);
	}
	
	function isRegExp(value) {
	    return (0, _rawType2.default)(value) == '[object RegExp]';
	}
	
	function isThenable(value) {
	    return value && isFunction(value.then);
	}
	
	function isError(value) {
	    return Error.prototype.isPrototypeOf(value);
	}
	
	function getMatcherForPrimitive(type) {
	    return type === String ? isString : type === Number ? isNumber : type === Boolean ? isBoolean : type === Object ? isObject : type === Array ? isArray : type === Function ? isFunction : type === RegExp ? isRegExp : type === Date ? isDate
	    // : type === Element ? isElement
	    // : type === HTMLElement ? isElement
	    : type === Promise ? isThenable : type === Error ? isError : null;
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var $$iterator = typeof Symbol === "function" && Symbol.iterator || "@@iterator";
	
	exports.default = $$iterator;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = function _arity(n, fn) {
	  /* eslint-disable no-unused-vars */
	  switch (n) {
	    case 0: return function() { return fn.apply(this, arguments); };
	    case 1: return function(a0) { return fn.apply(this, arguments); };
	    case 2: return function(a0, a1) { return fn.apply(this, arguments); };
	    case 3: return function(a0, a1, a2) { return fn.apply(this, arguments); };
	    case 4: return function(a0, a1, a2, a3) { return fn.apply(this, arguments); };
	    case 5: return function(a0, a1, a2, a3, a4) { return fn.apply(this, arguments); };
	    case 6: return function(a0, a1, a2, a3, a4, a5) { return fn.apply(this, arguments); };
	    case 7: return function(a0, a1, a2, a3, a4, a5, a6) { return fn.apply(this, arguments); };
	    case 8: return function(a0, a1, a2, a3, a4, a5, a6, a7) { return fn.apply(this, arguments); };
	    case 9: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) { return fn.apply(this, arguments); };
	    case 10: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) { return fn.apply(this, arguments); };
	    default: throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
	  }
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(1);
	var _isPlaceholder = __webpack_require__(2);
	
	
	/**
	 * Optimized internal two-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry2(fn) {
	  return function f2(a, b) {
	    switch (arguments.length) {
	      case 0:
	        return f2;
	      case 1:
	        return _isPlaceholder(a) ? f2
	             : _curry1(function(_b) { return fn(a, _b); });
	      default:
	        return _isPlaceholder(a) && _isPlaceholder(b) ? f2
	             : _isPlaceholder(a) ? _curry1(function(_a) { return fn(_a, b); })
	             : _isPlaceholder(b) ? _curry1(function(_b) { return fn(a, _b); })
	             : fn(a, b);
	    }
	  };
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var TEN = 10;
	var ONE_HUNDRED = 100;
	var ONE_THOUSAND = 1000;
	var ONE_MILLION = 1000000;
	var ONE_BILLION = 1000000000; //         1.000.000.000 (9)
	var ONE_TRILLION = 1000000000000; //     1.000.000.000.000 (12)
	
	var LESS_THAN_TWENTY = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
	
	var TENTHS_LESS_THAN_HUNDRED = ['zero', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
	
	var ENDS_WITH_DOUBLE_ZERO_PATTERN = /(hundred|thousand|(m|b|tr|quadr)illion)$/;
	var ENDS_WITH_TEEN_PATTERN = /teen$/;
	var ENDS_WITH_Y_PATTERN = /y$/;
	var ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN = /(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)$/;
	var ORDINAL_LESS_THAN_THIRTEEN = {
	    zero: 'zeroth',
	    one: 'first',
	    two: 'second',
	    three: 'third',
	    four: 'fourth',
	    five: 'fifth',
	    six: 'sixth',
	    seven: 'seventh',
	    eight: 'eighth',
	    nine: 'ninth',
	    ten: 'tenth',
	    eleven: 'eleventh',
	    twelve: 'twelfth'
	};
	
	exports.TEN = TEN;
	exports.ONE_HUNDRED = ONE_HUNDRED;
	exports.ONE_THOUSAND = ONE_THOUSAND;
	exports.ONE_MILLION = ONE_MILLION;
	exports.ONE_BILLION = ONE_BILLION;
	exports.ONE_TRILLION = ONE_TRILLION;
	exports.LESS_THAN_TWENTY = LESS_THAN_TWENTY;
	exports.TENTHS_LESS_THAN_HUNDRED = TENTHS_LESS_THAN_HUNDRED;
	exports.ORDINAL_LESS_THAN_THIRTEEN = ORDINAL_LESS_THAN_THIRTEEN;
	exports.ENDS_WITH_DOUBLE_ZERO_PATTERN = ENDS_WITH_DOUBLE_ZERO_PATTERN;
	exports.ENDS_WITH_TEEN_PATTERN = ENDS_WITH_TEEN_PATTERN;
	exports.ENDS_WITH_Y_PATTERN = ENDS_WITH_Y_PATTERN;
	exports.ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN = ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = toWords;
	exports.toWordsOrdinal = toWordsOrdinal;
	exports.toOrdinal = toOrdinal;
	
	var _is = __webpack_require__(3);
	
	var _constants = __webpack_require__(7);
	
	/**
	 * Converts an integer into words.
	 * If number is decimal, the decimals will be removed.
	 * @example toWords(12) => 'twelve'
	 * @param {number|string} number
	 * @param {boolean} asOrdinal
	 * @returns {string}
	 */
	/**
	 * convert numbers to pretty formatted human readable sentences
	 *
	 *
	 * example:
	 *    toWords(352) -> "three hundred fifty-two"
	 *
	 *    toWordsOrdinal(352) -> "three hundred fifty-second"
	 *
	 *
	 *
	 *
	 *
	 *
	 */
	
	function toWords(number, asOrdinal) {
	    number = parseInt(number, 10);
	    if (!(0, _is.isFinite)(number)) {
	        return "Infinity";
	    }
	
	    var words = generateWords(number);
	    return asOrdinal ? makeOrdinal(words) : words;
	}
	
	/**
	 * Converts a number into ordinal words.
	 * @example toWordsOrdinal(12) => 'twelfth'
	 * @param {number|string} number
	 * @returns {string}
	 */
	function toWordsOrdinal(number) {
	    return toWords(number, true);
	}
	
	function toOrdinal(number) {
	    var num = parseInt(number, 10);
	    if (!(0, _is.isFinite)(num)) {
	        return "Infinite";
	    }
	    var str = String(num);
	    var lastTwoDigits = num % 100;
	    var betweenElevenAndThirteen = lastTwoDigits >= 11 && lastTwoDigits <= 13;
	    var lastChar = str.charAt(str.length - 1);
	    return str + (betweenElevenAndThirteen ? 'th' : lastChar === '1' ? 'st' : lastChar === '2' ? 'nd' : lastChar === '3' ? 'rd' : 'th');
	}
	
	function generateWords(number) {
	    var words = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
	
	    var remainder = 0;
	    var word = "";
	
	    // We’re done
	    if (0 === number) {
	        return !words.length ? 'zero' : words.join(' ').replace(/,$/, '');
	    }
	
	    // If negative, prepend “minus”
	    if (number < 0) {
	        words.push('minus');
	        number = Math.abs(number);
	    }
	
	    if (number < 20) {
	        remainder = 0;
	        word = _constants.LESS_THAN_TWENTY[number];
	    } else if (number < _constants.ONE_HUNDRED) {
	        remainder = number % _constants.TEN;
	        word = _constants.TENTHS_LESS_THAN_HUNDRED[Math.floor(number / _constants.TEN)];
	        // In case of remainder, we need to handle it here to be able to add the “-”
	        if (remainder) {
	            word += '-' + _constants.LESS_THAN_TWENTY[remainder];
	            remainder = 0;
	        }
	    } else if (number < _constants.ONE_THOUSAND) {
	        remainder = number % _constants.ONE_HUNDRED;
	        word = generateWords(Math.floor(number / _constants.ONE_HUNDRED)) + ' hundred';
	    } else if (number < _constants.ONE_MILLION) {
	        remainder = number % _constants.ONE_THOUSAND;
	        word = generateWords(Math.floor(number / _constants.ONE_THOUSAND)) + ' thousand,';
	    } else if (number < _constants.ONE_BILLION) {
	        remainder = number % _constants.ONE_MILLION;
	        word = generateWords(Math.floor(number / _constants.ONE_MILLION)) + ' million,';
	    } else if (number < _constants.ONE_TRILLION) {
	        remainder = number % _constants.ONE_BILLION;
	        word = generateWords(Math.floor(number / _constants.ONE_BILLION)) + ' billion,';
	    } else if (number >= _constants.ONE_TRILLION) {
	        remainder = number % _constants.ONE_TRILLION;
	        word = generateWords(Math.floor(number / _constants.ONE_TRILLION)) + ' trillion,';
	    }
	
	    words.push(word);
	
	    return generateWords(remainder, words);
	}
	
	/**
	 * Converts a number-word into an ordinal number-word.
	 * @example makeOrdinal('one') => 'first'
	 * @param {string} words
	 * @returns {string}
	 */
	function makeOrdinal(words) {
	    // Ends with *00 (100, 1000, etc.) or *teen (13, 14, 15, 16, 17, 18, 19)
	    if (_constants.ENDS_WITH_DOUBLE_ZERO_PATTERN.test(words) || _constants.ENDS_WITH_TEEN_PATTERN.test(words)) {
	        return words + 'th';
	    }
	    // Ends with *y (20, 30, 40, 50, 60, 70, 80, 90)
	    else if (_constants.ENDS_WITH_Y_PATTERN.test(words)) {
	            return words.replace(_constants.ENDS_WITH_Y_PATTERN, 'ieth');
	        }
	        // Ends with one through twelve
	        else if (_constants.ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN.test(words)) {
	                return words.replace(_constants.ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN, replaceWithOrdinalVariant);
	            }
	    return words;
	}
	
	function replaceWithOrdinalVariant(match, numberWord) {
	    return _constants.ORDINAL_LESS_THAN_THIRTEEN[numberWord];
	}

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = call;
	function call(fn, args) {
	    var len = args.length;
	
	    if (len === 0) return fn();
	    if (len === 1) return fn(args[0]);
	    if (len === 2) return fn(args[0], args[1]);
	    if (len === 3) return fn(args[0], args[1], args[2]);
	    if (len === 4) return fn(args[0], args[1], args[2], args[3]);
	    if (len === 5) return fn(args[0], args[1], args[2], args[3], args[4]);
	    if (len === 6) return fn(args[0], args[1], args[2], args[3], args[4], args[5]);
	    if (len === 7) return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
	    if (len === 8) return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
	    if (len === 9) return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
	    if (len === 10) return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
	
	    //probably should throw an error here instead, as unions depend on 'this'
	    return fn.apply(undefined, args);
	}

/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = rawType;
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
	function rawType(value) {
	  return toStr.call(value);
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(1);
	var curryN = __webpack_require__(12);
	
	
	/**
	 * Returns a curried equivalent of the provided function. The curried function
	 * has two unusual capabilities. First, its arguments needn't be provided one
	 * at a time. If `f` is a ternary function and `g` is `R.curry(f)`, the
	 * following are equivalent:
	 *
	 *   - `g(1)(2)(3)`
	 *   - `g(1)(2, 3)`
	 *   - `g(1, 2)(3)`
	 *   - `g(1, 2, 3)`
	 *
	 * Secondly, the special placeholder value `R.__` may be used to specify
	 * "gaps", allowing partial application of any combination of arguments,
	 * regardless of their positions. If `g` is as above and `_` is `R.__`, the
	 * following are equivalent:
	 *
	 *   - `g(1, 2, 3)`
	 *   - `g(_, 2, 3)(1)`
	 *   - `g(_, _, 3)(1)(2)`
	 *   - `g(_, _, 3)(1, 2)`
	 *   - `g(_, 2)(1)(3)`
	 *   - `g(_, 2)(1, 3)`
	 *   - `g(_, 2)(_, 3)(1)`
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Function
	 * @sig (* -> a) -> (* -> a)
	 * @param {Function} fn The function to curry.
	 * @return {Function} A new, curried function.
	 * @see R.curryN
	 * @example
	 *
	 *      var addFourNumbers = (a, b, c, d) => a + b + c + d;
	 *
	 *      var curriedAddFourNumbers = R.curry(addFourNumbers);
	 *      var f = curriedAddFourNumbers(1, 2);
	 *      var g = f(3);
	 *      g(4); //=> 10
	 */
	module.exports = _curry1(function curry(fn) {
	  return curryN(fn.length, fn);
	});


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(5);
	var _curry1 = __webpack_require__(1);
	var _curry2 = __webpack_require__(6);
	var _curryN = __webpack_require__(13);
	
	
	/**
	 * Returns a curried equivalent of the provided function, with the specified
	 * arity. The curried function has two unusual capabilities. First, its
	 * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
	 * following are equivalent:
	 *
	 *   - `g(1)(2)(3)`
	 *   - `g(1)(2, 3)`
	 *   - `g(1, 2)(3)`
	 *   - `g(1, 2, 3)`
	 *
	 * Secondly, the special placeholder value `R.__` may be used to specify
	 * "gaps", allowing partial application of any combination of arguments,
	 * regardless of their positions. If `g` is as above and `_` is `R.__`, the
	 * following are equivalent:
	 *
	 *   - `g(1, 2, 3)`
	 *   - `g(_, 2, 3)(1)`
	 *   - `g(_, _, 3)(1)(2)`
	 *   - `g(_, _, 3)(1, 2)`
	 *   - `g(_, 2)(1)(3)`
	 *   - `g(_, 2)(1, 3)`
	 *   - `g(_, 2)(_, 3)(1)`
	 *
	 * @func
	 * @memberOf R
	 * @since v0.5.0
	 * @category Function
	 * @sig Number -> (* -> a) -> (* -> a)
	 * @param {Number} length The arity for the returned function.
	 * @param {Function} fn The function to curry.
	 * @return {Function} A new, curried function.
	 * @see R.curry
	 * @example
	 *
	 *      var sumArgs = (...args) => R.sum(args);
	 *
	 *      var curriedAddFourNumbers = R.curryN(4, sumArgs);
	 *      var f = curriedAddFourNumbers(1, 2);
	 *      var g = f(3);
	 *      g(4); //=> 10
	 */
	module.exports = _curry2(function curryN(length, fn) {
	  if (length === 1) {
	    return _curry1(fn);
	  }
	  return _arity(length, _curryN(length, [], fn));
	});


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(5);
	var _isPlaceholder = __webpack_require__(2);
	
	
	/**
	 * Internal curryN function.
	 *
	 * @private
	 * @category Function
	 * @param {Number} length The arity of the curried function.
	 * @param {Array} received An array of arguments received thus far.
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curryN(length, received, fn) {
	  return function() {
	    var combined = [];
	    var argsIdx = 0;
	    var left = length;
	    var combinedIdx = 0;
	    while (combinedIdx < received.length || argsIdx < arguments.length) {
	      var result;
	      if (combinedIdx < received.length &&
	          (!_isPlaceholder(received[combinedIdx]) ||
	           argsIdx >= arguments.length)) {
	        result = received[combinedIdx];
	      } else {
	        result = arguments[argsIdx];
	        argsIdx += 1;
	      }
	      combined[combinedIdx] = result;
	      if (!_isPlaceholder(result)) {
	        left -= 1;
	      }
	      combinedIdx += 1;
	    }
	    return left <= 0 ? fn.apply(this, combined)
	                     : _arity(left, _curryN(length, combined, fn));
	  };
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var _curry2 = __webpack_require__(6);
	
	
	/**
	 * Returns a function that when supplied an object returns the indicated
	 * property of that object, if it exists.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Object
	 * @sig s -> {s: a} -> a | Undefined
	 * @param {String} p The property name
	 * @param {Object} obj The object to query
	 * @return {*} The value at `obj.p`.
	 * @see R.path
	 * @example
	 *
	 *      R.prop('x', {x: 100}); //=> 100
	 *      R.prop('x', {}); //=> undefined
	 */
	module.exports = _curry2(function prop(p, obj) { return obj[p]; });


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(16);


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _ponyfill = __webpack_require__(17);
	
	var _ponyfill2 = _interopRequireDefault(_ponyfill);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var root = undefined; /* global window */
	
	if (typeof global !== 'undefined') {
		root = global;
	} else if (typeof window !== 'undefined') {
		root = window;
	}
	
	var result = (0, _ponyfill2['default'])(root);
	exports['default'] = result;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports['default'] = symbolObservablePonyfill;
	function symbolObservablePonyfill(root) {
		var result;
		var _Symbol = root.Symbol;
	
		if (typeof _Symbol === 'function') {
			if (_Symbol.observable) {
				result = _Symbol.observable;
			} else {
				result = _Symbol('observable');
				_Symbol.observable = result;
			}
		} else {
			result = '@@observable';
		}
	
		return result;
	};

/***/ }
/******/ ]);
//# sourceMappingURL=union.js.map