import axios from "axios"; //sirve para hacer peticiones a un servidor (como fetch)

export const setFavorite = (payload) => ({
  type: "SET_FAVORITE",
  payload,
});

export const deleteFavorite = (payload) => ({
  type: "DELETE_FAVORITE",
  payload,
});

export const loginRequest = (payload) => ({
  type: "LOGIN_REQUEST",
  payload,
});

export const logoutRequest = (payload) => ({
  type: "LOGOUT_REQUEST",
  payload,
});

export const registerRequest = (payload) => ({
  type: "REGISTER_REQUEST",
  payload,
});

export const getVideoSource = (payload) => ({
  type: "GET_VIDEO_SOURCE",
  payload,
});

export const registerUser = (payload, redirectUrl) => {
  return (dispatch) => {
    // este es el thunk de redux thunk
    axios
      .post("/auth/sign-up", payload)
      .then(({ data }) => dispatch(registerRequest(data))) //me ejecuta un dispatch registerRequest con la data
      .then(() => {
        window.location.href = redirectUrl;
      })
      .catch((err) => dispatch(setError(err)));
  };
};
export const loginUser = ({ email, password }, redirectUrl) => {
  return (dispatch) => {
    // este es el thunk de redux thunk
    axios({
      url: "/auth/sign-in",
      method: "post",
      auth: {
        username: email,
        password,
      },
    })
      .then(({ data }) => {
        //estos datos vienen de la respuesta del api server
        document.cookie = `email=${data.email}`;
        document.cookie = `name=${data.name}`;
        document.cookie = `id=${data.email}`;
        dispatch(loginRequest(data));
      })
      .then(() => {
        window.location.href = redirectUrl; //para redireccionar a la url
      })
      .catch((err) => console.log(err));
  };
};
