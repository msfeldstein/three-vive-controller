module.exports = function(object, extension) {
    for (var key in extension) {
        object[key] = extension[key];
    }
}
