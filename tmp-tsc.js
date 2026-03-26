const { execSync } = require('child_process');
try {
  console.log('Running tsc...');
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('Success!');
} catch (e) {
  console.log('ERRORS:');
  console.log(e.stdout.toString('utf8'));
}
