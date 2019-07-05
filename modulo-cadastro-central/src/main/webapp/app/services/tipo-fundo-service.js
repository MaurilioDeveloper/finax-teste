angular.module('cadastro-central-module').factory('tipoFundoService',function($http, PATHCONFIG){
	return {

		findAll : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/fundo');
		},
			
		excluirTipoFundo : function(idTipoFundo) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/tipo/fundo/excluir-tipo-fundo/' + idTipoFundo);
		},
		
		carregarTipoFundos : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/fundo')
		},

		incluirTipoFundo : function(tipoFundo) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/fundo/incluir-tipo-fundo/', tipoFundo);
		},
		
		
		consultarTipoFundo : function(tipoFundo) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/fundo/consultar-tipo-fundo/'+ tipoFundo.dsSigla);
		},
		
		alterarTipoFundo : function(tipoFundo) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/fundo/alterar-tipo-fundo/', tipoFundo);
		}
		
		
	}
});