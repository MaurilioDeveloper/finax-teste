angular.module('cadastro-central-module').controller('AcessoExternoCtrl', AcessoExternoCtrl);

AcessoExternoCtrl.$inject = ['$scope', '$timeout', 'notify', 'acessoExternoService', '$stateParams', 'dialogService'];

function AcessoExternoCtrl($scope, $timeout, notify, acessoExternoService, $stateParams, dialogService) {

    var controller = this;

    controller.prestadorServico = {
        pessoa : {

        }
    };

    controller.acesso = {
		metodoAcessos: 
		[
			 {
				 atributos: [],
				 metodo: "RECUPERA_TOKEN",
				 oauth: false,
				 url: null
			 }, 
			 {
				 metodo: "RECUPERA_P7S",
				 oauth: false,
				 url: null
			 }, 
			 {
				 metodo: "CONFIRMA_AUTORIZACAO",
				 oauth: false,
				 url: null
			 },
			 {
				 metodo: "VALIDA_USUARIO",
				 oauth: false,
				 url: null
			 }
		 ],
        pessoa: {},
        senha: null,
        token: null,
        usuario: null
    };

    controller.atributo ={};
    
    controller.flagAcesso = false;
    
    controller.acao = $stateParams.acao;
    controller.tab = $stateParams.tab;
    controller.mudarTab = mudarTab;
    controller.salvar = salvar;
    controller.incluirRequestBody = incluirRequestBody;
    controller.alterarRequestBody = alterarRequestBody;
    controller.cancel = cancel;
    controller.deleteRequest = deleteRequest;
    controller.alterar = alterar;

    carregarAcessoExterno();

    function carregarAcessoExterno() {
        acessoExternoService.getAcessByIdentificador($scope.prestadorServicoCtrl.prestadorServico.pessoa.identificador).success(function (response) {
	    	if(response[0]){
				angular.forEach(controller.acesso.metodoAcessos, function(value, key){
					var achou = false;
					angular.forEach(response[0].metodoAcessos, function(valueResponse, keyResponse){
						if(value.metodo == valueResponse.metodo){
							achou = true;
						}
					});
					if(!achou){
						response[0].metodoAcessos.push(value);
					}
				});
				controller.acesso = response[0];
				controller.acesso.metodoAcessos = ordenaMetodoAcessoExterno(controller.acesso.metodoAcessos);
			}
			controller.acesso.pessoa = {
				idPessoa : $scope.prestadorServicoCtrl.prestadorServico.pessoa.id 
			};
	    	
       });
    }
    
    function ordenaMetodoAcessoExterno(acessoRaw){
    	let acessoAux = [];
    	for (var i = 0; i < acessoRaw.length; i++) {
    		switch (acessoRaw[i].metodo) {
			case "RECUPERA_TOKEN":
				acessoAux[0] = acessoRaw[i];
				break;
			case "RECUPERA_P7S":
				acessoAux[1] = acessoRaw[i];
				break;
			case "CONFIRMA_AUTORIZACAO":
				acessoAux[2] = acessoRaw[i];
				break;
			case "VALIDA_USUARIO":
				acessoAux[3] = acessoRaw[i];
				break;
			default:
				break;
			}
    	}
    	return acessoAux;
    }

    function mudarTab(numero) {
        controller.tab = numero;
    }

    function deleteRequest(atributo) {
        for (var i = 0; i < controller.acesso.metodoAcessos[0].atributos.length; ++i) {
            if(controller.acesso.metodoAcessos[0].atributos[i].id == atributo.id){
                controller.acesso.metodoAcessos[0].atributos.splice(i, 1);
                break;
            }
        }
        var list = [];
        list.push(controller.acesso);
        var identificador = $scope.prestadorServicoCtrl.prestadorServico.pessoa.identificador;
        dialogService.show('Excluir', 'Deseja excluir esta request body: ' + atributo.chave+ '?','Sim','Não').result.then(function(){
            acessoExternoService.updateRequestBody(list, identificador).success(function (response){
                notify({message: 'Request body excluido com sucesso!', classes: 'alert-success', position: 'right'});
                carregarAcessoExterno();
            })
            .error(function(){
            	notify({message: 'Erro ao tentar excluir request body', classes: 'alert-danger', position: 'right'});
            });
        });
        carregarAcessoExterno();
    }

    function salvar() {
        var list = [];
        list.push(controller.acesso);
        var identificador = $scope.prestadorServicoCtrl.prestadorServico.pessoa.identificador;
            if(validarUrls(controller.acesso)){
		        if(controller.acesso){
		        	acessoExternoService.updateRequestBody(list, identificador).then(function (response){
		                carregarAcessoExterno();
		            })
		        }
		        else{
		        	acessoExternoService.saveAcess(list, identificador).then(function(response){
		                carregarAcessoExterno();
		            });
		        }
	        }
    }

    function incluirRequestBody(atributo) {
    	controller.atributo.id = null;
        if(validaRequestBody(atributo)){
            controller.acesso.metodoAcessos[0].atributos.push(atributo);
            var identificador = $scope.prestadorServicoCtrl.prestadorServico.pessoa.identificador;
            var list = [];
            list.push(controller.acesso);
	        acessoExternoService.updateRequestBody(list, identificador).success(function (response){
	            notify({message: 'Request body adicionado com sucesso!', classes: 'alert-success', position: 'right'});
	            limparRequestBody();
	            carregarAcessoExterno();
	        })
	        .error(function(){
	        	notify({message: 'Erro ao tentar inserir request body', classes: 'alert-danger', position: 'right'});
	        })
	        .finally(function (){
	        	carregarAcessoExterno();
	        });
        }
    }

    function alterarRequestBody(atributo) {
            for (var i = 0; i < controller.acesso.metodoAcessos[0].atributos.length; ++i) {
                if(controller.acesso.metodoAcessos[0].atributos[i].id == atributo.id){
                    controller.acesso.metodoAcessos[0].atributos[i] = atributo;
                }
            }
            var list = [];
            list.push(controller.acesso);
            var identificador = $scope.prestadorServicoCtrl.prestadorServico.pessoa.identificador;
        	acessoExternoService.updateRequestBody(list, identificador).success(function (response){
            	notify({message: 'Request body alterado com sucesso!', classes: 'alert-success', position: 'right'});
                controller.flagAcesso = false;
                limparRequestBody();
                carregarAcessoExterno();
            })
            .error(function(){
            	notify({message: 'Erro ao tentar atualizar request body', classes: 'alert-danger', position: 'right'});
            })
            .finally(function (){
	        	carregarAcessoExterno();
	        });
    }

    function alterar(atributo) {
        controller.flagAcesso = true;
        controller.atributo.chave = atributo.chave;
        controller.atributo.valor = atributo.valor;
        controller.atributo.id = atributo.id;
    }

    function cancel() {
        controller.flagAcesso = false;
        limparRequestBody();
    }

    function limparRequestBody() {
        controller.atributo.chave = null;
        controller.atributo.valor = null;
    }
    
    function validarUrls(acesso){
    	var patt = new RegExp("^http[s]?:\/\/");
    	var urla = acesso.metodoAcessos[0].url;
    	var urlb = acesso.metodoAcessos[1].url;
    	var urlc = acesso.metodoAcessos[2].url;
    	if(((urla != null && patt.test(urla)) || urla == null) 
			&& ((urlb != null && patt.test(urlb)) || urlb == null)
			&& ((urlc != null && patt.test(urlc)) || urlc == null)){
    		return true;
    	}
    	notify({message: 'Favor deixar as URLs no padrão http(s)://exemplo.com', classes: 'alert-warning', position: 'right'});
    	return false;
    }

    function validaRequestBody(atributo) {

        for (var i = 0; i < controller.acesso.metodoAcessos[0].atributos.length; ++i) {
            if(controller.acesso.metodoAcessos[0].atributos[i].chave == atributo.chave) {
                notify({message: 'Chave já existe!', classes: 'alert-warning', position: 'right'});
                return false;
            }
        }
        return true;
    }
  
}