angular.module('cadastro-central-module').controller('AfirmacoesCtrl', AfirmacoesCtrl);

AfirmacoesCtrl.$inject = ['$scope','$http','$timeout','PATHCONFIG','$q','$state','notify','usSpinnerService', 'pessoaService'];

function AfirmacoesCtrl($scope,$http,$timeout,PATHCONFIG,$q,$state,notify, usSpinnerService, pessoaService) {
	
	var controller = this;
	
	controller.afirmacao = {};
	controller.disableClick = false;
	
	controller.incluirPessoaAfirmacoes = incluirPessoaAfirmacoes;
	
	function buscaAfirmacoes(){
		pessoaService.findPessoaAfirmacoes($scope.pessoaCtrl.pessoa.id).success(function(data){
			controller.disableClick = false;
			controller.afirmacao = data;
		});
	}
	
	function incluirPessoaAfirmacoes(){
		controller.disableClick = true;
		$timeout(function(){
			controller.afirmacao.pessoa = {
				id: $scope.pessoaCtrl.pessoa.id
			}
			pessoaService.insertPessoaAfirmacao(controller.afirmacao).success(function(data){
				controller.disableClick = false;
				//buscaAfirmacoes();
			});
		});
	}
	
	buscaAfirmacoes();
}