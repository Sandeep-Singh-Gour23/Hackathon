// Express app dependencies.

const express = require("express");
const bodyParser  = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const  moment = require('moment');
const fileUpload=require("express-fileupload");

// Express Router Initialize
const router = express.Router();

// Knex and Objection dependencies.
// knex file for database setup. Information regarding databases are stored in this file.
const knexConfig = require("./knexfile");           
const Knex = require("knex");
const { Model } = require("objection");

// Initialize knex.
const knex = Knex(knexConfig[process.env.NODE_ENV || 'development']);
Model.knex(knex);

// Express middlewares { body-parser, cors, morgan... }
const app = express()
  .use(bodyParser.json())
  .use(morgan('dev'))
  .use(router)
  .use(cors({
    credentials: true,
    origin: (origin, callback) => callback(null, true),
  }))
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));


// Import API Routes.
const userRoutes = require("./src/routes/index");
// Add routes as middleware.
app.use("/user",userRoutes);





console.log("moment object : - ",moment());

// Port for Server
const port = process.env.PORT || 8000;


// Express Server 
const server = app.listen(port, () => {
    console.log('Server listening at port %s', port);
  });
  