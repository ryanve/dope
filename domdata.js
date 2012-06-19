/*!
 * domData      HTML5 dataset API abstraction that works as a standalone
 *              lib or integrates into any jQuery-compatible host. It runs
 *              screamin-fast, cross-browser, and gzips < 1.5k. Got data? =]
 *
 * @author      Ryan Van Etten (c) 2012
 * @link        http://github.com/ryanve/domdata
 * @license     MIT
 * @version     1.2.0
 */

/*jslint browser: true, devel: true, node: true, passfail: false, bitwise: true
, continue: true, debug: true, eqeq: true, es5: true, forin: true, newcap: true
, nomen: true, plusplus: true, regexp: true, undef: true, sloppy: true, stupid: true
, sub: true, white: true, indent: 4, maxerr: 50 */

(function(factory) {
    if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        module.exports = factory();  // node / ender.no.de
    } else {
        this['domData'] = factory(); // browser
    }
}(function(host) {// factory:

    var root = this
      , name = 'domData'
      , old = root[name]
      , win = window
      , doc = document
      , FN = 'fn'
      , dataset, deletes, camelize, datatize, render
      , toDataSelector, camelizeAll, datatizeAll
      , getDataset, queryData
      
      , DMS = typeof DOMStringMap !== 'undefined'
      , QSA = !!doc.querySelectorAll // caniuse.com/#feat=queryselector

      , queryEngine = QSA // Simple query engine:
            ? function (s, root) { return s ? (root || doc).querySelectorAll(s) : []; }
            : function (s, root) { return s ? (root || doc).getElementsByTagName(s) : []; }

      , regexCamels = /([a-z])([A-Z])/g          // lowercase next to uppercase
      , regexDashB4 = /-(.)/g                    // finds chars after hyphens
      , regexDataPrefix = /^data-(.+)$/          // starts with data-
      , regexCsvOrSsv = /\s*[\s\,]+\s*/          // splitter for comma *or* space-separated values
      , regexTrimBracks = /^[\[\s]+|[\]\s]+$/g   // trim whitespace and/or [ ] brackets
      , regexEscPeriods = /\\*\./g               // find periods w/ and w/o preceding backslashes
    ;
    
    // Allow a host to be passed to the factory for use with bridge()
    // e.g. If `factory(jQuery)` or `define(name, ['jquery'], factory)` were
    // added to the logic at the top, then domData's methods would automatically 
    // be added to jQuery. Otherwise we look in the root:
    
    host = host || (typeof root['$'] === 'function' && root['$'][FN] ? root['$'] : 0);
    
    // Array notation is used on property names that we don't want the
    // Closure Compiler to rename in the advanced optimization mode. 
    // closure-compiler.appspot.com/home
    // developers.google.com/closure/compiler/docs/api-tutorial3
    // developers.google.com/closure/compiler/docs/js-for-compiler

    /**
     * api is the export (methods are added to it)
     * @param  {*}        item 
     * @param  {Object=}  root
     * @return {Object}   array-like object
     */
    function api(item, root) {
        return new Api(item, root);
    }

    /**
     * @constructor
     * @param {*}        item 
     * @param {Object=}  root
     */
    function Api(item, root) {
        var i;
        if ( !item ) { return this; }
        if (typeof item === 'function') {
            item.call(doc, api); // @since 1.2.0
        } else if (item.nodeType || item === win || (i = item.length) !== +i) {
            // DOM elems/nodes or anything w/o a length number gets handled here. The window
            // has length in it and must be checked too. ( jsperf.com/iswindow-prop )
            this[0] = item; 
            this['length'] = 1;
        } else {// Array-like:
            if (typeof item === 'string') {
                this['selector'] = item;
                item = queryEngine(item, root);
                i = item.length;
            }
            // Ensure length is 0 or a positive finite num:
            this['length'] = i = (i !== +i || i < 0) ? 0 : i >>> 0;
            while (i--) {// make array-like:
                this[i] = item[i]; 
            }
        } // implicitly returns `this`
    }

    // jQuery-inspired magic to make `api() instanceof api` be true and to make
    // it so that methods added to api[FN] map back to the prototype + vice versa:
    api.prototype = api[FN] = Api.prototype = {};
    
    // Defaults props:
    api[FN]['selector'] = '';
    api[FN]['length'] = 0;
    
    // Create top-level reference to self:
    // This makes it possible to bridge into a host, destroy the global w/ noConflict, 
    // and still access the entire api from the host (not just the bridged methods.)
    // It is also useful for other modules that may want to use this module, even after 
    // the global is gone.
    api[name] = api;

    /**
     * camelize()         Convert  'data-pulp-fiction' to 'pulpFiction'
     * 
     * @param   {string}  s
     * @return  {string}
     */
    api['camelize'] = camelize = function(s) {
        // Remove data- prefix and convert remaining dashed string to camelCase:
        if ( !s) { return ''; }
        return s.replace(regexDataPrefix, '$1').replace(regexDashB4, function (m, m1) {
            return m1.toUpperCase();
        });
    };

    /**
     * datatize()         Convert  'pulpFiction' to 'data-pulp-fiction'
     * 
     * @param   {string}  s
     * @return  {string}
     */
    api['datatize'] = datatize = function(s) {
        // the opposite of camelize
        // 'pulpFiction' to 'data-pulp-fiction'
        if ( !s) { return ''; }
        return 'data-' + s.replace(regexDataPrefix, '$1').replace(regexCamels, '$1-$2').toLowerCase();
    };
    
    // Handler for making the camelizeAll/datatizeAll methods:
    function makeMapper(callback) {
        return function(list) {
            var i, v, ret = [];
            list instanceof Array || (list = list.split(regexCsvOrSsv));
            for (i = 0 ; i < list.length; i++) {
                if (v = list[i]) {
                    v = callback(v.replace(regexTrimBracks, ''));
                    if (v) { ret.push(v); } // exclude falsey values
                }
            }
            return ret;
        };
    }

    /**
     * datatizeAll()
     * 
     * @param   {Object|string}  list
     * @return  {Object}         array of datatized names
     */

    api['datatizeAll'] = datatizeAll = makeMapper(datatize);     
    
    
    /**
     * camelizeAll()
     * 
     * @param   {Object|string}  list
     * @return  {Object}         array of camelized names
     */
    
    api['camelizeAll'] = camelizeAll = makeMapper(camelize);

    /**
     * toDataSelector()          Converts ['aB', 'bA'] to '[data-a-b],[data-b-a]'
     *                           OR even ['[ data-a-b]', 'data-b-a'] to '[data-a-b],[data-b-a]'
     * 
     * @param   {Array|string}   array or comma/space-separated string of data keys
     * @return  {string}         selector string
     */
    api['toDataSelector'] = toDataSelector = function (list) {
    
        list = datatizeAll(list); // convert to compact array
        
        // Escape periods b/c we're not dealing with classes. Periods are 
        // valid in data attribute names. <p data-the.wh_o="totally valid">
        // See api.jquery.com/category/selectors/ about escapes. The same 
        // goes for QSA. Here we're only concerned w/ the chars of those
        // that are valid in data attr keys--just periods. Dashes+underscores
        // are valid too but they don't need to be escaped.
        
        return list.length ? '[' + list.join('],[').replace(regexEscPeriods, '\\\\.') + ']' : '';
    };
    
    /**
     * queryData()                      Get elements by data key.
     * 
     * @param   {Object|string}  list   array or comma/space-separated data keys.
     * @return  {Object}                array of elements
     */

    api['queryData'] = QSA 
        ? function(list, root) {
           return queryEngine(toDataSelector(list), root); 
        }
        : function(list, root) {// fallback (only adds .07k to include)
        
            list = datatizeAll(list); // convert keys to array of data-names
        
            // way to get elems by attr for IE7/6:
            var i, j, k, el, els, name, listLen = list.length, ret = [], alreadyAdded = [];
            if (listLen) {
                els = queryEngine('*', root); // get all elems (getElementsByTagName)
                for (j = 0; j < els.length; j++) {// each elem
                    el = els[j];
                    for (i = 0; i < listLen && !alreadyAdded[j]; i++) {// each name in the list
                        if ((name = list[i]) && el.getAttribute(name) != null) {
                            // prevent pushing the same element twice:
                            alreadyAdded[j] = ret.push(el); // push returns truthy
                        }
                    }
                }
            }
            return ret;
        };

    /**
     * render()         Convert a stringified primitive back to its correct type.
     * 
     * @param   {string|null}   s
     */

    api['render'] = render = function(s) {
        var n; // <= undefined
        return (!s || typeof s !== 'string' ? s           // unchanged
                        : 'true' === s      ? true        // convert "true" to true
                        : 'false' === s     ? false       // convert "false" to false
                        : 'undefined' === s ? n           // convert "undefined" to undefined
                        : 'null' === s      ? null        // convert "null" to null
                        : (n = parseFloat(s)) === +n ? n  // convert "1000" to 1000
                        : s                               // unchanged
        );
    };

    /**
     * getDataset()                    Get object containing all the data attrs on an element
     *                                 or on the 1st elem in a set. (not part of the public api)
     *
     * @param   {Object}               el is a native element, node list, or matched set
     */
    getDataset = function (el) {
        var obj, i = 0;
        el = el && (el.nodeType ? el : el[0]); // isolate node
        if ( !el || el.nodeType !== 1) { return obj; } // undefined
        
        // Use the native dataset when available:
        if (DMS && (obj = el.dataset) && typeof obj === 'object') {
           return obj;
        }

        // Fallback adapted from github.com/ded/bonzo
        obj = {}; // plain object (not DOMStringMap)
        while (i < el.attributes.length) {
            a = el.attributes[i++];
            if (a && (n = String(a.name).match(regexDataPrefix))) {
                obj[camelize(n[1])] = a.value;
            }
        }
        return obj;
    };
    
    /**
     * dataset()
     *
     * @param   {Object}              elems
     * @param   {Array|string=}       key
     * @param   {*=}                  value
     */
    api['dataset'] = dataset = function(elems, key, value) {

        var numOfArgs = arguments.length
          , ret, el, collection, n
          , i = 0; // i serves 2 purposes (render data flag + iterator index)
        
        // HANDLE dataset(elems) and dataset()
        if (numOfArgs < 2) {
            return getDataset(elems);
        }
        
        // Determine if elems is a single native node or a collection
        el = elems && (elems.nodeType ? elems : ((collection = true) && elems[0])); // isolate node
        
        if ( !el || !key || el.nodeType !== 1) {
            // developer.mozilla.org/en/nodeType
            // only element nodes support dataset
            // set => return elems (continue the chain)
            // get => return undefined (ret is undefined here)
            return numOfArgs > 2 ? elems : ret; 
        }

        if (typeof key !== 'string') {
            if ( key instanceof Array ) {
                // HANDLE: [exact] syntax
                i = 1; // render data flag
                key = key[0];
                if ( !key) {
                    return numOfArgs > 2 ? elems : ret; 
                }
            } else if ( !(key instanceof String) ) {
                // HANDLE: $.data(elem, object)
                for (n in key) {
                    if (key.hasOwnProperty(n)) {
                        dataset(elems, n, key[n]);
                    }
                }
                return elems; // chain
            }
        }
        
        key = datatize(key); // convert to data-name

        if ( numOfArgs === 2 ) {// GET (single elem)
            ret = el.getAttribute(key);
            return i ? render(ret) : ret;
        }

        // SET (single element)
        if ( !collection) { 
            el.setAttribute(key, value); 
            return el;
        }
        
        // SET (collection)
        n = elems.length;
        while (i < n) {
            if (el = elems[i++]) {
                el.setAttribute(key, value);
            }
        }
        return elems; // chain
    };

    /**
     * deletes()
     *
     * @param  {Object}              elems
     * @param  {Array|string}       keys
     */
    api['deletes'] = deletes = function(elems, keys) {
        var j, l, i = 0, h, name, el;
        if (elems && keys) {
            keys = datatizeAll(keys); // compact data-names
            h = keys.length;
            if (elems.nodeType === 1) {
                // single element:
                while (i < h) {// minifies to for(;i<h;)
                    elems.removeAttribute(keys[i++]);
                }
                return elems;
            }
            // collection (or maybe something else like the document, 
            // but that'll be fine cause they'll be zero iterations:
            l = elems.length;
            while (i < l) {
                if ((el = elems[i++]) && el.removeAttribute) {
                    j = 0; // must reset for each outer iteration
                    while (j < h) {
                        el.removeAttribute(keys[j++]);
                    }
                }
            }
        }
        return elems;
    };
    
    // Convert to chainable methods:
    /**
     * .dataset()
     *
     * @param   {Object|string=}       key
     * @param   {*=}                   value
     */
    api[FN]['dataset'] = function(key, value) {
        var len = arguments.length; 
        // Make sure this gets sent with the correct number of args.
        // The ternary is faster than slicing the args using .apply
        return len ? (1 === len ? dataset(this, key) : dataset(this, key, value)) : getDataset(this);
    };
    
    /**
     * .deletes()
     *
     * @param  {Object|string}       keys
     */
    api[FN]['deletes'] = function(keys) {
        return deletes(this, keys);
    };

    // Expose queryEngine so that other modules can use it.
    api['qsa'] = queryEngine;

    /**
     * noConflict()  Destroy the global and return the api. Optionally call 
     *               a function that gets the api supplied as the first arg.
     * @param        {function(*)=} callback   optional callback function
     * @example      var localDomData = domData.noConflict();
     * @example      domData.noConflict(function(domData){    });
     */
    api['noConflict'] = function(callback) {
        root[name] = old;
        typeof callback === 'function' && callback.call(root, api);
        return api;
    };

    /**
     * Special-case (internal) utility for augmenting a host with the api's methods.
     * See usage from bridge()
     * @param {Object|function(...)}    supplier   is the source of the methods
     * @param {Object|function(...)}    receiver   is the host OR a prop on the host to add methods to
     * @param {boolean=}                force      whether or not existing methods should be overwritten
     */
    function mixout(supplier, receiver, force) {// < signature is reverse of mixin
        var name;
        for (name in supplier) {
            supplier.hasOwnProperty(name)
            && (force || typeof receiver[name] === 'undefined')
            && typeof supplier[name] === 'function' && 0 !== mixout[name]
            && (receiver[name] = supplier[name]);
        }
    }// Methods that *never* mixout:
    mixout['bridge'] = mixout['noConflict'] = mixout['qsa'] = 0;

    /**
     * bridge()       Handler for integrating (mixing out) methods into a host. It
     *                augments the host with only the listed methods. If the host is
     *                jQuery-compatible, then it'll also get the chainable methods.
     *                Existing methods on the host are not overwritten unless the
     *                force param is set to true.
     * 
     * @param {Object|function()}   host    any object or function
     * @param {boolean=}            force   indicates whether existing methods on the host 
     *                                      should be overwritten (default: false)
     * @param {number=}             flag    1: top-level only, 2: effins only
     */
    api['bridge'] = function (host, force, flag) {
        if (host instanceof Object) {
            2 !== flag && mixout(api, host, force); // top-level
            1 !== flag && typeof host === 'function' && host[FN] && mixout(api[FN], host[FN], force);
        }
        return api;
    };
    
    // Bridge into a host like jQuery or ender if one is there:
    return api['bridge'](host);

})); // factory and closure