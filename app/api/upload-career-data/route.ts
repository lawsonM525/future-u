import { NextRequest, NextResponse } from 'next/server';

// Add export configuration for Next.js API routes
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        
        // Validate the incoming data
        if (!data || typeof data !== 'object') {
            return NextResponse.json(
                { error: 'Invalid data format' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: 'Career data uploaded successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error uploading career data:', error);
        return NextResponse.json(
            { error: 'Failed to process career data' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // TODO: Implement logic to retrieve career data
        return NextResponse.json(
            { message: 'Career data retrieved successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error retrieving career data:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve career data' },
            { status: 500 }
        );
    }
}