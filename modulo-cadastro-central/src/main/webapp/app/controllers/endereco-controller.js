angular.module('cadastro-central-module').controller('EnderecoCtrl', EnderecoCtrl);

EnderecoCtrl.$inject = ['$scope', '$http', '$timeout', 'PATHCONFIG', '$q', '$state', 'notify', 'usSpinnerService', 'pessoaService', 'tipoService', 'dialogService', 'enderecoService', 'paisService', 'estadoService', 'cidadeService' ];

function EnderecoCtrl($scope, $http, $timeout, PATHCONFIG, $q, $state, notify, usSpinnerService, pessoaService, tipoService, dialogService, enderecoService, paisService, estadoService, cidadeService) {

    var controller = this;
    
    controller.endereco = {};
    controller.endereco.cep = '';

    controller.insertEndereco = insertEndereco;
    controller.updateEndereco = updateEndereco;
    controller.deleteEndereco = deleteEndereco;
    controller.cancel = cancel;
    controller.buscaEnderecoByCep = buscaEnderecoByCep;
    controller.carregaEnderecos = carregaEnderecos;
    controller.aoSelecionarPais = aoSelecionarPais;
    controller.aoSelecionarEstado = aoSelecionarEstado;
    controller.validarTipoEndereco = validarTipoEndereco;
	controller.incluirTipoEndereco = incluirTipoEndereco;
	controller.excluirTipoEndereco = excluirTipoEndereco;

	controller.paises = [];
    controller.estados = [];
    controller.cidades = [];

    controller.habilitarCombo = false;
    controller.habilitarAcao = false;
    controller.disable = false;
    controller.acaoBotao = 'I';
    
    // ----------
    controller.habilitaBairro = false;
    controller.habilitaPais = false;
    controller.habilitaEstado = false;
    controller.habilitaCidade = false;
    controller.cepValido = false;
    // ----------

    paisService.findAll().success(function(paises) {
        controller.paises = paises;
    });
    
    function carregarTiposEndereco(){
		tipoService.getTipoEnderecos().success(function(tiposEndereco){
			controller.tipoEnderecos = angular.copy(tiposEndereco);
			controller.allEnderecosModal = angular.copy(tiposEndereco);
			newOption = {id:"new", dsTipoEndereco:"Novo Tipo de Endereço"};
			controller.tipoEnderecos.unshift(newOption);
		});
	}

    carregarTiposEndereco();
    
    carregaEnderecos();

    function insertEndereco() {
        controller.endereco.pessoa = {id: $scope.pessoaCtrl.pessoa.id}
        pessoaService.insertPessoaEndereco(controller.endereco)
        .success(function(data) {
			habilitaDesabilitaCampos(false);
            controller.endereco = {};
            controller.cepValido = false;
            limpaCampos();
            carregaEnderecos();
            $scope.pessoaCtrl.abas.enderecos.erros = [];
        });
    }

    function updateEndereco(endereco) {
        controller.acaoBotao = 'E';
        controller.endereco = angular.copy(endereco);
        controller.habilitarAcao = true;
        var isBrazil = controller.endereco.pais == 'Brasil';
        controller.disable = isBrazil;
        controller.habilitarCombo = isBrazil;
        
        if (endereco.pais == 'Brasil') {
        	var pais = { id:'BR', nome:'Brasil', uppercase: true };
 		    controller.endereco.pais = pais;
        	controller.cepValido = true;
        	habilitaDesabilitaCampos(true);
        } else {
        	controller.cepValido = false;
        }

        estadoService.findAllByPais(endereco.pais).success(function(estados) {
            controller.estados = estados;
        });
    }

    function deleteEndereco(endereco) {
        dialogService.show('Excluir', 'Deseja excluir o endereço ' +
            endereco.endereco + '?', 'Sim', 'Não').result
        .then(function() {
            pessoaService.deletePessoaEndereco(endereco.id).success(
                function(data) {
                    if (controller.endereco.id) {
                        controller.endereco = {};
                    }
                    carregaEnderecos();
                });
        });
    }

    function cancel() {
    	controller.cepValido = false;
        controller.acaoBotao = 'I';
        controller.endereco = {};
        carregaEnderecos();
        habilitaDesabilitaCampos(false);
    }

    function toTitleCase(str) {
        if (str) {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() +
                    txt.substr(1).toLowerCase();
            });
        }
    }
    
    function habilitaDesabilitaCampos(value) {
    	controller.habilitaBairro = value;
	    controller.habilitaPais = value;
	    controller.habilitaEstado = value;
	    controller.habilitaCidade = value;
    }
    
    function limpaCampos() {
    	controller.endereco.endereco = '';
	    controller.endereco.estado = '';
	    controller.endereco.bairro = '';
	    controller.endereco.complemento = '';
	    controller.endereco.cidade = '';
	    controller.endereco.cidade = '';
	    controller.endereco.pais = '';
	    controller.endereco.numero = '';
    }

    function aoSelecionarEstado(item, model) {

        if (model) {
            usSpinnerService.spin('spinner-1');
            cidadeService.findAllByEstado(model.id).success(function(cidades) {
                controller.cidades = cidades;
                usSpinnerService.stop('spinner-1');
            });
        }

    }
    
    function carregaEnderecos() {
        controller.habilitarAcao = false;
        pessoaService.findEnderecosByPessoaSemEnderecoFundo($scope.pessoaCtrl.pessoa.id)
        .success(function(enderecos) {
            controller.enderecos = enderecos;
            controller.disable = (controller.endereco.cep != null && controller.endereco.cep != 0);//verificiar
        });
    }
    
    function aoSelecionarPais(item, model) {

    	controller.endereco.estado = '';
    	controller.endereco.cidade = '';
    	
        if (model) {
            estadoService.findAllByPais(model.nome).success(function(estados) {
                controller.estados = estados;
            });
        }
        
        if (model.id == 'BR') {
        	buscaEnderecoByCep(true);
        }
    }
    
    function buscaEnderecoByCep(validandoPeloPais) {
        if (controller.endereco.cep) {
        	
			enderecoService.findByCep(controller.endereco.cep)
			.success(function(data) {
				validaEndereco(data, validandoPeloPais);
			})
			.error(function(error) {
				notify({message: 'Erro so buscar pelo CEP', classes: 'alert-danger', position: 'right'});
			});
			
        } else {
        	if (!validandoPeloPais) {
        		
        		controller.cepValido = false;
        		notify({message: 'O CEP informado não é válido.', classes: 'alert-danger', position: 'right'});
        		limpaCampos();
        		habilitaDesabilitaCampos(false);
        	}
        }
    }
    
    function validaEndereco(data, validandoPeloPais) {
    	if (data) {
    		controller.cepValido = true;
		    controller.endereco.endereco = data.logradouro;
		    controller.endereco.estado = data.nomeUf;
		    controller.endereco.bairro = data.bairroDistrito;
		    controller.endereco.complemento = data.complemento;
		    controller.endereco.cidade = data.localidade;
		    var pais = { id:'BR', nome:'Brasil', uppercase: true };
		    controller.endereco.pais = pais;
		    habilitaDesabilitaCampos(true);
		    return;
		} 
		
		if (validandoPeloPais) {
			controller.cepValido = false;
			notify({message: 'O CEP informado não é válido.', classes: 'alert-danger', position: 'right'});
			limpaCampos();
			habilitaDesabilitaCampos(false);
			return;
		}
		
		if (controller.endereco.pais.id == 'BR') {
			controller.cepValido = false;
			limpaCampos();
			habilitaDesabilitaCampos(false);
			notify({message: 'O CEP informado não é válido.', classes: 'alert-danger', position: 'right'});
			return;
		}
		
    }

    function validarTipoEndereco(){
    	controller.tipoEndereco = {};
		controller.endereco.enderecoCorrespondencia = '0';
		if(controller.endereco.tipoEndereco.id  == "new"){
			$timeout(function(){
				controller.endereco.tipoEndereco = null;
				angular.element("#modalTipoEndereco").modal("show");					
			},250);
		}
	}
	
	function incluirTipoEndereco(){
		
		var tipoEndereco = angular.copy(controller.tipoEndereco);
		
		tipoService.insertTipoEndereco(tipoEndereco).success(function(tipoEndereco){
			if( angular.isObject(tipoEndereco)){
				carregarTiposEndereco();
				$timeout(function(){
					angular.element("#modalTipoEndereco").modal("hide");	
					controller.tipoEndereco.dsTipoEndereco = null;
				},250);
			}else{
				notify({message:'Tipo de endereço já cadastrado!', classes:'alert-danger',position:'right'});
				controller.tipoEndereco.dsTipoEndereco = null;
			}	
		});
	}
	
	function excluirTipoEndereco(tipoEndereco){
		
		dialogService.show('Excluir','Deseja excluir o tipo de endereço ' + tipoEndereco.dsTipoEndereco + '?','Sim','Não').result.then(function(){
			
			tipoService.excluirEndereco(tipoEndereco.id).success(function(){
				carregarTiposEndereco();
			}).error(function(){
				notify({message:'Esse tipo de endereço possui vínculo com outro registro e por isso não poderá ser excluído!!', classes:'alert-danger',position:'right'});
			});
			
		});
		
	}
}