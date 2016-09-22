import prop from 'ramda/src/prop';
import __ from 'ramda/src/prop';
import curry from 'ramda/src/curry';
import iteratorSymbol from './util/iteratorSymbol';
import call from './util/call';
import {toWordsOrdinal} from './num2word';
import {
    getMatcherForPrimitive,
    isNotDefined,
    isString,
    isNumber,
    isArray,
    isObject,
    isDefined
} from './is';

const VALIDATORS = "@@Union/Validators";
const NAME = "@@Union/Name";
const KEYS = "@@Union/Keys";
const ARG_TYPE = "@@Union/ArgType";
const TYPE_COMPARE = "@@Union/TypeCompareFn";
const IS_TYPE = "isType";
const RESERVED = [
    TYPE_COMPARE,
    VALIDATORS,
    ARG_TYPE,
    IS_TYPE,
    NAME
];

let DISABLE_VALIDATION = false;

let ErrorMsg = "bad value {thing} passed as {position} argument to {name} constructor";
let ListErrorMsg = 'item at {position} location in List has wrong value of {value}';


function BaseUnionType() {
}


// = public exposed API ====================================


export default function Union(descriptor) {
    return buildType(BaseUnionType, descriptor);
}

Union.ListOf = function(validator) {
    var List = Union({List: [Array]});
    var single = Union({T: [validator]});
    var validate = List.case({
        List: function(iterable) {
            var item = null;
            var i = 0;
            try {
                for (item of iterable) {
                    i++;
                    single.T(item);
                }
            } catch (e) {
                throw new TypeError(format(ListErrorMsg, {
                    value: JSON.stringify(item),
                    position: toWordsOrdinal(i)
                }));
            }
            return true;
        }
    });
    return function(iterable) {
        return validate(List.List(iterable));
    };
};

//not really sure we want to continue supporting this in future
Union.setValidationEnabled = (isEnabled) => DISABLE_VALIDATION = !isEnabled;

function isAnyUnion(value) {
    return (
        BaseUnionType.prototype.isPrototypeOf(value)
        || BaseUnionType.isPrototypeOf(value)
        || value instanceof BaseUnionType
    );
}
Union.isUnionType = isAnyUnion;


// = constructors ==================================================


function buildType(baseType, descriptor) {
    function isMatchingType(subType) {
        return MyUnionType.prototype.isPrototypeOf(subType) || subType instanceof MyUnionType;
    }

    function MyUnionType(...values) {
        if (!(this instanceof MyUnionType))
            return new MyUnionType(...values);
        Object.assign(this, values);
    }

    MyUnionType.prototype = new baseType();
    MyUnionType.case = curry(doCaseSwitch)(MyUnionType);


    MyUnionType.prototype.case = function(cases) {
        return MyUnionType.case(cases, this);
    };

    MyUnionType.prototype[IS_TYPE] = MyUnionType[IS_TYPE] = isMatchingType;


    eachKey(descriptor, (key) => {
        var subTypeFactory = buildSubType(descriptor[key], MyUnionType, key, isMatchingType);
        MyUnionType["new" + capitalize(key)] = subTypeFactory;
        MyUnionType[key] = subTypeFactory;
    });

    return MyUnionType;
}

function buildSubType(fields, parentClass, subTypeName, isParentType) {
    var isArgsArray = isArray(fields);
    var keys = Object.keys(fields);
    var validators = keys.reduce(function(all, key) {
        var value = fields[key];
        // if value is a primitive class, get the matcher function for it
        // else, we assume the value is the validator func
        // if value is undefined, we assume the user is building a recursive type
        all[key] = getMatcherForPrimitive(value) || (isNotDefined(value) ? isParentType : value);
        return all;
    }, {});

    function SubCaseType(...values) {
        if (!(this instanceof SubCaseType))
            return new SubCaseType(...values);

        if (!isArgsArray && values.length == 1) {
            values = values[0];
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

    SubCaseType.prototype[iteratorSymbol] = function iterator() {
        var keys = this[KEYS];
        var values = this;
        var isArray = this[ARG_TYPE] == "array";
        return {
            idx: 0,
            next: function() {
                if (this.idx === keys.length) {
                    return {done: true};
                }

                let key = keys[this.idx++];
                let value = values[key];

                if (isArray) {
                    return {value: value};
                }

                return {value: [key, value]};
            }
        };
    };

    SubCaseType.prototype.values = function() {
        return this[KEYS].map(prop(__, this));
    };

    SubCaseType.prototype.keys = function() {
        return Array.prototype.slice.call(this[KEYS]);
    };

    SubCaseType.prototype[IS_TYPE] =
        SubCaseType.prototype[TYPE_COMPARE] =
            SubCaseType[IS_TYPE] = function(obj) {
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

    if (!isDefined(thunk)) {
        throw new TypeError("no matching case handler defined");
    }

    if (isDefined(thunk) && !isRelatedCase && !isWildcard) {
        throw new TypeError("wrong type passed to case, and no wildcard handler was found");
    }

    if (isArray(caseType) || caseType[ARG_TYPE] == "array") {
        return call(thunk, argsToArray(caseType));
    }
    return thunk(caseType);
}

function argsToArray(args) {
    if (isArray(args))
        return args;

    if (args && args[ARG_TYPE] == "array")
        return args[KEYS].map(key => args[key]);

    return [args];
}

function validateAll(expectedKeys, validators, args, parentName) {
    return expectedKeys.reduce(function(values, key) {
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


// = helper utils ============================================

function toWords(numOrProp) {
    var isInt = false;
    try {
        isInt = isNumber(parseInt(numOrProp, 10));
    } catch (e) {
        isInt = false;
    }

    if (isInt)
        return toWordsOrdinal(numOrProp + 1); // convert 0 indexed to 1 indexed

    return numOrProp;
}

function formatError(value, name, position) {
    if (isString(value))
        value = quote(value);

    if (!isDefined(value))
        value = "<UNDEFINDED>";

    if (isObject(value))
        value = JSON.stringify(value);

    return format(ErrorMsg, {
        thing: value,
        name: name || "<UNKNOWN>",
        position: toWords(position)
    });
}


// format string replacing "{nameOrIndex}" with values
function format(str, values) {
    return str.replace(/{([^{}]*)}/g, function(original, match) {
        return isDefined(values[match]) ? values[match] : original;
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
        if (key in RESERVED)
            continue;

        fn(key);
    }
}
