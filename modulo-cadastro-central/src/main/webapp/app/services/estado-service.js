angular.module('cadastro-central-module').factory('estadoService',EstadoService);

EstadoService.$inject = ['$http','PATHCONFIG'];

function EstadoService($http,PATHCONFIG) {
	
	return {
		
		findAllByPais : function(nomePais){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/estado?nomePais=' + nomePais);
		},
		
		getSiglaUFByNomeUF : function(nomeUF){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/estado/sigla?nomeUF=' + nomeUF);
		}
	
	}
	
}