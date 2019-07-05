angular.module('cadastro-central-module').controller('FundoCtrl', FundoCtrl);

FundoCtrl.$inject = ['$scope','$stateParams','$timeout','$filter','$q','$state','notify','usSpinnerService','pessoaService','fundoService','utilsService','papelService','dialogService','$rootScope'];

function FundoCtrl($scope,$stateParams,$timeout,$filter,$q,$state,notify,usSpinnerService,pessoaService,fundoService,utilsService,papelService,dialogService,$rootScope) {
	
	var controller = this;
	controller.mudarTab = mudarTab;
	controller.incluir = incluir;
	controller.limparFundo = limparFundo;
	controller.bloqueiaCampos = bloqueiaCampos;
	controller.buscaPapel = buscaPapel;
	controller.mudarParaEdicao = mudarParaEdicao;
	controller.concluir = concluir;
	controller.aoClicarCNPJ = aoClicarCNPJ;
	controller.voltar = voltar;
	controller.buscaPessoa = buscaPessoa;
	controller.gerarCodigoPessoaFundo = gerarCodigoPessoaFundo;
	controller.validarNomeReduzido = validarNomeReduzido;
	controller.cadastrarPessoaFundo = cadastrarPessoaFundo;
	controller.papel = {};
	controller.pessoasRelacionadas = [];
	controller.pessoasRelacionadasUsuario = [];
	
	controller.pessoaFundo=	{
			id: '',
			codigo: '',
			ativo: '',
			subTipo: '',
			nomeReduzido: '',
			codCetip: '',
			codSelic: '',
			codGiin: '',
			dataSubscricaoInicial: '',
			dataEncerramento: '',
			pessoa: {
				id: '',
				tipoPessoa: 'J',
				tipoDeclaracao: '',
				nomeRazao: '',
				sexo: '',
				identificador: '',
				estadoCivil: '',
				dataCadastro: '',
				dataUltimaAtualizacao: '',
				dataNascConstituicao: '',
				dataInicioRelacionamento: '',
				dataFimRelacionamento: '',
//				formaConstituicao: '',
				ativo: '',
				estrangeiro: '',
				statusCadastro: '',
				site: '',
				pais: '',
				estado: '',
				cidade: '',
				papeis: [
				  {
					id: '',
					descricao: '',
					nivelRelacionamento: '',
					tipoCadastro: '',
				  }
				],
				nomeFantasia: '',
				loaded: '',
			}
	}
	
	
	controller.pessoa = {
			identificador: '',
			tipoPessoa: 'J',
			papeis:[{}]
	};


	controller.fundo ={
		ativo : false,
		codigo: '',
		pessoa : {
			identificador: '',
			tipoPessoa : 'J',
			papeis : []
		}

	};
	
	// Objeto utilizado para armazenar possíveis erros
	// ao concluir o cadastro da pessoa
	controller.abas = {
		dadosBasicosFundos : { erros : [] },
		enderecoFundos : { erros : [] },
		configuracaoFundos : { erros : [], hasAlert: false },
		dadosBancariosFundos : { erros : [] },
		prestadorServicoFundos : { erros : [] },
		elegibilidadeFundos : { erros : [] }
	};
	
	// Se houver abas e porque veio redirecionado do botão concluir
	if ($stateParams.abas) {
		controller.abas = $stateParams.abas;
		controller.pessoaFundo.pessoa = $stateParams.pessoa;
	}
	
	if($stateParams.pessoaRelacionada){
		controller.pessoaRelacionada = $stateParams.pessoaRelacionada;
		controller.pessoaFundo.pessoa.tipoPessoa = $stateParams.tipoPessoa;
	}else{
		controller.pessoaRelacionada = false;
	}

	// I - incluir, V - Visualizar, E - Editar
	controller.acao = $stateParams.acao;
	controller.tab = $stateParams.tab;
	
	var _papeis = []; //Lista de todos os papeis da base de dados para evitar ficar buscando a todo momento.
	controller.papeis = []; //Lista de papeis que serão exibidos na tela

	var promises = []; //Todos os serviços que devem ser chamados antes de iniciar o carregamento e funcionamento da tela

	promises.push($q(function (resolve) {
		papelService.findAll().success(function(papeis){
			_papeis = papeis.sort(function(papel1,papel2){
				return papel1.descricao > papel2.descricao;
			});
		}).finally(function () {
			resolve();
		});
	}));

	if($stateParams.identificador) {
		promises.push($q(function (resolve) {
			fundoService.findPessoaFundoByIdentificador($stateParams.identificador).then(function (response) {
				controller.pessoaFundo = response.data;
			}).finally(function () {
				resolve();
			});
		}));
	}
	
	if($stateParams.identificador) {
		promises.push($q(function (resolve) {
			pessoaService.findByIdentificadorPessoa($stateParams.identificador).then(function (pessoa) {
				controller.pessoaFundo.pessoa = pessoa;
			}).finally(function () {
				resolve();
			});
		}));
	}

	

	function incluir() {
		validarNomeReduzido();
		
		if(!controller.pessoaFundo.pessoa.estrangeiro){
			if(!controller.pessoaFundo.pessoa.identificador){
					notify({message:'O campo CNPJ é obrigatório', classes:'alert-danger',position:'right'});
					return;
			} else {
				if (!utilsService.validarCNPJ(controller.pessoaFundo.pessoa.identificador.toString())) {
					notify({
						message: 'Número do documento CNPJ é inválido!',
						classes: 'alert-danger',
						position: 'right'
					});
					return;
				}
			}
		}
	
		buscaPessoa().then(function(pessoa){
			if(!pessoa){
				if(!controller.pessoaFundo.pessoa.nomeRazao){
					notify({message:'Informar a razão social (Campo Obrigatório)!', classes:'alert-danger',position:'right'});
				} else {
					controller.pessoaFundo.pessoa = pessoa;
					cadastrarPessoaFundo();
				}
			} 
		});
		

	}
	
	function cadastrarPessoaFundo(){
		if(validarNomeReduzido()){
			controller.pessoaFundo.pessoa.statusCadastro = 'Em Andamento';
			controller.pessoaFundo.ativo =  '0';
			papelService.findAllByTipoCadastro('FUNDO').then(function (responsePapel){
				controller.papel = responsePapel.data[0];

				if(controller.pessoaFundo.pessoa.papeis[0].descricao == null || controller.pessoaFundo.pessoa.papeis[0].descricao == ''){
					controller.pessoaFundo.pessoa.papeis[0] = controller.papel;
				} else {
					controller.pessoaFundo.pessoa.papeis.push(controller.papel);
				}
								
				fundoService.inserirAtualizarPessoaFundo(controller.pessoaFundo).success(function(response){
					controller.pessoaFundo = response;
					notify({message:'Fundo cadastrado com sucesso.', classes:'alert-success',position:'right'});
					mudarParaEdicao();
				
				});
			});
		}
	}
	
	
	/**
	 * Método utilizado para tratar um objeto pessoa do retorno do back-end.
	 */
	function trataRetornoPessoa(pessoa) {
		controller.pessoaFundo.pessoa = pessoa;
		controller.pessoaFundo.pessoa.identificador = angular.copy(controller.pessoaFundo.pessoa.identificador.toString());
		controller.isCotista = false;
		delete(controller.pessoaFundo.pessoa.perfil);
		
		// Verifica se a pessoa tem o papel Cotista, para ser exibido o perfil
		// investidor
		controller.pessoaFundo.pessoa.papeis.forEach(function(papel) {
			if(papel.descricao == 'FUNDO') {
				controller.isCotista = true;
			}
		});
		
	}

	/**
	 * Busca uma pessoa na base de dados, caso não exista na base de dados
	 * realiza o cadastro.
	 */
	function buscaPessoa() {
		
		return $q(function(resolve,reject){
			if(controller.pessoaFundo.pessoa.identificador){
				if (!utilsService.validarCNPJ(controller.pessoaFundo.pessoa.identificador.toString())) {
					notify({message: 'CNPJ inválido!',classes: 'alert-danger',position: 'right'});
					controller.pessoaFundo.pessoa.identificador='';
					controller.pessoaFundo.codigo='';
					return;
				}
				
				gerarCodigoPessoaFundo();
				
				pessoaService.findByIdentificadorPessoa(controller.pessoaFundo.pessoa.identificador).then(function(pessoa){
					
					if(pessoa) {
						controller.pessoaFundo.pessoa = pessoa;
						var isFundo = false;
						
						controller.pessoaFundo.pessoa.papeis.forEach(function(papelPessoa){
							if(papelPessoa.descricao == "FUNDO"){
								isFundo = true;
								
							} 
						});
						
						if (isFundo) {
							dialogService.show('Editar','Fundo já cadastrado. Deseja alterar para a tela de edição do fundo?','Sim','Não').result.then(function(){
								mudarParaEdicao();
							},
							function(){
								controller.pessoaFundo ={pessoa: {papeis: [{
									id: '',
									descricao: '',
									nivelRelacionamento: '',
									tipoCadastro: '',
								  }]}};
							});
						}else {
							if(controller.acao == 'I'){
								notify({message:'CNPJ já cadastrado com um papel diferente de fundo. Informe os campos restantes para completar a inclusão do fundo.', classes:'alert-danger',position:'right'});
							}
						}
					}else {
						resolve();
					}
					resolve();
				});
			}
		
		});
	}

	function buscaPapel(papeis) {
		descricaoPapel = "";
		papeis.forEach(function(papelPessoa){
			descricaoPapel += "/" + papelPessoa.descricao;
		});

		return descricaoPapel.substring(1);
	}

	function mudarTab(numero){
		controller.tab = numero;
	}
	

	/**
	 * Ao alterar entre cpf/cnpj limpa o objeto pessoa.
	 */
	function limparFundo(tipo){
		controller.papeis.forEach(function(papel){
			papel.checked = false;
		});
	}
		
	function bloqueiaCampos() {
		// I - incluir, V - Visualizar, E - Editar
		if (controller.acao == "V") {
			angular.element('input').attr("disabled",true);
			angular.element('select').attr("disabled",true);
			angular.element('label').attr("disabled",true);
			angular.element('div.tab-pane button').attr("style", "display:none");
			angular.element('#rodapVoltar').attr("style", "display:inline");
			angular.element('#rodapEditar').attr("style", "display:inline");
		}
	}

	function mudarParaEdicao() {
		mudarTab(2);
		$state.go("fundo.editar", {'identificador':controller.pessoaFundo.pessoa.identificador, 'acao':'E', 'tab': '2'}, {reload: true});
	}
	
	/**
	 * Conclui o cadastro da pessoa.
	 */
	function concluir(){
		fundoService.validarCadastro($scope.fundoCtrl.pessoaFundo).then(function(abas){
			usSpinnerService.spin('spinner-1');
			fundoService.concluir($scope.fundoCtrl.pessoaFundo.codigo).success(function(){
				notify({message:'O cadastro de fundo foi concluído com sucesso!', classes:'alert-success',position:'right'});
				$state.go('fundo.editar',{tab:controller.tab,pessoaFundo:$scope.fundoCtrl.pessoaFundo,abas:abas, identificador: $scope.fundoCtrl.pessoaFundo.pessoa.identificador},{reload:true});
			}).error(function(msg){
				notify({message:msg, classes:'alert-danger',position:'right'});
				$state.go('fundo.editar',{tab:controller.tab,pessoaFundo:$scope.fundoCtrl.pessoaFundo,abas:abas, identificador: $scope.fundoCtrl.pessoaFundo.pessoa.identificador},{reload:true});
			}).finally(function () {
				usSpinnerService.stop('spinner-1');
		    });
		},function(abas){
			notify({message:'Não foi possível concluir o cadastro, verifique os erros', classes:'alert-danger',position:'right'});
			$state.go('fundo.editar',
				{
					tab: controller.tab,
					pessoaFundo: $scope.fundoCtrl.pessoaFundo,
					abas: abas, 
					identificador: $scope.fundoCtrl.pessoaFundo.pessoa.identificador
				}, {
					reload: true
				}
			);
		});
		
	}
	

	
	function aoClicarCNPJ() {	
		controller.pessoa.fundo.tipoPessoa = 'J'; 
		controller.pessoa.fundo.identificador = '';
		controller.pessoa.estrangeiro = false;
		bloqueiaCampos();
		$timeout(function(){
			angular.element('#cnpj').focus();			
		});
	}


	/**
	 * Volta para a state anterior passando os mesmos
	 * parâmetros que foram enviados.
	 */
	function voltar() {
		
		var historicos = angular.copy($rootScope.historicos);
		
		historicos.reverse();
		
		var historico = historicos.find(function(historico){
			return historico.fromParams.identificador != undefined
			&& historico.fromParams.identificador != null;
		});
		
		pessoaService.goIncluirPessoaCarregada(
				16,
				{
					identificador:historico.fromParams.identificador,
					tipoPessoa:historico.fromParams.tipoPessoa,
					papeis:[]
				},
				{
					identificador:historico.fromParams.identificador,
					tipoPessoa:historico.fromParams.tipoPessoa,
					papeis:[]
				},
				false,
				false);
		
	}
	
	
	
	function gerarCodigoPessoaFundo(){
		var codigo = controller.pessoaFundo.pessoa.identificador;
		codigo = codigo.substring(0,8);
		controller.pessoaFundo.codigo = codigo;
	}
	
	
	function validarNomeReduzido(){
		if (controller.pessoaFundo.nomeReduzido.length > 5) {
			controller.pessoaFundo.nomeReduzido = '';
			notify({message:'O nome reduzido do fundo deve possuir cinco caracteres para ser válido.', classes:'alert-danger',position:'right'});
			return false;
		} else {
			return true;
		}
	}
	
}