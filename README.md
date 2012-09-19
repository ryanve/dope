[dope](http://github.com/ryanve/dope) - [2.0](https://github.com/ryanve/dope/blob/master/CHANGELOG.md)
=======

dope is an HTML5 [dataset](http://dev.opera.com/articles/view/an-introduction-to-datasets/) API abstraction that works as a standalone lib or as a plugin for jQuery or jQuery-compatible hosts. It runs screamin-fast, cross-browser, [gzips < 2k](http://airve.github.com/js/dope/dope.min.js), and mimics the [specification](http://www.w3.org/TR/2010/WD-html5-20101019/elements.html#embedding-custom-non-visible-data-with-the-data-attributes) / [native implementation](http://dev.opera.com/articles/view/an-introduction-to-datasets/) as much as possible. Got data? =]


### notes

In standalone usage, methods are available on the **dope** namespace: 

```js
dope.dataset(document.body, 'foo', 'bar');
```

The docs below use `$` to denote `dope` or a host lib (like jQuery).

# methods

## chain

### $.fn.dataset()

```js
$(elem).dataset()           // get object containing all data attributes on elem (or 1st elem in set)
$(elem).dataset(key)        // get data attribute on elem (or 1st elem in set)
$(elem).dataset(key, value) // set data attribute on elem (or on all the elems in set)
$(elem).dataset(object)     // set multiple data attributes via an object's key/value pairs
$(elem).dataset([key])      // get [exact] data attribute (primitives render to correct type)
```

```js
$(document.body).dataset('movieName', Pulp Fiction) // set <body data-movie-name="Pulp Fiction">
$(document.body).dataset('movieName')               // returns "Pulp Fiction"
$('div').dataset('stars', 5)                        // set <div data-stars="5"> on all matched divs
$('div').dataset('stars')                           // returns "5"
$('div').dataset(['stars'])                         // returns 5
```

### $.fn.deletes()

```js
$(elem).deletes(keys) // remove 1 or more space-separated data attrs from elem (or all elems in set)
```

```js
$(document.body).deletes('movieName')      // remove [data-movie-name] from the <body> element
```

## static

### $.dataset()

```js
$.dataset(elem )            // get object containing all data attrs on elem (or 1st elem in set)
$.dataset(elem, key)        // get data attribute on elem (or 1st elem in set)
$.dataset(elem, key, value) // set data attribute on elem (or on all the elems in set)
$.dataset(elem, object)     // set multiple data attributes via key/value pairs
$.dataset(elem, [key])      // get [exact] data attribute (primitives render to correct type)
```

```js
$.dataset(document.body, 'movieName', Pulp Fiction) // set <body data-movie-name="Pulp Fiction">
$.dataset(document.body, 'movieName')               // returns "Pulp Fiction"
```


### $.deletes()

```js
$.deletes(elem, keys) // remove 1 or more space-separated data attrs from elem (or all elems in set)
```

```js
$.deletes(document.body, 'movieName')      // remove [data-movie-name] from the <body> element
```

### $.queryData()

```js
$.queryData(keys)         // get elements by data key (keys can be an array or CSV or SSV string)
```

```js
$.queryData('miaWallace vincentVega')  // Delegate to $("[data-mia-wallace],[data-vincent-vega]")
```

### $.parse()

```js
$.parse(str) // Convert stringified primitives to correct value. (Non-strings are unchanged.)
$.parse(str, true) // Parse JSON (in a safe wrapper that won't throw an error)
```

```js
$.parse('yo')        // 'yo'
$.parse('10')        // 10
$.parse('true')      // true
$.parse('null')      // null
$.parse('undefined') // undefined
$.parse('Infinity')  // Infinity
$.parse('NaN')       // NaN
```

### $.camelize()

```js
$.camelize(str)       // convert a dashed data- string into camelCase
```

```js
$.camelize('data-mia-wallace')  // 'miaWallace'
$.camelize('mia-wallace')       // 'miaWallace'
$.camelize(47)                  // '47'
```

### $.datatize()

```js
$.datatize(str)       // convert a camelized string into a lowercase dashed data- attribute name
```

```js
$.datatize('miaWallace')  // 'data-mia-wallace'
$.datatize(47)            // 'data-47'
$.datatize(0)             // 'data-0'
$.datatize(null)          // ''
$.datatize('')            // ''
$.datatize(undefined)     // ''
```

### dope.bridge()

The bridge handles the integration of methods into a host. It augments the host with the above-detailed methods. To integrate into jQuery or a jQuery-compatible host, call the bridge as demonstrated below:

```js
dope.bridge($)       // integrate dope into $ (existing methods are not overwritten)
dope.bridge($, true) // integrate dope into $ (overwriting existing methods, if any)
```

# [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) usage

```js
define('dope', function(){ return dope; });
```

# Compatibility

Supports all major browsers. (Tested in Chrome / FF3+ / IE7+ / Opera / Safari)

# CDN

dope is available on [airve.github.com](http://airve.github.com/)

# License

### [dope](http://github.com/ryanve/dope) is available under the [MIT license](http://en.wikipedia.org/wiki/MIT_License)

Copyright (C) 2012 by [Ryan Van Etten](https://github.com/ryanve)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.