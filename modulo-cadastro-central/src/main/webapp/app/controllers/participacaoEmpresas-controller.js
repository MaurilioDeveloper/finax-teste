angular.module('cadastro-central-module').controller('ParticipacaoEmpresasCtrl', ParticipacaoEmpresasCtrl);

ParticipacaoEmpresasCtrl.$inject = ['utilsService','notify','pessoaService','$scope','$timeout','dialogService'];

function ParticipacaoEmpresasCtrl(utilsService,notify,pessoaService,$scope,$timeout,dialogService) {
	
	var controller = this;
	controller.incluir = incluir;
	controller.excluir = excluir;
	controller.editar = editar;
	
	carregaParticipacoes();
	
	/**
	 * Objeto que será utilizado para preenchimento
	 * dos dados da tela.
	 */
	controller.participacaoEmpresa = {};
	
	/**
	 * As participações da pessoa.
	 */
	controller.participacaoEmpresas = [];
	
	/**
	 * Adiciona uma nova participacao em uma empresa.
	 */
	function incluir() {
		
		controller.participacaoEmpresa.pessoa = {
			id:$scope.pessoaCtrl.pessoa.id
		};
		
		pessoaService.insertPessoaParticipacaoEmpresa(controller.participacaoEmpresa).success(function(participacao){
			
			carregaParticipacoes();
			
			// Após a inclusão cria um novo objeto para preenchimento
			// dos dados novamente
			controller.participacaoEmpresa = {};
			
		});	
		
	}
	
	/**
	 * Exclui uma determinada participacao.
	 */
	function excluir(participacao) {
		
		dialogService.show('Excluir','Deseja excluir a participação nesta empresa ' + participacao.nomeEmpresaParticipa + '?','Sim','Não').result.then(function(){
			
			pessoaService.excluirPessoaParticipacaoEmpresa(participacao.id).success(function(){
				carregaParticipacoes();		
				controller.participacaoEmpresa = {};
			});
			
		});
	}
	
	/**
	 * Carrega uma participacao para a área de inclusão.
	 * 
	 * @param participacao a participacao a ser editada
	 */
	function editar(participacao) {
		
		controller.participacaoEmpresa = angular.copy(participacao);
		
		$timeout(function(){
			angular.element('#participacao').blur();			
		});
		
	}
	
	/**
	 * 	Busca as participacoes da pessoa.
	 */
	function carregaParticipacoes() {
	
		pessoaService.findPessoaParticipacaoEmpresasByIdPessoa(
				$scope.pessoaCtrl.pessoa.id).success(function(participacoes){
			controller.participacaoEmpresas = participacoes;
		});
		
	}
	
}