angular.module('cadastro-central-module').controller('DadosPessoaisEmpresaCtrl', DadosPessoaisEmpresaCtrl);

DadosPessoaisEmpresaCtrl.$inject = ['$scope','$http','$timeout','$modal','PATHCONFIG','$q','$state','notify','usSpinnerService', 'pessoaService', 'tipoService', 'dialogService', 'paisService', 'estadoService','cidadeService','nacionalidadeService', 'formaConstituicaoService'];

function DadosPessoaisEmpresaCtrl($scope, $http, $timeout, $modal, PATHCONFIG, $q, $state, notify, usSpinnerService, pessoaService, tipoService, dialogService, paisService, estadoService, cidadeService, nacionalidadeService, formaConstituicaoService) {
	
	var controller = this;
	
	controller.dados = {};
	controller.pessoaNacionalidades = [];
	controller.formasDeConstituicao = [];
	controller.newFormaConstituicao = '';
	
	$q.all([tipoService.getTipoEstadosCivis(),
        pessoaService.findByIdentificador($scope.pessoaCtrl.pessoa.identificador)]).then(function(retornos){

		controller.estadosCivis = retornos[0].data;
		$scope.pessoaCtrl.pessoa = controller.pessoa = retornos[1];
		montaTipoPessoa();
		
		if($scope.pessoaCtrl.pessoa.pais == 'Brasil'){
			var estado = $scope.pessoaCtrl.pessoa.estado;
			var cidade = $scope.pessoaCtrl.pessoa.cidade;
			aoSelecionarPais(null, $scope.pessoaCtrl.pessoa.pais, true);
			if(estado != null) {
				estadoService.getSiglaUFByNomeUF(estado).success(function(siglaUF){
					aoSelecionarEstado({id: siglaUF}, null, true);
					$scope.pessoaCtrl.pessoa.estado = estado;
					$scope.pessoaCtrl.pessoa.cidade = cidade;
				});
			}
		}
		
		if ($scope.pessoaCtrl.acao == "V") {
			$scope.pessoaCtrl.bloqueiaCampos();
		}
    });
		
	controller.salvar = salvar;
	controller.salvarNacionalidade = salvarNacionalidade;
	controller.updateNacionalidade = updateNacionalidade;
	controller.deleteNacionalidade = deleteNacionalidade;
	controller.cancel = cancel;
	controller.validarData = validarData;
	controller.aoSelecionarPais = aoSelecionarPais;
	controller.aoSelecionarEstado = aoSelecionarEstado;
	controller.validarNacionalidade = validarNacionalidade;
	
	paisService.findAll().success(function(paises){
		controller.paises = paises;
	});

	pessoaService.findPerfilByPessoa($scope.pessoaCtrl.pessoa.id).success(function(data){
		controller.perfil = angular.copy(data);
		if(!data.id){
			controller.perfil = {};
			controller.perfil.fatca = "N";
			salvarPessoaPerfil();
		}
	});
	
	function salvarPessoaPerfil(){
		controller.perfil.pessoa = {
			id: $scope.pessoaCtrl.pessoa.id
		}
		pessoaService.insertPessoaPerfil(controller.perfil).success(function(data){
			controller.pessoa.perfil = data;
		});
	}
	
	function salvar(){
		
		if(controller.form.nome.$valid) {
			var index = $scope.pessoaCtrl.abas.dadosPessoais.erros.findIndex(function(erro) {
				return erro.campo == 'nome';
			});
			$scope.pessoaCtrl.abas.dadosPessoais.erros.splice(index,1);
		} else {
			return;
		}
		
		pessoaService.insertPessoa($scope.pessoaCtrl.pessoa).then(function(data){
			$scope.pessoaCtrl.pessoa = controller.pessoa = data;
			salvarPessoaPerfil();
			montaTipoPessoa();
		});
	}
	
	function salvarNacionalidade() {
		controller.nacionalidade.pessoa = $scope.pessoaCtrl.pessoa;
		pessoaService.insertPessoaNacionalidade(controller.nacionalidade).success(function(data){
			$scope.pessoaCtrl.abas.dadosPessoais.erros.forEach(function(erro, index){
				if(!erro.campo){
					$scope.pessoaCtrl.abas.dadosPessoais.erros.splice(index, 1);
				}
			})
			carregaNacionalidades();
			controller.nacionalidade = {};
		});
	}
	
	carregaNacionalidades();
	
	/**
	 * Carrega a tabela de documentos e os tipos de documentos.
	 */
	function carregaNacionalidades() {
		
		$q.all([pessoaService.findNacionalidadesByPessoa($scope.pessoaCtrl.pessoa.id),
				nacionalidadeService.findAll()]).then(function(retornos){
					
			controller.pessoaNacionalidades = retornos[0].data;
			controller.nacionalidades = angular.copy(retornos[1].data);
			
			controller.nacionalidades = controller.nacionalidades.filter(function(nacionalidade){
				return !controller.pessoaNacionalidades.some(function(pessoaNacionalidade){
					return nacionalidade.descricao.toUpperCase() == pessoaNacionalidade.descricaoNacionalidade;
				});
			});
			
			//controller.allDocumentosModal =  retornos[2].data;
			newOption = {id:"new", descricao:"Nova Nacionalidade"};
			controller.nacionalidades.unshift(newOption);
					
		});
		
		if ($scope.pessoaCtrl.acao == "V") {
			$scope.pessoaCtrl.bloqueiaCampos();
		}
		
	}
	
	function validarNacionalidade(){
		if(controller.nacionalidade.descricaoNacionalidade == "Nova Nacionalidade"){
			$modal.open({
				size:'md',
				backdropClass:'backdrop',
				backdrop:'static',
				windowClass:'smartmodal',
				animation:true,
				templateUrl:'app/views/cliente/modalNacionalidade.html',
				controller:'ModalNacionalidadeCtrl',
				controllerAs:'modalNacionalidadeCtrl'
			}).result.then(function(users){
				controller.nacionalidade.descricaoNacionalidade = "";
				carregaNacionalidades();
			},function(){
				controller.nacionalidade.descricaoNacionalidade = "";
				carregaNacionalidades();
			});
		}

	}
		
	function updateNacionalidade(nacionalidade){
		controller.nacionalidade = angular.copy(nacionalidade);
	}
	
	function deleteNacionalidade(nacionalidade){
		dialogService.show('Excluir', 'Deseja excluir a nacionalidade ' + nacionalidade.descricaoNacionalidade + '?','Sim','Não').result.then(function(){
			pessoaService.excluirPessoaNacionalidade(nacionalidade.id).success(function(data){
				controller.nacionalidade = {};
				carregaNacionalidades();
			})
		});
		controller.nacionalidade = {};
	}
		
	function cancel(){
		$timeout(function(){
			controller.nacionalidae = {};
			controller.nacionalidade.id = null;
			controller.nacionalidade.descricaoNacionalidade = '';
			controller.nacionalidade.abdicouNacionalidade = 0;
		});
	}
	
	function validarData(tipo){
		if(typeof $scope.pessoaCtrl.pessoa.dataNascConstituicao == "string"){
			$scope.pessoaCtrl.pessoa.dataNascConstituicao = moment($scope.pessoaCtrl.pessoa.dataNascConstituicao, 'DD/MM/YYYY');
		}
		if(tipo == 'nascimento'){
			var pastDate = moment(new Date()).subtract(120, 'years');
			if($scope.pessoaCtrl.pessoa.dataNascConstituicao >= pastDate && $scope.pessoaCtrl.pessoa.dataNascConstituicao <= new Date()){
				if($scope.pessoaCtrl.pessoa.dataNascConstituicao && $scope.pessoaCtrl.pessoa.dataNascConstituicao._i){
					$scope.pessoaCtrl.pessoa.dataNascConstituicao = $scope.pessoaCtrl.pessoa.dataNascConstituicao._i;
				}
				salvar();
			}else{
				if($scope.pessoaCtrl.pessoa.dataNascConstituicao > pastDate){
					notify({message:'A data de nascimento não pode ser superior à data atual!', classes:'alert-danger',position:'right'});
				}else if($scope.pessoaCtrl.pessoa.dataNascConstituicao < new Date()){
					notify({message:'A data de nascimento não pode ser superior a 120 anos!', classes:'alert-danger',position:'right'});
				}
				$scope.pessoaCtrl.pessoa.dataNascConstituicao = '';
			}
		}else{
			var pastDate = moment(new Date()).subtract(100, 'years');
			if($scope.pessoaCtrl.pessoa.dataNascConstituicao >= pastDate && $scope.pessoaCtrl.pessoa.dataNascConstituicao <= new Date()){
				if($scope.pessoaCtrl.pessoa.dataNascConstituicao && $scope.pessoaCtrl.pessoa.dataNascConstituicao._i){
					$scope.pessoaCtrl.pessoa.dataNascConstituicao = $scope.pessoaCtrl.pessoa.dataNascConstituicao._i;
				}				
			}else{
				if($scope.pessoaCtrl.pessoa.dataNascConstituicao > pastDate){
					notify({message:'A data de constituição não pode ser superior à data atual!', classes:'alert-danger',position:'right'});
				}else if($scope.pessoaCtrl.pessoa.dataNascConstituicao < new Date()){
					notify({message:'A data de constituição não pode ser superior a 100!', classes:'alert-danger',position:'right'});
				}
				$scope.pessoaCtrl.pessoa.dataNascConstituicao = '';
			}
			salvar();
		}
	}
	
	/**
	 * Ao selecionar um país na combo de países.
	 * 
	 */
	function aoSelecionarPais(item,model,first) {
		if(!first){
			$scope.pessoaCtrl.pessoa.estado = undefined;
			$scope.pessoaCtrl.pessoa.cidade = undefined;
		}
		controller.cidades = [];
		controller.estados = [];

		salvar();
		
		if($scope.pessoaCtrl.pessoa.pais == 'Brasil'){
			estadoService.findAllByPais(model).success(function(estados){
				controller.estados = estados;
			});
		}
		
	}
	
	/**
	 * Ao selecionar um estado no combo de estados.
	 */
	function aoSelecionarEstado(item,model,first) {
		
		if (!first){
			$scope.pessoaCtrl.pessoa.cidade = undefined;
		}
		
		salvar();
		
		if(item && $scope.pessoaCtrl.pessoa.pais == 'Brasil'){
			cidadeService.findAllByEstado(item.id).success(function(cidades){
				controller.cidades = cidades;
			});
		}
		
	}

	//Inicializa o feedback de possíveis erros de validação
	$timeout(function(){
		
		if($scope.pessoaCtrl.abas.dadosPessoais.erros.length){
			
			controller.form.$submitted = true;
			
			$scope.pessoaCtrl.abas.dadosPessoais.erros.filter(function(erro){
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
	
	function montaTipoPessoa(){
		var papeis = $scope.pessoaCtrl.pessoa.tipo.split("/");
	
		if($scope.pessoaCtrl.pessoaRelacionada){
			papeis = papeis.filter(function(papel){
				return papel != 'Cotista'
					&& papel != 'Correntista'
			});
		}else{
			papeis = papeis.filter(function(papel){
				return papel == 'Cotista'
					|| papel == 'Correntista'
			});
		}
		
		$timeout(function(){
			$scope.pessoaCtrl.pessoa.tipo = papeis.map(function(papel){
				return papel;
			}).join('/');
		})
	}
	
	controller.findAllFormaConstituicao = function() {
		formaConstituicaoService.findAll()
			.success(function(data) {
				controller.formasDeConstituicao = data;
				$timeout(function() {
					if ($scope.pessoaCtrl.pessoa.formaConstituicao) {
						var opcSelect = $scope.pessoaCtrl.pessoa.formaConstituicao.idFormaConstituicao;
						$scope.pessoaCtrl.pessoa.formaConstituicao.idFormaConstituicao = opcSelect + '';
					}
				}, 250);
			})
			.error(function(error) {
				notify({message:'Não foi possível carregar Formas de Constituição', classes:'alert-danger',position:'right'});
			});
	}
	
	controller.validarFormaConstituicao = function() {
		if ($scope.pessoaCtrl.pessoa.formaConstituicao.idFormaConstituicao == 'new') {
			$timeout(function() {
				controller.newFormaConstituicao = '';
				angular.element("#modalFormaConstituicao").modal("show");
				$scope.pessoaCtrl.pessoa.formaConstituicao.idFormaConstituicao = '';
			}, 250);
		} else {
			salvar();
		}
	}
	
	controller.excluirFormaConstituicao = function(formaConst) {
		
		dialogService.show('Excluir','Deseja excluir a Forma de Constituição ' + formaConst.dsFormaConstituicao + '?','Sim','Não')
			.result.then(function() {
				
				formaConstituicaoService.remove(formaConst)
					.success(function(data) {
						if (data) {
							var indiceDocumento = controller.formasDeConstituicao.indexOf(formaConst);
							controller.formasDeConstituicao.splice(indiceDocumento, 1);
						} else {
							notify({message: 'Esta forma de constituição possui vínculo com outro registro e por isso não poderá ser excluída!!', classes: 'alert-danger', position: 'right'});
						}
					})
					.error(function(error) {
						notify({message: 'Não foi possível excluir Forma de Constituição!!', classes: 'alert-danger', position: 'right'});
					});
			
		});
		
		
	}
	
	controller.incluirFormaDeConstituicao = function() {

		var isValidDescricao = true;
		controller.formasDeConstituicao.forEach(function(value){
			console.log(value);
			if(value.dsFormaConstituicao == controller.newFormaConstituicao) {
				isValidDescricao = false;

				
			}
		});
		
		if(isValidDescricao) {

		
		var formaConstituicao = {
			dsFormaConstituicao : controller.newFormaConstituicao
		}
		
		formaConstituicaoService.insert(formaConstituicao)
			.success(function(data) {
				controller.formasDeConstituicao.push(data);
				controller.newFormaConstituicao = '';
			})
			.error(function(error) {
				notify({message: 'Não foi possível incluir Forma de Constituição', classes: 'alert-danger', position: 'right'});
			});
		} else {
			controller.newFormaConstituicao = '';
			notify({message: 'Forma de Constituição já cadastrada.', classes: 'alert-danger', position: 'right'});
		}
	}
	
	controller.findAllFormaConstituicao();
	
}