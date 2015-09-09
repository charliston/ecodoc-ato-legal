(function() {
  CKEDITOR.plugins.add('ecodoc-ato-legal', {
    requires : ['iframedialog', 'widget'],
    init : function(editor) {
      // custom css
      CKEDITOR.config.contentsCss =  'bower_components/ecodoc-ato-legal/styles/contents.css';
      // permitir os campos no editor
      editor.filter.allow( 'a(*)[*]{*};', 'ecodoc-ato-legal' );
      // We will start from registering the widget dialog window by calling the standard CKEDITOR.dialog.add method inside the init method of the widget plugin definition.
      var iframeWindow = null;
      var me = this;
      var _ato = {};
      CKEDITOR.dialog.add('normal_dialog', function() {
        return {
          title : 'Linkar Ato Legal',
          resizable: CKEDITOR.DIALOG_RESIZE_NONE,
          minWidth: 200,
          minHeight: 230,
          contents : [{
            id : 'iframe',
            label : 'Linkar Ato Legal',
            expand : true,
            elements : [{
              id : 'atoLegalIframe',
              type : 'iframe',
              src : 'bower_components/ecodoc-ato-legal/dialogs/normal.html',
              width : 300,
              height : 320,
              onContentLoad : function() {
                var iframe = document.getElementById(this._.frameId);
                iframeWindow = iframe.contentWindow;

                var $iframe = $('#'+this._.frameId).contents();

                // can now call methods in the iframe window

                var $selectDoIframe = $iframe.find("#atosLegais");


                var token = JSON.parse(localStorage.getItem('ECODOC')).usuario.authentication_token;

                function formatRepo (repo) {
                  if (repo.loading) return repo.numero;
                  _ato = repo;
                  return '<div class="clearfix">' +
                      '<div class="col-sm-11">' + repo.rotulo + '</div>'+
                      '</div>';
                }

                function formatRepoSelection (repo) {
                  return repo.rotulo || repo.numero;
                }

                $selectDoIframe.select2({
                  dropdownParent: $iframe.find('body'),
                  placeholder: "Digite o número do Ato Legal",
                  language: {
                    // You can find all of the options in the language files provided in the
                    // build. They all must be functions that return the string that should be
                    // displayed.
                    inputTooShort: function () {
                      return "Digite o número do Ato Legal";
                    },
                    noResults: function () {
                      return "Nenhum registro encontrado";
                    },
                    searching: function () {
                      return "Buscando…";
                    }
                  },
                  ajax: {
                    url: "/api/legislacao/v1/atos_legais",
                    dataType: 'json',
                    headers: {"Authorization": 'Token token="' + token + '"'},
                    delay: 250,
                    data: function (params) {
                      return {
                        busca: {
                          numero: params.term // search term
                        }
                      };
                    },
                    processResults: function (data, page) {
                      return {
                        results: data.atos_legais
                      };
                    },
                    cache: true
                  },
                  escapeMarkup: function (markup) { return markup; },
                  minimumInputLength: 1,
                  templateResult: formatRepo,
                  templateSelection: formatRepoSelection
                });
              }
            }]
          }],
          onOk : function() {

            var atoLegalIframe = this.getContentElement('iframe', 'atoLegalIframe');
            // can now interrogate values in the iframe, call javascript methods
            // can also call editor methods, e.g. editor.focus(), editor.getSelection()

            var $selectDoIframe = $('#'+atoLegalIframe.domId).contents().find("#campo");

            if( $selectDoIframe.val() == ''){return;}

            // texto selecionado
            var mySelection = editor.getSelection();
            var selectedText = '';
            if (CKEDITOR.env.ie) {
              mySelection.unlock(true);
              selectedText = mySelection.getNative().createRange().text;
            } else {
              selectedText = mySelection.getNative();
            }
            if(selectedText.toString() == '') {
              // exibe o numero
              selectedText = _ato.numero
            }
            this._.editor.insertHtml( '<a data-ato-legal-id="'+ _ato.id +'">'+ selectedText +'<a/>' );
          }
        };
      });

      editor.addCommand('normal_dialog', new CKEDITOR.dialogCommand('normal_dialog'));

      editor.ui.addButton('Normal', {
        label : 'Linkar Ato Legal',
        command : 'normal_dialog',
        icon : 'bower_components/ecodoc-ato-legal/icons/ecodoc-ato-legal.png'
      });

      editor.widgets.add( 'ecodoc-ato-legal', {

        // any code that needs to be executed when DOM is available.
        init: function() {
        },

        // will be executed every time the widget data is changed
        data: function() {
        },

        // This will ensure that the dialog window will be opened when creating a new widget or
        // editing an existing one.
        dialog: 'normal_dialog',

        // Allow all HTML elements and classes that this widget requires.
        // Read more about the Advanced Content Filter here:
        // * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
        // * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
        allowedContent:
            'a(*)[*]{*}',

        // Minimum HTML which is required by this widget to work.
        requiredContent: 'a[data-ato-legal-id]',

        // Check the elements that need to be converted to widgets.
        upcast: function( element ) {
          return element.name == 'a' && element.hasClass( 'ato-legal-id' );
        }
      });

    }
  });
})();

