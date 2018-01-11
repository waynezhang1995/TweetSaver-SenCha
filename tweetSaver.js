// store
Ext.define('tweetsaver.store.Tweets', {
    extend: 'Ext.data.Store',
    alias: 'store.tweets',
    autoLoad: false,
    field: ['profilePicture', 'userName', 'accountName', 'tweetDate', 'tweetContent']
});

var tweets = [];

Ext.application({
    name: 'Tweet-Saver',

    launch: function () {

        var store = Ext.create('tweetsaver.store.Tweets', {
            proxy: {
                type: 'jsonp',
                method: 'GET',
                url: 'https://tweetsaver.herokuapp.com/?q=test&count=7',
                dataType: 'json',
            }
        }); // Use alias name
        store.load({
            callback: function (records, operation, success) {
                if (success == true) {
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
                    Ext.Viewport.add({

                        xtype: 'container',
                        cls: 'display-tweets',
                        layout: 'hbox',
                        items: [{
                            xtype: 'panel',
                            layout: {
                                type: 'hbox',
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
                                        store.proxy.url = 'https://tweetsaver.herokuapp.com/?q=' + Ext.ComponentQuery.query('searchfield[cls=searchbox]')[0].getValue() + '&count=7';
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
                                }]
                            }, {

                                xtype: 'grid',
                                store: store,
                                width: '1000',
                                height: '1200',
                                columns: [{
                                    text: 'User Profile',
                                    dataIndex: 'profilePicture',
                                    renderer: function (value) {
                                        return '<img src="' + value + '" width="40" height="40" borer="0" />';
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
                                    flex: 1
                                }]
                            }]
                        }]

                    });
                    console.log(store);
                } else {
                    Ext.Msg.alert('failure');
                }
            }
        });
    }
});
