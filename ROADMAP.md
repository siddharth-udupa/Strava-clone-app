# Strava Clone — Build Roadmap

> **Purpose:** A single implementation roadmap so I don't have to decide what to build after every feature.
>
> **Rule:** Follow the order below. When a feature is finished, move to the next unchecked item. Do not redesign the roadmap every time something is completed. Only change the roadmap if I discover a genuine technical blocker or a major product requirement.

---

## 0. Current State

The project currently has both **Web** and **Expo React Native App** implementations with broadly matching core functionality.

### Already built

- [x] Authentication page
  - [x] Better Auth
  - [x] OAuth on Web
  - [ ] OAuth on App — needs mobile-specific implementation
- [x] Basic onboarding
  - [x] Web
  - [x] App
- [x] Dashboard
  - [x] Activity feed
  - [x] User's activities
- [x] Activity details page
  - [x] Pace graph
  - [x] Distance graph
  - [x] Elevation graph
  - [x] Grade graph
- [x] Full-screen maps page
- [x] Maps integrated where required
- [x] Activity upload
  - [x] GPX/file upload on Web
  - [x] Manual activity support on Web
- [x] Activity recorder on App
  - [x] Records activity
  - [x] Stores recorded activity in DB
- [x] Core database/backend foundation
- [x] Basic cross-platform feature parity

### Important technical context

- Web and App live in the same project/monorepo.
- Web uses React.
- App uses Expo / React Native.
- Maps are used on both platforms.
- The project is currently an MVP, so avoid premature production-scale optimization.
- The goal is to finish a coherent, usable Strava-like product rather than endlessly polishing individual screens.

---

# 1. Stabilize What Already Exists

**Goal:** Stop adding complexity to a shaky foundation.

Do these before adding several large features.

- [ ] Test authentication end-to-end
  - [ ] Sign up
  - [ ] Sign in
  - [ ] Sign out
  - [ ] Session persistence
  - [ ] OAuth Web
- [ ] Test onboarding
  - [ ] New user flow
  - [ ] Existing user flow
  - [ ] Skip/complete behavior
- [ ] Test activity creation
  - [ ] GPX upload
  - [ ] Manual activity
  - [ ] Mobile recording
- [ ] Test activity persistence
  - [ ] Reload app/web
  - [ ] Activity still exists
  - [ ] Activity details still render
- [ ] Test activity deletion/editing behavior where currently supported
- [ ] Test maps with multiple activity types
- [ ] Test graphs with short and long activities
- [ ] Test empty states
  - [ ] No activities
  - [ ] No friends/following
  - [ ] No data
- [ ] Fix obvious bugs and broken flows
- [ ] Remove obvious temporary/debug code

**Do NOT:** start rewriting architecture just because the project isn't production-scale yet.

---

# 2. Finish Mobile Parity

**Goal:** Anything fundamental that exists on Web should work on App.

- [x] Mobile onboarding
- [x] Mobile authentication flow
- [ ] Mobile OAuth/auth integration
- [x] Mobile activity feed
- [x] Mobile activity details
- [x] Mobile upload/import flow if appropriate for the platform
- [x] Verify recorder → saved activity → activity details flow
- [ ] Verify map interactions
- [ ] Verify graphs on real devices

### Definition of done

A user should be able to:

> Create account → onboard → record/upload activity → save it → see it in feed → open it → inspect map + graphs.

When this works reliably on both platforms, move on.

---

# 3. Activity System — Make Activities Feel Complete

**Goal:** Turn the current activity implementation into a proper activity product.

## Activity creation

- [ ] Activity title/name
- [ ] Activity type
  - [ ] Run
  - [ ] Ride
  - [ ] Walk
  - [ ] Hike
  - [ ] Other basic types
- [ ] Activity date/time
- [ ] Description/notes
- [ ] Visibility/privacy setting

## Activity details

- [ ] Better activity header
- [ ] Stats summary
  - [ ] Distance
  - [ ] Moving time
  - [ ] Elapsed time
  - [ ] Pace/speed
  - [ ] Elevation
- [ ] Map
- [ ] Graphs
- [ ] Activity metadata
- [ ] Edit activity
- [ ] Delete activity
- [ ] Confirmation dialogs
- [ ] Proper loading/error/empty states

## Graph interaction

- [ ] Touch/hover interaction
- [ ] Cursor position on graph
- [ ] Show corresponding location on map
- [ ] Show value at selected point
- [ ] Sync graph ↔ map if practical

**Do not:** spend days making graphs visually perfect before interaction/data behavior works.

---

# 4. Social Foundation

**Goal:** Introduce the social part of the Strava-like product.

Build the underlying data model first.

- [ ] User profile
- [ ] Profile page
- [ ] Avatar/profile image
- [ ] Bio/basic profile information
- [ ] Follow user
- [ ] Unfollow user
- [ ] Followers list
- [ ] Following list
- [ ] User search
- [ ] Activity visibility rules

### Feed

- [ ] Following feed
- [ ] Activity cards
- [ ] Activity preview
- [ ] Athlete information
- [ ] Timestamp
- [ ] Activity stats
- [ ] Map thumbnail
- [ ] Pagination/infinite scrolling

### Engagement

- [ ] Kudos/like
- [ ] Comment
- [ ] Delete own comment
- [ ] Basic comment list
- [ ] Activity engagement counts

---

# 5. Profile Experience

**Goal:** Give users a place that represents their activity history.

- [ ] Profile header
- [ ] Profile statistics
- [ ] Activity history
- [ ] Recent activities
- [ ] Activity totals
- [ ] Basic charts/stat summaries
- [ ] Follow/follower counts
- [ ] Edit profile
- [ ] Privacy controls

Optional later:

- [ ] Personal records
- [ ] Yearly statistics
- [ ] Monthly statistics
- [ ] Training volume

---

# 6. Notifications

**Goal:** Make social actions visible.

Start simple.

- [ ] Notification database model
- [ ] Notification list
- [ ] Follow notification
- [ ] Kudos notification
- [ ] Comment notification
- [ ] Mark as read
- [ ] Unread count
- [ ] Notification navigation

Later:

- [ ] Push notifications
- [ ] Notification preferences

---

# 7. Search & Discovery

**Goal:** Make the application usable once there are more users.

- [ ] Search users
- [ ] Search activities if applicable
- [ ] User discovery
- [ ] Basic filtering
- [ ] Activity type filters
- [ ] Date filters
- [ ] Profile navigation from search

Do not build an elaborate recommendation engine yet.

---

# 8. Routes / Segments / Geographic Features

**Goal:** Add the more interesting activity-analysis features.

Choose a manageable subset first.

- [ ] Activity route rendering improvements
- [ ] Route statistics
- [ ] Basic segments
- [ ] Segment matching
- [ ] Segment leaderboard
- [ ] Personal segment record
- [ ] Route/segment exploration

Optional:

- [ ] Popular routes
- [ ] Route discovery
- [ ] Route creation/planning

---

# 9. Training & Statistics

**Goal:** Turn raw activities into useful long-term information.

Start with simple aggregation.

- [ ] Weekly distance
- [ ] Weekly activity count
- [ ] Monthly distance
- [ ] Monthly activity count
- [ ] Elevation totals
- [ ] Time spent training
- [ ] Activity-type breakdown
- [ ] Historical graphs

Then:

- [ ] Personal records
- [ ] Best pace
- [ ] Longest activity
- [ ] Highest elevation
- [ ] Training streaks
- [ ] Yearly summary

### Important

Do not build complex training algorithms yet.

First make sure the raw activity data and aggregation pipeline are correct.

---

# 10. Challenges / Goals

**Goal:** Add a basic motivation/game layer.

- [ ] Create goal
- [ ] Distance goal
- [ ] Time goal
- [ ] Activity-count goal
- [ ] Progress tracking
- [ ] Goal completion
- [ ] Basic challenge model
- [ ] Challenge progress

Later:

- [ ] Group challenges
- [ ] Leaderboards
- [ ] Badges

---

# 11. Better Recording

**Goal:** Make the mobile recorder genuinely usable.

Only after the basic recorder is reliable.

- [ ] Start/pause/resume
- [ ] Stop confirmation
- [ ] Live distance
- [ ] Live duration
- [ ] Live pace/speed
- [ ] Live elevation
- [ ] GPS accuracy handling
- [ ] GPS signal state
- [ ] Background recording
- [ ] Screen-lock behavior
- [ ] App interruption handling
- [ ] Battery considerations
- [ ] Recovery from crashes/interruption
- [ ] Save/discard flow
- [ ] Recording summary

Later:

- [ ] Audio cues
- [ ] Auto-pause
- [ ] Splits/laps

---

# 12. Data Processing & Storage Improvements

**Goal:** Handle realistic activity data without prematurely building infrastructure.

Current GPX activities can contain tens of thousands of points, so this is where optimization becomes worth doing.

- [ ] Measure actual DB size with realistic activities
- [ ] Measure API response size
- [ ] Measure graph rendering performance
- [ ] Measure map rendering performance
- [ ] Profile large activities
- [ ] Identify actual bottlenecks

Then optimize only what measurements justify.

Potential improvements:

- [ ] Compress activity streams
- [ ] Delta encoding
- [ ] Reduce graph sampling density
- [ ] Store raw vs derived data intentionally
- [ ] Generate simplified graph data
- [ ] Cache expensive derived values
- [ ] Lazy-load large activity data

**Rule:**

> Measure → identify bottleneck → optimize.

Not:

> Guess → optimize everything → create unnecessary complexity.

---

# 13. Maps & Tile Infrastructure

**Goal:** Make maps reliable enough for a public release.

- [ ] Decide final tile/data provider
- [ ] Confirm licensing/attribution requirements
- [ ] Confirm usage limits
- [ ] Confirm production deployment requirements
- [ ] Standardize map configuration across Web/App
- [ ] Standardize styles
- [ ] Handle missing tiles
- [ ] Handle network failure
- [ ] Add attribution where required
- [ ] Measure map performance

If self-hosting:

- [ ] Tile server
- [ ] Tile storage
- [ ] Update strategy
- [ ] Monitoring
- [ ] Backup/recovery
- [ ] Cost estimation

Do not build a huge map infrastructure before the application itself needs it.

---

# 14. Design System & UI Cleanup

**Goal:** Improve consistency after the product functionality is established.

This should be an ongoing pass, not a giant "12-hour design course."

- [ ] Define typography
- [ ] Define spacing scale
- [ ] Define border radius
- [ ] Define shadows
- [ ] Define common components
- [ ] Define buttons
- [ ] Define inputs
- [ ] Define cards
- [ ] Define tabs
- [ ] Define modals
- [ ] Define activity cards
- [ ] Define stat components
- [ ] Define map controls
- [ ] Define graph styling
- [ ] Define loading states
- [ ] Define error states
- [ ] Define empty states

### Design learning rule

Do not stop development to "learn design."

Instead:

1. Build the feature.
2. Look at 2–3 strong examples.
3. Identify how they present the same information.
4. Recreate the underlying information hierarchy.
5. Apply your own visual system.
6. Move on.

The goal is to learn **information hierarchy and UX decisions**, not memorize CSS tricks.

---

# 15. Accessibility & UX

- [ ] Keyboard navigation on Web
- [ ] Focus states
- [ ] Accessible labels
- [ ] Contrast checks
- [ ] Touch target sizes
- [ ] Screen-reader basics
- [ ] Error messages
- [ ] Loading feedback
- [ ] Empty states
- [ ] Confirmation for destructive actions

---

# 16. Security & Backend Hardening

Before public release:

- [ ] Validate uploaded files
- [ ] Validate activity data server-side
- [ ] Enforce authorization on every protected resource
- [ ] Verify users can only modify their own activities
- [ ] Verify privacy rules server-side
- [ ] Rate-limit sensitive endpoints
- [ ] Protect authentication flows
- [ ] Validate API inputs
- [ ] Handle oversized uploads
- [ ] Handle malformed GPX files
- [ ] Avoid leaking private activity data
- [ ] Review database permissions
- [ ] Review secrets/environment variables

---

# 17. Performance Pass

Only after the feature set is substantial.

## Web

- [ ] Measure initial load
- [ ] Measure dashboard performance
- [ ] Measure activity page performance
- [ ] Optimize large graphs
- [ ] Optimize large activity payloads
- [ ] Optimize images
- [ ] Reduce unnecessary requests

## App

- [ ] Test on a weaker Android device
- [ ] Test long activity rendering
- [ ] Test map performance
- [ ] Test graph performance
- [ ] Test recorder battery usage
- [ ] Test background behavior
- [ ] Test memory usage

---

# 18. Testing

Start small and expand.

- [ ] Auth tests
- [ ] Activity creation tests
- [ ] Activity parsing tests
- [ ] Activity statistics tests
- [ ] Permission/authorization tests
- [ ] Follow tests
- [ ] Kudos/comment tests
- [ ] Recorder tests
- [ ] Critical API tests
- [ ] End-to-end happy-path test

### Critical end-to-end flow

Test this repeatedly:

> Sign up → onboarding → create activity → save → feed → activity details → interact → profile.

---

# 19. Deployment

## Web

- [ ] Production environment
- [ ] Database production setup
- [ ] Environment variables
- [ ] Domain
- [ ] HTTPS
- [ ] Error logging
- [ ] Analytics if needed
- [ ] Backups
- [ ] Monitoring

## App

- [ ] Android production build
- [ ] App icon
- [ ] Splash screen
- [ ] Permissions
- [ ] Location permission explanations
- [ ] Privacy policy
- [ ] App metadata
- [ ] Release build testing
- [ ] Play Store preparation

---

# 20. Final MVP Release Checklist

The first public version does **not** need every feature above.

The MVP should be able to reliably do this:

### Account

- [ ] Sign up
- [ ] Sign in
- [ ] Sign out
- [ ] Onboarding

### Activities

- [ ] Upload/import activity
- [ ] Record activity on mobile
- [ ] Save activity
- [ ] View activity
- [ ] View route
- [ ] View statistics
- [ ] View graphs
- [ ] Edit/delete activity

### Social

- [ ] Profile
- [ ] Follow
- [ ] Activity feed
- [ ] Kudos
- [ ] Comments

### Reliability

- [ ] Auth works
- [ ] Permissions are correct
- [ ] Private activities stay private
- [ ] Large activities don't break the app
- [ ] Errors are handled
- [ ] Production database is backed up

---

# 21. Post-MVP — Only After Real Users Exist

Do not build these just because Strava has them.

Prioritize based on actual user behavior.

Possible later features:

- [ ] Clubs
- [ ] Routes
- [ ] Segment exploration
- [ ] Advanced leaderboards
- [ ] Training plans
- [ ] Gear tracking
- [ ] Personal records
- [ ] Advanced statistics
- [ ] Challenges
- [ ] Badges
- [ ] Push notifications
- [ ] Advanced privacy controls
- [ ] GPX export
- [ ] Activity sharing
- [ ] Third-party integrations
- [ ] Wearable/device integrations
- [ ] Recommendation systems

---

# Development Rules

These are more important than the checklist.

## Rule 1 — Stop planning after every feature

This file **is the plan**.

When a feature is completed:

1. Check it off.
2. Fix obvious bugs.
3. Commit.
4. Start the next unchecked item.

Do not spend an hour deciding what the next feature should be.

---

## Rule 2 — Don't polish the same screen forever

Use this order:

> Functionality → correctness → usability → visual polish.

If the page works and is understandable, move on.

Return for polish during the dedicated design/UI pass.

---

## Rule 3 — Don't copy Strava feature-for-feature

This project is inspired by Strava, not a requirement to recreate every Strava feature.

If a feature doesn't improve the core experience, defer it.

---

## Rule 4 — Don't optimize imaginary problems

Especially for:

- database size
- API response size
- graph rendering
- map performance
- server load

Measure first.

---

## Rule 5 — Don't redesign architecture without a reason

A working structure that is understandable and easy to debug is more valuable right now than a theoretically perfect production architecture.

Refactor when:

- a real pain point appears,
- duplication becomes significant,
- performance requires it,
- security requires it,
- or a feature genuinely cannot fit cleanly.

---

## Rule 6 — One major feature at a time

For each feature:

### Step A — Define

What exactly should the user be able to do?

### Step B — Backend

Database → API → validation → authorization.

### Step C — Web

Build the Web implementation.

### Step D — App

Build the App implementation if applicable.

### Step E — Test

Happy path → edge cases → error states.

### Step F — Polish

Only enough UI work to make it usable.

### Step G — Commit

Then move to the next feature.

---

# Current Next Steps

Based on the current state of the project, **start here**:

1. [ ] Finish mobile onboarding.
2. [ ] Finish mobile authentication/OAuth approach.
3. [ ] Run an end-to-end test of:
   `auth → onboarding → record/upload → save → feed → activity details`.
4. [ ] Fix the bugs discovered by that test.
5. [ ] Finish the activity system:
   `title/type/privacy → edit/delete → complete stats → loading/error/empty states`.
6. [ ] Add graph ↔ map interaction.
7. [ ] Build user profiles.
8. [ ] Build follow/unfollow.
9. [ ] Build the following activity feed.
10. [ ] Add kudos and comments.
11. [ ] Add notifications.
12. [ ] Add search/discovery.
13. [ ] Add statistics/history.
14. [ ] Improve recorder.
15. [ ] Profile and optimize real large activities.
16. [ ] Do the design-system/UI cleanup.
17. [ ] Security hardening.
18. [ ] Testing.
19. [ ] Production deployment.
20. [ ] Release MVP.

---

# How To Use This File

At the start of a coding session:

**1. Open this file.**

**2. Find the first unchecked major item.**

**3. Work on it.**

**4. Do not create a new roadmap.**

**5. When finished, check it off and commit the change.**

If you discover something that isn't on this roadmap, put it in a temporary section at the bottom:

## Parking Lot

- 

Do **not** immediately switch tasks.

Review the Parking Lot only when the current major milestone is complete.

---

# Definition of "Done"

A feature is done when:

- It works on the intended platform.
- Data is persisted correctly.
- Basic error cases are handled.
- The user can understand what happened.
- It doesn't obviously break existing features.
- The code is understandable enough to maintain.
- It has been committed.

It does **not** need to be perfect.

---

## Final Principle

> **Build the product, don't build an endless project.**

The objective is not to recreate every part of Strava.

The objective is to take this project from:

**"I have implemented a bunch of cool features"**

to:

**"A person can actually use this application from signup to activity tracking to social interaction without me manually fixing things."**

That is the milestone that matters.
