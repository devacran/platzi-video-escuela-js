require("ignore-styles"); //para que ignore hojas de estilos
require("@babel/polyfill"); //para poder trabajar con async await
require("asset-require-hook")({
  extensions: ["jpg", "png", "gif"],
  name: "/assets/[hash.[ext]",
});
require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-react"],
});
require("./server");
