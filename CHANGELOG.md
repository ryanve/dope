# CHANGELOG | [current](https://github.com/ryanve/dope/blob/master/dope.js)

## [1.5.0](https://github.com/ryanve/dope/commit/629a0931e97ac7c5b2b7f84b9186aa1ca2b5096d) (2012-09-09)
- Rename repo/export from "domdata"/"domData" to "dope"

## [1.4.1](https://github.com/ryanve/dope/commit/629a0931e97ac7c5b2b7f84b9186aa1ca2b5096d) (2012-06-24)
- Made it so that `dope.render()` can properly render `NaN` and `Infinity`.

## [1.4.0](https://github.com/ryanve/dope/commit/49b381e43273e93de117c107a58c2ba49c1b16f1) (2012-06-24)
Replaced rare usage `dope.camelizeAll()`/`dope.datatizeAll()` methods with broader usage utilities to do the same thing: `dope.toArray()` and `dope.mapFilter()`. Instead of:

```js
dope.camelizeAll(list);
dope.datatizeAll(list);
```

use: 

```js
dope.mapFilter(dope.toArray(list), dope.camelize); 
dope.mapFilter(dope.toArray(list), dope.datatize);
```

Use `dope.toDataSelector(list)` for building selector strings.

## [1.3.0](https://github.com/ryanve/dope/commit/aae50d8c0d9e78b19d3dcaf588f8f33658171c9d) (2012-06-23)
- Improved regexps, added number support to camelize/datatize to allow for numeric keys b/c `data-0="totally valid"`
- Optimize logic in `dope.dataset()` and `dope.fn.dataset()`, normalize `null`|`undefined` "gets" to `undefined`

## [1.2.0](https://github.com/ryanve/dope/commit/74811530f55c89a7c6ec564773dcf41e5ff0c44c) (2012-06-19)
- Functions passed to `dope()` are fired, receiving `dope` as the first argument and `this === document`.