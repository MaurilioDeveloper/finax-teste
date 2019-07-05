angular.module('cadastro-central-module').controller('PatrimonioCtrl', PatrimonioCtrl);

PatrimonioCtrl.$inject = ['$scope','$http','$timeout','PATHCONFIG','$q','$state','$filter','notify','usSpinnerService', 'pessoaService', 'tipoService','dialogService','paisService','estadoService'];

function PatrimonioCtrl($scope,$http,$timeout,PATHCONFIG,$q,$state,$filter,notify, usSpinnerService, pessoaService, tipoService,dialogService,paisService,estadoService) {
	
	var controller = this;
	
	controller.pessoaImoveis = [];
	controller.pessoaBens = [];
	controller.imovel = {};
	controller.bem = {};
	controller.tipoImovel = {};
	controller.tipoBem = {};
	
	controller.incluirImovel = incluirImovel;
	controller.updateImovel = updateImovel;
	controller.deleteImovel = deleteImovel;
	controller.cancelImovel = cancelImovel;
	controller.incluirBem = incluirBem;
	controller.updateBem = updateBem;
	controller.deleteBem = deleteBem;
	controller.cancelBem = cancelBem;
	controller.aoSelecionarPais = aoSelecionarPais;
	controller.aoSelecionarDeclaracao = aoSelecionarDeclaracao;
	controller.validarTipoImovel = validarTipoImovel;
	controller.incluirTipoImovel = incluirTipoImovel;
	controller.excluirTipoImovel = excluirTipoImovel;
	controller.validarTipoBem = validarTipoBem;
	controller.incluirTipoBem = incluirTipoBem;
	controller.excluirTipoBem = excluirTipoBem;
	
	controller.paises = [];
	controller.estados = [];

    controller.declaracoes = [];

    $q.all([
        paisService.findAll(),
        tipoService.getTipoImoveis(),
        tipoService.getTipoBens(),
        tipoService.getTipoDeclaracoes(),
        pessoaService.findImoveisByPessoa($scope.pessoaCtrl.pessoa.id),
        pessoaService.findBensByPessoa($scope.pessoaCtrl.pessoa.id)
    ]).then(function (retornos) {
        controller.paises = retornos[0].data;
        
        controller.tipoImoveis = retornos[1].data;
        controller.allImovelsModal = angular.copy(retornos[1].data);
        newOption = {id:"new", dsTipoImovel:"Novo Tipo de Bens Imóveis"};
		controller.tipoImoveis.unshift(newOption);
		
        controller.tipoBens = retornos[2].data;
        controller.allBensModal = angular.copy(retornos[2].data);
        newOption = {id:"new", dsTipoBem:"Novo Tipo de Outros Bens"};
		controller.tipoBens.unshift(newOption);
        
        controller.declaracoes = retornos[3].data;
        controller.pessoa = $scope.pessoaCtrl.pessoa;
        controller.pessoaImoveis = retornos[4].data;
        controller.pessoaBens = retornos[5].data;
    });
    
    function carregarTiposImovel(){
    	tipoService.getTipoImoveis().then(function(response){
    		controller.tipoImoveis = response.data;
    		controller.allImovelsModal = angular.copy(response.data);
            newOption = {id:"new", dsTipoImovel:"Novo Tipo de Bens Imóveis"};
    		controller.tipoImoveis.unshift(newOption);
    	});
    }
    
    function carregarTiposBem(){
    	tipoService.getTipoBens().then(function(response){
    		controller.tipoBens = response.data;
    		controller.allBensModal = angular.copy(response.data);
            newOption = {id:"new", dsTipoBem:"Novo Tipo de Outros Bens"};
    		controller.tipoBens.unshift(newOption);
    	});
    }
    
	function buscaPatrimonios(){
		pessoaService.findImoveisByPessoa($scope.pessoaCtrl.pessoa.id).success(function(data){
			controller.pessoaImoveis = data;
		});
		
		pessoaService.findBensByPessoa($scope.pessoaCtrl.pessoa.id).success(function(data){
			controller.pessoaBens = data;
		});
	}
	
	/**
	 * IMOVEL
	 */
	
	function incluirImovel(){
		controller.imovel.pessoa = {
			id: $scope.pessoaCtrl.pessoa.id
		}
		pessoaService.insertPessoaImovel(controller.imovel).success(function(data){
			controller.imovel = {}
			buscaPatrimonios();
		});
	}
	
	function updateImovel(imovel){
		$timeout(function(){
			estadoService.findAllByPais(imovel.pais).success(function(estados){
				controller.imovel = angular.copy(imovel);
				controller.estados = estados;
			});
		});
	}

	function deleteImovel(imovel){
		dialogService.show('Excluir', 'Deseja excluir o imóvel do tipo ' + imovel.tipoImovel + ' com o valor de mercado ' + $filter('currency')(imovel.valorMercado, 'R$') + '?' ,'Sim','Não').result.then(function(){
			pessoaService.excluirPessoaImovel(imovel.id).success(function(data){
				buscaPatrimonios();
			});
		});
	}
	
	function cancelImovel(){
		controller.imovel = {};
	}
		
	/**
	 * BEM
	 */
	
	function incluirBem(){
		controller.bem.pessoa = {
			id: $scope.pessoaCtrl.pessoa.id
		}
		pessoaService.insertPessoaBem(controller.bem).success(function(data){
			controller.bem = {};
			buscaPatrimonios();
		});
	}
	
	function updateBem(bem){
		controller.bem = angular.copy(bem)
	}

	function deleteBem(bem){
		dialogService.show('Excluir', 'Deseja excluir o bem do tipo ' + bem.tipoBem + ' com o valor de mercado ' + $filter('currency')(bem.valorMercado, 'R$') + '?' ,'Sim','Não').result.then(function(){
			pessoaService.excluirPessoaBem(bem.id).success(function(data){
				buscaPatrimonios();
			});
		});
	}
	
	/**
	 * Ao selecionar um país na combo de países.
	 */
	function aoSelecionarPais(item,model) {
		
		controller.imovel.uf = null;
	
		estadoService.findAllByPais(model.nome).success(function(estados){
			controller.estados = estados;
		});			
		
	}
	                                                                                                                                        
	function cancelBem(){
		controller.bem = {};
	}


	/**
	 * Ao escolher uma opção na combo 'Tipo'
	 * em 'Declaração do Cliente'.
	 */
	function aoSelecionarDeclaracao() {
		pessoaService.atualizaTipoDeclaracaoPessoa(controller.pessoa);
	}
	
	function validarTipoImovel(){
		controller.tipoImovel.dsTipoImovel = '';
		if(controller.imovel.tipoImovel && controller.imovel.tipoImovel.id  == "new"){
			$timeout(function(){
				controller.imovel.tipoImovel = null;
				angular.element("#modalTipoImovel").modal("show");					
			},250);
		}
	}
	
	function incluirTipoImovel(){
		
		var tipoImovel = angular.copy(controller.tipoImovel);
		
		tipoService.insertTipoImovel(tipoImovel).success(function(tipoImovel){
			if(angular.isObject(tipoImovel)){
				carregarTiposImovel();
				$timeout(function(){
					angular.element("#modalTipoImovel").modal("hide");	
					controller.tipoImovel.dsTipoImovel = null;
				},250);
			}else{
				notify({message:'Tipo de bem imóvel já cadastrado!', classes:'alert-danger',position:'right'});
				controller.tipoImovel.dsTipoImovel = null;
			}	
		});
	}
	
	function excluirTipoImovel(tipoImovel){
		
		dialogService.show('Excluir','Deseja excluir o tipo de bem imóvel ' + tipoImovel.dsTipoImovel + '?','Sim','Não').result.then(function(){
			
			tipoService.excluirTipoImovel(tipoImovel.id).success(function(){
				carregarTiposImovel();
			}).error(function(){
				notify({message:'Esse tipo de bens imóveis possui vínculo com outro registro e por isso não poderá ser excluído!!', classes:'alert-danger',position:'right'});
			});
			
		});
		
	}
	
	function validarTipoBem(){
		controller.tipoBem.dsTipoBem = '';
		if(controller.bem.tipoBem && controller.bem.tipoBem.id  == "new"){
			$timeout(function(){
				controller.bem.tipoBem = null;
				angular.element("#modalTipoBem").modal("show");					
			},250);
		}
	}
	
	function incluirTipoBem(){
		
		var tipoBem = angular.copy(controller.tipoBem);
		
		tipoService.insertTipoBem(tipoBem).success(function(tipoBem){
			if( angular.isObject(tipoBem)){
				carregarTiposBem();
				$timeout(function(){
					angular.element("#modalTipoBem").modal("hide");	
					controller.tipoBem.dsTipoBem = null;
				},250);
			}else{
				notify({message:'Tipo de outros bens já cadastrado!', classes:'alert-danger',position:'right'});
				controller.tipoBem.dsTipoBem = null;
			}	
		});
	}
	
	function excluirTipoBem(tipoBem){
		
		dialogService.show('Excluir','Deseja excluir o tipo de outros bens ' + tipoBem.dsTipoBem + '?','Sim','Não').result.then(function(){
			
			tipoService.excluirTipoBem(tipoBem.id).success(function(){
				carregarTiposBem();
			}).error(function(){
				notify({message:'Esse tipo de outros bens possui vínculo com outro registro e por isso não poderá ser excluído!!', classes:'alert-danger',position:'right'});
			});
			
		});
		
	}
}