const express = require(`express`);
const session = require(`express-session`);
const xlsx = require(`xlsx`);

// express
const app = express();
const port = 3000;

app.set(`view engine`, `ejs`);
app.use(express.static(`public`));
app.use(express.urlencoded({ extended: true }));

// session storing
const generateUUID = () => {
  let uuid = ``;
  const characters = `abcdef0123456789`;

  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += `-`;
    } else {
      uuid += characters[Math.floor(Math.random() * characters.length)];
    }
  }

  return uuid;
};

app.use(
  session({
    secret: generateUUID(), // uuid later
    saveUninitialized: false,
    resave: false,
  })
);

// xlsx
const workbook = xlsx.readFile(`pharma-sample-data.xlsx`);
const sheet1 = workbook.SheetNames[0];
const itemSheet = workbook.Sheets[sheet1];
const itemsJson = xlsx.utils.sheet_to_json(itemSheet);

// routing
app.listen(port, () => {
  console.log(`\n---------------------`);
  console.log(`http://localhost:3000`);
  console.log(`---------------------`);
});

app.get(`/`, (req, res) => {
  const results = req.session.results || [];

  res.render(`index`, {
    results: results,
  });
});

app.post(`/`, (req, res) => {
  const query = req.body.searchQuery;
  const matchedItems = searchItem(query);

  req.session.results = matchedItems;

  res.redirect(`/`);
});

const searchItem = (query) => {
  const matchedItems = [];

  itemsJson.forEach((item) => {
    if (item[`Item Name`].toLowerCase().includes(query.toLowerCase())) {
      matchedItems.push(item);
    }
  });

  return matchedItems;
};
