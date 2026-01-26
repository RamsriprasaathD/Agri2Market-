interface PredictionRequest {
  cropType: string;
  region: string;
  season: string;
  historicalData?: number[];
}

interface PredictionResponse {
  predictedPrice: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

class MLClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  }

  async predictPrices(data: PredictionRequest): Promise<PredictionResponse> {
    const response = await fetch(`${this.baseUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to get prediction from ML service');
    }

    return response.json();
  }

  async getMarketInsights(cropType: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/insights/${cropType}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to get market insights');
    }

    return response.json();
  }
}

export const mlClient = new MLClient();
