angular.module('cadastro-central-module').factory('enderecoService',function($http, PATHCONFIG, $filter,$q){
	return {
		//PESSOA
		/**
		 * Encontra todas as pessoas
		 */
		findByCep : function(cep) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/endereco/' + cep);
		},
	}
});