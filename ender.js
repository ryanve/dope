/* bridge for ender.jit.su */
(function ($, name) {
    if (!$ || typeof require != 'function')
        return;
    var xport = require(name);
    $['ender'](xport['fn'], true);
    for (name in xport)
        'fn' == name || ($[name] = xport[name]);    
}(this['ender'], 'dope'));