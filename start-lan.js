const { spawn } = require('child_process');
const os = require('os');

// Find active Wi-Fi / LAN IPv4 address (ignoring VPNs like ProTUN / TAP)
const interfaces = os.networkInterfaces();
let selectedIp = null;

for (const [name, addrs] of Object.entries(interfaces)) {
  const lower = name.toLowerCase();
  if (lower.includes('protun') || lower.includes('tap') || lower.includes('vpn')) {
    continue;
  }
  for (const addr of addrs) {
    if (
      addr.family === 'IPv4' &&
      !addr.internal &&
      !addr.address.startsWith('169.254') &&
      !addr.address.startsWith('10.2.')
    ) {
      selectedIp = addr.address;
      break;
    }
  }
  if (selectedIp) break;
}

// Fallback to Wi-Fi adapter IP if not found
if (!selectedIp) {
  selectedIp = '10.110.65.1';
}

console.log('\n=============================================================');
console.log('📡 Bypassing VPN: Binding Expo to Real Wi-Fi IP:', selectedIp);
console.log('📱 Phone Expo Go URL: exp://' + selectedIp + ':8081');
console.log('=============================================================\n');

process.env.REACT_NATIVE_PACKAGER_HOSTNAME = selectedIp;

const child = spawn('npx', ['expo', 'start', '--host', 'lan', '-c'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code) => process.exit(code || 0));
