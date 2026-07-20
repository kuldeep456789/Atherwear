import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AskVastraService } from './ask-vastra.service';
import { AskVastraRecommendDto } from './dto/ask-vastra.dto';
import { AskVastraResponse } from './ask-vastra-ai.service';

@Controller('ask-vastra')
export class AskVastraController {
  constructor(private readonly askVastraService: AskVastraService) {}

  @Post('recommend')
  @HttpCode(HttpStatus.OK)
  async getRecommendations(@Body() dto: AskVastraRecommendDto): Promise<AskVastraResponse> {
    return this.askVastraService.getRecommendations(dto);
  }
}
