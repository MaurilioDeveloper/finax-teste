angular.module('cadastro-central-module').controller('PessoasRelacionadasCtrl', PessoasRelacionadasCtrl);

PessoasRelacionadasCtrl.$inject = ['utilsService','notify','WizardHandler','pessoaService','$rootScope','$scope','$state','usSpinnerService','$timeout','$filter','dialogService'];

function PessoasRelacionadasCtrl(utilsService,notify,WizardHandler,pessoaService, $rootScope,$scope,$state,usSpinnerService,$timeout,$filter,dialogService) {

	var controller = this;
	
	controller.incluir = incluir;
	controller.excluir = excluir;
	controller.editar = editar;
	
	controller.pessoasRelacionadas = [];
	controller.pessoaRelacionada = null;
	controller.pessoasRelacionadasUsuario = [];
	carregaPessoasRelacionadas();
	
	function carregaPessoasParaRelacionar() {
		if($scope.pessoaCtrl.acao != 'V'){
			usSpinnerService.spin('spinner-1');
			
			pessoaService.findAll().success(function(pessoas){
				
				var position = -1;
				pessoas.forEach(function(item,index){
					if(item.identificador == $scope.pessoaCtrl.pessoa.identificador){
						position = index;
					}
				});
				
				if(position > -1){
					pessoas.splice(position,1);
				}
				
				controller.pessoasRelacionadas = pessoas;
				
				usSpinnerService.stop('spinner-1');
			}).error(function(msg){
				usSpinnerService.stop('spinner-1');
				notify({message:msg, classes:'alert-danger',position:'right'});
			});
		}
	}
	
	
	/**
	 * Salva os dados para uma pessoa relacionada.
	 */
	function incluir() {
		//controller.pessoasRelacionadasUsuario.push(controller.pessoaRelacionada);
		
		pessoasRelacionadasUsuario = {
			id : {
				pessoaRelacionada : controller.pessoaRelacionada,
				pessoa : $scope.pessoaCtrl.pessoa
			}
		};
		
		pessoaService.insertPessoaRelacionada(pessoasRelacionadasUsuario).success(function(pessoasRelacionadasUsuario){
			carregaPessoasRelacionadas();
		}).error(function(error){
			notify({message: error, classes:'alert-danger',position:'right'});
		});
	}
	
	/**
	 * Carrega a tabela de pessoas relacionadas.
	 */
	function carregaPessoasRelacionadas() {
		
		pessoaService.findPessoasRelacionadas($scope.pessoaCtrl.pessoa.id).then(function(retornos){
					
			controller.listaPessoasRelacionadas = retornos.data;
					
		});
		
	}
	
	function excluir(cliente) {
		
		dialogService.show('Excluir','Deseja excluir o relacionamento de tipo ' + cliente.id.papel.descricao + ' com a pessoa ' + cliente.id.pessoaRelacionada.nomeRazao +'?','Sim','Não').result.then(function(){
				
				pessoaService.excluirPessoaRelacionada(cliente).success(function(){
						carregaPessoasRelacionadas();
						notify({message:'Relacionamento excluído com sucesso.', classes:'alert-success',position:'right'});
				}).error(function(msg){
					notify({message:msg, classes:'alert-danger',position:'right'});
				});
			
		});
		
	}
	

	function editar(pessoaRelacionamento) {
		
		pessoaService.goIncluirPessoaCarregada(
				1,
				pessoaRelacionamento.id.pessoa,
				pessoaRelacionamento.id.pessoaRelacionada,
				true,
				true,
				function() {
					
					var historicos = angular.copy($rootScope.historicos);
					
					historicos.reverse();
					
					var historico = historicos.find(function(historico){
						return historico.fromParams.identificador != undefined
						&& historico.fromParams.identificador != null
						&& historico.fromParams.identificador != pessoaRelacionamento.id.pessoaRelacionada.identificador;
					});
					
					historico.fromParams.tab = 16;
					$state.go(historico.from.name,historico.fromParams,{reload:true});
					
				});
		
	}
	
}