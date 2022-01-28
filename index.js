const express = require('express');

const app = express();

const mongoose = require('mongoose');
const dotenv = require('dotenv')
const cors = require('cors')
dotenv.config();
app.use(cors());

// router
const filmRoute = require('./routes/film');
const userRoute = require('./routes/user');
const authRoute = require('./routes/auth');


// env
const PORT = process.env.PORT || 4000;

//connect to DB
mongoose.connect(process.env.DB_CONNECT,
  {
    
  },
  () => {
    console.log('connect to DB successfully')
  }
  )

//routes
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(express.json({extend: true}));

//routes middleware
app.use('/api/film', filmRoute);
app.use('/api/user', userRoute);
app.use('/api/auth', authRoute);


app.listen(PORT, () => {
  console.log(`Server Up and running localhost:${PORT}`)
})
