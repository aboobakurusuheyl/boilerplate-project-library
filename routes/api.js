/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const Book = require('../models/Book');

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const books = Book.findAll();
        res.json(books);
      } catch (err) {
        res.status(500).json({ error: 'Error fetching books' });
      }
    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        return res.send('missing required field title');
      }
      try {
        const newBook = Book.create(title);
        res.json(newBook);
      } catch (err) {
        res.status(500).json({ error: 'Error creating book' });
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      try {
        Book.deleteAll();
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).json({ error: 'Error deleting books' });
      }
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      if (!Book.isValidId(bookid)) {
        return res.send('no book exists');
      }
      try {
        const book = Book.findById(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        res.json(book);
      } catch (err) {
        res.status(500).json({ error: 'Error fetching book' });
      }
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!Book.isValidId(bookid)) {
        return res.send('no book exists');
      }
      if (!comment) {
        return res.send('missing required field comment');
      }
      try {
        const updatedBook = Book.addComment(bookid, comment);
        if (!updatedBook) {
          return res.send('no book exists');
        }
        res.json(updatedBook);
      } catch (err) {
        res.status(500).json({ error: 'Error updating book' });
      }
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      if (!Book.isValidId(bookid)) {
        return res.send('no book exists');
      }
      try {
        const deleted = Book.deleteById(bookid);
        if (!deleted) {
          return res.send('no book exists');
        }
        res.send('delete successful');
      } catch (err) {
        res.status(500).json({ error: 'Error deleting book' });
      }
    });
  
};
