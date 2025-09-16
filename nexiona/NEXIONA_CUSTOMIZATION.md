# Nexiona Customizations for Grafana

This document describes all customizations made to the Grafana source code for Nexiona's deployment.

## Overview

The following customizations have been applied to personalize Grafana's UI for Comforsa/Nexiona branding and to modify user experience based on role permissions.

## 1. Logo Replacements

### Files Added
- `/public/img/custom/comforsa_logo.svg` - Comforsa company logo (copied from `/docker-data/oriol/comforsa.svg`)
- `/public/img/custom/heart-solid.svg` - Heart icon for footer

### Logo Changes

#### Login Page Logo
**File:** `/public/app/core/components/Branding/Branding.tsx`
- Modified `LoginLogo` component to display Comforsa logo instead of default Grafana logo
- Changed from returning `null` to returning `<img src="public/img/custom/comforsa_logo.svg" alt="Comforsa" />`

#### Sidebar Menu Logo
**File:** `/public/app/core/components/Branding/Branding.tsx`
- Modified `MenuLogo` component to display Comforsa logo
- Changed from `src="public/img/grafana_icon.svg"` to `src="public/img/custom/comforsa_logo.svg"`
- Updated alt text from "Grafana" to "Comforsa"

#### Loading Animation Logo (Route Changes)
**File:** `/public/app/core/components/BouncingLoader/BouncingLoader.tsx`
- Replaced Grafana icon in loading animation with Comforsa logo
- Changed from `src="public/img/grafana_icon.svg"` to `src="public/img/custom/comforsa_logo.svg"`

#### Initial Page Load Logo
**File:** `/pkg/api/index.go`
- Modified the initial loading screen logo (shown before React app loads)
- Changed `LoadingLogo` from `"public/img/grafana_icon.svg"` to `"public/img/custom/comforsa_logo.svg"`

#### Application Titles
**File:** `/public/app/core/components/Branding/Branding.tsx`
- Changed `AppTitle` from 'Grafana' to 'Comforsa Webforms'
- Changed `LoginTitle` from 'Welcome to Grafana' to 'Comforsa Webforms'

## 2. Login Page Customizations

### Background Design
**File:** `/public/app/core/components/Branding/Branding.tsx`
- Replaced default Grafana login background with custom white/red gradient theme
- Light theme: Gradient from white to soft red tones (#ffffff → #ffd0d0)
- Dark theme: Subtle dark gradient with red accents
- Added radial gradient overlays for depth and visual interest

### Footer Customization
**File:** `/public/app/core/components/Footer/Footer.tsx`
- Modified footer text from "Made with love by Nexiona" to include heart SVG icon
- Added inline heart icon: `<img src="public/img/custom/heart-solid.svg" alt="love" />`
- Added styles for heart icon:
  - 14x14px size
  - Red color using CSS filter
  - Proper vertical alignment with text

## 3. Navigation and UI Modifications

### Hide Panel Menu (Three Dots) for Non-Admin Users
Grafana has two dashboard rendering systems that required separate implementations:

**1. Classic Dashboard System**
**File:** `/public/app/features/dashboard/containers/DashboardPage.tsx`
- Added `hidePanelMenus` prop to DashboardGrid component
- Set to `true` for non-admin users: `hidePanelMenus={!contextSrv.hasRole('Admin')}`
- Imported `contextSrv` for role checking

**2. Dashboard Scenes System (New System)**
**File:** `/public/app/features/dashboard-scene/scene/PanelMenuBehavior.tsx`
- Added admin role check at the beginning of `panelMenuBehavior` function
- Sets empty menu items for non-admin users: `menu.setState({ items: [] })`
- This effectively hides the menu as empty menus are not rendered

**Result:** The three-dot menu (with options like View, Share, Inspect, etc.) is hidden on all visualization panels for non-admin users in both dashboard systems

### Hide Navigation Toolbar for Non-Admin Users
**Files Modified:**
1. `/public/app/core/components/AppChrome/TopBar/SingleTopBar.tsx`
   - Added role-based visibility for main navigation toolbar
   - Imported `contextSrv` to check user roles
   - Added `isAdmin` check: `const isAdmin = contextSrv.hasRole('Admin');`
   - Conditionally render full navigation toolbar only for admin users
   - Non-admin users only see sign-in link and profile button

2. `/public/app/core/components/AppChrome/TopBar/SingleTopBarActions.tsx`
   - Added admin role check for dashboard-level toolbar actions
   - Imported `contextSrv` for role checking
   - Returns `null` for non-admin users, hiding the entire actions toolbar

**Hidden elements for non-admin users:**
- Breadcrumbs navigation
- Search bar (TopSearchBarCommandPaletteTrigger)
- History container
- Quick Add button
- Help menu
- Extension sidebar items
- Dashboard actions toolbar (shown on dashboard views)

### Remove "Latest from blog" Menu Item
**File:** `/public/app/core/components/AppChrome/TopBar/ProfileButton.tsx`
- Removed the RSS/Blog menu item from user profile dropdown
- Deleted the conditional block that rendered "Latest from the blog"
- Removed unused imports: `NewsContainer` from '../News/NewsDrawer'
- Removed state management for news drawer: `showNewsDrawer` and `onToggleShowNewsDrawer`
- Cleaned up the news drawer rendering logic

## 4. Technical Implementation Details

### Directory Structure
All custom assets are stored in:
```
/public/img/custom/
├── comforsa_logo.svg
└── heart-solid.svg
```

### CSS-in-JS Modifications
- Used Emotion CSS-in-JS for styling customizations
- Maintained consistency with Grafana's existing theming system
- All custom styles support both light and dark themes

### Component Architecture
- Modified existing components rather than creating new ones
- Preserved Grafana's component hierarchy and patterns
- Maintained TypeScript type safety throughout changes

## 5. Summary of Modified Files

1. **Branding Components**
   - `/public/app/core/components/Branding/Branding.tsx`
   - `/public/app/core/components/BouncingLoader/BouncingLoader.tsx`
   - `/pkg/api/index.go` (for initial page load logo)

2. **Footer**
   - `/public/app/core/components/Footer/Footer.tsx`

3. **Navigation**
   - `/public/app/core/components/AppChrome/TopBar/SingleTopBar.tsx`
   - `/public/app/core/components/AppChrome/TopBar/SingleTopBarActions.tsx`
   - `/public/app/core/components/AppChrome/TopBar/ProfileButton.tsx`
   - `/public/app/features/dashboard/containers/DashboardPage.tsx`
   - `/public/app/features/dashboard-scene/scene/PanelMenuBehavior.tsx`

## 6. Deployment Notes

### Build Requirements
- Ensure custom SVG files are copied to `/public/img/custom/` before building
- No additional build configuration changes required
- All customizations are integrated into the standard Grafana build process

### Maintenance Considerations
- When upgrading Grafana, review these customizations for compatibility
- Custom logo files must be preserved during upgrades
- Role-based UI hiding may need adjustment if Grafana's permission system changes

### Testing Checklist
- [x] Verify login background shows white/red gradient
- [x] Verify heart icon appears red in footer
- [x] Verify Comforsa logo appears on login page
- [x] Verify Comforsa logo appears in sidebar menu toggle
- [x] Test with admin user - full navigation toolbar visible
- [ ] Test with non-admin user - limited navigation (only profile button)
- [x] Verify "Latest from blog" is removed from profile menu
- [x] Test in both light and dark themes

## 7. Rollback Instructions

To revert these customizations:
1. Restore original versions of all modified files from Grafana source
2. Remove `/public/img/custom/` directory and its contents
3. Rebuild Grafana

---

**Last Updated:** 2025-07-17
**Customization Version:** 1.0
**Base Grafana Version:** 12.0.2
