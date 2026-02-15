import { Module } from '@nestjs/common';
import { UpdatesController } from './updates.controller';
import { VersionController } from './version.controller';

@Module({
    controllers: [UpdatesController, VersionController],
})
export class UpdatesModule { }
