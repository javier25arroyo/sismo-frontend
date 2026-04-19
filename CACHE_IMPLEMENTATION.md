# HTTP Caching Implementation

## Overview
Added HTTP caching headers to optimize performance by reducing redundant requests and leveraging browser cache for read-only endpoints.

## Implementation Details

### 1. JWT Interceptor (`src/app/interceptors/jwt.interceptor.ts`)
- Added `getCacheControl()` method that determines cache strategy per endpoint
- **Mutations (POST/PUT/DELETE/PATCH)**: No caching (returns null)
- **Static data (sismos, estaciones, centros, criterios, parametro-intensidad)**: `max-age=600, public` (10 minutes)
- **Other GET requests**: `max-age=300, public` (5 minutes)
- Cache headers automatically added to all HttpClient requests

### 2. API Service (`src/app/services/api.service.ts`)
- Added `getCacheControl()` method with same caching logic for fetch-based requests
- Cache-Control headers added to all fetch GET requests
- Mutations (POST/PUT/DELETE) are NOT cached as per HTTP best practices

## Cached Endpoints

### Aggressive Cache (10 minutes)
```
/api/sismos/ultimo        - Latest earthquake summaries
/api/sismos               - Full earthquake list
/api/estaciones           - Station data
/api/centros              - Centers/locations
/api/criterios            - Criteria data
/api/parametro-intensidad - Intensity parameters
```

### Medium Cache (5 minutes)
- All other GET endpoints by default

### No Cache
- POST requests (create operations)
- PUT requests (update operations)
- DELETE requests (delete operations)
- PATCH requests (partial updates)

## How It Works

1. **Browser Cache**: When a GET request is made, browser stores the response with cache headers
2. **Revalidation**: On subsequent requests, browser checks `Cache-Control: max-age` expiration
3. **304 Not Modified**: After cache expiration, browser sends If-Modified-Since header; server responds with 304 if unchanged
4. **Fresh Responses**: If time hasn't elapsed, browser serves response from cache without hitting server

## Security Considerations

✅ **What IS cached**:
- Public earthquake data (sismos, estaciones)
- Static configuration data (criterios, parametro-intensidad)
- Non-sensitive GET responses

❌ **What is NOT cached**:
- Auth tokens (handled by AuthService, not cached)
- User profile/personal data (if added to sensitive list)
- Mutations (POST/PUT/DELETE) - never cached

## Performance Impact

Expected improvements:
- Reduced redundant requests during user navigation
- Faster page loads for repeat visits to same data
- Lower server load
- Reduced bandwidth usage

## Build Status

✅ Build verified successfully without errors:
```
npm run build
✔ Application bundle generation complete [4.338 seconds]
```

## Files Modified

1. `src/app/interceptors/jwt.interceptor.ts` - Added cache logic for HttpClient requests
2. `src/app/services/api.service.ts` - Added cache logic for fetch-based requests

## Testing

Test in browser DevTools (Network tab):
- Make a GET request to cached endpoint
- Observe first response has full data
- Refresh or navigate back to same page
- Second request shows 304 Not Modified (served from cache)
- After cache expiration (300s or 600s), fresh request is sent

## Future Enhancements

1. Add selective cache invalidation (clear cache on login/logout)
2. Implement cache busting headers for critical updates
3. Consider service worker for offline support
4. Monitor cache hits/misses using browser Analytics
