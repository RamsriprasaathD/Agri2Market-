import { NextRequest, NextResponse } from 'next/server';
import { mlClient } from '@/lib/ml-client';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { cropType, region, season, historicalData } = await request.json();

    if (!cropType || !region || !season) {
      return NextResponse.json(
        { error: 'Missing required fields: cropType, region, season' },
        { status: 400 }
      );
    }

    const prediction = await mlClient.predictPrices({
      cropType,
      region,
      season,
      historicalData,
    });

    return NextResponse.json({ prediction });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cropType = searchParams.get('cropType');

    if (!cropType) {
      return NextResponse.json(
        { error: 'Crop type is required' },
        { status: 400 }
      );
    }

    const insights = await mlClient.getMarketInsights(cropType);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Market insights error:', error);
    return NextResponse.json(
      { error: 'Failed to get market insights' },
      { status: 500 }
    );
  }
}
