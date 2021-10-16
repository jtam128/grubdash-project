const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: orders });
};

function hasOrdersProperty(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  if (!deliverTo || deliverTo === "")
  {
    return next({ status: 400, message: "Order must include a deliverTo" });
  }
  if (!mobileNumber || mobileNumber === "")
  {
    return next({ status: 400, message: "Order must include a mobileNumber" });
  }
  if (!dishes)
  {
    return next({ status: 400, message: "Order must include a dish" });
  }
  if (!Array.isArray(dishes) || !dishes.length)
  {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }
  dishes.map((dish, index) => {
    if (!dish.quantity || dish.quantity < 0 || !Number.isInteger(dish.quantity))
    {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0.`,
      });
    }
  });
  res.locals.order = req.body.data;
  next();
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo, mobileNumber, dishes, status: status ? status : "pending",
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder)
  {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id does not exist: ${orderId}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function update(req, res) {
  const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;
  res.locals.order = {
    id: res.locals.order.id,
    deliverTo, mobileNumber, dishes, status,
  };
  res.json({ data: res.locals.order });
};

function idAndStatusIsValid(req, res, next) {
  const { orderId } = req.params;
  const { data: { id, status } = {} } = req.body;
  if (id && id !== orderId)
  {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
    })
  }
  if (!status || status === "" || (status !== "pending" && status !== "preparing" && status !== "out-for-delivery"))
  {
    return next({
      status: 400,
      message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
    })
  }
  if (status === "delivered")
  {
    return next({
      status: 400,
      message: "A delivered order cannot be changed"
    })
  }
  next();
};

function destroy(req, res) {
  const index = orders.indexOf(res.locals.order);
  orders.splice(index, 1);
  res.sendStatus(204);
}

function destroyIsValid(req, res, next) {
  if (res.locals.order.status !== "pending")
  {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }
  next();
}

module.exports = {
  list,
  create: [hasOrdersProperty, create],
  read: [orderExists, read],
  update: [hasOrdersProperty, orderExists, idAndStatusIsValid, update],
  delete: [orderExists, destroyIsValid, destroy],
}