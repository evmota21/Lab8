const mongoose = require( 'mongoose' );

const bookmarkSchema = mongoose.Schema({
    id : {
        type : String,
        required : true,
        unique : true
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    url : {
        type : String,
        required : true
    },
    rating : {
        type : Number,
        required : true
    }

});

const bookmarksCollection = mongoose.model( 'bookmarks', bookmarkSchema );

const Bookmarks = {
    createBookmark : function( newBookmark ){
        return bookmarksCollection
                .create( newBookmark )
                .then( createdBookmark => {
                    return createdBookmark;
                })
                .catch( err => {
                    return err;
                });
    },
    getAllBookmarks : function(){
        return bookmarksCollection
                .find()
                .then( allBookmarks => {
                    return allBookmarks;
                })
                .catch( err => {
                    return err;
                });
    },
    getBookmarkByTitle : function( bookmarkTitle ){
        return bookmarksCollection
                .find( { title : bookmarkTitle } )
                .then( allBookmarks => {
                    return allBookmarks;
                })
                .catch( err => {
                    return err;
                })
    },
    removeBookmarkById : function( bookmarkId ){
        return bookmarksCollection
                .deleteOne( { id : bookmarkId } )
                .then( allBookmarks => {
                    return allBookmarks;
                })
                .catch( err => {
                    return err;
                })
    }
}

module.exports = { Bookmarks };