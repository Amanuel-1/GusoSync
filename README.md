# GusoSync

**GusoSync** is an **AI-powered, agentic bus allocation and public transit management platform**. Leveraging advanced artificial intelligence, GusoSync delivers real-time decision-making for bus operations, route management, and dynamic resource allocation. The system is designed for maximum automation, efficiency, and user empowerment—making your transit network smarter and more responsive.

---

## Why GusoSync?

- **AI at the Core:**  
  GusoSync’s bus allocation system is driven by intelligent agents that analyze real-time data, optimize route assignments, and dynamically respond to incidents or demand surges.  
- **Agentic Resource Management:**  
  The platform autonomously reallocates buses, assigns drivers, and adapts to real-world events—reducing manual intervention and improving operational efficiency.
- **Future-Proof Transit:**  
  With built-in AI hooks for predictive analytics and planned integration with business intelligence tools, GusoSync lays the groundwork for next-gen urban mobility.

---

## Features

- **AI-Powered, Agentic Bus Allocation:**  
  - Smart, dynamic assignment and reallocation of buses, routes, and staff using AI agents.
  - Automated incident response and resource redistribution in real time.
  - Predictive analytics (planned): anticipate demand, breakdowns, and optimize for efficiency.

- **Live, Real-time Bus Tracking:**  
  - WebSocket-based tracking with fallback polling.
  - Instant ETA calculations and proximity alerts.

- **Advanced Notification System:**  
  - Real-time notifications for all key events—powered by AI-driven detection of anomalies, incidents, and operational needs.
  - Central notification center, browser push, toast alerts, and API integration.
  - Priority-based styling and categorization.

- **Comprehensive Management:**  
  - Bus and stop CRUD, operational statistics, and health monitoring.
  - Role-based access for drivers, regulators, control staff, and admins.
  - Automated user and staff allocation to critical locations based on live data.

- **Reporting & Analytics:**  
  - (Planned) AI-generated reports, scheduled delivery, and integration with external BI tools.
  - (Planned) Automated insights and alerts based on historical and live trends.

---

## Key Components

- **AI Agent Layer:**  
  (Core logic and hooks for agentic bus allocation, incident detection, and automated decision-making.)
- **NotificationProvider / useNotifications:**  
  Manages stateful, real-time notifications with AI-driven filtering and escalation.
- **useRealTimeBusTracking:**  
  Real-time hook for bus, route, and stop state, including AI-predicted ETAs and anomaly detection.
- **Management Hooks:**  
  - `useBusManagement` / `useBusManagementAPI`
  - `useBusStopManagement`
  - `useUserManagement`
  For full CRUD and smart operational control.

---

## API Integration

- `/api/busses` — AI-powered bus management and allocation
- `/api/bus-stops` — Stop management
- `/api/notifications` — Event notification API
- `/api/account/notification-settings` — Personalize alerts
- `/api/auth/websocket-token` — Secure real-time data feeds

---

## Usage Example

1. **Wrap your app with the NotificationProvider:**
   ```tsx
   import { NotificationProvider } from '@/components/notifications';

   function App() {
     return (
       <NotificationProvider>
         {/* Your app content */}
       </NotificationProvider>
     );
   }
   ```
2. **Access AI-powered notifications and bus data:**
   ```tsx
   import { useNotifications } from '@/hooks/useNotifications';
   import { useRealTimeBusTracking } from '@/hooks/use-realtime-bus-tracking';

   function Dashboard() {
     const { notifications, unreadCount } = useNotifications();
     const { buses, routes, proximityAlerts } = useRealTimeBusTracking();
     // Your AI-driven dashboard logic here
   }
   ```

---

## Future Enhancements

- Scheduled, AI-generated report delivery
- Autonomous fleet and route optimization
- Predictive breakdown and demand modeling
- Multi-language and cross-agency support
- Deep integration with city-wide BI platforms

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss your ideas.

---

## Contact

Created and maintained by [Amanuel-1](https://github.com/Amanuel-1).
