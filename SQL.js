//-----mySQL DATA ACCESS OBJECT
var mysql = require('promise-mysql')

var pool
//-----CREATES MYSQL POOL
//-----CONNECTED TO THE GEOGRAPHY DB
mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Wudoeendoa1*',
    database: 'geography'
})
    .then((result) => {
        pool = result
    })
    .catch((error) => {
        reject(error) // error handling when db is offline
    });

//-----DISPLAYS THE LIST OF ALL CITIES IN DATABASE
var cityDetails = function () {
    return new Promise((resolve, reject) => {
        pool.query('select * from city') //query that returns specified parameters
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

//-----DISPLAYS THE LIST OF ALL COUNTRIES IN DATABASE
var countryDetails = function () {
    return new Promise((resolve, reject) => {
        pool.query('select * from country') //query that returns all countries in the db
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}
//-----GETS DETAILS FOR SELECTED CITY
var getDetails = function (cty_code) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'SELECT city.cty_code, city.cty_name, city.population,city.isCoastal,city.areaKM, country.co_name,country.co_code FROM city INNER JOIN country ON country.co_code = city.co_code WHERE cty_code = ?',
            values: [cty_code]
        }
        pool.query(myQuery)
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}
//-----SEARCH
var searchCountry = function (co_name) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'SELECT * FROM country WHERE co_name LIKE "?%" ',
            values: [co_name]
        }
        pool.query(myQuery)
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

//-----FUNCTION ADDS THE COUNTRY
var addCountry=function(co_code, co_name, co_details){
    return new Promise((resolve,reject)=>{
        var addQuery ={
            sql: 'INSERT INTO country (co_code,co_name,co_details) VALUES (?,?,?)',
            values:[co_code,co_name,co_details]
        }
        pool.query(addQuery)
        .then((result)=>{
            resolve(result)
        })
        .catch((error)=>{
            reject(error)
        })
    })
}

//-----DELETE THE COUNTRY
var deleteCountry=function(co_code){
    return new Promise((resolve,reject)=>{
        var deleteQuery ={
            sql: 'DELETE FROM country WHERE co_code = ?',
            values:[co_code]
        }
        pool.query(deleteQuery)
        .then((result)=>{
            resolve(result)
        })
        .catch((error)=>{
            reject(error)
        })
    })
}

//-----DELETE THE CITY
var deleteCity=function(cty_code){
    return new Promise((resolve,reject)=>{
        var deleteQuery ={
            sql: 'DELETE FROM city WHERE cty_code = ?',
            values:[cty_code]
        }
        pool.query(deleteQuery)
        .then((result)=>{
            resolve(result)
        })
        .catch((error)=>{
            reject(error)
        })
    })
}

//-----UPDATE THE COUNTRY
var updateCountry=function(co_name, co_details,co_code){
    return new Promise((resolve,reject)=>{
        var updateQuery ={
            sql: 'UPDATE country SET co_name =?,co_details=? WHERE co_code =?',
            values:[co_name, co_details,co_code]
        }
        pool.query(updateQuery)
        .then((result)=>{
            resolve(result)
            console.log(result)
        })
        .catch((error)=>{
            reject(error)
            console.log(error)
        })
    })
}


//-----EXPORT FUNCTIONS IN ORDER TO USE IT
module.exports = { getDetails, cityDetails, countryDetails,addCountry,deleteCountry,updateCountry,deleteCity,searchCountry }

