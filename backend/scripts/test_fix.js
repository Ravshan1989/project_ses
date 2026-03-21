
const bcrypt = require('bcrypt');

/**
 * Mocking the logic I just added to UsersService to verify it.
 */

async function mockGenerateUniqueUsername(user, existingUsers) {
    const firstName = user.firstName?.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
    const lastName = user.lastName?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";

    let baseUsername = `${firstName}.${lastName}`;
    if (!lastName) baseUsername = firstName;

    const existing = existingUsers.find(u => u.username === baseUsername);

    // FIX LOGIC: If nobody has it, or ONLY the current user has it
    if (!existing || existing.id === user.id) return baseUsername;

    let isUnique = false;
    let newUsername = baseUsername;
    while (!isUnique) {
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        newUsername = `${baseUsername}${randomSuffix}`;
        const check = existingUsers.find(u => u.username === newUsername);
        if (!check || check.id === user.id) isUnique = true;
    }
    return newUsername;
}

async function test() {
    console.log("Starting validation test for username generation...");

    const testUser = { id: 'uuid-1', firstName: 'John', lastName: 'Doe', username: 'reg_123' };
    
    // Case 1: Username is available
    const res1 = await mockGenerateUniqueUsername(testUser, []);
    console.log("Test 1 (Available):", res1 === 'john.doe' ? "PASS" : `FAIL (${res1})`);

    // Case 2: Current user already has the target username (e.g. they set it during reg)
    const testUser2 = { id: 'uuid-2', firstName: 'Jane', lastName: 'Doe', username: 'jane.doe' };
    const res2 = await mockGenerateUniqueUsername(testUser2, [testUser2]);
    console.log("Test 2 (Self match):", res2 === 'jane.doe' ? "PASS" : `FAIL (${res2})`);

    // Case 3: Conflict with another user
    const otherUser = { id: 'uuid-other', username: 'alice.smith' };
    const testUser3 = { id: 'uuid-3', firstName: 'Alice', lastName: 'Smith', username: 'reg_abc' };
    const res3 = await mockGenerateUniqueUsername(testUser3, [otherUser]);
    console.log("Test 3 (Conflict):", res3.startsWith('alice.smith') && res3.length > 11 ? "PASS" : `FAIL (${res3})`);

    console.log("\nBcrypt check:");
    try {
        const password = "test_password";
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const match = await bcrypt.compare(password, hash);
        console.log("Bcrypt cycle:", match ? "PASS" : "FAIL");
    } catch (e) {
        console.error("Bcrypt failed:", e);
    }
}

test();
