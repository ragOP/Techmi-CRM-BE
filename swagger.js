const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
    description: "My API Description",
  },
};
const authRoutes = require("./routes/auth/index.js");

const options = {
  swaggerDefinition,
  apis: [
    "./routes/auth/index.js",
    "./routes/category/index.js",
    "./routes/service/index.js",
  ],
  //   apis: ["./routes/*.js"], // Path to the API routes in your Node.js application
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
