/*** Importing modules ***/
const express = require('express');
const morgan = require('morgan');                                  // logging middleware
const cors = require('cors');

const { check, validationResult, } = require('express-validator'); // validation middleware

const pageDao = require('./dao-pages'); // module for accessing the pages table in the DB
const userDao = require('./dao-users'); // module for accessing the user table in the DB

/*** init express and set-up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));


/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if (!user)
    return callback(null, false, 'Incorrect username or password');

  return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name 
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name 
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));

  return callback(null, user); // this will be available in req.user
});

/** Creating the session */
const session = require('express-session');

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
}


/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};


/*** Users APIs ***/

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json({ error: info });
    }
    // success, perform the login and extablish a login session
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser() in LocalStratecy Verify Fn
      return res.json(req.user);
    });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Not authenticated' });
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});


/*** Pages APIs ***/


app.get('/api/name',
  async (req, res) => {
    try {
      const result = await pageDao.getName();
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result);
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  }
);

app.post('/api/name',
  async (req, res) => {

    if(req.body.admin === true) {
    try {
      const result = await pageDao.setName(req.body.name);
      if (result.error)
        res.status(404).json(result);
      else
      res.json(result);
    } catch (err) {
      res.status(500).end();
    }
  }
  else {
    res.status(401).json({message : "unauthorized"});
  }
  }
);

app.get('/api/pages',
  (req, res) => {
    pageDao.listPages()
      .then(pages => { res.json(pages) })
      .catch((err) => res.status(500).json(err)); 
  }
);

app.get('/api/blocks/:id',
  (req, res) => {
    // get blocks
    pageDao.listBlocks(req.params.id)
      // NOTE: "invalid dates" (i.e., missing dates) are set to null during JSON serialization
      .then(blocks => { res.json(blocks) })
      .catch((err) => res.status(500).json(err)); // always return a json and an error message
  }
);


app.get('/api/pages/:id',
  async (req, res) => {
    try {
      const result = await pageDao.getPage(req.params.id);
      if (result.error)
        res.status(404).json(result);
      else
        // NOTE: "invalid dates" (i.e., missing dates) are set to null during JSON serialization
        res.json(result);
    } catch (err) {
      res.status(500).end();
    }
  }
);


app.post('/api/pages',
  [
    check('page.title').isLength({ min: 1, max: 160 }),
  ],
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    // WARN: note that we expect watchDate with capital D but the databases does not care and uses lowercase letters, so it returns "watchdate"
    const page = {
      title: req.body.page.title,
      author: req.body.page.author,
      creationDate: req.body.page.creationDate, // A different method is required if also time is present. For instance: (req.body.watchDate || '').split('T')[0]
      publicationDate: req.body.page.publicationDate,
    };

    try {
      // req.body contains the page with all attributes
      const result = await pageDao.createPage(page); // NOTE: createFilm returns the new created object
      for (const block of req.body.blocks) {
        let new_block = { ...block, page_fk: result.id };
      const resultBlocks = await pageDao.createBlocks(new_block);
      };
      res.json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new page: ${err}` });
    }
  }
);


app.post('/api/blocks/',
  [
    //check('title').isLength({min: 1, max:160}),
    // only date (first ten chars) and valid ISO

  ],
  async (req, res) => {
    // Is there any validation error?
    /* const errors = validationResult(req).formatWith(errorFormatter); // format error message
     if (!errors.isEmpty()) {
       return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
     }*/

    const added_block = {
      type: req.body.type,
      content: req.body.content,
      position: req.body.position, 
      page_fk: req.body.page_fk,
    };

    try {
      const result = await pageDao.createBlocks(added_block);
      res.json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new film: ${err}` });
    }
  }
);

app.delete('/api/blocks/:pageId',
  async (req, res) => {
    // Is there any validation error?
    /* const errors = validationResult(req).formatWith(errorFormatter); // format error message
     if (!errors.isEmpty()) {
       return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
     }*/

    // WARN: note that we expect watchDate with capital D but the databases does not care and uses lowercase letters, so it returns "watchdate"
    try {
      const result = await pageDao.deleteBlocks(req.params.pageId); // NOTE: createFilm returns the new created object
      res.json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new film: ${err}` });
    }
  }
);


app.put('/api/pages/:id',
  [
    /* check('id').isInt(), */
  ],
  async (req, res) => {

    // i have to: delete all blocks
    // 1) delete all old blocks
    // 2) update a single page
    // 3) add all new blocks 

    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    const page = {
      id: req.params.id,
      title: req.body.page.title,
      author: req.body.page.author,
      creationDate: req.body.page.creationDate,
      publicationDate: req.body.page.publicationDate,
    };

    try {
      const del = await pageDao.deleteBlocks(page.id);
      const result = await pageDao.updatePage(page.id, page);
      for (const block of req.body.blocks) {
        let new_block = { ...block, page_fk: result.id };
      const resultBlocks = await pageDao.createBlocks(new_block);
      };
        res.json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the update of page ${req.params.id}: ${err}` });
    }
  }
);

app.delete('/api/pages/:id',
  [check('id').isInt()],
  async (req, res) => {
    try {
      await pageDao.deletePage(req.params.id);
      res.status(200).json({});
    } catch (err) {
      res.status(503).json({ error: `Database error during the deletion of film ${req.params.id}: ${err} ` });
    }
  }
);


// Activating the server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
