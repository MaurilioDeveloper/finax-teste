angular.module('cadastro-central-module').factory('documentoService',function($http, PATHCONFIG){
	return {

		insertDocumento : function (tipoDocumento){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/documento', tipoDocumento);
		},
		
		
		excluirDocumento : function(idDocumento) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/tipo/documento/' + idDocumento);
		},
		
		findAllByPrestadorServicoIdentificador : function(identificador) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/documento/' + identificador);
		}
		
	}
});