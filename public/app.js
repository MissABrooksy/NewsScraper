const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');



// Require all models
const db = require('./models');



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

// Grab the articles as a json
$.getJSON('/api/articles', function(data) {
  // For each one
  for (let i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $('#articles').append(`
    <p style="cursor:pointer" data-id="${data[i]._id}">${data[i].title}<br />
    <a href="${data[i].link}" target="_blank">&#9758;</a>
    </p>
    `);
  }
});


// Whenever someone clicks a p tag
$(document).on('click', 'p', function() {
  // Empty the notes from the note section
  $('#notes').empty();
  // Save the id from the p tag
  const thisId = $(this).attr('data-id');

  // Now make an ajax call for the Article
  $.ajax({
    method: 'GET',
    url: '/api/articles/' + thisId,
  })
  // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
        // The title of the article
        $('#notes').append('<h2>' + data.title + '</h2>');
        // An input to enter a new title
        $('#notes').append('<input id=\'titleinput\' name=\'title\' >');
        // A textarea to add a new note body
        $('#notes').append('<textarea id=\'bodyinput\' name=\'body\'></textarea>');
        // A button to submit a new note, with the id of the article saved to it
        $('#notes').append('<button data-id=\'' + data._id + '\' id=\'savenote\'>Save Note</button>');
        // A button to delete a note, with the id of the article saved to it
        $('#notes').append('<button data-id=\'' + data._id + '\' id=\'delete\'>Delete</button>');

        // If there's a note in the article
        if (data.note) {
        // Place the title of the note in the title input
          $('#titleinput').val(data.note.title);
          // Place the body of the note in the body textarea
          $('#bodyinput').val(data.note.body);
        }
      });
});

// When you click the savenote button
$(document).on('click', '#savenote', function() {
  // Grab the id associated with the article from the submit button
  const thisId = $(this).attr('data-id');

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: 'POST',
    url: '/api/articles/' + thisId,
    data: {
      // Value taken from title input
      title: $('#titleinput').val(),
      // Value taken from note textarea
      body: $('#bodyinput').val(),
    },
  }),
  // With that done
  dbConn
      .then(function(data) {
        db.collection('Note').insertOne(req.body);
        // Log the response
        console.log(data);
      });

  // Remove the values entered in the input and textarea for note entry
  $('#titleinput').val('');
  $('#bodyinput').val('');
});

// When you click the delete button
$(document).on('click', '#delete', function() {
  // Grab the id associated with the article from the submit button
  const thisId = $(this).attr('data-id');

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: 'DELETE',
    url: '/api/articles/' + thisId,
    data: {
      // Value taken from title input
      title: $('#titleinput').val(),
      // Value taken from note textarea
      body: $('#bodyinput').val(),
    },
  })
  // With that done
      .then(function(data) {
      // Log the response
        console.log(data);
        // Empty the notes section
        $('#notes').empty();
      });
});
