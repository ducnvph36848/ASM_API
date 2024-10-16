var express = require('express');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var app = express();

app.use(express.json());
app.use(cors());

const mongoURL = 'mongodb+srv://ducnvph36848:7M4SCX1qN09gCc4z@cluster0.g7rin.mongodb.net/libary';
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Schema Người dùng
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// API Đăng ký
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.send({ success: true });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// API Đăng nhập
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
            res.send({ token });
        } else {
            res.status(401).send({ error: 'Thông tin đăng nhập không chính xác' });
        }
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Schema Sách
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    genre: String,
    year: String,
    imageUrl: String
});
const Book = mongoose.model('Book', bookSchema);

// API lấy danh sách sách
app.get('/listBooks', async (req, res) => {
    try {
        const books = await Book.find({});
        res.send(books);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// API thêm sách
app.post('/addBook', async (req, res) => {
    const { title, author, genre, year, imageUrl } = req.body;
    const newBook = new Book({ title, author, genre, year, imageUrl });
    try {
        await newBook.save();
        res.send({ errorCode: 200, message: "Success" });
    } catch (err) {
        res.status(400).send({ errorCode: 400, message: err.message });
    }
});

// API xóa sách
app.delete('/deleteBook/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await Book.deleteOne({ _id: id });
        res.send({ errorCode: 200, message: "Success" });
    } catch (err) {
        res.status(400).send({ errorCode: 400, message: err.message });
    }
});

// Schema Phiếu bầu
const voteSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Vote = mongoose.model('Vote', voteSchema);

// API tạo phiếu bầu
app.post('/createVote', async (req, res) => {
    const { bookId, userId } = req.body;
    try {
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).send({ error: 'Sách không tồn tại' });
        }
        const vote = new Vote({ bookId, userId });
        await vote.save();
        res.send({ success: true });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// API cập nhật sách
app.post('/updateBook', async (req, res) => {
    const { id, title, author, genre, year, imageUrl } = req.body;
    try {
        await Book.updateOne({ _id: id }, { title, author, genre, year, imageUrl });
        res.send({ errorCode: 200, message: "Success" });
    } catch (err) {
        res.status(400).send({ errorCode: 400, message: err.message });
    }
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
