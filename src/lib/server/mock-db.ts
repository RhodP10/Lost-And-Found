import type { Item, Category } from '$lib/types';

// Mock data for categories
const categories: Category[] = [
  { id: 1, name: 'Electronics', created_at: new Date().toISOString() },
  { id: 2, name: 'Clothing', created_at: new Date().toISOString() },
  { id: 3, name: 'Accessories', created_at: new Date().toISOString() },
  { id: 4, name: 'Documents', created_at: new Date().toISOString() },
  { id: 5, name: 'Keys', created_at: new Date().toISOString() },
  { id: 6, name: 'Bags', created_at: new Date().toISOString() },
  { id: 7, name: 'Other', created_at: new Date().toISOString() }
];

// Mock data for items
const items: Item[] = [
  {
    id: 1,
    title: 'Blue Backpack',
    description: 'Lost my blue North Face backpack with laptop inside. Last seen in the library.',
    category: 'Bags',
    status: 'lost',
    location: 'University Library',
    date_reported: new Date().toISOString(),
    reporter_name: 'John Smith',
    reporter_email: 'john@example.com',
    reporter_phone: '555-123-4567',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'iPhone 13 Pro',
    description: 'Lost my iPhone 13 Pro with a black case. The lock screen has a picture of a dog.',
    category: 'Electronics',
    status: 'lost',
    location: 'Downtown Coffee Shop',
    date_reported: new Date().toISOString(),
    reporter_name: 'Emily Johnson',
    reporter_email: 'emily@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Car Keys',
    description: 'Lost my Toyota car keys with a red keychain.',
    category: 'Keys',
    status: 'lost',
    location: 'Central Park',
    date_reported: new Date().toISOString(),
    reporter_name: 'Michael Brown',
    reporter_email: 'michael@example.com',
    reporter_phone: '555-987-6543',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Black Wallet',
    description: 'Found a black leather wallet with ID and credit cards inside.',
    category: 'Accessories',
    status: 'found',
    location: 'Bus Stop on Main Street',
    date_reported: new Date().toISOString(),
    reporter_name: 'Sarah Wilson',
    reporter_email: 'sarah@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    title: 'Prescription Glasses',
    description: 'Found a pair of prescription glasses with tortoise shell frames.',
    category: 'Accessories',
    status: 'found',
    location: 'City Park',
    date_reported: new Date().toISOString(),
    reporter_name: 'David Lee',
    reporter_email: 'david@example.com',
    reporter_phone: '555-456-7890',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    title: 'Textbook',
    description: 'Found a calculus textbook with the name "Jessica" written inside.',
    category: 'Other',
    status: 'found',
    location: 'Science Building',
    date_reported: new Date().toISOString(),
    reporter_name: 'Robert Taylor',
    reporter_email: 'robert@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock database functions
export const mockDb = {
  // Categories
  getCategories: async () => {
    return [...categories];
  },

  // Items
  getItems: async (filters: { status?: string; category?: string; limit?: number } = {}) => {
    let filteredItems = [...items];
    
    if (filters.status) {
      filteredItems = filteredItems.filter(item => item.status === filters.status);
    }
    
    if (filters.category) {
      filteredItems = filteredItems.filter(item => item.category === filters.category);
    }
    
    // Sort by date_reported in descending order
    filteredItems.sort((a, b) => {
      return new Date(b.date_reported || '').getTime() - new Date(a.date_reported || '').getTime();
    });
    
    if (filters.limit) {
      filteredItems = filteredItems.slice(0, filters.limit);
    }
    
    return filteredItems;
  },
  
  getItemById: async (id: number) => {
    return items.find(item => item.id === id) || null;
  },
  
  createItem: async (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1;
    const now = new Date().toISOString();
    
    const newItem: Item = {
      ...item,
      id: newId,
      date_reported: now,
      created_at: now,
      updated_at: now
    };
    
    items.push(newItem);
    return newItem;
  },
  
  updateItem: async (id: number, item: Partial<Item>) => {
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    items[index] = {
      ...items[index],
      ...item,
      updated_at: new Date().toISOString()
    };
    
    return items[index];
  },
  
  deleteItem: async (id: number) => {
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    items.splice(index, 1);
    return true;
  }
};
