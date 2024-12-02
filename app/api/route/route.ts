// /app/api/route/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const step = searchParams.get('step');
    const workflow = searchParams.get('workflow');

    console.log("Received Step:", step);
    console.log("Received Workflow:", workflow);

    if (!step || !workflow) {
      return NextResponse.json(
        { error: 'Missing step or workflow parameter' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://admin-backend-vj3t6ewmoa-uc.a.run.app/Workflows/${workflow}`
    );

    console.log("Fetch Status:", response.status);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch workflow data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Fetched Data:", data);

    const stepData = data?.data?.[step];
    console.log("Step:", step);
console.log("Workflow:", workflow);
console.log("Fetched Data:", data);
console.log("Step Data:", stepData);

    if (!stepData) {
      return NextResponse.json(
        { error: `Step "${step}" not found in workflow "${workflow}"` },
        { status: 404 }
      );
    }

    return NextResponse.json(stepData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
