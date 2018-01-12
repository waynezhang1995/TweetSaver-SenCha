// store
Ext.define('tweetsaver.store.Tweets', {
    extend: 'Ext.data.Store',
    alias: 'store.tweets',
    autoLoad: false,
    field: ['profilePicture', 'userName', 'accountName', 'tweetDate', 'tweetContent'],
});

Ext.define('tweetsaver.store.TweetsSaved', {
    extend: 'Ext.data.Store',
    alias: 'store.tweetsSaved',
    autoLoad: false,
    field: ['profilePicture', 'userName', 'accountName', 'tweetDate', 'tweetContent'],
});

Ext.application({
    name: 'Tweet-Saver',
    launch: function () {
        // Search tweets
        var store = Ext.create('tweetsaver.store.Tweets', {
            proxy: {
                type: 'jsonp',
                isSynchronous: true,
                method: 'GET',
                url: 'https://tweetsaver.herokuapp.com/?q=test&count=4',
                dataType: 'json',
            }
        });

        // Saved tweets
        var storeSavedTweets = Ext.create('tweetsaver.store.Tweets');
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

        Ext.Viewport.add({
            xtype: 'container',
            contoller: 'tweetsController',
            cls: 'display-tweets',
            layout: 'vbox',

            items: [{
                xtype: 'panel',
                layout: {
                    type: 'vbox',
                    pack: 'start',
                    align: 'stretch'
                },
                floating: true,

                items: [{
                    xtype: 'fieldset',
                    items: [{
                        xtype: 'searchfield',
                        cls: 'searchbox'
                    }, {
                        xtype: 'button',
                        text: 'Search',
                        handler: function () {
                            store.clearData();
                            store.removeAll();
                            store.proxy.url = 'https://tweetsaver.herokuapp.com/?q=' + Ext.ComponentQuery.query('searchfield[cls=searchbox]')[0].getValue() + '&count=4';
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
                                    console.log(store);
                                }
                            });
                        }
                    }]
                }, {
                    xtype: 'grid',
                    store: store,
                    width: '900',
                    height: '350',

                    columns: [{
                        renderer: function (v, m, r) {
                            var id = Ext.id();
                            Ext.defer(function () {
                                Ext.widget('button', {
                                    renderTo: id,
                                    text: 'Save',
                                    width: 80,
                                    style: {
                                        'background-color': 'Green',
                                        'color': 'white',
                                        'font-size': '12px',
                                        'font-weight': 'bold'
                                    },
                                });
                            }, 50);
                            return Ext.String.format('<div id="{0}"></div>', id);
                        },
                        cell: {
                            encodeHtml: false
                        },
                        flex: 1,
                    }, {
                        text: 'User Profile',
                        dataIndex: 'profilePicture',
                        renderer: function (value) {
                            return '<img src="' + value + '" width="45" height="45" borer="0" />';
                        },
                        cell: {
                            encodeHtml: false
                        },
                        flex: 1
                    }, {
                        text: 'User Name',
                        dataIndex: 'userName',
                        flex: 1
                    }, {
                        text: 'Account Name',
                        dataIndex: 'accountName',
                        flex: 1
                    }, {
                        text: 'Tweet Content',
                        dataIndex: 'tweetContent',
                        flex: 5
                    }],
                    listeners: {
                        itemtap: function (view, index, item, record) {
                            var savedTweets = localStorage.getItem('savedTweets') ? JSON.parse(localStorage.getItem('savedTweets')) : [];
                            savedTweets.push(store.data.items[index].data);
                            localStorage.setItem('savedTweets', JSON.stringify(savedTweets));
                            storeSavedTweets.add({
                                profilePicture: record.data.profilePicture,
                                userName: record.data.userName,
                                accountName: record.data.accountName,
                                tweetDate: record.data.tweetDate,
                                tweetContent: record.data.tweetContent
                            });
                            Ext.ComponentQuery.query('grid[id=' + view.id + ']')[0].getStore().remove(record); // Remove record from grid
                        }
                    },
                }, {
                    xtype: 'grid',
                    store: storeSavedTweets,
                    width: '900',
                    height: '350',

                    columns: [{
                        renderer: function (v, m, r) {
                            var id = Ext.id();
                            Ext.defer(function () {
                                Ext.widget('button', {
                                    renderTo: id,
                                    text: 'Delete',
                                    width: 80,
                                    style: {
                                        'background-color': 'Red',
                                        'color': 'white',
                                        'font-size': '12px',
                                        'font-weight': 'bold'
                                    },
                                });
                            }, 50);
                            return Ext.String.format('<div id="{0}"></div>', id);
                        },
                        cell: {
                            encodeHtml: false
                        },
                        flex: 1,
                    }, {
                        text: 'User Profile',
                        dataIndex: 'profilePicture',
                        renderer: function (value) {
                            return '<img src="' + value + '" width="45" height="45" borer="0" />';
                        },
                        cell: {
                            encodeHtml: false
                        },
                        flex: 1
                    }, {
                        text: 'User Name',
                        dataIndex: 'userName',
                        flex: 1
                    }, {
                        text: 'Account Name',
                        dataIndex: 'accountName',
                        flex: 1
                    }, {
                        text: 'Tweet Content',
                        dataIndex: 'tweetContent',
                        flex: 5
                    }],

                    listeners: {
                        itemtap: function (view, index, item, record) {
                            var savedTweets = localStorage.getItem('savedTweets') ? JSON.parse(localStorage.getItem('savedTweets')) : [];
                            savedTweets = savedTweets.filter(function(tweet) {
                                return tweet.tweetContent != record.data.tweetContent;
                            });
                            localStorage.setItem('savedTweets', JSON.stringify(savedTweets));
                            Ext.ComponentQuery.query('grid[id=' + view.id + ']')[0].getStore().remove(record); // Remove record from grid
                        }
                    },
                }]
            }]
        });

    }
});
