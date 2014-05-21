/**
 * @file slidepage /
 * Created: 10.05.14 / 23:28
 */


/**
 * @example ['k','v'] --> {"k":"v"}
 */
function akv2okv (a){var o = {}; o[a[0]] = a[1]; return o; }

RegExp.escape= function(s) {return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); };

function curry(func) {
    var curryArgs = [];
    if (typeof func !== 'function') {
        throw new Error('The first arguments must be function!');
    }
    for (var i = 1; i < arguments.length; i++) {
        curryArgs[i - 1] = arguments[i];
    }
    return function () {
        // convert arguments to array
        var argsArr = Array.prototype.slice.call(arguments, 0);
        curryArgs = curryArgs.concat(argsArr);
        return func.apply(this, curryArgs);
    }
}


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
    this.obj = curry(akv2okv,this.v);
    //
    // ...
}, ArrayProxyConstruct = function (o) {
    return new ArrayProxy(o);
}, $a = ArrayProxyConstruct;

var stringProxy = function (s) {
    var self = this;
    this.v = s;
    /**
     * @param pattern       string|regExp|object
     * @param replacement   string
     * @example $s ('123').replace( {'1': -1, '2':-2, '3':-3} )
     */
    this.replace = function (/*string|regExp|object*/pattern, /*=*/replacement) {
        var strNew = self.v;
        if (pattern instanceof Object) {
            $o(pattern).each(function (replacement, pattern) {
                strNew = strNew.replace(pattern, replacement);
            });
        }
        return strNew;
    };
    this.match = String.prototype.match.bind(this.v);
    this.arg = String.prototype.format.bind(this.v);
}, StringProxyConstruct = function (s) {
    return new stringProxy(s);
}, $s = StringProxyConstruct;


/**
 * Make template processors if haystack described by box or variable enclosure
 * @param haystack String|HTMLElement|Function - box or variable enclosure or complete function
 * @param key String - variable_enclosure's variable_name
 * @returns Function
 */
function delayedSetter(haystack, /**String=*/key) {
    var processorCallback;
    if (!haystack instanceof Function) {
        if (haystack instanceof String || haystack instanceof HTMLElement) {// box is
            processorCallback = function (needle) {
                $(haystack).html(needle);
            };
        }
        else if (haystack instanceof Object) {
            processorCallback = function (needle) {
                haystack[key] = needle;
            };
        }
    }
    else if (haystack) {
        processorCallback = haystack;
    }
    else {
        processorCallback = function () {
        };
    }
    //
    return processorCallback;
}


if ($.pnotify) {
    /**
     * Show notification
     * @param text string
     * @param title string
     * @param delay integer
     * @param type string
     */
    function openNoty(title, text, /*string=*/type, /*integer=*/delay) {
        if (type == 'fail') {
            type = 'error';
        }
        $.pnotify({
            title: title,
            text: text,
            nonblock: true,
            nonblock_opacity: 0.2,
            type: type || 'success',
            delay: delay || $.pnotify.DELAY
        });
    }
    $.pnotify.DELAY = 4000;
}




var Ajax = makeObjInit({
    init: function () {
        /**
         * Add jQuery Ajax.form handler
         * @param done
         * @param fail
         * @param dataType
         * @returns {$.fn}
         * @param before
         */
        $.fn.setSubmit = function (done, fail, before, dataType) {
            Ajax.setFormSubmit(this, done, fail, before, dataType);
            return this;
        };
        /**
         * @todo add (key), (keys), (key,val), (keys,vals)
         * @param dataObj
         */
        $.fn.formData = function (dataObj) {
            if (typeof dataObj == 'object') {
                var self = this;
                each(dataObj, function (val, key) {
                    self.append($('<input/>', {type: 'hidden', name: key, value: val}));
                });
            }
        };
        /**
         * Init ajax status animation icon
         */
        $.ajaxSetup({
            beforeSend: function (xhr1, xhr2) {
                var statusParent = xhr2.statusParent;
                if (statusParent) {
                    xhr2.statusEl =
                        $('<div/>', {class: 'status animation'})
                            .css({opacity: 0})
                            .appendTo(statusParent);
                    setTimeout(function () {
                        xhr2.statusEl.css({opacity: 1});
                    });
                }
            },
            complete: function () {
                var statusEl = this.statusEl;
                if (statusEl) {
                    statusEl.css({opacity: 0});
                    setTimeout(function () {
                            statusEl.remove();
                        },
                        parseInt(statusEl.css('transition-duration'))
                            * $s(statusEl.css('transition-duration')).match(/[a-z]+/i)[0].replace({ms: 1, s: 1000})
                    );
                }
            }
        });

    },

    /**
     * Send the form data via ajax
     * @param form
     * @param done
     * @param fail
     * @param dataType
     * @param before
     */
    form: function (form, done, fail, before, dataType) {
        var $form = $(form);
        form = $form[0];
        if (before){Ajax.form.onBeforeSubmit = before;}
        Ajax.form.onBeforeSubmit && Ajax.form.onBeforeSubmit(form);
        var options = {'type': form.method, 'url': form.action, 'cache': false, 'data': $form.serialize()};
        if (dataType) {
            options.dataType = dataType;
        }
        options.statusParent = form; // parent node for animation status block
        //
        $.ajax(options)
            .done(function (resp) {
                var isOk = (/\[\[Ok:.*\]\]/i.test(resp));
                delayedSetter(done)(resp, isOk);
                console.log(resp, isOk);
                if(isOk){form.reset();}
            })
            .fail(function (nc, err) {
                delayedSetter(fail)(nc, err);
                console.log(nc, err);
            });
    },

    /**
     * Set form ajax submit handler
     * Example $('form').setSubmit( function(){write success notify handler}, function(){write fail handler});
     * @param form
     * @param done
     * @param fail
     * @param dataType
     * @param before
     */
    setFormSubmit: function (form, done, fail, before, dataType) {
        $(form).on('submit', function (e) {
            Ajax.form(form, done, fail, before, dataType);
            e.preventDefault(); // prevent browser form submit
        });
    }
});


var Modal = {
    isModal: false,
    _$shut: undefined,
    blurSelector: '',
    onClose: function () {
    },
    /**
     *
     * @param isSwitchOn bool|function
     * @returns bool
     * @param blurSelector
     */
    activate: function (/*=bool|function*/isSwitchOn, blurSelector) {
        Modal.onClose = function () {
        };
        if (isSwitchOn === undefined) {
            isSwitchOn = true;
        }
        else if (typeof isSwitchOn == 'function') {
            Modal.onClose = isSwitchOn;
            isSwitchOn = true;
        }
        if (Modal.isModal && isSwitchOn) {
            return false;
        }
        this.blurSelector = (!blurSelector) ? 'body>*:not(.modals)' : blurSelector;
        if (isSwitchOn) { // activate modal mode
            $('html').addClass('fixed'); // hide overflow
            Modal._$shut = $('<div/>', {class: 'shut shut-modal'}).appendTo('body'); // open shut
            $(this.blurSelector).addClass('bg-blur'); // blur background layer
            // Set esc event handler
            $('*').on('keydown.Modal', null, 'esc', function (event) {
                console.log(event, 'keydown.Modal: esc');
                Modal.deactivate();
            });
            //
            // Set shut click action
            Modal._$shut.on('click', function () {
                console.log(event, 'Modal._$shut.on(click)');
                Modal.deactivate();
            });
            slidepage && (slidepage.isPageFreeze = true);
            //
            Modal.isModal = true;
        }
        else {
            return Modal.deactivate();
        }
        //
        return true;
    },
    deactivate: function () {
        if (!Modal.isModal) {
            return false;
        }
        //
        Modal.onClose();
        $('html').removeClass('fixed');
        Modal._$shut.remove();
        $(this.blurSelector ).removeClass('bg-blur');
        Modal.isModal = false;
        slidepage && (slidepage.isPageFreeze = false);
        //
        return true;
    }
};


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

HTMLElement.prototype.trigger || (HTMLElement.prototype.trigger = function(event){
    this.dispatchEvent(new CustomEvent(event));
    return this;
});
NodeList.prototype.addEventListener = function(){
    var args = $a(arguments).v;
    if(!arguments.length || !this.length) return;
    $a(this).each(function(el,i,a){
        console.log(el, args);
        HTMLElement.prototype.addEventListener.apply(el,args);
    });
};

/**
 * @example ['order', 'call-req'].forEach(setFormInitHandler);
 * @param name
 * @param blurSelector
 * @param formData
 * @param before
 */
function setFormInitHandler (name, blurSelector, formData, before) {
    var args = this; // get args object recieved via ['name1','name2'].forEach(setFormInitHandler,{blurSelector:''})
    if(typeof blurSelector == 'number') blurSelector = undefined;
    if(formData instanceof Array) formData = undefined;
    blurSelector || (blurSelector = args.blurSelector);
    formData || (formData = args.formData);
    before || (before = args.before);
    //
    // Add button click event listener
    var panel = document.querySelector($s('.{1}-panel').arg(name));
    document.querySelectorAll($s('.{1}-btn').arg(name))
        .addEventListener('click', function (e) {
            Modal.activate(
                function () {
                    panel.style.display = 'none'; // modal close callback
                },
                blurSelector
            );
            panel.style.display = 'block'; // open form panel
            var formData;
            this.dataset.formData && (formData = $a(this.dataset.formData.split(':')).obj());
            $(panel.querySelector('form')).formData(formData);
            var autofocus = panel.querySelector('[autofocus]');
            autofocus && autofocus.trigger('focus'); // focus autofocus input if even blurred on previous opens
            this.trigger('blur'); // blur caller button
            e.preventDefault(); // deactivate default button action
        });
    //
    // Add form submit event listener
    $(panel.querySelector('form'))
        .setSubmit(
        function (resp, isOk) {
            // success
            if (isOk) {
                openNoty('Успешно', 'Заявка успешно отправлена!', 'success');
                Modal.deactivate();
            } else {
                openNoty('Сбой', '<p>Не удалось передать заявку.</p><p>Попробуйте, пожалуйста, снова через 5 минут</p><p><small>' + resp + '</small></p>', 'fail');
            }
        },
        function (nc, err) {
            // fail
            openNoty('Сбой', '<p>Не удалось передать заявку.</p><p>Вероятно, у вас нарушен доступ к интернету</p><p><small>' + err + '</small></p>', 'fail');
        },
        function(form) {
            // before submit
            before(form);
        }
    )
        .formData($.extend({'data[page]': $('title')[0].innerHTML},formData));
}


