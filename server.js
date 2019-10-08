const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressSession = require('express-session');
const expressHandlebars = require('express-handlebars');

// Array para guardar temporalmente usuarixs (esto debería estar en base de datos)
let listaUsr = [];

const app = express();

// Configuración de Handlebars
app.engine('handlebars', expressHandlebars({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layout')
}));
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'));


// Configuración de sesiones
app.use(expressSession({
  secret: 'el tiempo sin ti es empo',
  resave: false,
  saveUninitialized: false
}));

// Middleware de body-parser para form
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para recursos estáticos.
app.use(express.static(path.join(__dirname, 'public')));


// GET /
app.get('/', (req, res) => {
  console.log("GET /");
  if (req.session.usuarix) {
    res.render('home', {nombre: req.session.usuarix})
  } else {
    res.render('login');
  }
});


// POST /login
app.post('/login', (req, res) => {

  console.log("POST /login", req.body);

  if (req.body.usuarix && req.body.password) {

    validarUsuarix(req.body.usuarix, req.body.password, resultado => {

      if (resultado) {
        // Si validó bien, guardo la sesión y voy al home
        req.session.usuarix = req.body.usuarix;
        res.render('home', { nombre: req.session.usuarix });
      } else {
        // Si validó mal, destruyo la sesión (por si la hubiera) y recargo página inicial
        req.session.destroy();
        res.render('login', { mensaje: 'Usuarix/clave incorrectxs.', tipo: 'error' })
      }

    });

  } else {
    // Lo mismo si el usuarix o clave no fueron enviados
    req.session.destroy();
    res.render('login', { mensaje: 'Ingrese usuarix y clave', tipo: 'error' });
  }

});


// GET /registrar
// Retorna la vista de registro
app.get('/registrarse', (req, res) => {
  console.log("GET /registrarse");
  res.render('registro');
});


// POST /registrar
// Procesa información del formulario de registro
app.post('/registrar', (req, res) => {

  console.log('POST /registrar', req.body);

  // Verifico que estén todos los datos
  if (req.body.usuarix && req.body.password && req.body.passwordRep) {

    // Verifico que la clave y su repetición coincidan
    if (req.body.password == req.body.passwordRep) {

      // Se llama a la función que guarde el registro
      registrarUsuarix(req.body.usuarix, req.body.password, resultado => {
        console.log(`Registro exitoso: ${resultado}`);
        if (resultado) {
          // Si guardó bien usuarix nuevx, redirijo al login
          req.session.destroy();
          res.render('login', { mensaje: 'Usuarix registrado correctamente', tipo: 'exito' });
        } else {
          // Si validó mal, destruyo la sesión (por si la hubiera) y recargo página de registro
          req.session.destroy();
          res.render('registro', { mensaje: 'Datos incompletos', tipo: 'error' });
        }
      });

    } else {

      // Si las claves no coinciden, se retorna la vista de registro y se indica el mensaje correspondiente.
      req.session.destroy();
      res.render('registro', { mensaje: 'Las claves ingresadas no coinciden.', tipo: 'error' });

    }

  } else {

    // Si faltó algún dato, reenvío vista de registro con el mensaje
    req.session.destroy();
    res.render('registro', { mensaje: 'Debe completar el formulario para registrarse.', tipo: 'error' });

  }

});


// GET logout
app.get('/logout', (req, res) => {

  console.log("GET /logout");
  
  // Destruyo sesión y redirijo al login.
  req.session.destroy();
  res.render('login');

});


// Server iniciado en puerto 3000
app.listen(3000, () => {
  console.log('Escuchando puerto 3000 con Express');
});


/**
 * Valida usuarix/clave contra la lista de usuarixs registradxs (que en este
 * ejemplo es un array en memoria, debería ser base de datos)
 * 
 * @param {string} usr Usuarix
 * @param {string} pwd Clave
 * @param {function} callback Función de callback, se le pasa true o false
 */
function validarUsuarix(usr, pwd, callback) {

  let usuarix = listaUsr.find(item => item.nombre == usr);

  if (usuarix) {

    if (usuarix.password == pwd) {
      callback(true);
    } else {
      callback(false);
    }

  } else {

    callback(false);

  }

}


/**
 * Registra usuarix nuevo en la lista de usuarixs (que en este
 * ejemplo es un array en memoria, debería ser base de datos)
 * 
 * @param {string} usr Usuarix
 * @param {string} pwd Clave
 * @param {function} callback Función de callback, se le pasa true o false
 */
function registrarUsuarix(usr, pwd, callback) {

  listaUsr.push({
    nombre: usr,
    password: pwd
  });

  console.log("listaUsr:", listaUsr);

  callback(true);

}