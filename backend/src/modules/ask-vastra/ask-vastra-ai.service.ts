import { Injectable } from '@nestjs/common';

export interface ColorMatchResult {
  color: string;
  score: number;
  reason: string;
  image?: string;
  hex?: string;
}

export interface AskVastraResponse {
  overallCompatibility: string;
  confidenceScore: number;
  confidenceLevel: string;
  insight: string;
  styleTip: string;
  aboutColor: string[];
  bestMatches: ColorMatchResult[];
  otherGoodMatches: ColorMatchResult[];
  lessRecommended: ColorMatchResult[];
  bestSuitedFor: string[];
}

@Injectable()
export class AskVastraAiService {
  /**
   * Simulates an AI call returning styling recommendations based on gender, category, type, and color.
   */
  async getRecommendations(gender: string, category: string, type: string, color: string): Promise<AskVastraResponse> {
    // In a real scenario, this would call OpenAI, Gemini, etc.
    // For Phase 1 & 2, we return a mocked static response that accurately mimics the UI requested.
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const isBlack = color.toLowerCase() === 'black';

    return {
      overallCompatibility: 'Excellent Match',
      confidenceScore: 96,
      confidenceLevel: 'Very High',
      insight: `${color} is a versatile and timeless color that pairs well with a wide range of shades. Here are the best color combinations for you.`,
      styleTip: `For a balanced look, pair ${color.toLowerCase()} with lighter shades for contrast or neutral shades for a sophisticated appearance.`,
      aboutColor: [
        'Versatile - Matches with most colors',
        'Timeless - Always in style',
        'Easy to Style - Perfect for any occasion'
      ],
      bestMatches: [
        {
          color: 'Light Blue',
          score: 98,
          reason: 'Creates a timeless contrast and perfect for everyday casual wear.',
          hex: '#87CEFA'
        },
        {
          color: 'Beige',
          score: 95,
          reason: 'Perfect for smart casual looks and a clean, sophisticated appearance.',
          hex: '#F5F5DC'
        },
        {
          color: 'Grey',
          score: 92,
          reason: 'Modern and minimal combination for a subtle and stylish look.',
          hex: '#808080'
        }
      ],
      otherGoodMatches: [
        { color: 'White', score: 90, reason: 'Clean, fresh and versatile.', hex: '#FFFFFF' },
        { color: 'Olive', score: 89, reason: 'Natural and earthy tone, trendy look.', hex: '#808000' },
        { color: 'Navy Blue', score: 87, reason: 'Classic and elegant combination.', hex: '#000080' },
        { color: 'Brown', score: 86, reason: 'Warm and rich color pairing.', hex: '#A52A2A' }
      ],
      lessRecommended: [
        { color: 'Bright Red', score: 32, reason: 'Too much contrast and can overwhelm the overall look.', hex: '#FF0000' },
        { color: 'Purple', score: 40, reason: 'Competes with black and may not create the right balance.', hex: '#800080' }
      ],
      bestSuitedFor: [
        'Casual Outing',
        'College Look',
        'Evening Out',
        'Date Look',
        'Weekend Vibes'
      ]
    };
  }
}
