const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: './env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function dumpSchema() {
  await client.connect();

  // Get tables
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);

  let sql = '';

  for (const row of tablesRes.rows) {
    const tableName = row.table_name;

    // Get columns
    const columnsRes = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);

    sql += `CREATE TABLE ${tableName} (\n`;
    const cols = [];
    for (const col of columnsRes.rows) {
      let colDef = `  ${col.column_name} ${col.data_type}`;
      if (col.column_default) colDef += ` DEFAULT ${col.column_default}`;
      if (col.is_nullable === 'NO') colDef += ' NOT NULL';
      cols.push(colDef);
    }
    sql += cols.join(',\n');
    sql += '\n);\n\n';

    // Get primary key
    const pkRes = await client.query(`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY'
    `, [tableName]);

    if (pkRes.rows.length > 0) {
      const pkCols = pkRes.rows.map(r => r.column_name);
      sql += `ALTER TABLE ${tableName} ADD PRIMARY KEY (${pkCols.join(', ')});\n\n`;
    }

    // Get foreign keys
    const fkRes = await client.query(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = $1 AND tc.constraint_type = 'FOREIGN KEY'
    `, [tableName]);

    for (const fk of fkRes.rows) {
      sql += `ALTER TABLE ${tableName} ADD FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name});\n`;
    }
    sql += '\n';
  }

  fs.writeFileSync('../database/supabase_export.sql', sql);
  console.log('Database schema exported to ../database/supabase_export.sql');

  await client.end();
}

dumpSchema().catch(console.error);
