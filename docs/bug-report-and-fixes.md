# Bug Report & Fix Plan — System Design Sim

Tested all 10 levels via automated Playwright browser testing on the live deployment.

---

## Critical Bugs (Game-Breaking)

### BUG-1: Level 10 still instant-fails
**Severity:** Critical  
**Steps:** Open Level 10 > Start Mission > fails within 3 seconds  
**Root cause:** The `failCondition` checks `metrics.rps < 2000` after tick 20, but also checks `metrics.systemDown`. The chaos simulator may be triggering `systemDown` immediately, or the grace period (tick 20) isn't long enough for traffic to ramp to 2000 RPS.  
**Fix:** Increase grace period to tick 30, and also ensure `systemDown` only triggers if no circuit breakers exist AND a critical node is actually dead. Debug the exact metrics at the point of failure.

### BUG-2: Level 1 does NOT fail when server is overloaded
**Severity:** Critical  
**Steps:** Start Level 1 > Spike traffic 10x > wait 5 seconds > game keeps playing  
**Root cause:** The failCondition checks `metrics.overloadedServers > 0`, but the MetricsCollector now counts `worker` nodes as servers. Since there are no workers in L1, that's not the issue. The real issue: the single server has capacity 500, but traffic doesn't ramp fast enough to trigger overload in 5 seconds. OR the spike button caps at `targetTraffic` (1000 RPS), and the server capacity is 500, so it should overload — needs debugging.  
**Fix:** Verify the traffic ramp rate reaches overload levels. Check that `nodeTraffic` actually flows to the server via topology walker.

### BUG-3: Sell-back X button not appearing on new nodes
**Severity:** High  
**Steps:** Level 1 > Start > Click "Server" in tray to add > no red X button visible  
**Root cause:** The `DeletableNodeWrapper` checks `node.data.isInitial` from the store. But when `addNode` creates a node, it doesn't set `isInitial: false` — the field is simply absent. The check `!node.data.isInitial` should work (undefined is falsy), but the HOC wraps the visual component — the X button may be rendered outside the ReactFlow viewport or obscured by the node itself.  
**Fix:** Debug the DeletableNodeWrapper rendering. Ensure the X button is positioned correctly and has high enough z-index. May need to explicitly set `isInitial: false` in `addNode`.

---

## Functional Defects (Wrong Behavior)

### BUG-4: Level 8 has a LoadBalancer node labeled "API Gateway"
**Severity:** Medium  
**Steps:** Start Level 8 > see node labeled "API Gateway" on canvas  
**Root cause:** In LevelConfigs L8, the initial LoadBalancer node has `label: 'API Gateway'`. This is confusing because there's an actual apiGateway node type. The label should be "Load Balancer" or "API Router".  
**Fix:** Change L8's LB node label from "API Gateway" to "Load Balancer".

### BUG-5: Level 8 "Monolith" node not visible
**Severity:** Medium  
**Steps:** Start Level 8 > only see "Users", "API Gateway", "Monolith" (but test couldn't find "Monolith" text)  
**Root cause:** The node's label is "Monolith" in config, but the ServerNode component shows it under a "Compute" header. The text "Monolith" should be visible as the node label — may be a canvas zoom/viewport issue where the node is off-screen.  
**Fix:** Ensure initial nodes are within the visible viewport. Add `fitView` prop trigger after level load.

### BUG-6: Level Select modal conflicts with intro modal z-index
**Severity:** Medium  
**Steps:** During intro screen > click "Levels" button > Level Select opens BEHIND intro  
**Root cause:** The LevelSelect and LevelIntro modals can both be visible at the same time. The Level Select subtitle text ("Microservices & Service Mesh") intercepts pointer events over the intro's "Start Mission" button.  
**Fix:** When `showLevelSelect` is true, hide the LevelIntro. Or: dismiss LevelSelect when a level is loaded (set `showLevelSelect: false` in `loadLevel`).

### BUG-7: Tour overlay blocks all interaction until dismissed
**Severity:** Medium  
**Steps:** Start Level 1 for first time > tour overlay appears > can't click Spike Traffic or any buttons  
**Root cause:** The tour overlay div covers the entire screen at z-index 55. Clicking outside the step tooltip calls `finish()` but the spotlight cutout doesn't pass through clicks to the element beneath it.  
**Fix:** Add `pointerEvents: 'none'` to the spotlight cutout overlay, and only block events on the dark backdrop. Or: make clicking the spotlighted element advance the tour.

---

## UI/UX Enhancements

### UI-1: Page title says "game-system-design" instead of "System Design Sim"
**Severity:** Low  
**Fix:** Update `<title>` in `index.html` from the default Vite template.

### UI-2: Component tray has 13 items — bottom ones may be cut off
**Severity:** Low  
**Current:** Tray is scrollable, but there's no scroll indicator. Users may not realize they can scroll to see API Gateway, Message Queue, Worker, Auto-Scaler, Circuit Breaker.  
**Fix:** Add a subtle gradient fade at the bottom of the tray when scrollable, or add a scroll indicator.

### UI-3: HUD stats overflow on smaller viewports (< 1024px)
**Severity:** Low  
**Current:** At 768px width, the HUD stats cards get squished or overflow.  
**Fix:** Make stat cards responsive — reduce padding/font-size, or collapse to a 2-row layout on narrow screens.

### UI-4: No visual feedback when budget is insufficient
**Severity:** Low  
**Current:** Clicking a component you can't afford does nothing — no shake, flash, or toast.  
**Fix:** Add a brief shake animation or a red flash on the budget stat when a purchase is attempted with insufficient funds.

### UI-5: New nodes appear at random positions, often overlapping
**Severity:** Low  
**Current:** `addNode` places nodes at `300 + random*200, 200 + random*200`, frequently overlapping existing nodes.  
**Fix:** Detect existing node positions and place new nodes in unoccupied space. Or place them to the right of the rightmost node.

### UI-6: No indication of which nodes are connected properly
**Severity:** Low  
**Current:** Adding a server doesn't auto-connect it. New users don't know they need to drag edges from handles.  
**Fix:** Add a pulse animation on unconnected handles, or show a hint "Connect this node to your infrastructure" when a new node has no edges.

### UI-7: Sustain bar doesn't show the required duration
**Severity:** Low  
**Current:** Shows "Sustaining... 45%" but doesn't say how many seconds are needed.  
**Fix:** Show "Sustaining... 45% (4.5s / 10s)" so players know the target.

### UI-8: No sound effects or haptic feedback
**Severity:** Very Low (enhancement)  
**Fix:** Add optional click sounds for adding nodes, a warning sound for overload, and a victory jingle.

---

## Fix Priority Order

| Priority | Issue | Effort |
|----------|-------|--------|
| 1 | BUG-1: L10 instant fail | Small |
| 2 | BUG-2: L1 fail not triggering | Small |
| 3 | BUG-3: Sell X button missing | Medium |
| 4 | BUG-6: Modal z-index conflict | Small |
| 5 | BUG-7: Tour blocks interaction | Small |
| 6 | BUG-4: L8 mislabeled node | Trivial |
| 7 | UI-1: Page title | Trivial |
| 8 | BUG-5: L8 node viewport | Small |
| 9 | UI-4: No insufficient funds feedback | Small |
| 10 | UI-5: Random node placement | Medium |
| 11 | UI-6: Unconnected node hints | Medium |
| 12 | UI-2: Tray scroll indicator | Small |
| 13 | UI-3: HUD responsive | Medium |
| 14 | UI-7: Sustain bar duration | Trivial |
| 15 | UI-8: Sound effects | Large |
