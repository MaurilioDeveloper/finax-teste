angular.module('cadastro-central-module').controller('AtualizacaoCadastralCtrl', AtualizacaoCadastralCtrl);

AtualizacaoCadastralCtrl.$inject = ['$scope','$http','$timeout','$filter','PATHCONFIG','$q','$state','notify','pessoaService','dialogService'];

function AtualizacaoCadastralCtrl($scope,$http,$timeout,$filter,PATHCONFIG,$q,$state,notify, pessoaService, dialogService) {
	
	var controller = this;
	
	controller.validaAtualizacao = validaAtualizacao;
	
	controller.cadastral = {};
	controller.ficha = {};
	controller.cadastralList = {};
	controller.disableUpdate = false;
	
	controller.today = Date.now();
	
	carregaAtualizacoes();
	
	/**
	 * Carrega a tabela de documentos e os tipos de documentos.
	 */
	function carregaAtualizacoes() {
		$q.all([pessoaService.findPessoaAtualizacaoCadastral($scope.pessoaCtrl.pessoa.id),
			 	pessoaService.findByIdentificador($scope.pessoaCtrl.pessoa.identificador)]).then(function(retornos){
			 	
			$scope.pessoaCtrl.pessoa = retornos[1];
			montaTipoPessoa();
			controller.ficha.dataInclusao =  $scope.pessoaCtrl.pessoa.dataCadastro ? $scope.pessoaCtrl.pessoa.dataCadastro.split(" ")[0] : "";
			controller.ficha.dataUltAlteracao =  $scope.pessoaCtrl.pessoa.dataUltimaAtualizacaoPessoa;
			controller.cadastralList = retornos[0].data;
			if(angular.isArray(retornos[0].data)){
				controller.cadastral = retornos[0].data[0];
			}
			if (controller.cadastral != null){
				var dataUltimaAtualizacao = moment(controller.cadastral.dataUltimaAtualizacao, 'DD/MM/YYYY');
				var today = moment().startOf('day');
				
				if(dataUltimaAtualizacao.isSame(today)){
					controller.disableUpdate = true;
				}
			}
			
		});
		
		
	}
	
	/**
	 * Valida a atualização.
	 */
	function validaAtualizacao() {
		
		if(controller.ficha != null){
			
			var dataUltimaAlteracao = moment(controller.ficha.dataUltAlteracao, 'DD/MM/YYYY');
			var today = moment().startOf('day');
			
			if(dataUltimaAlteracao.isSame(today)){
				atualizar();
			}else{
				dialogService.show('Atualizar','Nenhuma alteração foi realizada na data de hoje! Deseja efetuar a atualização cadastral?','Sim','Não').result.then(function(){
					atualizar();
				});
			}
		}else{
			atualizar();
		}
	}
	
	/**
	 * Salva os dados de um documento.
	 */
	function atualizar() {
		pessoaService.atualizaPessoaAtualizacaoCadastral($scope.pessoaCtrl.pessoa.id).success(function(documento){
			notify({message:'Atualização cadastral realizada com sucesso!', classes:'alert-success',position:'right'});
			carregaAtualizacoes();
		});
	}
	
	function montaTipoPessoa(){
		var papeis = $scope.pessoaCtrl.pessoa.tipo.split("/");
	
		if($scope.pessoaCtrl.pessoaRelacionada){
			papeis = papeis.filter(function(papel){
				return papel != 'Cotista'
					&& papel != 'Correntista'
			});
		}else{
			papeis = papeis.filter(function(papel){
				return papel == 'Cotista'
					|| papel == 'Correntista'
			});
		}
		
		$timeout(function(){
			$scope.pessoaCtrl.pessoa.tipo = papeis.map(function(papel){
				return papel;
			}).join('/');
		})
	}
	
}