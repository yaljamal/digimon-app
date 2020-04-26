'use strict';
require('dotenv').config();
const pg = require('pg');
const express = require('express');
const PORT = process.env.PORT || 3030;
const app = express();
const methodOverride = require('method-override');

const client = new pg.Client(process.env.DATABASE_URL)
const superagent = require('superagent');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');


// all rout 
app.get('/', getData);
app.post('/favorite', addToFav);
app.get('/fav', showFav);
app.get('/fav/:id', detailsFav);
app.delete('delete/:id', deleteFav);
app.put('update/:id', updateFav);


//update data in database
function updateFav(req, res) {
    let { name, img, level } = req.body;
    let sql = 'UPDATE digimon SET name=$1,img=$2,level=$3 WHERE id=$4;';
    let saveValues = [name, img, level, req.params.id];
    client.query(sql, saveValues)
        .then(res.redirect('/fav'));
}

//delete form database
function deleteFav(req, res) {
    let sql = 'DELETE FROM digimon WHERE id=$1;';
    let saveValues = [req.params.id];
    client.query(sql, saveValues)
        .then(res.redirect('/fav'));
}
// view details
function detailsFav(req, res) {
    let sql = 'SELECT * FROM digimon WHERE id=$1;';
    let saveValues = [req.params.id];
    return client.query(sql, saveValues)
        .then(result => {
            res.render('details', { result: result.rows })
        })

}
// view the favarte 
function showFav(req, res) {
    let sql = 'SELECT * FROM digimon;';
    return client.query(sql)
        .then(data => {
            res.render('fav', { data: data.rows });
        })

}

// add to favarte
function addToFav(req, res) {
    let { name, img, level } = req.body;
    let sql = 'INSERT INTO digimon (name,img,level) VALUES($1,$2,$3);';
    let saveValues = [name, img, level];
    return client.query(sql, saveValues)
        .then(() => {
            res.redirect('/fav');
        });
}

// take data from API
function getData(req, res) {
    let url = 'https://digimon-api.herokuapp.com/api/digimon';
    superagent(url)
        .then(data => {
            let itemes = data.body;
            let digimon = itemes.map(val => {
                return new Digimon(val);
            })
            res.render('index', { digimon: digimon });
        })

}

// constructor
function Digimon(digimon) {
    this.name = digimon.name;
    this.img = digimon.img;
    this.level = digimon.level;
}


app.get('*', (req, res) => {
    res.status(404).send('this rout dose not exisit');
})
client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`lisintin on port ${PORT} `);
        })
    })