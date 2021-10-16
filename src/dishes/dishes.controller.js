const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: dishes });
}

function hasDishesProperty(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  if (!name || name === "")
  {
    return next({
      status: 400,
      message: "Dish must include a name",
    });
  }
  if (!description || description === "")
  {
    return next({
      status: 400,
      message: "Dish must include a description",
    });
  }
  if (!price)
  {
    return next({
      status: 400,
      message: "Dish must include a price",
    });
  }
  if (price < 0 || !Number.isInteger(price))
  {
    return next({
      status: 400,
      message: "Dish must have a price that is an interger greater than 0",
    });
  }
  if (!image_url || image_url === "")
  {
    return next({
      status: 400,
      message: "Dish must include a image_url",
    });
  }
  next();
}

function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(), // Increment last id then assign as the current ID
    name, description, price, image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish)
  {
    res.locals.dish = foundDish;
    return next()
  }
  next({
    status: 404,
    message: `Dish id does not exist: ${dishId}`,
  });
}

function read(req, res) {
  // const dishId = Number(req.params.dishId);
  // const foundDish = dishes.find((dish) => (dish.id === dishId));
  res.json({ data: res.locals.dish });
}


function update(req, res, next) {
  // const dishId = Number(req.params.disId);
  // const foundDish = dishes.find((dish) => dish.id === dishId);
  const { data: { name, description, price, image_url } = {} } = req.body;

  // update the flip
  // foundDish.result = result;
  res.locals.dish = {
    id: res.locals.dishId,
    name, description, price, image_url,
  }

  res.json({ data: res.locals.dish });
}

function dishIdIsValid(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  if (!id || id === dishId) //??? !id is there because the id property is not required, but if it there is an id property, then it has to match :dishId
  {
    res.locals.dishId = dishId;
    return next()
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

module.exports = {
  list,
  create: [hasDishesProperty, create],
  read: [dishExists, read],
  update: [dishExists, hasDishesProperty, dishIdIsValid, update]
}