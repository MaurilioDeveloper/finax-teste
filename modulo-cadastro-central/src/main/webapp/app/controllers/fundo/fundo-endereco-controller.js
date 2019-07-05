angular.module('cadastro-central-module').controller('EnderecoFundosCtrl', EnderecoFundosCtrl);

EnderecoFundosCtrl.$inject = ['$stateParams','$scope','$http', '$timeout','PATHCONFIG','$q','$state','notify','usSpinnerService', 'pessoaService', 'tipoService','dialogService', 'enderecoService','paisService','estadoService','cidadeService'];

function EnderecoFundosCtrl($stateParams,$scope,$http,$timeout,PATHCONFIG,$q,$state,notify, usSpinnerService, pessoaService, tipoService,dialogService,enderecoService,paisService,estadoService,cidadeService) {

	var controller = this;
	var promises = []; 
	
	controller.cepSalvo;
	controller.endereco = {};
	controller.insertEndereco = insertEndereco;
	controller.updateEndereco = updateEndereco;
	controller.deleteEndereco = deleteEndereco;
	controller.	cancel = cancel;
	controller.buscaEnderecoByCep = buscaEnderecoByCep;
	controller.disable = false;
	controller.estados = [];
	controller.paises = [];
	
	paisService.findAll().success(function(paises){
		controller.paises = paises;
	});
	
	tipoService.getTipoEnderecos().success(function(data){
		controller.tipoEnderecos = data;
	});
	
	if($stateParams.abas) {
		controller.abas = $stateParams.abas;
		controller.acao = $stateParams.acao;
	}
	
	if($stateParams.identificador) {
		promises.push($q(function (resolve) {
			pessoaService.findByIdentificador($stateParams.identificador).then(function (pessoa) {
				controller.pessoa = pessoa;
				controller.endereco.pessoa = pessoa;
				carregaEnderecos();
			}).finally(function () {
				resolve();
			});
		}));
	}
	
	function insertEndereco(){
		controller.endereco.tipoEndereco = {};
		controller.endereco.tipoEndereco.id = 1;
		pessoaService.insertPessoaEndereco(controller.endereco).success(function(data){
			carregaEnderecos();
			if((controller.endereco.pais == "Brasil" && controller.endereco.cep)
				&& controller.endereco.pais
				&& controller.endereco.estado
				&& controller.endereco.cidade
				&& controller.endereco.bairro
				&& controller.endereco.endereco){
				$scope.fundoCtrl.abas.enderecoFundos.erros = [];
			} else if(controller.endereco.pais != "Brasil" 
				&& controller.endereco.pais
				&& controller.endereco.estado
				&& controller.endereco.cidade
				&& controller.endereco.endereco ) {
					$scope.fundoCtrl.abas.enderecoFundos.erros = [];
			}
			$scope.fundoCtrl.pessoaFundo.stCadastroFundo = 'Em Andamento';
		});
	}
	
	function updateEndereco(endereco){
		if(validarCep()){
			insertEndereco();
		}
	}
	
	function deleteEndereco(endereco){
		dialogService.show('Excluir', 'Deseja excluir o endereço ' + endereco.endereco + '?','Sim','Não').result.then(function(){
			pessoaService.deletePessoaEndereco(endereco.id).success(function(data){
				if(controller.endereco.id){
					controller.endereco = {};
				}
				carregaEnderecos();
				$scope.fundoCtrl.pessoaFundo.stCadastroFundo = 'Em Andamento';
			});
		});
	}
	
	function cancel(){
		controller.endereco = {};
	}
	
	function toTitleCase(str){
		if(str){
			return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		}
	}
	
	function buscaEnderecoByCep(){
		if(controller.endereco.cep ){
			if(controller.cepSalvo != controller.endereco.cep){
				
				enderecoService.findByCep(controller.endereco.cep).success(function(data){
					
					if(data.cep != null){
						
						controller.endereco.estado = toTitleCase(data.nomeUf);
						controller.endereco.bairro = toTitleCase(data.bairroDistrito);
						controller.endereco.complemento = toTitleCase(data.complemento);
						controller.endereco.pais = toTitleCase('BRASIL');
						controller.endereco.estado = toTitleCase(data.nomeUf);
						controller.endereco.cidade = toTitleCase(data.localidade);
						controller.endereco.endereco = toTitleCase(data.logradouro);
						controller.endereco.numero = toTitleCase(data.numero);
						
						controller.disable = true;
						
						insertEndereco();
						
					} else {
						controller.disable = false;
						if(controller.endereco.pais != "Brasil"){
							controller.endereco.cep = '';
						} else {
							limpaCampos();
						}
						notify({message:'O CEP informado não é válido.', classes:'alert-danger',position:'right'});
						return;
					}
				}).error(function(error){
					controller.disable = false;
					limpaCampos();
					notify({message:'O CEP informado não é válido.', classes:'alert-danger',position:'right'});
					return;
				});
			}
		} else {
			limpaCampos();
			controller.disable = false;
		}
	}
	
	function validarCep(){
		if (controller.endereco.pais.nome == "Brasil" && (controller.endereco.cep == null || controller.endereco.cep == "")) {
			notify({message:'O CEP é obrigatório para endereços localizados no Brasil.', classes:'alert-danger',position:'right'});
			return false;
		} else {
			return true;
		}
	}
	
	function carregaEnderecos() {
		
		var identificador = controller.endereco.pessoa.identificador;
		
		pessoaService.findPessoaEnderecoByTipoFundo(identificador)
			.success(function(endereco) {
			
			controller.endereco = endereco;
			if (controller.endereco.cep) {
				controller.endereco.cep = ('00000000' + controller.endereco.cep).slice(-8)
			}
			controller.cepSalvo = ('00000000' + controller.endereco.cep).slice(-8);
			controller.endereco.pessoa = controller.pessoa;
			controller.disable = (controller.endereco.cep != null && controller.endereco.cep != 0);
			
			if (endereco.pais) {
				validarCep(); 				
				
			} else {
				controller.disable = false;
			}
		});
	}
	
	function limpaCampos(){
		controller.endereco.estado = '';
		controller.endereco.bairro ='';
		controller.endereco.complemento ='';
		controller.endereco.pais ='';
		controller.endereco.pais.nome ='';
		controller.endereco.estado = '';
		controller.endereco.cidade = '';
		controller.endereco.endereco = '';
		controller.endereco.numero = '';
		controller.endereco.cep = '';
		controller.cepSalvo ='';
	}
	
	$timeout(function(){
		
		if($scope.fundoCtrl.abas.enderecoFundos.erros.length){
			
			controller.form.$submitted = true;
			
			$scope.fundoCtrl.abas.enderecoFundos.erros.filter(function(erro){
				return erro.campo; 
			}).forEach(function(erro){
				controller.form[erro.campo].$setValidity('required',false);
				angular.element('[name=' + erro.campo + ']').attr('tooltip',erro.mensagem);
				$timeout(function(){
					angular.element('[name=' + erro.campo + ']').trigger('mouseover');
				});
			});
		}		
	});
	
}