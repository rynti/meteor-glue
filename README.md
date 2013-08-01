# Meteor Glue

A Meteor package that allows to enhance the speed of normalized databases.

**This package is still in development and not yet to be used for production
environment**


## Description

MongoDB allows for flattened as well as normalized database modeling, both
having their advantages:
- Flattened databases allow extremely fast access, however they cause
  consistency problems
- Normalized databases are faster for writes and always consistent as there is
  no redundant data

And now you make a decision which one to use - this is where Meteor Glue
jumps in!

Meteor Glue was designed to allow you to use normalized database with the
addition of the great speed enhancements provided by flattened databases.


## How it works

You start by telling Glue what associations your database has. Let's say our
example database model has two collections, `books` and `comments`. One book has
many comments, and each comment has a book. You can specify this relationship as
follows:

```javascript
// Specify that a book has many comments:
glue("books").hasMany("comments");
```

From now on, whenever you add a comment, the comment will automatically get
added as a sub-document to the corresponding book. This allows you to get all
comments using the following code:

```javascript
// Given that Books and Comments are the respective Meteor collections

// Fetch an arbitrary book:
var book = Books.findOne();

// Fetch all comments of that book using glue - Constant Complexity, O(1)
var comments = Comments.find({book: book}).fetch();
```

As you can see, you can access documents very similar to the way you'd do it
with a normalized database model, but you get the speed of flattened models!
Profit!


## Things to be aware of

You should always bear in mind that data duplication requires more memory. In
fact, MongoDB by default has a document size limit of 16 megabytes, but usually
you won't get even close to that limit. For instance, in the example used above,
if comments were limited to a length of 400 characters, you'd still be able to
contain more than 35,000 comments per book.


## License

Meteor Glue is released under the [MIT License](http://www.opensource.org/licenses/MIT).

