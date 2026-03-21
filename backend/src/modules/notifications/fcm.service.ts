import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const serviceAccount = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
    
    if (serviceAccount) {
      try {
        const config = JSON.parse(serviceAccount);
        admin.initializeApp({
          credential: admin.credential.cert(config),
        });
        this.logger.log('Firebase Admin SDK initialized');
      } catch (error) {
        this.logger.error('Failed to initialize Firebase Admin SDK', error);
      }
    } else {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT not found. Push notifications will be disabled.');
    }
  }

  async sendPushNotification(token: string, title: string, body: string, data?: any) {
    if (!admin.apps.length) return;

    const message = {
      notification: { title, body },
      token,
      data: data || {},
    };

    try {
      await admin.messaging().send(message);
      this.logger.log(`Push notification sent to token: ${token}`);
    } catch (error) {
      this.logger.error('Error sending push notification', error);
    }
  }

  async sendToTopic(topic: string, title: string, body: string, data?: any) {
    if (!admin.apps.length) return;

    const message = {
      notification: { title, body },
      topic,
      data: data || {},
    };

    try {
      await admin.messaging().send(message);
      this.logger.log(`Push notification sent to topic: ${topic}`);
    } catch (error) {
      this.logger.error('Error sending topic notification', error);
    }
  }
}
