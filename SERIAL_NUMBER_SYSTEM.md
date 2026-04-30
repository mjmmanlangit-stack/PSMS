# Serial Number System Documentation

## Overview

The Parish Stewardship Management System (PSMS) implements a robust serial number generation and management system that automatically assigns unique, consistent identifiers to each parishioner record.

---

## Serial Number Format

**Format:** `PSMS-0001`, `PSMS-0002`, `PSMS-0003`, etc.

- **Prefix:** `PSMS` (Parish Stewardship Management System)
- **Separator:** `-` (hyphen)
- **Counter:** 4-digit zero-padded number (0001 to 9999)

---

## Implementation

The system uses localStorage to persist a counter that increments with each new parishioner:

- **Storage Key:** `psms_serial_counter`
- **Parishioner Field:** `serialNumber`
- **Format:** `PSMS-[4-digit number]`

Each parishioner record includes:
```javascript
{
    id: 1234567890,
    serialNumber: "PSMS-0001",  // Auto-generated
    name: "John Doe",
    barangay: "Barangay 1",
    street: "Main Street",
    contact: "09123456789",
    notes: "Active member",
    dateAdded: "2026-04-30T10:30:00.000Z"
}
```

---

## Key Functions

- `getSerialCounter()` - Get current counter value
- `incrementSerialCounter()` - Increment and save counter
- `formatSerialNumber(num)` - Format counter to serial
- `generateSerialNumber()` - Generate new unique serial
- `serialNumberExists(serial)` - Check for duplicates
- `initializeSerialCounter()` - Initialize on app load

---

## Duplicate Prevention

Triple-layer safeguard:
1. **Incremental Counter** - Each serial increments exactly once
2. **Persistent Storage** - Counter saved in localStorage
3. **Initialization Check** - Scans existing parishioners on startup

For full documentation, see the source code comments in `assets/js/script.js`.
