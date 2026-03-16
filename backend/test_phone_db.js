const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'regionstat',
  password: 'postgres',
  port: 5432
});
client.connect();
client.query("SELECT username, \"phoneNumber\", \"isActive\", \"firstName\" FROM \"users\" ORDER BY \"createdAt\" DESC LIMIT 20")
  .then(res => console.log(res.rows))
  .catch(e => console.error(e))
  .finally(() => client.end());
