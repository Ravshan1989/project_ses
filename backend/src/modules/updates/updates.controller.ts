import { Controller, Get, Res, Req, Header } from "@nestjs/common";
import { Response, Request } from "express";
import { UpdatesService } from "./updates.service";

@Controller("updates")
export class UpdatesController {
  constructor(private readonly updatesService: UpdatesService) {}

  @Get("manifest")
  @Header("expo-protocol-version", "1")
  @Header("expo-sfv-version", "0")
  @Header("cache-control", "private, max-age=0")
  @Header("content-type", "application/expo+json; charset=utf-8")
  getManifest(@Res() res: Response) {
    const manifest = this.updatesService.getManifest();
    if (!manifest) {
      return res.status(404).json({ error: "Update manifest not found" });
    }
    return res.send(manifest);
  }

  @Get("assets/:filename")
  getAsset(@Req() req: Request, @Res() res: Response) {
    const filename = req.params.filename;
    const assetPath = this.updatesService.getAssetPath(filename);

    if (assetPath) {
      if (filename.endsWith(".js"))
        res.setHeader("content-type", "application/javascript");
      else if (filename.endsWith(".png"))
        res.setHeader("content-type", "image/png");
      else if (filename.endsWith(".ttf"))
        res.setHeader("content-type", "font/ttf");

      return res.sendFile(assetPath);
    }
    return res.status(404).send("Asset not found");
  }

  @Get("bundles/:filename")
  getBundle(@Req() req: Request, @Res() res: Response) {
    const filename = req.params.filename;
    const bundlePath = this.updatesService.getBundlePath(filename);

    if (bundlePath) {
      res.setHeader("content-type", "application/javascript");
      return res.sendFile(bundlePath);
    }
    return res.status(404).send("Bundle not found");
  }

  @Get("download")
  @Header("content-type", "application/vnd.android.package-archive")
  @Header("content-disposition", 'attachment; filename="Smart-SES.apk"')
  downloadApk(@Res() res: Response) {
    const apkPath = this.updatesService.getApkPath();
    if (apkPath) {
      return res.sendFile(apkPath);
    }
    return res.status(404).send("APK file not found");
  }
}
