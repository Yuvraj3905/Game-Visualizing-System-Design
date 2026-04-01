export const LEVEL_CONFIGS = {
  1: {
    name: 'The Monolith',
    subtitle: 'Vertical vs. Horizontal Scaling',
    budget: 500,
    initialTraffic: 0,
    targetTraffic: 1000,
    baseLatency: 50,
    congestionFactor: 0.1,
    sustainSeconds: 10,
    narrative: {
      title: 'Chapter 1: Humble Beginnings',
      description: "You're a solo developer who just launched a product. It's running on a single server — your \"monolith.\" Traffic is starting to pick up, but your server can only handle so much. When it gets overloaded, it crashes.",
      objective: 'Handle 1,000 requests per second without any server crashing.',
      hint: 'Try adding more servers and connecting them to the traffic source.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database'],
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 100, y: 200 }, data: { label: 'Users', rps: 0, region: 'default' } },
      { id: 'server-1', type: 'server', position: { x: 400, y: 200 }, data: { label: 'Web Server', rps: 0, capacity: 500, status: 'healthy' } },
      { id: 'db-1', type: 'database', position: { x: 700, y: 200 }, data: { label: 'SQL Database', rps: 0, capacity: 2000, status: 'healthy' } },
    ],
    initialEdges: [
      { id: 'e-traffic-server', source: 'traffic-1', target: 'server-1', animated: true },
      { id: 'e-server-db', source: 'server-1', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.rps >= 1000 && metrics.overloadedServers === 0;
    },
    failCondition: (metrics) => {
      return metrics.overloadedServers > 0;
    },
    failMessage: "Your server caught fire! It can't handle all that traffic alone.",
    failExplanation: 'A single server has limited capacity. When traffic exceeds that limit, it crashes. You need to scale horizontally — add more servers to share the load.',
    winLesson: "You just learned horizontal scaling — adding more machines instead of upgrading one. This is how Netflix, Google, and Amazon handle billions of requests. It's cheaper and more resilient than buying one giant server.",
    nodeCosts: { server: 200, database: 300 },
    activeSimulators: ['traffic'],
  },

  2: {
    name: 'The Distribution',
    subtitle: 'Load Balancing',
    budget: 2000,
    initialTraffic: 0,
    targetTraffic: 3000,
    baseLatency: 40,
    congestionFactor: 0.08,
    sustainSeconds: 10,
    narrative: {
      title: 'Chapter 2: The Distribution',
      description: "Your app is growing! You now have 3 servers, but there's a problem — all traffic is going to Server 1 while Servers 2 and 3 sit idle. You need something to distribute the load evenly.",
      objective: 'Handle 3,000 RPS by distributing traffic evenly across all servers.',
      hint: 'Place a Load Balancer between the traffic source and your servers.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database', 'loadBalancer'],
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 50, y: 250 }, data: { label: 'Users', rps: 0, region: 'default' } },
      { id: 'server-1', type: 'server', position: { x: 500, y: 100 }, data: { label: 'Server 1', rps: 0, capacity: 1200, status: 'healthy' } },
      { id: 'server-2', type: 'server', position: { x: 500, y: 280 }, data: { label: 'Server 2', rps: 0, capacity: 1200, status: 'healthy' } },
      { id: 'server-3', type: 'server', position: { x: 500, y: 460 }, data: { label: 'Server 3', rps: 0, capacity: 1200, status: 'healthy' } },
      { id: 'db-1', type: 'database', position: { x: 800, y: 250 }, data: { label: 'SQL Database', rps: 0, capacity: 5000, status: 'healthy' } },
    ],
    initialEdges: [
      { id: 'e-traffic-s1', source: 'traffic-1', target: 'server-1', animated: true },
      { id: 'e-s1-db', source: 'server-1', target: 'db-1', animated: true },
      { id: 'e-s2-db', source: 'server-2', target: 'db-1', animated: true },
      { id: 'e-s3-db', source: 'server-3', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.rps >= 3000 && metrics.overloadedServers === 0;
    },
    failCondition: (metrics) => {
      return metrics.overloadedServers > 0;
    },
    failMessage: 'Server 1 is overwhelmed while other servers sit idle!',
    failExplanation: "Without a load balancer, all traffic hits a single server. The others can't help because nothing is routing requests to them. A load balancer acts as a traffic cop, distributing requests evenly.",
    winLesson: "Load balancers distribute traffic evenly — this is how every major website works. Even the simplest algorithm (round-robin) is a massive improvement over sending everything to one server.",
    nodeCosts: { server: 300, loadBalancer: 400, database: 300 },
    activeSimulators: ['traffic', 'loadBalancer'],
  },

  3: {
    name: 'The Speed Demon',
    subtitle: 'Caching',
    budget: 3000,
    initialTraffic: 0,
    targetTraffic: 5000,
    baseLatency: 40,
    congestionFactor: 0.06,
    sustainSeconds: 10,
    latencyTarget: 100,
    narrative: {
      title: 'Chapter 3: The Speed Demon',
      description: "Traffic keeps growing. Your load-balanced servers handle the throughput fine, but the database is becoming a bottleneck. Every request hits the database, and response times are creeping up. Users are starting to notice the lag.",
      objective: 'Handle 5,000 RPS while keeping latency below 100ms.',
      hint: 'Add a Cache between your servers and the database to serve repeated queries from memory.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database', 'loadBalancer', 'cache'],
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 50, y: 250 }, data: { label: 'Users', rps: 0, region: 'default' } },
      { id: 'lb-1', type: 'loadBalancer', position: { x: 250, y: 250 }, data: { label: 'Load Balancer', rps: 0, algorithm: 'round-robin', status: 'healthy' } },
      { id: 'server-1', type: 'server', position: { x: 480, y: 100 }, data: { label: 'Server 1', rps: 0, capacity: 2000, status: 'healthy' } },
      { id: 'server-2', type: 'server', position: { x: 480, y: 280 }, data: { label: 'Server 2', rps: 0, capacity: 2000, status: 'healthy' } },
      { id: 'server-3', type: 'server', position: { x: 480, y: 460 }, data: { label: 'Server 3', rps: 0, capacity: 2000, status: 'healthy' } },
      { id: 'db-1', type: 'database', position: { x: 800, y: 250 }, data: { label: 'SQL Database', rps: 0, capacity: 3000, status: 'healthy' } },
    ],
    initialEdges: [
      { id: 'e-traffic-lb', source: 'traffic-1', target: 'lb-1', animated: true },
      { id: 'e-lb-s1', source: 'lb-1', target: 'server-1', animated: true },
      { id: 'e-lb-s2', source: 'lb-1', target: 'server-2', animated: true },
      { id: 'e-lb-s3', source: 'lb-1', target: 'server-3', animated: true },
      { id: 'e-s1-db', source: 'server-1', target: 'db-1', animated: true },
      { id: 'e-s2-db', source: 'server-2', target: 'db-1', animated: true },
      { id: 'e-s3-db', source: 'server-3', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.rps >= 5000 && metrics.avgLatency < 100 && metrics.overloadedServers === 0;
    },
    failCondition: (metrics) => {
      return metrics.avgLatency >= 200;
    },
    failMessage: 'Latency is through the roof! Your database is doing a full table scan for every single request.',
    failExplanation: 'Without caching, every request goes to the database. Databases are great for storage but slow for repeated reads. A cache stores frequent results in memory, dramatically reducing response times.',
    winLesson: "Caching stores frequent results in memory — Redis handles millions of reads per second. Most real applications cache 80-95% of their reads. This is why Twitter, Instagram, and Facebook feel instant.",
    nodeCosts: { server: 300, loadBalancer: 400, database: 300, cache: 500 },
    activeSimulators: ['traffic', 'loadBalancer', 'cache'],
  },

  4: {
    name: 'The Global Expansion',
    subtitle: 'CDNs & Regions',
    budget: 5000,
    initialTraffic: 0,
    targetTraffic: 8000,
    baseLatency: 30,
    congestionFactor: 0.04,
    sustainSeconds: 10,
    latencyTarget: 200,
    narrative: {
      title: 'Chapter 4: The Global Expansion',
      description: "Your app has gone viral internationally! But there's a problem — all your infrastructure is in India. Users in the US and Europe are experiencing 300ms+ latency, and they're bouncing off your site.",
      objective: 'Handle 8,000 RPS from 3 regions with under 200ms latency everywhere.',
      hint: 'Deploy a CDN and consider adding servers in regions closer to your users.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database', 'loadBalancer', 'cache', 'cdn', 'region'],
    regions: [
      { id: 'region-india', name: 'India', latencyFromOthers: { 'region-us': 250, 'region-europe': 180 } },
      { id: 'region-us', name: 'US', latencyFromOthers: { 'region-india': 250, 'region-europe': 120 } },
      { id: 'region-europe', name: 'Europe', latencyFromOthers: { 'region-india': 180, 'region-us': 120 } },
    ],
    initialNodes: [
      { id: 'traffic-india', type: 'trafficSource', position: { x: 50, y: 150 }, data: { label: 'India Users', rps: 0, region: 'region-india' } },
      { id: 'traffic-us', type: 'trafficSource', position: { x: 50, y: 350 }, data: { label: 'US Users', rps: 0, region: 'region-us' } },
      { id: 'traffic-europe', type: 'trafficSource', position: { x: 50, y: 550 }, data: { label: 'Europe Users', rps: 0, region: 'region-europe' } },
      { id: 'region-india', type: 'region', position: { x: 300, y: 50 }, data: { label: 'India Region', region: 'region-india' }, style: { width: 500, height: 300 } },
      { id: 'lb-1', type: 'loadBalancer', position: { x: 350, y: 120 }, data: { label: 'Load Balancer', rps: 0, algorithm: 'round-robin', status: 'healthy' }, parentNode: 'region-india', extent: 'parent' },
      { id: 'server-1', type: 'server', position: { x: 550, y: 80 }, data: { label: 'Server 1', rps: 0, capacity: 3000, status: 'healthy' }, parentNode: 'region-india', extent: 'parent' },
      { id: 'server-2', type: 'server', position: { x: 550, y: 200 }, data: { label: 'Server 2', rps: 0, capacity: 3000, status: 'healthy' }, parentNode: 'region-india', extent: 'parent' },
      { id: 'cache-1', type: 'cache', position: { x: 700, y: 140 }, data: { label: 'Redis Cache', rps: 0, hitRate: 0, status: 'healthy' }, parentNode: 'region-india', extent: 'parent' },
      { id: 'db-1', type: 'database', position: { x: 850, y: 140 }, data: { label: 'SQL Database', rps: 0, capacity: 5000, status: 'healthy' }, parentNode: 'region-india', extent: 'parent' },
    ],
    initialEdges: [
      { id: 'e-ti-lb', source: 'traffic-india', target: 'lb-1', animated: true },
      { id: 'e-tu-lb', source: 'traffic-us', target: 'lb-1', animated: true },
      { id: 'e-te-lb', source: 'traffic-europe', target: 'lb-1', animated: true },
      { id: 'e-lb-s1', source: 'lb-1', target: 'server-1', animated: true },
      { id: 'e-lb-s2', source: 'lb-1', target: 'server-2', animated: true },
      { id: 'e-s1-cache', source: 'server-1', target: 'cache-1', animated: true },
      { id: 'e-s2-cache', source: 'server-2', target: 'cache-1', animated: true },
      { id: 'e-cache-db', source: 'cache-1', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.rps >= 8000 && metrics.maxRegionLatency < 200 && metrics.bouncedUsers === 0;
    },
    failCondition: (metrics) => {
      return metrics.bouncedUsers > 100;
    },
    failMessage: "Users are leaving! Visitors from distant regions can't stand the lag.",
    failExplanation: "When all your servers are in one location, distant users experience high latency due to the physical distance data must travel. CDNs cache content at edge locations worldwide, and multi-region deployment puts your servers closer to users.",
    winLesson: "CDNs and multi-region deployment reduce latency by serving users from nearby locations. This is how Cloudflare, AWS CloudFront, and Akamai make the web fast — by putting copies of your content everywhere.",
    nodeCosts: { server: 400, loadBalancer: 400, database: 500, cache: 500, cdn: 600, region: 0 },
    activeSimulators: ['traffic', 'loadBalancer', 'cache', 'geoLatency'],
  },

  5: {
    name: 'The Unstoppable App',
    subtitle: 'Fault Tolerance',
    budget: 8000,
    initialTraffic: 0,
    targetTraffic: 10000,
    baseLatency: 30,
    congestionFactor: 0.03,
    sustainSeconds: 10,
    disasterTime: 15,
    narrative: {
      title: 'Chapter 5: The Unstoppable App',
      description: "You're now running a global platform. Everything seems perfect until — disaster strikes. A data center goes offline. Your primary database fails. Can your system survive?",
      objective: 'Survive a data center failure while maintaining over 50% RPS capacity.',
      hint: 'Set up database replicas for redundancy and health checks to detect failures automatically.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database', 'loadBalancer', 'cache', 'cdn', 'region', 'replica', 'healthCheck'],
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 50, y: 300 }, data: { label: 'Users', rps: 0, region: 'default' } },
      { id: 'cdn-1', type: 'cdn', position: { x: 220, y: 300 }, data: { label: 'CDN', rps: 0, cacheRate: 0.3, status: 'healthy' } },
      { id: 'lb-1', type: 'loadBalancer', position: { x: 420, y: 300 }, data: { label: 'Load Balancer', rps: 0, algorithm: 'round-robin', status: 'healthy' } },
      { id: 'server-1', type: 'server', position: { x: 640, y: 150 }, data: { label: 'Server 1', rps: 0, capacity: 4000, status: 'healthy' } },
      { id: 'server-2', type: 'server', position: { x: 640, y: 320 }, data: { label: 'Server 2', rps: 0, capacity: 4000, status: 'healthy' } },
      { id: 'server-3', type: 'server', position: { x: 640, y: 490 }, data: { label: 'Server 3', rps: 0, capacity: 4000, status: 'healthy' } },
      { id: 'cache-1', type: 'cache', position: { x: 860, y: 230 }, data: { label: 'Redis Cache', rps: 0, hitRate: 0, status: 'healthy' } },
      { id: 'db-1', type: 'database', position: { x: 1060, y: 300 }, data: { label: 'Primary DB', rps: 0, capacity: 5000, status: 'healthy', isPrimary: true } },
    ],
    initialEdges: [
      { id: 'e-traffic-cdn', source: 'traffic-1', target: 'cdn-1', animated: true },
      { id: 'e-cdn-lb', source: 'cdn-1', target: 'lb-1', animated: true },
      { id: 'e-lb-s1', source: 'lb-1', target: 'server-1', animated: true },
      { id: 'e-lb-s2', source: 'lb-1', target: 'server-2', animated: true },
      { id: 'e-lb-s3', source: 'lb-1', target: 'server-3', animated: true },
      { id: 'e-s1-cache', source: 'server-1', target: 'cache-1', animated: true },
      { id: 'e-s2-cache', source: 'server-2', target: 'cache-1', animated: true },
      { id: 'e-s3-cache', source: 'server-3', target: 'cache-1', animated: true },
      { id: 'e-cache-db', source: 'cache-1', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.survivedDisaster && metrics.rps >= 5000;
    },
    failCondition: (metrics) => {
      return metrics.systemDown;
    },
    failMessage: 'SYSTEM DOWN. Total blackout.',
    failExplanation: 'When your primary database fails and there are no replicas, everything stops. Database replication creates copies that can take over instantly. Health checks detect failures so traffic can be rerouted automatically.',
    winLesson: "Replication and health checks give you high availability — no single point of failure. This is how AWS achieves 99.99% uptime. Every production system at scale uses redundancy and automated failover.",
    nodeCosts: { server: 400, loadBalancer: 400, database: 500, cache: 500, cdn: 600, replica: 700, healthCheck: 300, region: 0 },
    activeSimulators: ['traffic', 'loadBalancer', 'cache', 'failover'],
  },
  6: {
    name: 'The Gatekeeper',
    subtitle: 'Rate Limiting & API Gateway',
    budget: 6000,
    initialTraffic: 0,
    targetTraffic: 12000,
    baseLatency: 30,
    congestionFactor: 0.04,
    sustainSeconds: 10,
    narrative: {
      title: 'Chapter 6: The Gatekeeper',
      description: "Your platform is under attack! Bots and scrapers are consuming 40% of your server capacity, causing legitimate users to experience slow responses. You need to filter the bad traffic before it reaches your servers.",
      objective: 'Handle 12,000 legitimate RPS by blocking bot traffic with an API Gateway.',
      hint: 'Place an API Gateway before the load balancer. It will rate-limit incoming traffic and block the excess.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database', 'loadBalancer', 'cache', 'apiGateway'],
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 50, y: 250 }, data: { label: 'Users + Bots', rps: 0, region: 'default', botPercent: 0.4 } },
      { id: 'lb-1', type: 'loadBalancer', position: { x: 400, y: 250 }, data: { label: 'Load Balancer', rps: 0, algorithm: 'round-robin', status: 'healthy' } },
      { id: 'server-1', type: 'server', position: { x: 650, y: 100 }, data: { label: 'Server 1', rps: 0, capacity: 3000, status: 'healthy' } },
      { id: 'server-2', type: 'server', position: { x: 650, y: 250 }, data: { label: 'Server 2', rps: 0, capacity: 3000, status: 'healthy' } },
      { id: 'server-3', type: 'server', position: { x: 650, y: 400 }, data: { label: 'Server 3', rps: 0, capacity: 3000, status: 'healthy' } },
      { id: 'cache-1', type: 'cache', position: { x: 880, y: 250 }, data: { label: 'Redis Cache', rps: 0, hitRate: 0, status: 'healthy' } },
      { id: 'db-1', type: 'database', position: { x: 1080, y: 250 }, data: { label: 'SQL Database', rps: 0, capacity: 5000, status: 'healthy' } },
    ],
    initialEdges: [
      { id: 'e-traffic-lb', source: 'traffic-1', target: 'lb-1', animated: true },
      { id: 'e-lb-s1', source: 'lb-1', target: 'server-1', animated: true },
      { id: 'e-lb-s2', source: 'lb-1', target: 'server-2', animated: true },
      { id: 'e-lb-s3', source: 'lb-1', target: 'server-3', animated: true },
      { id: 'e-s1-cache', source: 'server-1', target: 'cache-1', animated: true },
      { id: 'e-s2-cache', source: 'server-2', target: 'cache-1', animated: true },
      { id: 'e-s3-cache', source: 'server-3', target: 'cache-1', animated: true },
      { id: 'e-cache-db', source: 'cache-1', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.rps >= 12000 && metrics.overloadedServers === 0 && metrics.totalBlocked > 0;
    },
    failCondition: (metrics) => {
      return metrics.overloadedServers > 0;
    },
    failMessage: 'Servers overloaded! Bot traffic is eating your capacity.',
    failExplanation: 'Without an API Gateway to filter traffic, bots consume the same resources as real users. Rate limiting blocks abusive traffic before it reaches your servers.',
    winLesson: "API Gateways are the front door to your system. Rate limiting protects backend services from abuse and DDoS attacks. This is how Cloudflare, AWS API Gateway, and Kong work in production.",
    nodeCosts: { server: 400, loadBalancer: 400, database: 500, cache: 500, apiGateway: 800 },
    activeSimulators: ['traffic', 'rateLimiter', 'loadBalancer', 'cache'],
  },

  7: {
    name: 'The Decoupler',
    subtitle: 'Message Queues & Async Processing',
    budget: 7000,
    initialTraffic: 0,
    targetTraffic: 10000,
    baseLatency: 30,
    congestionFactor: 0.05,
    sustainSeconds: 10,
    narrative: {
      title: 'Chapter 7: The Decoupler',
      description: "Your app has a payment processing feature that takes 2-5 seconds per transaction. When traffic spikes, synchronous payment calls block your web servers and create massive latency for ALL users — even those just browsing.",
      objective: 'Handle 10,000 RPS while keeping latency below 150ms by offloading slow work to a queue.',
      hint: 'Add a Message Queue between servers and Worker nodes. Workers process payments asynchronously without blocking the web servers.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database', 'loadBalancer', 'cache', 'apiGateway', 'messageQueue', 'worker'],
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 50, y: 250 }, data: { label: 'Users', rps: 0, region: 'default' } },
      { id: 'lb-1', type: 'loadBalancer', position: { x: 250, y: 250 }, data: { label: 'Load Balancer', rps: 0, algorithm: 'round-robin', status: 'healthy' } },
      { id: 'server-1', type: 'server', position: { x: 480, y: 130 }, data: { label: 'Server 1', rps: 0, capacity: 3000, status: 'healthy' } },
      { id: 'server-2', type: 'server', position: { x: 480, y: 300 }, data: { label: 'Server 2', rps: 0, capacity: 3000, status: 'healthy' } },
      { id: 'server-3', type: 'server', position: { x: 480, y: 470 }, data: { label: 'Server 3', rps: 0, capacity: 3000, status: 'healthy' } },
      { id: 'db-1', type: 'database', position: { x: 900, y: 250 }, data: { label: 'SQL Database', rps: 0, capacity: 4000, status: 'healthy' } },
    ],
    initialEdges: [
      { id: 'e-traffic-lb', source: 'traffic-1', target: 'lb-1', animated: true },
      { id: 'e-lb-s1', source: 'lb-1', target: 'server-1', animated: true },
      { id: 'e-lb-s2', source: 'lb-1', target: 'server-2', animated: true },
      { id: 'e-lb-s3', source: 'lb-1', target: 'server-3', animated: true },
      { id: 'e-s1-db', source: 'server-1', target: 'db-1', animated: true },
      { id: 'e-s2-db', source: 'server-2', target: 'db-1', animated: true },
      { id: 'e-s3-db', source: 'server-3', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.rps >= 10000 && metrics.avgLatency < 150 && metrics.overloadedServers === 0;
    },
    failCondition: (metrics) => {
      return metrics.avgLatency >= 500;
    },
    failMessage: 'Latency explosion! Synchronous payment processing is blocking everything.',
    failExplanation: 'Without a message queue, slow operations (like payment processing) block web servers from handling new requests. A queue decouples fast web servers from slow background work.',
    winLesson: "Message queues decouple fast web servers from slow background jobs. This is how every e-commerce site handles payments, emails, and notifications — asynchronously, without blocking users.",
    nodeCosts: { server: 400, loadBalancer: 400, database: 500, cache: 500, messageQueue: 600, worker: 350 },
    activeSimulators: ['traffic', 'loadBalancer', 'queue'],
  },

  8: {
    name: 'The Split',
    subtitle: 'Microservices & Service Mesh',
    budget: 10000,
    initialTraffic: 0,
    targetTraffic: 15000,
    baseLatency: 25,
    congestionFactor: 0.03,
    sustainSeconds: 10,
    narrative: {
      title: 'Chapter 8: The Split',
      description: "Your monolithic app is getting harder to scale. The user profile service needs 10x more capacity than the product catalog, but they're stuck in the same server. Splitting into microservices lets you scale each part independently.",
      objective: 'Handle 15,000 RPS across independent services with latency under 100ms.',
      hint: 'Break the monolith into separate server clusters for each concern. A Service Mesh reduces inter-service latency.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database', 'loadBalancer', 'cache', 'messageQueue', 'worker'],
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 50, y: 300 }, data: { label: 'Users', rps: 0, region: 'default' } },
      { id: 'lb-1', type: 'loadBalancer', position: { x: 250, y: 300 }, data: { label: 'API Gateway', rps: 0, algorithm: 'round-robin', status: 'healthy' } },
      { id: 'server-1', type: 'server', position: { x: 500, y: 300 }, data: { label: 'Monolith', rps: 0, capacity: 5000, status: 'healthy' } },
      { id: 'db-1', type: 'database', position: { x: 750, y: 300 }, data: { label: 'SQL Database', rps: 0, capacity: 4000, status: 'healthy' } },
    ],
    initialEdges: [
      { id: 'e-traffic-lb', source: 'traffic-1', target: 'lb-1', animated: true },
      { id: 'e-lb-s1', source: 'lb-1', target: 'server-1', animated: true },
      { id: 'e-s1-db', source: 'server-1', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.rps >= 15000 && metrics.avgLatency < 100 && metrics.overloadedServers === 0;
    },
    failCondition: (metrics) => {
      return metrics.overloadedServers > 1;
    },
    failMessage: 'The monolith can\'t scale! One service is bottlenecking the entire system.',
    failExplanation: 'A monolithic architecture forces all services to scale together. When one component needs more resources, everything must scale up. Microservices let you scale each part independently.',
    winLesson: "Microservices let you scale and deploy each part of your system independently. This is how Netflix, Uber, and Amazon build at scale — hundreds of small services instead of one giant application.",
    nodeCosts: { server: 300, loadBalancer: 400, database: 500, cache: 500, messageQueue: 600, worker: 350 },
    activeSimulators: ['traffic', 'loadBalancer', 'cache'],
  },

  9: {
    name: 'The Elastic Cloud',
    subtitle: 'Auto-Scaling',
    budget: 8000,
    initialTraffic: 0,
    targetTraffic: 12000,
    baseLatency: 25,
    congestionFactor: 0.04,
    sustainSeconds: 10,
    narrative: {
      title: 'Chapter 9: The Elastic Cloud',
      description: "Your traffic follows a wild pattern — massive spikes during the day, quiet at night. Running peak-capacity servers 24/7 wastes money. You need your infrastructure to scale automatically with demand.",
      objective: 'Survive a traffic surge to 12,000 RPS using auto-scaling without any server overloading.',
      hint: 'Attach an Auto-Scaler to your server cluster. It will automatically add capacity when load increases and remove it when load drops.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database', 'loadBalancer', 'cache', 'autoScaler'],
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 50, y: 250 }, data: { label: 'Users', rps: 0, region: 'default' } },
      { id: 'lb-1', type: 'loadBalancer', position: { x: 280, y: 250 }, data: { label: 'Load Balancer', rps: 0, algorithm: 'round-robin', status: 'healthy' } },
      { id: 'server-1', type: 'server', position: { x: 530, y: 150 }, data: { label: 'Server 1', rps: 0, capacity: 2000, status: 'healthy' } },
      { id: 'server-2', type: 'server', position: { x: 530, y: 350 }, data: { label: 'Server 2', rps: 0, capacity: 2000, status: 'healthy' } },
      { id: 'cache-1', type: 'cache', position: { x: 780, y: 250 }, data: { label: 'Redis Cache', rps: 0, hitRate: 0, status: 'healthy' } },
      { id: 'db-1', type: 'database', position: { x: 1000, y: 250 }, data: { label: 'SQL Database', rps: 0, capacity: 8000, status: 'healthy' } },
    ],
    initialEdges: [
      { id: 'e-traffic-lb', source: 'traffic-1', target: 'lb-1', animated: true },
      { id: 'e-lb-s1', source: 'lb-1', target: 'server-1', animated: true },
      { id: 'e-lb-s2', source: 'lb-1', target: 'server-2', animated: true },
      { id: 'e-s1-cache', source: 'server-1', target: 'cache-1', animated: true },
      { id: 'e-s2-cache', source: 'server-2', target: 'cache-1', animated: true },
      { id: 'e-cache-db', source: 'cache-1', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.rps >= 12000 && metrics.overloadedServers === 0;
    },
    failCondition: (metrics) => {
      return metrics.overloadedServers > 0;
    },
    failMessage: 'Servers crushed under the traffic spike! No auto-scaling in place.',
    failExplanation: 'Fixed server capacity can\'t handle traffic surges. Auto-scaling monitors load and automatically adds or removes servers to match demand, keeping costs low during quiet periods and capacity high during spikes.',
    winLesson: "Auto-scaling is how cloud providers like AWS EC2, Google Cloud Run, and Azure handle variable load — you only pay for what you use, and capacity matches demand automatically.",
    nodeCosts: { server: 300, loadBalancer: 400, database: 500, cache: 500, autoScaler: 1000 },
    activeSimulators: ['traffic', 'loadBalancer', 'cache', 'autoScaler'],
  },

  10: {
    name: 'Chaos Engineering',
    subtitle: 'Fault Injection & Circuit Breakers',
    budget: 12000,
    initialTraffic: 0,
    targetTraffic: 10000,
    baseLatency: 25,
    congestionFactor: 0.03,
    sustainSeconds: 10,
    narrative: {
      title: 'Chapter 10: Chaos Engineering',
      description: "Welcome to the big leagues. You're running a globally distributed system and things WILL break — randomly, unexpectedly. Servers crash. Latency spikes. Traffic surges. Can your architecture survive chaos?",
      objective: 'Survive 5 random chaos events while keeping RPS above 5,000.',
      hint: 'Add Circuit Breakers to prevent cascading failures. Add Replicas and Health Checks for redundancy. Build for failure, not just for success.',
    },
    unlockedComponents: ['trafficSource', 'server', 'database', 'loadBalancer', 'cache', 'cdn', 'replica', 'healthCheck', 'circuitBreaker'],
    initialNodes: [
      { id: 'traffic-1', type: 'trafficSource', position: { x: 50, y: 300 }, data: { label: 'Users', rps: 0, region: 'default' } },
      { id: 'cdn-1', type: 'cdn', position: { x: 220, y: 300 }, data: { label: 'CDN', rps: 0, cacheRate: 0.3, status: 'healthy' } },
      { id: 'lb-1', type: 'loadBalancer', position: { x: 420, y: 300 }, data: { label: 'Load Balancer', rps: 0, algorithm: 'round-robin', status: 'healthy' } },
      { id: 'server-1', type: 'server', position: { x: 650, y: 150 }, data: { label: 'Server 1', rps: 0, capacity: 3000, status: 'healthy' } },
      { id: 'server-2', type: 'server', position: { x: 650, y: 300 }, data: { label: 'Server 2', rps: 0, capacity: 3000, status: 'healthy' } },
      { id: 'server-3', type: 'server', position: { x: 650, y: 450 }, data: { label: 'Server 3', rps: 0, capacity: 3000, status: 'healthy' } },
      { id: 'cache-1', type: 'cache', position: { x: 880, y: 300 }, data: { label: 'Redis Cache', rps: 0, hitRate: 0, status: 'healthy' } },
      { id: 'db-1', type: 'database', position: { x: 1100, y: 300 }, data: { label: 'Primary DB', rps: 0, capacity: 5000, status: 'healthy', isPrimary: true } },
    ],
    initialEdges: [
      { id: 'e-traffic-cdn', source: 'traffic-1', target: 'cdn-1', animated: true },
      { id: 'e-cdn-lb', source: 'cdn-1', target: 'lb-1', animated: true },
      { id: 'e-lb-s1', source: 'lb-1', target: 'server-1', animated: true },
      { id: 'e-lb-s2', source: 'lb-1', target: 'server-2', animated: true },
      { id: 'e-lb-s3', source: 'lb-1', target: 'server-3', animated: true },
      { id: 'e-s1-cache', source: 'server-1', target: 'cache-1', animated: true },
      { id: 'e-s2-cache', source: 'server-2', target: 'cache-1', animated: true },
      { id: 'e-s3-cache', source: 'server-3', target: 'cache-1', animated: true },
      { id: 'e-cache-db', source: 'cache-1', target: 'db-1', animated: true },
    ],
    winCondition: (metrics) => {
      return metrics.rps >= 5000 && metrics.overloadedServers === 0;
    },
    failCondition: (metrics, tickCount) => {
      if (metrics.systemDown) return true;
      if (tickCount > 20 && metrics.rps < 2000) return true;
      return false;
    },
    failMessage: 'Cascading failure! One broken component took down your entire system.',
    failExplanation: 'Without circuit breakers and redundancy, a single failure cascades through your architecture. Circuit breakers isolate failures. Replicas and health checks provide automatic recovery.',
    winLesson: "Chaos engineering (pioneered by Netflix's Chaos Monkey) proves your system's resilience before failures happen in production. Circuit breakers prevent one slow service from taking down your entire app.",
    nodeCosts: { server: 400, loadBalancer: 400, database: 500, cache: 500, cdn: 600, replica: 700, healthCheck: 300, circuitBreaker: 800 },
    activeSimulators: ['traffic', 'loadBalancer', 'cache', 'chaos'],
  },
};

export const TOTAL_LEVELS = Object.keys(LEVEL_CONFIGS).length;
