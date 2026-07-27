CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_title TEXT,
  author TEXT,
  isbn TEXT,
  cover_image_url TEXT,
  official_synopsis TEXT,
  page_count INTEGER,
  publication_date TEXT,
  publisher TEXT
);

INSERT INTO books (book_title, author, isbn, cover_image_url, official_synopsis, page_count, publication_date, publisher) VALUES ('Project Hail Mary', 'Andy Weir', NULL, 'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1764703833i/54493401.jpg', 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.

Except that right now, he doesn’t know that. He can’t even remember his own name, let alone the nature of his assignment or how to complete it.

All he knows is that he’s been asleep for a very, very long time. And he’s just been awakened to find himself millions of miles from home, with nothing but two corpses for company.

His crewmates dead, his memories fuzzily returning, Ryland realizes that an impossible task now confronts him. Hurtling through space on this tiny ship, it’s up to him to puzzle out an impossible scientific mystery—and conquer an extinction-level threat to our species.

And with the clock ticking down and the nearest human being light-years away, he’s got to do it all alone.

Or does he?
Show more

#ProjectHailMary #AndyWeir #BookReview #MustRead #Goodreads', 476, 'May 4, 2021', NULL);
