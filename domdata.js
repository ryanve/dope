/*!
 * domData      HTML5 dataset API abstraction that works as a standalone
 *              lib or integrates into any jQuery-compatible host. It runs
 *              screamin-fast, cross-browser, and gzips < 2k. Got data? =]
 *
 * @author      Ryan Van Etten (c) 2012
 * @link        http://github.com/ryanve/domdata
 * @license     MIT
 * @version     1.3.0
 */

/*jslint browser: true, devel: true, node: true, passfail: false, bitwise: true
, continue: true, debug: true, eqeq: true, es5: true, forin: true, newcap: true
, nomen: true, plusplus: true, regexp: true, undef: true, sloppy: true, stupid: true
, sub: true, white: true, indent: 4, maxerr: 50 */

(function(factory) {
    if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        module.exports = factory();     // node server
    } else { this['domData'] = factory(); } // browser
}(function(host) {// factory:

    var root = this
      , name = 'domData'
      , old = root[name]
      , win = window
      , doc = document
      , FN = 'fn'
      
      , DMS = typeof DOMStringMap !== 'undefined'
      , QSA = !!doc.querySelectorAll // caniuse.com/#feat=queryselector

      , queryEngine = QSA // Simple query engine:
            ? function (s, root) { return s ? (root || doc).querySelectorAll(s) : []; }
            : function (s, root) { return s ? (root || doc).getElementsByTagName(s) : []; }

      , regexCamels = /([a-z])([A-Z])/g          // lowercase next to uppercase
      , regexDashB4 = /-(.)/g                    // finds chars after hyphens
      , regexDataPrefix = /^data-(.+)$/          // starts with data-
      , regexCsvOrSsv = /\s*[\s\,]+\s*/          // splitter for comma *or* space-separated values
      , regexCleanKey = /^[\[\s]+(data-)?|\s+|[\]\s]+$/g  // replace whitespace, trim [] brackets, trim prefix
      , regexTrimSpace = /^\s+|\s+$/g            // trim whitespace 
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
     * camelize()         Convert  'data-pulp-fiction' to 'pulpFiction'. This method only
     *                    deals w/ strings or numbers. Numbers simply turn into strings. Other
     *                    inputs become an empty string. (datatize() is the opposite of camelize())
     * 
     * @param   {string|number|*}  s
     * @return  {string}
     */
    function camelize(s) {
        // Remove data- prefix and convert remaining dashed string to camelCase:
        // Only deal w/ strings|numbers. Other cases return an empty string:
        // HANDLE non-strings and falsey values:
        if ( !s || !s.replace ) {
            return s === +s ? '' + s : ''; // turn numbers into strings (`7` to `'7'`)
        }
        // HANDLE strings:
        return (s.replace(regexCleanKey, '') // remove whitespace, trim [] brackets, trim prefix
                 .replace(regexDashB4, function (m, m1) { return m1.toUpperCase(); })); // -a to A
    }

    /**
     * datatize()         Convert  'pulpFiction' to 'data-pulp-fiction' OR 47 to 'data-47'
     *                    This method only deals w/ strings or numbers. Other inputs return
     *                    an empty string. (datatize() is the opposite of camelize())
     * 
     * @param   {string|number|*}  s
     * @return  {string}
     */
    function datatize(s) {
        // HANDLE non-strings and falsey values:
        if ( !s || !s.replace ) {
            return s === +s ? 'data-' + s : ''; // allows numbers to work incl. 0 but not NaN
        }
        // HANDLE strings:
        s = s.replace(regexCleanKey, '$1') // remove whitespace, trim [] brackets, trim data- prefix
             .replace(regexCamels, '$1-$2') // add dashes between camel humps (aA to a-A)
             .toLowerCase();
        return s ? 'data-' + s : ''; // add the data- prefix only if `s` is truthy
    }

    /**
     * Special (internal) iterator that filters undefined|null values from an array,
     * maps the remaining values, and the filters the result --- all in one loop.
     * @param  {Object|Array|string|number|*}  list  is a key|Array|CSV/SSV string
     * @param  {function(...)}                 fn    is the function to call on each value
     * @return {Array}
     */
    function mapClean(list, fn) {
        var l, i = 0, v, ret = [];
        if ( typeof list === 'string' ) {
            list = list.split(regexCsvOrSsv);
            if ( !list[0] && 1 === list.length ) { // ['']
                return ret; // list was '' or pure whitespace/commas
            }
        } else if (typeof list === 'number') {
            // allow numbers b/c keys can be numeric
            return (list = fn(list)) ? [list] : ret;
        }
        for (l = list.length; i < l; i++) {
            // null|undefined vals get bypassed w/o even calling the `fn`
            // other vals get the `fn` called on them and are then pushed if truthy
            list[i] != null && (v = fn(list[i])) && ret.push(v);
        }
        return ret;
    }
    
    /**
     * camelizeAll()
     * 
     * @param   {Object|Array|string|number|*} list
     * @return  {Array}    array of camelized names
     */
    function camelizeAll(list) {
        return mapClean(list, camelize);
    }

    /**
     * datatizeAll()
     * 
     * @param   {Object|Array|string|number|*}  list
     * @return  {Array}     array of datatized names
     */
    function datatizeAll(list) {
        return mapClean(list, datatize);
    }

    /**
     * render()         Convert a stringified primitive back to its correct type.
     * 
     * @param {string|*} s
     */
    function render(s) {
        var n; // <= undefined
        return (!s || typeof s !== 'string' ? s           // unchanged
                        : 'true' === s      ? true        // convert "true" to true
                        : 'false' === s     ? false       // convert "false" to false
                        : 'undefined' === s ? n           // convert "undefined" to undefined
                        : 'null' === s      ? null        // convert "null" to null
                        : (n = parseFloat(s)) === +n ? n  // convert "1000" to 1000
                        : s                               // unchanged
        );
    }

    /**
     * getDataset()               Get object containing all the data attrs on an element.
     *                            (not part of the public api - used in dataset() and fnDataset())
     * @param  {Object} el        a *native* element
     * @return {Object|undefined}
     */
    function getDataset(el) {
    
        var i, a, n, ob;
        if ( !el || 1 !== el.nodeType ) { return ob; } // undefined
        
        // Use the native dataset when available:
        if (DMS && (ob = el.dataset) && typeof ob === 'object') {
           return ob;
        }

        // Fallback adapted from github.com/ded/bonzo
        if ( el.attributes ) {
            ob = {}; // plain object (not DOMStringMap)
            i = el.attributes.length;
            while (i--) {
                (a = el.attributes[i]) 
                && (n = ('' + a.name).match(regexDataPrefix)) 
                && a.value != null // probably redundant but make sure
                && (ob[camelize(n[1])] = '' + a.value); // normalize to a string
            }
        }

        return ob;
    }

    /**
     * dataset()
     * @param   {Object}                      el
     * @param   {Object|Array|string|number=} key
     * @param   {*=}                          val
     */
    function dataset(el, key, val) {

        var ob, n, i // undefined
          , hasVal = arguments.length > 2
          , hasKey = arguments.length > 1
          , isNode = !!el && typeof el.nodeType === 'number'
          , isCollection = !!el && !isNode && el.length === +el.length
          , doRender = 0
        ;

        if ( (!el && hasKey) || (!isNode && !isCollection) ) {
            throw new TypeError('@dataset'); 
        }

        if ( typeof key !== 'object' || (doRender = key instanceof Array) ) {
        
            if ( !hasVal ) {// GET simple / [exact] / "get all"

                el = isCollection ? el[0] : el;
                
                if ( !hasKey ) {
                    // HANDLE: dataset(el)
                    return getDataset(el); 
                }

                // HANDLE: dataset(el, key)
                if (el.getAttribute && (key = datatize(doRender ? key[0] : key))) {
                    val = el.getAttribute(key);
                }
                // Normalize null|undefined to `undefined`. Normalize everything else
                // to a string. (In IE7, numbers get coherced to numbers. This fixes that.)
                val = val == null ? n : '' + val; 
                return doRender ? render(val) : val; 
            }
            
            if ( isCollection ) {
                // SET (collection)
                // Delegate simple "sets" on collections to effin:
                return fnDataset.call(el, key, val);
            }
            
            if ( key = datatize(key) ) {
                // SET (simple)
                el.setAttribute && el.setAttribute(key, val);
                return el;
            }
        }

        if ( !key ) { // `null` gets handled here
            // HANDLE: user error
            // ~SET => return el (continue the chain)
            // ~GET => return undefined (n is undefined)
            return hasVal ? el : n;
        }

        // HANDLE: $.data(elem, object)
        ob = key; // `key` must be an 'object' if we get to here. Reassign so we don't go insane.
        // We treat strings created using the `new` operator as objects. ( bit.ly/typeof-tostring )
        // Do the for/in loop as the outer loop to avoid datatize-ing the same key multiple times.
        for (n in ob) {// SET via object
            if ( ob.hasOwnProperty(n) && (key = datatize(n)) ) {
                if ( isCollection ) {
                    for (i = 0; i < el.length; i++) {// `i` must reset to 0 for each outer iteration
                        el[i] && el[i].setAttribute && el[i].setAttribute(key, ob[n]);
                    }
                } else if (el.setAttribute) {
                    el.setAttribute(key, ob[n]);
                }
            }
        }
        return el; // chain
    }
    
    /**
     * .dataset()
     * @param   {Object|Array|string|number=} key
     * @param   {*=}                          val
     */
    function fnDataset(key, val) {
        var l, i = 0, count = arguments.length, hasVal = count > 1;
        
        if ( !this.length ) { 
            return hasVal ? this : l;  // object or `undefined`
        }

        if ( !hasVal ) {
            // Delegate simple "gets" and "set via object" to the top-level method.
            // Delegate "get all" directly to getDataset()
            return count ? dataset(this, key) : getDataset(this[0]);
        }
        
        // HANDLE "set" for each elem in the collection right here, so we don't have to
        // run thru the key logic each time --- it saves several function calls this way:
        if (key = datatize(key)) {
            for (l = this.length; i < l; i++) {
                // Iterate thru the the elems, setting data on each of them.
                if (this[i] && this[i].setAttribute) {// Only set data on truthy items:
                    this[i].setAttribute(key, val);
                }
            }
        }
        return this;
    }

    /**
     * deletes()
     *
     * @param  {Object}             elems
     * @param  {Array|string}       keys
     */
    function deletes(elems, keys) {
        var j, l, i = 0, h, name, el;
        if (elems && keys) {
            keys = datatizeAll(keys); // compact data-names
            h = keys.length;
            if (elems.nodeType && elems.removeAttribute) {
                // single element:
                while (i < h) {// minifies to for(;i<h;)
                    elems.removeAttribute(keys[i++]);
                }
                return elems;
            }
            // collection (or maybe something else, but that'll be fine
            // b/c cause they'll be zero iterations:
            for (l = elems.length; i < l; i++) {
                if (elems[i] && elems[i].removeAttribute) {
                    j = 0; // must reset for each outer iteration
                    while (j < h) {
                        elems[i].removeAttribute(keys[j++]);
                    }
                }
            }
        }
        return elems;
    }
    
    /**
     * toDataSelector()          Converts ['aB', 'bA'] to '[data-a-b],[data-b-a]'
     *                           OR even ['[ data-a-b]', 'data-b-a'] to '[data-a-b],[data-b-a]'
     * @param   {Array|string|number|*} list    array, key, or CSV or SSV string of data keys
     * @return  {string}                selector string
     */
    function toDataSelector(list) {
    
        list = datatizeAll(list); // convert to compact array
        
        // Escape periods b/c we're not dealing with classes. Periods are 
        // valid in data attribute names. <p data-the.wh_o="totally valid">
        // See api.jquery.com/category/selectors/ about escapes. The same 
        // goes for QSA. Here we're only concerned w/ the chars of those
        // that are valid in data attr keys--just periods. Dashes+underscores
        // are valid too but they don't need to be escaped.
        
        return list.length ? '[' + list.join('],[').replace(regexEscPeriods, '\\\\.') + ']' : '';
    }
    
    /**
     * queryData()                      Get elements by data key.
     * 
     * @param   {Object|string}  list   array or comma/space-separated data keys.
     * @return  {Object}                array of elements
     */
     
    api['queryData'] = QSA ? function (list, root) {// Modern browsers, IE8+
    
        return queryEngine(toDataSelector(list), root); 
        
    } : function queryData(list, root) {// == FALLBACK ==
    
        // Convert keys to compact array of data-names:
        list = datatizeAll(list); 
        
        // Get elems by attribute name:
        var i, j, els, ret = [], alreadyAdded = [];
        if ( !list.length ) { return ret; }
        els = queryEngine('*', root); // getElementsByTagName
        for (j = 0; j < els.length; j++) {// each elem
            for (i = 0; i < list.length && !alreadyAdded[j]; i++) {// each attr name
                // `list` was already compacted by datatizeAll() so
                // we know that `list[i]` will be a truthy string:
                if (els[j].getAttribute(list[i]) != null) {
                    alreadyAdded[j] = ret.push(els[j]); // push returns truthy
                }
            }
        }

        return ret;
    };

    // Expose top-level methods not already exposed:
    api['qsa'] = queryEngine;
    api['render'] = render;
    api['dataset'] = dataset;
    api['deletes'] = deletes;
    api['camelize'] = camelize;
    api['datatize'] = datatize;
    api['camelizeAll'] = camelizeAll;
    api['datatizeAll'] = datatizeAll;
    api['toDataSelector'] = toDataSelector;
    
    /**
     * .dataset()
     * @param   {Object|Array|string|number=} key
     * @param   {*=}                          value
     */
    api[FN]['dataset'] = fnDataset;
    
    /**
     * .deletes()     Remove data attributes for each element in a collection.
     * @param {Array|string}  keys  one or more space-separated or comma-separated data attrs
     */
    api[FN]['deletes'] = function(keys) {
        return deletes(this, keys);
    };

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
            && typeof supplier[name] === 'function' // methods only
            && !supplier[name]['mute'] // see blacklist at bottom of page
            && (receiver[name] = supplier[name]); // no remixes needed
        }
    }

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
    
    // Mixout blacklist: specify that these methods are not designed to be bridged:
    api['bridge']['mute'] = api['noConflict']['mute'] = true;

    // Bridge into a host like jQuery or ender if one is there:
    // The bridge returns the api:
    return api['bridge'](host);

})); // factory and closure