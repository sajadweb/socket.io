

String.prototype.toOnlineId = function () { return ("*" + this) };
String.prototype.toOnlineNs = function () { return ("*" + this + "*") };
String.prototype.toConnected = function () { return ("connected." + this) }

module.exports = {}
