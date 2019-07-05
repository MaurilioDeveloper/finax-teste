angular.module('cadastro-central-module').factory('tipoTituloFundoService',function($http, PATHCONFIG, $filter,$q){
	return {
		
		listarTiposTitulo : function() {
			return $http.get(PATHCONFIG.PMS + '/tipo-titulo');
		},
		
		inserirTipoTitulo : function(){
			return $http.post(PATHCONFIG.PMS + '/tipo-titulo/inserir')
		},
		
		listarEspecieTitulos : function() {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/especie-titulo');
		}
		
	}
});


