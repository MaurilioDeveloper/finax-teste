angular.module('cadastro-central-module').controller('DadosContatosCtrl', DadosContatosCtrl);

DadosContatosCtrl.$inject = ['$scope','$http','$timeout','$filter','PATHCONFIG','$q','$state', '$stateParams', 'notify','usSpinnerService','dialogService', 'pessoaContatoService', 'prestadorServicoService'];

function DadosContatosCtrl($scope,$http,$timeout,$filter,PATHCONFIG,$q,$state, $stateParams, notify, usSpinnerService,dialogService, pessoaContatoService, prestadorServicoService) {
		
	var controller = this;
	
	controller.contatos = [];
		
	controller.validaTelefone = validaTelefone;
	controller.incluirContato = incluirContato;
	controller.updateContato = updateContato;
	controller.deleteContato = deleteContato;
	controller.preparaUpdate = preparaUpdate;
	controller.cancel = cancel;
	controller.habilitarAcao = false;
	
	carregarContatoPrestadorServico();
	
	function carregarContatoPrestadorServico() {
		
		pessoaContatoService.findAllContatoByIdentificador($stateParams.identificador).then(
			function(response){
				controller.contato = {pessoa : {}};
				controller.contatos= response.data;
				controller.habilitarAcao = false;
				if(!controller.contatos) {
					controller.contato.pessoa = controller.contatos[0].pessoa;
				}  else {
					prestadorServicoService.getPrestadorServicoByIdentificador($stateParams.identificador).then(function(retorno){
						controller.prestadorServico = retorno.data;
						controller.contato.pessoa = controller.prestadorServico.pessoa;
					});
				}
		});
	}
		
	function validaTelefone(){
		if(controller.contato.numeroTelefone.toString().length > 0 && controller.contato.numeroTelefone.toString().length < 10){
			notify({message:'O número de telefone é inválido!', classes:'alert-danger',position:'right'});
			controller.contato.numeroTelefone = '';
		}
	}	
	
	function incluirContato() {
		
		if(controller.contato.email) {
			er = /^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2,3}/; 
			if( !er.exec(controller.contato.email) )
			{
				notify({message:'O e-mail é inválido!', classes:'alert-danger',position:'right'});
				return;
			}
		}
		pessoaContatoService.insertContato(controller.contato).success(function(response){
			notify({message:'Contato inserido com sucesso!', classes:'alert-success',position:'right'});
			prestadorServicoService.insertPessoaPrestadorServico(controller.prestadorServico).then(function(response){});
			carregarContatoPrestadorServico();
		});
	}
	
	function cancel() {
		$timeout(function() {
			controller.contato = {pessoa : {}};
			carregarContatoPrestadorServico();
		});
	}
	
	function preparaUpdate(contato) {
		controller.contato = angular.copy(contato);
		controller.habilitarAcao = true;
		for (var i = 0; i < controller.contatos.length; ++i) {
			 if(controller.contatos[i].id == contato.id){
				 controller.contatos.splice(i, 1);
				 i = i-1
				 break;
			 }
		} 
	}
	
	function updateContato() {
		if(controller.contato.email) {
			er = /^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2,3}/; 
			if( !er.exec(controller.contato.email) )
			{
				notify({message:'O e-mail é inválido!', classes:'alert-danger',position:'right'});
				return;
			}
		}
		pessoaContatoService.updateContato(controller.contato).success(function(response){
			notify({message:'Tipo de Prestador de Serviço alterado com sucesso!', classes:'alert-success',position:'right'});
			prestadorServicoService.insertPessoaPrestadorServico(controller.prestadorServico).then(function(response){});
			carregarContatoPrestadorServico();
		});
	}
	
	function deleteContato(contato) {
		dialogService.show('Excluir', 'Deseja excluir o contato ' + contato.nomeContato + '?','Sim','Não').result.then(function(){
			pessoaContatoService.deleteContato(contato.id).success(function(contato){
				prestadorServicoService.insertPessoaPrestadorServico(controller.prestadorServico).then(function(response){});
				carregarContatoPrestadorServico();
				notify({message:'Contato excluído com sucesso!', classes:'alert-success',position:'right'});
			});
		});
	}
}