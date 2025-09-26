// frontend/src/pages/Notes.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchNotes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Fetch notes error:", err);
      setError("Failed to load notes");
    }
  };

  // ADD note with proper error handling for limit
  const addNote = async () => {
    if (!title || !content) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/notes",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // success: append newly created note
      setNotes((prev) => [...prev, response.data]);
      setTitle("");
      setContent("");
      setError("");
    } catch (err) {
      // If server returned 403 with friendly message, show it
      if (err.response && err.response.status === 403) {
        // show upgrade message
        alert(err.response.data.message || "Upgrade required to add more notes");
      } else {
        console.error("Add note error:", err);
        setError("Failed to add note");
      }
    }
  };

  // DELETE note
  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Delete note error:", err);
      setError("Failed to delete note");
    }
  };

  // Start editing a note
  const startEdit = (note) => {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  };

  // Update note
  const updateNote = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/notes/${id}`,
        { title: editTitle, content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes((prev) => prev.map((n) => (n._id === id ? res.data : n)));
      cancelEdit();
      setError("");
    } catch (err) {
      console.error("Update note error:", err);
      setError("Failed to update note");
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="notes-container">
      <h2>Your Notes</h2>

      {error && <p className="error">{error}</p>}

      <div className="note-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={addNote}>Add Note</button>
      </div>

      <div className="notes-list">
        {notes.length === 0 ? (
          <p>No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="note">
              {editingId === note._1d || editingId === note._id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <button onClick={() => updateNote(note._id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => startEdit(note)}>Edit</button>
                    <button onClick={() => deleteNote(note._id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notes;
