angular.module('cadastro-central-module').controller('ModalTipoPrestadorServicoCtrl', ModalTipoPrestadorServicoCtrl);

ModalTipoPrestadorServicoCtrl.$inject = ['$modalInstance','$scope','$http','$timeout','PATHCONFIG','$q','$state','notify','usSpinnerService', 'pessoaService', 'papelService', 'dialogService'];

function ModalTipoPrestadorServicoCtrl($modalInstance,$scope,$http,$timeout,PATHCONFIG,$q,$state,notify, usSpinnerService, pessoaService, papelService, dialogService) {
	
	var controller = this;
	
	controller.papel = {
			
	};
	
	controller.cancelar = cancelar;
	controller.incluir = incluir;
	controller.excluir = excluir;
	controller.buscaTiposPrestadores = buscaTiposPrestadores;
	
	buscaTiposPrestadores();
	
	function cancelar() {
		$modalInstance.dismiss();
	}
	
	function incluir() {
		var foundPapel = false;
		controller.papeis.forEach(function(papel){
			if(papel.descricao == controller.papel.descricao){
				notify({message:'Tipo de Prestador de Serviço já cadastrado!', classes:'alert-danger',position:'right'});
				foundPapel = true;
			}
		});
		
		if(!foundPapel){
			controller.papel.tipoCadastro = 'PRESTADOR DE SERVICO';
			papelService.insertPapel(controller.papel).success(function(response){
				notify({message:'Tipo de Prestador de Serviço inserido com sucesso!', classes:'alert-success',position:'right'});
				$modalInstance.close(response);
			});
		}
	}
	
	function excluir(papel){
		dialogService.show('Excluir', 'Deseja excluir o contato ' + papel.descricao + '?','Sim','Não').result.then(function(){
			papelService.deletePapel(papel.id).success(function(papel){
				buscaTiposPrestadores();
				notify({message:'Tipo de Prestador de Serviço excluido com sucesso!', classes:'alert-success',position:'right'});
			}).error(function(){
				notify({message:'Esse Tipo de Prestador de Serviço possui vínculo com outra pessoa e por isso não poderá ser excluída!', classes:'alert-danger',position:'right'});
			});
		});
	}
	
	function buscaTiposPrestadores(){
		papelService.findAllByTipoCadastro('PRESTADOR DE SERVICO').then(
				function(response) {
					controller.papeis = response.data;
				}
		);
	}
	
}