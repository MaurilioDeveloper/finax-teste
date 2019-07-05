angular.module('cadastro-central-module').controller('DadosEnderecoPrestadorCtrl', DadosEnderecoPrestadorCtrl);

DadosEnderecoPrestadorCtrl.$inject = ['$scope','$http', '$timeout','PATHCONFIG','$q','$state','notify','usSpinnerService', 'pessoaService', 'tipoService','dialogService', 'enderecoService','paisService','estadoService','cidadeService'];

function DadosEnderecoPrestadorCtrl($scope,$http,$timeout,PATHCONFIG,$q,$state,notify, usSpinnerService, pessoaService, tipoService,dialogService,enderecoService,paisService,estadoService,cidadeService) {
	
	var controller = this;
	
	controller.endereco = {};
	
	controller.insertEndereco = insertEndereco;
	controller.updateEndereco = updateEndereco;
	controller.deleteEndereco = deleteEndereco;
	controller.cancel = cancel;
	controller.buscaEnderecoByCep = buscaEnderecoByCep;
	controller.aoSelecionarPais = aoSelecionarPais;
	controller.aoSelecionarEstado = aoSelecionarEstado;
	controller.validarCep = validarCep;
	controller.carregaEnderecos = carregaEnderecos;
	controller.habilitaCombo = false; 
	controller.validarTipoEndereco = validarTipoEndereco;
	controller.incluirTipoEndereco = incluirTipoEndereco;
	controller.excluirTipoEndereco = excluirTipoEndereco;
	
	controller.estados = [];
	controller.paises = [];
	controller.habilitarAcao = false;
	controller.disable = false;
	controller.acaoBotao = 'I';
	
	paisService.findAll().success(function(paises){
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
	
	function insertEndereco(){
		controller.endereco.pessoa = {
			id: $scope.prestadorServicoCtrl.prestadorServico.pessoa.id
		}
		pessoaService.insertPessoaEndereco(controller.endereco).success(function(data){
			controller.endereco = {};
			carregaEnderecos();
			$scope.prestadorServicoCtrl.abas.enderecos.erros = [];
		});
	}
	
	function updateEndereco(endereco){
		controller.acaoBotao = 'E';
		controller.endereco = angular.copy(endereco);
		controller.endereco.cep = ('00000000' + controller.endereco.cep).slice(-8)
		validarCep();
		controller.habilitarAcao = true;
		controller.disable = (controller.endereco.cep != null && controller.endereco.cep != 0);
		for (var i = 0; i < controller.enderecos.length; ++i) {
			 if(controller.enderecos[i].id == endereco.id){
				 controller.enderecos.splice(i, 1);
				 i = i-1
				 break;
			 }
		} 
		
		
		estadoService.findAllByPais(endereco.pais).success(function(estados){
			controller.estados = estados;
		});
	}
	
	function deleteEndereco(endereco){
		dialogService.show('Excluir', 'Deseja excluir o endereço ' + endereco.endereco + '?','Sim','Não').result.then(function(){
			pessoaService.deletePessoaEndereco(endereco.id).success(function(data){
				if(controller.endereco.id){
					controller.endereco = {};
				}
				carregaEnderecos();
			});
		});
	}
	
	function cancel(){
		controller.acaoBotao = 'I'
		controller.endereco = {};
		carregaEnderecos();
	}
	
	function toTitleCase(str){
		if(str){
			return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		}
	}
	
	function buscaEnderecoByCep(){
		if(controller.endereco.cep){
			enderecoService.findByCep(controller.endereco.cep).success(function(data){
//				estadoService.getSiglaUFByNomeUF(data.nomeUf).success(function(siglaUF){
				if(data.cep != null){
					controller.endereco.endereco = toTitleCase(data.logradouro);
					controller.endereco.estado = toTitleCase(data.nomeUf);
					controller.endereco.bairro = toTitleCase(data.bairroDistrito);
					controller.endereco.complemento = toTitleCase(data.complemento);
					controller.endereco.pais = toTitleCase('BRASIL');
					aoSelecionarPais(null,{nome: controller.endereco.pais});
					//aoSelecionarEstado(null,{id: siglaUF});
					controller.endereco.estado = toTitleCase(data.nomeUf);
					controller.endereco.cidade = toTitleCase(data.localidade);
					controller.disable = true;
				} else {
					controller.disable = false;
					controller.endereco.cep = '';
					notify({message:'O CEP informado não é válido.', classes:'alert-danger',position:'right'});
					return;
				}
//				});
			}).error(function(error){
				controller.endereco.cep = '';
				controller.endereco.pais = '';
				controller.endereco.estado = '';
				controller.endereco.cidade = '';
				controller.endereco.endereco = '';
				controller.endereco.bairro = '';
				controller.habilitaCombo = false;
				controller.disable = (controller.endereco.cep != null && controller.endereco.cep != 0);
				notify({message:'O CEP informado não é válido.', classes:'alert-danger',position:'right'});
			});
		}else {
			controller.endereco.cep = '';
			controller.endereco.pais = '';
			controller.endereco.estado = '';
			controller.endereco.cidade = '';
			controller.endereco.endereco = '';
			controller.endereco.bairro = '';
			controller.habilitaCombo = false;
			controller.disable = (controller.endereco.cep != null && controller.endereco.cep != 0);
		}
	}
	
	/**
	 * Ao selecionar um país na combo de países.
	 * 
	 */
	function aoSelecionarPais(item,model) {
		
		controller.cidades = [];
		controller.endereco.cidade = undefined;
		controller.endereco.estado = undefined;
		
		if(model){
			estadoService.findAllByPais(model.nome).success(function(estados){
				controller.estados = estados;
			});
		}
		
	}
	
	/**
	 * Ao selecionar um estado no combo de estados.
	 */
	function aoSelecionarEstado(item,model) {
		
		controller.endereco.cidade = undefined;
		controller.cidades = [];
		
		if(model){
			usSpinnerService.spin('spinner-1');
			cidadeService.findAllByEstado(model.id).success(function(cidades){
				controller.cidades = cidades;
				usSpinnerService.stop('spinner-1');
			});
		}
		
	}
	
	function carregaEnderecos() {
		controller.habilitarAcao = false;
		pessoaService.findEnderecosByPessoaSemEnderecoFundo($scope.prestadorServicoCtrl.prestadorServico.pessoa.id).success(function(enderecos){
			controller.enderecos = enderecos;
			
			controller.disable = (controller.endereco.cep != null && controller.endereco.cep != 0);
			
			if(controller.endereco.pais){
				validarCep(); 				
				
			} else {
				controller.disable = false;
			}
		});
	}
	
	function validarCep(){
		if (controller.endereco.pais.nome == "Brasil" && (controller.endereco.cep == null || controller.endereco.cep == "")) {
			notify({message:'O CEP é obrigatório para endereços localizados no Brasil.', classes:'alert-danger',position:'right'});
			controller.habilitaCombo = true;
			return false;
		} else {
			controller.habilitaCombo = false;
			return true;
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