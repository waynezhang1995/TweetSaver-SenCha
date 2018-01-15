// store - search

Ext.define('tweetsaver.store.Tweets', {
    extend: 'Ext.data.Store',
    alias: 'store.tweets',
    autoLoad: false,
    storeId: 'tweets',
    field: ['profilePicture', 'userName', 'accountName', 'tweetDate', 'tweetContent'],

    proxy: {
        type: 'jsonp',
        isSynchronous: true,
        method: 'GET',
        dataType: 'json',
    }
});

// store - saved

Ext.define('tweetsaver.store.TweetsSaved', {
    extend: 'Ext.data.Store',
    alias: 'store.tweetsSaved',
    storeId: 'tweetsSaved',
    autoLoad: false,
    field: ['profilePicture', 'userName', 'accountName', 'tweetDate', 'tweetContent'],
});

// controller - save/delete tweets

Ext.define('tweetsaver.controller.Tweets', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Tweets',

    saveTweets: function (grid, rowIndex, colIndex, item, e, record) {
        var savedTweets = localStorage.getItem('savedTweets') ? JSON.parse(localStorage.getItem('savedTweets')) : [];
        var store = Ext.getStore('tweets');
        var storeSavedTweets = Ext.getStore('tweetsSaved');
        savedTweets.push(store.data.items[rowIndex].data);
        localStorage.setItem('savedTweets', JSON.stringify(savedTweets));
        storeSavedTweets.add({
            profilePicture: record.data.profilePicture,
            userName: record.data.userName,
            accountName: record.data.accountName,
            tweetDate: record.data.tweetDate,
            tweetContent: record.data.tweetContent
        });
        store.remove(record); // Remove record from grid
    },

    deleteTweets: function (grid, rowIndex, colIndex, item, e, record) {
        var storeSavedTweets = Ext.getStore('tweetsSaved');
        var savedTweets = localStorage.getItem('savedTweets') ? JSON.parse(localStorage.getItem('savedTweets')) : [];
        savedTweets = savedTweets.filter(function (tweet) {
            return tweet.tweetContent != record.data.tweetContent;
        });
        localStorage.setItem('savedTweets', JSON.stringify(savedTweets));
        storeSavedTweets.remove(record); // Remove record from grid
    },
});

// controller - search tweets

Ext.define('tweetsaver.controller.searchTweets', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.searchTweets',

    searchTweets: function (records, operation, success) {
        var store = Ext.getStore('tweets');
        store.clearData();
        store.removeAll();
        store.proxy.url = 'https://tweetsaver.herokuapp.com/?q=' + Ext.ComponentQuery.query('textfield[cls=searchbox]')[0].getValue() + '&count=4';
        store.read({
            callback: function (records, operation, success) {
                var tweet_json = Ext.pluck(store.data.items, 'data');
                Ext.each(tweet_json[0].tweets, function (tweet) {
                    store.add({
                        profilePicture: tweet.user.profileImageURL,
                        userName: tweet.user.name,
                        accountName: tweet.user.screenName,
                        tweetDate: tweet.createAt,
                        tweetContent: tweet.text
                    })
                });
                store.removeAt(0);
            }
        });
    }
});

// view - search Box

Ext.define('tweetsaver.view.searchbox', {
    extend: 'Ext.form.FieldSet',
    xtype: 'searchbox',

    controller: 'searchTweets',
    items: [{
        xtype: 'textfield',
        cls: 'searchbox'
    }, {
        xtype: 'button',
        text: 'Search',
        handler: 'searchTweets',
    }]

});

// view - display searcht results

Ext.define('tweetsaver.view.tweetsPanel', {
    extend: 'Ext.grid.Panel',
    xtype: 'tweetsPanel',
    cls: 'searchedTweets',
    controller: 'Tweets',
    store: {
        type: 'tweets'
    },
    width: '1000',
    height: '1000',

    columns: [{
        xtype: 'actioncolumn',
        header: 'Save',
        width: 100,
        align: 'center',
        items: [{
            icon: 'http://www.free-icons-download.net/images/floppy-disk-save-button-icon-65887.png',
            tooltip: 'Save',
            handler: 'saveTweets',
        }],
        flex: 1,
    }, {
        text: 'Profile',
        dataIndex: 'profilePicture',
        renderer: function (value) {
            return '<img src="' + value + '" width="45" height="45" borer="0" />';
        },
        cell: {
            encodeHtml: false
        },
        flex: 1
    }, {
        text: 'Name',
        dataIndex: 'userName',
        flex: 1
    }, {
        text: 'Account',
        dataIndex: 'accountName',
        flex: 1
    }, {
        text: 'Content',
        dataIndex: 'tweetContent',
        flex: 3
    }],
});

// view - display saved tweets

Ext.define('tweetsaver.view.tweetsSavedPanel', {
    extend: 'Ext.grid.Panel',
    xtype: 'tweetsSavedPanel',
    cls: 'savedTweets',
    controller: 'Tweets',
    store: {
        type: 'tweetsSaved' // Create a new store instance
    },
    width: '1000',
    height: '1000',

    columns: [{
        xtype: 'actioncolumn',
        header: 'Delete',
        width: 100,
        align: 'center',
        items: [{
            icon: 'https://n6-img-fp.akamaized.net/free-icon/delete-button_318-77600.jpg?size=338&ext=jpg',
            tooltip: 'Delete',
            handler: 'deleteTweets',
        }],
        flex: 1,
    }, {
        text: 'Profile',
        dataIndex: 'profilePicture',
        renderer: function (value) {
            return '<img src="' + value + '" width="45" height="45" borer="0" />';
        },
        cell: {
            encodeHtml: false
        },
        flex: 1
    }, {
        text: 'Name',
        dataIndex: 'userName',
        flex: 1
    }, {
        text: 'Account',
        dataIndex: 'accountName',
        flex: 1
    }, {
        text: 'Content',
        dataIndex: 'tweetContent',
        flex: 3
    }],
});

// launch

Ext.application({
    name: 'Tweet-Saver',
    launch: function () {

        var store = Ext.create('tweetsaver.store.Tweets');

        // view

        Ext.create('Ext.container.Container', {

            layout: {
                type: 'vbox',
                pack: 'start',
                align: 'stretch'
            },
            renderTo: document.body,
            items: [{
                xtype: 'searchbox',
            }, {
                xtype: 'tweetsPanel',
            }, {
                xtype: 'tweetsSavedPanel',
            }]
        });

        var storeSavedTweets = Ext.getStore('tweetsSaved');
        var savedTweetsLocal = JSON.parse(localStorage.getItem('savedTweets'));
        Ext.Array.each(savedTweetsLocal, function (record) {
            storeSavedTweets.add({
                profilePicture: record.profilePicture,
                userName: record.userName,
                accountName: record.accountName,
                tweetDate: record.tweetDate,
                tweetContent: record.tweetContent
            });
        });
    }
});
