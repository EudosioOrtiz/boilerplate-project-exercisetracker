const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
  username : String
});
const user = mongoose.model('users', userSchema);

const exerciseSchema = new mongoose.Schema({
  user_id: {type: String, required: true},
  description : String,
  duration : Number,
  date : Date
});
const exercise = mongoose.model('exercise', exerciseSchema);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req,res) => {
  const newUser = req.body.username;
  const userDoc = {
    username : req.body.username,
  };
  var saveUser = new user(userDoc);
  const userSaved = await saveUser.save();
  res.json(userSaved);
});

app.get('/api/users', async (req, res)=>{
  const allUsers = await user.find();
  res.send(allUsers);
});

app.post('/api/users/:_id/exercises', async (req,res) => {
  const id = req.params._id;
  const {description,duration, date} = req.body;
  const userFinded = await user.findById(id);

  const exerciseDoc = {
    user_id: userFinded._id,
    description,
    duration,
    date: date ? new Date(date) : new Date(),
  };
  const saveExercise = new exercise(exerciseDoc);
  const exerciseSaved = await saveExercise.save();
  res.json({
    _id : userFinded._id,     
    username: userFinded.username,
    description: exerciseSaved.description,
    duration: exerciseSaved.duration,
    date: new Date(exerciseSaved.date).toDateString()     
  });
});

app.get('/api/users/:_id/logs', async (req,res) => {
  const id = req.params._id;
  const userFinded = user.findById(id)
  const exercisesFinded = exercise.find({user_id: id})
  console.log(exercisesFinded)  
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
