angular.module('cadastro-central-module').factory('formaConstituicaoService', FormaConstituicaoService);

FormaConstituicaoService.$inject = ['$http', 'PATHCONFIG', '$filter', '$q', '$state', '$timeout', 'relacionadaService', 'pessoaService', 'configuracaoFundosService'];

function FormaConstituicaoService($http, PATHCONFIG, $filter, $q, $state, $timeout, relacionadaService, pessoaService, configuracaoFundosService) {
	return {
		
		findAll : function() {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/formaConstituicao');
		},
		
		insert : function (formaConstituicao) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/formaConstituicao', formaConstituicao);
		},
		
		remove : function (formaConstituicao) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/formaConstituicao/remove', formaConstituicao);
		}
		
	}
};
