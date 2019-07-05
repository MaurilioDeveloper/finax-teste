angular.module('cadastro-central-module')
.controller('ModalDescContaVirtualCtrl', ModalDescContaVirtualCtrl);

ModalDescContaVirtualCtrl.$inject = ['contaCorrenteFundo','$modalInstance'];

function ModalDescContaVirtualCtrl(contaCorrenteFundo,$modalInstance) {
	
	var controller = this;
	
	controller.cancelar = cancelar;
	
	controller.contaCorrenteFundo = contaCorrenteFundo;
	
	function cancelar() {
		$modalInstance.dismiss();
	}
	
}