const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'regionstat',
  password: 'postgres',
  port: 5432
});
client.connect();
client.query("SELECT username, role, \"organization_id\", \"department_id\" FROM \"users\" WHERE role = 'REGION_HEAD'")
  .then(res => console.log(res.rows))
  .catch(e => console.error(e))
  .finally(() => client.end());
