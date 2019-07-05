angular.module('cadastro-central-module').controller('CopiarTermoCtrl', CopiarTermoCtrl);

CopiarTermoCtrl.$inject = ['$modalInstance','tipoTermoService','PATHCONFIG', 'fundoTermoService'];

function CopiarTermoCtrl($modalInstance,tipoTermoService,PATHCONFIG,fundoTermoService) {

    var controller = this;

    controller.close = close;
    controller.adicionarCaracteristica = adicionarCaracteristica;
    controller.removerCaracteristica = removerCaracteristica;
    controller.formataCaracteristicas = formataCaracteristicas;
    controller.$modalInstance = $modalInstance;
    controller.PATHCONFIG = PATHCONFIG;

    /**
     * Filtros que serão utilizados pela
     * datatable.
     */
    controller.filtros = {
        nmTermo:null,
        pessoaFundo: {
            pessoa: {
                nomeRazao: null
            }
        },
        caracteristicas:[]
    };

    controller.termos = [];

    /**
     * As opções que estarão disponíveis para
     * enviar nos filtros.
     */
    controller.caracteristicas = [];

    /**
     * Característica selecionada para se adicionada aos filtros.
     */
    controller.caracteristicaParaAdicionar = null;

    /**
     * Característica selecionada para se remover dos filtros.
     */
    controller.caracteristicaParaRemover = null;
    
    /**
     * Termos que serão usados para busca no auto-complete
     */
    controller.termosAutoComplete = [];
    
    fundoTermoService.findAllNomesTermos().then(function(response){
    	controller.termosAutoComplete = response.data;
    });
    
    fundoTermoService.findAllNomesFundos().then(function(response){
    	controller.fundosAutoComplete = response.data;
    });

    tipoTermoService.findAll().then(function (response) {
        controller.caracteristicas = response.data;
        sortCaracteristicas(controller.caracteristicas);
    });

    /**
     * Adiciona a característica selecionada para
     * ser enviada como filtro.
     */
    function adicionarCaracteristica() {
    	
    	angular.element(document.querySelector('#rightcopyfocusout')).blur();

        if (controller.caracteristicaParaAdicionar) {

            controller.filtros.caracteristicas.push(controller.caracteristicaParaAdicionar);

            sortCaracteristicas(controller.filtros.caracteristicas);

            controller.caracteristicas.splice(controller.caracteristicas.findIndex(function (caracteristica) {
                return caracteristica.idTipoTermo == controller.caracteristicaParaAdicionar.idTipoTermo;
            }), 1);

            controller.caracteristicaParaAdicionar = null;

        }

    }

    /**
     * Remove uma característica do termo.
     */
    function removerCaracteristica() {
    	
    	angular.element(document.querySelector('#leftcopyfocusout')).blur();

        if (controller.caracteristicaParaRemover) {

            controller.filtros.caracteristicas.splice(controller.filtros.caracteristicas.findIndex(function (caracteristica) {
                return caracteristica.idTipoTermo == controller.caracteristicaParaRemover.idTipoTermo;
            }), 1);

            controller.caracteristicas.push(controller.caracteristicaParaRemover);

            sortCaracteristicas(controller.caracteristicas);

            controller.caracteristicaParaRemover = null;

        }

    }

    function sortCaracteristicas(caracteristicas) {

        caracteristicas.sort(function (caracteristica1, caracteristica2) {
            if (caracteristica1.nmTipoTermo > caracteristica2.nmTipoTermo) {
                return 1;
            } else if (caracteristica1.nmTipoTermo == caracteristica2.nmTipoTermo) {
                return 0;
            } else {
                return -1;
            }
        });

    }

    function close() {
        $modalInstance.dismiss();
    }

    /**
     * Obtém as características do termo
     * formatada em uma lista de texto
     * separado por vírgula.
     */
    function formataCaracteristicas(termo) {
        return termo.caracteristicas.map(function(c) {
            return c.nmTipoTermo;
        }).join(',');
    }

}
