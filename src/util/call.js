export default function call(fn, args) {
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
    if (len === 10)return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);

    //probably should throw an error here instead, as unions depend on 'this'
    return fn.apply(undefined, args);
}
