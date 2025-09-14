import React from "react";

// Generic interface for entities with optional id
export interface Entity {
  id?: number;
}

// Generic API and Handler Functions - handle both API calls and state management for any entity type T

export function createFetchHandler<T>(
  baseUrl: string,
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  entityName: string = 'items'
) {
  return async () => {
    try {
      setLoading(true);
      setError(null);
      
      // API call - fetch items from API
      const response = await fetch(baseUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch ${entityName}`);
      console.error(`Error fetching ${entityName}:`, err);
    } finally {
      setLoading(false);
    }
  };
}

export function createCreateHandler<T extends Entity>(
  baseUrl: string,
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  items: T[],
  clearFormData: T,
  entityName: string = 'item'
) {
  return async (itemData: T) => {
    try {
      setError(null);
      
      // Create new item via POST request
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newItem = await response.json();
      
      // Generate local ID for consistency
      const maxId = items.length > 0 ? Math.max(...items.map(item => item.id || 0)) : 0;
      const savedItem = { ...newItem, id: maxId + 1 } as T;
      
      // Add new item to local state
      const updatedItems = [...items, savedItem];
      setItems(updatedItems);
      
      // Clear the form
      setFormData(clearFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to create ${entityName}`);
      console.error(`Error creating ${entityName}:`, err);
    }
  };
}

export function createUpdateHandler<T extends Entity>(
  baseUrl: string,
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  items: T[],
  clearFormData: T,
  entityName: string = 'item'
) {
  return async (itemData: T) => {
    try {
      setError(null);
      
      if (!itemData.id) {
        throw new Error(`Cannot update ${entityName} without an ID`);
      }
      
      // Update existing item via PUT request
      const response = await fetch(`${baseUrl}/${itemData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const savedItem = await response.json();
      
      // Update existing item in local state
      const updatedItems = items.map(item => 
        item.id === itemData.id ? savedItem : item
      );
      setItems(updatedItems);
      
      // Clear the form
      setFormData(clearFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update ${entityName}`);
      console.error(`Error updating ${entityName}:`, err);
    }
  };
}

export function createDeleteHandler<T extends Entity>(
  baseUrl: string,
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  items: T[],
  entityName: string = 'item'
) {
  return async (id: number) => {
    try {
      setError(null);
      
      // API call - delete item via DELETE request
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Update local state (remove item from list)
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete ${entityName}`);
      console.error(`Error deleting ${entityName}:`, err);
    }
  };
}