const redisNsps = {
  ID: "/ID",
  OFFLINE: "/OFFLINE",
  MULTI_OFFLINE: "/MULTI" + "/OFFLINE",
  SENT: "/SENT",
  NAMESPACE: "/NAMESPACE",
  NAMESPACE_OFFLINE: "/NAMESPACE/OFFLINE",
  SOCKET: "socketNsp",
  S2A: "s2a",
  EX: 'EX',
  MATCH: 'match',
}

Object.freeze(redisNsps);

module.exports = redisNsps;
