export interface ColorMatchResult {
  color: string;
  score: number;
  reason: string;
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

export interface AskVastraRequest {
  gender: string;
  category: string;
  type: string;
  color: string;
}
