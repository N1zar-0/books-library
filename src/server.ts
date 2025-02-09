import express , {Response, Request }from 'express';
import mysql from "mysql2/promise";
import fs = require("fs");

const app = express();
const PORT = 3000;

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "pass",
    database: "library",
});

app.use(express.json());
app.use(express.static('public'));

app.get("/", (req: Request, res: Response) => {
    let booksTemplate = fs.readFileSync("public/books-page/books-page.html", "utf-8");
    res.send(booksTemplate);
});

app.get("/api/v1/books", async (req : Request, res : Response) => {
   console.log("/api/v1/books");
   console.log(req.query);

    const limit = Number(req.query.limit);
    const offset = Number(req.query.offset);

    try {
        const [books] : any[] = await db.query(`
            SELECT
                books.id,
                books.title,
                GROUP_CONCAT(authors.author SEPARATOR ', ') AS author
            FROM books
            JOIN authors_and_books ON authors_and_books.bookIDs = books.id
            JOIN authors ON authors_and_books.authorIDs = authors.id
            GROUP BY books.id
            LIMIT ? OFFSET ?;`, [limit, offset]);

        const [[count]] : any = await db.query("SELECT COUNT(*) AS total FROM books");
        const result = {
            success : true,
            data : {
                books : books,
                total : {
                    amount : count.total,
                }
            }
        }

        res.json(result);
    }  catch (error) {
        res.status(500).json({ error: "Error fetching book details" });
    }
});

app.get('/book/:id', async (req : Request, res : Response) => {
    try {
        let bookTemplate = fs.readFileSync("public/book-page/book-page.html", "utf-8");
        res.send(bookTemplate);
    }  catch (error) {
        res.status(500).json({ error: "Error fetching book details" });
    }

})

app.get('/api/v1/books/:id', async (req : Request, res : Response) => {
    const id = Number(req.params.id);

    try {
        const [[book]] : any = await db.query(`
            SELECT
                books.id,
                books.title,
                books.year,
                books.pages,
                books.description,
                GROUP_CONCAT(authors.author SEPARATOR ', ') AS author
            FROM books
            JOIN authors_and_books ON authors_and_books.bookIDs = books.id
            JOIN authors ON authors_and_books.authorIDs = authors.id
            WHERE books.id = ?;`, [id]);

        const result = {
            success : true,
            data : book,
            id : id
        }

        res.json(result);

        await db.query(`UPDATE books SET visits = visits + 1 WHERE books.id = ?;`, [id]);
    }  catch (error) {
        res.status(500).json({ error: "Error fetching book details" });
    }
})

app.post('/api/v1/books/:id/increment-purchases', async (req : Request, res : Response) => {
    const id = Number(req.params.id);

    await db.query(`UPDATE books SET purchases = purchases + 1 WHERE books.id = ?;`, [id]);
    res.send({ok : true});
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});