"use strict";

var module = angular.module('cadastro-central-module', ['datatable','ui.router', 'ui.bootstrap', 'cgNotify', 'petra-loading', 'petra-authorize','petra-breadcrumb', 'petra-downloader', 'petra-constants', 'petra-menu', 'petra-funcionalidades', 'mgo-angular-wizard', 'ui.mask','angularSpinner','ui.select','ngSanitize'])
	.config(function ( $stateProvider, $urlRouterProvider, $httpProvider, usSpinnerConfigProvider, $provide) {		
		var opts = {
				lines: 13 // The number of lines to draw
				, length: 12 // The length of each line
				, width: 7 // The line thickness
				, radius: 21 // The radius of the inner circle
				, scale: 1 // Scales overall size of the spinner
				, corners: 1 // Corner roundness (0..1)
				, color: '#000' // #rgb or #rrggbb or array of colors
				, opacity: 0 // Opacity of the lines
				, rotate: 0 // The rotation offset
				, direction: 1 // 1: clockwise, -1: counterclockwise
				, speed: 1 // Rounds per second
				, trail: 60 // Afterglow percentage
				, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
				, zIndex: 2e9 // The z-index (defaults to 2000000000)
				, className: 'spinner' // The CSS class to assign to the spinner
				, top: '50%' // Top position relative to parent
				, left: '50%' // Left position relative to parent
				, shadow: false // Whether to render a shadow
				, hwaccel: false // Whether to use hardware acceleration
				, position: 'absolute' // Element positioning
				}
		usSpinnerConfigProvider.setDefaults(opts);
		
		$httpProvider.interceptors.push('httpAuthInterceptor');
	
		$urlRouterProvider.otherwise('/');
	
		$stateProvider.state('cadastro-central',{
			url: "/",
			onEnter : function( $rootScope ) {
				$rootScope.title = "Cadastro Central";
				$rootScope.crumbs = new Array({state:"Cadastro Central", link:"cadastro-central"});
			}
		})
		
		
		.state("root", {
			templateUrl:'app/views/cliente/cadastro.html',
			controller:'PessoaCtrl',
			controllerAs:'pessoaCtrl',
			params: {
				identificador: null,
				acao: "I", // I - incluir, V - Visualizar, E - Editar
				tab: 1, // I - incluir, V - Visualizar, E - Editar
				pessoa:null,
				abas:null,
				pessoaRelacionada:null,
				tipoPessoa: null,
				identificadorPai: null,
				_papeis: []
			},
			onEnter: function($rootScope, $stateParams) {
				var title = $stateParams.acao=="V"?"Visualizar":$stateParams.acao=="E"?"Editar":"Incluir";
				$rootScope.title = title;
				$rootScope.crumbs = setBreadcrumbs($rootScope.crumbs);
				if($rootScope.crumbs.length == 1){
					$rootScope.crumbs.push({state:"Cadastro Cliente", link:"cadastro-cliente"});
				}
				$rootScope.crumbs.push({state:title, link:'cadastro-cliente'});
			},
			onExit: function($rootScope) {
				$rootScope.crumbs = new Array({state:"Cadastro Central", link:"cadastro-central"});
			}
		})
		
		.state('root.incluir',{
			url:'/incluir',
			views : {
				'Contatos' : {
					templateUrl : 'app/views/cliente/cadastro-contatos.html',
					controller : 'ContatosCtrl',
					controllerAs : 'contatosCtrl'
				},
				'DadosBancarios' : {
					templateUrl : 'app/views/cliente/cadastro-dadosBancarios.html',
					controller : 'DadosBancariosCtrl',
					controllerAs : 'dadosBancariosCtrl'
				},
				'DadosPessoaisEmpresa' : {
					templateUrl : 'app/views/cliente/cadastro-dadosPessoaisEmpresa.html',
					controller : 'DadosPessoaisEmpresaCtrl',
					controllerAs : 'dadosPessoaisEmpresaCtrl'
				},
				'DadosProfissionaisEmpresariais' : {
					templateUrl : 'app/views/cliente/cadastro-dadosProfissionaisEmpresariais.html',
					controller : 'DadosProfissionaisEmpresariaisCtrl',
					controllerAs : 'dadosProfissionaisEmpresariaisCtrl'
				},
				'Documentos' : {
					templateUrl : 'app/views/cliente/cadastro-documentos.html',
					controller : 'DocumentosCtrl',
					controllerAs : 'documentosCtrl'
				},
				'Endereco' : {
					templateUrl : 'app/views/cliente/cadastro-endereco.html',
					controller : 'EnderecoCtrl',
					controllerAs : 'enderecoCtrl'
				},
				'FiliacaoConjuge' : {
					templateUrl : 'app/views/cliente/cadastro-filiacaoConjuge.html',
					controller : 'FiliacaoConjugeCtrl',
					controllerAs : 'filiacaoConjugeCtrl'
				},
				'ParticipacaoEmpresas' : {
					templateUrl : 'app/views/cliente/cadastro-participacaoEmpresas.html',
					controller : 'ParticipacaoEmpresasCtrl',
					controllerAs : 'participacaoEmpresasCtrl'
				},
				'InformacoesFinanceiras' : {
					templateUrl : 'app/views/cliente/cadastro-informacoesFinanceiras.html',
					controller : 'InfFinanceirasCtrl',
					controllerAs : 'infFinanceirasCtrl'
				},
				'PerfilInvestidor' : {
					templateUrl : 'app/views/cliente/cadastro-perfilInvestidor.html',
					controller : 'PerfilInvestidorCtrl',
					controllerAs : 'perfilInvestidorCtrl'
				},
				'InformacoesFinanceirasPessoaJuridica' : {
					templateUrl : 'app/views/cliente/cadastro-informacoesFinanceirasPessoaJuridica.html',
					controller : 'InfFinanceirasPessoaJuridicaCtrl',
					controllerAs : 'infFinanceirasPessoaJuridicaCtrl'
				},
				'Afirmacoes' : {
					templateUrl : 'app/views/cliente/cadastro-afirmacoes.html',
					controller : 'AfirmacoesCtrl',
					controllerAs : 'afirmacoesCtrl'
				},
				'Patrimonio' : {
					templateUrl : 'app/views/cliente/cadastro-patrimonio.html',
					controller : 'PatrimonioCtrl',
					controllerAs : 'patrimonioCtrl'
				},
				'Fatca' : {
					templateUrl : 'app/views/cliente/cadastro-fatca.html',
					controller : 'FatcaCtrl',
					controllerAs : 'fatcaCtrl'
				},
				'PessoasRelacionadas' : {
					templateUrl : 'app/views/cliente/cadastro-pessoaRelacionada.html',
					controller : 'PessoasRelacionadasCtrl',
					controllerAs : 'pessoasRelacionadasCtrl'
				},
				'AtualizacaoCadastral' : {
					templateUrl : 'app/views/cliente/cadastro-atualizacaoCadastral.html',
					controller : 'AtualizacaoCadastralCtrl',
					controllerAs : 'atualizacaoCadastralCtrl'
				},
				'Fundos' : {
					templateUrl : 'app/views/cliente/cadastro-fundos.html',
					controller : 'FundosCtrl',
					controllerAs : 'fundosCtrl'
				}
			}
		
		})
		
		.state('root.visualizar',{
			url:'/visualizar',
			views : {
				'Contatos' : {
					templateUrl : 'app/views/cliente/cadastro-contatos.html',
					controller : 'ContatosCtrl',
					controllerAs : 'contatosCtrl'
				},
				'DadosBancarios' : {
					templateUrl : 'app/views/cliente/cadastro-dadosBancarios.html',
					controller : 'DadosBancariosCtrl',
					controllerAs : 'dadosBancariosCtrl'
				},
				'DadosPessoaisEmpresa' : {
					templateUrl : 'app/views/cliente/cadastro-dadosPessoaisEmpresa.html',
					controller : 'DadosPessoaisEmpresaCtrl',
					controllerAs : 'dadosPessoaisEmpresaCtrl'
				},
				'DadosProfissionaisEmpresariais' : {
					templateUrl : 'app/views/cliente/cadastro-dadosProfissionaisEmpresariais.html',
					controller : 'DadosProfissionaisEmpresariaisCtrl',
					controllerAs : 'dadosProfissionaisEmpresariaisCtrl'
				},
				'Documentos' : {
					templateUrl : 'app/views/cliente/cadastro-documentos.html',
					controller : 'DocumentosCtrl',
					controllerAs : 'documentosCtrl'
				},
				'Endereco' : {
					templateUrl : 'app/views/cliente/cadastro-endereco.html',
					controller : 'EnderecoCtrl',
					controllerAs : 'enderecoCtrl'
				},
				'FiliacaoConjuge' : {
					templateUrl : 'app/views/cliente/cadastro-filiacaoConjuge.html',
					controller : 'FiliacaoConjugeCtrl',
					controllerAs : 'filiacaoConjugeCtrl'
				},
				'ParticipacaoEmpresas' : {
					templateUrl : 'app/views/cliente/cadastro-participacaoEmpresas.html',
					controller : 'ParticipacaoEmpresasCtrl',
					controllerAs : 'participacaoEmpresasCtrl'
				},
				'InformacoesFinanceiras' : {
					templateUrl : 'app/views/cliente/cadastro-informacoesFinanceiras.html',
					controller : 'InfFinanceirasCtrl',
					controllerAs : 'infFinanceirasCtrl'
				},
				'PerfilInvestidor' : {
					templateUrl : 'app/views/cliente/cadastro-perfilInvestidor.html',
					controller : 'PerfilInvestidorCtrl',
					controllerAs : 'perfilInvestidorCtrl'
				},
				'InformacoesFinanceirasPessoaJuridica' : {
					templateUrl : 'app/views/cliente/cadastro-informacoesFinanceirasPessoaJuridica.html',
					controller : 'InfFinanceirasPessoaJuridicaCtrl',
					controllerAs : 'infFinanceirasPessoaJuridicaCtrl'
				},
				'Afirmacoes' : {
					templateUrl : 'app/views/cliente/cadastro-afirmacoes.html',
					controller : 'AfirmacoesCtrl',
					controllerAs : 'afirmacoesCtrl'
				},
				'Patrimonio' : {
					templateUrl : 'app/views/cliente/cadastro-patrimonio.html',
					controller : 'PatrimonioCtrl',
					controllerAs : 'patrimonioCtrl'
				},
				'Fatca' : {
					templateUrl : 'app/views/cliente/cadastro-fatca.html',
					controller : 'FatcaCtrl',
					controllerAs : 'fatcaCtrl'
				},
				'PessoasRelacionadas' : {
					templateUrl : 'app/views/cliente/cadastro-pessoaRelacionada.html',
					controller : 'PessoasRelacionadasCtrl',
					controllerAs : 'pessoasRelacionadasCtrl'
				},
				'AtualizacaoCadastral' : {
					templateUrl : 'app/views/cliente/cadastro-atualizacaoCadastral.html',
					controller : 'AtualizacaoCadastralCtrl',
					controllerAs : 'atualizacaoCadastralCtrl'
				},
				'Fundos' : {
					templateUrl : 'app/views/cliente/cadastro-fundos.html',
					controller : 'FundosCtrl',
					controllerAs : 'fundosCtrl'
				}
			}
		})
		
		.state('root.editar',{
			url:'/editar',
			views : {
				'Contatos' : {
					templateUrl : 'app/views/cliente/cadastro-contatos.html',
					controller : 'ContatosCtrl',
					controllerAs : 'contatosCtrl'
				},
				'DadosBancarios' : {
					templateUrl : 'app/views/cliente/cadastro-dadosBancarios.html',
					controller : 'DadosBancariosCtrl',
					controllerAs : 'dadosBancariosCtrl'
				},
				'DadosPessoaisEmpresa' : {
					templateUrl : 'app/views/cliente/cadastro-dadosPessoaisEmpresa.html',
					controller : 'DadosPessoaisEmpresaCtrl',
					controllerAs : 'dadosPessoaisEmpresaCtrl'
				},
				'DadosProfissionaisEmpresariais' : {
					templateUrl : 'app/views/cliente/cadastro-dadosProfissionaisEmpresariais.html',
					controller : 'DadosProfissionaisEmpresariaisCtrl',
					controllerAs : 'dadosProfissionaisEmpresariaisCtrl'
				},
				'Documentos' : {
					templateUrl : 'app/views/cliente/cadastro-documentos.html',
					controller : 'DocumentosCtrl',
					controllerAs : 'documentosCtrl'
				},
				'Endereco' : {
					templateUrl : 'app/views/cliente/cadastro-endereco.html',
					controller : 'EnderecoCtrl',
					controllerAs : 'enderecoCtrl'
				},
				'FiliacaoConjuge' : {
					templateUrl : 'app/views/cliente/cadastro-filiacaoConjuge.html',
					controller : 'FiliacaoConjugeCtrl',
					controllerAs : 'filiacaoConjugeCtrl'
				},
				'ParticipacaoEmpresas' : {
					templateUrl : 'app/views/cliente/cadastro-participacaoEmpresas.html',
					controller : 'ParticipacaoEmpresasCtrl',
					controllerAs : 'participacaoEmpresasCtrl'
				},
				'InformacoesFinanceiras' : {
					templateUrl : 'app/views/cliente/cadastro-informacoesFinanceiras.html',
					controller : 'InfFinanceirasCtrl',
					controllerAs : 'infFinanceirasCtrl'
				},
				'PerfilInvestidor' : {
					templateUrl : 'app/views/cliente/cadastro-perfilInvestidor.html',
					controller : 'PerfilInvestidorCtrl',
					controllerAs : 'perfilInvestidorCtrl'
				},
				'InformacoesFinanceirasPessoaJuridica' : {
					templateUrl : 'app/views/cliente/cadastro-informacoesFinanceirasPessoaJuridica.html',
					controller : 'InfFinanceirasPessoaJuridicaCtrl',
					controllerAs : 'infFinanceirasPessoaJuridicaCtrl'
				},
				'Afirmacoes' : {
					templateUrl : 'app/views/cliente/cadastro-afirmacoes.html',
					controller : 'AfirmacoesCtrl',
					controllerAs : 'afirmacoesCtrl'
				},
				'Patrimonio' : {
					templateUrl : 'app/views/cliente/cadastro-patrimonio.html',
					controller : 'PatrimonioCtrl',
					controllerAs : 'patrimonioCtrl'
				},
				'Fatca' : {
					templateUrl : 'app/views/cliente/cadastro-fatca.html',
					controller : 'FatcaCtrl',
					controllerAs : 'fatcaCtrl'
				},
				'PessoasRelacionadas' : {
					templateUrl : 'app/views/cliente/cadastro-pessoaRelacionada.html',
					controller : 'PessoasRelacionadasCtrl',
					controllerAs : 'pessoasRelacionadasCtrl'
				},
				'AtualizacaoCadastral' : {
					templateUrl : 'app/views/cliente/cadastro-atualizacaoCadastral.html',
					controller : 'AtualizacaoCadastralCtrl',
					controllerAs : 'atualizacaoCadastralCtrl'
				},
				'Fundos' : {
					templateUrl : 'app/views/cliente/cadastro-fundos.html',
					controller : 'FundosCtrl',
					controllerAs : 'fundosCtrl'
				}
			}
		})
		
		.state('cadastro-fundo',{
			url:'/cadastro-fundo',
			templateUrl:'app/views/fundo/consulta.html',
			controller : 'ConsultaFundoCtrl',
			controllerAs : 'consultaFundoCtrl',
			params: {
				identificador: null,
				acao: "I", // I - incluir, V - Visualizar, E - Editar
				tab: 1, // I - incluir, V - Visualizar, E - Editar
				abas:null,
			},
			onEnter: function($rootScope) {
				
				var title = 'Cadastro de Fundo'
				$rootScope.title = title;
				$rootScope.crumbs = setBreadcrumbs($rootScope.crumbs);
				$rootScope.crumbs.push({state:title, link:'cadastro-fundo'});
			}
		})
		
		.state("fundo", {
			url:'/fundo',
			templateUrl:'app/views/fundo/cadastro.html',
			controller:'FundoCtrl',
			controllerAs:'fundoCtrl',
			params: {
				identificador: null,
				acao: "I", // I - incluir, V - Visualizar, E - Editar
				tab: 1, // I - incluir, V - Visualizar, E - Editar
				pessoa:null,
				abas:null,
				pessoaRelacionada:null,
				tipoPessoa: null,
				identificadorPai: null
			},
			onEnter: function($rootScope, $stateParams) {
				var title = $stateParams.acao=="V"?"Visualizar":$stateParams.acao=="E"?"Editar":"Incluir";
				$rootScope.title = title;
				$rootScope.crumbs = setBreadcrumbs($rootScope.crumbs);
				if($rootScope.crumbs.length == 1){
					$rootScope.crumbs.push({state:"Cadastro Fundo", link:"cadastro-fundo"});
				}
				$rootScope.crumbs.push({state:title, link:'cadastro-fundo'});
			},
			onExit: function($rootScope) {
				$rootScope.crumbs = new Array({state:"Cadastro Central", link:"cadastro-central"});
			}
		})

		.state('fundo.editar',{
			url:'/editar',
			views : {
				'DadosBasicosFundos' : {
					templateUrl : 'app/views/fundo/fundo-dadosBasicos.html',
					controller : 'DadosBasicosFundosCtrl',
					controllerAs : 'dadosBasicosFundosCtrl'
				},
				
				'EnderecoFundos' : {
					templateUrl : 'app/views/fundo/fundo-endereco.html',
					controller : 'EnderecoFundosCtrl',
					controllerAs : 'enderecoFundosCtrl'
				},
				
				'ConfiguracaoFundos' : {
					templateUrl : 'app/views/fundo/fundo-configuracao.html',
					controller : 'ConfiguracaoFundosCtrl',
					controllerAs : 'configuracaoFundosCtrl'
				},
				
				'DadosBancariosFundos' : {
					templateUrl : 'app/views/fundo/fundo-dadosBancarios.html',
					controller : 'DadosBancariosFundosCtrl',
					controllerAs : 'dadosBancariosFundosCtrl'
				},
				
				'PrestadorServicoFundo' : {
					templateUrl : 'app/views/fundo/fundo-prestador-servico.html',
					controller : 'PrestadorServicoFundosCtrl',
					controllerAs : 'prestadorServicoFundosCtrl'
				},
				'Termos' : {
					templateUrl:'app/views/fundo/termos.html',
					controller: 'TermosFundoCtrl',
					controllerAs: 'termosFundoCtrl'
				},
				'ElegibilidadeFundo' : {
					templateUrl : 'app/views/fundo/fundo-elegibilidade.html',
					controller : 'ElegibilidadeFundosCtrl',
					controllerAs : 'elegibilidadeFundosCtrl'
				}
			}
		})

		.state('fundo.editar.termo',{
			url:'/termo',
			params:{
                idPessoaFundoTermo:null,
				showTemplateOnly:false
			},
			controller:function ($rootScope,$modal,$state,$scope) {

                $modal.open({
                    size:'lg',
                    backdrop:'static',
                    animation:true,
                    templateUrl:'app/views/fundo/modal-termo.html',
                    controller:'TermoCtrl',
                    controllerAs:'termoCtrl',
					scope:$scope
                }).result.then(function(){
                	$scope.$parent.$broadcast('refreshDataTable');
                    $state.go('^');
                },function(){
                    $state.go('^');
                });

            }
		})
		
		.state('fundo.visualizar',{
			url:'/visualizar',
			views : {
				'DadosBasicosFundos' : {
					templateUrl : 'app/views/fundo/fundo-dadosBasicos.html',
					controller : 'DadosBasicosFundosCtrl',
					controllerAs : 'dadosBasicosFundosCtrl'
				},
				
				'EnderecoFundos' : {
					templateUrl : 'app/views/fundo/fundo-endereco.html',
					controller : 'EnderecoFundosCtrl',
					controllerAs : 'enderecoFundosCtrl'
				},
				
				'ConfiguracaoFundos' : {
					templateUrl : 'app/views/fundo/fundo-configuracao.html',
					controller : 'ConfiguracaoFundosCtrl',
					controllerAs : 'configuracaoFundosCtrl'
				},
				
				'DadosBancariosFundos' : {
					templateUrl : 'app/views/fundo/fundo-dadosBancarios.html',
					controller : 'DadosBancariosFundosCtrl',
					controllerAs : 'dadosBancariosFundosCtrl'
				},
				
				'PrestadorServicoFundo' : {
					templateUrl : 'app/views/fundo/fundo-prestador-servico.html',
					controller : 'PrestadorServicoFundosCtrl',
					controllerAs : 'prestadorServicoFundosCtrl'
				} ,
				
				'Termos' : {
					templateUrl:'app/views/fundo/termos.html',
					controller: 'TermosFundoCtrl',
					controllerAs: 'termosFundoCtrl'
				},
				'ElegibilidadeFundo' : {
					templateUrl : 'app/views/fundo/fundo-elegibilidade.html',
					controller : 'ElegibilidadeFundosCtrl',
					controllerAs : 'elegibilidadeFundosCtrl'
				}
			}
		})
		
		.state('cadastro-cliente',{
			url:'/cadastro-cliente',
			templateUrl:'app/views/cliente/consulta.html',
			controller : 'ConsultaPessoaCtrl',
			controllerAs : 'consultaPessoaCtrl',
			onEnter: function($rootScope) {
				
				$rootScope.historicos = [];
				
				var title = 'Cadastro Cliente'
				$rootScope.title = title;
				$rootScope.crumbs = setBreadcrumbs($rootScope.crumbs);
				$rootScope.crumbs.push({state:title, link:'cadastro-cliente'});
			}
		})
		
		.state('relatorio-cliente',{
			url:'/relatorio-cliente',
			templateUrl:'app/views/relatorio/consulta-relatorio.html',
			controller : 'ConsultaRelatorioCtrl',
			controllerAs : 'consultaRelatorioCtrl',
			onEnter: function($rootScope) {
				
				$rootScope.historicos = [];
				
				var title = 'Relatório de Cliente'
				$rootScope.title = title;
				$rootScope.crumbs = setBreadcrumbs($rootScope.crumbs);
				$rootScope.crumbs.push({state:title, link:'relatorio-cliente'});
			}
		})
		
		/**
		 * GRUPO ECONÔMICO
		 */
		.state('cadastro-grupo-economico',{
			url:'/cadastro-grupo-economico',
			templateUrl:'app/views/grupo-economico/consulta.html',
			controller : 'ConsultaGrupoEconomicoCtrl',
			controllerAs : 'consultaGrupoEconomicoCtrl',
			onEnter: function($rootScope) {
				
				var title = 'Consultar Grupos Econômicos'
				$rootScope.title = title;
				$rootScope.crumbs = setBreadcrumbs($rootScope.crumbs);
				$rootScope.crumbs.push({state:title, link:'cadastro-grupo-economico'});
			}
		})
		
		.state("grupo-economico", {
			url:'/grupo-economico',
			templateUrl:'app/views/grupo-economico/cadastro.html',//
			controller:'GrupoEconomicoCtrl',
			controllerAs:'grupoEconomicoCtrl',
			params: {
				identificador: null,
				acao: "I", // I - incluir, V - Visualizar, E - Editar I
				tab: 1, // I - incluir, V - Visualizar, E - Editar
			},
			onEnter: function($rootScope, $stateParams) {
				var title = $stateParams.acao=="V"?"Visualizar":$stateParams.acao=="E"?"Editar":"Incluir"; 
				$rootScope.title = title;
				$rootScope.crumbs = setBreadcrumbs($rootScope.crumbs);
				if($rootScope.crumbs.length == 1){
					$rootScope.crumbs.push({state:"Cadastro de Prestador de Serviço", link:"cadastro-grupo-economico"});
				}
				$rootScope.crumbs.push({state:title, link:'cadastro-grupo-economico'});
			},
			onExit: function($rootScope) {
				$rootScope.crumbs = new Array({state:"Cadastro Central", link:"cadastro-central"});
			}
		})
		
		.state('grupo-economico.incluir',{
			url:'/incluir',
			views : {
				'GrupoEconomico' : {
					templateUrl : 'app/views/grupo-economico/cadastro.html',
					controller : 'GrupoEconomicoCtrl',
					controllerAs : 'grupoEconomicoCtrl'
				}
			}
		
		})		
		
		.state('grupo-economico.editar',{
			url:'/editar',
			views : {
				'GrupoEconomico' : {
					templateUrl : 'app/views/grupo-economico/cadastro.html',
					controller : 'GrupoEconomicoCtrl',
					controllerAs : 'grupoEconomicoCtrl'
				}
			}
		
		})		
		
		.state('grupo-economico.visualizar',{
			url:'/visualizar',
			views : {
				'GrupoEconomico' : {
					templateUrl : 'app/views/grupo-economico/cadastro.html',
					controller : 'GrupoEconomicoCtrl',
					controllerAs : 'grupoEconomicoCtrl'
				}
			}
		
		})
		
		
		/**
		 * PRESTADOR DE SERVICO
		 */
		
		.state('cadastro-prestador-servico',{
			url:'/cadastro-prestador-servico',
			templateUrl:'app/views/prestador-servico/consulta.html',
			controller : 'ConsultaPrestadorServicoCtrl',
			controllerAs : 'consultaPrestadorServicoCtrl',
			onEnter: function($rootScope) {
				
				var title = 'Cadastro Prestador de Serviço'
				$rootScope.title = title;
				$rootScope.crumbs = setBreadcrumbs($rootScope.crumbs);
				$rootScope.crumbs.push({state:title, link:'cadastro-prestador-servico'});
			}
		})
		
		.state("prestador-servico", {
			url:'/prestador-servico',
			templateUrl:'app/views/prestador-servico/cadastro.html',//
			controller:'PrestadorServicoCtrl',
			controllerAs:'prestadorServicoCtrl',
			params: {
				identificador: null,
				acao: "I", // I - incluir, V - Visualizar, E - Editar I
				tab: 1, // I - incluir, V - Visualizar, E - Editar 1
				pessoa:null,
				abas:null,
				pessoaRelacionada:null,
				tipoPessoa: null,
				identificadorPai: null
			},
			onEnter: function($rootScope, $stateParams) {
				var title = $stateParams.acao=="V"?"Visualizar":$stateParams.acao=="E"?"Editar":"Incluir"; 
				$rootScope.title = title;
				$rootScope.crumbs = setBreadcrumbs($rootScope.crumbs);
				if($rootScope.crumbs.length == 1){
					$rootScope.crumbs.push({state:"Cadastro de Prestador de Serviço", link:"cadastro-prestador-servico"});
				}
				$rootScope.crumbs.push({state:title, link:'cadastro-prestador-servico'});
			},
			onExit: function($rootScope) {
				$rootScope.crumbs = new Array({state:"Cadastro Central", link:"cadastro-central"});
			}
		})
		
		
		.state('prestador-servico.incluir',{
			url:'/incluir',
			views : {
				'DadosBasicos' : {
					templateUrl : 'app/views/prestador-servico/basicos-prestador-servico.html',
					controller : 'DadosBasicosCtrl',
					controllerAs : 'dadosBasicosCtrl'
				},
				'Endereco' : {
					templateUrl : 'app/views/prestador-servico/endereco-prestador-servico.html',
					controller : 'DadosEnderecoPrestadorCtrl',
					controllerAs : 'dadosEnderecoPrestadorCtrl'
				},
				'DadosContatos' : {
					templateUrl : 'app/views/prestador-servico/contatos-prestador-servico.html',
					controller : 'DadosContatosCtrl',
					controllerAs : 'dadosContatosCtrl'
				},
				'DadosResponsaveis' : {
					templateUrl : 'app/views/prestador-servico/responsavel-prestador-servico.html',
					controller : 'DadosResponsaveisCtrl',
					controllerAs : 'dadosResponsaveisCtrl'
				},
				'DadosDocumentos' : {
					templateUrl : 'app/views/prestador-servico/documento-prestador-servico.html',
					controller : 'DadosDocumentosCtrl',
					controllerAs : 'dadosDocumentosCtrl'
				},
				'DadosPapeis' : {
					templateUrl : 'app/views/prestador-servico/papeis-prestador-servico.html',
					controller : 'PapeisFundoCtrl',
					controllerAs : 'papeisFundoCtrl'
				},
				'DadosAtualizacoes' : {
					templateUrl : 'app/views/prestador-servico/atualizacao-prestador-servico.html',
					controller : 'AtualizaoesCtrl',
					controllerAs : 'atualizaoesCtrl'
				},
                'DadosAcessoExterno' : {
                    templateUrl : 'app/views/prestador-servico/acesso-externo.html',
                    controller : 'AcessoExternoCtrl',
                    controllerAs : 'acessoExternoCtrl'
                }
			}
		
		})
		
		.state('prestador-servico.editar',{
			url:'/editar',
			views : {
				'DadosBasicos' : {
					templateUrl : 'app/views/prestador-servico/basicos-prestador-servico.html',
					controller : 'DadosBasicosCtrl',
					controllerAs : 'dadosBasicosCtrl'
				},
				'Endereco' : {
					templateUrl : 'app/views/prestador-servico/endereco-prestador-servico.html',
					controller : 'DadosEnderecoPrestadorCtrl',
					controllerAs : 'dadosEnderecoPrestadorCtrl'
				},
				'DadosContatos' : {
					templateUrl : 'app/views/prestador-servico/contatos-prestador-servico.html',
					controller : 'DadosContatosCtrl',
					controllerAs : 'dadosContatosCtrl'
				},
				'DadosResponsaveis' : {
					templateUrl : 'app/views/prestador-servico/responsavel-prestador-servico.html',
					controller : 'DadosResponsaveisCtrl',
					controllerAs : 'dadosResponsaveisCtrl'
				},
				'DadosDocumentos' : {
					templateUrl : 'app/views/prestador-servico/documento-prestador-servico.html',
					controller : 'DadosDocumentosCtrl',
					controllerAs : 'dadosDocumentosCtrl'
				},
				'DadosPapeis' : {
					templateUrl : 'app/views/prestador-servico/papeis-prestador-servico.html',
					controller : 'PapeisFundoCtrl',
					controllerAs : 'papeisFundoCtrl'
				},
				'DadosAtualizacoes' : {
					templateUrl : 'app/views/prestador-servico/atualizacao-prestador-servico.html',
					controller : 'AtualizaoesCtrl',
					controllerAs : 'atualizaoesCtrl'
				},
                'DadosAcessoExterno' : {
                    templateUrl : 'app/views/prestador-servico/acesso-externo.html',
                    controller : 'AcessoExternoCtrl',
                    controllerAs : 'acessoExternoCtrl'
                }
			}
		})
		
		.state('prestador-servico.visualizar',{
			url:'/visualizar',
			views : {
				'DadosBasicos' : {
					templateUrl : 'app/views/prestador-servico/basicos-prestador-servico.html',
					controller : 'DadosBasicosCtrl',
					controllerAs : 'dadosBasicosCtrl'
				},
				'Endereco' : {
					templateUrl : 'app/views/prestador-servico/endereco-prestador-servico.html',
					controller : 'DadosEnderecoPrestadorCtrl',
					controllerAs : 'dadosEnderecoPrestadorCtrl'
				},
				'DadosContatos' : {
					templateUrl : 'app/views/prestador-servico/contatos-prestador-servico.html',
					controller : 'DadosContatosCtrl',
					controllerAs : 'dadosContatosCtrl'
				},
				'DadosResponsaveis' : {
					templateUrl : 'app/views/prestador-servico/responsavel-prestador-servico.html',
					controller : 'DadosResponsaveisCtrl',
					controllerAs : 'dadosResponsaveisCtrl'
				},
				'DadosDocumentos' : {
					templateUrl : 'app/views/prestador-servico/documento-prestador-servico.html',
					controller : 'DadosDocumentosCtrl',
					controllerAs : 'dadosDocumentosCtrl'
				},
				'DadosPapeis' : {
					templateUrl : 'app/views/prestador-servico/papeis-prestador-servico.html',
					controller : 'PapeisFundoCtrl',
					controllerAs : 'papeisFundoCtrl'
				},
				'DadosAtualizacoes' : {
					templateUrl : 'app/views/prestador-servico/atualizacao-prestador-servico.html',
					controller : 'AtualizaoesCtrl',
					controllerAs : 'atualizaoesCtrl'
				},
                'DadosAcessoExterno' : {
                    templateUrl : 'app/views/prestador-servico/acesso-externo.html',
                    controller : 'AcessoExternoCtrl',
                    controllerAs : 'acessoExternoCtrl'
                }
			}
		})
		
		/**
		 * PARAMETRO WRITE-OFF
		 */
		
		.state('cadastro-parametro-writeoff',{
			url:'/cadastro-parametro-writeoff',
			templateUrl:'app/views/fundo/consulta-parametro.html',
			controller : 'ConsultaParametroCtrl',
			controllerAs : 'consultaParametroCtrl',
			onEnter: function($rootScope) {
				
				var title = 'Cadastro Parâmetro Write-OFF'
				$rootScope.title = title;
				$rootScope.crumbs = setBreadcrumbs($rootScope.crumbs);
				$rootScope.crumbs.push({state:title, link:'cadastro-parametro-writeoff'});
			}
		})
		
		.state('parametro.editar',{
			templateUrl:'app/views/fundo/cadastro-parametro.html',
			controller:'ParametroCtrl',
			controllerAs:'parametroCtrl',
			params: {
				identificador: null,
				acao: "E"
			}
		})
		.state("parametro", {
			url:'/parametro',
			templateUrl:'app/views/fundo/cadastro-parametro.html',
			controller:'ParametroCtrl',
			controllerAs:'parametroCtrl',
			params: {
				identificador: null,
				acao: "I", // I - incluir, V - Visualizar, E - Editar
				tab: 1, // I - incluir, V - Visualizar, E - Editar
				pessoa:null,
				abas:null,
				pessoaRelacionada:null,
				tipoPessoa: null,
				identificadorPai: null
			},
			onEnter: function($rootScope, $stateParams) {
				var title = $stateParams.acao=="V"?"Visualizar":$stateParams.acao=="E"?"Editar":"Incluir";
				$rootScope.title = title;
				$rootScope.crumbs = setBreadcrumbs($rootScope.crumbs);
				if($rootScope.crumbs.length == 1) {
					$rootScope.crumbs.push({state:'Cadastro Parâmetro Write-OFF', link:'cadastro-parametro-writeoff'});
				}
				$rootScope.crumbs.push({state:title, link:'cadastro-parametro-writeoff'});
			},
			onExit: function($rootScope) {
				$rootScope.crumbs = new Array({state:"Cadastro Central", link:"cadastro-central"});
			}
		})
		
		//-------- Suitability PF------------		
		.state('root.incluir.suitability-pf-questao1', {
			templateUrl: "app/views/cliente/questao/suitability/pf/questao1.html"
		})		
		.state('root.incluir.suitability-pf-questao2', {
			templateUrl: "app/views/cliente/questao/suitability/pf/questao2.html"
		})		
		.state('root.incluir.suitability-pf-questao3', {
			templateUrl: "app/views/cliente/questao/suitability/pf/questao3.html"
		})		
		.state('root.incluir.suitability-pf-questao4', {
			templateUrl: "app/views/cliente/questao/suitability/pf/questao4.html"
		})		
		.state('root.incluir.suitability-pf-questao5', {
			templateUrl: "app/views/cliente/questao/suitability/pf/questao5.html"
		})		
		.state('root.incluir.suitability-pf-questao6', {
			templateUrl: "app/views/cliente/questao/suitability/pf/questao6.html"
		})		
		.state('root.incluir.suitability-pf-questao7', {
			templateUrl: "app/views/cliente/questao/suitability/pf/questao7.html"
		})		
		.state('root.incluir.suitability-pf-questao8', {
			templateUrl: "app/views/cliente/questao/suitability/pf/questao8.html"
		})		
		.state('root.incluir.suitability-pf-questao9', {
			templateUrl: "app/views/cliente/questao/suitability/pf/questao9.html"
		})		
		.state('root.incluir.suitability-pf-questao10', {
			templateUrl: "app/views/cliente/questao/suitability/pf/questao10.html"
		})		
		.state('root.incluir.suitability-pf-questao11', {
			templateUrl: "app/views/cliente/questao/suitability/pf/questao11.html"
		})		
		.state('root.incluir.suitability-pf-questao12', {
			templateUrl: "app/views/cliente/questao/suitability/pf/questao12.html"
		})			
		.state('root.incluir.suitability-pf-resultado', {
			templateUrl: "app/views/cliente/questao/suitability/pf/resultado.html"
		})
		
		
		//-------- Suitability PJ------------
		.state('root.incluir.suitability-pj-questao1', {
			templateUrl: "app/views/cliente/questao/suitability/pj/questao1.html"
		})		
		.state('root.incluir.suitability-pj-questao2', {
			templateUrl: "app/views/cliente/questao/suitability/pj/questao2.html"
		})		
		.state('root.incluir.suitability-pj-questao3', {
			templateUrl: "app/views/cliente/questao/suitability/pj/questao3.html"
		})		
		.state('root.incluir.suitability-pj-questao4', {
			templateUrl: "app/views/cliente/questao/suitability/pj/questao4.html"
		})		
		.state('root.incluir.suitability-pj-questao5', {
			templateUrl: "app/views/cliente/questao/suitability/pj/questao5.html"
		})		
		.state('root.incluir.suitability-pj-questao6', {
			templateUrl: "app/views/cliente/questao/suitability/pj/questao6.html"
		})		
		.state('root.incluir.suitability-pj-questao7', {
			templateUrl: "app/views/cliente/questao/suitability/pj/questao7.html"
		})		
		.state('root.incluir.suitability-pj-questao8', {
			templateUrl: "app/views/cliente/questao/suitability/pj/questao8.html"
		})		
		.state('root.incluir.suitability-pj-questao9', {
			templateUrl: "app/views/cliente/questao/suitability/pj/questao9.html"
		})		
		.state('root.incluir.suitability-pj-questao10', {
			templateUrl: "app/views/cliente/questao/suitability/pj/questao10.html"
		})		
		.state('root.incluir.suitability-pj-questao11', {
			templateUrl: "app/views/cliente/questao/suitability/pj/questao11.html"
		})		
		.state('root.incluir.suitability-pj-questao12', {
			templateUrl: "app/views/cliente/questao/suitability/pj/questao12.html"
		})		
		.state('root.incluir.suitability-pj-questao13', {
			templateUrl: "app/views/cliente/questao/suitability/pj/questao13.html"
		})		
		.state('root.incluir.suitability-pj-resultado', {
			templateUrl: "app/views/cliente/questao/suitability/pj/resultado.html"
		});
		
	})
	
	.run(function( notify, paginationConfig, $rootScope, $location, $http, PATHCONFIG ){
	
		$rootScope.historicos = [];
		
		$rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams){
			$rootScope.historicos.push({
				from:from,
				to:to,
				fromParams:fromParams,
				toParams:toParams
			});
		});
		
		notify.config({durantion:4000, position:'right'});
		paginationConfig.firstText='Primeiro';
		paginationConfig.previousText='Anterior';
		paginationConfig.nextText='Próximo';
		paginationConfig.lastText='Último';
		
		String.prototype.padZero= function(len, c){
		    var s= this, c= c || '0';
		    while(s.length< len) s= c+ s;
		    return s;
		}
		
	});


function setBreadcrumbs(crumbs) {
	if (crumbs == null) {
		return new Array({state:"Cadastro Central", link:"cadastro-central"});
	} else {
		return crumbs;
	}
}