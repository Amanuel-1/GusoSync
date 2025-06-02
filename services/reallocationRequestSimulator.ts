import { ReallocationRequest } from './busAllocationAgent';

/**
 * ReallocationRequestSimulator
 * 
 * This class simulates real-time reallocation requests from queue regulators.
 * It generates requests with realistic data and can be configured to simulate
 * different patterns and frequencies of requests.
 */
export class ReallocationRequestSimulator {
  private baseUrl: string | null = null;
  private apiEndpoint: string = '/api/reallocation';
  private isRunning: boolean = false;
  private simulationInterval: NodeJS.Timeout | null = null;
  private requestFrequencyMs: number = 30000; // Default: generate a request every 30 seconds
  private expiryTimeMinutes: number = 30; // Default: requests expire after 30 minutes
  
  // Fermata data for simulation
  private fermatas = [
    { id: 'F001', name: 'Bole Road Station' },
    { id: 'F002', name: 'Meskel Square' },
    { id: 'F003', name: 'Mexico Square' },
    { id: 'F004', name: 'Piassa Square' },
    { id: 'F005', name: 'CMC Road' },
    { id: 'F006', name: 'Megenagna' },
  ];

  constructor(config?: {
    baseUrl?: string;
    apiEndpoint?: string;
    requestFrequencyMs?: number;
    expiryTimeMinutes?: number;
  }) {
    if (config?.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
    
    if (config?.apiEndpoint) {
      this.apiEndpoint = config.apiEndpoint;
    }
    
    if (config?.requestFrequencyMs) {
      this.requestFrequencyMs = config.requestFrequencyMs;
    }
    
    if (config?.expiryTimeMinutes) {
      this.expiryTimeMinutes = config.expiryTimeMinutes;
    }
  }

  /**
   * Start the simulation
   * Begins generating reallocation requests at the configured frequency
   */
  public startSimulation(): void {
    if (this.isRunning) {
      console.log('Simulation is already running');
      return;
    }

    this.isRunning = true;
    console.log(`🚌 Starting reallocation request simulation (frequency: ${this.requestFrequencyMs}ms)`);
    
    // Generate one request immediately
    this.generateAndSendRequest();
    
    // Set up interval for continuous generation
    this.simulationInterval = setInterval(() => {
      this.generateAndSendRequest();
    }, this.requestFrequencyMs);
  }

  /**
   * Stop the simulation
   */
  public stopSimulation(): void {
    if (!this.isRunning) {
      console.log('Simulation is not running');
      return;
    }

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    this.isRunning = false;
    console.log('🛑 Stopped reallocation request simulation');
  }

  /**
   * Generate a single reallocation request with realistic data
   */
  public generateRequest(): Omit<ReallocationRequest, 'id' | 'timestamp' | 'status'> {
    // Select a random fermata
    const fermata = this.fermatas[Math.floor(Math.random() * this.fermatas.length)];
    
    // Generate random data for the request
    const numBusesAllocated = Math.floor(Math.random() * 3); // 0-2 buses
    const averageWaitTimeMinutes = Math.floor(Math.random() * 20) + 5; // 5-25 minutes
    const estimatedNumPeopleInQueue = Math.floor(Math.random() * 50) + 10; // 10-60 people
    
    // Determine priority based on wait time and queue size
    let priority: 'low' | 'normal' | 'high';
    if (averageWaitTimeMinutes > 15 || estimatedNumPeopleInQueue > 40) {
      priority = 'high';
    } else if (averageWaitTimeMinutes > 10 || estimatedNumPeopleInQueue > 25) {
      priority = 'normal';
    } else {
      priority = 'low';
    }

    return {
      fermataId: fermata.id,
      fermataName: fermata.name,
      numBusesAllocated,
      averageWaitTimeMinutes,
      estimatedNumPeopleInQueue,
      priority,
    };
  }

  /**
   * Generate a request and send it to the API
   */
  private async generateAndSendRequest(): Promise<void> {
    try {
      const request = this.generateRequest();
      
      console.log(`🚌 Generating reallocation request for ${request.fermataName} (${request.fermataId})`);
      console.log(`   Wait time: ${request.averageWaitTimeMinutes} min, Queue: ${request.estimatedNumPeopleInQueue}, Priority: ${request.priority}`);
      
      // Construct the full URL using the base URL
      const fullApiUrl = this.baseUrl ? `${this.baseUrl}${this.apiEndpoint}` : this.apiEndpoint;
      
      const response = await fetch(fullApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'add_request',
          request,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Request added successfully with ID: ${data.requestId}`);
      } else {
        console.error(`❌ Failed to add request: ${data.error}`);
      }
    } catch (error) {
      console.error('Error generating or sending request:', error);
    }
  }

  /**
   * Generate multiple requests at once (useful for testing)
   * @param count Number of requests to generate
   */
  public async generateBulkRequests(count: number): Promise<void> {
    console.log(`🚌 Generating ${count} reallocation requests in bulk`);
    
    for (let i = 0; i < count; i++) {
      await this.generateAndSendRequest();
      // Small delay to prevent overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ Bulk generation complete (${count} requests)`);
  }

  /**
   * Get the current expiry time setting in minutes
   */
  public getExpiryTimeMinutes(): number {
    return this.expiryTimeMinutes;
  }

  /**
   * Set a new expiry time for requests
   * @param minutes New expiry time in minutes
   */
  public setExpiryTimeMinutes(minutes: number): void {
    if (minutes < 1) {
      throw new Error('Expiry time must be at least 1 minute');
    }
    this.expiryTimeMinutes = minutes;
    console.log(`🕒 Request expiry time set to ${minutes} minutes`);
  }

  /**
   * Get the current request frequency
   */
  public getRequestFrequencyMs(): number {
    return this.requestFrequencyMs;
  }

  /**
   * Set a new request generation frequency
   * @param ms New frequency in milliseconds
   */
  public setRequestFrequencyMs(ms: number): void {
    if (ms < 1000) {
      throw new Error('Request frequency must be at least 1000ms (1 second)');
    }
    
    const wasRunning = this.isRunning;
    
    // Stop the current simulation if it's running
    if (wasRunning) {
      this.stopSimulation();
    }
    
    this.requestFrequencyMs = ms;
    console.log(`⏱️ Request frequency set to ${ms}ms`);
    
    // Restart the simulation if it was running
    if (wasRunning) {
      this.startSimulation();
    }
  }

  /**
   * Check if the simulation is currently running
   */
  public isSimulationRunning(): boolean {
    return this.isRunning;
  }
}

// Create a singleton instance for global use
let simulatorInstance: ReallocationRequestSimulator | null = null;

export function getReallocationRequestSimulator(config?: {
  baseUrl?: string;
  apiEndpoint?: string;
  requestFrequencyMs?: number;
  expiryTimeMinutes?: number;
}): ReallocationRequestSimulator {
  // If an instance exists, update its config if new config is provided
  if (simulatorInstance) {
    if (config?.baseUrl) {
      simulatorInstance['baseUrl'] = config.baseUrl; // Update baseUrl
    }
    if (config?.apiEndpoint) {
      simulatorInstance['apiEndpoint'] = config.apiEndpoint; // Update apiEndpoint
    }
    if (config?.requestFrequencyMs !== undefined) {
      simulatorInstance.setRequestFrequencyMs(config.requestFrequencyMs);
    }
    if (config?.expiryTimeMinutes !== undefined) {
      simulatorInstance.setExpiryTimeMinutes(config.expiryTimeMinutes);
    }
  } else {
    // Create a new instance if none exists
    simulatorInstance = new ReallocationRequestSimulator(config);
  }
  return simulatorInstance;
}
