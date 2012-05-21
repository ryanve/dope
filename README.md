[domData](http://github.com/ryanve/domdata)
=======

HTML5 [dataset](http://dev.opera.com/articles/view/an-introduction-to-datasets/) API abstraction that works as a standalone lib or integrates into any [jQuery](http://jquery.com/)-compatible host. It runs screamin-fast, cross-browser, and [gzips < 1.5k](http://airve.github.com/js/domdata/domdata.min.js). Got data? =]

## Methods

### dataset() and .dataset()

#### unbound syntax

- domData.dataset(elem) // get object containing all data attributes
- domData.dataset(elem, key) // get data attribute
- domData.dataset(elem, key, value) // set data attribute
- domData.dataset(elem, object) // set multiple data attributes via key/value pairs
- domData.dataset(elem, [key]) // get [exact] data attribute (primitives render to correct type)

#### chainable syntax

- domData(elem).dataset() // get object containing all data attributes
- domData(elem).dataset(key) // get data attribute
- domData(elem).dataset(key, value) // set data attribute
- domData(elem).dataset(object) // set multiple data attributes via key/value pairs
- domData(elem).dataset([key]) // get [exact] data attribute (primitives render to correct type)

## License

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