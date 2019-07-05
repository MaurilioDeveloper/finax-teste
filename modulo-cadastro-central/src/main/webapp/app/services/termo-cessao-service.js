angular.module('cadastro-central-module').factory('termoCessaoService',function($http,PATHCONFIG, $filter,$q,$state,$timeout,relacionadaService,pessoaService,configuracaoFundosService){
	return {
		regerarContrato : function(cdFundo) {
			return $http.put(PATHCONFIG.PORTAL_API_TERMO_CESSAO_SERVICES + '/contrato/' + cdFundo + '/regerar-por-fundo');
		}
	}
});