import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(express.static(`./static`));
app.use(bodyParser.json());
app.use(cors());

app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));
app.use(passport.initialize());
app.use(passport.session());

export default app;
