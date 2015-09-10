(function() {
  CKEDITOR.plugins.add('ecodoc-ato-legal', {
    requires : ['iframedialog', 'widget'],
    init : function(editor) {
      // custom css
      CKEDITOR.config.contentsCss =  '/bower_components/ecodoc-ato-legal/styles/contents.css';
      // permitir os campos no editor
      editor.filter.allow( 'a(*)[*]{*};', 'ecodoc-ato-legal' );
      // We will start from registering the widget dialog window by calling the standard CKEDITOR.dialog.add method inside the init method of the widget plugin definition.
      var iframeWindow = null;
      var me = this;
      var token = JSON.parse(localStorage.getItem('ECODOC')).usuario.authentication_token;
      CKEDITOR.dialog.add('normal_dialog', function() {
        return {
          title : 'Vincular Ato Legal',
          resizable: CKEDITOR.DIALOG_RESIZE_NONE,
          minWidth: 900,
          minHeight: 230,
          contents : [{
            id : 'iframe',
            label : 'Vincular Ato Legal',
            expand : true,
            elements : [{
              type: "vbox",
              id: "urlOptions",
              children: [{
                type: "hbox",
                widths: ["25%", "33%", '25%', '8%'],
                children: [{
                  type: "text",
                  id: "url",
                  label: 'Número'
                },{
                  id: "ano",
                  type: "select",
                  label: 'Tipo',
                  "default": "",
                  items: [[""]],
                  onLoad : function(element) {
                    var that = this;
                    $.ajax({
                      url: "/api/legislacao/v1/enumeracoes/tipo_ato_legal",
                      dataType: 'json',
                      headers: {
                        "Authorization": 'Token token="' + token + '"'
                      },
                      async: false,
                      success: function(data) {
                        $.each(data.enumeracoes, function(index, item) {
                          that.add(item.texto, item.id);
                        });
                      }
                    })
                  }
                },{
                  id: "protocol",
                  type: "select",
                  label: 'Ano',
                  "default": "",
                  items: [["‎"]],
                  style: 'width:100%;',
                  onLoad : function(element) {
                    for(var ano = new Date().getFullYear(); ano >= 1900; ano--) {
                      this.add(ano, ano);
                    }
                  }
                },{
                  type : 'button',
                  id : 'buttonId',
                  label : 'Buscar',
                  title : 'My title',
                  onClick : function() {
                    // this = CKEDITOR.ui.dialog.button
                    alert( 'Clicked: ' + this.id );
                  },
                  style: 'margin-top:13px;'
                }]


              }]
            },{
              type: 'html',
              id: 'htmlRetorno',
              className: 'htmlRetorno',
              html: '<table style="width:100%" class="table table-hover table-qf"><thead><tr><th>Número</th><th>Tipo</th><th>Ano</th><th>Publicação</th></tr></thead>' +
              '<tbody style="margin-top:-10px"><tr><td data-title-text="Número" class="ng-binding">12</td><td data-title-text="Tipo" class="ng-binding">AC</td><td align="center" data-title-text="Ano" class="ng-binding">2010</td><td align="center" data-title-text="Publicação" class="ng-binding">02/09/2015</td></tr><tr><td data-title-text="Número" class="ng-binding">1</td><td data-title-text="Tipo" class="ng-binding">Ação Anulatória</td><td align="center" data-title-text="Ano" class="ng-binding">2011</td><td align="center" data-title-text="Publicação" class="ng-binding">01/09/2015</td></tr></tbody></table>'
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

      editor.ui.addButton('ecodocAtoLegal', {
        label : 'Vincular Ato Legal',
        command : 'normal_dialog',
        icon : '/bower_components/ecodoc-ato-legal/icons/ecodoc-ato-legal.png'
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
