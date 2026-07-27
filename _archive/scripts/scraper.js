import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

puppeteer.use(StealthPlugin());

const targetUrls = [
  'https://www.goodreads.com/book/show/54493401-project-hail-mary',
  'https://www.goodreads.com/book/show/193139364-dune'
];

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function extractBookData(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Wait for the main title to appear
    await page.waitForSelector('h1[data-testid="bookTitle"]', { timeout: 10000 });

    const data = await page.evaluate(() => {
      const getVal = (selector, isImage = false) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        if (isImage) {
           return el.getAttribute('src');
        }
        return el.innerText.trim();
      };

      const title = getVal('h1[data-testid="bookTitle"]');
      const author = getVal('span.ContributorLink__name');
      const synopsis = getVal('div[data-testid="description"]');
      
      let pageCount = null;
      const pagesFormat = getVal('p[data-testid="pagesFormat"]');
      if (pagesFormat) {
        const match = pagesFormat.match(/(\d+)\s+pages?/i);
        if (match) pageCount = parseInt(match[1], 10);
      }

      const publicationInfo = getVal('p[data-testid="publicationInfo"]');
      let publicationDate = null;
      if (publicationInfo) {
        const match = publicationInfo.match(/published\s+(.*)/i);
        if (match) publicationDate = match[1].trim();
      }

      const coverImg = getVal('div.BookCover__image img.ResponsiveImage', true);

      let isbn = null;
      let publisher = null;
      const detailItems = Array.from(document.querySelectorAll('.DescListItem'));
      for (const item of detailItems) {
        const dt = item.querySelector('dt')?.innerText?.toLowerCase();
        const dd = item.querySelector('dd')?.innerText;
        if (dt && dd) {
          if (dt.includes('isbn')) {
            isbn = dd.split(' ')[0].trim();
          }
          if (dt.includes('publisher') || dt.includes('published by')) {
            publisher = dd.trim();
          }
        }
      }

      return {
        book_title: title,
        author: author,
        isbn: isbn,
        cover_image_url: coverImg,
        official_synopsis: synopsis,
        page_count: pageCount,
        publication_date: publicationDate,
        publisher: publisher
      };
    });

    if (data.official_synopsis && data.book_title) {
        const hashTitle = data.book_title.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
        const hashAuthor = (data.author || '').replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
        const hashtags = `\n\n#${hashTitle} #${hashAuthor} #BookReview #MustRead #Goodreads`;
        data.official_synopsis += hashtags;
    }

    return data;
  } catch (err) {
    console.error(`Error scraping ${url}:`, err.message);
    return null;
  }
}

async function run() {
  console.log('Starting scraper...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  const books = [];

  for (const url of targetUrls) {
    console.log(`Scraping: ${url}`);
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
    
    const bookData = await extractBookData(page, url);
    if (bookData) {
      books.push(bookData);
      console.log(`Successfully scraped: ${bookData.book_title}`);
    }
    await page.close();
  }

  await browser.close();

  console.log('Generating SQL...');
  let sql = `CREATE TABLE IF NOT EXISTS books (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  book_title TEXT,\n  author TEXT,\n  isbn TEXT,\n  cover_image_url TEXT,\n  official_synopsis TEXT,\n  page_count INTEGER,\n  publication_date TEXT,\n  publisher TEXT\n);\n\n`;

  for (const b of books) {
    const title = escapeSql(b.book_title);
    const author = escapeSql(b.author);
    const isbn = escapeSql(b.isbn);
    const cover = escapeSql(b.cover_image_url);
    const synopsis = escapeSql(b.official_synopsis);
    const pages = b.page_count === null ? 'NULL' : b.page_count;
    const pubDate = escapeSql(b.publication_date);
    const publisher = escapeSql(b.publisher);

    sql += `INSERT INTO books (book_title, author, isbn, cover_image_url, official_synopsis, page_count, publication_date, publisher) VALUES (${title}, ${author}, ${isbn}, ${cover}, ${synopsis}, ${pages}, ${pubDate}, ${publisher});\n`;
  }

  const outputPath = path.join(process.cwd(), 'insert_books.sql');
  fs.writeFileSync(outputPath, sql, 'utf-8');
  console.log(`Saved SQL to ${outputPath}`);
}

run().catch(console.error);
