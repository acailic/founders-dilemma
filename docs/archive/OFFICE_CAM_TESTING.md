# Office Cam Widget - Testing Guide

## Overview

The Office Cam widget is a new visual feature that translates abstract metrics into concrete, memorable visualizations of your startup's office state.

## Running the Game

```bash
cd /Users/aleksandarilic/Documents/github/acailic/founders-dilemma
pnpm dev
```

## What to Test

### 1. Widget Visibility

- ✅ Office Cam appears on the Dashboard tab
- ✅ Located below Critical Status Banner
- ✅ Shows "📹 Office Cam" header with "Live" badge
- ✅ Widget is clickable with hover effect

### 2. Team Size Visualization

Test with different burn rates:

- **Low burn ($10k-20k/mo)**: Should show 1-2 people
- **Medium burn ($30k-50k/mo)**: Should show 3-5 people
- **High burn ($60k+/mo)**: Should show 6+ people

**How to test**: Take different actions (Hire increases burn, observe team size change). Team size is ultimately capped between 1 and 12 people by `estimateTeamSizeFromBurn` in `src/lib/office/stateMapper.ts`, so extremely high burn values should still produce a maximum of 12 avatars.

### 3. Morale Visualization

Test with different morale levels:

- **80-100**: Should show 😊 (thriving)
- **60-79**: Should show 🙂 (motivated)
- **40-59**: Should show 😐 (steady)
- **20-39**: Should show 😟 (struggling)
- **0-19**: Should show 😰 (burnt out)

**How to test**:

- Take Break → morale increases → people look happier
- Keep grinding without breaks → morale decreases → people look stressed

_Note_: Morale values are sanitized to the 0-100 range before determining emoji and descriptions, so out-of-range game data should still map to the correct visual thresholds above.

### 4. Clutter Level (Tech Debt)

Test with different tech debt levels:

- **0-20**: ✨ Pristine (green badge)
- **20-40**: 📋 Organized (teal badge)
- **40-60**: 📦 Busy (yellow badge)
- **60-80**: 📚 Cluttered (orange badge)
- **80-100**: 🗂️ Chaotic (red badge)

**How to test**:

- Ship Feature (Quick) → increases tech debt → office gets more cluttered
- Refactor Code (if implemented) → decreases tech debt → office gets cleaner

_Note_: Tech debt percentages are clamped between 0-100 inside the widget helpers to prevent invalid states from leaking into the visualization.

### 5. Office Vibe

Test momentum + morale combinations:

- **High momentum (>80) + High morale (>70)**: 🎉 "Buzzing with energy!"
- **Medium momentum (>60) + Medium morale (>60)**: 💪 "Productive momentum"
- **Medium momentum (>40)**: ⚙️ "Steady work"
- **Low morale (<30)**: 😴 "Low energy"
- **Default**: 🤔 "Thoughtful planning"

**How to test**: Play several weeks and observe how vibe changes with your actions

### 6. Expanded Modal

Click the widget to open detailed view:

- ✅ Modal opens with full office overview
- ✅ Shows all team members in grid layout
- ✅ Individual tooltips on hover
- ✅ Office Condition card with description
- ✅ Team Energy card with advice
- ✅ Current Activity section
- ✅ Office Insights summary
- ✅ Close button works
- ✅ Accessible trigger: Enter or Space opens the modal when the widget is focused; Escape closes it.

### 7. Visual Feedback

- ✅ Widget has hover effect (lifts up, shadow increases)
- ✅ Active state on click (slight depression)
- ✅ Mini office background gradient brightens on hover
- ✅ Smooth transitions on all interactions

## Test Scenarios

### Scenario 1: Early Startup (Week 1-10)

**Expected State**:

- Small team (1-3 people)
- Clean office (low tech debt)
- High morale (everyone excited)
- Vibe: 🤔 or 💪 (planning/momentum)

### Scenario 2: Growth Phase (Week 15-30)

**Expected State**:

- Medium team (4-7 people)
- Some clutter (medium tech debt from fast shipping)
- Variable morale (depending on balance)
- Vibe: 💪 or ⚙️ (productive work)

### Scenario 3: Crunch Mode (High burn, low runway)

**Expected State**:

- Large team (8+ people)
- Very cluttered (high tech debt)
- Low morale (stressed team)
- Vibe: 😴 (low energy)

### Scenario 4: Recovery After Break

**Expected State**:

- Team size unchanged
- Clutter unchanged (or improved if refactored)
- Improved morale (happier faces)
- Vibe: 🤔 or ⚙️ (recovered)

## Edge Cases to Test

1. **Zero burn edge case**: Should show at least 1 person (founder)
2. **Very high burn (>$100k)**: Should cap at 12 people because of helper clamp logic
3. **Extreme morale (0 or 100)**: Check emoji rendering (values are sanitized to the 0-100 range)
4. **Extreme tech debt (0 or 100)**: Check badge colors and descriptions (values clamped to 0-100)

## Visual Regression Testing

Compare these states:

1. Week 1 office (pristine)
2. Week 20 office (established)
3. Week 40 office (mature)

Take screenshots and verify:

- Team size matches burn rate trend
- Clutter matches tech debt trend
- Morale matches emoji expressions
- Overall vibe feels appropriate

## Performance Testing

- ✅ Widget renders quickly (<100ms)
- ✅ Modal opens smoothly
- ✅ No lag when hovering
- ✅ No memory leaks after 50+ weeks

## Accessibility Testing

- ✅ Widget is keyboard accessible (tab navigation)
- ✅ Tooltips appear on focus
- ✅ Modal can be closed with Escape
- ✅ Color contrast meets WCAG AA standards

## Success Criteria

The Office Cam is successful if:

1. Players immediately understand what it shows
2. Visual state matches game metrics accurately
3. Provides emotional connection to the team
4. Creates memorable moments (seeing team grow/shrink)
5. Educational: Players learn to associate actions with visual outcomes

## Known Limitations

- Team size is estimated from burn rate (rough proxy)
- No individual character animations (future enhancement)
- Activity indicator cycles through preset emojis (not action-specific yet)
- No historical "office photos" feature (future enhancement)

## Future Enhancements (Not in MVP)

- [ ] Individual character sprites with roles (engineer, sales, etc.)
- [ ] Action-specific animations (people coding, calling, meeting)
- [ ] Office photos timeline (snapshots from past weeks)
- [ ] Clickable elements for mini-interactions (water plant, etc.)
- [ ] Sound effects (typing, phone ringing)
- [ ] Dynamic office layout based on team size
- [ ] Equipment quality visual (based on burn/budget)

## Reporting Issues

If you find bugs or unexpected behavior:

1. Note the week number
2. Note the game state (metrics)
3. Describe what you see vs what you expect
4. Take a screenshot if possible
5. Document in PROGRESS.md or create GitHub issue

---

**Status**: Ready for testing! 🎉
**Implementation Time**: ~2 hours
**Lines of Code**: ~350 lines (component + styles)
