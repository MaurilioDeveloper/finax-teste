angular.module('cadastro-central-module')
	.factory('fundoElegibilidadeService', FundoElegibilidadeService);

FundoElegibilidadeService.$inject = [ '$http', 'PATHCONFIG' ];

function FundoElegibilidadeService($http, PATHCONFIG) {

	return {

		listaRegras : listaRegras,
		buscaParametros : buscaParametros,
		buscaRegras : buscaRegras,
		inserirRegraFundo : inserirRegraFundo,
		atualizarRegraFundo : atualizarRegraFundo,
		removerRegraFundo : removerRegraFundo,
		buscaParametrosRegraFundo : buscaParametrosRegraFundo

	};

	function listaRegras() {
		const api = PATHCONFIG.PORTAL_API_PROCESSAMENTO_REMESSA + '/elegibilidade/regras';
		console.log(api);
		return $http.get(api);
	}
	
	function buscaParametros(idRegra){
		return $http.get(PATHCONFIG.PORTAL_API_PROCESSAMENTO_REMESSA + '/elegibilidade/parametros-regra/'+ idRegra);
	}
	
	function buscaRegras(cdFundo){
		return $http.get(PATHCONFIG.PORTAL_API_PROCESSAMENTO_REMESSA + '/elegibilidade/regras-fundo/'+ cdFundo);
	}
	
	function buscaParametrosRegraFundo(idRemeRegraFundoRel){
		return $http.get(PATHCONFIG.PORTAL_API_PROCESSAMENTO_REMESSA + '/elegibilidade/parametros-regra-fundo/'+ idRemeRegraFundoRel);
	}
	
	function inserirRegraFundo(regraFundo){
		return $http.post(PATHCONFIG.PORTAL_API_PROCESSAMENTO_REMESSA + '/elegibilidade/inserir-regra-fundo/', regraFundo);
	}
	
	function atualizarRegraFundo(regraFundo){
		return $http.put(PATHCONFIG.PORTAL_API_PROCESSAMENTO_REMESSA + '/elegibilidade/atualizar-regra-fundo/', regraFundo);
	}
	
	function removerRegraFundo(idRegraFundo){
		return $http.delete(PATHCONFIG.PORTAL_API_PROCESSAMENTO_REMESSA + '/elegibilidade/remover-regra-fundo/' + idRegraFundo);
	}

}