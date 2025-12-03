import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api";
import "../styles/DailyNote.css";

function DailyNote() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // States
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [userNotes, setUserNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);

  // ====== FETCH USER'S NOTES ======
  const fetchUserNotes = useCallback(async () => {
    if (!isAuthenticated || !user?.user_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest(`/users/${user.user_id}/posts`);
      const notes = Array.isArray(data) ? data : [];
      setUserNotes(notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setError(null);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Failed to load your notes");
      setUserNotes([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // ====== AUTHENTICATION CHECK ======
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchUserNotes();
  }, [isAuthenticated, user, navigate, fetchUserNotes]);

  // ====== FILTER NOTES ======
  useEffect(() => {
    let filtered = userNotes;

    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.body.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotes(filtered);
  }, [searchTerm, userNotes]);

  // ====== CREATE NEW NOTE ======
  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert("Please enter both title and content");
      return;
    }

    try {
      const response = await apiRequest("/posts", {
        method: "POST",
        body: {
          title: newNote.title,
          body: newNote.content,
        },
      });

      if (response) {
        setNewNote({ title: "", content: "" });
        setShowWriteModal(false);
        fetchUserNotes(); // Refresh notes
      }
    } catch (err) {
      console.error("Error creating note:", err);
      alert("Failed to create note");
    }
  };

  // ====== DELETE NOTE ======
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      await apiRequest(`/posts/${noteId}`, { method: "DELETE" });
      setUserNotes(userNotes.filter((note) => note.id !== noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Failed to delete note");
    }
  };

  // ====== FORMAT DATE ======
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // ====== COUNT WORDS ======
  const countWords = (text) => {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="daily-note-page">
      {/* ====== HERO SECTION ====== */}
      <div className="daily-note-hero">
        <h1 className="daily-note-title">My Notes</h1>
        <p className="daily-note-subtitle">
          Write, reflect, and keep track of your daily thoughts
        </p>
        <button
          className="write-note-btn"
          onClick={() => setShowWriteModal(true)}
        >
          ✍️ Write a Note
        </button>
      </div>

      {/* ====== SEARCH SECTION ====== */}
      <div className="daily-note-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search your notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <span className="note-count">
          {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ====== NOTES FEED ====== */}
      <div className="daily-note-container">
        {loading ? (
          <div className="loading-spinner">
            <p>Loading your notes...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="no-notes">
            <p>📝 No notes yet</p>
            <p>Start writing your first note to capture your thoughts!</p>
            <button
              className="write-note-btn"
              onClick={() => setShowWriteModal(true)}
            >
              ✍️ Write Your First Note
            </button>
          </div>
        ) : (
          <div className="notes-feed">
            {filteredNotes.map((note) => (
              <div key={note.id} className="note-card">
                <div className="note-card-header">
                  <div className="note-header-info">
                    <h3 className="note-title">{note.title}</h3>
                    <p className="note-date">{formatDate(note.created_at)}</p>
                  </div>
                  <button
                    className="note-delete-btn"
                    onClick={() => handleDeleteNote(note.id)}
                    title="Delete note"
                  >
                    🗑️
                  </button>
                </div>

                <div className="note-card-content">
                  <p className="note-excerpt">
                    {note.body.substring(0, 300)}
                    {note.body.length > 300 ? "..." : ""}
                  </p>
                </div>

                <div className="note-card-footer">
                  <span className="note-length">
                    {countWords(note.body)} words
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====== WRITE NOTE MODAL ====== */}
      {showWriteModal && (
        <div className="write-note-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Write a New Note</h2>
              <button
                className="close-modal-btn"
                onClick={() => setShowWriteModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Note Title</label>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Give your note a title..."
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                  className="form-input"
                />
                <div className="char-limit">
                  {newNote.title.length}/200 characters
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Note Content</label>
                <textarea
                  placeholder="Write your thoughts here..."
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote({ ...newNote, content: e.target.value })
                  }
                  className="form-textarea"
                />
                <div className="word-count-container">
                  <span>Word count: {countWords(newNote.content)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowWriteModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-btn-submit"
                onClick={handleCreateNote}
              >
                Publish Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyNote;
