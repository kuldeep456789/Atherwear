import { Injectable } from '@nestjs/common';
import { AskVastraAiService, AskVastraResponse } from './ask-vastra-ai.service';
import { AskVastraRecommendDto } from './dto/ask-vastra.dto';

@Injectable()
export class AskVastraService {
  constructor(private readonly aiService: AskVastraAiService) {}

  async getRecommendations(dto: AskVastraRecommendDto): Promise<AskVastraResponse> {
    // In Phase 3, we would add Redis caching here.
    // For now, directly call the AI Service.
    return this.aiService.getRecommendations(dto.gender, dto.category, dto.type, dto.color);
  }
}
