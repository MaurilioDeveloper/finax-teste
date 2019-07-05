angular.module('cadastro-central-module').factory('tipoService',function($http, PATHCONFIG){
	return {
		getTipoTelefones : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/telefone');
		},
		
		getTiposDocumentoByTipoPessoa : function(tipoPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/documento/' + tipoPessoa);
		},
		
		getTiposDocumento : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/documento/');
		},
		
		getTiposFundo : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/fundo/');
		},
		
		getTipoEmails: function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/email');
		},
		
		getTipoEscolaridades : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/escolaridade');
		},
		
		getTipoRegimesCasamento : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/regime-casamento');
		},
		
		getTipoEnderecos : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/endereco');
		},
		
		getTipoContas : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/conta');
		},
		
		getTipoModeloContas : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/modelo-conta');
		},
		
		getTipoImoveis : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/imovel');
		},
		
		getTipoVeiculos : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/veiculo');
		},
		
		getTipoBens : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/bem');
		},
		
		getTipoEstadosCivis : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/estado-civil');
		},
		
		getTipoEstados : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/estado');
		},

		getTipoDeclaracoes : function () {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/tipo-declaracao');
		},
		
		insertTipoConta : function(tipoConta){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/conta', tipoConta);
		},
		
		excluirConta : function(idConta) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/tipo/conta/' + idConta);
		},
		
		insertTipoEndereco : function(tipoEndereco){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/endereco', tipoEndereco);
		},
		
		excluirEndereco : function(idEndereco) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/tipo/endereco/' + idEndereco);
		},
		
		insertTipoBem : function(tipoBem){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/bem', tipoBem);
		},
		
		excluirTipoBem : function(idBem) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/tipo/bem/' + idBem);
		},
		
		insertTipoImovel : function(tipoImovel){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/imovel', tipoImovel);
		},
		
		excluirTipoImovel : function(idImovel) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/tipo/imovel/' + idImovel);
		},
		
		insertTipoEmail : function(tipoEmail){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/tipo/email', tipoEmail);
		},
		
		excluirTipoEmail : function(idEmail) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/tipo/email/' + idEmail);
		}
	}
});