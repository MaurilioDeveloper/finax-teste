angular.module('cadastro-central-module').factory('nacionalidadeService',function($http, PATHCONFIG){
	return {

		findAll : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/nacionalidade');
		},
		
		findPessoaNacionalidade : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/nacionalidade/', nomeNacionalidade);
		},
		
		insertNacionalidade : function (nacionalidade){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/nacionalidade/', nacionalidade);
		},
		
		deleteNacionalidade : function(idNacionalidade) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/nacionalidade/' + idNacionalidade);
		}
		
	}
});