# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCS Online (门票自助打印系统) is a ticket self-service printing and management system built with Vue 3 and Quasar Framework. The application supports two main workflows:
1. **Self-service printing** - Users input ticket numbers to check-in and print badges
2. **Admin query** - Administrators search users and manually trigger printing

## Technology Stack

- **Frontend**: Vue 3 (Composition API), Quasar Framework v2
- **Build Tool**: Vite via @quasar/app-vite
- **HTTP Client**: Axios
- **Router**: Vue Router 4
- **Package Manager**: Yarn (recommended) or npm
- **Node Version**: ^20 || ^18 || ^16

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install
# or
yarn install

# Start development server (runs on http://localhost:9000)
npm run dev
# or
yarn dev

# Build for production
npm run build
# or
yarn build

# Lint code
npm run lint

# Format code
npm run format
```

### Testing Servers
```bash
# Start local print service (in separate terminal)
node test-print-server.js

# Start mock API server (for development without backend)
node mock-server.js
```

## Architecture and Code Structure

### Application Flow

The application follows a service-oriented architecture:
1. **Pages** (`src/pages/`) - UI components for user interactions
2. **Services** (`src/services/api.js`) - API abstraction layer with three service modules:
   - `userService` - User lookup and search operations
   - `printService` - Badge printing operations
   - `eventService` - Event configuration and field mappings
3. **Utils** (`src/utils/printUtils.js`) - Shared printing logic with field mapping and value conversion

### Key Architecture Patterns

#### 1. API Proxy Configuration
- **Development**: Uses `/api/v2` proxied to `https://iccad2025.mymova.com` (configured in `quasar.config.js:42-50`)
- **Production**: Direct API calls to backend domain
- **Local Print Service**: Direct connection to `http://localhost:6789` (bypasses proxy)

#### 2. Centralized Print Utilities
All printing operations must use `src/utils/printUtils.js`:
- `printBadge(userInfo, fieldList, eventData)` - Single user printing
- `printBadgeBatch(userList, fieldList, eventData)` - Batch printing
- `checkPrintServiceAvailable()` - Service health check

These utilities handle:
- Field value conversion (numeric indices to labels)
- Dynamic field mapping (Chinese/English)
- Print data normalization

**IMPORTANT**: Never implement print logic directly in components. Always use these shared utilities.

#### 3. Dynamic Field Configuration
The app fetches field configuration at runtime via `GetEventFields` API:
- `eventData` - Field name mappings (e.g., `{"name": "姓名", "cf_company": "公司"}`)
- `fieldList` - Field definitions with value options for conversion

This enables:
- Bilingual field display without code changes
- Dynamic custom fields (prefixed with `cf_*`)
- Value label conversion (e.g., `"1"` → `"VIP"`)

Field mapping has three-tier fallback: `eventData` → default mapping → original key

### Routing Structure

Routes are defined in `src/router/routes.js`:
- `/` → redirects to `/self-print`
- `/self-print` → `SelfPrintPage.vue` - User self-service interface
- `/admin-query` → `AdminQueryPage.vue` - Admin query interface
- `/:catchAll(.*)*` → `ErrorNotFound.vue` - 404 handler

### Critical API Integration Notes

#### Main API Endpoints

1. **GetEventFields** (GET `/GetEventFields`)
   - Fetches event field configuration
   - Returns `eventData` (field mappings) and `fieldList` (field definitions)
   - Call on component mount to initialize field configuration
   - Used for dynamic field display and value conversion

2. **AutoSignin** (GET `/AutoSignin?regcode={门票编号}`)
   - User auto check-in endpoint
   - **CRITICAL**: Uses GET method with query parameter `regcode`, not POST
   - Triggers sign-in status change
   - Returns complete user information
   - Used in self-print workflow

3. **AutoSearch** (GET `/AutoSearch`)
   - Paginated user search endpoint
   - Parameters: `sessionId`, `page` (0-based), `pageSize`, `name`, `regcode`, `email`, `mobile`
   - Returns: `{ success, code, data, total }`
   - Read-only operation (doesn't change user state)
   - Used in admin query workflow

4. **Print Service** (POST `http://localhost:6789/postname`)
   - Local print service endpoint
   - Expects complete user data with all fields
   - Bypasses API proxy (direct connection)
   - Requires print service to be running locally

#### Pagination Handling
The API uses **0-based pagination** while the UI uses **1-based pagination**. Always convert:
```javascript
// UI page 1 = API page 0
const apiPage = uiPage - 1
await userService.autoSearch({ page: apiPage, pageSize: 10 })
```

#### Print Service Integration
The local print service runs independently at `http://localhost:6789`:
- Endpoint: `POST /postname`
- Expects complete user data with all fields
- Print utilities automatically include field mappings and converted values

### Component Patterns

All Vue components should follow these patterns:

```javascript
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { userService, eventService } from 'src/services/api'
import { printBadge } from 'src/utils/printUtils'

export default {
  setup() {
    const $q = useQuasar()

    // State management
    const userData = ref(null)
    const fieldList = ref([])
    const eventData = ref({})

    // Fetch field config on mount
    onMounted(async () => {
      try {
        const response = await eventService.getEventFields()
        fieldList.value = response.data.fieldList
        eventData.value = response.data.eventData
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: '获取字段配置失败',
          position: 'top'
        })
      }
    })

    // Example: Print operation
    const handlePrint = async () => {
      $q.loading.show({ message: '正在打印...' })
      try {
        await printBadge(userData.value, fieldList.value, eventData.value)
        $q.notify({
          type: 'positive',
          message: '打印成功',
          position: 'top'
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: `打印失败: ${error.message}`,
          position: 'top'
        })
      } finally {
        $q.loading.hide()
      }
    }

    return { userData, handlePrint }
  }
}
```

### Important Implementation Details

#### 1. Ticket Number Format
- Format: `dddd-dddd-dddd` (12 digits with dashes)
- Auto-formatting: Dashes automatically inserted after 4th and 9th characters
- Validation: Must be complete before submission

#### 2. Admin Query Features
- **Auto-query on complete ticket number**: When a full ticket number is entered, automatically triggers search
- **Enter key support**: All input fields support Enter key to trigger search
- **Empty value filtering**: Detail dialogs hide fields with null/undefined/empty values
- **Batch operations**: Support for bulk check-in and printing

#### 3. Keyboard Input Support
The self-print page supports both:
- Virtual 9-grid numeric keypad (on-screen)
- Physical keyboard input (including barcode scanners)

Global keyboard listener is registered in `src/layouts/MainLayout.vue` to capture scanner input.

## Configuration Files

### quasar.config.js
Key configuration points:
- `devServer.port: 9000` - Development server port
- `devServer.proxy['/api']` - API proxy to backend
- `build.publicPath: './'` - Relative paths for flexible deployment
- `framework.plugins` - Quasar plugins: Notify, Dialog, Loading

### src/boot/axios.js
- Creates axios instance with `baseURL: '/api/v2'`
- Exported as `api` for use in services

## Development Workflow

### Adding New API Endpoints
1. Add method to appropriate service in `src/services/api.js`
2. Add JSDoc comments for parameters and return types
3. Use the `api` instance from axios boot file

Example:
```javascript
/**
 * 查询用户信息
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回用户数据
 */
async search(params) {
  return await api.get('/users/search', { params })
}
```

### Adding New Pages
1. Create Vue component in `src/pages/`
2. Use Composition API with `setup()`
3. Add route in `src/router/routes.js`
4. Import necessary Quasar components

### Modifying Print Logic
**Only modify** `src/utils/printUtils.js`. All pages using print functionality will automatically inherit changes.

### Adding Query Conditions (Admin Query Page)
1. Add field to `queryForm` ref object
2. Add input field in template with `@keyup.enter="handleSearch"`
3. Pass parameter to `userService.autoSearch()`
4. Ensure empty values are filtered before API call

### Modifying Field Display Names
- Modify `eventData` returned by backend's `GetEventFields` API
- Frontend code requires no changes - field names update automatically
- This is a key feature of the dynamic field mapping system

### Adding New Table Columns
1. Add column definition to `tableColumns` array
2. Add custom slot template if special rendering is needed

### Common Code Examples

#### Making API Calls
```javascript
import { api } from 'boot/axios'

// GET request with parameters
const response = await api.get('/AutoSearch', {
  params: { page: 0, pageSize: 10, name: '张三' }
})

// GET request with path parameter
const response = await api.get(`/AutoSignin?regcode=1234-5678-9012`)
```

#### Using Print Utilities
```javascript
import { printBadge } from 'src/utils/printUtils'

// Print single badge
await printBadge(userInfo, fieldList, eventData)
```

#### Displaying Notifications
```javascript
// Success notification
$q.notify({
  type: 'positive',  // positive/negative/warning/info
  message: '操作成功！',
  position: 'top'
})

// Error notification
$q.notify({
  type: 'negative',
  message: `操作失败: ${error.message}`,
  position: 'top'
})
```

#### Showing Loading State
```javascript
$q.loading.show({ message: '正在加载...' })
try {
  // async operation
  await someAsyncOperation()
} finally {
  $q.loading.hide()
}
```

## Code Style and Conventions

### Naming Conventions
- Components: PascalCase (e.g., `AdminQueryPage.vue`)
- Functions: camelCase (e.g., `searchUser`, `printBadge`)
- Constants: UPPER_SNAKE_CASE (if used)
- Props/variables: camelCase

### Vue Composition API
- Always use `setup()` function
- Use `ref` for reactive primitives
- Use `computed` for derived state
- Use `onMounted`, `onUnmounted` lifecycle hooks

### Error Handling
Always wrap async operations:
```javascript
try {
  $q.loading.show()
  // async operation
} catch (error) {
  $q.notify({ type: 'negative', message: error.message })
} finally {
  $q.loading.hide()
}
```

### User Feedback
- Use `$q.loading` for async operations
- Use `$q.notify` for results/errors
- Use `$q.dialog` for confirmations

### Styling Guidelines
- Prioritize Quasar components and utility classes
- Use scoped styles to avoid global pollution
- Follow Material Design principles
- Keep component styles minimal and focused

## Debugging Tips

When troubleshooting issues:
1. **Check browser console** - Look for error messages and warnings
2. **Use Vue DevTools** - Inspect component state, props, and events
3. **Check Network panel** - Verify API requests and responses
4. **Inspect field configuration** - Log `eventData` and `fieldList` values
5. **Test print service** - Ensure `http://localhost:6789` is running and accessible
6. **Verify pagination** - Confirm UI (1-based) ↔ API (0-based) conversion
7. **Check field mappings** - Verify three-tier fallback is working correctly

## Documentation

Comprehensive documentation is organized in `docs/`:
- `docs/guide/` - Setup and usage guides
- `docs/features/` - Core feature documentation
- `docs/quick-reference/` - Quick reference cards
- `docs/bugfix/` - Bug fix records
- `docs/testing/` - Test documentation

### Documentation Generation Principles ⚠️

**Minimization Principle**: Only create documentation when absolutely necessary to avoid documentation bloat.

#### MUST Create Documentation For:
1. **Core features** - Features that impact user workflows
2. **Architecture changes** - Changes affecting project structure or tech stack
3. **Complex bug fixes** - Bugs requiring detailed explanation of cause and solution
4. **API interface changes** - New or modified external API endpoints
5. **Major refactoring** - Refactoring affecting multiple modules

#### DO NOT Create Documentation For:
1. **Minor code adjustments** - Style tweaks, text changes, small optimizations
2. **Simple bug fixes** - Self-evident fixes (typos, simple logic errors)
3. **Dependency updates** - Routine package version updates
4. **Internal refactoring** - Code optimization not affecting functionality
5. **UI tweaks** - Interface adjustments not changing functionality
6. **Comment updates** - Adding or improving code comments

#### Documentation Update Strategy:
- **Prioritize updating existing docs** over creating new ones
- Document small changes in code comments only
- Use Git commit messages for routine changes
- Only create standalone docs for significant changes

See `.cursorrules` for detailed documentation standards and templates.

## Important Notes

### API Compatibility
- **Pagination**: UI (1-based) ↔ API (0-based) conversion required
- **Ticket number field**: `regcode` in API, may be `ticketNumber` in UI
- **Field mappings**: Always use `eventData` and `fieldList` from `GetEventFields`
- **Ticket auto-query**: Entering complete ticket number clears other query conditions
- **AutoSignin**: Uses GET with query parameter, not POST with body

### Print Service Requirements
- Must be running on `http://localhost:6789`
- Requires complete user data including field mappings
- Uses centralized `printUtils.js` functions
- **NEVER implement print logic in components** - always use shared utilities

### Field Mapping System
Three-tier resolution:
1. Check `eventData` for custom mapping
2. Fall back to component's default mapping
3. Use original field key as last resort

This allows backend-controlled field names without frontend code changes.

### State Management Best Practices
- Use `ref` for reactive primitive values
- Use `computed` for derived state
- Never directly modify props
- Keep component state minimal and focused

### User Experience Requirements
- **All async operations** must show loading indicator
- **All operations** must provide notify feedback (success/error)
- **Form validation** must provide clear error messages
- **Keyboard shortcuts** should be supported (Enter key for search)
- **Empty values** should be filtered in detail dialogs
- **Auto-query** should trigger on complete ticket number input

### Special Features to Maintain

#### 1. Ticket Number Auto-Query (AdminQueryPage)
- Automatically triggers search when complete ticket format is entered
- Selects input content after query completes
- Optimized for batch check-in scenarios

#### 2. Enter Key Support
- All input fields support Enter key to trigger search
- Must validate query conditions before triggering
- Improves operational efficiency

#### 3. Empty Value Filtering
- Detail dialogs automatically hide null/undefined/empty values
- Important status fields (signed, printed) are always shown
- Keeps UI clean and focused

#### 4. Dynamic Field Mapping
- Supports Chinese/English bilingual display
- Supports custom fields with `cf_*` prefix
- Three-tier fallback mechanism ensures robustness

#### 5. Global Keyboard Listener
- Registered in `MainLayout.vue`
- Captures barcode scanner input
- Routes input to appropriate components

### Browser Support
- Chrome >= 87
- Firefox >= 78
- Safari >= 13.1
- Edge >= 88

## Development Principles

When working on this codebase, follow these principles:

1. **Response Language**: Always respond in **Chinese (中文)**
2. **Code Quality**: Maintain existing code style and conventions
3. **Testing**: Check for linter errors after code modifications
4. **Documentation Minimization**: Only create docs for core features, major changes, or complex bugs
5. **Documentation Updates**: Prioritize updating existing docs over creating new ones
6. **User Experience**: Prioritize smooth user operations and workflows
7. **Compatibility**: Maintain compatibility with existing features
8. **Error Handling**: Add appropriate try-catch blocks and user feedback
9. **Documentation Standards**: Strictly follow documentation templates when creating/updating docs
