const CusPromise = require("./promise.js");

new CusPromise((resolve) => {
  setTimeout(() => {
    console.log(123);
    resolve();
  }, 2000);
});
