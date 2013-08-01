if (Meteor.isServer) {
  var Books = SinCollection("books");
  var Comments = SinCollection("comments");

  Books.remove({});
  Comments.remove({});

  glue("books").hasMany("comments");

  var bookId = Books.insert({
    title: "Awesome book"
  });

  var book = Books.findOne(bookId);

  Comments.insert({
    books: book,
    content: "This book is awesome!"
  });

  var book = Books.findOne(bookId);

  console.log(book);
  console.log(Comments.find({books: book}).fetch());
  console.log(Comments.findOne({books: book}));
}

