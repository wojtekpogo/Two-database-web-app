//Imports
var express = require('express')
var PORT = 3007; //port number
var bodyParser = require('body-parser') //to parse the body and get the user input
const { body, validationResult, check } = require('express-validator') //express validator to validate the input
var MONGO = require('./MONGO'); //handles mongo queries
const SQL = require('./SQL'); //handles sql queries
const MYSQL_CODE_DUPLICATE_KEY = 1062;

var app = express()

//-----SET THE ENGINE
app.set('view engine', 'ejs')
app.engine('ejs', require('ejs').__express);
//app.set('views', __dirname);
app.use(bodyParser.urlencoded({ extended: false }));
//app.set('views', path.join(__dirname, 'views'));

//------MAIN PAGE
app.get('/', (req, res) => {
    res.render('mainPage')
})

//-----LIST ALL COUNTRIES
app.get('/listCountries', (req, res) => {
    SQL.countryDetails()
        .then((result) => {
            res.render('listCountries', { country: result })
        })
        .catch((error) => {
            res.send(error)
        })

})
//-----LIST ALL CITIES
app.get('/listCities', (req, res) => {
    SQL.cityDetails()
        .then((result) => {
            res.render('listCities', { city: result })

        })
        .catch((error) => {
            res.send(error)
        })

})

//-----GET REQUEST ON ADD COUNTRY
app.get('/addCountry', (req, res) => {
    res.render('addCountry', { errors: undefined })
})
//-----METHOD HANDLES ADDING THE COUNTRY FUNCTIONALITY
app.post('/addCountry',
    [check('co_code')
        .custom(async co_code => {
            const value = await duplicateEntry(co_code);
        }),
    check('co_code').isLength({ min: 3 }).withMessage("Country code must be 3 characters"),
    check('name').isLength({ min: 3 }).withMessage("Country name must be at least 3 characters")
    ],
    (req, res) => {
        var errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.render('addCountry', { errors: errors.errors, co_code: req.body.code, co_name: req.body.name, co_details: req.body.details })
        }
        else {
            SQL.addCountry(req.body.code, req.body.name, req.body.details)
                .then((result) => {
                    res.redirect('/listCountries') //if country has been succesfully added, redirects to the country list
                })
                .catch((error) => {
                    res.send('Error: ' + req.body.code + ' already exists')
                    console.log(error)
                })
        }
    })

//-----GET REQUEST ON EDIT COUNTRY
app.get('/edit/:co_code', (req, res) => {
    var code = req.params.co_code
    console.log('req:'+req.params.co_code) //just checking
    SQL.countryDetails()
        .then((result) => {
            result.forEach(country => { 
                if (code == country.co_code) {
                    res.render('edit', { errors: undefined, co_code: code, co_name: country.co_name, co_details: country.co_details })
                }
            })

        })
})

//-----POST REQUEST TO UPDATE THE COUNTRY
app.post('/edit/:co_code',

    [check('co_code').custom((value, { req }) => { //custom middleware
        console.log('code:' +req.params.co_code)
        //console.log('value:' + value)
        if (value !== req.params.co_code) { //if country code has been changed
            
            throw new Error("Sorry, cannot update the country code") //error handling to prevent user from changing the co_code
        } else { return true }
    }),
    check('name').isLength({ min: 3 }).withMessage("Country name must be at least 3 characters")
    ],
    (req, res) => {
        //code = req.params.code;
        var errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.render('edit', { errors: errors.errors, co_code: req.body.co_code, co_name: req.body.co_name, co_details: req.body.co_details })
        }
        else {
            SQL.updateCountry(req.body.name, req.body.details, req.body.co_code)
                .then((result) => {
                    res.redirect('/listCountries') //if country has been succesfully edited, redirects to the country list
                })
                .catch((error) => {
                    res.send('country not edited.')
                    console.log(error)
                })
        }
    })

//-----DUPLICATE ENTRY ERROR HANDLING
function duplicateEntry(co_code) {

    var code = co_code.length;
    if (code == 3) {
        return new Promise((resolve, reject) => {
            SQL.countryDetails()
                .then((result) => {
                    var cntry = result;
                    cntry.forEach(country => { //goes through the whole db, this could be relatively slow with large dbs
                        if (co_code == country.co_code) {
                            return reject(new Error('Error: ' + co_code + ' already exists.')) // checked if the country already exists in the db
                        }
                    });
                    return resolve('true')
                })
        })

    }
}

//-----DISPLAYS DETAILS FOR PARTICULAR CITY
app.get('/allDetails/:cty_code', (req, res) => {
    var code = req.params.cty_code
    //console.log(req.params.cty_code)

    SQL.getDetails(req.params.cty_code)
        .then((result) => {
            result.forEach(city => {
                if (code == city.cty_code) {
                    //console.log("code:"+city.cty_code)
                    res.render('allDetails', { cty_code: city.cty_code, cty_name: city.cty_name,population:city.population,isCoastal: city.isCoastal, areaKM: city.areaKM,co_name: city.co_name,co_code:city.co_code})
                    //console.log(city.cty_name)
                }
            })
        })
        .catch((error) => {
            res.send(error)
        })
    // res.render('allDetails')

})


//-----DELETE FUNCTION
app.get('/delete/:code', (req, res) => {
    SQL.deleteCountry(req.params.code)
        .then((result) => {
            res.redirect('/listCountries')
        })
        .catch((error) => {
            res.send('<h1>ERROR MESSAGE</h1> <br>' + req.params.code + ' has cities, cannot be deleted <br><br> <a href="/">Home</a>') //error message
            console.log(error)
        })
})

//-----DELETE CITY FUNCTION
app.get('/deleteCity/:code', (req, res) => {
    SQL.deleteCity(req.params.code)
        .then((result) => {
            res.redirect('/listCities')
        })
        .catch((error) => {
            console.log(error)
        })
})

app.get('/search',(req,res)=>{
    res.render('search')

})

app.get('/search',(req,res)=>{
    SQL.searchCountry(req.body.co_code)
        .then((result) => {
            res.send(result)
        })
        .catch((error) => {
            console.log(error)
        })
})



//----- DISPLAYS HEADS OF STATE
app.get('/headOfState', (req, res) => {
    MONGO.getHeadsOfState()
        .then((documents) => {
            res.render('headOfState', { hOs: documents })

        })
        .catch((error) => {
            res.send(error)
        })
})

app.get('/addHeadOfState', (req, res) => {
    res.render('addHeadOfState',{ errors: undefined})
})

app.post('/addHeadOfState',[check('id').custom(async id => { //handling async error with custom error handles, async returns promise
    var value
    if (id.length == 3) {
        value = await checkID(id);
        console.log(value)
        if (value) {
            return true;
        } else { throw new Error("Cannot add Head of State to " + id + " as this country is not in MySQL database") }
    } else { return true }
}),
check('headOfState').isLength({ min: 3 }).withMessage("Head of State must be at least 3 characters"),
check('_id').isLength({ min: 3, max: 3 }).withMessage("Country Code must be 3 characters")
], (req, res) => {
    var errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('addHeadOfState', { errors: errors.errors, _id: req.body.id, headOfState: req.body.name })// renders errors to ejs 
        } else {// if there's no errors, then continue to add heads of state to database
    MONGO.addHeadOfState(req.body.id, req.body.name)
        .then((result) => {
            res.redirect('/headOfState')
            // res.send("ok")
            console.log(req.body.id)
            console.log(req.body.name)

        })
        .catch((error) => {
            if (error.code == 11000) {//error code 11000 indicates that Country code already exists in mongodb 
                res.send("<h1>Error: " + req.body.id + " already exists in MongoDB</h1>")
            }
        })
    }
})

//-----ERROR HANDLING FOR ID
function checkID(id) {
    return new Promise((resolve, reject) => {
        SQL.countryDetails() //goes through the records in the mysql country table
            .then((result) => {
                result.forEach(country => {
                    if (id == country.co_code) {
                        return resolve(true);
                    }
                })
                return resolve(false)
            })
            .catch((error) => {
                return reject(error)
            })
    })
}

app.listen(PORT, () => {
    console.log("Listening at port 3007.");
})