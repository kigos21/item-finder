const express = require(`express`);
const session = require(`express-session`);
const xlsx = require(`xlsx`);

// express
const app = express();
const port = 3000;

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

const searchItem = (query) => {
  const matchedItems = [];

  itemsJson.forEach((item) => {
    if (item[`Item Name`].toLowerCase().includes(query.toLowerCase())) {
      matchedItems.push(item);
    }
  });

  return matchedItems;
};

const loadXlsxJson = () => {
  const workbook = xlsx.readFile(`pharma-sample-data.xlsx`);
  const sheet1 = workbook.SheetNames[0];
  const itemSheet = workbook.Sheets[sheet1];
  const itemsJson = xlsx.utils.sheet_to_json(itemSheet);

  return itemsJson;
};

// global-scoped array of JSON object (data)
let itemsJson = loadXlsxJson();

app.set(`view engine`, `ejs`);
app.use(express.static(`public`));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: generateUUID(), // uuid later
    saveUninitialized: false,
    resave: false,
  })
);

// routing
app.get(`/`, (req, res) => {
  const results = req.session.results || itemsJson;

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

app.get(`/restart`, (req, res) => {
  itemsJson = loadXlsxJson();
  res.redirect(`/`);
});

app.listen(port, () => {
  console.log(`\n---------------------`);
  console.log(`http://localhost:3000`);
  console.log(`---------------------`);
});
