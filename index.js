// Import node modules
const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const helmet = require('helmet');

// Users data
const users = require('./data/helpers/userDb.js');
const posts = require('./data/helpers/postDb.js');

// Name port
const port = 8250;

//Instanciate your server
const server = express();// creates the server

// Add GLOBAL MIDDLEWARE
server.use(express.json());// formatting our req.body obj
server.use(cors());// this neeeded to connect from react
server.use(logger ('combined'));// combined or tiny
server.use(helmet());

// MIDDLEWARE

// Make user name UPPERCASE
const allCaps = (req, res, next) => {
  req.body.name = req.body.name.toUpperCase();

  next();
}

//ROUTES

//Add home route
server.get('/', (req, res) => {
  res.send('You are HOME!');
});

// ========================USERS=========================

// Add GET ROUTE HANDLER to access the users
server.get('/api/users', (req, res) => {
  users.get()
    .then( allUsers => {
      console.log('\n** all users **', allUsers);
      res.status(200).json(allUsers);
    })
    .catch(err => res.status(500).send({ error: "All users information could not be retrieved." }));
});

//Add POST ROUTE HANDLER to add a user
server.post('/api/users', allCaps, (req, res) => {
  if(!req.body.name) {
   return res.status(400).send({ errorMessage: "Please provide name for user." });
  }
  else if(req.body.name.length > 128) {
    return res.status(400).send({error: " User name must be less than 128 characters"})
  }
  const { name } = req.body;
  const newUser = { name };
  users.insert(newUser)
        .then(newUser => {
        console.log(newUser);
        res.status(201).json(newUser);
      })
    .catch(err => res.status(500).send({ error: "There was an error while saving the user to the database" }));

  });

//Add DELETE ROUTE HANDLER to delete a user
server.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await users.remove(id);
    if (user === 0) {
      return res.status(404).json({ message: "The user with the specified ID does not exist." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "The user could not be removed" });
  }
});

//Add PUT ROUTE HANDLER to update a user's information...which right now is name
server.put('/api/users/:id', allCaps, async (req, res) => {
  if (!req.body.name) {
    return res.status(400).send({ errorMessage: "Please provide name for the user." });
   } try {
    await users.update(req.params.id, req.body);
    try {
    const user = await users.get(req.params.id);
    if (user.length === 0) {
      return res.status(404).send({ message: "The user with the specified ID does not exist." });
    } else {
      return res.status(200).json(user);
    }
   } catch (error) {
      return res.status(500).send({ error: "The user information could not be modified." });
   }
  } catch (error) {
    return res.status(500).send({ error: "The user information could not be modified." });
 }
});

// ========================POSTS=========================

// Add GET ROUTE HANDLER to access the posts
server.get('/api/posts', (req, res) => {
  posts.get()
    .then( allPosts => {
      console.log('\n** all posts **', allPosts);
      res.status(200).json(allPosts);
    })
    .catch(err => res.status(500).send({ error: "All posts information could not be retrieved." }));
});

//Add POST ROUTE HANDLER to add a post
server.post('/api/posts', (req, res) => {
  // Check that text and userId is present. If not return error message.
  if(!req.body.text || !req.body.userId) {
    return res.status(400).send({ errorMessage: "Please provide text and a userId for this post." });
   }
  // Next, check if the user exists in db. If not return error message.
  users
    .get(req.body.userId)
    .then(response => {
      // console.log(response)
      // return 
      if(response === undefined) {
        return res.status(400).send({message: "userId does not exist"});
      } 
    })

  // When both tests pass, submit request
  const { text, userId } = req.body;
  const newPost = { text, userId };
  posts
    .insert(newPost)
    .then(newPost => {
        // console.log(newPost);
        res.status(201).json(newPost);
      })
    .catch(err => res.status(500).send({ error: "There was an error while saving the post to the database" }));
});

//Add DELETE ROUTE HANDLER to delete a post
server.delete("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await posts.remove(id);
    if (post === 0) {
      return res.status(404).json({ message: "The post with the specified ID does not exist." });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "The post could not be removed" });
  }
});

//Add PUT ROUTE HANDLER to update the information in a post...which right now is text
server.put('/api/posts/:id', async (req, res) => {
  if (!req.body.text || !req.body.userId) {
    return res.status(400).send({ errorMessage: "Please provide text and userId for the post." });
   } try {
    await posts.update(req.params.id, req.body);
    try {
    const post = await posts.get(req.params.id);
    if (post.length === 0) {
      return res.status(404).send({ message: "The post with the specified ID does not exist." });
    } else {
      return res.status(200).json(post);
    }
   } catch (error) {
      return res.status(500).send({ error: "The post information could not be modified." });
   }
  } catch (error) {
    return res.status(500).send({ error: "The post information could not be modified." });
 }
});

// Call server.listen w/ a port of 8250
server.listen(port, () =>
  console.log(`\n=== API running on port ${port} ===\n`)
);