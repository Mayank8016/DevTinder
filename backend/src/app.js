require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const initSocket = require('./utils/socket');

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/', require('./routes/authrouter'));
app.use('/', require('./routes/profile'));
app.use('/', require('./routes/request'));
app.use('/', require('./routes/user'));
app.use('/', require('./routes/chat'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));

const server = http.createServer(app);
initSocket(server);

connectDB()
  .then(() => {
    console.log('Database connected successfully');
    server.listen(process.env.PORT || 3000, () => console.log('Server running'));
  })
  .catch((err) => console.log('Error in connecting to database: ' + err.message));
