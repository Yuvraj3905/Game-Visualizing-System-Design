# Interview Prep Mode — Design Spec

## Overview

A timed interview simulation mode with 5 dedicated scenarios matching real system design interview questions. 45-minute countdown, interview-style rubric grading, and "What a senior engineer would do" explanations.

---

## Entry Point

New "Interview Prep" section in LevelSelect modal. Appears as a separate tab/section below the existing levels, visually distinct (accent-colored header). Clicking a scenario enters interview mode.

---

## Timer

- 45-minute countdown displayed in HUD (replacing level subtitle when in interview mode)
- Countdown format: `MM:SS` remaining
- At 5 minutes remaining: timer turns warning color (yellow)
- At 1 minute remaining: timer turns critical color (red)
- Timer hits 0: auto-fail with "Time's Up" message and post-mortem
- "Submit Solution" button in HUD — player can finish early for grading
- Timer starts after dismissing the interview prompt (same as dismissIntro)

---

## 5 Interview Scenarios

Stored in `src/engine/InterviewConfigs.js`. Each scenario uses the same config structure as regular levels but with interview-specific fields.

### Scenario 1: Design a URL Shortener
- **What it tests:** Hashing, DB scaling, caching, read-heavy workload
- **Narrative:** "You're interviewing at a tech company. The interviewer asks: Design a URL shortening service like bit.ly that handles 100M URLs and 10,000 reads/sec."
- **Objective:** Handle 10,000 RPS with latency under 50ms
- **Budget:** $8,000
- **Available components:** trafficSource, server, database, loadBalancer, cache, cdn, replica
- **Initial nodes:** 1 traffic source, 1 server, 1 database
- **Ideal approach:** Load balancer -> 3+ servers -> cache (90% hit rate for reads) -> database with read replicas. CDN for redirect caching.

### Scenario 2: Design a Chat System
- **What it tests:** Real-time connections, message queues, presence, delivery guarantees
- **Narrative:** "Design a real-time chat application like Slack that supports 1M concurrent users and guarantees message delivery."
- **Objective:** Handle 15,000 RPS with latency under 100ms, no system down
- **Budget:** $12,000
- **Available components:** trafficSource, server, database, loadBalancer, cache, messageQueue, worker, replica, healthCheck
- **Initial nodes:** 2 traffic sources (Web Users, Mobile Users), 1 server, 1 database
- **Ideal approach:** Load balancer -> connection servers -> message queue for async delivery -> workers for push notifications -> cache for presence -> DB with replicas for persistence.

### Scenario 3: Design a Notification Service
- **What it tests:** Fan-out, priority queues, rate limiting, multi-channel delivery
- **Narrative:** "Design a notification service that sends push, email, and SMS notifications to 50M users with different priority levels."
- **Objective:** Handle 20,000 RPS with latency under 150ms
- **Budget:** $15,000
- **Available components:** trafficSource, server, database, loadBalancer, cache, messageQueue, worker, apiGateway, autoScaler
- **Initial nodes:** 1 traffic source (API Clients), 1 server, 1 database
- **Ideal approach:** API Gateway for rate limiting -> load balancer -> servers -> priority message queues -> worker pools (auto-scaled) -> per-channel delivery. Cache for user preferences.

### Scenario 4: Design a Rate Limiter Service
- **What it tests:** API gateway, token bucket, distributed counters, edge protection
- **Narrative:** "Design a distributed rate limiting service that protects your API from abuse. Handle 50,000 RPS across multiple regions."
- **Objective:** Handle 50,000 RPS with latency under 30ms
- **Budget:** $10,000
- **Available components:** trafficSource, server, database, loadBalancer, cache, cdn, apiGateway, circuitBreaker, replica
- **Initial nodes:** 3 traffic sources (US, EU, Asia), 1 API gateway, 1 server
- **Ideal approach:** CDN edges for initial filtering -> API gateways per region -> cache (Redis) for counter storage -> circuit breakers for downstream protection -> replicated cache for consistency.

### Scenario 5: Design a File Storage System
- **What it tests:** CDN, chunked uploads, replication, metadata management
- **Narrative:** "Design a cloud file storage system like Dropbox that handles 5M files uploaded daily and serves downloads globally with low latency."
- **Objective:** Handle 8,000 RPS with latency under 200ms, no system down
- **Budget:** $18,000
- **Available components:** trafficSource, server, database, loadBalancer, cache, cdn, messageQueue, worker, replica, healthCheck, autoScaler
- **Initial nodes:** 2 traffic sources (Uploaders, Downloaders), 1 server, 1 database
- **Ideal approach:** CDN for download caching -> load balancer -> upload servers + download servers -> message queue for async processing (thumbnails, virus scan) -> workers -> metadata DB with replicas -> health checks for failover.

---

## Interview Rubric

Replaces the normal ArchitectureGrader for interview mode. New file: `src/engine/InterviewGrader.js`

**5 dimensions, 0-20 each:**

### Scalability (0-20)
- Has load balancer: +4
- Has 3+ servers: +4
- Has auto-scaler: +4
- Has cache: +4
- Has CDN: +4

### Reliability (0-20)
- Has replica: +5
- Has health check: +5
- Has circuit breaker: +4
- Has 2+ servers (no single point): +3
- Has message queue (async resilience): +3

### Latency (0-20)
- Current latency <= target: +10
- Current latency <= target * 1.5: +5 (partial)
- Has cache (reduces DB latency): +5
- Has CDN (reduces edge latency): +5

### Cost Efficiency (0-20)
- Budget remaining >= 30%: +8
- Budget remaining >= 15%: +4
- No unused/disconnected nodes: +6
- Node count <= ideal count * 1.5: +6

### Simplicity (0-20)
- Fewer nodes than max budget allows: +8
- Fewer edges (clean topology): +6
- No redundant same-type nodes beyond need: +6

**Total: 0-100**

### Interview Outcome Mapping
- **Strong Hire** (80-100): Green badge, "Exceptional system design skills"
- **Hire** (60-79): Blue badge, "Solid understanding of distributed systems"
- **Lean Hire** (40-59): Yellow badge, "Shows potential but missed key considerations"
- **No Hire** (0-39): Red badge, "Needs more practice with system design fundamentals"

---

## Results Screen

`InterviewResultScreen.jsx` — shown instead of WinScreen when in interview mode.

- Interview outcome badge (Strong Hire / Hire / Lean Hire / No Hire) with color
- 5-dimension rubric breakdown (horizontal bars or radar chart)
- Total score /100
- Time taken (MM:SS out of 45:00)
- "What a Senior Engineer Would Do" section — text explanation from config describing the ideal approach
- Ideal architecture node list (same format as failure post-mortem idealSolution)
- Buttons: "Try Again" | "Back to Interview Prep"

---

## Store Changes

New state fields:
```js
interviewMode: false,
interviewTimer: null,        // seconds remaining (2700 = 45 min)
interviewTimerInterval: null, // setInterval ID
interviewScenario: null,     // scenario index (0-4)
interviewGrade: null,        // rubric result
```

New actions:
- `loadInterview(scenarioIndex)` — load scenario config, set interviewMode, reset timer
- `startInterviewTimer()` — called on dismissIntro, starts countdown
- `submitSolution()` — stop timer, grade with InterviewGrader, show results
- `exitInterview()` — clear interview state, return to level select

Timer ticks every 1 second (separate from the 500ms simulation tick). On reaching 0, calls `onFail()` with a "Time's Up" message.

---

## localStorage

Key: `sdsim-interview-{scenarioIndex}`
```json
{
  "bestScore": 85,
  "bestOutcome": "Strong Hire",
  "attempts": 3,
  "lastAttempt": 1712505600000
}
```

---

## Files Summary

**New files:**
- `src/engine/InterviewConfigs.js` — 5 scenario definitions
- `src/engine/InterviewGrader.js` — 5-dimension rubric scoring
- `src/components/InterviewResultScreen.jsx` — results with rubric + ideal approach
- `src/components/InterviewHUD.jsx` — timer display + submit button (renders inside HUD when interviewMode)

**Modified files:**
- `src/store/useGameStore.js` — interview state + actions
- `src/components/LevelSelect.jsx` — interview prep section
- `src/components/HUD.jsx` — show InterviewHUD when in interview mode
- `src/App.jsx` — add InterviewResultScreen
- `README.md` — update features

## Out of Scope
- No AI interviewer follow-up questions (Phase 5)
- No company-specific styles (Google/Amazon/Meta)
- No voice/chat interface
- No backend persistence
