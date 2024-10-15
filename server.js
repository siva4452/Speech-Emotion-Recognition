const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const port = 3000;

// Your Firebase credentials
var serviceAccount = require('./key.json');

// Initialize Firebase app
initializeApp({
  credential: cert(serviceAccount),
});

// Get Firestore instance
const db = getFirestore();

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serving static files from the 'public' directory
app.use(express.static('public'));

// Routes

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/registration.html');
});




app.get('/registration', (req, res) => {
  res.sendFile(__dirname + '/registration.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.get('/main', (req, res) =>{
  res.sendFile(__dirname + '/main.html');
});

app.get('/phonepay', (req, res) =>{
  res.sendFile(__dirname + '/phonepay.html');
});

app.get('/gpay', (req, res) =>{
  res.sendFile(__dirname + '/gpay.html');
});

app.get('/paytm', (req, res) =>{
  res.sendFile(__dirname + '/paytm.html');
});

app.get('/loginsubmit', async (req, res) => {
  try {
    const querySnapshot = await db
      .collection('LoginDetails')
      .where('username', '==', req.query.username)
      .get();

    if (querySnapshot.size === 1) {
      const doc = querySnapshot.docs[0];
      if (doc.data().password === req.query.password) {
        res.sendFile(__dirname + '/main.html');
      } else {
        res.sendFile(__dirname + '/logininvalid.html');
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/signupsubmit', async (req, res) => {
  try {
    await db.collection('LoginDetails').add({
      username: req.query.name,
      password: req.query.mobile,
    });
    res.sendFile(__dirname + '/signupsuccess.html');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/video', (req, res) => {
  res.sendFile(__dirname + '/main.html');
});

app.post('/upload', upload.single('audioFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided.' });
    }

    // Save the audio data to a temporary file
    const fileName = 'temp_audio.wav';
    fs.writeFileSync(fileName, req.file.buffer);

    // Run the Python code using spawn
    const pythonProcess = spawn('python', ['npredict.py', fileName]);

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);

      // Cleanup: Remove the temporary file
      fs.unlinkSync(fileName);

      console.log(pythonOutput,pythonError)
      res.json({pythonOutput})
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});