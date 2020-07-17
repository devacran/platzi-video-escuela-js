import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { createBrowserHistory } from "history";
import { Router } from "react-router";
// import initialState from './initialState'; //ya no hay initialSTate porque ya se puso del lado del servidor

import reducer from "./reducers";
import App from "./routes/App";

const preloadState = window.__PRELOADED_STATE__; //aqui accedemos al preload state que se establecio en el ssr
const history = createBrowserHistory();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  preloadState,
  composeEnhancers(applyMiddleware(thunk))
); //aqui creamos el store con el preloadstate y le aplicamos el middleware thunk

delete window.__PRELOADED_STATE__; //pero hay que borrarlo despues que creamos la store para que nadie pueda acceder a el despues en el navegador
//preloadState.user.id dara false por defecto porque no existe
ReactDOM.hydrate(
  <Provider store={store}>
    <Router history={history}>
      <App isLogged={preloadState.user.id} />
    </Router>
  </Provider>,
  document.getElementById("app")
);
//  <Router history={history}>  es el enrutador del lado del cliente
//el .hydrate es igual que el .render pero sirve para
//poner los eventos y otras cosas que no se pusieron en el servers side render
//por eso debe estar igual que alla solo que con hidrate
