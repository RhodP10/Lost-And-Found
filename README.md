# Lost and Found Web Application

A web application for reporting and finding lost items, built with Svelte 5 and MySQL.

## Features

- Report lost or found items
- Browse lost and found items
- Filter items by category
- Search for items
- View item details and contact information
- Responsive design

## Technologies Used

- **Frontend**: Svelte 5, TailwindCSS
- **Backend**: SvelteKit API routes
- **Database**: MySQL

## Prerequisites

- Node.js (v16 or higher)
- MySQL server

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the database

Create a `.env` file in the root directory with the following content:

```
DATABASE_HOST=localhost
DATABASE_USER=your_mysql_username
DATABASE_PASSWORD=your_mysql_password
DATABASE_NAME=lost_and_found
DATABASE_PORT=3306
```

Replace the values with your MySQL credentials.

### 3. Initialize the database

Run the following command to create the database schema:

```bash
npm run init-db
```

If you want to populate the database with sample data, run:

```bash
npm run init-db:sample
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at http://localhost:5173

## Project Structure

- `src/routes/` - SvelteKit routes and pages
- `src/lib/` - Shared components and utilities
- `src/lib/server/` - Server-side code
- `database/` - Database schema
- `scripts/` - Utility scripts

## API Endpoints

- `GET /api/items` - Get all items (with optional filters)
- `POST /api/items` - Create a new item
- `GET /api/items/:id` - Get a specific item
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item
- `GET /api/categories` - Get all categories

## Building for Production

```bash
npm run build
```

This will create a production-ready build in the `build` directory.

You can preview the production build with `npm run preview`.
