import { useState, useEffect } from "react";
import type { Route } from "./+types/posts";
import { 
  createFetchHandler, 
  createCreateHandler, 
  createUpdateHandler, 
  createDeleteHandler 
} from "./crud_actions";
import type { Entity } from "./crud_actions";

// Define the Post interface - this helps with TypeScript type checking
interface BasePost {
  id?: number; // Make id optional for new posts
  postId: number;
  title: string;
  body: string;
}
type Post = BasePost & Record<string, string|number> & Entity;

// Meta function for the page (like setting page title)
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Post Management Management" },
    { name: "description", content: "manage posts with crud" },
  ];
}

const baseUrl = () => 'https://jsonplaceholder.typicode.com/posts'



export default function Posts() {
  // State variables - think of these as the component's memory
  const [posts, setPosts] = useState<Post[]>([]); // List of all posts
  const [loading, setLoading] = useState(true); // To show loading state
  const [error, setError] = useState<string | null>(null); // To handle errors
  const [formData, setFormData] = useState<Post>({ postId: 0, title: "", body: "" }); // Single form state for create/edit

  // Create handler functions using generic higher-order functions
  const handleFetchPosts = createFetchHandler<Post>(baseUrl(), setPosts, setLoading, setError, 'posts');
  const handleCreatePost = createCreateHandler<Post>(baseUrl(), setPosts, setError, setFormData, posts, { postId: 0, title: "", body: "" }, 'post');
  const handleUpdatePost = createUpdateHandler<Post>(baseUrl(), setPosts, setError, setFormData, posts, { postId: 0, title: "", body: "" }, 'post');
  const handleDeletePost = createDeleteHandler<Post>(baseUrl(), setPosts, setError, posts, 'post');

  // Function to cancel editing (clear form)
  const resetForm = () => {
    setFormData({ postId: 0, title: "", body: "" });
    setError(null);
  };



  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    
    // Basic validation
    if (!formData.title.trim() || !formData.body.trim()) {
      setError("Please fill in all fields");
      return;
    }
    
    // Decide whether to create or update based on presence of id
    if (formData.id) {
      handleUpdatePost(formData);
    } else {
      handleCreatePost(formData);
    }
  };

  // Function to start editing a post
  const startEdit = (post: Post) => {
    setFormData({ id: post.id, postId: post.postId, title: post.title, body: post.body });
  };



  // Check if we're in edit mode
  const isEditing = !!formData.id;

  // useEffect hook - runs when component mounts (loads for first time)
  useEffect(() => {
    handleFetchPosts();
  }, []); // Empty array means this only runs once when component loads

  return (
    <div className="posts-container">
      <div className="posts-header">
        <h1>Posts Management</h1>
        <button
          className="reset-button"
          onClick={() => {
            if (window.confirm("Reload data from API?")) {
              handleFetchPosts();
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

      {/* Add/Edit Post Form */}
      <div className="form-container">
        <h2>{isEditing ? "Edit Post" : "Add New Post"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">
              Post Title:
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter post title"
            />
          </div>
          
          <div className="form-field">
            <label className="form-label">
              Post Body:
            </label>
            <textarea
              className="form-input"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Enter post body"
            />
          </div>
          
          <div className="button-group">
            <button 
              type="submit"
              className="btn-primary"
            >
              {isEditing ? "Update Post" : "Add Post"}
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

      {/* Posts Table */}
      <div>
        <h2>Posts List</h2>
        {loading ? (
          <p className="loading-text">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="empty-state">No posts found. Add some posts using the form above!</p>
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
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td>{post.title}</td>
                  <td>{post.body}</td>
                  <td className="center">
                    <button
                      className="btn-edit"
                      onClick={() => startEdit(post)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${post.title}?`)) {
                          handleDeletePost(post.id);
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
