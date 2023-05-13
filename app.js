//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ajaykumarsr847123:Ajaykumar123@cluster0.guntb4s.mongodb.net/todoListDB");

// creating a schema
const itemSchema = {
	name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
	name: "Welcome to toDoList",
});

const item2 = new Item({
	name: "hit the  + button to add",
});

const item3 = new Item({
	name: "<-- Hit to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
	name: String,
	items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
	const temp = Item.find({})
		.then(function (foundItems) {
			// console.log(foundItems);
			// check if the length is 0 or not
			if (foundItems.length === 0) {
				Item.insertMany(defaultItems)
					.then(function () {
						// console.log("successfully saved to database");
					})
					.catch(function (err) {
						console.log(err);
					});

				// after the if condition is executed redirect to the same home page
				// but the next time it wont come into the if condition
				// because the elements will be added into the database
				res.redirect("/");
			} else {
				res.render("list", { listTitle: "Today", newListItems: foundItems });
			}
		})
		.catch(function (err) {
			console.log(err);
		});
});

app.post("/", function (req, res) {
	const itemName = req.body.newItem;
	const listName = req.body.list;

	const item = new Item({
		name: itemName,
	});

	if (listName === "Today") {
		item.save();
		res.redirect("/");
	} else {
		List.findOne({ name: listName })
			.then(function (foundList) {
				foundList.items.push(item);
				foundList.save();
				res.redirect("/" + listName);
			})
			.catch(function (err) {
				console.log(err);
			});
	}
});

app.post("/delete", function (req, res) {
	const checkedItemId = req.body.checkbox;
	const listName = req.body.listName;

	if (listName === "Today") {
		Item.findByIdAndRemove({ _id: checkedItemId })
			.then(function () {
				// console.log("successfully deleted");
				res.redirect("/");
			})
			.catch(function (err) {
				console.log(err);
			});
	} else {
		List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
			.then(function (foundList) {
				res.redirect("/" + listName);
			})
			.catch(function (err) {
				console.log(err);
			});
	}
});

app.get("/:customNameList", function (req, res) {
	customListName = _.capitalize(req.params.customNameList);

	List.findOne({ name: customListName })
		.then(function (foundList) {
			if (!foundList) {
				// create a new list
				const list = new List({
					name: customListName,
					items: defaultItems,
				});

				list.save();
				res.redirect("/" + customListName);
			} else {
				// show an existing list
				res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
			}
		})
		.catch(function (err) {
			console.log(err);
		});
});

app.get("/about", function (req, res) {
	res.render("about");
});

app.listen(3000, function () {
	console.log("Server started on port 3000");
});
