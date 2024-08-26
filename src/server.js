const express = require("express");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require("cors");
const cron = require("node-cron")
const HttpException = require('./utils/HttpException.utils');
const errorMiddleware = require('./middleware/error.middleware');
const userRouter = require('./routes/api/user.route');
const walletRouter = require('./routes/api/wallet.route');
const subscriberRouter = require('./routes/api/subscriber.route');
const ieo = require('./routes/api/ieo.route');
const p2p = require('./routes/api/p2p.route');
const WalletService = require('./services/wallet.service');
cron.schedule('*/10 * * * *', () => {
  WalletService.updateTopTokens().then(() => {
    console.log("Top Token data updated")
  })
});

// Init express
const app = express();
// Init environment
dotenv.config();
// parse requests of content-type: application/json
// parses incoming requests with JSON payloads
app.use(express.json());
app.use(cookieParser());

// added by david
const path = require('path')
app.use(express.static(path.join(__dirname + "public")))

app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.json({limit: '50mb'}))

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  // console.log(req.path, req.method)
  next()
})

// enabling cors for all requests by using cors middleware
app.use(cors());
// Enable pre-flight
app.options("*", cors());
app.use(
    session({
      key: "user_sid",
      secret: "supersecret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        expires: 86400000,
      },
    })
  );

const port = Number(process.env.PORT || 3000);
app.use(cookieParser());

app.use(`/api/users/`, userRouter);
app.use(`/api/wallets/`, walletRouter);
app.use(`/api/subscribers`, subscriberRouter);
app.use(`/api/ieo`, ieo);
app.use(`/api/p2p`, p2p);

// 404 error
app.all('*', (req, res, next) => {
    const err = new HttpException(404, 'Endpoint Not Found');
    next(err);
});

// Error middleware
app.use(errorMiddleware);

// starting the server
app.listen(port, () =>
    console.log(`🚀 Server running on port ${port}!`));


module.exports = app;