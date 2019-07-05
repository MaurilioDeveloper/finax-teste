angular.module('cadastro-central-module').controller('ConsultaPessoaCtrl', ConsultaPessoaCtrl);

ConsultaPessoaCtrl.$inject = ['$scope','$http', '$timeout', '$filter','PATHCONFIG','$q','$state','notify','usSpinnerService','pessoaService','utilsService','papelService','dialogService'];

function ConsultaPessoaCtrl($scope,$http,$timeout,$filter,PATHCONFIG,$q,$state,notify, usSpinnerService,pessoaService,utilsService,papelService,dialogService) {

	var controller = this;

	controller.pessoa = {
		tipoPessoa: 'J',
		papeis:[]
	};

	controller.changePapel = changePapel;
	controller.buscaPapel = buscaPapel;
	controller.validateIdentificador = validateIdentificador;
	controller.validaCpf = validaCpf;
	controller.validaCnpj = validaCnpj;
	controller.pessoas = [];
	controller.restUrl = PATHCONFIG.CADASTRO_CENTRAL;
	controller.excluir = excluir;
	controller.resetForm = resetForm;
	controller.aoClicarCPF = aoClicarCPF;
	controller.aoClicarCNPJ = aoClicarCNPJ;
	
	papelService.findAll().success(function(papeis){
		if(controller.pessoaRelacionada){
			papeis = papeis.filter(function(papel){
				return papel.descricao == 'Sócio com poderes de representação' || papel.descricao == 'Sócio sem poderes de representação' || papel.descricao == 'Procurador' || papel.descricao == 'Acionista' || papel.descricao == 'Diretor' || papel.descricao == 'Administrador' || papel.descricao == 'Controladoras/Controladas/Coligadas' ;
			});
			
		}else{
			papeis = papeis.filter(function(papel){
				return papel.descricao == 'Cotista' || papel.descricao == 'Correntista';
			});
			
		}
		
		controller.papeis = papeis;
	})
	
	function resetForm(){
		controller.pessoa.identificador = '';
		controller.pessoa.nomeRazao = '';
		controller.pessoa.id = '';
		
		controller.papeis.forEach(function(papel){
			papel.checked = false;
		});
    };
	
	function incluir() {
		if(controller.pessoa.tipoPessoa == 2){
			if(utilsService.validarCPF(controller.pessoa.identificador)){
				buscaPessoa();
			}else{
				notify({message:'Número de documento CPF inválido', classes:'alert-danger',position:'right'});
			}
		}else{
			if(utilsService.validarCNPJ(controller.pessoa.identificador)){
				buscaPessoa();
			}else{
				notify({message:'Número de documento CNPJ inválido', classes:'alert-danger',position:'right'});
			}
		}
	}
	
	/**
	 * Exclui o cadastro de uma pessoa.
	 */
	function excluir(cliente) {
		
		
		dialogService.show('Excluir','Deseja excluir o cliente ' + $filter('cpfcnpj')(cliente.identificador) +'?','Sim','Não').result.then(function(){
			
			usSpinnerService.spin('spinner-1');
			pessoaService.excluirPessoaCliente(cliente.id).success(function(){
				notify({message:'O cliente foi excluído com sucesso!', classes:'alert-success',position:'right'});
				$scope.$broadcast('refreshDataTable');
				usSpinnerService.spin('spinner-1');
			}).error(function(msg){
				$scope.$broadcast('refreshDataTable');
				notify({message:'Esse cliente possui vínculo e por isso não poderá ser excluído!', classes:'alert-danger',position:'right'});
			});
		});
	}

	function changePapel() {
		controller.pessoa.papeis = controller.papeis.filter(function(papel){
			return papel.checked;
		});
	}

	function buscaPapel(papeis) {
		descricaoPapel = "";
		
		papeis = papeis.filter(function(papel){
			return papel.descricao == 'Cotista' || papel.descricao == 'Correntista';
		});
		
		papeis.forEach(function(papelPessoa){		
		descricaoPapel += "/" + papelPessoa.descricao;
		});
		
//		papeis.forEach(function(papelPessoa){		
//			descricaoPapel += "/" + papelPessoa.descricao;
//		});

		return descricaoPapel.substring(1);
	}
	
	
	function validaCnpj() {
			
		if (!controller.pessoa.identificador || controller.pessoa.identificador == '') {
			return;
		}
		
		if(!utilsService.validarCNPJ(controller.pessoa.identificador)){
			notify({message:'Número de documento CNPJ inválido', classes:'alert-danger',position:'right'});
		}
		
	}

	function validaCpf() {
			
		if (!controller.pessoa.identificador || controller.pessoa.identificador == '') {
			return;
		}
		
		if(!utilsService.validarCPF(controller.pessoa.identificador)){
			notify({message:'Número de documento CPF inválido', classes:'alert-danger',position:'right'});
		}
		
	}
	
	function validateIdentificador() {
		if (!controller.pessoa.identificador || controller.pessoa.identificador == '') {
			return false;
		}
		
		if(controller.pessoa.tipoPessoa == 'F'){
			return !(utilsService.validarCPF(controller.pessoa.identificador));
		}else if(controller.pessoa.tipoPessoa == 'J'){
			return !(utilsService.validarCNPJ(controller.pessoa.identificador));
		}else{
			return false;
		}
	}
	
	function aoClicarCPF() {
		controller.pessoa.tipoPessoa = 'F'; 
		controller.pessoa.identificador = '';
		$timeout(function(){
			angular.element('#cpf').focus();			
		});
	}
	
	function aoClicarCNPJ() {
		controller.pessoa.tipoPessoa = 'J'; 
		controller.pessoa.identificador = '';
		$timeout(function(){
			angular.element('#cnpj').focus();			
		});
	}
}