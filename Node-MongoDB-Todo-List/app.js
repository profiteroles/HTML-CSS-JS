//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useUnifiedTopology: true, useNewUrlParser: true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Make a Todo List",
});

const item2 = new Item({
  name: "Make a + button to add new item",
});
const item3 = new Item({
  name: "Make - button to delete an items",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: {
    type: String,
    required: true
  },
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {



  Item.find({}, function (err, docs) {
    if (docs.length === 0) {
      Item.insertMany(defaultItems, function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log("Happy Days");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: docs });
    }
  });
});

app.post("/", function (req, res) {
  const listName = req.body.list;
  const newItem = new Item({ name: req.body.newItem });

  if (listName === "Today") {
    newItem.save();
    res.redirect('/');
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const listName = req.body.listName;
  if (listName == "Today") {
    Item.findByIdAndRemove(req.body.completedItem, function (err) {
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      {
        $pull: {
          items: {
            _id: req.body.completedItem
          }
        }
      }
      , function (err, foundList) {
        res.redirect("/" + listName);
      });
  }
});

app.get('/:customListRoute', function (req, res) {
  const routeName = _.capitalize(req.params.customListRoute);


  List.findOne({ name: routeName }, function (err, docs) {
    if (!err) {
      if (!docs) {
        const list = new List({
          name: routeName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + routeName);
      } else {
        console.log("Already exist!");
        res.render("list", { listTitle: docs.name, newListItems: docs.items });
      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});