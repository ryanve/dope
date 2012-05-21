[domData](http://github.com/ryanve/domdata)
=======

domData is an HTML5 [dataset](http://dev.opera.com/articles/view/an-introduction-to-datasets/) API abstraction that works as a standalone lib or as a plugin for jQuery or jQuery-compatible hosts. It runs screamin-fast, cross-browser, [gzips < 1.5k](http://airve.github.com/js/domdata/domdata.min.js), and mimics the [specification](http://www.w3.org/TR/2010/WD-html5-20101019/elements.html#embedding-custom-non-visible-data-with-the-data-attributes) / [native implementation](http://dev.opera.com/articles/view/an-introduction-to-datasets/) as much as possible. Got data? =]

# domData()

The `domData()` function is a simple OO **wrapper** that works like the jQuery function.

```js
domData(element)       // wrap a DOM element
domData(elementArray)  // wrap NodeList or array of DOM elements
domData(selector)      // wrap element(s) matched by a selector string (uses querySelectorAll)
```

# Integration 

When used **standalone**, domData's methods are accessible via the `domData` variable. It can be aliased in a closure like this:

```js
(function($) {
    // use $ as an alias for domData in here
    $(document.body).dataset('foo', 'bar');
}(domData));
```

When used alongside a **host** lib like [jQuery](http://jquery.com/), domData's methods are also automatically integrated into the host:

```js
(function($) {
    // use $ as an alias for jQuery in here
    $(document.body).dataset('foo', 'bar');
}(jQuery));
```

# Methods

To simplify the docs below, let `$` represent `domData` or the host lib.

## chainable

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

## top-level

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

### $.render()

```js
$.render(str)        // convert stringified primitives to correct value, e.g. "true" to true 
```

```js
$.render('10')      // 10
$.render('true')    // true
```

### $.toDataSelector()

```js
$.toDataSelector(keys)   // convert an array (or CSV or SSV string) of data keys into a selector string
```

```js
$.toDataSelector('a b cD')  // "[data-a],[data-b],[data-c-d]"
```

### $.camelize()

```js
$.camelize(str)       // convert a dashed data- string into camelCase
```

```js
$.camelize('data-mia-wallace')  // 'miaWallace'
$.camelize('mia-wallace')       // 'miaWallace'
```

### $.datatize()

```js
$.datatize(str)       // convert a camelized string into a lowercase dashed data- attribute name
```

```js
$.datatize('miaWallace')  // data-mia-wallace
```

### $.camelizeAll()

```js
$.camelizeAll(list)  // camelize values from an array (or CSV or SSV string) and return compact array
```

```js
$.camelizeAll('data-mia-wallace data-vincent-vega')  // ['miaWallace', 'vincentVega']
```

### $.datatizeAll()

```js
$.datatizeAll(list)  // datatize values from an array (or CSV or SSV string) and return compact array
```

```js
$.datatizeAll('miaWallace vincentVega')  // ['data-mia-wallace', 'data-vincent-vega']
```

### domData.bridge()

The bridge handles the integration of methods into a host. It augments the host with the above-detailed methods. If a host is detected at runtime, the bridge will run once automatically. Existing methods on the host are **not** overwritten unless the 2nd param is set to `true`.

```js
domData.bridge(host)       // integrate domData into host (existing methods are not overwritten)
domData.bridge(host, true) // integrate domData into host (overwriting existing methods, if any)
```

```js
domData.bridge(jQuery)     // integrate domData's methods into jQuery
domData.bridge(ender)      // integrate domData's methods into ender
```

### domData.noConflict()

Destroy the global `domData` and return `domData`. Optionally call a function that gets `domData` supplied as the first arg.

```js
domData.noConflict(); // simply destroys the global
```

```js
domData.noConflict(function(domData){  
  /* use domData in here */  
});
```

# [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) usage

```js
define('domdata', domData.noConflict); // define the module and simultaneously destroy the global
```

```js
define('domdata', function(){ return domData; }); // define the module and keep the global too
```

# CDN

domData is available on [airve.github.com](http://airve.github.com/)

# License

### [domData](http://github.com/ryanve/domdata) is available under the [MIT license](http://en.wikipedia.org/wiki/MIT_License)

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