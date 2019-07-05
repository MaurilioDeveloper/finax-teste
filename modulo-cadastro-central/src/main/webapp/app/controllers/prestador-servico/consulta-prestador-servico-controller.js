angular.module('cadastro-central-module').controller(
		'ConsultaPrestadorServicoCtrl', ConsultaPrestadorServicoCtrl);

ConsultaPrestadorServicoCtrl.$inject = [ '$scope', '$http', '$timeout',
		'$filter', 'PATHCONFIG', '$q', '$state', 'notify', 'usSpinnerService',
		'utilsService', 'dialogService', 'papelService', 'prestadorServicoService' ];

function ConsultaPrestadorServicoCtrl($scope, $http, $timeout, $filter,
		PATHCONFIG, $q, $state, notify, usSpinnerService, utilsService,
		dialogService, papelService, prestadorServicoService) {

	var controller = this;

	controller.prestadorServico = {
		pessoa : {
			tipoPessoa : 'J',
			papeis : []
		}
	}

	controller.prestadores = [];

	controller.validaCpf = validaCpf;
	controller.validaCnpj = validaCnpj;
	controller.aoClicarCPF = aoClicarCPF;
	controller.aoClicarCNPJ = aoClicarCNPJ;
	controller.validateIdentificador = validateIdentificador;
	controller.resetForm = resetForm;
	controller.restUrl = PATHCONFIG.CADASTRO_CENTRAL;
	controller.buscaPapel = buscaPapel;
	controller.excluirPrestadorServico = excluirPrestadorServico;

	papelService.findAllByTipoCadastro('PRESTADOR DE SERVICO').then(function(response) {
		controller.papeis = response.data;
	});
	
	$(document).keypress(function(e) {
	    if(e.which == 13) 
	    	$('#filterLink').click();
	});

	function validaCnpj() {
		if (!controller.prestadorServico.pessoa.identificador
				|| controller.prestadorServico.pessoa.identificador == '') {
			return;
		}

		if (!utilsService
				.validarCNPJ(controller.prestadorServico.pessoa.identificador)) {
			notify({
				message : 'Número de documento CNPJ inválido',
				classes : 'alert-danger',
				position : 'right'
			});
		}
	}

	function validaCpf() {
		if (!controller.prestadorServico.pessoa.identificador
				|| controller.prestadorServico.pessoa.identificador == '') {
			return;
		}

		if (!utilsService
				.validarCPF(controller.prestadorServico.pessoa.identificador)) {
			notify({
				message : 'Número de documento CPF inválido',
				classes : 'alert-danger',
				position : 'right'
			});
		}
	}

	function aoClicarCPF() {
		controller.prestadorServico.pessoa.tipoPessoa = 'F';
		controller.prestadorServico.pessoa.identificador = '';
		$timeout(function() {
			angular.element('#cpf').focus();
		});
	}

	function aoClicarCNPJ() {
		controller.prestadorServico.pessoa.tipoPessoa = 'J';
		controller.prestadorServico.pessoa.identificador = '';
		$timeout(function() {
			angular.element('#cnpj').focus();
		});
	}

	function validateIdentificador() {
		if (!controller.prestadorServico.pessoa.identificador
				|| controller.prestadorServico.pessoa.identificador == '') {
			return false;
		}

		if (controller.prestadorServico.pessoa.tipoPessoa == 'F') {
			return !(utilsService
					.validarCPF(controller.prestadorServico.pessoa.identificador));
		} else if (controller.prestadorServico.pessoa.tipoPessoa == 'J') {
			return !(utilsService
					.validarCNPJ(controller.prestadorServico.pessoa.identificador));
		} else {
			return false;
		}
	}

	function resetForm() {
		controller.prestadorServico = {
			pessoa : {
				tipoPessoa : 'J',
				papeis : []
			}
		}
	}

	function buscaPapel(papeis) {
		return papeis.filter(function(papel) {
			return papel.tipoCadastro == 'PRESTADOR DE SERVICO';
		}).map(function(papel) {
			return papel.descricao;
		}).join('/');
	}
	
	function excluirPrestadorServico(prestadorServico) {
		dialogService.show('Excluir','Deseja excluir o prestador de serviço ' + prestadorServico.pessoa.nomeRazao +'?','Sim','Não').result.then(function(){
			prestadorServicoService.deletePrestadorServico(prestadorServico.id).success(function() {
				$('#filterLink').click();
				notify({message:'O prestador de serviço foi excluído com sucesso!', classes:'alert-success',position:'right'});
			}).error(function(){
				notify({message:'Esse prestador de serviços possui vínculo com um fundo e por isso não poderá ser excluído!', classes:'alert-danger',position:'right'});
			}); 
		});
	}
}