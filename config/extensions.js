

String.prototype.toOnlineId = function () { return ("*" + this) };
String.prototype.toOnlineNs = function () { return ("*" + this + "*") };

const x = new String('hi');
console.log(x.toOnlineId());

module.exports = {}
