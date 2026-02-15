
import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:3000'; // Adjust if needed
const CHIRCHIQ_ORG_ID = '...'; // We will fetch this dynamically

// Users
const users = {
    operator: { username: 'operator_chirchiq', password: 'ses12345', token: '' },
    mudir: { username: 'mudir_chirchiq', password: 'ses12345', token: '' },
    rahbar: { username: 'rahbar_chirchiq', password: 'ses12345', token: '' }
};

async function login(role: string) {
    try {
        const user = users[role];
        const res = await axios.post(`${API_URL}/auth/login`, {
            username: user.username,
            password: user.password
        });
        user.token = res.data.access_token;
        console.log(`[OK] Login successful: ${role}`);
    } catch (error) {
        console.error(`[FAIL] Login failed for ${role}:`, error.message);
        process.exit(1);
    }
}

async function runTest() {
    console.log("=== STARTING APPROVAL WORKFLOW TEST ===");

    // 1. Log in all users
    await login('operator');
    await login('mudir');
    await login('rahbar');

    // 2. Create a Report (Operator)
    const today = new Date().toISOString().split('T')[0];
    let reportId = '';

    try {
        console.log("\n--- STEP 1: CREATE REPORT (Operator) ---");
        const res = await axios.post(`${API_URL}/daily-reports/flu`, {
            reportDate: today,
            flu_total: 10,
            ari_total: 20,
            isTest: true
        }, {
            headers: { Authorization: `Bearer ${users.operator.token}` }
        });
        reportId = res.data.id;
        console.log(`[OK] Report created. ID: ${reportId}`);
        console.log(`Initial Status: ${res.data.status}`);
    } catch (error) {
        console.error("[FAIL] Create report:", error.response?.data || error.message);
        process.exit(1);
    }

    // 3. Submit Report (Operator)
    try {
        console.log("\n--- STEP 2: SUBMIT REPORT (Operator) ---");
        const res = await axios.patch(`${API_URL}/daily-reports/flu/${reportId}/submit`, {}, {
            headers: { Authorization: `Bearer ${users.operator.token}` }
        });
        console.log(`[OK] Report Submitted.`);
        console.log(`Status: ${res.data.status}`);
        if (res.data.status !== 'SUBMITTED') throw new Error("Status mismatch");
    } catch (error) {
        console.error("[FAIL] Submit report:", error.response?.data || error.message);
        process.exit(1);
    }

    // 4. Verify Report (Mudir)
    try {
        console.log("\n--- STEP 3: VERIFY REPORT (Mudir) ---");
        const res = await axios.patch(`${API_URL}/daily-reports/flu/${reportId}/verify`, {}, {
            headers: { Authorization: `Bearer ${users.mudir.token}` }
        });
        console.log(`[OK] Report Verified.`);
        console.log(`Status: ${res.data.status}`);
        if (res.data.status !== 'VERIFIED') throw new Error("Status mismatch");
    } catch (error) {
        console.error("[FAIL] Verify report:", error.response?.data || error.message);
        process.exit(1);
    }

    // 5. Approve Report (Rahbar)
    try {
        console.log("\n--- STEP 4: APPROVE REPORT (Rahbar) ---");
        const res = await axios.patch(`${API_URL}/daily-reports/flu/${reportId}/approve`, {}, {
            headers: { Authorization: `Bearer ${users.rahbar.token}` }
        });
        console.log(`[OK] Report Approved.`);
        console.log(`Status: ${res.data.status}`);
        if (res.data.status !== 'APPROVED') throw new Error("Status mismatch");
    } catch (error) {
        console.error("[FAIL] Approve report:", error.response?.data || error.message);
        process.exit(1);
    }

    console.log("\n=== TEST COMPLETED SUCCESSFULLY ===");
}

runTest();
