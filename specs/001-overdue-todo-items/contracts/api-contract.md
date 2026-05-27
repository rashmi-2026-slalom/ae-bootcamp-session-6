# API Contract: Overdue Todo Items

**Feature**: 001-overdue-todo-items  
**Date**: 2026-05-27  
**Version**: 1.0.0  
**Status**: Draft

## Overview

This document defines the API contract for the overdue todo items feature. The contract specifies how the backend exposes overdue status information and guarantees behavior consistency for frontend clients.

---

## Endpoints

### 1. GET /api/todos

**Description**: Retrieves all todos with computed `isOverdue` field.

#### Request

**Method**: `GET`  
**Path**: `/api/todos`  
**Headers**: 
```
Content-Type: application/json
```

**Query Parameters**: None (for this feature; existing filtering may apply)

**Request Body**: None

#### Response

**Status Code**: `200 OK`

**Response Body** (Array of Todo objects):
```json
[
  {
    "id": 1,
    "title": "Submit quarterly report",
    "dueDate": "2026-05-26",
    "completed": false,
    "createdAt": "2026-05-20T10:30:00.000Z",
    "isOverdue": true
  },
  {
    "id": 2,
    "title": "Review pull requests",
    "dueDate": "2026-05-27",
    "completed": false,
    "createdAt": "2026-05-26T14:15:00.000Z",
    "isOverdue": false
  },
  {
    "id": 3,
    "title": "Update documentation",
    "dueDate": null,
    "completed": false,
    "createdAt": "2026-05-25T09:00:00.000Z",
    "isOverdue": false
  },
  {
    "id": 4,
    "title": "Fix production bug",
    "dueDate": "2026-05-25",
    "completed": true,
    "createdAt": "2026-05-24T16:45:00.000Z",
    "isOverdue": false
  }
]
```

**Enhanced Todo Object Schema**:
```typescript
interface Todo {
  id: number;              // Unique identifier
  title: string;           // Todo title (max 255 chars)
  dueDate: string | null;  // ISO 8601 date string or null
  completed: boolean;      // Completion status
  createdAt: string;       // ISO 8601 timestamp
  isOverdue: boolean;      // NEW: Computed overdue status
}
```

#### Behavioral Contract for `isOverdue`

The `isOverdue` field **MUST** satisfy the following contract:

| Condition | `isOverdue` Value | Example |
|-----------|-------------------|---------|
| `completed === true` | `false` | Completed todo with past due date → not overdue |
| `dueDate === null` | `false` | Todo without due date → cannot be overdue |
| `dueDate` (date-only) < today (date-only) AND `completed === false` | `true` | Incomplete todo with past due date → overdue |
| `dueDate` (date-only) >= today (date-only) | `false` | Todo due today or in future → not overdue |

**Date-Only Comparison Rule**:
- Both `dueDate` and current date **MUST** be normalized to midnight (00:00:00) before comparison
- Time components **MUST** be ignored
- Example: Due date "2026-05-27T23:59:59" compared on "2026-05-28T00:00:01" → overdue

**Timezone Handling**:
- Server uses its local timezone (or UTC) consistently
- Frontend interprets dates in local timezone
- **Contract**: As long as date-only comparison is used, timezone differences do not affect overdue determination for same-calendar-day comparisons

#### Error Responses

| Status Code | Condition | Response Body |
|-------------|-----------|---------------|
| `500 Internal Server Error` | Database query fails | `{ "error": "Failed to fetch todos: <error message>" }` |

---

### 2. GET /api/todos/:id

**Description**: Retrieves a single todo by ID with computed `isOverdue` field.

#### Request

**Method**: `GET`  
**Path**: `/api/todos/:id`  
**Path Parameters**:
- `id` (integer): Todo ID

#### Response

**Status Code**: `200 OK`

**Response Body** (Single Todo object):
```json
{
  "id": 1,
  "title": "Submit quarterly report",
  "dueDate": "2026-05-26",
  "completed": false,
  "createdAt": "2026-05-20T10:30:00.000Z",
  "isOverdue": true
}
```

**Behavioral Contract**: Same as GET /api/todos (see above)

#### Error Responses

| Status Code | Condition | Response Body |
|-------------|-----------|---------------|
| `404 Not Found` | Todo with given ID does not exist | `{ "error": "Todo not found" }` |
| `400 Bad Request` | Invalid ID format (non-numeric) | `{ "error": "Valid todo ID is required" }` |
| `500 Internal Server Error` | Database query fails | `{ "error": "Failed to fetch todo: <error message>" }` |

---

### 3. POST /api/todos

**Description**: Creates a new todo. The response includes the computed `isOverdue` field.

#### Request

**Method**: `POST`  
**Path**: `/api/todos`  
**Headers**: 
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Submit quarterly report",
  "dueDate": "2026-05-26"  // Optional, can be null or omitted
}
```

#### Response

**Status Code**: `201 Created`

**Response Body** (Created Todo object):
```json
{
  "id": 1,
  "title": "Submit quarterly report",
  "dueDate": "2026-05-26",
  "completed": false,
  "createdAt": "2026-05-27T10:30:00.000Z",
  "isOverdue": true
}
```

**Behavioral Contract**: `isOverdue` computed using the same rules as GET endpoints

#### Error Responses

| Status Code | Condition | Response Body |
|-------------|-----------|---------------|
| `400 Bad Request` | Missing or empty title | `{ "error": "Todo title is required" }` |
| `400 Bad Request` | Title exceeds 255 characters | `{ "error": "Todo title must not exceed 255 characters" }` |
| `500 Internal Server Error` | Database insert fails | `{ "error": "Failed to create todo: <error message>" }` |

---

### 4. PUT /api/todos/:id

**Description**: Updates a todo's title and/or due date. The response includes the recomputed `isOverdue` field.

#### Request

**Method**: `PUT`  
**Path**: `/api/todos/:id`  
**Path Parameters**:
- `id` (integer): Todo ID

**Headers**: 
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Submit updated quarterly report",  // Optional
  "dueDate": "2026-05-30"                      // Optional
}
```

#### Response

**Status Code**: `200 OK`

**Response Body** (Updated Todo object):
```json
{
  "id": 1,
  "title": "Submit updated quarterly report",
  "dueDate": "2026-05-30",
  "completed": false,
  "createdAt": "2026-05-20T10:30:00.000Z",
  "isOverdue": false
}
```

**Behavioral Contract**: 
- `isOverdue` **MUST** be recomputed based on the updated `dueDate`
- If `dueDate` is changed from past to future, `isOverdue` changes from `true` to `false`
- If `dueDate` is changed from future to past, `isOverdue` changes from `false` to `true`

#### Error Responses

| Status Code | Condition | Response Body |
|-------------|-----------|---------------|
| `404 Not Found` | Todo with given ID does not exist | `{ "error": "Todo not found" }` |
| `400 Bad Request` | Invalid ID format or validation error | `{ "error": "<specific validation error>" }` |
| `500 Internal Server Error` | Database update fails | `{ "error": "Failed to update todo: <error message>" }` |

---

### 5. PATCH /api/todos/:id/toggle

**Description**: Toggles a todo's completion status. The response includes the `isOverdue` field (which becomes `false` when completed).

#### Request

**Method**: `PATCH`  
**Path**: `/api/todos/:id/toggle`  
**Path Parameters**:
- `id` (integer): Todo ID

#### Response

**Status Code**: `200 OK`

**Response Body** (Updated Todo object):
```json
{
  "id": 1,
  "title": "Submit quarterly report",
  "dueDate": "2026-05-26",
  "completed": true,
  "createdAt": "2026-05-20T10:30:00.000Z",
  "isOverdue": false
}
```

**Behavioral Contract**: 
- If `completed` changes to `true`, `isOverdue` **MUST** return `false` (completed status takes precedence)
- If `completed` changes to `false`, `isOverdue` **MUST** be recomputed based on current date vs. `dueDate`

---

## Guarantees & Invariants

### 1. Consistency Guarantee
- The `isOverdue` field **MUST** always reflect the correct overdue status based on the current server date/time at the moment of the API response
- Multiple requests to the same endpoint with the same todo **MAY** return different `isOverdue` values if the current date crosses a due date boundary

### 2. Completed Status Precedence
- Completed todos **MUST** always have `isOverdue = false` in API responses, regardless of due date

### 3. Null Safety
- Todos with `dueDate = null` **MUST** always have `isOverdue = false`

### 4. Date-Only Comparison
- Time components in `dueDate` **MUST** be ignored for overdue determination
- Example: "2026-05-27T23:59:59" and "2026-05-27T00:00:00" are treated as the same date

### 5. Backward Compatibility
- Adding `isOverdue` field is non-breaking (new field in existing response schema)
- Existing clients that don't use `isOverdue` continue to function without changes

---

## Frontend-Backend Contract

### Frontend Responsibilities
1. **Display overdue styling** when `isOverdue === true`
2. **Handle missing `isOverdue` field** (optional fallback to client-side computation if backend doesn't provide it)
3. **Real-time updates**: Refetch todos when due dates are modified to get updated `isOverdue` value

### Backend Responsibilities
1. **Compute `isOverdue`** for all todo responses (GET, POST, PUT, PATCH)
2. **Use consistent date-only comparison** logic across all endpoints
3. **Respect completed status precedence** (completed todos always have `isOverdue = false`)

---

## Testing Contract

### Backend Tests
- **Unit tests**: Verify `isOverdue` computation for all edge cases (null, past, present, future, completed)
- **Integration tests**: Verify API responses include correct `isOverdue` values

### Frontend Tests
- **Mocking**: Frontend tests mock API responses with `isOverdue` field
- **Contract validation**: Frontend validates that `isOverdue` is a boolean

---

## Versioning

**Current Version**: 1.0.0  
**Breaking Changes**: None (additive change only)  
**Deprecation Notice**: None

---

## References

- Feature Specification: [spec.md](../spec.md)
- Data Model: [data-model.md](../data-model.md)
- Research Document: [research.md](../research.md)
