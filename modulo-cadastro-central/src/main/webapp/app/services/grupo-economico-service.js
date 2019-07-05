angular.module('cadastro-central-module').factory('grupoEconomicoService',GrupoEconomicoService);

GrupoEconomicoService.$inject = ['$http','PATHCONFIG', '$state'];

function GrupoEconomicoService($http,PATHCONFIG,$state){
	
	return {
		
		findAll : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/grupo-economico/findbyfilter');
		},
				
		/**
		 * 
		 * Exclui participante de um grupo econômico.
		 * 
		 * @param idParticipante
		 */
		excluirParticipante : function(idGrupoEconomico, idParticipante) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/grupo-economico/' + idGrupoEconomico + '/pessoas/' + idParticipante);
		},
		
		/**
		 * 
		 * Busca Pessoas pelo ID do Grupo Economico.
		 * 
		 * @param idGrupoEconomico
		 */
		getPessoasByGrupo : function(idGrupoEconomico) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/grupo-economico/' + idGrupoEconomico + '/pessoas');
		},
		
		/**
		 * 
		 * Busca Grupo Econômico pelo CPF/CNPJ da pessoa vinculada ao grupo.
		 * 
		 * @param cpfCnpj
		 */
		findByCpfCnpj : function(cpfCnpj) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/grupo-economico/findByCpfCnpj/pessoas/' + cpfCnpj);
		},
		
		
		/**
		 * 
		 * Salva os dados de um grupo econômico.
		 * Está operação, além de incluir ou atualizar um dado, também irá gravar um 
		 * LOG do novo dado, ou o que está sendo atualizado. (Verificação feita no Back End). 
		 * 
		 * 
		 * @param grupoEconomico
		 */
		salvarGrupoEconomico : function(grupoEconomico){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/grupo-economico',grupoEconomico);
		},
		
		
		/**
		 * 
		 * Busca Grupo Econômico pelo ID.
		 * 
		 * @param idGrupoEconomico
		 */
		getGrupoEconomicoByIdentificador : function(idGrupoEconomico) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/grupo-economico/' + idGrupoEconomico);
		},
		
		
		/**
		 * 
		 * Exclui grupo econômico.
		 * Está operação, além de excluir (exclusão lógica) um grupo econômico, também
		 * irá gravar um LOG do dado que está sendo excluído.
		 * 
		 * @param idGrupoEconomico
		 */
		excluirGrupoEconomico : function(idGrupoEconomico) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/grupo-economico/' + idGrupoEconomico);
		},
		
		//http://www.receitaws.com.br/v1/cnpj/ + valor_cnpj
		buscaCnpjReceita : function(cnpj) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/receitaWS/' + cnpj);
		},
		
		goConsultaGrupoEconomico : function() {
			$state.go('cadastro-grupo-economico',{
				
			},{reload:true}).then(function(f){
				
			});
		},
		
		goEditarGrupoEconomico : function(identificador) {
			$state.go('grupo-economico.editar',{
				tab:1,
				acao:'E',
				identificador:identificador
			},{reload:true}).then(function(f){
				
			});
		}
	}
	
}