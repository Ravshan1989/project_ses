import { Controller, Get, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('updates')
export class UpdatesController {

    @Get('manifest')
    getManifest(@Req() req: Request, @Res() res: Response) {
        const updateDir = path.join(process.cwd(), '..', 'frontend', 'public', 'updates');
        // Try android-index.json first
        let manifestPath = path.join(updateDir, 'android-index.json');

        // Fallback to metadata.json for basic info if index missing
        if (!fs.existsSync(manifestPath)) {
            manifestPath = path.join(updateDir, 'metadata.json');
        }

        if (!fs.existsSync(manifestPath)) {
            return res.status(404).json({ error: 'Update manifest not found' });
        }

        const manifestContent = fs.readFileSync(manifestPath, 'utf8');

        res.setHeader('expo-protocol-version', '1');
        res.setHeader('expo-sfv-version', '0');
        res.setHeader('cache-control', 'private, max-age=0');
        res.setHeader('content-type', 'application/expo+json; charset=utf-8');

        return res.send(manifestContent);
    }

    @Get('assets/:filename')
    getAsset(@Req() req: Request, @Res() res: Response) {
        const filename = req.params.filename;
        const updateDir = path.join(process.cwd(), '..', 'frontend', 'public', 'updates', 'assets');
        const assetPath = path.join(updateDir, filename);

        if (fs.existsSync(assetPath)) {
            if (filename.endsWith('.js')) res.setHeader('content-type', 'application/javascript');
            else if (filename.endsWith('.png')) res.setHeader('content-type', 'image/png');
            else if (filename.endsWith('.ttf')) res.setHeader('content-type', 'font/ttf');

            return res.sendFile(assetPath);
        }
        return res.status(404).send('Asset not found');
    }

    @Get('bundles/:filename')
    getBundle(@Req() req: Request, @Res() res: Response) {
        const filename = req.params.filename;
        // Check standard 'bundles' folder
        let bundlePath = path.join(process.cwd(), '..', 'frontend', 'public', 'updates', 'bundles', filename);

        // Check _expo folder structure if standard missing
        if (!fs.existsSync(bundlePath)) {
            // Try finding in _expo/static/js/android/
            const androidBundlePath = path.join(process.cwd(), '..', 'frontend', 'public', 'updates', '_expo', 'static', 'js', 'android', filename);
            if (fs.existsSync(androidBundlePath)) bundlePath = androidBundlePath;
        }

        if (!fs.existsSync(bundlePath)) {
            return res.status(404).send('Bundle not found');
        }

        res.setHeader('content-type', 'application/javascript');
        return res.sendFile(bundlePath);
    }
}
