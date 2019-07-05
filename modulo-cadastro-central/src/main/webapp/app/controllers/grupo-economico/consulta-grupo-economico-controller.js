angular.module('cadastro-central-module').controller('ConsultaGrupoEconomicoCtrl', ConsultaGrupoEconomicoCtrl);

ConsultaGrupoEconomicoCtrl.$inject = ['$scope','$http', '$timeout', '$filter','PATHCONFIG','$q','$state','notify','usSpinnerService','utilsService','dialogService','grupoEconomicoService'];

function ConsultaGrupoEconomicoCtrl($scope,$http,$timeout,$filter,PATHCONFIG,$q,$state,notify, usSpinnerService,utilsService,dialogService,grupoEconomicoService) {
	
	var controller = this;
	
	controller.grupoEconomico = {};
	controller.resetForm = resetForm;
	controller.excluirGrupoEconomico = excluirGrupoEconomico;
	controller.restUrl = PATHCONFIG.CADASTRO_CENTRAL;
	controller.buscarGrupos = buscarGrupos;
	//Variavel que armazena todos os itens de todas as paginas
	$scope.gruposHistorico = [];
	
	grupoEconomicoService.findAll().then(function(retorno) {
		controller.grupos = retorno.data.content;
		$scope.gruposHistorico = controller.grupos;
		$scope.$parent.$broadcast('refreshDataTable');
	});	
	
	
	function buscarGrupos() {
		if(controller.grupoEconomico.nomeGrupoEconomico) {
			usSpinnerService.spin('spinner-1');
			var filtrado;
			var valorBusca = parseInt(controller.grupoEconomico.nomeGrupoEconomico.replace(/\D/g,''));
			if (!isNaN(valorBusca)) {
				grupoEconomicoService.findByCpfCnpj(controller.grupoEconomico.nomeGrupoEconomico).success(function(data){
					if (data.id != null) {
						controller.grupos = $scope.gruposHistorico.filter(function(obj) { 
							return obj.id == data.id;
						});
					} else {
						controller.grupos = [];
					}
					usSpinnerService.stop('spinner-1');
				}).error(function(){
					notify({message:'Erro ao filtrar grupo econômico!!', classes:'alert-danger',position:'right'});
					usSpinnerService.stop('spinner-1');
				});
			} else {
				filtrado = $scope.gruposHistorico.filter(function(obj) { 
					return obj.nomeGrupoEconomico.toUpperCase().match(controller.grupoEconomico.nomeGrupoEconomico.trim()); 
				});
				usSpinnerService.stop('spinner-1');
				controller.grupos = filtrado;
			}
		} else {
			controller.grupos = $scope.gruposHistorico;
		}
		$scope.$parent.$broadcast('refreshDataTable');
	}

	function resetForm(){
		controller.grupoEconomico.nomeGrupoEconomico = '';
    }
	
	/**
	 * Exclusão lógica de Grupo Econômico. Excluirá todos os participantes.
	 * GRAVAR LOG de Exclusão de Grupo Econômico
	 */
	function excluirGrupoEconomico(grupoEconomico) {
		dialogService.show('Excluir','Deseja excluir o grupo econômico?','Sim','Não').result.then(function(){			
			grupoEconomicoService.excluirGrupoEconomico(grupoEconomico.id).success(function(){
				notify({message:'Grupo econômico excluído com sucesso.', classes:'alert-success',position:'right'});
				remove(controller.grupos, grupoEconomico);
			}).error(function(){
				notify({message:'Erro ao excluir grupo econômico!!', classes:'alert-danger',position:'right'});
			});
			
		});
	}
	
	/**
	 * Verifica se existe o elemento no array, caso exista,
	 * remove ele.
	 */
	function remove(array, element) {
		var index = array.findIndex(function(o){
			 return JSON.stringify(o) === JSON.stringify(element);
		});
		if(index != -1) {
			$scope.gruposHistorico.splice(index, 1);
			controller.grupos = $scope.gruposHistorico; 
		}
	}


    
}