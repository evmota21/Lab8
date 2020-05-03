const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const morgan = require( 'morgan' );
const {v4 : uuidv4 } = require( 'uuid' );
const mongoose = require( 'mongoose' );
const validateToken = require( './middleware/validateToken'); 
const { Bookmarks } = require('./models/bookmarkModel' );

const app = express();
const jsonParser = bodyParser.json();
const TOKEN = "2abbf7c3-245b-404f-9473-ade729ed4653";

app.use( morgan( 'dev' ) );
app.use( validateToken );

let listOfBookmarks = [
    {
        id: uuidv4(),
        title : "First BookMark",
        description : "This is the first bookmark.",
        url: "www.google.com",
        rating: 50
    }
];

app.get( '/lab7/bookmarks', ( req, res ) => { //Return all bookmarks with code 200.
    console.log("Getting all bookmarks.");

    Bookmarks
        .getAllBookmarks()
        .then( result => {
            return res.status( 200 ).json( result );
        })
        .catch( err => {
            res.statusMessage = "Something went wrong with the Databse. Try again later.";
            return res.status( 500 ).end();
        })
}); //get bookmarks done

app.get( '/lab7/bookmark' , ( req, res ) => {
    console.log( "Getting a bookmark by title." );

    console.log( req.query );

    let bookmarkTitle = req.query.title; 

    if( !bookmarkTitle ){
        res.statusMessage = "Please send the 'title' as a parameter.";
        return res.status( 406 ).end();
    }

    Bookmarks
        .getBookmarkByTitle( bookmarkTitle )
        .then( result => {
            return res.status( 200 ).json( result );
        })
        .catch( err => {
            res.statusMessage = "Something went wrong with the databse, try again later.";
            
            return res.status( 500 ).end();
        })

}); // get bookmark by title done

app.post( '/lab7/bookmarks' , jsonParser, ( req, res ) => {
    console.log("Adding a new bookmark to the list...");
    console.log( "Body" , req.body );

    let title = req.body.title;
    let description = req.body.description;
    let url = req.body.url;
    let rating = req.body.rating;

    if( !title || !description || !url || !rating ){
        res.statusMessage = "One parameter is missing.";

        return res.status( 406 ).end();
    }

    if( typeof(rating) !== 'number' ){
        res.statusMessage = "rating must be a number!";

        return res.status( 409 ).end();
    }

    let id = uuidv4();

    let newBookmark = {id, title, description, url, rating};

    Bookmarks
        .createBookmark( newBookmark )
        .then( result => {
            // Handle id duplicate error
            if( result.errmsg ){
                res.statusMessage = "The 'id' belongs to another bookmark. " +
                                    result.errmsg;
                return res.status( 409 ).end();
            }
            return res.status( 201 ).json( result ); 
        })
        .catch( err => {
            res.statusMessage = "Something is wrong with the Database. Try again later.";
            return res.status( 500 ).end();
        });
    /*for( let i = 0; i < listOfBookmarks.length; i++){
        if( listOfBookmarks[i].title === title ){
            flag = !flag;
            break;
        }

        if( flag ){
            let id = uuidv4();
            let newBookmark = {id, title, description, url, rating};

            listOfBookmarks.push( newBookmark );
            
            return res.status( 201 ).json( newBookmark );
        }
        else{
            res.statusMessage = "The 'title' provided is already on the list."

            return res.status( 409 ).end();
        }
    }*/

});/*create bookmark done*/

app.delete( '/lab7/bookmark/:id' , ( req, res ) => {
    console.log( req.params );
    let bookmarkId = req.params.id;

    if( !bookmarkId ){
        res.statusMessage = "Please send a 'id'.";

        return res.status( 406 ).end();
    }

    Bookmarks
        .removeBookmarkById( bookmarkId )
        .then( result => {
            return res.status( 200 ).json( result );
        })
        .catch( err => {
            res.statusMessage = "Something went wrong with the database, try again later.";
            return res.status( 500 ).end();
        })

}); //delete bookmark done

app.patch( '/lab7/bookmark/:id' , jsonParser, ( req, res ) => {
    console.log("Updating a bookmark on the list...");
    console.log( "Body" , req.body );

    let id = req.params.id;
    let idBody = req.body.id;

    let title = req.body.title;
    let description = req.body.description;
    let url = req.body.url;
    let rating = req.body.rating;

    if( !req.body ){
        res.statusMessage = "Please send a body with the correct data.";

        return res.status( 406 ).end();
    }

    if( id !== idBody){
        res.statusMessage = "Id on path parameter and body are not equal.";

        return res.status( 409 ).end();
    }

    let bookmarkToEdit = listOfBookmarks.findIndex( (bookmark) => {
        if(bookmark.id === id){
            return true;
        }
    });

    if( title ){
        listOfBookmarks[bookmarkToEdit].title = title;
    }
    if( description ){
        listOfBookmarks[bookmarkToEdit].description = description;
    }
    if( url ){
        listOfBookmarks[bookmarkToEdit].url = url;
    }
    if( rating ){
        listOfBookmarks[bookmarkToEdit].rating = rating;
    }

    return res.status( 202 ).json( listOfBookmarks[bookmarkToEdit] );

}); 



app.listen( 8080, () => {
    console.log(`Running server "bookmarks-app" on port 8080...`);

    new Promise( ( resolve, reject ) => {

        const settings = {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
            useCreateIndex: true
        };
        mongoose.connect( 'mongodb://localhost/bookmarksdb', settings, ( err ) => {
            if( err ){
                return reject( err );
            }
            else{
                console.log( "Database connected successfully." );
                return resolve();
            }
        })
    })
    .catch( err => {
        console.log( err );
    });
});
