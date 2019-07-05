angular.module('cadastro-central-module').controller('DadosResponsaveisCtrl', DadosResponsaveisCtrl);

DadosResponsaveisCtrl.$inject = ['$scope','$http','$timeout','$filter','PATHCONFIG','$q','$state', 
	'$stateParams', 'notify','usSpinnerService','dialogService', 'responsavelService', 'utilsService', 'prestadorServicoService'];

function DadosResponsaveisCtrl($scope,$http,$timeout,$filter,PATHCONFIG,$q,$state, $stateParams, 
		notify, usSpinnerService,dialogService, responsavelService, utilsService, prestadorServicoService) {
		
	var controller = this;
	
	controller.habilitar = true;
	controller.habilitarAcao = false;
		
	controller.responsavel = {
			identificadorResponsavel : '',
			tipoPessoa : 'J'
	};
	controller.responsaveis = [];
	
	controller.assinaturas = [
		{
		    descricao: 'INDIVIDUAL',
			valor: '0'
		},
		{
		    descricao: 'CONJUNTA',
			valor: '1'
		},
		{
			descricao: 'SEM PODERES',
			valor: '2'
		}
	]
		
	controller.validaTelefone = validaTelefone;
	controller.incluirResponsavel = incluirResponsavel;
	controller.updateResponsavel = updateResponsavel;
	controller.deleteResponsavel = deleteResponsavel;
	controller.preparaUpdate = preparaUpdate;
	controller.cancel = cancel;
	controller.habilitaBtnIncluir = habilitaBtnIncluir;
	controller.aoClicarCNPJ = aoClicarCNPJ;
	controller.aoClicarCPF = aoClicarCPF;
	controller.validaCnpj = validaCnpj;
	controller.validaCpf = validaCpf;
	controller.validaEmail = validaEmail;
	controller.salvarPrestadorServico = salvarPrestadorServico;
	
	carregarResponsavelPrestadorServico();
	
	function habilitaBtnIncluir(){
		
		var conteudoSelecionado = $('#selectAssinatura').val();
		if(conteudoSelecionado != '') {
			controller.habilitar = false;
		} else {
			controller.habilitar = true;
		}
	}
	
	function carregarResponsavelPrestadorServico() {
		controller.prestadorServico = {};
		prestadorServicoService.getPrestadorServicoByIdentificador($stateParams.identificador).then(function(retorno){
			controller.prestadorServico = retorno.data;
			responsavelService.findAllByIdentificador($stateParams.identificador).then(function(response){
				controller.responsavel = {
						identificadorResponsavel : '',
						tipoPessoa : 'J'
				};
				
				controller.responsaveis= response.data;
				controller.habilitarAcao = false;
				if(controller.responsaveis.length != 0) {
					controller.responsavel.pessoa = controller.responsaveis[0].pessoa
				} else {
					controller.responsavel.pessoa = controller.prestadorServico.pessoa;
				}
			});
		});
	}
		
	function validaTelefone(){
		if(controller.responsavel.numeroTelefone.toString().length > 0 && controller.responsavel.numeroTelefone.toString().length < 10){
			notify({message:'O número de telefone é inválido!', classes:'alert-danger',position:'right'});
			controller.responsavel.numeroTelefone = '';
		}
	}
	
	
	
	function validaEmail(){
		er = /^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2,3}/; 
		if( !er.exec(controller.responsavel.emailResponsavel) )
		{
			notify({message:'O e-mail é inválido!', classes:'alert-danger',position:'right'});
			return;
		}
	}
	
	function incluirResponsavel() {
		
		if(!controller.responsavel.identificadorResponsavel){
			if(controller.responsavel.tipoPessoa == 'F'){
				notify({message:'O campo CPF é obrigatório', classes:'alert-danger',position:'right'});
				return;
			} else {
				notify({message:'O campo CNPJ é obrigatório', classes:'alert-danger',position:'right'});
				return;
			}
		} else {
			if (controller.responsavel.tipoPessoa == 'F') {
				if (!utilsService.validarCPF(controller.responsavel.identificadorResponsavel.toString())) {
					notify({
						message: 'Número do documento CPF é inválido!',
						classes: 'alert-danger',
						position: 'right'
					});
					return;
				}
			} else {
				if (!utilsService.validarCNPJ(controller.responsavel.identificadorResponsavel.toString())) {
					notify({
						message: 'Número do documento CNPJ é inválido!',
						classes: 'alert-danger',
						position: 'right'
					});
					return;
				}
			}
		}
		
		er = /^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2,3}/; 
		if( !er.exec(controller.responsavel.emailResponsavel) )
		{
			notify({message:'O e-mail é inválido!', classes:'alert-danger',position:'right'});
			return;
		}
		
		
		responsavelService.insertPessoaResponsavel(controller.responsavel).success(function(response){
			notify({message:'Tipo de Prestador de Serviço inserido com sucesso!', classes:'alert-success',position:'right'});
			prestadorServicoService.insertPessoaPrestadorServico(controller.prestadorServico).then(function(response){
				carregarResponsavelPrestadorServico();
			});
		});
	}
	
	
	
	function salvarPrestadorServico() {
		prestadorServicoService.insertPessoaPrestadorServico(controller.prestadorServico).then(function(response){
			carregarResponsavelPrestadorServico();
		});
	}
	
	function preparaUpdate(responsavel) {
		controller.responsavel = angular.copy(responsavel);
		controller.responsavel.tipoPessoa = responsavel.identificadorResponsavel.length == 11 ? 'F' : 'J';
		
		controller.habilitarAcao = true;
		for (var i = 0; i < controller.responsaveis.length; ++i) {
			 if(controller.responsaveis[i].id == responsavel.id){
				 controller.responsaveis.splice(i, 1);
				 i = i-1
				 break;
			 }
		} 
	}
	
	function updateResponsavel() {
		
		if(!controller.responsavel.identificadorResponsavel){
			if(controller.responsavel.tipoPessoa == 'F'){
				notify({message:'O campo CPF é obrigatório', classes:'alert-danger',position:'right'});
				return;
			} else {
				notify({message:'O campo CNPJ é obrigatório', classes:'alert-danger',position:'right'});
				return;
			}
		} else {
			if (controller.responsavel.tipoPessoa == 'F') {
				if (!utilsService.validarCPF(controller.responsavel.identificadorResponsavel.toString())) {
					notify({
						message: 'Número do documento CPF é inválido!',
						classes: 'alert-danger',
						position: 'right'
					});
					return;
				}
			} else {
				if (!utilsService.validarCNPJ(controller.responsavel.identificadorResponsavel.toString())) {
					notify({
						message: 'Número do documento CNPJ é inválido!',
						classes: 'alert-danger',
						position: 'right'
					});
					return;
				}
			}
		}
		
		er = /^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2,3}/; 
		if( !er.exec(controller.responsavel.emailResponsavel) )
		{
			notify({message:'O e-mail é inválido!', classes:'alert-danger',position:'right'});
			return;
		}
		responsavelService.insertPessoaResponsavel(controller.responsavel).success(function(response){
			notify({message:'Tipo de Prestador de Serviço alterado com sucesso!', classes:'alert-success',position:'right'});
			prestadorServicoService.insertPessoaPrestadorServico(controller.prestadorServico).then(function(response){
				carregarResponsavelPrestadorServico();
			});
		});
	}
	
	function cancel() {
		$timeout(function() {
			
			controller.prestadorServico = {};
			controller.responsavel = {
					identificadorResponsavel : '',
					tipoPessoa : 'J'
			};
			carregarResponsavelPrestadorServico();
		});
	}
	
	function deleteResponsavel(responsavel) {
		dialogService.show('Excluir', 'Deseja excluir o responsável ' + responsavel.nomeResponsavel + '?','Sim','Não').result.then(function(){
			responsavelService.deletePessoaResponsavel(responsavel.id).success(function(responsavel){
				prestadorServicoService.insertPessoaPrestadorServico(controller.prestadorServico).then(function(response){});
				carregarResponsavelPrestadorServico();
				notify({message:'Responsavel excluido com sucesso!', classes:'alert-success',position:'right'});
			});
		});
	}
	
	function aoClicarCPF() {
		controller.responsavel.tipoPessoa = 'F'; 
		controller.responsavel.identificadorResponsavel = '';
		
		$timeout(function(){
			angular.element('#cpf').focus();			
		});
	}
	
	function aoClicarCNPJ() {	
		controller.responsavel.tipoPessoa = 'J'; 
		controller.responsavel.identificadorResponsavel = '';
		
		$timeout(function(){
			angular.element('#cnpj').focus();			
		});
	}
	
	function validaCnpj() {
		if (!controller.responsavel.identificadorResponsavel
				|| controller.responsavel.identificadorResponsavel == '') {
			return;
		}

		if (!utilsService
				.validarCNPJ(controller.responsavel.identificadorResponsavel)) {
			notify({
				message : 'Número de documento CNPJ inválido',
				classes : 'alert-danger',
				position : 'right'
			});
		}
	}

	function validaCpf() {
		if (!controller.responsavel.identificadorResponsavel
				|| controller.responsavel.identificadorResponsavel == '') {
			return;
		}

		if (!utilsService
				.validarCPF(controller.responsavel.identificadorResponsavel)) {
			notify({
				message : 'Número de documento CPF inválido',
				classes : 'alert-danger',
				position : 'right'
			});
		}
	}
}