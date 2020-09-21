const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/project-02';

mongoose
  .connect(MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log(`Connected to Mongo! Database: ${MONGODB_URI}`))
  .catch((error) => {
    console.error(`Error connecting to DB ${MONGODB_URI}`, error);
    process.exit(1);
  });
