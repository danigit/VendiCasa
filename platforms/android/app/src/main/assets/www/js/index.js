/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License
 */
var app = {

    storage: window.localStorage,

    // Application Constructor
    //devo ricordarmi di aggiungere navigator e connection per poterle usare
    initialize: function() {
        this.bind();
    },

    bind: function () {
        document.addEventListener('deviceready', this.deviceready, false);

        //qyesto e' un oggetto
        var scheda = {

            data: {nome: '', indirizzo: '', descrizione: '', prezzo: '0,00'},

            //questi sono metodi
            save: function () {
                //finestra popup tipo alert di javascript
                //navigator non funziona nel browser
                // navigator.notification.alert('Salvataggio effettuato!',
                //     //funzione di callback dopo la visualizzazione del messaggio
                //     function () {},
                //     //titolo
                //     'Informazione',
                //     //bottone
                //     'OK');

                if(scheda.data.nome != '')
                    //memorizzazione di dati attraverso web storage
                    app.storage.setItem(scheda.data.nome, JSON.stringify(scheda.data));
            },

            send: function (listaSchede, successCallback, failCallback) {
                // //finesta popup di conferm
                // navigator.notification.confirm('Confermi l\'invio delle schede?',
                //     //funzione di calback chiamata dopo la scelta dell'utente
                //     //alla funzine viene passato un indice numerico corispondente al pulsante premuto
                //     //0 - se si chiude la finestra senza premere nessun pulsante
                //     //1 - il primo bottone
                //     //2 - il secondo e cosi via
                //     scheda.confirmSend,
                //     'Conferma invio',
                //     //stringa che descrive i pulsanti ogni pezzo separato da virgola e' un pulsante
                //     'Si,No');

                $.ajax({
                    url: 'http://danielfotografo.altervista.org/php/ajax/insert_article.php',
                    type: "POST",
                    data: listaSchede})
                    .done(function (dat) {
                        navigator.notification.alert("dati ritornati: " + dat, function () {  }, 'Information');
                        app.storage.clear(); successCallback(); })
                    .fail(failCallback);
            },

            confirmSend: function (buttonIndex) {
                if (buttonIndex == 1)   {
                    navigator.notification.alert('Schede inviate!',
                        function () {},
                        'Informazione');
                }
            },

            load: function(nome){
                if(nome != ''){
                    var value = app.storage.getItem($.trim(nome));
                    scheda.data = JSON.parse(value);
                }
            },

            delete: function (nome) {
                if (nome != '')
                    app.storage.removeItem($.trim(nome));
            }
        };


        //click pulsante salva
        $('#salva').on('tap', function () {
            scheda.data.nome = $('#nome').val();
            scheda.data.indirizzo = $('#indirizzo').val();
            scheda.data.descrizione = $('#descrizione').val();
            scheda.data.prezzo = $('#prezzo').val();

            scheda.save();

            navigator.notification.alert("Salvataggio effettuato!",function() {},"Informazione");
        });

        $('#inviaSchede').on('tap', function () {
            if( app.isOnline()){
                navigator.notification.confirm(
                    "Confermi l'invio delle schede?",
                    function (choice) {
                        if(choice == 1){
                            var listaSchede = [];

                            for (var i = 0; i < app.storage.length; i++){
                                scheda.load(app.storage.key(i));
                                listaSchede.push(scheda.data);
                            }

                            scheda.send(listaSchede,
                                function () {
                                    navigator.notification.alert("Schede inviate!", function () {  }, "Informazione");
                                },
                                function () {
                                    navigator.notification.alert("Si e' verificato un problema durante l'invio delle schede!", function () {  }, "Errore");
                            });
                        }
                    }
                )
            }else{
                navigator.notification.alert("Connessione internet non disponibile", function () {  }, 'Information');
            }
        });

        $('#elencoSchede').on('pagebeforeshow',
            function (event) {
                var elencoSchede = $('#listaSchede');
                elencoSchede.html('');
                elencoSchede.append('<li data-role="list-divider" role="heading">Schede</li>')

                for (var i = 0; i < app.storage.length; i++){
                    var li = $('<li data-theme="c">' +
                        '<a href="#" data-transition="slide">' +
                        app.storage.key(i) + '</a></li>');

                    li.on('tap', function () {
                        scheda.load($(this).text());
                        $('#nome').val(scheda.data.nome);
                        $('#indirizzo').val(scheda.data.indirizzo);
                        $('#descrizione').val(scheda.data.descrizione);
                        $('#prezzo').val(scheda.data.prezzo);
                        $.mobile.changePage($('#scheda'));
                    });

                    elencoSchede.append(li);

                    li.on('taphold', function () {
                        var key = $(this).text();

                        navigator.notification.confirm(
                            "Confermi l'eliminazione della scheda?",
                            function (buttonIndex) {
                                if (buttonIndex == 1) {
                                    scheda.delete(key);
                                    $.mobile.changePage($('#elencoSchede'));
                                }
                            },
                            "Conferma eliminazione",
                            "Si, No"
                        );
                    });
                }

                elencoSchede.listview('refresh');
            });

        $('#btnExit').on('tap', app.exit);
    },

    isOnline: function(){
        var networkState = navigator.connection.type;

        return((networkState != Connection.NONE) && (networkState != Connection.UNKNOWN));
    },

    exit: function(){
      navigator.notification.confirm('Vuoi uscire dall\'applicazione?',
          function (buttonIndex) {
              if(buttonIndex == 1)
                  navigator.app.exitApp();
          },
          "Informazione",
          "Si, No");
    },

    deviceready: function () {
        app.start();
    },

    start: function () {

    }
};

$(document).ready(function () {
    app.initialize()
});