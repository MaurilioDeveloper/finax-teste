angular.module('cadastro-central-module').controller('GrupoEconomicoCtrl', GrupoEconomicoCtrl);

GrupoEconomicoCtrl.$inject = ['$scope','$stateParams','$rootScope','$timeout','$filter','$q','$state','notify','usSpinnerService', 'utilsService', 'grupoEconomicoService', 'dialogService', 'PATHCONFIG'];

function GrupoEconomicoCtrl($scope,$stateParams,$rootScope,$timeout,$filter,$q,$state,notify,usSpinnerService, utilsService, grupoEconomicoService, dialogService, PATHCONFIG) {
	
	var controller = this;
	
	//Mensagens que se repetem.
	const PARTICIPANTE_IN_GRUPO = 'Participante já cadastrado no grupo econômico ';
	const ARQUIVO_INCORRETO = 'Arquivo inconsistente.';
	
	// I - incluir, V - Visualizar, E - Editar
	controller.acao = $stateParams.acao;
	controller.tab  = $stateParams.tab;
	controller.restUrl = PATHCONFIG.CADASTRO_CENTRAL;
	controller.modalAdicionarParticipante = modalAdicionarParticipante;
	controller.fecharModalAdicionarParticipante = fecharModalAdicionarParticipante;
	controller.salvarParticipante = salvarParticipante;
	controller.editarParticipante = editarParticipante;
	controller.aoClicarCPF = aoClicarCPF;
	controller.aoClicarCNPJ = aoClicarCNPJ;
	controller.excluirParticipante = excluirParticipante;
	controller.salvarGrupoEconomico = salvarGrupoEconomico;
	controller.buscaCnpjReceita = buscaCnpjReceita;
	controller.grupoEconomico = {};
	controller.titulo = $rootScope.title;
	
	$scope.indexParticipante = 0;
	
	
	//variavel para controle total de participantes.
	$scope.participantesScope = [];
	
	if (controller.tab == 3) {
		angular.element("#nomeGrupo").attr('disabled', true);
		angular.element("#btnSalvar").attr('disabled', true);
		angular.element(".btn-default").attr('disabled', true);
		angular.element(".btn-primary").attr('disabled', true);
	}
	
	if ($stateParams.identificador) {
		getGrupoEconomicoByIdentificador($stateParams.identificador); 
	}
	
	function modalAdicionarParticipante() {
		$scope.funcionalidade = 'Incluir';
		controller.participante = {};
		controller.participanteHistorico = {};
		
		$timeout(function(){
			angular.element("#modalAdicionarParticipante").modal("show");	
			controller.participante = {
				"tipoPessoa": 'J'
			};
			angular.element('#cnpj').focus();
		},250);
	}
	
	function fecharModalAdicionarParticipante() {
		angular.element("#modalAdicionarParticipante").modal("hide");					
	}
	
	function getGrupoEconomicoByIdentificador(identificador) {
		usSpinnerService.spin('spinner-1');
		grupoEconomicoService.getGrupoEconomicoByIdentificador(identificador).success(function(data){
			controller.grupoEconomico = data;
			grupoEconomicoService.getPessoasByGrupo(data.id).success(function(pessoas) {
				if (pessoas != null) {
					controller.participantes = pessoas.content;
					$scope.participantesScope = controller.participantes;
				}
			}).error(function() {
				notify({message:'Ocorreu um erro ao buscar pessoas de um grupo econômico.', classes:'alert-danger',position:'right'});
			})
			usSpinnerService.stop('spinner-1');
		}).error(function(){
			notify({message:'Ocorreu um erro ao buscar grupo economico.', classes:'alert-danger',position:'right'});
			usSpinnerService.stop('spinner-1');
		});
	}

	/**
	 * Salva Objeto de participante na lista. Ao final do processo,
	 * quando gravado Grupo Econômico, seria pesistido na base 
	 * a lista de PESSOAS (Participantes).
	 * GRAVAR LOG de inclusão e edição de participantes
	 */
	function salvarParticipante() {
		var participante = controller.participante;
		var mensagem = ""; 
		
		if ($scope.funcionalidade === 'Incluir') {
			mensagem = "Participante incluído com sucesso.";
		} else {
			mensagem = "Participante atualizado com sucesso.";
		}
		
		if(participante.tipoPessoa == 'J') {
			if (participante.id != null && participante.identificador.length == 8 && controller.participanteHistorico) {
				remove(controller.participantes, controller.participanteHistorico);
				adicionaParticipante(participante,mensagem);
				return;
			} else {
				if (!utilsService.validarCNPJ(participante.identificador.toString())) {
					notify({
						message: 'Número do documento CNPJ é inválido!',
						classes: 'alert-danger',
						position: 'right'
					});
					return;
				}
			}
		} else {
			if (!utilsService.validarCPF(participante.identificador.toString())) {
				notify({
					message: 'Número do documento CPF é inválido!',
					classes: 'alert-danger',
					position: 'right'
				});
				return;
			}
		}
		
		/**
		 * Verifica se existe na lista de participantes
		 * um participante com aquele identificador(cpf, cnpj) [R2]
		 */
		var participanteExiste = verificaParticipanteExiste(participante);
		if(participanteExiste) {
			return;
		}
		
		if (controller.participanteHistorico) {
			remove(controller.participantes, controller.participanteHistorico);
		}
		
		
		adicionaParticipante(participante,mensagem);
	}
	
	function adicionaParticipante(participante,mensagem) {
		$scope.participantesScope.push(participante);
		controller.participantes = $scope.participantesScope; 
		notify({message:mensagem, classes:'alert-success',position:'right'});
		angular.element("#modalAdicionarParticipante").modal("hide");
		$scope.$parent.$broadcast('refreshDataTable');
	}
	
	function verificaParticipanteExiste(participante) {
		var index = $scope.participantesScope.findIndex(function(o){
			 return o.identificador === participante.identificador;
		});	
		
		if(index != -1) {
			//Verifica se é uma edição, pois na edição CPF/CNPJ pode continuar o mesmo.
			if(participante.identificador != controller.participanteHistorico.identificador) {
				excessaoParticipanteNoGrupo();
				return true
			}
		}
		
		return false;
	}
	
	function excessaoParticipanteNoGrupo() {
		var nomeGrupo = controller.grupoEconomico.nomeGrupoEconomico ? controller.grupoEconomico.nomeGrupoEconomico : "";
		notify({
			message: PARTICIPANTE_IN_GRUPO + nomeGrupo,
			classes: 'alert-danger',
			position: 'right'
		});
	}
	
	/**
	 * Verifica se existe o elemento no array, caso exista,
	 * remove ele.
	 */
	function remove(array, element) {
		var index = array.findIndex(function(o){
			 return JSON.stringify(o) === JSON.stringify(element);
		});
		if(index != -1) {
			$scope.participantesScope.splice(index, 1);
			controller.participantes = $scope.participantesScope; 
		}
	}
	
	function buscaCnpjReceita(cnpj) {
		if (cnpj) {
			if (cnpj.length >= 14) {
				if (!utilsService.validarCNPJ(cnpj)) {
					notify({
						message: 'O CNPJ '+ cnpj +' é inválido',
						classes: 'alert-danger',
						position: 'right'
					});
					return ;
				}
				grupoEconomicoService.buscaCnpjReceita(cnpj).success(function(data){
					console.log(data);
					if (data.message != null) {
						notify({message:data.mensagem, classes:'alert-danger',position:'right'});
					}
					controller.participante.nome = data.nome;
				}).error(function(data, status, headers, config) {
			    	notify({message:data, classes:'alert-danger',position:'right'});
			    });
			}
		}
	}
	
	
	 /**
	  * Fica observando o FileContent. Caso ocorrá alguma alteração, irá realizar 
	  * as validações do arquivo CSV que já foi lido pela diretiva (file-reader-directive).
	  */ 
	$scope.$watch('fileContent', function(lines) {
		var participantesValidos = [];
		
	    if (lines) {
	    	usSpinnerService.spin('spinner-1');
	    	if (lines.length > 500) {
	    		notify({message:'Arquivo não pode ter mais de 500 registros.', classes:'alert-danger',position:'right'});
	    		angular.element("input[type='file']").val(null);
	    		usSpinnerService.stop('spinner-1');
	    		return;
	    	}
	    	
	    	for(var i=0;i < lines.length;i++) {
	    		var columns = lines[i];
	    		//Verifica se o arquivo possui 2 colunas.
	    		if(columns.length != 2) {
	    			notify({message:ARQUIVO_INCORRETO, classes:'alert-danger',position:'right'});
	    			angular.element("input[type='file']").val(null);
	    			participantesValidos = [];
	    			usSpinnerService.stop('spinner-1');
	    			break;
	    		} else {
	    			if(!angular.isNumber(parseInt(columns[0]))) {
	    				notify({message:'O CNPJ/CPF '+ columns[0] +' presente no arquivo é inválido', classes:'alert-danger',position:'right'});
	    				angular.element("input[type='file']").val(null);
	    				participantesValidos = [];
	    				usSpinnerService.stop('spinner-1');
	    				break;
	    			} else {
	    				if(columns[0].length == 14) {
	    					//Se CNPJ
	    					if (!utilsService.validarCNPJ(columns[0].toString())) {
	    						notify({
	    							message: 'O CNPJ/CPF '+ columns[0] +' presente no arquivo é inválido',
	    							classes: 'alert-danger',
	    							position: 'right'
	    						});
	    						angular.element("input[type='file']").val(null);
	    						participantesValidos = [];
	    						usSpinnerService.stop('spinner-1');
	    						break;
	    					}
	    					
	    					var participanteCNPJ = {};
	    					participanteCNPJ.identificador = columns[0];
	    					participanteCNPJ.nome = columns[1];
	    					participanteCNPJ.tipoPessoa = 'J';
	    					var index = $scope.participantesScope.findIndex(function(o){
	    						 return o.identificador === participanteCNPJ.identificador;
	    					});	
	    					
	    					if (index != -1) {
	    						notify({
	    							message: PARTICIPANTE_IN_GRUPO + controller.grupoEconomico.nome,
	    							classes: 'alert-danger',
	    							position: 'right'
	    						});
	    						angular.element("input[type='file']").val(null);
	    						usSpinnerService.stop('spinner-1');
	    						break;
	    					} else {
	    						participantesValidos.push(participanteCNPJ);
	    					}
	    				} else if(columns[0].length == 11) {
	    					//Se CPF
	    					if (!utilsService.validarCPF(columns[0].toString())) {
	    						notify({
	    							message: 'O CNPJ/CPF '+ columns[0] +' presente no arquivo é inválido',
	    							classes: 'alert-danger',
	    							position: 'right'
	    						});
	    						angular.element("input[type='file']").val(null);
	    						participantesValidos = [];
	    						usSpinnerService.stop('spinner-1');
	    						break;
	    					}
	    					
	    					var participanteCPF = {};
	    					participanteCPF.identificador = columns[0];
	    					participanteCPF.nome = columns[1];
	    					participanteCPF.tipoPessoa = 'F';
	    					
	    					var indexOf = $scope.participantesScope.findIndex(function(o){
	    						 return o.identificador === participanteCPF.identificador;
	    					});	
	    					if (indexOf != -1) {
	    						notify({
	    							message: PARTICIPANTE_IN_GRUPO + controller.grupoEconomico.nome,
	    							classes: 'alert-danger',
	    							position: 'right'
	    						});
	    						angular.element("input[type='file']").val(null);
	    						usSpinnerService.stop('spinner-1');
	    						break;
	    					} else {
	    						participantesValidos.push(participanteCPF);
	    					}
	    				} else {
	    					notify({message:'O CNPJ/CPF ' + columns[0] + ' presente no arquivo é inválido', classes:'alert-danger',position:'right'});
	    					angular.element("input[type='file']").val(null);
	    					participantesValidos = [];
	    					usSpinnerService.stop('spinner-1');
	    					break;
	    				}
	    			}
	    		}
	    		
	    	}

	    	if (participantesValidos.length > 0) {
	    		for(var j=0;j < participantesValidos.length;j++) {
		    		$scope.participantesScope.push(participantesValidos[j]);
		    	}
		    	controller.participantes = $scope.participantesScope;
		    	angular.element("input[type='file']").val(null);
		    	notify({message:'Arquivo carregado com sucesso.', classes:'alert-success',position:'right'});
		    	$scope.$parent.$broadcast('refreshDataTable');
		    	usSpinnerService.stop('spinner-1');
	    	}
	    }
	});
  
	
	function editarParticipante(participante) {
		$scope.funcionalidade = 'Editar';
		controller.participante = angular.copy(participante);
		
		controller.participanteHistorico = angular.copy(participante);
		
		$timeout(function(){
			angular.element("#modalAdicionarParticipante").modal("show");
		},250);
	}

	/**
	 * Exclusão lógica de Participante
	 * GRAVAR LOG de Exclusão de Participante
	 */
	function excluirParticipante(participante) {
		var participanteNome = participante.nome;
		if(participante.id) {
			dialogService.show('Excluir','Deseja excluir o participante do grupo econômico ' + participanteNome + '?','Sim','Não').result.then(function(){			
				grupoEconomicoService.excluirParticipante(controller.grupoEconomico.id, participante.id).success(function(){
					notify({message:'Participante excluido com sucesso!!', classes:'alert-success',position:'right'});
					remove(controller.participantes, participante);
					$scope.$parent.$broadcast('refreshDataTable');
				}).error(function(){
					notify({message:'Erro ao excluir participante!!', classes:'alert-danger',position:'right'});
				});
				
			});
		} else {
			remove(controller.participantes, participante);
			notify({message:'Participante excluido com sucesso!!', classes:'alert-success',position:'right'});
		}
		$scope.$parent.$broadcast('refreshDataTable');
	}
	
	function aoClicarCPF() {
		 
		controller.participante = {};
		controller.participante.tipoPessoa = 'F'; 

		$timeout(function(){
			angular.element('#cpf').focus();			
		});
	}

	function aoClicarCNPJ() {
		
		controller.participante = {};
		controller.participante.tipoPessoa = 'J'; 

		$timeout(function(){
			angular.element('#cnpj').focus();			
		});
	}
	
	/**
	 * Salva Grupo econômico, junto com a lista de Participantes (PESSOAS)
	 * 
	 */
	function salvarGrupoEconomico() {
		var grupoEconomico = angular.copy(controller.grupoEconomico);
		grupoEconomico.participantes = $scope.participantesScope;
		if (grupoEconomico.participantes.length == 0) {
			notify({message:"O Grupo econômico deve ter ao menos um participante vinculado a ele.", classes:'alert-danger',position:'right'});
			return;
		}
		grupoEconomicoService.salvarGrupoEconomico(grupoEconomico).success(function(data){
			if (data.responseCode == 201) {
				notify({message:data.msg, classes:'alert-success',position:'right'});
				grupoEconomicoService.goConsultaGrupoEconomico();
			} else {
				notify({message:data.msg, classes:'alert-danger',position:'right'});
			}
		});
	}
	
}