import { execSync } from 'child_process';

const environment = process.env.NODE_ENV || 'development';

if (environment === 'production') {
  execSync('webpack --config webpack.prod.js', { stdio: 'inherit' });
} else {
  execSync('webpack --config webpack.dev.js', { stdio: 'inherit' });
}
