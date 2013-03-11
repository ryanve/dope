/*!
 * dope         HTML5 dataset API abstraction that works as a standalone
 *              lib or integrates into any jQuery-compatible host. It runs
 *              screamin-fast, cross-browser, and gzips < 2k. Got data? =]
 * @author      Ryan Van Etten (c) 2012
 * @link        http://github.com/ryanve/dope
 * @license     MIT
 * @version     2.1.1
 */

/*jslint browser: true, devel: true, node: true, passfail: false, bitwise: true
, continue: true, debug: true, eqeq: true, es5: true, forin: true, newcap: true
, nomen: true, plusplus: true, regexp: true, undef: true, sloppy: true, stupid: true
, sub: true, white: true, indent: 4, maxerr: 180 */

(function(root, name, definition) {// github.com/umdjs/umd
    if (typeof module != 'undefined' && module['exports']) {
        module['exports'] = definition(); // node|common|ender
    } else { root[name] = definition(); } // browser
}(this, 'dope', function() {

    // Array notation is used on property names that we don't want
    // closure-compiler.appspot.com to rename in the advanced mode. 
    // developers.google.com/closure/compiler/docs/api-tutorial3
    // developers.google.com/closure/compiler/docs/js-for-compiler

    var root = this
      , doc = document
      , xports = {}
      , effins = {}
      , DMS = typeof DOMStringMap != 'undefined'
      , AP = Array.prototype
      , OP = Object.prototype
      , slice = AP.slice
      , push = AP.push
      , join = AP.join
      , owns = OP.hasOwnProperty
      , toString = OP.toString
      , JSON = root['JSON']
      , parseJSON = !!JSON && JSON.parse
      , queryMethod = 'querySelectorAll' 
      , QSA = !!doc[queryMethod] || !(queryMethod = 'getElementsByTagName')
      , queryEngine = function(s, root) {
            return s ? (root || doc)[queryMethod](s) : []; 
        }
      , camels = /([a-z])([A-Z])/g          // lowercase next to uppercase
      , dashB4 = /-(.)/g                    // finds chars after hyphens
      , csvSsv = /\s*[\s\,]+\s*/          // splitter for comma *or* space-separated values
      , cleanAttr = /^[\[\s]+|\s+|[\]\s]+$/g  // replace whitespace, trim [] brackets
      , cleanPre = /^[\[\s]?(data-)?|\s+|[\]\s]?$/g  // replace whitespace, trim [] brackets, trim prefix
      , escDots = /\\*\./g               // find periods w/ and w/o preceding backslashes
      , alphaNum = /^[a-z0-9]+$/i
      , ssv = /\s+/
      , trimmer = /^\s+|\s+$/
      , trim = ''.trim ? function(s) {
            return null == s ? '' : s.trim(); 
        } : function(s) {
            return null == s ? '' : s.replace(trimmer, ''); 
        };
    
    function camelHandler(all, letter) { 
        return letter.toUpperCase();
    }

    /**
     * Convert  'data-pulp-fiction' to 'pulpFiction'. Non-scalars return an
     * empty string. number|boolean coerces to string. (opposite: datatize())
     * @param   {string|number|boolean|*}  s
     * @return  {string}
     */
    function camelize(s) {
        if (typeof s != 'string') {
            return typeof s == 'number' || typeof s == 'boolean' ? '' + s : ''; 
        } // Remove data- prefix and convert remaining dashed string to camelCase:
        return s.replace(cleanPre, '').replace(dashB4, camelHandler); // -a to A
    }

    /**
     * Convert  'pulpFiction' to 'data-pulp-fiction' OR 47 to 'data-47'
     * Invalid types return an empty string. (opposite: camelize())
     * @param   {string|number|*}  s
     * @return  {string}
     */
    function datatize(s) {
        if (typeof s == 'string') {
            s = s.replace(cleanPre, '$1').replace(camels, '$1-$2'); // aA to a-A
        } else { s = typeof s == 'number'  ? '' + s : ''; }
        return s ? ('data-' + s.toLowerCase()) : s;
    }

    /**
     * Convert a stringified primitive back to its 
     * correct type. OR parse JSON in a safe way.
     * @param {string|*}  s
     * @param {boolean=}  json
     */
    function parse(s, json) {
        var n; // <= initially undefined
        if (typeof s != 'string' || !(s = trim(s))) { return s; }
        if ('true' === s) { return true; }
        if ('false' === s) { return false; }
        if ('null' === s) { return null; }
        if ('undefined' === s || (n = (+s)) || 0 === n || 'NaN' === s) { 
            return n; // undefined|number
        }
        if (true === json) {
            try { s = parseJSON(s); }
            catch (e) {}
        }
        return s;
    }

    /**
     * @param   {Object|Array|*}  list
     * @param   {Function}        fn     
     * @param   {(Object|*)=}     scope
     * @param   {boolean=}        compact 
     * @return  {Array}
     */
    function map(list, fn, scope, compact) {
        var l, i = 0, v, u = 0, ret = [];
        if (list == null) { return ret; }
        compact = true === compact;
        l = list.length;
        while (i < l) {
            v = fn.call(scope, list[i], i++, list);
            if (v || !compact) { ret[u++] = v; }
        }
        return ret;
    }
    
    /** 
     * special-case DOM-node iterator optimized for internal use
     * @param {Object|Array}  ob
     * @param {Function}      fn
     * @param {*=}            param
     */
    function eachNode(ob, fn, param) {
        var l = ob.length, i;
        for (i = 0; i < l; i++) {
            ob[i] && ob[i].nodeType && fn(ob[i], param);
        }
        return ob;
    }

    /**
     * internal-use function to iterate a node's attributes
     * @param {Object}        el
     * @param {Function}      fn
     * @param {(boolean|*)=}  dset
     */
    function eachAttr(el, fn, dset) {
        var l, a, n, i = 0, prefix;
        if (!el.attributes) { return; }
        if (typeof dset == 'boolean') {
            prefix = /^data-/;
        } else { dset = null; }
        l = el.attributes.length;
        while (i < l) {
            if (a = el.attributes[i++]) {
                n = '' + a.name;
                if (dset == null || prefix.test(n) === dset) {
                    null == a.value || fn.call(el, a.value, n, a);
                }
            }
        }
    }

    /**
     * Get object containing an element's data attrs.
     * @param  {Node}    el     a DOM element
     * @return {Object|undefined}
     */
    function getDataset(el) {
        var i, a, n, ob;
        if (!el || 1 !== el.nodeType) { return; }
        // Use the native dataset when avail:
        if (DMS && (ob = el.dataset)) { 
            return ob; 
        }
        // Fallback gets a cloned plain object that
        // cannot mutate the dataset via reference
        ob = {};
        eachAttr(el, function(v, k) {
            ob[camelize(k)] = '' + v;
        }, true);
        return ob;
    }

    /**
     * @param  {Object}   el
     * @param  {Object=}  ob
     */
    function resetDataset(el, ob) {
        if (!el) { return; }
        var n, curr = el.dataset;
        if (curr && DMS) {
            if (curr === ob) { return; }
            for (n in curr) { 
                delete curr[n]; 
            }
        }
        ob && dataset(el, ob);
    }
    
    function setViaObject(el, ob, fn) {
        var n;
        for (n in ob) {
            owns.call(ob, n) && fn(el, n, ob[n]);
        }
    }
    
    /**
     * @param  {Object|Array|Function}  el
     * @param  {(string|Object|*)=}     k
     * @param  {*=}                     v
     */    
    function attr(el, k, v) {

        el = el.nodeType ? el : el[0];
        if (!el || !el.setAttribute) { return; }
        k = typeof k == 'function' ? k.call(el) : k;
        if (!k) { return; }

        if (typeof k == 'object') {// SET-multi
            setViaObject(el, k, attr);
        } else {
            if (void 0 === v) {// GET
                k = el.getAttribute(k); // repurpose `k`
                return null == k ? v : '' + k; // normalize
            }
            // SET:
            v = typeof v == 'function' ? v.call(el) : v;
            v = '' + v; // normalize inputs
            el.setAttribute(k, v);
            return v; // the curr value
        }
    }
    
    /**
     * @param  {Object|Array|Function}  el
     * @param  {(string|Object|*)=}     k
     * @param  {*=}                     v
     */    
    function dataset(el, k, v) {
        var exact, kFun = typeof k == 'function';
        el = el.nodeType ? el : el[0];
        if (!el || !el.setAttribute) { return; }
        if (void 0 === k && v === k) {
            return getDataset(el); 
        }
        k = kFun ? k.call(el) : k;

        if (typeof k == 'object' && (kFun || !(exact = void 0 === v && datatize(k[0])))) {
            // SET-multi
            kFun && deletes(el);
            k && setViaObject(el, k, dataset);
        } else {
            k = exact || datatize(k);
            if (!k) { return; }
            if (void 0 === v) {// GET
                k = el.getAttribute(k); // repurpose `k`
                return null == k ? v : exact ? parse(k) : '' + k; // normalize
            }
            // SET
            v = typeof v == 'function' ? v.call(el) : v;
            v = '' + v; // normalize inputs
            el.setAttribute(k, v);
            return v; // the curr value
        }
    }

    /**
     * @param  {Object}                  el
     * @param  {(Array|string|number)=}  keys
     */
    function deletes(el, keys) {
        var k, i = 0;
        el = el.nodeType ? el : el[0];
        if (!el || !el.removeAttribute) { return; }
        if (void 0 === keys) { 
            return resetDataset(el); 
        }
        keys = typeof keys == 'string' 
             ? keys.split(ssv)
             : typeof keys != 'object' ? [keys] : keys;
             
        while (i < keys.length) {
            k = datatize(keys[i++]);
            k && el.removeAttribute(k);
        }
    }
    
    /**
     * @param  {Object}                  el
     * @param  {(Array|string|number)=}  keys
     */
    function removeAttr(el, keys) {
        var k, i = 0;
        el = el.nodeType ? el : el[0];
        if (!keys || !el || !el.removeAttribute) { return; }
        keys = typeof keys == 'string' ? keys.split(ssv) : keys;
        while (i < keys.length) {
            k = keys[i++];
            k && el.removeAttribute(k);
        }
    }

    /**
     * Convert list of attr names or data- keys into a selector.
     * @param   {Array|string|number|*}  list
     * @param   {boolean=}               prefix
     * @param   {boolean=}               join
     * @return  {string|Array}
     */
    function toAttrSelector(list, prefix, join) {
        var l, i = 0, j = 0, emp = '', arr = [];
        prefix = true === prefix;
        list = typeof list == 'string' ? list.split(csvSsv) : typeof list == 'number' ? '' + list : list;
        l = list.length;
        while (i < l) {
            s = list[i++];
            s = prefix ? datatize(s) : s.replace(cleanAttr, emp);
            s && (arr[j++] = s);
        }
        if (false === join) {
            return arr;
        }
        // Escape periods to allow valid attrs like <p data-the.wh_o="totally valid">
        // @link api.jquery.com/category/selectors/
        // @link stackoverflow.com/q/13283699/770127
        return j ? '[' + arr.join('],[').replace(escDots, '\\\\.') + ']' : emp;
    }

    /**
     * Get elements matched by a data key.
     * @param   {Array|string}  list   array or CSV or SSV data keys
     * @return  {Array|*}
     */     
    xports['queryData'] = QSA ? function(list, root) {
        // Modern browsers, IE8+
        if (false === root) { return toAttrSelector(list, true, root); }
        return queryEngine(toAttrSelector(list, true), root); 

    } : function(list, root) {// == FALLBACK ==
        list = toAttrSelector(list, true, false);
        return false === root ? list : queryAttrFallback(list, root); 
    };
    
    /**
     * Get elements matched by an attribute name.
     * @param   {Array|string}  list   array or CSV or SSV data keys
     * @return  {Array|*}
     */     
    xports['queryAttr'] = QSA ? function(list, root) {
        // Modern browsers, IE8+
        if (root === false) { return toAttrSelector(list, root, root); }
        return queryEngine(toAttrSelector(list), root); 

    } : function(list, root) {// == FALLBACK ==
        list = toAttrSelector(list, false, false);
        return false === root ? list : queryAttrFallback(list, root); 
    };
    
    /**
     * @param {Array|string}  list   is an array of attribute names (w/o bracks)
     * @param {Object=}       root
     */
    function queryAttrFallback(list, root) {// Get elems by attr name:
        var j, i, e, els, l = list.length, ret = [], u = 0;
        if (!l) { return ret; }
        els = queryEngine('*', root);
        for (j = 0; (e = els[j]); j++) {
            i = l; // reset i for each outer iteration
            while (i--) {// each attr name
                if (attr(e, list[i]) != null) {
                    ret[u++] = e; // ghetto push
                    break; // prevent pushing same elem twice
                }
            }
        }
        return ret;
    }
    
    // Expose remaining top-level methods:
    xports['map'] = map;
    xports['parse'] = parse;

    /**
     * @param  {string|*}  s
     * @since  2.1.0
     */
    xports['parseJSON'] = function(s) {
        return parse(s, true);
    };

    xports['trim'] = trim;
    xports['qsa'] = queryEngine;
    xports['attr'] = attr;
    xports['removeAttr'] = removeAttr;
    xports['dataset'] = dataset;
    xports['deletes'] = deletes;
    xports['camelize'] = camelize;
    xports['datatize'] = datatize;

    /**
     * @this    {Object|Array}
     * @param   {*=}   k
     * @param   {*=}   v
     */
    effins['dataset'] = function(k, v) {
        var kMulti = typeof k == 'object' && !(void 0 === v && datatize(k[0])) || typeof k == 'function';
        if (void 0 === v && !kMulti) {
            return dataset(this[0], k); // GET
        } 
        k = kMulti ? k : datatize(k);
        return k ? eachNode(this, function(e, x) {
            x = typeof v == 'function' ? v.call(e) : v;
            kMulti ? dataset(e, k, x) : e.setAttribute(k, '' + x); 
        }) : (void 0 === v ? v : this); // undefined|this
    };

    /**
     * @this    {Object|Array}
     * @param   {*=}   k
     * @param   {*=}   v
     */    
    effins['attr'] = function(k, v) {
        var kMulti = typeof k == 'object' || typeof k == 'function';
        if (void 0 === v && !kMulti) {
            return attr(this[0], k); // GET
        }
        return k ? eachNode(this, function(e, x) {
            x = typeof v == 'function' ? v.call(e) : v;
            kMulti ? attr(e, k, x) : e.setAttribute(k, '' + x); 
        }) : (void 0 === v ? v : this); // undefined|this
    };

    /**
     * Remove data- attrs for each element in a collection.
     * @this  {Object|Array}
     * @param {Array|string}  keys  one or more SSV or CSV data attr keys or names
     */
    effins['deletes'] = function(keys) {
        if (void 0 === keys) { return eachNode(this, resetDataset); }
        keys = typeof keys == 'string' ? keys.split(ssv) : keys;
        keys = typeof keys == 'object' ? map(keys, datatize) : datatize(keys);
        return eachNode(this, removeAttr, keys);
    };
    /* or:
    effins['deletes'] = function(keys) {
        if (void 0 === keys) { return eachNode(this, resetDataset); }
        keys = typeof keys == 'string' ? keys.split(ssv) : keys;
        return eachNode(this, deletes, keys);
    }; */
    
    /**
     * Remove attrbutes for each element in a collection.
     * @this  {Object|Array}
     * @param {Array|string}  keys  one or more SSV or CSV attr names
     */
    effins['removeAttr'] = function(keys) {
        // split first to prevent splitting for each element
        return eachNode(this, removeAttr, typeof keys == 'string' ? keys.split(ssv) : keys);
    };

    xports['fn'] = effins;
    return xports;
}));