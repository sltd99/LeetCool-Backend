const mongoose = require("mongoose");

//connect to db
(async () => {
  try {
    const connection = await mongoose.connect(
      process.env.DB_OLDER_CONNECTION_STRING,
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );
    if (connection) {
      console.log("DB Connection Success " + connection.connections[0].name);
    } else {
      console.log("DB Connection Fail" + "Error");
    }
  } catch (error) {
    console.log("Error");
  }
})();
