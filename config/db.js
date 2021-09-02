const mongoose = require("mongoose");

//connect to db
async function dbConnection() {
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
      return connection;
    } else {
      console.log("DB Connection Fail" + "Error");
    }
  } catch (error) {
    console.log("Error");
  }
}
async function dbClose(connection) {
  try {
    await connection.close();
  } catch (error) {
    console.log("Error");
  }
}

module.exports.dbConnection = dbConnection;
module.exports.dbClose = dbClose;
