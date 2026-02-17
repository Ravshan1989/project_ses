import { Controller, Get } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Controller('version')
export class VersionController {

    @Get('latest')
    getLatestVersion() {
        // 1. Read version from version.json in backend public folder
        const versionPath = path.join(process.cwd(), 'public', 'version.json');
        if (fs.existsSync(versionPath)) {
            const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
            return versionData;
        }
        return { version: '1.0.0', downloadUrl: 'https://projectses-production.up.railway.app/public/app-release.apk' };
    }
}
