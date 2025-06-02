import { NextRequest, NextResponse } from 'next/server';
import BusAllocationAgent, { ReallocationRequest, ReallocationDecision } from '../../../services/busAllocationAgent';

// Global agent instance (in production, this would be properly managed)
let agentInstance: BusAllocationAgent | null = null;

function getAgentInstance(): BusAllocationAgent {
  if (!agentInstance) {
    try {
      agentInstance = new BusAllocationAgent();
    } catch (error) {
      console.error('Failed to initialize BusAllocationAgent:', error);
      throw new Error('Agent initialization failed. Please check GEMINI_API_KEY configuration.');
    }
  }
  return agentInstance;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    const agent = getAgentInstance();

    switch (action) {
      case 'process_requests': {
        const { requests }: { requests: ReallocationRequest[] } = data;
        
        if (!requests || !Array.isArray(requests) || requests.length === 0) {
          return NextResponse.json(
            { error: 'Invalid requests array' },
            { status: 400 }
          );
        }

        const result = await agent.handleReallocationRequest(requests);
        
        return NextResponse.json({
          success: true,
          decision: result.decision,
          requiresManualReview: result.requiresManualReview,
          message: result.requiresManualReview 
            ? 'Request requires manual review by control center staff'
            : 'Request processed automatically by agent'
        });
      }

      case 'execute_reallocation': {
        const { decisionId, busId, fromRouteId, toRouteId, reason } = data;
        
        if (!decisionId || !busId || !fromRouteId || !toRouteId || !reason) {
          return NextResponse.json(
            { error: 'Missing required fields for reallocation execution' },
            { status: 400 }
          );
        }

        const success = await agent.executeReallocation(
          decisionId,
          busId,
          fromRouteId,
          toRouteId,
          reason
        );

        if (!success) {
          return NextResponse.json(
            { error: 'Failed to execute reallocation' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Reallocation executed successfully'
        });
      }

      case 'manual_review': {
        const { decisionId, approved, staffId } = data;
        
        if (!decisionId || typeof approved !== 'boolean' || !staffId) {
          return NextResponse.json(
            { error: 'Missing required fields for manual review' },
            { status: 400 }
          );
        }

        const success = agent.markAsManuallyReviewed(decisionId, approved, staffId);

        if (!success) {
          return NextResponse.json(
            { error: 'Decision not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: `Decision ${approved ? 'approved' : 'rejected'} by staff`
        });
      }

      case 'start_autonomous': {
        agent.startAutonomousMode();
        return NextResponse.json({
          success: true,
          message: 'Autonomous mode started'
        });
      }

      case 'stop_autonomous': {
        agent.stopAutonomousMode();
        return NextResponse.json({
          success: true,
          message: 'Autonomous mode stopped'
        });
      }

      case 'add_request': {
        const { request } = data;
        
        if (!request || !request.fermataId || !request.fermataName) {
          return NextResponse.json(
            { error: 'Invalid request data. fermataId and fermataName are required' },
            { status: 400 }
          );
        }

        const requestId = agent.addReallocationRequest(request);
        return NextResponse.json({
          success: true,
          requestId,
          message: 'Request added successfully'
        });
      }

      case 'get_status': {
        const status = agent.getAgentStatus();
        return NextResponse.json({
          success: true,
          status
        });
      }
      
      case 'update_configuration': {
        const { config } = data;
        
        if (!config) {
          return NextResponse.json(
            { error: 'Missing configuration data' },
            { status: 400 }
          );
        }
        
        try {
          // Update allocation limit K if provided
          if (config.allocationLimitK !== undefined) {
            const k = Number(config.allocationLimitK);
            if (isNaN(k) || k < 1) {
              return NextResponse.json(
                { error: 'Allocation limit K must be a positive number' },
                { status: 400 }
              );
            }
            agent.setAllocationLimitK(k);
          }
          
          // Update request expiry time if provided
          if (config.requestExpiryMinutes !== undefined) {
            const minutes = Number(config.requestExpiryMinutes);
            if (isNaN(minutes) || minutes < 1) {
              return NextResponse.json(
                { error: 'Request expiry time must be a positive number of minutes' },
                { status: 400 }
              );
            }
            agent.setRequestExpiryMinutes(minutes);
          }
          
          // Update processing threshold if provided
          if (config.processingThreshold !== undefined) {
            const threshold = Number(config.processingThreshold);
            if (isNaN(threshold) || threshold < 1) {
              return NextResponse.json(
                { error: 'Processing threshold must be a positive number' },
                { status: 400 }
              );
            }
            agent.setProcessingThreshold(threshold);
          }
          
          return NextResponse.json({
            success: true,
            message: 'Configuration updated successfully',
            currentConfig: {
              allocationLimitK: agent.getAllocationLimitK(),
              requestExpiryMinutes: agent.getRequestExpiryMinutes(),
              processingThreshold: agent.getProcessingThreshold()
            }
          });
        } catch (error) {
          return NextResponse.json(
            { 
              error: 'Failed to update configuration',
              message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
          );
        }
      }

      case 'get_active_requests': {
        const activeRequests = agent.getActiveRequests();
        return NextResponse.json({
          success: true,
          requests: activeRequests
        });
      }

      case 'simulate_request': {
        // Add a mock request to the agent's queue
        const mockRequests = [
          {
            fermataId: "F001",
            fermataName: "Bole Road Station",
            numBusesAllocated: 0,
            averageWaitTimeMinutes: Math.floor(Math.random() * 20) + 5, // 5-25 minutes
            estimatedNumPeopleInQueue: Math.floor(Math.random() * 50) + 10, // 10-60 people
            priority: "high" as "low" | "normal" | "high",
          },
          {
            fermataId: "F004",
            fermataName: "Piassa Square",
            numBusesAllocated: 1,
            averageWaitTimeMinutes: Math.floor(Math.random() * 10) + 3, // 3-13 minutes
            estimatedNumPeopleInQueue: Math.floor(Math.random() * 30) + 5, // 5-35 people
            priority: "normal" as "low" | "normal" | "high",
          },
          {
            fermataId: "F002",
            fermataName: "Meskel Square",
            numBusesAllocated: 0,
            averageWaitTimeMinutes: Math.floor(Math.random() * 15) + 7, // 7-22 minutes
            estimatedNumPeopleInQueue: Math.floor(Math.random() * 40) + 15, // 15-55 people
            priority: "high" as "low" | "normal" | "high",
          },
          {
            fermataId: "F005",
            fermataName: "CMC Road",
            numBusesAllocated: 2,
            averageWaitTimeMinutes: Math.floor(Math.random() * 8) + 2, // 2-10 minutes
            estimatedNumPeopleInQueue: Math.floor(Math.random() * 20) + 5, // 5-25 people
            priority: "low" as "low" | "normal" | "high",
          },
        ];
        const randomRequest = mockRequests[Math.floor(Math.random() * mockRequests.length)];
        const requestId = agent.addReallocationRequest(randomRequest);
        return NextResponse.json({ success: true, requestId, message: 'Simulated request added successfully' });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in reallocation API:', error);
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const agent = getAgentInstance();

    switch (type) {
      case 'decisions':
        return NextResponse.json({
          success: true,
          decisions: agent.getAllDecisions()
        });

      case 'pending_review':
        return NextResponse.json({
          success: true,
          decisions: agent.getDecisionsNeedingReview()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Use "decisions" or "pending_review"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in reallocation GET API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
