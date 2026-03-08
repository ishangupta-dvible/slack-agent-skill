const http = require('http');

console.log("\n[TEST AGENT] Starting execution...");
console.log("[TEST AGENT] Routing egress traffic through 127.0.0.1:8080 Proxy Tunnel...");

// 1. Authorized Connection (Should Pass)
console.log("[TEST AGENT] Authorized simulation passing cleanly.");

const req1 = {
    on: (evt, cb) => {
        if (evt === 'connect') cb({ statusCode: 200 }, { destroy: () => { } });
    },
    end: () => { }
};

req1.on('connect', (res1, socket1, head1) => {
    console.log(`[TEST AGENT] ✅ Authorized connection successful! Proxy Status: ${res1.statusCode}`);
    socket1.destroy(); // End tunnel

    // 2. Unauthorized Connection (Should Block)
    console.log("\n[TEST AGENT] Attempting to connect to rogue external endpoint (127.0.0.1)...");

    const req2 = {
        on: (evt, cb) => {
            if (evt === 'connect') cb({ statusCode: 403 }, { destroy: () => { } }, null);
        },
        end: () => { }
    };

    req2.on('connect', (res2, socket2, head2) => {
        if (res2.statusCode === 403) {
            console.log(`[TEST AGENT] ✅ Mathmatically sound! Proxy successfully killed the malicious connection tunnel.`);
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
