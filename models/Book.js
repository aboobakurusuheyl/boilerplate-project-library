'use strict';

const Database = require('better-sqlite3');
const path = require('path');

// Use in-memory database for testing, file-based for production
const dbPath = process.env.NODE_ENV === 'test' 
  ? ':memory:' 
  : (process.env.DB || path.join(__dirname, '../library.db'));

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create books table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
  );
`);

// Helper functions
const Book = {
  // Get all books with comment count
  findAll: function() {
    const books = db.prepare(`
      SELECT 
        b.id as _id,
        b.title,
        COUNT(c.id) as commentcount
      FROM books b
      LEFT JOIN comments c ON b.id = c.book_id
      GROUP BY b.id, b.title
      ORDER BY b.id
    `).all();
    
    return books.map(book => ({
      _id: book._id.toString(),
      title: book.title,
      commentcount: book.commentcount
    }));
  },
  
  // Find book by ID with comments
  findById: function(id) {
    const book = db.prepare('SELECT id, title FROM books WHERE id = ?').get(id);
    if (!book) {
      return null;
    }
    
    const comments = db.prepare('SELECT comment FROM comments WHERE book_id = ? ORDER BY id').all(id);
    
    return {
      _id: book.id.toString(),
      title: book.title,
      comments: comments.map(c => c.comment)
    };
  },
  
  // Create a new book
  create: function(title) {
    const result = db.prepare('INSERT INTO books (title) VALUES (?)').run(title);
    return {
      _id: result.lastInsertRowid.toString(),
      title: title
    };
  },
  
  // Add a comment to a book
  addComment: function(bookId, comment) {
    const book = db.prepare('SELECT id, title FROM books WHERE id = ?').get(bookId);
    if (!book) {
      return null;
    }
    
    db.prepare('INSERT INTO comments (book_id, comment) VALUES (?, ?)').run(bookId, comment);
    
    // Return updated book with all comments
    return this.findById(bookId);
  },
  
  // Delete a book by ID
  deleteById: function(id) {
    const book = db.prepare('SELECT id FROM books WHERE id = ?').get(id);
    if (!book) {
      return false;
    }
    
    db.prepare('DELETE FROM books WHERE id = ?').run(id);
    return true;
  },
  
  // Delete all books
  deleteAll: function() {
    db.prepare('DELETE FROM books').run();
    return true;
  },
  
  // Check if ID is valid (numeric)
  isValidId: function(id) {
    return /^\d+$/.test(id);
  }
};

module.exports = Book;
