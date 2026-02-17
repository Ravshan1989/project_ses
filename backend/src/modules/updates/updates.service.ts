import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UpdatesService {
    private readonly logger = new Logger(UpdatesService.name);
    // Path where updates are stored
    private readonly updatesDir = path.join(process.cwd(), 'public', 'updates');

    constructor() {
        // Ensure directory exists
        if (!fs.existsSync(this.updatesDir)) {
            try {
                fs.mkdirSync(this.updatesDir, { recursive: true });
            } catch (e) {
                this.logger.error(`Could not create updates directory: ${e.message}`);
            }
        }
    }

    getManifest() {
        let manifestPath = path.join(this.updatesDir, 'android-index.json');
        if (!fs.existsSync(manifestPath)) {
            manifestPath = path.join(this.updatesDir, 'metadata.json');
        }

        // Fallback or logic to find latest
        if (!fs.existsSync(manifestPath)) {
            return null;
        }

        try {
            return fs.readFileSync(manifestPath, 'utf8');
        } catch (e) {
            this.logger.error(`Error reading manifest: ${e.message}`);
            return null;
        }
    }

    getAssetPath(filename: string) {
        // Check assets folder
        const assetPath = path.join(this.updatesDir, 'assets', filename);
        if (fs.existsSync(assetPath)) return assetPath;
        return null;
    }

    getBundlePath(filename: string) {
        // Check bundles folder
        const bundlePath = path.join(this.updatesDir, 'bundles', filename);
        if (fs.existsSync(bundlePath)) return bundlePath;

        // Check expo structure
        const expoPath = path.join(this.updatesDir, '_expo', 'static', 'js', 'android', filename);
        if (fs.existsSync(expoPath)) return expoPath;

        return null;
    }

    getApkPath() {
        const apkPath = path.join(process.cwd(), 'public', 'app-release.apk');
        if (fs.existsSync(apkPath)) return apkPath;
        return null;
    }
}
