import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AuthService } from "./modules/auth/auth.service";

async function verifyLogins() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  const testAccounts = [
    { username: "user_olmaliq_sh", password: "ses12345", org: "Olmaliq sh" },
    { username: "user_angren_sh", password: "ses12345", org: "Angren sh" },
    {
      username: "user_nurafshon_sh",
      password: "ses12345",
      org: "Nurafshon sh",
    },
    { username: "user_bekobod_t", password: "ses12345", org: "Bekobod t" },
    { username: "user_chinoz_t", password: "ses12345", org: "Chinoz t" },
    { username: "user_qibray_t", password: "ses12345", org: "Qibray t" },
  ];

  console.log("--- TESTING LOGIN CREDENTIALS ---\n");

  for (const account of testAccounts) {
    try {
      const result = await authService.login({
        username: account.username,
        password: account.password,
      });

      if (result.access_token && result.user) {
        console.log(
          `✅ ${account.org.padEnd(20)} | Login: ${account.username.padEnd(25)} | Status: SUCCESS`,
        );
        console.log(
          `   Organization: ${result.user.organization?.name || "N/A"}`,
        );
        console.log(`   Role: ${result.user.role}\n`);
      }
    } catch (error) {
      console.log(
        `❌ ${account.org.padEnd(20)} | Login: ${account.username.padEnd(25)} | Status: FAILED`,
      );
      console.log(`   Error: ${error.message}\n`);
    }
  }

  console.log("--- LOGIN VERIFICATION COMPLETE ---");
  await app.close();
}

verifyLogins();
