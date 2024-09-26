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
 try {
  var saveUser = new user(userDoc);
  const userSaved = await saveUser.save();
  res.json(userSaved);
 } catch (error) {
  console.log(error)
 }
});

app.get('/api/users', async (req, res)=>{
  const allUsers = await user.find();
  res.send(allUsers);
});

app.post('/api/users/:_id/exercises', async (req,res) => {
  const id = req.params._id;
  const {description,duration, date} = req.body;

  try {
    const userFinded = await user.findById(id);
    if (!userFinded) {
      res.send("Could not find user")
    }else{
      const exerciseDoc = new exercise({
        user_id: userFinded._id,
        description,
        duration,
        date: date ? new Date(date) : new Date(),
      });
      const exerciseSaved = await exerciseDoc.save();
      res.json({
        _id : userFinded._id,     
        username: userFinded.username,
        description: exerciseSaved.description,
        duration: exerciseSaved.duration,
        date: new Date(exerciseSaved.date).toDateString()     
      });
    }

  } catch (error) {
    console.log(error)
    res.send("There was an error saving the exercise")
  }
});

app.get('/api/users/:_id/logs', async (req,res) => {
  const {from, to, limit} = req.query
  const id = req.params._id;
  const userFinded = await user.findById(id);
  
  //console.log(exercisesFinded[0])
  if (!userFinded) {
    res.send("Could not find user")
    return;
  }
  let dateObj = {}
  if(from){
    dateObj["$gte"] = new Date(from)
  }
  if(to){
    dateObj["$lte"] = new Date(to)
  }
  let filter = {
    user_id: id
  }
  if (from || to) {
    filter.date = dateObj
  }

  const exercisesFinded = await exercise.find(filter).limit(+limit ?? 500);
  const count = exercisesFinded.length

  const log =exercisesFinded.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString()
  }))
  res.json({
    username: userFinded.username,
    count,
    _id:userFinded._id,
    log
  })  
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

/*ou should provide your own project, not the example URL.
Waiting:2. You can POST to /api/users with form data username to create a new user.
Waiting:3. The returned response from POST /api/users with form data username will be 
an object with username and _id properties.
Waiting:4. You can make a GET request to /api/users to get a list of all users.
Waiting:5. The GET request to /api/users returns an array.
Waiting:6. Each element in the array returned from GET /api/users is an object literal 
containing a user's username and _id.
Waiting:7. You can POST to /api/users/:_id/exercises with form data description, duration, 
and optionally date. If no date is supplied, the current date will be used.
Waiting:8. The response returned from POST /api/users/:_id/exercises will be the user 
object with the exercise fields added.
Waiting:9. You can make a GET request to /api/users/:_id/logs to retrieve a 
full exercise log of any user.
Waiting:10. A request to a user's log GET /api/users/:_id/logs returns a user 
object with a count property representing the number of exercises that belong to that user.
Waiting:11. A GET request to /api/users/:_id/logs will return the user object 
with a log array of all the exercises added.
Waiting:12. Each item in the log array that is returned from GET /api/users/:_id/logs 
is an object that should have a description, duration, and date properties.
Waiting:13. The description property of any object in the log array that is 
returned from GET /api/users/:_id/logs should be a string.
Waiting:14. The duration property of any object in the log array that is returned 
from GET /api/users/:_id/logs should be a number.
Waiting:15. The date property of any object in the log array that is returned 
from GET /api/users/:_id/logs should be a string. Use the dateString format of the Date API.
Waiting:16. You can add from, to and limit parameters to a GET /api/users/:_id/logs 
request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. 
limit is an integer of how many logs to send back. */
