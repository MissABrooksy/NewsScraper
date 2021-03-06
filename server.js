const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require('axios');
const cheerio = require('cheerio');

// Require all models
const db = require('./models');

const PORT = process.env.PORT || 3002;

// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger('dev'));
// Parse request body as JSON
app.use(express.urlencoded({extended: true}));
app.use(express.json());
// Make public a static folder
app.use(express.static('public'));

// Connect to the Mongo DB
mongoose.connect('mongodb://localhost/wtnh', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

// Routes

// A GET route for scraping the WTNH website
app.get('/scrape', async function(req, res) {
  // First, we grab the body of the html with axios
  const response = await axios.get('http://www.wtnh.com/');
  // Then, we load that into cheerio and save it to $ for a shorthand selector
  const $ = cheerio.load(response.data);

  // Now, we grab every h2 within an article tag, and do the following:
  $('h3.article-list__article-title').each(function(i, element) {
    const result = {};

    // Add the text and href of every link, and save them as properties of the result object
    result.title = $(this)
        .children('a')
        .text();
    result.link = $(this)
        .children('a')
        .attr('href');

    // Create a new Article using the `result` object built from scraping
    db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
  });
});

// Route for getting all Articles from the db
app.get('/api/articles', async function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  try {
    const data = await db.Article.find({});
    res.send(data);
  } catch (err) {
    res.status(500).json({error: {name: err.name, message: err.message}});
  }
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get('/api/articles/:id', async function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  const id = req.params.id;
  try {
    const data = await db.Article.findOne({_id: id})
        .populate('note');
    console.log(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({error: {name: err.name, message: err.message}});
  }
});

// Route for saving/updating an Article's associated Note
app.post('/api/articles/:id', async function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  try {
    const dbNote = await db.Note.create(req.body);
    const dbArticle = await db.Article.findOneAndUpdate(
        {_id: req.params.articleId},
        {note: dbNote._id},
        {new: true},
    );
    res.json(dbArticle);
  } catch (err) {
    res.status(500).json({error: {name: err.name, message: err.message}});
  }
});

// Set the app to listen on PORT
app.listen(PORT, function() {
  console.log('App running on http://localhost:%s', PORT);
});
