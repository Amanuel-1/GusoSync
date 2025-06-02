import { NextRequest, NextResponse } from 'next/server';
import { getReallocationRequestSimulator } from '../../../services/reallocationRequestSimulator';

// Initialize simulator with null baseUrl - will be set on first request
let simulator = getReallocationRequestSimulator();

// Helper function to get the base URL from the request
function getBaseUrl(request: NextRequest): string {
  // Get the host from the headers
  const host = request.headers.get('host') || 'localhost:3000';
  
  // Determine protocol (use https if x-forwarded-proto is https, otherwise http)
  const protocol = request.headers.get('x-forwarded-proto')?.includes('https') 
    ? 'https' 
    : 'http';
  
  return `${protocol}://${host}`;
}

export async function POST(request: NextRequest) {
  try {
    // Set the base URL for the simulator
    const baseUrl = getBaseUrl(request);
    simulator = getReallocationRequestSimulator({ baseUrl });
    
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'start': {
        simulator.startSimulation();
        return NextResponse.json({
          success: true,
          message: 'Reallocation request simulator started'
        });
      }

      case 'stop': {
        simulator.stopSimulation();
        return NextResponse.json({
          success: true,
          message: 'Reallocation request simulator stopped'
        });
      }

      case 'generate_bulk': {
        const { count } = data;
        
        if (!count || typeof count !== 'number' || count < 1) {
          return NextResponse.json(
            { error: 'Invalid count parameter. Must be a positive number.' },
            { status: 400 }
          );
        }

        await simulator.generateBulkRequests(count);
        return NextResponse.json({
          success: true,
          message: `Generated ${count} reallocation requests`
        });
      }

      case 'update_config': {
        const { requestFrequencyMs, expiryTimeMinutes } = data;
        
        if (requestFrequencyMs !== undefined) {
          const frequency = Number(requestFrequencyMs);
          if (isNaN(frequency) || frequency < 1000) {
            return NextResponse.json(
              { error: 'Request frequency must be at least 1000ms (1 second)' },
              { status: 400 }
            );
          }
          simulator.setRequestFrequencyMs(frequency);
        }
        
        if (expiryTimeMinutes !== undefined) {
          const minutes = Number(expiryTimeMinutes);
          if (isNaN(minutes) || minutes < 1) {
            return NextResponse.json(
              { error: 'Expiry time must be at least 1 minute' },
              { status: 400 }
            );
          }
          simulator.setExpiryTimeMinutes(minutes);
        }
        
        return NextResponse.json({
          success: true,
          message: 'Simulator configuration updated',
          config: {
            requestFrequencyMs: simulator.getRequestFrequencyMs(),
            expiryTimeMinutes: simulator.getExpiryTimeMinutes(),
            isRunning: simulator.isSimulationRunning()
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in simulator API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Set the base URL for the simulator
    const baseUrl = getBaseUrl(request);
    simulator = getReallocationRequestSimulator({ baseUrl });
    
    return NextResponse.json({
      success: true,
      status: {
        isRunning: simulator.isSimulationRunning(),
        requestFrequencyMs: simulator.getRequestFrequencyMs(),
        expiryTimeMinutes: simulator.getExpiryTimeMinutes()
      }
    });
  } catch (error) {
    console.error('Error in simulator GET API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
