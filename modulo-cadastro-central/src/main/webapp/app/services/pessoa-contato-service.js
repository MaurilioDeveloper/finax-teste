angular.module('cadastro-central-module').factory('pessoaContatoService',function($http, PATHCONFIG, $filter,$q,$state,$timeout){
	
	return {
		
		findAll: function() {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/contato/');
		},
		
		findAllContatoByIdentificador :  function(identificador) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/contato/' + identificador);
		},
		
		insertContato : function (contato) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/contato/inserir-contato', contato);
		},
		
		deleteContato : function(idContato) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/contato/' + idContato);
		},
		
		updateContato : function (contato) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/contato/atualizar-contato', contato);
		}
		
	}
});