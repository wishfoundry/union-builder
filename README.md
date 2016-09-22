# union-builder
A library for building and using union data types(a.k.a algebraic data types) in JS

## TOC


## why

after using similar libraries such as [union-type](https://github.com/paldepind/union-type) in my flux/redux stores, I found that I often needed something that could do just a little more. This library is the fruit of that effort with the following advantages:
* easy/automatic to use with JS native types
* able to  validate inputs, or provide default values
* able to validate related inputs or pairs, not just 1 input at a time
* easy to extend using simple pure function validators, and have enough context to yield informative/debuggable errors
* able to categorize union in 3 layers
    1. is any type of union
    2. is one of several unions
    3. is an exact type


## Creating a union type factory
To create a union type in union-builder, we must first create a union factory


```javascript
function isNumber(n) { 
	return typeof n === 'number'; 
}
var Points = Type({
	Point: [isNumber, isNumber], //using ordered arguments
	PointXY: {x: isNumber, y: isNumber} //using named arguments
});

//which can then be used to create union instances
var point = new Points.Point(2, 4)
var point2 = Points.PointXY({y: 4, x: 2});
```

values can be retrieved from a union instance as follows:

```javascript
//for record types, instances just use the prop name
point2.x === 2;
point2.y === 4;

point[0] === 2
point[1] === 4
//or

//for ordered arguments, use iterator protocol
for (let value of point) {
	//first iteration
	value === 2;
}
//Using the destructuring assignment in ECMAScript 6 it is possible to
//concisely extract all fields of a type.
var [x, y] = point;
var { x, y } = point2; 
```


### Validators
Union Factories accept any function that returns a boolean.
Additionally, union-builder will recognize JS primitives and automatically validate them

```javascript
function isAny() {
	return true;
}

var Point = Type({
	Any: [isAny],           // use your own custom validator
	Point: [Number, Number],// js primitives are detected
	LazyPoint: [Promise]    // even advanced types are recognized
});
// Unions can also be used recursively
var Shape = Type({
	//using the built in type or subtype helper
	Rectangle: [Point.isType, Point.Point.isType],
	//or using the subtype directly
    Circle: [Number, Point]
});
```
there's support for the following primitives
* String
* Number
* Boolean
* Array
* Object
* Function
* RegExp
* Date
* Promise
* Error

validators can also provide default values
```javascript
function myValidator(propValue, propName, instanceName, instanceObj) {
	//propValue === null
	//propName === "x"
	//instanceName === "Type"
	if (!propValue) {
		instanceObj[propName] = 0;
	}
	
	//additionally, very precise error messages can be thrown
	if (propValue === Infinity) {
		throw new TypeError(`#{instanceName} expected an integer for property #{propName}, but got: #{propValue}`)
	}
}

var Type = Union({
	Type: {x: myValidator}
});

var type = Type({x: null});
type.x === 0
```

### Usage in flux actions

#### detecting type
```javascript
var Action = Union({
	Create: [],
	Delete: []
});

function reducer(state, action) {
	//detect if this is a union type we know how to handle 
	if (!Action.isType(action))
		return state;

	//detect if this is a specific subtype
	if (Action.Create.isType(action))
		return addItem(state);

	if (Action.Delete.isType(action))
    		return removeItem(state);
}

// it is also possible to perform high level checks
function reducer(state, action) {
	if(!Union.isUnionType(action)) {
		throw new TypeError("conventions require that all actions are a type of Union")
	}
}

```

#### using case switch
```javascript
var Actions = Union({
	Update: {x: Number, y: Number},
	Create: [isAny],
	Delete: [isAny]
});

//case takes 2 arguments, but it also curried. so we can start with only 1
const updateState = Actions.case({
    Update: ({x, y}) => Object.assign(state, {x, y}),
    Create: () => ({x:0, y:0}),
    Delete: () => ({})
})

function reducer(state, action) {
	return updateState(action);
}

//wildcard or default fallbacks are also supported
function reducer(state, action) {
    return Actions.case({
        Update: ({x, y}) => Object.assign(state, {x, y}),
        _: () => state,
        // or
        "*": () => state
    }, action);
}
```

### Instance methods

It is also possible to add shared methods to the instances. A Maybe type with a map
function could thus be defined as follows:

```javascript
var isAny = () => true;
var Maybe = Type({Just: [isAny], Nothing: []});
Maybe.prototype.map = function(fn) {
  return Maybe.case({
    Nothing: () => Maybe.Nothing(),
    Just: (v) => Maybe.Just(fn(v))
  }, this);
};

var just = Maybe.Just(1);
var nothing = Maybe.Nothing();
nothing.map(add(1)); // => Nothing
just.map(add(1)); // => Just(2)
```


### Recursive union types

It is possible to define recursive union types. In the example below, `List` is
being used in it's own definition, thus it is still `undefined` when being
passed to `Type`. Therefore `Type` interprets `undefined` as being a recursive
invocation of the type currently being defined.

```javascript
var List = Type({Nil: [], Cons: [R.T, List]});
```

We can write a function that recursively prints the content of our cons list.

```javascript
var toString = List.case({
  Cons: (head, tail) => head + ' : ' + toString(tail),
  Nil: () => 'Nil',
});

var list = List.Cons(1, List.Cons(2, List.Cons(3, List.Nil())));
console.log(toString(list)); // => '1 : 2 : 3 : Nil'
```
