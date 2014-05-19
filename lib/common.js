/**
 * @file slidepage /
 * Created: 10.05.14 / 23:28
 */


/**
 * @example ['k','v'] --> {"k":"v"}
 */
function akv2okv (a){var o = {}; o[a[0]] = a[1]; return o; }

RegExp.escape= function(s) {return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); };

/**
 * For each with return value
 * @param arr
 * @param fn
 * @returns {*}
 */
function forEach (arr, fn){
    var i = 0, l = arr.length;
    var result;
    for(i=0;i<l;++i){
        result = fn(arr[i],i,arr);
        if(result !== undefined) {
            return result;
        }
    }
    return null;
}

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


var ArrayProxy = function (a) {
    var self = this;
    this.v = [];
    if(a instanceof Array) {
        this.v = a;
    }
    else {
        this.v = [].slice.call(a);
        if(!this.v || !this.v.length) {
            this.v = [a];
        }
    }
    //
    this.each = Array.prototype.forEach.bind(this.v);
    //
    // ...
}, ArrayProxyConstruct = function (o) {
    return new ArrayProxy(o);
}, $a = ArrayProxyConstruct;

var stringProxy = function (s) {
    var self = this;
    this.str = s;
    /**
     * @param pattern       string|regExp|object
     * @param replacement   string
     * @example $s ('123').replace( {'1': -1, '2':-2, '3':-3} )
     */
    this.replace = function (/*string|regExp|object*/pattern, /*=*/replacement) {
        var strNew = self.str;
        if (pattern instanceof Object) {
            $o(pattern).each(function (replacement, pattern) {
                strNew = strNew.replace(pattern, replacement);
            });
        }
        return strNew;
    };
    this.match = String.prototype.match.bind(this.str);
}, StringProxyConstruct = function (s) {
    return new stringProxy(s);
}, $s = StringProxyConstruct;


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

function makeClass(classObject) {
    if(!classObject.init) {classObject.init = function(){};}
    //
    var fn = classObject.init;
    each(classObject, function (el, i) {
        fn.prototype[i] = el;
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

/**
 * @reference http://blog.invntrm.ru/pravoslavnoie-dobavlieniie-html-eliemientov-js/
 * @param o
 * @returns {string}
 */
function cssStringify(o) {
    var out = '';
    $o(o).each(function(v, i, a) {// $$$ - object proxy
        out += i + ':' + v + ';';
    });
    return out;
}

if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = $a(arguments).v;
        args.unshift(null);
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : '';
        });
    };
}
