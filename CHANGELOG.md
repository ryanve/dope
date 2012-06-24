# CHANGELOG | [current](https://github.com/ryanve/domdata/blob/master/domdata.js)

## [1.4.0](https://github.com/ryanve/domdata/commit/49b381e43273e93de117c107a58c2ba49c1b16f1) (2012-06-24)
Replaced rare usage `domData.camelizeAll()`/`domData.datatizeAll()` methods with broader usage utilities to do the same thing: `domData.toArray()` and `domData.mapFilter()`. Instead of:

```js
domData.camelizeAll(list);
domData.datatizeAll(list);
```

use: 

```js
domData.mapFilter(domData.toArray(list), domData.camelize); 
domData.mapFilter(domData.toArray(list), domData.datatize);
```

Use `domData.toDataSelector(list)` for building selector strings.

## [1.3.0](https://github.com/ryanve/domdata/commit/aae50d8c0d9e78b19d3dcaf588f8f33658171c9d) (2012-06-23)
- Improved regexps, added number support to camelize/datatize to allow for numeric keys b/c `data-0="totally valid"`
- Optimize logic in `domData.dataset()` and `domData.fn.dataset()`, normalize `null`|`undefined` "gets" to `undefined`

## [1.2.0](https://github.com/ryanve/domdata/commit/74811530f55c89a7c6ec564773dcf41e5ff0c44c) (2012-06-19)
- Functions passed to `domData()` are fired, receiving `domData` as the first argument and `this === document`.