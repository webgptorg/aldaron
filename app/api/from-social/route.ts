import { NextRequest, NextResponse } from 'next/server';

// Configure route for dynamic rendering
export const dynamic = 'force-dynamic';

// Define the scraping modes
type ScrapingMode = 'QUICK' | 'DEEP';

// Define the supported services
type SocialService = 'facebook' | 'twitter' | 'instagram' | 'linkedin';

interface ScrapingResult {
  service: SocialService;
  mode: ScrapingMode;
  data: any[];
  timestamp: string;
  processingTime: number;
}

// Mock scraping functions for demonstration
async function quickScrape(service: SocialService): Promise<any[]> {
  // Simulate quick scraping - basic data extraction
  await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay

  return [
    {
      id: `${service}_quick_1`,
      type: 'post',
      content: `Quick scraped content from ${service}`,
      author: 'sample_user',
      timestamp: new Date().toISOString(),
      engagement: {
        likes: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 20)
      }
    },
    {
      id: `${service}_quick_2`,
      type: 'post',
      content: `Another quick post from ${service}`,
      author: 'another_user',
      timestamp: new Date().toISOString(),
      engagement: {
        likes: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 20)
      }
    }
  ];
}

async function deepScrape(service: SocialService): Promise<any[]> {
  // Simulate deep scraping - comprehensive data extraction
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay

  return [
    {
      id: `${service}_deep_1`,
      type: 'post',
      content: `Deep scraped content from ${service} with detailed analysis`,
      author: 'sample_user',
      timestamp: new Date().toISOString(),
      engagement: {
        likes: Math.floor(Math.random() * 1000),
        shares: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 50)
      },
      metadata: {
        hashtags: ['#example', '#social', '#scraping'],
        mentions: ['@user1', '@user2'],
        location: 'Sample Location',
        deviceInfo: 'Mobile App'
      },
      sentiment: {
        score: Math.random() * 2 - 1, // -1 to 1
        confidence: Math.random()
      }
    },
    {
      id: `${service}_deep_2`,
      type: 'post',
      content: `Another deep post from ${service} with comprehensive data`,
      author: 'another_user',
      timestamp: new Date().toISOString(),
      engagement: {
        likes: Math.floor(Math.random() * 1000),
        shares: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 50)
      },
      metadata: {
        hashtags: ['#detailed', '#analysis'],
        mentions: ['@brand'],
        location: 'Another Location',
        deviceInfo: 'Web Browser'
      },
      sentiment: {
        score: Math.random() * 2 - 1,
        confidence: Math.random()
      }
    },
    {
      id: `${service}_deep_3`,
      type: 'story',
      content: `Story content from ${service}`,
      author: 'story_user',
      timestamp: new Date().toISOString(),
      engagement: {
        views: Math.floor(Math.random() * 5000)
      },
      metadata: {
        duration: 15,
        type: 'image'
      }
    }
  ];
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    // Get services parameter (required)
    const servicesParam = searchParams.get('services');
    if (!servicesParam) {
      return NextResponse.json(
        { error: 'Missing required parameter: services' },
        { status: 400 }
      );
    }

    // Parse services (can be comma-separated)
    const services = servicesParam.split(',').map(s => s.trim().toLowerCase()) as SocialService[];

    // Validate services
    const validServices: SocialService[] = ['facebook', 'twitter', 'instagram', 'linkedin'];
    const invalidServices = services.filter(service => !validServices.includes(service));

    if (invalidServices.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid services provided',
          invalidServices,
          validServices
        },
        { status: 400 }
      );
    }

    // Get scraping mode parameter (optional, defaults to QUICK)
    const scrapingModeParam = searchParams.get('scrapingMode');
    let scrapingMode: ScrapingMode = 'QUICK'; // Default mode

    if (scrapingModeParam) {
      const upperCaseMode = scrapingModeParam.toUpperCase();
      if (upperCaseMode === 'QUICK' || upperCaseMode === 'DEEP') {
        scrapingMode = upperCaseMode as ScrapingMode;
      } else {
        return NextResponse.json(
          {
            error: 'Invalid scrapingMode. Must be either QUICK or DEEP',
            provided: scrapingModeParam,
            validModes: ['QUICK', 'DEEP']
          },
          { status: 400 }
        );
      }
    }

    // Process each service
    const results: ScrapingResult[] = [];

    for (const service of services) {
      let data: any[];

      if (scrapingMode === 'DEEP') {
        data = await deepScrape(service);
      } else {
        data = await quickScrape(service);
      }

      results.push({
        service,
        mode: scrapingMode,
        data,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      });
    }

    const totalProcessingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      scrapingMode,
      services: services,
      totalResults: results.reduce((sum, result) => sum + result.data.length, 0),
      processingTime: totalProcessingTime,
      results
    });

  } catch (error) {
    console.error('Error in /from-social endpoint:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
