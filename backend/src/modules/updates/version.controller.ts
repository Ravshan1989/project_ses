import { Controller, Get } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";

@Controller("version")
export class VersionController {
  @Get("latest")
  getLatestVersion() {
    // 1. Read version from version.json (robust path resolution)
    const versionPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "public",
      "version.json",
    );
    if (fs.existsSync(versionPath)) {
      const versionData = JSON.parse(fs.readFileSync(versionPath, "utf8"));
      return versionData;
    }
    // Try fallback path relative to cwd if __dirname fails
    const fallbackPath = path.join(
      process.cwd(),
      "backend",
      "public",
      "version.json",
    );
    if (fs.existsSync(fallbackPath)) {
      const versionData = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
      return versionData;
    }
    // Force 1.0.0 as a last resort to stop notification loop until new APK is built
    return {
      version: "1.0.0",
      downloadUrl: "https://project-ses.onrender.com/public/app-release.apk",
      notes: "Jadvallar va Mudir tahlili yangilanishi",
    };
  }
}
