# SQLite Database for Lost and Found Application

This directory contains the SQLite database for the Lost and Found application.

## Database Schema

The database includes the following tables:

1. **items** - Stores information about lost or found items
   - id (PRIMARY KEY)
   - title
   - description
   - category
   - status ('lost', 'found', 'claimed')
   - location
   - floor
   - room_number
   - date_reported
   - reporter_name
   - reporter_email
   - reporter_phone
   - image_url
   - user_id (FOREIGN KEY to users.id)
   - created_at
   - updated_at

2. **categories** - Predefined categories for items
   - id (PRIMARY KEY)
   - name
   - created_at

3. **users** - User authentication information
   - id (PRIMARY KEY)
   - email
   - username
   - password
   - full_name
   - created_at
   - updated_at

4. **claims** - Tracks claims on found items
   - id (PRIMARY KEY)
   - item_id (FOREIGN KEY to items.id)
   - user_id (FOREIGN KEY to users.id)
   - claim_date
   - status ('pending', 'approved', 'rejected')
   - notes

## Viewing the Database

To view the database in VS Code:

1. Install the SQLite extension by alexcvzz
2. Press Ctrl+Shift+P to open the Command Palette
3. Type "SQLite: Open Database" and select it
4. Navigate to and select the `lost_and_found.sqlite` file in this directory

This will add a "SQLITE EXPLORER" view to your VS Code sidebar where you can browse the database tables.

## Using the Database in the Application

The database can be accessed using the utility functions in `db.js`:

```javascript
import { query, get, insert, update, remove, transaction } from './database/db.js';

// Example: Get all items
const items = query('SELECT * FROM items');

// Example: Get a specific item
const item = get('SELECT * FROM items WHERE id = ?', [itemId]);

// Example: Insert a new item
const newItemId = insert(
  'INSERT INTO items (title, description, category, status, location, floor, room_number, reporter_name, reporter_email, date_reported) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  [title, description, category, status, location, floor, roomNumber, reporterName, reporterEmail, new Date().toISOString()]
);
```
