angular.module('cadastro-central-module').controller('DadosProfissionaisEmpresariaisCtrl', DadosProfissionaisEmpresariaisCtrl);

DadosProfissionaisEmpresariaisCtrl.$inject = ['$scope','$http','$timeout','PATHCONFIG','$q','$state','notify','usSpinnerService', 'pessoaService','tipoService','utilsService', 'cnaeService'];

function DadosProfissionaisEmpresariaisCtrl($scope,$http,$timeout,PATHCONFIG,$q,$state,notify, usSpinnerService, pessoaService,tipoService, utilsService,cnaeService) {
	
	var controller = this;
	
	controller.dadosProfissionais = {};	
	controller.ramoAtividade = {
		cnaePrincipal: '',
		cnaeSecundario: ''
	};
	
	controller.salvar = salvar;
	controller.salvarRamoAtividade = salvarRamoAtividade;
	controller.validarCNPJ = validarCNPJ;
	controller.buscarRamoAtividade = buscarRamoAtividade;
	
	pessoaService.findDadosProfissionaisByPessoa($scope.pessoaCtrl.pessoa.id).success(function(data){
		controller.dadosProfissionais = data;

		if ($scope.pessoaCtrl.acao == "V") {
			$scope.pessoaCtrl.bloqueiaCampos();
		}
	}).error(function(){
		notify({message:'Erro ao buscar dados profissionais!', classes:'alert-danger',position:'right'});
	});
	
	pessoaService.findRamoAtividadeByPessoa($scope.pessoaCtrl.pessoa.id).success(function(data){
		controller.ramoAtividade = data;
	}).error(function(){
		notify({message:'Erro ao buscar ramos de atividade!', classes:'alert-danger',position:'right'});
	});
	
	tipoService.getTipoEscolaridades().success(function(data){
		controller.escolaridades = data;
	});
	
	function validarCNPJ(){
		if(!controller.dadosProfissionais.cnpjEmpresa || utilsService.validarCNPJ(controller.dadosProfissionais.cnpjEmpresa)){
			salvar();
		}else{
			controller.dadosProfissionais.cnpjEmpresa = '';
			notify({message:'CNPJ Inválido', classes:'alert-danger',position:'right'});
		}
	}
	
	function buscarRamoAtividade(tipo){
		if(tipo == 'primario'){
			if(controller.ramoAtividade.cnaePrincipal && controller.ramoAtividade.cnaePrincipal.toString().length){
				cnaeService.findByCodigo(controller.ramoAtividade.cnaePrincipal).success(function(descricao){
					controller.ramoAtividade.ramoAtividadePrincipal = descricao;
					salvarRamoAtividade();
				}).error(function(){
					notify({message:'Código CNAE não encontrado.', classes:'alert-danger',position:'right'});
					controller.ramoAtividade.ramoAtividadePrincipal = '';
				});
			}else{
				controller.ramoAtividade.ramoAtividadePrincipal = '';
			}
		}else{
			if(controller.ramoAtividade.cnaeSecundario && controller.ramoAtividade.cnaeSecundario.toString().length){
				cnaeService.findByCodigo(controller.ramoAtividade.cnaeSecundario).success(function(descricao){
					controller.ramoAtividade.ramoAtividadeSecundario = descricao;
					salvarRamoAtividade();
				}).error(function(){
					notify({message:'Código CNAE não encontrado.', classes:'alert-danger',position:'right'});
					controller.ramoAtividade.ramoAtividadeSecundario = '';
				});
			}else{
				controller.ramoAtividade.ramoAtividadeSecundario = '';
			}
		}
	}
	
	function salvar(){
		controller.dadosProfissionais.pessoa = {
			id: $scope.pessoaCtrl.pessoa.id
		}
		pessoaService.insertPessoaDadosProfissionais(controller.dadosProfissionais).success(function(data){
			controller.dadosProfissionais = data;
		});
	}
	

	
	function salvarRamoAtividade(){
		controller.ramoAtividade.pessoa = {
			id: $scope.pessoaCtrl.pessoa.id
		};
		pessoaService.insertRamoAtividade(controller.ramoAtividade).success(function(data){
			controller.ramoAtividade = data;
		});
	}
	
	/*function cleanRamoAtividades(tipo){
		if(tipo == 'principal'){
			controller.ramoAtividade.cnaePrincipal = '';
			controller.ramoAtividade.ramoAtividadePrincipal = ''
		}else{
			controller.ramoAtividade.cnaeSecundario = '';
			controller.ramoAtividade.ramoAtividadeSecundario = ''
		}
	}*/
	
}