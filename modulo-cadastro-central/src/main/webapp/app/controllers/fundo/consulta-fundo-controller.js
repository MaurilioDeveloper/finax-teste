angular.module('cadastro-central-module').controller('ConsultaFundoCtrl', ConsultaFundoCtrl);

ConsultaFundoCtrl.$inject = ['$scope','$http', '$timeout', '$filter','PATHCONFIG','$q','$state','notify','usSpinnerService','utilsService','dialogService','papelService','tipoService', 'fundoService','configuracaoFundosService'];

function ConsultaFundoCtrl($scope,$http,$timeout,$filter,PATHCONFIG,$q,$state,notify, usSpinnerService,utilsService,dialogService,papelService,tipoService,fundoService,configuracaoFundosService) {
	
	var controller = this;
	
	
	controller.pessoa = {
		tipoPessoa: 'J',
		papeis:[]
	}
	controller.tipoFundo = {}
	controller.fundos = [];
	controller.validateIdentificador = validateIdentificador;
	controller.validaCnpj = validaCnpj;
	controller.aoClicarCNPJ = aoClicarCNPJ;
	controller.resetForm = resetForm;
	controller.fundo = {
		pessoa:{},
		tipoFundo:{},
		ativo:'1'
	};
	
	controller.restUrl = PATHCONFIG.CADASTRO_CENTRAL;
	

	
	tipoService.getTiposFundo().then(function(retorno) {
		controller.tipos = retorno.data;
	});

//	tipoService.getSubTipo().then(function(retorno) {
//		controller.subTipos = retorno.data;
//	});


	controller.subTipos = [ {
		value : '1',
		descricao : 'Padronizado'
	}, {
		value : '0',
		descricao : 'Não Padronizado'
	} ];
	
	
	function aoClicarCNPJ() {
		controller.pessoa.tipoPessoa = 'J'; 
		controller.pessoa.identificador = '';
		$timeout(function(){
			angular.element('#cnpj').focus();			
		});
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
	
	
	function validaCnpj() {
		
		if (!controller.pessoa.identificador || controller.pessoa.identificador == '') {
			return;
		}
		
		if(!utilsService.validarCNPJ(controller.pessoa.identificador)){
			notify({message:'Número de documento CNPJ inválido', classes:'alert-danger',position:'right'});
		}
		
	}
	

	
	function resetForm(){
		controller.fundo = {
			pessoa:{},
			tipoFundo:{}
		
		};
		//$scope.$broadcast('cleanDataTable');
    }
	
	
	$(document).keypress(function(e) {
	    if(e.which == 13) 
	    	$('#filterLink').click();
	});

    
}