import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get<string>('DATABASE_URL'), // Standard Railway DB URL
                host: !configService.get<string>('DATABASE_URL') ? configService.get<string>('DB_HOST', 'localhost') : undefined,
                port: !configService.get<string>('DATABASE_URL') ? configService.get<number>('DB_PORT', 5432) : undefined,
                username: !configService.get<string>('DATABASE_URL') ? configService.get<string>('DB_USERNAME', 'postgres') : undefined,
                password: !configService.get<string>('DATABASE_URL') ? configService.get<string>('DB_PASSWORD', 'postgres') : undefined,
                database: !configService.get<string>('DATABASE_URL') ? configService.get<string>('DB_NAME', 'regionstat') : undefined,
                autoLoadEntities: true,
                synchronize: true,
                ssl: configService.get<string>('NODE_ENV') === 'production' || configService.get<string>('DATABASE_URL')
                    ? { rejectUnauthorized: false }
                    : false,
            }),
        }),
    ],
})
export class DatabaseModule { }
