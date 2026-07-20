import { Module } from '@nestjs/common';
import { AskVastraController } from './ask-vastra.controller';
import { AskVastraService } from './ask-vastra.service';
import { AskVastraAiService } from './ask-vastra-ai.service';

@Module({
  controllers: [AskVastraController],
  providers: [AskVastraService, AskVastraAiService],
  exports: [AskVastraService]
})
export class AskVastraModule {}
