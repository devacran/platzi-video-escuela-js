SI ESTÁS TRABADO, LEE ESTO QUE A LO MEJOR TE APORTA EL GRANITO DE ARENA QUE NECESITÁS

CANTIDAD DE SERVIDORES ANDANDO Y COMPORTAMIENTO

Actualmente en este curso se están utilizando dos servers… uno de Server Side Rendering (SSR) y otro que es una API.
El SSR lo tiene andando en localhost, pero el API lo tiene subido a Now.

Si quieres, puedes subir tu API a Now o puedes hacerla andar en paralelo en otra terminal en tu propio ordenador (yo primero lo hice local, y luego lo subí para entenderlo 100% y poder hacer pruebas)
Si bien tenemos dos BasicStrategies en este proceso (una en SSR y otra en la API), el procesamiento de la autentificación la hace el servidor de la API.
.
Vale la pena destacar que no nos comunicamos en forma directa con el servidor de la API desde el Cliente o las Acciones de React, sino que el SSR es el que envía las peticiones a la API.
.
El flujo sería:
Cliente (Acciones de React) > SSR > API > SSR > Cliente (Acciones de React)
.
PROCESO DE AUTENTIFICACIÓN
.
Reitero, las acciones de React no se comunican con la API, sino que se comunican primero a una ruta del SSR (notarás la ruta “/auth/signup”, que es totalmente local), y esta ruta del SSR esta scripteada para enviar un request a la API (notarás la ruta “${apiURL}/api/auth/signup”, que hace referencia a la URL remota, con código totalmente distinto a la local).
.
Dependiendo de si es SIGN-UP o si es SIGN-IN, el comportamiento entre SSR y API son distintos.
.
DESGLOSE DEL PROCESO DESDE QUE EL USUARIO INGRESA SUS DATOS
.

Action de React/Cliente
Llama a “/auth/sign-up” [servidor local] y le pasa lo que hay en el form.
.
Request de SSR
Se desencadena al entrar a “/auth/sign-up”, gracias a “app.post(’/auth/sign-up”)".
Dependiendo de cada caso, aquí el SSR hará cosas distintas.
.
► Si es un SIGN-UP simplemente le pasará la data ‘email’, ‘name’ y ‘password’ a la API para que ejecute el servicio createUser(). Una vez creado el usuario, se devuelve el createdUserId en el data. Esto actualmente no lo usamos para nada, pero se dispatchea en el cliente.
.
► Si es un SIGN-IN ejecutará la BasicStrategy de autenticación desde el lado del SSR, que es en sí un request a la API pasándo el ‘email’, el ‘password’ y la ‘API_KEY_TOKEN’ que tenemos de variable de entorno. Si, nada más. El resto del proceso lo hace la API.
.
La API recibe el request en “/api/auth/sign-in” y ejecuta la BasicStrategy de autenticación desde el lado de la API.
.
Lo que hará la API es usar el API_KEY_TOKEN para obtener una API_KEY alojada en su propia base de datos, y luego utilizarla para poder generar un JSON WEB TOKEN (que no es lo mismo que API_KEY_TOKEN, NI API_KEY) que es el que efectivamente vuelve al SSR adentro de req.login(data) para generar la famosa cookie.
.
El SSR es el que se encarga de tomar el JSON WEB TOKEN que entrego en el response la API y generar una cookie mediante ‘res.cookie’, devolviendo status(200).
.
Esto no termina acá… el data que nos devolvió la API, con el JSON WEB TOKEN vuelve hacia el Action de React para popular el document.cookie y finalmente dispatchear el data.user.
.
Con esta data deberías poder debuggear tu proyecto. La manera en la que pude terminar de entenderlo, es generar console.logs en cada uno de los pasos y a prueba y error ir verificando en que punto el programa se colgaba.
.
Éxitos!
