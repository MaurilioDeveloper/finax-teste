angular.module('cadastro-central-module').factory('agenciaService',function($http, PATHCONFIG){
	return {
	
		findAllByBancoId : function(idBanco){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/agencia?idBanco=' + idBanco);
		},
	
		findByBancoAndAgencia : function(idBanco, idAgencia){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/agencia/' + idBanco + "/" + idAgencia);
		}
	
	}
});