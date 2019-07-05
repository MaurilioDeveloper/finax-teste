angular.module('cadastro-central-module').controller(
		'ElegibilidadeFundosCtrl', ElegibilidadeFundosCtrl);

ElegibilidadeFundosCtrl.$inject = [ '$stateParams', '$scope', 'fundoElegibilidadeService', '$modal', 'notify', 'dialogService'];

function ElegibilidadeFundosCtrl($stateParams, $scope, fundoElegibilidadeService, $modal, notify, dialogService) {

	var controller = this;
	
	controller.acao = 'I';
	
	controller.cdFundo;
	controller.regraFundoRelEdit;
		
	controller.log = {};
	controller.selecionaRegraElegibilidade = selecionaRegraElegibilidade;
	controller.adicionarElegibilidade = adicionarElegibilidade;
	controller.atualizarElegibilidade = atualizarElegibilidade;
	controller.removerRegra = removerRegra;
	controller.preparaAtualizacao = preparaAtualizacao;
	controller.habilitaIncluir = habilitaIncluir;
	controller.cancel = cancel;
	
	//Carrega todas as regras cadastradas na base do Processamento de Remessa
	carregaRegras();
	
	//Carrega todas as regras relacionadas com fundo
	carregaRegrasDoFundo();
	
	function carregaRegras() {
		fundoElegibilidadeService.listaRegras()
        .success(function(data) {
        	controller.regrasElegibilidades = data;
        });
	}
	
	
	function carregaRegrasDoFundo() {
		controller.cdFundo = $stateParams.identificador.substring(0, 8);
		
		fundoElegibilidadeService.buscaRegras(controller.cdFundo)
		.success(function(data) {
			controller.regrasElegibilidadeFundo = data;
		})
		.error(function(data) {
			notify({message:'Problema em buscar regras do fundo.', classes:'alert-danger',position:'right'});
		});
	}
	
	function selecionaRegraElegibilidade() {
		fundoElegibilidadeService.buscaParametros(controller.regraElegibilidadeSelecionada.id)
        .success(function(data) {
        	controller.parametros = data;
        });
	}
	
	function cancel() {
		carregaRegrasDoFundo();
		controller.parametros = [];
		controller.regraElegibilidadeSelecionada = null;
		controller.acao = 'I';
	}
	
	function adicionarElegibilidade() {
		var remeFndRelParamValors = [];
		
		var regraFundoRel = {
				cdFundo : controller.cdFundo,
				remeRegraElegibilidade : controller.regraElegibilidadeSelecionada,
				remeFndRelParamValors : remeFndRelParamValors
		}
		
		for (i = 0; i < controller.parametros.length; i++) { 
			remeFndRelParamValors[i] = {};
			remeFndRelParamValors[i].remeParametroRegraEleg = controller.parametros[i];
			remeFndRelParamValors[i].nrValorParam = controller.parametros[i].valorParametro;
		}
		
		fundoElegibilidadeService.inserirRegraFundo(regraFundoRel)
		.success(function(data) {
			carregaRegrasDoFundo();
			notify({message:'Regra cadastrada com sucesso.', classes:'alert-success',position:'right'});
			controller.regraElegibilidadeSelecionada = null;
		})
		.error(function(data) {
			notify({message:'Problema para cadastrar regra.', classes:'alert-danger',position:'right'});
		});
	}
	
	function atualizarElegibilidade() {
		var remeFndRelParamValors = [];
		
		for (i = 0; i < controller.parametros.length; i++) { 
			remeFndRelParamValors[i] = {};
			remeFndRelParamValors[i].remeParametroRegraEleg = controller.parametros[i];
			remeFndRelParamValors[i].nrValorParam = controller.parametros[i].valorParametro;
			remeFndRelParamValors[i].id = controller.parametros[i].idRemeFndRelParamValors;
		}
		
		controller.regraFundoRelEdit.remeFndRelParamValors = remeFndRelParamValors;
		
		fundoElegibilidadeService.atualizarRegraFundo(controller.regraFundoRelEdit)
		.success(function(data) {
			carregaRegrasDoFundo();
			controller.regraElegibilidadeSelecionada = null;
			notify({message:'Regra alterada com sucesso.', classes:'alert-success',position:'right'});
			controller.acao = 'I';
		})
		.error(function(data) {
			notify({message:'Problema para atualizar regra.', classes:'alert-danger',position:'right'});
		});
	}
	
	function removerRegra(regraFundoRel) {
		dialogService.show('Excluir', 'Deseja excluir esta regra?', 'Sim', 'Não').result.then(
			function() {
	        	fundoElegibilidadeService.removerRegraFundo(regraFundoRel.id)
	    		.success(function(data) {
	    			notify({message:'Regra excluída com sucesso.', classes:'alert-success',position:'right'});
	    			carregaRegrasDoFundo();
	    		})
	    		.error(function(data) {
	    			notify({message:'Problema para excluir regra', classes:'alert-danger',position:'right'});
	    		});
	        }
		);
	}
	
	function habilitaIncluir() {
		if ( controller.regraElegibilidadeSelecionada && controller.parametros && controller.parametros.length != 0){
			for (i = 0; i < controller.parametros.length; i++) { 
				if ( !controller.parametros[i].valorParametro || controller.parametros[i].valorParametro == "" ){
					return false;
				}
			}
		}
		
		return true;
	}
	
	function preparaAtualizacao(regraFundoRel) {
		controller.acao = 'E';
		
		controller.regrasElegibilidadeFundo.splice(controller.regrasElegibilidadeFundo.indexOf(regraFundoRel), 1);
		
		controller.regraFundoRelEdit = regraFundoRel;
		
		controller.regraElegibilidadeSelecionada = regraFundoRel.remeRegraElegibilidade;
		controller.parametros = [];
		
		fundoElegibilidadeService.buscaParametrosRegraFundo(regraFundoRel.id)
		.success(function(data) {
			regraFundoRel.remeFndRelParamValors = data;
			
			if (!data) return;
			
			for (i = 0; i < regraFundoRel.remeFndRelParamValors.length; i++) { 
				controller.parametros[i] = regraFundoRel.remeFndRelParamValors[i].remeParametroRegraEleg;
				controller.parametros[i].valorParametro = regraFundoRel.remeFndRelParamValors[i].nrValorParam;
				controller.parametros[i].idRemeFndRelParamValors = regraFundoRel.remeFndRelParamValors[i].id;
			}
		})
		.error(function(data) {
			notify({message:'Problema em buscar parâmetros da regra para edição.', classes:'alert-danger',position:'right'});
		});
	}
	
	
}