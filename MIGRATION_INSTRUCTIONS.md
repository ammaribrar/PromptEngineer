# Quick Migration Instructions

## Option 1: Use the Migration API (Easiest) ⚡

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser and go to:**
   ```
   http://localhost:3000/api/migrate
   ```
   This will show you the migration status.

3. **Run the migration by making a POST request:**
   
   **Using curl:**
   ```bash
   curl -X POST http://localhost:3000/api/migrate
   ```
   
   **Using browser console:**
   ```javascript
   fetch('/api/migrate', { method: 'POST' })
     .then(r => r.json())
     .then(console.log);
   ```
   
   **Or create a simple HTML page:**
   Open your browser and go to `http://localhost:3000/api/migrate` then open browser console and run:
   ```javascript
   fetch('/api/migrate', { method: 'POST' })
     .then(r => r.json())
     .then(data => {
       console.log('Migration Results:', data);
       alert('Migration complete! Check console for details.');
     });
   ```

4. **Refresh your app** - Your data should now appear!

## Option 2: Use the Browser Tool 🌐

1. Open `scripts/import-to-firebase.html` in your browser
2. Follow the on-screen instructions
3. Export data from Supabase first (or use the browser export script)

## Option 3: Manual Migration via Firebase Console 📝

1. **Export from Supabase:**
   - Go to Supabase Dashboard → Table Editor
   - For each table, click "..." → Export as CSV/JSON
   - Or use SQL: `SELECT * FROM clients;` and export results

2. **Import to Firebase:**
   - Go to Firebase Console → Firestore Database
   - Create collections: `clients`, `scenarios`, `simulation_runs`, `final_prompt_suggestions`
   - For each document:
     - Click "Add document"
     - Use the `id` from Supabase as the document ID
     - Add all fields
     - Convert date strings to Firestore Timestamp format

## Troubleshooting

### "Missing or insufficient permissions"
- Check Firestore security rules in Firebase Console
- For development, you can temporarily allow all reads/writes:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }
  ```

### Data not appearing after migration
- Check browser console for errors
- Verify Firestore collections exist in Firebase Console
- Check that document IDs match between Supabase and Firebase
- Refresh the page after migration

### Migration API returns error
- Make sure your Supabase credentials are still valid
- Check that Firebase is properly initialized
- Look at server logs for detailed error messages

## What Gets Migrated?

- ✅ All clients with their full details
- ✅ All scenarios linked to clients
- ✅ All simulation runs with conversation data
- ✅ All final prompt suggestions

The migration is **idempotent** - it won't create duplicates if you run it multiple times.

