angular.module('cadastro-central-module').controller('ModalDescBoletoEmitidoCtrl', ModalDescBoletoEmitidoCtrl);

ModalDescBoletoEmitidoCtrl.$inject = ['informacaoCarteira','$modalInstance'];

function ModalDescBoletoEmitidoCtrl(informacaoCarteira,$modalInstance) {
	
	var controller = this;
	
	controller.cancelar = cancelar;
	
	controller.informacaoCarteira = informacaoCarteira;
	
	function cancelar() {
		$modalInstance.dismiss();
	}
	
}