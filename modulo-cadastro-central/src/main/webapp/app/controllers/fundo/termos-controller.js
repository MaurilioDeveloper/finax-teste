angular.module('cadastro-central-module').controller('TermosFundoCtrl', TermosFundoCtrl);

TermosFundoCtrl.$inject = ['dialogService','fundoTermoService','notify','$scope','PATHCONFIG','$rootScope','$modal','$state'];

function TermosFundoCtrl(dialogService,fundoTermoService,notify,$scope,PATHCONFIG,$rootScope,$modal,$state) {
	
	var controller = this;

	controller.termos = [];
	
	controller.acao = $scope.fundoCtrl.acao;

	controller.filtros = {
        pessoaFundo:{
            id:$scope.fundoCtrl.pessoaFundo.id,
            pessoa:{}
        },
        caracteristicas:[]
    };

    controller.formataCaracteristicas = formataCaracteristicas;
    controller.excluir = excluir;
    controller.PATHCONFIG = PATHCONFIG;
    controller.abriModalTermo = abriModalTermo;

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

    function excluir(termo) {

        dialogService.show('Excluir','Deseja excluir o termo ' + termo.nmTermo + '?','Sim','Não').result.then(function () {
            fundoTermoService.excluir(termo.idPessoaFundoTermo).then(function(){
                notify({message:'O termo foi excluído com sucesso!', classes:'alert-success',position:'right'});
                $scope.$broadcast('refreshDataTable');
            });
        });

    }
    
    function abriModalTermo() {
    	$modal.open({
          size:'lg',
          backdrop:'static',
          animation:true,
          templateUrl:'app/views/fundo/modal-termo.html',
          controller:'TermoCtrl',
          controllerAs:'termoCtrl',
			scope:$scope
      }).result.then(function(){
    	  console.log('refreshDataTable');
    	  $scope.$parent.$broadcast('refreshDataTable');
          //$state.go('^');
      },function(){
    	  console.log('');
          //$state.go('^');
      });

    }

    
}