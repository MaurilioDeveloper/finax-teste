angular.module('cadastro-central-module').controller('InfFinanceirasCtrl', InfFinanceirasCtrl);

InfFinanceirasCtrl.$inject = ['utilsService','notify','pessoaService','$scope','$timeout','$filter','dialogService'];

function InfFinanceirasCtrl(utilsService,notify,pessoaService,$scope,$timeout,$filter,dialogService) {
	
	var controller = this;
	
	controller.incluir = incluir;
	controller.excluir = excluir;
	controller.editar = editar;
	
	carregaInfFinanceiras();
	
	/**
	 * Objeto que será utilizado para preenchimento
	 * dos dados da tela.
	 */
	controller.infFinanceira = {};
	
	/**
	 * As informações financeiras da pessoa.
	 */
	controller.infFinanceiras = [];
	
	//Combo referência
	controller.referencias = ['Anual','Mensal'];
	
	/**
	 * Cadastra na base de dados uma nova informação financeira
	 * para a pessoa. 
	 */
	function incluir() {
		
		controller.infFinanceira.pessoa = $scope.pessoaCtrl.pessoa; 
		
		pessoaService.insertPessoaInfFinanceira(controller.infFinanceira).success(function(){
			
			// Após a inclusão cria um novo objeto para preenchimento
			// dos dados novamente
			controller.infFinanceira = {};
			
			carregaInfFinanceiras();
			
			$scope.pessoaCtrl.abas.infFinanceiras.erros = [];
			
		});
		
	}
	
	/**
	 * Exclui uma informacao financeira.
	 * 
	 * @param idInfFinanceira o id da informação financeira
	 */
	function excluir(infFinanceira) {
		
		dialogService.show('Excluir','Deseja excluir o rendimento ' + infFinanceira.descricaoRendimento + '?','Sim','Não').result.then(function(){
			
			pessoaService.excluirPessoaInfFinanceira(infFinanceira.id).success(function(){
				carregaInfFinanceiras();
				controller.infFinanceira = {};
			});
			
		});
		
		
	}
	
	/**
	 * Carrega uma informação financeira para a área de inclusão.
	 * 
	 * @param infFinanceira a informação financeira a ser editada
	 */
	function editar(infFinanceira) {
		
		controller.infFinanceira = angular.copy(infFinanceira);
		
		$timeout(function(){
			angular.element('#valor-atual').blur();			
		});
		
	}
	
	/**
	 * 	Busca as informações financeiras da pessoa.
	 */
	function carregaInfFinanceiras() {
		
		pessoaService.findPessoaInfFinanceiras($scope.pessoaCtrl.pessoa.id).success(function(infFinanceiras){
			controller.infFinanceiras = infFinanceiras;
		});
		
	}	
	
}