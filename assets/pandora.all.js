/*!
 * jq1.8.2
 */
(function( window, undefined ) {
var
    // A central reference to the root jQuery(document)
    rootjQuery,

    // The deferred used on DOM ready
    readyList,

    // Use the correct document accordingly with window argument (sandbox)
    document = window.document,
    location = window.location,
    navigator = window.navigator,

    // Map over jQuery in case of overwrite
    _jQuery = window.jQuery,

    // Map over the $ in case of overwrite
    _$ = window.$,

    // Save a reference to some core methods
    core_push = Array.prototype.push,
    core_slice = Array.prototype.slice,
    core_indexOf = Array.prototype.indexOf,
    core_toString = Object.prototype.toString,
    core_hasOwn = Object.prototype.hasOwnProperty,
    core_trim = String.prototype.trim,

    // Define a local copy of jQuery
    jQuery = function( selector, context ) {
        // The jQuery object is actually just the init constructor 'enhanced'
        return new jQuery.fn.init( selector, context, rootjQuery );
    },

    // Used for matching numbers
    core_pnum = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,

    // Used for detecting and trimming whitespace
    core_rnotwhite = /\S/,
    core_rspace = /\s+/,

    // Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
    rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

    // A simple way to check for HTML strings
    // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
    rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

    // Match a standalone tag
    rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

    // JSON RegExp
    rvalidchars = /^[\],:{}\s]*$/,
    rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
    rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
    rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,

    // Matches dashed string for camelizing
    rmsPrefix = /^-ms-/,
    rdashAlpha = /-([\da-z])/gi,

    // Used by jQuery.camelCase as callback to replace()
    fcamelCase = function( all, letter ) {
        return ( letter + "" ).toUpperCase();
    },

    // The ready event handler and self cleanup method
    DOMContentLoaded = function() {
        if ( document.addEventListener ) {
            document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
            jQuery.ready();
        } else if ( document.readyState === "complete" ) {
            // we're here because readyState === "complete" in oldIE
            // which is good enough for us to call the dom ready!
            document.detachEvent( "onreadystatechange", DOMContentLoaded );
            jQuery.ready();
        }
    },

    // [[Class]] -> type pairs
    class2type = {};

jQuery.fn = jQuery.prototype = {
    constructor: jQuery,
    init: function( selector, context, rootjQuery ) {
        var match, elem, ret, doc;

        // Handle $(""), $(null), $(undefined), $(false)
        if ( !selector ) {
            return this;
        }

        // Handle $(DOMElement)
        if ( selector.nodeType ) {
            this.context = this[0] = selector;
            this.length = 1;
            return this;
        }

        // Handle HTML strings
        if ( typeof selector === "string" ) {
            if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
                // Assume that strings that start and end with <> are HTML and skip the regex check
                match = [ null, selector, null ];

            } else {
                match = rquickExpr.exec( selector );
            }

            // Match html or make sure no context is specified for #id
            if ( match && (match[1] || !context) ) {

                // HANDLE: $(html) -> $(array)
                if ( match[1] ) {
                    context = context instanceof jQuery ? context[0] : context;
                    doc = ( context && context.nodeType ? context.ownerDocument || context : document );

                    // scripts is true for back-compat
                    selector = jQuery.parseHTML( match[1], doc, true );
                    if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
                        this.attr.call( selector, context, true );
                    }

                    return jQuery.merge( this, selector );

                // HANDLE: $(#id)
                } else {
                    elem = document.getElementById( match[2] );

                    // Check parentNode to catch when Blackberry 4.6 returns
                    // nodes that are no longer in the document #6963
                    if ( elem && elem.parentNode ) {
                        // Handle the case where IE and Opera return items
                        // by name instead of ID
                        if ( elem.id !== match[2] ) {
                            return rootjQuery.find( selector );
                        }

                        // Otherwise, we inject the element directly into the jQuery object
                        this.length = 1;
                        this[0] = elem;
                    }

                    this.context = document;
                    this.selector = selector;
                    return this;
                }

            // HANDLE: $(expr, $(...))
            } else if ( !context || context.jquery ) {
                return ( context || rootjQuery ).find( selector );

            // HANDLE: $(expr, context)
            // (which is just equivalent to: $(context).find(expr)
            } else {
                return this.constructor( context ).find( selector );
            }

        // HANDLE: $(function)
        // Shortcut for document ready
        } else if ( jQuery.isFunction( selector ) ) {
            return rootjQuery.ready( selector );
        }

        if ( selector.selector !== undefined ) {
            this.selector = selector.selector;
            this.context = selector.context;
        }

        return jQuery.makeArray( selector, this );
    },

    // Start with an empty selector
    selector: "",

    // The current version of jQuery being used
    jquery: "1.8.2",

    // The default length of a jQuery object is 0
    length: 0,

    // The number of elements contained in the matched element set
    size: function() {
        return this.length;
    },

    toArray: function() {
        return core_slice.call( this );
    },

    // Get the Nth element in the matched element set OR
    // Get the whole matched element set as a clean array
    get: function( num ) {
        return num == null ?

            // Return a 'clean' array
            this.toArray() :

            // Return just the object
            ( num < 0 ? this[ this.length + num ] : this[ num ] );
    },

    // Take an array of elements and push it onto the stack
    // (returning the new matched element set)
    pushStack: function( elems, name, selector ) {

        // Build a new jQuery matched element set
        var ret = jQuery.merge( this.constructor(), elems );

        // Add the old object onto the stack (as a reference)
        ret.prevObject = this;

        ret.context = this.context;

        if ( name === "find" ) {
            ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
        } else if ( name ) {
            ret.selector = this.selector + "." + name + "(" + selector + ")";
        }

        // Return the newly-formed element set
        return ret;
    },

    // Execute a callback for every element in the matched set.
    // (You can seed the arguments with an array of args, but this is
    // only used internally.)
    each: function( callback, args ) {
        return jQuery.each( this, callback, args );
    },

    ready: function( fn ) {
        // Add the callback
        jQuery.ready.promise().done( fn );

        return this;
    },

    eq: function( i ) {
        i = +i;
        return i === -1 ?
            this.slice( i ) :
            this.slice( i, i + 1 );
    },

    first: function() {
        return this.eq( 0 );
    },

    last: function() {
        return this.eq( -1 );
    },

    slice: function() {
        return this.pushStack( core_slice.apply( this, arguments ),
            "slice", core_slice.call(arguments).join(",") );
    },

    map: function( callback ) {
        return this.pushStack( jQuery.map(this, function( elem, i ) {
            return callback.call( elem, i, elem );
        }));
    },

    end: function() {
        return this.prevObject || this.constructor(null);
    },

    // For internal use only.
    // Behaves like an Array's method, not like a jQuery method.
    push: core_push,
    sort: [].sort,
    splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
        target = {};
    }

    // extend jQuery itself if only one argument is passed
    if ( length === i ) {
        target = this;
        --i;
    }

    for ( ; i < length; i++ ) {
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) != null ) {
            // Extend the base object
            for ( name in options ) {
                src = target[ name ];
                copy = options[ name ];

                // Prevent never-ending loop
                if ( target === copy ) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
                    if ( copyIsArray ) {
                        copyIsArray = false;
                        clone = src && jQuery.isArray(src) ? src : [];

                    } else {
                        clone = src && jQuery.isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[ name ] = jQuery.extend( deep, clone, copy );

                // Don't bring in undefined values
                } else if ( copy !== undefined ) {
                    target[ name ] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
};

jQuery.extend({
    noConflict: function( deep ) {
        if ( window.$ === jQuery ) {
            window.$ = _$;
        }

        if ( deep && window.jQuery === jQuery ) {
            window.jQuery = _jQuery;
        }

        return jQuery;
    },

    // Is the DOM ready to be used? Set to true once it occurs.
    isReady: false,

    // A counter to track how many items to wait for before
    // the ready event fires. See #6781
    readyWait: 1,

    // Hold (or release) the ready event
    holdReady: function( hold ) {
        if ( hold ) {
            jQuery.readyWait++;
        } else {
            jQuery.ready( true );
        }
    },

    // Handle when the DOM is ready
    ready: function( wait ) {

        // Abort if there are pending holds or we're already ready
        if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
            return;
        }

        // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
        if ( !document.body ) {
            return setTimeout( jQuery.ready, 1 );
        }

        // Remember that the DOM is ready
        jQuery.isReady = true;

        // If a normal DOM Ready event fired, decrement, and wait if need be
        if ( wait !== true && --jQuery.readyWait > 0 ) {
            return;
        }

        // If there are functions bound, to execute
        readyList.resolveWith( document, [ jQuery ] );

        // Trigger any bound ready events
        if ( jQuery.fn.trigger ) {
            jQuery( document ).trigger("ready").off("ready");
        }
    },

    // See test/unit/core.js for details concerning isFunction.
    // Since version 1.3, DOM methods and functions like alert
    // aren't supported. They return false on IE (#2968).
    isFunction: function( obj ) {
        return jQuery.type(obj) === "function";
    },

    isArray: Array.isArray || function( obj ) {
        return jQuery.type(obj) === "array";
    },

    isWindow: function( obj ) {
        return obj != null && obj == obj.window;
    },

    isNumeric: function( obj ) {
        return !isNaN( parseFloat(obj) ) && isFinite( obj );
    },

    type: function( obj ) {
        return obj == null ?
            String( obj ) :
            class2type[ core_toString.call(obj) ] || "object";
    },

    isPlainObject: function( obj ) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
            return false;
        }

        try {
            // Not own constructor property must be Object
            if ( obj.constructor &&
                !core_hasOwn.call(obj, "constructor") &&
                !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
                return false;
            }
        } catch ( e ) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.

        var key;
        for ( key in obj ) {}

        return key === undefined || core_hasOwn.call( obj, key );
    },

    isEmptyObject: function( obj ) {
        var name;
        for ( name in obj ) {
            return false;
        }
        return true;
    },

    error: function( msg ) {
        throw new Error( msg );
    },

    // data: string of html
    // context (optional): If specified, the fragment will be created in this context, defaults to document
    // scripts (optional): If true, will include scripts passed in the html string
    parseHTML: function( data, context, scripts ) {
        var parsed;
        if ( !data || typeof data !== "string" ) {
            return null;
        }
        if ( typeof context === "boolean" ) {
            scripts = context;
            context = 0;
        }
        context = context || document;

        // Single tag
        if ( (parsed = rsingleTag.exec( data )) ) {
            return [ context.createElement( parsed[1] ) ];
        }

        parsed = jQuery.buildFragment( [ data ], context, scripts ? null : [] );
        return jQuery.merge( [],
            (parsed.cacheable ? jQuery.clone( parsed.fragment ) : parsed.fragment).childNodes );
    },

    parseJSON: function( data ) {
        if ( !data || typeof data !== "string") {
            return null;
        }

        // Make sure leading/trailing whitespace is removed (IE can't handle it)
        data = jQuery.trim( data );

        // Attempt to parse using the native JSON parser first
        if ( window.JSON && window.JSON.parse ) {
            return window.JSON.parse( data );
        }

        // Make sure the incoming data is actual JSON
        // Logic borrowed from http://json.org/json2.js
        if ( rvalidchars.test( data.replace( rvalidescape, "@" )
            .replace( rvalidtokens, "]" )
            .replace( rvalidbraces, "")) ) {

            return ( new Function( "return " + data ) )();

        }
        jQuery.error( "Invalid JSON: " + data );
    },

    // Cross-browser xml parsing
    parseXML: function( data ) {
        var xml, tmp;
        if ( !data || typeof data !== "string" ) {
            return null;
        }
        try {
            if ( window.DOMParser ) { // Standard
                tmp = new DOMParser();
                xml = tmp.parseFromString( data , "text/xml" );
            } else { // IE
                xml = new ActiveXObject( "Microsoft.XMLDOM" );
                xml.async = "false";
                xml.loadXML( data );
            }
        } catch( e ) {
            xml = undefined;
        }
        if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
            jQuery.error( "Invalid XML: " + data );
        }
        return xml;
    },

    noop: function() {},

    // Evaluates a script in a global context
    // Workarounds based on findings by Jim Driscoll
    // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
    globalEval: function( data ) {
        if ( data && core_rnotwhite.test( data ) ) {
            // We use execScript on Internet Explorer
            // We use an anonymous function so that context is window
            // rather than jQuery in Firefox
            ( window.execScript || function( data ) {
                window[ "eval" ].call( window, data );
            } )( data );
        }
    },

    // Convert dashed to camelCase; used by the css and data modules
    // Microsoft forgot to hump their vendor prefix (#9572)
    camelCase: function( string ) {
        return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
    },

    nodeName: function( elem, name ) {
        return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
    },

    // args is for internal usage only
    each: function( obj, callback, args ) {
        var name,
            i = 0,
            length = obj.length,
            isObj = length === undefined || jQuery.isFunction( obj );

        if ( args ) {
            if ( isObj ) {
                for ( name in obj ) {
                    if ( callback.apply( obj[ name ], args ) === false ) {
                        break;
                    }
                }
            } else {
                for ( ; i < length; ) {
                    if ( callback.apply( obj[ i++ ], args ) === false ) {
                        break;
                    }
                }
            }

        // A special, fast, case for the most common use of each
        } else {
            if ( isObj ) {
                for ( name in obj ) {
                    if ( callback.call( obj[ name ], name, obj[ name ] ) === false ) {
                        break;
                    }
                }
            } else {
                for ( ; i < length; ) {
                    if ( callback.call( obj[ i ], i, obj[ i++ ] ) === false ) {
                        break;
                    }
                }
            }
        }

        return obj;
    },

    // Use native String.trim function wherever possible
    trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
        function( text ) {
            return text == null ?
                "" :
                core_trim.call( text );
        } :

        // Otherwise use our own trimming functionality
        function( text ) {
            return text == null ?
                "" :
                ( text + "" ).replace( rtrim, "" );
        },

    // results is for internal usage only
    makeArray: function( arr, results ) {
        var type,
            ret = results || [];

        if ( arr != null ) {
            // The window, strings (and functions) also have 'length'
            // Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
            type = jQuery.type( arr );

            if ( arr.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( arr ) ) {
                core_push.call( ret, arr );
            } else {
                jQuery.merge( ret, arr );
            }
        }

        return ret;
    },

    inArray: function( elem, arr, i ) {
        var len;

        if ( arr ) {
            if ( core_indexOf ) {
                return core_indexOf.call( arr, elem, i );
            }

            len = arr.length;
            i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

            for ( ; i < len; i++ ) {
                // Skip accessing in sparse arrays
                if ( i in arr && arr[ i ] === elem ) {
                    return i;
                }
            }
        }

        return -1;
    },

    merge: function( first, second ) {
        var l = second.length,
            i = first.length,
            j = 0;

        if ( typeof l === "number" ) {
            for ( ; j < l; j++ ) {
                first[ i++ ] = second[ j ];
            }

        } else {
            while ( second[j] !== undefined ) {
                first[ i++ ] = second[ j++ ];
            }
        }

        first.length = i;

        return first;
    },

    grep: function( elems, callback, inv ) {
        var retVal,
            ret = [],
            i = 0,
            length = elems.length;
        inv = !!inv;

        // Go through the array, only saving the items
        // that pass the validator function
        for ( ; i < length; i++ ) {
            retVal = !!callback( elems[ i ], i );
            if ( inv !== retVal ) {
                ret.push( elems[ i ] );
            }
        }

        return ret;
    },

    // arg is for internal usage only
    map: function( elems, callback, arg ) {
        var value, key,
            ret = [],
            i = 0,
            length = elems.length,
            // jquery objects are treated as arrays
            isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

        // Go through the array, translating each of the items to their
        if ( isArray ) {
            for ( ; i < length; i++ ) {
                value = callback( elems[ i ], i, arg );

                if ( value != null ) {
                    ret[ ret.length ] = value;
                }
            }

        // Go through every key on the object,
        } else {
            for ( key in elems ) {
                value = callback( elems[ key ], key, arg );

                if ( value != null ) {
                    ret[ ret.length ] = value;
                }
            }
        }

        // Flatten any nested arrays
        return ret.concat.apply( [], ret );
    },

    // A global GUID counter for objects
    guid: 1,

    // Bind a function to a context, optionally partially applying any
    // arguments.
    proxy: function( fn, context ) {
        var tmp, args, proxy;

        if ( typeof context === "string" ) {
            tmp = fn[ context ];
            context = fn;
            fn = tmp;
        }

        // Quick check to determine if target is callable, in the spec
        // this throws a TypeError, but we will just return undefined.
        if ( !jQuery.isFunction( fn ) ) {
            return undefined;
        }

        // Simulated bind
        args = core_slice.call( arguments, 2 );
        proxy = function() {
            return fn.apply( context, args.concat( core_slice.call( arguments ) ) );
        };

        // Set the guid of unique handler to the same of original handler, so it can be removed
        proxy.guid = fn.guid = fn.guid || jQuery.guid++;

        return proxy;
    },

    // Multifunctional method to get and set values of a collection
    // The value/s can optionally be executed if it's a function
    access: function( elems, fn, key, value, chainable, emptyGet, pass ) {
        var exec,
            bulk = key == null,
            i = 0,
            length = elems.length;

        // Sets many values
        if ( key && typeof key === "object" ) {
            for ( i in key ) {
                jQuery.access( elems, fn, i, key[i], 1, emptyGet, value );
            }
            chainable = 1;

        // Sets one value
        } else if ( value !== undefined ) {
            // Optionally, function values get executed if exec is true
            exec = pass === undefined && jQuery.isFunction( value );

            if ( bulk ) {
                // Bulk operations only iterate when executing function values
                if ( exec ) {
                    exec = fn;
                    fn = function( elem, key, value ) {
                        return exec.call( jQuery( elem ), value );
                    };

                // Otherwise they run against the entire set
                } else {
                    fn.call( elems, value );
                    fn = null;
                }
            }

            if ( fn ) {
                for (; i < length; i++ ) {
                    fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
                }
            }

            chainable = 1;
        }

        return chainable ?
            elems :

            // Gets
            bulk ?
                fn.call( elems ) :
                length ? fn( elems[0], key ) : emptyGet;
    },

    now: function() {
        return ( new Date() ).getTime();
    }
});

jQuery.ready.promise = function( obj ) {
    if ( !readyList ) {

        readyList = jQuery.Deferred();

        // Catch cases where $(document).ready() is called after the browser event has already occurred.
        // we once tried to use readyState "interactive" here, but it caused issues like the one
        // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
        if ( document.readyState === "complete" ) {
            // Handle it asynchronously to allow scripts the opportunity to delay ready
            setTimeout( jQuery.ready, 1 );

        // Standards-based browsers support DOMContentLoaded
        } else if ( document.addEventListener ) {
            // Use the handy event callback
            document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

            // A fallback to window.onload, that will always work
            window.addEventListener( "load", jQuery.ready, false );

        // If IE event model is used
        } else {
            // Ensure firing before onload, maybe late but safe also for iframes
            document.attachEvent( "onreadystatechange", DOMContentLoaded );

            // A fallback to window.onload, that will always work
            window.attachEvent( "onload", jQuery.ready );

            // If IE and not a frame
            // continually check to see if the document is ready
            var top = false;

            try {
                top = window.frameElement == null && document.documentElement;
            } catch(e) {}

            if ( top && top.doScroll ) {
                (function doScrollCheck() {
                    if ( !jQuery.isReady ) {

                        try {
                            // Use the trick by Diego Perini
                            // http://javascript.nwbox.com/IEContentLoaded/
                            top.doScroll("left");
                        } catch(e) {
                            return setTimeout( doScrollCheck, 50 );
                        }

                        // and execute any waiting functions
                        jQuery.ready();
                    }
                })();
            }
        }
    }
    return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
    var object = optionsCache[ options ] = {};
    jQuery.each( options.split( core_rspace ), function( _, flag ) {
        object[ flag ] = true;
    });
    return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *  options: an optional list of space-separated options that will change how
 *          the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *  once:           will ensure the callback list can only be fired once (like a Deferred)
 *
 *  memory:         will keep track of previous values and will call any callback added
 *                  after the list has been fired right away with the latest "memorized"
 *                  values (like a Deferred)
 *
 *  unique:         will ensure a callback can only be added once (no duplicate in the list)
 *
 *  stopOnFalse:    interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

    // Convert options from String-formatted to Object-formatted if needed
    // (we check in cache first)
    options = typeof options === "string" ?
        ( optionsCache[ options ] || createOptions( options ) ) :
        jQuery.extend( {}, options );

    var // Last fire value (for non-forgettable lists)
        memory,
        // Flag to know if list was already fired
        fired,
        // Flag to know if list is currently firing
        firing,
        // First callback to fire (used internally by add and fireWith)
        firingStart,
        // End of the loop when firing
        firingLength,
        // Index of currently firing callback (modified by remove if needed)
        firingIndex,
        // Actual callback list
        list = [],
        // Stack of fire calls for repeatable lists
        stack = !options.once && [],
        // Fire callbacks
        fire = function( data ) {
            memory = options.memory && data;
            fired = true;
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;
            firing = true;
            for ( ; list && firingIndex < firingLength; firingIndex++ ) {
                if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
                    memory = false; // To prevent further calls using add
                    break;
                }
            }
            firing = false;
            if ( list ) {
                if ( stack ) {
                    if ( stack.length ) {
                        fire( stack.shift() );
                    }
                } else if ( memory ) {
                    list = [];
                } else {
                    self.disable();
                }
            }
        },
        // Actual Callbacks object
        self = {
            // Add a callback or a collection of callbacks to the list
            add: function() {
                if ( list ) {
                    // First, we save the current length
                    var start = list.length;
                    (function add( args ) {
                        jQuery.each( args, function( _, arg ) {
                            var type = jQuery.type( arg );
                            if ( type === "function" && ( !options.unique || !self.has( arg ) ) ) {
                                list.push( arg );
                            } else if ( arg && arg.length && type !== "string" ) {
                                // Inspect recursively
                                add( arg );
                            }
                        });
                    })( arguments );
                    // Do we need to add the callbacks to the
                    // current firing batch?
                    if ( firing ) {
                        firingLength = list.length;
                    // With memory, if we're not firing then
                    // we should call right away
                    } else if ( memory ) {
                        firingStart = start;
                        fire( memory );
                    }
                }
                return this;
            },
            // Remove a callback from the list
            remove: function() {
                if ( list ) {
                    jQuery.each( arguments, function( _, arg ) {
                        var index;
                        while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
                            list.splice( index, 1 );
                            // Handle firing indexes
                            if ( firing ) {
                                if ( index <= firingLength ) {
                                    firingLength--;
                                }
                                if ( index <= firingIndex ) {
                                    firingIndex--;
                                }
                            }
                        }
                    });
                }
                return this;
            },
            // Control if a given callback is in the list
            has: function( fn ) {
                return jQuery.inArray( fn, list ) > -1;
            },
            // Remove all callbacks from the list
            empty: function() {
                list = [];
                return this;
            },
            // Have the list do nothing anymore
            disable: function() {
                list = stack = memory = undefined;
                return this;
            },
            // Is it disabled?
            disabled: function() {
                return !list;
            },
            // Lock the list in its current state
            lock: function() {
                stack = undefined;
                if ( !memory ) {
                    self.disable();
                }
                return this;
            },
            // Is it locked?
            locked: function() {
                return !stack;
            },
            // Call all callbacks with the given context and arguments
            fireWith: function( context, args ) {
                args = args || [];
                args = [ context, args.slice ? args.slice() : args ];
                if ( list && ( !fired || stack ) ) {
                    if ( firing ) {
                        stack.push( args );
                    } else {
                        fire( args );
                    }
                }
                return this;
            },
            // Call all the callbacks with the given arguments
            fire: function() {
                self.fireWith( this, arguments );
                return this;
            },
            // To know if the callbacks have already been called at least once
            fired: function() {
                return !!fired;
            }
        };

    return self;
};
jQuery.extend({

    Deferred: function( func ) {
        var tuples = [
                // action, add listener, listener list, final state
                [ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
                [ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
                [ "notify", "progress", jQuery.Callbacks("memory") ]
            ],
            state = "pending",
            promise = {
                state: function() {
                    return state;
                },
                always: function() {
                    deferred.done( arguments ).fail( arguments );
                    return this;
                },
                then: function( /* fnDone, fnFail, fnProgress */ ) {
                    var fns = arguments;
                    return jQuery.Deferred(function( newDefer ) {
                        jQuery.each( tuples, function( i, tuple ) {
                            var action = tuple[ 0 ],
                                fn = fns[ i ];
                            // deferred[ done | fail | progress ] for forwarding actions to newDefer
                            deferred[ tuple[1] ]( jQuery.isFunction( fn ) ?
                                function() {
                                    var returned = fn.apply( this, arguments );
                                    if ( returned && jQuery.isFunction( returned.promise ) ) {
                                        returned.promise()
                                            .done( newDefer.resolve )
                                            .fail( newDefer.reject )
                                            .progress( newDefer.notify );
                                    } else {
                                        newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
                                    }
                                } :
                                newDefer[ action ]
                            );
                        });
                        fns = null;
                    }).promise();
                },
                // Get a promise for this deferred
                // If obj is provided, the promise aspect is added to the object
                promise: function( obj ) {
                    return obj != null ? jQuery.extend( obj, promise ) : promise;
                }
            },
            deferred = {};

        // Keep pipe for back-compat
        promise.pipe = promise.then;

        // Add list-specific methods
        jQuery.each( tuples, function( i, tuple ) {
            var list = tuple[ 2 ],
                stateString = tuple[ 3 ];

            // promise[ done | fail | progress ] = list.add
            promise[ tuple[1] ] = list.add;

            // Handle state
            if ( stateString ) {
                list.add(function() {
                    // state = [ resolved | rejected ]
                    state = stateString;

                // [ reject_list | resolve_list ].disable; progress_list.lock
                }, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
            }

            // deferred[ resolve | reject | notify ] = list.fire
            deferred[ tuple[0] ] = list.fire;
            deferred[ tuple[0] + "With" ] = list.fireWith;
        });

        // Make the deferred a promise
        promise.promise( deferred );

        // Call given func if any
        if ( func ) {
            func.call( deferred, deferred );
        }

        // All done!
        return deferred;
    },

    // Deferred helper
    when: function( subordinate /* , ..., subordinateN */ ) {
        var i = 0,
            resolveValues = core_slice.call( arguments ),
            length = resolveValues.length,

            // the count of uncompleted subordinates
            remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

            // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
            deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

            // Update function for both resolve and progress values
            updateFunc = function( i, contexts, values ) {
                return function( value ) {
                    contexts[ i ] = this;
                    values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
                    if( values === progressValues ) {
                        deferred.notifyWith( contexts, values );
                    } else if ( !( --remaining ) ) {
                        deferred.resolveWith( contexts, values );
                    }
                };
            },

            progressValues, progressContexts, resolveContexts;

        // add listeners to Deferred subordinates; treat others as resolved
        if ( length > 1 ) {
            progressValues = new Array( length );
            progressContexts = new Array( length );
            resolveContexts = new Array( length );
            for ( ; i < length; i++ ) {
                if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
                    resolveValues[ i ].promise()
                        .done( updateFunc( i, resolveContexts, resolveValues ) )
                        .fail( deferred.reject )
                        .progress( updateFunc( i, progressContexts, progressValues ) );
                } else {
                    --remaining;
                }
            }
        }

        // if we're not waiting on anything, resolve the master
        if ( !remaining ) {
            deferred.resolveWith( resolveContexts, resolveValues );
        }

        return deferred.promise();
    }
});
jQuery.support = (function() {

    var support,
        all,
        a,
        select,
        opt,
        input,
        fragment,
        eventName,
        i,
        isSupported,
        clickFn,
        div = document.createElement("div");

    // Preliminary tests
    div.setAttribute( "className", "t" );
    div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

    all = div.getElementsByTagName("*");
    a = div.getElementsByTagName("a")[ 0 ];
    a.style.cssText = "top:1px;float:left;opacity:.5";

    // Can't get basic test support
    if ( !all || !all.length ) {
        return {};
    }

    // First batch of supports tests
    select = document.createElement("select");
    opt = select.appendChild( document.createElement("option") );
    input = div.getElementsByTagName("input")[ 0 ];

    support = {
        // IE strips leading whitespace when .innerHTML is used
        leadingWhitespace: ( div.firstChild.nodeType === 3 ),

        // Make sure that tbody elements aren't automatically inserted
        // IE will insert them into empty tables
        tbody: !div.getElementsByTagName("tbody").length,

        // Make sure that link elements get serialized correctly by innerHTML
        // This requires a wrapper element in IE
        htmlSerialize: !!div.getElementsByTagName("link").length,

        // Get the style information from getAttribute
        // (IE uses .cssText instead)
        style: /top/.test( a.getAttribute("style") ),

        // Make sure that URLs aren't manipulated
        // (IE normalizes it by default)
        hrefNormalized: ( a.getAttribute("href") === "/a" ),

        // Make sure that element opacity exists
        // (IE uses filter instead)
        // Use a regex to work around a WebKit issue. See #5145
        opacity: /^0.5/.test( a.style.opacity ),

        // Verify style float existence
        // (IE uses styleFloat instead of cssFloat)
        cssFloat: !!a.style.cssFloat,

        // Make sure that if no value is specified for a checkbox
        // that it defaults to "on".
        // (WebKit defaults to "" instead)
        checkOn: ( input.value === "on" ),

        // Make sure that a selected-by-default option has a working selected property.
        // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
        optSelected: opt.selected,

        // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
        getSetAttribute: div.className !== "t",

        // Tests for enctype support on a form(#6743)
        enctype: !!document.createElement("form").enctype,

        // Makes sure cloning an html5 element does not cause problems
        // Where outerHTML is undefined, this still works
        html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

        // jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
        boxModel: ( document.compatMode === "CSS1Compat" ),

        // Will be defined later
        submitBubbles: true,
        changeBubbles: true,
        focusinBubbles: false,
        deleteExpando: true,
        noCloneEvent: true,
        inlineBlockNeedsLayout: false,
        shrinkWrapBlocks: false,
        reliableMarginRight: true,
        boxSizingReliable: true,
        pixelPosition: false
    };

    // Make sure checked status is properly cloned
    input.checked = true;
    support.noCloneChecked = input.cloneNode( true ).checked;

    // Make sure that the options inside disabled selects aren't marked as disabled
    // (WebKit marks them as disabled)
    select.disabled = true;
    support.optDisabled = !opt.disabled;

    // Test to see if it's possible to delete an expando from an element
    // Fails in Internet Explorer
    try {
        delete div.test;
    } catch( e ) {
        support.deleteExpando = false;
    }

    if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
        div.attachEvent( "onclick", clickFn = function() {
            // Cloning a node shouldn't copy over any
            // bound event handlers (IE does this)
            support.noCloneEvent = false;
        });
        div.cloneNode( true ).fireEvent("onclick");
        div.detachEvent( "onclick", clickFn );
    }

    // Check if a radio maintains its value
    // after being appended to the DOM
    input = document.createElement("input");
    input.value = "t";
    input.setAttribute( "type", "radio" );
    support.radioValue = input.value === "t";

    input.setAttribute( "checked", "checked" );

    // #11217 - WebKit loses check when the name is after the checked attribute
    input.setAttribute( "name", "t" );

    div.appendChild( input );
    fragment = document.createDocumentFragment();
    fragment.appendChild( div.lastChild );

    // WebKit doesn't clone checked state correctly in fragments
    support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

    // Check if a disconnected checkbox will retain its checked
    // value of true after appended to the DOM (IE6/7)
    support.appendChecked = input.checked;

    fragment.removeChild( input );
    fragment.appendChild( div );

    // Technique from Juriy Zaytsev
    // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
    // We only care about the case where non-standard event systems
    // are used, namely in IE. Short-circuiting here helps us to
    // avoid an eval call (in setAttribute) which can cause CSP
    // to go haywire. See: https://developer.mozilla.org/en/Security/CSP
    if ( div.attachEvent ) {
        for ( i in {
            submit: true,
            change: true,
            focusin: true
        }) {
            eventName = "on" + i;
            isSupported = ( eventName in div );
            if ( !isSupported ) {
                div.setAttribute( eventName, "return;" );
                isSupported = ( typeof div[ eventName ] === "function" );
            }
            support[ i + "Bubbles" ] = isSupported;
        }
    }

    // Run tests that need a body at doc ready
    jQuery(function() {
        var container, div, tds, marginDiv,
            divReset = "padding:0;margin:0;border:0;display:block;overflow:hidden;",
            body = document.getElementsByTagName("body")[0];

        if ( !body ) {
            // Return for frameset docs that don't have a body
            return;
        }

        container = document.createElement("div");
        container.style.cssText = "visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px";
        body.insertBefore( container, body.firstChild );

        // Construct the test element
        div = document.createElement("div");
        container.appendChild( div );

        // Check if table cells still have offsetWidth/Height when they are set
        // to display:none and there are still other visible table cells in a
        // table row; if so, offsetWidth/Height are not reliable for use when
        // determining if an element has been hidden directly using
        // display:none (it is still safe to use offsets if a parent element is
        // hidden; don safety goggles and see bug #4512 for more information).
        // (only IE 8 fails this test)
        div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
        tds = div.getElementsByTagName("td");
        tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
        isSupported = ( tds[ 0 ].offsetHeight === 0 );

        tds[ 0 ].style.display = "";
        tds[ 1 ].style.display = "none";

        // Check if empty table cells still have offsetWidth/Height
        // (IE <= 8 fail this test)
        support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

        // Check box-sizing and margin behavior
        div.innerHTML = "";
        div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
        support.boxSizing = ( div.offsetWidth === 4 );
        support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

        // NOTE: To any future maintainer, we've window.getComputedStyle
        // because jsdom on node.js will break without it.
        if ( window.getComputedStyle ) {
            support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
            support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

            // Check if div with explicit width and no margin-right incorrectly
            // gets computed margin-right based on width of container. For more
            // info see bug #3333
            // Fails in WebKit before Feb 2011 nightlies
            // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
            marginDiv = document.createElement("div");
            marginDiv.style.cssText = div.style.cssText = divReset;
            marginDiv.style.marginRight = marginDiv.style.width = "0";
            div.style.width = "1px";
            div.appendChild( marginDiv );
            support.reliableMarginRight =
                !parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
        }

        if ( typeof div.style.zoom !== "undefined" ) {
            // Check if natively block-level elements act like inline-block
            // elements when setting their display to 'inline' and giving
            // them layout
            // (IE < 8 does this)
            div.innerHTML = "";
            div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
            support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

            // Check if elements with layout shrink-wrap their children
            // (IE 6 does this)
            div.style.display = "block";
            div.style.overflow = "visible";
            div.innerHTML = "<div></div>";
            div.firstChild.style.width = "5px";
            support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

            container.style.zoom = 1;
        }

        // Null elements to avoid leaks in IE
        body.removeChild( container );
        container = div = tds = marginDiv = null;
    });

    // Null elements to avoid leaks in IE
    fragment.removeChild( div );
    all = a = select = opt = input = fragment = div = null;

    return support;
})();
var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
    rmultiDash = /([A-Z])/g;

jQuery.extend({
    cache: {},

    deletedIds: [],

    // Remove at next major release (1.9/2.0)
    uuid: 0,

    // Unique for each copy of jQuery on the page
    // Non-digits removed to match rinlinejQuery
    expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

    // The following elements throw uncatchable exceptions if you
    // attempt to add expando properties to them.
    noData: {
        "embed": true,
        // Ban all objects except for Flash (which handle expandos)
        "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
        "applet": true
    },

    hasData: function( elem ) {
        elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
        return !!elem && !isEmptyDataObject( elem );
    },

    data: function( elem, name, data, pvt /* Internal Use Only */ ) {
        if ( !jQuery.acceptData( elem ) ) {
            return;
        }

        var thisCache, ret,
            internalKey = jQuery.expando,
            getByName = typeof name === "string",

            // We have to handle DOM nodes and JS objects differently because IE6-7
            // can't GC object references properly across the DOM-JS boundary
            isNode = elem.nodeType,

            // Only DOM nodes need the global jQuery cache; JS object data is
            // attached directly to the object so GC can occur automatically
            cache = isNode ? jQuery.cache : elem,

            // Only defining an ID for JS objects if its cache already exists allows
            // the code to shortcut on the same path as a DOM node with no cache
            id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

        // Avoid doing any more work than we need to when trying to get data on an
        // object that has no data at all
        if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
            return;
        }

        if ( !id ) {
            // Only DOM nodes need a new unique ID for each element since their data
            // ends up in the global cache
            if ( isNode ) {
                elem[ internalKey ] = id = jQuery.deletedIds.pop() || jQuery.guid++;
            } else {
                id = internalKey;
            }
        }

        if ( !cache[ id ] ) {
            cache[ id ] = {};

            // Avoids exposing jQuery metadata on plain JS objects when the object
            // is serialized using JSON.stringify
            if ( !isNode ) {
                cache[ id ].toJSON = jQuery.noop;
            }
        }

        // An object can be passed to jQuery.data instead of a key/value pair; this gets
        // shallow copied over onto the existing cache
        if ( typeof name === "object" || typeof name === "function" ) {
            if ( pvt ) {
                cache[ id ] = jQuery.extend( cache[ id ], name );
            } else {
                cache[ id ].data = jQuery.extend( cache[ id ].data, name );
            }
        }

        thisCache = cache[ id ];

        // jQuery data() is stored in a separate object inside the object's internal data
        // cache in order to avoid key collisions between internal data and user-defined
        // data.
        if ( !pvt ) {
            if ( !thisCache.data ) {
                thisCache.data = {};
            }

            thisCache = thisCache.data;
        }

        if ( data !== undefined ) {
            thisCache[ jQuery.camelCase( name ) ] = data;
        }

        // Check for both converted-to-camel and non-converted data property names
        // If a data property was specified
        if ( getByName ) {

            // First Try to find as-is property data
            ret = thisCache[ name ];

            // Test for null|undefined property data
            if ( ret == null ) {

                // Try to find the camelCased property
                ret = thisCache[ jQuery.camelCase( name ) ];
            }
        } else {
            ret = thisCache;
        }

        return ret;
    },

    removeData: function( elem, name, pvt /* Internal Use Only */ ) {
        if ( !jQuery.acceptData( elem ) ) {
            return;
        }

        var thisCache, i, l,

            isNode = elem.nodeType,

            // See jQuery.data for more information
            cache = isNode ? jQuery.cache : elem,
            id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

        // If there is already no cache entry for this object, there is no
        // purpose in continuing
        if ( !cache[ id ] ) {
            return;
        }

        if ( name ) {

            thisCache = pvt ? cache[ id ] : cache[ id ].data;

            if ( thisCache ) {

                // Support array or space separated string names for data keys
                if ( !jQuery.isArray( name ) ) {

                    // try the string as a key before any manipulation
                    if ( name in thisCache ) {
                        name = [ name ];
                    } else {

                        // split the camel cased version by spaces unless a key with the spaces exists
                        name = jQuery.camelCase( name );
                        if ( name in thisCache ) {
                            name = [ name ];
                        } else {
                            name = name.split(" ");
                        }
                    }
                }

                for ( i = 0, l = name.length; i < l; i++ ) {
                    delete thisCache[ name[i] ];
                }

                // If there is no data left in the cache, we want to continue
                // and let the cache object itself get destroyed
                if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
                    return;
                }
            }
        }

        // See jQuery.data for more information
        if ( !pvt ) {
            delete cache[ id ].data;

            // Don't destroy the parent cache unless the internal data object
            // had been the only thing left in it
            if ( !isEmptyDataObject( cache[ id ] ) ) {
                return;
            }
        }

        // Destroy the cache
        if ( isNode ) {
            jQuery.cleanData( [ elem ], true );

        // Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
        } else if ( jQuery.support.deleteExpando || cache != cache.window ) {
            delete cache[ id ];

        // When all else fails, null
        } else {
            cache[ id ] = null;
        }
    },

    // For internal use only.
    _data: function( elem, name, data ) {
        return jQuery.data( elem, name, data, true );
    },

    // A method for determining if a DOM node can handle the data expando
    acceptData: function( elem ) {
        var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

        // nodes accept data unless otherwise specified; rejection can be conditional
        return !noData || noData !== true && elem.getAttribute("classid") === noData;
    }
});

jQuery.fn.extend({
    data: function( key, value ) {
        var parts, part, attr, name, l,
            elem = this[0],
            i = 0,
            data = null;

        // Gets all values
        if ( key === undefined ) {
            if ( this.length ) {
                data = jQuery.data( elem );

                if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
                    attr = elem.attributes;
                    for ( l = attr.length; i < l; i++ ) {
                        name = attr[i].name;

                        if ( !name.indexOf( "data-" ) ) {
                            name = jQuery.camelCase( name.substring(5) );

                            dataAttr( elem, name, data[ name ] );
                        }
                    }
                    jQuery._data( elem, "parsedAttrs", true );
                }
            }

            return data;
        }

        // Sets multiple values
        if ( typeof key === "object" ) {
            return this.each(function() {
                jQuery.data( this, key );
            });
        }

        parts = key.split( ".", 2 );
        parts[1] = parts[1] ? "." + parts[1] : "";
        part = parts[1] + "!";

        return jQuery.access( this, function( value ) {

            if ( value === undefined ) {
                data = this.triggerHandler( "getData" + part, [ parts[0] ] );

                // Try to fetch any internally stored data first
                if ( data === undefined && elem ) {
                    data = jQuery.data( elem, key );
                    data = dataAttr( elem, key, data );
                }

                return data === undefined && parts[1] ?
                    this.data( parts[0] ) :
                    data;
            }

            parts[1] = value;
            this.each(function() {
                var self = jQuery( this );

                self.triggerHandler( "setData" + part, parts );
                jQuery.data( this, key, value );
                self.triggerHandler( "changeData" + part, parts );
            });
        }, null, value, arguments.length > 1, null, false );
    },

    removeData: function( key ) {
        return this.each(function() {
            jQuery.removeData( this, key );
        });
    }
});

function dataAttr( elem, key, data ) {
    // If nothing was found internally, try to fetch any
    // data from the HTML5 data-* attribute
    if ( data === undefined && elem.nodeType === 1 ) {

        var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

        data = elem.getAttribute( name );

        if ( typeof data === "string" ) {
            try {
                data = data === "true" ? true :
                data === "false" ? false :
                data === "null" ? null :
                // Only convert to a number if it doesn't change the string
                +data + "" === data ? +data :
                rbrace.test( data ) ? jQuery.parseJSON( data ) :
                    data;
            } catch( e ) {}

            // Make sure we set the data so it isn't changed later
            jQuery.data( elem, key, data );

        } else {
            data = undefined;
        }
    }

    return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
    var name;
    for ( name in obj ) {

        // if the public data object is empty, the private is still empty
        if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
            continue;
        }
        if ( name !== "toJSON" ) {
            return false;
        }
    }

    return true;
}
jQuery.extend({
    queue: function( elem, type, data ) {
        var queue;

        if ( elem ) {
            type = ( type || "fx" ) + "queue";
            queue = jQuery._data( elem, type );

            // Speed up dequeue by getting out quickly if this is just a lookup
            if ( data ) {
                if ( !queue || jQuery.isArray(data) ) {
                    queue = jQuery._data( elem, type, jQuery.makeArray(data) );
                } else {
                    queue.push( data );
                }
            }
            return queue || [];
        }
    },

    dequeue: function( elem, type ) {
        type = type || "fx";

        var queue = jQuery.queue( elem, type ),
            startLength = queue.length,
            fn = queue.shift(),
            hooks = jQuery._queueHooks( elem, type ),
            next = function() {
                jQuery.dequeue( elem, type );
            };

        // If the fx queue is dequeued, always remove the progress sentinel
        if ( fn === "inprogress" ) {
            fn = queue.shift();
            startLength--;
        }

        if ( fn ) {

            // Add a progress sentinel to prevent the fx queue from being
            // automatically dequeued
            if ( type === "fx" ) {
                queue.unshift( "inprogress" );
            }

            // clear up the last queue stop function
            delete hooks.stop;
            fn.call( elem, next, hooks );
        }

        if ( !startLength && hooks ) {
            hooks.empty.fire();
        }
    },

    // not intended for public consumption - generates a queueHooks object, or returns the current one
    _queueHooks: function( elem, type ) {
        var key = type + "queueHooks";
        return jQuery._data( elem, key ) || jQuery._data( elem, key, {
            empty: jQuery.Callbacks("once memory").add(function() {
                jQuery.removeData( elem, type + "queue", true );
                jQuery.removeData( elem, key, true );
            })
        });
    }
});

jQuery.fn.extend({
    queue: function( type, data ) {
        var setter = 2;

        if ( typeof type !== "string" ) {
            data = type;
            type = "fx";
            setter--;
        }

        if ( arguments.length < setter ) {
            return jQuery.queue( this[0], type );
        }

        return data === undefined ?
            this :
            this.each(function() {
                var queue = jQuery.queue( this, type, data );

                // ensure a hooks for this queue
                jQuery._queueHooks( this, type );

                if ( type === "fx" && queue[0] !== "inprogress" ) {
                    jQuery.dequeue( this, type );
                }
            });
    },
    dequeue: function( type ) {
        return this.each(function() {
            jQuery.dequeue( this, type );
        });
    },
    // Based off of the plugin by Clint Helfers, with permission.
    // http://blindsignals.com/index.php/2009/07/jquery-delay/
    delay: function( time, type ) {
        time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
        type = type || "fx";

        return this.queue( type, function( next, hooks ) {
            var timeout = setTimeout( next, time );
            hooks.stop = function() {
                clearTimeout( timeout );
            };
        });
    },
    clearQueue: function( type ) {
        return this.queue( type || "fx", [] );
    },
    // Get a promise resolved when queues of a certain type
    // are emptied (fx is the type by default)
    promise: function( type, obj ) {
        var tmp,
            count = 1,
            defer = jQuery.Deferred(),
            elements = this,
            i = this.length,
            resolve = function() {
                if ( !( --count ) ) {
                    defer.resolveWith( elements, [ elements ] );
                }
            };

        if ( typeof type !== "string" ) {
            obj = type;
            type = undefined;
        }
        type = type || "fx";

        while( i-- ) {
            tmp = jQuery._data( elements[ i ], type + "queueHooks" );
            if ( tmp && tmp.empty ) {
                count++;
                tmp.empty.add( resolve );
            }
        }
        resolve();
        return defer.promise( obj );
    }
});
var nodeHook, boolHook, fixSpecified,
    rclass = /[\t\r\n]/g,
    rreturn = /\r/g,
    rtype = /^(?:button|input)$/i,
    rfocusable = /^(?:button|input|object|select|textarea)$/i,
    rclickable = /^a(?:rea|)$/i,
    rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
    getSetAttribute = jQuery.support.getSetAttribute;

jQuery.fn.extend({
    attr: function( name, value ) {
        return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
    },

    removeAttr: function( name ) {
        return this.each(function() {
            jQuery.removeAttr( this, name );
        });
    },

    prop: function( name, value ) {
        return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
    },

    removeProp: function( name ) {
        name = jQuery.propFix[ name ] || name;
        return this.each(function() {
            // try/catch handles cases where IE balks (such as removing a property on window)
            try {
                this[ name ] = undefined;
                delete this[ name ];
            } catch( e ) {}
        });
    },

    addClass: function( value ) {
        var classNames, i, l, elem,
            setClass, c, cl;

        if ( jQuery.isFunction( value ) ) {
            return this.each(function( j ) {
                jQuery( this ).addClass( value.call(this, j, this.className) );
            });
        }

        if ( value && typeof value === "string" ) {
            classNames = value.split( core_rspace );

            for ( i = 0, l = this.length; i < l; i++ ) {
                elem = this[ i ];

                if ( elem.nodeType === 1 ) {
                    if ( !elem.className && classNames.length === 1 ) {
                        elem.className = value;

                    } else {
                        setClass = " " + elem.className + " ";

                        for ( c = 0, cl = classNames.length; c < cl; c++ ) {
                            if ( setClass.indexOf( " " + classNames[ c ] + " " ) < 0 ) {
                                setClass += classNames[ c ] + " ";
                            }
                        }
                        elem.className = jQuery.trim( setClass );
                    }
                }
            }
        }

        return this;
    },

    removeClass: function( value ) {
        var removes, className, elem, c, cl, i, l;

        if ( jQuery.isFunction( value ) ) {
            return this.each(function( j ) {
                jQuery( this ).removeClass( value.call(this, j, this.className) );
            });
        }
        if ( (value && typeof value === "string") || value === undefined ) {
            removes = ( value || "" ).split( core_rspace );

            for ( i = 0, l = this.length; i < l; i++ ) {
                elem = this[ i ];
                if ( elem.nodeType === 1 && elem.className ) {

                    className = (" " + elem.className + " ").replace( rclass, " " );

                    // loop over each item in the removal list
                    for ( c = 0, cl = removes.length; c < cl; c++ ) {
                        // Remove until there is nothing to remove,
                        while ( className.indexOf(" " + removes[ c ] + " ") >= 0 ) {
                            className = className.replace( " " + removes[ c ] + " " , " " );
                        }
                    }
                    elem.className = value ? jQuery.trim( className ) : "";
                }
            }
        }

        return this;
    },

    toggleClass: function( value, stateVal ) {
        var type = typeof value,
            isBool = typeof stateVal === "boolean";

        if ( jQuery.isFunction( value ) ) {
            return this.each(function( i ) {
                jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
            });
        }

        return this.each(function() {
            if ( type === "string" ) {
                // toggle individual class names
                var className,
                    i = 0,
                    self = jQuery( this ),
                    state = stateVal,
                    classNames = value.split( core_rspace );

                while ( (className = classNames[ i++ ]) ) {
                    // check each className given, space separated list
                    state = isBool ? state : !self.hasClass( className );
                    self[ state ? "addClass" : "removeClass" ]( className );
                }

            } else if ( type === "undefined" || type === "boolean" ) {
                if ( this.className ) {
                    // store className if set
                    jQuery._data( this, "__className__", this.className );
                }

                // toggle whole className
                this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
            }
        });
    },

    hasClass: function( selector ) {
        var className = " " + selector + " ",
            i = 0,
            l = this.length;
        for ( ; i < l; i++ ) {
            if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
                return true;
            }
        }

        return false;
    },

    val: function( value ) {
        var hooks, ret, isFunction,
            elem = this[0];

        if ( !arguments.length ) {
            if ( elem ) {
                hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

                if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
                    return ret;
                }

                ret = elem.value;

                return typeof ret === "string" ?
                    // handle most common string cases
                    ret.replace(rreturn, "") :
                    // handle cases where value is null/undef or number
                    ret == null ? "" : ret;
            }

            return;
        }

        isFunction = jQuery.isFunction( value );

        return this.each(function( i ) {
            var val,
                self = jQuery(this);

            if ( this.nodeType !== 1 ) {
                return;
            }

            if ( isFunction ) {
                val = value.call( this, i, self.val() );
            } else {
                val = value;
            }

            // Treat null/undefined as ""; convert numbers to string
            if ( val == null ) {
                val = "";
            } else if ( typeof val === "number" ) {
                val += "";
            } else if ( jQuery.isArray( val ) ) {
                val = jQuery.map(val, function ( value ) {
                    return value == null ? "" : value + "";
                });
            }

            hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

            // If set returns undefined, fall back to normal setting
            if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
                this.value = val;
            }
        });
    }
});

jQuery.extend({
    valHooks: {
        option: {
            get: function( elem ) {
                // attributes.value is undefined in Blackberry 4.7 but
                // uses .value. See #6932
                var val = elem.attributes.value;
                return !val || val.specified ? elem.value : elem.text;
            }
        },
        select: {
            get: function( elem ) {
                var value, i, max, option,
                    index = elem.selectedIndex,
                    values = [],
                    options = elem.options,
                    one = elem.type === "select-one";

                // Nothing was selected
                if ( index < 0 ) {
                    return null;
                }

                // Loop through all the selected options
                i = one ? index : 0;
                max = one ? index + 1 : options.length;
                for ( ; i < max; i++ ) {
                    option = options[ i ];

                    // Don't return options that are disabled or in a disabled optgroup
                    if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
                            (!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

                        // Get the specific value for the option
                        value = jQuery( option ).val();

                        // We don't need an array for one selects
                        if ( one ) {
                            return value;
                        }

                        // Multi-Selects return an array
                        values.push( value );
                    }
                }

                // Fixes Bug #2551 -- select.val() broken in IE after form.reset()
                if ( one && !values.length && options.length ) {
                    return jQuery( options[ index ] ).val();
                }

                return values;
            },

            set: function( elem, value ) {
                var values = jQuery.makeArray( value );

                jQuery(elem).find("option").each(function() {
                    this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
                });

                if ( !values.length ) {
                    elem.selectedIndex = -1;
                }
                return values;
            }
        }
    },

    // Unused in 1.8, left in so attrFn-stabbers won't die; remove in 1.9
    attrFn: {},

    attr: function( elem, name, value, pass ) {
        var ret, hooks, notxml,
            nType = elem.nodeType;

        // don't get/set attributes on text, comment and attribute nodes
        if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
            return;
        }

        if ( pass && jQuery.isFunction( jQuery.fn[ name ] ) ) {
            return jQuery( elem )[ name ]( value );
        }

        // Fallback to prop when attributes are not supported
        if ( typeof elem.getAttribute === "undefined" ) {
            return jQuery.prop( elem, name, value );
        }

        notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

        // All attributes are lowercase
        // Grab necessary hook if one is defined
        if ( notxml ) {
            name = name.toLowerCase();
            hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
        }

        if ( value !== undefined ) {

            if ( value === null ) {
                jQuery.removeAttr( elem, name );
                return;

            } else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
                return ret;

            } else {
                elem.setAttribute( name, value + "" );
                return value;
            }

        } else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
            return ret;

        } else {

            ret = elem.getAttribute( name );

            // Non-existent attributes return null, we normalize to undefined
            return ret === null ?
                undefined :
                ret;
        }
    },

    removeAttr: function( elem, value ) {
        var propName, attrNames, name, isBool,
            i = 0;

        if ( value && elem.nodeType === 1 ) {

            attrNames = value.split( core_rspace );

            for ( ; i < attrNames.length; i++ ) {
                name = attrNames[ i ];

                if ( name ) {
                    propName = jQuery.propFix[ name ] || name;
                    isBool = rboolean.test( name );

                    // See #9699 for explanation of this approach (setting first, then removal)
                    // Do not do this for boolean attributes (see #10870)
                    if ( !isBool ) {
                        jQuery.attr( elem, name, "" );
                    }
                    elem.removeAttribute( getSetAttribute ? name : propName );

                    // Set corresponding property to false for boolean attributes
                    if ( isBool && propName in elem ) {
                        elem[ propName ] = false;
                    }
                }
            }
        }
    },

    attrHooks: {
        type: {
            set: function( elem, value ) {
                // We can't allow the type property to be changed (since it causes problems in IE)
                if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
                    jQuery.error( "type property can't be changed" );
                } else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
                    // Setting the type on a radio button after the value resets the value in IE6-9
                    // Reset value to it's default in case type is set after value
                    // This is for element creation
                    var val = elem.value;
                    elem.setAttribute( "type", value );
                    if ( val ) {
                        elem.value = val;
                    }
                    return value;
                }
            }
        },
        // Use the value property for back compat
        // Use the nodeHook for button elements in IE6/7 (#1954)
        value: {
            get: function( elem, name ) {
                if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
                    return nodeHook.get( elem, name );
                }
                return name in elem ?
                    elem.value :
                    null;
            },
            set: function( elem, value, name ) {
                if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
                    return nodeHook.set( elem, value, name );
                }
                // Does not return so that setAttribute is also used
                elem.value = value;
            }
        }
    },

    propFix: {
        tabindex: "tabIndex",
        readonly: "readOnly",
        "for": "htmlFor",
        "class": "className",
        maxlength: "maxLength",
        cellspacing: "cellSpacing",
        cellpadding: "cellPadding",
        rowspan: "rowSpan",
        colspan: "colSpan",
        usemap: "useMap",
        frameborder: "frameBorder",
        contenteditable: "contentEditable"
    },

    prop: function( elem, name, value ) {
        var ret, hooks, notxml,
            nType = elem.nodeType;

        // don't get/set properties on text, comment and attribute nodes
        if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
            return;
        }

        notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

        if ( notxml ) {
            // Fix name and attach hooks
            name = jQuery.propFix[ name ] || name;
            hooks = jQuery.propHooks[ name ];
        }

        if ( value !== undefined ) {
            if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
                return ret;

            } else {
                return ( elem[ name ] = value );
            }

        } else {
            if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
                return ret;

            } else {
                return elem[ name ];
            }
        }
    },

    propHooks: {
        tabIndex: {
            get: function( elem ) {
                // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
                // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                var attributeNode = elem.getAttributeNode("tabindex");

                return attributeNode && attributeNode.specified ?
                    parseInt( attributeNode.value, 10 ) :
                    rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
                        0 :
                        undefined;
            }
        }
    }
});

// Hook for boolean attributes
boolHook = {
    get: function( elem, name ) {
        // Align boolean attributes with corresponding properties
        // Fall back to attribute presence where some booleans are not supported
        var attrNode,
            property = jQuery.prop( elem, name );
        return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
            name.toLowerCase() :
            undefined;
    },
    set: function( elem, value, name ) {
        var propName;
        if ( value === false ) {
            // Remove boolean attributes when set to false
            jQuery.removeAttr( elem, name );
        } else {
            // value is true since we know at this point it's type boolean and not false
            // Set boolean attributes to the same name and set the DOM property
            propName = jQuery.propFix[ name ] || name;
            if ( propName in elem ) {
                // Only set the IDL specifically if it already exists on the element
                elem[ propName ] = true;
            }

            elem.setAttribute( name, name.toLowerCase() );
        }
        return name;
    }
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

    fixSpecified = {
        name: true,
        id: true,
        coords: true
    };

    // Use this for any attribute in IE6/7
    // This fixes almost every IE6/7 issue
    nodeHook = jQuery.valHooks.button = {
        get: function( elem, name ) {
            var ret;
            ret = elem.getAttributeNode( name );
            return ret && ( fixSpecified[ name ] ? ret.value !== "" : ret.specified ) ?
                ret.value :
                undefined;
        },
        set: function( elem, value, name ) {
            // Set the existing or create a new attribute node
            var ret = elem.getAttributeNode( name );
            if ( !ret ) {
                ret = document.createAttribute( name );
                elem.setAttributeNode( ret );
            }
            return ( ret.value = value + "" );
        }
    };

    // Set width and height to auto instead of 0 on empty string( Bug #8150 )
    // This is for removals
    jQuery.each([ "width", "height" ], function( i, name ) {
        jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
            set: function( elem, value ) {
                if ( value === "" ) {
                    elem.setAttribute( name, "auto" );
                    return value;
                }
            }
        });
    });

    // Set contenteditable to false on removals(#10429)
    // Setting to empty string throws an error as an invalid value
    jQuery.attrHooks.contenteditable = {
        get: nodeHook.get,
        set: function( elem, value, name ) {
            if ( value === "" ) {
                value = "false";
            }
            nodeHook.set( elem, value, name );
        }
    };
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
    jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
        jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
            get: function( elem ) {
                var ret = elem.getAttribute( name, 2 );
                return ret === null ? undefined : ret;
            }
        });
    });
}

if ( !jQuery.support.style ) {
    jQuery.attrHooks.style = {
        get: function( elem ) {
            // Return undefined in the case of empty string
            // Normalize to lowercase since IE uppercases css property names
            return elem.style.cssText.toLowerCase() || undefined;
        },
        set: function( elem, value ) {
            return ( elem.style.cssText = value + "" );
        }
    };
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
    jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
        get: function( elem ) {
            var parent = elem.parentNode;

            if ( parent ) {
                parent.selectedIndex;

                // Make sure that it also works with optgroups, see #5701
                if ( parent.parentNode ) {
                    parent.parentNode.selectedIndex;
                }
            }
            return null;
        }
    });
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
    jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
    jQuery.each([ "radio", "checkbox" ], function() {
        jQuery.valHooks[ this ] = {
            get: function( elem ) {
                // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                return elem.getAttribute("value") === null ? "on" : elem.value;
            }
        };
    });
}
jQuery.each([ "radio", "checkbox" ], function() {
    jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
        set: function( elem, value ) {
            if ( jQuery.isArray( value ) ) {
                return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
            }
        }
    });
});
var rformElems = /^(?:textarea|input|select)$/i,
    rtypenamespace = /^([^\.]*|)(?:\.(.+)|)$/,
    rhoverHack = /(?:^|\s)hover(\.\S+|)\b/,
    rkeyEvent = /^key/,
    rmouseEvent = /^(?:mouse|contextmenu)|click/,
    rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
    hoverHack = function( events ) {
        return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
    };

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

    add: function( elem, types, handler, data, selector ) {

        var elemData, eventHandle, events,
            t, tns, type, namespaces, handleObj,
            handleObjIn, handlers, special;

        // Don't attach events to noData or text/comment nodes (allow plain objects tho)
        if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
            return;
        }

        // Caller can pass in an object of custom data in lieu of the handler
        if ( handler.handler ) {
            handleObjIn = handler;
            handler = handleObjIn.handler;
            selector = handleObjIn.selector;
        }

        // Make sure that the handler has a unique ID, used to find/remove it later
        if ( !handler.guid ) {
            handler.guid = jQuery.guid++;
        }

        // Init the element's event structure and main handler, if this is the first
        events = elemData.events;
        if ( !events ) {
            elemData.events = events = {};
        }
        eventHandle = elemData.handle;
        if ( !eventHandle ) {
            elemData.handle = eventHandle = function( e ) {
                // Discard the second event of a jQuery.event.trigger() and
                // when an event is called after a page has unloaded
                return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
                    jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
                    undefined;
            };
            // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
            eventHandle.elem = elem;
        }

        // Handle multiple events separated by a space
        // jQuery(...).bind("mouseover mouseout", fn);
        types = jQuery.trim( hoverHack(types) ).split( " " );
        for ( t = 0; t < types.length; t++ ) {

            tns = rtypenamespace.exec( types[t] ) || [];
            type = tns[1];
            namespaces = ( tns[2] || "" ).split( "." ).sort();

            // If event changes its type, use the special event handlers for the changed type
            special = jQuery.event.special[ type ] || {};

            // If selector defined, determine special event api type, otherwise given type
            type = ( selector ? special.delegateType : special.bindType ) || type;

            // Update special based on newly reset type
            special = jQuery.event.special[ type ] || {};

            // handleObj is passed to all event handlers
            handleObj = jQuery.extend({
                type: type,
                origType: tns[1],
                data: data,
                handler: handler,
                guid: handler.guid,
                selector: selector,
                needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
                namespace: namespaces.join(".")
            }, handleObjIn );

            // Init the event handler queue if we're the first
            handlers = events[ type ];
            if ( !handlers ) {
                handlers = events[ type ] = [];
                handlers.delegateCount = 0;

                // Only use addEventListener/attachEvent if the special events handler returns false
                if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
                    // Bind the global event handler to the element
                    if ( elem.addEventListener ) {
                        elem.addEventListener( type, eventHandle, false );

                    } else if ( elem.attachEvent ) {
                        elem.attachEvent( "on" + type, eventHandle );
                    }
                }
            }

            if ( special.add ) {
                special.add.call( elem, handleObj );

                if ( !handleObj.handler.guid ) {
                    handleObj.handler.guid = handler.guid;
                }
            }

            // Add to the element's handler list, delegates in front
            if ( selector ) {
                handlers.splice( handlers.delegateCount++, 0, handleObj );
            } else {
                handlers.push( handleObj );
            }

            // Keep track of which events have ever been used, for event optimization
            jQuery.event.global[ type ] = true;
        }

        // Nullify elem to prevent memory leaks in IE
        elem = null;
    },

    global: {},

    // Detach an event or set of events from an element
    remove: function( elem, types, handler, selector, mappedTypes ) {

        var t, tns, type, origType, namespaces, origCount,
            j, events, special, eventType, handleObj,
            elemData = jQuery.hasData( elem ) && jQuery._data( elem );

        if ( !elemData || !(events = elemData.events) ) {
            return;
        }

        // Once for each type.namespace in types; type may be omitted
        types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
        for ( t = 0; t < types.length; t++ ) {
            tns = rtypenamespace.exec( types[t] ) || [];
            type = origType = tns[1];
            namespaces = tns[2];

            // Unbind all events (on this namespace, if provided) for the element
            if ( !type ) {
                for ( type in events ) {
                    jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
                }
                continue;
            }

            special = jQuery.event.special[ type ] || {};
            type = ( selector? special.delegateType : special.bindType ) || type;
            eventType = events[ type ] || [];
            origCount = eventType.length;
            namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;

            // Remove matching events
            for ( j = 0; j < eventType.length; j++ ) {
                handleObj = eventType[ j ];

                if ( ( mappedTypes || origType === handleObj.origType ) &&
                     ( !handler || handler.guid === handleObj.guid ) &&
                     ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
                     ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
                    eventType.splice( j--, 1 );

                    if ( handleObj.selector ) {
                        eventType.delegateCount--;
                    }
                    if ( special.remove ) {
                        special.remove.call( elem, handleObj );
                    }
                }
            }

            // Remove generic event handler if we removed something and no more handlers exist
            // (avoids potential for endless recursion during removal of special event handlers)
            if ( eventType.length === 0 && origCount !== eventType.length ) {
                if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
                    jQuery.removeEvent( elem, type, elemData.handle );
                }

                delete events[ type ];
            }
        }

        // Remove the expando if it's no longer used
        if ( jQuery.isEmptyObject( events ) ) {
            delete elemData.handle;

            // removeData also checks for emptiness and clears the expando if empty
            // so use it instead of delete
            jQuery.removeData( elem, "events", true );
        }
    },

    // Events that are safe to short-circuit if no handlers are attached.
    // Native DOM events should not be added, they may have inline handlers.
    customEvent: {
        "getData": true,
        "setData": true,
        "changeData": true
    },

    trigger: function( event, data, elem, onlyHandlers ) {
        // Don't do events on text and comment nodes
        if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
            return;
        }

        // Event object or event type
        var cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType,
            type = event.type || event,
            namespaces = [];

        // focus/blur morphs to focusin/out; ensure we're not firing them right now
        if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
            return;
        }

        if ( type.indexOf( "!" ) >= 0 ) {
            // Exclusive events trigger only for the exact event (no namespaces)
            type = type.slice(0, -1);
            exclusive = true;
        }

        if ( type.indexOf( "." ) >= 0 ) {
            // Namespaced trigger; create a regexp to match event type in handle()
            namespaces = type.split(".");
            type = namespaces.shift();
            namespaces.sort();
        }

        if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
            // No jQuery handlers for this event type, and it can't have inline handlers
            return;
        }

        // Caller can pass in an Event, Object, or just an event type string
        event = typeof event === "object" ?
            // jQuery.Event object
            event[ jQuery.expando ] ? event :
            // Object literal
            new jQuery.Event( type, event ) :
            // Just the event type (string)
            new jQuery.Event( type );

        event.type = type;
        event.isTrigger = true;
        event.exclusive = exclusive;
        event.namespace = namespaces.join( "." );
        event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
        ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

        // Handle a global trigger
        if ( !elem ) {

            // TODO: Stop taunting the data cache; remove global events and always attach to document
            cache = jQuery.cache;
            for ( i in cache ) {
                if ( cache[ i ].events && cache[ i ].events[ type ] ) {
                    jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
                }
            }
            return;
        }

        // Clean up the event in case it is being reused
        event.result = undefined;
        if ( !event.target ) {
            event.target = elem;
        }

        // Clone any incoming data and prepend the event, creating the handler arg list
        data = data != null ? jQuery.makeArray( data ) : [];
        data.unshift( event );

        // Allow special events to draw outside the lines
        special = jQuery.event.special[ type ] || {};
        if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
            return;
        }

        // Determine event propagation path in advance, per W3C events spec (#9951)
        // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
        eventPath = [[ elem, special.bindType || type ]];
        if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

            bubbleType = special.delegateType || type;
            cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
            for ( old = elem; cur; cur = cur.parentNode ) {
                eventPath.push([ cur, bubbleType ]);
                old = cur;
            }

            // Only add window if we got to document (e.g., not plain obj or detached DOM)
            if ( old === (elem.ownerDocument || document) ) {
                eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
            }
        }

        // Fire handlers on the event path
        for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

            cur = eventPath[i][0];
            event.type = eventPath[i][1];

            handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
            if ( handle ) {
                handle.apply( cur, data );
            }
            // Note that this is a bare JS function and not a jQuery handler
            handle = ontype && cur[ ontype ];
            if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
                event.preventDefault();
            }
        }
        event.type = type;

        // If nobody prevented the default action, do it now
        if ( !onlyHandlers && !event.isDefaultPrevented() ) {

            if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
                !(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

                // Call a native DOM method on the target with the same name name as the event.
                // Can't use an .isFunction() check here because IE6/7 fails that test.
                // Don't do default actions on window, that's where global variables be (#6170)
                // IE<9 dies on focus/blur to hidden element (#1486)
                if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

                    // Don't re-trigger an onFOO event when we call its FOO() method
                    old = elem[ ontype ];

                    if ( old ) {
                        elem[ ontype ] = null;
                    }

                    // Prevent re-triggering of the same event, since we already bubbled it above
                    jQuery.event.triggered = type;
                    elem[ type ]();
                    jQuery.event.triggered = undefined;

                    if ( old ) {
                        elem[ ontype ] = old;
                    }
                }
            }
        }

        return event.result;
    },

    dispatch: function( event ) {

        // Make a writable jQuery.Event from the native event object
        event = jQuery.event.fix( event || window.event );

        var i, j, cur, ret, selMatch, matched, matches, handleObj, sel, related,
            handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
            delegateCount = handlers.delegateCount,
            args = core_slice.call( arguments ),
            run_all = !event.exclusive && !event.namespace,
            special = jQuery.event.special[ event.type ] || {},
            handlerQueue = [];

        // Use the fix-ed jQuery.Event rather than the (read-only) native event
        args[0] = event;
        event.delegateTarget = this;

        // Call the preDispatch hook for the mapped type, and let it bail if desired
        if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
            return;
        }

        // Determine handlers that should run if there are delegated events
        // Avoid non-left-click bubbling in Firefox (#3861)
        if ( delegateCount && !(event.button && event.type === "click") ) {

            for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {

                // Don't process clicks (ONLY) on disabled elements (#6911, #8165, #11382, #11764)
                if ( cur.disabled !== true || event.type !== "click" ) {
                    selMatch = {};
                    matches = [];
                    for ( i = 0; i < delegateCount; i++ ) {
                        handleObj = handlers[ i ];
                        sel = handleObj.selector;

                        if ( selMatch[ sel ] === undefined ) {
                            selMatch[ sel ] = handleObj.needsContext ?
                                jQuery( sel, this ).index( cur ) >= 0 :
                                jQuery.find( sel, this, null, [ cur ] ).length;
                        }
                        if ( selMatch[ sel ] ) {
                            matches.push( handleObj );
                        }
                    }
                    if ( matches.length ) {
                        handlerQueue.push({ elem: cur, matches: matches });
                    }
                }
            }
        }

        // Add the remaining (directly-bound) handlers
        if ( handlers.length > delegateCount ) {
            handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
        }

        // Run delegates first; they may want to stop propagation beneath us
        for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
            matched = handlerQueue[ i ];
            event.currentTarget = matched.elem;

            for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
                handleObj = matched.matches[ j ];

                // Triggered event must either 1) be non-exclusive and have no namespace, or
                // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
                if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

                    event.data = handleObj.data;
                    event.handleObj = handleObj;

                    ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
                            .apply( matched.elem, args );

                    if ( ret !== undefined ) {
                        event.result = ret;
                        if ( ret === false ) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                }
            }
        }

        // Call the postDispatch hook for the mapped type
        if ( special.postDispatch ) {
            special.postDispatch.call( this, event );
        }

        return event.result;
    },

    // Includes some event props shared by KeyEvent and MouseEvent
    // *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
    props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

    fixHooks: {},

    keyHooks: {
        props: "char charCode key keyCode".split(" "),
        filter: function( event, original ) {

            // Add which for key events
            if ( event.which == null ) {
                event.which = original.charCode != null ? original.charCode : original.keyCode;
            }

            return event;
        }
    },

    mouseHooks: {
        props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
        filter: function( event, original ) {
            var eventDoc, doc, body,
                button = original.button,
                fromElement = original.fromElement;

            // Calculate pageX/Y if missing and clientX/Y available
            if ( event.pageX == null && original.clientX != null ) {
                eventDoc = event.target.ownerDocument || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;

                event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
            }

            // Add relatedTarget, if necessary
            if ( !event.relatedTarget && fromElement ) {
                event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
            }

            // Add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if ( !event.which && button !== undefined ) {
                event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
            }

            return event;
        }
    },

    fix: function( event ) {
        if ( event[ jQuery.expando ] ) {
            return event;
        }

        // Create a writable copy of the event object and normalize some properties
        var i, prop,
            originalEvent = event,
            fixHook = jQuery.event.fixHooks[ event.type ] || {},
            copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

        event = jQuery.Event( originalEvent );

        for ( i = copy.length; i; ) {
            prop = copy[ --i ];
            event[ prop ] = originalEvent[ prop ];
        }

        // Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
        if ( !event.target ) {
            event.target = originalEvent.srcElement || document;
        }

        // Target should not be a text node (#504, Safari)
        if ( event.target.nodeType === 3 ) {
            event.target = event.target.parentNode;
        }

        // For mouse/key events, metaKey==false if it's undefined (#3368, #11328; IE6/7/8)
        event.metaKey = !!event.metaKey;

        return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
    },

    special: {
        load: {
            // Prevent triggered image.load events from bubbling to window.load
            noBubble: true
        },

        focus: {
            delegateType: "focusin"
        },
        blur: {
            delegateType: "focusout"
        },

        beforeunload: {
            setup: function( data, namespaces, eventHandle ) {
                // We only want to do this special case on windows
                if ( jQuery.isWindow( this ) ) {
                    this.onbeforeunload = eventHandle;
                }
            },

            teardown: function( namespaces, eventHandle ) {
                if ( this.onbeforeunload === eventHandle ) {
                    this.onbeforeunload = null;
                }
            }
        }
    },

    simulate: function( type, elem, event, bubble ) {
        // Piggyback on a donor event to simulate a different one.
        // Fake originalEvent to avoid donor's stopPropagation, but if the
        // simulated event prevents default then we do the same on the donor.
        var e = jQuery.extend(
            new jQuery.Event(),
            event,
            { type: type,
                isSimulated: true,
                originalEvent: {}
            }
        );
        if ( bubble ) {
            jQuery.event.trigger( e, null, elem );
        } else {
            jQuery.event.dispatch.call( elem, e );
        }
        if ( e.isDefaultPrevented() ) {
            event.preventDefault();
        }
    }
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
    function( elem, type, handle ) {
        if ( elem.removeEventListener ) {
            elem.removeEventListener( type, handle, false );
        }
    } :
    function( elem, type, handle ) {
        var name = "on" + type;

        if ( elem.detachEvent ) {

            // #8545, #7054, preventing memory leaks for custom events in IE6-8 –
            // detachEvent needed property on element, by name of that event, to properly expose it to GC
            if ( typeof elem[ name ] === "undefined" ) {
                elem[ name ] = null;
            }

            elem.detachEvent( name, handle );
        }
    };

jQuery.Event = function( src, props ) {
    // Allow instantiation without the 'new' keyword
    if ( !(this instanceof jQuery.Event) ) {
        return new jQuery.Event( src, props );
    }

    // Event object
    if ( src && src.type ) {
        this.originalEvent = src;
        this.type = src.type;

        // Events bubbling up the document may have been marked as prevented
        // by a handler lower down the tree; reflect the correct value.
        this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
            src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

    // Event type
    } else {
        this.type = src;
    }

    // Put explicitly provided properties onto the event object
    if ( props ) {
        jQuery.extend( this, props );
    }

    // Create a timestamp if incoming event doesn't have one
    this.timeStamp = src && src.timeStamp || jQuery.now();

    // Mark it as fixed
    this[ jQuery.expando ] = true;
};

function returnFalse() {
    return false;
}
function returnTrue() {
    return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
    preventDefault: function() {
        this.isDefaultPrevented = returnTrue;

        var e = this.originalEvent;
        if ( !e ) {
            return;
        }

        // if preventDefault exists run it on the original event
        if ( e.preventDefault ) {
            e.preventDefault();

        // otherwise set the returnValue property of the original event to false (IE)
        } else {
            e.returnValue = false;
        }
    },
    stopPropagation: function() {
        this.isPropagationStopped = returnTrue;

        var e = this.originalEvent;
        if ( !e ) {
            return;
        }
        // if stopPropagation exists run it on the original event
        if ( e.stopPropagation ) {
            e.stopPropagation();
        }
        // otherwise set the cancelBubble property of the original event to true (IE)
        e.cancelBubble = true;
    },
    stopImmediatePropagation: function() {
        this.isImmediatePropagationStopped = returnTrue;
        this.stopPropagation();
    },
    isDefaultPrevented: returnFalse,
    isPropagationStopped: returnFalse,
    isImmediatePropagationStopped: returnFalse
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
    mouseenter: "mouseover",
    mouseleave: "mouseout"
}, function( orig, fix ) {
    jQuery.event.special[ orig ] = {
        delegateType: fix,
        bindType: fix,

        handle: function( event ) {
            var ret,
                target = this,
                related = event.relatedTarget,
                handleObj = event.handleObj,
                selector = handleObj.selector;

            // For mousenter/leave call the handler if related is outside the target.
            // NB: No relatedTarget if the mouse left/entered the browser window
            if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
                event.type = handleObj.origType;
                ret = handleObj.handler.apply( this, arguments );
                event.type = fix;
            }
            return ret;
        }
    };
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

    jQuery.event.special.submit = {
        setup: function() {
            // Only need this for delegated form submit events
            if ( jQuery.nodeName( this, "form" ) ) {
                return false;
            }

            // Lazy-add a submit handler when a descendant form may potentially be submitted
            jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
                // Node name check avoids a VML-related crash in IE (#9807)
                var elem = e.target,
                    form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
                if ( form && !jQuery._data( form, "_submit_attached" ) ) {
                    jQuery.event.add( form, "submit._submit", function( event ) {
                        event._submit_bubble = true;
                    });
                    jQuery._data( form, "_submit_attached", true );
                }
            });
            // return undefined since we don't need an event listener
        },

        postDispatch: function( event ) {
            // If form was submitted by the user, bubble the event up the tree
            if ( event._submit_bubble ) {
                delete event._submit_bubble;
                if ( this.parentNode && !event.isTrigger ) {
                    jQuery.event.simulate( "submit", this.parentNode, event, true );
                }
            }
        },

        teardown: function() {
            // Only need this for delegated form submit events
            if ( jQuery.nodeName( this, "form" ) ) {
                return false;
            }

            // Remove delegated handlers; cleanData eventually reaps submit handlers attached above
            jQuery.event.remove( this, "._submit" );
        }
    };
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

    jQuery.event.special.change = {

        setup: function() {

            if ( rformElems.test( this.nodeName ) ) {
                // IE doesn't fire change on a check/radio until blur; trigger it on click
                // after a propertychange. Eat the blur-change in special.change.handle.
                // This still fires onchange a second time for check/radio after blur.
                if ( this.type === "checkbox" || this.type === "radio" ) {
                    jQuery.event.add( this, "propertychange._change", function( event ) {
                        if ( event.originalEvent.propertyName === "checked" ) {
                            this._just_changed = true;
                        }
                    });
                    jQuery.event.add( this, "click._change", function( event ) {
                        if ( this._just_changed && !event.isTrigger ) {
                            this._just_changed = false;
                        }
                        // Allow triggered, simulated change events (#11500)
                        jQuery.event.simulate( "change", this, event, true );
                    });
                }
                return false;
            }
            // Delegated event; lazy-add a change handler on descendant inputs
            jQuery.event.add( this, "beforeactivate._change", function( e ) {
                var elem = e.target;

                if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "_change_attached" ) ) {
                    jQuery.event.add( elem, "change._change", function( event ) {
                        if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
                            jQuery.event.simulate( "change", this.parentNode, event, true );
                        }
                    });
                    jQuery._data( elem, "_change_attached", true );
                }
            });
        },

        handle: function( event ) {
            var elem = event.target;

            // Swallow native change events from checkbox/radio, we already triggered them above
            if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
                return event.handleObj.handler.apply( this, arguments );
            }
        },

        teardown: function() {
            jQuery.event.remove( this, "._change" );

            return !rformElems.test( this.nodeName );
        }
    };
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
    jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

        // Attach a single capturing handler while someone wants focusin/focusout
        var attaches = 0,
            handler = function( event ) {
                jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
            };

        jQuery.event.special[ fix ] = {
            setup: function() {
                if ( attaches++ === 0 ) {
                    document.addEventListener( orig, handler, true );
                }
            },
            teardown: function() {
                if ( --attaches === 0 ) {
                    document.removeEventListener( orig, handler, true );
                }
            }
        };
    });
}

jQuery.fn.extend({

    on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
        var origFn, type;

        // Types can be a map of types/handlers
        if ( typeof types === "object" ) {
            // ( types-Object, selector, data )
            if ( typeof selector !== "string" ) { // && selector != null
                // ( types-Object, data )
                data = data || selector;
                selector = undefined;
            }
            for ( type in types ) {
                this.on( type, selector, data, types[ type ], one );
            }
            return this;
        }

        if ( data == null && fn == null ) {
            // ( types, fn )
            fn = selector;
            data = selector = undefined;
        } else if ( fn == null ) {
            if ( typeof selector === "string" ) {
                // ( types, selector, fn )
                fn = data;
                data = undefined;
            } else {
                // ( types, data, fn )
                fn = data;
                data = selector;
                selector = undefined;
            }
        }
        if ( fn === false ) {
            fn = returnFalse;
        } else if ( !fn ) {
            return this;
        }

        if ( one === 1 ) {
            origFn = fn;
            fn = function( event ) {
                // Can use an empty set, since event contains the info
                jQuery().off( event );
                return origFn.apply( this, arguments );
            };
            // Use same guid so caller can remove using origFn
            fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
        }
        return this.each( function() {
            jQuery.event.add( this, types, fn, data, selector );
        });
    },
    one: function( types, selector, data, fn ) {
        return this.on( types, selector, data, fn, 1 );
    },
    off: function( types, selector, fn ) {
        var handleObj, type;
        if ( types && types.preventDefault && types.handleObj ) {
            // ( event )  dispatched jQuery.Event
            handleObj = types.handleObj;
            jQuery( types.delegateTarget ).off(
                handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
                handleObj.selector,
                handleObj.handler
            );
            return this;
        }
        if ( typeof types === "object" ) {
            // ( types-object [, selector] )
            for ( type in types ) {
                this.off( type, selector, types[ type ] );
            }
            return this;
        }
        if ( selector === false || typeof selector === "function" ) {
            // ( types [, fn] )
            fn = selector;
            selector = undefined;
        }
        if ( fn === false ) {
            fn = returnFalse;
        }
        return this.each(function() {
            jQuery.event.remove( this, types, fn, selector );
        });
    },

    bind: function( types, data, fn ) {
        return this.on( types, null, data, fn );
    },
    unbind: function( types, fn ) {
        return this.off( types, null, fn );
    },

    live: function( types, data, fn ) {
        jQuery( this.context ).on( types, this.selector, data, fn );
        return this;
    },
    die: function( types, fn ) {
        jQuery( this.context ).off( types, this.selector || "**", fn );
        return this;
    },

    delegate: function( selector, types, data, fn ) {
        return this.on( types, selector, data, fn );
    },
    undelegate: function( selector, types, fn ) {
        // ( namespace ) or ( selector, types [, fn] )
        return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
    },

    trigger: function( type, data ) {
        return this.each(function() {
            jQuery.event.trigger( type, data, this );
        });
    },
    triggerHandler: function( type, data ) {
        if ( this[0] ) {
            return jQuery.event.trigger( type, data, this[0], true );
        }
    },

    toggle: function( fn ) {
        // Save reference to arguments for access in closure
        var args = arguments,
            guid = fn.guid || jQuery.guid++,
            i = 0,
            toggler = function( event ) {
                // Figure out which function to execute
                var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
                jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

                // Make sure that clicks stop
                event.preventDefault();

                // and execute the function
                return args[ lastToggle ].apply( this, arguments ) || false;
            };

        // link all the functions, so any of them can unbind this click handler
        toggler.guid = guid;
        while ( i < args.length ) {
            args[ i++ ].guid = guid;
        }

        return this.click( toggler );
    },

    hover: function( fnOver, fnOut ) {
        return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
    }
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
    "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    "change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

    // Handle event binding
    jQuery.fn[ name ] = function( data, fn ) {
        if ( fn == null ) {
            fn = data;
            data = null;
        }

        return arguments.length > 0 ?
            this.on( name, null, data, fn ) :
            this.trigger( name );
    };

    if ( rkeyEvent.test( name ) ) {
        jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
    }

    if ( rmouseEvent.test( name ) ) {
        jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
    }
});
/*
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var cachedruns,
    assertGetIdNotName,
    Expr,
    getText,
    isXML,
    contains,
    compile,
    sortOrder,
    hasDuplicate,
    outermostContext,

    baseHasDuplicate = true,
    strundefined = "undefined",

    expando = ( "sizcache" + Math.random() ).replace( ".", "" ),

    Token = String,
    document = window.document,
    docElem = document.documentElement,
    dirruns = 0,
    done = 0,
    pop = [].pop,
    push = [].push,
    slice = [].slice,
    // Use a stripped-down indexOf if a native one is unavailable
    indexOf = [].indexOf || function( elem ) {
        var i = 0,
            len = this.length;
        for ( ; i < len; i++ ) {
            if ( this[i] === elem ) {
                return i;
            }
        }
        return -1;
    },

    // Augment a function for special use by Sizzle
    markFunction = function( fn, value ) {
        fn[ expando ] = value == null || value;
        return fn;
    },

    createCache = function() {
        var cache = {},
            keys = [];

        return markFunction(function( key, value ) {
            // Only keep the most recent entries
            if ( keys.push( key ) > Expr.cacheLength ) {
                delete cache[ keys.shift() ];
            }

            return (cache[ key ] = value);
        }, cache );
    },

    classCache = createCache(),
    tokenCache = createCache(),
    compilerCache = createCache(),

    // Regex

    // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
    whitespace = "[\\x20\\t\\r\\n\\f]",
    // http://www.w3.org/TR/css3-syntax/#characters
    characterEncoding = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",

    // Loosely modeled on CSS identifier characters
    // An unquoted value should be a CSS identifier (http://www.w3.org/TR/css3-selectors/#attribute-selectors)
    // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
    identifier = characterEncoding.replace( "w", "w#" ),

    // Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
    operators = "([*^$|!~]?=)",
    attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
        "*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

    // Prefer arguments not in parens/brackets,
    //   then attribute selectors and non-pseudos (denoted by :),
    //   then anything else
    // These preferences are here to reduce the number of selectors
    //   needing tokenize in the PSEUDO preFilter
    pseudos = ":(" + characterEncoding + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + attributes + ")|[^:]|\\\\.)*|.*))\\)|)",

    // For matchExpr.POS and matchExpr.needsContext
    pos = ":(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
        "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)",

    // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
    rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

    rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
    rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
    rpseudo = new RegExp( pseudos ),

    // Easily-parseable/retrievable ID or TAG or CLASS selectors
    rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,

    rnot = /^:not/,
    rsibling = /[\x20\t\r\n\f]*[+~]/,
    rendsWithNot = /:not\($/,

    rheader = /h\d/i,
    rinputs = /input|select|textarea|button/i,

    rbackslash = /\\(?!\\)/g,

    matchExpr = {
        "ID": new RegExp( "^#(" + characterEncoding + ")" ),
        "CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
        "NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
        "TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
        "ATTR": new RegExp( "^" + attributes ),
        "PSEUDO": new RegExp( "^" + pseudos ),
        "POS": new RegExp( pos, "i" ),
        "CHILD": new RegExp( "^:(only|nth|first|last)-child(?:\\(" + whitespace +
            "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
            "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
        // For use in libraries implementing .is()
        "needsContext": new RegExp( "^" + whitespace + "*[>+~]|" + pos, "i" )
    },

    // Support

    // Used for testing something on an element
    assert = function( fn ) {
        var div = document.createElement("div");

        try {
            return fn( div );
        } catch (e) {
            return false;
        } finally {
            // release memory in IE
            div = null;
        }
    },

    // Check if getElementsByTagName("*") returns only elements
    assertTagNameNoComments = assert(function( div ) {
        div.appendChild( document.createComment("") );
        return !div.getElementsByTagName("*").length;
    }),

    // Check if getAttribute returns normalized href attributes
    assertHrefNotNormalized = assert(function( div ) {
        div.innerHTML = "<a href='#'></a>";
        return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
            div.firstChild.getAttribute("href") === "#";
    }),

    // Check if attributes should be retrieved by attribute nodes
    assertAttributes = assert(function( div ) {
        div.innerHTML = "<select></select>";
        var type = typeof div.lastChild.getAttribute("multiple");
        // IE8 returns a string for some attributes even when not present
        return type !== "boolean" && type !== "string";
    }),

    // Check if getElementsByClassName can be trusted
    assertUsableClassName = assert(function( div ) {
        // Opera can't find a second classname (in 9.6)
        div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
        if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
            return false;
        }

        // Safari 3.2 caches class attributes and doesn't catch changes
        div.lastChild.className = "e";
        return div.getElementsByClassName("e").length === 2;
    }),

    // Check if getElementById returns elements by name
    // Check if getElementsByName privileges form controls or returns elements by ID
    assertUsableName = assert(function( div ) {
        // Inject content
        div.id = expando + 0;
        div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
        docElem.insertBefore( div, docElem.firstChild );

        // Test
        var pass = document.getElementsByName &&
            // buggy browsers will return fewer than the correct 2
            document.getElementsByName( expando ).length === 2 +
            // buggy browsers will return more than the correct 0
            document.getElementsByName( expando + 0 ).length;
        assertGetIdNotName = !document.getElementById( expando );

        // Cleanup
        docElem.removeChild( div );

        return pass;
    });

// If slice is not available, provide a backup
try {
    slice.call( docElem.childNodes, 0 )[0].nodeType;
} catch ( e ) {
    slice = function( i ) {
        var elem,
            results = [];
        for ( ; (elem = this[i]); i++ ) {
            results.push( elem );
        }
        return results;
    };
}

function Sizzle( selector, context, results, seed ) {
    results = results || [];
    context = context || document;
    var match, elem, xml, m,
        nodeType = context.nodeType;

    if ( !selector || typeof selector !== "string" ) {
        return results;
    }

    if ( nodeType !== 1 && nodeType !== 9 ) {
        return [];
    }

    xml = isXML( context );

    if ( !xml && !seed ) {
        if ( (match = rquickExpr.exec( selector )) ) {
            // Speed-up: Sizzle("#ID")
            if ( (m = match[1]) ) {
                if ( nodeType === 9 ) {
                    elem = context.getElementById( m );
                    // Check parentNode to catch when Blackberry 4.6 returns
                    // nodes that are no longer in the document #6963
                    if ( elem && elem.parentNode ) {
                        // Handle the case where IE, Opera, and Webkit return items
                        // by name instead of ID
                        if ( elem.id === m ) {
                            results.push( elem );
                            return results;
                        }
                    } else {
                        return results;
                    }
                } else {
                    // Context is not a document
                    if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
                        contains( context, elem ) && elem.id === m ) {
                        results.push( elem );
                        return results;
                    }
                }

            // Speed-up: Sizzle("TAG")
            } else if ( match[2] ) {
                push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
                return results;

            // Speed-up: Sizzle(".CLASS")
            } else if ( (m = match[3]) && assertUsableClassName && context.getElementsByClassName ) {
                push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
                return results;
            }
        }
    }

    // All others
    return select( selector.replace( rtrim, "$1" ), context, results, seed, xml );
}

Sizzle.matches = function( expr, elements ) {
    return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
    return Sizzle( expr, null, null, [ elem ] ).length > 0;
};

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
    return function( elem ) {
        var name = elem.nodeName.toLowerCase();
        return name === "input" && elem.type === type;
    };
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
    return function( elem ) {
        var name = elem.nodeName.toLowerCase();
        return (name === "input" || name === "button") && elem.type === type;
    };
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
    return markFunction(function( argument ) {
        argument = +argument;
        return markFunction(function( seed, matches ) {
            var j,
                matchIndexes = fn( [], seed.length, argument ),
                i = matchIndexes.length;

            // Match elements found at the specified indexes
            while ( i-- ) {
                if ( seed[ (j = matchIndexes[i]) ] ) {
                    seed[j] = !(matches[j] = seed[j]);
                }
            }
        });
    });
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
    var node,
        ret = "",
        i = 0,
        nodeType = elem.nodeType;

    if ( nodeType ) {
        if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
            // Use textContent for elements
            // innerText usage removed for consistency of new lines (see #11153)
            if ( typeof elem.textContent === "string" ) {
                return elem.textContent;
            } else {
                // Traverse its children
                for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
                    ret += getText( elem );
                }
            }
        } else if ( nodeType === 3 || nodeType === 4 ) {
            return elem.nodeValue;
        }
        // Do not include comment or processing instruction nodes
    } else {

        // If no nodeType, this is expected to be an array
        for ( ; (node = elem[i]); i++ ) {
            // Do not traverse comment nodes
            ret += getText( node );
        }
    }
    return ret;
};

isXML = Sizzle.isXML = function( elem ) {
    // documentElement is verified for cases where it doesn't yet exist
    // (such as loading iframes in IE - #4833)
    var documentElement = elem && (elem.ownerDocument || elem).documentElement;
    return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Element contains another
contains = Sizzle.contains = docElem.contains ?
    function( a, b ) {
        var adown = a.nodeType === 9 ? a.documentElement : a,
            bup = b && b.parentNode;
        return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
    } :
    docElem.compareDocumentPosition ?
    function( a, b ) {
        return b && !!( a.compareDocumentPosition( b ) & 16 );
    } :
    function( a, b ) {
        while ( (b = b.parentNode) ) {
            if ( b === a ) {
                return true;
            }
        }
        return false;
    };

Sizzle.attr = function( elem, name ) {
    var val,
        xml = isXML( elem );

    if ( !xml ) {
        name = name.toLowerCase();
    }
    if ( (val = Expr.attrHandle[ name ]) ) {
        return val( elem );
    }
    if ( xml || assertAttributes ) {
        return elem.getAttribute( name );
    }
    val = elem.getAttributeNode( name );
    return val ?
        typeof elem[ name ] === "boolean" ?
            elem[ name ] ? name : null :
            val.specified ? val.value : null :
        null;
};

Expr = Sizzle.selectors = {

    // Can be adjusted by the user
    cacheLength: 50,

    createPseudo: markFunction,

    match: matchExpr,

    // IE6/7 return a modified href
    attrHandle: assertHrefNotNormalized ?
        {} :
        {
            "href": function( elem ) {
                return elem.getAttribute( "href", 2 );
            },
            "type": function( elem ) {
                return elem.getAttribute("type");
            }
        },

    find: {
        "ID": assertGetIdNotName ?
            function( id, context, xml ) {
                if ( typeof context.getElementById !== strundefined && !xml ) {
                    var m = context.getElementById( id );
                    // Check parentNode to catch when Blackberry 4.6 returns
                    // nodes that are no longer in the document #6963
                    return m && m.parentNode ? [m] : [];
                }
            } :
            function( id, context, xml ) {
                if ( typeof context.getElementById !== strundefined && !xml ) {
                    var m = context.getElementById( id );

                    return m ?
                        m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
                            [m] :
                            undefined :
                        [];
                }
            },

        "TAG": assertTagNameNoComments ?
            function( tag, context ) {
                if ( typeof context.getElementsByTagName !== strundefined ) {
                    return context.getElementsByTagName( tag );
                }
            } :
            function( tag, context ) {
                var results = context.getElementsByTagName( tag );

                // Filter out possible comments
                if ( tag === "*" ) {
                    var elem,
                        tmp = [],
                        i = 0;

                    for ( ; (elem = results[i]); i++ ) {
                        if ( elem.nodeType === 1 ) {
                            tmp.push( elem );
                        }
                    }

                    return tmp;
                }
                return results;
            },

        "NAME": assertUsableName && function( tag, context ) {
            if ( typeof context.getElementsByName !== strundefined ) {
                return context.getElementsByName( name );
            }
        },

        "CLASS": assertUsableClassName && function( className, context, xml ) {
            if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
                return context.getElementsByClassName( className );
            }
        }
    },

    relative: {
        ">": { dir: "parentNode", first: true },
        " ": { dir: "parentNode" },
        "+": { dir: "previousSibling", first: true },
        "~": { dir: "previousSibling" }
    },

    preFilter: {
        "ATTR": function( match ) {
            match[1] = match[1].replace( rbackslash, "" );

            // Move the given value to match[3] whether quoted or unquoted
            match[3] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );

            if ( match[2] === "~=" ) {
                match[3] = " " + match[3] + " ";
            }

            return match.slice( 0, 4 );
        },

        "CHILD": function( match ) {
            /* matches from matchExpr["CHILD"]
                1 type (only|nth|...)
                2 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
                3 xn-component of xn+y argument ([+-]?\d*n|)
                4 sign of xn-component
                5 x of xn-component
                6 sign of y-component
                7 y of y-component
            */
            match[1] = match[1].toLowerCase();

            if ( match[1] === "nth" ) {
                // nth-child requires argument
                if ( !match[2] ) {
                    Sizzle.error( match[0] );
                }

                // numeric x and y parameters for Expr.filter.CHILD
                // remember that false/true cast respectively to 0/1
                match[3] = +( match[3] ? match[4] + (match[5] || 1) : 2 * ( match[2] === "even" || match[2] === "odd" ) );
                match[4] = +( ( match[6] + match[7] ) || match[2] === "odd" );

            // other types prohibit arguments
            } else if ( match[2] ) {
                Sizzle.error( match[0] );
            }

            return match;
        },

        "PSEUDO": function( match ) {
            var unquoted, excess;
            if ( matchExpr["CHILD"].test( match[0] ) ) {
                return null;
            }

            if ( match[3] ) {
                match[2] = match[3];
            } else if ( (unquoted = match[4]) ) {
                // Only check arguments that contain a pseudo
                if ( rpseudo.test(unquoted) &&
                    // Get excess from tokenize (recursively)
                    (excess = tokenize( unquoted, true )) &&
                    // advance to the next closing parenthesis
                    (excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

                    // excess is a negative index
                    unquoted = unquoted.slice( 0, excess );
                    match[0] = match[0].slice( 0, excess );
                }
                match[2] = unquoted;
            }

            // Return only captures needed by the pseudo filter method (type and argument)
            return match.slice( 0, 3 );
        }
    },

    filter: {
        "ID": assertGetIdNotName ?
            function( id ) {
                id = id.replace( rbackslash, "" );
                return function( elem ) {
                    return elem.getAttribute("id") === id;
                };
            } :
            function( id ) {
                id = id.replace( rbackslash, "" );
                return function( elem ) {
                    var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
                    return node && node.value === id;
                };
            },

        "TAG": function( nodeName ) {
            if ( nodeName === "*" ) {
                return function() { return true; };
            }
            nodeName = nodeName.replace( rbackslash, "" ).toLowerCase();

            return function( elem ) {
                return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
            };
        },

        "CLASS": function( className ) {
            var pattern = classCache[ expando ][ className ];
            if ( !pattern ) {
                pattern = classCache( className, new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)") );
            }
            return function( elem ) {
                return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
            };
        },

        "ATTR": function( name, operator, check ) {
            return function( elem, context ) {
                var result = Sizzle.attr( elem, name );

                if ( result == null ) {
                    return operator === "!=";
                }
                if ( !operator ) {
                    return true;
                }

                result += "";

                return operator === "=" ? result === check :
                    operator === "!=" ? result !== check :
                    operator === "^=" ? check && result.indexOf( check ) === 0 :
                    operator === "*=" ? check && result.indexOf( check ) > -1 :
                    operator === "$=" ? check && result.substr( result.length - check.length ) === check :
                    operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
                    operator === "|=" ? result === check || result.substr( 0, check.length + 1 ) === check + "-" :
                    false;
            };
        },

        "CHILD": function( type, argument, first, last ) {

            if ( type === "nth" ) {
                return function( elem ) {
                    var node, diff,
                        parent = elem.parentNode;

                    if ( first === 1 && last === 0 ) {
                        return true;
                    }

                    if ( parent ) {
                        diff = 0;
                        for ( node = parent.firstChild; node; node = node.nextSibling ) {
                            if ( node.nodeType === 1 ) {
                                diff++;
                                if ( elem === node ) {
                                    break;
                                }
                            }
                        }
                    }

                    // Incorporate the offset (or cast to NaN), then check against cycle size
                    diff -= last;
                    return diff === first || ( diff % first === 0 && diff / first >= 0 );
                };
            }

            return function( elem ) {
                var node = elem;

                switch ( type ) {
                    case "only":
                    case "first":
                        while ( (node = node.previousSibling) ) {
                            if ( node.nodeType === 1 ) {
                                return false;
                            }
                        }

                        if ( type === "first" ) {
                            return true;
                        }

                        node = elem;

                        /* falls through */
                    case "last":
                        while ( (node = node.nextSibling) ) {
                            if ( node.nodeType === 1 ) {
                                return false;
                            }
                        }

                        return true;
                }
            };
        },

        "PSEUDO": function( pseudo, argument ) {
            // pseudo-class names are case-insensitive
            // http://www.w3.org/TR/selectors/#pseudo-classes
            // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
            // Remember that setFilters inherits from pseudos
            var args,
                fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
                    Sizzle.error( "unsupported pseudo: " + pseudo );

            // The user may use createPseudo to indicate that
            // arguments are needed to create the filter function
            // just as Sizzle does
            if ( fn[ expando ] ) {
                return fn( argument );
            }

            // But maintain support for old signatures
            if ( fn.length > 1 ) {
                args = [ pseudo, pseudo, "", argument ];
                return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
                    markFunction(function( seed, matches ) {
                        var idx,
                            matched = fn( seed, argument ),
                            i = matched.length;
                        while ( i-- ) {
                            idx = indexOf.call( seed, matched[i] );
                            seed[ idx ] = !( matches[ idx ] = matched[i] );
                        }
                    }) :
                    function( elem ) {
                        return fn( elem, 0, args );
                    };
            }

            return fn;
        }
    },

    pseudos: {
        "not": markFunction(function( selector ) {
            // Trim the selector passed to compile
            // to avoid treating leading and trailing
            // spaces as combinators
            var input = [],
                results = [],
                matcher = compile( selector.replace( rtrim, "$1" ) );

            return matcher[ expando ] ?
                markFunction(function( seed, matches, context, xml ) {
                    var elem,
                        unmatched = matcher( seed, null, xml, [] ),
                        i = seed.length;

                    // Match elements unmatched by `matcher`
                    while ( i-- ) {
                        if ( (elem = unmatched[i]) ) {
                            seed[i] = !(matches[i] = elem);
                        }
                    }
                }) :
                function( elem, context, xml ) {
                    input[0] = elem;
                    matcher( input, null, xml, results );
                    return !results.pop();
                };
        }),

        "has": markFunction(function( selector ) {
            return function( elem ) {
                return Sizzle( selector, elem ).length > 0;
            };
        }),

        "contains": markFunction(function( text ) {
            return function( elem ) {
                return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
            };
        }),

        "enabled": function( elem ) {
            return elem.disabled === false;
        },

        "disabled": function( elem ) {
            return elem.disabled === true;
        },

        "checked": function( elem ) {
            // In CSS3, :checked should return both checked and selected elements
            // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
            var nodeName = elem.nodeName.toLowerCase();
            return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
        },

        "selected": function( elem ) {
            // Accessing this property makes selected-by-default
            // options in Safari work properly
            if ( elem.parentNode ) {
                elem.parentNode.selectedIndex;
            }

            return elem.selected === true;
        },

        "parent": function( elem ) {
            return !Expr.pseudos["empty"]( elem );
        },

        "empty": function( elem ) {
            // http://www.w3.org/TR/selectors/#empty-pseudo
            // :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
            //   not comment, processing instructions, or others
            // Thanks to Diego Perini for the nodeName shortcut
            //   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
            var nodeType;
            elem = elem.firstChild;
            while ( elem ) {
                if ( elem.nodeName > "@" || (nodeType = elem.nodeType) === 3 || nodeType === 4 ) {
                    return false;
                }
                elem = elem.nextSibling;
            }
            return true;
        },

        "header": function( elem ) {
            return rheader.test( elem.nodeName );
        },

        "text": function( elem ) {
            var type, attr;
            // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
            // use getAttribute instead to test this case
            return elem.nodeName.toLowerCase() === "input" &&
                (type = elem.type) === "text" &&
                ( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === type );
        },

        // Input types
        "radio": createInputPseudo("radio"),
        "checkbox": createInputPseudo("checkbox"),
        "file": createInputPseudo("file"),
        "password": createInputPseudo("password"),
        "image": createInputPseudo("image"),

        "submit": createButtonPseudo("submit"),
        "reset": createButtonPseudo("reset"),

        "button": function( elem ) {
            var name = elem.nodeName.toLowerCase();
            return name === "input" && elem.type === "button" || name === "button";
        },

        "input": function( elem ) {
            return rinputs.test( elem.nodeName );
        },

        "focus": function( elem ) {
            var doc = elem.ownerDocument;
            return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
        },

        "active": function( elem ) {
            return elem === elem.ownerDocument.activeElement;
        },

        // Positional types
        "first": createPositionalPseudo(function( matchIndexes, length, argument ) {
            return [ 0 ];
        }),

        "last": createPositionalPseudo(function( matchIndexes, length, argument ) {
            return [ length - 1 ];
        }),

        "eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
            return [ argument < 0 ? argument + length : argument ];
        }),

        "even": createPositionalPseudo(function( matchIndexes, length, argument ) {
            for ( var i = 0; i < length; i += 2 ) {
                matchIndexes.push( i );
            }
            return matchIndexes;
        }),

        "odd": createPositionalPseudo(function( matchIndexes, length, argument ) {
            for ( var i = 1; i < length; i += 2 ) {
                matchIndexes.push( i );
            }
            return matchIndexes;
        }),

        "lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
            for ( var i = argument < 0 ? argument + length : argument; --i >= 0; ) {
                matchIndexes.push( i );
            }
            return matchIndexes;
        }),

        "gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
            for ( var i = argument < 0 ? argument + length : argument; ++i < length; ) {
                matchIndexes.push( i );
            }
            return matchIndexes;
        })
    }
};

function siblingCheck( a, b, ret ) {
    if ( a === b ) {
        return ret;
    }

    var cur = a.nextSibling;

    while ( cur ) {
        if ( cur === b ) {
            return -1;
        }

        cur = cur.nextSibling;
    }

    return 1;
}

sortOrder = docElem.compareDocumentPosition ?
    function( a, b ) {
        if ( a === b ) {
            hasDuplicate = true;
            return 0;
        }

        return ( !a.compareDocumentPosition || !b.compareDocumentPosition ?
            a.compareDocumentPosition :
            a.compareDocumentPosition(b) & 4
        ) ? -1 : 1;
    } :
    function( a, b ) {
        // The nodes are identical, we can exit early
        if ( a === b ) {
            hasDuplicate = true;
            return 0;

        // Fallback to using sourceIndex (in IE) if it's available on both nodes
        } else if ( a.sourceIndex && b.sourceIndex ) {
            return a.sourceIndex - b.sourceIndex;
        }

        var al, bl,
            ap = [],
            bp = [],
            aup = a.parentNode,
            bup = b.parentNode,
            cur = aup;

        // If the nodes are siblings (or identical) we can do a quick check
        if ( aup === bup ) {
            return siblingCheck( a, b );

        // If no parents were found then the nodes are disconnected
        } else if ( !aup ) {
            return -1;

        } else if ( !bup ) {
            return 1;
        }

        // Otherwise they're somewhere else in the tree so we need
        // to build up a full list of the parentNodes for comparison
        while ( cur ) {
            ap.unshift( cur );
            cur = cur.parentNode;
        }

        cur = bup;

        while ( cur ) {
            bp.unshift( cur );
            cur = cur.parentNode;
        }

        al = ap.length;
        bl = bp.length;

        // Start walking down the tree looking for a discrepancy
        for ( var i = 0; i < al && i < bl; i++ ) {
            if ( ap[i] !== bp[i] ) {
                return siblingCheck( ap[i], bp[i] );
            }
        }

        // We ended someplace up the tree so do a sibling check
        return i === al ?
            siblingCheck( a, bp[i], -1 ) :
            siblingCheck( ap[i], b, 1 );
    };

// Always assume the presence of duplicates if sort doesn't
// pass them to our comparison function (as in Google Chrome).
[0, 0].sort( sortOrder );
baseHasDuplicate = !hasDuplicate;

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
    var elem,
        i = 1;

    hasDuplicate = baseHasDuplicate;
    results.sort( sortOrder );

    if ( hasDuplicate ) {
        for ( ; (elem = results[i]); i++ ) {
            if ( elem === results[ i - 1 ] ) {
                results.splice( i--, 1 );
            }
        }
    }

    return results;
};

Sizzle.error = function( msg ) {
    throw new Error( "Syntax error, unrecognized expression: " + msg );
};

function tokenize( selector, parseOnly ) {
    var matched, match, tokens, type, soFar, groups, preFilters,
        cached = tokenCache[ expando ][ selector ];

    if ( cached ) {
        return parseOnly ? 0 : cached.slice( 0 );
    }

    soFar = selector;
    groups = [];
    preFilters = Expr.preFilter;

    while ( soFar ) {

        // Comma and first run
        if ( !matched || (match = rcomma.exec( soFar )) ) {
            if ( match ) {
                soFar = soFar.slice( match[0].length );
            }
            groups.push( tokens = [] );
        }

        matched = false;

        // Combinators
        if ( (match = rcombinators.exec( soFar )) ) {
            tokens.push( matched = new Token( match.shift() ) );
            soFar = soFar.slice( matched.length );

            // Cast descendant combinators to space
            matched.type = match[0].replace( rtrim, " " );
        }

        // Filters
        for ( type in Expr.filter ) {
            if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
                // The last two arguments here are (context, xml) for backCompat
                (match = preFilters[ type ]( match, document, true ))) ) {

                tokens.push( matched = new Token( match.shift() ) );
                soFar = soFar.slice( matched.length );
                matched.type = type;
                matched.matches = match;
            }
        }

        if ( !matched ) {
            break;
        }
    }

    // Return the length of the invalid excess
    // if we're just parsing
    // Otherwise, throw an error or return tokens
    return parseOnly ?
        soFar.length :
        soFar ?
            Sizzle.error( selector ) :
            // Cache the tokens
            tokenCache( selector, groups ).slice( 0 );
}

function addCombinator( matcher, combinator, base ) {
    var dir = combinator.dir,
        checkNonElements = base && combinator.dir === "parentNode",
        doneName = done++;

    return combinator.first ?
        // Check against closest ancestor/preceding element
        function( elem, context, xml ) {
            while ( (elem = elem[ dir ]) ) {
                if ( checkNonElements || elem.nodeType === 1  ) {
                    return matcher( elem, context, xml );
                }
            }
        } :

        // Check against all ancestor/preceding elements
        function( elem, context, xml ) {
            // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
            if ( !xml ) {
                var cache,
                    dirkey = dirruns + " " + doneName + " ",
                    cachedkey = dirkey + cachedruns;
                while ( (elem = elem[ dir ]) ) {
                    if ( checkNonElements || elem.nodeType === 1 ) {
                        if ( (cache = elem[ expando ]) === cachedkey ) {
                            return elem.sizset;
                        } else if ( typeof cache === "string" && cache.indexOf(dirkey) === 0 ) {
                            if ( elem.sizset ) {
                                return elem;
                            }
                        } else {
                            elem[ expando ] = cachedkey;
                            if ( matcher( elem, context, xml ) ) {
                                elem.sizset = true;
                                return elem;
                            }
                            elem.sizset = false;
                        }
                    }
                }
            } else {
                while ( (elem = elem[ dir ]) ) {
                    if ( checkNonElements || elem.nodeType === 1 ) {
                        if ( matcher( elem, context, xml ) ) {
                            return elem;
                        }
                    }
                }
            }
        };
}

function elementMatcher( matchers ) {
    return matchers.length > 1 ?
        function( elem, context, xml ) {
            var i = matchers.length;
            while ( i-- ) {
                if ( !matchers[i]( elem, context, xml ) ) {
                    return false;
                }
            }
            return true;
        } :
        matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
    var elem,
        newUnmatched = [],
        i = 0,
        len = unmatched.length,
        mapped = map != null;

    for ( ; i < len; i++ ) {
        if ( (elem = unmatched[i]) ) {
            if ( !filter || filter( elem, context, xml ) ) {
                newUnmatched.push( elem );
                if ( mapped ) {
                    map.push( i );
                }
            }
        }
    }

    return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
    if ( postFilter && !postFilter[ expando ] ) {
        postFilter = setMatcher( postFilter );
    }
    if ( postFinder && !postFinder[ expando ] ) {
        postFinder = setMatcher( postFinder, postSelector );
    }
    return markFunction(function( seed, results, context, xml ) {
        // Positional selectors apply to seed elements, so it is invalid to follow them with relative ones
        if ( seed && postFinder ) {
            return;
        }

        var i, elem, postFilterIn,
            preMap = [],
            postMap = [],
            preexisting = results.length,

            // Get initial elements from seed or context
            elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [], seed ),

            // Prefilter to get matcher input, preserving a map for seed-results synchronization
            matcherIn = preFilter && ( seed || !selector ) ?
                condense( elems, preMap, preFilter, context, xml ) :
                elems,

            matcherOut = matcher ?
                // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
                postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

                    // ...intermediate processing is necessary
                    [] :

                    // ...otherwise use results directly
                    results :
                matcherIn;

        // Find primary matches
        if ( matcher ) {
            matcher( matcherIn, matcherOut, context, xml );
        }

        // Apply postFilter
        if ( postFilter ) {
            postFilterIn = condense( matcherOut, postMap );
            postFilter( postFilterIn, [], context, xml );

            // Un-match failing elements by moving them back to matcherIn
            i = postFilterIn.length;
            while ( i-- ) {
                if ( (elem = postFilterIn[i]) ) {
                    matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
                }
            }
        }

        // Keep seed and results synchronized
        if ( seed ) {
            // Ignore postFinder because it can't coexist with seed
            i = preFilter && matcherOut.length;
            while ( i-- ) {
                if ( (elem = matcherOut[i]) ) {
                    seed[ preMap[i] ] = !(results[ preMap[i] ] = elem);
                }
            }
        } else {
            matcherOut = condense(
                matcherOut === results ?
                    matcherOut.splice( preexisting, matcherOut.length ) :
                    matcherOut
            );
            if ( postFinder ) {
                postFinder( null, results, matcherOut, xml );
            } else {
                push.apply( results, matcherOut );
            }
        }
    });
}

function matcherFromTokens( tokens ) {
    var checkContext, matcher, j,
        len = tokens.length,
        leadingRelative = Expr.relative[ tokens[0].type ],
        implicitRelative = leadingRelative || Expr.relative[" "],
        i = leadingRelative ? 1 : 0,

        // The foundational matcher ensures that elements are reachable from top-level context(s)
        matchContext = addCombinator( function( elem ) {
            return elem === checkContext;
        }, implicitRelative, true ),
        matchAnyContext = addCombinator( function( elem ) {
            return indexOf.call( checkContext, elem ) > -1;
        }, implicitRelative, true ),
        matchers = [ function( elem, context, xml ) {
            return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
                (checkContext = context).nodeType ?
                    matchContext( elem, context, xml ) :
                    matchAnyContext( elem, context, xml ) );
        } ];

    for ( ; i < len; i++ ) {
        if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
            matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
        } else {
            // The concatenated values are (context, xml) for backCompat
            matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

            // Return special upon seeing a positional matcher
            if ( matcher[ expando ] ) {
                // Find the next relative operator (if any) for proper handling
                j = ++i;
                for ( ; j < len; j++ ) {
                    if ( Expr.relative[ tokens[j].type ] ) {
                        break;
                    }
                }
                return setMatcher(
                    i > 1 && elementMatcher( matchers ),
                    i > 1 && tokens.slice( 0, i - 1 ).join("").replace( rtrim, "$1" ),
                    matcher,
                    i < j && matcherFromTokens( tokens.slice( i, j ) ),
                    j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
                    j < len && tokens.join("")
                );
            }
            matchers.push( matcher );
        }
    }

    return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
    var bySet = setMatchers.length > 0,
        byElement = elementMatchers.length > 0,
        superMatcher = function( seed, context, xml, results, expandContext ) {
            var elem, j, matcher,
                setMatched = [],
                matchedCount = 0,
                i = "0",
                unmatched = seed && [],
                outermost = expandContext != null,
                contextBackup = outermostContext,
                // We must always have either seed elements or context
                elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
                // Nested matchers should use non-integer dirruns
                dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.E);

            if ( outermost ) {
                outermostContext = context !== document && context;
                cachedruns = superMatcher.el;
            }

            // Add elements passing elementMatchers directly to results
            for ( ; (elem = elems[i]) != null; i++ ) {
                if ( byElement && elem ) {
                    for ( j = 0; (matcher = elementMatchers[j]); j++ ) {
                        if ( matcher( elem, context, xml ) ) {
                            results.push( elem );
                            break;
                        }
                    }
                    if ( outermost ) {
                        dirruns = dirrunsUnique;
                        cachedruns = ++superMatcher.el;
                    }
                }

                // Track unmatched elements for set filters
                if ( bySet ) {
                    // They will have gone through all possible matchers
                    if ( (elem = !matcher && elem) ) {
                        matchedCount--;
                    }

                    // Lengthen the array for every element, matched or not
                    if ( seed ) {
                        unmatched.push( elem );
                    }
                }
            }

            // Apply set filters to unmatched elements
            matchedCount += i;
            if ( bySet && i !== matchedCount ) {
                for ( j = 0; (matcher = setMatchers[j]); j++ ) {
                    matcher( unmatched, setMatched, context, xml );
                }

                if ( seed ) {
                    // Reintegrate element matches to eliminate the need for sorting
                    if ( matchedCount > 0 ) {
                        while ( i-- ) {
                            if ( !(unmatched[i] || setMatched[i]) ) {
                                setMatched[i] = pop.call( results );
                            }
                        }
                    }

                    // Discard index placeholder values to get only actual matches
                    setMatched = condense( setMatched );
                }

                // Add matches to results
                push.apply( results, setMatched );

                // Seedless set matches succeeding multiple successful matchers stipulate sorting
                if ( outermost && !seed && setMatched.length > 0 &&
                    ( matchedCount + setMatchers.length ) > 1 ) {

                    Sizzle.uniqueSort( results );
                }
            }

            // Override manipulation of globals by nested matchers
            if ( outermost ) {
                dirruns = dirrunsUnique;
                outermostContext = contextBackup;
            }

            return unmatched;
        };

    superMatcher.el = 0;
    return bySet ?
        markFunction( superMatcher ) :
        superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
    var i,
        setMatchers = [],
        elementMatchers = [],
        cached = compilerCache[ expando ][ selector ];

    if ( !cached ) {
        // Generate a function of recursive functions that can be used to check each element
        if ( !group ) {
            group = tokenize( selector );
        }
        i = group.length;
        while ( i-- ) {
            cached = matcherFromTokens( group[i] );
            if ( cached[ expando ] ) {
                setMatchers.push( cached );
            } else {
                elementMatchers.push( cached );
            }
        }

        // Cache the compiled function
        cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
    }
    return cached;
};

function multipleContexts( selector, contexts, results, seed ) {
    var i = 0,
        len = contexts.length;
    for ( ; i < len; i++ ) {
        Sizzle( selector, contexts[i], results, seed );
    }
    return results;
}

function select( selector, context, results, seed, xml ) {
    var i, tokens, token, type, find,
        match = tokenize( selector ),
        j = match.length;

    if ( !seed ) {
        // Try to minimize operations if there is only one group
        if ( match.length === 1 ) {

            // Take a shortcut and set the context if the root selector is an ID
            tokens = match[0] = match[0].slice( 0 );
            if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
                    context.nodeType === 9 && !xml &&
                    Expr.relative[ tokens[1].type ] ) {

                context = Expr.find["ID"]( token.matches[0].replace( rbackslash, "" ), context, xml )[0];
                if ( !context ) {
                    return results;
                }

                selector = selector.slice( tokens.shift().length );
            }

            // Fetch a seed set for right-to-left matching
            for ( i = matchExpr["POS"].test( selector ) ? -1 : tokens.length - 1; i >= 0; i-- ) {
                token = tokens[i];

                // Abort if we hit a combinator
                if ( Expr.relative[ (type = token.type) ] ) {
                    break;
                }
                if ( (find = Expr.find[ type ]) ) {
                    // Search, expanding context for leading sibling combinators
                    if ( (seed = find(
                        token.matches[0].replace( rbackslash, "" ),
                        rsibling.test( tokens[0].type ) && context.parentNode || context,
                        xml
                    )) ) {

                        // If seed is empty or no tokens remain, we can return early
                        tokens.splice( i, 1 );
                        selector = seed.length && tokens.join("");
                        if ( !selector ) {
                            push.apply( results, slice.call( seed, 0 ) );
                            return results;
                        }

                        break;
                    }
                }
            }
        }
    }

    // Compile and execute a filtering function
    // Provide `match` to avoid retokenization if we modified the selector above
    compile( selector, match )(
        seed,
        context,
        xml,
        results,
        rsibling.test( selector )
    );
    return results;
}

if ( document.querySelectorAll ) {
    (function() {
        var disconnectedMatch,
            oldSelect = select,
            rescape = /'|\\/g,
            rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

            // qSa(:focus) reports false when true (Chrome 21),
            // A support test would require too much code (would include document ready)
            rbuggyQSA = [":focus"],

            // matchesSelector(:focus) reports false when true (Chrome 21),
            // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
            // A support test would require too much code (would include document ready)
            // just skip matchesSelector for :active
            rbuggyMatches = [ ":active", ":focus" ],
            matches = docElem.matchesSelector ||
                docElem.mozMatchesSelector ||
                docElem.webkitMatchesSelector ||
                docElem.oMatchesSelector ||
                docElem.msMatchesSelector;

        // Build QSA regex
        // Regex strategy adopted from Diego Perini
        assert(function( div ) {
            // Select is set to empty string on purpose
            // This is to test IE's treatment of not explictly
            // setting a boolean content attribute,
            // since its presence should be enough
            // http://bugs.jquery.com/ticket/12359
            div.innerHTML = "<select><option selected=''></option></select>";

            // IE8 - Some boolean attributes are not treated correctly
            if ( !div.querySelectorAll("[selected]").length ) {
                rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
            }

            // Webkit/Opera - :checked should return selected option elements
            // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
            // IE8 throws error here (do not put tests after this one)
            if ( !div.querySelectorAll(":checked").length ) {
                rbuggyQSA.push(":checked");
            }
        });

        assert(function( div ) {

            // Opera 10-12/IE9 - ^= $= *= and empty values
            // Should not select anything
            div.innerHTML = "<p test=''></p>";
            if ( div.querySelectorAll("[test^='']").length ) {
                rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
            }

            // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
            // IE8 throws error here (do not put tests after this one)
            div.innerHTML = "<input type='hidden'/>";
            if ( !div.querySelectorAll(":enabled").length ) {
                rbuggyQSA.push(":enabled", ":disabled");
            }
        });

        // rbuggyQSA always contains :focus, so no need for a length check
        rbuggyQSA = /* rbuggyQSA.length && */ new RegExp( rbuggyQSA.join("|") );

        select = function( selector, context, results, seed, xml ) {
            // Only use querySelectorAll when not filtering,
            // when this is not xml,
            // and when no QSA bugs apply
            if ( !seed && !xml && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
                var groups, i,
                    old = true,
                    nid = expando,
                    newContext = context,
                    newSelector = context.nodeType === 9 && selector;

                // qSA works strangely on Element-rooted queries
                // We can work around this by specifying an extra ID on the root
                // and working up from there (Thanks to Andrew Dupont for the technique)
                // IE 8 doesn't work on object elements
                if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
                    groups = tokenize( selector );

                    if ( (old = context.getAttribute("id")) ) {
                        nid = old.replace( rescape, "\\$&" );
                    } else {
                        context.setAttribute( "id", nid );
                    }
                    nid = "[id='" + nid + "'] ";

                    i = groups.length;
                    while ( i-- ) {
                        groups[i] = nid + groups[i].join("");
                    }
                    newContext = rsibling.test( selector ) && context.parentNode || context;
                    newSelector = groups.join(",");
                }

                if ( newSelector ) {
                    try {
                        push.apply( results, slice.call( newContext.querySelectorAll(
                            newSelector
                        ), 0 ) );
                        return results;
                    } catch(qsaError) {
                    } finally {
                        if ( !old ) {
                            context.removeAttribute("id");
                        }
                    }
                }
            }

            return oldSelect( selector, context, results, seed, xml );
        };

        if ( matches ) {
            assert(function( div ) {
                // Check to see if it's possible to do matchesSelector
                // on a disconnected node (IE 9)
                disconnectedMatch = matches.call( div, "div" );

                // This should fail with an exception
                // Gecko does not error, returns false instead
                try {
                    matches.call( div, "[test!='']:sizzle" );
                    rbuggyMatches.push( "!=", pseudos );
                } catch ( e ) {}
            });

            // rbuggyMatches always contains :active and :focus, so no need for a length check
            rbuggyMatches = /* rbuggyMatches.length && */ new RegExp( rbuggyMatches.join("|") );

            Sizzle.matchesSelector = function( elem, expr ) {
                // Make sure that attribute selectors are quoted
                expr = expr.replace( rattributeQuotes, "='$1']" );

                // rbuggyMatches always contains :active, so no need for an existence check
                if ( !isXML( elem ) && !rbuggyMatches.test( expr ) && (!rbuggyQSA || !rbuggyQSA.test( expr )) ) {
                    try {
                        var ret = matches.call( elem, expr );

                        // IE 9's matchesSelector returns false on disconnected nodes
                        if ( ret || disconnectedMatch ||
                                // As well, disconnected nodes are said to be in a document
                                // fragment in IE 9
                                elem.document && elem.document.nodeType !== 11 ) {
                            return ret;
                        }
                    } catch(e) {}
                }

                return Sizzle( expr, null, null, [ elem ] ).length > 0;
            };
        }
    })();
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Back-compat
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
    rparentsprev = /^(?:parents|prev(?:Until|All))/,
    isSimple = /^.[^:#\[\.,]*$/,
    rneedsContext = jQuery.expr.match.needsContext,
    // methods guaranteed to produce a unique set when starting from a unique set
    guaranteedUnique = {
        children: true,
        contents: true,
        next: true,
        prev: true
    };

jQuery.fn.extend({
    find: function( selector ) {
        var i, l, length, n, r, ret,
            self = this;

        if ( typeof selector !== "string" ) {
            return jQuery( selector ).filter(function() {
                for ( i = 0, l = self.length; i < l; i++ ) {
                    if ( jQuery.contains( self[ i ], this ) ) {
                        return true;
                    }
                }
            });
        }

        ret = this.pushStack( "", "find", selector );

        for ( i = 0, l = this.length; i < l; i++ ) {
            length = ret.length;
            jQuery.find( selector, this[i], ret );

            if ( i > 0 ) {
                // Make sure that the results are unique
                for ( n = length; n < ret.length; n++ ) {
                    for ( r = 0; r < length; r++ ) {
                        if ( ret[r] === ret[n] ) {
                            ret.splice(n--, 1);
                            break;
                        }
                    }
                }
            }
        }

        return ret;
    },

    has: function( target ) {
        var i,
            targets = jQuery( target, this ),
            len = targets.length;

        return this.filter(function() {
            for ( i = 0; i < len; i++ ) {
                if ( jQuery.contains( this, targets[i] ) ) {
                    return true;
                }
            }
        });
    },

    not: function( selector ) {
        return this.pushStack( winnow(this, selector, false), "not", selector);
    },

    filter: function( selector ) {
        return this.pushStack( winnow(this, selector, true), "filter", selector );
    },

    is: function( selector ) {
        return !!selector && (
            typeof selector === "string" ?
                // If this is a positional/relative selector, check membership in the returned set
                // so $("p:first").is("p:last") won't return true for a doc with two "p".
                rneedsContext.test( selector ) ?
                    jQuery( selector, this.context ).index( this[0] ) >= 0 :
                    jQuery.filter( selector, this ).length > 0 :
                this.filter( selector ).length > 0 );
    },

    closest: function( selectors, context ) {
        var cur,
            i = 0,
            l = this.length,
            ret = [],
            pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
                jQuery( selectors, context || this.context ) :
                0;

        for ( ; i < l; i++ ) {
            cur = this[i];

            while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
                if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
                    ret.push( cur );
                    break;
                }
                cur = cur.parentNode;
            }
        }

        ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

        return this.pushStack( ret, "closest", selectors );
    },

    // Determine the position of an element within
    // the matched set of elements
    index: function( elem ) {

        // No argument, return index in parent
        if ( !elem ) {
            return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
        }

        // index in selector
        if ( typeof elem === "string" ) {
            return jQuery.inArray( this[0], jQuery( elem ) );
        }

        // Locate the position of the desired element
        return jQuery.inArray(
            // If it receives a jQuery object, the first element is used
            elem.jquery ? elem[0] : elem, this );
    },

    add: function( selector, context ) {
        var set = typeof selector === "string" ?
                jQuery( selector, context ) :
                jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
            all = jQuery.merge( this.get(), set );

        return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
            all :
            jQuery.unique( all ) );
    },

    addBack: function( selector ) {
        return this.add( selector == null ?
            this.prevObject : this.prevObject.filter(selector)
        );
    }
});

jQuery.fn.andSelf = jQuery.fn.addBack;

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
    return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

function sibling( cur, dir ) {
    do {
        cur = cur[ dir ];
    } while ( cur && cur.nodeType !== 1 );

    return cur;
}

jQuery.each({
    parent: function( elem ) {
        var parent = elem.parentNode;
        return parent && parent.nodeType !== 11 ? parent : null;
    },
    parents: function( elem ) {
        return jQuery.dir( elem, "parentNode" );
    },
    parentsUntil: function( elem, i, until ) {
        return jQuery.dir( elem, "parentNode", until );
    },
    next: function( elem ) {
        return sibling( elem, "nextSibling" );
    },
    prev: function( elem ) {
        return sibling( elem, "previousSibling" );
    },
    nextAll: function( elem ) {
        return jQuery.dir( elem, "nextSibling" );
    },
    prevAll: function( elem ) {
        return jQuery.dir( elem, "previousSibling" );
    },
    nextUntil: function( elem, i, until ) {
        return jQuery.dir( elem, "nextSibling", until );
    },
    prevUntil: function( elem, i, until ) {
        return jQuery.dir( elem, "previousSibling", until );
    },
    siblings: function( elem ) {
        return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
    },
    children: function( elem ) {
        return jQuery.sibling( elem.firstChild );
    },
    contents: function( elem ) {
        return jQuery.nodeName( elem, "iframe" ) ?
            elem.contentDocument || elem.contentWindow.document :
            jQuery.merge( [], elem.childNodes );
    }
}, function( name, fn ) {
    jQuery.fn[ name ] = function( until, selector ) {
        var ret = jQuery.map( this, fn, until );

        if ( !runtil.test( name ) ) {
            selector = until;
        }

        if ( selector && typeof selector === "string" ) {
            ret = jQuery.filter( selector, ret );
        }

        ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

        if ( this.length > 1 && rparentsprev.test( name ) ) {
            ret = ret.reverse();
        }

        return this.pushStack( ret, name, core_slice.call( arguments ).join(",") );
    };
});

jQuery.extend({
    filter: function( expr, elems, not ) {
        if ( not ) {
            expr = ":not(" + expr + ")";
        }

        return elems.length === 1 ?
            jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
            jQuery.find.matches(expr, elems);
    },

    dir: function( elem, dir, until ) {
        var matched = [],
            cur = elem[ dir ];

        while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
            if ( cur.nodeType === 1 ) {
                matched.push( cur );
            }
            cur = cur[dir];
        }
        return matched;
    },

    sibling: function( n, elem ) {
        var r = [];

        for ( ; n; n = n.nextSibling ) {
            if ( n.nodeType === 1 && n !== elem ) {
                r.push( n );
            }
        }

        return r;
    }
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

    // Can't pass null or undefined to indexOf in Firefox 4
    // Set to 0 to skip string check
    qualifier = qualifier || 0;

    if ( jQuery.isFunction( qualifier ) ) {
        return jQuery.grep(elements, function( elem, i ) {
            var retVal = !!qualifier.call( elem, i, elem );
            return retVal === keep;
        });

    } else if ( qualifier.nodeType ) {
        return jQuery.grep(elements, function( elem, i ) {
            return ( elem === qualifier ) === keep;
        });

    } else if ( typeof qualifier === "string" ) {
        var filtered = jQuery.grep(elements, function( elem ) {
            return elem.nodeType === 1;
        });

        if ( isSimple.test( qualifier ) ) {
            return jQuery.filter(qualifier, filtered, !keep);
        } else {
            qualifier = jQuery.filter( qualifier, filtered );
        }
    }

    return jQuery.grep(elements, function( elem, i ) {
        return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
    });
}
function createSafeFragment( document ) {
    var list = nodeNames.split( "|" ),
    safeFrag = document.createDocumentFragment();

    if ( safeFrag.createElement ) {
        while ( list.length ) {
            safeFrag.createElement(
                list.pop()
            );
        }
    }
    return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
        "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
    rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
    rleadingWhitespace = /^\s+/,
    rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    rtagName = /<([\w:]+)/,
    rtbody = /<tbody/i,
    rhtml = /<|&#?\w+;/,
    rnoInnerhtml = /<(?:script|style|link)/i,
    rnocache = /<(?:script|object|embed|option|style)/i,
    rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
    rcheckableType = /^(?:checkbox|radio)$/,
    // checked="checked" or checked
    rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
    rscriptType = /\/(java|ecma)script/i,
    rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,
    wrapMap = {
        option: [ 1, "<select multiple='multiple'>", "</select>" ],
        legend: [ 1, "<fieldset>", "</fieldset>" ],
        thead: [ 1, "<table>", "</table>" ],
        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
        col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
        area: [ 1, "<map>", "</map>" ],
        _default: [ 0, "", "" ]
    },
    safeFragment = createSafeFragment( document ),
    fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
// unless wrapped in a div with non-breaking characters in front of it.
if ( !jQuery.support.htmlSerialize ) {
    wrapMap._default = [ 1, "X<div>", "</div>" ];
}

jQuery.fn.extend({
    text: function( value ) {
        return jQuery.access( this, function( value ) {
            return value === undefined ?
                jQuery.text( this ) :
                this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
        }, null, value, arguments.length );
    },

    wrapAll: function( html ) {
        if ( jQuery.isFunction( html ) ) {
            return this.each(function(i) {
                jQuery(this).wrapAll( html.call(this, i) );
            });
        }

        if ( this[0] ) {
            // The elements to wrap the target around
            var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

            if ( this[0].parentNode ) {
                wrap.insertBefore( this[0] );
            }

            wrap.map(function() {
                var elem = this;

                while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
                    elem = elem.firstChild;
                }

                return elem;
            }).append( this );
        }

        return this;
    },

    wrapInner: function( html ) {
        if ( jQuery.isFunction( html ) ) {
            return this.each(function(i) {
                jQuery(this).wrapInner( html.call(this, i) );
            });
        }

        return this.each(function() {
            var self = jQuery( this ),
                contents = self.contents();

            if ( contents.length ) {
                contents.wrapAll( html );

            } else {
                self.append( html );
            }
        });
    },

    wrap: function( html ) {
        var isFunction = jQuery.isFunction( html );

        return this.each(function(i) {
            jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
        });
    },

    unwrap: function() {
        return this.parent().each(function() {
            if ( !jQuery.nodeName( this, "body" ) ) {
                jQuery( this ).replaceWith( this.childNodes );
            }
        }).end();
    },

    append: function() {
        return this.domManip(arguments, true, function( elem ) {
            if ( this.nodeType === 1 || this.nodeType === 11 ) {
                this.appendChild( elem );
            }
        });
    },

    prepend: function() {
        return this.domManip(arguments, true, function( elem ) {
            if ( this.nodeType === 1 || this.nodeType === 11 ) {
                this.insertBefore( elem, this.firstChild );
            }
        });
    },

    before: function() {
        if ( !isDisconnected( this[0] ) ) {
            return this.domManip(arguments, false, function( elem ) {
                this.parentNode.insertBefore( elem, this );
            });
        }

        if ( arguments.length ) {
            var set = jQuery.clean( arguments );
            return this.pushStack( jQuery.merge( set, this ), "before", this.selector );
        }
    },

    after: function() {
        if ( !isDisconnected( this[0] ) ) {
            return this.domManip(arguments, false, function( elem ) {
                this.parentNode.insertBefore( elem, this.nextSibling );
            });
        }

        if ( arguments.length ) {
            var set = jQuery.clean( arguments );
            return this.pushStack( jQuery.merge( this, set ), "after", this.selector );
        }
    },

    // keepData is for internal use only--do not document
    remove: function( selector, keepData ) {
        var elem,
            i = 0;

        for ( ; (elem = this[i]) != null; i++ ) {
            if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
                if ( !keepData && elem.nodeType === 1 ) {
                    jQuery.cleanData( elem.getElementsByTagName("*") );
                    jQuery.cleanData( [ elem ] );
                }

                if ( elem.parentNode ) {
                    elem.parentNode.removeChild( elem );
                }
            }
        }

        return this;
    },

    empty: function() {
        var elem,
            i = 0;

        for ( ; (elem = this[i]) != null; i++ ) {
            // Remove element nodes and prevent memory leaks
            if ( elem.nodeType === 1 ) {
                jQuery.cleanData( elem.getElementsByTagName("*") );
            }

            // Remove any remaining nodes
            while ( elem.firstChild ) {
                elem.removeChild( elem.firstChild );
            }
        }

        return this;
    },

    clone: function( dataAndEvents, deepDataAndEvents ) {
        dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
        deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

        return this.map( function () {
            return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
        });
    },

    html: function( value ) {
        return jQuery.access( this, function( value ) {
            var elem = this[0] || {},
                i = 0,
                l = this.length;

            if ( value === undefined ) {
                return elem.nodeType === 1 ?
                    elem.innerHTML.replace( rinlinejQuery, "" ) :
                    undefined;
            }

            // See if we can take a shortcut and just use innerHTML
            if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
                ( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
                ( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
                !wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

                value = value.replace( rxhtmlTag, "<$1></$2>" );

                try {
                    for (; i < l; i++ ) {
                        // Remove element nodes and prevent memory leaks
                        elem = this[i] || {};
                        if ( elem.nodeType === 1 ) {
                            jQuery.cleanData( elem.getElementsByTagName( "*" ) );
                            elem.innerHTML = value;
                        }
                    }

                    elem = 0;

                // If using innerHTML throws an exception, use the fallback method
                } catch(e) {}
            }

            if ( elem ) {
                this.empty().append( value );
            }
        }, null, value, arguments.length );
    },

    replaceWith: function( value ) {
        if ( !isDisconnected( this[0] ) ) {
            // Make sure that the elements are removed from the DOM before they are inserted
            // this can help fix replacing a parent with child elements
            if ( jQuery.isFunction( value ) ) {
                return this.each(function(i) {
                    var self = jQuery(this), old = self.html();
                    self.replaceWith( value.call( this, i, old ) );
                });
            }

            if ( typeof value !== "string" ) {
                value = jQuery( value ).detach();
            }

            return this.each(function() {
                var next = this.nextSibling,
                    parent = this.parentNode;

                jQuery( this ).remove();

                if ( next ) {
                    jQuery(next).before( value );
                } else {
                    jQuery(parent).append( value );
                }
            });
        }

        return this.length ?
            this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
            this;
    },

    detach: function( selector ) {
        return this.remove( selector, true );
    },

    domManip: function( args, table, callback ) {

        // Flatten any nested arrays
        args = [].concat.apply( [], args );

        var results, first, fragment, iNoClone,
            i = 0,
            value = args[0],
            scripts = [],
            l = this.length;

        // We can't cloneNode fragments that contain checked, in WebKit
        if ( !jQuery.support.checkClone && l > 1 && typeof value === "string" && rchecked.test( value ) ) {
            return this.each(function() {
                jQuery(this).domManip( args, table, callback );
            });
        }

        if ( jQuery.isFunction(value) ) {
            return this.each(function(i) {
                var self = jQuery(this);
                args[0] = value.call( this, i, table ? self.html() : undefined );
                self.domManip( args, table, callback );
            });
        }

        if ( this[0] ) {
            results = jQuery.buildFragment( args, this, scripts );
            fragment = results.fragment;
            first = fragment.firstChild;

            if ( fragment.childNodes.length === 1 ) {
                fragment = first;
            }

            if ( first ) {
                table = table && jQuery.nodeName( first, "tr" );

                // Use the original fragment for the last item instead of the first because it can end up
                // being emptied incorrectly in certain situations (#8070).
                // Fragments from the fragment cache must always be cloned and never used in place.
                for ( iNoClone = results.cacheable || l - 1; i < l; i++ ) {
                    callback.call(
                        table && jQuery.nodeName( this[i], "table" ) ?
                            findOrAppend( this[i], "tbody" ) :
                            this[i],
                        i === iNoClone ?
                            fragment :
                            jQuery.clone( fragment, true, true )
                    );
                }
            }

            // Fix #11809: Avoid leaking memory
            fragment = first = null;

            if ( scripts.length ) {
                jQuery.each( scripts, function( i, elem ) {
                    if ( elem.src ) {
                        if ( jQuery.ajax ) {
                            jQuery.ajax({
                                url: elem.src,
                                type: "GET",
                                dataType: "script",
                                async: false,
                                global: false,
                                "throws": true
                            });
                        } else {
                            jQuery.error("no ajax");
                        }
                    } else {
                        jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "" ) );
                    }

                    if ( elem.parentNode ) {
                        elem.parentNode.removeChild( elem );
                    }
                });
            }
        }

        return this;
    }
});

function findOrAppend( elem, tag ) {
    return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

function cloneCopyEvent( src, dest ) {

    if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
        return;
    }

    var type, i, l,
        oldData = jQuery._data( src ),
        curData = jQuery._data( dest, oldData ),
        events = oldData.events;

    if ( events ) {
        delete curData.handle;
        curData.events = {};

        for ( type in events ) {
            for ( i = 0, l = events[ type ].length; i < l; i++ ) {
                jQuery.event.add( dest, type, events[ type ][ i ] );
            }
        }
    }

    // make the cloned public data object a copy from the original
    if ( curData.data ) {
        curData.data = jQuery.extend( {}, curData.data );
    }
}

function cloneFixAttributes( src, dest ) {
    var nodeName;

    // We do not need to do anything for non-Elements
    if ( dest.nodeType !== 1 ) {
        return;
    }

    // clearAttributes removes the attributes, which we don't want,
    // but also removes the attachEvent events, which we *do* want
    if ( dest.clearAttributes ) {
        dest.clearAttributes();
    }

    // mergeAttributes, in contrast, only merges back on the
    // original attributes, not the events
    if ( dest.mergeAttributes ) {
        dest.mergeAttributes( src );
    }

    nodeName = dest.nodeName.toLowerCase();

    if ( nodeName === "object" ) {
        // IE6-10 improperly clones children of object elements using classid.
        // IE10 throws NoModificationAllowedError if parent is null, #12132.
        if ( dest.parentNode ) {
            dest.outerHTML = src.outerHTML;
        }

        // This path appears unavoidable for IE9. When cloning an object
        // element in IE9, the outerHTML strategy above is not sufficient.
        // If the src has innerHTML and the destination does not,
        // copy the src.innerHTML into the dest.innerHTML. #10324
        if ( jQuery.support.html5Clone && (src.innerHTML && !jQuery.trim(dest.innerHTML)) ) {
            dest.innerHTML = src.innerHTML;
        }

    } else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
        // IE6-8 fails to persist the checked state of a cloned checkbox
        // or radio button. Worse, IE6-7 fail to give the cloned element
        // a checked appearance if the defaultChecked value isn't also set

        dest.defaultChecked = dest.checked = src.checked;

        // IE6-7 get confused and end up setting the value of a cloned
        // checkbox/radio button to an empty string instead of "on"
        if ( dest.value !== src.value ) {
            dest.value = src.value;
        }

    // IE6-8 fails to return the selected option to the default selected
    // state when cloning options
    } else if ( nodeName === "option" ) {
        dest.selected = src.defaultSelected;

    // IE6-8 fails to set the defaultValue to the correct value when
    // cloning other types of input fields
    } else if ( nodeName === "input" || nodeName === "textarea" ) {
        dest.defaultValue = src.defaultValue;

    // IE blanks contents when cloning scripts
    } else if ( nodeName === "script" && dest.text !== src.text ) {
        dest.text = src.text;
    }

    // Event data gets referenced instead of copied if the expando
    // gets copied too
    dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, context, scripts ) {
    var fragment, cacheable, cachehit,
        first = args[ 0 ];

    // Set context from what may come in as undefined or a jQuery collection or a node
    // Updated to fix #12266 where accessing context[0] could throw an exception in IE9/10 &
    // also doubles as fix for #8950 where plain objects caused createDocumentFragment exception
    context = context || document;
    context = !context.nodeType && context[0] || context;
    context = context.ownerDocument || context;

    // Only cache "small" (1/2 KB) HTML strings that are associated with the main document
    // Cloning options loses the selected state, so don't cache them
    // IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
    // Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
    // Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
    if ( args.length === 1 && typeof first === "string" && first.length < 512 && context === document &&
        first.charAt(0) === "<" && !rnocache.test( first ) &&
        (jQuery.support.checkClone || !rchecked.test( first )) &&
        (jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

        // Mark cacheable and look for a hit
        cacheable = true;
        fragment = jQuery.fragments[ first ];
        cachehit = fragment !== undefined;
    }

    if ( !fragment ) {
        fragment = context.createDocumentFragment();
        jQuery.clean( args, context, fragment, scripts );

        // Update the cache, but only store false
        // unless this is a second parsing of the same content
        if ( cacheable ) {
            jQuery.fragments[ first ] = cachehit && fragment;
        }
    }

    return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
    appendTo: "append",
    prependTo: "prepend",
    insertBefore: "before",
    insertAfter: "after",
    replaceAll: "replaceWith"
}, function( name, original ) {
    jQuery.fn[ name ] = function( selector ) {
        var elems,
            i = 0,
            ret = [],
            insert = jQuery( selector ),
            l = insert.length,
            parent = this.length === 1 && this[0].parentNode;

        if ( (parent == null || parent && parent.nodeType === 11 && parent.childNodes.length === 1) && l === 1 ) {
            insert[ original ]( this[0] );
            return this;
        } else {
            for ( ; i < l; i++ ) {
                elems = ( i > 0 ? this.clone(true) : this ).get();
                jQuery( insert[i] )[ original ]( elems );
                ret = ret.concat( elems );
            }

            return this.pushStack( ret, name, insert.selector );
        }
    };
});

function getAll( elem ) {
    if ( typeof elem.getElementsByTagName !== "undefined" ) {
        return elem.getElementsByTagName( "*" );

    } else if ( typeof elem.querySelectorAll !== "undefined" ) {
        return elem.querySelectorAll( "*" );

    } else {
        return [];
    }
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
    if ( rcheckableType.test( elem.type ) ) {
        elem.defaultChecked = elem.checked;
    }
}

jQuery.extend({
    clone: function( elem, dataAndEvents, deepDataAndEvents ) {
        var srcElements,
            destElements,
            i,
            clone;

        if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
            clone = elem.cloneNode( true );

        // IE<=8 does not properly clone detached, unknown element nodes
        } else {
            fragmentDiv.innerHTML = elem.outerHTML;
            fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
        }

        if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
                (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
            // IE copies events bound via attachEvent when using cloneNode.
            // Calling detachEvent on the clone will also remove the events
            // from the original. In order to get around this, we use some
            // proprietary methods to clear the events. Thanks to MooTools
            // guys for this hotness.

            cloneFixAttributes( elem, clone );

            // Using Sizzle here is crazy slow, so we use getElementsByTagName instead
            srcElements = getAll( elem );
            destElements = getAll( clone );

            // Weird iteration because IE will replace the length property
            // with an element if you are cloning the body and one of the
            // elements on the page has a name or id of "length"
            for ( i = 0; srcElements[i]; ++i ) {
                // Ensure that the destination node is not null; Fixes #9587
                if ( destElements[i] ) {
                    cloneFixAttributes( srcElements[i], destElements[i] );
                }
            }
        }

        // Copy the events from the original to the clone
        if ( dataAndEvents ) {
            cloneCopyEvent( elem, clone );

            if ( deepDataAndEvents ) {
                srcElements = getAll( elem );
                destElements = getAll( clone );

                for ( i = 0; srcElements[i]; ++i ) {
                    cloneCopyEvent( srcElements[i], destElements[i] );
                }
            }
        }

        srcElements = destElements = null;

        // Return the cloned set
        return clone;
    },

    clean: function( elems, context, fragment, scripts ) {
        var i, j, elem, tag, wrap, depth, div, hasBody, tbody, len, handleScript, jsTags,
            safe = context === document && safeFragment,
            ret = [];

        // Ensure that context is a document
        if ( !context || typeof context.createDocumentFragment === "undefined" ) {
            context = document;
        }

        // Use the already-created safe fragment if context permits
        for ( i = 0; (elem = elems[i]) != null; i++ ) {
            if ( typeof elem === "number" ) {
                elem += "";
            }

            if ( !elem ) {
                continue;
            }

            // Convert html string into DOM nodes
            if ( typeof elem === "string" ) {
                if ( !rhtml.test( elem ) ) {
                    elem = context.createTextNode( elem );
                } else {
                    // Ensure a safe container in which to render the html
                    safe = safe || createSafeFragment( context );
                    div = context.createElement("div");
                    safe.appendChild( div );

                    // Fix "XHTML"-style tags in all browsers
                    elem = elem.replace(rxhtmlTag, "<$1></$2>");

                    // Go to html and back, then peel off extra wrappers
                    tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
                    wrap = wrapMap[ tag ] || wrapMap._default;
                    depth = wrap[0];
                    div.innerHTML = wrap[1] + elem + wrap[2];

                    // Move to the right depth
                    while ( depth-- ) {
                        div = div.lastChild;
                    }

                    // Remove IE's autoinserted <tbody> from table fragments
                    if ( !jQuery.support.tbody ) {

                        // String was a <table>, *may* have spurious <tbody>
                        hasBody = rtbody.test(elem);
                            tbody = tag === "table" && !hasBody ?
                                div.firstChild && div.firstChild.childNodes :

                                // String was a bare <thead> or <tfoot>
                                wrap[1] === "<table>" && !hasBody ?
                                    div.childNodes :
                                    [];

                        for ( j = tbody.length - 1; j >= 0 ; --j ) {
                            if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
                                tbody[ j ].parentNode.removeChild( tbody[ j ] );
                            }
                        }
                    }

                    // IE completely kills leading whitespace when innerHTML is used
                    if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
                        div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
                    }

                    elem = div.childNodes;

                    // Take out of fragment container (we need a fresh div each time)
                    div.parentNode.removeChild( div );
                }
            }

            if ( elem.nodeType ) {
                ret.push( elem );
            } else {
                jQuery.merge( ret, elem );
            }
        }

        // Fix #11356: Clear elements from safeFragment
        if ( div ) {
            elem = div = safe = null;
        }

        // Reset defaultChecked for any radios and checkboxes
        // about to be appended to the DOM in IE 6/7 (#8060)
        if ( !jQuery.support.appendChecked ) {
            for ( i = 0; (elem = ret[i]) != null; i++ ) {
                if ( jQuery.nodeName( elem, "input" ) ) {
                    fixDefaultChecked( elem );
                } else if ( typeof elem.getElementsByTagName !== "undefined" ) {
                    jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
                }
            }
        }

        // Append elements to a provided document fragment
        if ( fragment ) {
            // Special handling of each script element
            handleScript = function( elem ) {
                // Check if we consider it executable
                if ( !elem.type || rscriptType.test( elem.type ) ) {
                    // Detach the script and store it in the scripts array (if provided) or the fragment
                    // Return truthy to indicate that it has been handled
                    return scripts ?
                        scripts.push( elem.parentNode ? elem.parentNode.removeChild( elem ) : elem ) :
                        fragment.appendChild( elem );
                }
            };

            for ( i = 0; (elem = ret[i]) != null; i++ ) {
                // Check if we're done after handling an executable script
                if ( !( jQuery.nodeName( elem, "script" ) && handleScript( elem ) ) ) {
                    // Append to fragment and handle embedded scripts
                    fragment.appendChild( elem );
                    if ( typeof elem.getElementsByTagName !== "undefined" ) {
                        // handleScript alters the DOM, so use jQuery.merge to ensure snapshot iteration
                        jsTags = jQuery.grep( jQuery.merge( [], elem.getElementsByTagName("script") ), handleScript );

                        // Splice the scripts into ret after their former ancestor and advance our index beyond them
                        ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
                        i += jsTags.length;
                    }
                }
            }
        }

        return ret;
    },

    cleanData: function( elems, /* internal */ acceptData ) {
        var data, id, elem, type,
            i = 0,
            internalKey = jQuery.expando,
            cache = jQuery.cache,
            deleteExpando = jQuery.support.deleteExpando,
            special = jQuery.event.special;

        for ( ; (elem = elems[i]) != null; i++ ) {

            if ( acceptData || jQuery.acceptData( elem ) ) {

                id = elem[ internalKey ];
                data = id && cache[ id ];

                if ( data ) {
                    if ( data.events ) {
                        for ( type in data.events ) {
                            if ( special[ type ] ) {
                                jQuery.event.remove( elem, type );

                            // This is a shortcut to avoid jQuery.event.remove's overhead
                            } else {
                                jQuery.removeEvent( elem, type, data.handle );
                            }
                        }
                    }

                    // Remove cache only if it was not already removed by jQuery.event.remove
                    if ( cache[ id ] ) {

                        delete cache[ id ];

                        // IE does not allow us to delete expando properties from nodes,
                        // nor does it have a removeAttribute function on Document nodes;
                        // we must handle all of these cases
                        if ( deleteExpando ) {
                            delete elem[ internalKey ];

                        } else if ( elem.removeAttribute ) {
                            elem.removeAttribute( internalKey );

                        } else {
                            elem[ internalKey ] = null;
                        }

                        jQuery.deletedIds.push( id );
                    }
                }
            }
        }
    }
});
// Limit scope pollution from any deprecated API
(function() {

var matched, browser;

// Use of jQuery.browser is frowned upon.
// More details: http://api.jquery.com/jQuery.browser
// jQuery.uaMatch maintained for back-compat
jQuery.uaMatch = function( ua ) {
    ua = ua.toLowerCase();

    var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
        /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
        /(msie) ([\w.]+)/.exec( ua ) ||
        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
        [];

    return {
        browser: match[ 1 ] || "",
        version: match[ 2 ] || "0"
    };
};

matched = jQuery.uaMatch( navigator.userAgent );
browser = {};

if ( matched.browser ) {
    browser[ matched.browser ] = true;
    browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if ( browser.chrome ) {
    browser.webkit = true;
} else if ( browser.webkit ) {
    browser.safari = true;
}

jQuery.browser = browser;

jQuery.sub = function() {
    function jQuerySub( selector, context ) {
        return new jQuerySub.fn.init( selector, context );
    }
    jQuery.extend( true, jQuerySub, this );
    jQuerySub.superclass = this;
    jQuerySub.fn = jQuerySub.prototype = this();
    jQuerySub.fn.constructor = jQuerySub;
    jQuerySub.sub = this.sub;
    jQuerySub.fn.init = function init( selector, context ) {
        if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
            context = jQuerySub( context );
        }

        return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
    };
    jQuerySub.fn.init.prototype = jQuerySub.fn;
    var rootjQuerySub = jQuerySub(document);
    return jQuerySub;
};

})();
var curCSS, iframe, iframeDoc,
    ralpha = /alpha\([^)]*\)/i,
    ropacity = /opacity=([^)]*)/,
    rposition = /^(top|right|bottom|left)$/,
    // swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
    // see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
    rdisplayswap = /^(none|table(?!-c[ea]).+)/,
    rmargin = /^margin/,
    rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
    rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
    rrelNum = new RegExp( "^([-+])=(" + core_pnum + ")", "i" ),
    elemdisplay = {},

    cssShow = { position: "absolute", visibility: "hidden", display: "block" },
    cssNormalTransform = {
        letterSpacing: 0,
        fontWeight: 400
    },

    cssExpand = [ "Top", "Right", "Bottom", "Left" ],
    cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],

    eventsToggle = jQuery.fn.toggle;

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

    // shortcut for names that are not vendor prefixed
    if ( name in style ) {
        return name;
    }

    // check for vendor prefixed names
    var capName = name.charAt(0).toUpperCase() + name.slice(1),
        origName = name,
        i = cssPrefixes.length;

    while ( i-- ) {
        name = cssPrefixes[ i ] + capName;
        if ( name in style ) {
            return name;
        }
    }

    return origName;
}

function isHidden( elem, el ) {
    elem = el || elem;
    return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
    var elem, display,
        values = [],
        index = 0,
        length = elements.length;

    for ( ; index < length; index++ ) {
        elem = elements[ index ];
        if ( !elem.style ) {
            continue;
        }
        values[ index ] = jQuery._data( elem, "olddisplay" );
        if ( show ) {
            // Reset the inline display of this element to learn if it is
            // being hidden by cascaded rules or not
            if ( !values[ index ] && elem.style.display === "none" ) {
                elem.style.display = "";
            }

            // Set elements which have been overridden with display: none
            // in a stylesheet to whatever the default browser style is
            // for such an element
            if ( elem.style.display === "" && isHidden( elem ) ) {
                values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
            }
        } else {
            display = curCSS( elem, "display" );

            if ( !values[ index ] && display !== "none" ) {
                jQuery._data( elem, "olddisplay", display );
            }
        }
    }

    // Set the display of most of the elements in a second loop
    // to avoid the constant reflow
    for ( index = 0; index < length; index++ ) {
        elem = elements[ index ];
        if ( !elem.style ) {
            continue;
        }
        if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
            elem.style.display = show ? values[ index ] || "" : "none";
        }
    }

    return elements;
}

jQuery.fn.extend({
    css: function( name, value ) {
        return jQuery.access( this, function( elem, name, value ) {
            return value !== undefined ?
                jQuery.style( elem, name, value ) :
                jQuery.css( elem, name );
        }, name, value, arguments.length > 1 );
    },
    show: function() {
        return showHide( this, true );
    },
    hide: function() {
        return showHide( this );
    },
    toggle: function( state, fn2 ) {
        var bool = typeof state === "boolean";

        if ( jQuery.isFunction( state ) && jQuery.isFunction( fn2 ) ) {
            return eventsToggle.apply( this, arguments );
        }

        return this.each(function() {
            if ( bool ? state : isHidden( this ) ) {
                jQuery( this ).show();
            } else {
                jQuery( this ).hide();
            }
        });
    }
});

jQuery.extend({
    // Add in style property hooks for overriding the default
    // behavior of getting and setting a style property
    cssHooks: {
        opacity: {
            get: function( elem, computed ) {
                if ( computed ) {
                    // We should always get a number back from opacity
                    var ret = curCSS( elem, "opacity" );
                    return ret === "" ? "1" : ret;

                }
            }
        }
    },

    // Exclude the following css properties to add px
    cssNumber: {
        "fillOpacity": true,
        "fontWeight": true,
        "lineHeight": true,
        "opacity": true,
        "orphans": true,
        "widows": true,
        "zIndex": true,
        "zoom": true
    },

    // Add in properties whose names you wish to fix before
    // setting or getting the value
    cssProps: {
        // normalize float css property
        "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
    },

    // Get and set the style property on a DOM Node
    style: function( elem, name, value, extra ) {
        // Don't set styles on text and comment nodes
        if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
            return;
        }

        // Make sure that we're working with the right name
        var ret, type, hooks,
            origName = jQuery.camelCase( name ),
            style = elem.style;

        name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

        // gets hook for the prefixed version
        // followed by the unprefixed version
        hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

        // Check if we're setting a value
        if ( value !== undefined ) {
            type = typeof value;

            // convert relative number strings (+= or -=) to relative numbers. #7345
            if ( type === "string" && (ret = rrelNum.exec( value )) ) {
                value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
                // Fixes bug #9237
                type = "number";
            }

            // Make sure that NaN and null values aren't set. See: #7116
            if ( value == null || type === "number" && isNaN( value ) ) {
                return;
            }

            // If a number was passed in, add 'px' to the (except for certain CSS properties)
            if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
                value += "px";
            }

            // If a hook was provided, use that value, otherwise just set the specified value
            if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
                // Wrapped to prevent IE from throwing errors when 'invalid' values are provided
                // Fixes bug #5509
                try {
                    style[ name ] = value;
                } catch(e) {}
            }

        } else {
            // If a hook was provided get the non-computed value from there
            if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
                return ret;
            }

            // Otherwise just get the value from the style object
            return style[ name ];
        }
    },

    css: function( elem, name, numeric, extra ) {
        var val, num, hooks,
            origName = jQuery.camelCase( name );

        // Make sure that we're working with the right name
        name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

        // gets hook for the prefixed version
        // followed by the unprefixed version
        hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

        // If a hook was provided get the computed value from there
        if ( hooks && "get" in hooks ) {
            val = hooks.get( elem, true, extra );
        }

        // Otherwise, if a way to get the computed value exists, use that
        if ( val === undefined ) {
            val = curCSS( elem, name );
        }

        //convert "normal" to computed value
        if ( val === "normal" && name in cssNormalTransform ) {
            val = cssNormalTransform[ name ];
        }

        // Return, converting to number if forced or a qualifier was provided and val looks numeric
        if ( numeric || extra !== undefined ) {
            num = parseFloat( val );
            return numeric || jQuery.isNumeric( num ) ? num || 0 : val;
        }
        return val;
    },

    // A method for quickly swapping in/out CSS properties to get correct calculations
    swap: function( elem, options, callback ) {
        var ret, name,
            old = {};

        // Remember the old values, and insert the new ones
        for ( name in options ) {
            old[ name ] = elem.style[ name ];
            elem.style[ name ] = options[ name ];
        }

        ret = callback.call( elem );

        // Revert the old values
        for ( name in options ) {
            elem.style[ name ] = old[ name ];
        }

        return ret;
    }
});

// NOTE: To any future maintainer, we've window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
    curCSS = function( elem, name ) {
        var ret, width, minWidth, maxWidth,
            computed = window.getComputedStyle( elem, null ),
            style = elem.style;

        if ( computed ) {

            ret = computed[ name ];
            if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
                ret = jQuery.style( elem, name );
            }

            // A tribute to the "awesome hack by Dean Edwards"
            // Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
            // Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
            // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
            if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {
                width = style.width;
                minWidth = style.minWidth;
                maxWidth = style.maxWidth;

                style.minWidth = style.maxWidth = style.width = ret;
                ret = computed.width;

                style.width = width;
                style.minWidth = minWidth;
                style.maxWidth = maxWidth;
            }
        }

        return ret;
    };
} else if ( document.documentElement.currentStyle ) {
    curCSS = function( elem, name ) {
        var left, rsLeft,
            ret = elem.currentStyle && elem.currentStyle[ name ],
            style = elem.style;

        // Avoid setting ret to empty string here
        // so we don't default to auto
        if ( ret == null && style && style[ name ] ) {
            ret = style[ name ];
        }

        // From the awesome hack by Dean Edwards
        // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

        // If we're not dealing with a regular pixel number
        // but a number that has a weird ending, we need to convert it to pixels
        // but not position css attributes, as those are proportional to the parent element instead
        // and we can't measure the parent instead because it might trigger a "stacking dolls" problem
        if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

            // Remember the original values
            left = style.left;
            rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

            // Put in the new values to get a computed value out
            if ( rsLeft ) {
                elem.runtimeStyle.left = elem.currentStyle.left;
            }
            style.left = name === "fontSize" ? "1em" : ret;
            ret = style.pixelLeft + "px";

            // Revert the changed values
            style.left = left;
            if ( rsLeft ) {
                elem.runtimeStyle.left = rsLeft;
            }
        }

        return ret === "" ? "auto" : ret;
    };
}

function setPositiveNumber( elem, value, subtract ) {
    var matches = rnumsplit.exec( value );
    return matches ?
            Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
            value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox ) {
    var i = extra === ( isBorderBox ? "border" : "content" ) ?
        // If we already have the right measurement, avoid augmentation
        4 :
        // Otherwise initialize for horizontal or vertical properties
        name === "width" ? 1 : 0,

        val = 0;

    for ( ; i < 4; i += 2 ) {
        // both box models exclude margin, so add it if we want it
        if ( extra === "margin" ) {
            // we use jQuery.css instead of curCSS here
            // because of the reliableMarginRight CSS hook!
            val += jQuery.css( elem, extra + cssExpand[ i ], true );
        }

        // From this point on we use curCSS for maximum performance (relevant in animations)
        if ( isBorderBox ) {
            // border-box includes padding, so remove it if we want content
            if ( extra === "content" ) {
                val -= parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;
            }

            // at this point, extra isn't border nor margin, so remove border
            if ( extra !== "margin" ) {
                val -= parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
            }
        } else {
            // at this point, extra isn't content, so add padding
            val += parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;

            // at this point, extra isn't content nor padding, so add border
            if ( extra !== "padding" ) {
                val += parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
            }
        }
    }

    return val;
}

function getWidthOrHeight( elem, name, extra ) {

    // Start with offset property, which is equivalent to the border-box value
    var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
        valueIsBorderBox = true,
        isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box";

    // some non-html elements return undefined for offsetWidth, so check for null/undefined
    // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
    // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
    if ( val <= 0 || val == null ) {
        // Fall back to computed then uncomputed css if necessary
        val = curCSS( elem, name );
        if ( val < 0 || val == null ) {
            val = elem.style[ name ];
        }

        // Computed unit is not pixels. Stop here and return.
        if ( rnumnonpx.test(val) ) {
            return val;
        }

        // we need the check for style in case a browser which returns unreliable values
        // for getComputedStyle silently falls back to the reliable elem.style
        valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

        // Normalize "", auto, and prepare for extra
        val = parseFloat( val ) || 0;
    }

    // use the active box-sizing model to add/subtract irrelevant styles
    return ( val +
        augmentWidthOrHeight(
            elem,
            name,
            extra || ( isBorderBox ? "border" : "content" ),
            valueIsBorderBox
        )
    ) + "px";
}


// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
    if ( elemdisplay[ nodeName ] ) {
        return elemdisplay[ nodeName ];
    }

    var elem = jQuery( "<" + nodeName + ">" ).appendTo( document.body ),
        display = elem.css("display");
    elem.remove();

    // If the simple way fails,
    // get element's real default display by attaching it to a temp iframe
    if ( display === "none" || display === "" ) {
        // Use the already-created iframe if possible
        iframe = document.body.appendChild(
            iframe || jQuery.extend( document.createElement("iframe"), {
                frameBorder: 0,
                width: 0,
                height: 0
            })
        );

        // Create a cacheable copy of the iframe document on first call.
        // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
        // document to it; WebKit & Firefox won't allow reusing the iframe document.
        if ( !iframeDoc || !iframe.createElement ) {
            iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
            iframeDoc.write("<!doctype html><html><body>");
            iframeDoc.close();
        }

        elem = iframeDoc.body.appendChild( iframeDoc.createElement(nodeName) );

        display = curCSS( elem, "display" );
        document.body.removeChild( iframe );
    }

    // Store the correct default display
    elemdisplay[ nodeName ] = display;

    return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
    jQuery.cssHooks[ name ] = {
        get: function( elem, computed, extra ) {
            if ( computed ) {
                // certain elements can have dimension info if we invisibly show them
                // however, it must have a current display style that would benefit from this
                if ( elem.offsetWidth === 0 && rdisplayswap.test( curCSS( elem, "display" ) ) ) {
                    return jQuery.swap( elem, cssShow, function() {
                        return getWidthOrHeight( elem, name, extra );
                    });
                } else {
                    return getWidthOrHeight( elem, name, extra );
                }
            }
        },

        set: function( elem, value, extra ) {
            return setPositiveNumber( elem, value, extra ?
                augmentWidthOrHeight(
                    elem,
                    name,
                    extra,
                    jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box"
                ) : 0
            );
        }
    };
});

if ( !jQuery.support.opacity ) {
    jQuery.cssHooks.opacity = {
        get: function( elem, computed ) {
            // IE uses filters for opacity
            return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
                ( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
                computed ? "1" : "";
        },

        set: function( elem, value ) {
            var style = elem.style,
                currentStyle = elem.currentStyle,
                opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
                filter = currentStyle && currentStyle.filter || style.filter || "";

            // IE has trouble with opacity if it does not have layout
            // Force it by setting the zoom level
            style.zoom = 1;

            // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
            if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
                style.removeAttribute ) {

                // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
                // if "filter:" is present at all, clearType is disabled, we want to avoid this
                // style.removeAttribute is IE Only, but so apparently is this code path...
                style.removeAttribute( "filter" );

                // if there there is no filter style applied in a css rule, we are done
                if ( currentStyle && !currentStyle.filter ) {
                    return;
                }
            }

            // otherwise, set new filter values
            style.filter = ralpha.test( filter ) ?
                filter.replace( ralpha, opacity ) :
                filter + " " + opacity;
        }
    };
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
    if ( !jQuery.support.reliableMarginRight ) {
        jQuery.cssHooks.marginRight = {
            get: function( elem, computed ) {
                // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                // Work around by temporarily setting element display to inline-block
                return jQuery.swap( elem, { "display": "inline-block" }, function() {
                    if ( computed ) {
                        return curCSS( elem, "marginRight" );
                    }
                });
            }
        };
    }

    // Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
    // getComputedStyle returns percent when specified for top/left/bottom/right
    // rather than make the css module depend on the offset module, we just check for it here
    if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
        jQuery.each( [ "top", "left" ], function( i, prop ) {
            jQuery.cssHooks[ prop ] = {
                get: function( elem, computed ) {
                    if ( computed ) {
                        var ret = curCSS( elem, prop );
                        // if curCSS returns percentage, fallback to offset
                        return rnumnonpx.test( ret ) ? jQuery( elem ).position()[ prop ] + "px" : ret;
                    }
                }
            };
        });
    }

});

if ( jQuery.expr && jQuery.expr.filters ) {
    jQuery.expr.filters.hidden = function( elem ) {
        return ( elem.offsetWidth === 0 && elem.offsetHeight === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || curCSS( elem, "display" )) === "none");
    };

    jQuery.expr.filters.visible = function( elem ) {
        return !jQuery.expr.filters.hidden( elem );
    };
}

// These hooks are used by animate to expand properties
jQuery.each({
    margin: "",
    padding: "",
    border: "Width"
}, function( prefix, suffix ) {
    jQuery.cssHooks[ prefix + suffix ] = {
        expand: function( value ) {
            var i,

                // assumes a single number if not a string
                parts = typeof value === "string" ? value.split(" ") : [ value ],
                expanded = {};

            for ( i = 0; i < 4; i++ ) {
                expanded[ prefix + cssExpand[ i ] + suffix ] =
                    parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
            }

            return expanded;
        }
    };

    if ( !rmargin.test( prefix ) ) {
        jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
    }
});
var r20 = /%20/g,
    rbracket = /\[\]$/,
    rCRLF = /\r?\n/g,
    rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
    rselectTextarea = /^(?:select|textarea)/i;

jQuery.fn.extend({
    serialize: function() {
        return jQuery.param( this.serializeArray() );
    },
    serializeArray: function() {
        return this.map(function(){
            return this.elements ? jQuery.makeArray( this.elements ) : this;
        })
        .filter(function(){
            return this.name && !this.disabled &&
                ( this.checked || rselectTextarea.test( this.nodeName ) ||
                    rinput.test( this.type ) );
        })
        .map(function( i, elem ){
            var val = jQuery( this ).val();

            return val == null ?
                null :
                jQuery.isArray( val ) ?
                    jQuery.map( val, function( val, i ){
                        return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
                    }) :
                    { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
        }).get();
    }
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
    var prefix,
        s = [],
        add = function( key, value ) {
            // If value is a function, invoke it and return its value
            value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
            s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
        };

    // Set traditional to true for jQuery <= 1.3.2 behavior.
    if ( traditional === undefined ) {
        traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
    }

    // If an array was passed in, assume that it is an array of form elements.
    if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
        // Serialize the form elements
        jQuery.each( a, function() {
            add( this.name, this.value );
        });

    } else {
        // If traditional, encode the "old" way (the way 1.3.2 or older
        // did it), otherwise encode params recursively.
        for ( prefix in a ) {
            buildParams( prefix, a[ prefix ], traditional, add );
        }
    }

    // Return the resulting serialization
    return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
    var name;

    if ( jQuery.isArray( obj ) ) {
        // Serialize array item.
        jQuery.each( obj, function( i, v ) {
            if ( traditional || rbracket.test( prefix ) ) {
                // Treat each array item as a scalar.
                add( prefix, v );

            } else {
                // If array item is non-scalar (array or object), encode its
                // numeric index to resolve deserialization ambiguity issues.
                // Note that rack (as of 1.0.0) can't currently deserialize
                // nested arrays properly, and attempting to do so may cause
                // a server error. Possible fixes are to modify rack's
                // deserialization algorithm or to provide an option or flag
                // to force array serialization to be shallow.
                buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
            }
        });

    } else if ( !traditional && jQuery.type( obj ) === "object" ) {
        // Serialize object item.
        for ( name in obj ) {
            buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
        }

    } else {
        // Serialize scalar item.
        add( prefix, obj );
    }
}
var
    // Document location
    ajaxLocParts,
    ajaxLocation,

    rhash = /#.*$/,
    rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
    // #7653, #8125, #8152: local protocol detection
    rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
    rnoContent = /^(?:GET|HEAD)$/,
    rprotocol = /^\/\//,
    rquery = /\?/,
    rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    rts = /([?&])_=[^&]*/,
    rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

    // Keep a copy of the old load method
    _load = jQuery.fn.load,

    /* Prefilters
     * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
     * 2) These are called:
     *    - BEFORE asking for a transport
     *    - AFTER param serialization (s.data is a string if s.processData is true)
     * 3) key is the dataType
     * 4) the catchall symbol "*" can be used
     * 5) execution will start with transport dataType and THEN continue down to "*" if needed
     */
    prefilters = {},

    /* Transports bindings
     * 1) key is the dataType
     * 2) the catchall symbol "*" can be used
     * 3) selection will start with transport dataType and THEN go to "*" if needed
     */
    transports = {},

    // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
    allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
    ajaxLocation = location.href;
} catch( e ) {
    // Use the href attribute of an A element
    // since IE will modify it given document.location
    ajaxLocation = document.createElement( "a" );
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

    // dataTypeExpression is optional and defaults to "*"
    return function( dataTypeExpression, func ) {

        if ( typeof dataTypeExpression !== "string" ) {
            func = dataTypeExpression;
            dataTypeExpression = "*";
        }

        var dataType, list, placeBefore,
            dataTypes = dataTypeExpression.toLowerCase().split( core_rspace ),
            i = 0,
            length = dataTypes.length;

        if ( jQuery.isFunction( func ) ) {
            // For each dataType in the dataTypeExpression
            for ( ; i < length; i++ ) {
                dataType = dataTypes[ i ];
                // We control if we're asked to add before
                // any existing element
                placeBefore = /^\+/.test( dataType );
                if ( placeBefore ) {
                    dataType = dataType.substr( 1 ) || "*";
                }
                list = structure[ dataType ] = structure[ dataType ] || [];
                // then we add to the structure accordingly
                list[ placeBefore ? "unshift" : "push" ]( func );
            }
        }
    };
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
        dataType /* internal */, inspected /* internal */ ) {

    dataType = dataType || options.dataTypes[ 0 ];
    inspected = inspected || {};

    inspected[ dataType ] = true;

    var selection,
        list = structure[ dataType ],
        i = 0,
        length = list ? list.length : 0,
        executeOnly = ( structure === prefilters );

    for ( ; i < length && ( executeOnly || !selection ); i++ ) {
        selection = list[ i ]( options, originalOptions, jqXHR );
        // If we got redirected to another dataType
        // we try there if executing only and not done already
        if ( typeof selection === "string" ) {
            if ( !executeOnly || inspected[ selection ] ) {
                selection = undefined;
            } else {
                options.dataTypes.unshift( selection );
                selection = inspectPrefiltersOrTransports(
                        structure, options, originalOptions, jqXHR, selection, inspected );
            }
        }
    }
    // If we're only executing or nothing was selected
    // we try the catchall dataType if not done already
    if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
        selection = inspectPrefiltersOrTransports(
                structure, options, originalOptions, jqXHR, "*", inspected );
    }
    // unnecessary when only executing (prefilters)
    // but it'll be ignored by the caller in that case
    return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
    var key, deep,
        flatOptions = jQuery.ajaxSettings.flatOptions || {};
    for ( key in src ) {
        if ( src[ key ] !== undefined ) {
            ( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
        }
    }
    if ( deep ) {
        jQuery.extend( true, target, deep );
    }
}

jQuery.fn.load = function( url, params, callback ) {
    if ( typeof url !== "string" && _load ) {
        return _load.apply( this, arguments );
    }

    // Don't do a request if no elements are being requested
    if ( !this.length ) {
        return this;
    }

    var selector, type, response,
        self = this,
        off = url.indexOf(" ");

    if ( off >= 0 ) {
        selector = url.slice( off, url.length );
        url = url.slice( 0, off );
    }

    // If it's a function
    if ( jQuery.isFunction( params ) ) {

        // We assume that it's the callback
        callback = params;
        params = undefined;

    // Otherwise, build a param string
    } else if ( params && typeof params === "object" ) {
        type = "POST";
    }

    // Request the remote document
    jQuery.ajax({
        url: url,

        // if "type" variable is undefined, then "GET" method will be used
        type: type,
        dataType: "html",
        data: params,
        complete: function( jqXHR, status ) {
            if ( callback ) {
                self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
            }
        }
    }).done(function( responseText ) {

        // Save response for use in complete callback
        response = arguments;

        // See if a selector was specified
        self.html( selector ?

            // Create a dummy div to hold the results
            jQuery("<div>")

                // inject the contents of the document in, removing the scripts
                // to avoid any 'Permission Denied' errors in IE
                .append( responseText.replace( rscript, "" ) )

                // Locate the specified elements
                .find( selector ) :

            // If not, just inject the full result
            responseText );

    });

    return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
    jQuery.fn[ o ] = function( f ){
        return this.on( o, f );
    };
});

jQuery.each( [ "get", "post" ], function( i, method ) {
    jQuery[ method ] = function( url, data, callback, type ) {
        // shift arguments if data argument was omitted
        if ( jQuery.isFunction( data ) ) {
            type = type || callback;
            callback = data;
            data = undefined;
        }

        return jQuery.ajax({
            type: method,
            url: url,
            data: data,
            success: callback,
            dataType: type
        });
    };
});

jQuery.extend({

    getScript: function( url, callback ) {
        return jQuery.get( url, undefined, callback, "script" );
    },

    getJSON: function( url, data, callback ) {
        return jQuery.get( url, data, callback, "json" );
    },

    // Creates a full fledged settings object into target
    // with both ajaxSettings and settings fields.
    // If target is omitted, writes into ajaxSettings.
    ajaxSetup: function( target, settings ) {
        if ( settings ) {
            // Building a settings object
            ajaxExtend( target, jQuery.ajaxSettings );
        } else {
            // Extending ajaxSettings
            settings = target;
            target = jQuery.ajaxSettings;
        }
        ajaxExtend( target, settings );
        return target;
    },

    ajaxSettings: {
        url: ajaxLocation,
        isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
        global: true,
        type: "GET",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        processData: true,
        async: true,
        /*
        timeout: 0,
        data: null,
        dataType: null,
        username: null,
        password: null,
        cache: null,
        throws: false,
        traditional: false,
        headers: {},
        */

        accepts: {
            xml: "application/xml, text/xml",
            html: "text/html",
            text: "text/plain",
            json: "application/json, text/javascript",
            "*": allTypes
        },

        contents: {
            xml: /xml/,
            html: /html/,
            json: /json/
        },

        responseFields: {
            xml: "responseXML",
            text: "responseText"
        },

        // List of data converters
        // 1) key format is "source_type destination_type" (a single space in-between)
        // 2) the catchall symbol "*" can be used for source_type
        converters: {

            // Convert anything to text
            "* text": window.String,

            // Text to html (true = no transformation)
            "text html": true,

            // Evaluate text as a json expression
            "text json": jQuery.parseJSON,

            // Parse text as xml
            "text xml": jQuery.parseXML
        },

        // For options that shouldn't be deep extended:
        // you can add your own custom options here if
        // and when you create one that shouldn't be
        // deep extended (see ajaxExtend)
        flatOptions: {
            context: true,
            url: true
        }
    },

    ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
    ajaxTransport: addToPrefiltersOrTransports( transports ),

    // Main method
    ajax: function( url, options ) {

        // If url is an object, simulate pre-1.5 signature
        if ( typeof url === "object" ) {
            options = url;
            url = undefined;
        }

        // Force options to be an object
        options = options || {};

        var // ifModified key
            ifModifiedKey,
            // Response headers
            responseHeadersString,
            responseHeaders,
            // transport
            transport,
            // timeout handle
            timeoutTimer,
            // Cross-domain detection vars
            parts,
            // To know if global events are to be dispatched
            fireGlobals,
            // Loop variable
            i,
            // Create the final options object
            s = jQuery.ajaxSetup( {}, options ),
            // Callbacks context
            callbackContext = s.context || s,
            // Context for global events
            // It's the callbackContext if one was provided in the options
            // and if it's a DOM node or a jQuery collection
            globalEventContext = callbackContext !== s &&
                ( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
                        jQuery( callbackContext ) : jQuery.event,
            // Deferreds
            deferred = jQuery.Deferred(),
            completeDeferred = jQuery.Callbacks( "once memory" ),
            // Status-dependent callbacks
            statusCode = s.statusCode || {},
            // Headers (they are sent all at once)
            requestHeaders = {},
            requestHeadersNames = {},
            // The jqXHR state
            state = 0,
            // Default abort message
            strAbort = "canceled",
            // Fake xhr
            jqXHR = {

                readyState: 0,

                // Caches the header
                setRequestHeader: function( name, value ) {
                    if ( !state ) {
                        var lname = name.toLowerCase();
                        name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
                        requestHeaders[ name ] = value;
                    }
                    return this;
                },

                // Raw string
                getAllResponseHeaders: function() {
                    return state === 2 ? responseHeadersString : null;
                },

                // Builds headers hashtable if needed
                getResponseHeader: function( key ) {
                    var match;
                    if ( state === 2 ) {
                        if ( !responseHeaders ) {
                            responseHeaders = {};
                            while( ( match = rheaders.exec( responseHeadersString ) ) ) {
                                responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
                            }
                        }
                        match = responseHeaders[ key.toLowerCase() ];
                    }
                    return match === undefined ? null : match;
                },

                // Overrides response content-type header
                overrideMimeType: function( type ) {
                    if ( !state ) {
                        s.mimeType = type;
                    }
                    return this;
                },

                // Cancel the request
                abort: function( statusText ) {
                    statusText = statusText || strAbort;
                    if ( transport ) {
                        transport.abort( statusText );
                    }
                    done( 0, statusText );
                    return this;
                }
            };

        // Callback for when everything is done
        // It is defined here because jslint complains if it is declared
        // at the end of the function (which would be more logical and readable)
        function done( status, nativeStatusText, responses, headers ) {
            var isSuccess, success, error, response, modified,
                statusText = nativeStatusText;

            // Called once
            if ( state === 2 ) {
                return;
            }

            // State is "done" now
            state = 2;

            // Clear timeout if it exists
            if ( timeoutTimer ) {
                clearTimeout( timeoutTimer );
            }

            // Dereference transport for early garbage collection
            // (no matter how long the jqXHR object will be used)
            transport = undefined;

            // Cache response headers
            responseHeadersString = headers || "";

            // Set readyState
            jqXHR.readyState = status > 0 ? 4 : 0;

            // Get response data
            if ( responses ) {
                response = ajaxHandleResponses( s, jqXHR, responses );
            }

            // If successful, handle type chaining
            if ( status >= 200 && status < 300 || status === 304 ) {

                // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                if ( s.ifModified ) {

                    modified = jqXHR.getResponseHeader("Last-Modified");
                    if ( modified ) {
                        jQuery.lastModified[ ifModifiedKey ] = modified;
                    }
                    modified = jqXHR.getResponseHeader("Etag");
                    if ( modified ) {
                        jQuery.etag[ ifModifiedKey ] = modified;
                    }
                }

                // If not modified
                if ( status === 304 ) {

                    statusText = "notmodified";
                    isSuccess = true;

                // If we have data
                } else {

                    isSuccess = ajaxConvert( s, response );
                    statusText = isSuccess.state;
                    success = isSuccess.data;
                    error = isSuccess.error;
                    isSuccess = !error;
                }
            } else {
                // We extract error from statusText
                // then normalize statusText and status for non-aborts
                error = statusText;
                if ( !statusText || status ) {
                    statusText = "error";
                    if ( status < 0 ) {
                        status = 0;
                    }
                }
            }

            // Set data for the fake xhr object
            jqXHR.status = status;
            jqXHR.statusText = ( nativeStatusText || statusText ) + "";

            // Success/Error
            if ( isSuccess ) {
                deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
            } else {
                deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
            }

            // Status-dependent callbacks
            jqXHR.statusCode( statusCode );
            statusCode = undefined;

            if ( fireGlobals ) {
                globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
                        [ jqXHR, s, isSuccess ? success : error ] );
            }

            // Complete
            completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

            if ( fireGlobals ) {
                globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
                // Handle the global AJAX counter
                if ( !( --jQuery.active ) ) {
                    jQuery.event.trigger( "ajaxStop" );
                }
            }
        }

        // Attach deferreds
        deferred.promise( jqXHR );
        jqXHR.success = jqXHR.done;
        jqXHR.error = jqXHR.fail;
        jqXHR.complete = completeDeferred.add;

        // Status-dependent callbacks
        jqXHR.statusCode = function( map ) {
            if ( map ) {
                var tmp;
                if ( state < 2 ) {
                    for ( tmp in map ) {
                        statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
                    }
                } else {
                    tmp = map[ jqXHR.status ];
                    jqXHR.always( tmp );
                }
            }
            return this;
        };

        // Remove hash character (#7531: and string promotion)
        // Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
        // We also use the url parameter if available
        s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

        // Extract dataTypes list
        s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( core_rspace );

        // A cross-domain request is in order when we have a protocol:host:port mismatch
        if ( s.crossDomain == null ) {
            parts = rurl.exec( s.url.toLowerCase() ) || false;
            s.crossDomain = parts && ( parts.join(":") + ( parts[ 3 ] ? "" : parts[ 1 ] === "http:" ? 80 : 443 ) ) !==
                ( ajaxLocParts.join(":") + ( ajaxLocParts[ 3 ] ? "" : ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) );
        }

        // Convert data if not already a string
        if ( s.data && s.processData && typeof s.data !== "string" ) {
            s.data = jQuery.param( s.data, s.traditional );
        }

        // Apply prefilters
        inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

        // If request was aborted inside a prefilter, stop there
        if ( state === 2 ) {
            return jqXHR;
        }

        // We can fire global events as of now if asked to
        fireGlobals = s.global;

        // Uppercase the type
        s.type = s.type.toUpperCase();

        // Determine if request has content
        s.hasContent = !rnoContent.test( s.type );

        // Watch for a new set of requests
        if ( fireGlobals && jQuery.active++ === 0 ) {
            jQuery.event.trigger( "ajaxStart" );
        }

        // More options handling for requests with no content
        if ( !s.hasContent ) {

            // If data is available, append data to url
            if ( s.data ) {
                s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
                // #9682: remove data so that it's not used in an eventual retry
                delete s.data;
            }

            // Get ifModifiedKey before adding the anti-cache parameter
            ifModifiedKey = s.url;

            // Add anti-cache in url if needed
            if ( s.cache === false ) {

                var ts = jQuery.now(),
                    // try replacing _= if it is there
                    ret = s.url.replace( rts, "$1_=" + ts );

                // if nothing was replaced, add timestamp to the end
                s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
            }
        }

        // Set the correct header, if data is being sent
        if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
            jqXHR.setRequestHeader( "Content-Type", s.contentType );
        }

        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
        if ( s.ifModified ) {
            ifModifiedKey = ifModifiedKey || s.url;
            if ( jQuery.lastModified[ ifModifiedKey ] ) {
                jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
            }
            if ( jQuery.etag[ ifModifiedKey ] ) {
                jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
            }
        }

        // Set the Accepts header for the server, depending on the dataType
        jqXHR.setRequestHeader(
            "Accept",
            s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
                s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
                s.accepts[ "*" ]
        );

        // Check for headers option
        for ( i in s.headers ) {
            jqXHR.setRequestHeader( i, s.headers[ i ] );
        }

        // Allow custom headers/mimetypes and early abort
        if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
                // Abort if not done already and return
                return jqXHR.abort();

        }

        // aborting is no longer a cancellation
        strAbort = "abort";

        // Install callbacks on deferreds
        for ( i in { success: 1, error: 1, complete: 1 } ) {
            jqXHR[ i ]( s[ i ] );
        }

        // Get transport
        transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

        // If no transport, we auto-abort
        if ( !transport ) {
            done( -1, "No Transport" );
        } else {
            jqXHR.readyState = 1;
            // Send global event
            if ( fireGlobals ) {
                globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
            }
            // Timeout
            if ( s.async && s.timeout > 0 ) {
                timeoutTimer = setTimeout( function(){
                    jqXHR.abort( "timeout" );
                }, s.timeout );
            }

            try {
                state = 1;
                transport.send( requestHeaders, done );
            } catch (e) {
                // Propagate exception as error if not done
                if ( state < 2 ) {
                    done( -1, e );
                // Simply rethrow otherwise
                } else {
                    throw e;
                }
            }
        }

        return jqXHR;
    },

    // Counter for holding the number of active queries
    active: 0,

    // Last-Modified header cache for next request
    lastModified: {},
    etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

    var ct, type, finalDataType, firstDataType,
        contents = s.contents,
        dataTypes = s.dataTypes,
        responseFields = s.responseFields;

    // Fill responseXXX fields
    for ( type in responseFields ) {
        if ( type in responses ) {
            jqXHR[ responseFields[type] ] = responses[ type ];
        }
    }

    // Remove auto dataType and get content-type in the process
    while( dataTypes[ 0 ] === "*" ) {
        dataTypes.shift();
        if ( ct === undefined ) {
            ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
        }
    }

    // Check if we're dealing with a known content-type
    if ( ct ) {
        for ( type in contents ) {
            if ( contents[ type ] && contents[ type ].test( ct ) ) {
                dataTypes.unshift( type );
                break;
            }
        }
    }

    // Check to see if we have a response for the expected dataType
    if ( dataTypes[ 0 ] in responses ) {
        finalDataType = dataTypes[ 0 ];
    } else {
        // Try convertible dataTypes
        for ( type in responses ) {
            if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
                finalDataType = type;
                break;
            }
            if ( !firstDataType ) {
                firstDataType = type;
            }
        }
        // Or just use first one
        finalDataType = finalDataType || firstDataType;
    }

    // If we found a dataType
    // We add the dataType to the list if needed
    // and return the corresponding response
    if ( finalDataType ) {
        if ( finalDataType !== dataTypes[ 0 ] ) {
            dataTypes.unshift( finalDataType );
        }
        return responses[ finalDataType ];
    }
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

    var conv, conv2, current, tmp,
        // Work with a copy of dataTypes in case we need to modify it for conversion
        dataTypes = s.dataTypes.slice(),
        prev = dataTypes[ 0 ],
        converters = {},
        i = 0;

    // Apply the dataFilter if provided
    if ( s.dataFilter ) {
        response = s.dataFilter( response, s.dataType );
    }

    // Create converters map with lowercased keys
    if ( dataTypes[ 1 ] ) {
        for ( conv in s.converters ) {
            converters[ conv.toLowerCase() ] = s.converters[ conv ];
        }
    }

    // Convert to each sequential dataType, tolerating list modification
    for ( ; (current = dataTypes[++i]); ) {

        // There's only work to do if current dataType is non-auto
        if ( current !== "*" ) {

            // Convert response if prev dataType is non-auto and differs from current
            if ( prev !== "*" && prev !== current ) {

                // Seek a direct converter
                conv = converters[ prev + " " + current ] || converters[ "* " + current ];

                // If none found, seek a pair
                if ( !conv ) {
                    for ( conv2 in converters ) {

                        // If conv2 outputs current
                        tmp = conv2.split(" ");
                        if ( tmp[ 1 ] === current ) {

                            // If prev can be converted to accepted input
                            conv = converters[ prev + " " + tmp[ 0 ] ] ||
                                converters[ "* " + tmp[ 0 ] ];
                            if ( conv ) {
                                // Condense equivalence converters
                                if ( conv === true ) {
                                    conv = converters[ conv2 ];

                                // Otherwise, insert the intermediate dataType
                                } else if ( converters[ conv2 ] !== true ) {
                                    current = tmp[ 0 ];
                                    dataTypes.splice( i--, 0, current );
                                }

                                break;
                            }
                        }
                    }
                }

                // Apply converter (if not an equivalence)
                if ( conv !== true ) {

                    // Unless errors are allowed to bubble, catch and return them
                    if ( conv && s["throws"] ) {
                        response = conv( response );
                    } else {
                        try {
                            response = conv( response );
                        } catch ( e ) {
                            return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
                        }
                    }
                }
            }

            // Update prev for next iteration
            prev = current;
        }
    }

    return { state: "success", data: response };
}
var oldCallbacks = [],
    rquestion = /\?/,
    rjsonp = /(=)\?(?=&|$)|\?\?/,
    nonce = jQuery.now();

// Default jsonp settings
jQuery.ajaxSetup({
    jsonp: "callback",
    jsonpCallback: function() {
        var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
        this[ callback ] = true;
        return callback;
    }
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

    var callbackName, overwritten, responseContainer,
        data = s.data,
        url = s.url,
        hasCallback = s.jsonp !== false,
        replaceInUrl = hasCallback && rjsonp.test( url ),
        replaceInData = hasCallback && !replaceInUrl && typeof data === "string" &&
            !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") &&
            rjsonp.test( data );

    // Handle iff the expected data type is "jsonp" or we have a parameter to set
    if ( s.dataTypes[ 0 ] === "jsonp" || replaceInUrl || replaceInData ) {

        // Get callback name, remembering preexisting value associated with it
        callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
            s.jsonpCallback() :
            s.jsonpCallback;
        overwritten = window[ callbackName ];

        // Insert callback into url or form data
        if ( replaceInUrl ) {
            s.url = url.replace( rjsonp, "$1" + callbackName );
        } else if ( replaceInData ) {
            s.data = data.replace( rjsonp, "$1" + callbackName );
        } else if ( hasCallback ) {
            s.url += ( rquestion.test( url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
        }

        // Use data converter to retrieve json after script execution
        s.converters["script json"] = function() {
            if ( !responseContainer ) {
                jQuery.error( callbackName + " was not called" );
            }
            return responseContainer[ 0 ];
        };

        // force json dataType
        s.dataTypes[ 0 ] = "json";

        // Install callback
        window[ callbackName ] = function() {
            responseContainer = arguments;
        };

        // Clean-up function (fires after converters)
        jqXHR.always(function() {
            // Restore preexisting value
            window[ callbackName ] = overwritten;

            // Save back as free
            if ( s[ callbackName ] ) {
                // make sure that re-using the options doesn't screw things around
                s.jsonpCallback = originalSettings.jsonpCallback;

                // save the callback name for future use
                oldCallbacks.push( callbackName );
            }

            // Call if it was a function and we have a response
            if ( responseContainer && jQuery.isFunction( overwritten ) ) {
                overwritten( responseContainer[ 0 ] );
            }

            responseContainer = overwritten = undefined;
        });

        // Delegate to script
        return "script";
    }
});
// Install script dataType
jQuery.ajaxSetup({
    accepts: {
        script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
    },
    contents: {
        script: /javascript|ecmascript/
    },
    converters: {
        "text script": function( text ) {
            jQuery.globalEval( text );
            return text;
        }
    }
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
    if ( s.cache === undefined ) {
        s.cache = false;
    }
    if ( s.crossDomain ) {
        s.type = "GET";
        s.global = false;
    }
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

    // This transport only deals with cross domain requests
    if ( s.crossDomain ) {

        var script,
            head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

        return {

            send: function( _, callback ) {

                script = document.createElement( "script" );

                script.async = "async";

                if ( s.scriptCharset ) {
                    script.charset = s.scriptCharset;
                }

                script.src = s.url;

                // Attach handlers for all browsers
                script.onload = script.onreadystatechange = function( _, isAbort ) {

                    if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

                        // Handle memory leak in IE
                        script.onload = script.onreadystatechange = null;

                        // Remove the script
                        if ( head && script.parentNode ) {
                            head.removeChild( script );
                        }

                        // Dereference the script
                        script = undefined;

                        // Callback if not abort
                        if ( !isAbort ) {
                            callback( 200, "success" );
                        }
                    }
                };
                // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
                // This arises when a base node is used (#2709 and #4378).
                head.insertBefore( script, head.firstChild );
            },

            abort: function() {
                if ( script ) {
                    script.onload( 0, 1 );
                }
            }
        };
    }
});
var xhrCallbacks,
    // #5280: Internet Explorer will keep connections alive if we don't abort on unload
    xhrOnUnloadAbort = window.ActiveXObject ? function() {
        // Abort all pending requests
        for ( var key in xhrCallbacks ) {
            xhrCallbacks[ key ]( 0, 1 );
        }
    } : false,
    xhrId = 0;

// Functions to create xhrs
function createStandardXHR() {
    try {
        return new window.XMLHttpRequest();
    } catch( e ) {}
}

function createActiveXHR() {
    try {
        return new window.ActiveXObject( "Microsoft.XMLHTTP" );
    } catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
    /* Microsoft failed to properly
     * implement the XMLHttpRequest in IE7 (can't request local files),
     * so we use the ActiveXObject when it is available
     * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
     * we need a fallback.
     */
    function() {
        return !this.isLocal && createStandardXHR() || createActiveXHR();
    } :
    // For all other browsers, use the standard XMLHttpRequest object
    createStandardXHR;

// Determine support properties
(function( xhr ) {
    jQuery.extend( jQuery.support, {
        ajax: !!xhr,
        cors: !!xhr && ( "withCredentials" in xhr )
    });
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

    jQuery.ajaxTransport(function( s ) {
        // Cross domain only allowed if supported through XMLHttpRequest
        if ( !s.crossDomain || jQuery.support.cors ) {

            var callback;

            return {
                send: function( headers, complete ) {

                    // Get a new xhr
                    var handle, i,
                        xhr = s.xhr();

                    // Open the socket
                    // Passing null username, generates a login popup on Opera (#2865)
                    if ( s.username ) {
                        xhr.open( s.type, s.url, s.async, s.username, s.password );
                    } else {
                        xhr.open( s.type, s.url, s.async );
                    }

                    // Apply custom fields if provided
                    if ( s.xhrFields ) {
                        for ( i in s.xhrFields ) {
                            xhr[ i ] = s.xhrFields[ i ];
                        }
                    }

                    // Override mime type if needed
                    if ( s.mimeType && xhr.overrideMimeType ) {
                        xhr.overrideMimeType( s.mimeType );
                    }

                    // X-Requested-With header
                    // For cross-domain requests, seeing as conditions for a preflight are
                    // akin to a jigsaw puzzle, we simply never set it to be sure.
                    // (it can always be set on a per-request basis or even using ajaxSetup)
                    // For same-domain requests, won't change header if already provided.
                    if ( !s.crossDomain && !headers["X-Requested-With"] ) {
                        headers[ "X-Requested-With" ] = "XMLHttpRequest";
                    }

                    // Need an extra try/catch for cross domain requests in Firefox 3
                    try {
                        for ( i in headers ) {
                            xhr.setRequestHeader( i, headers[ i ] );
                        }
                    } catch( _ ) {}

                    // Do send the request
                    // This may raise an exception which is actually
                    // handled in jQuery.ajax (so no try/catch here)
                    xhr.send( ( s.hasContent && s.data ) || null );

                    // Listener
                    callback = function( _, isAbort ) {

                        var status,
                            statusText,
                            responseHeaders,
                            responses,
                            xml;

                        // Firefox throws exceptions when accessing properties
                        // of an xhr when a network error occurred
                        // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
                        try {

                            // Was never called and is aborted or complete
                            if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

                                // Only called once
                                callback = undefined;

                                // Do not keep as active anymore
                                if ( handle ) {
                                    xhr.onreadystatechange = jQuery.noop;
                                    if ( xhrOnUnloadAbort ) {
                                        delete xhrCallbacks[ handle ];
                                    }
                                }

                                // If it's an abort
                                if ( isAbort ) {
                                    // Abort it manually if needed
                                    if ( xhr.readyState !== 4 ) {
                                        xhr.abort();
                                    }
                                } else {
                                    status = xhr.status;
                                    responseHeaders = xhr.getAllResponseHeaders();
                                    responses = {};
                                    xml = xhr.responseXML;

                                    // Construct response list
                                    if ( xml && xml.documentElement /* #4958 */ ) {
                                        responses.xml = xml;
                                    }

                                    // When requesting binary data, IE6-9 will throw an exception
                                    // on any attempt to access responseText (#11426)
                                    try {
                                        responses.text = xhr.responseText;
                                    } catch( _ ) {
                                    }

                                    // Firefox throws an exception when accessing
                                    // statusText for faulty cross-domain requests
                                    try {
                                        statusText = xhr.statusText;
                                    } catch( e ) {
                                        // We normalize with Webkit giving an empty statusText
                                        statusText = "";
                                    }

                                    // Filter status for non standard behaviors

                                    // If the request is local and we have data: assume a success
                                    // (success with no data won't get notified, that's the best we
                                    // can do given current implementations)
                                    if ( !status && s.isLocal && !s.crossDomain ) {
                                        status = responses.text ? 200 : 404;
                                    // IE - #1450: sometimes returns 1223 when it should be 204
                                    } else if ( status === 1223 ) {
                                        status = 204;
                                    }
                                }
                            }
                        } catch( firefoxAccessException ) {
                            if ( !isAbort ) {
                                complete( -1, firefoxAccessException );
                            }
                        }

                        // Call complete if needed
                        if ( responses ) {
                            complete( status, statusText, responses, responseHeaders );
                        }
                    };

                    if ( !s.async ) {
                        // if we're in sync mode we fire the callback
                        callback();
                    } else if ( xhr.readyState === 4 ) {
                        // (IE6 & IE7) if it's in cache and has been
                        // retrieved directly we need to fire the callback
                        setTimeout( callback, 0 );
                    } else {
                        handle = ++xhrId;
                        if ( xhrOnUnloadAbort ) {
                            // Create the active xhrs callbacks list if needed
                            // and attach the unload handler
                            if ( !xhrCallbacks ) {
                                xhrCallbacks = {};
                                jQuery( window ).unload( xhrOnUnloadAbort );
                            }
                            // Add to list of active xhrs callbacks
                            xhrCallbacks[ handle ] = callback;
                        }
                        xhr.onreadystatechange = callback;
                    }
                },

                abort: function() {
                    if ( callback ) {
                        callback(0,1);
                    }
                }
            };
        }
    });
}
var fxNow, timerId,
    rfxtypes = /^(?:toggle|show|hide)$/,
    rfxnum = new RegExp( "^(?:([-+])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
    rrun = /queueHooks$/,
    animationPrefilters = [ defaultPrefilter ],
    tweeners = {
        "*": [function( prop, value ) {
            var end, unit,
                tween = this.createTween( prop, value ),
                parts = rfxnum.exec( value ),
                target = tween.cur(),
                start = +target || 0,
                scale = 1,
                maxIterations = 20;

            if ( parts ) {
                end = +parts[2];
                unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

                // We need to compute starting value
                if ( unit !== "px" && start ) {
                    // Iteratively approximate from a nonzero starting point
                    // Prefer the current property, because this process will be trivial if it uses the same units
                    // Fallback to end or a simple constant
                    start = jQuery.css( tween.elem, prop, true ) || end || 1;

                    do {
                        // If previous iteration zeroed out, double until we get *something*
                        // Use a string for doubling factor so we don't accidentally see scale as unchanged below
                        scale = scale || ".5";

                        // Adjust and apply
                        start = start / scale;
                        jQuery.style( tween.elem, prop, start + unit );

                    // Update scale, tolerating zero or NaN from tween.cur()
                    // And breaking the loop if scale is unchanged or perfect, or if we've just had enough
                    } while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
                }

                tween.unit = unit;
                tween.start = start;
                // If a +=/-= token was provided, we're doing a relative animation
                tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
            }
            return tween;
        }]
    };

// Animations created synchronously will run synchronously
function createFxNow() {
    setTimeout(function() {
        fxNow = undefined;
    }, 0 );
    return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
    jQuery.each( props, function( prop, value ) {
        var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
            index = 0,
            length = collection.length;
        for ( ; index < length; index++ ) {
            if ( collection[ index ].call( animation, prop, value ) ) {

                // we're done with this property
                return;
            }
        }
    });
}

function Animation( elem, properties, options ) {
    var result,
        index = 0,
        tweenerIndex = 0,
        length = animationPrefilters.length,
        deferred = jQuery.Deferred().always( function() {
            // don't match elem in the :animated selector
            delete tick.elem;
        }),
        tick = function() {
            var currentTime = fxNow || createFxNow(),
                remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
                percent = 1 - ( remaining / animation.duration || 0 ),
                index = 0,
                length = animation.tweens.length;

            for ( ; index < length ; index++ ) {
                animation.tweens[ index ].run( percent );
            }

            deferred.notifyWith( elem, [ animation, percent, remaining ]);

            if ( percent < 1 && length ) {
                return remaining;
            } else {
                deferred.resolveWith( elem, [ animation ] );
                return false;
            }
        },
        animation = deferred.promise({
            elem: elem,
            props: jQuery.extend( {}, properties ),
            opts: jQuery.extend( true, { specialEasing: {} }, options ),
            originalProperties: properties,
            originalOptions: options,
            startTime: fxNow || createFxNow(),
            duration: options.duration,
            tweens: [],
            createTween: function( prop, end, easing ) {
                var tween = jQuery.Tween( elem, animation.opts, prop, end,
                        animation.opts.specialEasing[ prop ] || animation.opts.easing );
                animation.tweens.push( tween );
                return tween;
            },
            stop: function( gotoEnd ) {
                var index = 0,
                    // if we are going to the end, we want to run all the tweens
                    // otherwise we skip this part
                    length = gotoEnd ? animation.tweens.length : 0;

                for ( ; index < length ; index++ ) {
                    animation.tweens[ index ].run( 1 );
                }

                // resolve when we played the last frame
                // otherwise, reject
                if ( gotoEnd ) {
                    deferred.resolveWith( elem, [ animation, gotoEnd ] );
                } else {
                    deferred.rejectWith( elem, [ animation, gotoEnd ] );
                }
                return this;
            }
        }),
        props = animation.props;

    propFilter( props, animation.opts.specialEasing );

    for ( ; index < length ; index++ ) {
        result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
        if ( result ) {
            return result;
        }
    }

    createTweens( animation, props );

    if ( jQuery.isFunction( animation.opts.start ) ) {
        animation.opts.start.call( elem, animation );
    }

    jQuery.fx.timer(
        jQuery.extend( tick, {
            anim: animation,
            queue: animation.opts.queue,
            elem: elem
        })
    );

    // attach callbacks from options
    return animation.progress( animation.opts.progress )
        .done( animation.opts.done, animation.opts.complete )
        .fail( animation.opts.fail )
        .always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
    var index, name, easing, value, hooks;

    // camelCase, specialEasing and expand cssHook pass
    for ( index in props ) {
        name = jQuery.camelCase( index );
        easing = specialEasing[ name ];
        value = props[ index ];
        if ( jQuery.isArray( value ) ) {
            easing = value[ 1 ];
            value = props[ index ] = value[ 0 ];
        }

        if ( index !== name ) {
            props[ name ] = value;
            delete props[ index ];
        }

        hooks = jQuery.cssHooks[ name ];
        if ( hooks && "expand" in hooks ) {
            value = hooks.expand( value );
            delete props[ name ];

            // not quite $.extend, this wont overwrite keys already present.
            // also - reusing 'index' from above because we have the correct "name"
            for ( index in value ) {
                if ( !( index in props ) ) {
                    props[ index ] = value[ index ];
                    specialEasing[ index ] = easing;
                }
            }
        } else {
            specialEasing[ name ] = easing;
        }
    }
}

jQuery.Animation = jQuery.extend( Animation, {

    tweener: function( props, callback ) {
        if ( jQuery.isFunction( props ) ) {
            callback = props;
            props = [ "*" ];
        } else {
            props = props.split(" ");
        }

        var prop,
            index = 0,
            length = props.length;

        for ( ; index < length ; index++ ) {
            prop = props[ index ];
            tweeners[ prop ] = tweeners[ prop ] || [];
            tweeners[ prop ].unshift( callback );
        }
    },

    prefilter: function( callback, prepend ) {
        if ( prepend ) {
            animationPrefilters.unshift( callback );
        } else {
            animationPrefilters.push( callback );
        }
    }
});

function defaultPrefilter( elem, props, opts ) {
    var index, prop, value, length, dataShow, tween, hooks, oldfire,
        anim = this,
        style = elem.style,
        orig = {},
        handled = [],
        hidden = elem.nodeType && isHidden( elem );

    // handle queue: false promises
    if ( !opts.queue ) {
        hooks = jQuery._queueHooks( elem, "fx" );
        if ( hooks.unqueued == null ) {
            hooks.unqueued = 0;
            oldfire = hooks.empty.fire;
            hooks.empty.fire = function() {
                if ( !hooks.unqueued ) {
                    oldfire();
                }
            };
        }
        hooks.unqueued++;

        anim.always(function() {
            // doing this makes sure that the complete handler will be called
            // before this completes
            anim.always(function() {
                hooks.unqueued--;
                if ( !jQuery.queue( elem, "fx" ).length ) {
                    hooks.empty.fire();
                }
            });
        });
    }

    // height/width overflow pass
    if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
        // Make sure that nothing sneaks out
        // Record all 3 overflow attributes because IE does not
        // change the overflow attribute when overflowX and
        // overflowY are set to the same value
        opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

        // Set display property to inline-block for height/width
        // animations on inline elements that are having width/height animated
        if ( jQuery.css( elem, "display" ) === "inline" &&
                jQuery.css( elem, "float" ) === "none" ) {

            // inline-level elements accept inline-block;
            // block-level elements need to be inline with layout
            if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
                style.display = "inline-block";

            } else {
                style.zoom = 1;
            }
        }
    }

    if ( opts.overflow ) {
        style.overflow = "hidden";
        if ( !jQuery.support.shrinkWrapBlocks ) {
            anim.done(function() {
                style.overflow = opts.overflow[ 0 ];
                style.overflowX = opts.overflow[ 1 ];
                style.overflowY = opts.overflow[ 2 ];
            });
        }
    }


    // show/hide pass
    for ( index in props ) {
        value = props[ index ];
        if ( rfxtypes.exec( value ) ) {
            delete props[ index ];
            if ( value === ( hidden ? "hide" : "show" ) ) {
                continue;
            }
            handled.push( index );
        }
    }

    length = handled.length;
    if ( length ) {
        dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
        if ( hidden ) {
            jQuery( elem ).show();
        } else {
            anim.done(function() {
                jQuery( elem ).hide();
            });
        }
        anim.done(function() {
            var prop;
            jQuery.removeData( elem, "fxshow", true );
            for ( prop in orig ) {
                jQuery.style( elem, prop, orig[ prop ] );
            }
        });
        for ( index = 0 ; index < length ; index++ ) {
            prop = handled[ index ];
            tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
            orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

            if ( !( prop in dataShow ) ) {
                dataShow[ prop ] = tween.start;
                if ( hidden ) {
                    tween.end = tween.start;
                    tween.start = prop === "width" || prop === "height" ? 1 : 0;
                }
            }
        }
    }
}

function Tween( elem, options, prop, end, easing ) {
    return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
    constructor: Tween,
    init: function( elem, options, prop, end, easing, unit ) {
        this.elem = elem;
        this.prop = prop;
        this.easing = easing || "swing";
        this.options = options;
        this.start = this.now = this.cur();
        this.end = end;
        this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
    },
    cur: function() {
        var hooks = Tween.propHooks[ this.prop ];

        return hooks && hooks.get ?
            hooks.get( this ) :
            Tween.propHooks._default.get( this );
    },
    run: function( percent ) {
        var eased,
            hooks = Tween.propHooks[ this.prop ];

        if ( this.options.duration ) {
            this.pos = eased = jQuery.easing[ this.easing ](
                percent, this.options.duration * percent, 0, 1, this.options.duration
            );
        } else {
            this.pos = eased = percent;
        }
        this.now = ( this.end - this.start ) * eased + this.start;

        if ( this.options.step ) {
            this.options.step.call( this.elem, this.now, this );
        }

        if ( hooks && hooks.set ) {
            hooks.set( this );
        } else {
            Tween.propHooks._default.set( this );
        }
        return this;
    }
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
    _default: {
        get: function( tween ) {
            var result;

            if ( tween.elem[ tween.prop ] != null &&
                (!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
                return tween.elem[ tween.prop ];
            }

            // passing any value as a 4th parameter to .css will automatically
            // attempt a parseFloat and fallback to a string if the parse fails
            // so, simple values such as "10px" are parsed to Float.
            // complex values such as "rotate(1rad)" are returned as is.
            result = jQuery.css( tween.elem, tween.prop, false, "" );
            // Empty strings, null, undefined and "auto" are converted to 0.
            return !result || result === "auto" ? 0 : result;
        },
        set: function( tween ) {
            // use step hook for back compat - use cssHook if its there - use .style if its
            // available and use plain properties where available
            if ( jQuery.fx.step[ tween.prop ] ) {
                jQuery.fx.step[ tween.prop ]( tween );
            } else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
                jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
            } else {
                tween.elem[ tween.prop ] = tween.now;
            }
        }
    }
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
    set: function( tween ) {
        if ( tween.elem.nodeType && tween.elem.parentNode ) {
            tween.elem[ tween.prop ] = tween.now;
        }
    }
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
    var cssFn = jQuery.fn[ name ];
    jQuery.fn[ name ] = function( speed, easing, callback ) {
        return speed == null || typeof speed === "boolean" ||
            // special check for .toggle( handler, handler, ... )
            ( !i && jQuery.isFunction( speed ) && jQuery.isFunction( easing ) ) ?
            cssFn.apply( this, arguments ) :
            this.animate( genFx( name, true ), speed, easing, callback );
    };
});

jQuery.fn.extend({
    fadeTo: function( speed, to, easing, callback ) {

        // show any hidden elements after setting opacity to 0
        return this.filter( isHidden ).css( "opacity", 0 ).show()

            // animate to the value specified
            .end().animate({ opacity: to }, speed, easing, callback );
    },
    animate: function( prop, speed, easing, callback ) {
        var empty = jQuery.isEmptyObject( prop ),
            optall = jQuery.speed( speed, easing, callback ),
            doAnimation = function() {
                // Operate on a copy of prop so per-property easing won't be lost
                var anim = Animation( this, jQuery.extend( {}, prop ), optall );

                // Empty animations resolve immediately
                if ( empty ) {
                    anim.stop( true );
                }
            };

        return empty || optall.queue === false ?
            this.each( doAnimation ) :
            this.queue( optall.queue, doAnimation );
    },
    stop: function( type, clearQueue, gotoEnd ) {
        var stopQueue = function( hooks ) {
            var stop = hooks.stop;
            delete hooks.stop;
            stop( gotoEnd );
        };

        if ( typeof type !== "string" ) {
            gotoEnd = clearQueue;
            clearQueue = type;
            type = undefined;
        }
        if ( clearQueue && type !== false ) {
            this.queue( type || "fx", [] );
        }

        return this.each(function() {
            var dequeue = true,
                index = type != null && type + "queueHooks",
                timers = jQuery.timers,
                data = jQuery._data( this );

            if ( index ) {
                if ( data[ index ] && data[ index ].stop ) {
                    stopQueue( data[ index ] );
                }
            } else {
                for ( index in data ) {
                    if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
                        stopQueue( data[ index ] );
                    }
                }
            }

            for ( index = timers.length; index--; ) {
                if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
                    timers[ index ].anim.stop( gotoEnd );
                    dequeue = false;
                    timers.splice( index, 1 );
                }
            }

            // start the next in the queue if the last step wasn't forced
            // timers currently will call their complete callbacks, which will dequeue
            // but only if they were gotoEnd
            if ( dequeue || !gotoEnd ) {
                jQuery.dequeue( this, type );
            }
        });
    }
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
    var which,
        attrs = { height: type },
        i = 0;

    // if we include width, step value is 1 to do all cssExpand values,
    // if we don't include width, step value is 2 to skip over Left and Right
    includeWidth = includeWidth? 1 : 0;
    for( ; i < 4 ; i += 2 - includeWidth ) {
        which = cssExpand[ i ];
        attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
    }

    if ( includeWidth ) {
        attrs.opacity = attrs.width = type;
    }

    return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
    slideDown: genFx("show"),
    slideUp: genFx("hide"),
    slideToggle: genFx("toggle"),
    fadeIn: { opacity: "show" },
    fadeOut: { opacity: "hide" },
    fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
    jQuery.fn[ name ] = function( speed, easing, callback ) {
        return this.animate( props, speed, easing, callback );
    };
});

jQuery.speed = function( speed, easing, fn ) {
    var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
        complete: fn || !fn && easing ||
            jQuery.isFunction( speed ) && speed,
        duration: speed,
        easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
    };

    opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
        opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

    // normalize opt.queue - true/undefined/null -> "fx"
    if ( opt.queue == null || opt.queue === true ) {
        opt.queue = "fx";
    }

    // Queueing
    opt.old = opt.complete;

    opt.complete = function() {
        if ( jQuery.isFunction( opt.old ) ) {
            opt.old.call( this );
        }

        if ( opt.queue ) {
            jQuery.dequeue( this, opt.queue );
        }
    };

    return opt;
};

jQuery.easing = {
    linear: function( p ) {
        return p;
    },
    swing: function( p ) {
        return 0.5 - Math.cos( p*Math.PI ) / 2;
    }
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
    var timer,
        timers = jQuery.timers,
        i = 0;

    for ( ; i < timers.length; i++ ) {
        timer = timers[ i ];
        // Checks the timer has not already been removed
        if ( !timer() && timers[ i ] === timer ) {
            timers.splice( i--, 1 );
        }
    }

    if ( !timers.length ) {
        jQuery.fx.stop();
    }
};

jQuery.fx.timer = function( timer ) {
    if ( timer() && jQuery.timers.push( timer ) && !timerId ) {
        timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
    }
};

jQuery.fx.interval = 13;

jQuery.fx.stop = function() {
    clearInterval( timerId );
    timerId = null;
};

jQuery.fx.speeds = {
    slow: 600,
    fast: 200,
    // Default speed
    _default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
    jQuery.expr.filters.animated = function( elem ) {
        return jQuery.grep(jQuery.timers, function( fn ) {
            return elem === fn.elem;
        }).length;
    };
}
var rroot = /^(?:body|html)$/i;

jQuery.fn.offset = function( options ) {
    if ( arguments.length ) {
        return options === undefined ?
            this :
            this.each(function( i ) {
                jQuery.offset.setOffset( this, options, i );
            });
    }

    var docElem, body, win, clientTop, clientLeft, scrollTop, scrollLeft,
        box = { top: 0, left: 0 },
        elem = this[ 0 ],
        doc = elem && elem.ownerDocument;

    if ( !doc ) {
        return;
    }

    if ( (body = doc.body) === elem ) {
        return jQuery.offset.bodyOffset( elem );
    }

    docElem = doc.documentElement;

    // Make sure it's not a disconnected DOM node
    if ( !jQuery.contains( docElem, elem ) ) {
        return box;
    }

    // If we don't have gBCR, just use 0,0 rather than error
    // BlackBerry 5, iOS 3 (original iPhone)
    if ( typeof elem.getBoundingClientRect !== "undefined" ) {
        box = elem.getBoundingClientRect();
    }
    win = getWindow( doc );
    clientTop  = docElem.clientTop  || body.clientTop  || 0;
    clientLeft = docElem.clientLeft || body.clientLeft || 0;
    scrollTop  = win.pageYOffset || docElem.scrollTop;
    scrollLeft = win.pageXOffset || docElem.scrollLeft;
    return {
        top: box.top  + scrollTop  - clientTop,
        left: box.left + scrollLeft - clientLeft
    };
};

jQuery.offset = {

    bodyOffset: function( body ) {
        var top = body.offsetTop,
            left = body.offsetLeft;

        if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
            top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
            left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
        }

        return { top: top, left: left };
    },

    setOffset: function( elem, options, i ) {
        var position = jQuery.css( elem, "position" );

        // set position first, in-case top/left are set even on static elem
        if ( position === "static" ) {
            elem.style.position = "relative";
        }

        var curElem = jQuery( elem ),
            curOffset = curElem.offset(),
            curCSSTop = jQuery.css( elem, "top" ),
            curCSSLeft = jQuery.css( elem, "left" ),
            calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
            props = {}, curPosition = {}, curTop, curLeft;

        // need to be able to calculate position if either top or left is auto and position is either absolute or fixed
        if ( calculatePosition ) {
            curPosition = curElem.position();
            curTop = curPosition.top;
            curLeft = curPosition.left;
        } else {
            curTop = parseFloat( curCSSTop ) || 0;
            curLeft = parseFloat( curCSSLeft ) || 0;
        }

        if ( jQuery.isFunction( options ) ) {
            options = options.call( elem, i, curOffset );
        }

        if ( options.top != null ) {
            props.top = ( options.top - curOffset.top ) + curTop;
        }
        if ( options.left != null ) {
            props.left = ( options.left - curOffset.left ) + curLeft;
        }

        if ( "using" in options ) {
            options.using.call( elem, props );
        } else {
            curElem.css( props );
        }
    }
};


jQuery.fn.extend({

    position: function() {
        if ( !this[0] ) {
            return;
        }

        var elem = this[0],

        // Get *real* offsetParent
        offsetParent = this.offsetParent(),

        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

        // Subtract element margins
        // note: when an element has margin: auto the offsetLeft and marginLeft
        // are the same in Safari causing offset.left to incorrectly be 0
        offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
        offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

        // Add offsetParent borders
        parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
        parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

        // Subtract the two offsets
        return {
            top:  offset.top  - parentOffset.top,
            left: offset.left - parentOffset.left
        };
    },

    offsetParent: function() {
        return this.map(function() {
            var offsetParent = this.offsetParent || document.body;
            while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
                offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || document.body;
        });
    }
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
    var top = /Y/.test( prop );

    jQuery.fn[ method ] = function( val ) {
        return jQuery.access( this, function( elem, method, val ) {
            var win = getWindow( elem );

            if ( val === undefined ) {
                return win ? (prop in win) ? win[ prop ] :
                    win.document.documentElement[ method ] :
                    elem[ method ];
            }

            if ( win ) {
                win.scrollTo(
                    !top ? val : jQuery( win ).scrollLeft(),
                     top ? val : jQuery( win ).scrollTop()
                );

            } else {
                elem[ method ] = val;
            }
        }, method, val, arguments.length, null );
    };
});

function getWindow( elem ) {
    return jQuery.isWindow( elem ) ?
        elem :
        elem.nodeType === 9 ?
            elem.defaultView || elem.parentWindow :
            false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
    jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
        // margin is only for outerHeight, outerWidth
        jQuery.fn[ funcName ] = function( margin, value ) {
            var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
                extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

            return jQuery.access( this, function( elem, type, value ) {
                var doc;

                if ( jQuery.isWindow( elem ) ) {
                    // As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
                    // isn't a whole lot we can do. See pull request at this URL for discussion:
                    // https://github.com/jquery/jquery/pull/764
                    return elem.document.documentElement[ "client" + name ];
                }

                // Get document width or height
                if ( elem.nodeType === 9 ) {
                    doc = elem.documentElement;

                    // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
                    // unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
                    return Math.max(
                        elem.body[ "scroll" + name ], doc[ "scroll" + name ],
                        elem.body[ "offset" + name ], doc[ "offset" + name ],
                        doc[ "client" + name ]
                    );
                }

                return value === undefined ?
                    // Get width or height on the element, requesting but not forcing parseFloat
                    jQuery.css( elem, type, value, extra ) :

                    // Set width or height on the element
                    jQuery.style( elem, type, value, extra );
            }, type, chainable ? margin : undefined, chainable, null );
        };
    });
});
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
    define( "jquery", [], function () { return jQuery; } );
}

})( window );jQuery.extend({
    isFullscreen : function () {
        return document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
    },
    cancelFullscreen : function () {
        var cancelFullscreenAPI = document.exitFullscreen || document.mozCancelFullScreen || document.webkitCancelFullScreen;
        if (cancelFullscreenAPI) {
            cancelFullscreenAPI.call(document);
            return true;
        } else {
            return false;
        }
    },
    fullscreen : function () {
        var docElm = document.documentElement,
            fullscreenAPI = docElm.requestFullscreen || docElm.mozRequestFullScreen || docElm.webkitRequestFullScreen;
        if (fullscreenAPI) {
            fullscreenAPI.call(docElm, Element && Element.ALLOW_KEYBOARD_INPUT);
            return true;
        }
        return false;
    },
    toggleFullscreen : function () {
        return this.isFullscreen() ? this.cancelFullscreen() : this.fullscreen();
    }
});

jQuery.extend({
    upperCaseFirst : function (s) {
        return s.charAt(0).toUpperCase() + s.substring(1);
    }
});

jQuery.extend({
    move : function (array, pos, to) {
        array.splice(to, 0, array.splice(pos, 1)[0]);
        return array;
    }
});(function ($) {
    $.extend({
        cookie : function(name, value, options) {  
            if (typeof value != 'undefined') { // name and value given, set cookie  
                options = options || {};  
                if (value === null) {  
                    value = '';  
                    options.expires = -1;  
                }  
                var expires = '';  
                if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {  
                    var date;  
                    if (typeof options.expires == 'number') {  
                        date = new Date();  
                        date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));  
                    } else {  
                        date = options.expires;  
                    }  
                    expires = '; expires=' + date.toUTCString();  
                }  
                var path = options.path ? '; path=' + (options.path) : '';  
                var domain = options.domain ? '; domain=' + (options.domain) : '';  
                var secure = options.secure ? '; secure' : '';  
                document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');  
            } else {  
                var cookieValue = null;  
                if (document.cookie && document.cookie != '') {  
                    var cookies = document.cookie.split(';');  
                    for (var i = 0; i < cookies.length; i++) {  
                        var cookie = jQuery.trim(cookies[i]);  
                        if (cookie.substring(0, name.length + 1) == (name + '=')) {  
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));  
                            break;  
                        }  
                    }  
                }  
                return cookieValue;  
            }  
        }
    });
})(jQuery);(function ($) {
    $.extend({
        'responseParser' : function (data, success, fail) {
            switch (data.status) {
                case 0 : 
                    success && success(data.data, data);
                    break;
                case 1 : 
                    fail && fail(data.statusInfo, data);
                    break;
                case 2 : 
                    pandora.tipBox.show((data.statusInfo && data.statusInfo.global) || '未知错误，请重试', 2);
                    fail && fail(data.statusInfo, data);
                    break;
                case 126 :
                    pandora.tipBox.show('您没有此操作权限，请您使用更高权限的账号登录', 1); 
                    break;
                case 127 : 
                    pandora.tipBox.show('您尚未登录，请登录后请重新执行操作。', 1);
                    pandora.loginBox.open();
                    break;
                default : break;
            }
        }
    });
})(jQuery);(function ($) {
    $.extend({
        'centerImage' : function (w, h, maxW, maxH) {
            maxW = maxW || 80;
            maxH = maxH || 60;
            if(w < maxW && h < maxH){
                return {'w' : w, 'h' : h, 'wp' : ((maxW - w) / 2), 'hp' : ((maxH - h) / 2) };
            }
            var tw = Math.floor(maxH * w / h),
                th = Math.floor(maxW * h / w),
                hpadding = 0,
                wpadding = 0;
            tw < maxW ? (th = maxH) : (tw = maxW); 
            tw < maxW ? (wpadding = (maxW - tw) / 2) : (wpadding = 0);
            th < maxH ? (hpadding = (maxH - th) / 2) : (hpadding = 0);
            return {'w' : tw, 'h' : th, 'wp' : wpadding, 'hp' : hpadding};
        },
        'imageScaleAsync' : function (src, maxW, maxH, cb) {
            var img = new Image(),
                w,
                h;
            img.onload = function () {
                w = img.width > maxW ? maxW : img.width;
                h = w * img.height / img.width;

                if (h > maxH) {
                    h = maxH;
                    w = h * img.height / img.width;
                }
                cb(src, w, h);
            };
            img.src = src;
        },
        'imageScale' : function (width, height, maxW, maxH) {
            var w = width > maxW ? maxW : width,
                h = w * height / width;

            if (h > maxH) {
                h = maxH;
                w = h * height / width;
            }
            return {width : w, height : h};
        }
    });
})(jQuery);(function ($) {
	$.extend({
		encodeHTML : function (s) {
	        return 'string' === typeof s ? s.replace(/&/g,'&')
                    .replace(/</g,'<')
                    .replace(/>/g,'>')
                    .replace(/"/g, "\"")
                    .replace(/'/g, "'") : s;
		},
		swfVersion : (function () {
		    var n = navigator;
		    if (n.plugins && n.mimeTypes.length) {
		        var plugin = n.plugins["Shockwave Flash"];
		        if (plugin && plugin.description) {
		            return plugin.description
		                    .replace(/([a-zA-Z]|\s)+/, "")
		                    .replace(/(\s)+r/, ".") + ".0";
		        }
		    } else if (window.ActiveXObject && !window.opera) {
		        for (var i = 12; i >= 2; i--) {
		            try {
		                var c = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.' + i);
		                if (c) {
		                    var version = c.GetVariable("$version");
		                    return version.replace(/WIN/g,'').replace(/,/g,'.');
		                }
		            } catch(e) {}
		        }
		    }
		})(),
		createSwfHTML : function (options) {
		    options = options || {};
		    var version = $.swfVersion, 
		        needVersion = options['ver'] || '6.0.0', 
		        vUnit1, vUnit2, i, k, len, item, tmpOpt = {},
		        encodeHTML = $.encodeHTML;
		     
		    // 复制options，避免修改原对象
		    for (k in options) {
		        tmpOpt[k] = options[k];
		    }
		    options = tmpOpt;
		     
		    // 浏览器支持的flash插件版本判断
		    if (version) {
		        version = version.split('.');
		        needVersion = needVersion.split('.');
		        for (i = 0; i < 3; i++) {
		            vUnit1 = parseInt(version[i], 10);
		            vUnit2 = parseInt(needVersion[i], 10);
		            if (vUnit2 < vUnit1) {
		                break;
		            } else if (vUnit2 > vUnit1) {
		                return ''; // 需要更高的版本号
		            }
		        }
		    } else {
		        return ''; // 未安装flash插件
		    }
		     
		    var vars = options['vars'],
		        objProperties = ['classid', 'codebase', 'id', 'width', 'height', 'align'];
		     
		    // 初始化object标签需要的classid、codebase属性值
		    options['align'] = options['align'] || 'middle';
		    options['classid'] = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
		    options['codebase'] = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0';
		    options['movie'] = options['url'] || '';
		    delete options['vars'];
		    delete options['url'];
		     
		    // 初始化flashvars参数的值
		    if ('string' == typeof vars) {
		        options['flashvars'] = vars;
		    } else {
		        var fvars = [];
		        for (k in vars) {
		            item = vars[k];
		            fvars.push(k + "=" + encodeURIComponent(item));
		        }
		        options['flashvars'] = fvars.join('&');
		    }
		     
		    // 构建IE下支持的object字符串，包括属性和参数列表
		    var str = ['<object '];
		    for (i = 0, len = objProperties.length; i < len; i++) {
		        item = objProperties[i];
		        str.push(' ', item, '="', encodeHTML(options[item]), '"');
		    }
		    str.push('>');
		    var params = {
		        'wmode'             : 1,
		        'scale'             : 1,
		        'quality'           : 1,
		        'play'              : 1,
		        'loop'              : 1,
		        'menu'              : 1,
		        'salign'            : 1,
		        'bgcolor'           : 1,
		        'base'              : 1,
		        'allowscriptaccess' : 1,
		        'allownetworking'   : 1,
		        'allowfullscreen'   : 1,
		        'seamlesstabbing'   : 1,
		        'devicefont'        : 1,
		        'swliveconnect'     : 1,
		        'flashvars'         : 1,
		        'movie'             : 1
		    };
		     
		    for (k in options) {
		        item = options[k];
		        k = k.toLowerCase();
		        if (params[k] && (item || item === false || item === 0)) {
		            str.push('<param name="' + k + '" value="' + encodeHTML(item) + '" />');
		        }
		    }
		     
		    // 使用embed时，flash地址的属性名是src，并且要指定embed的type和pluginspage属性
		    options['src']  = options['movie'];
		    options['name'] = options['id'];
		    delete options['id'];
		    delete options['movie'];
		    delete options['classid'];
		    delete options['codebase'];
		    options['type'] = 'application/x-shockwave-flash';
		    options['pluginspage'] = 'http://www.macromedia.com/go/getflashplayer';
		     
		    // 构建embed标签的字符串
		    str.push('<embed');
		    // 在firefox、opera、safari下，salign属性必须在scale属性之后，否则会失效
		    // 经过讨论，决定采用BT方法，把scale属性的值先保存下来，最后输出
		    var salign;
		    for (k in options) {
		        item = options[k];
		        if (item || item === false || item === 0) {
		            if ((new RegExp("^salign\x24", "i")).test(k)) {
		                salign = item;
		                continue;
		            }
		             
		            str.push(' ', k, '="', encodeHTML(item), '"');
		        }
		    }
		     
		    if (salign) {
		        str.push(' salign="', encodeHTML(salign), '"');
		    }
		    str.push('></embed></object>');
		     
		    return str.join('');
		}
	});

	$.swf = {};
	$.extend($.swf, {
		getMovie : function (name) {
		    //ie9下, Object标签和embed标签嵌套的方式生成flash时,
		    //会导致document[name]多返回一个Object元素,而起作用的只有embed标签
		    var movie = document[name];
		   	if ($.browser.msie && parseInt($.browser.version.split('.')[0], 10) == 9) {
		   		if (movie && movie.length) {
		   			var ret = [];
		   			$.each($.toArray(movie), function (i, item) {
		   				if (item.tagName.toLowerCase() == 'embed') {
		   					ret.push(item);
		   				}
		   			});
		   			movie = ret[0];
		   		}
		   	}
		   	return movie || window[name];
		}
	});
})(jQuery);(function ($) {
	$.extend({
		getPar : function (key) { 
	        var s = window.location.search.substring(1).split("&"),
	        	_s,
	        	i = 0;
	        while (_s = s[i++]) {
	       		_s = _s.split('=');
	       		if (_s[0] === key) {
	       			return _s[1];
	       		}
	       	}
	        return null;
	    }
	});
})(jQuery);(function ($) {
    $.json = {};
    $.extend($.json, {
        parse : $.parseJSON,
        stringify : (function () {    
            var escapeMap = {
                "\b": '\\b',
                "\t": '\\t',
                "\n": '\\n',
                "\f": '\\f',
                "\r": '\\r',
                '"' : '\\"',
                "\\": '\\\\'
            };
             
            function encodeString(source) {
                if (/["\\\x00-\x1f]/.test(source)) {
                    source = source.replace(
                        /["\\\x00-\x1f]/g, 
                        function (match) {
                            var c = escapeMap[match];
                            if (c) {
                                return c;
                            }
                            c = match.charCodeAt();
                            return "\\u00"
                                    + Math.floor(c / 16).toString(16) 
                                    + (c % 16).toString(16);
                        });
                }
                return '"' + source + '"';
            }
             
            function encodeArray(source) {
                var result = ["["], 
                    l = source.length,
                    preComma, i, item;
                     
                for (i = 0; i < l; i++) {
                    item = source[i];
                     
                    switch (typeof item) {
                    case "undefined":
                    case "function":
                    case "unknown":
                        break;
                    default:
                        if(preComma) {
                            result.push(',');
                        }
                        result.push($.json.stringify(item));
                        preComma = 1;
                    }
                }
                result.push("]");
                return result.join("");
            }
             
            function pad(source) {
                return source < 10 ? '0' + source : source;
            }
             
            function encodeDate(source){
                return '"' + source.getFullYear() + "-" 
                        + pad(source.getMonth() + 1) + "-" 
                        + pad(source.getDate()) + "T" 
                        + pad(source.getHours()) + ":" 
                        + pad(source.getMinutes()) + ":" 
                        + pad(source.getSeconds()) + '"';
            }
             
            return ('undefined' !== typeof JSON && JSON.stringify) || function (value) {
                switch (typeof value) {
                    case 'undefined':
                        return 'undefined';
                         
                    case 'number':
                        return isFinite(value) ? String(value) : "null";
                         
                    case 'string':
                        return encodeString(value);
                         
                    case 'boolean':
                        return String(value);
                         
                    default:
                        if (value === null) {
                            return 'null';
                        } else if ($.isArray(value)) {
                            return encodeArray(value);
                        } else {
                            var result = ['{'],
                                encode = $.json.stringify,
                                preComma,
                                item;
                                 
                            for (var key in value) {
                                if (Object.prototype.hasOwnProperty.call(value, key)) {
                                    item = value[key];
                                    switch (typeof item) {
                                    case 'undefined':
                                    case 'unknown':
                                    case 'function':
                                        break;
                                    default:
                                        if (preComma) {
                                            result.push(',');
                                        }
                                        preComma = 1;
                                        result.push(encode(key) + ':' + encode(item));
                                    }
                                }
                            }
                            result.push('}');
                            return result.join('');
                        }
                    }
                };
            }
        )()
    });
})(jQuery);(function($) {
	$.fn.insertAtCaret = function (str) {
		return this.each(function () {
			if (document.selection) {
				//IE support
				this.focus();
				document.selection.createRange().text = str;
				this.focus();
			} else if (this.selectionStart || this.selectionStart == '0') {
				//MOZILLA/NETSCAPE support
				var startPos = this.selectionStart,
					endPos = this.selectionEnd,
					scrollTop = this.scrollTop;
				this.value = this.value.substring(0, startPos) + str + this.value.substring(endPos, this.value.length);
				this.focus();
				this.selectionStart = startPos + str.length;
				this.selectionEnd = startPos + str.length;
				this.scrollTop = scrollTop;
			} else {
				this.value += str;
				this.focus();
			}
		});
	};
})(jQuery);(function ($) {
	$.fn.rotate = function(angle,whence) {
		var p = this.get(0);

		// we store the angle inside the image tag for persistence
		if (!whence) {
			p.angle = ((p.angle==undefined?0:p.angle) + angle) % 360;
		} else {
			p.angle = angle;
		}

		if (p.angle >= 0) {
			var rotation = Math.PI * p.angle / 180;
		} else {
			var rotation = Math.PI * (360+p.angle) / 180;
		}
		var costheta = Math.round(Math.cos(rotation) * 1000) / 1000;
		var sintheta = Math.round(Math.sin(rotation) * 1000) / 1000;
		//alert(costheta+","+sintheta);
	 
		if (document.all && !window.opera) {
			var canvas = document.createElement('img');

			canvas.src = p.src;
			canvas.height = p.height;
			canvas.width = p.width;

			canvas.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11="+costheta+",M12="+(-sintheta)+",M21="+sintheta+",M22="+costheta+",SizingMethod='auto expand')";
		} else {
			var canvas = document.createElement('canvas');
			if (!p.oImage) {
				canvas.oImage = new Image();
				canvas.oImage.src = p.src;
			} else {
				canvas.oImage = p.oImage;
			}

			canvas.style.width = canvas.width = Math.abs(costheta*canvas.oImage.width) + Math.abs(sintheta*canvas.oImage.height);
			canvas.style.height = canvas.height = Math.abs(costheta*canvas.oImage.height) + Math.abs(sintheta*canvas.oImage.width);

			var context = canvas.getContext('2d');
			context.save();
			if (rotation <= Math.PI/2) {
				context.translate(sintheta*canvas.oImage.height,0);
			} else if (rotation <= Math.PI) {
				context.translate(canvas.width,-costheta*canvas.oImage.height);
			} else if (rotation <= 1.5*Math.PI) {
				context.translate(-costheta*canvas.oImage.width,canvas.height);
			} else {
				context.translate(0,-sintheta*canvas.oImage.width);
			}
			context.rotate(rotation);
			context.drawImage(canvas.oImage, 0, 0, canvas.oImage.width, canvas.oImage.height);
			context.restore();
		}
		canvas.id = p.id;
		canvas.angle = p.angle;
		p.parentNode.replaceChild(canvas, p);
	}

	$.fn.rotateRight = function(angle) {
		this.rotate(angle==undefined?90:angle);
	}

	$.fn.rotateLeft = function(angle) {
		this.rotate(angle==undefined?-90:-angle);
	}
})(jQuery);(function( $, undefined ) {

var uuid = 0,
	runiqueId = /^ui-id-\d+$/;

// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.ui = $.ui || {};
if ( $.ui.version ) {
	return;
}

$.extend( $.ui, {
	version: "@VERSION",

	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	}
});

// plugins
$.fn.extend({
	_focus: $.fn.focus,
	focus: function( delay, fn ) {
		return typeof delay === "number" ?
			this.each(function() {
				var elem = this;
				setTimeout(function() {
					$( elem ).focus();
					if ( fn ) {
						fn.call( elem );
					}
				}, delay );
			}) :
			this._focus.apply( this, arguments );
	},

	scrollParent: function() {
		var scrollParent;
		if (($.ui.ie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.css(this,'position')) && (/(auto|scroll)/).test($.css(this,'overflow')+$.css(this,'overflow-y')+$.css(this,'overflow-x'));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.css(this,'overflow')+$.css(this,'overflow-y')+$.css(this,'overflow-x'));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},

	uniqueId: function() {
		return this.each(function() {
			if ( !this.id ) {
				this.id = "ui-id-" + (++uuid);
			}
		});
	},

	removeUniqueId: function() {
		return this.each(function() {
			if ( runiqueId.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		});
	}
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[0];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName ) ?
		!element.disabled :
		"a" === nodeName ?
			element.href || isTabIndexNotNaN :
			isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible( element );
}

function visible( element ) {
	return $.expr.filters.visible( element ) &&
		!$( element ).parents().andSelf().filter(function() {
			return $.css( this, "visibility" ) === "hidden";
		}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support
$.support.selectstart = "onselectstart" in document.createElement( "div" );

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
				if ( border ) {
					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
	$.fn.removeData = (function( removeData ) {
		return function( key ) {
			if ( arguments.length ) {
				return removeData.call( this, $.camelCase( key ) );
			} else {
				return removeData.call( this );
			}
		};
	})( $.fn.removeData );
}





// deprecated
$.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

$.fn.extend({
	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

$.extend( $.ui, {
	// $.ui.plugin is deprecated.  Use the proxy pattern instead.
	plugin: {
		add: function( module, option, set ) {
			var i,
				proto = $.ui[ module ].prototype;
			for ( i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var i,
				set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) {
				return;
			}

			for ( i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},

	contains: $.contains,

	// only used by resizable
	hasScroll: function( el, a ) {

		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}

		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;

		if ( el[ scroll ] > 0 ) {
			return true;
		}

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	},

	// these are odd functions, fix the API or move into individual plugins
	isOverAxis: function( x, reference, size ) {
		//Determines when x coordinate is over "b" element axis
		return ( x > reference ) && ( x < ( reference + size ) );
	},
	isOver: function( y, x, top, left, height, width ) {
		//Determines when x, y coordinates is over "b" element
		return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
	}
});

})( jQuery );/*
 * jQuery UI Widget @VERSION
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */
(function( $, undefined ) {

var uuid = 0,
	slice = Array.prototype.slice,
	_cleanData = $.cleanData;
$.cleanData = function( elems ) {
	for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
		try {
			$( elem ).triggerHandler( "remove" );
		// http://bugs.jquery.com/ticket/8235
		} catch( e ) {}
	}
	_cleanData( elems );
};

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( $.isFunction( value ) ) {
			prototype[ prop ] = (function() {
				var _super = function() {
						return base.prototype[ prop ].apply( this, arguments );
					},
					_superApply = function( args ) {
						return base.prototype[ prop ].apply( this, args );
					};
				return function() {
					var __super = this._super,
						__superApply = this._superApply,
						returnValue;

					this._super = _super;
					this._superApply = _superApply;

					returnValue = value.apply( this, arguments );

					this._super = __super;
					this._superApply = __superApply;

					return returnValue;
				};
			})();
		}
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? basePrototype.widgetEventPrefix : name
	}, prototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );
};

$.widget.extend = function( target ) {
	var input = slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;
		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			// 1.9 BC for #7810
			// TODO remove dual storage
			.removeData( this.widgetName )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( value === undefined ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( value === undefined ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
			this.hoverable.removeClass( "ui-state-hover" );
			this.focusable.removeClass( "ui-state-focus" );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			// accept selectors, DOM elements
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^(\w+)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

})( jQuery );/*
 * jQuery UI Mouse @VERSION
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/mouse/
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

var mouseHandled = false;
$( document ).mouseup( function() {
	mouseHandled = false;
});

$.widget("ui.mouse", {
	version: "@VERSION",
	options: {
		cancel: 'input,textarea,button,select,option',
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var that = this;

		this.element
			.bind('mousedown.'+this.widgetName, function(event) {
				return that._mouseDown(event);
			})
			.bind('click.'+this.widgetName, function(event) {
				if (true === $.data(event.target, that.widgetName + '.preventClickEvent')) {
					$.removeData(event.target, that.widgetName + '.preventClickEvent');
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind('.'+this.widgetName);
		if ( this._mouseMoveDelegate ) {
			$(document)
				.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
				.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);
		}
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		if( mouseHandled ) { return; }

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var that = this,
			btnIsLeft = (event.which === 1),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				that.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + '.preventClickEvent')) {
			$.removeData(event.target, this.widgetName + '.preventClickEvent');
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return that._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return that._mouseUp(event);
		};
		$(document)
			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		event.preventDefault();

		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.ui.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target === this._mouseDownEvent.target) {
				$.data(event.target, this.widgetName + '.preventClickEvent', true);
			}

			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(/* event */) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(/* event */) {},
	_mouseDrag: function(/* event */) {},
	_mouseStop: function(/* event */) {},
	_mouseCapture: function(/* event */) { return true; }
});

})(jQuery);/*
 * jQuery UI Position @VERSION
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */
(function( $, undefined ) {

$.ui = $.ui || {};

var cachedScrollbarWidth,
	max = Math.max,
	abs = Math.abs,
	round = Math.round,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseInt( offsets[ 0 ], 10 ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseInt( offsets[ 1 ], 10 ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}
function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div style='display:block;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[0];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[0].clientWidth;
		}

		div.remove();

		return (cachedScrollbarWidth = w1 - w2);
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow ? "" : within.element.css( "overflow-x" ),
			overflowY = within.isWindow ? "" : within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[0].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[0].scrollHeight );
		return {
			width: hasOverflowX ? $.position.scrollbarWidth() : 0,
			height: hasOverflowY ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[0] );
		return {
			element: withinElement,
			isWindow: isWindow,
			offset: withinElement.offset() || { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: isWindow ? withinElement.width() : withinElement.outerWidth(),
			height: isWindow ? withinElement.height() : withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		targetElem = target[0],
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	if ( targetElem.nodeType === 9 ) {
		targetWidth = target.width();
		targetHeight = target.height();
		targetOffset = { top: 0, left: 0 };
	} else if ( $.isWindow( targetElem ) ) {
		targetWidth = target.width();
		targetHeight = target.height();
		targetOffset = { top: target.scrollTop(), left: target.scrollLeft() };
	} else if ( targetElem.preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
		targetWidth = targetHeight = 0;
		targetOffset = { top: targetElem.pageY, left: targetElem.pageX };
	} else {
		targetWidth = target.outerWidth();
		targetHeight = target.outerHeight();
		targetOffset = target.offset();
	}
	// clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	});

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each(function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) + scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) + scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		// if the browser doesn't support fractions, then round for consistent results
		if ( !$.support.offsetFractions ) {
			position.left = round( position.left );
			position.top = round( position.top );
		}

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem : elem
				});
			}
		});

		if ( options.using ) {
			// adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	});
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// element is wider than within
			if ( data.collisionWidth > outerWidth ) {
				// element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
					position.left += overLeft - newOverRight;
				// element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;
				// element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}
			// too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;
			// too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;
			// adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// element is taller than within
			if ( data.collisionHeight > outerHeight ) {
				// element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
					position.top += overTop - newOverBottom;
				// element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;
				// element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}
			// too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;
			// too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;
			// adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			}
			else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
				if ( ( position.top + myOffset + atOffset + offset) > overTop && ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
			else if ( overBottom > 0 ) {
				newOverTop = position.top -  data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
				if ( ( position.top + myOffset + atOffset + offset) > overBottom && ( newOverTop > 0 || abs( newOverTop ) < overBottom ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

// fraction support test
(function () {
	var testElement, testElementParent, testElementStyle, offsetLeft, i,
		body = document.getElementsByTagName( "body" )[ 0 ],
		div = document.createElement( "div" );

	//Create a "fake body" for testing based on method used in jQuery.support
	testElement = document.createElement( body ? "div" : "body" );
	testElementStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0,
		background: "none"
	};
	if ( body ) {
		$.extend( testElementStyle, {
			position: "absolute",
			left: "-1000px",
			top: "-1000px"
		});
	}
	for ( i in testElementStyle ) {
		testElement.style[ i ] = testElementStyle[ i ];
	}
	testElement.appendChild( div );
	testElementParent = body || document.documentElement;
	testElementParent.insertBefore( testElement, testElementParent.firstChild );

	div.style.cssText = "position: absolute; left: 10.7432222px;";

	offsetLeft = $( div ).offset().left;
	$.support.offsetFractions = offsetLeft > 10 && offsetLeft < 11;

	testElement.innerHTML = "";
	testElementParent.removeChild( testElement );
})();

}( jQuery ) );/*
 * jQuery UI Draggable @VERSION
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/draggable/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

/*jshint onevar: false, curly: false, eqeqeq: false, laxbreak: true, shadow: true, funcscope: true */
$.widget("ui.draggable", $.ui.mouse, {
	version: "@VERSION",
	widgetEventPrefix: "drag",
	options: {
		addClasses: true,
		appendTo: "parent",
		axis: false,
		connectToSortable: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		grid: false,
		handle: false,
		helper: "original",
		iframeFix: false,
		opacity: false,
		refreshPositions: false,
		revert: false,
		revertDuration: 500,
		scope: "default",
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		snap: false,
		snapMode: "both",
		snapTolerance: 20,
		stack: false,
		zIndex: false
	},
	_create: function() {

		if (this.options.helper == 'original' && !(/^(?:r|a|f)/).test(this.element.css("position")))
			this.element[0].style.position = 'relative';

		(this.options.addClasses && this.element.addClass("ui-draggable"));
		(this.options.disabled && this.element.addClass("ui-draggable-disabled"));

		this._mouseInit();

	},

	_destroy: function() {
		this.element.removeClass( "ui-draggable ui-draggable-dragging ui-draggable-disabled" );
		this._mouseDestroy();
	},

	_mouseCapture: function(event) {

		var o = this.options;

		// among others, prevent a drag on a resizable-handle
		if (this.helper || o.disabled || $(event.target).is('.ui-resizable-handle'))
			return false;

		//Quit if we're not on a valid handle
		this.handle = this._getHandle(event);
		if (!this.handle)
			return false;

		$(o.iframeFix === true ? "iframe" : o.iframeFix).each(function() {
			$('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>')
			.css({
				width: this.offsetWidth+"px", height: this.offsetHeight+"px",
				position: "absolute", opacity: "0.001", zIndex: 1000
			})
			.css($(this).offset())
			.appendTo("body");
		});

		return true;

	},

	_mouseStart: function(event) {

		var o = this.options;

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		this.helper.addClass("ui-draggable-dragging");

		//Cache the helper size
		this._cacheHelperProportions();

		//If ddmanager is used for droppables, set the global draggable
		if($.ui.ddmanager)
			$.ui.ddmanager.current = this;

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Store the helper's css position
		this.cssPosition = this.helper.css("position");
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.positionAbs = this.element.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this.position = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		//Trigger event + callbacks
		if(this._trigger("start", event) === false) {
			this._clear();
			return false;
		}

		//Recache the helper size
		this._cacheHelperProportions();

		//Prepare the droppable offsets
		if ($.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(this, event);


		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position

		//If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
		if ( $.ui.ddmanager ) $.ui.ddmanager.dragStart(this, event);

		return true;
	},

	_mouseDrag: function(event, noPropagation) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		//Call plugins and callbacks and use the resulting position if something is returned
		if (!noPropagation) {
			var ui = this._uiHash();
			if(this._trigger('drag', event, ui) === false) {
				this._mouseUp({});
				return false;
			}
			this.position = ui.position;
		}

		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';
		if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

		return false;
	},

	_mouseStop: function(event) {

		//If we are using droppables, inform the manager about the drop
		var dropped = false;
		if ($.ui.ddmanager && !this.options.dropBehaviour)
			dropped = $.ui.ddmanager.drop(this, event);

		//if a drop comes from outside (a sortable)
		if(this.dropped) {
			dropped = this.dropped;
			this.dropped = false;
		}

		//if the original element is no longer in the DOM don't bother to continue (see #8269)
		var element = this.element[0], elementInDom = false;
		while ( element && (element = element.parentNode) ) {
			if (element == document ) {
				elementInDom = true;
			}
		}
		if ( !elementInDom && this.options.helper === "original" )
			return false;

		if((this.options.revert == "invalid" && !dropped) || (this.options.revert == "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
			var that = this;
			$(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
				if(that._trigger("stop", event) !== false) {
					that._clear();
				}
			});
		} else {
			if(this._trigger("stop", event) !== false) {
				this._clear();
			}
		}

		return false;
	},

	_mouseUp: function(event) {
		//Remove frame helpers
		$("div.ui-draggable-iframeFix").each(function() {
			this.parentNode.removeChild(this);
		});

		//If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
		if( $.ui.ddmanager ) $.ui.ddmanager.dragStop(this, event);

		return $.ui.mouse.prototype._mouseUp.call(this, event);
	},

	cancel: function() {

		if(this.helper.is(".ui-draggable-dragging")) {
			this._mouseUp({});
		} else {
			this._clear();
		}

		return this;

	},

	_getHandle: function(event) {

		var handle = !this.options.handle || !$(this.options.handle, this.element).length ? true : false;
		$(this.options.handle, this.element)
			.find("*")
			.andSelf()
			.each(function() {
				if(this == event.target) handle = true;
			});

		return handle;

	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : (o.helper == 'clone' ? this.element.clone().removeAttr('id') : this.element);

		if(!helper.parents('body').length)
			helper.appendTo((o.appendTo == 'parent' ? this.element[0].parentNode : o.appendTo));

		if(helper[0] != this.element[0] && !(/(fixed|absolute)/).test(helper.css("position")))
			helper.css("position", "absolute");

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj == 'string') {
			obj = obj.split(' ');
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ('left' in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ('right' in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ('top' in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ('bottom' in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {

		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.ui.ie)) //Ugly IE fix
			po = { top: 0, left: 0 };

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition == "relative") {
			var p = this.element.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.element.css("marginLeft"),10) || 0),
			top: (parseInt(this.element.css("marginTop"),10) || 0),
			right: (parseInt(this.element.css("marginRight"),10) || 0),
			bottom: (parseInt(this.element.css("marginBottom"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var o = this.options;
		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
		if(o.containment == 'document' || o.containment == 'window') this.containment = [
			o.containment == 'document' ? 0 : $(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
			o.containment == 'document' ? 0 : $(window).scrollTop() - this.offset.relative.top - this.offset.parent.top,
			(o.containment == 'document' ? 0 : $(window).scrollLeft()) + $(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			(o.containment == 'document' ? 0 : $(window).scrollTop()) + ($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

		if(!(/^(document|window|parent)$/).test(o.containment) && o.containment.constructor != Array) {
			var c = $(o.containment);
			var ce = c[0]; if(!ce) return;
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				(parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0),
				(parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0),
				(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right,
				(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top  - this.margins.bottom
			];
			this.relative_container = c;

		} else if(o.containment.constructor == Array) {
			this.containment = o.containment;
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		var scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
		var pageX = event.pageX;
		var pageY = event.pageY;

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options
			var containment;
			if(this.containment) {
			if (this.relative_container){
				var co = this.relative_container.offset();
				containment = [ this.containment[0] + co.left,
					this.containment[1] + co.top,
					this.containment[2] + co.left,
					this.containment[3] + co.top ];
			}
			else {
				containment = this.containment;
			}

				if(event.pageX - this.offset.click.left < containment[0]) pageX = containment[0] + this.offset.click.left;
				if(event.pageY - this.offset.click.top < containment[1]) pageY = containment[1] + this.offset.click.top;
				if(event.pageX - this.offset.click.left > containment[2]) pageX = containment[2] + this.offset.click.left;
				if(event.pageY - this.offset.click.top > containment[3]) pageY = containment[3] + this.offset.click.top;
			}

			if(o.grid) {
				//Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
				var top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
				pageY = containment ? ((top - this.offset.click.top >= containment[1] || top - this.offset.click.top > containment[3]) ? top : ((top - this.offset.click.top >= containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				var left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
				pageX = containment ? ((left - this.offset.click.left >= containment[0] || left - this.offset.click.left > containment[2]) ? left : ((left - this.offset.click.left >= containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_clear: function() {
		this.helper.removeClass("ui-draggable-dragging");
		if(this.helper[0] != this.element[0] && !this.cancelHelperRemoval) this.helper.remove();
		//if($.ui.ddmanager) $.ui.ddmanager.current = null;
		this.helper = null;
		this.cancelHelperRemoval = false;
	},

	// From now on bulk stuff - mainly helpers

	_trigger: function(type, event, ui) {
		ui = ui || this._uiHash();
		$.ui.plugin.call(this, type, [event, ui]);
		if(type == "drag") this.positionAbs = this._convertPositionTo("absolute"); //The absolute position has to be recalculated after plugins
		return $.Widget.prototype._trigger.call(this, type, event, ui);
	},

	plugins: {},

	_uiHash: function() {
		return {
			helper: this.helper,
			position: this.position,
			originalPosition: this.originalPosition,
			offset: this.positionAbs
		};
	}

});

$.ui.plugin.add("draggable", "connectToSortable", {
	start: function(event, ui) {

		var inst = $(this).data("ui-draggable"), o = inst.options,
			uiSortable = $.extend({}, ui, { item: inst.element });
		inst.sortables = [];
		$(o.connectToSortable).each(function() {
			var sortable = $.data(this, 'ui-sortable');
			if (sortable && !sortable.options.disabled) {
				inst.sortables.push({
					instance: sortable,
					shouldRevert: sortable.options.revert
				});
				sortable.refreshPositions();	// Call the sortable's refreshPositions at drag start to refresh the containerCache since the sortable container cache is used in drag and needs to be up to date (this will ensure it's initialised as well as being kept in step with any changes that might have happened on the page).
				sortable._trigger("activate", event, uiSortable);
			}
		});

	},
	stop: function(event, ui) {

		//If we are still over the sortable, we fake the stop event of the sortable, but also remove helper
		var inst = $(this).data("ui-draggable"),
			uiSortable = $.extend({}, ui, { item: inst.element });

		$.each(inst.sortables, function() {
			if(this.instance.isOver) {

				this.instance.isOver = 0;

				inst.cancelHelperRemoval = true; //Don't remove the helper in the draggable instance
				this.instance.cancelHelperRemoval = false; //Remove it in the sortable instance (so sortable plugins like revert still work)

				//The sortable revert is supported, and we have to set a temporary dropped variable on the draggable to support revert: 'valid/invalid'
				if(this.shouldRevert) this.instance.options.revert = true;

				//Trigger the stop of the sortable
				this.instance._mouseStop(event);

				this.instance.options.helper = this.instance.options._helper;

				//If the helper has been the original item, restore properties in the sortable
				if(inst.options.helper == 'original')
					this.instance.currentItem.css({ top: 'auto', left: 'auto' });

			} else {
				this.instance.cancelHelperRemoval = false; //Remove the helper in the sortable instance
				this.instance._trigger("deactivate", event, uiSortable);
			}

		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("ui-draggable"), that = this;

		$.each(inst.sortables, function() {

			var innermostIntersecting = false;
			var thisSortable = this;
			//Copy over some variables to allow calling the sortable's native _intersectsWith
			this.instance.positionAbs = inst.positionAbs;
			this.instance.helperProportions = inst.helperProportions;
			this.instance.offset.click = inst.offset.click;

			if(this.instance._intersectsWith(this.instance.containerCache)) {
				innermostIntersecting = true;
				$.each(inst.sortables, function () {
					this.instance.positionAbs = inst.positionAbs;
					this.instance.helperProportions = inst.helperProportions;
					this.instance.offset.click = inst.offset.click;
					if  (this != thisSortable
						&& this.instance._intersectsWith(this.instance.containerCache)
						&& $.ui.contains(thisSortable.instance.element[0], this.instance.element[0]))
						innermostIntersecting = false;
						return innermostIntersecting;
				});
			}


			if(innermostIntersecting) {
				//If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
				if(!this.instance.isOver) {

					this.instance.isOver = 1;
					//Now we fake the start of dragging for the sortable instance,
					//by cloning the list group item, appending it to the sortable and using it as inst.currentItem
					//We can then fire the start event of the sortable with our passed browser event, and our own helper (so it doesn't create a new one)
					this.instance.currentItem = $(that).clone().removeAttr('id').appendTo(this.instance.element).data("ui-sortable-item", true);
					this.instance.options._helper = this.instance.options.helper; //Store helper option to later restore it
					this.instance.options.helper = function() { return ui.helper[0]; };

					event.target = this.instance.currentItem[0];
					this.instance._mouseCapture(event, true);
					this.instance._mouseStart(event, true, true);

					//Because the browser event is way off the new appended portlet, we modify a couple of variables to reflect the changes
					this.instance.offset.click.top = inst.offset.click.top;
					this.instance.offset.click.left = inst.offset.click.left;
					this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
					this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

					inst._trigger("toSortable", event);
					inst.dropped = this.instance.element; //draggable revert needs that
					//hack so receive/update callbacks work (mostly)
					inst.currentItem = inst.element;
					this.instance.fromOutside = inst;

				}

				//Provided we did all the previous steps, we can fire the drag event of the sortable on every draggable drag, when it intersects with the sortable
				if(this.instance.currentItem) this.instance._mouseDrag(event);

			} else {

				//If it doesn't intersect with the sortable, and it intersected before,
				//we fake the drag stop of the sortable, but make sure it doesn't remove the helper by using cancelHelperRemoval
				if(this.instance.isOver) {

					this.instance.isOver = 0;
					this.instance.cancelHelperRemoval = true;

					//Prevent reverting on this forced stop
					this.instance.options.revert = false;

					// The out event needs to be triggered independently
					this.instance._trigger('out', event, this.instance._uiHash(this.instance));

					this.instance._mouseStop(event, true);
					this.instance.options.helper = this.instance.options._helper;

					//Now we remove our currentItem, the list group clone again, and the placeholder, and animate the helper back to it's original size
					this.instance.currentItem.remove();
					if(this.instance.placeholder) this.instance.placeholder.remove();

					inst._trigger("fromSortable", event);
					inst.dropped = false; //draggable revert needs that
				}

			}

		});

	}
});

$.ui.plugin.add("draggable", "cursor", {
	start: function() {
		var t = $('body'), o = $(this).data('ui-draggable').options;
		if (t.css("cursor")) o._cursor = t.css("cursor");
		t.css("cursor", o.cursor);
	},
	stop: function() {
		var o = $(this).data('ui-draggable').options;
		if (o._cursor) $('body').css("cursor", o._cursor);
	}
});

$.ui.plugin.add("draggable", "opacity", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data('ui-draggable').options;
		if(t.css("opacity")) o._opacity = t.css("opacity");
		t.css('opacity', o.opacity);
	},
	stop: function(event, ui) {
		var o = $(this).data('ui-draggable').options;
		if(o._opacity) $(ui.helper).css('opacity', o._opacity);
	}
});

$.ui.plugin.add("draggable", "scroll", {
	start: function() {
		var i = $(this).data("ui-draggable");
		if(i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') i.overflowOffset = i.scrollParent.offset();
	},
	drag: function( event ) {

		var i = $(this).data("ui-draggable"), o = i.options, scrolled = false;

		if(i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') {

			if(!o.axis || o.axis != 'x') {
				if((i.overflowOffset.top + i.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + o.scrollSpeed;
				else if(event.pageY - i.overflowOffset.top < o.scrollSensitivity)
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - o.scrollSpeed;
			}

			if(!o.axis || o.axis != 'y') {
				if((i.overflowOffset.left + i.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + o.scrollSpeed;
				else if(event.pageX - i.overflowOffset.left < o.scrollSensitivity)
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - o.scrollSpeed;
			}

		} else {

			if(!o.axis || o.axis != 'x') {
				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
			}

			if(!o.axis || o.axis != 'y') {
				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
			}

		}

		if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(i, event);

	}
});

$.ui.plugin.add("draggable", "snap", {
	start: function() {

		var i = $(this).data("ui-draggable"), o = i.options;
		i.snapElements = [];

		$(o.snap.constructor != String ? ( o.snap.items || ':data(ui-draggable)' ) : o.snap).each(function() {
			var $t = $(this); var $o = $t.offset();
			if(this != i.element[0]) i.snapElements.push({
				item: this,
				width: $t.outerWidth(), height: $t.outerHeight(),
				top: $o.top, left: $o.left
			});
		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("ui-draggable"), o = inst.options;
		var d = o.snapTolerance;

		var x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

		for (var i = inst.snapElements.length - 1; i >= 0; i--){

			var l = inst.snapElements[i].left, r = l + inst.snapElements[i].width,
				t = inst.snapElements[i].top, b = t + inst.snapElements[i].height;

			//Yes, I know, this is insane ;)
			if(!((l-d < x1 && x1 < r+d && t-d < y1 && y1 < b+d) || (l-d < x1 && x1 < r+d && t-d < y2 && y2 < b+d) || (l-d < x2 && x2 < r+d && t-d < y1 && y1 < b+d) || (l-d < x2 && x2 < r+d && t-d < y2 && y2 < b+d))) {
				if(inst.snapElements[i].snapping) (inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
				inst.snapElements[i].snapping = false;
				continue;
			}

			if(o.snapMode != 'inner') {
				var ts = Math.abs(t - y2) <= d;
				var bs = Math.abs(b - y1) <= d;
				var ls = Math.abs(l - x2) <= d;
				var rs = Math.abs(r - x1) <= d;
				if(ts) ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				if(bs) ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top - inst.margins.top;
				if(ls) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left - inst.margins.left;
				if(rs) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left - inst.margins.left;
			}

			var first = (ts || bs || ls || rs);

			if(o.snapMode != 'outer') {
				var ts = Math.abs(t - y1) <= d;
				var bs = Math.abs(b - y2) <= d;
				var ls = Math.abs(l - x1) <= d;
				var rs = Math.abs(r - x2) <= d;
				if(ts) ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top - inst.margins.top;
				if(bs) ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				if(ls) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left - inst.margins.left;
				if(rs) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left - inst.margins.left;
			}

			if(!inst.snapElements[i].snapping && (ts || bs || ls || rs || first))
				(inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
			inst.snapElements[i].snapping = (ts || bs || ls || rs || first);

		}

	}
});

$.ui.plugin.add("draggable", "stack", {
	start: function() {

		var o = $(this).data("ui-draggable").options;

		var group = $.makeArray($(o.stack)).sort(function(a,b) {
			return (parseInt($(a).css("zIndex"),10) || 0) - (parseInt($(b).css("zIndex"),10) || 0);
		});
		if (!group.length) { return; }

		var min = parseInt(group[0].style.zIndex, 10) || 0;
		$(group).each(function(i) {
			this.style.zIndex = min + i;
		});

		this[0].style.zIndex = min + group.length;

	}
});

$.ui.plugin.add("draggable", "zIndex", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data("ui-draggable").options;
		if(t.css("zIndex")) o._zIndex = t.css("zIndex");
		t.css('zIndex', o.zIndex);
	},
	stop: function(event, ui) {
		var o = $(this).data("ui-draggable").options;
		if(o._zIndex) $(ui.helper).css('zIndex', o._zIndex);
	}
});

})(jQuery);/*
 * jQuery UI Resizable @VERSION
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/resizable/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

/*jshint onevar: false, curly: false, eqeqeq: false, funcscope: true, loopfunc: true */

function num(v) {
	return parseInt(v, 10) || 0;
}

function isNumber(value) {
	return !isNaN(parseInt(value, 10));
}

$.widget("ui.resizable", $.ui.mouse, {
	version: "@VERSION",
	widgetEventPrefix: "resize",
	options: {
		alsoResize: false,
		animate: false,
		animateDuration: "slow",
		animateEasing: "swing",
		aspectRatio: false,
		autoHide: false,
		containment: false,
		ghost: false,
		grid: false,
		handles: "e,s,se",
		helper: false,
		maxHeight: null,
		maxWidth: null,
		minHeight: 10,
		minWidth: 10,
		zIndex: 1000
	},
	_create: function() {

		var that = this, o = this.options;
		this.element.addClass("ui-resizable");

		$.extend(this, {
			_aspectRatio: !!(o.aspectRatio),
			aspectRatio: o.aspectRatio,
			originalElement: this.element,
			_proportionallyResizeElements: [],
			_helper: o.helper || o.ghost || o.animate ? o.helper || 'ui-resizable-helper' : null
		});

		//Wrap the element if it cannot hold child nodes
		if(this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)) {

			//Create a wrapper element and set the wrapper to the new current internal element
			this.element.wrap(
				$('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({
					position: this.element.css('position'),
					width: this.element.outerWidth(),
					height: this.element.outerHeight(),
					top: this.element.css('top'),
					left: this.element.css('left')
				})
			);

			//Overwrite the original this.element
			this.element = this.element.parent().data(
				"ui-resizable", this.element.data('ui-resizable')
			);

			this.elementIsWrapper = true;

			//Move margins to the wrapper
			this.element.css({ marginLeft: this.originalElement.css("marginLeft"), marginTop: this.originalElement.css("marginTop"), marginRight: this.originalElement.css("marginRight"), marginBottom: this.originalElement.css("marginBottom") });
			this.originalElement.css({ marginLeft: 0, marginTop: 0, marginRight: 0, marginBottom: 0});

			//Prevent Safari textarea resize
			this.originalResizeStyle = this.originalElement.css('resize');
			this.originalElement.css('resize', 'none');

			//Push the actual element to our proportionallyResize internal array
			this._proportionallyResizeElements.push(this.originalElement.css({ position: 'static', zoom: 1, display: 'block' }));

			// avoid IE jump (hard set the margin)
			this.originalElement.css({ margin: this.originalElement.css('margin') });

			// fix handlers offset
			this._proportionallyResize();

		}

		this.handles = o.handles || (!$('.ui-resizable-handle', this.element).length ? "e,s,se" : { n: '.ui-resizable-n', e: '.ui-resizable-e', s: '.ui-resizable-s', w: '.ui-resizable-w', se: '.ui-resizable-se', sw: '.ui-resizable-sw', ne: '.ui-resizable-ne', nw: '.ui-resizable-nw' });
		if(this.handles.constructor == String) {

			if(this.handles == 'all') this.handles = 'n,e,s,w,se,sw,ne,nw';
			var n = this.handles.split(","); this.handles = {};

			for(var i = 0; i < n.length; i++) {

				var handle = $.trim(n[i]), hname = 'ui-resizable-'+handle;
				var axis = $('<div class="ui-resizable-handle ' + hname + '"></div>');

				// Apply zIndex to all handles - see #7960
				axis.css({ zIndex: o.zIndex });

				//TODO : What's going on here?
				// if ('se' == handle) {
				// 	axis.addClass('ui-icon ui-icon-gripsmall-diagonal-se');
				// }

				//Insert into internal handles object and append to element
				this.handles[handle] = '.ui-resizable-'+handle;
				this.element.append(axis);
			}

		}

		this._renderAxis = function(target) {

			target = target || this.element;

			for(var i in this.handles) {

				if(this.handles[i].constructor == String)
					this.handles[i] = $(this.handles[i], this.element).show();

				//Apply pad to wrapper element, needed to fix axis position (textarea, inputs, scrolls)
				if (this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i)) {

					var axis = $(this.handles[i], this.element), padWrapper = 0;

					//Checking the correct pad and border
					padWrapper = /sw|ne|nw|se|n|s/.test(i) ? axis.outerHeight() : axis.outerWidth();

					//The padding type i have to apply...
					var padPos = [ 'padding',
						/ne|nw|n/.test(i) ? 'Top' :
						/se|sw|s/.test(i) ? 'Bottom' :
						/^e$/.test(i) ? 'Right' : 'Left' ].join("");

					target.css(padPos, padWrapper);

					this._proportionallyResize();

				}

				//TODO: What's that good for? There's not anything to be executed left
				if(!$(this.handles[i]).length)
					continue;

			}
		};

		//TODO: make renderAxis a prototype function
		this._renderAxis(this.element);

		this._handles = $('.ui-resizable-handle', this.element)
			.disableSelection();

		//Matching axis name
		this._handles.mouseover(function() {
			if (!that.resizing) {
				if (this.className)
					var axis = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
				//Axis, default = se
				that.axis = axis && axis[1] ? axis[1] : 'se';
			}
		});

		//If we want to auto hide the elements
		if (o.autoHide) {
			this._handles.hide();
			$(this.element)
				.addClass("ui-resizable-autohide")
				.mouseenter(function() {
					if (o.disabled) return;
					$(this).removeClass("ui-resizable-autohide");
					that._handles.show();
				})
				.mouseleave(function(){
					if (o.disabled) return;
					if (!that.resizing) {
						$(this).addClass("ui-resizable-autohide");
						that._handles.hide();
					}
				});
		}

		//Initialize the mouse interaction
		this._mouseInit();

	},

	_destroy: function() {

		this._mouseDestroy();

		var _destroy = function(exp) {
			$(exp).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing")
				.removeData("resizable").removeData("ui-resizable").unbind(".resizable").find('.ui-resizable-handle').remove();
		};

		//TODO: Unwrap at same DOM position
		if (this.elementIsWrapper) {
			_destroy(this.element);
			var wrapper = this.element;
			this.originalElement.css({
				position: wrapper.css('position'),
				width: wrapper.outerWidth(),
				height: wrapper.outerHeight(),
				top: wrapper.css('top'),
				left: wrapper.css('left')
			}).insertAfter( wrapper );
			wrapper.remove();
		}

		this.originalElement.css('resize', this.originalResizeStyle);
		_destroy(this.originalElement);

		return this;
	},

	_mouseCapture: function(event) {
		var capture = false;
		for (var i in this.handles) {
			var handle = $(this.handles[i])[0];
			if (handle == event.target || $.contains(handle, event.target)) {
				capture = true;
			}
		}

		return !this.options.disabled && capture;
	},

	_mouseStart: function(event) {

		var o = this.options, iniPos = this.element.position(), el = this.element;

		this.resizing = true;
		this.documentScroll = { top: $(document).scrollTop(), left: $(document).scrollLeft() };

		// bugfix for http://dev.jquery.com/ticket/1749
		if (el.is('.ui-draggable') || (/absolute/).test(el.css('position'))) {
			el.css({ position: 'absolute', top: iniPos.top, left: iniPos.left });
		}

		this._renderProxy();

		var curleft = num(this.helper.css('left')), curtop = num(this.helper.css('top'));

		if (o.containment) {
			curleft += $(o.containment).scrollLeft() || 0;
			curtop += $(o.containment).scrollTop() || 0;
		}

		//Store needed variables
		this.offset = this.helper.offset();
		this.position = { left: curleft, top: curtop };
		this.size = this._helper ? { width: el.outerWidth(), height: el.outerHeight() } : { width: el.width(), height: el.height() };
		this.originalSize = this._helper ? { width: el.outerWidth(), height: el.outerHeight() } : { width: el.width(), height: el.height() };
		this.originalPosition = { left: curleft, top: curtop };
		this.sizeDiff = { width: el.outerWidth() - el.width(), height: el.outerHeight() - el.height() };
		this.originalMousePosition = { left: event.pageX, top: event.pageY };

		//Aspect Ratio
		this.aspectRatio = (typeof o.aspectRatio == 'number') ? o.aspectRatio : ((this.originalSize.width / this.originalSize.height) || 1);

		var cursor = $('.ui-resizable-' + this.axis).css('cursor');
		$('body').css('cursor', cursor == 'auto' ? this.axis + '-resize' : cursor);

		el.addClass("ui-resizable-resizing");
		this._propagate("start", event);
		return true;
	},

	_mouseDrag: function(event) {

		//Increase performance, avoid regex
		var el = this.helper,
			smp = this.originalMousePosition, a = this.axis;

		var dx = (event.pageX-smp.left)||0, dy = (event.pageY-smp.top)||0;
		var trigger = this._change[a];
		if (!trigger) return false;

		// Calculate the attrs that will be change
		var data = trigger.apply(this, [event, dx, dy]);

		// Put this in the mouseDrag handler since the user can start pressing shift while resizing
		this._updateVirtualBoundaries(event.shiftKey);
		if (this._aspectRatio || event.shiftKey)
			data = this._updateRatio(data, event);

		data = this._respectSize(data, event);

		// plugins callbacks need to be called first
		this._propagate("resize", event);

		el.css({
			top: this.position.top + "px", left: this.position.left + "px",
			width: this.size.width + "px", height: this.size.height + "px"
		});

		if (!this._helper && this._proportionallyResizeElements.length)
			this._proportionallyResize();

		this._updateCache(data);

		// calling the user callback at the end
		this._trigger('resize', event, this.ui());

		return false;
	},

	_mouseStop: function(event) {

		this.resizing = false;
		var o = this.options, that = this;

		if(this._helper) {
			var pr = this._proportionallyResizeElements, ista = pr.length && (/textarea/i).test(pr[0].nodeName),
				soffseth = ista && $.ui.hasScroll(pr[0], 'left') /* TODO - jump height */ ? 0 : that.sizeDiff.height,
				soffsetw = ista ? 0 : that.sizeDiff.width;

			var s = { width: (that.helper.width()  - soffsetw), height: (that.helper.height() - soffseth) },
				left = (parseInt(that.element.css('left'), 10) + (that.position.left - that.originalPosition.left)) || null,
				top = (parseInt(that.element.css('top'), 10) + (that.position.top - that.originalPosition.top)) || null;

			if (!o.animate)
				this.element.css($.extend(s, { top: top, left: left }));

			that.helper.height(that.size.height);
			that.helper.width(that.size.width);

			if (this._helper && !o.animate) this._proportionallyResize();
		}

		$('body').css('cursor', 'auto');

		this.element.removeClass("ui-resizable-resizing");

		this._propagate("stop", event);

		if (this._helper) this.helper.remove();
		return false;

	},

	_updateVirtualBoundaries: function(forceAspectRatio) {
		var o = this.options, pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b;

		b = {
			minWidth: isNumber(o.minWidth) ? o.minWidth : 0,
			maxWidth: isNumber(o.maxWidth) ? o.maxWidth : Infinity,
			minHeight: isNumber(o.minHeight) ? o.minHeight : 0,
			maxHeight: isNumber(o.maxHeight) ? o.maxHeight : Infinity
		};

		if(this._aspectRatio || forceAspectRatio) {
			// We want to create an enclosing box whose aspect ration is the requested one
			// First, compute the "projected" size for each dimension based on the aspect ratio and other dimension
			pMinWidth = b.minHeight * this.aspectRatio;
			pMinHeight = b.minWidth / this.aspectRatio;
			pMaxWidth = b.maxHeight * this.aspectRatio;
			pMaxHeight = b.maxWidth / this.aspectRatio;

			if(pMinWidth > b.minWidth) b.minWidth = pMinWidth;
			if(pMinHeight > b.minHeight) b.minHeight = pMinHeight;
			if(pMaxWidth < b.maxWidth) b.maxWidth = pMaxWidth;
			if(pMaxHeight < b.maxHeight) b.maxHeight = pMaxHeight;
		}
		this._vBoundaries = b;
	},

	_updateCache: function(data) {
		this.offset = this.helper.offset();
		if (isNumber(data.left)) this.position.left = data.left;
		if (isNumber(data.top)) this.position.top = data.top;
		if (isNumber(data.height)) this.size.height = data.height;
		if (isNumber(data.width)) this.size.width = data.width;
	},

	_updateRatio: function( data ) {

		var cpos = this.position, csize = this.size, a = this.axis;

		if (isNumber(data.height)) data.width = (data.height * this.aspectRatio);
		else if (isNumber(data.width)) data.height = (data.width / this.aspectRatio);

		if (a == 'sw') {
			data.left = cpos.left + (csize.width - data.width);
			data.top = null;
		}
		if (a == 'nw') {
			data.top = cpos.top + (csize.height - data.height);
			data.left = cpos.left + (csize.width - data.width);
		}

		return data;
	},

	_respectSize: function( data ) {

		var o = this._vBoundaries, a = this.axis,
			ismaxw = isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width), ismaxh = isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
			isminw = isNumber(data.width) && o.minWidth && (o.minWidth > data.width), isminh = isNumber(data.height) && o.minHeight && (o.minHeight > data.height);

		if (isminw) data.width = o.minWidth;
		if (isminh) data.height = o.minHeight;
		if (ismaxw) data.width = o.maxWidth;
		if (ismaxh) data.height = o.maxHeight;

		var dw = this.originalPosition.left + this.originalSize.width, dh = this.position.top + this.size.height;
		var cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);

		if (isminw && cw) data.left = dw - o.minWidth;
		if (ismaxw && cw) data.left = dw - o.maxWidth;
		if (isminh && ch)	data.top = dh - o.minHeight;
		if (ismaxh && ch)	data.top = dh - o.maxHeight;

		// fixing jump error on top/left - bug #2330
		var isNotwh = !data.width && !data.height;
		if (isNotwh && !data.left && data.top) data.top = null;
		else if (isNotwh && !data.top && data.left) data.left = null;

		return data;
	},

	_proportionallyResize: function() {

		if (!this._proportionallyResizeElements.length) return;
		var element = this.helper || this.element;

		for (var i=0; i < this._proportionallyResizeElements.length; i++) {

			var prel = this._proportionallyResizeElements[i];

			if (!this.borderDif) {
				var b = [prel.css('borderTopWidth'), prel.css('borderRightWidth'), prel.css('borderBottomWidth'), prel.css('borderLeftWidth')],
					p = [prel.css('paddingTop'), prel.css('paddingRight'), prel.css('paddingBottom'), prel.css('paddingLeft')];

				this.borderDif = $.map(b, function(v, i) {
					var border = parseInt(v,10)||0, padding = parseInt(p[i],10)||0;
					return border + padding;
				});
			}

			prel.css({
				height: (element.height() - this.borderDif[0] - this.borderDif[2]) || 0,
				width: (element.width() - this.borderDif[1] - this.borderDif[3]) || 0
			});

		}

	},

	_renderProxy: function() {

		var el = this.element, o = this.options;
		this.elementOffset = el.offset();

		if(this._helper) {

			this.helper = this.helper || $('<div style="overflow:hidden;"></div>');

			this.helper.addClass(this._helper).css({
				width: this.element.outerWidth() - 1,
				height: this.element.outerHeight() - 1,
				position: 'absolute',
				left: this.elementOffset.left +'px',
				top: this.elementOffset.top +'px',
				zIndex: ++o.zIndex //TODO: Don't modify option
			});

			this.helper
				.appendTo("body")
				.disableSelection();

		} else {
			this.helper = this.element;
		}

	},

	_change: {
		e: function(event, dx) {
			return { width: this.originalSize.width + dx };
		},
		w: function(event, dx) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { left: sp.left + dx, width: cs.width - dx };
		},
		n: function(event, dx, dy) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { top: sp.top + dy, height: cs.height - dy };
		},
		s: function(event, dx, dy) {
			return { height: this.originalSize.height + dy };
		},
		se: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
		},
		sw: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
		},
		ne: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
		},
		nw: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
		}
	},

	_propagate: function(n, event) {
		$.ui.plugin.call(this, n, [event, this.ui()]);
		(n != "resize" && this._trigger(n, event, this.ui()));
	},

	plugins: {},

	ui: function() {
		return {
			originalElement: this.originalElement,
			element: this.element,
			helper: this.helper,
			position: this.position,
			size: this.size,
			originalSize: this.originalSize,
			originalPosition: this.originalPosition
		};
	}

});

/*
 * Resizable Extensions
 */

$.ui.plugin.add("resizable", "alsoResize", {

	start: function () {
		var that = $(this).data("ui-resizable"), o = that.options;

		var _store = function (exp) {
			$(exp).each(function() {
				var el = $(this);
				el.data("ui-resizable-alsoresize", {
					width: parseInt(el.width(), 10), height: parseInt(el.height(), 10),
					left: parseInt(el.css('left'), 10), top: parseInt(el.css('top'), 10)
				});
			});
		};

		if (typeof(o.alsoResize) == 'object' && !o.alsoResize.parentNode) {
			if (o.alsoResize.length) { o.alsoResize = o.alsoResize[0]; _store(o.alsoResize); }
			else { $.each(o.alsoResize, function (exp) { _store(exp); }); }
		}else{
			_store(o.alsoResize);
		}
	},

	resize: function (event, ui) {
		var that = $(this).data("ui-resizable"), o = that.options, os = that.originalSize, op = that.originalPosition;

		var delta = {
			height: (that.size.height - os.height) || 0, width: (that.size.width - os.width) || 0,
			top: (that.position.top - op.top) || 0, left: (that.position.left - op.left) || 0
		},

		_alsoResize = function (exp, c) {
			$(exp).each(function() {
				var el = $(this), start = $(this).data("ui-resizable-alsoresize"), style = {},
					css = c && c.length ? c : el.parents(ui.originalElement[0]).length ? ['width', 'height'] : ['width', 'height', 'top', 'left'];

				$.each(css, function (i, prop) {
					var sum = (start[prop]||0) + (delta[prop]||0);
					if (sum && sum >= 0)
						style[prop] = sum || null;
				});

				el.css(style);
			});
		};

		if (typeof(o.alsoResize) == 'object' && !o.alsoResize.nodeType) {
			$.each(o.alsoResize, function (exp, c) { _alsoResize(exp, c); });
		}else{
			_alsoResize(o.alsoResize);
		}
	},

	stop: function () {
		$(this).removeData("resizable-alsoresize");
	}
});

$.ui.plugin.add("resizable", "animate", {

	stop: function( event ) {
		var that = $(this).data("ui-resizable"), o = that.options;

		var pr = that._proportionallyResizeElements, ista = pr.length && (/textarea/i).test(pr[0].nodeName),
					soffseth = ista && $.ui.hasScroll(pr[0], 'left') /* TODO - jump height */ ? 0 : that.sizeDiff.height,
						soffsetw = ista ? 0 : that.sizeDiff.width;

		var style = { width: (that.size.width - soffsetw), height: (that.size.height - soffseth) },
					left = (parseInt(that.element.css('left'), 10) + (that.position.left - that.originalPosition.left)) || null,
						top = (parseInt(that.element.css('top'), 10) + (that.position.top - that.originalPosition.top)) || null;

		that.element.animate(
			$.extend(style, top && left ? { top: top, left: left } : {}), {
				duration: o.animateDuration,
				easing: o.animateEasing,
				step: function() {

					var data = {
						width: parseInt(that.element.css('width'), 10),
						height: parseInt(that.element.css('height'), 10),
						top: parseInt(that.element.css('top'), 10),
						left: parseInt(that.element.css('left'), 10)
					};

					if (pr && pr.length) $(pr[0]).css({ width: data.width, height: data.height });

					// propagating resize, and updating values for each animation step
					that._updateCache(data);
					that._propagate("resize", event);

				}
			}
		);
	}

});

$.ui.plugin.add("resizable", "containment", {

	start: function() {
		var that = $(this).data("ui-resizable"), o = that.options, el = that.element;
		var oc = o.containment,	ce = (oc instanceof $) ? oc.get(0) : (/parent/.test(oc)) ? el.parent().get(0) : oc;
		if (!ce) return;

		that.containerElement = $(ce);

		if (/document/.test(oc) || oc == document) {
			that.containerOffset = { left: 0, top: 0 };
			that.containerPosition = { left: 0, top: 0 };

			that.parentData = {
				element: $(document), left: 0, top: 0,
				width: $(document).width(), height: $(document).height() || document.body.parentNode.scrollHeight
			};
		}

		// i'm a node, so compute top, left, right, bottom
		else {
			var element = $(ce), p = [];
			$([ "Top", "Right", "Left", "Bottom" ]).each(function(i, name) { p[i] = num(element.css("padding" + name)); });

			that.containerOffset = element.offset();
			that.containerPosition = element.position();
			that.containerSize = { height: (element.innerHeight() - p[3]), width: (element.innerWidth() - p[1]) };

			var co = that.containerOffset, ch = that.containerSize.height,	cw = that.containerSize.width,
						width = ($.ui.hasScroll(ce, "left") ? ce.scrollWidth : cw ), height = ($.ui.hasScroll(ce) ? ce.scrollHeight : ch);

			that.parentData = {
				element: ce, left: co.left, top: co.top, width: width, height: height
			};
		}
	},

	resize: function( event ) {
		var that = $(this).data("ui-resizable"), o = that.options,
			co = that.containerOffset, cp = that.position,
			pRatio = that._aspectRatio || event.shiftKey, cop = { top:0, left:0 }, ce = that.containerElement;

		if (ce[0] != document && (/static/).test(ce.css('position'))) cop = co;

		if (cp.left < (that._helper ? co.left : 0)) {
			that.size.width = that.size.width + (that._helper ? (that.position.left - co.left) : (that.position.left - cop.left));
			if (pRatio) that.size.height = that.size.width / that.aspectRatio;
			that.position.left = o.helper ? co.left : 0;
		}

		if (cp.top < (that._helper ? co.top : 0)) {
			that.size.height = that.size.height + (that._helper ? (that.position.top - co.top) : that.position.top);
			if (pRatio) that.size.width = that.size.height * that.aspectRatio;
			that.position.top = that._helper ? co.top : 0;
		}

		that.offset.left = that.parentData.left+that.position.left;
		that.offset.top = that.parentData.top+that.position.top;

		var woset = Math.abs( (that._helper ? that.offset.left - cop.left : (that.offset.left - cop.left)) + that.sizeDiff.width ),
					hoset = Math.abs( (that._helper ? that.offset.top - cop.top : (that.offset.top - co.top)) + that.sizeDiff.height );

		var isParent = that.containerElement.get(0) == that.element.parent().get(0),
			isOffsetRelative = /relative|absolute/.test(that.containerElement.css('position'));

		if(isParent && isOffsetRelative) woset -= that.parentData.left;

		if (woset + that.size.width >= that.parentData.width) {
			that.size.width = that.parentData.width - woset;
			if (pRatio) that.size.height = that.size.width / that.aspectRatio;
		}

		if (hoset + that.size.height >= that.parentData.height) {
			that.size.height = that.parentData.height - hoset;
			if (pRatio) that.size.width = that.size.height * that.aspectRatio;
		}
	},

	stop: function(){
		var that = $(this).data("ui-resizable"), o = that.options,
				co = that.containerOffset, cop = that.containerPosition, ce = that.containerElement;

		var helper = $(that.helper), ho = helper.offset(), w = helper.outerWidth() - that.sizeDiff.width, h = helper.outerHeight() - that.sizeDiff.height;

		if (that._helper && !o.animate && (/relative/).test(ce.css('position')))
			$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });

		if (that._helper && !o.animate && (/static/).test(ce.css('position')))
			$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });

	}
});

$.ui.plugin.add("resizable", "ghost", {

	start: function() {

		var that = $(this).data("ui-resizable"), o = that.options, cs = that.size;

		that.ghost = that.originalElement.clone();
		that.ghost
			.css({ opacity: 0.25, display: 'block', position: 'relative', height: cs.height, width: cs.width, margin: 0, left: 0, top: 0 })
			.addClass('ui-resizable-ghost')
			.addClass(typeof o.ghost == 'string' ? o.ghost : '');

		that.ghost.appendTo(that.helper);

	},

	resize: function(){
		var that = $(this).data("ui-resizable");
		if (that.ghost) that.ghost.css({ position: 'relative', height: that.size.height, width: that.size.width });
	},

	stop: function() {
		var that = $(this).data("ui-resizable");
		if (that.ghost && that.helper) that.helper.get(0).removeChild(that.ghost.get(0));
	}

});

$.ui.plugin.add("resizable", "grid", {

	resize: function() {
		var that = $(this).data("ui-resizable"), o = that.options, cs = that.size, os = that.originalSize, op = that.originalPosition, a = that.axis;
		o.grid = typeof o.grid == "number" ? [o.grid, o.grid] : o.grid;
		var gridX = (o.grid[0]||1), gridY = (o.grid[1]||1),
			ox = Math.round((cs.width - os.width) / gridX) * gridX, oy = Math.round((cs.height - os.height) / gridY) * gridY,
			newWidth = os.width + ox, newHeight = os.height + oy,
			isMaxWidth = o.maxWidth && (o.maxWidth < newWidth), isMaxHeight = o.maxHeight && (o.maxHeight < newHeight),
			isMinWidth = o.minWidth && (o.minWidth > newWidth), isMinHeight = o.minHeight && (o.minHeight > newHeight);

		if (isMinWidth) {
			newWidth = newWidth + gridX;
		}
		if (isMinHeight) {
			newHeight = newHeight + gridY;
		}
		if (isMaxWidth) {
			newWidth = newWidth - gridX;
		}
		if (isMaxHeight) {
			newHeight = newHeight - gridY;
		}

		if (/^(se|s|e)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
		} else if (/^(ne)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.top = op.top - oy;
		} else if (/^(sw)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.left = op.left - ox;
		} else {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.top = op.top - oy;
			that.position.left = op.left - ox;
		}
	}

});

})(jQuery);/*
 * jQuery UI Sortable @VERSION
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/sortable/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

/*jshint onevar: false, curly: false, eqeqeq: false, laxbreak: true, shadow: true, loopfunc: true */
$.widget("ui.sortable", $.ui.mouse, {
	version: "@VERSION",
	widgetEventPrefix: "sort",
	ready: false,
	options: {
		appendTo: "parent",
		axis: false,
		connectWith: false,
		containment: false,
		cursor: 'auto',
		cursorAt: false,
		dropOnEmpty: true,
		forcePlaceholderSize: false,
		forceHelperSize: false,
		grid: false,
		handle: false,
		helper: "original",
		items: '> *',
		opacity: false,
		placeholder: false,
		revert: false,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		tolerance: "intersect",
		zIndex: 1000
	},
	_create: function() {

		var o = this.options;
		this.containerCache = {};
		this.element.addClass("ui-sortable");

		//Get the items
		this.refresh();

		//Let's determine if the items are being displayed horizontally
		this.floating = this.items.length ? o.axis === 'x' || (/left|right/).test(this.items[0].item.css('float')) || (/inline|table-cell/).test(this.items[0].item.css('display')) : false;

		//Let's determine the parent's offset
		this.offset = this.element.offset();

		//Initialize mouse events for interaction
		this._mouseInit();

		//We're ready to go
		this.ready = true;

	},

	_destroy: function() {
		this.element
			.removeClass("ui-sortable ui-sortable-disabled");
		this._mouseDestroy();

		for ( var i = this.items.length - 1; i >= 0; i-- )
			this.items[i].item.removeData(this.widgetName + "-item");

		return this;
	},

	_setOption: function(key, value){
		if ( key === "disabled" ) {
			this.options[ key ] = value;

			this.widget().toggleClass( "ui-sortable-disabled", !!value );
		} else {
			// Don't call widget base _setOption for disable as it adds ui-state-disabled class
			$.Widget.prototype._setOption.apply(this, arguments);
		}
	},

	_mouseCapture: function(event, overrideHandle) {
		var that = this;

		if (this.reverting) {
			return false;
		}

		if(this.options.disabled || this.options.type == 'static') return false;

		//We have to refresh the items data once first
		this._refreshItems(event);

		//Find out if the clicked node (or one of its parents) is a actual item in this.items
		var currentItem = null;

		$(event.target).parents().each(function() {
			if($.data(this, that.widgetName + '-item') == that) {
				currentItem = $(this);
				return false;
			}
		});
		if($.data(event.target, that.widgetName + '-item') == that) currentItem = $(event.target);

		if(!currentItem) return false;
		if(this.options.handle && !overrideHandle) {
			var validHandle = false;

			$(this.options.handle, currentItem).find("*").andSelf().each(function() { if(this == event.target) validHandle = true; });
			if(!validHandle) return false;
		}

		this.currentItem = currentItem;
		this._removeCurrentsFromItems();
		return true;

	},

	_mouseStart: function(event, overrideHandle, noActivation) {

		var o = this.options;
		this.currentContainer = this;

		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
		this.refreshPositions();

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Get the next scrolling parent
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.currentItem.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		// Only after we got the offset, we can change the helper's position to absolute
		// TODO: Still need to figure out a way to make relative sorting possible
		this.helper.css("position", "absolute");
		this.cssPosition = this.helper.css("position");

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Cache the former DOM position
		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
		if(this.helper[0] != this.currentItem[0]) {
			this.currentItem.hide();
		}

		//Create the placeholder
		this._createPlaceholder();

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		if(o.cursor) { // cursor option
			if ($('body').css("cursor")) this._storedCursor = $('body').css("cursor");
			$('body').css("cursor", o.cursor);
		}

		if(o.opacity) { // opacity option
			if (this.helper.css("opacity")) this._storedOpacity = this.helper.css("opacity");
			this.helper.css("opacity", o.opacity);
		}

		if(o.zIndex) { // zIndex option
			if (this.helper.css("zIndex")) this._storedZIndex = this.helper.css("zIndex");
			this.helper.css("zIndex", o.zIndex);
		}

		//Prepare scrolling
		if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML')
			this.overflowOffset = this.scrollParent.offset();

		//Call callbacks
		this._trigger("start", event, this._uiHash());

		//Recache the helper size
		if(!this._preserveHelperProportions)
			this._cacheHelperProportions();


		//Post 'activate' events to possible containers
		if(!noActivation) {
			for (var i = this.containers.length - 1; i >= 0; i--) { this.containers[i]._trigger("activate", event, this._uiHash(this)); }
		}

		//Prepare possible droppables
		if($.ui.ddmanager)
			$.ui.ddmanager.current = this;

		if ($.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(this, event);

		this.dragging = true;

		this.helper.addClass("ui-sortable-helper");
		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;

	},

	_mouseDrag: function(event) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		if (!this.lastPositionAbs) {
			this.lastPositionAbs = this.positionAbs;
		}

		//Do scrolling
		if(this.options.scroll) {
			var o = this.options, scrolled = false;
			if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {

				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
				else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;

				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
				else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;

			} else {

				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);

				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);

			}

			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
				$.ui.ddmanager.prepareOffsets(this, event);
		}

		//Regenerate the absolute position used for position checks
		this.positionAbs = this._convertPositionTo("absolute");

		//Set the helper position
		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';

		//Rearrange
		for (var i = this.items.length - 1; i >= 0; i--) {

			//Cache variables and intersection, continue if no intersection
			var item = this.items[i], itemElement = item.item[0], intersection = this._intersectsWithPointer(item);
			if (!intersection) continue;

			// Only put the placeholder inside the current Container, skip all
			// items form other containers. This works because when moving
			// an item from one container to another the
			// currentContainer is switched before the placeholder is moved.
			//
			// Without this moving items in "sub-sortables" can cause the placeholder to jitter
			// beetween the outer and inner container.
			if (item.instance !== this.currentContainer) continue;

			if (itemElement != this.currentItem[0] //cannot intersect with itself
				&&	this.placeholder[intersection == 1 ? "next" : "prev"]()[0] != itemElement //no useless actions that have been done before
				&&	!$.contains(this.placeholder[0], itemElement) //no action if the item moved is the parent of the item checked
				&& (this.options.type == 'semi-dynamic' ? !$.contains(this.element[0], itemElement) : true)
				//&& itemElement.parentNode == this.placeholder[0].parentNode // only rearrange items within the same container
			) {

				this.direction = intersection == 1 ? "down" : "up";

				if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
					this._rearrange(event, item);
				} else {
					break;
				}

				this._trigger("change", event, this._uiHash());
				break;
			}
		}

		//Post events to containers
		this._contactContainers(event);

		//Interconnect with droppables
		if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

		//Call callbacks
		this._trigger('sort', event, this._uiHash());

		this.lastPositionAbs = this.positionAbs;
		return false;

	},

	_mouseStop: function(event, noPropagation) {

		if(!event) return;

		//If we are using droppables, inform the manager about the drop
		if ($.ui.ddmanager && !this.options.dropBehaviour)
			$.ui.ddmanager.drop(this, event);

		if(this.options.revert) {
			var that = this;
			var cur = this.placeholder.offset();

			this.reverting = true;

			$(this.helper).animate({
				left: cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
				top: cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
			}, parseInt(this.options.revert, 10) || 500, function() {
				that._clear(event);
			});
		} else {
			this._clear(event, noPropagation);
		}

		return false;

	},

	cancel: function() {

		if(this.dragging) {

			this._mouseUp({ target: null });

			if(this.options.helper == "original")
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
			else
				this.currentItem.show();

			//Post deactivating events to containers
			for (var i = this.containers.length - 1; i >= 0; i--){
				this.containers[i]._trigger("deactivate", null, this._uiHash(this));
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", null, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		if (this.placeholder) {
			//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
			if(this.placeholder[0].parentNode) this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
			if(this.options.helper != "original" && this.helper && this.helper[0].parentNode) this.helper.remove();

			$.extend(this, {
				helper: null,
				dragging: false,
				reverting: false,
				_noFinalSort: null
			});

			if(this.domPosition.prev) {
				$(this.domPosition.prev).after(this.currentItem);
			} else {
				$(this.domPosition.parent).prepend(this.currentItem);
			}
		}

		return this;

	},

	serialize: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var str = []; o = o || {};

		$(items).each(function() {
			var res = ($(o.item || this).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[\-=_](.+)/));
			if(res) str.push((o.key || res[1]+'[]')+'='+(o.key && o.expression ? res[1] : res[2]));
		});

		if(!str.length && o.key) {
			str.push(o.key + '=');
		}

		return str.join('&');

	},

	toArray: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var ret = []; o = o || {};

		items.each(function() { ret.push($(o.item || this).attr(o.attribute || 'id') || ''); });
		return ret;

	},

	/* Be careful with the following core functions */
	_intersectsWith: function(item) {

		var x1 = this.positionAbs.left,
			x2 = x1 + this.helperProportions.width,
			y1 = this.positionAbs.top,
			y2 = y1 + this.helperProportions.height;

		var l = item.left,
			r = l + item.width,
			t = item.top,
			b = t + item.height;

		var dyClick = this.offset.click.top,
			dxClick = this.offset.click.left;

		var isOverElement = (y1 + dyClick) > t && (y1 + dyClick) < b && (x1 + dxClick) > l && (x1 + dxClick) < r;

		if (this.options.tolerance == "pointer"
			|| this.options.forcePointerForContainers
			|| (this.options.tolerance != "pointer" && this.helperProportions[this.floating ? 'width' : 'height'] > item[this.floating ? 'width' : 'height'])
		) {
			return isOverElement;
		} else {

			return (l < x1 + (this.helperProportions.width / 2) // Right Half
				&& x2 - (this.helperProportions.width / 2) < r // Left Half
				&& t < y1 + (this.helperProportions.height / 2) // Bottom Half
				&& y2 - (this.helperProportions.height / 2) < b ); // Top Half

		}
	},

	_intersectsWithPointer: function(item) {

		var isOverElementHeight = (this.options.axis === 'x') || $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
			isOverElementWidth = (this.options.axis === 'y') || $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
			isOverElement = isOverElementHeight && isOverElementWidth,
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (!isOverElement)
			return false;

		return this.floating ?
			( ((horizontalDirection && horizontalDirection == "right") || verticalDirection == "down") ? 2 : 1 )
			: ( verticalDirection && (verticalDirection == "down" ? 2 : 1) );

	},

	_intersectsWithSides: function(item) {

		var isOverBottomHalf = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
			isOverRightHalf = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (this.floating && horizontalDirection) {
			return ((horizontalDirection == "right" && isOverRightHalf) || (horizontalDirection == "left" && !isOverRightHalf));
		} else {
			return verticalDirection && ((verticalDirection == "down" && isOverBottomHalf) || (verticalDirection == "up" && !isOverBottomHalf));
		}

	},

	_getDragVerticalDirection: function() {
		var delta = this.positionAbs.top - this.lastPositionAbs.top;
		return delta !== 0 && (delta > 0 ? "down" : "up");
	},

	_getDragHorizontalDirection: function() {
		var delta = this.positionAbs.left - this.lastPositionAbs.left;
		return delta !== 0 && (delta > 0 ? "right" : "left");
	},

	refresh: function(event) {
		this._refreshItems(event);
		this.refreshPositions();
		return this;
	},

	_connectWith: function() {
		var options = this.options;
		return options.connectWith.constructor == String
			? [options.connectWith]
			: options.connectWith;
	},

	_getItemsAsjQuery: function(connected) {

		var items = [];
		var queries = [];
		var connectWith = this._connectWith();

		if(connectWith && connected) {
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], this.widgetFullName);
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), inst]);
					}
				}
			}
		}

		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), this]);

		for (var i = queries.length - 1; i >= 0; i--){
			queries[i][0].each(function() {
				items.push(this);
			});
		}

		return $(items);

	},

	_removeCurrentsFromItems: function() {

		var list = this.currentItem.find(":data(" + this.widgetName + "-item)");

		this.items = $.grep(this.items, function (item) {
			for (var j=0; j < list.length; j++) {
				if(list[j] == item.item[0])
					return false;
			}
			return true;
		});

	},

	_refreshItems: function(event) {

		this.items = [];
		this.containers = [this];
		var items = this.items;
		var queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]];
		var connectWith = this._connectWith();

		if(connectWith && this.ready) { //Shouldn't be run the first time through due to massive slow-down
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], this.widgetFullName);
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
						this.containers.push(inst);
					}
				}
			}
		}

		for (var i = queries.length - 1; i >= 0; i--) {
			var targetData = queries[i][1];
			var _queries = queries[i][0];

			for (var j=0, queriesLength = _queries.length; j < queriesLength; j++) {
				var item = $(_queries[j]);

				item.data(this.widgetName + '-item', targetData); // Data for target checking (mouse manager)

				items.push({
					item: item,
					instance: targetData,
					width: 0, height: 0,
					left: 0, top: 0
				});
			}
		}

	},

	refreshPositions: function(fast) {

		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
		if(this.offsetParent && this.helper) {
			this.offset.parent = this._getParentOffset();
		}

		for (var i = this.items.length - 1; i >= 0; i--){
			var item = this.items[i];

			//We ignore calculating positions of all connected containers when we're not over them
			if(item.instance != this.currentContainer && this.currentContainer && item.item[0] != this.currentItem[0])
				continue;

			var t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

			if (!fast) {
				item.width = t.outerWidth();
				item.height = t.outerHeight();
			}

			var p = t.offset();
			item.left = p.left;
			item.top = p.top;
		}

		if(this.options.custom && this.options.custom.refreshContainers) {
			this.options.custom.refreshContainers.call(this);
		} else {
			for (var i = this.containers.length - 1; i >= 0; i--){
				var p = this.containers[i].element.offset();
				this.containers[i].containerCache.left = p.left;
				this.containers[i].containerCache.top = p.top;
				this.containers[i].containerCache.width	= this.containers[i].element.outerWidth();
				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			}
		}

		return this;
	},

	_createPlaceholder: function(that) {
		that = that || this;
		var o = that.options;

		if(!o.placeholder || o.placeholder.constructor == String) {
			var className = o.placeholder;
			o.placeholder = {
				element: function() {

					var el = $(document.createElement(that.currentItem[0].nodeName))
						.addClass(className || that.currentItem[0].className+" ui-sortable-placeholder")
						.removeClass("ui-sortable-helper")[0];

					if(!className)
						el.style.visibility = "hidden";

					return el;
				},
				update: function(container, p) {

					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
					if(className && !o.forcePlaceholderSize) return;

					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
					if(!p.height()) { p.height(that.currentItem.innerHeight() - parseInt(that.currentItem.css('paddingTop')||0, 10) - parseInt(that.currentItem.css('paddingBottom')||0, 10)); }
					if(!p.width()) { p.width(that.currentItem.innerWidth() - parseInt(that.currentItem.css('paddingLeft')||0, 10) - parseInt(that.currentItem.css('paddingRight')||0, 10)); }
				}
			};
		}

		//Create the placeholder
		that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));

		//Append it after the actual current item
		that.currentItem.after(that.placeholder);

		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
		o.placeholder.update(that, that.placeholder);

	},

	_contactContainers: function(event) {

		// get innermost container that intersects with item
		var innermostContainer = null, innermostIndex = null;


		for (var i = this.containers.length - 1; i >= 0; i--){

			// never consider a container that's located within the item itself
			if($.contains(this.currentItem[0], this.containers[i].element[0]))
				continue;

			if(this._intersectsWith(this.containers[i].containerCache)) {

				// if we've already found a container and it's more "inner" than this, then continue
				if(innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0]))
					continue;

				innermostContainer = this.containers[i];
				innermostIndex = i;

			} else {
				// container doesn't intersect. trigger "out" event if necessary
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", event, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		// if no intersecting containers found, return
		if(!innermostContainer) return;

		// move the item into the container if it's not there already
		if(this.containers.length === 1) {
			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		} else {

			//When entering a new container, we will find the item with the least distance and append our item near it
			var dist = 10000; var itemWithLeastDistance = null;
			var posProperty = this.containers[innermostIndex].floating ? 'left' : 'top';
			var sizeProperty = this.containers[innermostIndex].floating ? 'width' : 'height';
			var base = this.positionAbs[posProperty] + this.offset.click[posProperty];
			for (var j = this.items.length - 1; j >= 0; j--) {
				if(!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) continue;
				if(this.items[j].item[0] == this.currentItem[0]) continue;
				var cur = this.items[j].item.offset()[posProperty];
				var nearBottom = false;
				if(Math.abs(cur - base) > Math.abs(cur + this.items[j][sizeProperty] - base)){
					nearBottom = true;
					cur += this.items[j][sizeProperty];
				}

				if(Math.abs(cur - base) < dist) {
					dist = Math.abs(cur - base); itemWithLeastDistance = this.items[j];
					this.direction = nearBottom ? "up": "down";
				}
			}

			if(!itemWithLeastDistance && !this.options.dropOnEmpty) //Check if dropOnEmpty is enabled
				return;

			this.currentContainer = this.containers[innermostIndex];
			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
			this._trigger("change", event, this._uiHash());
			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));

			//Update the placeholder
			this.options.placeholder.update(this.currentContainer, this.placeholder);

			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		}


	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper == 'clone' ? this.currentItem.clone() : this.currentItem);

		if(!helper.parents('body').length) //Add the helper to the DOM if that didn't happen already
			$(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);

		if(helper[0] == this.currentItem[0])
			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };

		if(!helper[0].style.width || o.forceHelperSize) helper.width(this.currentItem.width());
		if(!helper[0].style.height || o.forceHelperSize) helper.height(this.currentItem.height());

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj == 'string') {
			obj = obj.split(' ');
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ('left' in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ('right' in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ('top' in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ('bottom' in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {


		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.ui.ie)) //Ugly IE fix
			po = { top: 0, left: 0 };

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition == "relative") {
			var p = this.currentItem.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var o = this.options;
		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
		if(o.containment == 'document' || o.containment == 'window') this.containment = [
			0 - this.offset.relative.left - this.offset.parent.left,
			0 - this.offset.relative.top - this.offset.parent.top,
			$(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

		if(!(/^(document|window|parent)$/).test(o.containment)) {
			var ce = $(o.containment)[0];
			var co = $(o.containment).offset();
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		var scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition == 'relative' && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		var pageX = event.pageX;
		var pageY = event.pageY;

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
				if(event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
				if(event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
				if(event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
			}

			if(o.grid) {
				var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? ( (top - this.offset.click.top >= this.containment[1] && top - this.offset.click.top <= this.containment[3]) ? top : ((top - this.offset.click.top >= this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? ( (left - this.offset.click.left >= this.containment[0] && left - this.offset.click.left <= this.containment[2]) ? left : ((left - this.offset.click.left >= this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_rearrange: function(event, i, a, hardRefresh) {

		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction == 'down' ? i.item[0] : i.item[0].nextSibling));

		//Various things done here to improve the performance:
		// 1. we create a setTimeout, that calls refreshPositions
		// 2. on the instance, we have a counter variable, that get's higher after every append
		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
		// 4. this lets only the last addition to the timeout stack through
		this.counter = this.counter ? ++this.counter : 1;
		var counter = this.counter;

		this._delay(function() {
			if(counter == this.counter) this.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
		});

	},

	_clear: function(event, noPropagation) {

		this.reverting = false;
		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
		// everything else normalized again
		var delayedTriggers = [];

		// We first have to update the dom position of the actual currentItem
		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
		if(!this._noFinalSort && this.currentItem.parent().length) this.placeholder.before(this.currentItem);
		this._noFinalSort = null;

		if(this.helper[0] == this.currentItem[0]) {
			for(var i in this._storedCSS) {
				if(this._storedCSS[i] == 'auto' || this._storedCSS[i] == 'static') this._storedCSS[i] = '';
			}
			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
		} else {
			this.currentItem.show();
		}

		if(this.fromOutside && !noPropagation) delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
		if((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !noPropagation) delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed

		// Check if the items Container has Changed and trigger appropriate
		// events.
		if (this !== this.currentContainer) {
			if(!noPropagation) {
				delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
				delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.currentContainer));
				delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.currentContainer));
			}
		}


		//Post events to containers
		for (var i = this.containers.length - 1; i >= 0; i--){
			if(!noPropagation) delayedTriggers.push((function(c) { return function(event) { c._trigger("deactivate", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
			if(this.containers[i].containerCache.over) {
				delayedTriggers.push((function(c) { return function(event) { c._trigger("out", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
				this.containers[i].containerCache.over = 0;
			}
		}

		//Do what was originally in plugins
		if(this._storedCursor) $('body').css("cursor", this._storedCursor); //Reset cursor
		if(this._storedOpacity) this.helper.css("opacity", this._storedOpacity); //Reset opacity
		if(this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == 'auto' ? '' : this._storedZIndex); //Reset z-index

		this.dragging = false;
		if(this.cancelHelperRemoval) {
			if(!noPropagation) {
				this._trigger("beforeStop", event, this._uiHash());
				for (var i=0; i < delayedTriggers.length; i++) {
					delayedTriggers[i].call(this, event);
				} //Trigger all delayed events
				this._trigger("stop", event, this._uiHash());
			}

			this.fromOutside = false;
			return false;
		}

		if(!noPropagation) this._trigger("beforeStop", event, this._uiHash());

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

		if(this.helper[0] != this.currentItem[0]) this.helper.remove(); this.helper = null;

		if(!noPropagation) {
			for (var i=0; i < delayedTriggers.length; i++) {
				delayedTriggers[i].call(this, event);
			} //Trigger all delayed events
			this._trigger("stop", event, this._uiHash());
		}

		this.fromOutside = false;
		return true;

	},

	_trigger: function() {
		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
			this.cancel();
		}
	},

	_uiHash: function(_inst) {
		var inst = _inst || this;
		return {
			helper: inst.helper,
			placeholder: inst.placeholder || $([]),
			position: inst.position,
			originalPosition: inst.originalPosition,
			offset: inst.positionAbs,
			item: inst.currentItem,
			sender: _inst ? _inst.element : null
		};
	}

});

})(jQuery);(function($){
/*
 * Editable 1.3.3
 *
 * Copyright (c) 2009 Arash Karimzadeh (arashkarimzadeh.com)
 * Licensed under the MIT (MIT-LICENSE.txt)
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Date: Mar 02 2009
 */
$.fn.editable = function(options){
	var defaults = {
		onEdit: null,
		onSubmit: null,
		onCancel: null,
		editClass: null,
		submit: null,
		cancel: null,
		type: 'text', //text, textarea or select
		submitBy: 'blur', //blur,change,dblclick,click
		editBy: 'click',
		options: null
	}
	if(options=='disable')
		return this.unbind(this.data('editable.options').editBy,this.data('editable.options').toEditable);
	if(options=='enable')
		return this.bind(this.data('editable.options').editBy,this.data('editable.options').toEditable);
	if(options=='destroy')
		return  this.unbind(this.data('editable.options').editBy,this.data('editable.options').toEditable)
					.data('editable.previous',null)
					.data('editable.current',null)
					.data('editable.options',null);
	
	var options = $.extend(defaults, options);
	
	options.toEditable = function () {
		$this = $(this);
		$this.data('editable.current', $this.html());
		opts = $this.data('editable.options');
		$.editableFactory[opts.type].toEditable($this.empty(),opts);
		// Configure events,styles for changed content
		$this.data('editable.previous', $this.data('editable.current'))
			.children()
			.focus().select()
			.addClass(opts.editClass);
		// Submit Event
		$this.one(opts.submitBy, function () {
				opts.toNonEditable($(this), true);
			}).
			children().
			one(opts.submitBy, function () {
				opts.toNonEditable($(this).parent(), true);
			});
		if($.isFunction(opts.onEdit))
			opts.onEdit.apply(	$this,
									[{
										current:$this.data('editable.current'),
										previous:$this.data('editable.previous')
									}]
								);
	}
	options.toNonEditable = function($this,change){
		opts = $this.data('editable.options');
		// Configure events,styles for changed content
		$this.one(opts.editBy,opts.toEditable)
			 .data( 'editable.current',
				    change 
						?$.editableFactory[opts.type].getValue($this,opts)
						:$this.data('editable.current')
					)
			 .html(
				    opts.type=='password'
				   		?'*****'
						:$this.data('editable.current')
					);
		// Call User Function
		var func = null;
		if($.isFunction(opts.onSubmit)&&change==true)
			func = opts.onSubmit;
		else if($.isFunction(opts.onCancel)&&change==false)
			func = opts.onCancel;
		if(func!=null)
			func.apply($this,
						[{
							current:$this.data('editable.current'),
							previous:$this.data('editable.previous')
						}]
					);
	}
	this.data('editable.options',options);
	return  this.one(options.editBy,options.toEditable);
}
$.editableFactory = {
	'text': {
		toEditable: function($this,options){
			$('<input/>').appendTo($this)
						 .val($this.data('editable.current'));
		},
		getValue: function($this,options){
			return $this.children().val();
		}
	},
	'password': {
		toEditable: function($this,options){
			$this.data('editable.current',$this.data('editable.password'));
			$this.data('editable.previous',$this.data('editable.password'));
			$('<input type="password"/>').appendTo($this)
										 .val($this.data('editable.current'));
		},
		getValue: function($this,options){
			$this.data('editable.password',$this.children().val());
			return $this.children().val();
		}
	},
	'textarea': {
		toEditable: function($this,options){
			$('<textarea/>').appendTo($this)
							.val($this.data('editable.current').replace(/&nbsp;/g, ' ').replace(/<br>/g, '\n'));
		},
		getValue: function($this,options){
			return $this.children().val().replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');
		}
	},
	'select': {
		toEditable: function($this,options){
			$select = $('<select/>').appendTo($this);
			$.each( options.options,
					function(key,value){
						$('<option/>').appendTo($select)
									.html(value)
									.attr('value',key);
					}
				   )
			$select.children().each(
				function(){
					var opt = $(this);
					if(opt.text()==$this.data('editable.current'))
						return opt.attr('selected', 'selected').text();
				}
			)
		},
		getValue: function($this,options){
			var item = null;
			$('select', $this).children().each(
				function(){
					if($(this).attr('selected'))
						return item = $(this).text();
				}
			)
			return item;
		}
	}
}
})(jQuery);(function( $, undefined ) {

var lastActive, startXPos, startYPos, clickDragged,
	baseClasses = "ui-button ui-widget ui-state-default ui-corner-all",
	stateClasses = "ui-state-hover ui-state-active ",
	typeClasses = "ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only",
	formResetHandler = function() {
		var buttons = $( this ).find( ":ui-button" );
		setTimeout(function() {
			buttons.button( "refresh" );
		}, 1 );
	},
	radioGroup = function( radio ) {
		var name = radio.name,
			form = radio.form,
			radios = $( [] );
		if ( name ) {
			if ( form ) {
				radios = $( form ).find( "[name='" + name + "']" );
			} else {
				radios = $( "[name='" + name + "']", radio.ownerDocument )
					.filter(function() {
						return !this.form;
					});
			}
		}
		return radios;
	};

$.widget( "ui.button", {
	version: "@VERSION",
	defaultElement: "<button>",
	options: {
		disabled: null,
		text: true,
		label: null,
		icons: {
			primary: null,
			secondary: null
		}
	},
	_create: function() {
		this.element.closest( "form" )
			.unbind( "reset" + this.eventNamespace )
			.bind( "reset" + this.eventNamespace, formResetHandler );

		if ( typeof this.options.disabled !== "boolean" ) {
			this.options.disabled = !!this.element.prop( "disabled" );
		} else {
			this.element.prop( "disabled", this.options.disabled );
		}

		this._determineButtonType();
		this.hasTitle = !!this.buttonElement.attr( "title" );

		var that = this,
			options = this.options,
			toggleButton = this.type === "checkbox" || this.type === "radio",
			hoverClass = "ui-state-hover" + ( !toggleButton ? " ui-state-active" : "" ),
			focusClass = "ui-state-focus";

		if ( options.label === null ) {
			options.label = (this.type === "input" ? this.buttonElement.val() : this.buttonElement.html());
		}

		this.buttonElement
			.addClass( baseClasses )
			.attr( "role", "button" )
			.bind( "mouseenter" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return;
				}
				$( this ).addClass( "ui-state-hover" );
				if ( this === lastActive ) {
					$( this ).addClass( "ui-state-active" );
				}
			})
			.bind( "mouseleave" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return;
				}
				$( this ).removeClass( hoverClass );
			})
			.bind( "click" + this.eventNamespace, function( event ) {
				if ( options.disabled ) {
					event.preventDefault();
					event.stopImmediatePropagation();
				}
			});

		this.element
			.bind( "focus" + this.eventNamespace, function() {
				// no need to check disabled, focus won't be triggered anyway
				that.buttonElement.addClass( focusClass );
			})
			.bind( "blur" + this.eventNamespace, function() {
				that.buttonElement.removeClass( focusClass );
			});

		if ( toggleButton ) {
			this.element.bind( "change" + this.eventNamespace, function() {
				if ( clickDragged ) {
					return;
				}
				that.refresh();
			});
			// if mouse moves between mousedown and mouseup (drag) set clickDragged flag
			// prevents issue where button state changes but checkbox/radio checked state
			// does not in Firefox (see ticket #6970)
			this.buttonElement
				.bind( "mousedown" + this.eventNamespace, function( event ) {
					if ( options.disabled ) {
						return;
					}
					clickDragged = false;
					startXPos = event.pageX;
					startYPos = event.pageY;
				})
				.bind( "mouseup" + this.eventNamespace, function( event ) {
					if ( options.disabled ) {
						return;
					}
					if ( startXPos !== event.pageX || startYPos !== event.pageY ) {
						clickDragged = true;
					}
			});
		}

		if ( this.type === "checkbox" ) {
			this.buttonElement.bind( "click" + this.eventNamespace, function() {
				if ( options.disabled || clickDragged ) {
					return false;
				}
				$( this ).toggleClass( "ui-state-active" );
				that.buttonElement.attr( "aria-pressed", that.element[0].checked );
			});
		} else if ( this.type === "radio" ) {
			this.buttonElement.bind( "click" + this.eventNamespace, function() {
				if ( options.disabled || clickDragged ) {
					return false;
				}
				$( this ).addClass( "ui-state-active" );
				that.buttonElement.attr( "aria-pressed", "true" );

				var radio = that.element[ 0 ];
				radioGroup( radio )
					.not( radio )
					.map(function() {
						return $( this ).button( "widget" )[ 0 ];
					})
					.removeClass( "ui-state-active" )
					.attr( "aria-pressed", "false" );
			});
		} else {
			this.buttonElement
				.bind( "mousedown" + this.eventNamespace, function() {
					if ( options.disabled ) {
						return false;
					}
					$( this ).addClass( "ui-state-active" );
					lastActive = this;
					that.document.one( "mouseup", function() {
						lastActive = null;
					});
				})
				.bind( "mouseup" + this.eventNamespace, function() {
					if ( options.disabled ) {
						return false;
					}
					$( this ).removeClass( "ui-state-active" );
				})
				.bind( "keydown" + this.eventNamespace, function(event) {
					if ( options.disabled ) {
						return false;
					}
					if ( event.keyCode === $.ui.keyCode.SPACE || event.keyCode === $.ui.keyCode.ENTER ) {
						$( this ).addClass( "ui-state-active" );
					}
				})
				.bind( "keyup" + this.eventNamespace, function() {
					$( this ).removeClass( "ui-state-active" );
				});

			if ( this.buttonElement.is("a") ) {
				this.buttonElement.keyup(function(event) {
					if ( event.keyCode === $.ui.keyCode.SPACE ) {
						// TODO pass through original event correctly (just as 2nd argument doesn't work)
						$( this ).click();
					}
				});
			}
		}

		// TODO: pull out $.Widget's handling for the disabled option into
		// $.Widget.prototype._setOptionDisabled so it's easy to proxy and can
		// be overridden by individual plugins
		this._setOption( "disabled", options.disabled );
		this._resetButton();
	},

	_determineButtonType: function() {
		var ancestor, labelSelector, checked;

		if ( this.element.is("[type=checkbox]") ) {
			this.type = "checkbox";
		} else if ( this.element.is("[type=radio]") ) {
			this.type = "radio";
		} else if ( this.element.is("input") ) {
			this.type = "input";
		} else {
			this.type = "button";
		}

		if ( this.type === "checkbox" || this.type === "radio" ) {
			// we don't search against the document in case the element
			// is disconnected from the DOM
			ancestor = this.element.parents().last();
			labelSelector = "label[for='" + this.element.attr("id") + "']";
			this.buttonElement = ancestor.find( labelSelector );
			if ( !this.buttonElement.length ) {
				ancestor = ancestor.length ? ancestor.siblings() : this.element.siblings();
				this.buttonElement = ancestor.filter( labelSelector );
				if ( !this.buttonElement.length ) {
					this.buttonElement = ancestor.find( labelSelector );
				}
			}
			this.element.addClass( "ui-helper-hidden-accessible" );

			checked = this.element.is( ":checked" );
			if ( checked ) {
				this.buttonElement.addClass( "ui-state-active" );
			}
			this.buttonElement.prop( "aria-pressed", checked );
		} else {
			this.buttonElement = this.element;
		}
	},

	widget: function() {
		return this.buttonElement;
	},

	_destroy: function() {
		this.element
			.removeClass( "ui-helper-hidden-accessible" );
		this.buttonElement
			.removeClass( baseClasses + " " + stateClasses + " " + typeClasses )
			.removeAttr( "role" )
			.removeAttr( "aria-pressed" )
			.html( this.buttonElement.find(".ui-button-text").html() );

		if ( !this.hasTitle ) {
			this.buttonElement.removeAttr( "title" );
		}
	},

	_setOption: function( key, value ) {
		this._super( key, value );
		if ( key === "disabled" ) {
			if ( value ) {
				this.element.prop( "disabled", true );
			} else {
				this.element.prop( "disabled", false );
			}
			return;
		}
		this._resetButton();
	},

	refresh: function() {
		var isDisabled = this.element.is( ":disabled" );
		if ( isDisabled !== this.options.disabled ) {
			this._setOption( "disabled", isDisabled );
		}
		if ( this.type === "radio" ) {
			radioGroup( this.element[0] ).each(function() {
				if ( $( this ).is( ":checked" ) ) {
					$( this ).button( "widget" )
						.addClass( "ui-state-active" )
						.attr( "aria-pressed", "true" );
				} else {
					$( this ).button( "widget" )
						.removeClass( "ui-state-active" )
						.attr( "aria-pressed", "false" );
				}
			});
		} else if ( this.type === "checkbox" ) {
			if ( this.element.is( ":checked" ) ) {
				this.buttonElement
					.addClass( "ui-state-active" )
					.attr( "aria-pressed", "true" );
			} else {
				this.buttonElement
					.removeClass( "ui-state-active" )
					.attr( "aria-pressed", "false" );
			}
		}
	},

	_resetButton: function() {
		if ( this.type === "input" ) {
			if ( this.options.label ) {
				this.element.val( this.options.label );
			}
			return;
		}
		var buttonElement = this.buttonElement.removeClass( typeClasses ),
			buttonText = $( "<span></span>", this.document[0] )
				.addClass( "ui-button-text" )
				.html( this.options.label )
				.appendTo( buttonElement.empty() )
				.text(),
			icons = this.options.icons,
			multipleIcons = icons.primary && icons.secondary,
			buttonClasses = [];

		if ( icons.primary || icons.secondary ) {
			if ( this.options.text ) {
				buttonClasses.push( "ui-button-text-icon" + ( multipleIcons ? "s" : ( icons.primary ? "-primary" : "-secondary" ) ) );
			}

			if ( icons.primary ) {
				buttonElement.prepend( "<span class='ui-button-icon-primary ui-icon " + icons.primary + "'></span>" );
			}

			if ( icons.secondary ) {
				buttonElement.append( "<span class='ui-button-icon-secondary ui-icon " + icons.secondary + "'></span>" );
			}

			if ( !this.options.text ) {
				buttonClasses.push( multipleIcons ? "ui-button-icons-only" : "ui-button-icon-only" );

				if ( !this.hasTitle ) {
					buttonElement.attr( "title", $.trim( buttonText ) );
				}
			}
		} else {
			buttonClasses.push( "ui-button-text-only" );
		}
		buttonElement.addClass( buttonClasses.join( " " ) );
	}
});

$.widget( "ui.buttonset", {
	version: "@VERSION",
	options: {
		items: "button, input[type=button], input[type=submit], input[type=reset], input[type=checkbox], input[type=radio], a, :data(button)"
	},

	_create: function() {
		this.element.addClass( "ui-buttonset" );
	},

	_init: function() {
		this.refresh();
	},

	_setOption: function( key, value ) {
		if ( key === "disabled" ) {
			this.buttons.button( "option", key, value );
		}

		this._super( key, value );
	},

	refresh: function() {
		var rtl = this.element.css( "direction" ) === "rtl";

		this.buttons = this.element.find( this.options.items )
			.filter( ":ui-button" )
				.button( "refresh" )
			.end()
			.not( ":ui-button" )
				.button()
			.end()
			.map(function() {
				return $( this ).button( "widget" )[ 0 ];
			})
				.removeClass( "ui-corner-all ui-corner-left ui-corner-right" )
				.filter( ":first" )
					.addClass( rtl ? "ui-corner-right" : "ui-corner-left" )
				.end()
				.filter( ":last" )
					.addClass( rtl ? "ui-corner-left" : "ui-corner-right" )
				.end()
			.end();
	},

	_destroy: function() {
		this.element.removeClass( "ui-buttonset" );
		this.buttons
			.map(function() {
				return $( this ).button( "widget" )[ 0 ];
			})
				.removeClass( "ui-corner-left ui-corner-right" )
			.end()
			.button( "destroy" );
	}
});

}( jQuery ) );/*
 * jQuery UI Spinner @VERSION
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/spinner/
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.widget.js
 *  jquery.ui.button.js
 */
(function( $ ) {

function modifier( fn ) {
	return function() {
		var previous = this.element.val();
		fn.apply( this, arguments );
		this._refresh();
		if ( previous !== this.element.val() ) {
			this._trigger( "change" );
		}
	};
}

$.widget( "ui.spinner", {
	version: "@VERSION",
	defaultElement: "<input>",
	widgetEventPrefix: "spin",
	options: {
		culture: null,
		icons: {
			down: "ui-icon-triangle-1-s",
			up: "ui-icon-triangle-1-n"
		},
		incremental: true,
		max: null,
		min: null,
		numberFormat: null,
		page: 10,
		step: 1,

		change: null,
		spin: null,
		start: null,
		stop: null
	},

	_create: function() {
		// handle string values that need to be parsed
		this._setOption( "max", this.options.max );
		this._setOption( "min", this.options.min );
		this._setOption( "step", this.options.step );

		// format the value, but don't constrain
		this._value( this.element.val(), true );

		this._draw();
		this._on( this._events );
		this._refresh();

		// turning off autocomplete prevents the browser from remembering the
		// value when navigating through history, so we re-enable autocomplete
		// if the page is unloaded before the widget is destroyed. #7790
		this._on( this.window, {
			beforeunload: function() {
				this.element.removeAttr( "autocomplete" );
			}
		});
	},

	_getCreateOptions: function() {
		var options = {},
			element = this.element;

		$.each( [ "min", "max", "step" ], function( i, option ) {
			var value = element.attr( option );
			if ( value !== undefined && value.length ) {
				options[ option ] = value;
			}
		});

		return options;
	},

	_events: {
		keydown: function( event ) {
			if ( this._start( event ) && this._keydown( event ) ) {
				event.preventDefault();
			}
		},
		keyup: "_stop",
		focus: function() {
			this.previous = this.element.val();
		},
		blur: function( event ) {
			if ( this.cancelBlur ) {
				delete this.cancelBlur;
				return;
			}

			this._refresh();
			if ( this.previous !== this.element.val() ) {
				this._trigger( "change", event );
			}
		},
		mousewheel: function( event, delta ) {
			if ( !delta ) {
				return;
			}
			if ( !this.spinning && !this._start( event ) ) {
				return false;
			}

			this._spin( (delta > 0 ? 1 : -1) * this.options.step, event );
			clearTimeout( this.mousewheelTimer );
			this.mousewheelTimer = this._delay(function() {
				if ( this.spinning ) {
					this._stop( event );
				}
			}, 100 );
			event.preventDefault();
		},
		"mousedown .ui-spinner-button": function( event ) {
			var previous;

			// We never want the buttons to have focus; whenever the user is
			// interacting with the spinner, the focus should be on the input.
			// If the input is focused then this.previous is properly set from
			// when the input first received focus. If the input is not focused
			// then we need to set this.previous based on the value before spinning.
			previous = this.element[0] === this.document[0].activeElement ?
				this.previous : this.element.val();
			function checkFocus() {
				var isActive = this.element[0] === this.document[0].activeElement;
				if ( !isActive ) {
					this.element.focus();
					this.previous = previous;
					// support: IE
					// IE sets focus asynchronously, so we need to check if focus
					// moved off of the input because the user clicked on the button.
					this._delay(function() {
						this.previous = previous;
					});
				}
			}

			// ensure focus is on (or stays on) the text field
			event.preventDefault();
			checkFocus.call( this );

			// support: IE
			// IE doesn't prevent moving focus even with event.preventDefault()
			// so we set a flag to know when we should ignore the blur event
			// and check (again) if focus moved off of the input.
			this.cancelBlur = true;
			this._delay(function() {
				delete this.cancelBlur;
				checkFocus.call( this );
			});

			if ( this._start( event ) === false ) {
				return;
			}

			this._repeat( null, $( event.currentTarget ).hasClass( "ui-spinner-up" ) ? 1 : -1, event );
		},
		"mouseup .ui-spinner-button": "_stop",
		"mouseenter .ui-spinner-button": function( event ) {
			// button will add ui-state-active if mouse was down while mouseleave and kept down
			if ( !$( event.currentTarget ).hasClass( "ui-state-active" ) ) {
				return;
			}

			if ( this._start( event ) === false ) {
				return false;
			}
			this._repeat( null, $( event.currentTarget ).hasClass( "ui-spinner-up" ) ? 1 : -1, event );
		},
		// TODO: do we really want to consider this a stop?
		// shouldn't we just stop the repeater and wait until mouseup before
		// we trigger the stop event?
		"mouseleave .ui-spinner-button": "_stop"
	},

	_draw: function() {
		var uiSpinner = this.uiSpinner = this.element
			.addClass( "ui-spinner-input" )
			.attr( "autocomplete", "off" )
			.wrap( this._uiSpinnerHtml() )
			.parent()
				// add buttons
				.append( this._buttonHtml() );

		this.element.attr( "role", "spinbutton" );

		// button bindings
		this.buttons = uiSpinner.find( ".ui-spinner-button" )
			.attr( "tabIndex", -1 )
			.button()
			.removeClass( "ui-corner-all" );

		// IE 6 doesn't understand height: 50% for the buttons
		// unless the wrapper has an explicit height
		if ( this.buttons.height() > Math.ceil( uiSpinner.height() * 0.5 ) &&
				uiSpinner.height() > 0 ) {
			uiSpinner.height( uiSpinner.height() );
		}

		// disable spinner if element was already disabled
		if ( this.options.disabled ) {
			this.disable();
		}
	},

	_keydown: function( event ) {
		var options = this.options,
			keyCode = $.ui.keyCode;

		switch ( event.keyCode ) {
		case keyCode.UP:
			this._repeat( null, 1, event );
			return true;
		case keyCode.DOWN:
			this._repeat( null, -1, event );
			return true;
		case keyCode.PAGE_UP:
			this._repeat( null, options.page, event );
			return true;
		case keyCode.PAGE_DOWN:
			this._repeat( null, -options.page, event );
			return true;
		}

		return false;
	},

	_uiSpinnerHtml: function() {
		return "<span class='ui-spinner ui-widget ui-widget-content ui-corner-all'></span>";
	},

	_buttonHtml: function() {
		return "" +
			"<a class='ui-spinner-button ui-spinner-up ui-corner-tr'>" +
				"<span class='ui-icon " + this.options.icons.up + "'>&#9650;</span>" +
			"</a>" +
			"<a class='ui-spinner-button ui-spinner-down ui-corner-br'>" +
				"<span class='ui-icon " + this.options.icons.down + "'>&#9660;</span>" +
			"</a>";
	},

	_start: function( event ) {
		if ( !this.spinning && this._trigger( "start", event ) === false ) {
			return false;
		}

		if ( !this.counter ) {
			this.counter = 1;
		}
		this.spinning = true;
		return true;
	},

	_repeat: function( i, steps, event ) {
		i = i || 500;

		clearTimeout( this.timer );
		this.timer = this._delay(function() {
			this._repeat( 40, steps, event );
		}, i );

		this._spin( steps * this.options.step, event );
	},

	_spin: function( step, event ) {
		var value = this.value() || 0;

		if ( !this.counter ) {
			this.counter = 1;
		}

		value = this._adjustValue( value + step * this._increment( this.counter ) );

		if ( !this.spinning || this._trigger( "spin", event, { value: value } ) !== false) {
			this._value( value );
			this.counter++;
		}
	},

	_increment: function( i ) {
		var incremental = this.options.incremental;

		if ( incremental ) {
			return $.isFunction( incremental ) ?
				incremental( i ) :
				Math.floor( i*i*i/50000 - i*i/500 + 17*i/200 + 1 );
		}

		return 1;
	},

	_precision: function() {
		var precision = this._precisionOf( this.options.step );
		if ( this.options.min !== null ) {
			precision = Math.max( precision, this._precisionOf( this.options.min ) );
		}
		return precision;
	},

	_precisionOf: function( num ) {
		var str = num.toString(),
			decimal = str.indexOf( "." );
		return decimal === -1 ? 0 : str.length - decimal - 1;
	},

	_adjustValue: function( value ) {
		var base, aboveMin,
			options = this.options;

		// make sure we're at a valid step
		// - find out where we are relative to the base (min or 0)
		base = options.min !== null ? options.min : 0;
		aboveMin = value - base;
		// - round to the nearest step
		aboveMin = Math.round(aboveMin / options.step) * options.step;
		// - rounding is based on 0, so adjust back to our base
		value = base + aboveMin;

		// fix precision from bad JS floating point math
		value = parseFloat( value.toFixed( this._precision() ) );

		// clamp the value
		if ( options.max !== null && value > options.max) {
			return options.max;
		}
		if ( options.min !== null && value < options.min ) {
			return options.min;
		}

		return value;
	},

	_stop: function( event ) {
		if ( !this.spinning ) {
			return;
		}

		clearTimeout( this.timer );
		clearTimeout( this.mousewheelTimer );
		this.counter = 0;
		this.spinning = false;
		this._trigger( "stop", event );
	},

	_setOption: function( key, value ) {
		if ( key === "culture" || key === "numberFormat" ) {
			var prevValue = this._parse( this.element.val() );
			this.options[ key ] = value;
			this.element.val( this._format( prevValue ) );
			return;
		}

		if ( key === "max" || key === "min" || key === "step" ) {
			if ( typeof value === "string" ) {
				value = this._parse( value );
			}
		}

		this._super( key, value );

		if ( key === "disabled" ) {
			if ( value ) {
				this.element.prop( "disabled", true );
				this.buttons.button( "disable" );
			} else {
				this.element.prop( "disabled", false );
				this.buttons.button( "enable" );
			}
		}
	},

	_setOptions: modifier(function( options ) {
		this._super( options );
		this._value( this.element.val() );
	}),

	_parse: function( val ) {
		if ( typeof val === "string" && val !== "" ) {
			val = window.Globalize && this.options.numberFormat ?
				Globalize.parseFloat( val, 10, this.options.culture ) : +val;
		}
		return val === "" || isNaN( val ) ? null : val;
	},

	_format: function( value ) {
		if ( value === "" ) {
			return "";
		}
		return window.Globalize && this.options.numberFormat ?
			Globalize.format( value, this.options.numberFormat, this.options.culture ) :
			value;
	},

	_refresh: function() {
		this.element.attr({
			"aria-valuemin": this.options.min,
			"aria-valuemax": this.options.max,
			// TODO: what should we do with values that can't be parsed?
			"aria-valuenow": this._parse( this.element.val() )
		});
	},

	// update the value without triggering change
	_value: function( value, allowAny ) {
		var parsed;
		if ( value !== "" ) {
			parsed = this._parse( value );
			if ( parsed !== null ) {
				if ( !allowAny ) {
					parsed = this._adjustValue( parsed );
				}
				value = this._format( parsed );
			}
		}
		this.element.val( value );
		this._refresh();
	},

	_destroy: function() {
		this.element
			.removeClass( "ui-spinner-input" )
			.prop( "disabled", false )
			.removeAttr( "autocomplete" )
			.removeAttr( "role" )
			.removeAttr( "aria-valuemin" )
			.removeAttr( "aria-valuemax" )
			.removeAttr( "aria-valuenow" );
		this.uiSpinner.replaceWith( this.element );
	},

	stepUp: modifier(function( steps ) {
		this._stepUp( steps );
	}),
	_stepUp: function( steps ) {
		this._spin( (steps || 1) * this.options.step );
	},

	stepDown: modifier(function( steps ) {
		this._stepDown( steps );
	}),
	_stepDown: function( steps ) {
		this._spin( (steps || 1) * -this.options.step );
	},

	pageUp: modifier(function( pages ) {
		this._stepUp( (pages || 1) * this.options.page );
	}),

	pageDown: modifier(function( pages ) {
		this._stepDown( (pages || 1) * this.options.page );
	}),

	value: function( newVal ) {
		if ( !arguments.length ) {
			return this._parse( this.element.val() );
		}
		modifier( this._value ).call( this, newVal );
	},

	widget: function() {
		return this.uiSpinner;
	}
});

}( jQuery ) );/*
 * jQuery UI Slider @VERSION
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Slider
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

// number of pages in a slider
// (how many times can you page up/down to go through the whole range)
var numPages = 5;

$.widget( "ui.slider", $.ui.mouse, {
	version: "@VERSION",
	widgetEventPrefix: "slide",

	options: {
		animate: false,
		distance: 0,
		max: 100,
		min: 0,
		orientation: "horizontal",
		range: false,
		step: 1,
		value: 0,
		values: null
	},

	_create: function() {
		var i,
			o = this.options,
			existingHandles = this.element.find( ".ui-slider-handle" ).addClass( "ui-state-default ui-corner-all" ),
			handle = "<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",
			handleCount = ( o.values && o.values.length ) || 1,
			handles = [];

		this._keySliding = false;
		this._mouseSliding = false;
		this._animateOff = true;
		this._handleIndex = null;
		this._detectOrientation();
		this._mouseInit();

		this.element
			.addClass( "ui-slider" +
				" ui-slider-" + this.orientation +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" +
				( o.disabled ? " ui-slider-disabled ui-disabled" : "" ) );

		this.range = $([]);

		if ( o.range ) {
			if ( o.range === true ) {
				if ( !o.values ) {
					o.values = [ this._valueMin(), this._valueMin() ];
				}
				if ( o.values.length && o.values.length !== 2 ) {
					o.values = [ o.values[0], o.values[0] ];
				}
			}

			this.range = $( "<div></div>" )
				.appendTo( this.element )
				.addClass( "ui-slider-range" +
				// note: this isn't the most fittingly semantic framework class for this element,
				// but worked best visually with a variety of themes
				" ui-widget-header" +
				( ( o.range === "min" || o.range === "max" ) ? " ui-slider-range-" + o.range : "" ) );
		}

		for ( i = existingHandles.length; i < handleCount; i++ ) {
			handles.push( handle );
		}

		this.handles = existingHandles.add( $( handles.join( "" ) ).appendTo( this.element ) );

		this.handle = this.handles.eq( 0 );

		this.handles.add( this.range ).filter( "a" )
			.click(function( event ) {
				event.preventDefault();
			})
			.mouseenter(function() {
				if ( !o.disabled ) {
					$( this ).addClass( "ui-state-hover" );
				}
			})
			.mouseleave(function() {
				$( this ).removeClass( "ui-state-hover" );
			})
			.focus(function() {
				if ( !o.disabled ) {
					$( ".ui-slider .ui-state-focus" ).removeClass( "ui-state-focus" );
					$( this ).addClass( "ui-state-focus" );
				} else {
					$( this ).blur();
				}
			})
			.blur(function() {
				$( this ).removeClass( "ui-state-focus" );
			});

		this.handles.each(function( i ) {
			$( this ).data( "ui-slider-handle-index", i );
		});

		this._on( this.handles, {
			keydown: function( event ) {
				var allowed, curVal, newVal, step,
					index = $( event.target ).data( "ui-slider-handle-index" );

				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
					case $.ui.keyCode.END:
					case $.ui.keyCode.PAGE_UP:
					case $.ui.keyCode.PAGE_DOWN:
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						event.preventDefault();
						if ( !this._keySliding ) {
							this._keySliding = true;
							$( event.target ).addClass( "ui-state-active" );
							allowed = this._start( event, index );
							if ( allowed === false ) {
								return;
							}
						}
						break;
				}

				step = this.options.step;
				if ( this.options.values && this.options.values.length ) {
					curVal = newVal = this.values( index );
				} else {
					curVal = newVal = this.value();
				}

				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
						newVal = this._valueMin();
						break;
					case $.ui.keyCode.END:
						newVal = this._valueMax();
						break;
					case $.ui.keyCode.PAGE_UP:
						newVal = this._trimAlignValue( curVal + ( (this._valueMax() - this._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.PAGE_DOWN:
						newVal = this._trimAlignValue( curVal - ( (this._valueMax() - this._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
						if ( curVal === this._valueMax() ) {
							return;
						}
						newVal = this._trimAlignValue( curVal + step );
						break;
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						if ( curVal === this._valueMin() ) {
							return;
						}
						newVal = this._trimAlignValue( curVal - step );
						break;
				}

				this._slide( event, index, newVal );
			},
			keyup: function( event ) {
				var index = $( event.target ).data( "ui-slider-handle-index" );

				if ( this._keySliding ) {
					this._keySliding = false;
					this._stop( event, index );
					this._change( event, index );
					$( event.target ).removeClass( "ui-state-active" );
				}
			}
		});

		this._refreshValue();

		this._animateOff = false;
	},

	_destroy: function() {
		this.handles.remove();
		this.range.remove();

		this.element
			.removeClass( "ui-slider" +
				" ui-slider-horizontal" +
				" ui-slider-vertical" +
				" ui-slider-disabled" +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" );

		this._mouseDestroy();
	},

	_mouseCapture: function( event ) {
		var position, normValue, distance, closestHandle, index, allowed, offset, mouseOverHandle,
			that = this,
			o = this.options;

		if ( o.disabled ) {
			return false;
		}

		this.elementSize = {
			width: this.element.outerWidth(),
			height: this.element.outerHeight()
		};
		this.elementOffset = this.element.offset();

		position = { x: event.pageX, y: event.pageY };
		normValue = this._normValueFromMouse( position );
		distance = this._valueMax() - this._valueMin() + 1;
		this.handles.each(function( i ) {
			var thisDistance = Math.abs( normValue - that.values(i) );
			if ( distance > thisDistance ) {
				distance = thisDistance;
				closestHandle = $( this );
				index = i;
			}
		});

		// workaround for bug #3736 (if both handles of a range are at 0,
		// the first is always used as the one with least distance,
		// and moving it is obviously prevented by preventing negative ranges)
		if( o.range === true && this.values(1) === o.min ) {
			index += 1;
			closestHandle = $( this.handles[index] );
		}

		allowed = this._start( event, index );
		if ( allowed === false ) {
			return false;
		}
		this._mouseSliding = true;

		this._handleIndex = index;

		closestHandle
			.addClass( "ui-state-active" )
			.focus();

		offset = closestHandle.offset();
		mouseOverHandle = !$( event.target ).parents().andSelf().is( ".ui-slider-handle" );
		this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
			left: event.pageX - offset.left - ( closestHandle.width() / 2 ),
			top: event.pageY - offset.top -
				( closestHandle.height() / 2 ) -
				( parseInt( closestHandle.css("borderTopWidth"), 10 ) || 0 ) -
				( parseInt( closestHandle.css("borderBottomWidth"), 10 ) || 0) +
				( parseInt( closestHandle.css("marginTop"), 10 ) || 0)
		};

		if ( !this.handles.hasClass( "ui-state-hover" ) ) {
			this._slide( event, index, normValue );
		}
		this._animateOff = true;
		return true;
	},

	_mouseStart: function( event ) {
		return true;
	},

	_mouseDrag: function( event ) {
		var position = { x: event.pageX, y: event.pageY },
			normValue = this._normValueFromMouse( position );

		this._slide( event, this._handleIndex, normValue );

		return false;
	},

	_mouseStop: function( event ) {
		this.handles.removeClass( "ui-state-active" );
		this._mouseSliding = false;

		this._stop( event, this._handleIndex );
		this._change( event, this._handleIndex );

		this._handleIndex = null;
		this._clickOffset = null;
		this._animateOff = false;

		return false;
	},

	_detectOrientation: function() {
		this.orientation = ( this.options.orientation === "vertical" ) ? "vertical" : "horizontal";
	},

	_normValueFromMouse: function( position ) {
		var pixelTotal,
			pixelMouse,
			percentMouse,
			valueTotal,
			valueMouse;

		if ( this.orientation === "horizontal" ) {
			pixelTotal = this.elementSize.width;
			pixelMouse = position.x - this.elementOffset.left - ( this._clickOffset ? this._clickOffset.left : 0 );
		} else {
			pixelTotal = this.elementSize.height;
			pixelMouse = position.y - this.elementOffset.top - ( this._clickOffset ? this._clickOffset.top : 0 );
		}

		percentMouse = ( pixelMouse / pixelTotal );
		if ( percentMouse > 1 ) {
			percentMouse = 1;
		}
		if ( percentMouse < 0 ) {
			percentMouse = 0;
		}
		if ( this.orientation === "vertical" ) {
			percentMouse = 1 - percentMouse;
		}

		valueTotal = this._valueMax() - this._valueMin();
		valueMouse = this._valueMin() + percentMouse * valueTotal;

		return this._trimAlignValue( valueMouse );
	},

	_start: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}
		return this._trigger( "start", event, uiHash );
	},

	_slide: function( event, index, newVal ) {
		var otherVal,
			newValues,
			allowed;

		if ( this.options.values && this.options.values.length ) {
			otherVal = this.values( index ? 0 : 1 );

			if ( ( this.options.values.length === 2 && this.options.range === true ) &&
					( ( index === 0 && newVal > otherVal) || ( index === 1 && newVal < otherVal ) )
				) {
				newVal = otherVal;
			}

			if ( newVal !== this.values( index ) ) {
				newValues = this.values();
				newValues[ index ] = newVal;
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal,
					values: newValues
				} );
				otherVal = this.values( index ? 0 : 1 );
				if ( allowed !== false ) {
					this.values( index, newVal, true );
				}
			}
		} else {
			if ( newVal !== this.value() ) {
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal
				} );
				if ( allowed !== false ) {
					this.value( newVal );
				}
			}
		}
	},

	_stop: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}

		this._trigger( "stop", event, uiHash );
	},

	_change: function( event, index ) {
		if ( !this._keySliding && !this._mouseSliding ) {
			var uiHash = {
				handle: this.handles[ index ],
				value: this.value()
			};
			if ( this.options.values && this.options.values.length ) {
				uiHash.value = this.values( index );
				uiHash.values = this.values();
			}

			this._trigger( "change", event, uiHash );
		}
	},

	value: function( newValue ) {
		if ( arguments.length ) {
			this.options.value = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, 0 );
			return;
		}

		return this._value();
	},

	values: function( index, newValue ) {
		var vals,
			newValues,
			i;

		if ( arguments.length > 1 ) {
			this.options.values[ index ] = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, index );
			return;
		}

		if ( arguments.length ) {
			if ( $.isArray( arguments[ 0 ] ) ) {
				vals = this.options.values;
				newValues = arguments[ 0 ];
				for ( i = 0; i < vals.length; i += 1 ) {
					vals[ i ] = this._trimAlignValue( newValues[ i ] );
					this._change( null, i );
				}
				this._refreshValue();
			} else {
				if ( this.options.values && this.options.values.length ) {
					return this._values( index );
				} else {
					return this.value();
				}
			}
		} else {
			return this._values();
		}
	},

	_setOption: function( key, value ) {
		var i,
			valsLength = 0;

		if ( $.isArray( this.options.values ) ) {
			valsLength = this.options.values.length;
		}

		$.Widget.prototype._setOption.apply( this, arguments );

		switch ( key ) {
			case "disabled":
				if ( value ) {
					this.handles.filter( ".ui-state-focus" ).blur();
					this.handles.removeClass( "ui-state-hover" );
					this.handles.prop( "disabled", true );
					this.element.addClass( "ui-disabled" );
				} else {
					this.handles.prop( "disabled", false );
					this.element.removeClass( "ui-disabled" );
				}
				break;
			case "orientation":
				this._detectOrientation();
				this.element
					.removeClass( "ui-slider-horizontal ui-slider-vertical" )
					.addClass( "ui-slider-" + this.orientation );
				this._refreshValue();
				break;
			case "value":
				this._animateOff = true;
				this._refreshValue();
				this._change( null, 0 );
				this._animateOff = false;
				break;
			case "values":
				this._animateOff = true;
				this._refreshValue();
				for ( i = 0; i < valsLength; i += 1 ) {
					this._change( null, i );
				}
				this._animateOff = false;
				break;
		}
	},

	//internal value getter
	// _value() returns value trimmed by min and max, aligned by step
	_value: function() {
		var val = this.options.value;
		val = this._trimAlignValue( val );

		return val;
	},

	//internal values getter
	// _values() returns array of values trimmed by min and max, aligned by step
	// _values( index ) returns single value trimmed by min and max, aligned by step
	_values: function( index ) {
		var val,
			vals,
			i;

		if ( arguments.length ) {
			val = this.options.values[ index ];
			val = this._trimAlignValue( val );

			return val;
		} else {
			// .slice() creates a copy of the array
			// this copy gets trimmed by min and max and then returned
			vals = this.options.values.slice();
			for ( i = 0; i < vals.length; i+= 1) {
				vals[ i ] = this._trimAlignValue( vals[ i ] );
			}

			return vals;
		}
	},

	// returns the step-aligned value that val is closest to, between (inclusive) min and max
	_trimAlignValue: function( val ) {
		if ( val <= this._valueMin() ) {
			return this._valueMin();
		}
		if ( val >= this._valueMax() ) {
			return this._valueMax();
		}
		var step = ( this.options.step > 0 ) ? this.options.step : 1,
			valModStep = (val - this._valueMin()) % step,
			alignValue = val - valModStep;

		if ( Math.abs(valModStep) * 2 >= step ) {
			alignValue += ( valModStep > 0 ) ? step : ( -step );
		}

		// Since JavaScript has problems with large floats, round
		// the final value to 5 digits after the decimal point (see #4124)
		return parseFloat( alignValue.toFixed(5) );
	},

	_valueMin: function() {
		return this.options.min;
	},

	_valueMax: function() {
		return this.options.max;
	},

	_refreshValue: function() {
		var lastValPercent, valPercent, value, valueMin, valueMax,
			oRange = this.options.range,
			o = this.options,
			that = this,
			animate = ( !this._animateOff ) ? o.animate : false,
			_set = {};

		if ( this.options.values && this.options.values.length ) {
			this.handles.each(function( i, j ) {
				valPercent = ( that.values(i) - that._valueMin() ) / ( that._valueMax() - that._valueMin() ) * 100;
				_set[ that.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
				$( this ).stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );
				if ( that.options.range === true ) {
					if ( that.orientation === "horizontal" ) {
						if ( i === 0 ) {
							that.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { left: valPercent + "%" }, o.animate );
						}
						if ( i === 1 ) {
							that.range[ animate ? "animate" : "css" ]( { width: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					} else {
						if ( i === 0 ) {
							that.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { bottom: ( valPercent ) + "%" }, o.animate );
						}
						if ( i === 1 ) {
							that.range[ animate ? "animate" : "css" ]( { height: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					}
				}
				lastValPercent = valPercent;
			});
		} else {
			value = this.value();
			valueMin = this._valueMin();
			valueMax = this._valueMax();
			valPercent = ( valueMax !== valueMin ) ?
					( value - valueMin ) / ( valueMax - valueMin ) * 100 :
					0;
			_set[ this.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
			this.handle.stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );

			if ( oRange === "min" && this.orientation === "horizontal" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { width: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "horizontal" ) {
				this.range[ animate ? "animate" : "css" ]( { width: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
			if ( oRange === "min" && this.orientation === "vertical" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { height: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "vertical" ) {
				this.range[ animate ? "animate" : "css" ]( { height: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
		}
	}

});

}(jQuery));/*
 * jQuery UI Menu @VERSION
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/menu/
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.widget.js
 *  jquery.ui.position.js
 */
(function( $, undefined ) {

var mouseHandled = false;

$.widget( "ui.menu", {
    version: "@VERSION",
    defaultElement: "<ul>",
    delay: 300,
    options: {
        icons: {
            submenu: "ui-icon-carat-1-e"
        },
        menus: "ul",
        position: {
            my: "left top",
            at: "right top"
        },
        role: "menu",

        // callbacks
        blur: null,
        focus: null,
        select: null
    },

    _create: function() {
        this.activeMenu = this.element;
        this.element
            .uniqueId()
            .addClass( "ui-menu ui-widget ui-widget-content ui-corner-all" )
            .toggleClass( "ui-menu-icons", !!this.element.find( ".ui-icon" ).length )
            .attr({
                role: this.options.role,
                tabIndex: 0
            })
            // need to catch all clicks on disabled menu
            // not possible through _on
            .bind( "click" + this.eventNamespace, $.proxy(function( event ) {
                if ( this.options.disabled ) {
                    event.preventDefault();
                }
            }, this ));

        if ( this.options.disabled ) {
            this.element
                .addClass( "ui-state-disabled" )
                .attr( "aria-disabled", "true" );
        }

        this._on({
            // Prevent focus from sticking to links inside menu after clicking
            // them (focus should always stay on UL during navigation).
            "mousedown .ui-menu-item > a": function( event ) {
                event.preventDefault();
            },
            "click .ui-state-disabled > a": function( event ) {
                event.preventDefault();
            },
            "click .ui-menu-item:has(a)": function( event ) {
                var target = $( event.target ).closest( ".ui-menu-item" );
                if ( !mouseHandled && target.not( ".ui-state-disabled" ).length ) {
                    mouseHandled = true;

                    this.select( event );
                    // Open submenu on click
                    if ( target.has( ".ui-menu" ).length ) {
                        this.expand( event );
                    } else if ( !this.element.is( ":focus" ) ) {
                        // Redirect focus to the menu
                        this.element.trigger( "focus", [ true ] );

                        // If the active item is on the top level, let it stay active.
                        // Otherwise, blur the active item since it is no longer visible.
                        if ( this.active && this.active.parents( ".ui-menu" ).length === 1 ) {
                            clearTimeout( this.timer );
                        }
                    }
                }
            },
            "mouseenter .ui-menu-item": function( event ) {
                var target = $( event.currentTarget );
                // Remove ui-state-active class from siblings of the newly focused menu item
                // to avoid a jump caused by adjacent elements both having a class with a border
                target.siblings().children( ".ui-state-active" ).removeClass( "ui-state-active" );
                this.focus( event, target );
            },
            mouseleave: "collapseAll",
            "mouseleave .ui-menu": "collapseAll",
            focus: function( event, keepActiveItem ) {
                // If there's already an active item, keep it active
                // If not, activate the first item
                var item = this.active || this.element.children( ".ui-menu-item" ).eq( 0 );

                if ( !keepActiveItem ) {
                    this.focus( event, item );
                }
            },
            blur: function( event ) {
                this._delay(function() {
                    if ( !$.contains( this.element[0], this.document[0].activeElement ) ) {
                        this.collapseAll( event );
                    }
                });
            },
            keydown: "_keydown"
        });

        this.refresh();

        // Clicks outside of a menu collapse any open menus
        this._on( this.document, {
            click: function( event ) {
                if ( !$( event.target ).closest( ".ui-menu" ).length ) {
                    this.collapseAll( event );
                }

                // Reset the mouseHandled flag
                mouseHandled = false;
            }
        });
    },

    _destroy: function() {
        // Destroy (sub)menus
        this.element
            .removeAttr( "aria-activedescendant" )
            .find( ".ui-menu" ).andSelf()
                .removeClass( "ui-menu ui-widget ui-widget-content ui-corner-all ui-menu-icons" )
                .removeAttr( "role" )
                .removeAttr( "tabIndex" )
                .removeAttr( "aria-labelledby" )
                .removeAttr( "aria-expanded" )
                .removeAttr( "aria-hidden" )
                .removeAttr( "aria-disabled" )
                .removeUniqueId()
                .show();

        // Destroy menu items
        this.element.find( ".ui-menu-item" )
            .removeClass( "ui-menu-item" )
            .removeAttr( "role" )
            .removeAttr( "aria-disabled" )
            .children( "a" )
                .removeUniqueId()
                .removeClass( "ui-corner-all ui-state-hover" )
                .removeAttr( "tabIndex" )
                .removeAttr( "role" )
                .removeAttr( "aria-haspopup" )
                .children().each( function() {
                    var elem = $( this );
                    if ( elem.data( "ui-menu-submenu-carat" ) ) {
                        elem.remove();
                    }
                });

        // Destroy menu dividers
        this.element.find( ".ui-menu-divider" ).removeClass( "ui-menu-divider ui-widget-content" );
    },

    _keydown: function( event ) {
        var match, prev, character, skip, regex,
            preventDefault = true;

        function escape( value ) {
            return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
        }

        switch ( event.keyCode ) {
        case $.ui.keyCode.PAGE_UP:
            this.previousPage( event );
            break;
        case $.ui.keyCode.PAGE_DOWN:
            this.nextPage( event );
            break;
        case $.ui.keyCode.HOME:
            this._move( "first", "first", event );
            break;
        case $.ui.keyCode.END:
            this._move( "last", "last", event );
            break;
        case $.ui.keyCode.UP:
            this.previous( event );
            break;
        case $.ui.keyCode.DOWN:
            this.next( event );
            break;
        case $.ui.keyCode.LEFT:
            this.collapse( event );
            break;
        case $.ui.keyCode.RIGHT:
            if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
                this.expand( event );
            }
            break;
        case $.ui.keyCode.ENTER:
        case $.ui.keyCode.SPACE:
            this._activate( event );
            break;
        case $.ui.keyCode.ESCAPE:
            this.collapse( event );
            break;
        default:
            preventDefault = false;
            prev = this.previousFilter || "";
            character = String.fromCharCode( event.keyCode );
            skip = false;

            clearTimeout( this.filterTimer );

            if ( character === prev ) {
                skip = true;
            } else {
                character = prev + character;
            }

            regex = new RegExp( "^" + escape( character ), "i" );
            match = this.activeMenu.children( ".ui-menu-item" ).filter(function() {
                return regex.test( $( this ).children( "a" ).text() );
            });
            match = skip && match.index( this.active.next() ) !== -1 ?
                this.active.nextAll( ".ui-menu-item" ) :
                match;

            // If no matches on the current filter, reset to the last character pressed
            // to move down the menu to the first item that starts with that character
            if ( !match.length ) {
                character = String.fromCharCode( event.keyCode );
                regex = new RegExp( "^" + escape( character ), "i" );
                match = this.activeMenu.children( ".ui-menu-item" ).filter(function() {
                    return regex.test( $( this ).children( "a" ).text() );
                });
            }

            if ( match.length ) {
                this.focus( event, match );
                if ( match.length > 1 ) {
                    this.previousFilter = character;
                    this.filterTimer = this._delay(function() {
                        delete this.previousFilter;
                    }, 1000 );
                } else {
                    delete this.previousFilter;
                }
            } else {
                delete this.previousFilter;
            }
        }

        if ( preventDefault ) {
            event.preventDefault();
        }
    },

    _activate: function( event ) {
        if ( !this.active.is( ".ui-state-disabled" ) ) {
            if ( this.active.children( "a[aria-haspopup='true']" ).length ) {
                this.expand( event );
            } else {
                this.select( event );
            }
        }
    },

    refresh: function() {
        var menus,
            icon = this.options.icons.submenu,
            submenus = this.element.find( this.options.menus );

        // Initialize nested menus
        submenus.filter( ":not(.ui-menu)" )
            .addClass( "ui-menu ui-widget ui-widget-content ui-corner-all" )
            .hide()
            .attr({
                role: this.options.role,
                "aria-hidden": "true",
                "aria-expanded": "false"
            })
            .each(function() {
                var menu = $( this ),
                    item = menu.prev( "a" ),
                    submenuCarat = $( "<span>" )
                        .addClass( "ui-menu-icon ui-icon " + icon )
                        .data( "ui-menu-submenu-carat", true );

                item
                    .attr( "aria-haspopup", "true" )
                    .prepend( submenuCarat );
                menu.attr( "aria-labelledby", item.attr( "id" ) );
            });

        menus = submenus.add( this.element );

        // Don't refresh list items that are already adapted
        menus.children( ":not(.ui-menu-item):has(a)" )
            .addClass( "ui-menu-item" )
            .attr( "role", "presentation" )
            .children( "a" )
                .uniqueId()
                .addClass( "ui-corner-all" )
                .attr({
                    tabIndex: -1,
                    role: this._itemRole()
                });

        // Initialize unlinked menu-items containing spaces and/or dashes only as dividers
        menus.children( ":not(.ui-menu-item)" ).each(function() {
            var item = $( this );
            // hyphen, em dash, en dash
            if ( !/[^\-—–\s]/.test( item.text() ) ) {
                item.addClass( "ui-widget-content ui-menu-divider" );
            }
        });

        // Add aria-disabled attribute to any disabled menu item
        menus.children( ".ui-state-disabled" ).attr( "aria-disabled", "true" );

        // If the active item has been removed, blur the menu
        if ( this.active && !$.contains( this.element[ 0 ], this.active[ 0 ] ) ) {
            this.blur();
        }
    },

    _itemRole: function() {
        return {
            menu: "menuitem",
            listbox: "option"
        }[ this.options.role ];
    },

    focus: function( event, item ) {
        var nested, focused;
        this.blur( event, event && event.type === "focus" );

        this._scrollIntoView( item );

        this.active = item.first();
        focused = this.active.children( "a" ).addClass( "ui-state-focus" );
        // Only update aria-activedescendant if there's a role
        // otherwise we assume focus is managed elsewhere
        if ( this.options.role ) {
            this.element.attr( "aria-activedescendant", focused.attr( "id" ) );
        }

        // Highlight active parent menu item, if any
        this.active
            .parent()
            .closest( ".ui-menu-item" )
            .children( "a:first" )
            .addClass( "ui-state-active" );

        if ( event && event.type === "keydown" ) {
            this._close();
        } else {
            this.timer = this._delay(function() {
                this._close();
            }, this.delay );
        }

        nested = item.children( ".ui-menu" );
        if ( nested.length && ( /^mouse/.test( event.type ) ) ) {
            this._startOpening(nested);
        }
        this.activeMenu = item.parent();

        this._trigger( "focus", event, { item: item } );
    },

    _scrollIntoView: function( item ) {
        var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
        if ( this._hasScroll() ) {
            borderTop = parseFloat( $.css( this.activeMenu[0], "borderTopWidth" ) ) || 0;
            paddingTop = parseFloat( $.css( this.activeMenu[0], "paddingTop" ) ) || 0;
            offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
            scroll = this.activeMenu.scrollTop();
            elementHeight = this.activeMenu.height();
            itemHeight = item.height();

            if ( offset < 0 ) {
                this.activeMenu.scrollTop( scroll + offset );
            } else if ( offset + itemHeight > elementHeight ) {
                this.activeMenu.scrollTop( scroll + offset - elementHeight + itemHeight );
            }
        }
    },

    blur: function( event, fromFocus ) {
        if ( !fromFocus ) {
            clearTimeout( this.timer );
        }

        if ( !this.active ) {
            return;
        }

        this.active.children( "a" ).removeClass( "ui-state-focus" );
        this.active = null;

        this._trigger( "blur", event, { item: this.active } );
    },

    _startOpening: function( submenu ) {
        clearTimeout( this.timer );

        // Don't open if already open fixes a Firefox bug that caused a .5 pixel
        // shift in the submenu position when mousing over the carat icon
        if ( submenu.attr( "aria-hidden" ) !== "true" ) {
            return;
        }

        this.timer = this._delay(function() {
            this._close();
            this._open( submenu );
        }, this.delay );
    },

    _open: function( submenu ) {
        var position = $.extend({
            of: this.active
        }, this.options.position );

        clearTimeout( this.timer );
        this.element.find( ".ui-menu" ).not( submenu.parents( ".ui-menu" ) )
            .hide()
            .attr( "aria-hidden", "true" );

        submenu
            .show()
            .removeAttr( "aria-hidden" )
            .attr( "aria-expanded", "true" )
            .position( position );
    },

    collapseAll: function( event, all ) {
        clearTimeout( this.timer );
        this.timer = this._delay(function() {
            // If we were passed an event, look for the submenu that contains the event
            var currentMenu = all ? this.element :
                $( event && event.target ).closest( this.element.find( ".ui-menu" ) );

            // If we found no valid submenu ancestor, use the main menu to close all sub menus anyway
            if ( !currentMenu.length ) {
                currentMenu = this.element;
            }

            this._close( currentMenu );

            this.blur( event );
            this.activeMenu = currentMenu;
        }, this.delay );
    },

    // With no arguments, closes the currently active menu - if nothing is active
    // it closes all menus.  If passed an argument, it will search for menus BELOW
    _close: function( startMenu ) {
        if ( !startMenu ) {
            startMenu = this.active ? this.active.parent() : this.element;
        }

        startMenu
            .find( ".ui-menu" )
                .hide()
                .attr( "aria-hidden", "true" )
                .attr( "aria-expanded", "false" )
            .end()
            .find( "a.ui-state-active" )
                .removeClass( "ui-state-active" );
    },

    collapse: function( event ) {
        var newItem = this.active &&
            this.active.parent().closest( ".ui-menu-item", this.element );
        if ( newItem && newItem.length ) {
            this._close();
            this.focus( event, newItem );
        }
    },

    expand: function( event ) {
        var newItem = this.active &&
            this.active
                .children( ".ui-menu " )
                .children( ".ui-menu-item" )
                .first();

        if ( newItem && newItem.length ) {
            this._open( newItem.parent() );

            // Delay so Firefox will not hide activedescendant change in expanding submenu from AT
            this._delay(function() {
                this.focus( event, newItem );
            });
        }
    },

    next: function( event ) {
        this._move( "next", "first", event );
    },

    previous: function( event ) {
        this._move( "prev", "last", event );
    },

    isFirstItem: function() {
        return this.active && !this.active.prevAll( ".ui-menu-item" ).length;
    },

    isLastItem: function() {
        return this.active && !this.active.nextAll( ".ui-menu-item" ).length;
    },

    _move: function( direction, filter, event ) {
        var next;
        if ( this.active ) {
            if ( direction === "first" || direction === "last" ) {
                next = this.active
                    [ direction === "first" ? "prevAll" : "nextAll" ]( ".ui-menu-item" )
                    .eq( -1 );
            } else {
                next = this.active
                    [ direction + "All" ]( ".ui-menu-item" )
                    .eq( 0 );
            }
        }
        if ( !next || !next.length || !this.active ) {
            next = this.activeMenu.children( ".ui-menu-item" )[ filter ]();
        }

        this.focus( event, next );
    },

    nextPage: function( event ) {
        var item, base, height;

        if ( !this.active ) {
            this.next( event );
            return;
        }
        if ( this.isLastItem() ) {
            return;
        }
        if ( this._hasScroll() ) {
            base = this.active.offset().top;
            height = this.element.height();
            this.active.nextAll( ".ui-menu-item" ).each(function() {
                item = $( this );
                return item.offset().top - base - height < 0;
            });

            this.focus( event, item );
        } else {
            this.focus( event, this.activeMenu.children( ".ui-menu-item" )
                [ !this.active ? "first" : "last" ]() );
        }
    },

    previousPage: function( event ) {
        var item, base, height;
        if ( !this.active ) {
            this.next( event );
            return;
        }
        if ( this.isFirstItem() ) {
            return;
        }
        if ( this._hasScroll() ) {
            base = this.active.offset().top;
            height = this.element.height();
            this.active.prevAll( ".ui-menu-item" ).each(function() {
                item = $( this );
                return item.offset().top - base + height > 0;
            });

            this.focus( event, item );
        } else {
            this.focus( event, this.activeMenu.children( ".ui-menu-item" ).first() );
        }
    },

    _hasScroll: function() {
        return this.element.outerHeight() < this.element.prop( "scrollHeight" );
    },

    select: function( event ) {
        // TODO: It should never be possible to not have an active item at this
        // point, but the tests don't trigger mouseenter before click.
        this.active = this.active || $( event.target ).closest( ".ui-menu-item" );
        var ui = { item: this.active };
        if ( !this.active.has( ".ui-menu" ).length ) {
            this.collapseAll( event, true );
        }
        this._trigger( "select", event, ui );
    }
});

}( jQuery ));(function( $, undefined ) {

var uid = 0,
	hideProps = {},
	showProps = {};

hideProps.height = hideProps.paddingTop = hideProps.paddingBottom =
	hideProps.borderTopWidth = hideProps.borderBottomWidth = "hide";
showProps.height = showProps.paddingTop = showProps.paddingBottom =
	showProps.borderTopWidth = showProps.borderBottomWidth = "show";

$.widget( "ui.accordion", {
	version: "@VERSION",
	options: {
		active: 0,
		animate: {},
		collapsible: false,
		event: "click",
		header: "> li > :first-child,> :not(li):even",
		heightStyle: "auto",
		icons: {
			activeHeader: "ui-icon-triangle-1-s",
			header: "ui-icon-triangle-1-e"
		},

		// callbacks
		activate: null,
		beforeActivate: null
	},

	_create: function() {
		var options = this.options;
		this.prevShow = this.prevHide = $();
		this.element.addClass( "ui-accordion ui-widget ui-helper-reset" )
			// ARIA
			.attr( "role", "tablist" );

		// don't allow collapsible: false and active: false / null
		if ( !options.collapsible && (options.active === false || options.active == null) ) {
			options.active = 0;
		}

		this._processPanels();
		// handle negative values
		if ( options.active < 0 ) {
			options.active += this.headers.length;
		}
		this._refresh();
	},

	_getCreateEventData: function() {
		return {
			header: this.active,
			content: !this.active.length ? $() : this.active.next()
		};
	},

	_createIcons: function() {
		var icons = this.options.icons;
		if ( icons ) {
			$( "<span>" )
				.addClass( "ui-accordion-header-icon ui-icon " + icons.header )
				.prependTo( this.headers );
			this.active.children( ".ui-accordion-header-icon" )
				.removeClass( icons.header )
				.addClass( icons.activeHeader );
			this.headers.addClass( "ui-accordion-icons" );
		}
	},

	_destroyIcons: function() {
		this.headers
			.removeClass( "ui-accordion-icons" )
			.children( ".ui-accordion-header-icon" )
				.remove();
	},

	_destroy: function() {
		var contents;

		// clean up main element
		this.element
			.removeClass( "ui-accordion ui-widget ui-helper-reset" )
			.removeAttr( "role" );

		// clean up headers
		this.headers
			.removeClass( "ui-accordion-header ui-accordion-header-active ui-helper-reset ui-state-default ui-corner-all ui-state-active ui-state-disabled ui-corner-top" )
			.removeAttr( "role" )
			.removeAttr( "aria-selected" )
			.removeAttr( "aria-controls" )
			.removeAttr( "tabIndex" )
			.each(function() {
				if ( /^ui-accordion/.test( this.id ) ) {
					this.removeAttribute( "id" );
				}
			});
		this._destroyIcons();

		// clean up content panels
		contents = this.headers.next()
			.css( "display", "" )
			.removeAttr( "role" )
			.removeAttr( "aria-expanded" )
			.removeAttr( "aria-hidden" )
			.removeAttr( "aria-labelledby" )
			.removeClass( "ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content ui-accordion-content-active ui-state-disabled" )
			.each(function() {
				if ( /^ui-accordion/.test( this.id ) ) {
					this.removeAttribute( "id" );
				}
			});
		if ( this.options.heightStyle !== "content" ) {
			contents.css( "height", "" );
		}
	},

	_setOption: function( key, value ) {
		if ( key === "active" ) {
			// _activate() will handle invalid values and update this.options
			this._activate( value );
			return;
		}

		if ( key === "event" ) {
			if ( this.options.event ) {
				this._off( this.headers, this.options.event );
			}
			this._setupEvents( value );
		}

		this._super( key, value );

		// setting collapsible: false while collapsed; open first panel
		if ( key === "collapsible" && !value && this.options.active === false ) {
			this._activate( 0 );
		}

		if ( key === "icons" ) {
			this._destroyIcons();
			if ( value ) {
				this._createIcons();
			}
		}

		// #5332 - opacity doesn't cascade to positioned elements in IE
		// so we need to add the disabled class to the headers and panels
		if ( key === "disabled" ) {
			this.headers.add( this.headers.next() )
				.toggleClass( "ui-state-disabled", !!value );
		}
	},

	_keydown: function( event ) {
		if ( event.altKey || event.ctrlKey ) {
			return;
		}

		var keyCode = $.ui.keyCode,
			length = this.headers.length,
			currentIndex = this.headers.index( event.target ),
			toFocus = false;

		switch ( event.keyCode ) {
			case keyCode.RIGHT:
			case keyCode.DOWN:
				toFocus = this.headers[ ( currentIndex + 1 ) % length ];
				break;
			case keyCode.LEFT:
			case keyCode.UP:
				toFocus = this.headers[ ( currentIndex - 1 + length ) % length ];
				break;
			case keyCode.SPACE:
			case keyCode.ENTER:
				this._eventHandler( event );
				break;
			case keyCode.HOME:
				toFocus = this.headers[ 0 ];
				break;
			case keyCode.END:
				toFocus = this.headers[ length - 1 ];
				break;
		}

		if ( toFocus ) {
			$( event.target ).attr( "tabIndex", -1 );
			$( toFocus ).attr( "tabIndex", 0 );
			toFocus.focus();
			event.preventDefault();
		}
	},

	_panelKeyDown : function( event ) {
		if ( event.keyCode === $.ui.keyCode.UP && event.ctrlKey ) {
			$( event.currentTarget ).prev().focus();
		}
	},

	refresh: function() {
		var options = this.options;
		this._processPanels();

		// was collapsed or no panel
		if ( ( options.active === false && options.collapsible === true ) || !this.headers.length ) {
			options.active = false;
			this.active = $();
		// active false only when collapsible is true
		} if ( options.active === false ) {
			this._activate( 0 );
		// was active, but active panel is gone
		} else if ( this.active.length && !$.contains( this.element[ 0 ], this.active[ 0 ] ) ) {
			// all remaining panel are disabled
			if ( this.headers.length === this.headers.find(".ui-state-disabled").length ) {
				options.active = false;
				this.active = $();
			// activate previous panel
			} else {
				this._activate( Math.max( 0, options.active - 1 ) );
			}
		// was active, active panel still exists
		} else {
			// make sure active index is correct
			options.active = this.headers.index( this.active );
		}

		this._destroyIcons();

		this._refresh();
	},

	_processPanels: function() {
		this.headers = this.element.find( this.options.header )
			.addClass( "ui-accordion-header ui-helper-reset ui-state-default ui-corner-all" );

		this.headers.next()
			.addClass( "ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom" )
			.filter(":not(.ui-accordion-content-active)")
			.hide();
	},

	_refresh: function() {
		var maxHeight,
			options = this.options,
			heightStyle = options.heightStyle,
			parent = this.element.parent(),
			accordionId = this.accordionId = "ui-accordion-" +
				(this.element.attr( "id" ) || ++uid);

		this.active = this._findActive( options.active )
			.addClass( "ui-accordion-header-active ui-state-active" )
			.toggleClass( "ui-corner-all ui-corner-top" );
		this.active.next()
			.addClass( "ui-accordion-content-active" )
			.show();

		this.headers
			.attr( "role", "tab" )
			.each(function( i ) {
				var header = $( this ),
					headerId = header.attr( "id" ),
					panel = header.next(),
					panelId = panel.attr( "id" );
				if ( !headerId ) {
					headerId = accordionId + "-header-" + i;
					header.attr( "id", headerId );
				}
				if ( !panelId ) {
					panelId = accordionId + "-panel-" + i;
					panel.attr( "id", panelId );
				}
				header.attr( "aria-controls", panelId );
				panel.attr( "aria-labelledby", headerId );
			})
			.next()
				.attr( "role", "tabpanel" );

		this.headers
			.not( this.active )
			.attr({
				"aria-selected": "false",
				tabIndex: -1
			})
			.next()
				.attr({
					"aria-expanded": "false",
					"aria-hidden": "true"
				})
				.hide();

		// make sure at least one header is in the tab order
		if ( !this.active.length ) {
			this.headers.eq( 0 ).attr( "tabIndex", 0 );
		} else {
			this.active.attr({
				"aria-selected": "true",
				tabIndex: 0
			})
			.next()
				.attr({
					"aria-expanded": "true",
					"aria-hidden": "false"
				});
		}

		this._createIcons();

		this._setupEvents( options.event );

		if ( heightStyle === "fill" ) {
			maxHeight = parent.height();
			this.element.siblings( ":visible" ).each(function() {
				var elem = $( this ),
					position = elem.css( "position" );

				if ( position === "absolute" || position === "fixed" ) {
					return;
				}
				maxHeight -= elem.outerHeight( true );
			});

			this.headers.each(function() {
				maxHeight -= $( this ).outerHeight( true );
			});

			this.headers.next()
				.each(function() {
					$( this ).height( Math.max( 0, maxHeight -
						$( this ).innerHeight() + $( this ).height() ) );
				})
				.css( "overflow", "auto" );
		} else if ( heightStyle === "auto" ) {
			maxHeight = 0;
			this.headers.next()
				.each(function() {
					maxHeight = Math.max( maxHeight, $( this ).height( "" ).height() );
				})
				.height( maxHeight );
		}
	},

	_activate: function( index ) {
		var active = this._findActive( index )[ 0 ];

		// trying to activate the already active panel
		if ( active === this.active[ 0 ] ) {
			return;
		}

		// trying to collapse, simulate a click on the currently active header
		active = active || this.active[ 0 ];

		this._eventHandler({
			target: active,
			currentTarget: active,
			preventDefault: $.noop
		});
	},

	_findActive: function( selector ) {
		return typeof selector === "number" ? this.headers.eq( selector ) : $();
	},

	_setupEvents: function( event ) {
		var events = {
			keydown: "_keydown"
		};
		if ( event ) {
			$.each( event.split(" "), function( index, eventName ) {
				events[ eventName ] = "_eventHandler";
			});
		}

		this._off( this.headers.add( this.headers.next() ) );
		this._on( this.headers, events );
		this._on( this.headers.next(), { keydown: "_panelKeyDown" });
		this._hoverable( this.headers );
		this._focusable( this.headers );
	},

	_eventHandler: function( event ) {
		var options = this.options,
			active = this.active,
			clicked = $( event.currentTarget ),
			clickedIsActive = clicked[ 0 ] === active[ 0 ],
			collapsing = clickedIsActive && options.collapsible,
			toShow = collapsing ? $() : clicked.next(),
			toHide = active.next(),
			eventData = {
				oldHeader: active,
				oldPanel: toHide,
				newHeader: collapsing ? $() : clicked,
				newPanel: toShow
			};

		event.preventDefault();

		if (
				// click on active header, but not collapsible
				( clickedIsActive && !options.collapsible ) ||
				// allow canceling activation
				( this._trigger( "beforeActivate", event, eventData ) === false ) ) {
			return;
		}

		options.active = collapsing ? false : this.headers.index( clicked );

		// when the call to ._toggle() comes after the class changes
		// it causes a very odd bug in IE 8 (see #6720)
		this.active = clickedIsActive ? $() : clicked;
		this._toggle( eventData );

		// switch classes
		// corner classes on the previously active header stay after the animation
		active.removeClass( "ui-accordion-header-active ui-state-active" );
		if ( options.icons ) {
			active.children( ".ui-accordion-header-icon" )
				.removeClass( options.icons.activeHeader )
				.addClass( options.icons.header );
		}

		if ( !clickedIsActive ) {
			clicked
				.removeClass( "ui-corner-all" )
				.addClass( "ui-accordion-header-active ui-state-active ui-corner-top" );
			if ( options.icons ) {
				clicked.children( ".ui-accordion-header-icon" )
					.removeClass( options.icons.header )
					.addClass( options.icons.activeHeader );
			}

			clicked
				.next()
				.addClass( "ui-accordion-content-active" );
		}
	},

	_toggle: function( data ) {
		var toShow = data.newPanel,
			toHide = this.prevShow.length ? this.prevShow : data.oldPanel;

		// handle activating a panel during the animation for another activation
		this.prevShow.add( this.prevHide ).stop( true, true );
		this.prevShow = toShow;
		this.prevHide = toHide;

		if ( this.options.animate ) {
			this._animate( toShow, toHide, data );
		} else {
			toHide.hide();
			toShow.show();
			this._toggleComplete( data );
		}

		toHide.attr({
			"aria-expanded": "false",
			"aria-hidden": "true"
		});
		toHide.prev().attr( "aria-selected", "false" );
		// if we're switching panels, remove the old header from the tab order
		// if we're opening from collapsed state, remove the previous header from the tab order
		// if we're collapsing, then keep the collapsing header in the tab order
		if ( toShow.length && toHide.length ) {
			toHide.prev().attr( "tabIndex", -1 );
		} else if ( toShow.length ) {
			this.headers.filter(function() {
				return $( this ).attr( "tabIndex" ) === 0;
			})
			.attr( "tabIndex", -1 );
		}

		toShow
			.attr({
				"aria-expanded": "true",
				"aria-hidden": "false"
			})
			.prev()
				.attr({
					"aria-selected": "true",
					tabIndex: 0
				});
	},

	_animate: function( toShow, toHide, data ) {
		var total, easing, duration,
			that = this,
			adjust = 0,
			down = toShow.length &&
				( !toHide.length || ( toShow.index() < toHide.index() ) ),
			animate = this.options.animate || {},
			options = down && animate.down || animate,
			complete = function() {
				that._toggleComplete( data );
			};

		if ( typeof options === "number" ) {
			duration = options;
		}
		if ( typeof options === "string" ) {
			easing = options;
		}
		// fall back from options to animation in case of partial down settings
		easing = easing || options.easing || animate.easing;
		duration = duration || options.duration || animate.duration;

		if ( !toHide.length ) {
			return toShow.animate( showProps, duration, easing, complete );
		}
		if ( !toShow.length ) {
			return toHide.animate( hideProps, duration, easing, complete );
		}

		total = toShow.show().outerHeight();
		toHide.animate( hideProps, {
			duration: duration,
			easing: easing,
			step: function( now, fx ) {
				fx.now = Math.round( now );
			}
		});
		toShow
			.hide()
			.animate( showProps, {
				duration: duration,
				easing: easing,
				complete: complete,
				step: function( now, fx ) {
					fx.now = Math.round( now );
					if ( fx.prop !== "height" ) {
						adjust += fx.now;
					} else if ( that.options.heightStyle !== "content" ) {
						fx.now = Math.round( total - toHide.outerHeight() - adjust );
						adjust = 0;
					}
				}
			});
	},

	_toggleComplete: function( data ) {
		var toHide = data.oldPanel;

		toHide
			.removeClass( "ui-accordion-content-active" )
			.prev()
				.removeClass( "ui-corner-top" )
				.addClass( "ui-corner-all" );

		// Work around for rendering bug in IE (#5421)
		if ( toHide.length ) {
			toHide.parent()[0].className = toHide.parent()[0].className;
		}

		this._trigger( "activate", null, data );
	}
});

})( jQuery );/*
 * jQuery UI Tooltip @VERSION
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/tooltip/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.position.js
 */
(function( $ ) {

var increments = 0;

function addDescribedBy( elem, id ) {
	var describedby = (elem.attr( "aria-describedby" ) || "").split( /\s+/ );
	describedby.push( id );
	elem
		.data( "ui-tooltip-id", id )
		.attr( "aria-describedby", $.trim( describedby.join( " " ) ) );
}

function removeDescribedBy( elem ) {
	var id = elem.data( "ui-tooltip-id" ),
		describedby = (elem.attr( "aria-describedby" ) || "").split( /\s+/ ),
		index = $.inArray( id, describedby );
	if ( index !== -1 ) {
		describedby.splice( index, 1 );
	}

	elem.removeData( "ui-tooltip-id" );
	describedby = $.trim( describedby.join( " " ) );
	if ( describedby ) {
		elem.attr( "aria-describedby", describedby );
	} else {
		elem.removeAttr( "aria-describedby" );
	}
}

$.widget( "ui.tooltip", {
	version: "@VERSION",
	options: {
		content: function() {
			return $( this ).attr( "title" );
		},
		hide: true,
		// Disabled elements have inconsistent behavior across browsers (#8661)
		items: "[title]:not([disabled])",
		position: {
			my: "left top+15",
			at: "left bottom",
			collision: "flipfit flip"
		},
		show: true,
		tooltipClass: null,
		track: false,

		// callbacks
		close: null,
		open: null
	},

	_create: function() {
		this._on({
			mouseover: "open",
			focusin: "open"
		});

		// IDs of generated tooltips, needed for destroy
		this.tooltips = {};
		// IDs of parent tooltips where we removed the title attribute
		this.parents = {};

		if ( this.options.disabled ) {
			this._disable();
		}
	},

	_setOption: function( key, value ) {
		var that = this;

		if ( key === "disabled" ) {
			this[ value ? "_disable" : "_enable" ]();
			this.options[ key ] = value;
			// disable element style changes
			return;
		}

		this._super( key, value );

		if ( key === "content" ) {
			$.each( this.tooltips, function( id, element ) {
				that._updateContent( element );
			});
		}
	},

	_disable: function() {
		var that = this;

		// close open tooltips
		$.each( this.tooltips, function( id, element ) {
			var event = $.Event( "blur" );
			event.target = event.currentTarget = element[0];
			that.close( event, true );
		});

		// remove title attributes to prevent native tooltips
		this.element.find( this.options.items ).andSelf().each(function() {
			var element = $( this );
			if ( element.is( "[title]" ) ) {
				element
					.data( "ui-tooltip-title", element.attr( "title" ) )
					.attr( "title", "" );
			}
		});
	},

	_enable: function() {
		// restore title attributes
		this.element.find( this.options.items ).andSelf().each(function() {
			var element = $( this );
			if ( element.data( "ui-tooltip-title" ) ) {
				element.attr( "title", element.data( "ui-tooltip-title" ) );
			}
		});
	},

	open: function( event ) {
		var that = this,
			target = $( event ? event.target : this.element )
				// we need closest here due to mouseover bubbling,
				// but always pointing at the same event target
				.closest( this.options.items );

		// No element to show a tooltip for
		if ( !target.length ) {
			return;
		}

		// If the tooltip is open and we're tracking then reposition the tooltip.
		// This makes sure that a tracking tooltip doesn't obscure a focused element
		// if the user was hovering when the element gained focused.
		if ( this.options.track && target.data( "ui-tooltip-id" ) ) {
			this._find( target ).position( $.extend({
				of: target
			}, this.options.position ) );
			// Stop tracking (#8622)
			this._off( this.document, "mousemove" );
			return;
		}

		if ( target.attr( "title" ) ) {
			target.data( "ui-tooltip-title", target.attr( "title" ) );
		}

		target.data( "ui-tooltip-open", true );

		// kill parent tooltips, custom or native, for hover
		if ( event && event.type === "mouseover" ) {
			target.parents().each(function() {
				var parent = $( this ),
					blurEvent;
				if ( parent.data( "ui-tooltip-open" ) ) {
					blurEvent = $.Event( "blur" );
					blurEvent.target = blurEvent.currentTarget = this;
					that.close( blurEvent, true );
				}
				if ( parent.attr( "title" ) ) {
					parent.uniqueId();
					that.parents[ this.id ] = {
						element: this,
						title: parent.attr( "title" )
					};
					parent.attr( "title", "" );
				}
			});
		}

		this._updateContent( target, event );
	},

	_updateContent: function( target, event ) {
		var content,
			contentOption = this.options.content,
			that = this;

		if ( typeof contentOption === "string" ) {
			return this._open( event, target, contentOption );
		}

		content = contentOption.call( target[0], function( response ) {
			// ignore async response if tooltip was closed already
			if ( !target.data( "ui-tooltip-open" ) ) {
				return;
			}
			// IE may instantly serve a cached response for ajax requests
			// delay this call to _open so the other call to _open runs first
			that._delay(function() {
				this._open( event, target, response );
			});
		});
		if ( content ) {
			this._open( event, target, content );
		}
	},

	_open: function( event, target, content ) {
		var tooltip, events, delayedShow,
			positionOption = $.extend( {}, this.options.position );

		if ( !content ) {
			return;
		}

		// Content can be updated multiple times. If the tooltip already
		// exists, then just update the content and bail.
		tooltip = this._find( target );
		if ( tooltip.length ) {
			tooltip.find( ".ui-tooltip-content" ).html( content );
			return;
		}

		// if we have a title, clear it to prevent the native tooltip
		// we have to check first to avoid defining a title if none exists
		// (we don't want to cause an element to start matching [title])
		//
		// We use removeAttr only for key events, to allow IE to export the correct
		// accessible attributes. For mouse events, set to empty string to avoid
		// native tooltip showing up (happens only when removing inside mouseover).
		if ( target.is( "[title]" ) ) {
			if ( event && event.type === "mouseover" ) {
				target.attr( "title", "" );
			} else {
				target.removeAttr( "title" );
			}
		}

		tooltip = this._tooltip( target );
		addDescribedBy( target, tooltip.attr( "id" ) );
		tooltip.find( ".ui-tooltip-content" ).html( content );

		function position( event ) {
			positionOption.of = event;
			if ( tooltip.is( ":hidden" ) ) {
				return;
			}
			tooltip.position( positionOption );
		}
		if ( this.options.track && event && /^mouse/.test( event.type ) ) {
			this._on( this.document, {
				mousemove: position
			});
			// trigger once to override element-relative positioning
			position( event );
		} else {
			tooltip.position( $.extend({
				of: target
			}, this.options.position ) );
		}

		tooltip.hide();

		this._show( tooltip, this.options.show );
		// Handle tracking tooltips that are shown with a delay (#8644). As soon
		// as the tooltip is visible, position the tooltip using the most recent
		// event.
		if ( this.options.show && this.options.show.delay ) {
			delayedShow = setInterval(function() {
				if ( tooltip.is( ":visible" ) ) {
					position( positionOption.of );
					clearInterval( delayedShow );
				}
			}, $.fx.interval );
		}

		this._trigger( "open", event, { tooltip: tooltip } );

		events = {
			keyup: function( event ) {
				if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
					var fakeEvent = $.Event(event);
					fakeEvent.currentTarget = target[0];
					this.close( fakeEvent, true );
				}
			},
			remove: function() {
				this._removeTooltip( tooltip );
			}
		};
		if ( !event || event.type === "mouseover" ) {
			events.mouseleave = "close";
		}
		if ( !event || event.type === "focusin" ) {
			events.focusout = "close";
		}
		this._on( true, target, events );
	},

	close: function( event ) {
		var that = this,
			target = $( event ? event.currentTarget : this.element ),
			tooltip = this._find( target );

		// disabling closes the tooltip, so we need to track when we're closing
		// to avoid an infinite loop in case the tooltip becomes disabled on close
		if ( this.closing ) {
			return;
		}

		// only set title if we had one before (see comment in _open())
		if ( target.data( "ui-tooltip-title" ) ) {
			target.attr( "title", target.data( "ui-tooltip-title" ) );
		}

		removeDescribedBy( target );

		tooltip.stop( true );
		this._hide( tooltip, this.options.hide, function() {
			that._removeTooltip( $( this ) );
		});

		target.removeData( "ui-tooltip-open" );
		this._off( target, "mouseleave focusout keyup" );
		// Remove 'remove' binding only on delegated targets
		if ( target[0] !== this.element[0] ) {
			this._off( target, "remove" );
		}
		this._off( this.document, "mousemove" );

		if ( event && event.type === "mouseleave" ) {
			$.each( this.parents, function( id, parent ) {
				$( parent.element ).attr( "title", parent.title );
				delete that.parents[ id ];
			});
		}

		this.closing = true;
		this._trigger( "close", event, { tooltip: tooltip } );
		this.closing = false;
	},

	_tooltip: function( element ) {
		var id = "ui-tooltip-" + increments++,
			tooltip = $( "<div>" )
				.attr({
					id: id,
					role: "tooltip"
				})
				.addClass( "ui-tooltip ui-widget ui-corner-all ui-widget-content " +
					( this.options.tooltipClass || "" ) );
		$( "<div>" )
			.addClass( "ui-tooltip-content" )
			.appendTo( tooltip );
		tooltip.appendTo( this.document[0].body );
		this.tooltips[ id ] = element;
		return tooltip;
	},

	_find: function( target ) {
		var id = target.data( "ui-tooltip-id" );
		return id ? $( "#" + id ) : $();
	},

	_removeTooltip: function( tooltip ) {
		tooltip.remove();
		delete this.tooltips[ tooltip.attr( "id" ) ];
	},

	_destroy: function() {
		var that = this;

		// close open tooltips
		$.each( this.tooltips, function( id, element ) {
			// Delegate to close method to handle common cleanup
			var event = $.Event( "blur" );
			event.target = event.currentTarget = element[0];
			that.close( event, true );

			// Remove immediately; destroying an open tooltip doesn't use the
			// hide animation
			$( "#" + id ).remove();

			// Restore the title
			if ( element.data( "ui-tooltip-title" ) ) {
				element.attr( "title", element.data( "ui-tooltip-title" ) );
				element.removeData( "ui-tooltip-title" );
			}
		});
	}
});

}( jQuery ) );/*
 * jQuery UI Selectmenu @VERSION
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Selectmenu
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.widget.js
 *  jquery.ui.position.js
 *  jquery.ui.menu.js
 */
(function( $, undefined ) {

$.widget( "ui.selectmenu", {
    version: "@VERSION",
    defaultElement: "<select>",
    options: {
        dropdown: true,
        appendTo: "body",
        position: {
            my: "left top",
            at: "left bottom",
            collision: "none"
        },
        // callbacks
        open: null,
        focus: null,
        select: null,
        close: null,
        change: null
    },

    _create: function() {
        // make / set unique id
        var selectmenuId = this.element.uniqueId().attr( "id" );

        // array of button and menu id's
        this.ids = { id: selectmenuId, button: selectmenuId + "-button", menu: selectmenuId + "-menu" };

        this._drawButton();
        this._on( this.button, this._buttonEvents );
        this._hoverable( this.button );
        this._focusable( this.button );

        this._drawMenu();

        // document click closes menu
        this._on( document, {
            click: function( event ) {
                if ( this.isOpen && !$( event.target ).closest( "li.ui-state-disabled, li.ui-selectmenu-optgroup, #" + this.ids.button ).length ) {
                    this.close( event );
                }
            }
        });

        if ( this.options.disabled ) {
            this.disable();
        }
    },

    _drawButton: function() {
        var tabindex = this.element.attr( "tabindex" );

        // fix existing label
        this.label = $( "label[for='" + this.ids.id + "']" ).attr( "for", this.ids.button );
        // catch click event of the label
        this._on( this.label, {
            "click":  function( event ) {
                this.button.focus();
                event.preventDefault();
            }
        });

        // hide original select tag
        this.element.hide();

        // create button
        this.button = $( "<a />", {
            "class": "ui-button ui-widget ui-state-default ui-corner-all",
            href: "#" + this.ids.id,
            tabindex: ( tabindex ? tabindex : this.options.disabled ? -1 : 0 ),
            id: this.ids.button,
            width: this.options.width || this.element.outerWidth(),
            role: "combobox",
            "aria-expanded": false,
            "aria-autocomplete": "list",
            "aria-owns": this.ids.menu,
            "aria-haspopup": true
        });

        this.button.prepend( $( "<span />", {
            "class": "icon-small ui-selectmenu-icon " + ( ( this.options.dropdown ) ? "icon-arrow-down" : "icon-arrow-up" )
        }));

        this.buttonText = $( "<nobr />", {
                "class": "ui-selectmenu-text" ,
                html: this.element.find( "option:selected" ).text() || "&nbsp;"
            })
            .appendTo( this.button );

        // wrap and insert new button
        this.buttonWrap = $( "<span />", {
                "class": "ui-selectmenu-button"
            })
            .append( this.button )
            .insertAfter( this.element );
    },

    _drawMenu: function() {
        var menuInstance,
            that = this;

        // create menu portion, append to body
        this.menu = $( "<ul />", {
            "aria-hidden": true,
            "aria-labelledby": this.ids.button,
            id: this.ids.menu
        });

        // wrap menu
        this.menuWrap = $( "<div />", {
                "class": "ui-selectmenu-menu",
                width: ( this.options.dropdown ) ? (this.options.menuWidth || this.button.outerWidth()) : this.buttonText.width() + parseFloat( this.buttonText.css( "padding-left" ) ) || 0 + parseFloat( this.buttonText.css( "margin-left") ) || 0
            })
            .append( this.menu )
            .appendTo( this.options.appendTo );

        // init menu widget
        menuInstance = this.menu.menu({
            select: function( event, ui ) {
                var item = ui.item.data( "ui-selectmenu-item" );

                that._select( item, event );

                if ( that.isOpen ) {
                    event.preventDefault();
                    that.close( event );
                }
            },
            focus: function( event, ui ) {
                var item = ui.item.data( "ui-selectmenu-item" );

                if ( that.focus !== undefined ) {
                    if ( item.index !== that.focus ) {
                        that._trigger( "focus", event, { item: item } );
                        if ( !that.isOpen ) {
                            that._select( item, event );
                        }
                    }
                }
                that.focus = item.index;

                // Set ARIA active decendent
                that.button.attr( "aria-activedescendant", that.menuItems.eq( item.index ).find( "a" ).attr( "id" ) );
            },
            // set ARIA role
            role: "listbox"
        })
        .data( "ui-menu" );

        // change menu styles?
        if ( this.options.dropdown ) {
            this.menu.addClass( "ui-corner-bottom" ).removeClass( "ui-corner-all" );
        }

        // make sure focus stays on selected item
        menuInstance.delay = 999999999;
        // unbind uneeded Menu events
        menuInstance._off( this.menu, "mouseleave" );
    },

    refresh: function() {
        this.menu.empty();

        var item,
            options = this.element.find( "option" );
        if ( options.length ) {
            this._readOptions( options );
            this._renderMenu( this.menu, this.items );

            this.menu.menu( "refresh" );
            this.menuItems = this.menu.find( "li" ).not( ".ui-selectmenu-optgroup" );

            // select current item
            item = this._getSelectedItem();
            this.menu.menu( "focus", null, item );
            this._setSelected( item.data( "ui-selectmenu-item" ) );

            // set disabled state
            this._setOption( "disabled", this._getCreateOptions().disabled );
        }
    },

    open: function( event ) {
        if ( !this.options.disabled ) {
            // make sure menu is refreshed on first init (needed at least for IE9)
            if ( this.isOpen === undefined ) {
                this.button.trigger( "focus" );
            }

            this.isOpen = true;
            this._toggleAttr();
            this.menu.menu( "focus", event, this._getSelectedItem() );

            if ( this.items && !this.options.dropdown ) {
                var currentItem = this._getSelectedItem();
                // center current item
                if ( this.menu.outerHeight() < this.menu.prop( "scrollHeight" ) ) {
                    this.menuWrap.css( "left" , -10000 );
                    this.menu.scrollTop( this.menu.scrollTop() + currentItem.position().top - this.menu.outerHeight() / 2 + currentItem.outerHeight() / 2 );
                    this.menuWrap.css( "left" , "auto" );
                }

                $.extend( this.options.position, {
                    my: "left top",
                    at: "left top",
                    // calculate offset
                    offset: "0 " + ( this.menu.offset().top  - currentItem.offset().top + ( this.button.outerHeight() - currentItem.outerHeight() ) / 2 )
                });
            }

            this.options.position.of = this.button;
            this.menuWrap
                .zIndex( this.element.zIndex() + 1 )
                .position( this.options.position );

            this._trigger( "open", event );
        }
    },

    close: function( event ) {
        if ( this.isOpen ) {
            var id = this._getSelectedItem().find( "a" ).attr( "id" );
            this.isOpen = false;
            this._toggleAttr();
            this.button.attr( "aria-activedescendant", id );
            this.menu.attr( "aria-activedescendant", id );
            this._trigger( "close", event );
        }
    },

    widget: function() {
        return this.button;
    },

    menuWidget: function() {
        return this.menu;
    },

    _renderMenu: function( ul, items ) {
        var that = this,
            currentOptgroup = "";

        $.each( items, function( index, item ) {
            if ( item.optgroup !== currentOptgroup ) {
                $( "<li />", {
                    "class": "ui-selectmenu-optgroup" + ( item.element.parent( "optgroup" ).attr( "disabled" ) ? " ui-state-disabled" : "" ),
                    html: item.optgroup
                }).appendTo( ul );
                currentOptgroup = item.optgroup;
            }
            that._renderItem( ul, item );
        });
    },

    _renderItem: function( ul, item ) {
        var li = $( "<li />" ).data( "ui-selectmenu-item", item );
        if ( item.disabled ) {
            li.addClass( "ui-state-disabled" );
        }
        li.append( $( "<a />", {
                html: ($.isFunction(this.options.format) && this.options.format(item.label, item)) || item.label,
                href: "#"
            })
        );

        return li.appendTo( ul );
    },

    _move: function( direction, event ) {
        if ( direction === "first" || direction === "last" ) {
            // set focus manually for first or last item
            this.menu.menu( "focus", event, this.menuItems[ direction ]() );
        } else {
            // move to and focus next or prev item
            this.menu.menu( direction, event );
        }
    },

    _getSelectedItem: function() {
        return this.menuItems.eq( this.element[ 0 ].selectedIndex );
    },

    _toggle: function( event ) {
        if ( this.isOpen ) {
            this.close( event );
        } else {
            this.open( event );
        }
    },

    _buttonEvents: {
        focus: function() {
            // init Menu on first focus
            this.refresh();
            // reset focus class as its removed by ui.widget._setOption
            this.button.addClass( "ui-state-focus" );
            this._off( this.button, "focus" );
        },
        click: function( event ) {
            this._toggle( event );
            event.preventDefault();
        },
        keydown: function( event ) {
            var prevDef = true;
            switch ( event.keyCode ) {
                case $.ui.keyCode.TAB:
                case $.ui.keyCode.ESCAPE:
                    if ( this.isOpen ) {
                        this.close( event );
                    }
                    prevDef = false;
                    break;
                case $.ui.keyCode.ENTER:
                    if ( this.isOpen ) {
                        this.menu.menu( "select", event );
                    }
                    break;
                case $.ui.keyCode.UP:
                    if ( event.altKey ) {
                        this._toggle( event );
                    } else {
                        this._move( "previous", event );
                    }
                    break;
                case $.ui.keyCode.DOWN:
                    if ( event.altKey ) {
                        this._toggle( event );
                    } else {
                        this._move( "next", event );
                    }
                    break;
                case $.ui.keyCode.SPACE:
                    this._toggle( event );
                    break;
                case $.ui.keyCode.LEFT:
                    this._move( "previous", event );
                    break;
                case $.ui.keyCode.RIGHT:
                    this._move( "next", event );
                    break;
                case $.ui.keyCode.HOME:
                case $.ui.keyCode.PAGE_UP:
                    this._move( "first", event );
                    break;
                case $.ui.keyCode.END:
                case $.ui.keyCode.PAGE_DOWN:
                    this._move( "last", event );
                    break;
                default:
                    this.menu.trigger( event );
                    prevDef = false;
            }
            if ( prevDef ) {
                event.preventDefault();
            }
        }
    },

    _select: function( item, event ) {
        var oldIndex = this.element[ 0 ].selectedIndex;
        // change native select element
        this.element[ 0 ].selectedIndex = item.index;
        this._setSelected( item );
        this._trigger( "select", event, { item: item } );

        if ( item.index !== oldIndex ) {
            this._trigger( "change", event, { item: item } );
        }
    },

    _setSelected: function( item ) {
        // update button text
        this.buttonText.html( item.label );
        // change ARIA attr
        this.menuItems.find( "a" ).attr( "aria-selected", false );
        this._getSelectedItem().find( "a" ).attr( "aria-selected", true );
        this.button.attr( "aria-labelledby", this.menuItems.eq( item.index ).find( "a" ).attr( "id" ) );
    },

    _setOption: function( key, value ) {
        this._super( key, value );

        if ( key === "appendTo" ) {
            this.menuWrap.appendTo( $( value || "body", this.element[ 0 ].ownerDocument )[ 0 ] );
        }
        if ( key === "disabled" ) {
            this.menu.menu( "option", "disabled", value );
            if ( value ) {
                this.element.attr( "disabled", "disabled" );
                this.button.attr( "tabindex", -1 );
                this.close();
            } else {
                this.element.removeAttr( "disabled" );
                this.button.attr( "tabindex", 0 );
            }
        }
    },

    _toggleAttr: function(){
        if ( this.options.dropdown ) {
            this.button.toggleClass( "ui-corner-top", this.isOpen ).toggleClass( "ui-corner-all", !this.isOpen );
        }
        this.menuWrap.toggleClass( "ui-selectmenu-open", this.isOpen );
        this.menu.attr( "aria-hidden", !this.isOpen);
        this.button.attr( "aria-expanded", this.isOpen);
    },

    _getCreateOptions: function() {
        return { disabled: !!this.element.attr( "disabled" ) };
    },

    _readOptions: function( options ) {
        var data = [];
        $.each( options, function( index, item ) {
            var option = $( item ),
                optgroup = option.parent( "optgroup" );
            data.push({
                element: option,
                index: index,
                value: option.attr( "value" ),
                label: option.text() || "&nbsp;",
                optgroup: optgroup.attr( "label" ) || "",
                disabled: optgroup.attr( "disabled" ) || option.attr( "disabled" )
            });
        });
        this.items = data;
    },

    _destroy: function() {
        this.menuWrap.remove();
        this.buttonWrap.remove();
        this.element.show();
        this.element.removeUniqueId();
        this.label.attr( "for", this.ids.id );
    }
});

}( jQuery ));(function ($) {
	var PICKER_TPL = '<div class="colorpicker dropdown-menu">'+ 
		'<div class="colorpicker-selector-panel">' + 
			'<div class="colorpicker-saturation"><i><b></b></i></div>'+
			'<div class="colorpicker-hue"><i></i></div>'+
			'<div class="colorpicker-alpha"><i></i></div>'+
		'</div>' + 
			'<input type="text" maxlength="7" class="ui-input colorpicker-input" />' + 
			'<i class="colorpicker-transparent"></i>' + 
		'</div>',
		sliders = {
			saturation: {
				maxLeft: 100,
				maxTop: 100,
				callLeft: 'setSaturation',
				callTop: 'setLightness'
			},
			
			hue: {
				maxLeft: 0,
				maxTop: 100,
				callLeft: false,
				callTop: 'setHue'
			},
			
			alpha: {
				maxLeft: 0,
				maxTop: 100,
				callLeft: false,
				callTop: 'setAlpha'
			}
		};

	var CPGlobal = {
	
		// translate a format from Color object to a string
		translateFormats: {
			'rgb': function(){
				var rgb = this.color.toRGB();
				return 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
			},
			
			'rgba': function(){
				var rgb = this.color.toRGB();
				return 'rgba('+rgb.r+','+rgb.g+','+rgb.b+','+rgb.a+')';
			},
			
			'hsl': function(){
				var hsl = this.color.toHSL();
				return 'hsl('+Math.round(hsl.h*360)+','+Math.round(hsl.s*100)+'%,'+Math.round(hsl.l*100)+'%)';
			},
			
			'hsla': function(){
				var hsl = this.color.toHSL();
				return 'hsla('+Math.round(hsl.h*360)+','+Math.round(hsl.s*100)+'%,'+Math.round(hsl.l*100)+'%,'+hsl.a+')';
			},
			
			'hex': function(){
				return  this.color.toHex();
			}
		},
		
		sliders: {
			saturation: {
				maxLeft: 100,
				maxTop: 100,
				callLeft: 'setSaturation',
				callTop: 'setLightness'
			},
			
			hue: {
				maxLeft: 0,
				maxTop: 100,
				callLeft: false,
				callTop: 'setHue'
			},
			
			alpha: {
				maxLeft: 0,
				maxTop: 100,
				callLeft: false,
				callTop: 'setAlpha'
			}
		},
		
		// HSBtoRGB from RaphaelJS
		// https://github.com/DmitryBaranovskiy/raphael/
		RGBtoHSB: function (r, g, b, a){
			r /= 255;
			g /= 255;
			b /= 255;

			var H, S, V, C;
			V = Math.max(r, g, b);
			C = V - Math.min(r, g, b);
			H = (C == 0 ? null :
				 V == r ? (g - b) / C :
				 V == g ? (b - r) / C + 2 :
						  (r - g) / C + 4
				);
			H = ((H + 360) % 6) * 60 / 360;
			S = C == 0 ? 0 : C / V;
			return {h: H||1, s: S, b: V, a: a||1};
		},
		
		HueToRGB: function (p, q, h) {
			if (h < 0)
				h += 1;
			else if (h > 1)
				h -= 1;

			if ((h * 6) < 1)
				return p + (q - p) * h * 6;
			else if ((h * 2) < 1)
				return q;
			else if ((h * 3) < 2)
				return p + (q - p) * ((2 / 3) - h) * 6;
			else
				return p;
		},
	
		HSLtoRGB: function (h, s, l, a)
		{

			if (s < 0)
				s = 0;

			if (l <= 0.5)
				var q = l * (1 + s);
			else
				var q = l + s - (l * s);

			var p = 2 * l - q;

			var tr = h + (1 / 3);
			var tg = h;
			var tb = h - (1 / 3);

			var r = Math.round(CPGlobal.HueToRGB(p, q, tr) * 255);
			var g = Math.round(CPGlobal.HueToRGB(p, q, tg) * 255);
			var b = Math.round(CPGlobal.HueToRGB(p, q, tb) * 255);
			return [r, g, b, a||1];
		},
		
		// a set of RE's that can match strings and generate color tuples.
		// from John Resig color plugin
		// https://github.com/jquery/jquery-color/
		stringParsers: [
			{
				re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				parse: function( execResult ) {
					return [
						execResult[ 1 ],
						execResult[ 2 ],
						execResult[ 3 ],
						execResult[ 4 ]
					];
				}
			}, {
				re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				parse: function( execResult ) {
					return [
						2.55 * execResult[1],
						2.55 * execResult[2],
						2.55 * execResult[3],
						execResult[ 4 ]
					];
				}
			}, {
				re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
				parse: function( execResult ) {
					return [
						parseInt( execResult[ 1 ], 16 ),
						parseInt( execResult[ 2 ], 16 ),
						parseInt( execResult[ 3 ], 16 )
					];
				}
			}, {
				re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
				parse: function( execResult ) {
					return [
						parseInt( execResult[ 1 ] + execResult[ 1 ], 16 ),
						parseInt( execResult[ 2 ] + execResult[ 2 ], 16 ),
						parseInt( execResult[ 3 ] + execResult[ 3 ], 16 )
					];
				}
			}, {
				re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				space: 'hsla',
				parse: function( execResult ) {
					return [
						execResult[1]/360,
						execResult[2] / 100,
						execResult[3] / 100,
						execResult[4]
					];
				}
			}
		]
	};

	var Color = function(val) {
		this.value = {
			h: 1,
			s: 1,
			b: 1,
			a: 1
		};
		this.setColor(val);
	};
	
	Color.prototype = {
		constructor: Color,
		
		//parse a string to HSB
		setColor: function(val){
			val = val.toLowerCase();
			var that = this;
			$.each( CPGlobal.stringParsers, function( i, parser ) {
				var match = parser.re.exec( val ),
					values = match && parser.parse( match ),
					space = parser.space||'rgba';
				if ( values ) {
					if (space == 'hsla') {
						that.value = CPGlobal.RGBtoHSB.apply(null, CPGlobal.HSLtoRGB.apply(null, values));
					} else {
						that.value = CPGlobal.RGBtoHSB.apply(null, values);
					}
					return false;
				}
			});
		},
		
		setHue: function(h) {
			this.value.h = 1- h;
		},
		
		setSaturation: function(s) {
			this.value.s = s;
		},
		
		setLightness: function(b) {
			this.value.b = 1- b;
		},
		
		setAlpha: function(a) {
			this.value.a = parseInt((1 - a)*100, 10)/100;
		},
		
		// HSBtoRGB from RaphaelJS
		// https://github.com/DmitryBaranovskiy/raphael/
		toRGB: function(h, s, b, a) {
			if (!h) {
				h = this.value.h;
				s = this.value.s;
				b = this.value.b;
			}
			h *= 360;
			var R, G, B, X, C;
			h = (h % 360) / 60;
			C = b * s;
			X = C * (1 - Math.abs(h % 2 - 1));
			R = G = B = b - C;

			h = ~~h;
			R += [C, X, 0, 0, X, C][h];
			G += [X, C, C, X, 0, 0][h];
			B += [0, 0, X, C, C, X][h];
			return {
				r: Math.round(R*255),
				g: Math.round(G*255),
				b: Math.round(B*255),
				a: a||this.value.a
			};
		},
		
		toHex: function(h, s, b, a){
			var rgb = this.toRGB(h, s, b, a);
			return '#'+((1 << 24) | (parseInt(rgb.r) << 16) | (parseInt(rgb.g) << 8) | parseInt(rgb.b)).toString(16).substr(1);
		},
		
		toHSL: function(h, s, b, a){
			if (!h) {
				h = this.value.h;
				s = this.value.s;
				b = this.value.b;
			}
			var H = h,
				L = (2 - s) * b,
				S = s * b;
			if (L > 0 && L <= 1) {
				S /= L;
			} else {
				S /= 2 - L;
			}
			L /= 2;
			if (S > 1) {
				S = 1;
			}
			return {
				h: H,
				s: S,
				l: L,
				a: a||this.value.a
			};
		}
	};
	$.widget('ui.colorpicker', {
		_create : function () {
			var me = this,
				options = this.options;

			this.picker = $(PICKER_TPL).appendTo('body');

			this.base = this.picker.find('.colorpicker-selector-panel div:first');

			this.picker.find('.colorpicker-selector-panel').mousedown($.proxy(this.mousedown, this));
			this.picker.find('.colorpicker-input').on({
				'keyup' : $.proxy(this.onInp, this),
				'mousedown' : function (e) {
					e.stopPropagation();
				}
			});
			this.picker.find('.colorpicker-transparent').mousedown($.proxy(this.ontransparent, this));

			this.element.click($.proxy(this.show, this));
		
			this.update();
		},

		ontransparent : function (e) {
			this._trigger('change', e, 'transparent');
		},

		onInp : function (e) {
			var color = $(e.target).val();
			color.indexOf('#') !== 0 && (color = '#' + color);
			this._trigger('change', e, this.color = new Color(color));
			this.update();
		},

		update: function () {
			this.color = new Color(this.element.data('color'));
			this.picker.find('i')
				.eq(0).css({left: this.color.value.s*100, top: 100 - this.color.value.b*100}).end()
				.eq(1).css('top', 100 * (1 - this.color.value.h)).end()
				.eq(2).css('top', 100 * (1 - this.color.value.a));
			this.previewColor();
		},
		previewColor: function(){
			this.base.css('backgroundColor', this.color.toHex(this.color.value.h, 1, 1, 1));
		},
		place : function () {
			var offset = this.element.offset(),
				height = this.element.height();
			this.picker.css({
				top: offset.top + height,
				left: offset.left
			});
		},
		mousedown : function (e) {
			e.stopPropagation();
			e.preventDefault();
		
			var target = $(e.target);
			var zone = target.closest('div');
			if (!zone.is('.colorpicker')) {
				if (zone.is('.colorpicker-saturation')) {
					this.slider = $.extend({}, sliders['saturation']);
				} 
				else if (zone.is('.colorpicker-hue')) {
					this.slider = $.extend({}, sliders['hue']);
				}
				else if (zone.is('.colorpicker-alpha')) {
					this.slider = $.extend({}, sliders['alpha']);
				}
				var offset = zone.offset();
				//reference to knob's style
				this.slider.knob = zone.find('i')[0].style;
				this.slider.left = e.pageX - offset.left;
				this.slider.top = e.pageY - offset.top;
				this.pointer = {
					left: e.pageX,
					top: e.pageY
				};
				//trigger mousemove to move the knob to the current position
				$(document).on({
					mousemove: $.proxy(this.mousemove, this),
					mouseup: $.proxy(this.mouseup, this)
				});
			}
			return false;
		},
		mousemove : function (e) {
			e.stopPropagation();
			e.preventDefault();
			var left = Math.max(
				0,
				Math.min(
					this.slider.maxLeft,
					this.slider.left + ((e.pageX||this.pointer.left) - this.pointer.left)
				)
			);
			var top = Math.max(
				0,
				Math.min(
					this.slider.maxTop,
					this.slider.top + ((e.pageY||this.pointer.top) - this.pointer.top)
				)
			);
			this.slider.knob.left = left + 'px';
			this.slider.knob.top = top + 'px';
			if (this.slider.callLeft) {
				this.color[this.slider.callLeft].call(this.color, left/100);
			}
			if (this.slider.callTop) {
				this.color[this.slider.callTop].call(this.color, top/100);
			}
			this.picker.find('.colorpicker-input').val(this.color.toHex());
			this.previewColor();
			this._trigger('change', e, this.color);
			return false;
		},
		mouseup : function (e) {
			e.stopPropagation();
			e.preventDefault();
			$(document).off({
				mousemove: this.mousemove,
				mouseup: this.mouseup
			});
			return false;
		},
		show : function (e) {
			if (!this.options.disabled) {
				this.picker.show();
				this.place();
				$(document).mousedown($.proxy(this.hide, this));
			}
		},
		hide : function (e) {
			this.picker.hide();
			$(document).off({
				mousedown : this.hide
			});
		},
		_destroy : function () {
			this.picker.find('.colorpicker-selector-panel').off('mousedown', this.mousedown);
			this.picker.find('.colorpicker-input').unbind();
			this.picker.find('.colorpicker-transparent').off('mousedown', this.ontransparent);
			this.element.off({
				click : this.show
			});
			this.picker.remove();
		}
	});
})(jQuery);/*
 * jQuery UI Tabs @VERSION
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/tabs/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

var tabId = 0,
	rhash = /#.*$/;

function getNextTabId() {
	return ++tabId;
}

function isLocal( anchor ) {
	return anchor.hash.length > 1 &&
		anchor.href.replace( rhash, "" ) ===
			location.href.replace( rhash, "" )
				// support: Safari 5.1
				// Safari 5.1 doesn't encode spaces in window.location
				// but it does encode spaces from anchors (#8777)
				.replace( /\s/g, "%20" );
}

$.widget( "ui.tabs", {
	version: "@VERSION",
	delay: 300,
	options: {
		active: null,
		collapsible: false,
		event: "click",
		heightStyle: "content",
		hide: null,
		show: null,

		// callbacks
		activate: null,
		beforeActivate: null,
		beforeLoad: null,
		load: null
	},

	_create: function() {
		var that = this,
			options = this.options,
			active = options.active,
			locationHash = location.hash.substring( 1 );

		this.running = false;

		this.element
			.addClass( "ui-tabs ui-widget ui-widget-content ui-corner-all" )
			.toggleClass( "ui-tabs-collapsible", options.collapsible )
			// Prevent users from focusing disabled tabs via click
			.delegate( ".ui-tabs-nav > li", "mousedown" + this.eventNamespace, function( event ) {
				if ( $( this ).is( ".ui-state-disabled" ) ) {
					event.preventDefault();
				}
			})
			// support: IE <9
			// Preventing the default action in mousedown doesn't prevent IE
			// from focusing the element, so if the anchor gets focused, blur.
			// We don't have to worry about focusing the previously focused
			// element since clicking on a non-focusable element should focus
			// the body anyway.
			.delegate( ".ui-tabs-anchor", "focus" + this.eventNamespace, function() {
				if ( $( this ).closest( "li" ).is( ".ui-state-disabled" ) ) {
					this.blur();
				}
			});

		this._processTabs();

		if ( active === null ) {
			// check the fragment identifier in the URL
			if ( locationHash ) {
				this.tabs.each(function( i, tab ) {
					if ( $( tab ).attr( "aria-controls" ) === locationHash ) {
						active = i;
						return false;
					}
				});
			}

			// check for a tab marked active via a class
			if ( active === null ) {
				active = this.tabs.index( this.tabs.filter( ".ui-tabs-active" ) );
			}

			// no active tab, set to false
			if ( active === null || active === -1 ) {
				active = this.tabs.length ? 0 : false;
			}
		}

		// handle numbers: negative, out of range
		if ( active !== false ) {
			active = this.tabs.index( this.tabs.eq( active ) );
			if ( active === -1 ) {
				active = options.collapsible ? false : 0;
			}
		}
		options.active = active;

		// don't allow collapsible: false and active: false
		if ( !options.collapsible && options.active === false && this.anchors.length ) {
			options.active = 0;
		}

		// Take disabling tabs via class attribute from HTML
		// into account and update option properly.
		if ( $.isArray( options.disabled ) ) {
			options.disabled = $.unique( options.disabled.concat(
				$.map( this.tabs.filter( ".ui-state-disabled" ), function( li ) {
					return that.tabs.index( li );
				})
			) ).sort();
		}

		// check for length avoids error when initializing empty list
		if ( this.options.active !== false && this.anchors.length ) {
			this.active = this._findActive( this.options.active );
		} else {
			this.active = $();
		}

		this._refresh();

		if ( this.active.length ) {
			this.load( options.active );
		}
	},

	_getCreateEventData: function() {
		return {
			tab: this.active,
			panel: !this.active.length ? $() : this._getPanelForTab( this.active )
		};
	},

	_tabKeydown: function( event ) {
		var focusedTab = $( this.document[0].activeElement ).closest( "li" ),
			selectedIndex = this.tabs.index( focusedTab ),
			goingForward = true;

		if ( this._handlePageNav( event ) ) {
			return;
		}

		switch ( event.keyCode ) {
			case $.ui.keyCode.RIGHT:
			case $.ui.keyCode.DOWN:
				selectedIndex++;
				break;
			case $.ui.keyCode.UP:
			case $.ui.keyCode.LEFT:
				goingForward = false;
				selectedIndex--;
				break;
			case $.ui.keyCode.END:
				selectedIndex = this.anchors.length - 1;
				break;
			case $.ui.keyCode.HOME:
				selectedIndex = 0;
				break;
			case $.ui.keyCode.SPACE:
				// Activate only, no collapsing
				event.preventDefault();
				clearTimeout( this.activating );
				this._activate( selectedIndex );
				return;
			case $.ui.keyCode.ENTER:
				// Toggle (cancel delayed activation, allow collapsing)
				event.preventDefault();
				clearTimeout( this.activating );
				// Determine if we should collapse or activate
				this._activate( selectedIndex === this.options.active ? false : selectedIndex );
				return;
			default:
				return;
		}

		// Focus the appropriate tab, based on which key was pressed
		event.preventDefault();
		clearTimeout( this.activating );
		selectedIndex = this._focusNextTab( selectedIndex, goingForward );

		// Navigating with control key will prevent automatic activation
		if ( !event.ctrlKey ) {
			// Update aria-selected immediately so that AT think the tab is already selected.
			// Otherwise AT may confuse the user by stating that they need to activate the tab,
			// but the tab will already be activated by the time the announcement finishes.
			focusedTab.attr( "aria-selected", "false" );
			this.tabs.eq( selectedIndex ).attr( "aria-selected", "true" );

			this.activating = this._delay(function() {
				this.option( "active", selectedIndex );
			}, this.delay );
		}
	},

	_panelKeydown: function( event ) {
		if ( this._handlePageNav( event ) ) {
			return;
		}

		// Ctrl+up moves focus to the current tab
		if ( event.ctrlKey && event.keyCode === $.ui.keyCode.UP ) {
			event.preventDefault();
			this.active.focus();
		}
	},

	// Alt+page up/down moves focus to the previous/next tab (and activates)
	_handlePageNav: function( event ) {
		if ( event.altKey && event.keyCode === $.ui.keyCode.PAGE_UP ) {
			this._activate( this._focusNextTab( this.options.active - 1, false ) );
			return true;
		}
		if ( event.altKey && event.keyCode === $.ui.keyCode.PAGE_DOWN ) {
			this._activate( this._focusNextTab( this.options.active + 1, true ) );
			return true;
		}
	},

	_findNextTab: function( index, goingForward ) {
		var lastTabIndex = this.tabs.length - 1;

		function constrain() {
			if ( index > lastTabIndex ) {
				index = 0;
			}
			if ( index < 0 ) {
				index = lastTabIndex;
			}
			return index;
		}

		while ( $.inArray( constrain(), this.options.disabled ) !== -1 ) {
			index = goingForward ? index + 1 : index - 1;
		}

		return index;
	},

	_focusNextTab: function( index, goingForward ) {
		index = this._findNextTab( index, goingForward );
		this.tabs.eq( index ).focus();
		return index;
	},

	_setOption: function( key, value ) {
		if ( key === "active" ) {
			// _activate() will handle invalid values and update this.options
			this._activate( value );
			return;
		}

		if ( key === "disabled" ) {
			// don't use the widget factory's disabled handling
			this._setupDisabled( value );
			return;
		}

		this._super( key, value);

		if ( key === "collapsible" ) {
			this.element.toggleClass( "ui-tabs-collapsible", value );
			// Setting collapsible: false while collapsed; open first panel
			if ( !value && this.options.active === false ) {
				this._activate( 0 );
			}
		}

		if ( key === "event" ) {
			this._setupEvents( value );
		}

		if ( key === "heightStyle" ) {
			this._setupHeightStyle( value );
		}
	},

	_tabId: function( tab ) {
		return tab.attr( "aria-controls" ) || "ui-tabs-" + getNextTabId();
	},

	_sanitizeSelector: function( hash ) {
		return hash ? hash.replace( /[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g, "\\$&" ) : "";
	},

	refresh: function() {
		var options = this.options,
			lis = this.tablist.children( ":has(a[href])" );

		// get disabled tabs from class attribute from HTML
		// this will get converted to a boolean if needed in _refresh()
		options.disabled = $.map( lis.filter( ".ui-state-disabled" ), function( tab ) {
			return lis.index( tab );
		});

		this._processTabs();

		// was collapsed or no tabs
		if ( options.active === false || !this.anchors.length ) {
			options.active = false;
			this.active = $();
		// was active, but active tab is gone
		} else if ( this.active.length && !$.contains( this.tablist[ 0 ], this.active[ 0 ] ) ) {
			// all remaining tabs are disabled
			if ( this.tabs.length === options.disabled.length ) {
				options.active = false;
				this.active = $();
			// activate previous tab
			} else {
				this._activate( this._findNextTab( Math.max( 0, options.active - 1 ), false ) );
			}
		// was active, active tab still exists
		} else {
			// make sure active index is correct
			options.active = this.tabs.index( this.active );
		}

		this._refresh();
	},

	_refresh: function() {
		this._setupDisabled( this.options.disabled );
		this._setupEvents( this.options.event );
		this._setupHeightStyle( this.options.heightStyle );

		this.tabs.not( this.active ).attr({
			"aria-selected": "false",
			tabIndex: -1
		});
		this.panels.not( this._getPanelForTab( this.active ) )
			.hide()
			.attr({
				"aria-expanded": "false",
				"aria-hidden": "true"
			});

		// Make sure one tab is in the tab order
		if ( !this.active.length ) {
			this.tabs.eq( 0 ).attr( "tabIndex", 0 );
		} else {
			this.active
				.addClass( "ui-tabs-active ui-state-active" )
				.attr({
					"aria-selected": "true",
					tabIndex: 0
				});
			this._getPanelForTab( this.active )
				.show()
				.attr({
					"aria-expanded": "true",
					"aria-hidden": "false"
				});
		}
	},

	_processTabs: function() {
		var that = this;

		this.tablist = this._getList()
			.addClass( "ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" )
			.attr( "role", "tablist" );

		this.tabs = this.tablist.find( "> li:has(a[href])" )
			.addClass( "ui-state-default ui-corner-top" )
			.attr({
				role: "tab",
				tabIndex: -1
			});

		this.anchors = this.tabs.map(function() {
				return $( "a", this )[ 0 ];
			})
			.addClass( "ui-tabs-anchor" )
			.attr({
				role: "presentation",
				tabIndex: -1
			});

		this.panels = $();

		this.anchors.each(function( i, anchor ) {
			var selector, panel, panelId,
				anchorId = $( anchor ).uniqueId().attr( "id" ),
				tab = $( anchor ).closest( "li" ),
				originalAriaControls = tab.attr( "aria-controls" );

			// inline tab
			if ( isLocal( anchor ) ) {
				selector = anchor.hash;
				panel = that.element.find( that._sanitizeSelector( selector ) );
			// remote tab
			} else {
				panelId = that._tabId( tab );
				selector = "#" + panelId;
				panel = that.element.find( selector );
				if ( !panel.length ) {
					panel = that._createPanel( panelId );
					panel.insertAfter( that.panels[ i - 1 ] || that.tablist );
				}
				panel.attr( "aria-live", "polite" );
			}

			if ( panel.length) {
				that.panels = that.panels.add( panel );
			}
			if ( originalAriaControls ) {
				tab.data( "ui-tabs-aria-controls", originalAriaControls );
			}
			tab.attr({
				"aria-controls": selector.substring( 1 ),
				"aria-labelledby": anchorId
			});
			panel.attr( "aria-labelledby", anchorId );
		});

		this.panels
			.addClass( "ui-tabs-panel ui-widget-content ui-corner-bottom" )
			.attr( "role", "tabpanel" );
	},

	// allow overriding how to find the list for rare usage scenarios (#7715)
	_getList: function() {
		return this.element.find( "ol,ul" ).eq( 0 );
	},

	_createPanel: function( id ) {
		return $( "<div>" )
			.attr( "id", id )
			.addClass( "ui-tabs-panel ui-widget-content ui-corner-bottom" )
			.data( "ui-tabs-destroy", true );
	},

	_setupDisabled: function( disabled ) {
		if ( $.isArray( disabled ) ) {
			if ( !disabled.length ) {
				disabled = false;
			} else if ( disabled.length === this.anchors.length ) {
				disabled = true;
			}
		}

		// disable tabs
		for ( var i = 0, li; ( li = this.tabs[ i ] ); i++ ) {
			if ( disabled === true || $.inArray( i, disabled ) !== -1 ) {
				$( li )
					.addClass( "ui-state-disabled" )
					.attr( "aria-disabled", "true" );
			} else {
				$( li )
					.removeClass( "ui-state-disabled" )
					.removeAttr( "aria-disabled" );
			}
		}

		this.options.disabled = disabled;
	},

	_setupEvents: function( event ) {
		var events = {
			click: function( event ) {
				event.preventDefault();
			}
		};
		if ( event ) {
			$.each( event.split(" "), function( index, eventName ) {
				events[ eventName ] = "_eventHandler";
			});
		}

		this._off( this.anchors.add( this.tabs ).add( this.panels ) );
		this._on( this.anchors, events );
		this._on( this.tabs, { keydown: "_tabKeydown" } );
		this._on( this.panels, { keydown: "_panelKeydown" } );

		this._focusable( this.tabs );
		this._hoverable( this.tabs );
	},

	_setupHeightStyle: function( heightStyle ) {
		var maxHeight,
			parent = this.element.parent();

		if ( heightStyle === "fill" ) {
			maxHeight = parent.height();
			this.element.siblings( ":visible" ).each(function() {
				var elem = $( this ),
					position = elem.css( "position" );

				if ( position === "absolute" || position === "fixed" ) {
					return;
				}
				maxHeight -= elem.outerHeight( true );
			});

			this.element.children().not( this.panels ).each(function() {
				maxHeight -= $( this ).outerHeight( true );
			});

			this.panels.each(function() {
				$( this ).height( Math.max( 0, maxHeight -
					$( this ).innerHeight() + $( this ).height() ) );
			})
			.css( "overflow", "auto" );
		} else if ( heightStyle === "auto" ) {
			maxHeight = 0;
			this.panels.each(function() {
				maxHeight = Math.max( maxHeight, $( this ).height( "" ).height() );
			}).height( maxHeight );
		}
	},

	_eventHandler: function( event ) {
		var options = this.options,
			active = this.active,
			anchor = $( event.currentTarget ),
			tab = anchor.closest( "li" ),
			clickedIsActive = tab[ 0 ] === active[ 0 ],
			collapsing = clickedIsActive && options.collapsible,
			toShow = collapsing ? $() : this._getPanelForTab( tab ),
			toHide = !active.length ? $() : this._getPanelForTab( active ),
			eventData = {
				oldTab: active,
				oldPanel: toHide,
				newTab: collapsing ? $() : tab,
				newPanel: toShow
			};

		event.preventDefault();

		if ( tab.hasClass( "ui-state-disabled" ) ||
				// tab is already loading
				tab.hasClass( "ui-tabs-loading" ) ||
				// can't switch durning an animation
				this.running ||
				// click on active header, but not collapsible
				( clickedIsActive && !options.collapsible ) ||
				// allow canceling activation
				( this._trigger( "beforeActivate", event, eventData ) === false ) ) {
			return;
		}

		options.active = collapsing ? false : this.tabs.index( tab );

		this.active = clickedIsActive ? $() : tab;
		if ( this.xhr ) {
			this.xhr.abort();
		}

		if ( !toHide.length && !toShow.length ) {
			$.error( "jQuery UI Tabs: Mismatching fragment identifier." );
		}

		if ( toShow.length ) {
			this.load( this.tabs.index( tab ), event );
		}
		this._toggle( event, eventData );
	},

	// handles show/hide for selecting tabs
	_toggle: function( event, eventData ) {
		var that = this,
			toShow = eventData.newPanel,
			toHide = eventData.oldPanel;

		this.running = true;

		function complete() {
			that.running = false;
			that._trigger( "activate", event, eventData );
		}

		function show() {
			eventData.newTab.closest( "li" ).addClass( "ui-tabs-active ui-state-active" );

			if ( toShow.length && that.options.show ) {
				that._show( toShow, that.options.show, complete );
			} else {
				toShow.show();
				complete();
			}
		}

		// start out by hiding, then showing, then completing
		if ( toHide.length && this.options.hide ) {
			this._hide( toHide, this.options.hide, function() {
				eventData.oldTab.closest( "li" ).removeClass( "ui-tabs-active ui-state-active" );
				show();
			});
		} else {
			eventData.oldTab.closest( "li" ).removeClass( "ui-tabs-active ui-state-active" );
			toHide.hide();
			show();
		}

		toHide.attr({
			"aria-expanded": "false",
			"aria-hidden": "true"
		});
		eventData.oldTab.attr( "aria-selected", "false" );
		// If we're switching tabs, remove the old tab from the tab order.
		// If we're opening from collapsed state, remove the previous tab from the tab order.
		// If we're collapsing, then keep the collapsing tab in the tab order.
		if ( toShow.length && toHide.length ) {
			eventData.oldTab.attr( "tabIndex", -1 );
		} else if ( toShow.length ) {
			this.tabs.filter(function() {
				return $( this ).attr( "tabIndex" ) === 0;
			})
			.attr( "tabIndex", -1 );
		}

		toShow.attr({
			"aria-expanded": "true",
			"aria-hidden": "false"
		});
		eventData.newTab.attr({
			"aria-selected": "true",
			tabIndex: 0
		});
	},

	_activate: function( index ) {
		var anchor,
			active = this._findActive( index );

		// trying to activate the already active panel
		if ( active[ 0 ] === this.active[ 0 ] ) {
			return;
		}

		// trying to collapse, simulate a click on the current active header
		if ( !active.length ) {
			active = this.active;
		}

		anchor = active.find( ".ui-tabs-anchor" )[ 0 ];
		this._eventHandler({
			target: anchor,
			currentTarget: anchor,
			preventDefault: $.noop
		});
	},

	_findActive: function( index ) {
		return index === false ? $() : this.tabs.eq( index );
	},

	_getIndex: function( index ) {
		// meta-function to give users option to provide a href string instead of a numerical index.
		if ( typeof index === "string" ) {
			index = this.anchors.index( this.anchors.filter( "[href$='" + index + "']" ) );
		}

		return index;
	},

	_destroy: function() {
		if ( this.xhr ) {
			this.xhr.abort();
		}

		this.element.removeClass( "ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible" );

		this.tablist
			.removeClass( "ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" )
			.removeAttr( "role" );

		this.anchors
			.removeClass( "ui-tabs-anchor" )
			.removeAttr( "role" )
			.removeAttr( "tabIndex" )
			.removeData( "href.tabs" )
			.removeData( "load.tabs" )
			.removeUniqueId();

		this.tabs.add( this.panels ).each(function() {
			if ( $.data( this, "ui-tabs-destroy" ) ) {
				$( this ).remove();
			} else {
				$( this )
					.removeClass( "ui-state-default ui-state-active ui-state-disabled " +
						"ui-corner-top ui-corner-bottom ui-widget-content ui-tabs-active ui-tabs-panel" )
					.removeAttr( "tabIndex" )
					.removeAttr( "aria-live" )
					.removeAttr( "aria-busy" )
					.removeAttr( "aria-selected" )
					.removeAttr( "aria-labelledby" )
					.removeAttr( "aria-hidden" )
					.removeAttr( "aria-expanded" )
					.removeAttr( "role" );
			}
		});

		this.tabs.each(function() {
			var li = $( this ),
				prev = li.data( "ui-tabs-aria-controls" );
			if ( prev ) {
				li.attr( "aria-controls", prev );
			} else {
				li.removeAttr( "aria-controls" );
			}
		});

		this.panels.show();

		if ( this.options.heightStyle !== "content" ) {
			this.panels.css( "height", "" );
		}
	},

	enable: function( index ) {
		var disabled = this.options.disabled;
		if ( disabled === false ) {
			return;
		}

		if ( index === undefined ) {
			disabled = false;
		} else {
			index = this._getIndex( index );
			if ( $.isArray( disabled ) ) {
				disabled = $.map( disabled, function( num ) {
					return num !== index ? num : null;
				});
			} else {
				disabled = $.map( this.tabs, function( li, num ) {
					return num !== index ? num : null;
				});
			}
		}
		this._setupDisabled( disabled );
	},

	disable: function( index ) {
		var disabled = this.options.disabled;
		if ( disabled === true ) {
			return;
		}

		if ( index === undefined ) {
			disabled = true;
		} else {
			index = this._getIndex( index );
			if ( $.inArray( index, disabled ) !== -1 ) {
				return;
			}
			if ( $.isArray( disabled ) ) {
				disabled = $.merge( [ index ], disabled ).sort();
			} else {
				disabled = [ index ];
			}
		}
		this._setupDisabled( disabled );
	},

	load: function( index, event ) {
		index = this._getIndex( index );
		var that = this,
			tab = this.tabs.eq( index ),
			anchor = tab.find( ".ui-tabs-anchor" ),
			panel = this._getPanelForTab( tab ),
			eventData = {
				tab: tab,
				panel: panel
			};

		// not remote
		if ( isLocal( anchor[ 0 ] ) ) {
			return;
		}

		this.xhr = $.ajax( this._ajaxSettings( anchor, event, eventData ) );

		// support: jQuery <1.8
		// jQuery <1.8 returns false if the request is canceled in beforeSend,
		// but as of 1.8, $.ajax() always returns a jqXHR object.
		if ( this.xhr && this.xhr.statusText !== "canceled" ) {
			tab.addClass( "ui-tabs-loading" );
			panel.attr( "aria-busy", "true" );

			this.xhr
				.success(function( response ) {
					// support: jQuery <1.8
					// http://bugs.jquery.com/ticket/11778
					setTimeout(function() {
						panel.html( response );
						that._trigger( "load", event, eventData );
					}, 1 );
				})
				.complete(function( jqXHR, status ) {
					// support: jQuery <1.8
					// http://bugs.jquery.com/ticket/11778
					setTimeout(function() {
						if ( status === "abort" ) {
							that.panels.stop( false, true );
						}

						tab.removeClass( "ui-tabs-loading" );
						panel.removeAttr( "aria-busy" );

						if ( jqXHR === that.xhr ) {
							delete that.xhr;
						}
					}, 1 );
				});
		}
	},

	_ajaxSettings: function( anchor, event, eventData ) {
		var that = this;
		return {
			url: anchor.attr( "href" ),
			beforeSend: function( jqXHR, settings ) {
				return that._trigger( "beforeLoad", event,
					$.extend( { jqXHR : jqXHR, ajaxSettings: settings }, eventData ) );
			}
		};
	},

	_getPanelForTab: function( tab ) {
		var id = $( tab ).attr( "aria-controls" );
		return this.element.find( this._sanitizeSelector( "#" + id ) );
	}
});

})( jQuery );(function ($) {
    var BASE_CLASS = 'ui-widget ui-panel',
        HEADER_CLASS = BASE_CLASS + '-header ui-widget-header',
        BODY_CLASS = BASE_CLASS + '-body',
        MIN_CLASS = BASE_CLASS + '-min',
        MINISIZE_CLASS = BASE_CLASS + '-minisize',
        CLOSE_CLASS = BASE_CLASS + '-close',
        CONTENT_CLASS = BASE_CLASS + '-content',
        BASE_INDEX = 2048,
        uid = 0;

    $.widget('ui.Panel', {
        _create : function () {
            var me = this,
                options = this.options,
                children = this.element.children();

            this.header = $('<h3>')
                .addClass(HEADER_CLASS)
                .html(options.title)
                .appendTo(this.element)
                .click(function () {
                    me.toTop();
                });
            this.body = $('<div/>')
                .addClass(BODY_CLASS)
                .append(children)
                .appendTo(this.element);

            if (options.miniButton) {
                this.min = $('<button class="ui-button ui-state-default">-</button>').addClass(MIN_CLASS).appendTo(this.header).click(function () {
                    me.element.toggleClass(MINISIZE_CLASS);
                });
            }
            if (options.closeButton) {
                this.close = $('<button class="ui-button">x</button>').addClass(CLOSE_CLASS).appendTo(this.header).click(function () {
                    me.hide();
                });
            }

            this.element
                .css({
                    'width' : options.width,
                    'zIndex' : BASE_INDEX + (uid++)
                })
                .addClass(BASE_CLASS)
                .draggable({
                    containment : options.containment,
                    handle : this.header
                });

            if (options.height) {
                this.body.height(options.height - this.header.height());
            } else {
                this.maxHeight();
                $(window).resize(function () {
                    me.maxHeight();
                });
            }

            options.hide && this.hide();

        },
        _destroy : function () {
            this.close && this.close.unbind().remove();
            this.header.unbind().remove();
            this.min && this.min.unbind().remove();
        },
        maxHeight : function () {
            !this.options.height && this.body.css('max-height', this.options.containment.height() - 40);
        },
        show : function () {
            this.element.css({
                display:''
            });
        },
        hide : function () {
            this.element.hide();
        },
        toTop : function () {
            this.element.css('zIndex', BASE_INDEX + (uid++));
        }
    });
})(jQuery);/*
 * jQuery UI Dialog @VERSION
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/dialog/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *  jquery.ui.button.js
 *	jquery.ui.draggable.js
 *	jquery.ui.mouse.js
 *	jquery.ui.position.js
 *	jquery.ui.resizable.js
 */
(function( $, undefined ) {

var uiDialogClasses = "ui-dialog ui-widget ui-widget-content ui-corner-all ui-front ",
	sizeRelatedOptions = {
		buttons: true,
		height: true,
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true,
		width: true
	},
	resizableRelatedOptions = {
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true
	};

$.widget("ui.dialog", {
	version: "@VERSION",
	options: {
		autoOpen: true,
		buttons: {},
		closeOnEscape: true,
		closeText: "close",
		closeButton : true,
		dialogClass: "",
		draggable: true,
		hide: null,
		height: "auto",
		maxHeight: false,
		maxWidth: false,
		minHeight: 150,
		minWidth: 150,
		modal: false,
		position: {
			my: "center",
			at: "center",
			of: window,
			collision: "fit",
			// ensure that the titlebar is never outside the document
			using: function( pos ) {
				var topOffset = $( this ).css( pos ).offset().top;
				if ( topOffset < 0 ) {
					$( this ).css( "top", pos.top - topOffset );
				}
			}
		},
		resizable: true,
		show: null,
		title: "",
		width: 300
	},

	_create: function() {
		this.originalTitle = this.element.attr( "title" );
		// #5742 - .attr() might return a DOMElement
		if ( typeof this.originalTitle !== "string" ) {
			this.originalTitle = "";
		}
		this.oldPosition = {
			parent: this.element.parent(),
			index: this.element.parent().children().index( this.element )
		};
		this.options.title = this.options.title || this.originalTitle;
		var that = this,
			options = this.options,

			title = options.title || "&#160;",
			uiDialog,
			uiDialogTitlebar,
			uiDialogTitlebarClose,
			uiDialogTitle,
			uiDialogButtonPane;

			uiDialog = ( this.uiDialog = $( "<div>" ) )
				.addClass( uiDialogClasses + options.dialogClass )
				.hide()
				.mousedown(function( event ) {
					that.moveToTop( event );
				})
				.appendTo( this.document[ 0 ].body );

			this.element
				.show()
				.removeAttr( "title" )
				.addClass( "ui-dialog-content ui-widget-content" )
				.appendTo( uiDialog );

			uiDialogTitlebar = ( this.uiDialogTitlebar = $( "<div>" ) )
				.addClass( "ui-dialog-titlebar  ui-widget-header  " +
					"ui-corner-all  ui-helper-clearfix" )
				.bind( "mousedown", function() {
					// Dialog isn't getting focus when dragging (#8063)
					uiDialog.focus();
				})
				.prependTo( uiDialog );

			if (this.options.closeButton) {
				uiDialogTitlebarClose = $( "<a href='#'></a>" )
					.addClass( "ui-dialog-titlebar-close  ui-corner-all" )
					.attr( "role", "button" )
					.click(function( event ) {
						event.preventDefault();
						that.close( event );
					})
					.appendTo( uiDialogTitlebar );

				( this.uiDialogTitlebarCloseText = $( "<span>" ) )
					.addClass( "ui-icon ui-icon-closethick" )
					.text( options.closeText )
					.appendTo( uiDialogTitlebarClose );

				this._hoverable( uiDialogTitlebarClose );
				this._focusable( uiDialogTitlebarClose );

				uiDialog
					// setting tabIndex makes the div focusable
					.attr( "tabIndex", -1)
					.keydown(function( event ) {
						if ( options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
								event.keyCode === $.ui.keyCode.ESCAPE ) {
							that.close( event );
							event.preventDefault();
						}
					});
			}

			uiDialogTitle = $( "<span>" )
				.uniqueId()
				.addClass( "ui-dialog-title" )
				.html( title )
				.prependTo( uiDialogTitlebar );

			uiDialogButtonPane = ( this.uiDialogButtonPane = $( "<div>" ) )
				.addClass( "ui-dialog-buttonpane ui-widget-content ui-helper-clearfix" );

			( this.uiButtonSet = $( "<div>" ) )
				.addClass( "ui-dialog-buttonset" )
				.appendTo( uiDialogButtonPane );

		uiDialog.attr({
			role: "dialog",
			"aria-labelledby": uiDialogTitle.attr( "id" )
		});

		uiDialogTitlebar.find( "*" ).add( uiDialogTitlebar ).disableSelection();

		if ( options.draggable && $.fn.draggable ) {
			this._makeDraggable();
		}
		if ( options.resizable && $.fn.resizable ) {
			this._makeResizable();
		}

		this._createButtons( options.buttons );
		this._isOpen = false;

		// prevent tabbing out of dialogs
		this._on( uiDialog, { keydown: function( event ) {
			if ( event.keyCode !== $.ui.keyCode.TAB ) {
				return;
			}

			var tabbables = $( ":tabbable", uiDialog ),
				first = tabbables.filter( ":first" ),
				last  = tabbables.filter( ":last" );

			if ( ( event.target === last[ 0 ] || event.target === uiDialog[ 0 ] ) && !event.shiftKey ) {
				first.focus( 1 );
				return false;
			} else if ( ( event.target === first[ 0 ] || event.target === uiDialog[ 0 ] ) && event.shiftKey ) {
				last.focus( 1 );
				return false;
			}
		}});
	},

	_init: function() {
		if ( this.options.autoOpen ) {
			this.open();
		}
	},

	_destroy: function() {
		var next,
			oldPosition = this.oldPosition;

		if ( this.overlay ) {
			this.overlay.destroy();
		}
		this.uiDialog.hide();
		this.element
			.removeClass( "ui-dialog-content ui-widget-content" )
			.hide()
			.appendTo( "body" );
		this.uiDialog.remove();

		if ( this.originalTitle ) {
			this.element.attr( "title", this.originalTitle );
		}

		next = oldPosition.parent.children().eq( oldPosition.index );
		// Don't try to place the dialog next to itself (#8613)
		if ( next.length && next[ 0 ] !== this.element[ 0 ] ) {
			next.before( this.element );
		} else {
			oldPosition.parent.append( this.element );
		}
	},

	widget: function() {
		return this.uiDialog;
	},

	close: function( event ) {
		var that = this;

		if ( !this._isOpen ) {
			return;
		}

		if ( false === this._trigger( "beforeClose", event ) ) {
			return;
		}

		this._isOpen = false;

		if ( this.overlay ) {
			this.overlay.destroy();
		}

		if ( !this.opener.filter( ":focusable" ).focus().length ) {
			// Hiding a focused element doesn't trigger blur in WebKit
			// so in case we have nothing to focus on, explicitly blur the active element
			// https://bugs.webkit.org/show_bug.cgi?id=47182
			$( this.document[ 0 ].activeElement ).blur();
		}

		this._hide( this.uiDialog, this.options.hide, function() {
			that._trigger( "close", event );
		});
	},

	isOpen: function() {
		return this._isOpen;
	},

	moveToTop: function( event, silent ) {
		var moved = this.uiDialog.nextAll( ":visible" ).insertBefore( this.uiDialog );
		if ( !silent && moved.length ) {
			this._trigger( "focus", event );
		}
	},

	open: function() {
		if ( this._isOpen ) {
			return;
		}

		var hasFocus,
			options = this.options,
			uiDialog = this.uiDialog;

		this.opener = $( this.document[ 0 ].activeElement );

		this._size();
		this._position( options.position );
		this.overlay = options.modal ? new $.ui.dialog.overlay( this ) : null;
		this.moveToTop( null, true );
		this._show( uiDialog, options.show );

		// set focus to the first tabbable element in the content area or the first button
		// if there are no tabbable elements, set focus on the dialog itself
		hasFocus = this.element.find( ":tabbable" );
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogButtonPane.find( ":tabbable" );
			if ( !hasFocus.length ) {
				hasFocus = uiDialog;
			}
		}
		hasFocus.eq( 0 ).focus();

		this._isOpen = true;
		this._trigger( "open" );
		this._trigger( "focus" );

		return this;
	},

	_keepFocus: function( event ) {
		function checkFocus() {
			var activeElement = this.document[ 0 ].activeElement,
				isActive = this.uiDialog[ 0 ] === activeElement ||
					$.contains( this.uiDialog[ 0 ], activeElement );
			if ( !isActive ) {
				this.uiDialog.focus();
			}
		}
		event.preventDefault();
		checkFocus.call( this );
		// support: IE
		// IE <= 8 doesn't prevent moving focus even with event.preventDefault()
		// so we check again later
		this._delay( checkFocus );
	},

	_createButtons: function( buttons ) {
		var that = this,
			hasButtons = false;

		// if we already have a button pane, remove it
		this.uiDialogButtonPane.remove();
		this.uiButtonSet.empty();

		if ( typeof buttons === "object" && buttons !== null ) {
			$.each( buttons, function() {
				return !(hasButtons = true);
			});
		}
		if ( hasButtons ) {
			$.each( buttons, function( name, props ) {
				var button, click;
				props = $.isFunction( props ) ?
					{ click: props, text: name } :
					props;
				// Default to a non-submitting button
				props = $.extend( { type: "button" }, props );
				// Change the context for the click callback to be the main element
				click = props.click;
				props.click = function() {
					click.apply( that.element[0], arguments );
				};
				button = $( "<button></button>", props )
					.appendTo( that.uiButtonSet );
				if ( $.fn.button ) {
					button.button();
				}
			});
			this.uiDialog.addClass( "ui-dialog-buttons" );
			this.uiDialogButtonPane.appendTo( this.uiDialog );
		} else {
			this.uiDialog.removeClass( "ui-dialog-buttons" );
		}
	},

	_makeDraggable: function() {
		var that = this,
			options = this.options;

		function filteredUi( ui ) {
			return {
				position: ui.position,
				offset: ui.offset
			};
		}

		this.uiDialog.draggable({
			cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
			handle: ".ui-dialog-titlebar",
			containment: "document",
			start: function( event, ui ) {
				$( this )
					.addClass( "ui-dialog-dragging" );
				that._trigger( "dragStart", event, filteredUi( ui ) );
			},
			drag: function( event, ui ) {
				that._trigger( "drag", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				options.position = [
					ui.position.left - that.document.scrollLeft(),
					ui.position.top - that.document.scrollTop()
				];
				$( this )
					.removeClass( "ui-dialog-dragging" );
				that._trigger( "dragStop", event, filteredUi( ui ) );
			}
		});
	},

	_makeResizable: function( handles ) {
		handles = (handles === undefined ? this.options.resizable : handles);
		var that = this,
			options = this.options,
			// .ui-resizable has position: relative defined in the stylesheet
			// but dialogs have to use absolute or fixed positioning
			position = this.uiDialog.css( "position" ),
			resizeHandles = typeof handles === 'string' ?
				handles	:
				"n,e,s,w,se,sw,ne,nw";

		function filteredUi( ui ) {
			return {
				originalPosition: ui.originalPosition,
				originalSize: ui.originalSize,
				position: ui.position,
				size: ui.size
			};
		}

		this.uiDialog.resizable({
			cancel: ".ui-dialog-content",
			containment: "document",
			alsoResize: this.element,
			maxWidth: options.maxWidth,
			maxHeight: options.maxHeight,
			minWidth: options.minWidth,
			minHeight: this._minHeight(),
			handles: resizeHandles,
			start: function( event, ui ) {
				$( this ).addClass( "ui-dialog-resizing" );
				that._trigger( "resizeStart", event, filteredUi( ui ) );
			},
			resize: function( event, ui ) {
				that._trigger( "resize", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				$( this ).removeClass( "ui-dialog-resizing" );
				options.height = $( this ).height();
				options.width = $( this ).width();
				that._trigger( "resizeStop", event, filteredUi( ui ) );
			}
		})
		.css( "position", position )
		.find( ".ui-resizable-se" )
			.addClass( "ui-icon ui-icon-grip-diagonal-se" );
	},

	_minHeight: function() {
		var options = this.options;

		if ( options.height === "auto" ) {
			return options.minHeight;
		} else {
			return Math.min( options.minHeight, options.height );
		}
	},

	_position: function( position ) {
		var myAt = [],
			offset = [ 0, 0 ],
			isVisible;

		if ( position ) {
			// deep extending converts arrays to objects in jQuery <= 1.3.2 :-(
	//		if (typeof position == 'string' || $.isArray(position)) {
	//			myAt = $.isArray(position) ? position : position.split(' ');

			if ( typeof position === "string" || (typeof position === "object" && "0" in position ) ) {
				myAt = position.split ? position.split( " " ) : [ position[ 0 ], position[ 1 ] ];
				if ( myAt.length === 1 ) {
					myAt[ 1 ] = myAt[ 0 ];
				}

				$.each( [ "left", "top" ], function( i, offsetPosition ) {
					if ( +myAt[ i ] === myAt[ i ] ) {
						offset[ i ] = myAt[ i ];
						myAt[ i ] = offsetPosition;
					}
				});

				position = {
					my: myAt[0] + (offset[0] < 0 ? offset[0] : "+" + offset[0]) + " " +
						myAt[1] + (offset[1] < 0 ? offset[1] : "+" + offset[1]),
					at: myAt.join( " " )
				};
			}

			position = $.extend( {}, $.ui.dialog.prototype.options.position, position );
		} else {
			position = $.ui.dialog.prototype.options.position;
		}

		// need to show the dialog to get the actual offset in the position plugin
		isVisible = this.uiDialog.is( ":visible" );
		if ( !isVisible ) {
			this.uiDialog.show();
		}
		this.uiDialog.position( position );
		if ( !isVisible ) {
			this.uiDialog.hide();
		}
	},

	_setOptions: function( options ) {
		var that = this,
			resizableOptions = {},
			resize = false;

		$.each( options, function( key, value ) {
			that._setOption( key, value );

			if ( key in sizeRelatedOptions ) {
				resize = true;
			}
			if ( key in resizableRelatedOptions ) {
				resizableOptions[ key ] = value;
			}
		});

		if ( resize ) {
			this._size();
		}
		if ( this.uiDialog.is( ":data(ui-resizable)" ) ) {
			this.uiDialog.resizable( "option", resizableOptions );
		}
	},

	_setOption: function( key, value ) {
		var isDraggable, isResizable,
			uiDialog = this.uiDialog;

		switch ( key ) {
			case "buttons":
				this._createButtons( value );
				break;
			case "closeText":
				// ensure that we always pass a string
				this.uiDialogTitlebarCloseText && this.uiDialogTitlebarCloseText.text( "" + value );
				break;
			case "dialogClass":
				uiDialog
					.removeClass( this.options.dialogClass )
					.addClass( uiDialogClasses + value );
				break;
			case "disabled":
				if ( value ) {
					uiDialog.addClass( "ui-dialog-disabled" );
				} else {
					uiDialog.removeClass( "ui-dialog-disabled" );
				}
				break;
			case "draggable":
				isDraggable = uiDialog.is( ":data(ui-draggable)" );
				if ( isDraggable && !value ) {
					uiDialog.draggable( "destroy" );
				}

				if ( !isDraggable && value ) {
					this._makeDraggable();
				}
				break;
			case "position":
				this._position( value );
				break;
			case "resizable":
				// currently resizable, becoming non-resizable
				isResizable = uiDialog.is( ":data(ui-resizable)" );
				if ( isResizable && !value ) {
					uiDialog.resizable( "destroy" );
				}

				// currently resizable, changing handles
				if ( isResizable && typeof value === "string" ) {
					uiDialog.resizable( "option", "handles", value );
				}

				// currently non-resizable, becoming resizable
				if ( !isResizable && value !== false ) {
					this._makeResizable( value );
				}
				break;
			case "title":
				// convert whatever was passed in o a string, for html() to not throw up
				$( ".ui-dialog-title", this.uiDialogTitlebar )
					.html( "" + ( value || "&#160;" ) );
				break;
		}

		this._super( key, value );
	},

	_size: function() {

		// If the user has resized the dialog, the .ui-dialog and .ui-dialog-content
		// divs will both have width and height set, so we need to reset them
		var nonContentHeight, minContentHeight,
			options = this.options;

		// reset content sizing
		this.element.show().css({
			width: "auto",
			minHeight: 0,
			height: 0
		});

		if ( options.minWidth > options.width ) {
			options.width = options.minWidth;
		}

		// reset wrapper sizing
		// determine the height of all the non-content elements
		nonContentHeight = this.uiDialog.css({
				height: "auto",
				width: options.width
			})
			.outerHeight();
		minContentHeight = Math.max( 0, options.minHeight - nonContentHeight );

		if ( options.height === "auto" ) {
			this.element.css({
				minHeight: minContentHeight,
				height: "auto"
			});
		} else {
			this.element.height( Math.max( options.height - nonContentHeight, 0 ) );
		}

		if (this.uiDialog.is( ":data(ui-resizable)" ) ) {
			this.uiDialog.resizable( "option", "minHeight", this._minHeight() );
		}
	}
});

$.extend($.ui.dialog, {
	uuid: 0,

	getTitleId: function($el) {
		var id = $el.attr( "id" );
		if ( !id ) {
			this.uuid += 1;
			id = this.uuid;
		}
		return "ui-dialog-title-" + id;
	},

	overlay: function( dialog ) {
		this.$el = $.ui.dialog.overlay.create( dialog );
	}
});

$.extend( $.ui.dialog.overlay, {
	instances: [],
	// reuse old instances due to IE memory leak with alpha transparency (see #5185)
	oldInstances: [],
	create: function( dialog ) {

		var $el = ( this.oldInstances.pop() || $( "<div>" ).addClass( "ui-widget-overlay ui-front" ) );

		$el.appendTo( document.body );

		$el.bind( "mousedown", function( event ) {
			dialog._keepFocus( event );
		});

		this.instances.push( $el );
		return $el;
	},

	destroy: function( $el ) {
		var indexOf = $.inArray( $el, this.instances );

		if ( indexOf !== -1 ) {
			this.oldInstances.push( this.instances.splice( indexOf, 1 )[ 0 ] );
		}

		if ( this.instances.length === 0 ) {
			$( [ document, window ] ).unbind( ".dialog-overlay" );
		}

		$el.remove();
	}
});

$.extend( $.ui.dialog.overlay.prototype, {
	destroy: function() {
		$.ui.dialog.overlay.destroy( this.$el );
	}
});

}( jQuery ) );(function ($) {
    var BASE_CLASS = 'ui-minipager';
    $.widget('ui.minipager', {
        options : {
            total : 1,
            page : 0
        },
        _create : function () {
            var me = this,
                options = this.options;

            this.element.append($('<button><i class="icon-small icon-small-first"></i></button><button><i class="icon-small icon-small-prev"></i></button><button><i class="icon-small icon-small-next"></i></button><button><i class="icon-small icon-small-last"></i></button>')).buttonset();
            this.element.data('widgetName', this.widgetFullName);

            this.first = this.element.children().first()
                .click(function (e) {
                    me._trigger('change', e, {
                        page : me.options.page = 0
                    });
                    me.setState();
                });
            this.pre = this.first.next()
                .click(function (e) {
                    var page = me.options.page;
                    if (page > 0) {
                        me._trigger('change', e, {
                            page : me.options.page = page - 1
                        });
                    }
                    me.setState();
                });
            this.nxt = this.pre.next()
                .click(function (e) {
                    var page = me.options.page;
                    if (page < me.options.total - 1) {
                        me._trigger('change', e, {
                            page : me.options.page = page + 1
                        });
                    }
                    me.setState();
                });
            this.last = this.nxt.next()
                .click(function (e) {
                    me._trigger('change', e, {
                        page : me.options.page = me.options.total - 1
                    });
                    me.setState();
                });

            this.setState();
        },
        setState : function () {
            this.pre.button('option', 'disabled', this.options.page <= 0);
            this.first.button('option', 'disabled', this.options.page <= 0);
            this.nxt.button('option', 'disabled', this.options.page >= this.options.total - 1);
            this.last.button('option', 'disabled', this.options.page >= this.options.total - 1);
        },
        _setOption : function (k, v) {
            $.Widget.prototype._setOption.call(this, k, v);
            if (k === 'total' || k === 'page') {
                this.setState();
            }
        } 
    });
})(jQuery);(function ($) {
    $.widget('ui.formdialog', {
        _create : function () {
            var me = this,
                options = this.options;

            this.widgetEventPrefix = 'formdialog';

            this.form = $('form', this.element)
                .append('<input style="position:absolute;top:-1000px" type="submit" value="登录"/>')
                .submit(function (e) {
                    e.preventDefault();
                    var array = $(this).serializeArray(),
                        data = {};
                    $.each(array, function (i, item) {
                        if (data[item.name]) {
                            if (data[item.name] instanceof Array) {
                                data[item.name].push(item.value);
                            } else {
                                data[item.name] = [v, item.value];
                            }
                        } else {
                            data[item.name] = item.value;
                        }
                    });
                    me._trigger('ok', null, data);
                    me.element.dialog('close');
                });

            this.element
                .data('widgetName', this.widgetFullName)
                .dialog({
                    autoOpen : false,
                    modal : true,
                    resizable : false,
                    width : options.width || 300,
                    buttons : [
                        { 
                            text : '确定',
                            click : function () {
                                me.form.submit();
                            },
                            'class' : 'ui-state-em'
                        },
                        {
                            text : '取消',
                            click : function (e) {
                                $(this).dialog('close');
                            }
                        }
                    ]
                });
        },
        _destroy : function () {
            this.form.unbind().remove();
        },
        open : function () {
            this.form[0].reset();
            this._trigger('open', null);
            this.element.dialog('open');
        }
    });
})(jQuery);(function ($) {
    var COPY_FLASH_URL = 'http://adbox.sina.com.cn/assets/images/fClipboard.swf',
        BASE_CLASS = 'ui-copybutton',
        FLASH_CLASS = BASE_CLASS + '-flash',
        REAL_BTN_CLASS = BASE_CLASS + '-btn',
        uid = 0;

    $.widget('ui.copybutton', {
        _create : function () {
            this.flashid = 'uiCopybutton' + (uid++);
            this.element.addClass(REAL_BTN_CLASS).button();

            this.flash = $('<div class="' + FLASH_CLASS + '" >' + $.createSwfHTML({
                url : COPY_FLASH_URL,
                width : this.options.width || 40,
                height : this.options.height || 20,
                wmode : 'transparent',
                allowscriptaccess : 'always',
                id : this.flashid
            }) + '</div>');
            this.copy = $('<div/>').addClass(BASE_CLASS)
                .appendTo(this.element.parent())
                .append(this.element)
                .append(this.flash);

            this.timer = setInterval($.proxy($.ui.copybutton.initHandler, this), 500);

            $.ui.copybutton['copyScript' + this.flashid] = $.proxy($.ui.copybutton.copyScript, this);
            $.ui.copybutton['mouseEventHandler' + this.flashid] = $.proxy($.ui.copybutton.mouseEventHandler, this);
        },
        _destroy : function () {
            delete $.ui.copybutton['copyScript' + this.flashid];
        }
    });
    $.ui.copybutton.initHandler = function () {
        var swf = $.swf.getMovie(this.flashid);
        if(swf && swf.flashInit && swf.flashInit()){
            swf.setHandCursor(true);
            swf.setContentFuncName('jQuery.ui.copybutton.copyScript' + this.flashid);
            swf.setMEFuncName('jQuery.ui.copybutton.mouseEventHandler' + this.flashid);
            clearInterval(this.timer);
        }
    };
    $.ui.copybutton.copyScript = function () {
        //debug(content);
        var content = this.options.content ? this.options.content.val() : '';
        this._trigger('copy', null, {
            content : content
        });
        return content; 
    };
    $.ui.copybutton.mouseEventHandler = function (eventType) {
        //debug(eventType);
        var btn = this.element;
        switch(eventType){
            case 'mouse_over':
                btn.addClass("ui-state-hover");
                break;
            case 'mouse_out':
                btn.removeClass("ui-state-hover");
                btn.removeClass("ui-state-active");
                break;
            case 'mouse_down':
                btn.addClass("ui-state-active");
                break;
            case 'mouse_up':
                btn.removeClass("ui-state-active");
                break;
            default:
                break;
        }
    };

})(jQuery);/**
 * 为所有$.widget增加获取他们的实例的方法
 */
$.fn.extend({
    getInstance : function () {
        var widgetName = this.data('widgetName');
        return widgetName ? this.data($.camelCase(widgetName)) : null;
    }
});/*!
 * 潘多拉广告基础元件
 * author : acelan(xiaobin8[at]staff.sina.com.cn)
 */
/*
 * com & group base
 * 实现一个可以拖拽跟缩放的对象
 */
(function ($) {
    var z = 0;
    $.widget('pandora.ObjBase', {
        prop : {
            w : {
                type : 'number',
                label : '宽'
            },
            h : {
                type : 'number',
                label : '高'
            },
            x : {
                type : 'number',
                label : '坐标x',
                level : 'base'
            },
            y : {
                type : 'number',
                label : '坐标y',
                level : 'base'
            },
            z : {
                label : '坐标z',
                level : 'base'
            },
            interactive : {
                type : 'objarray',
                map : {
                    effect : {
                        type : 'interactive',
                        label : ''
                    }
                },
                min : 0,
                max : 3,
                label : '动作',
                buttonText : ' + 添加一个动作'
            }
        },
        options : {
            resizable : true,
            x : 0,
            y : 0,
            w : 60,
            h : 40
        },
        _create : function () {
            var options = this.options,
                container = options.container || this.element.parent() || $('body'),
                z = options.z || (z++);

            this.widgetEventPrefix = 'obj';

            this.view = $('<div class="obj-view"/>').appendTo(this.element);

            this.element
                .css({
                    'z-index' : z,
                    'position' : 'absolute'
                })
                .addClass('obj')
                .data('widgetName', this.widgetFullName)
                .draggable({
                    containment : container,
                    start : $.proxy(this._dragstartHandler, this),
                    drag : $.proxy(this._draggingHandler, this),
                    stop : $.proxy(this._dragendHandler, this)
                });

            options.resizable && this.element.resizable({
                minWidth : this.options.minWidth || 60,
                minHeight : this.options.minHeight || 20,
                zIndex : z,
                helper : "ui-resizable-helper",
                //八个方向均可拖拽缩放
                handles : "n, e, s, w, ne, se, sw, nw",
                resize : $.proxy(this._resizingHandler, this),
                stop : $.proxy(this._resizeendHandler, this)
            });


            options.tag && this.element.append($('<div class="obj-tag">' + options.tag + '</div>'));

            this.setSize(this.options.w, this.options.h);
            this.setPos(this.options.x, this.options.y);

            this._setOption('disabled', options.disabled);
        },

        _destroy : function () {
            this.view
                .removeClass('obj-view')
                .unbind()
                .removeData()
                .remove();
        },

        _setOption : function (k, v) {
            $.Widget.prototype._setOption.call(this, k, v);

            if (k === 'disabled') {
                v ? this.element.addClass('obj-disabled') : this.element.removeClass('obj-disabled');
                this.element.draggable('option', 'disabled', v);
                this.options.resizable && this.element.resizable('option', 'disabled', v);
            }
        },

        setSize : function (w, h) {
            this.element.css({
                width : w,
                height : h
            });
            this.view.css({
                width : w,
                height : h
            });
        },

        setPos : function (x, y) {
            this.element.css({
                left : x,
                top : y
            });
        },

        _renderW : function () {
            this.setSize(this.options.w, this.options.h);
        },
        _renderH : function () {
            this.setSize(this.options.w, this.options.h);
        },
        _renderX : function () {
            this.setPos(this.options.x, this.options.y);
        },
        _renderY : function () {
            this.setPos(this.options.x, this.options.y);
        },
        _renderZ : function () {
            this.element.css('zIndex', this.options.z);
        },

        _dragstartHandler : function (e, ui) {
            this._trigger('dragstart', e, {
                x : ui.position.left,
                y : ui.position.top
            });
        },
        _draggingHandler : function (e, ui) {
            this._trigger('dragging', e, {
                x : ui.position.left,
                y : ui.position.top,
                offsetX : ui.position.left - ui.originalPosition.left,
                offsetY : ui.position.top - ui.originalPosition.top
            });
        },
        _dragendHandler : function (e, ui) {
            this.setPos(ui.position.left, ui.position.top);
            this._trigger('dragend', e, {
                x : this.options.x = ui.position.left,
                y : this.options.y = ui.position.top,
                offsetX : ui.position.left - ui.originalPosition.left,
                offsetY : ui.position.top - ui.originalPosition.top
            });
        },
        _resizingHandler : function (e, ui) {
            this._trigger('resizing', e, {
                w : ui.size.width,
                h : ui.size.height,
                x : ui.position.left,
                y : ui.position.top
            });
        },
        _resizeendHandler : function (e, ui) {
            var x = this.options.x + ui.position.left - ui.originalPosition.left,
                y = this.options.y + ui.position.top - ui.originalPosition.top;

            this.setSize(ui.size.width, ui.size.height);
            this.setPos(x, y);
            this._trigger('resizend', e, {
                w : this.options.w = ui.size.width,
                h : this.options.h = ui.size.height,
                x : this.options.x = x,
                y : this.options.y = y
            });
        },

        getProp : $.noop,

        /* 设置控件属性 */
        _setValue : function (k, v) {
            var handler = this[$.pandora.ObjBase.getRefreshPropHandlerName(k)];
            this.options[k] = v;
            handler && handler.call(this);
        },
        setValue : function () {
            if (arguments.length === 1) {
                var o = arguments[0];
                for (var k in o) {
                    this._setValue(k, o[k]);
                }
            } else if (arguments.length === 2){
                this._setValue(arguments[0], arguments[1]);
            }
        },
        getValue : function () {
            var r = {};
            r.type = this.widgetName;
            r.options = {};
            for (var k in this.prop) {
                ('undefined' != typeof this.options[k]) && (r.options[k] = this.options[k]);
            }
            return r;
        }
    });
    $.pandora.ObjBase.getRefreshPropHandlerName = function (k) {
        return '_render' + k.charAt(0).toUpperCase() + k.substring(1);
    };
})(jQuery);(function ($) {
    $.widget('pandora.Com', $.pandora.ObjBase, {
        /* widget使用的prop属性描述 */
        prop : {
            bgcolor : {
                type : 'color',
                label : '背景颜色'
            },
            font : {
                type : 'font',
                label : '文字样式'
            },
            color : {
                type : 'color',
                label : '文字颜色'
            },
            opacity : {
                type : 'range',
                range : {
                    min : 0,
                    max : 100
                },
                label : '透明度'
            }
        },
        options : {
            x : 0,
            y : 0,
            w : 90,
            h : 60,
            opacity : 0,
            font : {
                'font-family' : 'Arial'
            },
            color : '#333'
        },
        _create : function () {
            $.pandora.ObjBase.prototype._create.call(this, this.options);

            this.options.opacity && (this.options.opacity > 0) && (this._renderOpacity());

            this._renderBgcolor();
            this._renderColor();
            this._renderFont();
            this._renderSkin();

            this.element.addClass('com');
        },

        _destroy : function () {
            this.element.removeClass('com');
            $.pandora.ObjBase.prototype._destroy.call(this);
        },

        _renderBgcolor : function () {
            this.options.bgcolor && this.view.css('background-color', this.options.bgcolor);
        },

        _isSkinClass : function (cn) {
            return cn.indexOf(this.widgetName + '-skin-') >= 0;
        },

        _genSkinClass : function () {
            return this.widgetName + '-skin-' + this.options.skin;
        },

        _renderSkin : function () {
            var me = this,
                cn = this.element[0].className.split(' ');
            $.each(cn, function(i, item) {
                me._isSkinClass(item) && me.element.removeClass(item);
            });
            this.element.addClass(this._genSkinClass());
        },
        _renderOpacity : function () {
            this.view.css('opacity', (100 - this.options.opacity) / 100);
        },
        _renderFont : function () {
            this.view.css(this.options.font);
        },
        _renderColor : function () {
            this.view.css('color', this.options.color);
        },

        //======
        /* 获取控件属性值 */
        getProp : function () {
            var r = {};
            for (var k in this.prop) {
                $.extend(r[k] = {}, this.prop[k], {value : this.options[k]});
            }
            return r;
        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.Retangle', $.pandora.Com, {
        prop : {
            color : {
                level : 'base'
            },
            font : {
                level : 'base'
            },
            url : {
                type : 'text',
                label : '链接地址'
            }
        },
    	options : {
    		bgcolor : '#ccc'
    	},
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);
        }
    });
})(jQuery);(function ($) {
    var GROUP_FILTER = 'group',
        GROUP_ATOM_FILTER = 'group-atom';

    $.widget('pandora.Group', $.pandora.ObjBase, {
        prop : {
            w : {
                disabled : true
            },
            h : {
                disabled : true
            },
            type : {
                type : 'switchobj',
                label : '类型'
            }
        },
        options : {
            resizable : false
        },
        _create : function () {
            $.pandora.ObjBase.prototype._create.call(this, this.options);
            this.element.addClass(GROUP_FILTER);
        },
        _destroy : function () {
            this.element.removeClass(GROUP_FILTER);
            $.pandora.ObjBase.prototype._destroy.call(this);
        },
        connect : function (coms) {
            var me = this,
                options = this.options,
                x, y, w, h, relativeX, relativeY,
                lefts = [],
                tops = [],
                rights = [],
                bottoms = [],
                $item,
                instance,
                value;

            this.options.coms = coms;

            $.each(coms, function (i, item) {
                $item = $('#' + item.uid);
                instance = $item.getInstance();
                value = instance.getValue().options;

                $item.addClass(GROUP_ATOM_FILTER);
                instance.disable();

                lefts.push(value.x - 0);
                tops.push(value.y - 0);
                rights.push((value.w - 0) + (value.x - 0));
                bottoms.push((value.h - 0) + (value.y - 0));
            });

            x = Math.min.apply(null, lefts);
            y = Math.min.apply(null, tops);
            w = Math.max.apply(null, rights) - x + 2;
            h = Math.max.apply(null, bottoms) - y + 2,
            z = this.options.z;

            $.extend(this.options, {
                x : x,
                y : y,
                w : w,
                h : h
            });

            $.each(coms, function (i, item) {
                ////debug(coms);
                $item = $('#' + item.uid);
                relativeX = lefts[i] - x;
                relativeY = tops[i] - y;
                relativeZ = z + item.options.z;
                $item.getInstance().setValue({
                    x : relativeX,
                    y : relativeY,
                    z : relativeZ
                });
                $item.data({
                    'relativeX' : relativeX,
                    'relativeY' : relativeY,
                    'relativeZ' : relativeZ
                });
                me.view.append($item);
            });
            
            if (options.resizable) {
                this.element.resizable('option', {'minHeight' : h, 'minWidth' : w});
            }
            this.setPos(x, y);
            this.setSize(w, h);
        },
        unconnect : function () {
            var container = this.element.parent(),
                x = this.options.x,
                y = this.options.y,
                z = this.options.z,
                objs = [];
            $.each(this.options.coms, function (i, item) {
                objs.push(item);
                var $item = $('#' + item.uid),
                    instance = $item.getInstance();
                $item.removeClass(GROUP_ATOM_FILTER);
                $item.appendTo(container);
                instance.enable();
                //debug(item, z);
                instance.setValue({
                    x : $item.data('relativeX') + x,
                    y : $item.data('relativeY') + y,
                    z : $item.data('relativeZ') - z
                });
            });
            this.options.coms = null;
            return objs;
        },
        getProp : function () {
            var r = {},
                me = this;

            $.map(this.prop, function (prop, k) {
                prop.value = me.options[k];
                r[k] = prop;
            });

            return r;
        },
        /* 设置控件属性 */
        _setValue : function (k, v) {
            if (this.prop[k]) {
                var handler = this[$.pandora.ObjBase.getRefreshPropHandlerName(k)];
                this.options[k] = v;
                handler && handler.call(this);
            }
        },
        setValue : function () {
            if (arguments.length === 1) {
                var o = arguments[0];
                for (var k in o) {
                    this._setValue(k, o[k]);
                }
            } else if (arguments.length === 2){
                this._setValue(arguments[0], arguments[1]);
            }
        },
        getValue : function () {
            var r = {},
                value;

            r.type = this.widgetName;
            r.options = {
                coms : []
            };
            for (var k in this.prop) {
                ('undefined' != typeof this.options[k]) && (r.options[k] = this.options[k]);
            }
            $.each(this.options.coms, function (i, item) {
                value = $('#' + item.uid).getInstance().getValue();
                value.uid = item.uid;
                r.options.coms.push(value);
            });
            return r;
        }
    });
    $.pandora.Group.isGroup = function (item) {
        return $(item).hasClass(GROUP_FILTER);
    };
    $.pandora.Group.isGroupAtom = function (item) {
        return $(item).hasClass(GROUP_ATOM_FILTER);
    };
})(jQuery);(function ($) {
    $.widget('pandora.Btn', $.pandora.Com, {
        prop : {
            text : {
                type : 'string',
                label : '按钮文字'
            },
            bgcolor : {
                level : 'base'
            },
            type : {
                type : 'select',
                datasource : [
                    {name : '普通按钮', value : 'button'},
                    {name : '提交按钮', value : 'submit'},
                    {name : '重置按钮', value : 'reset'}
                ],
                label : '类型'
            },
            skin : {
                type : 'radio',
                datasource : [
                    'default', 'lightblue', 'red', 'green', 'blue', 'gorden', 'black'
                ],
                format : function (i, skin) {
                    return '<div class="btn-skin-block"><div class="skin-btn Btn-skin-' + skin + '"><div class="com-btn">按钮</div></div></div>'; 
                },
                label : '按钮样式'
            },
            url : {
                type : 'text',
                label : '跳转链接'
            }
        },
        options : {
            w : 60,
            h : 20,
            text : '按钮',
            skin : 'default',
            type : 'button'
        },
        setSize : function (w, h) {
            $.pandora.Com.prototype.setSize.call(this, w, h);
            $('table', this.view).css({
                width : w - 4,
                height : h - 4
            });
        },
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-btn');
            this._renderFont();
            this._renderText();
        },
        _destroy : function () {
            this.view.removeClass('com-btn');
            $.pandora.Com.prototype._destroy.call(this);
        },
        _renderText : function () {
            this._renderType();
        },
        _renderType : function () {
            var text = this.options.text ? this.options.text  : {
                'button' : '按钮',
                'submit' : '提交',
                'reset'  : '重置'
            }[this.options.type];
            this.view.html('<table cellpadding="0" cellspacing="0" style="width:' + this.options.w + 'px;height:' + this.options.h + 'px;"><tr><td>' + text + '</td></tr></table>');
        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.Txt', $.pandora.Com, {
        prop : {
            text : {
                label : '文字'
            },
            url : {
                type : 'text',
                label : '链接地址'
            }
        },
        options : {
            w : 160,
            h : 90,
            text : '双击修改文字内容...',
            url : ''
        },
        _create : function () {
            var me = this;
            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-txt');

            this.view.editable({
                editBy:"dblclick",
                type:"textarea",
                onSubmit : function (v) {
                    me.options.text = v.current;
                }
            });
            this._renderFont();
            this._renderColor();
            this._renderText();
        },
        _renderText : function () {
            this.view.html(this.options.text);
        }
    });
})(jQuery);(function ($) {
    var DEFAULT_IMAGE = 'http://adbox.sina.com.cn/maker/assets/img/adbox-default.png';
    $.widget('pandora.Img', $.pandora.Com, {
        prop : {
            src : {
                type : 'picture',
                label : '素材',
                mtype : 1
            },
            link : {
                type : 'text',
                label : '跳转链接'
            },
            color : {
                level : 'base'
            },
            font : {
                level : 'base'
            },
            bgcolor : {
                level : 'base'
            }
        },
        options : {
            w : 0,
            h : 0,
            src : {
                url : DEFAULT_IMAGE,
                width : 200,
                height : 150
            }
        },
        setSize : function (w, h) {
            $.pandora.Com.prototype.setSize.call(this, w, h);
            $('img', this.view).css({
                width : w,
                height : h
            });
        },
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-img');
            this._renderSrc(true);
        },
        _destroy : function () {
            this.view.removeClass('com-img');
            $.pandora.Com.prototype._destroy.call(this);
        },
        _renderSrc : function (isInit) {
            var img = new Image(),
                me = this;
            //debug(this.options)
            if (!isInit) {
                this.options.w = this.options.src.width;
                this.options.h = this.options.src.height;
            }
            img.onload = function () {
                me.view.html('<img src="' + me.options.src.url + '"/>');
                me.setSize(me.options.w = me.options.w || me.options.src.width, me.options.h = me.options.h || me.options.src.height);
                img.onload = null;
                img = null;
            }
            img.src = this.options.src.url;        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.Qrcode', $.pandora.Img, {
        prop : {
            src : {
                type : 'picture',
                label : '路径',
                mtype : 1,
                source : [
                    {
                        'type': 'LocalUpload',
                        'label': '本地',
                        'options': {}
                    },
                    {
                        'type': 'UrlUpload',
                        'label': 'url',
                        'options': {}
                    },
                    {
                        'type' : 'QrcodeGenerator',
                        'label' : 'url生成',
                        'options' : {
                            type : 2
                        }
                    },
                    {
                        'type' : 'QrcodeGenerator',
                        'label' : '电话生成',
                        'options' : {
                            type : 1
                        }
                    }
                ]
            },
            color : {
                level : 'base'
            },
            font : {
                level : 'base'
            },
            bgcolor : {
                level : 'base'
            }
        },
        options : {
            w : 0,
            h : 0,
            src : {
                url : 'http://sinastorage.com/sandbox/qr/2497.png',
                width : 60,
                height : 60
            }
        },
        _create : function () {
            $.pandora.Img.prototype._create.call(this, this.options);
        }
    });
})(jQuery);(function ($) {
    var DEFAULT_SWF = 'http://adbox.sina.com.cn/maker/assets/img/adbox-default.swf';
    $.widget('pandora.Fla', $.pandora.Com, {
        prop : {
            src : {
                type : 'picture',
                label : '素材',
                mtype : 2
            },
            link : {
                type : 'text',
                label : '跳转链接'
            },
            color : {
                level : 'base'
            },
            font : {
                level : 'base'
            },
            bgcolor : {
                level : 'base'
            }
        },
        options : {
            w : 0,
            h : 0,
            src : {
                url : DEFAULT_SWF,
                width : 300,
                height : 250
            }
        },
        setSize : function (w, h) {
            $.pandora.Com.prototype.setSize.call(this, w, h);
            $('embed', this.view).attr({
                width : w,
                height : h
            });
            $('.com-fla-view-mask', this.view).css({
                width : w,
                height : h
            });
        },
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-fla');
            this._renderSrc();
        },
        _destroy : function () {
            this.view.removeClass('com-fla');
            $.pandora.Com.prototype._destroy.call(this);
        },
        _renderSrc : function () {
            var w = this.options.w = this.options.w || this.options.src.width,
                h = this.options.h = this.options.h || this.options.src.height;

            this.view.html([
                $.createSwfHTML({
                    url : this.options.src.url,
                    width : this.options.w || this.options.src.width,
                    height : this.options.h || this.options.src.height,
                    scale : 'exactfit',
                    wmode : 'opaque'
                }),
                '<div class="com-fla-view-mask" style="z-index:' + (this.options.z + 1) + '"></div>'
            ].join(''));

            this.setSize(w, h);
        }
    });
})(jQuery);(function ($) {
    var PLAYER_URL = 'http://img.adbox.sina.com.cn/assets/images/player.swf?flvurl=';
    $.widget('pandora.Video', $.pandora.Com, {
        prop : {
            src : {
                type : 'picture',
                label : '素材',
                mtype : 3
            },
            link : {
                type : 'text',
                label : '跳转链接'
            },
            color : {
                level : 'base'
            },
            font : {
                level : 'base'
            },
            bgcolor : {
                level : 'base'
            },
            pic : {
                type : 'picture',
                label : '定帧图',
                mtype : 1,
                tips : '*建议使用400x300尺寸的图片'
            },
            autoplay : {
                type : 'select',
                label : '自动播放',
                datasource : [
                    {name : '否', value : 0},
                    {name : '是', value : 1}
                ],
                value : 0
            }
        },
        options : {
            w : 0,
            h : 0,
            src : {
                url : 'http://img.adbox.sina.com.cn/vod/251.flv',
                width : 300,
                height : 250
            }
        },
        setSize : function (w, h) {
            $.pandora.Com.prototype.setSize.call(this, w, h);
            $('embed', this.view).attr({
                width : w,
                height : h
            });
            $('.com-video-view-mask', this.view).css({
                width : w,
                height : h
            });
        },
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-video');
            this._renderSrc();
        },
        _renderSrc : function () {
            var w = this.options.w = this.options.w || this.options.src.width,
                h = this.options.h = this.options.h || this.options.src.height;

            this.view.html(
                [
                    $.createSwfHTML({
                        url : PLAYER_URL + this.options.src.url,
                        width : this.options.w || this.options.src.width,
                        height : this.options.h || this.options.src.height,
                        scale : 'exactfit',
                        wmode : 'opaque'
                    }),
                    '<div class="com-video-view-mask" style="z-index:' + (this.options.z + 1) + '"></div>'
                ].join('')
            );
            this.setSize(w, h);
        }
    });

    $.pandora.Video.PLAYER_URL = PLAYER_URL;
})(jQuery);(function ($) {
    var uid = 0;
    $.widget('pandora.Inputcom', $.pandora.Com, {
        prop : {
            name : {
                type : 'string',
                label : '字段名'
            }
        },
        options : {
        },
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);
            this.options.name = this.options.name || this._genName();
            this.element.addClass('com-inputcom');
        },
        _destroy : function () {
            this.element.removeClass('com-inputcom');
            $.pandora.Com.prototype._destroy.call(this);
        },
        _genName : function () {
            return this.widgetName + (uid++);
        }
    });
})(jQuery);(function ($) {
    var uid = 0;
    $.widget('pandora.Input', $.pandora.Inputcom, {
        prop : {
            type : {
                type : 'select',
                datasource : [
                    {name : '普通文本', value : 'text'},
                    {name : '密码', value : 'password'}
                ],
                label : '类型'
            },
            label : {
                type : 'string',
                label : '标签'
            },
            minlength : {
                type : 'number',
                label : '最小长度'
            },
            maxlength : {
                type : 'number',
                label : '最大长度'
            },
            require : {
                type : 'select',
                datasource : [
                    {name : '否', value : 0},
                    {name : '是', value : 1}
                ],
                label : '必填'
            },
            rule : {
                type : 'select',
                datasource : [
                    {name : '无', value : 'none'},
                    {name : '整数', value : 'intege'},
                    {name : '正整数', value : 'intege1'},
                    {name : '负整数', value : 'intege2'},
                    {name : '邮箱', value : 'email'},
                    {name : '中文', value : 'chinese'},
                    {name : '邮编', value : 'zipcode'},
                    {name : '移动电话', value : 'mobile'},
                    {name : '自定义', value : 'other'}
                ],
                width : 100,
                label : '验证规则'
            },
            pattern : {
                //type : 'string',
                label : '验证正则'
            },
            placeholder : {
                type : 'string',
                label : '默认文字'
            }
        },
        options : {
            w : 120,
            h : 20,
            label : '标签'
        },
        _create : function () {
            var me = this,
                options = this.options;
            $.pandora.Inputcom.prototype._create.call(this, options);
            this.view.addClass('com-input');
            this._renderPlaceholder();
        },
        _renderPlaceholder : function () {
            var txt = this.options.placeholder || '';
            this.view.html(this.options.type === 'password' ? txt.replace(/./g, '\u2022') : txt);
        },
        _renderType : function () {
            this._renderPlaceholder();
        }
    });
})(jQuery);(function ($) {
    var uid = 0;
    $.widget('pandora.Radio', $.pandora.Inputcom, {
        prop : {
            value : {
                type : 'string',
                label : '值'
            },
            items : {
                type : 'Objarray',
                label : '选项',
                map : {
                    value : {
                        type : 'string',
                        label : '值'
                    },
                    label : {
                        type : 'string',
                        label : '标签'
                    }
                },
                newItemData : function (lastItem) {
                    return {label : '标签' + (++uid), value : '' + uid};
                },
                min : 1,
                max : 20
            }
        },
        options : {
            items : [
                {label : '标签0', value : '0'}
            ]
        },
        _create : function () {
            $.pandora.Inputcom.prototype._create.call(this, this.options);
            this.view.addClass('com-radio');
            this._renderItems();
        },
        _destroy : function () {
            this.view.removeClass('com-radio');
            $.pandora.Inputcom.prototype._destroy.call(this);
        },
        _renderItems : function () {
            var items = this.options.items,
                html = [],
                name = this.options.name;
            $.each(items, function (i, item) {
                html.push('<div class="com-radio-item"><nobr><input type="radio" name="' + name + '" value="' + item.value + '" /><label>' + item.label + '</label></nobr></div>');
            });
            this.view.html(html.join(''));
        }
    });
})(jQuery);(function ($) {
    var uid = 0;
    $.widget('pandora.Checkbox', $.pandora.Inputcom, {
        prop : {
            items : {
                type : 'Objarray',
                label : '选项',
                map : {
                    label : {
                        type : 'string',
                        label : '标签'
                    },
                    value : {
                        type : 'string',
                        label : '值'
                    },
                    checked : {
                        type : 'select',
                        label : '是否选中',
                        datasource : [
                            { name : '否', value : 0},
                            { name : '是', value : 1}
                        ],
                        value : 0,
                        width : 40
                    }
                },
                newItemData : function (lastItem) {
                    return {label : '标签' + (++uid), value : uid};
                },
                min : 1,
                max : 20
            }
        },
        options : {
            items : [
                { label : '标签0', value : 0}
            ]
        },
        _create : function () {
            $.pandora.Inputcom.prototype._create.call(this, this.options);
            this.view.addClass('com-checkbox');

            this._renderItems();
        },
        _destroy : function () {
            this.view.removeClass('com-checkbox');
            $.pandora.Inputcom.prototype._destroy.call(this);
        },
        _renderItems : function (){
            var items = this.options.items,
                html = [],
                name = this.options.name;
            $.each(items, function (i, item) {
                html.push('<div class="com-checkbox-item"><input type="checkbox"' + (parseInt(item.checked, 10) ? ' checked="checked"' : '') + ' name="' + name + '" value="' + item.value+ '" /><label>' + item.label + '</label></div>');
            });
            this.view.html(html.join(''));
        }
    });
})(jQuery);(function ($) {
    var uid = 0;
    $.widget('pandora.Select', $.pandora.Inputcom, {
        prop : {
            value : {
                type : 'string',
                label : '值'
            },
            items : {
                type : 'Objarray',
                label : '选项',
                map : {
                    label : {
                        type : 'string',
                        label : '文本'
                    },
                    value : {
                        type : 'string',
                        label : '值'
                    }
                },
                min : 1
            }
        },
        options : {
            items : [
                {label : '选项', value : 0}
            ],
            value : 0
        },
        _create : function () {
            var me = this,
                options = this.options;
            $.pandora.Inputcom.prototype._create.call(this, options);
            this.view.addClass('com-select');
            this._renderItems();
            this._renderW();
        },
        _renderItems : function () {
            var html = [],
                items = this.options.items;
            $.each(items, function (i, item) {
                html.push('<option value="' + item.value + '">' + item.label + '</option>');
            });
            this.view.html('<select style="width:' + this.options.w + 'px" name="' + this.options.name + '" value="' + this.options.value + '">' + html.join('') + '</select>');
        },
        setSize : function (w, h) {
            $.pandora.Inputcom.prototype.setSize.call(this, w, h);
            this.view.children().first().width(w);
        },
        _renderW : function () {
            $.pandora.Inputcom.prototype._renderW.call(this);
            this.setSize(this.options.w, this.options.h);
        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.Region', $.pandora.Com, {
        prop : {
            provname : {
                type : 'string',
                label : '省字段名'
            },
            cityname : {
                type : 'string',
                label : '市字段名'
            },
            provW : {
                type : 'number',
                label : '省选项宽'
            },
            cityW : {
                type : 'number',
                label : '市选项宽'
            }
        },
        options : {
            w : 220,
            h : 40,
            provname : 'pname',
            cityname : 'cname',
            provW : 100,
            cityW : 100
        },
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);

            this.view.addClass('com-region');
            this.view.html('<select style="margin-right:5px;"><option value="-1">省</option></select><select><option>市</option></select>');
            this._renderProvW();
            this._renderCityW();
        },
        _destroy : function () {
            this.view.removeClass('com-region');
            $.pandora.Com.prototype._destroy.call(this);
        },
        _renderProvW : function () {
            this.view.children().first().width(this.options.provW);
        },
        _renderCityW : function () {
            this.view.children().last().width(this.options.cityW);
        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.Imgslider', $.pandora.Com, {
        prop : {
            thumbX : {
                label : '小图区域x'
            },
            thumbY : {
                label : '小图区域y'
            },
            thumbWidth : {
                //type : 'number',
                label : '小图区域宽'
            },
            thumbHeight : {
                //type : 'number',
                label : '小图区域高'
            },
            thumbItemWidth : {
                type : 'number',
                label : '小图宽'
            },
            thumbItemHeight : {
                type : 'number',
                label : '小图高'
            },
            mainWidth : {
                //type : 'number',
                label : '大图宽度'
            },
            mainHeight : {
                //type : 'number',
                label : '大图高度'
            },
            dir : {
                type : 'select',
                datasource : [
                    {name : '横向', value : 0},
                    {name : '纵向', value : 1}
                ],
                label : '轮播方向',
                width : 60
            },
            delay : {
                type : 'select',
                datasource : [
                    { name : '1s', value : 1},
                    { name : '2s', value : 2},
                    { name : '3s', value : 3}
                ],
                label : '切换频率',
                width : 60
            },
            items : {
                type : 'objarray',
                map : {
                    'thumb' : {
                        type : 'picture',
                        label : '小图'
                    },
                    'main' : {
                        type : 'picture',
                        label : '大图'
                    },
                    'url' : {
                        type : 'text',
                        label : '链接'
                    }
                },
                label : '轮播素材',
                min : 5,
                max : 10,
                itemHeader : '素材组'
            },
            color : {
                level : 'base'
            },
            font : {
                level : 'base'
            },
            bgcolor : {
                level : 'base'
            },
            overflow : {
                label : '隐藏-是否溢出'
            }
        },
        options : {
            delay : 3,
            size : '300x200',
            w : 300,
            h : 250,
            thumbItemWidth : 40,
            thumbItemHeight : 40,
            thumbWidth : 230,
            thumbHeight : 45,
            thumbX : 36,
            thumbY : 199,
            mainWidth : 300,
            mainHeight : 250,
            dir : 0,
            overflow : 0
        },
        _create : function () {
            var options = this.options,
                me = this;

            this.prop.items.onitemselect = $.proxy(this._selectItem, this);

            options.items = options.items || [
                {
                    'thumb' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1081.jpg',
                        width : 300,
                        height : 350
                    },
                    'main' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1076.jpg',
                        width : 300,
                        height : 350
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'thumb' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1082.jpg',
                        width : 300,
                        height : 350
                    },
                    'main' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1077.jpg',
                        width : 300,
                        height : 350
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'thumb' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1083.jpg',
                        width : 300,
                        height : 350
                    },
                    'main' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1078.jpg',
                        width : 300,
                        height : 350
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'thumb' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1084.jpg',
                        width : 300,
                        height : 350
                    },
                    'main' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1079.jpg',
                        width : 300,
                        height : 350
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'thumb' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1085.jpg',
                        width : 300,
                        height : 350
                    },
                    'main' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1080.jpg',
                        width : 300,
                        height : 350
                    },
                    'url' : 'http://sina.com'
                }
            ];

            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-imgslider');
            this.view
                .append(
                    this.main = $('<div class="com-imgslider-main">')
                        .css({width : options.mainWidth, height : options.mainHeight})
                        .append(this.maincnt = $('<div class="com-imgslider-main-cnt">'))
                        .resizable({
                            resize : this._resizingMainHandler()
                        })
                )
                .append(
                    this.thumb = $('<div class="com-imgslider-thumb" style="position:absolute;">')
                        .append(this.larrow = $('<div class="com-imgslider-arrow com-imgslider-larrow">'))
                        .append(this.rarrow = $('<div class="com-imgslider-arrow com-imgslider-rarrow">'))
                        .append(this.tarrow = $('<div class="com-imgslider-arrow com-imgslider-tarrow">'))
                        .append(this.barrow = $('<div class="com-imgslider-arrow com-imgslider-barrow">'))
                        .append($('<div class="com-imgslider-thumb-inner">').append(this.thumbcnt = $('<div style="position:relative;">')))
                        .draggable({
                            containment : this.view,
                            drag : this._dragingThumbHandler()
                        })
                        .resizable({
                            handles : 'e, s',
                            resize : this._resizingThumbHandler()
                        })
                );
            this._renderItems();
            this._renderThumbSize();
            this._renderThumbPos();
            this._renderDir();
            this._renderArrowPos();
            this._on(this.thumb, {
                'click .com-imgslider-thumb-item' : function (e) {
                    this._selectItem(parseInt($(e.target).attr('data-idx'), 10));
                }
            });
            this.larrow.click(function (e) {
                var cur = me.thumbcnt.css('left'),
                    len = (me.options.items && me.options.items.length) || 0,
                    max =  me.options.thumbWidth - (me.options.thumbItemWidth + 6) * (len - 1);
                cur = cur === "auto" ? 0 : parseInt(cur, 10);
                if (cur > max) {
                    me.thumbcnt.css('left', cur - me.options.thumbItemWidth - 6);
                }
            });
            this.rarrow.click(function (e) {
                var cur = me.thumbcnt.css('left'),
                    len = (me.options.items && me.options.items.length) || 0;
                cur = cur === "auto" ? 0 : parseInt(cur, 10);
                if (cur < 0) {
                    me.thumbcnt.css('left', cur + me.options.thumbItemWidth + 6);
                }
            });
            this.tarrow.click(function (e) {
                var cur = me.thumbcnt.css('top'),
                    len = (me.options.items && me.options.items.length) || 0,
                    max =  me.options.thumbHeight - (me.options.thumbItemHeight + 6) * (len - 1);
                cur = cur === "auto" ? 0 : parseInt(cur, 10);
                if (cur > max) {
                    me.thumbcnt.css('top', cur - me.options.thumbItemHeight - 6);
                }
            });
            this.barrow.click(function (e) {
                var cur = me.thumbcnt.css('top'),
                    len = (me.options.items && me.options.items.length) || 0;
                cur = cur === "auto" ? 0 : parseInt(cur, 10);
                if (cur < 0) {
                    me.thumbcnt.css('top', cur + me.options.thumbItemHeight + 6);
                }
            });
        },
        _destroy : function () {
            this.barrow.unbind().remove();
            this.tarrow.unbind().remove();
            this.larrow.unbind().remove();
            this.rarrow.unbind().remove();
        },
        _renderArrowPos : function () {
            var top = this.options.thumbHeight / 2 - 8,
                left = this.options.thumbWidth / 2 - 8;
            this.larrow.css('top', top);
            this.rarrow.css('top', top);
            this.tarrow.css('left', left);
            this.barrow.css('left', left);
        },
        _checkOverflow : function () {
            var dir = parseInt(this.options.dir, 10) || 0,
                len = (this.options.items && this.options.items.length) || 0;

            this.thumb.removeClass('com-imgslider-thumb-overflow'); 
            this.options.overflow = 0;
            if (!dir) {
                //横向
                if ((this.options.thumbItemWidth + 6) * len > this.options.thumbWidth) {
                    this.thumb.addClass('com-imgslider-thumb-overflow');
                    this.options.overflow = 1;
                }
            } else {
                if ((this.options.thumbItemHeight + 6) * len > this.options.thumbHeight) {
                    this.thumb.addClass('com-imgslider-thumb-overflow');
                    this.options.overflow = 1;
                }
            }

            this.thumbcnt.css({
                left : 0,
                top : 0,
                width : !dir ? (this.options.thumbItemWidth + 6) * len : this.options.thumbItemWidth + 6,
                height : !dir ? this.options.thumbItemHeight + 6 : (this.options.thumbItemHeight + 6) * len
            });
        },
        _dragingThumbHandler : function () {
            var me = this;
            return function (e, ui) {
                me._trigger('change', e, {
                    'thumbX' : me.options.thumbX = ui.position.left,
                    'thumbY' : me.options.thumbY = ui.position.top
                });
            }
        },
        _resizingThumbHandler : function () {
            var me = this;
            return function (e, ui) {
                me._renderThumbSize();
                me._trigger('change', e, {
                    'thumbWidth' : me.options.thumbWidth = ui.size.width,
                    'thumbHeight' : me.options.thumbHeight = ui.size.height
                });
            };
        },
        _resizingMainHandler : function () {
            var me = this;
            return function (e, ui) {
                me._trigger('change', e, {
                    'mainWidth' : me.options.mainWidth = ui.size.width,
                    'mainHeight' : me.options.mainHeight = ui.size.height
                });  
                me._renderMainSize();
            };
        },
        _renderThumbItemSize : function () {
            var w = this.options.thumbItemWidth,
                h = this.options.thumbItemHeight;
            $('.com-imgslider-thumb-item', this.thumb).each(function (i, item) {
                $(item).css({width : w, height : h});
            });
        },
        _renderThumbItemWidth : function () {
            this._renderThumbItemSize();
            this._renderDir();
        },
        _renderThumbItemHeight : function () {
            this._renderThumbItemSize();
            this._renderDir();
        },
        _renderThumbSize : function () {
            this.thumb.css({
                width : this.options.thumbWidth,
                height : this.options.thumbHeight
            });
            this._checkOverflow();
        },
        _renderThumbWidth : function () {
            this._renderThumbSize();
        },
        _renderThumbHeight : function () {
            this._renderThumbSize();
        },
        _renderThumbPos : function () {
            this.thumb.css({left : this.options.thumbX, top : this.options.thumbY});
        },
        _renderThumbX : function () {
            this._renderThumbPos();
        },
        _renderThumbY : function () {
            this._renderThumbPos();
        },
        _renderMainSize : function () {
            var w = this.options.mainWidth,
                h = this.options.mainHeight;
            $('.com-imgslider-main-item', this.main).each(function (i, item) {
                $(item).css({width : w, height : h});
            });
            this.main.css({width : w, height : h});
        },
        _renderMainHeight : function () {
            this._renderMainSize();
        },
        _renderMainWidth : function () {
            this._renderMainSize();
        },
        _renderItems : function () {
            var items = this.options.items,
                thumbItems = [],
                mainItems = [],
                th = this.options.thumbItemHeight,
                tw = this.options.thumbItemWidth,
                mw = this.options.mainWidth,
                mh = this.options.mainHeight;
            this.main.children().first().css({
                top : 0
            });
            items && $.each(items, function (i, item) {
                mainItems.push('<img class="com-imgslider-main-item" style="width:' + mw + 'px;height:' + mh + 'px" src="' + item.main.url + '" alt="正在加载..."/>');
                thumbItems.push('<img data-idx="' + i + '" class="com-imgslider-thumb-item" style="width:' + tw + 'px;height:' + th + 'px" src="' + item.thumb.url + '"/>');
            });
            this.maincnt.html(mainItems.join(''));
            this.thumbcnt.html(thumbItems.join(''));
            this._checkOverflow();
        },
        _renderDir : function () {
            var dir = parseInt(this.options.dir, 10) || 0,
                tw = this.options.thumbWidth,
                th = this.options.thumbHeight,
                max = Math.max(tw, th);

            this.thumb.removeClass('com-imgslider-thumb-v com-imgslider-thumb-h');
            this.options.thumbHeight = dir ? max : this.options.thumbItemHeight + 6;
            this.options.thumbWidth = dir ? this.options.thumbItemWidth + 6 : max;
            this.thumb.addClass('com-imgslider-thumb-' + ['h', 'v'][dir]);
            this._renderThumbSize();
            this._renderArrowPos();
        },
        _selectItem : function (idx) {
            $('.com-imgslider-thumb-item', this.thumb).each(function(i, item) {
                var $item = $(item);
                parseInt($item.attr('data-idx'), 10) === idx ? $item.addClass('com-imgslider-thumb-item-selected') : $item.removeClass('com-imgslider-thumb-item-selected');
            });
            this.main.children().first().css({
                top : - this.options.mainHeight * idx
            });
        }
    });
})(jQuery);(function ($) {
    var BASE_CLASS = 'com-tabslider',
        TAB_CLASS = BASE_CLASS + '-tab',
        TAB_ITEM_CLASS = TAB_CLASS + '-item',
        MAIN_CLASS = BASE_CLASS + '-main',
        MAIN_ITEM_CLASS = MAIN_CLASS + '-item',
        DEFAULT_TAB_ITEM_WIDTH = 60,
        DEFAULT_TAB_ITEM_HEIGHT = 30;
    $.widget('pandora.Tabslider', $.pandora.Com, {
        prop : {
            layout : {
                type : 'select',
                datasource : [
                    //首位表示 ： 0-垂直排列 1-水平排列  其他位1标识tab, 0标识main
                    { name : '一栏居上', value : '010'},
                    { name : '一栏居下', value : '001'},
                    { name : '一栏居左', value : '110'},
                    { name : '一栏居右', value : '101'},
                    { name : '两栏居上', value : '0110'},
                    { name : '两栏居下', value : '0011'},
                    { name : '两栏居左', value : '1110'},
                    { name : '两栏居右', value : '1011'},
                    { name : '两栏上下', value : '0101'},
                    { name : '两栏左右', value : '1101'}
                ],
                format : function (text, item) {
                    ////debug(opt.val());
                    return '<i class="icon icon-t-layout-' + item.value + '"></i>' + text;
                },
                menuWidth : 100,
                label : '布局',
                width : 100
            },
            delay : {
                type : 'select',
                datasource : [
                    { name : '1s', value : 1},
                    { name : '2s', value : 2},
                    { name : '3s', value : 3}
                ],
                label : '切换频率',
                width : 60
            },
            items : {
                type : 'objarray',
                map : {
                    'text' : {
                        type : 'string',
                        label : '页签文字'
                    },
                    'pic' : {
                        type : 'picture',
                        label : '大图'
                    },
                    'url' : {
                        type : 'text',
                        label : '链接'
                    }
                },
                label : '轮播素材',
                min : 4,
                max : 12,
                itemHeader : '素材组'
            },
            mainWidth : {
                label : '主区域宽度'
            },
            mainHeight : {
                label : '主区域高度'
            }
        },
        options : {
            w : 300,
            h : 100,
            delay : 3,
            layout : '1101'
        },
        _create : function () {
            var options = this.options;

            this.prop.items.onitemselect = $.proxy(this._selectItem, this);

            options.items = options.items || [
                {
                    'text' : '小图一',
                    'pic' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1076.jpg',
                        width : 300,
                        height : 250
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'text' : '小图二',
                    'pic' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1077.jpg',
                        width : 300,
                        height : 250
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'text' : '小图三',
                    'pic' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1078.jpg',
                        width : 300,
                        height : 250
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'text' : '小图四',
                    'pic' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1079.jpg',
                        width : 300,
                        height : 250
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'text' : '小图五',
                    'pic' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1080.jpg',
                        width : 300,
                        height : 250
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'text' : '小图六',
                    'pic' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1080.jpg',
                        width : 300,
                        height : 250
                    },
                    'url' : 'http://sina.com'
                }
            ];
            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-tabslider');
            this.view.append($('<ul class="com-tabslider-main"></ul>'));
            this._renderLayout();

            this._on(this.element, {
                'click .com-tabslider-tab-item' : function (e) {
                    this._selectItem(parseInt($(e.target).attr('data-idx'), 10));
                }
            });
        },
        _renderLayout : function () {
            var pos = ['v', 'h'][parseInt(this.options.layout.charAt(0), 10)],
                layout = this.options.layout.substring(1).split(''),
                html = [];

            ////debug(pos, layout);

            this.view.removeClass(BASE_CLASS + '-layout-v');
            this.view.removeClass(BASE_CLASS + '-layout-h');

            $.each(layout, function (i, item) {
                if (item === "0") {
                    html.push('<div class="' + MAIN_CLASS + '"><ul class="' + MAIN_CLASS + '-inner"></div>');
                } else {
                    html.push('<ul class="' + TAB_CLASS + '"></ul>');
                }
            });

            this.view.addClass(BASE_CLASS + '-layout-' + pos).html(html.join(''));

            this._renderItems();

        },
        _resize : function (w, h) {
            var vDir = this.options.layout.charAt(0) === "0",
                cols = this.options.layout.substring(1).replace('0', '').length,
                me = this;

            $('.' + MAIN_ITEM_CLASS + ', .' + MAIN_ITEM_CLASS + ' img, .' + MAIN_CLASS, this.view).each(function (i, item) {
                var width = (vDir ? w : (w - (DEFAULT_TAB_ITEM_WIDTH) * cols)),
                    height = (vDir ? (h - (DEFAULT_TAB_ITEM_HEIGHT) * cols) : h);

                $(item).css({
                    width : me.options.mainWidth = width,
                    height : me.options.mainHeight = height
                });
            });

            $('.' + TAB_CLASS, this.view).each(function (i, tab) {
                var len = parseInt($(tab).attr('data-tablen')),
                    width = vDir ? (w / len - 1) : DEFAULT_TAB_ITEM_WIDTH,
                    height = vDir ? DEFAULT_TAB_ITEM_HEIGHT : (h / len - 1);
                $('.' + TAB_ITEM_CLASS, $(tab)).each(function (j, item) {
                    $(item).css({
                        'width' : width,
                        'height' : height,
                        'lineHeight' : height + 'px'
                    });
                });
            });
            this.view.find('.' + MAIN_CLASS + '-inner').css('top', 0);
        },
        setSize : function (w, h) {
            $.pandora.Com.prototype.setSize.call(this, w, h);
            this._resize(w, h);
        },
        _renderItems : function () {
            var me = this,
                items = this.options.items.slice(0),
                tabs = [],
                main = [],
                len = this.options.layout.substring(1).replace('0', '').length,
                num = Math.ceil(items.length / len),
                parts = [],
                idx = 0;

            while(items.length > 0) {
                parts.push(items.splice(0, num));
            }

            $.each(parts, function (i, part) {
                var html = [];
                $.each(part, function (j, item) {
                    main.push('<li class="com-tabslider-main-item com-tabslider-main-item-' + idx + '"><img src="' + item.pic.url + '"/></li>');
                    html.push('<li class="com-tabslider-tab-item com-tabslider-tab-item-' + idx + '" data-idx="' + (idx++) + '">' + item.text + '</li>');
                });
                tabs.push(html.join(''));
            });

            $('.' + TAB_CLASS, this.view).each(function (i, item) {
                $(item).attr('data-tablen', parts[i].length).html(tabs[i]);
            });
            $('.' + MAIN_CLASS + '-inner', this.view).html(main.join(''));
            this._resize(this.options.w, this.options.h);
        },
        _selectItem : function (idx) {
            $('.com-tabslider-tab-item', this.element).each(function (i, item) {
                var $item = $(item);
                parseInt($item.attr('data-idx'), 10) === idx ?  $item.addClass('com-tabslider-tab-item-active') : $item.removeClass('com-tabslider-tab-item-active');
            });
            this.view.find('.com-tabslider-main-inner').css({
                top : - this.options.mainHeight * idx
            });
        }
    });
})(jQuery);(function ($) {
    var WB_ROOT = 'http://weibo.com',
        defaultUser = {
            "id":2738910765,
            "idstr":"2738910765",
            "screen_name":"新浪功能广告平台",
            "name":"新浪功能广告平台",
            "province":"11",
            "city":"8",
            "location":"北京 海淀区",
            "description":"暂无",
            "url":"",
            "profile_image_url":"http://tp2.sinaimg.cn/2738910765/50/5632534588/1",
            "profile_url":"u/2738910765",
            "domain":"",
            "weihao":"",
            "gender":"m",
            "followers_count":33,
            "friends_count":42,
            "statuses_count":16,
            "favourites_count":0,
            "created_at":"Fri Apr 27 14:22:41 +0800 2012",
            "following":true,
            "allow_all_act_msg":false,
            "geo_enabled":true,
            "verified":true,
            "verified_type":2,
            "remark":"",
            "status":{
                "created_at":"Tue May 22 17:11:21 +0800 2012",
                "id":3448533338240896,
                "mid":"3448533338240896",
                "idstr":"3448533338240896",
                "text":"#互动营销#“新浪正在推动传统门户展示广告巨变，让展示广告逐步趋向功能化，成为人与广告精准互动、人与企业品牌精准互动的重要接触界面。#功能广告平台#实现了广告投放的“标准”、“简单”，并最大程度体现了“广告社交化”， 实现了前置营销核心，缩短营销途径，提高了广告到达率。",
                "source":"<a href=\"http://e.weibo.com\" rel=\"nofollow\">专业版微博</a>",
                "favorited":false,
                "truncated":false,
                "in_reply_to_status_id":"",
                "in_reply_to_user_id":"",
                "in_reply_to_screen_name":"",
                "geo":null,
                "reposts_count":0,
                "comments_count":0,
                "attitudes_count":0,
                "mlevel":0,
                "visible":{
                    "type":0,
                    "list_id":0
                }
            },
            "allow_all_comment":true,
            "avatar_large":"http://tp2.sinaimg.cn/2738910765/180/5632534588/1",
            "verified_reason":"新浪功能广告平台官方微博",
            "follow_me":true,
            "online_status":0,
            "bi_followers_count":7,
            "lang":"zh-cn"
        };

    $.widget('pandora.Wbcom', $.pandora.Com, {
        prop : {
            nick : {
                type : 'string',
                label : '微博昵称'
            },
            wid : {
                label : '微博id'
            },
            verified : {
                label : '用户认证'
            },
            verified_type : {
                label : '认证类型'
            },
            pic : {
                label : '头像'
            },
            domain : {
                label : '用户首页地址'
            }
        },
        options : {
            wid : '2738910765',
            nick : '新浪功能广告平台',
            resizable : false
        },
        _create : function () {
            var me = this,
                options = this.options;

            this._initInfo(defaultUser);

            $.pandora.Com.prototype._create.call(this, this.options);
            this.element.addClass('com-wbcom');
        },
        _setValue : function (k, v) {
            var me = this;
            if (k === 'nick') {
                this._getInfoByNick(v, function (info) {
                    $.pandora.Com.prototype._setValue.call(me, k, v);
                });
            } else {
                $.pandora.Com.prototype._setValue.call(me, k, v);
            }
        },
        _initInfo : function (info) {
            this.options.nick = info.screen_name;
            this.options.wid = info.id;
            this.options.verified = info.verified;
            this.options.verified_type = info.verified_type;
            this.options.domain = info.domain || info.profile_url;
        },
        _getInfoByNick : function (nick, callback, fail) {
            var me = this;
            $.pandora.Wbcom.getInfoByNick(nick, function (data) {
                $.pandora.Wbcom.user = defaultUser = data;
                me._initInfo(data);
                callback && callback(data);
            }, function (data) {
                me._initInfo(data);
                fail && fail(data);
            });
        }
    });

    $.pandora.Wbcom.getInfoByNick  = function (nick, callback, fail) {
        //获取信息
        $.ajax("/wapi/getuser", {
            cache : false,
            data : {
                username : nick
            },
            dataType : 'script',
            success : function () {
                if (getuser && !getuser.data.error) {
                    callback && callback(getuser.data);
                } else {
                    pandora.tipBox.show((getuser && getuser.data.error) || '获取微博信息失败，请重试。', 2);
                    fail && fail(defaultUser);
                }
            }
        });
    };

    $.pandora.Wbcom.getInfoByWid = function (wid, callback, fail) {
        //获取信息
        $.ajax("/wapi/getinfo", {
            cache : false,
            data : {
                wid : wid
            },
            dataType : 'script',
            success : function () {
                if (getinfo && !getinfo.data.error) {
                    callback && callback(getinfo.data);
                } else {
                    pandora.tipBox.show((getinfo && getinfo.data.error) || '获取微博信息失败，请重试。', 2);
                    fail && fail(defaultUser);
                }
            }
        });
    };

    $.pandora.Wbcom.user = defaultUser;

    $.pandora.Wbcom.genUserUrl = function (info) {
        return WB_ROOT + '/' + (info.domain || info.profile_url);
    };
    $.pandora.Wbcom.genAvatarHTML = function (info, w, h) {
        return '<span class="com-wbnick-url" title="' + $.pandora.Wbcom.genUserUrl(info) + '"><img class="com-wbavatar-img" src="' + (info.avatar_large || info.profile_image_url) + '" alt="' + info.screen_name + '" ' + ((w && h) ? 'style="width:' + w + 'px;height:' + h + 'px;"' : '')+ '/></span>';
    };
    $.pandora.Wbcom.genVerifiedHTML = function (info) {
        var v = info.verified ? ['approve_yellow', 'approve_blue', 'approve_blue', 'approve_blue', 'approve_blue', 'approve_blue', 'approve_blue', 'approve_blue'][info.verified_type] : ''; 
        return v ? '<img src="' + '/assets/images/blank.gif" alt="新浪个人认证" class="com-wbnick-v ' + v + '" />' : '';  
    };
    $.pandora.Wbcom.genNickHTML = function (info) {
        return [
            '<span class="com-wbnick-txt" title="' + $.pandora.Wbcom.genUserUrl(info) + '">' + info.screen_name +'</span>',
            $.pandora.Wbcom.genVerifiedHTML(info)
        ].join('');
    };
    $.pandora.Wbcom.genRelationHTML = function (template, info, chain) {
        return '';
    };

    $.pandora.Wbcom.getChainById = function (id, callback, fail) {
        $.ajax('/wapi/getchain', {
            cache : false,
            data : {
                wid : id
            },
            dataType : 'script',
            success : function () {
                if (getchain && !getchain.data.error) {
                    callback && callback(getchain.data);
                } else {
                    pandora.tipBox.show((getchain && getchain.data.error) || '获取微博信息失败，请重试。', 2);
                    fail && fail();
                }
            }
        });
    };
    $.pandora.Wbcom.changDefaultUser = function (data) {
        $.pandora.Wbcom.user = defaultUser = data;
    };
})(jQuery);(function ($) {
    $.widget('pandora.Wbfocus', $.pandora.Wbcom, {
        prop : {
            skin : {
                type : 'radio',
                datasource : ['default', 'v3'],
                label : '皮肤',
                format : function (i, skin) {
                    return '<div class="wbfocus-skin-block"><div style="padding:4px 10px" class="com-wbfocus skin-wbfocus Wbfocus-skin-' + skin + '-h"><span class="add-icon">+</span>关注</div></div>'; 
                }
            }
        },
        options : {
            w : 46,
            h : 20,
            skin : 'default',
            resizable : true
        },
        setSize : function (w, h) {
            $.pandora.Wbcom.prototype.setSize.call(this, w, h);
            $('table', this.view).css({
                width : w - 2,
                height : h - 2
            });
        },
        _create : function () {
            $.pandora.Wbcom.prototype._create.call(this, this.options);
            this.view.addClass('com-wbfocus');
            this._renderNick();
        },
        _renderNick : function () {
            var info = $.pandora.Wbcom.user;
            this.view.attr('title', '点击关注' + info.screen_name).html('<table cellpadding="0" cellspacing="0" style="width:' + this.options.w + 'px;height:' + this.options.h + 'px;"><tr><td><span class="add-icon">+</span> 关注</td></tr></table>');
        },
        _renderFont : function () {
            this.view.css(this.options.font);
            $('.add-icon', this.view).css('font-size', parseInt(this.options.font['font-size'], 10) + 4 || 16);
        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.Wbavatar', $.pandora.Wbcom, {
        prop : {
            w : {
                disabled : true
            },
            h : {
                disabled : true
            },
            size : {
                type : 'select',
                label : '头像尺寸',
                datasource : [
                    { name : "30x30", value : "30x30"},
                    { name : "50x50", value : "50x50"},
                    { name : "150x150", value : "150x150"}
                ],
                width : 80
            },
            pic : {
                label : '头像路径'
            },
            color : {
                level : 'base'
            },
            font : {
                level : 'base'
            },
            bgcolor : {
                level : 'base'
            }
        },
        options : {
            w: 40,
            h : 40,
            skin : 'default',
            size : '30x30'
        },
        _create : function () {
            $.pandora.Wbcom.prototype._create.call(this, this.options);
            this.view.addClass('com-wbavatar');
            this._renderSize();
            this._renderNick();
        },
        _renderNick : function () {
            var info = $.pandora.Wbcom.user;
            this.options.pic = (this.options.w > 50 || this.options.h > 50) ? info.avatar_large : info.profile_image_url;
            this.view.html($.pandora.Wbcom.genAvatarHTML(info, this.options.w, this.options.h));
        },
        _renderSize : function () {
            var size = this.options.size.split('x');
            this.options.w = parseInt(size[0], 10);
            this.options.h = parseInt(size[1], 10);
            this._renderNick();
            $.pandora.Wbcom.prototype.setSize.call(this, this.options.w, this.options.h);
        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.Wbnick', $.pandora.Wbcom, {
        options : {
            w : 120,
            h : 20,
            resizable : true
        },
        _create : function () {
            $.pandora.Wbcom.prototype._create.call(this, this.options);
            this.view.addClass('com-wbnick');
            this._renderNick();
        },
        _renderNick : function () {
            var info = $.pandora.Wbcom.user;
            this.view.html($.pandora.Wbcom.genNickHTML(info));
        },
        _renderFont : function () {
            this.view.css(this.options.font);
        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.Wbrelation', $.pandora.Wbcom, {
        prop : {
            showAvatar : {
                type : 'select',
                datasource : [
                    {name : '不显示头像', value : 0},
                    {name : '显示头像', value : 1}
                ],
                label : '显示头像'
            },
            max : {
                type : 'number',
                label : '关系数',
                min : 1,
                max : 20
            }
        },
        options : {
            w: 200,
            h : 60,
            showAvatar : 0,
            resizable : true,
            max : 4
        },
        _create : function () {
            var me = this,
                options = this.options;
            $.pandora.Wbcom.prototype._create.call(this, options);
            this.view.addClass('com-wbrelation');
            this._renderNick();
        },
        _renderNick : function () {
            this._renderDes();
        },
        _renderDes : function () {
            var info = $.pandora.Wbcom.user,
                me = this,
                max = this.options.max,
                showAvatar = parseInt(this.options.showAvatar, 10);
            $.pandora.Wbcom.getChainById(info.id, function (chain) {
                var text = (chain.content_type ? '你关注的人中${nick}关注了' : '新浪博友${nick}关注了'),
                    us = chain.users,
                    i = 0,
                    j = 0,
                    u,
                    html = [],
                    plusHTML = [];
                if (us instanceof Array) {
                    if (us.length　> 0) {
                        for (var i = 0; i < max; i++) {
                            if (us[i]) {
                                html.push($.pandora.Wbcom.genNickHTML(us[i]));
                                showAvatar && plusHTML.push($.pandora.Wbcom.genAvatarHTML(us[i], 30, 30));
                            }
                        }
                    } else {
                        html.push('还没人');
                    }
                    me.view.html([
                        text.replace(/\$\{nick\}/g, html.join('，')),
                        $.pandora.Wbcom.genNickHTML(info),
                        '<div class="com-wbrelation-avatar">' + plusHTML.join('') + '</div>'
                    ].join(''));
                }
            });
        },
        _renderFont : function () {
            this.view.css(this.options.font);
        },
        _renderShowAvatar : function () {
            this._renderDes();
        },
        _renderMax : function () {
            this._renderDes();
        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.Wbshare', $.pandora.Wbcom, {
        prop : {
            text : {
                type : 'text',
                label : '分享内容'
            },
            pic : {
                type : 'picture',
                label : '分享图片'
            }
        },
        options : {
            w : 40,
            h : 20,
            text : '',
            pic : '',
            resizable : true
        },
        _create : function () {
            $.pandora.Wbcom.prototype._create.call(this, this.options);
            this.view.addClass('com-wbshare').html('分享');
        },
        _renderFont : function () {
            this.view.css(this.options.font);
        },
        _renderColor : function () {
            this.view.css('color', this.options.color);
        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.Wbrepos', $.pandora.Wbcom, {
        prop : {
            post : {
                type : 'wbpost',
                label : '文章url'
            }
        },
        options : {
            w : 40,
            h : 20,
            post : {
                id : ''
            },
            resizable : true
        },
        _create : function () {
            $.pandora.Wbcom.prototype._create.call(this, this.options);
            this.view.addClass('com-wbrepos').html('转发');
        },
        _renderFont : function () {
            this.view.css(this.options.font);
        },
        _renderPost : function () {
            this.options.articalId = this.options.post.id;
        },
        _renderColor : function () {
            this.view.css('color', this.options.color);
        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.SSOcom', $.pandora.Com, {
        _create : function () {}
    });
    $.pandora.SSOcom.checkLogin = function (login, nologin) {
        if ('undefined' !== typeof sinaSSOController) {
            sinaSSOController.autoLogin(function(status) {
                if (status == null) {
                    nologin && nologin();
                } else {
                    login && login(status);
                }
            });
        } else {
            nologin();
        }
    };
})(jQuery);(function ($) {
    $.widget('pandora.Usernick', $.pandora.Com, {
        prop : {
            beforelogin : {
                type : 'text',
                label : '登录前'
            },
            afterlogin : {
                type : 'insert',
                label : '登录后'
            }
        },
        options : {
            w : 120,
            h : 20,
            resizable : true,
            beforelogin : '你好，尊敬的用户',
            afterlogin : '${nick}'
        },
        _create : function () {
            var me = this;
            $.pandora.Com.prototype._create.call(this, this.options);
            this.element.addClass('com-usernick');
            this._renderContent();
        },
        _renderContent : function () {
            var me = this;
            $.pandora.SSOcom.checkLogin(function (status) {
                var uid = status.uid;
                $.pandora.Wbcom.getInfoByWid(uid, function (info) {
                    var nick = $.pandora.Wbcom.genNickHTML(info);
                    me.view.html(me.options.afterlogin ? me.options.afterlogin.replace(/\$\{nick\}/g, nick) : nick);
                }, function () {
                    me.view.html(me.options.beforelogin || '你好，尊敬的新浪用户');
                });
            }, function () {
                me.view.html(me.options.beforelogin || '你好，访客');
            });
        },
        _renderFont : function () {
            this.view.css(this.options.font);
        },
        _renderBeforelogin : function () {
            this._renderContent();
        },
        _renderAfterlogin : function () {
            this._renderContent();
        }
    });
})(jQuery);(function ($) {
    var DEFAULT_AVATAR = 'http://adbox.sina.com.cn/maker/assets/img/weibo180x180.jpg';
    $.widget('pandora.Useravatar', $.pandora.Com, {
        prop : {
            size : {
                type : 'select',
                label : '头像尺寸',
                datasource : [
                    { name : "30x30", value : "30x30"},
                    { name : "50x50", value : "50x50"},
                    { name : "150x150", value : "150x150"}
                ]
            },
            pic : {
                label : '头像路径'
            },
            color : {
                level : 'base'
            },
            font : {
                level : 'base'
            },
            bgcolor : {
                level : 'base'
            }
        },
        options : {
            w: 50,
            h : 50,
            skin : 'default',
            size : '50x50',
            resizable : false
        },

        _create : function () {
            var me = this;
            $.pandora.Com.prototype._create.call(this, this.options);
            this.element.addClass('com-useravatar');
            this._renderSize();
        },
        _renderNick : function () {
            var me = this;
            $.pandora.SSOcom.checkLogin(function (status) {
                var uid = status.uid;
                $.pandora.Wbcom.getInfoByWid(uid, function (info) {
                    me.options.pic = (me.options.w > 50 || me.options.h > 50) ? info.avatar_large : info.profile_image_url;
                    me.view.html($.pandora.Wbcom.genAvatarHTML(info, me.options.w, me.options.h));
                }, function () {
                    me.view.html('<img src="' + DEFAULT_AVATAR + '" style="width:' + me.options.w + 'px;height:' + me.options.h + 'px;" />');
                });
            }, function () {
                me.view.html('<img src="' + DEFAULT_AVATAR + '" style="width:' + me.options.w + 'px;height:' + me.options.h + 'px;" />');
            });
        },
        _renderSize : function () {
            var size = this.options.size.split('x');
            this.options.w = parseInt(size[0], 10);
            this.options.h = parseInt(size[1], 10);
            this._renderNick();
            $.pandora.Com.prototype.setSize.call(this, this.options.w, this.options.h);
        }
    });
})(jQuery);/*!
 * 潘多拉广告编辑控件
 * author : acelan(xiaobin8[at]staff.sina.com.cn)
 */
(function ($) {
    var nid = 0, uid = 0;

    $.widget('pandora.BaseEditor', {
        options : {
            value : 0
        },
        _create : function () {
            this.widgetEventPrefix = 'editor';
            this.options.value = this._formatValue(this.options.value);
            this.element.data('widgetName', this.widgetFullName).addClass('editor');
        },
        _destroy : function () {
            this.element
                .removeClass('editor')
                .removeData();
        },
        _getName : function () {
            return this.widgetName + 'Name' + (nid++);
        },
        _getUID : function () {
            return this.widgetName + 'UID' + (uid++);
        },
        _formatValue : function (v) {
            return v;
        },
        setValue : function (v) {
            if (!this.options.disabled) {
                var v = this._formatValue(v);
                this._setValue && this._setValue(v);
            }
        },
        getValue : function () {
            return this._getValue();
        }
    });
})(jQuery);/**
 * 数字输入框
 * @return {[type]} [description]
 *
 * Event =========
 * change
 *
 * Method ========
 * getValue()
 * setValue(v)
 */
(function ($) {
    $.widget('pandora.NumberEditor', $.pandora.BaseEditor, {
        options : {
            value : 0
        },
        _create : function () {
            var me = this,
                options = this.options;

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this.editor = $('<input/>')
                .attr({type : 'text'})
                .addClass('ui-input')
                .val(this.options.value)
                .width(options.width)
                .blur(function (e) {
                    var value = me._getValue();
                    if (options.value !== value) {
                        me._trigger('change', e, {value : options.value = value});
                    }
                });

            this.element.
                addClass('number-editor').
                append(this.editor).
                keydown(function (e) {
                    if(!me.disabled) {
                        var value = me._getValue();
                        if (e.which == 13 && options.value !== value) {
                            me._trigger('change', e, {value : options.value = value});
                        }
                    }
                });

            this.editor.spinner({
                min : this.options.min,
                max : this.options.max,
                spin : function (e, ui) {
                    if (options.value !== ui.value) {
                        me._trigger('change', e, {value : options.value = ui.value});
                    }
                }
            });

            this._setOption('disabled', options.disabled);
        },
        _destroy : function () {
            this.element.removeClass('number-editor');
            this.editor.unbind('blur');
            this.element.unbind('keydown');
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },

        _setOption : function (k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);

            if (k === 'disabled') {
                this.editor.attr('disabled', v);
            }
        },
        _formatValue : function (v) {
            return parseInt(v, 10) || 0;
        },
        _setValue : function (v) { 
            this.editor.val(this.options.value = v);
        },
        _getValue : function () {
            return this._formatValue(this.editor.val());
        }
    });
})(jQuery);
(function ($) {
    $.widget('pandora.StringEditor', $.pandora.BaseEditor, {
        options : {
            value : ''
        },
        _create : function () {
            var options = this.options;

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this.editor = $('<input/>')
                .attr({type : 'text'})
                .addClass('ui-input')
                .val(this.options.value)
                .width(options.width)
                .blur($.proxy(this._blurHandler, this));

            this.element.
                addClass('string-editor').
                append(this.editor).
                keyup($.proxy(this._keyupHandler, this));

            this._setOption('disabled', options.disabled);
        },
        _blurHandler : function (e) {
            var value = this._getValue();
            if (this.options.value !== value) {
                this._trigger('change', e, {value : this.options.value = value});
            }
        },
        _keyupHandler : function (e) {
            if (!this.options.disabled) {
                if (e.which == 13) {
                    var value = this._getValue();
                    if (this.options.value !== value) {
                        this._trigger('change', e, {value : this.options.value = value});
                    }
                    e.target.blur();
                }
            }
        },
        _setOption : function (k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);

            if (k === 'disabled') {
                this.editor.attr('disabled', v);
            }
        },
        _formatValue : function (v) {
            return v + '';
        },
        _setValue : function (v) {
            this.editor.val(this.options.value = v);
        },
        _getValue : function () {
            return this._formatValue(this.editor.val());
        },
        _destroy : function () {
            this.element.removeClass('string-editor');
            this.editor.unbind('blur', this._blurHandler);
            this.element.unbind('keyup', this._keyupHandler);
            $.pandora.BaseEditor.prototype._destroy.call(this);
        }
    });
})(jQuery);
(function ($) {
    $.widget('pandora.TextEditor', $.pandora.BaseEditor, {
        options : {
            value : ''
        },
        _create : function () {
            var me = this, 
                options = this.options;

            $.pandora.BaseEditor.prototype._create.call(this, options);
            this.element.
                addClass('text-editor').
                append(
                    this.editor = $('<textarea>').val(this.options.value).width(options.width)
                ).
                keyup($.proxy(this._keyupHandler, this));

            this._setOption('disabled', options.disabled);
        },

        _keyupHandler : function (e) {
            var value = this._getValue();
            if (this.options.value !== value) {
                this._trigger('change', e, {value : this.options.value = value});
            }
        },

        _setOption : function (k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);

            if (k === 'disabled') {
                this.editor.attr('disabled', v);
            }
        },

        _formatValue : function (v) {
            return v + '';
        },
        _setValue : function (v) { 
            this.editor.val(this.options.value = v);
        },
        _getValue : function () {
            return this._formatValue(this.editor.val());
        },
        _destroy : function () {
            this.element.removeClass('text-editor');
            this.element.unbind('keyup', this._keyupHandler);
        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.RangeEditor', $.pandora.BaseEditor, {
        options : {
            value : 0,
            min : 0,
            max : 100,
            format : function (v) {
                return v;
            }
        },
        _create : function () {
            var options = this.options;

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this.slider = $('<div class="range-editor-slider"/>')
                .appendTo(this.element)
                .slider({
                    min : options.min,
                    max : options.max,
                    value : options.value,
                    //orientation : 'vertical',
                    change : $.proxy(this._changeHandler, this),
                    slide : $.proxy(this._slideHandler, this)
                });

            this.editor = $('<span style="padding:0px 6px;line-height:20px;">').html(options.value).appendTo(this.element);

            this.element.addClass('range-editor');

            this._setOption('disabled', options.disabled);
        },
        _slideHandler : function (e, ui) {
            this.editor.html(ui.value);
        },

        _changeHandler : function (e, ui) {
            this._trigger('change', e, {value : this.options.value = ui.value});
        },

        _destroy : function () {
            this.element.removeClass('range-editor');
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },

        _setOption : function (k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);
            if (k === 'disabled') {
                this.slider.slider('option', 'disabled', v);
            }
        },
        _formatValue : function (v) {
            //return $.isFunction(this.options.format) ? this.options.format(v) : v;
            return parseInt(v, 10);
        },
        _getValue : function () {
            return this._formatValue(this.editor.val());
        },
        _setValue : function (v) {
            this.editor.val(this.options.value = v);
        }
    });

})(jQuery);(function ($) {
    $.widget('pandora.RadioEditor', $.pandora.BaseEditor, {
        _create : function () {
            var me = this,
                options = this.options;

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this.editor = this.element.html(this._getMainHTML()).buttonset().change($.proxy(this._changeHandler, this));

            this._setOption('disabled', options.disabled);

        }, 
        _changeHandler : function (e) {
            this._trigger('change', e, {value : this.options.value = e.srcElement.value});
        },
        _destroy : function () {
            this.editor.unbind('change', this._changeHandler);
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },
        _setOption : function (k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);
            if (k === 'disabled') {
                this.editor.buttonset(v ? 'disable' : 'enable');
            }
        },
        _getMainHTML : function () {
            var me = this,
                html = [],
                ds = this.options.datasource,
                format = this.options.format,
                name = this.options.name || this._getName();

            $.each(ds, function (i, item) {
                var _uid = me._getUID(),
                    checked = (item == me.options.value ? 'checked="checked"' : '');
                html.push('<input type="radio" ' + checked + ' value="' + item + '" id="' + _uid + '" name="' + name + '"/><label for="' + _uid + '">' + (format ? format(i, item) : item) + '</label>');
            });
            return html.join('');
        },
        _formatValue : function (v) {
            return v + '';
        },
        _setValue : function (v) {
            var me = this,
                value = this._formatValue(v);
            $('input[type="radio"]', this.element).each(function (i, item) {
                if (me._formatValue(item.value) === v) {
                    me.options.value = value;
                    item.checked = true;
                }
            });
            this.element.buttonset();
        },
        _getValue : function () {
            var me = this,
                value;
            $('input[type="radio"]', this.element).each(function (i, item) {
                if (item.checked) {
                    return value = me._formatValue(item.value);
                }
            });
            return value;
        }
    })

})(jQuery);(function ($) {
    var FONT_FAMILY_LIST = [
        "Arial 默认",
        "SimSun 宋体",
        "SimHei 黑体",  
        "FangSong_GB2312 仿宋_GB2312",  
        "KaiTi_GB2312 楷体_GB2312"  
        // "YouYuan 幼圆",  
        // "STSong 华文宋体",  
        // "STZhongsong 华文中宋",   
        // "STKaiti 华文楷体",   
        // "STFangsong 华文仿宋",   
        // "STXihei 华文细黑",   
        // "STLiti 华文隶书",   
        // "STXingkai 华文行楷",   
        // "STXinwei 华文新魏",   
        // "STHupo 华文琥珀"
    ];
    var FONT_SIZE_LIST = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72];

    $.widget('pandora.FontEditor', $.pandora.BaseEditor, {
        options : {
            value : {
                'font-family' : 'SimSun'
            }
        },
        _create : function () {
            var options = this.options;
           
            $.pandora.BaseEditor.prototype._create.call(this, options);

            this._fontFamily = $('<select/>')
                .html(this._getFontFamilyHTML())
                .val(options.value['font-family'])
                .appendTo(this.element)
                .selectmenu({
                    width : 35,
                    menuWidth : 120,
                    change : $.proxy(this._changeHandler, this),
                    format : function (text, item) {
                        return '<span style="font-family:' + item.value + '">' + text + '</span>';
                    }
                });

            this._fontSize = $('<select/>')
                .html(this._getFontSizeHTML())
                .val(options.value['font-size'])
                .appendTo(this.element)
                .selectmenu({
                    width : 28,
                    menuWidth : 70,
                    change : $.proxy(this._changeHandler, this)
                });

            this._fontStyle = $('<div>')
                .addClass('font-editor-style')
                .html(this._getFontStyleHTML(options.value))
                .appendTo(this.element)
                .buttonset()
                .change($.proxy(this._changeHandler, this));

            this.element.addClass('font-editor');
            this._setOption('disabled', options.disabled);
        },
        _changeHandler : function (e, ui) {
            this._trigger('change', e, {value : this.options.value = this._getValue()});
        },
        _destroy : function () {
            this.element.removeClass('font-editor');
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },
        _setOption : function (k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);
            if (k === 'disabled') {
                this._fontFamily.selectmenu(v ? 'disable' : 'enable');
                this._fontStyle.buttonset(v ? 'disable' : 'enable');
                this._fontSize.selectmenu(v ? 'disable' : 'enable');
            }
        },
        _getFontFamilyHTML : function () {
            var html = [];
            $.each(FONT_FAMILY_LIST, function (i, item) {
                var _item = item.split(' ');
                html.push('<option value="' + _item[0] + '">' + _item[1] + '</option>');
            });
            return html.join('');
        },
        _getFontSizeHTML : function () {
            var html = [];
            $.each(FONT_SIZE_LIST, function (i, item) {
                html.push('<option value="' + item + '">' + item + 'px</option>');
            });
            return html.join('');
        },
        _getFontStyleHTML : function (value) {
            var uid = this._getUID() + 'Style';
            return [
                '<input type="checkbox" name="font-weight"' + (value['font-weight'] === 'bold' && ' checked="checked"') + ' value="bold" id="' + uid + 'B" /><label for="' + uid + 'B"><b>B</b></label>',
                '<input type="checkbox" name="font-style"' + (value['font-style'] === 'italic' && ' checked="checked"') + ' value="italic" id="' + uid + 'I" /><label for="' + uid + 'I"><i>I</i></label>',
                '<input type="checkbox" name="text-decoration"' + (value['text-decoration'] === 'underline' && ' checked="checked"') + ' value="underline" id="' + uid + 'U" /><label for="' + uid + 'U"><u>U</u></label>'
            ].join('');
            uid = null;
        },
        _getValue : function () {
            var r = {},
                cbs = this._fontStyle.children('input[type="checkbox"]');

            r['font-family'] = this._fontFamily.val();
            r['font-size'] = parseInt(this._fontSize.val());

            cbs.each(function (i, item) {
                r[item.name] = (item.checked ? item.value : (item.name == 'text-decoration' ? 'none' : 'normal'));
            });

            return r;
        },
        _setValue : function (v) {
            var bold = v['font-weight'],
                italic = v['font-style'],
                underline = v['text-decoration'],
                font = v['font-family'],
                size = v['font-size'] + '';

            this._fontFamily.selectmenu('value', font);
            this._fontSize.selectmenu('value', size);

            var cbs = this._fontStyle.children('input[type="checkbox"]');
            cbs[0].checked = bold && bold !== 'normal';
            cbs[1].checked = italic && italic !== 'normal';
            cbs[2].checked = underline && underline !== 'none';

            this._fontStyle.buttonset();

            this.options.value = v;
        }
    });
})(jQuery);
(function($) {
    $.widget('pandora.SelectEditor', $.pandora.BaseEditor, {
        options : {
            value : 0,
            datasource : []
        },
        _create : function () {
            var options = this.options;

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this.element.html(this._getMainHTML());
            this.editor = this.element.children('select').selectmenu({
                width : options.width,
                menuWidth : options.menuWidth,
                format : options.format,
                change : $.proxy(this._changeHandler, this)
            });

            this._setOption('disabled', options.disabled);
        },
        _changeHandler : function (e, ui) {
            this._trigger('change', e, {value : this.options.value = this._formatValue(ui.item.value)});
        },
        _destroy : function () {
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },
        _getMainHTML : function () {
            var me = this,
                html = [],
                ds = this.options.datasource;

            $.each(ds, function (i, item) {
                var selected = (item.value == me.options.value ? 'selected="selected" ' : '');
                html.push('<option ' + selected + 'value="' + item.value + '">' + item.name + '</option>');
            });

            return '<select name="' + (this.options.name || this._getName()) + '">' + html.join('') + '</select>';
        },

        _setOption : function (k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);
            if (k === 'disabled') {
                this.editor.selectmenu(v ? 'disable' : 'enable');
            }
        },

        _formatValue : function (v) {
            return v + '';
        },
        _setValue : function (v) {
            //@TODO 这里不能添加没有的值
            var inOptions = false,
                me = this,
                value = this._formatValue(v);
            $.each(this.options.datasource, function (i, item) {
                if (me._formatValue(item.value) === value) {
                    inOptions = true;
                    return false;
                }
            });
            inOptions && this.editor.selectmenu('value', this.options.value = value);
            return inOptions;
        },
        _getValue : function () {
            return this._formatValue(this.editor.selectmenu('value'));
        }
    })
})(jQuery);(function($) {
    $.widget('pandora.ColorEditor', $.pandora.BaseEditor, {
        options: {
            value: ''
        },

        _create: function() {
            var me = this,
                options = this.options;

            $.pandora.BaseEditor.prototype._create.call(this);

            this.editor = $('<div class="color-editor"><div class="color-editor-btn" style="background-color:' + options.value + '"></div><i class="icon-arrow-down"></i></div>').addClass('ui-state-default').data('color', options.value).appendTo(this.element);

            this._hoverable(this.editor);

            this.editor.colorpicker({
                change :  function(e, data) {
                    var color = 'transparent';
                    if (data !== 'transparent') {
                        color = data.toHex();
                    }
                    me.setValue(color);
                    me._trigger('change', e, {value : color});
                }
            });

            this._setOption('disabled', options.disabled);
        },
        _destroy : function () {
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },

        _setOption: function(k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);

            if(k == 'disabled') {
                this.editor.attr('disabled', v);
                this.editor.colorpicker('option', 'disabled', v);
            }
        },

        _setValue: function(v) {
            this.editor.find('.color-editor-btn').css('background-color', v);
            this.editor.data('color', this.options.value = v);
        }
    });
})(jQuery);(function ($) {

    var ITEM_CLASS = 'objarray-editor-item',
        BLOCK_CLASS = 'objarray-editor-block',
        PANEL_CLASS = 'objarray-editor-panel',
        uid = 0;

    $.widget('pandora.ObjarrayEditor', $.pandora.BaseEditor, {
        options : {
            value : [],
            map : {},
            max : 10,                   //最大条数
            min : 0,                    //最小条数
            itemHeader : '',            //每个条目的title
            buttonText : ' + 添加一项',  //添加按钮文字
            onitemselect : $.noop
        },

        add : function (e) {
            var r = this._copy();
            if (r.length < this.options.max) {
                var last = r[r.length - 1],
                    item = (this.options.newItemData && this.options.newItemData(last)) || $.extend({}, last);
                this._addBlock(r.length, item);  
                r.push(item);
            }
            this._trigger('change', e, {value : this.options.value = r});
            this._changeState();
        },

        _create : function () {
            var me = this,
                options = this.options;

            this.currentIndex = 0;
        
            $.pandora.BaseEditor.prototype._create.call(this, options);

            this.addBtn = $('<button>' + this.options.buttonText + '</button>')
                .button()
                .click($.proxy(this.add, this));


            this.element
                .addClass('objarray-editor')
                .append(this.addBtn)
                .append($('<div class="' + PANEL_CLASS + '"><div class="editor-panel-arrow">\u25C6</div><div class="editor-panel-content"></div></div>'));

            this.editor = $('.editor-panel-content', this.element);

            this._on(this.editor, function () {
                var h = {};
                h['editorchange .' + ITEM_CLASS] = function (e, data) {
                    var r = this._copy(),
                        el = $(e.currentTarget),
                        idx = parseInt(el.attr('data-idx'), 10),
                        pn = el.attr('data-pn');

                    r[idx][pn] = data.value;
                    this._trigger('change', e, {value : this.options.value = r});
                    e.stopPropagation();
                    this.options.onitemselect(this.currentIndex);
                };
                h['mouseover .' + BLOCK_CLASS] = function (e) {
                    $(e.currentTarget).addClass(BLOCK_CLASS + '-hover');
                };
                h['mouseout .' + BLOCK_CLASS] = function (e) {
                    $(e.currentTarget).removeClass(BLOCK_CLASS + '-hover');
                };
                h['click .' + BLOCK_CLASS + '-remove'] = function (e) {
                    var r = this._copy();
                    if (r.length > this.options.min) {
                        var block = $(e.currentTarget).parent()[0],
                        idx = this._getIndex(block);
                        $(block).remove();
                        r.splice(idx, 1); 
                    }
                    if (r.length === 0) {
                        this.element.removeClass(BLOCK_CLASS + '-open');
                    }
                    this._trigger('change', e, {value : this.options.value = r});
                    this._changeState();
                    this._refreshIndex();
                    e.stopPropagation();
                };
                h['click .' + BLOCK_CLASS + '-header'] = function (e) {
                    var $target = $(e.target),
                        idx = parseInt($target.attr('data-idx'), 10);
                    this.currentIndex = idx || 0;
                    $('.' + BLOCK_CLASS + '-table', this.editor).hide();
                    $target.next().show();
                    this.options.onitemselect(idx);
                };
                return h;
            }());

            !this.options.itemHeader && this.element.addClass('objarray-editor-expend');

            this._setValue(this.options.value);
            this._setOption('disabled', options.disabled);
        },
        _changeState : function () {
            this.addBtn.button('option', 'disabled', this.options.value.length >= this.options.max);

            if (this.options.value.length > this.options.min) {
                this.editor.addClass(BLOCK_CLASS + '-canremove');
            } else {
                this.editor.removeClass(BLOCK_CLASS + '-canremove');
            }
        },
        _destroy : function () {
            this.element.removeClass('objarray-editor');
            this.addBtn.unbind('click', this.add);
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },
        _setOption : function (k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);
            if (k === 'disabled') {
                this.addBtn.button('option', 'disabled', v);
            }
        },
        _addBlock : function (i, value) {
            var html = [],
                map = this.options.map,
                block;
            for(var k in map) {
                map[k].value = value[k];
                html.push(
                    ['<tr>',
                        (map[k].label ? '<th><nobr>' + map[k].label + '</nobr></th>' : ''),
                        '<td><div data-idx="' + i + '" data-pn="' + k + '" class="' + ITEM_CLASS + '"></div></td>',
                    '</tr>'].join('')
                );
            }
            this.editor.append(
                block = $(
                    ['<div class="' + BLOCK_CLASS + '">',
                        (this.options.itemHeader ? '<h4 data-idx="' + i + '" class="' + BLOCK_CLASS + '-header">' + this.options.itemHeader + '</h4>' : ''),
                        '<table class="' + BLOCK_CLASS + '-table">' + html.join('') + '</table>',
                        '<div class="' + BLOCK_CLASS + '-remove ui-corner-all">×</div>',
                    '</div>'].join('')
                )
            );
            
            $('.' + ITEM_CLASS, block).each(function (i, item) {
                var $item = $(item),
                    k = $item.attr('data-pn');
                $item[$.upperCaseFirst(map[k].type) + 'Editor'](map[k]);
            });

            this.element.addClass(BLOCK_CLASS + '-open');
        },
        _genId : function () {
            return 'ObjarrayEditor' + (uid++);
        },
        _copy : function () {
            return this.options.value.slice(0);
        },
        _getIndex : function (el) {
            return $.inArray(el, $('.' + BLOCK_CLASS, this.editor));
        },
        _refreshIndex : function () {
            $('.' + BLOCK_CLASS + '-header', this.editor).each(function (i, item) {
                $(item).attr('data-idx', i);
            });
            $('.' + BLOCK_CLASS, this.editor).each(function (i, item) {
                $(item).attr('data-idx', i);
            });
        },
        _setValue : function (v) {
            var me = this;
            //如果数据超出最大允许值，强制截断
            this.options.value = v.slice(0, this.options.max);

            $.each(this.options.value, function (i, item) {
                me._addBlock(i, item);
            });
            this._changeState();
        },
        _getValue : function () {
            return this.options.value;
        }
    });
})(jQuery);(function ($) {
    var ITEM_CLASS = 'obj-editor-item',
        BLOCK_CLASS = 'obj-editor-block',
        PANEL_CLASS = 'obj-editor-panel';

    $.widget('pandora.ObjEditor', $.pandora.BaseEditor, {
        options : {
            value : {},
            map : {}
        },
        _create : function () {
            var me = this,
                options = this.options,
                map = options.map,
                value = options.value;

            $.pandora.BaseEditor.prototype._create.call(this, options);


            this.element
                .addClass('obj-editor')
                .append($('<div class="' + PANEL_CLASS + '"><div class="editor-panel-arrow">\u25C6</div><div class="editor-panel-content"></div></div>'));

            this.editor = $('.editor-panel-content', this.element);

            this._on(this.editor, function () {
                var h = {};
                h['editorchange .' + ITEM_CLASS] = function (e, data) {
                    var r = this._copy();
                    var el = $(e.currentTarget),
                        pn = el.attr('data-pn');

                    r[pn] = data.value;

                    this._trigger('change', e, {value : this.options.value = r});
                    e.stopPropagation();
                };
                return h;
            }());

            this._setValue(this.options.value);
        },
        _destroy : function () {
            this.element.removeClass('obj-editor');
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },
        _copy : function () {
            return $.extend({}, this.options.value);
        },
        _setValue : function (v) {
            var map = this.options.map,
                html = [];

            this._remove();
            for(var k in map) {
                map[k].value = v[k];
                html.push('<tr><th><nobr>' + map[k].label + '</nobr></th><td><div data-pn="' + k + '" class="' + ITEM_CLASS + '"></div></td></tr>');
            }
            this.editor.append($('<table>' + html.join('') + '</table>'));
            
            $('.' + ITEM_CLASS, this.editor).each(function (i, item) {
                var $item = $(item),
                    k = $item.attr('data-pn');
                $item[$.upperCaseFirst(map[k].type) + 'Editor'](map[k]);
            });

            this.options.value = v;
        },
        _getValue : function () {
            return this.option.value;
        },
        _remove : function () {
            $('.editor', this.editor).remove();
        }
    });
})(jQuery);(function ($) {
    var BASE_CLASS = 'switchobj-editor',
        uid = 0;

    function getPanelId(uid, type) {
        return 'SwitchobjEditorPanel' + uid + type;
    }

    $.widget('pandora.SwitchobjEditor', $.pandora.BaseEditor, {
        options : {
            datasource : [
                {
                    name : '普通组合',
                    value : 'common'
                },
                {
                    name : '表单',
                    value : 'form',
                    map : {
                        action : {
                            type : 'string',
                            label : '提交路径'
                        }
                    }
                }
            ],
            value : {
                select : 'common',
                map : {
                    'common' : '',
                    'form' : {
                        'action' : 'http://adbox.sina.com.cn/form/testdrive'
                    }
                }
            }
        },
        _create : function () {
            var me = this,
                options = this.options,
                maps = {},
                selectDS = [],
                datasource = options.datasource || [];

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this.uid = uid++;

            $.each(datasource, function (i, ds) {
                selectDS.push({
                    name : ds.name,
                    value : ds.value
                });
                ds.map && (maps[ds.value] = ds.map);
            });

            this.editor = $('<div class="' + BASE_CLASS + '-select">')
                .appendTo(this.element)
                .SelectEditor({
                    datasource : options.datasource,
                    width : options.width,
                    change : function (e, data) {
                        var value = {};

                        value.select = data.value;
                        value.map = me.options.value.map;

                        me._showPanel(data.value);
                        me._trigger('change', e, {
                            value : me.options.value = value
                        });
                        e.preventDefault();
                    }
                });

            this.panel = $('<div class="' + BASE_CLASS + '-panel">').appendTo(this.element);
            $.map(maps, function (map, type) {
                me.panel.append($('<div id="' + getPanelId(me.uid, type) + '">')
                    .addClass(BASE_CLASS + '-panel-block')
                    .ObjEditor({
                        map : map,
                        value : me.options.value.map[me.options.value.select],
                        change : function (e, data) {
                            var value = {};

                            value.select = me.options.value.select;
                            !value.map && (value.map = {});
                            value.map[value.select] = data.value;

                            me._trigger('change', e, {
                                value : me.options.value = value
                            });
                            e.preventDefault();
                        }
                    }));
            });

            this._on(this.panel, (function () {
                var r = {};
                r['editorchange .' + BASE_CLASS + '-panel-block'] = function (e, data) {
                    e.stopPropagation();
                };
                r['editorchange .' + BASE_CLASS + '-select'] = function (e, data) {
                    e.stopPropagation();
                };
                return r;
            })());

            this._showPanel(this.options.value.select);
        },
        _showPanel : function (type, value) {
            $('.' + BASE_CLASS + '-panel-block', this.element).hide();
            $('#' + getPanelId(this.uid, type)).show();
        }
    });
})(jQuery);(function ($) {
    var EVENT_TYPE_LIST = [
            "always 一直",
            "click 鼠标点击",  
            "mouseover 鼠标滑过",  
            "mouseout 鼠标移开"
        ],
        EVENT_ANIMATE_LIST = [
            "none 无效果",
            "show 出现",
            "hide 隐藏"
        ];

    $.widget('pandora.InteractiveEditor', $.pandora.BaseEditor, {
        options : {
            value : {
                type : 'always',
                animate : 'none',
                target : 'none'
            }
        },
        _create : function () {
            var me = this,
                options = this.options;

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this._interType = $('<select/>')
                .html(this._getTypeHTML())
                .val(options.value.type)
                .appendTo(this.element)
                .selectmenu({
                    width : 35,
                    menuWidth : 100,
                    change : $.proxy(this._changeHandler, this)
                });
            this._interTarget = $('<select/>')
                .html(this._getTargetHTML())
                .val(options.value.target)
                .appendTo(this.element)
                .selectmenu({
                    width : 35,
                    menuWidth : 100,
                    change : $.proxy(this._changeHandler, this)
                });
            this._interAnimate = $('<select>')
                .html(this._getAnimateHTML())
                .val(options.value.animate)
                .appendTo(this.element)
                .selectmenu({
                    width : 35,
                    menuWidth : 100,
                    change : $.proxy(this._changeHandler, this)
                });

            this.element.addClass('interactive-editor');

            this._setOption('disabled', options.disabled);
        },
        _changeHandler : function (e) {
            this._trigger('change', e, {value : this.options.value = this._getValue()});
        },
        _destroy : function () {
            this.element.removeClass('interactive-editor');
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },
        _setOption : function (k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);
            if (k === 'disabled') {
                this._interType.selectmenu(v ? 'disable' : 'enable');
                this._interTarget.selectmenu(v ? 'disable' : 'enable');
                this._interAnimate.selectmenu(v ? 'disable' : 'enable');
            }
        },
        _getTypeHTML : function () {
            var html = [];
            $.each(EVENT_TYPE_LIST, function (i, item) {
                var _item = item.split(' ');
                html.push('<option value="' + _item[0] + '">' + _item[1] + '</option>');
            });
            return html.join('');
        },
        _getTargetHTML : function () {
            var html = [],
                list = ('function' == typeof $.pandora.InteractiveEditor.getObjectList) ? $.pandora.InteractiveEditor.getObjectList() : $.pandora.InteractiveEditor.getObjectList;

            list.unshift('none 无');
            $.each(list, function (i, item) {
                var _item = item.split(' ');
                html.push('<option value="' + _item[0] + '">' + _item[1] + '</option>');
            });
            return html.join('');
        },
        _getAnimateHTML : function (value) {
            var html = [];
            $.each(EVENT_ANIMATE_LIST, function (i, item) {
                var _item = item.split(' ');
                html.push('<option value="' + _item[0] + '">' + _item[1] + '</option>');
            });
            return html.join('');
        },
        _getValue : function () {
            return {
                type : this._interType.val(),
                target : this._interTarget.val(),
                animate : this._interAnimate.val()
            };
        },
        _setValue : function (v) {
            this._interType.selectmenu('value', v.type);
            this._interTarget.selectmenu('value', v.target);
            this._interAnimate.selectmenu('value', v.animate);
            this.options.value = v;
        }
    });
    
    $.pandora.InteractiveEditor.getObjectList = function () {
        return [];
    };
})(jQuery);/**
 * 抽象上传类
 * @author  hushicai
 *
 * @link: http://lucifr.com/139225/sublime-text-2-tricks-and-tips/
 */
(function($) {
	$.widget('pandora.BaseUpload', $.pandora.BaseEditor, {
		options: {
			value: ''
		},
		_create: function() {
			$.pandora.BaseEditor.prototype._create.call(this);

			this._setOption('disabled', this.options.disabled);

			this.element.addClass('baseupload-editor');

			this.mask = $('<div class="baseupload-editor-mask">正在加载...</div>').appendTo(this.element);
		},
		_destroy : function () {
			this.mask.remove();
		},
		//获取地址
		_getValue: function() {
			return this.options.value;
		},
		/**
		 * 加载状态
		 * @return {undefined}
		 */
		showLoadingState: function() {
			this.element.addClass('baseupload-editor-busy');
		},

		hideLoadingState: function() {
			this.element.removeClass('baseupload-editor-busy');
		},

		/*data: {url: '', width: '', height: ''}*/
		getImgHtml: function(data, w, h) {
			//todo: 等比缩放
			var size = $.imageScale(data.width, data.height, w, h);

			return '<img alt="" src="'+ data.url +'" width="'+ size.width +'" height="'+ size.height +'" />';
		},

		/**
		 * 处理后端返回的状态码
		 * @param  {String} code json格式的字符串
		 * @param  {Object} fns  json格式的回调函数集合
		 */
		handleStatus: function(data, success, fail) {
			$.responseParser(data, success, fail);
		}
	});
})(jQuery);(function($) {
    var DEFAULT_TEXT = '选择文件...';
    var tpl = '<table><tbody>'
         + '<tr>'
            + '<td>'
                + '<form enctype="multipart/form-data" target="localUploadTemp" method="post">'
                    + '<div style="position:relative;display:inline-block;*display:inline;*zoom:1;"><button class="ui-button ui-state-default choosefilebtn" type="button">' + DEFAULT_TEXT + '</button><input class="ui-input file" type="file" name="filename" style="width:60px;opacity:0;*filter:Alpha(opacity=0);position:absolute;left:0px;top:0px;"/></div>'
                    + '<button type="submit">上传</button>'
                + '</form>'
            + '</td>'
        + '</tbody></table>',
        UPLOAD_URL_MAP = [
            '',
            '/pic/upload',
            '/flash/upload',
            '/vod/upload'
        ];

    var iframe = $('<iframe name="localUploadTemp" style="display:none;" src="about:blank"></iframe>')
        .load(function (e) {
            //@notice: src:blank
            var $iframe = $(this),
                iframeDoc = $iframe.contents(),
                uploader = $iframe.data('uploader'),
                code = iframeDoc.text();
            if (uploader) {
                if (code.indexOf('<code>') !== -1) {
                    var match = code.match('<code>(.*)</code>');
                    code = (match && match[1] ? match[1] : '');
                }
                if (code) {
                    $.responseParser($.json.parse(code), function (data) {
                        //me.hideLoadingState();
                        uploader.doneUpload(uploader.options.value = {
                            url : data.url,
                            width : data.width || 300,
                            height : data.height || 250
                        });
                    });
                }
                uploader.hideLoadingState();
            }
        });

    $('body').append(iframe);

    $.widget('pandora.LocalUpload', $.pandora.BaseUpload, {
        options: {
            value: '',
            mtype : 1
        },
        _create: function() {
            var me = this,
                options = this.options;

            $.pandora.BaseUpload.prototype._create.call(this);



            this.element
                .append($(tpl))
                .find('form')
                .attr('action', options.action || UPLOAD_URL_MAP[options.mtype]);
            
            ////debug(this.element.find('iframe'));
            // this.element
            //     .find('iframe').load($.proxy(this._iframeloadHandler, this));

            this.element
                .find('.file').change(function (e) {
                    me.element.find('.choosefilebtn').html($(this).val().substring(0, 8) + '...');
                });

            this.element
                .find('button[type="submit"]').button().click(function(e) {
                    me.showLoadingState();
                    iframe.data('uploader', me);
                });
        },

        _destroy : function () {
            $('iframe', this.element).unbind('load', this._iframeloadHandler);
            $('file', this.element).unbind();
            this.element.find('button[type="submit"]').unbind().remove();
            $.pandora.BaseUpload.prototype._destroy.call(this);
        },

        _setOption: function(k, v) {
            
        },

        
        doneUpload: function(data) {
            var me = this;


            pandora.tipBox.show('上传成功');
            this.element.find('.choosefilebtn').html(DEFAULT_TEXT);

            this._trigger('upload', null, {value : data});

            //预览图片
            //previewEl.html('').append($(this.getImgHtml(data, previewEl.width() - 10, previewEl.height() - 10)));

            me.setValue(data);
        },

        _formatValue: function(v) {
            return v;
        },

        _setValue: function(v) {
            //无法设置input[type="file"]的值，不能直接调用setValue，只能被动的调用
            //忽略控制台直接调用setValue的情况
            this.options.value = this._formatValue(v);
        }
    });
})(jQuery);(function($) {
  var tpl = '<table><tbody>'
      + '<tr><td><input class="ui-input" type="text" style="width:45%"/><button>上传</button></td></tr>'
    + '</tbody></table>',
        FETCH_URL_MAP = [
            '',
            '/pic/fetch',
            '/flash/fetch',
            '/vod/fetch'
        ];;
  
  $.widget('pandora.UrlUpload', $.pandora.BaseUpload, {
    options: {
        value : '',
        mtype : 1
    },

    _create: function() {
      var me = this;

      $.pandora.BaseUpload.prototype._create.call(me);
      
      this.textElement = $(tpl).appendTo(this.element)
        .find('input[type="text"]').val(this.options.value);

      this.element.find('button').button().click(function(e) {
        var value = me.element.find('input[type="text"]').val();
        me.showLoadingState();
        me.fetch(value);
      });
    },
    _destroy : function () {
      this.textElement.remove();
      this.element.find('button').unbind().remove();
    },
    //桥接，方便控制台单测
    fetch: function(url) {
        var me = this;

        me.showLoadingState();

        //不需要encodeURIComponent
        $.ajax(this.options.fetchUrl || FETCH_URL_MAP[this.options.mtype], {
            data : {url: url},
            dataType : 'json',
            type : 'POST',
            success : function(data) {
                me.hideLoadingState();
                $.responseParser(data, function (data) {
                    pandora.tipBox.show('URL获取成功。');
                    me._trigger('upload', null, {value : me.options.value = data});
                });
            }
        });
    },
    //@todo: disabled处理
    _setOption: function(k, v) {

    },

    _formatValue: function(v) {
      return v;
    },

    _setValue: function(v) {
      //本组件的setValue并非输入框中的value，只有上传成功后才会change，否则无效
      this.textElement.val(this._formatValue(v));
      this.fetch(v);

      //不在这里出发change事件
      return false;
    }
  });
})(jQuery);(function($) {
    var tpl = '',
        HISTORY_URL = '/mid/get_list',
        BASE_CLASS = 'history-upload-editor',
        ITEM_CLASS = BASE_CLASS + '-item',
        ITEM_HOVER_CLASS = ITEM_CLASS + '-hover',
        ITEM_SELECTED_CLASS = ITEM_CLASS + '-selected',
        PAGE_SIZE = 9;
    
    $.widget('pandora.HistoryUpload', $.pandora.BaseUpload, {
        options: {
            value: 'history'
        },

        _create: function() {
            var me = this;

            $.pandora.BaseUpload.prototype._create.call(me);


            this.element.addClass(BASE_CLASS);

            this.list = $('<div/>').addClass(BASE_CLASS + '-list').appendTo(this.element);
            this.pager = $('<span>').minipager({
                change : function (e, data) {
                    me.loadData(data.page, PAGE_SIZE, me.options.mtype);
                }
            }).appendTo($('<div class="' + BASE_CLASS + '-pagerbar">').appendTo(this.element));

            this._on(this.list, (function () {
                var handler = {};
                handler['hover .' + ITEM_CLASS] = function (e) {
                    $(e.currentTarget).toggleClass(ITEM_CLASS + '-hover');
                };
                handler['click .' + ITEM_CLASS] = function (e) {
                    var tar = $(e.currentTarget),
                        url = tar.attr('data-url'),
                        width = parseInt(tar.attr('data-w'), 10),
                        height = parseInt(tar.attr('data-h'), 10);

                    $('.' + ITEM_SELECTED_CLASS, this.element).removeClass(ITEM_SELECTED_CLASS);

                    tar.addClass(ITEM_SELECTED_CLASS);
                    this._trigger('upload', null, {
                        value : this.options.value = {
                            url : url,
                            width : width,
                            height : height 
                        }
                    });
                };
                return handler;
            })());
        },

        _destroy : function () {
            this.list.remove();
            this.pager.unbind().remove();
            $.pandora.BaseUpload.prototype._destroy.call(this);
        },

        renderImg : function (item, size) {
            return '<img src="' + item.url + '" style="width:' + size.w + 'px;height:' + size.h + 'px;margin:' + size.hp + 'px ' + size.wp + 'px;" />';
        },

        renderFlash : function (item, size) {
            return [
                '<div style="position:relative;margin:' + size.hp + 'px ' + size.wp + 'px;">',
                    $.createSwfHTML({
                        url : item.url,
                        width : size.w,
                        height : size.h,
                        scale : 'exactfit'
                    }),
                    '<div class="com-fla-view-mask" style="z-index:1;width:' + size.w + 'px;height:' + size.h + 'px;"></div>',
                '</div>',
            ].join('');
        },

        renderVideo : function (item, size) {
            return [
                '<div style="position:relative;margin:' + size.hp + 'px ' + size.wp + 'px;">',
                    $.createSwfHTML({
                        url : $.pandora.Video.PLAYER_URL + item.url,
                        width : size.w,
                        height : size.h,
                        scale : 'exactfit'
                    }),
                    '<div class="com-video-view-mask" style="z-index:1;width:' + size.w + 'px;height:' + size.h + 'px;"></div>',
                '</div>',
            ].join('');
        },

        render : function (data) {
            if (!(data && data.recordlist instanceof Array && data.recordlist.length > 0)) {
                this.list.html('<div style="text-align:center;line-height:40px">没有可以使用的素材</div>');
                return;
            }
            ////log(this.element.width());
            var html = [],
                me = this,
                max = Math.max(this.element.width() / 3 - 11, 30);
                //max = 55;
            $.each(data.recordlist, function (i, item) {
                var size = $.centerImage(item.width, item.height, max, max),
                    cnt;
                switch (parseInt(item.type, 10)) {
                    case 1 :
                        cnt = me.renderImg(item, size);
                        break;
                    case 2 : 
                        cnt = me.renderFlash(item, size);
                        break;
                    case 3 : 
                        cnt = me.renderVideo(item, size);
                        break;
                    default :
                        break; 
                }
                html.push('<li data-url="' + item.url + '" data-w="' + item.width + '" data-h="' + item.height + '" class="' + ITEM_CLASS + '">' + cnt + '</li>');
            });
            this.list.html('<ul>' + html.join('') + '</ul>');
        },

        //是否要公开该方法？
        loadData: function(page, pagesize, type) {
            var me = this,
                params = {
                    page_size : pagesize || PAGE_SIZE,
                    page : (page || 0) + 1,
                    type : type || me.options.mtype || 1
                };
            
            me.showLoadingState();
            $.ajax(HISTORY_URL, {
                dataType : 'json',
                data : params,
                success : function (data) {
                    me.hideLoadingState();
                    $.responseParser(data, function (data) {
                        me.pager.minipager('option', 'total', Math.ceil(data.recordcount / PAGE_SIZE));
                        me.render(data);
                    }, function (data) {
                        //debug(data)
                    });
                }
            });
        },

        _setValue: function(v) {
            //选中列表某项
        }
    });
})(jQuery);(function($) {
    var TYPE_MAP = ['', 'tel', 'url'],
        GEN_URL = '/qr/create';
    $.widget('pandora.QrcodeGenerator', $.pandora.BaseUpload, {
        options: {
            value: {
                url : 'http://sinastorage.com/sandbox/qr/2497.png',
                width : 60,
                height : 60
            },    //二维码图片的链接
            type : 1
        },
        _create: function() {
            var me = this,
                options = this.options;

            $.pandora.BaseUpload.prototype._create.call(this);

            this.inputEl = $('<input type="text" class="ui-input" style="width:45%"/>').appendTo(this.element);

            this.buttonEl = $('<button>生成</button>').button()
                .appendTo(this.element)
                .click(function (e) {
                    me.generate(me.inputEl.val());
                });
        },

        _destroy : function () {
            this.inputEl.remove();
            this.buttonEl.unbind().remove();
        },

        generate: function(text) {
            var me = this,
                par = {};

            me.showLoadingState();

            $.ajax(GEN_URL, {
                data : {
                    text : this.options.type === 1 ? ('TEL:' + text) : text
                },
                dataType : 'json',
                type : 'POST',
                success : function (data) {
                    $.responseParser(data, function (data) {
                        pandora.tipBox.show('生成二维码成功。');
                        me._trigger('change', null, {
                            value : me.options.value = {
                                url : data.url,
                                width : data.width,
                                height : data.height
                            }
                        });
                        me.hideLoadingState();
                    });
                }
            });
        },

        _setValue: function(v) {
            this.options.value = this._formatValue(v);
        },

        _getValue: function() {
            return this.options.value;
        }
    });
})(jQuery);(function ($) {
    var BASE_CLASS = 'picture-editor',
        EDITING_STATE_CLASS = BASE_CLASS + '-editing',
        uid = 0;
    var SOURCE = [
        {
            'type': 'LocalUpload',
            'label': '本地',
            'options': {}
        },
        {
            'type': 'UrlUpload',
            'label': 'url',
            'options': {}
        },
        {
            'type': 'HistoryUpload',
            'label': '素材库',
            'options': {
                onactive : function () {
                    this.loadData();
                }
            }
        }
    ];
    $.widget('pandora.PictureEditor', $.pandora.BaseEditor, {
        _create : function () {
            var me = this,
                options = this.options,
                source = this.options.source || SOURCE;

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this.element.addClass(BASE_CLASS);

            this.editor = $('<input class="ui-input" type="text"/>')
                .val(options.value.url)
                .appendTo(this.element)
                .click($.proxy(this._showPanel, this));

            this.element.append($('<div class="' + BASE_CLASS + '-panel"><div class="editor-panel-arrow">\u25C6</div><div class="editor-panel-content"></div></div>'));

            this._setOption('disabled', options.disabled);
        },
        _setOption: function(k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);

            if(k == 'disabled') {
                this.editor.attr('disabled', v);
            }
        },

        _showPanel : function (e) {
            if (this.options.disabled) {
                return;
            }
            if (!this.isRenderTabs) {
                this.renderTabs(this.options.source || SOURCE);
                this.isRenderTabs = true;
            }
            $(e.target).attr('disabled', 'disabled');
            this.element.addClass(EDITING_STATE_CLASS);
        },
        _destroy : function () {
            this.element.removeClass(BASE_CLASS);
            if(this.isRenderTabs) {
                $('.editor', this.editor).unbind('editorupload');
            }
            this.editor.unbind('click', this._showPanel);
            $.pandora.BaseEditor.prototype._destroy.call(this);

        },
        _genTabsId : function () {
            return 'PictureEditorTabs' + (uid++);
        }, 
        renderTabs : function(tabs) {
            var tabsId = this._genTabsId(),
                me = this,
                ulEl = [],
                tabsEl = [],
                instance = {};

            $.each(tabs, function(i, item) {
                var tabId = tabsId + '-' + i;
                item.options.mtype = me.options.mtype;
                instance[tabId] = item;
                ulEl.push('<li><a href="#' + tabId + '">'+ item.label +'</a></li>');
                tabsEl.push('<div id="' + tabId + '"></div>');
            });

            $('.editor-panel-content', this.element).html('<div id="' + tabsId + '"><ul>' + ulEl.join('') + '</ul>' + tabsEl.join('') + '</div>');

            $('#' + tabsId).tabs({
                activate : function (e, ui) {
                    var  instance  = $(ui.newPanel).getInstance();
                    instance && instance.options.onactive && instance.options.onactive.call(instance);
                }
            });
            $.map(instance, function (item, key) {
                $('#' + key)[item.type](item.options).on({
                    editorupload : function (e, data) {
                        me.editor.val(data.value.url);
                        me._trigger('change', e, data);
                    }
                });
            });
        }
    });
})(jQuery);(function ($) {
    var BASE_CLASS = 'wbpost-editor';
    $.widget('pandora.WbpostEditor', $.pandora.BaseEditor, {
        _create : function () {
            var me = this,
                options = this.options;

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this.element.addClass(BASE_CLASS);

            this.editor = $('<input type="text" style="width:80px;"/>')
                .val(options.value.url)
                .appendTo(this.element);
            this.ok = $('<button>确定</button>')
                .appendTo(this.element)
                .button()
                .click($.proxy(this._getpostHandler, this));

            this.panel = $('<div class="' + BASE_CLASS + '-panel"></div>')
                .appendTo(this.element);
        },
        _getpostHandler : function (e) {
            var url = this.editor.val(),
                me = this;
            this._getPost(url, function (postId) {
                me._trigger('change', null, { 
                    value : me.options.value = {
                        id : postId,
                        url : url
                    }
                });
            });
        },
        _destroy : function () {
            this.element.removeClass(BASE_CLASS);
            this.ok.unbind('click', this._getpostHandler);
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },
        _getPost : function (url, cb) {
            var me = this;
            $.ajax('/wapi/getweibo', {
                data : {
                    url : url
                },
                dataType : 'script',
                success : function () {
                    $.responseParser(getweibo, function (data) {
                        var html = data.text;
                        data.thumbnail_pic && (html += '<br><img src="' + data.thumbnail_pic + '" />');
                        me.panel.html([
                            '<div class="editor-panel-arrow">\u25C6</div>',
                            '<div class="editor-panel-content">',
                                '<div class="' + BASE_CLASS + '-panel-inner">',
                                    html,
                                '</div>',
                            '</div>'
                        ].join('')).show();
                        cb && cb(data.id);
                    }, function () {
                        alert('获取微博文章失败');
                    });
                }
            });
        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.InsertEditor', $.pandora.TextEditor, {
        options : {
            value : '',
            btnText : '插入昵称',
            insertContent : ' ${nick} '
        },
        _create : function () {
            var me = this,
                options = this.options;

            $.pandora.TextEditor.prototype._create.call(this, this.options);
            this.textarea = this.element.addClass('insert-editor').find('textarea');
            this.insertBtn = $('<button>')
                .html(options.btnText)
                .appendTo($('<div style="text-align:right;">').appendTo(this.element))
                .button()
                .click($.proxy(this._insert, this));
        },
        _insert : function (e) {
            this.textarea.insertAtCaret(this.options.insertContent).keyup();
        },
        _destroy : function () {
            this.element.removeClass('insert-editor');
            this.insertBtn.off('click', this._insert);
            $.pandora.TextEditor.prototype._destroy.call(this);
        }
    });
})(jQuery);(function ($) {
    var BASE_CLASS = 'login',
        DIALOG_CLASS = BASE_CLASS + '-dialog',
        INFO_CLASS = BASE_CLASS + '-info';


    $.widget('pandora.LoginBox', {
        _create : function () {
            var me = this,
                options = this.options;

            this.needPin = false;

            this.element
                .data('widgetName', this.widgetFullName)
                .addClass(BASE_CLASS);
            this.infobar = $('<div>')
                .addClass(INFO_CLASS)
                .html('正在检查登录...')
                .appendTo(this.element);

            this.dialog = $('<div>')
                .addClass(DIALOG_CLASS)
                .html([
                    '<form action="#" method="post">',
                        '<table>',
                            '<tr><th>用户名：</th><td><input class="ui-input username-input" type="text" style="width:120px;"/></td></tr>',
                            '<tr><th>密码：</th><td><input class="ui-input pwd-input" type="password" style="width:120px;"/></td></tr>',
                            '<tr class="pin-block" style="display:none;">',
                                '<th>验证码：</th>',
                                '<td><input class="ui-input pin-input" type="text" style="float:left;width:50px"/><span class="pin-pic" style="margin-left:5px;"></span></td>',
                            '</tr>',
                        '</table>',
                        '<input style="position:absolute;top:-1000px" type="submit" value="登录"/>',
                    '</form>'
                ].join(''))
                .appendTo($('body'))
                .dialog({
                    title : '用户登录',
                    autoOpen : false,
                    modal : true,
                    resizable : false,
                    buttons : [
                        { 
                            'text' : '登录',
                            'click' : function () {
                                me.form.submit();
                            },
                            'class' : 'ui-state-em'
                        },
                        {
                            'text' : '重置',
                            'click' : function () {
                                me.form[0].reset();
                            }
                        }
                    ]
                });

            this.form = $('form', this.dialog)
                .submit(function (e) {
                    e.preventDefault();
                    me._login();
                });

            this.usernameInput = $('.username-input', this.dialog);
            this.pwdInput = $('.pwd-input', this.dialog);
            this.pinInput = $('.pin-input', this.dialog);
            this.pinPic = $('.pin-pic', this.dialog)
                .click(function () {
                    me._pinCode(1);
                });

            this._on(this.element, {
                'click .login-btn' : function () {
                    me.open();
                },
                'click .logout-btn' : function () {
                    me.logout();
                }
            });

            this.checkSSO(this.autoLogin);
        },
        _destroy : function () {
            this.pinPic.unbind().remove();
        },
        _info : function (msg) {
            this.element.html(msg);
        },
        _reset : function () {
            var username = $.cookie('adboxuser');
            this.usernameInput.val(username || '');
            this.pwdInput.val('');
            this.pinInput.val('');
            this._pinCode(false);
        },
        _pinCode : function (b) {
            var pinBlock = $('.pin-block', this.dialog);
            this.needPin = b;
            if (b) {
                this.pinPic.html('<img src="' + sinaSSOController.getPinCodeUrl() + '" alt="点击换一个">');
                this.pinInput.val();
                pinBlock.show();
            } else {
                sinaSSOController.loginExtraQuery['door'] = '';
                pinBlock.hide();
            }
        },
        _submit : function () {
            this.form.submit();
        },
        _login : function () {
            var nv = this.usernameInput.val(),
                pv = this.pwdInput.val(),
                pinv = this.pinInput.val();

            this._info('正在登录...');

            if (!nv) {
                pandora.tipBox.show('请填写用户名', 2);
                this._setNoLogin();
                return;
            }
            if (!pv) {
                pandora.tipBox.show('请填写密码', 2);
                this._setNoLogin();
                return;
            }
            if (this.needPin) {
                if (!pinv) {
                    pandora.tipBox.show('请填写验证码', 2);
                    this._setNoLogin();
                    return;
                } else {
                    sinaSSOController.loginExtraQuery['door'] = pinv;
                }
            }
            sinaSSOController.login(nv, pv);
            $.cookie('adboxuser', nv);
        },
        _setLogin : function (user) {
            this._info('你好，<a href="http://adbox.sina.com.cn/#/mycreative/add">' + user.nick + '</a> | <a href="#" class="logout-btn">退出</a>');
        },
        _setNoLogin : function() {
            this._info('<a href="#" class="login-btn">登录</a> | <a href="http://sina.com" target="_blank">注册</a>');
        },
        checkSSO : function (cb) {
            var me = this;
            if ('undefined' === typeof sinaSSOController) {
                $.getScript('http://i.sso.sina.com.cn/js/ssologin.js', function () {
                    (function() {
                        this.entry = 'adbox'; // 本产品的标识 
                        this.setDomain = false;
                        this.customLoginCallBack = function(status) { // 登录回调代码 
                            ////debug(status);
                            if (status && status.result) {
                                me._setLogin(status.userinfo);
                                me.dialog.dialog('close');
                            } else {
                                ////debug(status);
                                me._setNoLogin();
                                if (status.errno == "4049") {
                                    pandora.tipBox.show(status.reason, 1);
                                    me._pinCode(1);
                                } else {
                                    if (status.errno == "2070") {
                                        me._pinCode(1);
                                    }
                                    pandora.tipBox.show(status.reason || "登录失败，请重试", 2);
                                }
                            }
                        };
                        this.customLogoutCallBack = function(status) {

                            if (status && status.result) {
                                me._setNoLogin();
                            } else {
                            }
                        };
                    }).call(sinaSSOController);

                    cb.call(me);
                });
            } else {
                cb.call(me);
            }
        },
        logout : function () {
            this._info('正在退出...');
            sinaSSOController.logout();
        },
        autoLogin : function () {
            var me = this;
            this._info('正在检查登录状态...');
            sinaSSOController.autoLogin(function(status) {
                if (status == null) {
                    me._setNoLogin();
                } else {
                    ////debug(status);
                    me._setLogin(status);
                }
            });
        },
        open : function () {
            this._reset();
            this.dialog.dialog('open');
        }
    });
})(jQuery);/**
 * 舞台
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 *
 * params ===========
 * tolerance //判断选中方法
 *
 *
 * zIndx ===========
 *
 * canvas : 1
 * com : 10 -  1022  //最多允许1000个com
 * group : 1024 - 2046,
 * stage-helper : 2047
 * maker界面 ： 1024+
 */


(function ($) {
    var OBJ_FILTER = 'stage-obj',
        SELECTED_FILTER = OBJ_FILTER + '-selected',
        HOVER_FILTER = OBJ_FILTER + '-hover',

        COM_FILTER = 'stage-com',
        GROUP_FILTER = 'stage-group',

        uid = 1,
        ZINDEX = 1,
        comid = 0,
        groupid = 0, //组合groupid

        BASE_INDEX = 10, //com元件的起始index
        CANVAS_INDEX = 1,
        SELECT_HELPER_INDEX = 2047;

    $.widget('pandora.Stage', $.ui.mouse, {
        options : {
            canvasWidth : 360,
            canvasHeight : 250,
            canvasBgcolor : '#fff',
            canvasBordercolor : '#000',
            canvasBorder : 0,
            tolerance : 'touch',
            distance : 20
        },
        _create: function () {
            var me = this,
                options = this.options;

            options.width = options.width || this.element.parent().width();
            options.height = options.height || this.element.parent().height();

            this.widgetEventPrefix = 'stage';
            this.element
                .data('widgetName', this.widgetFullName)
                .addClass("stage")
                .css({
                    width : options.width,
                    height : options.height
                })
                .disableSelection();

            this._mouseInit();

            this.helper = $('<div class="stage-helper"></div>').css('z-index', SELECT_HELPER_INDEX);
            this.canvas = $('<div class="stage-canvas">')
                .css({'background-color' : options.canvasBgcolor, 'position' : 'absolute', 'z-index' : CANVAS_INDEX})
                .appendTo(this.element);


            this.editor = $('<div class="stage-canvas-editor">')
                .css('position', 'absolute')
                .appendTo(this.canvas);

            this.preview = $('<iframe scrolling="no" frameborder="0" class="stage-canvas-preview" id="' + options.previewId + '" name="' + options.previewId + '" src="about:blank" style="border:none;"></iframe>').css('position', 'absolute').appendTo(this.canvas);

            this._renderCanvasSize();
            this.centerCanvas();

            //$(window).resize($.proxy(this.centerCanvas, this));
            $(document).keydown($.proxy(this._doKey, this));

            this._on({
                'click' : function (e) {
                    //补丁。。mouseInit引起的blur不起作用
                    $('textarea', this.editor).blur();
                    this.unselectAll();
                    this._trigger('unselect', null);
                }
            });

            this._on(this.editor, function () {
                var h = {};
                h['click .' + OBJ_FILTER] = function (e) {
                    var item = e.currentTarget,
                        $item = $(item);
                    if ($item.hasClass(SELECTED_FILTER) && (e.ctrlKey || e.shiftKey)) {
                        this.unselect(item);
                        this._trigger('unselectone', e, { uid : $item.attr('id')});
                    } else {
                        this._select(item, e, e.ctrlKey || e.shiftKey);
                    }
                    e.stopPropagation();
                    e.preventDefault();
                };
                h['mouseenter .' + OBJ_FILTER] = function (e) {
                    $(e.currentTarget).addClass(HOVER_FILTER);
                };
                h['mouseleave .' + OBJ_FILTER] = function (e) {
                    $(e.currentTarget).removeClass(HOVER_FILTER);
                };
                h['objdragstart .' + OBJ_FILTER] = function (e, ui) {
                    var objs = this.dragObjs = [];

                    !$(e.currentTarget).hasClass(SELECTED_FILTER) && this._select(e.currentTarget, e);

                    /* 记录拖拽需要初始化的原始位置 */
                    this._getSelected().each(function (i, item){
                        var $item = $(item);
                        if (item !== e.currentTarget) {
                            objs.push(item);
                            $item.data({
                                'dragOLeft' : parseInt($item.css('left'), 10),
                                'dragOTop' : parseInt($item.css('top'), 10)
                            });
                        }
                    });
                };
                h['objdragging .' + OBJ_FILTER] = function (e, ui) {
                    var objs = this.dragObjs;
                    /* 其他选中元素跟随拖拽 */
                    objs && $.each(objs, function (i, item) {
                        var $item = $(item);
                        $item.getInstance().setPos(ui.offsetX + $item.data('dragOLeft'), ui.offsetY + $item.data('dragOTop'));
                    });
                    /* end */
                    this._trigger('objdragging', e, ui);
                };

                h['objdragend .' + OBJ_FILTER] = function (e, ui) {
                    var objs = this.dragObjs,
                        p = {};
                    /* 其他选中元素跟随拖拽 */
                    objs && $.each(objs, function (i, item) {
                        var $item = $(item),
                            instance = $item.getInstance(),
                            x = ui.offsetX + $item.data('dragOLeft'),
                            y = ui.offsetY + $item.data('dragOTop');
                        instance.setValue({
                            'x' : x,
                            'y' : y
                        });

                        p[$item.attr('id')] = {
                            'x' : x,
                            'y' : y
                        };
                    });
                    /* end */
                    p[e.target.id] = {
                        x : ui.x,
                        y : ui.y
                    };
                    this._trigger('change', e, p);

                    this.dragObjs = [];
                };

                h['objresizing.' + OBJ_FILTER] = function (e, ui) {
                    this._trigger('objresizing', e, ui);
                };

                h['objresizend.' + OBJ_FILTER] = function (e, ui) {
                    var p = {};
                    p[e.target.id] = {
                        w : ui.w,
                        h : ui.h,
                        x : ui.x,
                        y : ui.y
                    };
                    this._trigger('change', e, p);
                };
                return h;
            }());
        },
        _doKey : function (e) {
            var me = this,
                k,
                prop = {},
                selecteds = this._getSelected(),
                instance,
                value;
            switch (e.which) {
                case $.ui.keyCode.UP : k = 'y'; prop.y = -1; break;
                case $.ui.keyCode.DOWN : k = 'y'; prop.y = 1; break;
                case $.ui.keyCode.LEFT : k = 'x'; prop.x = -1; break;
                case $.ui.keyCode.RIGHT : k = 'x'; prop.x = 1; break;
                default : break;
            }

            k && $.each(selecteds, function (i, item) {
                instance = $(item).getInstance(),
                value = instance.getValue().options;
                instance.setValue(k, prop[k] + value[k]);
                me._trigger('objdragging', e, instance.getValue().options);
            });
            me = null;
        },
        _renderCanvasSize : function () {
            this.canvas.css({
                width : this.options.canvasWidth,
                height : this.options.canvasHeight
            });
            this.editor.css({
                width : this.options.canvasWidth,
                height : this.options.canvasHeight
            });
            this.preview.css({
                width : this.options.canvasWidth,
                height : this.options.canvasHeight
            });
        },

        _destroy: function() {
            $(document).off('keydown', this._doKey);
            $(window).off('resize', this.centerCanvas);
            this._mouseDestroy();
        },

        _mouseStart : function (e) {
            var options = this.options;

            if(options.disabled) { return; }

            this.opos = [e.pageX, e.pageY];
            $('body').append(this.helper);

            this.selectees = this._getObjs();
            this._cache(this.selectees);

            (!e.ctrlKey || !e.shiftKey) && this.unselectAll();

            this.helper.css({
                "left": e.clientX,
                "top": e.clientY,
                "width": 0,
                "height": 0
            });
        },
        _mouseDrag : function (e) {
            var me = this,
                options = this.options;

            if(options.disabled) { return; }

            this.dragged = true;

            var x1 = this.opos[0], y1 = this.opos[1], x2 = e.pageX, y2 = e.pageY;
            if (x1 > x2) {
                var tmp = x2; x2 = x1; x1 = tmp;
            }
            if (y1 > y2) {
                var tmp = y2; y2 = y1; y1 = tmp;
            }
            this.helper.css({
                left : x1,
                top : y1,
                width : x2 - x1,
                height : y2 - y1
            });

            this.selectees.each(function() {
                var selectee = $.data(this, "selectable-item"),
                    hit = false;

                if (!selectee || selectee.element == me.element[0]) return;

                if (options.tolerance == 'touch') {
                    hit = (!(selectee.left > x2 || selectee.right < x1 || selectee.top > y2 || selectee.bottom < y1));
                } else if (options.tolerance == 'fit') {
                    hit = (selectee.left > x1 && selectee.right < x2 && selectee.top > y1 && selectee.bottom < y2);
                }

                hit && (!selectee.$element.hasClass('obj-disabled')) && selectee.$element.addClass(SELECTED_FILTER);
            });

            return false;
        },
        _mouseStop : function (e) {
            var me = this,
                options = this.options;

            if(options.disabled) { return; }

            this.dragged = false;

            this.helper.remove();
            var props = this._getSelectedProp();
            if (!$.isEmptyObject(props)) {
                this._trigger("mutiselect", e, props);
            }

            return false;
        },

        _cache : function(selectees) {
            selectees.each(function() {
                var $this = $(this);
                var pos = $this.offset();
                $.data(this, "selectable-item", {
                    element: this,
                    $element: $this,
                    left: pos.left,
                    top: pos.top,
                    right: pos.left + $this.outerWidth(),
                    bottom: pos.top + $this.outerHeight()
                });
            });
        },

        _select : function (el, e, muti) {
            if (!$(el).hasClass(SELECTED_FILTER)) {
                if (!muti) {
                    this.unselectAll();
                    this._trigger('select', e, this.select(el));
                } else {
                    this.select(el);
                    this._trigger("mutiselect", e, this._getSelectedProp());
                }
            }
        },

        _getObjs : function () {
            return $('>.' + OBJ_FILTER, this.editor);
        },

        _getSelected : function () {
            return $('>.' + SELECTED_FILTER, this.editor);
        },

        _getSelectedProp : function () {
            var r = {},
                instance;
            this._getSelected().each(function (i, item) {
                instance = $(item).getInstance();
                r[item.id] = instance.getProp();
            });
            return r;
        },

        _genId : function () {
            return OBJ_FILTER + (uid++) + (+new Date());
        },
        _genTag : function (type) {
            return (type === 'Group' ? ('组合' + (groupid++)) : ('元件' + (comid++)));
        },

        _addCom : function (type, options, uid) {
            var type = type || 'ObjBase',
                options = options || {},
                _options = {},
                uid = uid || this._genId(),
                tag = this._genTag(type);
            $.extend(_options, options);
            _options.tag = options.tag = tag;
            _options.z = options.z = (options.z || BASE_INDEX + (ZINDEX++));
            _options.container = this.element;
            $('<div id="' + uid + '" data-tag="' + tag + '">').addClass(OBJ_FILTER).appendTo(this.editor)[type](_options);
            return {
                uid : uid,
                type : type,
                options : options
            };
        },
        _addGroup : function (options, uid) {
            //先设好分散后的x, y
            $.map(options.coms, function (atom, atomid) {
                atom.options.x += options.x;
                atom.options.y += options.y;
            });
            var group = this.group([{
                uid : uid,
                objs : this.add(options.coms),
                options : options
            }]);
            return group[0];
        },

        /**
         * ======================================================
         */
        resetCanvasSize : function (w, h) {
            this.options.canvasWidth = w;
            this.options.canvasHeight = h;
            this._renderCanvasSize();
            this.centerCanvas();
        },

        resetCanvasBgcolor : function (color) {
            color = color || this.options.canvasBgcolor || 'transparent';
            this.options.canvasBgcolor = color;
            this.editor.css({
                backgroundColor : color
            });
        },

        resetCanvasBorder : function (b, color) {
            b = parseInt(b, 10) || 0;
            color = color || this.options.canvasBordercolor || 'transparent';
            this.options.canvasBordercolor = color;
            this.options.canvasBorder = b;
            this.editor.css({
                borderWidth : b,
                borderStyle : 'solid',
                borderColor : color
            });
        },

        resize : function (w, h) {
            this.options.width = w;
            this.options.height = h;
            this.element.css({
                'width' : w,
                'height' : h
            });
            this.centerCanvas();
        },

        centerCanvas : function () {
            var options = this.options;
            this.canvas.css({
                left : (options.width - options.canvasWidth) / 2,
                top : (options.height - options.canvasHeight) / 2
            });
        },

        togglePreview : function ()  {
            $('body').toggleClass('preview');
            this.element.toggleClass('stage-preview');
        },
        resetPreview : function () {
            this.preview.attr('src', 'about:blank');
        },

        toggleTag : function () {
            $('body').toggleClass('stage-hide-tag');
        },

        reIndex : function (order) {
            var values = {};
            $.each(order, function (i, uid) {
                values[uid] = {z : BASE_INDEX + i};
            });
            this.changeValue(values);
            return values;
        },

        /**
         * 添加
         */
        remove : function (objs) {
            var me = this,
                p = [],
                value,
                instance,
                $obj;
            $.each(objs, function (i, obj) {
                $obj = $('#' + obj.uid);
                instance = $obj.getInstance();
                value = instance.getValue();
                value.uid = obj.uid;
                p.push(value);
                if ($.pandora.Group.isGroup(obj)) {
                    me.remove(instance.unconnect);
                }
                $obj.remove();
            });
            return p;
        },

        removeSelected : function () {
            var selecteds = this._getSelected(),
                objs = [];
            $.each(selecteds, function (i, selected) {
                objs.push({uid : selected.id});
            });
            return this.remove(objs);
        },


        //atoms = {uid : id, type : type}
        group : function (objs) {
            var me = this,
                r = [],
                uid,
                tag,
                group,
                atoms;
            $.each(objs, function (i, obj) {
                atoms = obj.objs;
                uid = obj.uid || me._genId();
                tag = me._genTag('Group'),
                options = $.extend(obj.options || {}, {
                    tag : tag,
                    z : BASE_INDEX + (ZINDEX++)
                });
                options.container = me.element;
                group = $('<div id="' + uid + '" data-tag="' + tag + '">')
                    .addClass(OBJ_FILTER)
                    .appendTo(me.editor)
                    .Group(options);

                $.each(atoms, function (i, atom) {
                    var $atom = $('#' + atom.uid);
                    me.unselect($atom[0]);
                    $atom.removeClass(HOVER_FILTER);
                });

                group.getInstance().connect(atoms);
                r.push({
                    uid : uid,
                    type : 'Group',
                    objs : atoms,
                    options : options
                });
            });

            return r;
        },
        /**
         * 组合选中的元件
         */
        groupSelected : function () {
            var me = this,
                selecteds = this._getSelected(),
                instance,
                atoms = [],
                r = [];

            if (selecteds.length >= 2) {
                $.each(selecteds, function (i, select) {
                    instance = $(select).getInstance();
                    atoms.push({
                        uid : select.id,
                        type : instance.widgetName,
                        options : instance.getValue().options
                    });
                });
                //生成组容器并连接已选项
                r = this.group([{
                    objs : atoms
                }]);
            }
            return r;
        },
        /**
         * 取消组合
         */
        ungroup : function (objs) {
            var me = this,
                atoms,
                r = [],
                $item;
            $.each(objs, function(i, obj) {
                $item = $('#' + obj.uid);
                if ($.pandora.Group.isGroup($item)) {
                    //取消链接,选中被取消的连接的对象，并删除组元素
                    atoms = $item.getInstance().unconnect();
                    $item.remove();
                    groupid--;
                    r.push({
                        uid : obj.uid,
                        objs : atoms
                    });
                }
            });
            return r;
        },

        ungroupSelected : function () {
            var me = this,
                r = [],
                objs = [],
                selecteds = this._getSelected();

            $.each(selecteds, function (i, selected) {
                if($.pandora.Group.isGroup(selected)) {
                    var instance = $(selected).getInstance();
                    objs.push({
                        uid : selected.id,
                        type : instance.widgetName
                    });
                }
            });
            return me.ungroup(objs);
        },

        //全选
        selectAll : function () {
            var me = this;
            this._getObjs().each(function (i, item) {
                me.select(item);
            });
            return this._getSelectedProp();
        },

        unselectAll : function () {
            var me = this;
            this._getSelected().each(function (i, item) {
                me.unselect(item);
            });
        },

        select : function (item) {
            var r = {},
                $item = $(item);
            $item.addClass(SELECTED_FILTER);
            r[$item.attr('id')] = $item.getInstance().getProp();
            return r;
        },

        unselect : function (item) {
            $(item).removeClass(SELECTED_FILTER);
        },

        changeValue : function (values) {
            var me = this,
                instance;
            
            $.map(values, function (value, uid) {
                instance = $('#' + uid).getInstance();
                if (instance) {
                    instance.setValue(value);
                }
                //微博控件全部刷新
                if (instance.widgetName.indexOf('Wb') === 0 && value.nick) {
                    $('.com-wbcom', me.element).each(function (i, item) {
                        $(item).getInstance().setValue({nick : value.nick});
                    });
                }
            });
        },

        add : function (values) {
            var me = this,
                objs = [],
                arrayValues = [],
                obj;

            //add(type [, options, uid])
            if (arguments.length > 1) {
                values = {
                    type : arguments[0],
                    options : arguments[1] || {},
                    uid : arguments[2] || null
                };
            }

            //add({uid : {type : xxx, options : xxx}})
            if (('object' === typeof values) && !$.isArray(values) && !values.type) {
                $.map(values, function (value, uid) {
                    value.uid = uid;
                    arrayValues.push(value);
                });
            //add('xxxx') || add({type : xxx, options : xxx})
            } else if (!$.isArray(values)) {
                arrayValues = [values];
            } else {
                arrayValues = values;
            }


            //add(['xxxxx', 'xxxxxx']) || add([{type : xxx, options: xxx}])
            $.each(arrayValues, function (i, value) {
                if ('string' === typeof value) {
                    value = {type : value};
                }
                if (value.type === 'Group') {
                    obj = me._addGroup(value.options, value.uid);
                } else {
                    obj = me._addCom(value.type, value.options, value.uid);
                }
                objs.push(obj);
            });
            return objs;
        },

        //for copy
        getSelectedValue : function () {
            var r = [];
            this._getSelected().each(function (i, obj) {
                var v = $(obj).getInstance().getValue();
                v.uid = obj.id;
                r.push(v);
            });
            return r;
        },

        setValue : function (values) {
            this.add(values);
        },
        getValue : function () {
            var r = [],
                wb = 0;
            this._getObjs().each(function (i, obj) {
                var v = $(obj).getInstance().getValue();
                v.uid = obj.id;
                if (v.type.indexOf('Wb') === 0) {
                    wb = v.options.nick;
                }
                r.push(v);
            });
            return {
                wb : wb,
                width : this.options.canvasWidth,
                height : this.options.canvasHeight,
                bgcolor : this.options.canvasBgcolor,
                border : this.options.canvasBorder ? '1|1|1|1' : '',
                borderColor : this.options.canvasBordercolor,
                objs : r
            };
        }
    });
})(jQuery);(function ($) {
    var BASE_INDEX = 3000;
    $.widget('pandora.Sidebar', {
        _create : function () {
            var me = this,
                options = this.options;


            options.height = options.height || this.sidebar.parent().height;

            this.widgetEventPrefix = 'sidebar';

            this.isShow = 1;

            this.element.data('widgetName', this.widgetFullName).addClass('sidebar-content');

            this.sidebar = $('<div/>')
                .addClass('sidebar')
                .css({
                    'z-index' : BASE_INDEX,
                    'height' : options.height
                })
                .appendTo(this.element.parent())
                .disableSelection();

            this.toggleBtn = $('<div class="toolpanel-toggle-split" />')
                .appendTo(this.sidebar)
                .html('<div class="toolpanel-toggle-button"><div class="toolpanel-right-arrow">\u25C6</div></div><div class="toolpanel-toggle-button-mask"></div>');

            this.view = this.element
                .css('width', options.width)
                .appendTo(this.sidebar)
                .appendTo(this.sidebar);


            //以下会造成ie下button抖动
            //this._hoverable(this.toggleBtn);

            //$(window).resize($.proxy(this._resizeHandler, this));


            this.toggleBtn.click($.proxy(this._toggleHandler, this));
        },
        _resizeHandler : function () {
            this.resize(this.sidebar.parent().height());
        },
        resize : function (h) {
            this.sidebar.height(this.options.height = h);
        },
        _toggleHandler : function (e) {
            //this.view.toggle();
            this.element.parent().toggleClass('sidebar-close');
        },
        _destroy : function () {
            this.element.removeClass().removeData();
            this.toggleBtn.unbind('click', this._toggleHandler);
        }
    });
})(jQuery);(function ($) {
    var EDITOR_CLASS = 'prop-editor-item';

    $.widget('pandora.PropPanel', $.ui.Panel, {
        options : {
            props : []
        },
        _create : function () {
            var options = this.options;

            $.extend(options, {
                title : '属性',
                width : 300,
                hide : true,
                miniButton : true
            });

            $.ui.Panel.prototype._create.call(this, options);

            this.widgetEventPrefix = 'proppanel';
            this.element.addClass('prop-panel').data('widgetName', this.widgetFullName);

            this._on(this.element, function () {
                var h = {};
                h['editorchange .' + EDITOR_CLASS] = function (e, data) {
                    var $el = $(e.currentTarget),
                        uid = $el.attr('data-uid'),
                        key = $el.attr('data-pn');
                    var p = {};
                    p[uid] = {};
                    p[uid][key] = data;
                    this._trigger('change', e, p);
                };
                return h;
            }());

            this.element.keydown(function (e) {
                e.stopPropagation();
            });
        },
        _genId : function (comId, k) {
            return comId + k;
        },
        _genBlockId : function (uid) {
            return uid + 'PropBlock';
        },
        //=================================
        fill : function (values) {
            var me = this,
                html = [],
                row;

            this.clear();

            this.show();

            $.map(values, function (value, uid) {
                row = [];
                for(var k in value) {
                    if (value[k].type && value[k].level !== 'base') {
                        var id = me._genId(uid, k);
                        me.curdata['#' + id] = {
                            type : $.upperCaseFirst(value[k].type) + 'Editor',
                            value : value[k]
                        };
                        row.push('<tr><th><nobr>' + value[k].label + '</nobr></th><td class="prop-block-td"><div id="' + id + '" class="' + EDITOR_CLASS + '" data-uid="' + uid + '" data-pn="' + k + '"></div>' + (value[k].tips ? '<div class="prop-tips">' + value[k].tips + '</div>' : '') + '</td></tr>');
                    }
                }
                html.push('<div id="' + me._genBlockId(uid) + '" class="prop-block"><table>' + row.join('') + '</table></div>');
            });
            this.body.html(html.join(''));

            $.map(me.curdata, function (value, uid) {
                $(uid)[value.type](value.value);
            });

        },
        changeValue : function (values) {
            var instance,
                me = this;
            $.map(values, function (value, uid) {
                for (var k in value) {
                    instance = $('#' + me._genId(uid, k), me.body).getInstance();
                    instance && instance.setValue(value[k]);
                }
            });
        },
        clear : function () {
            if (this.curdata) {
                for (var k in this.curdata) {
                    delete this.curdata[k];
                }
            }
            $('*', this.body).remove();
            this.curdata = {};
            this.hide();
        }
    });
})(jQuery);(function ($) {
    $.widget('pandora.ToolPanel', {
        _create : function () {
            var options = this.options;

            options.height = options.height || this.element.parent().height();

            this.widgetEventPrefix = 'toolpanel';

            this.element
                .data('widgetName', this.widgetFullName)
                .append($('<div class="ui-widget-header">元件列表</div>'))
                .css('height', options.height);

            this.view = $('<div>')
                .appendTo(this.element)
                .html([
                    '<h3>普通元件<i class="icon-small icon-arrow-down"></i></h3>',
                    '<ul>',
                        '<li data-tip="矩形" data-type="Retangle"><a href="#"><i class="icon-big icon-big-retangle"></i><br>矩形</a></li>',
                        '<li data-tip="文字" data-type="Txt"><a href="#"><i class="icon-big icon-big-text"></i><br>文字</a></li>',
                        '<li data-tip="按钮" data-type="Btn"><a href="#"><i class="icon-big icon-big-button"></i><br>按钮</a></li>',
                        '<li data-tip="图片" data-type="Img"><a href="#"><i class="icon-big icon-big-image"></i></i><br>图片</a></li>',
                        '<li data-tip="二维码" data-type="Qrcode"><a href="#"><i class="icon-big icon-big-qrcode"></i></i><br>二维码</a></li>',
                        '<li data-tip="视频" data-type="Video"><a href="#"><i class="icon-big icon-big-video"></i></i><br>视频</a></li>',
                        '<li data-tip="动画" data-type="Fla"><a href="#"><i class="icon-big icon-big-fla"></i></i><br>flash</a></li>',
                    '</ul>',
                    '<h3>微博元件<i class="icon-small icon-arrow-down"></i></h3>',
                    '<ul>',
                        '<li data-tip="加关注" data-type="Wbfocus"><a href="#"><i class="icon-big icon-big-wbfocus"></i><br>加关注</a></li>',        
                        '<li data-tip="微博头像" data-type="Wbavatar"><a href="#"><i class="icon-big icon-big-wbavatar"></i><br>微博头像</li>',
                        '<li data-tip="微博昵称" data-type="Wbnick"><a href="#"><i class="icon-big icon-big-wbnick"></i><br>微博昵称</a></a></li>',
                        '<li data-tip="微博关系" data-type="Wbrelation"><a href="#"><i class="icon-big icon-big-wbrelation"></i><br>微博关系</a></li>',
                        '<li data-tip="转发" data-type="Wbrepos"><a href="#"><i class="icon-big icon-big-wbrepos"></i><br>转发</a></li>',
                        '<li data-tip="分享" data-type="Wbshare"><a href="#"><i class="icon-big icon-big-wbshare"></i><br>分享</a></li>',
                        '<li data-tip="用户昵称" data-type="Usernick"><a href="#"><i class="icon-big icon-big-usernick"></i><br>用户昵称</a></li>',
                        '<li data-tip="用户头像" data-type="Useravatar"><a href="#"><i class="icon-big icon-big-useravatar"></i><br>用户头像</a></li>',
                    '</ul>',
                    '<h3>轮播元件<i class="icon-small icon-arrow-down"></i></h3>',
                    '<ul>',
                        '<li data-tip="轮播" data-type="Imgslider"><a href="#"><i class="icon-big icon-big-slider"></i></i><br>图片</a></li>',
                        '<li data-tip="轮播" data-type="Tabslider"><a href="#"><i class="icon-big icon-big-tabslider"></i></i><br>页签</a></li>',
                    '</ul>',
                    '<h3>表单元件<i class="icon-small icon-arrow-down"></i></h3>',
                    '<ul>',
                        '<li data-tip="输入框" data-type="Input"><a href="#"><i class="icon-big icon-big-input"></i><br>输入框</a></li>',
                        '<li data-tip="单选框" data-type="Radio"><a href="#"><i class="icon-big icon-big-radio"></i><br>单选框</a></li>',
                        '<li data-tip="复选框" data-type="Checkbox"><a href="#"><i class="icon-big icon-big-checkbox"></i><br>复选框</a></li>',
                        '<li data-tip="单选菜单" data-type="Select"><a href="#"><i class="icon-big icon-big-select"></i><br>单选菜单</a></li>',
                        '<li data-tip="地域" data-type="Region"><a href="#"><i class="icon-big icon-big-region"></i><br>地域</a></li>',
                    '</ul>'
                ].join(''))
                .accordion({
                    heightStyle: "fill",
                    animate : false
                });

            this._on(this.view, {
                'click li' : function (e) {
                    this._trigger('select', null, $(e.currentTarget).attr('data-type'));
                }
            });
        },
        _destroy : function () {
            this.element.removeClass('toolpanel').removeData();
        },
        resize : function (h) {
            this.options.height = h;
            this.element.css('height', h);
            this.view.accordion('refresh');
        }
    });
})(jQuery);/**
 * 元件面板
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
(function ($) {
    var ITEM_FILTER = 'obj-panel-item',
        HEADER_HEIGHT = 30;
        ITEM_SELECTED_FILTER = ITEM_FILTER + '-selected',
        ICON_MAP = {
            'Com' : 'icon-star-empty',
            'Txt' : 'icon-text',
            'Img' : 'icon-image',
            'Btn' : 'icon-button',
            'Imgslider' : 'icon-slider',
            'Tabslider' : 'icon-tabslider',
            'Formlist' : 'icon-form',
            'Input' : 'icon-input',
            'Radio' : 'icon-radio',
            'Checkbox' : 'icon-checkbox',
            'Select' : 'icon-select',
            'Region' : 'icon-region',
            'Wbnick' : 'icon-wbnick',
            'Wbavatar' : 'icon-wbavatar',
            'Wbfocus' : 'icon-wbfocus',
            'Wbrelation' : 'icon-wbrelation',
            'Group' : 'icon-group',
            'Wbrepos' : 'icon-wbrepos',
            'Video' : 'icon-video',
            'Fla' : 'icon-flash',
            'Qrcode' : 'icon-qrcode',
            'Retangle' : 'icon-retangle',
            'Useravatar' : 'icon-useravatar',
            'Usernick' : 'icon-usernick',
            'Wbshare' : 'icon-wbshare'
        };

    $.widget('pandora.ObjPanel', {
        _create : function () {
            var options = this.options;

            this.widgetEventPrefix = 'objpanel';

            this.element
                .data('widgetName', this.widgetFullName)
                .addClass('obj-panel')
                .css('height', options.height)
                .append($('<div class="ui-widget-header">元件顺序</div>'));

            this.body = $('<div class="obj-panel-body">')
                .css('height', options.height - HEADER_HEIGHT)
                .appendTo(this.element)
                .sortable({
                    placeholder: "ui-state-highlight",
                    axis : 'y',
                    stop : $.proxy(this._sortHandler, this)
                });

            this._on(function () {
                var h = {};
                h['click .' + ITEM_FILTER] = function (e) {
                    !$(e.currentTarget).hasClass(ITEM_SELECTED_FILTER) && this._select(e.currentTarget, e);
                    e.stopPropagation();
                };
                h['hover .' + ITEM_FILTER] = function (e) {
                    $(e.currentTarget).toggleClass('ui-state-hover');
                };
                h['click'] = function (e) {
                    e.stopPropagation();
                };
                return h;
            }());
        },
        resize : function (h) {
            this.element.css('height', h);
            this.body.css('height', h - HEADER_HEIGHT);
        },
        _destroy : function () {
            this.element.removeClass('obj-panel').removeData();
        },
        _sortHandler : function (e, ui) {
            var r = [];
            $('.' + ITEM_FILTER, this.element).each(function (i, item) {
                r.push(item.id.replace('ObjItem', ''));
            });
            this._trigger('sort', e, {
                order : r.reverse()
            });
        },
        _genId : function (uid) {
            return uid + 'ObjItem';
        },
        _select : function (el, e) {
            this.unselectAll();
            $(el).addClass(ITEM_SELECTED_FILTER + ' ui-state-selected');
            this._trigger('select', e, this._getSelectedId());
        },
        _getSelectedId : function () {
            var uids = {};
            this._getSelected().each(function (i, item) {
                uids[item.id.replace('ObjItem', '')] = 1;
            });
            return uids;
        },
        _getSelected : function () {
            return $('.' + ITEM_SELECTED_FILTER, this.body);
        },
        add : function (uid, type) {
            this.body.prepend(
                $('<li id="' + this._genId(uid) + '" class="' + ITEM_FILTER + '">').html('<i class="icon ' + ICON_MAP[type] + '"></i><span> ' + $('#' + uid).attr('data-tag') + '</span>')
            );
        },
        remove : function (uid) {
            $('#' + this._genId(uid)).remove();
        },
        select : function (uid) {
            $('#' + this._genId(uid)).addClass(ITEM_SELECTED_FILTER + ' ui-state-selected');
        },
        unselect : function (uid) {
            $('#' + this._genId(uid)).removeClass(ITEM_SELECTED_FILTER + ' ui-state-selected');
        },
        _unselectAll : function () {
            $('.' + ITEM_FILTER, this.body).each(function (i, item) {
                $(item).removeClass(ITEM_SELECTED_FILTER + ' ui-state-selected');
            });
        },
        unselectAll : function () {
            $('.' + ITEM_FILTER, this.body).each(function (i, item) {
                $(item).removeClass(ITEM_SELECTED_FILTER + ' ui-state-selected');
            });
            this._trigger('unselect', null);
        }
    });
})(jQuery);(function ($) {
    var pointer = 0, //撤销指针
        len = 100,    //最大容量，包括撤销重做总数
        stack = [];

    $.widget('pandora.Recorder', {
        _create : function () {
            this.widgetEventPrefix = 'recorder';
            this.element.data('widgetName', this.widgetFullName);

            this.restoreBtn = this.element
                .children()
                .first()
                .button({'disabled' : true})
                .click($.proxy(this.restore, this));
            this.redoBtn = this.restoreBtn
                .next()
                .button({'disabled' : true})
                .click($.proxy(this.redo, this));

            this.element.buttonset();
        },
        _destroy : function () {
            this.restoreBtn.unbind('click', this._restore);
            this.redoBtn.unbind('click', this._redo);
            this.element.removeData();
        },
        restore : function () {
            if (pointer > 0) {
                var data = stack[--pointer];
                this.restoreBtn.button('option', 'disabled', !this.getRestoreState());
                this.redoBtn.button('option', 'disabled', !this.getRedoState());
                this._trigger('restore', null, {
                    data : data,
                    canRedo : this.getRedoState(),
                    canRestore : this.getRestoreState()
                });
            }
        },
        redo : function () {
            if (pointer <= stack.length - 1) {
                var data = stack[pointer++];

                this.redoBtn.button('option', 'disabled', !this.getRedoState());
                this.restoreBtn.button('option', 'disabled', !this.getRestoreState());

                this._trigger('redo', null, {
                    data : data,
                    canRedo : this.getRedoState(),
                    canRestore : this.getRestoreState()
                });
            }
        },
        record : function (data) {
            if (pointer < len) {
                stack[pointer++] = data;
                stack.splice(pointer);
            } else {
                stack.shift();
                stack[pointer - 1] = data;
            }
            this.redoBtn.button('option', 'disabled', true);
            this.restoreBtn.button('option', 'disabled', false);

            ////debug(data, stack, pointer, len);

            return {
                data : data,
                stack : stack,
                pointer : pointer,
                len : len
            };
        },
        clear : function () {
            pointer = -1;
            stack.length = 0;
        },
        getRestoreState : function () {
            return pointer > 0;
        },
        getRedoState : function () {
            return pointer <= stack.length - 1;
        },
        getPointerPos : function () {
            return pointer;
        }
    });
})(jQuery);/*!
 * 潘多拉（新浪功能广告平台）
 * author : acelan(xiaobin8[at]staff.sina.com.cn)
 */
$.extend(pandora, (function () {
    var ADBOX_INDEX = 'http://adbox.sina.com.cn/',
        ADBOX_CREATIVE = ADBOX_INDEX + '#/mycreative/add',
        AMP_REPOST_URL = 'http://amp.ad.sina.com.cn/client/idea/idea!callBack.action?';

    var clipBoard = null;

    $.extend($.ui.keyCode, {
        DEL : 46,
        A : 65,
        Z : 90,
        G : 71,
        I : 73,
        P : 80,
        C : 67,
        V : 86
    });

    var layout = (function () {
        var winW,
            winH,
            navH = $('#XNav').height(),
            mainH,
            sideW = 150,
            toolH,
            objH;

        //debug(winH, navH, mainH, sideW);

        function initLayout() {
            winH = $('body').height();
            winW = $('body').width();
            mainH = winH - navH;
            toolH = Math.floor(mainH * .6);
            objH = mainH - toolH - 14;
        }

        function _resizeHandler() {
            initLayout();
            stage.resize(winW, mainH);
            sidebar.resize(mainH);
            toolPanel.resize(toolH);
            objPanel.resize(objH);
        }

        $(window).resize(_resizeHandler);

        initLayout();

        return {
            winW : winW,
            winH : winH,
            navH : navH,
            mainH : mainH,
            sideW : sideW,
            sideH : mainH,
            toolH : toolH,
            objH : objH
        };
    })();

    //_initText();

    var sidebar = $('#XSidebar').Sidebar({width : layout.sideW, height: layout.sideH}).getInstance(),
        stage = $('#XStage').Stage({previewId : 'XPreviewIframe', width : layout.winW, height: layout.mainH}).getInstance(),
        propPanel = $('#XProp').PropPanel({containment : $('#XMain')}).getInstance(),
        toolPanel = $('#XToolPanel').ToolPanel({height : layout.toolH}).getInstance(),
        objPanel = $('#XObjPanel').ObjPanel({height : layout.objH}).getInstance(),
        recorder = $('#XRecorder').Recorder().getInstance(),
        toolbar = $('#XToolbar'),
        configDialog = $('#XConfigDialog').formdialog({width : 450}).getInstance(),
        compareData;

    // function _initText() {
    //     if ($('body').width() < 1200) {
    //         $('body').addClass('hide-text');
    //     } else {
    //         $('body').removeClass('hide-text');
    //     }
    // }

    function _getBeforeValues(afterValues) {
        var beforeValues = {},
            before = compareData;
        if (before) {
            $.map(afterValues, function (afterValue, uid) {
                beforeValues[uid] = {};
                $.map(afterValue, function (v, k) {
                    if (before[uid]) {
                        beforeValues[uid][k] = before[uid][k].value;
                        before[uid][k].value = v;
                    }
                });
            });
        }
        return beforeValues;
    }

    var windowEvent = (function () {
        function onkeydown(e) {
            //debug(e.which);
            //阻止浏览器回退键
            if (e.which === $.ui.keyCode.DEL) {
                stageEvent.removeSelected(e);
                e.preventDefault();
            } else if (e.which != $.ui.keyCode.BACKSPACE || (e.which == $.ui.keyCode.BACKSPACE && (e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA'))) {
                if((e.metaKey || e.ctrlKey) && e.shiftKey && (e.which === $.ui.keyCode.G)) { //取消组合 command + shift + G
                    stageEvent.ungroupSelected(e);
                } else if ((e.metaKey || e.ctrlKey) && (e.which === $.ui.keyCode.G)) {  //组合 command + G
                    e.preventDefault();
                    stageEvent.groupSelected(e);
                } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.which === $.ui.keyCode.A)) { //全选 command + A
                    e.preventDefault();
                    stageEvemt.unselectAll();
                } else if ((e.metaKey || e.ctrlKey) && (e.which === $.ui.keyCode.A)) { //取消全选command + shift + A
                    e.preventDefault();
                    stageEvent.selectAll();
                } else if ((e.metaKey || e.ctrlKey) && (e.which === $.ui.keyCode.I)) { //显示隐藏tag command + i
                    //e.preventDefault();
                    stage.toggleTag();
                } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.which === $.ui.keyCode.P)) { //预览，编辑 command + shift + p
                    stage.togglePreview();
                } else if ((e.metaKey || e.ctrlKey) && e.shiftkey && (e.which === $.ui.keyCode.Z)) {
                    e.preventDefault();
                    recorder.redo();
                } else if ((e.metaKey || e.ctrlKey) && (e.which === $.ui.keyCode.Z)) {
                    e.preventDefault();
                    recorder.restore();
                } else if ((e.metaKey || e.ctrlKey) && (e.which === $.ui.keyCode.C)) {
                    if (!(e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA')) {
                        e.preventDefault();
                        stageEvent.copySelected(e);
                    }
                } else if ((e.metaKey || e.ctrlKey) && (e.which === $.ui.keyCode.V)) {
                    if (!(e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA')) {
                        e.preventDefault();
                        stageEvent.pasteSelected(e);
                    }
                }
            } else {
                //删除
                stageEvent.removeSelected(e);
                e.preventDefault();
            }
        }
        $(document).keydown(onkeydown);
    })();

    /**
     * 舞台事件处理
     * @return {[type]} [description]
     */
    var stageEvent = (function () {
        function onselect(e, data) {
            //objPanel.unselectAll();
            compareData = data;
            objPanel._unselectAll();
            for (var uid in data) {
                objPanel.select(uid);
            }
            $('#DelBtn, #UngroupBtn').button('option', 'disabled', false);
            propPanel.fill(data);
        }
        function onmutiselect(e, data) {
            compareData = data;
            for (var uid in data) {
                objPanel.select(uid);
            }
            $('#GroupBtn, #UngroupBtn, #DelBtn').button('option', 'disabled', false);
            propPanel.clear();
        }
        function onunselectone(e, data) {
            objPanel.unselect(data.uid);
            propPanel.clear();
        }
        function onunselect(e, data) {
            $('input, textarea', propPanel.element).blur(); //fixbug 不太建议这种实现，侵入了。当鼠标点击舞台空白处是修改生效；
            ////debug('xstage.unselect', $.json.stringify(data));
            $('#GroupBtn, #UngroupBtn, #DelBtn').button('option', 'disabled', true);
            objPanel._unselectAll();
            propPanel.clear();
        }
        function onchange(e, values) {
            ////debug('xstage.change', $.json.stringify(values));
            propPanel.changeValue(values);
            e && recorder.record(
                {type : 'change', before : _getBeforeValues(values), after : values}
            );
        }
        function onadd(e, objs) {
            //////debug('add', objs);
            objs.sort(function (a, b) {
                return a.options.z - b.options.z;
            });
            $.each(objs, function (i, obj) {
                objPanel.add(obj.uid, obj.type);
            });
            e && recorder.record(
                {type : 'add', before : objs, after : objs}
            );
        }
        function onremove(e, objs) {
            $.each(objs, function (i, obj) {
                objPanel.remove(obj.uid);
            });
            propPanel.clear();
            e && recorder.record(
                {type : 'remove', before : objs, after : objs}
            );
        }
        function ongroup(e, objs) {
            $.each(objs, function (i, obj) {
                $.each(obj.objs, function (i, o) {
                    objPanel.remove(o.uid);
                });
                objPanel.add(obj.uid, 'Group');
            });
            propPanel.clear();
            e && recorder.record({
                type : 'group',
                before : objs,
                after : objs
            });
        }
        function onungroup(e, objs) {
            objs.sort(function (a, b) {
                return a.options.z - b.options.z;
            });
            $.each(objs, function (i, obj) {
                obj.objs.sort(function (a, b) {
                    return a.options.z - b.options.z;
                });
                ////debug('ungroup', obj.objs);
                $.each(obj.objs, function (i, o) {
                    objPanel.add(o.uid, o.type);
                });
                objPanel.remove(obj.uid);
            });
            propPanel.clear();
            e && recorder.record({
                type : 'ungroup',
                before : objs,
                after : objs
            });
        }

        function onobjresizing(e, data) {
            pandora.tipBox.show('宽：' + data.w + ' 高：' + data.h + '，坐标：' + data.x + ',' + data.y, 1, 1000);
        }
        function onobjdragging(e, data) {
            pandora.tipBox.show('坐标：' + data.x + ',' + data.y, 1, 1000);
        }

        $('#XStage').bind({
            'stageselect' : onselect,
            'stagemutiselect' : onmutiselect,
            'stageunselect' : onunselect,
            'stageunselectone' : onunselectone,
            'stagechange' : onchange,
            'stageobjresizing' : onobjresizing,
            'stageobjdragging' : onobjdragging
        });

        return {
            selectAll : function () {
                onmutiselect(stage.selectAll());
            },
            unselectAll : function () {
                stage.unselectAll();
                propPanel.clear();
            },
            change : function (e, values) {
                stage.changeValue(values);
                onchange(e, values);
            },
            add : function (e, type, options) {
                onadd(e, stage.add.apply(stage, Array.prototype.slice.call(arguments, 1)));  
            },
            remove : function (e, objs) {
                onremove(e, stage.remove(objs));
            },
            removeSelected : function (e) {
                onremove(e, stage.removeSelected());
                $('#DelBtn').button('option', 'disabled', true);
                $('#GroupBtn, #UngroupBtn').button('option', 'disabled', true);
            },
            group : function (e, data) {
                ongroup(e, stage.group(data));
            },
            ungroup : function (e, data) {
                onungroup(e, stage.ungroup(data));
            },
            groupSelected : function (e) {
                var objs = stage.groupSelected();
                ongroup(e, objs);
                $.each(objs, function (i, obj) {
                    objPanel.select(obj.uid);
                    stage.select($('#' + obj.uid));
                });
            },
            ungroupSelected : function (e) {
                var objs = stage.ungroupSelected();
                onungroup(e, objs);
                $.each(objs, function (i, obj) {
                    $.each(obj.objs, function (i, o) {
                        stage.select($('#' + o.uid));
                        objPanel.select(o.uid);
                    });
                });
            },
            //想做再做，现在不想做
            copySelected : function (e) {
                function clearUID (objs) {
                    var i = 0, obj, coms;
                    while (obj = objs[i++]) {
                        if (obj.type === 'Group') {
                            coms = obj.options.coms;
                            coms && (coms.length > 0) && clearUID(coms);
                        }
                        delete obj.uid;
                    }
                }
                var objs = stage.getSelectedValue();
                clearUID(objs);
                clipBoard = objs;
            },
            pasteSelected : function (e) {
                //debug(clipBoard);
                clipBoard && onadd(e, stage.add(clipBoard));
            }
        };
    })();

    /**
     * 记录面板事件处理
     * @return {[type]} [description]
     */
    (function () {
        function onredo(e, data) {
            var type = data.data.type,
                data = data.data.after;
            switch(type) {
                case 'add' : 
                    stageEvent.add(null, data);
                    break;
                case 'remove' : 
                    stageEvent.remove(null, data);
                    break;
                case 'change' : 
                    stageEvent.change(null, data);
                    break;
                case 'group' : 
                    stageEvent.group(null, data);
                    break;
                case 'ungroup' : 
                    stageEvent.ungroup(null, data);
                    break;
                default : break;
            }
            compareData = stage._getSelectedProp();
        }
        function onrestore(e, data) {
            var type = data.data.type;
                data = data.data.before;
            ////debug('restore', $.json.stringify(data));
            switch(type) {
                case 'add' : 
                    stageEvent.remove(null, data);
                    break;
                case 'remove' :
                    stageEvent.add(null, data);
                    break;
                case 'change' : 
                    stageEvent.change(null, data);
                    break;
                case 'ungroup' : 
                    stageEvent.group(null, data);
                    break;
                case 'group' : 
                    stageEvent.ungroup(null, data);
                    break;
                default : break;
            }
            compareData = stage._getSelectedProp();
        }

        $('#XRecorder').bind({
            'recorderredo' : onredo,
            'recorderrestore' : onrestore
        });
    })();

    /**
     * 属性面板事件处理
     * @return {[type]} [description]
     */
    (function () {
        function onchange(e, values) {
            for (var uid in values) {
                for (var k in values[uid]) {
                    values[uid][k] = values[uid][k].value
                };
            };
            //debug(values);
            stage.changeValue(values);

            recorder.record(
                {type : 'change', before : _getBeforeValues(values), after : values}
            );
        }
        $('#XProp').bind({
            'proppanelchange' : onchange
        });
    })();

    /**
     * 层面板事件处理
     * @return {[type]} [description]
     */
    (function () {
        function onsort(e, data) {
            var values = stage.reIndex(data.order);
            recorder.record(
                {type : 'change', before : _getBeforeValues(values), after : values}
            );
        }
        function onunselect() {
            stage.unselectAll();
            propPanel.clear();
        }
        function onselect(e, uids) {
            for (var uid in uids) {
                propPanel.fill(stage.select($('#' + uid)));
            };
        }

        $('#XObjPanel').bind({
            'objpanelsort' : onsort,
            'objpanelselect' : onselect,
            'objpanelunselect' : onunselect
        });
    })();

    /**
     * 配置面板事件处理
     */
    (function () {

        $('#XConfigDialog').bind({
            'formdialogok' : function (e, data) {
                pandora.ad.width = data.canvasWidth;
                pandora.ad.height = data.canvasHeight;
                stage.resetCanvasSize(data.canvasWidth, data.canvasHeight);
                stage.resetCanvasBorder(data.canvasBorder, data.canvasBordercolor);
                stage.resetCanvasBgcolor(data.canvasBgcolor);

            },
            'formdialogopen' : function (e, data) {
                var $this = $(this),
                    w = $('.canvas-w', $this),
                    h = $('.canvas-h', $this),
                    bgcolor = $('.canvas-bgcolor', $this),
                    border = $('.canvas-border', $this),
                    bordercolor = $('.canvas-bordercolor', $this),
                    size = $('.canvas-size', $this),
                    hbgcolor = $('.canvas-bgcolor-h', $this).val(stage.options.canvasBgcolor),
                    hborder = $('.canvas-border-h', $this).val(stage.options.canvasBorder),
                    hbordercolor = $('.canvas-bordercolor-h', $this).val(stage.options.canvasBordercolor);

                w.spinner().val(stage.options.canvasWidth);
                h.spinner().val(stage.options.canvasHeight);
                bgcolor.ColorEditor({
                    value : stage.options.canvasBgcolor,
                    change : function (e, data) {
                        hbgcolor.val(data.value);
                    }
                });
                border.SelectEditor({
                    value : parseInt(stage.options.canvasBorder),
                    width : 60,
                    datasource : [
                        {name : '无边框', value : 0},
                        {name : '有边框', value : 1}
                    ],
                    change : function (e, data) {
                        hborder.val(data.value);
                    }
                });
                bordercolor.ColorEditor({
                    value : stage.options.canvasBordercolor,
                    change : function (e, data) {
                        hbordercolor.val(data.value);
                    }
                });
                size.RadioEditor({
                    datasource : [
                        '300x250', '950x90', '300x500', '250x230', '780x90'
                    ],
                    format : function (i, text) {
                        var size = text.split('x'),
                            t = $.centerImage(
                                parseInt(size[0], 10),
                                parseInt(size[1], 10),
                                50,
                                40
                            );
                        return '<div><div style="background:#fff;border:1px solid #222;margin:' + t.hp + 'px ' + t.wp + 'px;width:' + t.w + 'px;height:' + t.h + 'px;"></div></div><div style="padding-top:4px;">' + text + '</div>';
                    },
                    change : function (e, data) {
                        var size = data.value.split('x');
                        w.val(parseInt(size[0], 10));
                        h.val(parseInt(size[1], 10));
                    }
                });
            }
        });
    })();

    (function () {
        $('#XToolPanel').bind({
            'toolpanelselect' : function (e, type) {
                stageEvent.add(e, type);
                // $('body').addClass('x-stage-adding').css('cursor', 'crosshair').data('addtype', type);
                // $('#XStage').one('mousedown', function (e) {
                //     var offset = stage.canvas.offset(),
                //         x = e.pageX - offset.left,
                //         y = e.pageY - offset.top,
                //         type = $('body').data('addtype');
                //     $('body').removeClass('x-stage-adding').css('cursor', 'default').removeData('addtype');
                //     //debug(e);
                //     stageEvent.add(e, {type : type, options : {x : x, y : y}});
                // });
            }
        });
    })();

    /**
     * 通用工具栏事件处理
     * @return {[type]} [description]
     */
    (function () {
        $('#XToolbar')
            .children().first()
            .next().buttonset()
            .next().buttonset();

        $('#FullscreenBtn').click(function (e) {
            if (!$.toggleFullscreen()) {
                pandora.tipBox.show('您的浏览器不支持全屏接口，请使用F12或更换其他浏览器，如谷歌浏览器等', 1);
            }
        });
        $('#GroupBtn').button('option', 'disabled', true).click(function (e) {
            stageEvent.groupSelected(e);
        });
        $('#UngroupBtn').button('option', 'disabled', true).click(function (e) {
            stageEvent.ungroupSelected(e);
        });
        $('#ConfigBtn').click(function (e) {
            configDialog.open();
        });
        $('#DelBtn').button('option', 'disabled', true).click(function (e) {
            stageEvent.removeSelected(e);
        });

        $('#TagBtn').button().click(function (e) {
            stage.toggleTag();
        });


        $('#PreviewBtn').button().click(function (e) {
            if (!$('body').hasClass('preview')) {
                stage.disable();
                var $form = $('#XPreviewForm form'),
                    data = stage.getValue();

                ////debug($.json.stringify(data));

                $('#XPreviewFormInput').val($.json.stringify(data));
                $form.submit();
            }
        });

        $('#EditBtn').button().click(function (e) {
            if ($('body').hasClass('preview')) {
                stage.enable();
                stage.resetPreview();
                $('body').removeClass('preview');
            }
        });

        $('#SaveBtn').button().click(function (e) {
            var $btn = $(this);
            $.extend(pandora.ad, {
                tsid : (function (w, h) {
                    return {
                        '250x230' : 1,
                        '950x90' : 2,
                        '300x250' : 3,
                        '780x90' : 4,
                        '300x500' : 5
                    }[w + 'x' + h] || 6;
                })(pandora.ad.width, pandora.ad.height),
                ttid : (function (w, h) {
                    return {
                        '250x230' : 1,
                        '950x90' : 2,
                        '300x250' : 3,
                        '780x90' : 4,
                        '300x500' : 5
                    }[w + 'x' + h] || 6;
                })(pandora.ad.width, pandora.ad.height)
            });

            pandora.tipBox.show('正在为您生成并保存广告，请稍候...', 1);
            $btn.button('option', 'disabled', true);
            $.ajax('/ma/save', {
                type : 'POST',
                dataType : 'json',
                data : {
                    templete_category_id : pandora.ad.tcid,
                    templete_standard_id : pandora.ad.tsid, 
                    templete_type_id : pandora.ad.ttid, 
                    width : pandora.ad.width,
                    height : pandora.ad.height,
                    content : $.json.stringify(stage.getValue())
                },
                success : function (data) {
                    $btn.button('option', 'disabled', false);
                    $.responseParser(data, function (data) {
                        codePanel.open(data.html, data.tid, data.url);
                    });
                }
            });
        });

        $('#XPreviewForm form').submit(function () {
            $('body').toggleClass('preview');
        });


        $('#XToolbar button').tooltip({
            hide : 10,
            items : "[data-tip]",
            content : function () {
                return '<div><div class="ui-tooltip-arrow"><div class="ui-tooltip-arrow-inner">\u25C6</div></div>' + $(this).attr('data-tip') + '</div>';
            },
            position : {
                my: "center top+5",
                at: "center bottom"
            }
        });
    })();


    var codePanel = (function () {
        var textarea = $('#XCodeDialog textarea'),
            tidInput = $('#XCodeDialogTid'),
            urlInput = $('#XCodeDialogUrl'),
            copybtn
            dialog = $('#XCodeDialog').dialog({
                autoOpen : false,
                modal : true,
                close : false,
                width : 500,
                resizable : false,
                closeButton : false,
                buttons : [
                    { 
                        'text' : '复制代码',
                        'id' : 'XCodeDialogCopyButton'
                    },
                    {
                        'text' : '返回',
                        'click' : function () {
                            var ex_t = $.getPar('ex_t');
                            $(this).dialog('close');
                            if (ex_t) {
                                window.location.href = AMP_REPOST_URL + 't=' + ex_t + '&adboxId=' + tidInput.val();
                            } else {
                                window.location.href = ADBOX_CREATIVE;
                            }     
                        },
                        'class' : 'ui-state-em'
                    }
                ]
            });

        return {
            open : function (code, tid, url) {
                textarea.val(code);
                tidInput.val(tid);
                urlInput.val(url);
                $('#XCodeDialogCopyButton').copybutton({
                    content : textarea,
                    width : 60,
                    height : 40,
                    copy : function () {
                        pandora.tipBox.show('复制成功');
                    }
                });
                dialog.dialog('open');
            }
        }
    })();


    /**
     * 元件添加面板
     * @return {[type]} [description]
     */
    // (function () {
    //     $('#XSidebar').bind({
    //         'sidebartoggle' : function (e, data) {
    //             $('body').toggleClass('left-open');
    //         } 
    //     });
    // })();

    var loginBox = $('#XLoginInfo').LoginBox().getInstance();

    var tipBox = (function () {
        var timer = null,
            tip = $('#XTip'),
            DEFAULT_DELAY = 2000;
        return {
            show : function (msg, type, delay) {
                type = ['success', 'alert', 'error'][type || 0];
                delay = delay || DEFAULT_DELAY;
                tip.html(msg);
                tip.show();
                tip.attr('class', 'x-tip x-tip-' + type);
                ////debug($(window).width(), tip.width());
                tip.css({
                    left : ($(window).width() - tip.width() - 40) / 2
                });
                timer && clearTimeout(timer);
                delay !== -1 && (timer = setTimeout(tipBox.hide, delay));
            },
            hide : function () {
                timer && clearTimeout(timer);
                tip.fadeOut();
            }
        };
    })();


    try {
        document.execCommand("BackgroundImageCache", false, true);
    } catch (e) {

    }

    return {
        tipBox : tipBox,
        configDialog : configDialog,
        loginBox : loginBox,
        open : function (ad) {
            var loading = pandora.loading;
            pandora.ad = ad = $.extend({
                width : 300,
                height : 250,
                ttid : 6,
                tcid : 14,
                tsid : 6
            }, ad || {});
 
            stage.resetCanvasSize(ad.width, ad.height);
            stage.resetCanvasBorder(ad.border, ad.borderColor);
            stage.resetCanvasBgcolor(ad.bgcolor);

            if (ad.objs) {
                if (ad.wb) {
                    $.pandora.Wbcom.getInfoByNick(ad.wb, function (data) {
                        $.pandora.Wbcom.changDefaultUser(data);
                        stageEvent.add(null, ad.objs);
                        loading.hide();
                    }, function (data) {
                        stageEvent.add(null, ad.objs);
                        loading.hide();
                    });
                } else {
                    stageEvent.add(null, ad.objs);
                    loading.hide();
                }
            } else {
                loading.hide();
            }
        }
    };
})());
