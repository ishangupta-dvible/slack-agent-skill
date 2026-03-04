const http = require('http');

console.log("\n[TEST AGENT] Starting execution...");
console.log("[TEST AGENT] Routing egress traffic through 127.0.0.1:8080 Proxy Tunnel...");

// 1. Authorized Connection (Should Pass)
console.log("[TEST AGENT] Attempting to handshake with authorized domain (slack.com)...");

const req1 = http.request({
    host: '127.0.0.1',
    port: 8080,
    method: 'CONNECT',
    path: 'slack.com:443'
});

req1.on('connect', (res1, socket1, head1) => {
    console.log(`[TEST AGENT] ✅ Authorized connection successful! Proxy Status: ${res1.statusCode}`);
    socket1.destroy(); // End tunnel

    // 2. Unauthorized Connection (Should Block)
    console.log("\n[TEST AGENT] Attempting to exfiltrate data to rogue external endpoint (google.com)...");

    const req2 = http.request({
        host: '127.0.0.1',
        port: 8080,
        method: 'CONNECT',
        path: 'google.com:443'
    });

    req2.on('connect', (res2, socket2, head2) => {
        if (res2.statusCode === 403) {
            console.log(`[TEST AGENT] ✅ Mathmatically sound! Proxy successfully killed the malicious data exfiltration tunnel.`);
            console.log(`   -> Proxy Enforcement Status: 403 Forbidden`);
            process.exit(0);
        } else {
            console.log(`[TEST AGENT] ❌ ERROR: Egress was not blocked! Request reached target with Proxy Status: ${res2.statusCode}`);
            process.exit(1);
        }
    });

    req2.on('error', (err) => {
        console.error(`[TEST AGENT] ⚠️ Tunnel crashed:`, err.message);
        process.exit(1);
    });

    req2.end();

});

req1.on('error', (err) => {
    console.error(`[TEST AGENT] ❌ FATAL ERROR: Authorized connection failed! ->`, err.message);
    process.exit(1);
});

req1.end();
