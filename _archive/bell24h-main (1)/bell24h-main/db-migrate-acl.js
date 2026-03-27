const { exec } = require('child_process');

console.log('Starting database migration for ACL tables...');

// Run database migration
exec('npm run db:push', (error, stdout, stderr) => {
  if (error) {
    console.error('Error running database migration:', error);
    return;
  }
  
  console.log('Database migration output:');
  console.log(stdout);
  
  if (stderr) {
    console.error('Database migration errors:');
    console.error(stderr);
  }
  
  console.log('Database migration completed successfully.');
  console.log('ACL tables have been created in the database.');
});