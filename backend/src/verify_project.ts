const BASE_URL = "http://127.0.0.1:3007/api/v1";

async function verify() {
  try {
    console.log("--- STARTING VERIFICATION ---");

    // 1. Login as District User (Olmaliq)
    console.log("1. Logging in as District User (olmaliq_test)...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "olmaliq_test", password: "test1234" }),
    });
    const loginData: any = await loginRes.json();
    if (!loginRes.ok)
      throw new Error("Olmaliq login failed: " + JSON.stringify(loginData));
    const districtToken = loginData.access_token;
    const districtOrg = loginData.user.organization.id;
    console.log("   Logged in. Org ID:", districtOrg);

    // 2. Submit a Flu Report
    console.log("2. Submitting Flu Report for today...");
    const today = new Date().toISOString().split("T")[0];
    const submitRes = await fetch(`${BASE_URL}/daily-reports/flu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${districtToken}`,
      },
      body: JSON.stringify({
        reportDate: today,
        organizationId: districtOrg,
        ari_total: 60,
        pneu_total: 15,
        flu_total: 8,
        sari_total: 4,
        death_total: 0,
        isTest: true,
      }),
    });
    if (submitRes.ok) {
      console.log("   Report submitted successfully.");
    } else {
      console.error("   Report submission failed:", await submitRes.text());
      return;
    }

    // 3. Login as Region User (Viloyat)
    console.log("3. Logging in as Region User (viloyat_test)...");
    const regLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "viloyat_test", password: "test1234" }),
    });
    const regLoginData: any = await regLoginRes.json();
    if (!regLoginRes.ok)
      throw new Error("Viloyat login failed: " + JSON.stringify(regLoginData));
    const regionToken = regLoginData.access_token;
    console.log("   Logged in.");

    // 4. Check Weekly Summary
    console.log("4. Fetching Weekly Summary for Region...");
    const start = today;
    const end = today;
    const summaryRes = await fetch(
      `${BASE_URL}/daily-reports/weekly-summary?startDate=${start}&endDate=${end}&isTest=true`,
      {
        headers: { Authorization: `Bearer ${regionToken}` },
      },
    );

    const data: any = await summaryRes.json();
    console.log(`   Found ${data.length} districts in summary.`);

    const olmaliqEntry = data.find(
      (d: any) => d.organization.name === "Olmaliq sh",
    );
    if (olmaliqEntry) {
      console.log("   SUCCESS: Olmaliq record found in Regional summary.");
      console.log(
        `   Data: ARI=${olmaliqEntry.ari_total}, Pneu=${olmaliqEntry.pneu_total}`,
      );
    } else {
      console.error("   FAILURE: Olmaliq record NOT found in summary!");
      console.log(
        "   Full data received counts by name:",
        data.map((d: any) => d.organization.name),
      );
    }

    const otherDistricts = data.filter(
      (d: any) => d.organization.name !== "Olmaliq sh",
    );
    if (otherDistricts.length > 0) {
      console.log(
        `   SUCCESS: ${otherDistricts.length} other districts also listed (with 0 data or reports).`,
      );
    }

    console.log("--- VERIFICATION COMPLETE ---");
  } catch (error: any) {
    console.error("VERIFICATION FAILED ERROR:", error.message);
  }
}

verify();
