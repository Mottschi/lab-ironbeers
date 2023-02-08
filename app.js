const express = require('express');

const hbs = require('hbs');
const path = require('path');
const PunkAPIWrapper = require('punkapi-javascript-wrapper');

const app = express();
const punkAPI = new PunkAPIWrapper();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));


app.use(async (req, res, next) => {
  console.log('Rate Limit:', await punkAPI.getRateLimitRemaining());
  next();
})

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/beers/beer-:beerId', async (req, res, next) => {
  try {
    const beerId = req.params.beerId;
    const raw = (await punkAPI.getBeer(beerId));
    if (raw.statusCode === 404) throw Error('No Beer with this ID found');
    const beer = raw[0];
    res.locals.title = beer.name;
    res.locals.beer = beer;
    res.render('beer');
  } catch (error) {
    next(error);
  }
})

app.get('/beers', async (req, res, next) => {
  try {
    const beers = await punkAPI.getBeers();
    res.locals.beers = beers;
    res.locals.title = "Beers";
    res.render('beers');
  } catch (error) {
    next(error)
  }
});

app.get('/random-beer', async (req, res, next) => {
  try {
    const beer = (await punkAPI.getRandom())[0];
    res.locals.beer = beer;
    res.locals.title = 'Random Beer';
    res.render('random-beer');
  } catch (error) {
    next(error)
  }
});

app.use((error, req, res, next) => {
  console.log('ERROR:', error.message);
})

app.listen(3000, () => console.log('🏃‍ on port 3000'));
