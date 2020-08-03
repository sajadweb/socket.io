require('dotenv').config()
const NTypes = require('./model/notifications_type');
const subscriber = require('./redis/sub');



subscriber.subscribe(NTypes.one);
subscriber.subscribe(NTypes.multi);
subscriber.subscribe(NTypes.all);
subscriber.subscribe(NTypes.ns);










