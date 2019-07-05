angular.module('cadastro-central-module').factory('configuracaoFundosService',function($http, PATHCONFIG, $filter,$q){
	return {
		
		inserirPessoaFundoConfig : function(pessoaFundoConfig) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/fundo-configuracao/inserir-atualizar/', pessoaFundoConfig);
		},
		
		consultarPessoaFundoConfig : function(idPessoaFundoConfig) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/fundo-configuracao/' + idPessoaFundoConfig);
		},
		
		listarTiposTitulo : function() {
			return $http.get(PATHCONFIG.PMS + '/tipo-titulo');
		},
		
		findByIdPessoaFundoConf : function(idPessoaFundoConfig) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/fundo-configuracao/tipos-titulo/' + idPessoaFundoConfig);
		},
		
		inserirTiposTitulos : function(tiposTituloFundo) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/fundo-configuracao/inserir-tipos-titulo/', tiposTituloFundo);
		},
		excluirPessoaFundo : function(idPessoaFundo) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/fundo-configuracao/excluir-pessoa-fundo/' + idPessoaFundo);
		},
		
	    deleteTiposTitulo: function(tiposTituloFundo) {
			
			return $http({
				url:PATHCONFIG.CADASTRO_CENTRAL + '/fundo-configuracao/delete-tipos-titulo/',
				method:'DELETE',
				data:tiposTituloFundo,
				headers:{
					'Content-Type':'application/json'
				}
			});
		}
		
	}
});