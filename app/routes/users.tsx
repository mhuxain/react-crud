import { useEffect } from "react";
import type { Route } from "./+types/users";
import { 
  useCrudState
} from "./crud_actions";
import type { Entity } from "./crud_actions";

// Define the User interface - this helps with TypeScript type checking
interface BaseUser {
  id?: number; // Make id optional for new users
  name: string;
  email: string;
}
type User = BaseUser & Record<string, string|number|boolean> & Entity;

// Meta function for the page (like setting page title)
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Users Management" },
    { name: "description", content: "Manage users with CRUD operations" },
  ];
}

const baseUrl = () => 'https://jsonplaceholder.typicode.com/users'



export default function Users() {
  // Use the CRUD state hook that manages all state and handlers
  const {
    items: users,
    loading,
    error,
    formData,
    setFormData,
    setError,
    handleFetch,
    handleCreate,
    handleUpdate,
    handleDelete,
    resetForm
  } = useCrudState<User>(
    'user',
    baseUrl(),
    { name: "", email: "" }
  );



  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please fill in all fields");
      return;
    }
    
    // Decide whether to create or update based on presence of id
    if (formData.id) {
      handleUpdate(formData);
    } else {
      handleCreate(formData);
    }
  };

  // Function to start editing a user
  const startEdit = (user: User) => {
    setFormData({ id: user.id, name: user.name, email: user.email });
  };



  // Check if we're in edit mode
  const isEditing = !!formData.id;

  // useEffect hook - runs when component mounts (loads for first time)
  useEffect(() => {
    handleFetch();
  }, []); // Empty array means this only runs once when component loads

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Users Management</h1>
        <button
          className="reset-button"
          onClick={() => {
            if (window.confirm("Reload data from API?")) {
              handleFetch();
            }
          }}
        >
          Refresh Data
        </button>
      </div>
      
      <p className="info-note">
        📝 <strong>Note:</strong> This demo uses <code>JSONPlaceholder API</code> for all CRUD operations. Changes are simulated but not persisted on the server. Use "Refresh Data" to reload from the API.
      </p>
      
      {/* Error display */}
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {/* Add/Edit User Form */}
      <div className="form-container">
        <h2>{isEditing ? "Edit User" : "Add New User"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">
              Name:
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter user name"
            />
          </div>
          
          <div className="form-field">
            <label className="form-label">
              Email:
            </label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter user email"
            />
          </div>
          
          <div className="button-group">
            <button 
              type="submit"
              className="btn-primary"
            >
              {isEditing ? "Update User" : "Add User"}
            </button>
            
            {isEditing && (
              <button 
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div>
        <h2>Users List</h2>
        {loading ? (
          <p className="loading-text">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="empty-state">No users found. Add some users using the form above!</p>
        ) : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td className="center">
                    <button
                      className="btn-edit"
                      onClick={() => startEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                          handleDelete(user.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
