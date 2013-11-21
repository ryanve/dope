# [dope](../../)

<b>dope</b> is cross-browser JavaScript module for working with HTML attributes. It includes an HTML5 [dataset](http://dev.opera.com/articles/view/an-introduction-to-datasets/) API abstraction that adheres to the [specification](http://www.w3.org/TR/2010/WD-html5-20101019/elements.html#embedding-custom-non-visible-data-with-the-data-attributes). It works standalone or can integrate into jQuery-compatible hosts. It runs screamin-fast and [gzips < 2k](http://airve.github.com/js/dope/dope.min.js). Got data? =)

```sh
$ npm install dope
```

## API ([2.2](CHANGELOG.md))

In standalone usage, methods are available on the **dope** namespace. The docs below use `$` to denote `dope` or a host library like jQuery or ender.

```js
dope.dataset(document.body, 'foo', 'bar'); // standalone
$.dataset(document.body, 'foo', 'bar');    // integrated
```

### Chain methods

#### $.fn.attr()

```js
$(elem).attr(key)        // get attribute on elem (or 1st elem in collection)
$(elem).attr(key, value) // set attribute on elem (or on collection)
$(elem).attr(object)     // set multiple attributes via key/value pairs
```

#### $.fn.removeAttr()

```js
$(elem).removeAttr(keys) // remove 1 or more SSV attributes from elem or collection
```

#### $.fn.dataset()

```js
$(elem).dataset()           // get all data-* attributes on elem (or 1st elem in collection)
$(elem).dataset(key)        // get data-* attribute on elem (or 1st elem in collection)
$(elem).dataset(key, value) // set data-* attribute on elem (or on collection)
$(elem).dataset(object)     // set multiple data-* attributes via key/value pairs
$(elem).dataset([key])      // get [exact] data-* attribute (primitives render to correct type)
```

```js
$(document.body).dataset('movieName', Pulp Fiction) // set <body data-movie-name="Pulp Fiction">
$(document.body).dataset('movieName')               // returns "Pulp Fiction"
$('div').dataset('stars', 5)                        // set <div data-stars="5"> on all matched divs
$('div').dataset('stars')                           // returns "5"
$('div').dataset(['stars'])                         // returns 5
```

#### $.fn.deletes()

```js
$(elem).deletes(keys) // remove 1 or more SSV data-* attributes from elem or collection
```

```js
$(document.body).deletes('movieName')      // remove [data-movie-name] from the <body> element
```

### Static methods

#### $.attr()

```js
$.attr(elem, key)        // get attribute on elem
$.attr(elem, key, value) // set attribute on elem
$.attr(elem, object)     // set multiple attributes via key/value pairs
```

#### $.removeAttr()

```js
$.removeAttr(elem, keys) // remove 1 or more SSV attributes from elem (or from collection)
```

#### $.dataset()

```js
$.dataset(elem)             // get all data-* attrs on elem
$.dataset(elem, key)        // get data-* attribute on elem
$.dataset(elem, key, value) // set data-* attribute on elem
$.dataset(elem, object)     // set multiple data-* attributes via key/value pairs
$.dataset(elem, [key])      // get [exact] data-* attribute (primitives parse to correct type)
```

```js
$.dataset(document.body, 'movieName', Pulp Fiction) // set <body data-movie-name="Pulp Fiction">
$.dataset(document.body, 'movieName')               // returns "Pulp Fiction"
```

#### $.deletes()

```js
$.deletes(elem, keys) // remove 1 or more SSV data-* attributes from elem (or from collection)
```

```js
$.deletes(document.body, 'movieName')  // remove [data-movie-name] from the <body> element
```

#### $.queryData()

```js
$.queryData(keys)  // get elements by data key (keys can be an array or CSV or SSV string)
```

```js
$.queryData('miaWallace vincentVega')  // Delegate to $("[data-mia-wallace],[data-vincent-vega]")
```

#### $.trim()

```js
$.trim(str) // Trim surrounding whitespace.
```

#### $.parse()

```js
$.parse(str) // Convert stringified primitives to correct value. Non-strings are unchanged.
$.parseJSON(str) // Parse JSON. Safely wraps `JSON.parse` so that it won't throw an error.
```

`$.parse` and `$.parseJSON` trim `"string"` inputs before parsing them.

```js
$.parse('yo')        // 'yo'
$.parse('10')        // 10
$.parse('true')      // true
$.parse('null')      // null
$.parse('undefined') // undefined
$.parse('Infinity')  // Infinity
$.parse('NaN')       // NaN
```

#### $.camelize()

```js
$.camelize(str)       // convert a dashed data- string into camelCase
```

```js
$.camelize('data-mia-wallace')  // 'miaWallace'
$.camelize('mia-wallace')       // 'miaWallace'
$.camelize(47)                  // '47'
```

#### $.datatize()

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

## [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) usage

```js
define('dope', function() { 
    return dope; 
});
```

## Compatibility

Supports all major browsers. Tested in Chrome, FF3+, IE7+, Opera, and Safari.

## Related modules

- [atts](https://github.com/ryanve/atts): attributes module

## License: [MIT](http://en.wikipedia.org/wiki/MIT_License)

Copyright (C) 2012 by [Ryan Van Etten](https://github.com/ryanve)