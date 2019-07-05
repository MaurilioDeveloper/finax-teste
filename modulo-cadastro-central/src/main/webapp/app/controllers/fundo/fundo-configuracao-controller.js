angular.module('cadastro-central-module').controller('ConfiguracaoFundosCtrl', ConfiguracaoFundosCtrl);

ConfiguracaoFundosCtrl.$inject = ['$modal', '$http','$scope','$stateParams','$timeout','$filter','$q','$state','notify','usSpinnerService','pessoaService','fundoService','utilsService','papelService','dialogService','$rootScope', 'configuracaoFundosService', 'bancoService', 'fundoParametroService', 'PATHCONFIG', 'usuarioService'];

function ConfiguracaoFundosCtrl($modal, $http, $scope,$stateParams,$timeout,$filter,$q,$state,notify,usSpinnerService,pessoaService,fundoService,utilsService,papelService,dialogService,$rootScope,configuracaoFundosService, bancoService, fundoParametroService, PATHCONFIG, usuarioService) {

	
	var controller = this;
	controller.salvar = salvar;
	controller.validarHoraMin = validarHoraMin;
	controller.habilitarBtnIncluir = habilitarBtnIncluir;
	controller.salvarTiposTitulo = salvarTiposTitulo;
	controller.deleteTiposTitulo = deleteTiposTitulo;
	controller.validarDiasLimitesPddRj = validarDiasLimitesPddRj;
	controller.usuarioLogado = 'PETRA';
	controller.parametros = {};
	controller.regrasFundo = '';
	controller.selecionaRegra = selecionaRegra;
	controller.adicionar = adicionar;
	controller.removerRegra = removerRegra;
	controller.habilitaIncluir = habilitaIncluir;
	controller.cancel = cancel;
	controller.url_caRest = PATHCONFIG.CONTROLE_ACESSO;
	controller.restUrl = PATHCONFIG.PORTAL_API_FUNDO_PARAMETRO;
	controller.acao = 'I';
	_getUserLogado();
	//Carrega todas as regras write-off
	carregaRegras();
	//Carrega todas as regras write-off relacionadas com fundo
	carregaRegrasDoFundo();
	
	controller.pessoaFundoConfig = {
		tpCendenteOperante : '',
		inAtuaAcruoAposVenc: 0
	};
	controller.pessoaFundo={};
	controller.pessoaFundoConfSelecionado={};
	
	controller.tiposTituloFundo=[];
	
	controller.disable = true;
	
	$scope.currentState = null;

	$scope.tiposTitulo = [];
	$scope.tiposTituloAssociados = [];
	
	$scope.blockLoad = true;
	
	//perfil
	$scope.perfil = null;
	$scope.funcionalidades = null;
	$scope.modulos = null;
	
	//arrays dos usuarios selecionados
	$scope.tiposTituloToLink = [];
	$scope.tiposTituloToUnlink = [];
	  
	$scope.data = {
		isSearching : false ,
	    isAllSelected : false ,
	    isAllTiposTituloSelected : false ,
	    isAllTiposTituloSelectedLink : false ,
	    allFuncionalidadeSelected : false,
	    filtro : null ,
	    filtroUsuario : null,
	    modalState : null
	};
	
	
    controller.listaMetodologiaPDD = [{nome:'FINAXIS', id: '0'},{nome:'OCORRÊNCIAS', id: '1'}]
    
	consultarPessoaFundo();
	listarTiposTitulo();
	carregarBancos();
	
	function consultarPessoaFundo(){
		usSpinnerService.spin('spinner-1');
		fundoService.findPessoaFundoByIdentificador($stateParams.identificador).then(function (response) {
			controller.pessoaFundoConfig.pessoaFundo = response.data;
			controller.pessoaFundo =  response.data;
			consultarPessoaFundoConfig();
		}).finally(function () {
			usSpinnerService.stop('spinner-1');
	    });
		$scope.blockLoad = false;
	}
	
	function listarTiposTitulo(){
		configuracaoFundosService.listarTiposTitulo().then(function (response) {
			 $scope.tiposTitulo = response.data;
		});
	}
	
	function listarTiposTituloAssociados(){
		configuracaoFundosService.findByIdPessoaFundoConf(controller.pessoaFundoConfig.id).then(function (response) {
			$scope.tiposTituloAssociados = response.data;
			removeUsuariosAssociadosDaLista();
		});
	}
	
	function consultarPessoaFundoConfig() {
		configuracaoFundosService.consultarPessoaFundoConfig(controller.pessoaFundoConfig.pessoaFundo.id).success(function(pessoaFundoConfig){
			if (pessoaFundoConfig != "") {
				corrirPontuacaoHR(pessoaFundoConfig);
				controller.pessoaFundoConfig = pessoaFundoConfig;
				if (!controller.pessoaFundoConfig.metodologiaPDD) controller.pessoaFundoConfig.metodologiaPDD = '0'
				if (!controller.pessoaFundoConfig.recompraOcorrencia) controller.pessoaFundoConfig.recompraOcorrencia = '0'
				if (!controller.pessoaFundoConfig.inTermoUnificado) controller.pessoaFundoConfig.inTermoUnificado = '0';
				if (!controller.pessoaFundoConfig.inRelatRetornoLiquidacao) controller.pessoaFundoConfig.inRelatRetornoLiquidacao = '0';
				controller.pessoaFundoConfig.tpCendenteOperante = pessoaFundoConfig.tpCendenteOperante ? pessoaFundoConfig.tpCendenteOperante : '';
				controller.pessoaFundoConfig.pessoaFundo = controller.pessoaFundo;
				listarTiposTituloAssociados();
			}
		});
	}
	
	function removeUsuariosAssociadosDaLista() {
		for (var i = 0; i < $scope.tiposTitulo.length; ++i) {
			for (var j = 0; j < $scope.tiposTituloAssociados.length; ++j) {
				if ($scope.tiposTitulo[i].tpTitulo.trim() == $scope.tiposTituloAssociados[j].id.tpTitulo
						.trim()) {
					$scope.tiposTitulo.splice(i, 1);
					i = i - 1;
					break;
				}
			}
		}
		angular.element(document.getElementById("tpTitulo"))[0].options[0].selected = true;
	}
	
	controller.changeAceiteAcruo = () => {
		controller.pessoaFundoConfig.nrPrazoDiasAcruoAposVenc = 0;
	}
	
	function salvar() {
		$timeout(function(){
			console.log('Salvando....');
			var obj = angular.copy(controller.pessoaFundoConfig);
			configuracaoFundosService.inserirPessoaFundoConfig(obj)
				.success(function(pessoaFundoConfig){
					
					controller.pessoaFundoConfig.pessoaFundo.id = pessoaFundoConfig.pessoaFundo.id; 
					corrirPontuacaoHR(pessoaFundoConfig);
					$scope.fundoCtrl.pessoaFundo.stCadastroFundo = 'Em Andamento';
					
					if(pessoaFundoConfig.hrFuncionamentoFim
						&& pessoaFundoConfig.inAssGestoPgtoCessao
						&& pessoaFundoConfig.inRemessaParcial
						&& pessoaFundoConfig.inRetornoRemessa
						&& pessoaFundoConfig.inRecompraParcial
						&& pessoaFundoConfig.inLinhaLastroObrigatoria
						&& pessoaFundoConfig.inValorMinimoRecompra
						&& pessoaFundoConfig.inValorMinimoPagamento
						&& pessoaFundoConfig.inReapresentacaoAutomatica
						&& pessoaFundoConfig.inResolucao
						&& pessoaFundoConfig.inSeguro
                        && pessoaFundoConfig.recompraOcorrencia
                        && pessoaFundoConfig.metodologiaPDD
						&& pessoaFundoConfig.nrDiasCarencia
						&& pessoaFundoConfig.nrDiasBloqLtoFisico
						&& pessoaFundoConfig.nrDiasBloqLtoEletronico
						&& pessoaFundoConfig.nrDiasBloqDpeAssinatura
						&& pessoaFundoConfig.nrPrazoDiasIdentificacao
						&& pessoaFundoConfig.dtInicioOrigemMovFin
						&& pessoaFundoConfig.inRecupJudicial
						&& pessoaFundoConfig.ROBO_HABILITADO
						&& pessoaFundoConfig.ROBO_VALOR_LIMITE
						&& $scope.tiposTituloAssociados.length >= 1) {
							$scope.fundoCtrl.abas.configuracaoFundos.erros = [];
							$scope.fundoCtrl.abas.configuracaoFundos.hasAlert = false;
					}
					controller.pessoaFundoConfig.tpCendenteOperante = pessoaFundoConfig.tpCendenteOperante != null ? pessoaFundoConfig.tpCendenteOperante : '';
			});
		});
		
	}
	
	function deleteTiposTitulo(tipoAssociados){
		controller.tiposTituloFundo = new Array();
		controller.tiposTituloFundo.push(tipoAssociados);
		configuracaoFundosService.deleteTiposTitulo(controller.tiposTituloFundo).then(function(data){
			for (var j = 0; j < $scope.tiposTituloAssociados.length; ++j) {
				if (data.data[0].id.tpTitulo.trim() == $scope.tiposTituloAssociados[j].id.tpTitulo
						.trim()) {
					$scope.tiposTituloAssociados.splice(j, 1);
					var option = {dsTituloTipo : "",
								  tpTitulo : data.data[0].id.tpTitulo};
					$scope.tiposTitulo.push(option);
					break;
				}
			}
			$scope.fundoCtrl.pessoaFundo.stCadastroFundo = 'Em Andamento';
		});
	}
	
	function salvarTiposTitulo(){
		controller.tipoAssociado.id.idPessoaFundoConf = controller.pessoaFundoConfig.id;
		controller.tiposAssociado = new Array();
		controller.tiposAssociado.push(controller.tipoAssociado);
		configuracaoFundosService.inserirTiposTitulos(controller.tiposAssociado).success(function(pessoaFundoConfig){
			if(!$scope.tiposTituloAssociados){
				$scope.tiposTituloAssociados = new Array();
			}
			$scope.tiposTituloAssociados.push(pessoaFundoConfig[0]);
			removeUsuariosAssociadosDaLista();	
			
			
			if(controller.pessoaFundoConfig.hrFuncionamentoFim
					&& controller.pessoaFundoConfig.inAssGestoPgtoCessao
					&& controller.pessoaFundoConfig.inRemessaParcial
					&& controller.pessoaFundoConfig.inRetornoRemessa
					&& controller.pessoaFundoConfig.inRecompraParcial
					&& controller.pessoaFundoConfig.inLinhaLastroObrigatoria
					&& controller.pessoaFundoConfig.inValorMinimoRecompra
					&& controller.pessoaFundoConfig.inValorMinimoPagamento
					&& controller.pessoaFundoConfig.inReapresentacaoAutomatica
					&& controller.pessoaFundoConfig.inResolucao
					&& controller.pessoaFundoConfig.inSeguro
                    && controller.pessoaFundoConfig.recompraOcorrencia
                    && controller.pessoaFundoConfig.metodologiaPDD
					&& controller.pessoaFundoConfig.inRecupJudicial
					&& controller.pessoaFundoConfig.ROBO_HABILITADO
					&& controller.pessoaFundoConfig.ROBO_VALOR_LIMITE
					&& controller.pessoaFundoConfig.nrDiasCarencia
					&& controller.pessoaFundoConfig.nrDiasBloqLtoFisico
					&& controller.pessoaFundoConfig.nrDiasBloqLtoEletronico
					&& controller.pessoaFundoConfig.nrDiasBloqDpeAssinatura
					&& controller.pessoaFundoConfig.nrPrazoDiasIdentificacao
					&& controller.pessoaFundoConfig.dtInicioOrigemMovFin
					&& $scope.tiposTituloAssociados.length >= 1) {
						$scope.fundoCtrl.abas.configuracaoFundos.erros = [];
						$scope.fundoCtrl.abas.configuracaoFundos.hasAlert = false; 
				}
			
			controller.tipoAssociado.id = null;
			controller.tipoAssociado.banco = null;
			controller.disable = true;
			$scope.fundoCtrl.pessoaFundo.stCadastroFundo = 'Em Andamento';
		});
	}
	
	function validarHoraMin(nomeCampo, horario){
			
		if (horario == '' || typeof horario === "undefined") {
			salvar();
			return true;
		}
		
	    var result = false, m;
	    var re = /^\s*([01]?\d|2[0-3]):?([0-5]\d)\s*$/;
	    if ((m = horario.match(re))) {
	        result = (m[1].length === 2 ? "" : "0") + m[1] + ":" + m[2];
	    }
	    
	    switch (nomeCampo) {
		    case 'hrFuncionamentoIni':
		    	controller.pessoaFundoConfig.hrFuncionamentoIni = result ? controller.pessoaFundoConfig.hrFuncionamentoIni : '';
		    	break;
		    case 'hrFuncionamentoFim':
		    	controller.pessoaFundoConfig.hrFuncionamentoFim = result ? controller.pessoaFundoConfig.hrFuncionamentoFim : '';
		    	break;
		    case 'hrLimitePagamento':
		    	controller.pessoaFundoConfig.hrLimitePagamento = result ? controller.pessoaFundoConfig.hrLimitePagamento : '';
		    	break;
		    case 'hrAutoservicoIni' :
		    	controller.pessoaFundoConfig.hrAutoservicoIni = result ? controller.pessoaFundoConfig.hrAutoservicoIni : '';
		    	break;
		    case 'hrAutoservicoFim' :
		    	controller.pessoaFundoConfig.hrAutoservicoFim = result ? controller.pessoaFundoConfig.hrAutoservicoFim : '';
		    	break;
	    }
	    
	    if (result != false) {
	    	if (nomeCampo == 'hrFuncionamentoIni' || nomeCampo == 'hrFuncionamentoFim') {
	    		validarHrFuncionamento(nomeCampo);
	    		
	    	}
	    	if (nomeCampo == 'hrAutoservicoIni' || nomeCampo == 'hrAutoservicoFim') {
	    		validarHraAutoServico(nomeCampo)
	    	}
	   }
	    
		salvar();
		return result;
			
	}

	function validarHrFuncionamento(campo){
		
		var hrFuncMaior = true;
		
		var hrFuncInicio = controller.pessoaFundoConfig.hrFuncionamentoIni;
		var hrFuncFim = controller.pessoaFundoConfig.hrFuncionamentoFim;
		
		hrFuncMaior = validarHora(hrFuncInicio, hrFuncFim);
	
		
		 switch(campo) {
		    case 'hrFuncionamentoIni':
		    	controller.pessoaFundoConfig.hrFuncionamentoIni = !hrFuncMaior ? controller.pessoaFundoConfig.hrFuncionamentoIni : '';
		    	break;
		    case 'hrFuncionamentoFim':
		    	controller.pessoaFundoConfig.hrFuncionamentoFim = !hrFuncMaior ? controller.pessoaFundoConfig.hrFuncionamentoFim : '';
		    	break;
		 }
		
	}
		 
	 function validarHraAutoServico(campo){
		 
	    var hrAutoMaior = true;
	   
		var hrAutoInicio = controller.pessoaFundoConfig.hrAutoservicoIni;
		var hrAutoFim = controller.pessoaFundoConfig.hrAutoservicoFim;
		
		hrAutoMaior = validarHora(hrAutoInicio, hrAutoFim);
		
		 switch(campo) {
		    case 'hrAutoservicoIni':
		    	controller.pessoaFundoConfig.hrAutoservicoIni = !hrAutoMaior ? controller.pessoaFundoConfig.hrAutoservicoIni : '';
		    	break;
		    case 'hrAutoservicoFim':
		    	controller.pessoaFundoConfig.hrAutoservicoFim = !hrAutoMaior ? controller.pessoaFundoConfig.hrAutoservicoFim : '';
		    	break;
		 }
	}

	function validarHora(hrInicio, hrFim){
		if(hrInicio != undefined && hrFim != undefined ){
			if(hrInicio != '' && hrFim != ''){
				 if (hrInicio >= hrFim) {
						notify({message:'O horário inicial deve ser menor que o horário final.', classes:'alert-danger',position:'right'});
						return true;
				} else {
					salvar();
					return false;
				}
				 
			} else if(hrInicio != '' || hrFim != ''){
				salvar();
				return false;
				
			} 
			
		}
	}
	
	function corrirPontuacaoHR(pessoaFundoConfig){
		controller.pessoaFundoConfig.hrFuncionamentoIni = pessoaFundoConfig.hrFuncionamentoIni != null ? pessoaFundoConfig.hrFuncionamentoIni.replace(":", "") : '';
		controller.pessoaFundoConfig.hrFuncionamentoFim =  pessoaFundoConfig.hrFuncionamentoFim != null ? pessoaFundoConfig.hrFuncionamentoFim.replace(":", "") : '' ;
		controller.pessoaFundoConfig.hrLimitePagamento = pessoaFundoConfig.hrLimitePagamento != null ? pessoaFundoConfig.hrLimitePagamento.replace(":", "") : '';
		controller.pessoaFundoConfig.hrAutoservicoIni = pessoaFundoConfig.hrAutoservicoIni != null ? pessoaFundoConfig.hrAutoservicoIni.replace(":", "") : '';
		controller.pessoaFundoConfig.hrAutoservicoFim = pessoaFundoConfig.hrAutoservicoFim != null ? pessoaFundoConfig.hrAutoservicoFim.replace(":", "") : '';
	}

	$scope.selectedTipoTitulo = function(tipo) {

		for (var i = 0; i < $scope.tiposTituloToLink.length; ++i) {
			if ($scope.tiposTituloToLink[i] == tipo) {return true;}
		}

		return false;
	};

	$scope.selectLink = function(tipo) {
			$scope.tiposTituloToLink.push(tipo);

	};
	
	$scope.linkSelecionados = function( ) {
	    for (var i = 0; i < $scope.tiposTitulo.length; ++i) {
	      for (var j = 0; j < $scope.tiposTituloToLink.length; ++j) {
	        if ( $scope.tiposTitulo[i] == $scope.tiposTituloToLink[j] ) {
	          $scope.tiposTitulo.splice(i, 1);
	          $scope.tiposTituloAssociados.push($scope.tiposTituloToLink[j]);
	          i = i - 1;
	          controller.tiposTituloFundo = $scope.tiposTituloAssociados;
	          for (var k = 0; k < controller.tiposTituloFundo.length; ++k) {
	        	  controller.tiposTituloFundo[k].idPessoaFundoConf = controller.pessoaFundoConfig.id;
	          }
	          salvarTiposTitulo();
	          break;
	        }
	      }
	    }

	    $scope.data.isAllTiposTituloSelectedLink = false;
	    $scope.usuariosToUnlink = new Array();
	  };
	  
	  $scope.unlinkSelecionados = function( ) {
	    for (var i = 0; i < $scope.tiposTituloAssociados.length; ++i) {
	      for (var j = 0; j < $scope.tiposTituloToUnlink.length; ++j) {
	        if ( $scope.tiposTituloAssociados[i] == $scope.tiposTituloToUnlink[j] ) {
	          $scope.tiposTituloAssociados.splice(i, 1);
	          $scope.tiposTitulo.push($scope.tiposTituloToUnlink[j]);
	          i = i - 1;
	          controller.tiposTituloFundo = $scope.tiposTituloToUnlink;
	          deleteTiposTitulo();
	          break;
	        }
	      }
	    }

	    $scope.data.isAllTiposTituloSelectedLink = false;
	    $scope.tiposTituloToUnlink = new Array();
	  };
		  
	 $scope.selectedTiposTituloLink = function( tipo ) {

	    for (var i = 0; i < $scope.tiposTituloToUnlink.length; ++i) {
	      if ( $scope.tiposTituloToUnlink[i] == tipo ) {return true;}
	    }

	    return false;
	  };
	  
	  $scope.selectUnlink = function( tipo ) {
	    var idx = null;

	    for (var i = 0; i < $scope.tiposTituloToUnlink.length; ++i) {
	      if ( $scope.tiposTituloToUnlink[i] == tipo ) {
	        idx = i;
	        break;
	      }
	    }

	    if ( idx != null && idx > -1) {
	      $scope.tiposTituloToUnlink.splice(idx, 1);
	    }
	    else {
	      $scope.tiposTituloToUnlink.push(tipo);
	    }
	  };
	  
	  $scope.selectAllTiposTitulo = function( ) {
	    $scope.data.isAllTiposTituloSelected = !$scope.data.isAllTiposTituloSelected;

	    if ($scope.data.isAllTiposTituloSelected) {
	      $scope.tiposTituloToLink = $scope.tiposTituloToLink.concat($scope.tiposTitulo);
	    } else {
	      $scope.tiposTituloToLink = new Array();
	    }
	  };
	  
	  $scope.selectAllTiposTituloLink = function( ) {
	    $scope.data.isAllTiposTituloSelectedLink = !$scope.data.isAllTiposTituloSelectedLink;

	    if ($scope.data.isAllTiposTituloSelectedLink) {
	      $scope.tiposTituloToUnlink = $scope.tiposTituloToUnlink.concat($scope.tiposTituloAssociados);
	    } else {
	      $scope.tiposTituloToUnlink = new Array();
	    }
	  };
	
	  $timeout(function(){
			
		if ($scope.fundoCtrl.abas.configuracaoFundos.erros.length) {
			
			controller.form.$submitted = true;
			
			$scope.fundoCtrl.abas.configuracaoFundos.erros.filter(function(erro){
				return erro.campo; 
			}).forEach(function(erro){
				//controller.form[erro.campo].$setValidity('required',false);
				angular.element('[name=' + erro.campo + ']').attr('tooltip',erro.mensagem);
				$timeout(function(){
					angular.element('[name=' + erro.campo + ']').trigger('mouseover');
				});
			});
			
		}		
	});
	
  	function carregarBancos(){
		bancoService.findAll().success(function(bancos){
			controller.bancos = bancos;
		});
	}
  	
  	function habilitarBtnIncluir(){
		controller.disable = true;
		if(controller.tipoAssociado.banco && controller.tipoAssociado.id.tpTitulo != ""){
			controller.disable = false;
		} 
	}
  	
  	function validarDiasLimitesPddRj(){
		
  		if(controller.pessoaFundoConfig.nrDiaLimitesPddRjIni && controller.pessoaFundoConfig.nrDiaLimitesPddRjFim){
			if(parseInt(controller.pessoaFundoConfig.nrDiaLimitesPddRjIni) < parseInt(controller.pessoaFundoConfig.nrDiaLimitesPddRjFim)){
				salvar();
			}else{
				notify({message:'Dias limites PDD para cedentes em RJ e com nota CC inválidos.', classes:'alert-danger',position:'right'});
			}
  		}
	}
	
	function _getUserLogado() {
		var settings = {
			"async" : true,
			"url" : controller.url_caRest + "/usuario/username",
			"method" : "GET",
			"headers" : {
				"authorization" : "Bearer " + localStorage.getItem("token")
			}
		}
		$.ajax(settings).done(function(response) {
			$scope.usuarioLogado = response;
		});
	}

	function carregaRegras() {
		fundoParametroService.listaRegras()
			.success(function(data) {
				controller.regras = data;
			});
	}

	function carregaRegrasDoFundo() {
		controller.cdFundo = $stateParams.identificador.substring(0, 8);
		controller.regrasFundo ='';
		controller.acao = 'I';
		fundoParametroService.buscaRegra(controller.cdFundo)
			.success(function(data) {
				if (data.length != 0) {
					$http({
						method : 'GET',
						url : controller.restUrl + '/' + data[0].idParametro + '?statusParametro=S'
					}).success(function(response) {
						controller.regrasFundo = response;
						if(controller.regrasFundo[0] != null && controller.regrasFundo[0] != ""){
							controller.regrasFundo[0].idParametroFundo =  data[0].idParametroFundo;
						}
						controller.acao = 'E';
					});
				}
			})
			.error(function(data) {
				notify({
					message : 'Problema em buscar regras do fundo.',
					classes : 'alert-danger',
					position : 'right'
				});
			});
	}
	
	function selecionaRegra() {
		fundoParametroService.buscaParametros(controller.regraSelecionada.idParametro, controller.regraSelecionada.nome)
			.success(function(data) {
				controller.parametros = data;
			});
	}
	
	function cancel() {
		carregaRegrasDoFundo();
		controller.parametros = [];
		controller.regraSelecionada = null;
	}
	
	function adicionar() {
		controller.parametro = {
			idParametro : controller.parametros[0].idParametro,
			nome : controller.parametros[0].nome,
			quantidadeDias : controller.parametros[0].quantidadeDias,
			regraAtiva : true,
			fundos : [ {
				codigo : controller.cdFundo
			} ],
			usuario : {
				nome : controller.usuarioLogado
			}
		};
		fundoParametroService.inserirRegraFundo(controller.cdFundo, controller.parametro)
			.success(function(data) {
				carregaRegrasDoFundo();
				notify({
					message : 'Parâmetro vinculado com sucesso.',
					classes : 'alert-success',
					position : 'right'
				});
				controller.regraSelecionada = null;
			})
			.error(function(data) {
				notify({
					message : 'Problema para vincular parâmetro.',
					classes : 'alert-danger',
					position : 'right'
				});
			});
	}

	function removerRegra() {
		dialogService.show('Excluir', 'Deseja excluir este parâmetro?', 'Sim', 'Não').result.then(function() {		
				controller.parametro = {
						idParametro : controller.regrasFundo[0].idParametro,
						idParametroFundo  : controller.regrasFundo[0].idParametroFundo,
						nome : controller.regrasFundo[0].nome,
						quantidadeDias : controller.regrasFundo[0].quantidadeDias,
						dataAlteracao : new Date(),
						fundos : [ {
							codigo : controller.cdFundo
						} ],
						usuario : {
							nome : controller.usuarioLogado
						}
					};
				
				
				fundoParametroService.updateRegraFundo(controller.cdFundo, controller.parametro).success(function(response) {
					carregaRegrasDoFundo();
					carregaRegras();
					notify({
						message : 'Parâmetro desvinculado com sucesso.',
						classes : 'alert-success',
						position : 'right'
					});
					controller.regraSelecionada = null;
				}).error(function(msg) {
					notify({
						message : 'Problema ao desvincular parâmetro.',
						classes : 'alert-danger',
						position : 'right'
					});
				});
		});
	}
	
	function habilitaIncluir() {
		if (controller.regraSelecionada) {
			for (i = 0; i < controller.regras.length; i++) {
				if (!controller.regras[i].idProWriteoff || controller.regras[i].idProWriteoff == "") {
					return false;
				}
			}
		}

		return true;
	}
	
	function getUsuarioLogado(){
		usuarioService.getUsuarioLogado()
		.success(function(response){
			controller.usuarioLogado = response;
		})
		.error(function(response){
			controller.usuarioLogado = 'PETRA';
		});
	}
	
	getUsuarioLogado();
}