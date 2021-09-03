require("dotenv/config");
require("./config/db");
require("./timer_task/rules");
var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes");
var questionRouter = require("./routes/question");
var userRouter = require("./routes/user");
var callTaksRouter = require("./routes/call_taks");
var app = express();
const cors = require("cors");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/questions", questionRouter);
app.use("/users", userRouter);
app.use("/call-tasks", callTaksRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
