# Product Requirements Document
## H.O.P.S. Waste Logging System

**Version:** 1.0  
**Last Updated:** February 23, 2026  
**Product Owner:** Haywire Bar Management  
**Status:** MVP Complete

---

## Executive Summary

The H.O.P.S. (Haywire Operations & Performance System) Waste Logging System is a mobile-first digital waste tracking application designed to replace Haywire Bar's paper-based waste logging process. The system enables bartenders and managers to quickly log waste during busy service hours, attribute waste to specific staff members, and generate comprehensive reports for operational insights and cost reduction.

---

## 1. Product Overview

### 1.1 Problem Statement

Haywire Bar currently uses a paper-based waste tracking system that:
- Takes too long during busy service hours (>30 seconds per entry)
- Provides poor data accessibility for analysis
- Makes it difficult to track trends and patterns
- Lacks accountability and attribution capabilities
- Cannot generate automated reports
- Has no integration with inventory management

### 1.2 Solution

A Progressive Web App (PWA) that provides:
- Sub-30 second waste entry workflow
- PIN-based authentication for staff
- Mobile-first, touch-optimized interface
- Real-time inventory impact tracking
- User attribution with full audit trail
- Manager review interface with CSV export
- Comprehensive inventory catalog management

### 1.3 Success Criteria

- ✅ Waste entry completion in <30 seconds
- ✅ 100% mobile responsiveness
- ✅ Zero training time for bartenders
- ✅ Full audit trail for all entries
- ✅ Manager-accessible reporting and analytics
- ✅ Accurate inventory tracking with cascading updates

---

## 2. User Personas

### 2.1 Primary Users

#### Bartender (e.g., Davontae, Izzy, Sydney, Dylan)
- **Role:** Front-line staff logging waste during service
- **Pain Points:** Limited time during busy shifts, needs quick mobile access
- **Goals:** Log waste quickly, accurately attribute to responsible party
- **Tech Proficiency:** Moderate

#### Barback (e.g., Dalton)
- **Role:** Support staff who may discover and log waste
- **Pain Points:** Same as bartenders
- **Goals:** Quick waste logging without interrupting service
- **Tech Proficiency:** Moderate

#### Manager (e.g., Brittany)
- **Role:** Operations oversight, cost control, staff management
- **Pain Points:** Needs visibility into waste patterns, cost analysis, staff performance
- **Goals:** Review entries, generate reports, manage inventory catalog, identify cost reduction opportunities
- **Tech Proficiency:** High

---

## 3. Core Features

### 3.1 Authentication System

**Feature:** PIN-Based Login
- **Description:** 4-digit PIN authentication for fast access
- **Requirements:**
  - Simple numeric PIN entry (4 digits)
  - Session persistence (30-minute timeout)
  - No email/password required
  - Clear visual feedback on authentication status
- **User Stories:**
  - As a bartender, I want to login with a PIN so I can access the system quickly during service
  - As a manager, I want different PINs for each staff member so I can maintain accountability

**Current Staff:**
- Brittany (Manager) - PIN: 1234
- Davontae (Bartender) - PIN: 2345
- Izzy (Bartender) - PIN: 3456
- Sydney (Bartender) - PIN: 4567
- Dylan (Bartender) - PIN: 5678
- Dalton (Barback) - PIN: 6789

### 3.2 Quick Waste Logging (FAB)

**Feature:** Context-Dependent Floating Action Button
- **Description:** Quick access waste logging from any screen
- **Requirements:**
  - Floating Action Button (FAB) present on all main screens
  - Modal overlay with streamlined waste entry form
  - Type-ahead item search (minimum 2 characters)
  - Amount selection with decimal support (serving/bottle)
  - Reason selection from predefined list
  - User attribution dropdown
  - Optional date selection for backdating entries
  - Optional notes field for context
  - Form completion in <30 seconds
- **User Stories:**
  - As a bartender, I want to log waste in under 30 seconds so I can return to serving customers
  - As a manager, I want to backdate entries so I can log waste discovered the next day accurately

**Waste Entry Fields:**
- Item (type-ahead search from ~250 inventory items)
- Amount Type: Serving or Bottle
- Quantity: Decimal values (0.25 increments, min 0.25)
- Reason: Predefined list
- Attributed To: Staff member selector
- Date: Optional (defaults to current timestamp)
- Notes: Optional text field

**Predefined Waste Reasons:**
1. Spilled/Dropped
2. Over-poured
3. Wrong Order
4. Quality Issue
5. Expired Product
6. Broken Glass/Bottle
7. Customer Return
8. Training/Practice
9. Spoiled/Bad Product
10. Other

### 3.3 Navigation System

**Feature:** Mobile-First Bottom Navigation
- **Description:** Tab-based navigation optimized for one-handed mobile use
- **Requirements:**
  - Fixed bottom navigation bar
  - 4 primary tabs: Log, Review, Catalog, Profile
  - Clear active state indicators
  - Icon + label for clarity
- **User Stories:**
  - As a bartender on mobile, I want thumb-accessible navigation so I can use the app one-handed

**Navigation Structure:**
- **Log Tab:** Quick waste entry interface (duplicate of FAB functionality)
- **Review Tab:** Manager-only waste entry review and analytics
- **Catalog Tab:** Manager-only inventory item management
- **Profile Tab:** User settings and logout

### 3.4 Waste Review Interface (Manager Only)

**Feature:** Manager Review Dashboard
- **Description:** Comprehensive waste entry review with filtering and export
- **Requirements:**
  - Paginated list view of all waste entries
  - Real-time data refresh
  - Date range filtering
  - Category filtering
  - Staff member filtering
  - Reason filtering
  - CSV export functionality
  - Entry detail view with full audit trail
- **User Stories:**
  - As a manager, I want to review all waste entries so I can identify patterns
  - As a manager, I want to filter by date and staff so I can analyze specific periods
  - As a manager, I want to export to CSV so I can analyze data in Excel

**Review Data Fields:**
- Item Name & Category
- Amount & Unit
- Reason
- Logged By (staff member)
- Attributed To (responsible party)
- Timestamp
- Notes

### 3.5 Inventory Catalog Management (Manager Only)

**Feature:** Complete Inventory Item Management
- **Description:** Full CRUD operations for ~250 inventory items
- **Requirements:**
  - Item list with search and category filtering
  - Create new items
  - Edit existing items
  - Soft delete (deactivate) items
  - Recipe attachment with ingredient linking
  - Cascading inventory updates
- **User Stories:**
  - As a manager, I want to add new menu items so the waste log stays current
  - As a manager, I want to attach recipes to items so inventory automatically updates when waste is logged

**Item Data Model:**
- ID (unique identifier)
- Name
- Category (Beer, Wine, Liquor, Non-Alcoholic, Food)
- Is Active (boolean)
- Recipes (array of attached recipes)
- Created/Updated timestamps

**Recipe Data Model:**
- Recipe ID
- Recipe Name
- Ingredients (array):
  - Item ID (links to inventory)
  - Quantity
  - Unit

**Inventory Categories:**
1. Beer (~80 items)
2. Wine (~60 items)
3. Liquor (~70 items)
4. Non-Alcoholic (~25 items)
5. Food (~15 items)

### 3.6 User Attribution System

**Feature:** Flexible User Attribution with Audit Trail
- **Description:** Log entries by one user, attribute responsibility to another
- **Requirements:**
  - Separate fields for "Logged By" and "Attributed To"
  - Defaults to current user
  - Dropdown selector for all active staff
  - Full audit trail preservation
- **User Stories:**
  - As a manager, I want to log waste on behalf of a bartender so I can accurately track who was responsible
  - As a bartender, I want to attribute waste to another staff member so the record is accurate

---

## 4. Technical Architecture

### 4.1 Technology Stack

**Frontend:**
- React 18+ (TypeScript)
- Tailwind CSS v4
- React Router (Data Mode)
- Shadcn/ui Components
- Lucide React Icons
- Sonner (Toast Notifications)

**Backend:**
- Supabase PostgreSQL Database
- Supabase Edge Functions (Deno + Hono)
- RESTful API architecture

**Architecture Pattern:**
- Three-tier: Frontend → API Server → Database
- Client-side session management (localStorage)
- Server-side data persistence

### 4.2 Database Schema

**Tables:**

1. **users**
   - `id` (TEXT, Primary Key)
   - `name` (TEXT)
   - `pin` (TEXT)
   - `role` (TEXT: 'manager' | 'bartender')
   - `is_scheduled_today` (BOOLEAN)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **items**
   - `id` (TEXT, Primary Key)
   - `name` (TEXT)
   - `category` (TEXT)
   - `is_active` (BOOLEAN)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

3. **recipes**
   - `id` (TEXT, Primary Key)
   - `item_id` (TEXT, Foreign Key → items.id)
   - `name` (TEXT)
   - `created_at` (TIMESTAMP)

4. **recipe_ingredients**
   - `id` (TEXT, Primary Key)
   - `recipe_id` (TEXT, Foreign Key → recipes.id)
   - `item_id` (TEXT, Foreign Key → items.id)
   - `quantity` (NUMERIC)
   - `unit` (TEXT)

5. **waste_entries**
   - `id` (TEXT, Primary Key)
   - `item_id` (TEXT, Foreign Key → items.id)
   - `item_name` (TEXT)
   - `category` (TEXT)
   - `amount` (NUMERIC, supports decimals)
   - `unit` (TEXT: 'serving' | 'bottle')
   - `reason_id` (TEXT)
   - `reason_name` (TEXT)
   - `logged_by_user_id` (TEXT, Foreign Key → users.id)
   - `logged_by_name` (TEXT)
   - `attributed_to_user_id` (TEXT, Foreign Key → users.id, NULLABLE)
   - `attributed_to_name` (TEXT, NULLABLE)
   - `timestamp` (TIMESTAMP)
   - `notes` (TEXT, NULLABLE)

6. **waste_reasons**
   - `id` (TEXT, Primary Key)
   - `name` (TEXT)
   - `is_active` (BOOLEAN)

### 4.3 API Endpoints

**Base URL:** `https://${projectId}.supabase.co/functions/v1/make-server-68fdbf91`

**Authentication:**
- Header: `Authorization: Bearer ${publicAnonKey}`

**Endpoints:**

```
GET    /users                        # Get all users
POST   /users/authenticate           # Authenticate by PIN
GET    /items                        # Get all items
POST   /items                        # Create new item
PUT    /items/:id                    # Update item
GET    /waste-entries                # Get all waste entries
POST   /waste-entries                # Create waste entry
GET    /waste-reasons                # Get all waste reasons
```

### 4.4 Data Flow: Logging Waste Entry

1. User opens Quick Log sheet (FAB or Log tab)
2. Frontend loads items, users, and reasons from API
3. User searches and selects item (type-ahead)
4. User configures amount, reason, attribution, date, notes
5. Frontend validates form data
6. Frontend sends POST to `/waste-entries`
7. Backend validates foreign key constraints
8. Backend inserts entry into PostgreSQL
9. Backend triggers cascading inventory updates (if recipe attached)
10. Backend returns success/error response
11. Frontend displays toast notification
12. Frontend refreshes data and resets form

---

## 5. User Workflows

### 5.1 Bartender Workflow: Quick Waste Logging

**Scenario:** Davontae spills 2 servings of beer during busy Friday night service

1. Tap FAB button (floating + icon)
2. Quick Log sheet opens
3. Type "bud" in search field
4. Select "Budweiser" from type-ahead results
5. Amount type defaults to "Serving" ✓
6. Use +/- buttons to set quantity to 2
7. Select "Spilled/Dropped" from reason dropdown
8. Attributed To defaults to "Davontae (You)" ✓
9. Date defaults to current time ✓
10. Tap "Log Waste" button
11. Success toast appears
12. Sheet closes automatically

**Time:** ~15 seconds ✅

### 5.2 Manager Workflow: Backdating Waste Entry

**Scenario:** Brittany discovers expired bottles the morning after and needs to backdate the entry

1. Tap FAB button
2. Search and select "Grey Goose Vodka"
3. Select "Bottle" radio button
4. Enter 2 bottles
5. Select "Expired Product" reason
6. Change "Attributed To" from "Brittany (You)" to "Dylan"
7. Tap date field, select yesterday's date
8. Add note: "Discovered during morning inventory check"
9. Tap "Log Waste"

**Time:** ~25 seconds ✅

### 5.3 Manager Workflow: Weekly Waste Review

**Scenario:** Brittany reviews waste patterns every Monday morning

1. Navigate to Review tab
2. Set date filter to "Last 7 Days"
3. Review entries by category
4. Filter by "Attributed To: Dylan" to check specific staff performance
5. Notice pattern of expired products
6. Export to CSV for deeper Excel analysis
7. Schedule staff meeting to address expiration date awareness

### 5.4 Manager Workflow: Adding New Menu Item

**Scenario:** Haywire adds a new cocktail "Haywire Margarita" to the menu

1. Navigate to Catalog tab
2. Tap "Add New Item" button
3. Enter name: "Haywire Margarita"
4. Select category: "Liquor"
5. Toggle "Has Recipe" ✓
6. Add recipe ingredients:
   - 2 oz Tequila (links to inventory item)
   - 1 oz Triple Sec (links to inventory item)
   - 1 oz Lime Juice (links to inventory item)
7. Tap "Save Item"
8. Item now appears in waste logging search
9. When logged, all 3 ingredient items automatically update inventory

---

## 6. Non-Functional Requirements

### 6.1 Performance

- Waste entry submission: <2 seconds response time
- Page load time: <3 seconds on 3G connection
- Type-ahead search: <200ms latency
- CSV export: <5 seconds for 1000 entries

### 6.2 Usability

- Zero training time for staff
- Touch targets minimum 44x44px
- One-handed mobile operation
- Clear visual feedback for all actions
- Error messages in plain language

### 6.3 Reliability

- 99.5% uptime during service hours (5pm-2am)
- Data persistence guaranteed
- Automatic session recovery
- Graceful error handling

### 6.4 Security

- PIN-based authentication
- 30-minute session timeout
- Role-based access control (Manager vs Bartender)
- Audit trail for all entries
- Foreign key constraints prevent data corruption

### 6.5 Accessibility

- Semantic HTML
- Keyboard navigation support
- Clear visual hierarchy
- High contrast text
- Mobile-optimized tap targets

---

## 7. Constraints and Assumptions

### 7.1 Constraints

- Must work on staff personal mobile devices
- No native app installation (PWA only)
- Limited budget for infrastructure
- Single location deployment (Haywire Bar)
- No offline functionality required (WiFi available)

### 7.2 Assumptions

- All staff have smartphones
- Reliable WiFi available during service
- Staff will adopt PIN authentication
- ~250 inventory items sufficient for MVP
- Manual inventory counts still performed weekly

---

## 8. Success Metrics

### 8.1 Adoption Metrics

- **Target:** 100% of staff using system within 2 weeks
- **Measure:** Unique active users per week
- **Status:** ✅ 6/6 staff members onboarded

### 8.2 Efficiency Metrics

- **Target:** <30 seconds per waste entry
- **Measure:** Average time from FAB click to submission
- **Status:** ✅ Estimated 15-25 seconds (pending real-world data)

### 8.3 Data Quality Metrics

- **Target:** <5% entries missing attribution
- **Measure:** Percentage of entries with null attributed_to_user_id
- **Status:** ✅ Required field prevents missing data

### 8.4 Business Impact Metrics

- **Target:** 10% reduction in waste costs over 3 months
- **Measure:** Compare waste costs pre/post implementation
- **Status:** 📊 Baseline data collection in progress

### 8.5 Manager Satisfaction Metrics

- **Target:** 90% manager satisfaction score
- **Measure:** Post-implementation survey
- **Status:** 📊 Pending 30-day usage period

---

## 9. Future Enhancements (Post-MVP)

### 9.1 Phase 2 Features (Q2 2026)

**Analytics Dashboard**
- Visual waste trend charts (daily/weekly/monthly)
- Cost impact calculations
- Staff performance comparisons
- Category breakdown pie charts
- Top 10 most wasted items

**Advanced Filtering**
- Multi-select category filters
- Cost range filters
- Custom date range picker
- Saved filter presets

**Notifications**
- Daily waste summary emails to manager
- Threshold alerts (e.g., >$100 waste in single shift)
- Expiration date reminders

### 9.2 Phase 3 Features (Q3 2026)

**Predictive Analytics**
- Waste pattern predictions using historical data
- Suggested par levels based on waste trends
- Anomaly detection (unusual waste spikes)

**Inventory Integration**
- Real-time inventory levels
- Automated reorder suggestions
- Variance reporting (physical vs. system counts)

**Multi-Location Support**
- Support for multiple bar locations
- Cross-location reporting
- Centralized catalog management

### 9.3 Phase 4 Features (Q4 2026)

**Mobile App**
- Native iOS/Android apps
- Offline mode with sync
- Push notifications
- Camera integration for visual waste documentation

**Advanced User Management**
- Custom role permissions
- Shift scheduling integration
- Staff performance reviews

**Financial Integration**
- Direct cost calculation from supplier pricing
- P&L impact reporting
- Budget vs. actual variance

---

## 10. Risk Assessment

### 10.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database downtime during service | High | Low | Supabase 99.9% SLA, backup API server |
| Slow search performance with 250+ items | Medium | Low | Indexed search, client-side caching |
| Session timeout mid-entry | Low | Medium | Auto-save draft, session refresh |

### 10.2 Adoption Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Staff resistance to digital system | High | Low | <30s workflow, zero training needed |
| Forgetting PINs | Medium | Medium | Manager can reset PINs, paper backup list |
| Inconsistent usage during rushes | High | Medium | FAB always accessible, manager accountability |

### 10.3 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Insufficient ROI | High | Low | Low development cost, clear cost savings path |
| Data privacy concerns | Medium | Low | No PII collected, internal use only |
| Accuracy of backdated entries | Low | Medium | Notes field for context, audit trail |

---

## 11. Dependencies

### 11.1 External Dependencies

- Supabase platform availability
- Internet connectivity at bar location
- Staff smartphone availability
- Ongoing Supabase subscription

### 11.2 Internal Dependencies

- Manager time for catalog maintenance
- Weekly physical inventory counts for validation
- Staff commitment to logging all waste
- Management review of weekly reports

---

## 12. Release Plan

### 12.1 MVP Release (Complete ✅)

**Release Date:** February 23, 2026  
**Status:** Production Ready

**Included Features:**
- ✅ PIN authentication for 6 staff members
- ✅ Quick waste logging with FAB
- ✅ Type-ahead item search (~250 items)
- ✅ Decimal amount support
- ✅ User attribution system
- ✅ Date backdating
- ✅ Notes field
- ✅ Manager review interface
- ✅ CSV export
- ✅ Inventory catalog management
- ✅ Recipe/ingredient linking
- ✅ PostgreSQL database migration

### 12.2 Post-MVP Iterations

**v1.1 - March 2026**
- Basic analytics dashboard
- Improved filtering options
- Performance optimizations

**v1.2 - April 2026**
- Email notifications
- Cost calculations
- Enhanced mobile UX

**v2.0 - Q3 2026**
- Predictive analytics
- Multi-location support
- Advanced reporting

---

## 13. Appendices

### Appendix A: Complete Item List

**Current Inventory:** ~250 items across 5 categories
- Beer: Budweiser, Coors Light, Miller Lite, Blue Moon, Stella Artois, etc.
- Wine: Cabernet Sauvignon, Chardonnay, Pinot Noir, Merlot, etc.
- Liquor: Tequila, Vodka, Whiskey, Rum, Gin, Liqueurs, etc.
- Non-Alcoholic: Coca-Cola, Sprite, Ginger Beer, Tonic Water, etc.
- Food: Wings, Nachos, Burgers, Fries, etc.

### Appendix B: Staff Roster

| Name | Role | PIN | Scheduled Today |
|------|------|-----|-----------------|
| Brittany | Manager | 1234 | Yes |
| Davontae | Bartender | 2345 | Yes |
| Izzy | Bartender | 3456 | Yes |
| Sydney | Bartender | 4567 | Yes |
| Dylan | Bartender | 5678 | No |
| Dalton | Barback | 6789 | No |

### Appendix C: Waste Reasons Reference

1. Spilled/Dropped
2. Over-poured
3. Wrong Order
4. Quality Issue
5. Expired Product
6. Broken Glass/Bottle
7. Customer Return
8. Training/Practice
9. Spoiled/Bad Product
10. Other

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 23, 2026 | Haywire Bar Team | Initial PRD for MVP release |

---

**Approval Signatures:**

- **Product Owner:** _________________ Date: _______
- **Technical Lead:** _________________ Date: _______
- **Operations Manager:** _________________ Date: _______
