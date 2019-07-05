angular.module('cadastro-central-module').controller('AtualizaoesCtrl',
		AtualizaoesCtrl);

AtualizaoesCtrl.$inject = [ '$scope', '$http', '$timeout', '$modal', '$filter',
		'PATHCONFIG', '$q', '$state', 'notify', 'usSpinnerService',
		'$stateParams', 'pessoaService', 'tipoService', 'dialogService',
		'paisService', 'estadoService', 'cidadeService',
		'nacionalidadeService', 'prestadorServicoService', 'papelService' ];

function AtualizaoesCtrl($scope, $http, $timeout, $modal, $filter, PATHCONFIG,
		$q, $state, notify, usSpinnerService, $stateParams, pessoaService,
		tipoService, dialogService, paisService, estadoService, cidadeService,
		nacionalidadeService, prestadorServicoService, papelService) {

	var controller = this;

	controller.prestadorServico = {
		pessoa : {
			tipoPessoa : 'J',
			papeis : []
		}
	}

	prestadorServicoService.getPrestadorServicoByIdentificador(
			$stateParams.identificador).then(function(response) {
		controller.prestadorServico = response.data;
	});

}