# New Levels Plan — System Design Sim (Levels 6–10)

Each level introduces one core infrastructure concept, builds on the previous, and fits the existing engine architecture (simulators, topology walker, level configs).

---

## Level 6: "The Gatekeeper" — Rate Limiting & API Gateway

**Concept:** Rate limiting, throttling, API gateway pattern

**Narrative:**
Your platform is being hammered by bots and scrapers. Legitimate users are suffering because bot traffic is consuming all your server capacity. You need to protect your infrastructure by adding rate limiting at the API gateway layer.

**Budget:** $6,000  
**Target:** 12,000 RPS from legitimate users  
**Win condition:** ≥ 12,000 RPS with bot traffic blocked (< 5% bounced rate from throttling)  
**Fail condition:** > 30% of requests are bot traffic (servers overloaded by scrapers)

**New component:** `apiGateway` node  
- Sits in front of the load balancer
- Rate limits per-IP: passes through `legitimateRps`, blocks `botRps`
- Visual: shield icon, shows "X req/min limit"

**Initial topology:**  
Traffic Source (mixed bots) → Load Balancer → 4 Servers → Cache → Database

**Player action:** Add API Gateway between traffic and load balancer; tune the rate limit threshold to block bots without throttling real users.

**New simulator:** `RateLimiterSimulator`
- Each tick: reads `botTrafficPercent` from traffic source node data
- If no API gateway in topology: let all traffic through (servers overload)
- If gateway present: apply rate limit, reduce effective RPS to legitimateRps only

**Win lesson:** "API gateways are the front door to your system. Rate limiting protects backend services from abuse and DDoS attacks. This is how Cloudflare, AWS API Gateway, and Kong work in production."

---

## Level 7: "The Decoupler" — Message Queues & Async Processing

**Concept:** Message queues, async processing, decoupling producers from consumers

**Narrative:**
Your app has a payment processing feature that takes 2–5 seconds per transaction. When traffic spikes, the synchronous payment calls are blocking your web servers and creating massive latency for all users — even those just browsing.

**Budget:** $7,000  
**Target:** 10,000 RPS with payment latency < 500ms (async, not blocking)  
**Win condition:** ≥ 10,000 RPS + average latency < 150ms  
**Fail condition:** Latency ≥ 500ms (queue overflow — workers can't keep up)

**New component:** `messageQueue` node (e.g. Kafka/RabbitMQ)  
- Decouples servers from slow worker nodes
- Visual: stack of message icon, shows queue depth
- If queue depth exceeds capacity: latency spikes

**New component:** `workerNode`  
- Consumes from the queue, processes async jobs
- Has its own capacity (jobs/sec)
- Multiple workers scale throughput

**Initial topology:**  
Traffic → LB → 3 Servers → (synchronous DB writes causing latency)

**Player action:** Insert Message Queue between servers and a new WorkerNode fleet; workers handle slow DB writes async.

**New simulator:** `QueueSimulator`  
- Tracks queue depth per tick
- Drain rate = worker count × worker capacity
- Fill rate = server RPS × async job rate (20%)
- If depth > maxDepth: overflow → latency penalty

**Win lesson:** "Message queues decouple fast web servers from slow background jobs. This is how every e-commerce site handles payments, emails, and notifications — asynchronously, without blocking users."

---

## Level 8: "The Split" — Microservices & Service Mesh

**Concept:** Microservices decomposition, service-to-service communication, service mesh

**Narrative:**
Your monolithic app is getting harder to scale. The user profile service needs 10x capacity but the product catalog barely gets any traffic. Splitting into microservices lets you scale each service independently.

**Budget:** $10,000  
**Target:** 15,000 RPS total across 3 services (User, Catalog, Orders)  
**Win condition:** ≥ 15,000 RPS with all 3 services healthy and latency < 100ms  
**Fail condition:** Any service at > 90% capacity (bottleneck)

**New component:** `serviceNode`  
- Like a server but dedicated to one domain
- Has a `serviceName` property (user, catalog, orders)
- Inter-service calls add latency

**New component:** `serviceMesh` node  
- Routes inter-service traffic
- Adds observability; shows inter-service RPS
- Without it: services communicate directly (higher latency, no circuit breaking)

**Initial topology:**  
Monolith server (all-in-one) → Database

**Player action:** Break the monolith into 3 service nodes; add databases per service; optionally add a service mesh for routing.

**New simulator:** `ServiceMeshSimulator`  
- Tracks inter-service call overhead
- Without mesh: +30ms per inter-service call
- With mesh: +10ms per call, but enables circuit breaking

**Win lesson:** "Microservices let you scale and deploy each part of your system independently. Service meshes handle the complexity of service-to-service communication. This is how Netflix, Uber, and Amazon build at scale."

---

## Level 9: "The Elastic Cloud" — Auto-Scaling

**Concept:** Auto-scaling, scaling policies, cost optimization

**Narrative:**
Your traffic follows a daily pattern — massive spikes at noon and 6pm, quiet at 3am. Running servers 24/7 to handle peak load wastes money. Auto-scaling spins servers up and down automatically.

**Budget:** $5,000 (+ $200/server/tick cost model)  
**Target:** Maintain < 80% server utilization and < 150ms latency through a 24-hour traffic cycle  
**Win condition:** Survive full traffic cycle without overload + total spend < $15,000  
**Fail condition:** Any server overloaded OR total spend > $20,000

**New component:** `autoScaler` node  
- Monitors connected servers' load
- Automatically adds/removes servers based on scaling policy
- Configurable: scale-up threshold (e.g. 70%), scale-down threshold (40%), cooldown (3 ticks)

**Traffic pattern:** Sine-wave traffic: starts low → peaks at tick 20 → drops → peaks again at tick 40 → ends. Players can see the traffic forecast graph.

**New simulator:** `AutoScalerSimulator`  
- Each tick: checks average load across servers connected to the auto-scaler
- Above scale-up threshold + cooldown elapsed: spawn a new server node
- Below scale-down threshold + cooldown elapsed: remove least-loaded server
- Each spawned server costs money per tick

**Win lesson:** "Auto-scaling is how cloud providers like AWS EC2, Google Cloud Run, and Azure VMSS handle variable load — you only pay for what you use, and capacity matches demand automatically."

---

## Level 10: "Chaos Engineering" — Fault Injection & Circuit Breakers

**Concept:** Chaos engineering, circuit breakers, graceful degradation

**Narrative:**
Welcome to the big leagues. You're running a globally distributed system and things will break — randomly, unexpectedly. This level tests whether your architecture can survive chaos: random node failures, network partitions, and cascading outages.

**Budget:** $12,000  
**Target:** Maintain ≥ 60% RPS through 5 random failure events  
**Win condition:** Survive all 5 chaos events with RPS never dropping below 60% of peak  
**Fail condition:** RPS drops below 60% during any chaos event

**New component:** `circuitBreaker` node  
- Wraps downstream services
- If downstream fails > threshold: opens circuit, returns fallback response
- Prevents cascading failures (no thundering herd)
- Visual: shows CLOSED/OPEN/HALF-OPEN state

**Chaos events (random from pool):**
1. Server crashes (1–2 random servers go dead)
2. Database slow query storm (latency × 5 for 10 ticks)
3. Network partition (one region loses connectivity for 8 ticks)
4. Memory leak (server capacity degrades 10% per tick until restarted)
5. DDoS spike (traffic × 3 for 6 ticks)

**New simulator:** `ChaosSimulator`  
- At random tick intervals, inject a failure event
- Shows countdown timer and event type to player ("⚡ Chaos incoming in 3 ticks...")
- Circuit breakers automatically mitigate cascading failures
- Without circuit breakers: one failure cascades to take down the whole system

**Win lesson:** "Chaos engineering (pioneered by Netflix's Chaos Monkey) proves your system's resilience before failures happen in production. Circuit breakers prevent one slow service from taking down your entire app."

---

## Implementation Notes

### New Node Types Required
- Level 6: `apiGateway`
- Level 7: `messageQueue`, `workerNode`
- Level 8: `serviceNode`, `serviceMesh`
- Level 9: `autoScaler`
- Level 10: `circuitBreaker`

### New Simulators Required
- `RateLimiterSimulator.js`
- `QueueSimulator.js`
- `ServiceMeshSimulator.js`
- `AutoScalerSimulator.js`
- `ChaosSimulator.js`

### Engine Changes Needed
- `LevelConfigs.js`: Add levels 6–10
- `LevelOrchestrator.js`: Register new simulators in `activeSimulators` per level
- `MetricsCollector.js`: Add new metrics (queue depth, circuit state, chaos event, cost/tick)

### Visual/UI Changes Needed
- Traffic forecast graph for Level 9 (auto-scaling visibility)
- Chaos event countdown banner for Level 10
- Circuit breaker state indicator on nodes
- Cost-per-tick display in HUD for Level 9

### Estimated Complexity Per Level
| Level | New Components | New Simulator | UI Additions | Difficulty |
|-------|---------------|---------------|--------------|------------|
| 6 | 1 | 1 | Minimal | Easy |
| 7 | 2 | 1 | Minimal | Medium |
| 8 | 2 | 1 | Minimal | Medium |
| 9 | 1 | 1 | Traffic graph | Hard |
| 10 | 1 | 1 | Chaos banner | Hard |

### Suggested Build Order
1. Level 6 first (most isolated — just a new node type + simple simulator)
2. Level 7 (introduces queue depth concept needed for Level 8 understanding)
3. Level 8 (builds on service topology concepts)
4. Level 10 before Level 9 (chaos is simpler mechanically than auto-scaling cost model)
5. Level 9 last (most complex: dynamic node spawning + cost model)
