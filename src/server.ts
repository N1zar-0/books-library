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

app.get("/", (request: Request, res: Response) => {
    let booksTemplate = fs.readFileSync("public/books-page/index.html", "utf-8");
    res.send(booksTemplate);
});

app.get("/api/v1/books", async (req : Request, res : Response) => {
   console.log("/api/v1/books");
   console.log(req.query);
    const limit = Number(req.query.limit);
    const offset = Number(req.query.offset);
    try {
        const [books] : any[] = await db.query("SELECT * FROM books LIMIT ? OFFSET ?", [limit, offset]);
        console.log(books);
        const result = {
            success : true,
            data : {
                books : books,
                total : {
                    amount : books.length
                },
                filter : req.query.filter,
                limit : limit,
                offset : offset,
            }
        }


        res.json(result);
    }  catch (error) {
        res.status(500).json({ error: "Error fetching book details" });
        console.log(error);
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
    let id = Number(req.params.id);
    try {
        const [[book]] : any = await db.query("SELECT * FROM books WHERE id = ?", [id]);
        console.log(book);
        const result = {
            success : true,
            data : book
        }

        res.json(result);
    }  catch (error) {
        res.status(500).json({ error: "Error fetching book details" });
        console.log(error);
    }
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});