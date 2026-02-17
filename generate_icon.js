const fs = require('fs');
const { PNG } = require('pngjs');
const path = require('path');

function createIcon(width, height, outputPath) {
    const png = new PNG({ width, height });

    for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
            const idx = (png.width * y + x) << 2;

            // Background: Healthcare Blue (#0052D4 to #4364F7 gradient approximation)
            // Just use a solid nice blue for simplicity and reliability: #2196F3 (Material Blue)
            // r=33, g=150, b=243
            png.data[idx] = 33;
            png.data[idx + 1] = 150;
            png.data[idx + 2] = 243;
            png.data[idx + 3] = 255;

            // Draw White Cross
            // Vertical bar
            const barWidth = width * 0.2;
            const barLength = width * 0.6;
            const cx = width / 2;
            const cy = height / 2;

            const inVertBar =
                x > (cx - barWidth / 2) && x < (cx + barWidth / 2) &&
                y > (cy - barLength / 2) && y < (cy + barLength / 2);

            const inHorzBar =
                x > (cx - barLength / 2) && x < (cx + barLength / 2) &&
                y > (cy - barWidth / 2) && y < (cy + barWidth / 2);

            if (inVertBar || inHorzBar) {
                png.data[idx] = 255;
                png.data[idx + 1] = 255;
                png.data[idx + 2] = 255;
            }
        }
    }

    png.pack().pipe(fs.createWriteStream(outputPath))
        .on('finish', () => console.log(`Generated ${outputPath}`));
}

const assetsDir = path.join(__dirname, 'mobile', 'assets');

// Generate icons
createIcon(1024, 1024, path.join(assetsDir, 'icon.png'));
createIcon(1024, 1024, path.join(assetsDir, 'adaptive-icon.png'));
createIcon(1024, 1024, path.join(assetsDir, 'splash-icon.png'));
