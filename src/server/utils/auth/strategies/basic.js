const passport = require("passport");
const { BasicStrategy } = require("passport-http");
const boom = require("@hapi/boom");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
const { API_URL, API_KEY_TOKEN } = process.env; //Para tener aqui las var de entorno
passport.use(
  new BasicStrategy(async function (email, password, cb) {
    try {
      //Esto es lo que se hacia en postman de forma manual (info en el readme de routes/auth de api-server)
      const { data, status } = await axios({
        url: `${API_URL}/api/auth/sign-in`,
        method: "post",
        auth: {
          password,
          username: email,
        },
        data: {
          //El api key aqui sera la que tiene permisos publicos
          apiKeyToken: API_KEY_TOKEN,
        },
      });

      if (!data || status !== 200) {
        return cb(boom.unauthorized(), false);
      }
      //la data es el token y la informacion del usuario
      //la misma que se guardara en una cookie
      return cb(null, data);
    } catch (error) {
      cb(error);
    }
  })
);
