angular.module('cadastro-central-module').controller('ModalContatoPrestadorServicoCtrl', ModalContatoPrestadorServicoCtrl);

ModalContatoPrestadorServicoCtrl.$inject = ['$modalInstance','$scope','$http','$stateParams','$timeout','PATHCONFIG','$q','$state','notify','usSpinnerService', 'pessoaContatoService', 'identificador'];

function ModalContatoPrestadorServicoCtrl($modalInstance,$scope,$http,$stateParams,$timeout,PATHCONFIG,$q,$state,notify, usSpinnerService, pessoaContatoService, identificador) {
	
	var controller = this;
	
	controller.cancelar = cancelar;
	controller.buscaContatoTiposPrestadores = buscaContatoTiposPrestadores;
	console.log(identificador);
	
	buscaContatoTiposPrestadores();
	
	/**
	 * Fecha a modal.
	 */
	function cancelar() {
		$modalInstance.dismiss();
	}
	
	function buscaContatoTiposPrestadores(){
		pessoaContatoService.findAllContatoByIdentificador(identificador).then(
			function(response){
				controller.contatos= response.data;
				
		});
	}
	
}