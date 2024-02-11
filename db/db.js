const mongoose = require('mongoose')

const connectDB = () => {
  mongoose.connect('mongodb+srv://adarsh:adarsh@cluster0.o0dnsga.mongodb.net/video-chatting-app?retryWrites=true', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});
}

module.exports = {connectDB}