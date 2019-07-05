angular.module('cadastro-central-module').factory('prestadorServicoService',function($http, PATHCONFIG, $filter,$q,$state,$timeout){
	
	return {
		
		findAll: function() {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/prestador-servico/');
		},
		
		getPrestadorServicoByIdentificador :  function(identificador) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/prestador-servico/' + identificador);
		},
		
		insertPessoaPrestadorServico : function (prestadorServico) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/prestador-servico/', prestadorServico);
		},
		
		findPrestadorServicoByTipoPapel :  function(prestadorbytipo) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/prestador-servico/papel/' + prestadorbytipo);
		},
		
		deletePrestadorServico :  function(idPrestadorServico) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/prestador-servico/excluir-prestador/' + idPrestadorServico);
		},
		
		habilitarPortalCedente:function(prestadorServico)
		{
			//return $http.post('http://localhost:8080/usuarios-rest-v1/usuarios', prestadorServico);			
			return $http.post(PATHCONFIG.PORTAL_API_USUARIO+'/usuarios-rest-v1/usuarios', prestadorServico);
		}
	}
});