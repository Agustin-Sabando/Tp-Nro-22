const path = require('path');
const db = require('../../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');
const axios = require('axios')


//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesAPIController = {
    'list': (req, res) => {
        db.Movie.findAll({
            include: ['genre']
        })
        .then(movies => {
            let respuesta = {
                meta: {
                    status : 200,
                    total: movies.length,
                    url: 'api/movies'
                },
                data: movies
            }
                res.json(respuesta);
            })
    },
    
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id,
            {
                include : ['genre']
            })
            .then(movie => {
                let respuesta = {
                    meta: {
                        status: 200,
                        total: movie.length,
                        url: '/api/movie/:id'
                    },
                    data: movie
                }
                res.json(respuesta);
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            include: ['genre'],
            where: {
                rating: {[db.Sequelize.Op.gte] : req.params.rating}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
        .then(movies => {
            let respuesta = {
                meta: {
                    status : 200,
                    total: movies.length,
                    url: 'api/movies/recomended/:rating'
                },
                data: movies
            }
                res.json(respuesta);
        })
        .catch(error => console.log(error))
    },
    create: (req,res) => {
        Movies
        .create(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            }
        )
        .then(confirm => {
            let respuesta;
            if(confirm){
                respuesta ={
                    meta: {
                        status: 200,
                        total: confirm.length,
                        url: 'api/movies/create'
                    },
                    data:confirm
                }
            }else{
                respuesta ={
                    meta: {
                        status: 200,
                        total: confirm.length,
                        url: 'api/movies/create'
                    },
                    data:confirm
                }
            }
            res.json(respuesta);
        })    
        .catch(error => res.send(error))
    },
    update: (req,res) => {
        let movieId = req.params.id;
        Movies.update(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            },
            {
                where: {id: movieId}
        })
        .then(confirm => {
            let respuesta;
            if(confirm){
                respuesta ={
                    meta: {
                        status: 200,
                        total: confirm.length,
                        url: 'api/movies/update/:id'
                    },
                    data:confirm
                }
            }else{
                respuesta ={
                    meta: {
                        status: 204,
                        total: confirm.length,
                        url: 'api/movies/update/:id'
                    },
                    data:confirm
                }
            }
            res.json(respuesta);
        })    
        .catch(error => res.send(error))
    },
    destroy: (req,res) => {
        let movieId = req.params.id;
        Movies
        .destroy({where: {id: movieId}, force: true}) // force: true es para asegurar que se ejecute la acción
        .then(confirm => {
            let respuesta;
            if(confirm){
                respuesta ={
                    meta: {
                        status: 200,
                        total: confirm.length,
                        url: 'api/movies/destroy/:id'
                    },
                    data:confirm
                }
            }else{
                respuesta ={
                    meta: {
                        status: 204,
                        total: confirm.length,
                        url: 'api/movies/destroy/:id'
                    },
                    data:confirm
                }
            }
            res.json(respuesta);
        })    
        .catch(error => res.send(error))
    },
    buscar: (req, res) => {
        let busqueda = req.body.titulo.split(' ').join('+')
        let response
        db.Movie.findOne({
            where: { title: req.body.titulo }
        })
            .then(resultado => {
                if (resultado!=null) {
                    response = {
                        meta: {
                            status: 200,
                            message: 'La película se halló en la base de datos de moviesDb'
                        },
                        data: resultado
                    }
                    res.status(200).json(response)
                } else {
                    axios.get('http://www.omdbapi.com/?apikey=e2fa6e61&t=' + busqueda)
                        .then(apiMovie => {
                            if (apiMovie.data.Response === 'True') {
                                let movie = {
                                    title: apiMovie.data.Title,
                                    rating: apiMovie.data.imdbRating,
                                    awards: apiMovie.data.Awards,
                                    length: apiMovie.data.Runtime,
                                    release_date: apiMovie.data.Released
                                }
                                response = {
                                    meta: {
                                        status: 200,
                                        message: 'La película se halló en la base de datos de imdb'
                                    },
                                    data: movie
                                }
                                res.status(200).json(response)
                            } else {
                                response = {
                                    meta: {
                                        status: 500,
                                        message: `No se logró hallar la película ${req.body.titulo} en ninguna base de datos`
                                    }
                                }
                                res.status(500).json(response)
                            }
                        })
                }
            })
            .catch(errors => res.status(500).json(`No se pudo acceder a la informacion de la película ${req.body.titulo}`))
    }
    
}

module.exports = moviesAPIController;