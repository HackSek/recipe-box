// imports
const express = require('express')
const path = require('path')
const parser = require('body-parser')
const exphbs = require('express-handlebars')
const pg = require('pg')
const application = express()
// setting up the database
const config = {
  user: 'user',
  database: 'database',
  password: 'password',
  port: 5432
}
const pool = new pg.Pool(config);
// setting up the dusk view engine
application.engine('handlebars', exphbs({
  defaultLayout: 'main'
}))
application.set('view engine', 'handlebars')
// setting up the public files
application.use(express.static(path.join(__dirname + 'public')))
// body-parser middleware
application.use(parser.json());
application.use(parser.urlencoded({
  extended: true
}))
// handling requests
application.get('/', function(request, response, nextMW) {
  pool.connect(function(err, client, done) {
    if (err) {
      console.log("couldn't connect to the database" + err);
    }
    client.query('SELECT * FROM recipes', function(err, result) {
      done();
      if (err) {
        console.log(err)
        response.status(400).send(err);
      }
      response.status(200).render('layout', {
        recipes: result.rows
      })
    })
  })
})
application.post('/add', function(request, response, nextMW) {
  pool.connect(function(err, client, done) {
    if (err) {
      console.log("error fetching client from pool" + err)
    }
    client.query('INSERT INTO recipes(recipe_name, recipe_ingredients, recipe_directions) VALUES($1, $2, $3)', [request.body.recipe_name, request.body.recipe_ingredients, request.body.recipe_directions])
    done()
    response.redirect('/')
  })
})
application.post('/edit', function(request, response, nextMW) {
  pool.connect(function(err, client, done) {
    if (err) {
      console.log("error fetching client from pool" + err)
    }
    client.query('UPDATE recipes SET recipe_name=$1, recipe_ingredients=$2, recipe_directions= $3 WHERE id = $4', [request.body.recipe_name, request.body.recipe_ingredients, request.body.recipe_directions, request.body.id])
    console.log(request.body)
    done();
    response.redirect('/')
  })
})
application.delete('/delete/:id', function(request, response, nextMW) {
  pool.connect(function(err, client, done) {
    if (err) {
      console.log("error fetching client from pool" + err)
    }
    client.query('DELETE FROM recipes WHERE id = $1', [request.params.id])
    done();
    response.sendStatus(200)
  })
})
// setting up the server to listen
application.listen(process.env.PORT || 5500, function() {
  console.log('listening ...')
})