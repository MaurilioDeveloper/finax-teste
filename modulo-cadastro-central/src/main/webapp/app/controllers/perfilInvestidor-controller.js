angular.module('cadastro-central-module').controller('PerfilInvestidorCtrl', PerfilInvestidorCtrl);

PerfilInvestidorCtrl.$inject = ['utilsService','notify','WizardHandler','pessoaService','$rootScope','$scope','$state','$timeout','$filter','$q','usSpinnerService'];

function PerfilInvestidorCtrl(utilsService,notify,WizardHandler,pessoaService,$rootScope,$scope,$state,$timeout,$filter,$q,usSpinnerService) {

	var controller = this;
	
	controller.openModal = openModal;
	controller.goQuestion2 = goQuestion2;
	controller.goQuestion3 = goQuestion3;
	controller.goQuestion4 = goQuestion4;
	controller.goQuestion5 = goQuestion5;
	controller.goQuestion6 = goQuestion6;
	controller.goQuestion7 = goQuestion7;
	controller.goQuestion8 = goQuestion8;
	controller.goQuestion9 = goQuestion9;
	controller.goQuestion10 = goQuestion10;
	controller.goQuestion11 = goQuestion11;
	controller.goQuestion12 = goQuestion12;
	controller.goResultQuestion = goResultQuestion;
	controller.isPessoaFisica = isPessoaFisica;
	controller.isCotista = isCotista;
	
	controller.findSuitabilityByPessoa = findSuitabilityByPessoa;
	controller.insertRespostaSuitability = insertRespostaSuitability;
	var defer = $q.defer();
	controller.canAdvanceNextStepPromise = defer.promise;
	defer.resolve();
	
	controller.findPerfilByPessoa = findPerfilByPessoa;
	controller.insertPessoaPerfil = insertPessoaPerfil;
	controller.perfilPessoa;
	/**
	 * Flag indicando que pode avançar para o próximo passo do wizard. Devido
	 * ao envio das respostas ao servidor levar um tempo considerável, deve-se
	 * bloquear o botão de avançar enquanto a resposta não voltar do servidor.
	 */
	controller.canAdvanceNextStep = true;
	
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
			questao13 = null,
			questao14 = null,
			questao15 = null,
			resultado = null
	];
	
	findSuitabilityByPessoa();
	findResultadoSuitabilityByPessoa();
	
	var SUITABILITY_PF = (function() {
	     var private = {
	         'QUESTAO_1': 'Qual sua renda mensal?',
	         'QUESTAO_2': 'Por quanto tempo deseja manter o investimento?',
	         'QUESTAO_3': 'Como avalia o desempenho da sua carteira de investimentos?',
	         'QUESTAO_4': 'Qual das respostas abaixo mais se assemelha à sua personalidade como investidor, em termos de finalidades do investimento?',
	         'QUESTAO_5': 'Classifique a sua experiência de investimentos:',
	         'QUESTAO_6': 'Dentro da sua renda mensal, qual o percentual que consegue investir?',
	         'QUESTAO_7': 'Com base em seus investimentos, quanto será necessário à liquidez imediata nos próximos 12 meses?',
	         'QUESTAO_8': 'Qual sua formação acadêmica?',
	         'QUESTAO_9':'Quantifique a sua experiência profissional no mercado financeiro:',
	         'QUESTAO_10':'Como reagiria se ao verificar que após determinado decurso de tempo o tipo de investimento escolhido estivesse apresentando retorno negativo?',
	         'QUESTAO_11':'Dentre as opções de investimentos listadas abaixo, favor indicar qual(is) você possui experiência?',
	         'QUESTAO_12':'Atualmente de qual forma a sua carteira de investimentos é composta em termos percentuais?',
	     };
	     return {
	        get: function(name) { return private[name]; }
	    };
	})();
	
	var SUITABILITY_PJ = (function() {
	     var private = {
	         'QUESTAO_1': 'O investidor pretende utilizar um percentual relevante dos seus investimentos no curto ou médio prazo?',
	         'QUESTAO_2': 'Com base nos investimentos do investidor, quanto será necessário à liquidez imediata nos próximos 12 meses?',
	         'QUESTAO_3': 'Considerando as condições abaixo, em termos percentuais, como será a alocação dos ativos do investidor?',
	         'QUESTAO_4': 'Dentre as opções de investimentos, como é feita a alocação de investimentos pelo investidor junto ao Petra?',
	         'QUESTAO_5': 'Atualmente, de qual forma a carteira de investimentos do investidor é composta em termos percentuais?',
	         'QUESTAO_6': 'Classifique o conhecimento e experiência em investimentos detidos pelo investidor:',
	         'QUESTAO_7': 'Como o investidor reagiria ao verificar que, após 06 meses, o tipo de investimento escolhido esteja apresentando retorno negativo?',
	         'QUESTAO_8': 'O investidor acredita que o aporte em produtos de maior risco é mais atraente do que em produtos de menor risco?',
	         'QUESTAO_9': 'Como o investidor avalia o desempenho da sua carteira de investimentos?',
	         'QUESTAO_10':'Qual das respostas abaixo mais se assemelha à personalidade do investidor, em termos de finalidades do investimento?',
	     };
	     return {
	        get: function(name) { return private[name]; }
	    };
	})();
	
	setSuitability('1');
	
	function openModal(){
		setSuitability('1');		
		WizardHandler.wizard().reset();
		$timeout(function(){
			angular.element("#modalQuestionario").modal("show");						
		},250);
	}
	
	function goQuestion2(valor){
		
		controller.canAdvanceNextStepPromise.then(function(){
			
			if(validateIsUndefined(valor)){return;}
			WizardHandler.wizard().next();
			controller.questionario.resposta1 = valor;			
			setSuitability('2');
			
		});
		
	}
	
	function goQuestion3(valor){
		
		controller.canAdvanceNextStepPromise.then(function(){
			
			if(validateIsUndefined(valor)){return;}
			WizardHandler.wizard().next();
			controller.questionario.resposta2 = valor;
			setSuitability('3');
			
		});
		
		
	}
	
	function goQuestion4(valor){
		
		controller.canAdvanceNextStepPromise.then(function(){
			
			if(validateIsUndefined(valor)){return;}
			WizardHandler.wizard().next();
			controller.questionario.resposta3 = valor;
			setSuitability('4');
			
		});
		
		
	}
	
	function goQuestion5(valor){
		
		controller.canAdvanceNextStepPromise.then(function(){
			
			if(validateIsUndefined(valor)){return;}
			WizardHandler.wizard().next();
			controller.questionario.resposta4 = valor;
			setSuitability('5');
			
		});
		
		
	}
	
	function goQuestion6(valor){
		
		controller.canAdvanceNextStepPromise.then(function(){
			
			if(validateIsUndefined(valor)){return;}
			if(!controller.isPessoaFisica()){
				if(controller.questionario.questao5.texto){
					var a = parseFloat(controller.questionario.questao5.texto);
				} else {
					var a = 0;
				}
				if(controller.questionario.questao6.texto){
					var b = parseFloat(controller.questionario.questao6.texto);		
				} else {
					var b = 0;
				}
				if(controller.questionario.questao7.texto){
					var c = parseFloat(controller.questionario.questao7.texto);
				} else {
					var c = 0;
				}
				if(controller.questionario.questao8.texto){
					var d = parseFloat(controller.questionario.questao8.texto);
				} else {
					var d = 0;
				}
				
				if(a+b+c+d == 100.00){
					WizardHandler.wizard().next();
					controller.questionario.resposta5 = valor;
					setSuitability('6');	
				}else{
					notify({
						message : "A soma total das porcentagens deve ser igual a 100.",
						classes : "alert-danger"
					});
					return;
				}
			}else{
				WizardHandler.wizard().next();
				controller.questionario.resposta5 = valor;
				setSuitability('6');	
			}
			
		});
		
		
	}
	
	function goQuestion7(valor){
		
		controller.canAdvanceNextStepPromise.then(function(){
			if(validateIsUndefined(valor)){return;}
			WizardHandler.wizard().next();
			controller.questionario.resposta6 = valor;
			setSuitability('7');			
		});
		
	}

	function goQuestion8(valor){
		
		controller.canAdvanceNextStepPromise.then(function(){
			
			if(validateIsUndefined(valor)){return;}
			WizardHandler.wizard().next();
			controller.questionario.resposta7 = valor;
			setSuitability('8');
			
		});
		
		
	}
	
	function goQuestion9(valor){
		
		controller.canAdvanceNextStepPromise.then(function(){
			
			if(validateIsUndefined(valor)){return;}
			WizardHandler.wizard().next();
			controller.questionario.resposta8 = valor;
			setSuitability('9');
			
		});
		
		
	}
	
	function goQuestion10(valor){
		
		controller.canAdvanceNextStepPromise.then(function(){
			
			if(validateIsUndefined(valor)){return;}
			WizardHandler.wizard().next();
			controller.questionario.resposta9 = valor;
			setSuitability('10');
			
		});
		
		
	}

	function goQuestion11(valor){
		
		controller.canAdvanceNextStepPromise.then(function(){
			
			if(validateIsUndefined(valor)){return;}
			WizardHandler.wizard().next();
			controller.questionario.resposta10 = valor;
			setSuitability('11');
			
		});
		
		
	}
	
	function goQuestion12(valor){
		
		controller.canAdvanceNextStepPromise.then(function(){
			
			if(validateIsUndefined(valor)){return;}
			WizardHandler.wizard().next();
			controller.questionario.resposta11 = valor;
			setSuitability('12');
			
		});
		
		
	}
	
	function goResultQuestion(valor){
		
		controller.canAdvanceNextStepPromise.then(function(){
			
			if(validateIsUndefined(valor)){return;}
			if(controller.isPessoaFisica()){			
				if(controller.questionario.questao12.texto){
					var a = parseFloat(controller.questionario.questao12.texto);
				} else {
					var a = 0;
				}
				if(controller.questionario.questao13.texto){
					var b = parseFloat(controller.questionario.questao13.texto);		
				} else {
					var b = 0;
				}
				if(controller.questionario.questao14.texto){
					var c = parseFloat(controller.questionario.questao14.texto);
				} else {
					var c = 0;
				}
				if(controller.questionario.questao15.texto){
					var d = parseFloat(controller.questionario.questao15.texto);
				} else {
					var d = 0;
				}
				
				if(a+b+c+d == 100){
					findResultadoSuitabilityByPessoa();	
					WizardHandler.wizard().next();			
					$state.go("root.incluir.suitability-pf-resultado");
					controller.descricaoQuestao = "Resultado";		
				}else{
					notify({
						message : "A soma total das porcentagens deve ser igual a 100.",
						classes : "alert-danger"
					});
					return;
				}
			}else{
				findResultadoSuitabilityByPessoa();	
				WizardHandler.wizard().next();			
				$state.go("root.incluir.suitability-pf-resultado");
				controller.descricaoQuestao = "Resultado";	
			}
			
		});
		
		
	}
		
	function setSuitability(numeroQuestao) {
		if( isPessoaFisica() ) {
			setSuitability_PF(numeroQuestao);
		} else {
			setSuitability_PJ(numeroQuestao);
		}
	}
	
	function setSuitability_PF(numeroQuestao) {
		controller.descricaoQuestao = SUITABILITY_PF.get('QUESTAO_' + numeroQuestao);
		$state.go("root.incluir.suitability-pf-questao" + numeroQuestao);
	}
	
	function setSuitability_PJ(numeroQuestao) {
		controller.descricaoQuestao = SUITABILITY_PJ.get('QUESTAO_' + numeroQuestao);
		$state.go("root.incluir.suitability-pj-questao" + numeroQuestao);
	}
	
	function validateIsUndefined(valor){
		if(valor == undefined || valor == ""){
			notify({
				message : "Selecione alguma opção.",
				classes : "alert-danger"
			});
			return true;
		}
		return false;
	}
		
	function isCotista() {		
		return $scope.pessoaCtrl.pessoa.papeis.some(function(papel){
			return papel.descricao.toUpperCase() == 'COTISTA';
		});		
	}
	
	function isPessoaFisica() {	
		if($scope.pessoaCtrl.pessoa.identificador.toString().length <= 11){
			return true;
		}else{
			return false;
		}
	}
	
	function findSuitabilityByPessoa() {
		pessoaService.findPessoaRespostaSuitabilityByPessoa($scope.pessoaCtrl.pessoa.id).success(function(data){
			if(data != null && data != undefined) {
				for (i = 0; i < data.length; i++) { 
					var pergunta = data[i].pergunta;					
					populaQuestionario(pergunta, data[i]);				
				}
			}			
		});	
	}
	
	function findResultadoSuitabilityByPessoa() {
		pessoaService.findPessoaResultadoSuitabilityByPessoa($scope.pessoaCtrl.pessoa.id).success(function(data){
			controller.questionario.resultado = data.nome;	
		}).error(function(){
			notify({message:'Erro ao obter o resultado suitability!', classes:'alert-danger',position:'right'});
		});
	}
	
	findPerfilByPessoa();
	
	function findPerfilByPessoa() {
		pessoaService.findPerfilByPessoa($scope.pessoaCtrl.pessoa.id).success(function(data){
			controller.perfilPessoa= data;	
		}).error(function(){
			notify({message:'Erro ao obter o perfil da pessoa!', classes:'alert-danger',position:'right'});
		});
	}	
	
	function insertPessoaPerfil() {		
		if (controller.perfilPessoa.pessoa == null){
			controller.perfilPessoa.pessoa = $scope.pessoaCtrl.pessoa;
		}
		
		pessoaService.insertPessoaPerfil(controller.perfilPessoa).success(function(data){
			controller.perfilPessoa= data;
			$scope.pessoaCtrl.abas.perfil.erros = [];
		}).error(function(){
			notify({message:'Erro ao incluir/atualizar o perfil da pessoa!', classes:'alert-danger',position:'right'});
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
		    case 14:
		    	controller.questionario.questao14 = questao;
		        break;
		    case 15:
		    	controller.questionario.questao15 = questao;
		        break;
		}
	}
	
	function insertRespostaSuitability(questao) {
		
		var deferred = $q.defer();
		
		questao.pessoa = $scope.pessoaCtrl.pessoa;
		pessoaService.insertPessoaRespostaSuitability(questao).error(function(){
				notify({message:'Erro ao salvar a questão!', classes:'alert-danger',position:'right'});
			})['finally'](function(){
				deferred.resolve();
			});
		
		controller.canAdvanceNextStepPromise = deferred.promise;
		
	}

}