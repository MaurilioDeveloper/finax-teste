angular.module('cadastro-central-module').controller('PessoaCtrl', PessoaCtrl);

PessoaCtrl.$inject = ['$scope','$stateParams','$timeout','$filter','$q','$state','notify','usSpinnerService','pessoaService','utilsService','papelService','dialogService','$rootScope'];

function PessoaCtrl($scope,$stateParams,$timeout,$filter,$q,$state,notify,usSpinnerService,pessoaService,utilsService,papelService,dialogService,$rootScope) {
	
	var controller = this;
	
	controller.mudarTab = mudarTab;
	controller.incluir = incluir;
	controller.changePapel = changePapel;
	controller.incluirRelacao = incluirRelacao;
	controller.limparPessoa = limparPessoa;
	controller.bloqueiaCampos = bloqueiaCampos;
	controller.buscaPapel = buscaPapel;
	controller.mudarParaEdicao = mudarParaEdicao;
	controller.concluir = concluir;
	controller.excluir = excluir;
	controller.aoClicarCPF = aoClicarCPF;
	controller.aoClicarCNPJ = aoClicarCNPJ;
	controller.aoClicarClienteEstrangeiro = aoClicarClienteEstrangeiro;
	controller.gerarPdf = gerarPdf;
	controller.voltar = voltar;
	controller.buildCheckboxPapeis = buildCheckboxPapeis;
	controller.buscaPessoa = buscaPessoa;
	controller.atualizaNomeRazao = atualizaNomeRazao;
	controller.atualizaRelacao = atualizaRelacao;
	controller.constroiCheckBoxPapeis = constroiCheckBoxPapeis;
	controller.montaTipoPessoa = montaTipoPessoa;
	
	controller.papel = {};
	controller.pessoasRelacionadas = [];
	controller.pessoasRelacionadasUsuario = [];
	
	controller.pessoa = {
		identificador: '',
		tipoPessoa: 'J',
		papeis:[],
		estrangeiro: false
	};

	// Objeto utilizado para armazenar possíveis erros
	// ao concluir o cadastro da pessoa
	controller.abas = {
		documentos : { erros : [] },
		infFinanceiras : { erros : [] },
		dadosPessoais : { erros : [] },
		dadosBancarios : { erros : [] },
		filiacaoConjuge : { erros : [] },
		enderecos : { erros : [] },
		contatos : { erros : [] },
		afirmacoes : { erros : [] },
		pessoasRelacionadas : { erros : [] }
	};
	
	// Se houver abas e porque veio redirecionado do botão concluir
	if($stateParams.abas) {
		controller.abas = $stateParams.abas;
		controller.pessoa = $stateParams.pessoa;
	}
	
	if($stateParams.pessoaRelacionada){
		controller.pessoaRelacionada = $stateParams.pessoaRelacionada;
		controller.pessoa.tipoPessoa = $stateParams.tipoPessoa;
	}else{
		controller.pessoaRelacionada = false;
	}

	// I - incluir, V - Visualizar, E - Editar
	controller.acao = $stateParams.acao;
	controller.tab = $stateParams.tab;
	
	var _papeis = $stateParams._papeis; //Lista de todos os papeis da base de dados para evitar ficar buscando a todo momento.
	controller.papeis = []; //Lista de papeis que serão exibidos na tela

	var promises = []; //Todos os serviços que devem ser chamados antes de iniciar o carregamento e funcionamento da tela

	if(_papeis && _papeis.length == 0){
		promises.push($q(function (resolve) {
			papelService.findAll().success(function(papeis){
				_papeis = papeis.sort(function(papel1,papel2){
					return papel1.descricao > papel2.descricao;
				});
			}).finally(function () {
				resolve();
			});
		}));
	}

	if($stateParams.identificador) {
		promises.push($q(function (resolve) {
			pessoaService.findByIdentificador($stateParams.identificador).then(function (pessoa) {
				controller.pessoa = pessoa;
			}).finally(function () {
				resolve();
			});
		}));
	}

	if($stateParams.identificadorPai) {
		promises.push($q(function (resolve) {
			pessoaService.findByIdentificador($stateParams.identificadorPai).then(function (pessoa) {
				controller.pessoaPrincipal = pessoa;
			}).finally(function () {
				resolve();
			});
		}));
	}

	$q.all(promises).then(function () {

		controller.isCotista = controller.pessoa.papeis.some(function(papel){
			return papel.descricao == 'Cotista';
		});

		bloqueiaCampos();
		buildCheckboxPapeis();

	});

	function salvarPessoaPerfil(){
		controller.perfil = {
			pessoa: {
				id: controller.pessoa.id
			}
		};
		pessoaService.insertPessoaPerfil(controller.perfil).success(function(data){
			controller.pessoa.perfil = data;
		});
	}

	/**
	 * Constrói a exibição dos checkbox de papeis que serão exibidos na tela e já marca
	 * como selecionado os papeis que são próprias da pessoa, exceto nos casos em que os papeis
	 * pertencem a um relacionamento.
	 */
	function buildCheckboxPapeis() {
		if(controller.pessoaRelacionada) {

			if(controller.pessoa.tipoPessoa == 'J') {

				controller.papeis = angular.copy(_papeis.filter(function(papel){
					return papel.descricao == 'Sócio com poderes de representação'
						|| papel.descricao == 'Sócio sem poderes de representação'
						|| papel.descricao == 'Procurador'
						|| papel.descricao == 'Acionista'
						|| papel.descricao == 'Diretor'
						|| papel.descricao == 'Administrador'
						|| papel.descricao == 'Controladoras/Controladas/Coligadas'
						|| papel.descricao == 'Representante'
						|| papel.descricao == 'Responsável'
						|| papel.descricao == 'Cliente'
						|| papel.descricao == 'Gestor Fundo';
				}));

			} else {

				if(controller.pessoaPrincipal && controller.pessoaPrincipal.tipoPessoa == 'J'){
					controller.papeis = angular.copy(_papeis.filter(function(papel){
						controller.trocaPessoaParaRelacionar = true;
						return papel.descricao == 'Sócio com poderes de representação'
							|| papel.descricao == 'Sócio sem poderes de representação'
							|| papel.descricao == 'Procurador'
							|| papel.descricao == 'Acionista'
							|| papel.descricao == 'Diretor'
							|| papel.descricao == 'Administrador'
							|| papel.descricao == 'Representante'
							|| papel.descricao == 'Responsável';
					}));
				} else {
					controller.papeis = angular.copy(_papeis.filter(function(papel){
						return papel.descricao == 'Procurador';
					}));
				}

			}

			if(controller.pessoaPrincipal && controller.pessoaPrincipal.tipoPessoa == 'F'){
				controller.papeis = angular.copy(_papeis.filter(function(papel){
					controller.trocaPessoaParaRelacionar = true;
					return papel.descricao == 'Procurador';
				}));
			}

		} else {

			controller.papeis = angular.copy(_papeis.filter(function(papel){
				return papel.descricao == 'Cotista'
					|| papel.descricao == 'Correntista';
			}));

		}

		controller.pessoa.papeis.forEach(function(papelPessoa){
			var papel = controller.papeis.find(function(papel){
				return papel.id == papelPessoa.id;
			});
			if(papel)
				papel.checked = true;
		});
		
	}

	function incluir() {

		controller.pessoa.nomeRazao = $("input[name='nomeRazao']").val();
		
		angular.forEach(controller.papeis, function(value, key) {
			if(value.dataFimRelacionamento && value.checked){
				value.dataFimRelacionamento = moment(value.dataFimRelacionamento).format("DD/MM/YYYY");
			}
		});
		

		if(!controller.pessoa.estrangeiro){
			if(!controller.pessoa.identificador){
				if(controller.pessoa.tipoPessoa == 'F'){
					notify({message:'O campo CPF é obrigatório', classes:'alert-danger',position:'right'});
					return;
				} else {
					notify({message:'O campo CNPJ é obrigatório', classes:'alert-danger',position:'right'});
					return;
				}
			} else {
				if (controller.pessoa.tipoPessoa == 'F') {
					if (!utilsService.validarCPF(controller.pessoa.identificador.toString())) {
						notify({
							message: 'Número do documento CPF é inválido!',
							classes: 'alert-danger',
							position: 'right'
						});
						return;
					}
				} else {
					if (!utilsService.validarCNPJ(controller.pessoa.identificador.toString())) {
						notify({
							message: 'Número do documento CNPJ é inválido!',
							classes: 'alert-danger',
							position: 'right'
						});
						return;
					}
				}
			}
		}
		
		buscaPessoa().then(function(pessoa){
			if(!pessoa){
				if(!controller.pessoa.nomeRazao){
					if(controller.pessoa.tipoPessoa == 'F'){
						notify({message:'Informar o nome completo (Campo Obrigatório)!', classes:'alert-danger',position:'right'});
					} else {
						notify({message:'Informar a razão social (Campo Obrigatório)!', classes:'alert-danger',position:'right'});
					}
				} else {
					cadastrarNovaPessoa();
				}
			} else {
				notify({message:'CPF/CNPJ informado já está cadastrado', classes:'alert-success',position:'right'});
			}
		});
	}
	
	function cadastrarNovaPessoa() {
			
		controller.pessoa = {
			identificador : controller.pessoa.identificador,
			tipoPessoa : controller.pessoa.tipoPessoa,
			nomeRazao : controller.pessoa.nomeRazao,
			estrangeiro: controller.pessoa.estrangeiro
		};
		
		if(!controller.pessoaRelacionada){	
			controller.pessoa.papeis = controller.papeis.filter(function(papel){
				return papel.checked;
			});
			if(controller.pessoa.papeis.length){
				pessoaService.insertPessoa(controller.pessoa).then(function(p){
					$rootScope.historicos.push({
						fromParams:{
							identificador:p.identificador,
							tipoPessoa:p.tipoPessoa,
							papeis:[]									
						},
						from:{
							name:'root.incluir'
						}
					});
					notify({message:'Cliente cadastrado com sucesso.', classes:'alert-success',position:'right'});
					trataRetornoPessoa(p);
				});
			}else{
				notify({message:'Campo papel do cliente, se é cotista e/ou correntista, deve ser informado!', classes:'alert-danger',position:'right'});
			}
		}else{
			var papeisRelacionamento = controller.papeis.filter(function(papel){
				return papel.checked;
			});
			
			if(papeisRelacionamento.length){

				//Verifica se existe algum papel checado que está com o período de vigência do relacionamento inválido
				var hasPapelVigenciaInvalida = papeisRelacionamento.some(function (papel) {
					return !validaVigenciaRelacionamento({
						dataIniRelacionamento:papel.dataIniRelacionamento,
						dataFimRelacionamento:papel.dataFimRelacionamento
					})
				});

				if(hasPapelVigenciaInvalida){

					notify({message:'Data de vigência de relacionamento inválida', classes:'alert-danger',position:'right'});

				} else {

					pessoaService.insertPessoa(controller.pessoa).then(function(p){

						notify({message:'Cliente relacionado cadastrado com sucesso.', classes:'alert-success',position:'right'});

						trataRetornoPessoa(p);

						var pessoasRelacionadasUsuario = papeisRelacionamento.map(function(papel){
							return {
								id : {
									pessoaRelacionada : p,
									pessoa : controller.pessoaPrincipal,
									papel:papel
								},
								dataIniRelacionamento:papel.dataIniRelacionamento,
								dataFimRelacionamento:papel.dataFimRelacionamento
							};
						});

						pessoasRelacionadasUsuario.forEach(function(pessoaPapelRelacionada){
							var papel = controller.papeis.find(function(papel){
								return papel.id == pessoaPapelRelacionada.id.papel.id;
							});
							if(papel){
								papel.checked = true;
								if(!pessoaPapelRelacionada.dataIniRelacionamento)
									papel.dataIniRelacionamento = pessoaPapelRelacionada.dataCadastro;
								else
									papel.dataIniRelacionamento = pessoaPapelRelacionada.dataIniRelacionamento;
									papel.dataFimRelacionamento = pessoaPapelRelacionada.dataFimRelacionamento;
							}
						});

						pessoaService.insertPessoaRelacionada(pessoasRelacionadasUsuario).success(function(relacionamentos){

							if(relacionamentos.length == 1
									&& relacionamentos[0].id.papel.descricao =='Controladoras/Controladas/Coligadas'){
								controller.isControladoras = true;
							} else {
								controller.isControladoras = false;
							}


						}).error(function(error){
							notify({message: error, classes:'alert-danger',position:'right'});
						});

					});
				}
					
			}else{
				notify({message:'Ao menos um papel deve ser selecionado', classes:'alert-danger',position:'right'});
			}
			
		}
			
	}
	
	/**
	 * Exclui o cadastro de uma pessoa.
	 */
	function excluir(cliente) {
		
		dialogService.show('Excluir','Deseja excluir o cliente ' + $filter('cpfcnpj')(cliente.identificador) +'?','Sim','Não').result.then(function(){
			
			usSpinnerService.spin('spinner-1');
			pessoaService.excluirPessoaCliente(cliente.id).success(function(){
				notify({message:'O cliente foi excluído com sucesso!', classes:'alert-success',position:'right'});
				$state.go('cadastro-cliente');
				usSpinnerService.stop('spinner-1');
			}).error(function(msg){
				usSpinnerService.stop('spinner-1');
				notify({message:'Esse cliente possui vínculo e por isso não poderá ser excluído!', classes:'alert-danger',position:'right'});
			});
		});
		
	}
	
	/**
	 * Método utilizado para tratar um objeto pessoa do retorno do back-end.
	 */
	function trataRetornoPessoa(pessoa) {
		
		controller.pessoa = pessoa;
		controller.pessoa.identificador = angular.copy(controller.pessoa.identificador.toString());
		controller.isCotista = false;
		delete(controller.pessoa.perfil);
		
		// Verifica se a pessoa tem o papel Cotista, para ser exibido o perfil
		// investidor
		controller.pessoa.papeis.forEach(function(papel){
			if(papel.descricao == 'Cotista'){
				controller.isCotista = true;
			}
		});
		
		pessoaService.findPerfilByPessoa(controller.pessoa.id).success(function(data){
			if(!data.id){
				salvarPessoaPerfil();
			}
			
		});
		
	}
	
	/**
	 * Busca uma pessoa na base de dados, caso não exista na base de dados
	 * realiza o cadastro.
	 */
	function buscaPessoa() {
		
		return $q(function(resolve,reject){
			
			if(controller.pessoa.identificador){
				
				pessoaService.findByIdentificadorPessoa(controller.pessoa.identificador).then(function(pessoa){
					
					if(pessoa) {
						
						trataRetornoPessoa(pessoa);
						
						if(controller.pessoaRelacionada){
							
							var papeisRelacionamento = controller.papeis.filter(function(papel){
								return papel.checked;
							});
							
							//Verifica se existe algum papel checado que está com o período de vigência do relacionamento inválido
							var hasPapelVigenciaInvalida = controller.papeis.some(function (papel) {
								return !validaVigenciaRelacionamento({
									dataIniRelacionamento:papel.dataIniRelacionamento,
									dataFimRelacionamento:papel.dataFimRelacionamento
								});
							});
							
							if(!papeisRelacionamento.length && !controller.editandoRelacionado){
								notify({message:'Ao menos um papel deve ser selecionado', classes:'alert-danger',position:'right'});
								reject();
							}
							else if(hasPapelVigenciaInvalida){
								notify({message:'Data de vigência de relacionamento inválida', classes:'alert-danger',position:'right'});
								controller.pessoa = {
										identificador:pessoa.identificador,
										tipoPessoa:pessoa.tipoPessoa,
										nomeRazao:pessoa.nomeRazao
								};
								reject();
							} else {
								
								pessoaService.findByIdentificadorPessoa($stateParams.identificadorPai).then(function(p){
									
									pessoaService.findPessoasRelacionadas(p.id).success(function(pessoasRelacionadas){
										
										//Ativa as checkboxes dos papeis o qual a pessoa relacionada já tem com a
										//pessoa o qual foi relacionado.
										pessoasRelacionadas.filter(function(pessoaRelacionada){
											return pessoaRelacionada.id.pessoaRelacionada.id == pessoa.id;
										}).forEach(function(pessoaRelacionada){
											var papel = controller.papeis.find(function(papel){
												return papel.id == pessoaRelacionada.id.papel.id;
											});
											if(papel) {
												papel.checked = true;
												//Caso o relacionamento não possua data de inicio de vigência, o qual é
												//obrigatório, atribui-se a data de cadadastro
												if(!pessoaRelacionada.dataIniRelacionamento)
													papel.dataIniRelacionamento = pessoaRelacionada.dataCadastro;
												else
													papel.dataIniRelacionamento = pessoaRelacionada.dataIniRelacionamento;
													papel.dataFimRelacionamento = pessoaRelacionada.dataFimRelacionamento;
											}
										});
										
										var papeisRelacionamento = controller.papeis.filter(function(papel){
											return papel.checked;
										});
										
										var pessoasRelacionadasUsuario = papeisRelacionamento.map(function(papel){
											return {
												id : {
													pessoaRelacionada : pessoa,
													pessoa : p,
													papel:papel,
												},
												dataIniRelacionamento:papel.dataIniRelacionamento,
												dataFimRelacionamento:papel.dataFimRelacionamento
											};
										});
										
										pessoaService.insertPessoaRelacionada(pessoasRelacionadasUsuario).success(function(relacionamentos){
											
											if(relacionamentos.length == 1
													&& relacionamentos[0].id.papel.descricao =='Controladoras/Controladas/Coligadas'){
												controller.isControladoras = true;
											} else {
												controller.isControladoras = false;
											}
											
											resolve(pessoa);
											
										}).error(function(error){
											notify({message: error, classes:'alert-danger',position:'right'});
											reject();
										});
										
									}).error(function(error){
										notify({message: error, classes:'alert-danger',position:'right'});
										reject();
									});
									
								},function (error) {
									notify({message: error, classes:'alert-danger',position:'right'});
									reject();
								});
								
							}
							
						} else {
							buildCheckboxPapeis();
							resolve(pessoa);
						}
						
					} else {
						resolve();
					}
					
				});
			}else{
				notify({message: 'O identificador é obrigatório!', classes:'alert-danger',position:'right'});
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
	 * Ao alterar o papel da pessoa. Caso não exista uma pessoa proveniente da
	 * base de dados, esse método não tem nenhum efeito.
	 */
	function changePapel(descricao) {
		
		if(controller.pessoa.id) {
			
			if(controller.pessoa.ativo == null){
				controller.pessoa.ativo = 1;
			}
			
			controller.papeis.filter(function(papel){
				
				if(descricao === papel.descricao){
					 if(papel.checked){
							controller.pessoa.papeis.push(papel);
						} else {
							for (var i = 0; i < controller.pessoa.papeis.length; ++i) {
								  if(descricao === controller.pessoa.papeis[i].descricao){
									  controller.pessoa.papeis.splice(i,1);
									  break;
								  }
							}
					}
				}
						
				return papel.checked;
			});
			
			var papelCliente = false;
			for (var i = 0; i < controller.pessoa.papeis.length; ++i) {
				
				if(controller.pessoa.papeis[i].tipoCadastro.toUpperCase() == 'CLIENTE'){
					papelCliente = true;
					break;
				} else {
					papelCliente = false;
				}
				
			}
			
			if(controller.pessoa.papeis.length && papelCliente){
				pessoaService.insertPessoa(controller.pessoa).then(trataRetornoPessoa);			
			}else{
				notify({message:'Campo papel do cliente, se é cotista e/ou correntista, deve ser informado!', classes:'alert-danger',position:'right'});
			}
		}
	}

	/**
	 * Atualiza o nome da pessoa, na tela de edição
	 * ou quando está na tela de inclusão e uma pessoa foi
	 * carregada.
	 */
	function atualizaNomeRazao() {

		//Se a pessoa possuir nome ou razão social, salva os dados
		if(controller.pessoa.nomeRazao) {
			pessoaService.insertPessoa(controller.pessoa).then(trataRetornoPessoa);
		} else {
			return;
		}

	}
	
	/**
	 * Ao alterar entre cpf/cnpj limpa o objeto pessoa.
	 */
	function limparPessoa(tipo){
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
		$state.go("root.visualizar", {'identificador':controller.pessoa.identificador, 'acao':'E', 'tab': controller.tab}, {reload: true});
	}
	
	/**
	 * Conclui o cadastro da pessoa.
	 */
	function concluir(){
		
		pessoaService.validarCadastro($scope.pessoaCtrl.pessoa).then(function(abas){
			usSpinnerService.spin('spinner-1');
			pessoaService.concluir($scope.pessoaCtrl.pessoa.id).success(function(){
				notify({message:'O cadastro do cliente foi concluído com sucesso!', classes:'alert-success',position:'right'});
				$scope.pessoaCtrl.pessoa.statusCadastro = "Concluído";
				$state.go('root.incluir',{tab:controller.tab,pessoa:$scope.pessoaCtrl.pessoa,abas:abas, identificador: $scope.pessoaCtrl.pessoa.identificador},{reload:true});
			}).error(function(msg){
				notify({message:"Ocorreu uma falha na integração com o sistema Matera!", classes:'alert-danger',position:'right'});
			}).finally(function () {
				usSpinnerService.stop('spinner-1');
		      });
		},function(abas){
			notify({message:'Não foi possível concluir o cadastro, verifique os erros', classes:'alert-danger',position:'right'});
			$state.go('root.incluir',{tab:controller.tab,pessoa:$scope.pessoaCtrl.pessoa,abas:abas, identificador: $scope.pessoaCtrl.pessoa.identificador},{reload:true});
		});
		
	}
	
	function gerarPdf(){
		pessoaService.gerarPdf($scope.pessoaCtrl.pessoa).success(function(data){
			var file = new Blob([data], {type: 'application/pdf'});
		    var fileURL = URL.createObjectURL(file);
		    window.open(fileURL,'_blank').print();
		});
	}
	
	function aoClicarCPF() {
		
		controller.pessoa.tipoPessoa = 'F'; 
		controller.pessoa.identificador = '';
		controller.pessoa.nomeRazao = '';
		controller.pessoa.estrangeiro = false;

		bloqueiaCampos();
		buildCheckboxPapeis();

		$timeout(function(){
			angular.element('#cpf').focus();			
		});
	}
	
	function aoClicarCNPJ() {	

		controller.pessoa.tipoPessoa = 'J'; 
		controller.pessoa.identificador = '';
		controller.pessoa.nomeRazao = '';
		controller.pessoa.estrangeiro = false;

		bloqueiaCampos();
		buildCheckboxPapeis();

		$timeout(function(){
			angular.element('#cnpj').focus();			
		});
	}

	function aoClicarClienteEstrangeiro() {

		controller.pessoa.tipoPessoa = 'F';
		controller.pessoa.identificador = '';
		controller.pessoa.nomeRazao = '';
		buildCheckboxPapeis();

		$timeout(function () {
			angular.element('#estrangeiro').focus();
		});

	}
	
	function constroiCheckBoxPapeis(){
		buildCheckboxPapeis();
	}

	
	/**
	 * Adiciona um novo relacionamento de papel para
	 * a pessoa o qual está sendo relacionado.
	 *
	 * @param papel o papel que será incluído
	 */
	function incluirRelacao(papel) {

		//Inicializa a data de inicio de relacionamento do papel com a data atual
		papel.dataIniRelacionamento = moment().format('DD/MM/YYYY');

		if(controller.pessoa.id) {

			pessoaService.insertPessoaRelacionada([{
				id:{
					pessoa:controller.pessoaPrincipal,
					pessoaRelacionada:controller.pessoa,
					papel:papel
				},
				dataIniRelacionamento:papel.dataIniRelacionamento,
				dataFimRelacionamento:papel.dataFimRelacionamento
			}]).success(function(relacionamentos){

				if(relacionamentos.length == 1
						&& relacionamentos[0].id.papel.descricao =='Controladoras/Controladas/Coligadas'){
					controller.isControladoras = true;
				} else {
					controller.isControladoras = false;
				}


			}).error(function(error){
				notify({message: error, classes:'alert-danger',position:'right'});
			});

		}

	}

	/**
	 * Atualiza os dados de um relacionamento
	 * através de um papel entre duas pessoas.
	 *
	 * @param papel o papel o qual sofreu alteração
	 * @param index a posição do papel na lista na tela
	 */
	function atualizaRelacao(papel,index) {

		controller.formPapel['dataFimRelacionamento' + index].$setValidity('periodo-valido',true);

		if(papel.dataFimRelacionamento) {

			var isVigenciaValida = validaVigenciaRelacionamento({
				dataIniRelacionamento: papel.dataIniRelacionamento,
				dataFimRelacionamento: papel.dataFimRelacionamento
			});

			if (!isVigenciaValida) {
				controller.formPapel['dataFimRelacionamento' + index].$setValidity('periodo-valido', false);
				return;
			}

		}

		pessoaService.findPessoasRelacionadas(controller.pessoaPrincipal.id).success(function (pessoasRelacionadas) {

			var relacionamento = pessoasRelacionadas.find(function (pessoaRelacionada) {
				return pessoaRelacionada.id.pessoaRelacionada.id == controller.pessoa.id
					&& pessoaRelacionada.id.papel.id == papel.id;
			});

			if(relacionamento) {

				relacionamento.dataIniRelacionamento = papel.dataIniRelacionamento;
				relacionamento.dataFimRelacionamento = papel.dataFimRelacionamento;

				pessoaService.insertPessoaRelacionada([relacionamento]).then(function(response){
					if(response && response.data && response.data.length == 1){
						papel.dataFimRelacionamento = response.data[0].dataFimRelacionamento;
					}
				});

			}

		});



	}


	/**
	 * Valida o periodo de datas do papel que será utilizado no relacionamento
	 * @param papel o papel com as informações de início e fim de relacionamento
	 * @return true se válido, false se inválido
	 */
	function validaVigenciaRelacionamento(relacionamento) {

		//Verifica se o período é válido
		var dataInicioRelacionamento,
			dataFimRelacionamento;

		if(typeof relacionamento.dataIniRelacionamento == 'string')
			dataInicioRelacionamento = moment(relacionamento.dataIniRelacionamento,'DD/MM/YYYY');
		else
			dataInicioRelacionamento = moment(relacionamento.dataIniRelacionamento);

		if(typeof relacionamento.dataFimRelacionamento == 'string')
			dataFimRelacionamento = moment(relacionamento.dataFimRelacionamento,'DD/MM/YYYY');
		else
			dataFimRelacionamento = moment(relacionamento.dataFimRelacionamento);

		if( dataInicioRelacionamento.isAfter(dataFimRelacionamento) ) {
			return false;
		}

		return true;

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
	
	function montaTipoPessoa(){
		if(controller.pessoa.tipo){
			var papeis = controller.pessoa.tipo.split("/");
		
			if(controller.pessoaRelacionada){
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
				controller.pessoa.tipo = papeis.map(function(papel){
					return papel;
				}).join('/');
			});
		}
	}
	
}