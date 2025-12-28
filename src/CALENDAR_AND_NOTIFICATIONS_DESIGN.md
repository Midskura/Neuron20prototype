# Personal Calendar & Notification System - Design Document

**Project:** Neuron OS - Asset-Light Freight Forwarding Platform  
**Module:** Personal Calendar with Notification System  
**Status:** Design Phase - Not Yet Implemented  
**Last Updated:** December 19, 2024

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Concept](#core-concept)
3. [Data Model](#data-model)
4. [UI Design (Neuron OS Style)](#ui-design-neuron-os-style)
5. [Integration Strategy](#integration-strategy)
6. [Backend Implementation](#backend-implementation)
7. [Notification System Architecture](#notification-system-architecture)
8. [Multi-User Calendar Features](#multi-user-calendar-features)
9. [Implementation Plan (Phased Approach)](#implementation-plan-phased-approach)
10. [User Requirements](#user-requirements)
11. [Future Considerations](#future-considerations)

---

## Overview

### Purpose
A unified personal calendar that serves as a **time-based command center** where users can:
- See all their time-sensitive work items in one place
- Create personal tasks/reminders with hourly scheduling
- View linked system entities (tickets, bookings, quotations) on a timeline
- Receive assigned events from managers/executives
- View department-wide and company-wide events

### Priority Level
**Tier 4: Personal Productivity** (Nice-to-have)
- Should be built after core business modules (Reports, Analytics, Financial Management, etc.)
- Provides value but doesn't directly impact revenue generation
- Users can use external tools (Google Calendar, Outlook) as temporary workaround

---

## Core Concept

### Event Sources

The calendar aggregates events from multiple sources:

1. **Personal Events** - User-created tasks, reminders, meetings
2. **Linked Tickets** - Auto-populated from ticketing system (based on due_date)
3. **Linked Bookings** - Auto-populated from Operations (ETD, ETA, milestones)
4. **Linked Quotations** - Auto-populated from BD/Pricing (validity dates, follow-up dates)
5. **Assigned Events** - Created by managers/executives for specific users
6. **Department Events** - Created by managers for entire department
7. **Company-Wide Events** - Created by executives/HR for entire company

### Key Principles

- **Time-based visibility** - Everything appears on the day/time it's relevant
- **Auto-linking** - System entities automatically appear (no manual linking needed)
- **Color-coded** - Instant visual distinction between event types
- **Click-through navigation** - Click any event to open its detail view/modal
- **Role-based creation** - Different users can create different types of events

---

## Data Model

### Calendar Event Schema

```typescript
interface CalendarEvent {
  // Core Identity
  id: string;
  created_by: string;              // User ID who created this event
  owner_id: string;                // User ID whose calendar this appears on
  
  // Event Type & Source
  type: "personal" | "ticket" | "booking" | "quotation" | "assigned";
  entity_id?: string;              // ID of linked ticket/booking/quotation (if applicable)
  
  // Visibility & Access
  visibility: "personal" | "department" | "company_wide" | "assigned";
  department?: string;             // For department events
  assigned_to?: string[];          // For multi-user assigned events
  can_edit_owner: boolean;         // Can the assigned user edit this? (Default: false)
  
  // Event Details
  title: string;
  description?: string;
  
  // Timing
  date: string;                    // ISO date: "2024-12-19"
  start_time?: string;             // "14:00" for hourly scheduling
  end_time?: string;               // "15:30"
  all_day: boolean;
  
  // Reminders (for notification system)
  reminder_times?: number[];       // Minutes before event [15, 60, 1440]
  last_reminder_sent?: number;     // Timestamp of last reminder sent
  
  // Visual
  color: string;                   // Hex color code
  
  // Status
  completed: boolean;
  
  // Audit
  created_at: number;              // Unix timestamp
  updated_at: number;
}
```

### KV Store Keys

```
Personal Events:
  calendar_event:${user_id}:${event_id}

Index for Date Range Queries:
  calendar_events_by_user:${user_id}:${year}-${month}
  → [event_id, event_id, ...]

Department Events:
  calendar_department_event:${department}:${event_id}

Company-Wide Events:
  calendar_company_event:${event_id}
```

### Linked Entity Sources

**Don't store these in calendar tables - fetch dynamically:**

```typescript
// Tickets with due dates
ticket:${ticket_id} → { due_date: "2024-12-25" }

// Bookings with shipping dates
booking:${booking_id} → { 
  departure_date: "2024-12-20",
  arrival_date: "2024-12-30",
  status: "in_transit"
}

// Quotations with validity/follow-up dates
quotation:${quotation_id} → { 
  validity_date: "2024-12-31",
  follow_up_date: "2024-12-22"
}
```

---

## UI Design (Neuron OS Style)

### Calendar Views

**Default View:** Month View

**Available Views:**
- **Month View** - Full month grid with colored dots/badges for events
- **Week View** - 7-day detailed timeline with hourly slots
- **Day View** - Hourly breakdown (8am-8pm) for detailed planning
- **Agenda View** - Simple chronological list of upcoming items

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                         │
│  December 2024          [Month|Week|Day|Agenda]  [Today] [+New] │
├─────────────────────────────────────────────────────────────────┤
│ SIDEBAR    │  MAIN CALENDAR GRID                               │
│            │                                                    │
│ Mini Cal   │   Sun   Mon   Tue   Wed   Thu   Fri   Sat       │
│            │    1     2     3     4     5     6     7         │
│ Filters:   │    •     ••    •                  •             │
│ ☑ Personal │                                                  │
│ ☑ Tickets  │    8     9    10    11    12    13    14        │
│ ☑ Bookings │    •     •••   ••    •     •           •        │
│ ☑ Quotes   │                                                  │
│            │   15    16    17    18    19    20    21        │
│            │    ••    •     •••   •     ••    •     •        │
│            │                                                  │
└────────────┴────────────────────────────────────────────────────┘
```

### Visual Design System

**Colors:**
- 🟢 **Personal Tasks**: Teal Green (#0F766E)
- 🔴 **Urgent Tickets**: Red (#DC2626)
- 🟠 **High Priority Tickets**: Orange (#D97706)
- 🟡 **Normal Tickets**: Yellow/Amber (#F59E0B)
- 🔵 **Bookings**: Blue (#0369A1)
- 🟣 **Quotations**: Purple (#7C3AED)
- ⚫ **Assigned Events**: Deep Green (#12332B) with "📌 Assigned" badge
- 🔵 **Department Events**: Teal with subtle pattern/stripe
- 🔵 **Company Events**: Deep green with subtle pattern/stripe

**Design Tokens:**
- Background: Pure white (#FFFFFF)
- Borders: Stroke borders (1px solid), no shadows
- Padding: 32px 48px (consistent with rest of Neuron OS)
- Calendar cells: Stroke borders, hover state with subtle teal tint
- Event badges: Rounded rectangles with colored left border (4px)
- Typography: Consistent with Neuron OS hierarchy

### Event Badge Design

```
┌────────────────────────────┐
│ ▌ 2:00 PM - 3:30 PM       │  ← Colored left border
│ ▌ Team Standup             │
│ ▌ 📌 Assigned by Sarah     │  ← Badge for assigned events
└────────────────────────────┘

┌────────────────────────────┐
│ ▌ [#T-142] Client Follow-up│  ← Ticket with ID
│ ▌ Due Today                │
│ ▌ 🔴 High Priority         │
└────────────────────────────┘
```

### Interaction Patterns

**Hover:** Show quick preview tooltip with full details  
**Click:** Open detail modal/panel (TicketDetailModal for tickets, inline editor for personal events)  
**Double-click:** Quick edit mode  
**Drag-and-drop:** (Phase 2) Reschedule events by dragging to new date/time

---

## Integration Strategy

### Auto-Population Logic

#### Tickets
- Any ticket with a `due_date` automatically appears on calendar
- Updates in real-time when ticket due date changes
- Display format: `[#${ticket_number}] ${subject}`
- Color based on priority (High=Red, Medium=Orange, Low=Yellow)
- Badge shows ticket status (Open, In Progress, Waiting, etc.)
- Click → Opens `TicketDetailModal`

#### Bookings
- Shows ETD (Estimated Time of Departure) and ETA
- Could show multiple milestones: Booking Created → Departure → In Transit → Arrival
- Display format: `[${booking_number}] ${client_name} - ${destination}`
- Color: Blue (#0369A1)
- Badge shows shipping status
- Click → Navigates to Operations booking detail view

#### Quotations
- Shows validity expiration date
- Shows follow-up reminder dates (if BD wants to set them)
- Display format: `[${quotation_number}] ${client_name} - Expires`
- Color: Purple (#7C3AED)
- Badge shows quotation status (Draft, Sent, Accepted, Expired)
- Click → Navigates to BD/Pricing quotation detail view

### Cross-Module Navigation

```typescript
// Example navigation logic
const handleEventClick = (event: CalendarEvent) => {
  switch (event.type) {
    case "ticket":
      openTicketDetailModal(event.entity_id);
      break;
    case "booking":
      navigate(`/operations/bookings/${event.entity_id}`);
      break;
    case "quotation":
      navigate(`/bd/quotations/${event.entity_id}`);
      break;
    case "personal":
    case "assigned":
      openEventEditPanel(event.id);
      break;
  }
};
```

### Quick Add Feature (Phase 2)

From any module, users can add items to their calendar:

```
Ticket Detail Modal:
  [📅 Add to Calendar] button
  → Pre-fills with ticket due date

Operations Booking View:
  [📅 Set Reminder] button
  → Creates personal event linked to booking

BD Quotation View:
  [📅 Set Follow-up] button
  → Creates follow-up reminder
```

---

## Backend Implementation

### API Endpoints

```typescript
// Personal Events CRUD
GET    /make-server-c142e950/calendar-events
       ?user_id=X&start_date=2024-12-01&end_date=2024-12-31
       → Returns personal events in date range

POST   /make-server-c142e950/calendar-events
       Body: { title, description, date, start_time, end_time, all_day, color }
       → Creates new personal event

PUT    /make-server-c142e950/calendar-events/:id
       Body: { title?, description?, date?, start_time?, end_time?, ... }
       → Updates personal event

DELETE /make-server-c142e950/calendar-events/:id
       → Deletes personal event (only if created_by = current_user)

// Linked Items (aggregated view)
GET    /make-server-c142e950/calendar-linked-items
       ?user_id=X&start_date=Y&end_date=Z
       → Fetches tickets, bookings, quotations with dates in range
       → Returns in unified CalendarEvent format

// Multi-User Events (Phase 2)
POST   /make-server-c142e950/calendar-events/assign
       Body: { title, date, assigned_to: [user_ids], department?, visibility }
       → Manager/Executive creates event for others
       → Triggers notifications

POST   /make-server-c142e950/calendar-events/department
       Body: { title, date, department }
       → Creates department-wide event

POST   /make-server-c142e950/calendar-events/company
       Body: { title, date }
       → Creates company-wide event
```

### Backend Logic

```typescript
// Example: Fetch all events for a user in a date range
async function getCalendarEvents(userId: string, startDate: string, endDate: string) {
  const events: CalendarEvent[] = [];
  
  // 1. Fetch personal events
  const personalEvents = await kv.getByPrefix(`calendar_event:${userId}:`);
  events.push(...personalEvents.filter(e => isInDateRange(e.date, startDate, endDate)));
  
  // 2. Fetch assigned events
  const assignedEvents = await kv.getByPrefix(`calendar_event:assigned:${userId}:`);
  events.push(...assignedEvents.filter(e => isInDateRange(e.date, startDate, endDate)));
  
  // 3. Fetch department events
  const userDepartment = await getUserDepartment(userId);
  const deptEvents = await kv.getByPrefix(`calendar_department_event:${userDepartment}:`);
  events.push(...deptEvents.filter(e => isInDateRange(e.date, startDate, endDate)));
  
  // 4. Fetch company-wide events
  const companyEvents = await kv.getByPrefix(`calendar_company_event:`);
  events.push(...companyEvents.filter(e => isInDateRange(e.date, startDate, endDate)));
  
  // 5. Fetch linked tickets with due dates
  const tickets = await kv.getByPrefix(`ticket:`);
  const ticketsWithDueDates = tickets.filter(t => 
    t.due_date && 
    isInDateRange(t.due_date, startDate, endDate) &&
    (t.assigned_to === userId || t.created_by === userId)
  );
  events.push(...ticketsWithDueDates.map(t => convertTicketToCalendarEvent(t)));
  
  // 6. Fetch linked bookings
  // TODO: Similar logic for bookings when Operations module is ready
  
  // 7. Fetch linked quotations
  // TODO: Similar logic for quotations when BD module is ready
  
  return events.sort((a, b) => a.date.localeCompare(b.date));
}
```

### Permission Checking

```typescript
async function canUserEditEvent(userId: string, eventId: string): Promise<boolean> {
  const event = await kv.get(`calendar_event:${eventId}`);
  const user = await getUser(userId);
  
  // User can always edit their own personal events
  if (event.created_by === userId && event.type === "personal") {
    return true;
  }
  
  // Assigned events: can_edit_owner flag determines if user can edit
  if (event.owner_id === userId && event.type === "assigned") {
    return event.can_edit_owner; // FALSE by user requirement
  }
  
  // Department events: Manager of that department can edit
  if (event.visibility === "department") {
    return user.role === "Manager" && user.department === event.department;
  }
  
  // Company events: Only Executives/HR can edit
  if (event.visibility === "company_wide") {
    return user.role === "Executive" || user.department === "HR";
  }
  
  return false;
}
```

---

## Notification System Architecture

### Purpose

A comprehensive notification system that:
- Sends calendar reminders (15min, 1hr, 1day before events)
- Notifies users of ticket assignments and status changes
- Alerts users when events are assigned to them
- Provides department/company event announcements
- Tracks notification read/unread status

### Notification Types

```typescript
type NotificationType = 
  // Calendar-related
  | "calendar_reminder"           // 15min, 1hr, 1day before event
  | "calendar_event_assigned"     // Manager created event for you
  | "department_event_created"    // New department-wide event
  | "company_event_created"       // New company-wide event
  
  // Ticket-related
  | "ticket_assigned"             // Someone assigned you a ticket
  | "ticket_status_changed"       // Ticket you're watching changed status
  | "ticket_comment"              // New comment on your ticket
  | "ticket_due_soon"             // Due in 24 hours
  | "ticket_overdue"              // Past due date
  
  // Booking-related (Future)
  | "booking_status_changed"      // Shipment milestone reached
  | "booking_milestone"           // ETD/ETA reached
  
  // Quotation-related (Future)
  | "quotation_converted"         // Your quotation was converted to project
  | "quotation_expiring_soon"     // Validity expires in 3 days
```

### Notification Data Model

```typescript
interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  
  // Content
  title: string;
  message: string;
  
  // Linked Entity
  entity_type: "ticket" | "calendar_event" | "booking" | "quotation" | null;
  entity_id: string | null;
  
  // Navigation
  action_url?: string;            // Where to navigate on click
  
  // Display
  priority: "low" | "normal" | "high";
  icon?: string;                  // Emoji or icon identifier
  
  // Status
  is_read: boolean;
  read_at?: number;
  
  // Audit
  created_at: number;
  expires_at?: number;            // Auto-delete after 30 days
}
```

### KV Store Structure

```
Single Notification:
  notification:${user_id}:${notification_id}

Index for Unread Count:
  notification_unread:${user_id}
  → [notification_id, notification_id, ...]

Index for Recent Notifications:
  notification_recent:${user_id}
  → [notification_id, notification_id, ...] (last 50)
```

### Notification Generation

```typescript
// Example: Calendar reminder generation
async function generateCalendarReminders() {
  const now = Date.now();
  const events = await kv.getByPrefix("calendar_event:");
  
  for (const event of events) {
    if (!event.reminder_times || event.completed) continue;
    
    const eventTime = new Date(event.date + " " + event.start_time).getTime();
    
    for (const reminderMinutes of event.reminder_times) {
      const reminderTime = eventTime - (reminderMinutes * 60 * 1000);
      
      // Should we send this reminder?
      if (now >= reminderTime && (!event.last_reminder_sent || event.last_reminder_sent < reminderTime)) {
        await createNotification({
          user_id: event.owner_id,
          type: "calendar_reminder",
          title: `Reminder: ${event.title}`,
          message: `Starting in ${reminderMinutes} minutes`,
          entity_type: "calendar_event",
          entity_id: event.id,
          action_url: `/personal/calendar?date=${event.date}`,
          priority: reminderMinutes <= 15 ? "high" : "normal",
        });
        
        // Update last_reminder_sent
        event.last_reminder_sent = now;
        await kv.set(`calendar_event:${event.id}`, event);
      }
    }
  }
}
```

### Notification Delivery Strategy

#### Phase 1: In-App Only
- Notifications stored in KV store
- Polled every 30-45 seconds (similar to Activity Log)
- Toast notification for high-priority items using Sonner
- Notification center dropdown for history
- Unread badge on notification bell icon

#### Phase 2: Email Notifications (Future)
- Daily digest option (7am email with all pending items)
- Immediate email for urgent items (high-priority tickets, overdue tasks)
- User preference toggles in settings
- Email templates with Neuron OS branding

#### Phase 3: Push Notifications (Future)
- Browser push notifications (if user grants permission)
- Mobile app push (if native app is built)

### UI Components

#### 1. Notification Bell (Top Right Navigation)

```
┌───────────────────────┐
│  [My Inbox] [🔔 (3)] │  ← Badge shows unread count
└───────────────────────┘
```

#### 2. Notification Center (Dropdown)

```
┌─────────────────────────────────────────┐
│  Notifications                [Mark All]│
├─────────────────────────────────────────┤
│  🔴 [#T-142] Ticket assigned to you     │
│      2 minutes ago                   [x]│
├─────────────────────────────────────────┤
│  🟢 Reminder: Client Call               │
│      Starting in 15 minutes          [x]│
├─────────────────────────────────────────┤
│  🔵 Department Event: Team Meeting      │
│      Sarah Khan · 1 hour ago         [x]│
├─────────────────────────────────────────┤
│              [View All]                 │
└─────────────────────────────────────────┘
```

#### 3. Toast Notifications

```
┌──────────────────────────────────┐
│  ⚠️ Ticket #T-142 is overdue     │
│  Click to view                [x]│
└──────────────────────────────────┘
```

Appears in bottom-right corner, auto-dismisses after 5 seconds, or user can click to navigate.

#### 4. Notification Preferences (Settings Page)

```
Calendar Reminders:
  ☑ 15 minutes before
  ☑ 1 hour before
  ☐ 1 day before

Ticket Notifications:
  ☑ When assigned to me
  ☑ When ticket is overdue
  ☐ When status changes
  ☐ When new comment is added

Email Notifications:
  ☐ Daily digest (7:00 AM)
  ☑ Urgent items only
```

### Backend Notification Functions

```typescript
// Create notification
async function createNotification(data: Partial<Notification>) {
  const notification: Notification = {
    id: generateId(),
    user_id: data.user_id,
    type: data.type,
    title: data.title,
    message: data.message,
    entity_type: data.entity_type || null,
    entity_id: data.entity_id || null,
    action_url: data.action_url,
    priority: data.priority || "normal",
    is_read: false,
    created_at: Date.now(),
    expires_at: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
  };
  
  await kv.set(`notification:${notification.user_id}:${notification.id}`, notification);
  
  // Add to unread index
  const unread = await kv.get(`notification_unread:${notification.user_id}`) || [];
  unread.push(notification.id);
  await kv.set(`notification_unread:${notification.user_id}`, unread);
  
  return notification;
}

// Mark as read
async function markNotificationAsRead(userId: string, notificationId: string) {
  const notification = await kv.get(`notification:${userId}:${notificationId}`);
  if (!notification) return;
  
  notification.is_read = true;
  notification.read_at = Date.now();
  await kv.set(`notification:${userId}:${notificationId}`, notification);
  
  // Remove from unread index
  const unread = await kv.get(`notification_unread:${userId}`) || [];
  const filtered = unread.filter(id => id !== notificationId);
  await kv.set(`notification_unread:${userId}`, filtered);
}

// Get unread count
async function getUnreadCount(userId: string): Promise<number> {
  const unread = await kv.get(`notification_unread:${userId}`) || [];
  return unread.length;
}

// Fetch recent notifications
async function getRecentNotifications(userId: string, limit = 50): Promise<Notification[]> {
  const notifications = await kv.getByPrefix(`notification:${userId}:`);
  return notifications
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, limit);
}
```

---

## Multi-User Calendar Features

### Permission Matrix

| Role | Personal Events | Assign to Users | Department Events | Company Events | View Others' Calendars |
|------|----------------|----------------|-------------------|----------------|------------------------|
| **Employee/Rep** | ✅ Create/Edit/Delete | ❌ | ❌ | ❌ | ❌ Own only |
| **Manager** | ✅ Create/Edit/Delete | ✅ Department users only | ✅ Own department | ❌ | ✅ Department only |
| **Executive** | ✅ Create/Edit/Delete | ✅ Any user | ✅ Any department | ✅ | ✅ Anyone |
| **HR** | ✅ Create/Edit/Delete | ✅ Any user | ✅ Any department | ✅ | ✅ Anyone |

**Special Rule:** Everyone in the Executive Department automatically gets Executive role permissions regardless of their actual role.

### Event Visibility Types

```typescript
type EventVisibility = 
  | "personal"          // Only visible to owner
  | "department"        // Visible to all users in department (can't be hidden)
  | "company_wide"      // Visible to everyone (can't be hidden)
  | "assigned"          // Visible to specific user(s)
```

### Assigned Event Permissions

**User Requirement:** Assigned events are **read-only** for recipients.

- ❌ Cannot edit title, description, date, time
- ❌ Cannot delete the event
- ✅ Can mark as completed (maybe - to be decided in implementation)
- ✅ Can view full details
- 📌 Event shows "Assigned by [Manager Name]" badge

### Creating Events for Others

#### Manager Workflow

```
1. Click "+ New Event" button
2. Side panel opens with form fields:
   
   ┌─────────────────────────────────────┐
   │  Create Event                   [x] │
   ├─────────────────────────────────────┤
   │  Event Type:                        │
   │  ⚫ Personal Event                   │
   │  ⚪ Assign to Team Member            │
   │  ⚪ Department Event                 │
   │                                     │
   │  [If "Assign to Team Member"]       │
   │  Assign To: [Dropdown: Team List]   │
   │                                     │
   │  Title: _________________________   │
   │  Description: ___________________   │
   │  Date: [Date Picker]                │
   │  Time: [09:00] to [10:00]           │
   │  All Day: ☐                         │
   │                                     │
   │  [Cancel]  [Create Event]           │
   └─────────────────────────────────────┘

3. On submit:
   - Event created with visibility="assigned"
   - Notification sent to assigned user
   - Event appears on their calendar
```

#### Executive/HR Workflow

Same as manager, but:
- "Assign to" dropdown shows **all users** (not just department)
- Additional option: **"Company-Wide Event"**
- Additional option: Select multiple departments for multi-department events

### Department Event Workflow

```
1. Manager clicks "+ New Department Event"
2. Form similar to above, but simpler:
   
   ┌─────────────────────────────────────┐
   │  Create Department Event        [x] │
   ├─────────────────────────────────────┤
   │  Title: _________________________   │
   │  Description: ___________________   │
   │  Date: [Date Picker]                │
   │  Time: [09:00] to [10:00]           │
   │  All Day: ☐                         │
   │                                     │
   │  This event will appear on the      │
   │  calendar of all users in the       │
   │  [Operations Department].           │
   │                                     │
   │  [Cancel]  [Create Event]           │
   └─────────────────────────────────────┘

3. On submit:
   - Event created with visibility="department"
   - Notification sent to all department users
   - Event appears on all their calendars (can't be hidden)
```

### Viewing Other Users' Calendars (Manager/Executive Feature)

```
Calendar Page Header:
┌────────────────────────────────────────────────┐
│  View Calendar: [My Calendar ▼]               │
│                                                │
│  Dropdown Options:                             │
│  ⚫ My Calendar                                 │
│  ────────────────                              │
│  Team Members:                                 │
│  ⚪ John Santos                                 │
│  ⚪ Maria Garcia                                │
│  ⚪ Carlos Reyes                                │
└────────────────────────────────────────────────┘

When viewing another user's calendar:
- Shows their personal events (read-only)
- Shows events assigned to them
- Shows department/company events
- Visual indicator: "Viewing [John Santos]'s Calendar"
- Quick action: "Assign Event to John" button
```

### Notification Scenarios

#### Assigned Event
```
Notification:
  Title: "Event assigned to you"
  Message: "Sarah Khan assigned you: Client Meeting - Dec 25, 2:00 PM"
  Priority: Normal
  Action: Navigate to calendar on that date
```

#### Department Event
```
Notification:
  Title: "New Department Event"
  Message: "Operations Team Meeting - Dec 20, 10:00 AM"
  Priority: Normal
  Action: Navigate to calendar on that date
```

#### Company-Wide Event
```
Notification:
  Title: "Company Event Announcement"
  Message: "All-Hands Meeting - Dec 31, 3:00 PM (Created by CEO)"
  Priority: High
  Action: Navigate to calendar on that date
```

---

## Implementation Plan (Phased Approach)

### ✅ **Phase 0: Design & Architecture** (CURRENT PHASE)
**Duration:** 1-2 days discussion  
**Status:** COMPLETE

- [x] Define core concept and requirements
- [x] Design data model
- [x] Design UI/UX (Neuron OS style)
- [x] Plan notification architecture
- [x] Plan multi-user features
- [x] Document everything
- [x] Defer implementation until core business modules are complete

---

### 🔲 **Phase 1: Personal Calendar MVP**
**Duration:** 5-7 days  
**Priority:** Build AFTER core business modules (Reports, Analytics, Financial Management)

**Features:**
- ✅ Month view calendar grid
- ✅ Create/edit/delete personal events
- ✅ Hourly time slot scheduling (start_time, end_time fields)
- ✅ All-day event toggle
- ✅ Color picker for events
- ✅ Auto-link tickets with due dates (fetch and display)
- ✅ Click to open entity details (TicketDetailModal for tickets)
- ✅ "Today" navigation button
- ✅ Mini calendar navigator (sidebar)
- ✅ Filter toggles (Personal, Tickets, Bookings, Quotations)
- ✅ Notification hooks in place (reminder_times field) but not triggered

**Backend:**
- API: GET/POST/PUT/DELETE `/calendar-events`
- API: GET `/calendar-linked-items` (tickets with due dates)
- Permission checking (users can only edit own events)

**UI Components:**
- `CalendarPage.tsx` - Main calendar grid
- `CalendarMonthView.tsx` - Month grid layout
- `CalendarEventModal.tsx` - Create/edit event side panel
- `CalendarEventBadge.tsx` - Event display component
- `MiniCalendar.tsx` - Sidebar mini navigator

**Out of Scope:**
- ❌ Week/Day views (Phase 2)
- ❌ Drag-and-drop rescheduling (Phase 2)
- ❌ Assigned events from managers (Phase 2)
- ❌ Department/company events (Phase 2)
- ❌ Notification delivery (Phase 3)
- ❌ Booking/quotation integration (Phase 2, depends on those modules)

---

### 🔲 **Phase 2: Week/Day Views & Enhanced Features**
**Duration:** 3-4 days  
**Depends On:** Phase 1 complete + user feedback

**Features:**
- ✅ Week view (7-day timeline with hourly slots)
- ✅ Day view (hourly breakdown 8am-8pm)
- ✅ Agenda view (simple list of upcoming events)
- ✅ Drag-and-drop to reschedule events
- ✅ Quick add from other modules ("Add to Calendar" button on Ticket Detail)
- ✅ Recurring events (daily, weekly, monthly)
- ✅ Event search/filter
- ✅ Booking integration (show departure/arrival dates)
- ✅ Quotation integration (show validity/follow-up dates)

**Backend:**
- Enhanced date range queries
- Recurring event logic
- Booking/quotation fetching

**UI Components:**
- `CalendarWeekView.tsx`
- `CalendarDayView.tsx`
- `CalendarAgendaView.tsx`
- `RecurringEventModal.tsx`

---

### 🔲 **Phase 3: Notification System**
**Duration:** 3-5 days  
**Depends On:** Phase 1 complete (or Phase 2)  
**Priority:** Medium

**Features:**
- ✅ Notification bell icon (top right navigation)
- ✅ Unread count badge
- ✅ Notification center dropdown
- ✅ Calendar reminder generation (15min, 1hr, 1day before)
- ✅ Ticket notifications (assigned, due soon, overdue)
- ✅ Toast notifications for high-priority items (using Sonner)
- ✅ Mark as read/unread
- ✅ Notification preferences page
- ✅ Auto-polling (30-45 seconds, similar to Activity Log)

**Backend:**
- API: GET/POST/PUT/DELETE `/notifications`
- Background job: `generateCalendarReminders()` (runs every 5 minutes)
- Background job: `generateTicketReminders()` (runs every 5 minutes)
- Cleanup job: Delete notifications older than 30 days

**UI Components:**
- `NotificationBell.tsx` - Icon with badge
- `NotificationCenter.tsx` - Dropdown panel
- `NotificationItem.tsx` - Single notification
- `NotificationPreferences.tsx` - Settings page

---

### 🔲 **Phase 4: Multi-User Calendar Features**
**Duration:** 3-4 days  
**Depends On:** Phase 1 complete, Phase 3 recommended

**Features:**
- ✅ Managers can create events for department users
- ✅ Executives/HR can create events for any user
- ✅ Department-wide events
- ✅ Company-wide events
- ✅ Assigned events are read-only for recipients
- ✅ "Assigned by [Name]" badge on events
- ✅ Notification when event is assigned
- ✅ "View Calendar" dropdown for managers/executives
- ✅ Permission enforcement (who can create what)

**Backend:**
- API: POST `/calendar-events/assign` (create event for another user)
- API: POST `/calendar-events/department` (create department event)
- API: POST `/calendar-events/company` (create company-wide event)
- Enhanced permission checking
- Batch notification creation (for department/company events)

**UI Components:**
- Enhanced `CalendarEventModal` with "Assign to" dropdown
- `ViewCalendarDropdown.tsx` - Switch between user calendars
- `AssignedEventBadge.tsx` - Special styling for assigned events

---

### 🔲 **Phase 5: Advanced Features** (Future)
**Duration:** Variable  
**Priority:** Low (nice-to-have)

**Features:**
- ✅ Team calendar view (see multiple users' calendars overlaid)
- ✅ Email notifications (daily digest, urgent alerts)
- ✅ iCal export (download as .ics file)
- ✅ Google Calendar integration (2-way sync)
- ✅ Slack integration (post reminders to Slack)
- ✅ Mobile responsive design
- ✅ Calendar printing
- ✅ Calendar templates (pre-made event types)

---

## User Requirements

These decisions were made during the design discussion:

### 1. Default View
**Decision:** Month View  
Users want to see the full month at a glance, with ability to drill down to week/day if needed.

### 2. Time Granularity
**Decision:** Hourly scheduling support  
Users need to schedule events at specific times (e.g., "2:00 PM - 3:30 PM"), not just all-day events.

### 3. Multi-User Permissions
**Decision:** Purely personal BY DEFAULT, but with role-based assignment features:
- Executives and Managers can create department-wide events
- Executives and Managers can assign events to specific users
- HR can do all of the above for any department
- Regular employees can only create personal events

### 4. Assigned Event Editability
**Decision:** Read-only for recipients  
When a manager assigns an event to an employee, the employee **cannot edit or delete it**. It's a directive, not a suggestion.

### 5. Department/Company Event Visibility
**Decision:** Cannot be hidden  
Department events appear on all department members' calendars automatically. Company-wide events appear on everyone's calendars. Users cannot hide them.

### 6. Notifications
**Decision:** Medium priority  
Notifications are important but not critical for MVP. Build notification architecture first, implement delivery after calendar MVP is functional.

### 7. Implementation Priority
**Decision:** Defer until after core business modules  
Calendar is a Tier 4 feature. Focus on Reports, Analytics, Financial Management, and other core business modules first. Calendar can wait.

---

## Future Considerations

### Integration with External Calendars
- **Google Calendar sync** - 2-way sync via Google Calendar API
- **Outlook sync** - 2-way sync via Microsoft Graph API
- **iCal export/import** - Download .ics files, import external calendars
- **Considerations:** Requires OAuth setup, token management, sync conflict resolution

### Mobile Considerations
- **Responsive design** - Month view adapts to mobile (stacked weeks)
- **Touch gestures** - Swipe to change months, pinch to zoom
- **Native app** - If Neuron OS gets a mobile app, calendar should be included
- **Push notifications** - Mobile push for reminders

### Performance Optimization
- **Pagination** - Load one month at a time, lazy load adjacent months
- **Caching** - Cache linked entities (tickets, bookings) to reduce DB queries
- **Debouncing** - Debounce search/filter operations
- **Virtual scrolling** - For agenda view with many events

### Accessibility
- **Keyboard navigation** - Arrow keys to navigate days, Enter to select
- **Screen reader support** - Proper ARIA labels for calendar grid
- **High contrast mode** - Ensure colors are distinguishable
- **Focus indicators** - Clear visual focus states

### Analytics & Insights
- **Calendar usage stats** - How often users create events, what types
- **Completion rates** - Personal task completion percentage
- **Reminder effectiveness** - Do reminders reduce overdue tickets?
- **Team productivity** - Manager view of team event density

---

## Open Questions

These should be answered during implementation:

1. **Completed tasks visibility**
   - Should completed personal tasks remain visible on the calendar?
   - Or fade out / move to a "Completed" view?
   - Or disappear entirely after 24 hours?

2. **Event conflicts**
   - Should the system warn users when creating overlapping events?
   - Or allow free scheduling without conflict detection?

3. **Booking integration detail level**
   - Show only departure/arrival dates?
   - Or show multiple milestones (Booking Created, Customs Clearance, In Transit, Delivered)?
   - How granular should booking events be?

4. **Quotation follow-up dates**
   - Should these be auto-generated (e.g., 3 days after quotation sent)?
   - Or manually set by BD reps?
   - Or both (suggested date with manual override)?

5. **Manager calendar view privacy**
   - When a manager views an employee's calendar, can they see personal event details?
   - Or just see "Personal Event" without title/description?
   - Balance between oversight and privacy

6. **Notification frequency limits**
   - Should we rate-limit notifications to prevent spam?
   - E.g., max 10 notifications per hour per user?
   - Batch notifications if multiple events trigger at once?

7. **Time zone handling**
   - All times stored in UTC and displayed in user's local time zone?
   - Or store in Manila time (Philippines default)?
   - Important for international shipping (bookings might cross time zones)

8. **Calendar event history**
   - Should we track edit history for events (who changed what, when)?
   - Or just current state + created_at/updated_at timestamps?
   - Important for accountability with assigned events

---

## Technical Debt & Limitations

### Current System Limitations

1. **No real-time updates** - Using polling (30-45 seconds), not WebSockets
   - New events won't appear instantly
   - Acceptable for MVP, but could be improved

2. **KV store query limitations** - No complex filtering/sorting at DB level
   - All filtering happens in application code after fetching
   - Could be slow with thousands of events
   - Consider migrating to SQL table if performance becomes an issue

3. **No transaction support** - KV store doesn't support atomic operations
   - Risk of race conditions when creating events + notifications
   - Mitigate with careful ordering and error handling

4. **Limited date range queries** - Must fetch events by prefix, then filter
   - Can't efficiently query "all events between Date X and Date Y"
   - Consider adding date-based indexes if performance suffers

### Known Technical Debt

1. **Calendar date calculations** - Time zones, DST, leap years are complex
   - Use a library like `date-fns` or `dayjs` for date math
   - Don't try to hand-roll date logic

2. **Recurring event storage** - Storing each instance vs storing a pattern
   - Decided approach: TBD during Phase 2 implementation
   - Options: Store rule + generate instances on-the-fly, or materialize all instances

3. **Notification cleanup** - Old notifications should be auto-deleted
   - Needs a background job (cron-like scheduler)
   - Current system doesn't have job scheduling - might need to add

4. **Bulk operations** - Creating department event = 50+ individual event records?
   - Or one event record with a "visible_to" array?
   - Trade-off: Storage duplication vs query complexity

---

## Success Metrics

How will we know if the calendar is successful?

### MVP Success Criteria (Phase 1)
- ✅ 80%+ of users create at least one personal event in first week
- ✅ Average 3+ events created per user per week
- ✅ No major bugs reported in calendar date calculations
- ✅ Tickets with due dates automatically appear on calendars
- ✅ Users can navigate month view without issues

### Feature Adoption (Phase 2-4)
- ✅ Week/Day views: Used by 30%+ of users
- ✅ Assigned events: Managers create 5+ assigned events per week
- ✅ Department events: Used at least once per department per month
- ✅ Notifications: 70%+ of users have notifications enabled

### Business Impact
- ✅ Reduced overdue tickets (users see due dates on calendar)
- ✅ Better meeting attendance (department events visible to all)
- ✅ Improved time management (users report feeling more organized)
- ✅ Positive user feedback (NPS score 8+ for calendar feature)

---

## Appendix: Comparison with Other Calendar Systems

### Neuron OS Calendar vs Google Calendar

| Feature | Google Calendar | Neuron OS Calendar |
|---------|----------------|-------------------|
| Event creation | ✅ | ✅ |
| Recurring events | ✅ | Phase 2 |
| Multi-calendar view | ✅ (separate calendars) | ✅ (filters) |
| Sharing | ✅ (granular) | ✅ (role-based) |
| External integration | ✅ (extensive) | Phase 5 |
| Auto-linked entities | ❌ | ✅ (tickets, bookings) |
| Permission system | Basic | Advanced (role-based) |
| Neuron OS styling | ❌ | ✅ |

### Key Differentiators

**Neuron OS Calendar's Unique Value:**
1. ✅ **Auto-linking** - Tickets, bookings, quotations appear automatically
2. ✅ **Role-based permissions** - Manager/Executive features built-in
3. ✅ **Business context** - Integrated with freight forwarding workflow
4. ✅ **Unified interface** - Same design system as rest of Neuron OS
5. ✅ **Department awareness** - Department events, team views

**Google Calendar's Advantages:**
1. ✅ Mobile apps (iOS, Android)
2. ✅ Extensive integrations (Zoom, Meet, etc.)
3. ✅ Advanced recurring event rules
4. ✅ Time zone intelligence
5. ✅ Mature feature set (years of development)

**Strategic Positioning:**
- Neuron OS Calendar is not trying to replace Google Calendar
- It's a **business context layer** on top of time management
- Users can still use Google Calendar for personal stuff
- Neuron OS Calendar is for work items, deadlines, team coordination
- Future Phase 5: Sync between the two for best of both worlds

---

## Contact & Questions

If you have questions about this design document or need clarification on any aspect of the calendar/notification system, please refer back to the design discussion or reach out during implementation planning.

**Document Owner:** AI Assistant (Figma Make)  
**Stakeholder:** Neuron OS Product Team  
**Last Updated:** December 19, 2024  
**Status:** Design Complete, Awaiting Implementation Priority Decision

---

**END OF DOCUMENT**
