angular.module('cadastro-central-module').factory('cidadeService',CidadeService);

EstadoService.$inject = ['$http','PATHCONFIG'];

function CidadeService($http,PATHCONFIG) {
	
	return {
		
		findAllByEstado : function(siglaEstado){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/cidade?siglaEstado=' + siglaEstado);
		}
	
	}
	
}