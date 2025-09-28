# StorageMap - Copy & Messaging

## App Identity

**App Name:** StorageMap  
**Tagline:** See it all. Clean it all.

## Landing Page (Non-Logged Users)

### Hero Section
**Headline:** Take control of your storage  
**Subcopy:** Link your devices and cloud accounts to see all your files in one place. Then, with one tap, let us clean it all up and cut your storage costs — automatically.

### Expectation Setting (3 Bullets)
1. Link this device
2. Link your accounts  
3. Optimize your storage

### Call-to-Action Buttons
- **Primary CTA:** Get started → Link this device
- **Secondary CTA:** Log in → (for existing users)

## Gating & Data Visibility Rules

### Pre-Connection State
- **No simulated data, score, or savings shown until at least one device is linked**
- All suggestive steps ("Link this device to begin") are tappable and route into the linking flow
- Visual Map shows empty icons only; tapping them routes to connection flow

### Post-Connection State
- Once linked → icons become interactive (tap = info drawer, long-press = refresh)
- Progressive disclosure of features based on connection status

## Savings Model Messaging

### Realistic Expectations
- Monthly savings capped at ≤ 40% of current spend unless provable cheaper plan exists post-cleanup
- Migration/egress overhead subtracted for archive moves (month 1)
- Optimal plan calculated as smallest tier that fits post-cleanup usage with 15% headroom

### Provider Management
- If provider = 0 GB, surface "Close or pause account" as optional recommendation with deep link
- **Never auto-close accounts**

## Actions Page Recommendations

### Card Format
Each recommendation card shows:
- **GB saved**
- **$/mo impact** (after plan change)
- **One-time costs** (migration/egress, if any)

### Recommendation Types
1. **Remove exact duplicates** (count + GB)
2. **Move large, rarely opened videos to archive**
3. **Keep project files in one place** (consolidation)
4. **Downgrade plan where eligible** (show new tier + $/mo delta)
5. **Close/disable unused provider** (only if 0 GB remains; caveats shown)

## Redundancy & Safety Messaging

### Copy Requirements
- **Never drop below chosen copies**
- Convert extras into cold backups instead of deleting
- Explicit copy: "You will still have {{n}} copies after this."

### Safety Guardrails
- Clear warnings for any destructive actions
- Backup verification before cleanup
- Undo/rollback options where possible