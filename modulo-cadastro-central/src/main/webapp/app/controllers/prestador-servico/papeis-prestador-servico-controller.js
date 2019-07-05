angular.module('cadastro-central-module').controller('PapeisFundoCtrl',
		PapeisFundoCtrl);

PapeisFundoCtrl.$inject = [ '$scope', '$http', '$timeout', '$modal', '$filter',
		'PATHCONFIG', '$q', '$state', 'notify', 'usSpinnerService',
		'$stateParams', 'pessoaService', 'tipoService', 'dialogService',
		'paisService', 'estadoService', 'cidadeService',
		'nacionalidadeService', 'prestadorServicoService', 'papelService', 'relacionadaService' ];

function PapeisFundoCtrl($scope, $http, $timeout, $modal, $filter, PATHCONFIG,
		$q, $state, notify, usSpinnerService, $stateParams, pessoaService,
		tipoService, dialogService, paisService, estadoService, cidadeService,
		nacionalidadeService, prestadorServicoService, papelService, relacionadaService) {

	var controller = this;

	controller.prestadorServico = {
		pessoa : {
			tipoPessoa : 'J',
			papeis : []
		}
	}
	
	prestadorServicoService.getPrestadorServicoByIdentificador($stateParams.identificador).then(function(response) {
		controller.prestadorServico = response.data;
		relacionadaService.findAllPessoaRelacionadaByIdentificador(controller.prestadorServico.pessoa.identificador).then(function (responseRelacionadas) {
			controller.relacionadas = responseRelacionadas.data;
			controller.fundosRelacionadas = responseRelacionadas.data;
		});
	});
	
}