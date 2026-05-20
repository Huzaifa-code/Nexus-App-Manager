# Changelog

All notable changes to **Nexus App Manager** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2026-05-20

### Added
- **Storage Usage Dashboard**: Integrated a new "Usage" feature displaying an interactive pie chart (using Recharts) for disk space usage categorized by installation source (APT, Snap, Flatpak) and free space.
- **Backend Storage Metrics**: Added Rust backend computations to calculate the total disk space utilized by each package manager.
- **App Update Functionality**: Implemented a comprehensive app update checker and update runner for Snap, APT, and Flatpak packages.
- **Custom Modals & Toasts**: Introduced custom branded modals and toast notifications to replace system popups, enhancing UI/UX consistency.
- **Centralized Loader**: Created a reusable `Loader` component accepting size and message props for consistent loading states across screens.

### Changed
- **Usage Screen Refactoring**: Replaced the inline/hardcoded loader in the storage usage screen with the centralized `Loader` component.

---

## [0.5.0] - 2026-05-13

### Added
- **Infinite Scroll Pagination**: Implemented an intersection observer-based infinite scroll (`usePagination` hook) loading 50 items per page.
- **Global Search**: Added unified search functionality running parallel asynchronous queries across APT, Snap, and Flatpak packages.
- **Window Constraints**: Added minimum width (800px) and height (600px) constraints to maintain layout and UI responsiveness.

### Changed
- **Performance Optimizations**: Optimized package manager listing commands (using `.desktop` checks for APT and system snap filtering) to deliver up to 10,000x faster load times.

---

## [0.4.0] - 2026-05-06

### Added
- **SQLite Caching Layer**: Implemented a caching mechanism using an SQLite database (`cache.db`) with a 1-hour TTL to bypass expensive shell commands on subsequent loads.

---

## [0.3.0] - 2026-04-29

### Added
- **Installation/Uninstallation Operations**: Integrated command executors for package manager-specific install and uninstall operations.

---

## [0.2.0] - 2026-04-22

### Added
- **Multi-Manager Support**: Expanded the listing capabilities to display Snap and Flatpak applications along with system APT packages.
- **Sidebar Navigation**: Added a sidebar navigation component for seamless tab switching.

---

## [0.1.0] - 2026-04-15

### Added
- **Initial Release**: Basic GUI layout displaying installed APT applications and search interface.
