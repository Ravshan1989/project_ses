const { Client } = require('pg');

async function checkPermissions() {
  const client = new Client({
    connectionString: 'postgresql://project_ses_user:9O1Yv1nThXnC36LzN6BFrx6P45JpQYF2@dpg-cv66csqj1k6c73eqof1g-a.oregon-postgres.render.com/project_ses?ssl=true'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const roleRes = await client.query('SELECT id, name FROM roles WHERE name = \'REGION_HEAD\'');
    if (roleRes.rows.length === 0) {
      console.log('Role REGION_HEAD not found!');
      return;
    }

    const roleId = roleRes.rows[0].id;
    console.log(`Role REGION_HEAD ID: ${roleId}`);

    const permRes = await client.query('SELECT * FROM role_permissions WHERE role_id = $1', [roleId]);
    console.log('\nPermissions for REGION_HEAD:');
    permRes.rows.forEach(p => {
      console.log(`- Code: ${p.permissionCode} | View: ${p.canView} | Create: ${p.canCreate} | Edit: ${p.canEdit}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkPermissions();
