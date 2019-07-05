angular.module('cadastro-central-module').controller('TermoCtrl', TermoCtrl);

TermoCtrl.$inject = [ 'usSpinnerService', '$stateParams', 'tipoTermoService',
		'tagsTermoService', '$timeout', '$modalInstance', '$modal',
		'fundoTermoService', 'notify', '$scope' ];

function TermoCtrl(usSpinnerService, $stateParams, tipoTermoService,
		tagsTermoService, $timeout, $modalInstance, $modal, fundoTermoService,
		notify, $scope) {

	var controller = this;

	var ID_CONTRATO_MAE = 10;
	var COM_DIREITO_REGRESSO = 11;
	var SEM_DIREITO_REGRESSO = 12;
	var COM_RESPONSAVEL_SOLIDARIO = 13;
	var SEM_RESPONSAVEL_SOLIDARIO = 14;
	var IDS_RELACIONADADOS_CONTRATO_MAE = [ COM_DIREITO_REGRESSO,
			SEM_DIREITO_REGRESSO, COM_RESPONSAVEL_SOLIDARIO,
			SEM_RESPONSAVEL_SOLIDARIO ];

	/**
	 * O termo que será realizado manutenção na tela.
	 */
	controller.termo = {
		caracteristicas : [],
		pessoaFundo : {
			id : $scope.fundoCtrl.pessoaFundo.id
		}
	};

	/**
	 * As opções que estarão disponíveis para serem atribuídas ao termo.
	 */
	controller.caracteristicas = [];

	/**
	 * A tag selecionada em uma das combos de tags.
	 */
	controller.tagSelecionada = null;

	controller.showTemplateOnly = $stateParams.showTemplateOnly;

	tipoTermoService.findAll().then(function(response) {
		controller.caracteristicas = response.data;
		sortCaracteristicas(controller.caracteristicas);
	});

	$timeout(function() {

		controller.editor = ace.edit("template");
		controller.editor.getSession().on('change', function(e) {
			$timeout(function() {
				controller.termo.dsTextoTermo = controller.editor.getValue();
			});
		});
		controller.editor.setShowPrintMargin(false);
		controller.editor.getSession().setUseWrapMode(true);
		controller.editor.renderer.setShowGutter(false);

		if (controller.showTemplateOnly) {
			controller.editor.setReadOnly(true);
		}

		if ($stateParams.idPessoaFundoTermo) {
			fundoTermoService.findById($stateParams.idPessoaFundoTermo).then(
					function(response) {
						inicializaTelaComTermoExistente(response.data);
						controller.nmTermo = response.data.nmTermo;
					});
		}

	});

	/**
	 * Onde será armazenado as características do tipo unico, caso o usuário
	 * adicione uma caracteristica desse tipo ao termo.
	 */
	controller.caracteristicasOcultadas = [];

	/**
	 * Característica selecionada para se adicionar ao termo.
	 */
	controller.caracteristicaParaAdicionar = null;

	/**
	 * Característica selecionada para se remover do termo.
	 */
	controller.caracteristicaParaRemover = null;

	controller.adicionarCaracteristica = adicionarCaracteristica;
	controller.removerCaracteristica = removerCaracteristica;
	controller.adicionarTagAoTemplateTermo = adicionarTagAoTemplateTermo;
	controller.close = close;
	controller.abrirModalCopiarTermo = abrirModalCopiarTermo;
	controller.validarESalvar = validarESalvar;
	controller.gerarPdf = gerarPdf;

	/**
	 * Adiciona a característica selecionada ao termo.
	 */
	function adicionarCaracteristica() {

		angular.element(document.querySelector('#rightfocusout')).blur();

		if (controller.caracteristicaParaAdicionar) {

			controller.termo.caracteristicas
					.push(controller.caracteristicaParaAdicionar);

			sortCaracteristicas(controller.termo.caracteristicas);

			controller.caracteristicas
					.splice(
							controller.caracteristicas
									.findIndex(function(caracteristica) {
										return caracteristica.idTipoTermo == controller.caracteristicaParaAdicionar.idTipoTermo;
									}), 1);

			filtroTermos();

			controller.caracteristicaParaAdicionar = null;

			carregaTags();

		}

	}

	/**
	 * Remove uma característica do termo.
	 */
	function removerCaracteristica() {

		angular.element(document.querySelector('#leftfocusout')).blur();

		if (controller.caracteristicaParaRemover) {

			controller.termo.caracteristicas
					.splice(
							controller.termo.caracteristicas
									.findIndex(function(caracteristica) {
										return caracteristica.idTipoTermo == controller.caracteristicaParaRemover.idTipoTermo;
									}), 1);

			if (controller.caracteristicaParaRemover
					&& ID_CONTRATO_MAE == controller.caracteristicaParaRemover.idTipoTermo) {
				controller.caracteristicasOcultadas.forEach(function(item) {
					if (IDS_RELACIONADADOS_CONTRATO_MAE
							.indexOf(item.idTipoTermo) < 0) {
						pushIfNotExists(controller.caracteristicas, item);
					}
				});
			} else if (controller.caracteristicaParaRemover
					&& IDS_RELACIONADADOS_CONTRATO_MAE
							.indexOf(controller.caracteristicaParaRemover.idTipoTermo) >= 0) {
				filtraSubItensContratoMae('caracteristicaParaRemover');

				controller.caracteristicasOcultadas
						.forEach(function(item) {
							if (item.idTipoTermo === controller.currentIdTipoTermoCaracteristica) {
								controller.caracteristicas.push(item);
							}
						});

			}

			/**
			 * Se a característica for do tipo única deve-se exibir as
			 * características que foram ocultadas previamente.
			 */
			else if (controller.caracteristicaParaRemover
					&& controller.caracteristicaParaRemover.inUnico) {
				exibeCaracteristicasOcultadas();
			}

			controller.caracteristicas
					.push(controller.caracteristicaParaRemover);

			sortCaracteristicas(controller.caracteristicas);

			controller.caracteristicaParaRemover = null;

			carregaTags();

		}

	}

	function pushIfNotExists(list, itemToAdd) {
		var alreadyExists = false;
		list.forEach(function(currentCaracteristica) {
			if (currentCaracteristica.idTipoTermo === itemToAdd.idTipoTermo) {
				alreadyExists = true;
			}

		});

		if (!alreadyExists) {
			list.push(itemToAdd);
		}
	}

	function getConditionContratoMae() {
		return (IDS_RELACIONADADOS_CONTRATO_MAE
				.indexOf(controller.currentCaracteristica.idTipoTermo) < 0)
				&& controller.currentCaracteristica.idTipoTermo != ID_CONTRATO_MAE;
	}

	function getConditionItensRelacionadosMae() {
		return (IDS_RELACIONADADOS_CONTRATO_MAE
				.indexOf(controller.currentCaracteristica.idTipoTermo) >= 0);
	}

	function getConditionCaracteristicaUnica() {
		return controller.currentCaracteristica.inUnico;
	}

	function getConditionCaracteristicaByIdTipoTermo() {
		return controller.currentCaracteristica.idTipoTermo === controller.currentIdTipoTermoCaracteristica;
	}

	function filtraSubItensContratoMae(currentCaracteristica) {
		controller.currentIdTipoTermoCaracteristica = null;
		if (controller[currentCaracteristica].idTipoTermo === SEM_DIREITO_REGRESSO) {
			controller.currentIdTipoTermoCaracteristica = COM_DIREITO_REGRESSO;
		}
		if (controller[currentCaracteristica].idTipoTermo === COM_DIREITO_REGRESSO) {
			controller.currentIdTipoTermoCaracteristica = SEM_DIREITO_REGRESSO;
		}

		if (controller[currentCaracteristica].idTipoTermo === COM_RESPONSAVEL_SOLIDARIO) {
			controller.currentIdTipoTermoCaracteristica = SEM_RESPONSAVEL_SOLIDARIO;
		}
		if (controller[currentCaracteristica].idTipoTermo === SEM_RESPONSAVEL_SOLIDARIO) {
			controller.currentIdTipoTermoCaracteristica = COM_RESPONSAVEL_SOLIDARIO;
		}
		if (currentCaracteristica === 'caracteristicaParaAdicionar') {
			ocultaCaracteristicasSelecionar(getConditionCaracteristicaByIdTipoTermo);
		}
	}

	/**
	 * Recebe uma function que DEVE retornar um boolean, baseado na sua condição
	 * de visibilidade (Somente itens "a selecionar")
	 */
	function ocultaCaracteristicasSelecionar(condition) {

		controller.caracteristicas = controller.caracteristicas
				.filter(function(caracteristica) {
					controller.currentCaracteristica = caracteristica;
					if (condition()) {
						pushIfNotExists(controller.caracteristicasOcultadas,
								caracteristica);
					}
					return (!condition());
				});
	}

	/**
	 * Recebe uma function que DEVE retornar um boolean, baseado na sua condição
	 * de visibilidade (Somente itens já selecionados)
	 */
	function ocultaCaracteristicasSelecionados(condition) {

		controller.termo.caracteristicas = controller.termo.caracteristicas
				.filter(function(caracteristica) {
					controller.currentCaracteristica = caracteristica;
					if (condition()) {
						var alreadyExists = false;
						pushIfNotExists(controller.caracteristicasOcultadas,
								caracteristica);
					}
					return (!condition());
				});
	}

	/**
	 * Exibe as características ocultadas anteriormente.
	 */
	function exibeCaracteristicasOcultadas() {

		controller.caracteristicas = controller.caracteristicas
				.concat(controller.caracteristicasOcultadas);
		controller.caracteristicasOcultadas = [];

	}

	function sortCaracteristicas(caracteristicas) {

		caracteristicas
				.sort(function(caracteristica1, caracteristica2) {
					if (caracteristica1.nmTipoTermo > caracteristica2.nmTipoTermo) {
						return 1;
					} else if (caracteristica1.nmTipoTermo == caracteristica2.nmTipoTermo) {
						return 0;
					} else {
						return -1;
					}
				});

	}

	function adicionarTagAoTemplateTermo() {
		if (controller.tagSelecionada.repete) {
			var tagSemNumero = controller.tagSelecionada.view.slice(0,
					controller.tagSelecionada.view.length - 1);

			var findTagRegex = new RegExp('\\' + tagSemNumero, 'mg');

			tagsJaAdicionadas = [];
			var current = null;
			while ((current = findTagRegex.exec(controller.editor.getValue())) !== null) {
				tagsJaAdicionadas.push(current);
			}

			var numero = '';
			if (tagsJaAdicionadas.length > 0) {
				numero = tagsJaAdicionadas.length;
			}

			tagNumeroInserido = tagSemNumero + numero + "}"
			controller.editor.insert(tagNumeroInserido);
		} else {
			controller.editor.insert(controller.tagSelecionada.view);
		}
		controller.tagSelecionada = null;
		carregaTags();
	}

	/**
	 * Fecha essa modal.
	 */
	function close() {
		$modalInstance.dismiss();
	}

	/**
	 * Abre a modal de cópia de termos.
	 */
	function abrirModalCopiarTermo() {

		$modal.open({
			size : 'lg',
			backdrop : 'static',
			animation : true,
			templateUrl : 'app/views/fundo/modal-copiar-termo.html',
			controller : 'CopiarTermoCtrl',
			controllerAs : 'copiarTermoCtrl'
		}).result.then(function(termo) {

			delete termo.idPessoaFundoTermo;
			termo.pessoaFundo.id = $scope.fundoCtrl.pessoaFundo.id;

			inicializaTelaComTermoExistente(termo);

		}, function() {
		});

	}

	/**
	 * Chama o serviço para salvar os dados do termo.
	 */
	function validarESalvar() {

		fundoTermoService.validar(controller.termo).then(function(response) {

			if (response.data) {

				notify({
					message : response.data,
					classes : 'alert-danger',
					position : 'right'
				});

			} else {

				salvar();

			}

		});

	}

	function salvar() {

		controller.termo.dsTextoTermo = controller.editor.getValue();

		if (controller.termo.idPessoaFundoTermo) {

			fundoTermoService.atualizar(controller.termo).then(function() {
				notify({
					message : 'O termo foi atualizado com sucesso!',
					classes : 'alert-success',
					position : 'right'
				});
				$scope.$broadcast('refreshDataTable');
				$modalInstance.close();

			});

		} else {

			fundoTermoService.cadastrar(controller.termo).then(function() {
				notify({
					message : 'O termo foi cadastrado com sucesso!',
					classes : 'alert-success',
					position : 'right'
				});
				$modalInstance.close();
			});

		}

	}

	/**
	 * Carrega os inputs da tela com um termo existente.
	 */
	function inicializaTelaComTermoExistente(termo) {

		controller.caracteristicaParaAdicionar = null;
		controller.caracteristicaParaRemover = null;

		controller.termo = termo;

		controller.editor.setValue(controller.termo.dsTextoTermo, 1);

		sortCaracteristicas(controller.termo.caracteristicas);

		tipoTermoService
				.findAll()
				.then(
						function(response) {

							controller.caracteristicas = response.data;

							sortCaracteristicas(controller.caracteristicas);

							controller.termo.caracteristicas
									.forEach(function(caracteristicaDoTermo) {

										controller.caracteristicas
												.splice(
														controller.caracteristicas
																.findIndex(function(
																		caracteristica) {
																	return caracteristica.idTipoTermo == caracteristicaDoTermo.idTipoTermo;
																}), 1);

									});
							filtroTermos();
							carregaTags();

						});

	}

	function filtroTermos() {
		/**
		 * Contrato mãe, temos que ter apenas as seguintes opções ainda
		 * selecionáveis:
		 * 
		 * -Com Direito de Regresso -Sem Direito de Regresso -Com Responsável
		 * Solidário -Sem Responsável Solidário
		 */
		if (controller.caracteristicaParaAdicionar
				&& controller.caracteristicaParaAdicionar.idTipoTermo == ID_CONTRATO_MAE) {
			ocultaCaracteristicasSelecionados(getConditionContratoMae);
			ocultaCaracteristicasSelecionar(getConditionContratoMae);
		} else if (controller.caracteristicaParaAdicionar
				&& IDS_RELACIONADADOS_CONTRATO_MAE
						.indexOf(controller.caracteristicaParaAdicionar.idTipoTermo) >= 0) {
			filtraSubItensContratoMae('caracteristicaParaAdicionar');
		}
		/**
		 * 
		 * Se a característica selecionada for do tipo única,
		 * 
		 * todas as características do tipo única disponíveis devem
		 * 
		 * ser eliminadas das opções.
		 * 
		 */

		else if (controller.caracteristicaParaAdicionar
				&& controller.caracteristicaParaAdicionar.inUnico) {
			ocultaCaracteristicasSelecionados(getConditionItensRelacionadosMae);
			ocultaCaracteristicasSelecionar(getConditionItensRelacionadosMae);
			ocultaCaracteristicasSelecionar(getConditionCaracteristicaUnica);
		}
	}

	function carregaTags() {

		controller.tagSelecionada = null;

		controller.tagsTermo = [];
		controller.tagsIntervenientes = [];
		controller.tagsResponsavelSolidario = [];
		controller.tagsRepresentanteLegal = [];
		controller.tagsContrato = [];
		controller.tagsCedente = [];
		controller.tagsFundo = [];
		controller.tagsAdministrador = [];
		controller.tagsCessao = [];
		controller.tagsGestor = [];
		controller.tagsSacado = [];

		if (controller.termo.caracteristicas.length) {
			carregaTagsTermo();
			carregaTagsIntervenientes();
			carregaTagsResponsavelSolidario();
			carregaTagsContrato();
			carregaTagsRepresentanteLegal();
			carregaTagsCedente();
			carregaTagsFundo();
			carregaTagsAdminsitrador();
			carregaTagsConsultora();
			carregaTagsTestemunha();
			carregaTagsCessao();
			carregaTagsGestor();
			carregaTagsSacado();
		}

	}

	function carregaTagsTermo() {

		tagsTermoService
				.findAllTermo()
				.then(
						function(response) {

							controller.tagsTermo = response.data;

							controller.tagsTermo = controller.tagsTermo
									.filter(function(tagTermo) {

										return controller.termo.caracteristicas
												.some(function(caracteristica) {

													return tagTermo.tipos
															.some(function(tipo) {
																return tipo == caracteristica.nmTipoTermo;
															});

												});

									});

						});

	}

	function carregaTagsIntervenientes() {

		tagsTermoService
				.findAllIntervenientes()
				.then(
						function(response) {

							controller.tagsIntervenientes = response.data;

							controller.tagsIntervenientes = controller.tagsIntervenientes
									.filter(function(tagInterveniente) {

										return controller.termo.caracteristicas
												.some(function(caracteristica) {

													return tagInterveniente.tipos
															.some(function(tipo) {
																return tipo == caracteristica.nmTipoTermo;
															});

												});

									});

						});

	}

	function carregaTagsResponsavelSolidario() {

		tagsTermoService
				.findAllResponsavelSolidario()
				.then(
						function(response) {

							controller.tagsResponsavelSolidario = response.data;

							controller.tagsResponsavelSolidario = controller.tagsResponsavelSolidario
									.filter(function(tagResponsavelSolidario) {

										return controller.termo.caracteristicas
												.some(function(caracteristica) {

													return tagResponsavelSolidario.tipos
															.some(function(tipo) {
																return tipo == caracteristica.nmTipoTermo;
															});

												});

									});

						});

	}

	function carregaTagsRepresentanteLegal() {

		tagsTermoService
				.findAllRepresentanteLegal()
				.then(
						function(response) {

							controller.tagsRepresentanteLegal = response.data;

							controller.tagsRepresentanteLegal = controller.tagsRepresentanteLegal
									.filter(function(tagRepresentanteLegal) {

										return controller.termo.caracteristicas
												.some(function(caracteristica) {

													return tagRepresentanteLegal.tipos
															.some(function(tipo) {
																return tipo == caracteristica.nmTipoTermo;
															});

												});

									});

						});

	}

	function carregaTagsContrato() {
		tagsTermoService
				.findAllContrato()
				.then(
						function(response) {

							controller.tagsContrato = response.data;

							controller.tagsContrato = controller.tagsContrato
									.filter(function(tagContrato) {

										return controller.termo.caracteristicas
												.some(function(caracteristica) {

													return tagContrato.tipos
															.some(function(tipo) {
																return tipo == caracteristica.nmTipoTermo;
															});

												});

									});

						});
	}

	function carregaTagsCedente() {

		tagsTermoService
				.findAllCedente()
				.then(
						function(response) {

							controller.tagsCedente = response.data;

							controller.tagsCedente = controller.tagsCedente
									.filter(function(tagCedente) {

										return controller.termo.caracteristicas
												.some(function(caracteristica) {

													return tagCedente.tipos
															.some(function(tipo) {
																return tipo == caracteristica.nmTipoTermo;
															});

												});

									});

						});

	}

	function carregaTagsFundo() {

		tagsTermoService
				.findAllFundo()
				.then(
						function(response) {

							controller.tagsFundo = response.data;

							controller.tagsFundo = controller.tagsFundo
									.filter(function(tagFundo) {

										return controller.termo.caracteristicas
												.some(function(caracteristica) {

													return tagFundo.tipos
															.some(function(tipo) {
																return tipo == caracteristica.nmTipoTermo;
															});

												});

									});

						});

	}

	function carregaTagsAdminsitrador() {

		tagsTermoService
				.findAllAdministrador()
				.then(
						function(response) {

							controller.tagsAdministrador = response.data;

							controller.tagsAdministrador = controller.tagsAdministrador
									.filter(function(tagAdministrador) {

										return controller.termo.caracteristicas
												.some(function(caracteristica) {

													return tagAdministrador.tipos
															.some(function(tipo) {
																return tipo == caracteristica.nmTipoTermo;
															});

												});

									});

						});

	}

	function carregaTagsConsultora() {

		tagsTermoService
				.findAllConsultora()
				.then(
						function(response) {

							controller.tagsConsultora = response.data;

							controller.tagsConsultora = controller.tagsConsultora
									.filter(function(tagConsultora) {

										return controller.termo.caracteristicas
												.some(function(caracteristica) {

													return tagConsultora.tipos
															.some(function(tipo) {
																return tipo == caracteristica.nmTipoTermo;
															});

												});

									});

						});

	}

	function carregaTagsTestemunha() {

		tagsTermoService
				.findAllTestemunha()
				.then(
						function(response) {

							controller.tagsTestemunha = response.data;

							controller.tagsTestemunha = controller.tagsTestemunha
									.filter(function(tagTestemunha) {

										return controller.termo.caracteristicas
												.some(function(caracteristica) {

													return tagTestemunha.tipos
															.some(function(tipo) {
																return tipo == caracteristica.nmTipoTermo;
															});

												});

									});

						});

	}

	function carregaTagsCessao() {

		tagsTermoService
				.findAllCessao()
				.then(
						function(response) {

							controller.tagsCessao = response.data;

							controller.tagsCessao = controller.tagsCessao
									.filter(function(tagCessao) {

										return controller.termo.caracteristicas
												.some(function(caracteristica) {

													return tagCessao.tipos
															.some(function(tipo) {
																return tipo == caracteristica.nmTipoTermo;
															});

												});

									});

						});

	}

	function carregaTagsGestor() {

		tagsTermoService
				.findAllGestor()
				.then(
						function(response) {

							controller.tagsGestor = response.data;

							controller.tagsGestor = controller.tagsGestor
									.filter(function(tagGestor) {

										return controller.termo.caracteristicas
												.some(function(caracteristica) {

													return tagGestor.tipos
															.some(function(tipo) {
																return tipo == caracteristica.nmTipoTermo;
															});

												});

									});

						});

	}

	function carregaTagsSacado() {

		tagsTermoService
				.findAllSacado()
				.then(
						function(response) {

							controller.tagsSacado = response.data;

							controller.tagsSacado = controller.tagsSacado
									.filter(function(tagSacado) {

										return controller.termo.caracteristicas
												.some(function(caracteristica) {

													return tagSacado.tipos
															.some(function(tipo) {
																return tipo == caracteristica.nmTipoTermo;
															});

												});

									});

						});

	}

	function gerarPdf() {
		usSpinnerService.spin('spinner-1');
		fundoTermoService.gerarPdf(controller.termo).success(function(data) {
			var file = new Blob([ data ], {
				type : 'application/pdf'
			});
			var fileURL = URL.createObjectURL(file);
			usSpinnerService.stop('spinner-1');
			window.open(fileURL, '_blank');
		});
	}

}
