import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private backupBot: Telegraf;
  private backupChatId: string;

  constructor(private configService: ConfigService) {
    const backupToken = this.configService.get<string>('BACKUP_BOT_TOKEN');
    this.backupChatId = this.configService.get<string>('BACKUP_CHAT_ID');

    if (backupToken) {
      this.backupBot = new Telegraf(backupToken);
      this.logger.log('BackupBot initialized');
    }
  }

  @Cron('0 3 * * *') // Har kuni tunda 03:00 da
  async handleCron() {
    this.logger.log('Starting automated database backup...');
    if (!this.backupBot || !this.backupChatId) {
       this.logger.error('BackupBot token or chat ID is missing. Skipping backup.');
       return;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `regionstat_backup_${timestamp}.sql`;
      const filepath = path.join('/tmp', filename);

      const dbHost = this.configService.get('DB_HOST') || 'db';
      const dbPort = this.configService.get('DB_PORT') || '5432';
      const dbUser = this.configService.get('DB_USERNAME') || 'postgres';
      const dbPass = this.configService.get('DB_PASSWORD') || 'postgres';
      const dbName = this.configService.get('DB_DATABASE') || 'regionstat';

      const command = `PGPASSWORD="${dbPass}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -F c -f ${filepath} ${dbName}`;
      
      await execAsync(command);
      this.logger.log(`Database backup created successfully: ${filepath}`);

      await this.backupBot.telegram.sendDocument(this.backupChatId, {
        source: filepath,
        filename: filename,
      }, {
        caption: `📦 Muvaffaqiyatli zaxira (Avtomatik)\n\n🕒 Vaqt: ${new Date().toLocaleString('uz-UZ')}`
      });

      this.logger.log(`Backup sent to Telegram Chat: ${this.backupChatId}`);

      if (fs.existsSync(filepath)) {
         fs.unlinkSync(filepath);
      }

    } catch (error) {
      this.logger.error('Error during automated backup', error);
    }
  }
}
