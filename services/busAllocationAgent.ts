import { GoogleGenAI } from '@google/genai';
import { SocketService } from '../utils/socket'; // Import SocketService

export interface ReallocationRequest {
  id: string;
  fermataId: string;
  fermataName: string;
  numBusesAllocated: number;
  averageWaitTimeMinutes: number;
  estimatedNumPeopleInQueue: number;
  priority: 'low' | 'normal' | 'high';
  timestamp: string;
  busId?: string;
  routeId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface Bus {
  id: string;
  routeId: string;
  routeName: string;
  status: 'available' | 'in_service' | 'maintenance';
  capacity: number;
  currentPassengers: number;
  fermataId?: string;
}

export interface Route {
  id: string;
  name: string;
  fermataIds: string[];
  activeBuses: string[];
  priority: number;
}

export interface AgentResponse {
  success: boolean;
  prioritizedRequestIds?: string[];
  reasoning: string;
  needsManualIntervention?: boolean;
}

export interface ReallocationDecision {
  id: string;
  requestId: string;
  agentDecision: AgentResponse;
  timestamp: string;
  status: 'auto_approved' | 'manual_review' | 'completed' | 'failed';
  executedBy: 'agent' | 'staff';
  busId?: string;
  fromRouteId?: string;
  toRouteId?: string;
  reason?: string;
}

class BusAllocationAgent {
  private ai: GoogleGenAI;
  private model: string = 'gemini-2.0-flash';
  private decisions: ReallocationDecision[] = []; // Simulated database
  private activeRequests: ReallocationRequest[] = []; // Simulated active requests
  private buses: Bus[] = []; // Simulated bus fleet
  private routes: Route[] = []; // Simulated routes
  private isActive: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private expiryCheckInterval: NodeJS.Timeout | null = null; // Timer for checking expired requests
  private socket: SocketService | null = null; // Add socket instance

  // Configuration parameters
  private allocationLimitK: number = 1; // Default: allocate 1 bus per fermata group
  private requestExpiryMinutes: number = 30; // Default: requests expire after 30 minutes
  private processingThreshold: number = 5; // Default: process requests when there are at least 5 pending

  constructor(config?: {
    allocationLimitK?: number;
    requestExpiryMinutes?: number;
    processingThreshold?: number;
  }) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Apply configuration if provided
    if (config?.allocationLimitK !== undefined) {
      this.allocationLimitK = config.allocationLimitK;
    }

    if (config?.requestExpiryMinutes !== undefined) {
      this.requestExpiryMinutes = config.requestExpiryMinutes;
    }

    if (config?.processingThreshold !== undefined) {
      this.processingThreshold = config.processingThreshold;
    }

    // Initialize with some mock data
    this.initializeMockData();

    // Initialize and listen for external reallocation requests (removed socket listener)
    // Requests will now be added via a dedicated API endpoint

    // Start the expiry check interval (every minute)
    this.startExpiryCheck();
  }

  private getSystemInstruction() {
    return {
      text: `You are a Bus Route Allocation Agent. Your task is to prioritize bus requests from the same starting and ending location to optimize resource allocation. You must also ensure that all requests in a given payload are for the *same* Fermata.

Consider the following factors in order of importance when prioritizing requests *within the same Fermata*:

1. **Unallocated Buses:** Requests with \`numBusesAllocated\` equal to 0 have the highest priority. These requests are currently unserved.

2. **Average Wait Time:** Prioritize requests with higher \`averageWaitTimeMinutes\`. Longer wait times indicate a greater need.

3. **Queue Length:** For requests with similar wait times, prioritize those with a larger \`estimatedNumPeopleInQueue\`.

You will receive a JSON payload. First, **verify that all requests in the payload are for the same Fermata**. If they are not, set \`success\` to \`false\` in your response and provide a clear message in the \`reasoning\`.

If all requests *are* for the same Fermata, set \`success\` to \`true\` and proceed with the prioritization logic described above. Respond with a JSON object in the following format:

\`\`\`json
{
  "success": true | false,
  "prioritizedRequestIds": ["request ID 1", "request ID 2", ...],  // Only present if success is true
  "reasoning": "Brief explanation of the prioritization or error. Emphasize the primary factor(s) that led to the ordering (if successful) or the reason for failure (if success is false)."
}
\`\`\``
    };
  }

  async processReallocationRequests(requests: ReallocationRequest[]): Promise<AgentResponse> {
    try {
      const config = {
        responseMimeType: 'application/json',
        systemInstruction: [this.getSystemInstruction()],
      };

      const contents = [
        {
          role: 'user' as const,
          parts: [
            {
              text: JSON.stringify(requests, null, 2),
            },
          ],
        },
      ];

      const response = await this.ai.models.generateContent({
        model: this.model,
        config,
        contents,
      });

      const responseText = response.text || '';
      let agentResponse: AgentResponse;

      try {
        agentResponse = JSON.parse(responseText);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        agentResponse = {
          success: false,
          reasoning: 'Agent response could not be parsed. Manual intervention required.',
          needsManualIntervention: true,
        };
      }

      // Add manual intervention flag if success is false
      if (!agentResponse.success) {
        agentResponse.needsManualIntervention = true;
      }

      return agentResponse;
    } catch (error) {
      console.error('Error processing reallocation requests:', error);
      return {
        success: false,
        reasoning: 'Technical error occurred during agent processing. Manual intervention required.',
        needsManualIntervention: true,
      };
    }
  }

  async handleReallocationRequest(requests: ReallocationRequest[]): Promise<{
    decision: ReallocationDecision;
    requiresManualReview: boolean;
  }> {
    const agentResponse = await this.processReallocationRequests(requests);

    const decision: ReallocationDecision = {
      id: `DEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      requestId: requests[0]?.id || 'unknown',
      agentDecision: agentResponse,
      timestamp: new Date().toISOString(),
      status: agentResponse.success ? 'auto_approved' : 'manual_review',
      executedBy: agentResponse.success ? 'agent' : 'staff',
    };

    // Save decision to simulated database
    this.decisions.push(decision);
    console.log(`🤖 Agent saved decision: ${decision.id} with status ${decision.status}`);

    // Emit allocation_history_update event for UI live update
    if (this.socket) {
      console.log(`🤖 Agent emitting allocation_history_update for decision ${decision.id}`);
      this.socket.emit("allocation_history_update", decision);
    }
    this.emitStatusUpdate(); // Emit status update after decision

    return {
      decision,
      requiresManualReview: !agentResponse.success || agentResponse.needsManualIntervention || false,
    };
  }

  // Simulate executing the reallocation
  async executeReallocation(
    decisionId: string,
    busId: string,
    fromRouteId: string,
    toRouteId: string,
    reason: string
  ): Promise<boolean> {
    const decision = this.decisions.find(d => d.id === decisionId);
    if (!decision) {
      console.log(`❌ Execute reallocation failed: Decision ${decisionId} not found.`);
      return false;
    }

    // Simulate execution logic here
    // In a real system, this would interact with the bus management system

    decision.status = 'completed';
    decision.busId = busId;
    decision.fromRouteId = fromRouteId;
    decision.toRouteId = toRouteId;
    decision.reason = reason;

    console.log(`✅ Agent marked decision ${decisionId} as completed.`);
    this.emitStatusUpdate(); // Emit status update after execution

    return true;
  }

  // Get all decisions (for history/monitoring)
  getAllDecisions(): ReallocationDecision[] {
    return [...this.decisions].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Get decisions that need manual review
  getDecisionsNeedingReview(): ReallocationDecision[] {
    return this.decisions.filter(d => d.status === 'manual_review');
  }

  // Mark a decision as manually reviewed
  markAsManuallyReviewed(decisionId: string, approved: boolean, staffId: string): boolean {
    const decision = this.decisions.find(d => d.id === decisionId);
    if (!decision) {
      console.log(`❌ Manual review failed: Decision ${decisionId} not found.`);
      return false;
    }

    decision.status = approved ? 'completed' : 'failed';
    decision.executedBy = 'staff';

    console.log(`✍️ Decision ${decisionId} marked as ${decision.status} by staff ${staffId}.`);
    this.emitStatusUpdate(); // Emit status update after manual review

    return true;
  }

  // Initialize mock data for simulation
  private initializeMockData(): void {
    // Mock routes
    this.routes = [
      {
        id: 'R001',
        name: 'Bole - Merkato',
        fermataIds: ['F001', 'F002', 'F003'],
        activeBuses: ['B001', 'B002'],
        priority: 1
      },
      {
        id: 'R002',
        name: 'Piassa - CMC',
        fermataIds: ['F004', 'F005', 'F006'],
        activeBuses: ['B003'],
        priority: 2
      }
    ];

    // Mock buses
    this.buses = [
      {
        id: 'B001',
        routeId: 'R001',
        routeName: 'Bole - Merkato',
        status: 'in_service',
        capacity: 50,
        currentPassengers: 30,
        fermataId: 'F001'
      },
      {
        id: 'B002',
        routeId: 'R001',
        routeName: 'Bole - Merkato',
        status: 'in_service',
        capacity: 50,
        currentPassengers: 45,
        fermataId: 'F002'
      },
      {
        id: 'B003',
        routeId: 'R002',
        routeName: 'Piassa - CMC',
        status: 'available',
        capacity: 40,
        currentPassengers: 0
      }
    ];
  }

  // Add a new reallocation request (simulates external system)
  addReallocationRequest(request: Omit<ReallocationRequest, 'id' | 'timestamp' | 'status'>): string {
    const newRequest: ReallocationRequest = {
      ...request,
      id: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    this.activeRequests.push(newRequest);
    const requestId = newRequest.id;
    console.log(`🤖 Agent added new reallocation request: ${requestId} for fermata ${newRequest.fermataName}`);
    console.log(`🤖 Agent current active requests count: ${this.activeRequests.filter(r => r.status === 'pending' || r.status === 'processing').length}`);
    this.emitStatusUpdate(); // Emit status update

    // Processing is now solely based on the periodic interval and threshold check within processActiveRequests

    return requestId;
  }

  // Start autonomous processing
  startAutonomousMode(): void {
    if (this.isActive) {
      console.log('Agent is already in autonomous mode');
      return;
    }

    this.isActive = true;
    console.log('🤖 Bus Allocation Agent started in autonomous mode');

    // Process requests every 5 minutes (simulating cron job)
    this.processingInterval = setInterval(() => {
      this.processActiveRequests();
    }, 300000); // 5 minutes = 300 * 1000 ms

    // Process immediately on start
    this.processActiveRequests();
    this.emitStatusUpdate(); // Emit status update
  }

  // Stop autonomous processing
  stopAutonomousMode(): void {
    if (!this.isActive) {
      console.log('Agent is not in autonomous mode');
      return;
    }

    this.isActive = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    console.log('🤖 Bus Allocation Agent stopped autonomous mode');
    this.emitStatusUpdate(); // Emit status update
  }

  // Start checking for expired requests
  private startExpiryCheck(): void {
    // Check for expired requests every minute
    this.expiryCheckInterval = setInterval(() => {
      this.removeExpiredRequests();
    }, 60000); // 1 minute = 60 * 1000 ms

    console.log(`🕒 Started request expiry check (expiry time: ${this.requestExpiryMinutes} minutes)`);
  }

  // Stop checking for expired requests
  private stopExpiryCheck(): void {
    if (this.expiryCheckInterval) {
      clearInterval(this.expiryCheckInterval);
      this.expiryCheckInterval = null;
      console.log('🕒 Stopped request expiry check');
    }
  }

  // Remove expired requests
  private removeExpiredRequests(): void {
    const now = new Date();
    const expiryThreshold = new Date(now.getTime() - (this.requestExpiryMinutes * 60 * 1000));

    const initialCount = this.activeRequests.length;

    // Filter out expired requests (only pending ones, don't expire processing ones)
    this.activeRequests = this.activeRequests.filter(req => {
      if (req.status !== 'pending') {
        return true; // Keep non-pending requests
      }

      const requestTime = new Date(req.timestamp);
      const isExpired = requestTime < expiryThreshold;

      if (isExpired) {
        console.log(`⏰ Request ${req.id} for ${req.fermataName} has expired (created: ${requestTime.toLocaleString()})`);
      }

      return !isExpired; // Keep if not expired
    });

    const removedCount = initialCount - this.activeRequests.length;

    if (removedCount > 0) {
      console.log(`⏰ Removed ${removedCount} expired requests`);
      this.emitStatusUpdate(); // Emit status update if requests were removed
    }
  }

  // Process all active requests autonomously
  private async processActiveRequests(): Promise<void> {
    const pendingRequests = this.activeRequests.filter(r => r.status === 'pending');

    if (pendingRequests.length < this.processingThreshold) {
      console.log(`🤖 Waiting for at least ${this.processingThreshold} pending requests to process. Current pending: ${pendingRequests.length}`);
      return;
    }

    console.log(`🤖 Threshold reached! Processing ${pendingRequests.length} active requests...`);

    // Group requests by fermata
    const requestsByFermata = this.groupRequestsByFermata(pendingRequests);

    for (const [fermataId, requests] of Object.entries(requestsByFermata)) {
      try {
        console.log(`Processing ${requests.length} requests for fermata ${fermataId}`);

        // Mark requests as processing
        requests.forEach(req => req.status = 'processing');
        console.log(`🤖 Agent marked requests for fermata ${fermataId} as processing.`);
        this.emitStatusUpdate(); // Emit status update

        // Get agent decision
        const { decision, requiresManualReview } = await this.handleReallocationRequest(requests);
        // handleReallocationRequest already pushes decision and emits history update

        if (!requiresManualReview && decision.agentDecision.success) {
          // Execute autonomous reallocation
          const executed = await this.executeAutonomousReallocation(decision, requests);

          if (executed) {
            // Mark requests as completed
            requests.forEach(req => req.status = 'completed');
            console.log(`✅ Successfully executed autonomous reallocation for fermata ${fermataId}`);
          } else {
            // Mark requests as failed
            requests.forEach(req => req.status = 'failed');
            console.log(`❌ Failed to execute reallocation for fermata ${fermataId}`);
          }
          this.emitStatusUpdate(); // Emit status update after status change
        } else {
          // Escalate to manual review
          console.log(`⚠️ Escalating fermata ${fermataId} requests to manual review`);
          requests.forEach(req => req.status = 'pending'); // Reset to pending for manual review
          this.emitStatusUpdate(); // Emit status update after status change
        }

        // Remove completed/failed requests from active list
        this.activeRequests = this.activeRequests.filter(req =>
          !requests.some(processedReq => processedReq.id === req.id) ||
          req.status === 'pending'
        );
        console.log(`🤖 Agent active requests after processing: ${this.activeRequests.filter(r => r.status === 'pending' || r.status === 'processing').length}`);
        // Status update already emitted above if status changed

      } catch (error) {
        console.error(`Error processing requests for fermata ${fermataId}:`, error);
        // Reset requests to pending for retry
        requests.forEach(req => req.status = 'pending');
        this.emitStatusUpdate(); // Emit status update after status change
      }
    }
  }

  // Group requests by fermata ID
  private groupRequestsByFermata(requests: ReallocationRequest[]): Record<string, ReallocationRequest[]> {
    return requests.reduce((groups, request) => {
      const fermataId = request.fermataId;
      if (!groups[fermataId]) {
        groups[fermataId] = [];
      }
      groups[fermataId].push(request);
      return groups;
    }, {} as Record<string, ReallocationRequest[]>);
  }

  // Execute autonomous reallocation based on agent decision
  private async executeAutonomousReallocation(
    decision: ReallocationDecision,
    requests: ReallocationRequest[]
  ): Promise<boolean> {
    try {
      if (!decision.agentDecision.prioritizedRequestIds) {
        return false;
      }

      // Get the prioritized request IDs
      const prioritizedIds = decision.agentDecision.prioritizedRequestIds;

      // Limit to the top K requests based on configuration
      const topKRequestIds = prioritizedIds.slice(0, this.allocationLimitK);
      console.log(`🔢 Processing top ${topKRequestIds.length} of ${prioritizedIds.length} prioritized requests (K=${this.allocationLimitK})`);

      let successCount = 0;

      // Process each of the top K requests
      for (const requestId of topKRequestIds) {
        const priorityRequest = requests.find(req => req.id === requestId);

        if (!priorityRequest) {
          console.log(`⚠️ Could not find request with ID ${requestId}`);
          continue;
        }

        // Find available bus for reallocation
        const availableBus = this.findAvailableBusForReallocation(priorityRequest.fermataId);

        if (!availableBus) {
          console.log(`No available bus found for fermata ${priorityRequest.fermataId}`);
          continue;
        }

        // Find target route for the fermata
        const targetRoute = this.findBestRouteForFermata(priorityRequest.fermataId);

        if (!targetRoute) {
          console.log(`No suitable route found for fermata ${priorityRequest.fermataId}`);
          continue;
        }

        // Execute the reallocation
        const success = await this.executeReallocation(
          decision.id,
          availableBus.id,
          availableBus.routeId,
          targetRoute.id,
          `Autonomous reallocation based on agent decision: ${decision.agentDecision.reasoning}`
        );

        if (success) {
          // Update bus assignment
          availableBus.routeId = targetRoute.id;
          availableBus.routeName = targetRoute.name;
          availableBus.fermataId = priorityRequest.fermataId;
          availableBus.status = 'in_service';

          console.log(`🚌 Bus ${availableBus.id} reallocated from route ${decision.fromRouteId} to ${targetRoute.id}`);

          // Mark this specific request as completed
          priorityRequest.status = 'completed';
          priorityRequest.busId = availableBus.id;
          priorityRequest.routeId = targetRoute.id;

          successCount++;
        }
      }

      console.log(`✅ Successfully reallocated ${successCount} of ${topKRequestIds.length} top priority requests`);

      // Return true if at least one reallocation was successful
      return successCount > 0;
    } catch (error) {
      console.error('Error executing autonomous reallocation:', error);
      return false;
    }
  }

  // Find available bus for reallocation
  private findAvailableBusForReallocation(fermataId: string): Bus | null {
    // Find the target route for the fermata
    const targetRoute = this.routes.find(route => route.fermataIds.includes(fermataId));

    // 1. Prefer available buses at the target fermata
    let availableBus = this.buses.find(bus => bus.status === 'available' && bus.fermataId === fermataId);

    if (!availableBus && targetRoute) {
      // 2. Prefer available buses on the target route
      availableBus = this.buses.find(bus => bus.status === 'available' && bus.routeId === targetRoute.id);
    }

    if (!availableBus) {
      // 3. Fallback to any available bus
      availableBus = this.buses.find(bus => bus.status === 'available');
    }

    if (!availableBus) {
      // If no available buses, find one with low passenger count
      // 4. Prefer in-service buses on the target route with low passenger count
      if (targetRoute) {
         availableBus = this.buses
          .filter(bus => bus.status === 'in_service' && bus.routeId === targetRoute.id)
          .sort((a, b) => a.currentPassengers - b.currentPassengers)[0];
      }
    }

    if (!availableBus) {
      // 5. Fallback to any in-service bus with low passenger count
      availableBus = this.buses
        .filter(bus => bus.status === 'in_service')
        .sort((a, b) => a.currentPassengers - b.currentPassengers)[0];
    }

    return availableBus || null;
  }

  // Find best route for a fermata
  private findBestRouteForFermata(fermataId: string): Route | null {
    // Find route that serves this fermata
    const route = this.routes.find(route => route.fermataIds.includes(fermataId));
    return route || null;
  }

  // Get current status
  getAgentStatus(): {
    isActive: boolean;
    activeRequests: number;
    pendingManualReviews: number; // Renamed for clarity
    completedToday: number;
    allocationLimitK: number;
    requestExpiryMinutes: number;
    processingThreshold: number;
  } {
    const today = new Date().toDateString();
    const completedToday = this.decisions.filter(d =>
      new Date(d.timestamp).toDateString() === today && d.status === 'completed'
    ).length;

    return {
      isActive: this.isActive,
      activeRequests: this.activeRequests.filter(r => r.status === 'pending' || r.status === 'processing').length,
      pendingManualReviews: this.getDecisionsNeedingReview().length,
      completedToday,
      allocationLimitK: this.allocationLimitK,
      requestExpiryMinutes: this.requestExpiryMinutes,
      processingThreshold: this.processingThreshold
    };
  }

  // Get allocation limit K
  getAllocationLimitK(): number {
    return this.allocationLimitK;
  }

  // Set allocation limit K
  setAllocationLimitK(k: number): void {
    if (k < 1) {
      throw new Error('Allocation limit K must be at least 1');
    }
    this.allocationLimitK = k;
    console.log(`🔢 Allocation limit K set to ${k}`);
  }

  // Get request expiry time
  getRequestExpiryMinutes(): number {
    return this.requestExpiryMinutes;
  }

  // Set request expiry time
  setRequestExpiryMinutes(minutes: number): void {
    if (minutes < 1) {
      throw new Error('Request expiry time must be at least 1 minute');
    }
    this.requestExpiryMinutes = minutes;
    console.log(`⏰ Request expiry time set to ${minutes} minutes`);
  }

  // Get processing threshold
  getProcessingThreshold(): number {
    return this.processingThreshold;
  }

  // Set processing threshold
  setProcessingThreshold(threshold: number): void {
    if (threshold < 1) {
      throw new Error('Processing threshold must be at least 1');
    }
    this.processingThreshold = threshold;
    console.log(`🔢 Processing threshold set to ${threshold} requests`);
  }

  // Get active requests (pending or processing)
  getActiveRequests(): ReallocationRequest[] {
    return this.activeRequests.filter(r => r.status === 'pending' || r.status === 'processing');
  }

  // Emit agent status update via socket (removed socket emit)
  // Status updates will now be primarily driven by UI polling or explicit API calls
  private emitStatusUpdate(): void {
    // Socket emit removed
  }
}

export default BusAllocationAgent;
