import CusPromise from "./index";

new CusPromise((resolve) => {
  setTimeout(() => {
    console.log("resolve promise");
    resolve();
  }, 3000);
});
