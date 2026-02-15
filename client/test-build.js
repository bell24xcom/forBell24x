const { exec } = require('child_process');

console.log('Testing build process...');

exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error('Build failed:', error);
    return;
  }
  
  if (stderr) {
    console.error('Build stderr:', stderr);
    return;
  }
  
  console.log('Build stdout:', stdout);
  console.log('Build completed successfully!');
});
