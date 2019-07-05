angular.module('cadastro-central-module').controller('ModalTipoFundosCtrl', ModalTipoFundosCtrl);

ModalTipoFundosCtrl.$inject = ['dialogService','$modalInstance','$scope','$http','$timeout','PATHCONFIG','$q','$state','notify','usSpinnerService','tipoFundoService'];

function ModalTipoFundosCtrl(dialogService,$modalInstance,$scope,$http,$timeout,PATHCONFIG,$q,$state,notify, usSpinnerService, tipoFundoService) {
	
	var controller = this;
	
	controller.cancelar = cancelar;
	controller.fechar = fechar;
	controller.incluirTipoFundo = incluirTipoFundo;
	controller.excluirTipoFundo = excluirTipoFundo;
	controller.editarTipoFundo = editarTipoFundo;
	controller.alterarTipoFundo = alterarTipoFundo;
	controller.editar = false;
	
	controller.restUrl = PATHCONFIG.CADASTRO_CENTRAL;
	
	controller.tipoFundo=
	{
			 id: '',
				dsSigla: '',
				dsTipoFundo: ''
	};
	
	
	controller.tipoFundos =[
		{
		    id: '',
			dsSigla: '',
			dsTipoFundo: ''
		}
	];
	
	findByFilter();
	
	
	
	function findByFilter(){
		$('#filterLink').click();
	}
	
	/**
	 * Fecha a modal.
	 */
	function fechar() {
		$modalInstance.dismiss();
		
	}

	function incluirTipoFundo(tipoFundo){
		controller.tipoFundos.forEach(function(tipoFundoExiste){		
			if(tipoFundoExiste.dsSigla == tipoFundo.dsSigla){
				notify({message:'O tipo de fundo informado já está cadastrado.', classes:'alert-danger',position:'right'});
				controller.existe = true;
				return false
			} 
		});
		
		if (!controller.existe) {
			tipoFundoService.incluirTipoFundo(tipoFundo).then(function (response) {
				notify({message:'O Tipo de Fundo foi incluído com sucesso!', classes:'alert-success',position:'right'});
				controller.tipoFundo = '';
				findByFilter();
			}).finally(function () {
				resolve();
			});
		}
		
	}
	
	function excluirTipoFundo(tipoFundo){
		 
		dialogService.show('Excluir','Deseja realmente excluir este tipo de fundo?','Sim','Não').result.then(function(){
			tipoFundoService.excluirTipoFundo(tipoFundo.id).success(function(tipoFundo){
				findByFilter();
				notify({message:'O Tipo de Fundo foi excluído com sucesso!', classes:'alert-success',position:'right'});
			}).error(function(){
				notify({message:'Este tipo está relacionado a um ou mais fundos. Para excluir um tipo o mesmo não pode estar relacionado a nenhum fundo.', classes:'alert-danger',position:'right'});
			});
		},
		function(){
			
		});
	}
	
	
	
	
	function carregarTipoFundos(){
		tipoFundoService.carregarTipoFundos().then(function (response) {
			controller.tipoFundos = response.data;
		}).finally(function () {
			resolve();
		});
	}
	
	
	function editarTipoFundo(tipoFundo){
		controller.tipoFundo = tipoFundo;
		controller.editar = true;
		removeTipoFundoSelecionado(tipoFundo);
	}	
	
	
	function removeTipoFundoSelecionado(tipoFundo){
		for (var i = 0; i < controller.tipoFundos.length; ++i) {
			 if(controller.tipoFundos[i].dsSigla.trim() == tipoFundo.dsSigla.trim()){
				 controller.tipoFundos.splice(i, 1);
				 i = i-1
				 break;
			 }
		}
	}
	
	function alterarTipoFundo(tipoFundo){
		tipoFundoService.alterarTipoFundo(tipoFundo).then(function (response) {
			controller.tipoFundo = '';
			controller.editar = false;
			findByFilter();
		}).finally(function () {
			resolve();
		});
	}
	
	function cancelar(){
		controller.editar = false;
		controller.tipoFundos = '';
		controller.tipoFundo = null;
		findByFilter();
	}
	
}