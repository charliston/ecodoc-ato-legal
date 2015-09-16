(function() {
  CKEDITOR.plugins.add('ecodoc-ato-legal', {
    requires : ['iframedialog', 'widget'],
    init : function(editor) {
      // custom css
      CKEDITOR.config.contentsCss =  '.cke_editable {font-family: \'Open Sans\', \'Arial\', sans-serif;font-size: 13px;}a[data-ato-legal-id] {background: #eee;border-bottom: 1px dotted #808080;}';
      // permitir os campos no editor
      editor.filter.allow( 'a(*)[*]{*};', 'ecodoc-ato-legal' );
      var _atos = {};
      var _atoSelecionado = {};
      var token = JSON.parse(localStorage.getItem('ECODOC')).usuario.authentication_token;
      var parentScope = $('#ckeditor').scope();
      CKEDITOR.dialog.add('normal_dialog', function() {
        return {
          title : 'Vincular Ato Legal',
          resizable: CKEDITOR.DIALOG_RESIZE_NONE,
          minWidth: 900,
          minHeight: 464,
          contents : [{
            id : 'vincular-ato-legal',
            label : 'Vincular Ato Legal',
            expand : true,
            elements : [{
              type: "vbox",
              id: "urlOptions",
              children: [{
                type: "hbox",
                widths: ["25%", "33%", '25%', '8%'],
                children: [{
                  id: "numero",
                  type: "text",
                  label: 'Número'
                },{
                  id: "tipo",
                  type: "select",
                  label: 'Tipo',
                  "default": "",
                  items: [["Todos", '']],
                  onLoad : function(element) {
                    var that = this;
                    var busca = {
                      count:1000000,
                      page:1
                    };
                    $.ajax({
                      url: parentScope.ckeditor.API_CONFIG.URL+ "/legislacao/v1/enumeracoes/tipo_ato_legal",
                      dataType: 'json',
                      headers: {
                        "Authorization": 'Token token="' + token + '"'
                      },
                      data: busca,
                      async: false,
                      success: function(data) {
                        $.each(data.enumeracoes, function(index, item) {
                          that.add(item.texto, item.id);
                        });
                      }
                    })
                  }
                },{
                  id: "ano",
                  type: "select",
                  label: 'Ano',
                  "default": "",
                  items: [["Todos‎", '']],
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
                  className: 'btn default',
                  onClick : function() {
                    var dialog = this.getDialog();
                    var $dialog = $(dialog._.element.$);
                    var $html = $dialog.find('#htmlRetorno');

                    var busca = {
                      count:10,
                      page:1,
                      busca: {
                        numero: dialog.getValueOf( 'vincular-ato-legal', 'numero'),
                        tipo_ato_legal_id: dialog.getValueOf( 'vincular-ato-legal', 'tipo'),
                        ano: dialog.getValueOf( 'vincular-ato-legal', 'ano')
                      }
                    };
                    $.ajax({
                      url: parentScope.ckeditor.API_CONFIG.URL+ "/legislacao/v1/atos_legais",
                      dataType: 'json',
                      data: busca,
                      headers: {
                        "Authorization": 'Token token="' + token + '"'
                      },
                      beforeSend: function(){
                        $html.empty().append('<tr><td class="text-center" colspan="5">Buscando…</td></tr>');
                      },
                      success: function(data) {
                        $html.empty();
                        _atos = data.atos_legais;
                        $.each(_atos, function(index, item) {
                          var ementa = '';
                          if(item.ementa != null) {
                            ementa = item.ementa.replace(/(<([^>]+)>)/ig,"");
                            ementa = (ementa.length > 60)? ementa.substr(0, 60)+'…': ementa;
                          }
                          var append = '<tr data-index="'+ index +'">' +
                              '<td>' + item.numero + '</td>' +
                              '<td>' + item.tipo_ato_legal.texto + '</td>' +
                              '<td>' + ementa + '</td>' +
                              '<td>' + item.ano + '</td>' +
                              '<td>' + item.data_publicacao.split('-').reverse().join('/') + '</td>' +
                              '</tr>';
                          $html.append(append);
                        });

                        $html.find('td').click(function(){
                          // remove o ato selecionado atual, se houver
                          $html.find('tr.atoSelecionado').removeClass('atoSelecionado');
                          var tr = $(this).parent('tr');
                          tr.addClass('atoSelecionado');
                          _atoSelecionado = _atos[tr.data('index')];
                        });
                      }
                    });
                  },
                  style: 'margin-top:21px;'
                }]


              }]
            },{
              type: 'html',
              id: 'html',
              className: 'htmlRetorno',
              html: '<table style="width:100%;margin-top:-10px;" class="table table-hover table-atos"><thead>' +
              '<tr><th>Número</th><th style="width:290px;">Tipo</th><th style="width:338px;">Ementa</th><th>Ano</th><th>Publicação</th></tr></thead>' +
              '<tbody id="htmlRetorno"></tbody></table>'
            }]
          }],
          onOk : function() {
            // se nao houver ato selecionado fecha sem fazer o link
            if(Object.keys(_atoSelecionado).length == 0){ return; }

            // texto selecionado no editor
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
              selectedText = _atoSelecionado.numero
            }

            // insere o link no editor
            this._.editor.insertHtml( '<a title="'+ _atoSelecionado.rotulo +'" data-ato-legal-id="'+ _atoSelecionado.id +'">'+ selectedText +'<a/>' );

            // reseta o plugin
            _atos = {};
            _atoSelecionado = {};
            $(this._.element.$).find('#htmlRetorno').empty();
          }
        };
      });

      editor.addCommand('normal_dialog', new CKEDITOR.dialogCommand('normal_dialog'));

      editor.ui.addButton('ecodocAtoLegal', {
        label : 'Vincular Ato Legal',
        command : 'normal_dialog',
        icon : '/bower_components/ckeditor-plugin-vincular-ato/icone.png'
      });
    }
  });
})();
