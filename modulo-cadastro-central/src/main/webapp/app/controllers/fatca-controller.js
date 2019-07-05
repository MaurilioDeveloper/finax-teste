angular.module('cadastro-central-module').controller('FatcaCtrl', FatcaCtrl);

FatcaCtrl.$inject = ['$scope','$http','$timeout','$stateParams','PATHCONFIG','$q','$state','notify','usSpinnerService', 'pessoaService'];

function FatcaCtrl($scope, $http, $timeout, $stateParams, PATHCONFIG, $q, $state,notify, usSpinnerService, pessoaService) {
	
	var controller = this;
	controller.incluirFatca = incluirFatca;
	
	controller.questionario = [
   			questao1 = null,
   			questao2 = null,
   			questao3 = null,
   			questao4 = null,
   			questao5 = null,
   			questao6 = null,
   			questao7 = null,
   			questao8 = null,
   			questao9 = null,
   			questao10 = null,
   			questao11 = null,
   			questao12 = null,
   			questao13 = null
   	];
	
	controller.motivos = [
			"Turismo",
			"Trabalho",
			"Estudo",
			"Outros"
	];
	
	function buscaFatca(){
		pessoaService.findPessoaRespostaFatcaByPessoa($scope.pessoaCtrl.pessoa.id).success(function(data){
			if(data != null && data != undefined) {
				for (i = 0; i < data.length; i++) { 
					var pergunta = data[i].pergunta;					
					populaQuestionario(pergunta, data[i]);				
				}
			}	
		});
	}
	
	function incluirFatca(questao){
		questao.pessoa = $scope.pessoaCtrl.pessoa;
		pessoaService.insertPessoaRespostaFatca(questao).success(function(data){
			buscaFatca();
		}).error(function(){
			notify({message:'Erro ao salvar a questão!', classes:'alert-danger',position:'right'});
		});
	}
	
	function populaQuestionario(pergunta, questao) {
		switch(pergunta) {
		    case 1:
		    	controller.questionario.questao1 = questao;
		        break;
		    case 2:
		    	controller.questionario.questao2 = questao;
		        break;
		    case 3:
		    	controller.questionario.questao3 = questao;
		        break;
		    case 4:
		    	controller.questionario.questao4 = questao;
		        break;
		    case 5:
		    	controller.questionario.questao5 = questao;
		        break;
		    case 6:
		    	controller.questionario.questao6 = questao;
		        break;
		    case 7:
		    	controller.questionario.questao7 = questao;
		        break;
		    case 8:
		    	controller.questionario.questao8 = questao;
		        break;
		    case 9:
		    	controller.questionario.questao9 = questao;
		        break;
		    case 10:
		    	controller.questionario.questao10 = questao;
		        break;
		    case 11:
		    	controller.questionario.questao11 = questao;
		        break;
		    case 12:
		    	controller.questionario.questao12 = questao;
		        break;
		    case 13:
		    	controller.questionario.questao13 = questao;
		        break;
		}
	}
	
	buscaFatca();
}