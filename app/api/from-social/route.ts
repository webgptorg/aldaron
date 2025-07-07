import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const services = searchParams.get('services');
    const scrapingMode = searchParams.get('scrapingMode') || 'QUICK';

    // Validate required parameters
    if (!services) {
        return NextResponse.json(
            { error: 'Services parameter is required' },
            { status: 400 }
        );
    }

    // Validate scraping mode
    if (!['QUICK', 'DEEP'].includes(scrapingMode)) {
        return NextResponse.json(
            { error: 'Invalid scraping mode. Must be QUICK or DEEP' },
            { status: 400 }
        );
    }

    // Parse services
    const serviceList = services.split(',').map(s => s.trim().toLowerCase());
    const validServices = ['facebook', 'linkedin', 'github', 'google'];
    const invalidServices = serviceList.filter(s => !validServices.includes(s));

    if (invalidServices.length > 0) {
        return NextResponse.json(
            { error: `Invalid services: ${invalidServices.join(', ')}. Valid services are: ${validServices.join(', ')}` },
            { status: 400 }
        );
    }

    try {
        // Here you would implement the actual scraping logic
        // For now, we'll return a mock response
        const response = {
            status: 'success',
            message: 'Data scraping initiated',
            config: {
                services: serviceList,
                scrapingMode,
                timestamp: new Date().toISOString(),
            },
            estimatedTime: scrapingMode === 'DEEP' ? '5-10 minutes' : '1-3 minutes',
            data: {
                // Mock data structure - replace with actual scraping results
                profiles: serviceList.map(service => ({
                    platform: service,
                    status: service === 'facebook' ? 'available' : 'preparing',
                    scrapingMode,
                    dataPoints: scrapingMode === 'DEEP' ?
                        ['posts', 'comments', 'likes', 'shares', 'profile_info', 'connections', 'activity_history'] :
                        ['posts', 'profile_info', 'basic_activity']
                }))
            }
        };

        // Log the request for debugging
        console.log(`Scraping request: services=${services}, mode=${scrapingMode}`);

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error processing scraping request:', error);
        return NextResponse.json(
            { error: 'Internal server error while processing scraping request' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { services, scrapingMode = 'QUICK', options = {} } = body;

        // Validate required parameters
        if (!services || !Array.isArray(services)) {
            return NextResponse.json(
                { error: 'Services array is required' },
                { status: 400 }
            );
        }

        // Validate scraping mode
        if (!['QUICK', 'DEEP'].includes(scrapingMode)) {
            return NextResponse.json(
                { error: 'Invalid scraping mode. Must be QUICK or DEEP' },
                { status: 400 }
            );
        }

        const validServices = ['facebook', 'linkedin', 'github', 'google'];
        const invalidServices = services.filter((s: string) => !validServices.includes(s.toLowerCase()));

        if (invalidServices.length > 0) {
            return NextResponse.json(
                { error: `Invalid services: ${invalidServices.join(', ')}. Valid services are: ${validServices.join(', ')}` },
                { status: 400 }
            );
        }

        // Here you would implement the actual scraping logic
        const response = {
            status: 'success',
            message: 'Data scraping job created',
            jobId: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            config: {
                services: services.map((s: string) => s.toLowerCase()),
                scrapingMode,
                options,
                timestamp: new Date().toISOString(),
            },
            estimatedTime: scrapingMode === 'DEEP' ? '5-10 minutes' : '1-3 minutes',
        };

        console.log(`Scraping job created: ${response.jobId}, services=${services.join(',')}, mode=${scrapingMode}`);

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error creating scraping job:', error);
        return NextResponse.json(
            { error: 'Internal server error while creating scraping job' },
            { status: 500 }
        );
    }
}
