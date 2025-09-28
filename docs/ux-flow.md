# StorageMap - UX Flow & User Journey

## Primary User Journey

### 1. Landing & First Impression

**Entry Point:** User visits StorageMap  
**Goal:** Understand value proposition and start onboarding

```
Landing Page → [Get started] → Device Connection
     ↓
User sees:
- Clear value prop: "See it all. Clean it all."
- 3-step expectation setting
- No confusing data or premature complexity
```

### 2. Progressive Connection & Data Reveal

**Phase A: First Device**
```
Device Connection Flow → Basic Map View → Limited Data
     ↓
- Map shows: Connected device + empty cloud slots
- No savings/score until cloud connections
- Prompts: "Link your accounts to see the full picture"
```

**Phase B: Cloud Connections**
```
Cloud Connection Flow → Full Map View → Complete Analysis
     ↓
- Map shows: All connections with relationships
- Savings/score/duplicates revealed
- Actions page unlocked with recommendations
```

### 3. Analysis & Optimization

**Discovery Phase:**
```
Map View (Visual) → Explore Relationships → Identify Issues
     ↓
- Heat-tinted nodes show problems
- Details mode reveals file breakdowns
- Interactive relationships show sync/duplicates
```

**Action Phase:**
```
Actions Page → Review Recommendations → Execute Cleanup
     ↓
- Each card shows: GB saved + $/mo impact + one-time costs
- Clear safety messaging: "You will still have 2 copies"
- Tappable actions with confirmation flows
```

## Gating Logic Flow

### Pre-Connection State
```
User State: No devices linked
UI Behavior:
- No simulated data visible
- No health score or savings displays
- Map shows empty icons only
- All "Link to begin" prompts are tappable → connection flows
```

### Partial Connection State
```
User State: Device linked, no clouds
UI Behavior:
- Basic storage info visible
- Map shows device node + empty cloud slots
- Prompts for cloud connections
- Limited recommendations available
```

### Full Connection State
```
User State: Device + clouds linked
UI Behavior:
- Complete analysis visible
- All features unlocked
- Full recommendation suite
- Interactive map with relationships
```

## Error States & Edge Cases

### Connection Failures
```
Failed Connection → Retry Flow → Alternative Options
     ↓
- Clear error messaging
- Retry mechanisms
- Skip options where appropriate
- No data loss on retry
```

### Zero Usage Providers
```
Provider Analysis → 0 GB Detected → Close Account Flow
     ↓
- Special "Close/pause account" recommendation
- Clear caveats and warnings
- Deep link to provider's cancellation
- Never auto-close without explicit user action
```

### High-Risk Operations
```
Dangerous Action → Safety Check → Confirmation → Execution
     ↓
- Multiple confirmation steps
- Clear redundancy messaging
- Backup verification
- Undo/rollback options
```

## Mobile-First Considerations

### Touch Interactions
```
Map Nodes: Tap = info drawer, Long-press = refresh
Relationships: Tap = highlight path, Show details
Cards: Swipe gestures for quick actions
Forms: Large touch targets, clear CTAs
```

### Progressive Disclosure
```
Collapsed States → Tap to Expand → Detailed Views
     ↓
- Checklist collapses to badge when complete
- Map details toggle shows/hides technical info
- Action cards expand to show full details
```

### Offline Considerations
```
Connection Loss → Cached Data → Sync on Reconnection
     ↓
- Graceful degradation
- Clear offline indicators
- Queue actions for later sync
- No data loss scenarios
```

## Success Metrics & Completion States

### Onboarding Success
- Device successfully linked
- At least one cloud provider connected
- User reaches Actions page with recommendations

### Optimization Success
- User completes at least one recommended action
- Measurable storage/cost reduction achieved
- Clear before/after metrics displayed

### Retention Indicators
- User returns to check updated analysis
- Multiple optimization cycles completed
- Sharing/referral behaviors triggered