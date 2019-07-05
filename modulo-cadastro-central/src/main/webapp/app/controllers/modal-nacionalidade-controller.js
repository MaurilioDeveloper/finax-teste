angular.module('cadastro-central-module').controller('ModalNacionalidadeCtrl', ModalNacionalidadeCtrl);

ModalNacionalidadeCtrl.$inject = ['$modalInstance','$scope','$http','$timeout','PATHCONFIG','$q','$state','notify','usSpinnerService', 'pessoaService', 'nacionalidadeService'];

function ModalNacionalidadeCtrl($modalInstance,$scope,$http,$timeout,PATHCONFIG,$q,$state,notify, usSpinnerService, pessoaService, nacionalidadeService) {
	
	var controller = this;
	
	controller.nacionalidade = {};
	
	controller.cancelar = cancelar;
	controller.incluirNacionalidade = incluirNacionalidade;
	controller.excluirNacionalidade = excluirNacionalidade;
	
	buscaNacionalidades();
	
	/**
	 * Fecha a modal.
	 */
	function cancelar() {
		$modalInstance.dismiss();
	}
	
	/**
	 * Chama o serviço REST para
	 * realizar a inclusão de uma nacionalidade
	 */
	function incluirNacionalidade() {
		//Verifica se a nacionalidade já esta inserida
		var foundNacionalidade = false;
		controller.nacionalidades.forEach(function(nacionalidade){
			if(nacionalidade.descricao == controller.nacionalidade.descricao){
				notify({message:'Nacionalidade já cadastrada!', classes:'alert-danger',position:'right'});
				foundNacionalidade = true;
			}
		});
		
		if(!foundNacionalidade){
			nacionalidadeService.insertNacionalidade(controller.nacionalidade).success(function(nacionalidade){
				notify({message:'Nacionalidade inserida com sucesso!', classes:'alert-success',position:'right'});
				$modalInstance.close();
			});
		}
	}
	
	function excluirNacionalidade(nacionalidade){
		nacionalidadeService.deleteNacionalidade(nacionalidade.id).success(function(nacionalidade){
			buscaNacionalidades();
			notify({message:'Nacionalidade excluida com sucesso!', classes:'alert-success',position:'right'});
		}).error(function(){
			notify({message:'Essa nacionalidade possui vínculo com outra pessoa e por isso não poderá ser excluída!', classes:'alert-danger',position:'right'});
		});
	}
	
	function buscaNacionalidades(){
		nacionalidadeService.findAll().success(function(data){
			controller.nacionalidades = data;
		});
	}
	
}