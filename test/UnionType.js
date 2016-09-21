import  assert from 'assert';
import Type from '../src/Union';

function isNumber(n) { return typeof n === 'number'; }
function T() { return true; }
function add(n) {
    return function(m) { return n + m; };
}

describe('union type', function() {
    it('returns type with constructors', function() {
        var Point = Type({Point: [isNumber, isNumber]});
        assert.equal('function', typeof Point.Point);
    });
    it('constructors create object with fields in array', function() {
        var Point = Type({Point: [isNumber, isNumber]});
        var point = Point.Point(5, 10);
        assert.equal(5, point[0]);
        assert.equal(10, point[1]);
    });
    it('throws if field value does not pass validator', function() {
        var Point = Type({Point: [isNumber, isNumber]});
        assert.throws(function() {
            Point.Point('lol', 10);
        }, /Point/);
    });

    describe('primitives', function() {
        it('accepts strings with primitive constructors', function() {
            var Name = Type({Name: [String]});
            var name = Name.Name('Thumper');
            assert.equal(name[0], 'Thumper');
        });
        it('throws on strings with primitive constructors', function() {
            var Name = Type({Name: [String]});
            assert.throws(function() {
                var name = Name.Name(12);
            }, /Name/);
        });
        it('accepts number with primitive constructors', function() {
            var Age = Type({Age: [Number]});
            assert.equal(Age.Age(12)[0], 12);
        });
        it('throws on number with primitive constructors', function() {
            var Age = Type({Age: [Number]});
            assert.throws(function() {
                Age.Age('12');
            }, /bad value/);
        });
        it('accepts boolean true with primitive constructors', function() {
            var Exists = Type({Exists: [Boolean]});
            assert.equal(Exists.Exists(true)[0], true);
        });
        it('accepts boolean false with primitive constructors', function() {
            var Exists = Type({Exists: [Boolean]});
            assert.equal(Exists.Exists(false)[0], false);
        });
        it('throws on boolean with primitive constructors', function() {
            var Exists = Type({Exists: [Boolean]});
            assert.throws(function() {
                Exists.Exists('12');
            }, /bad value/);
        });
    });
    it('array of types', function() {
        var Point = Type({Point: [Number, Number]});
        var Shape = Type({Shape: [Type.ListOf(Point.isType)]}).Shape;

        assert.throws(function(){
            Shape([1, Point.Point(1,2), 3]);
        }, /item at first location in List has wrong value 1/);

        assert.throws(function() {
            Shape([Point.Point(1,2), Point.Point('3',1)]);
        }, /bad value '3' passed as first argument to constructor Point/);

        // Shape([Point.Point(1,2), Point.Point(1,2)]);
        // Shape([]);

        assert.throws(function(){
            Shape("not a List");
        }, /bad value 'not a List' passed as first argument to constructor List/);
    });
    it('nest types', function() {
        var Point = Type({Point: [isNumber, isNumber]});
        var Shape = Type({Circle: [Number, Point],
            Rectangle: [Point, Point]});
        var square = Shape.Rectangle(Point.Point(1, 1), Point.Point(4, 4));

        assert.equal(square instanceof Shape.Rectangle, true);
    });
    it('throws if field value is not of correct type', function() {
        var Length = Type({Length: [isNumber]});

        var Shape = Type({Rectangle: [Number, Length.isType]});


        assert.doesNotThrow(function() {
            Shape.Rectangle(1, Length.Length(12));
        }, /error/);
    });
    describe('records', function() {
        it('can create types from object descriptions', function() {
            var Point = Type({Point: {x: Number, y: Number}});
        });
        it('can create values from objects', function() {
            var Point = Type({Point: {x: Number, y: Number}});
            var p = Point.Point({x: 1, y: 2});

            assert.equal(p.x, 1);
            assert.equal(p.y, 2);
        });
        it('cannot create values from arguments when expecting an object', function() {
            var Point = Type({Point: {x: Number, y: Number}});
            assert.throws(function() {
                var p = Point.Point(1, 2);
            }, /bad value/);

        });
    });
    describe('type methods', function() {
        it('can add instance methods', function() {
            var Maybe = Type({Just: [T], Nothing: []});
            Maybe.prototype.map = function(fn) {
                return Maybe.case({
                    Nothing: () => Maybe.Nothing(),
                    Just: (v) => Maybe.Just(fn(v))
                }, this);
            };
            var just1 = Maybe.Just(1);
            var just4 = just1.map(add(3));
            assert.equal(just4[0], 4);
            var nothing = Maybe.Nothing();
            var alsoNothing = nothing.map(add(3));
            assert.equal(alsoNothing['@@Union/Name'], 'Nothing');
        });
    });

    describe("inheritance" ,function() {
        var Action = Type({
            Translate: [isNumber, isNumber],
            Rotate: [isNumber],
            Scale: {x: Number, y: Number}
        });

        it('is a type of parent union', function() {
            var AnotherAction = Type({Translate: [Number]});
            var action = AnotherAction.Translate(1);

            assert.equal(action instanceof AnotherAction.Translate, true);
            assert.equal(action instanceof AnotherAction, true);
            assert.equal(AnotherAction.Translate.prototype.isPrototypeOf(action), true);
            assert.equal(AnotherAction.Translate.isType(action), true);
            assert.equal(AnotherAction.isType(action), true);
            assert.equal(Action.Translate.isType(action), false);
            assert.equal(Action.isType(action), false);
        });

        it('is not a type of sibling union', function() {
            var AnotherAction = Type({Translate: [Number]});
            var action = AnotherAction.Translate(1);

            assert.equal(action instanceof Action, false);
        });

        it('is a type of union', function() {
            var AnotherAction = Type({Translate: []});


            assert.equal(Type.isUnionType(AnotherAction.Translate()), true);
            assert.equal(Type.isUnionType(AnotherAction()), true);
            assert.equal(Type.isUnionType(Action.Translate(1,1)), true);
        });
    });

    describe('case', function() {
        var Action = Type({
            Translate: [isNumber, isNumber],
            Rotate: [isNumber],
            Scale: {x: Number, y: Number}
        });
        var sum = Action.case({
            Translate: function(x, y) {
                return x + y;
            },
            Rotate: function(n) { return n; },
            Scale: function({x, y}) {
                return x + y;
            }
        });
        it('works on types', function() {
            assert.equal(sum(Action.Translate(10, 8)), 18);
            assert.equal(sum(Action.Rotate(30)), 30);
        });
        it('destructs record types', function() {
            assert.equal(sum(Action.newScale({x: 3, y: 4}) ), 7);
        });

        it('throws on incorrect type', function() {
            var AnotherAction = Type({Translate: [Number]});

            assert.throws(function() {
                sum(AnotherAction.Translate(12));
            }, /wrong type/);
        });
        it('calls back to placeholder', function() {
            var called = false;
            var fn = Action.case({
                Translate: function() { throw new Error(); },
                _: function() { called = true; }
            });
            fn(Action.Rotate(30));
        });
        it('throws if no case handler found', function() {
            var called = false;
            var fn = Action.case({
                Translate: function() { throw new Error("foo happens"); }
            });
            assert.throws(function() {
                fn(Action.Rotate(30));
            }, /no matching case handler defined/);
        });

        it('throws if  wrong type of handler found', function() {
            var AnotherAction = Type({Translate: [Number]});

            var called = false;
            var fn = Action.case({
                Translate: function() { throw new Error("foo happens"); }
            });

            assert.throws(function() {
                fn(AnotherAction.Translate(30));
            }, /wrong type passed to case/);
        });
    });

    describe('iterator support', () => {
        it('is can be destructured like array', () => {
            var A = Type({
                Point: {x: Number, y: Number, z: Number},
                Point2: [Number, Number, Number]
            });
            var p1 = A.Point({x: 1, y: 2, z: 3});
            var p2 = A.Point2(1, 2, 3);
            var [a, b, c] = p1;
            var [x, y, z] = p2;


            assert.deepEqual([x, y, z], [1, 2, 3]);
            assert.deepEqual(a, ["x", 1]);
            assert.deepEqual(b, ["y", 2]);
            assert.deepEqual(c, ["z", 3]);
        });
    });

    describe('global type support', () => {
        var {Point} = Type({Point: {x: Number, y: Number, z: Number}});
        var p1 = Point({x: 1, y: 2, z: 3});
        var p2 = Point({x: 1, y: 2, z: 3});

        var Action = Type({ Point: {z: Number, w: Number } });

        it('can be vaguely categorized as a union type instance', () => {
            assert.equal(Type.isUnionType(p1), true);
            assert.equal(Type.isUnionType(p2 ), true);

        });

        it('can be vaguely categorized as a union type class', () => {
            assert.equal(Type.isUnionType(Action.Point), false);
            assert.equal(Type.isUnionType(Point), false);
        });
    });
});
