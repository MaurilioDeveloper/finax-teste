angular.module('cadastro-central-module').controller('ModalDescDadosBacarioFundoCtrl', ModalDescDadosBacarioFundoCtrl);

ModalDescDadosBacarioFundoCtrl.$inject = ['contaCorrenteFundo','$modalInstance','$scope','$http','$timeout','PATHCONFIG','$q','$state','notify','usSpinnerService','tipoFundoService'];

function ModalDescDadosBacarioFundoCtrl(contaCorrenteFundo,$modalInstance,$scope,$http,$timeout,PATHCONFIG,$q,$state,notify, usSpinnerService, tipoFundoService) {
	
	var controller = this;
	
	controller.cancelar = cancelar;
	
	controller.contaCorrenteFundo = contaCorrenteFundo;
	
	
	
	/**
	 * Fecha a modal.
	 */
	function cancelar() {
		$modalInstance.dismiss();
		
	}
	
}