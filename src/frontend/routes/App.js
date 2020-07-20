import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "../containers/Home";
import Login from "../containers/Login";
import Register from "../containers/Register";
import NotFound from "../containers/NotFound";
import Player from "../containers/Player";
import Layout from "../components/Layout";

const App = ({ isLogged }) => {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path="/" component={isLogged ? Home : Login} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route
            exact
            path="/player/:id"
            component={isLogged ? Player : Login}
          />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </BrowserRouter>
  );
};

export default App;

//Al parecer no esta cargando este router
//Y como esta app se renderiza en index.js la cual es la que se renderiza en el lado del cliente
//Por lo tanto no estan cargando los estilos y no se estan creando los archivos .css
//Y solo carga del lado del ssr
