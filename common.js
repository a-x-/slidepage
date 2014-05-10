/**
 * @file slidepage /
 * Created: 10.05.14 / 23:28
 */


/**
 * forEach analogy for Objects
 * @param fn
 * @example each({1:1,2:2},function(v,i,a){console.log(v,i,a,'!!!');})
 */
var oEach, each = Function.prototype.call.bind(oEach = function (context_fn, fn) {
    var context;
    if (arguments.length == 1) {
        fn = context_fn
    } else if (arguments.length == 2) {
        context = context_fn;
    } else {
        throw 'Too much arguments;'
    }
    // 'this' is given object
    for (var index in this) {
        if (this.hasOwnProperty(index)) {
            var value = this[index],
                array = this;
            fn.call(context || this, value, index, array);
        }
    }
    return this;
});

/**
 * $o(object) wrapper
 * @example $o({a:1,b:2}).each(function(el,prop,obj){console.log(el,prop);}); // --> a 1\n b 2
 * @param o object - wrapped object
 * @constructor
 */
var ObjectProxy = function (o) {
    var self = this;
    this.obj = o;
    //
    // Wrapper methods
    this.each = function (fn) {
        (oEach.bind(this.obj))(fn);
        return self;
    };
    // put another methods here ...
}, ObjectProxyConstruct = function (o) {
    return new ObjectProxy(o);
}, $o = $$$ = ObjectProxyConstruct;


/**
 * Make the object, call object.init() and return its.
 * @param object
 * @param object_args
 * @depends each
 * @returns {}
 */
function makeObjInit(object_args, object) {
    var argsNames = {};
    if (arguments.length >= 2) {
        argsNames = object_args;
    } else {
        object = object_args;
    }
    return new function () {
        //
        each(object, this, function (el, i) {
            this[i] = el;
        });
        each(argsNames, this, function (el, i) {
            this[i] = el;
        });
        this.init && this.init.call(this);
    }();
}

function makeClass(argsNames, classObject) {
    var fn = makeFnWithArguments(argsNames, function () {
        this.init && this.init.call(this);
    });
    each(classObject, function (el, i) {
        fn[i] = el;
    });
    return fn;
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
/**
 * reference http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
 * @param func
 * @returns {Array|{index: number, input: string}}
 */
function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
    if (result === null) {
        result = [];
    }
    return result
}

/**
 * new Function(['a','b'],'return ' + ((function(){return 42+a+b;}).toString()) + '();' )(1,2) // --> 45
 * @example makeFnWithArguments([a,b],function(){return 42+a+b;})(1,2); // --> 45
 * @param argsNames
 * @param fn
 * @returns {Function}
 */
function makeFnWithArguments(argsNames, fn) {
    return new Function(argsNames, 'return (' + fn.toString() + ')();');
}