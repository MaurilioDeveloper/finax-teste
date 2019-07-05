angular.module('cadastro-central-module').factory('fundoService',function($http,PATHCONFIG, $filter,$q,$state,$timeout,relacionadaService,pessoaService,configuracaoFundosService){
	return {

		
		
		findAll : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/fundo');
		},
		
		/**
		 * Retorna os dados da empresa da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui os dados empresariais.
		 */
		findFundoByCNPJ : function(cnpj){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/fundo/'+ cnpj);
		},
		
		//Pessoa
		/**
		 * Retorna as pessoa d/ fundo
		 *
		 *@param idPessoa o id da pessoa que possui os Fundos.
		 */
		findPessoaByFundo : function (idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/fundo/'+ idPessoa+'/pessoa');
		},
		
		/**
		 * Insere um fundo pra pessoa
		 * 
		 * @param fundoPessoa o fundo da pessoa contendo as informações
		 */
		insertFundoPessoa : function (fundoPessoa){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/fundo/pessoa/', fundoPessoa);
		},
		
		
		/**
		 * Realiza o insert ou update de pessoa_fundo
		 * 
		 * @param fundoPessoa o fundo da pessoa contendo as informações
		 */
		inserirAtualizarPessoaFundo : function (fundoPessoa){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/fundo/inserir-atualizar-pessoa-fundo/', fundoPessoa);
		},
		
		/**
		 * Salva os dados de um pessoa de um fundo.
		 * 
		 * @param documento
		 * @return o doc salvado
		 */
		insertPessoaFundo : function(pessoa) {			
			pessoa.dataCadastro = pessoa.dataCadastro && typeof pessoa.dataCadastro == "object"  ?  moment(pessoa.dataCadastro).format('DD/MM/YYYY') : pessoa.dataCadastro;
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/fundo/pessoa',pessoa);
		},
		
		
		//Pessoa
		/**
		 * Retorna as pessoa d/ fundo
		 *
		 *@param idPessoa o id da pessoa que possui os Fundos.
		 */
		findPessoaFundoByIdentificador : function (identificador){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/fundo/'+ identificador);
		},
		
		//Pessoa
		/**
		 * Retorna as pessoa d/ fundo
		 *
		 *@param idPessoa o id da pessoa que possui os Fundos.
		 */
		pesquisarTipoFundos : function (){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/fundo/pesquisar-tipo-fundos');
		},
		

		
       findByIdentificador : function(identificador) {
			
			return $q(function(resolve,reject){
				
				$http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + identificador).success(function(p){
					if(p) {
						p.tipo = p.papeis.map(function(papel){
							return papel.descricao;
						}).join('/');
						p.papeis = p.papeis.filter(function(papel){
							return papel.descricao == 'Fundo'
						});
						resolve(p);
					} else {
						resolve();
					}
					
				}).error(reject);
				
			});
			
			
		},
		/**
		 * Excluir documento
		 * 
		 *@param idPessoa o id da pessoa que possui os dados empresariais.
		 */
		excluirDocumento : function(idDocumento) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/fundo/documento/' + idDocumento);
		},
		
		
		/**
		 * Salva os dados bancarios da pessoa_fundo
		 * 
		 * @param dadosBancarios
		 * @return  dadosBancarios
		 */
		insertDadosBancarios : function(dadosBancarios) {			
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/fundo/inserir-dados-bancario', dadosBancarios);
		},
		
		
		findDadosBancario : function(idPessoaFundo) {			
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/fundo/dados-bancario-carregar/' + idPessoaFundo);
		},
		
		/**
		 * Excluir dados bancarios
		 * 
		 *@param idContaCorrenteFundo
		 */
		exlcuirDadosBancarios : function(idContaCorrenteFundo) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/fundo/dados-bancario/' + idContaCorrenteFundo);
		},
		
		findDocsByFundo : function(idFundo){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/fundorel/documentos/' + idFundo);
		},
		
		insertPessoaFundoDocumento : function(fundoDocumento) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/fundo/documento/', fundoDocumento);
		},
		
		getAnexoPessoaFundoDocRel : function(idDoc) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/fundo/anexoFundo/' + idDoc);
		},
		
		atualizarDadosBancarios : function(dadosBancarios) {			
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/fundo/atualizar-dados-bancario', dadosBancarios);
		},
		
		consultarPessoaFundoConfig : function (pessoaFundo) {
			return configuracaoFundosService.consultarPessoaFundoConfig(pessoaFundo.id).then(function(retorno){
				if(retorno.data)
					return configuracaoFundosService.findByIdPessoaFundoConf(retorno.data.id);
				else
					var obj = { data: null };
					obj.data = {
						hrAutoservicoFim : null,
						hrAutoservicoIni : null,
						hrFuncionamentoFim : null,
						hrFuncionamentoIni : null,
						hrLimitePagamento : null,
						id : null,
						inAssGestoPgtoCessao : null,
						inEmiteDuplicata : null,
						inRemessaParcial : null,
						inRetornoRemessa : null,
						nrDiasBloqLtoEletronico : null,
						nrDiasBloqDpeAssinatura : null,
						nrDiasBloqLtoFisico : null,
						nrDiasCarencia : null,
						pessoaFundo : null,
						tpCendenteOperante : null,
						ROBO_HABILITADO : null,
						ROBO_VALOR_LIMITE : null
					};
					return obj;
			});
		},
		validarCadastro : function(pessoaFundo) {
			
			var services = [
				this.findPessoaFundoByIdentificador(pessoaFundo.pessoa.identificador),
    			relacionadaService.findAllPessoaRelacionadaByIdentificadorPessoa(pessoaFundo.pessoa.identificador),
    			this.findDadosBancario(pessoaFundo.id),
    			pessoaService.findEnderecoByIdentificadorAndTipoEndereco(pessoaFundo.pessoa.identificador, 'Fundo'),
    			configuracaoFundosService.consultarPessoaFundoConfig(pessoaFundo.id),
    			this.consultarPessoaFundoConfig(pessoaFundo)
    		];
						
			return $q(function (resolve,reject) {
				
				var abas = {
					dadosBasicosFundos : {
						erros:[]
					},
					enderecoFundos : {
						erros:[]
					},
					configuracaoFundos : {
						erros:[],
						hasAlert: false
					},
					dadosBancariosFundos : {
						erros:[]
					},
					prestadorServicoFundos : {
						erros:[]
					},
					hasErrors:function(){
						return (this.dadosBasicosFundos.erros.length || this.enderecoFundos.erros.length || this.configuracaoFundos.erros.length || this.dadosBancariosFundos.erros.length || this.prestadorServicoFundos.erros.length)
					}
				};
				
				$q.all(services).then(function(retornos) {
					var pessoaFundoRetorno = retornos[0].data;
					var prestadorRetorno = retornos[1].data;
					var bancoRetorno = retornos[2].data;
					var enderecoRetorno = retornos[3].data;
					var pessoaConfiguracaoRetorno = retornos[4].data;
					var tiposTituloAssociados = retornos[5].data;
				
					//Validações DADOS BÁSICOS
					if(!pessoaFundoRetorno.pessoa.identificador) {
						abas.dadosBasicosFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'cnpj'
						});
					}
					
					if(!pessoaFundoRetorno.pessoa.nomeRazao) {
						abas.dadosBasicosFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'nomeRazao'
						});
					}
					
					if(!pessoaFundoRetorno.nomeReduzido) {
						abas.dadosBasicosFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'nomeReduzido'
						});						
					}
					
					if(!pessoaFundoRetorno.codigo) {
						abas.dadosBasicosFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'codigo'
						});						
					}
					
					if(!pessoaFundoRetorno.ativo) {
						abas.dadosBasicosFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'ativo'
						});						
					}
					
					if(!pessoaFundoRetorno.dataSubscricaoInicial) {
						abas.dadosBasicosFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'dataSubscricaoInicial'
						});						
					}
					
					if(!pessoaFundoRetorno.dataEncerramento) {
						abas.dadosBasicosFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'dataEncerramento'
						});				
					}
					
					//Validações ENDERECO
					if(enderecoRetorno.pais == "Brasil" && !enderecoRetorno.cep) {
						abas.enderecoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'cep'
						});					
					}
					
					if(!enderecoRetorno.pais) {
						abas.enderecoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'pais'
						});					
					}
					
					if(!enderecoRetorno.estado) {
						abas.enderecoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'estado'
						});					
					}
					
					if(!enderecoRetorno.cidade) {
						abas.enderecoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'cidade'
						});					
					}
					
					if(!enderecoRetorno.bairro && enderecoRetorno.pais == "Brasil") {
						abas.enderecoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'bairro'
						});					
					}
					
					if(!enderecoRetorno.endereco) {
						abas.enderecoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'endereco'
						});					
					}
					
					//Validações CONFIGURAÇÃO
					if(!pessoaConfiguracaoRetorno.hrFuncionamentoFim) {
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'hrFuncionamentoFim'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.inAssGestoPgtoCessao) {
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'inAssGestoPgtoCessao'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.inRemessaParcial) {
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'inRemessaParcial'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.inRetornoRemessa) {
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'inRetornoRemessa'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.nrDiasCarencia && pessoaConfiguracaoRetorno.nrDiasCarencia != 0) { // ---------------------
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'nrDiasCarencia'
						});
					}
					 
					if(!pessoaConfiguracaoRetorno.nrDiasBloqLtoFisico && pessoaConfiguracaoRetorno.nrDiasBloqLtoFisico != 0) { // -----------------------
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'nrDiasBloqLtoFisico'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.nrDiasBloqLtoEletronico && pessoaConfiguracaoRetorno.nrDiasBloqLtoEletronico != 0) { // ------------------
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'nrDiasBloqLtoEletronico'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.nrDiasBloqDpeAssinatura && pessoaConfiguracaoRetorno.nrDiasBloqDpeAssinatura != 0) { // ------------------
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'nrDiasBloqDpeAssinatura'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.nrPrazoDiasIdentificacao && pessoaConfiguracaoRetorno.nrPrazoDiasIdentificacao != 0) { // -----------------------
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'nrPrazoDiasIdentificacao'
						});
					}
					
					if(!tiposTituloAssociados.length){
						abas.configuracaoFundos.hasAlert = true;
						abas.configuracaoFundos.erros.push({
							mensagem:'Ao menos um banco deve ser informado para direitos creditórios.'
						});	
					}
					
					
					if(!pessoaConfiguracaoRetorno.dtInicioOrigemMovFin){
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'dtInicioOrigemMovFin'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.inRecompraParcial){
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'inRecompraParcial'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.inLinhaLastroObrigatoria){
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'inLinhaLastroObrigatoria'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.inValorMinimoRecompra){
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'inValorMinimoRecompra'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.inValorMinimoPagamento){
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'inValorMinimoPagamento'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.inReapresentacaoAutomatica && pessoaConfiguracaoRetorno.inReapresentacaoAutomatica != 0){
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'inReapresentacaoAutomatica'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.inResolucao){
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'inResolucao'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.inRepasse){
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'inRepasse'
						});
					}
					
					if(!pessoaConfiguracaoRetorno.inSeguro){
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'inSeguro'
						});
					}
					
					if(pessoaConfiguracaoRetorno.inHabilitaRobo == null){
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'ROBO_HABILITADO'
						});
					}
					
					if((pessoaConfiguracaoRetorno.vlLimiteAutorizacaoRobo == null || 
							pessoaConfiguracaoRetorno.vlLimiteAutorizacaoRobo == 0) && pessoaConfiguracaoRetorno.inHabilitaRobo) {
						abas.configuracaoFundos.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'ROBO_VALOR_LIMITE'
						});
					}
					
					//Validações DADOS BANCÁRIOS
					if(!bancoRetorno.length) {
						abas.dadosBancariosFundos.erros.push({
							mensagem:'Ao menos uma conta corrente deve ser informada.'
						});							
					}
					
					//Validações PRESTADOR SERVIÇO
					
					if(!prestadorRetorno.length) {
						abas.prestadorServicoFundos.erros.push({
							tipo:'ADMINISTRADOR',
							mensagem:'Sincronização não realizada! O fundo deve possuir ao menos um prestador de serviço com o papel de “Administrador”.'
						});
						abas.prestadorServicoFundos.erros.push({
							tipo:'GESTOR',
							mensagem:'Sincronização não realizada! O fundo deve possuir ao menos um prestador de serviço com o papel de “Gestor”.'
						});
					}
					else {	
						if(!prestadorRetorno.some(function(relacionada){return relacionada.id.papel.descricao == 'ADMINISTRADOR'})){						
							abas.prestadorServicoFundos.erros.push({
								tipo:'ADMINISTRADOR',
								mensagem:'Sincronização não realizada! O fundo deve possuir ao menos um prestador de serviço com o papel de “Administrador”.'
							});
						}
						if(!prestadorRetorno.some(function(relacionada){return relacionada.id.papel.descricao == 'GESTOR'})){						
							abas.prestadorServicoFundos.erros.push({
								tipo:'GESTOR',
								mensagem:'Sincronização não realizada! O fundo deve possuir ao menos um prestador de serviço com o papel de “Gestor”.'
							});
						}
					}
					
					if(abas.hasErrors())
						reject(abas);
					else 
						resolve(abas);
						
				});
			});
		},
		concluir : function(cdFundo) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/fundo/concluir/' + cdFundo);
		}
	}
});