import express from "express"; //El que crea el servidor
import dotenv from "dotenv"; //Para las variables de entorno global
import webpack from "webpack"; //webpack
import helmet from "helmet";

import React from "react";
import { renderToString } from "react-dom/server";
import { Provider } from "react-redux";
import { createStore, compose } from "redux";
import { renderRoutes } from "react-router-config"; //este va a recibir un array de rutas y es el que ayudara a renderizar toda la app
import { StaticRouter } from "react-router-dom";
import serverRoutes from "../frontend/routes/serverRoutes";
import reducer from "../frontend/reducers";

import cookieParser from "cookie-parser";
import boom from "@hapi/boom";
import passport from "passport";
import axios from "axios";

dotenv.config(); //Busca el archivo .env
const { ENV, PORT, API_URL, API_KEY_TOKEN } = process.env; //Aqui traigo las variables
// Agregamos las variables de timpo en segundos para el recordado de inicio de sesion
const THIRTY_DAYS_IN_SEC = 2592000;
const TWO_HOURS_IN_SEC = 7200;
const app = express(); //defino express como la app
//Para la autenticacion con passport
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
//Estrategia de autenticacion basic
require("./utils/auth/strategies/basic");
if (ENV === "development") {
  console.log("development mode");
  const webpackConfig = require("../../webpack.config.js"); //Aqui defino la config de webpack
  const webpackDevMiddleware = require("webpack-dev-middleware");
  const webpackHotMiddleware = require("webpack-hot-middleware");
  const compiler = webpack(webpackConfig); //Aqui le digo a webpack que use el webpackconfig
  const serverConfig = { port: PORT, hot: true }; //Aqui configuro el webpack middleware
  app.use(webpackDevMiddleware(compiler, serverConfig)); //Aqui le digo a express que use dev middleare con webpack
  app.use(webpackHotMiddleware(compiler));
} else {
  //Cuando esta en produccion usa el bundle generado en public
  app.use(express.static(`${__dirname}/public`)); //para decirle a express que use una carpeta publica llamada public
  app.use(helmet());
  app.use(helmet.permittedCrossDomainPolicies());
  app.disable("x-powered-by"); //sirve para que el navegador no pueda saber de donde nos estamos conectando
}

const setResponse = (html, preloadedState) => {
  return `<!DOCTYPE html>
    <html>
      <head>
        <link href='assets/app.css' rel='stylesheet' type='text/css'>
        <title>Platzi Video</title>
      </head>
      <body>
        <div id="app">${html}</div>
        <script>

        window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(
          /</g,
          "\\u003c"
        )}

        </script>
        <script type='text/javascript' src='assets/app.js'></script>
      </body>
    </html>`;
};
const renderApp = async (req, res) => {
  let initialState;
  const { token, email, id, name } = req.cookies;
  try {
    let movieList = await axios({
      url: `${API_URL}/api/movies`,
      headers: { Authorization: `Bearer ${token}` },
      method: "get",
    });
    movieList = movieList.data.data;
    initialState = {
      user: {
        id,
        email,
        name,
      },
      myList: [],
      trends: movieList.filter(
        (movie) => movie.contentRating === "PG" && movie._id
      ),
      originals: movieList.filter(
        (movie) => movie.contentRating === "G" && movie._id
      ),
    };
  } catch (err) {
    initialState = {
      user: {},
      myList: [],
      trends: [],
      originals: [],
    };
  }

  const store = createStore(reducer, initialState);
  const preloadState = store.getState(); //para enviar un estado inicial ya precargado
  const isLogged = initialState.user.id;
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        {renderRoutes(serverRoutes(isLogged))}
      </StaticRouter>
    </Provider>
  );
  res.send(setResponse(html, preloadState));
};

app.post("/auth/sign-in", async function (req, res, next) {
  //Para recordar el inicio de sesion
  const { rememberMe } = req.body;
  passport.authenticate("basic", function (error, data) {
    try {
      if (error || !data) {
        next(boom.unauthorized());
      }

      req.login(data, { session: false }, async function (error) {
        if (error) {
          next(error);
        }
        const { token, user } = data;
        //Aqui definimos una cookie con el token llamada token en nnuestro request
        res.cookie("token", token, {
          httpOnly: ENV !== "development", //si estamos en desarollo false
          secure: ENV !== "development", //si estamos en desarollo false
          // maxAge: rememberMe ? THIRTY_DAYS_IN_SEC : TWO_HOURS_IN_SEC, //para recordar inicio de sesion
          // Si el atributo rememberMe es verdadero la expiración será en 30 dias
          // de lo contrario la expiración será en 2 horas
        });
        //como respuesta mandamos al usuario al spa y ya con una cookie
        res.status(200).json(user);
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});
//axios es quien va acceder a esta ruta cuando se haga un submit en un form
//con la accion registerUser
app.post("/auth/sign-up", async function (req, res, next) {
  const { body: user } = req;

  try {
    const userData = await axios({
      url: `${API_URL}/api/auth/sign-up`,
      method: "post",
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
      },
    });

    res.status(201).json({
      email: user.email,
      name: user.name,
      id: userData.data.id,
    });
  } catch (error) {
    next(error);
  }
});

app.get("*", renderApp);
app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log(`server running at port ${PORT}`);
});
