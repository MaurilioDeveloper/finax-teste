angular.module('cadastro-central-module').factory('autorizacaoService',function($http, PATHCONFIG){
	return {
		checkPermission : function(permissao) {				
			return $http.get(PATHCONFIG.CONTROLE_ACESSO + '/autorizacao?permissao=' + permissao)
		}
	}
});