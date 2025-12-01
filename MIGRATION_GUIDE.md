# Migration Guide: Supabase to Firebase

This guide will help you migrate your data from Supabase to Firebase Firestore.

## Prerequisites

1. Firebase project created at [Firebase Console](https://console.firebase.google.com/)
2. Firestore database enabled in your Firebase project
3. Your Firebase configuration credentials

## Step 1: Set Up Firebase Collections

In Firebase Console, create the following Firestore collections:

- `clients`
- `scenarios`
- `simulation_runs`
- `final_prompt_suggestions`

## Step 2: Export Data from Supabase

### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Table Editor
3. For each table, export the data as JSON:
   - `clients`
   - `scenarios`
   - `simulation_runs`
   - `final_prompt_suggestions`

### Option B: Using SQL

Run these queries in Supabase SQL Editor and export results:

```sql
-- Export clients
SELECT * FROM clients;

-- Export scenarios
SELECT * FROM scenarios;

-- Export simulation_runs
SELECT * FROM simulation_runs;

-- Export final_prompt_suggestions
SELECT * FROM final_prompt_suggestions;
```

## Step 3: Import Data to Firebase

### Using Firebase Console

1. Go to Firebase Console → Firestore Database
2. For each collection:
   - Click "Start collection" or select existing collection
   - Click "Add document"
   - Use the document ID from Supabase (the `id` field)
   - Add all fields from the exported JSON
   - **Important:** Convert date strings to Firestore Timestamp format

### Using a Migration Script

You can create a Node.js script to migrate data:

```javascript
const admin = require('firebase-admin');
const supabaseData = require('./supabase-export.json');

// Initialize Firebase Admin
const serviceAccount = require('./path-to-service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Migrate clients
async function migrateClients() {
  const clients = supabaseData.clients;
  for (const client of clients) {
    await db.collection('clients').doc(client.id).set({
      ...client,
      created_at: admin.firestore.Timestamp.fromDate(new Date(client.created_at)),
      updated_at: admin.firestore.Timestamp.fromDate(new Date(client.updated_at))
    });
  }
}

// Similar functions for other collections...
```

## Step 4: Data Type Conversions

### Timestamps

Supabase uses ISO string timestamps, Firebase uses Timestamp objects:

- **Supabase:** `"2024-01-01T00:00:00.000Z"`
- **Firebase:** `Timestamp(seconds=1704067200, nanoseconds=0)`

The code automatically handles this conversion, but when importing manually:
- Use Firebase Console's date picker, or
- Use `admin.firestore.Timestamp.fromDate(new Date(isoString))` in scripts

### Arrays and Objects

Firebase Firestore supports:
- Arrays: `[1, 2, 3]`
- Maps/Objects: `{ key: "value" }`
- Nested structures

These should migrate directly from Supabase.

## Step 5: Verify Migration

1. Check collection counts match between Supabase and Firebase
2. Spot-check a few documents to ensure data integrity
3. Test the application to ensure all features work

## Step 6: Update Environment Variables

Remove Supabase variables and ensure Firebase variables are set (or use defaults in code).

## Important Notes

- **Document IDs:** The migration preserves document IDs from Supabase
- **Indexes:** You may need to create Firestore indexes for complex queries
- **Security Rules:** Set up Firestore security rules in Firebase Console
- **Backup:** Always backup your Supabase data before migration

## Firestore Indexes Required

You may need to create composite indexes for these queries:

1. `scenarios` collection:
   - `client_id` + `created_at` (descending)

2. `simulation_runs` collection:
   - `client_id` + `status` + `created_at` (descending)
   - `scenario_id` + `status` + `created_at` (descending)

3. `final_prompt_suggestions` collection:
   - `client_id` + `created_at` (descending)

Firebase will prompt you to create these indexes when needed, or you can create them manually in the Firebase Console.

## Troubleshooting

### "Missing or insufficient permissions" error

- Check Firestore security rules
- Ensure your Firebase project has proper authentication set up

### Date conversion issues

- Ensure all timestamp fields are properly converted
- Check that `created_at` and `updated_at` fields exist in all documents

### Query performance issues

- Create the required composite indexes
- Consider pagination for large collections

