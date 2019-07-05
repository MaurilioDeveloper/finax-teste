angular.module('cadastro-central-module').factory('pessoaService',function($http, PATHCONFIG, $filter,$q,$state,$timeout,papelService){
	return {
		//PESSOA
		/**
		 * Encontra todas as pessoas
		 */
		findAll : function() {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/');
		},
		
		/**
		 * Encontra uma pessoa pelo identificador COM FILTRO DE PAPEL
		 * 
		 * @param identificador o identificador da pessoa
		 */
		findByIdentificador : function(identificador) {
			
			return $q(function(resolve,reject){
				
				$http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + identificador).success(function(p){
					if(p) {
						p.tipo = p.papeis.map(function(papel){
							return papel.descricao;
						}).join('/');
						resolve(p);
					} else {
						resolve();
					}
					
				}).error(reject);
				
			});
			
			
		},
		
		/**
		 * Encontra uma pessoa pelo identificador SEM FILTRO DE PAPEL
		 * 
		 * @param identificador o identificador da pessoa
		 */
		findByIdentificadorPessoa : function(identificador) {
			return $q(function(resolve,reject){
				
				$http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + identificador).success(function(p){
					if(p) {
						resolve(p);
					} else {
						resolve();
					}
					
				}).error(reject);
				
			});
		},
		
		/**
		 * Exclui uma pessoa da base de dados.
		 */
		excluirPessoa : function(idPessoa) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + idPessoa);
		},
		
		/**
		 * Exclui uma pessoa da base de dados.
		 */
		excluirPessoaCliente : function(idPessoa) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/cliente/' + idPessoa);
		},
		
		/**
		 * Exclui um determinado relaciomento
		 * 
		 * @param idPessoa o id da pessoa 
		 * @param idPessoaRelacionada o id da pessoa Relacionada
		 */
		excluirPessoaRelacionada : function(pessoaRelacionada) {
			return $http({
				url:PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/relacionada',
				method:'DELETE',
				data:pessoaRelacionada,
				headers:{
					'Content-Type':'application/json'
				}
			});
		},
		
		/**
		 * Conclui o cadastro da pessoa a integra ao MATERA.
		 */
		concluir : function(idPessoa) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/concluir/' + idPessoa);
		},
		
		/**
		 * Valida os dados e conclui o cadastro 
		 */
		validarCadastro : function(pessoa) {
			var idPapelProcurador = 8;
			//Chamar aqui todos os serviços referente todas as abas
			//para verificar as validações
			var services = [this.findPessoaDocumentos(pessoa.id),
			                this.findPessoaInfFinanceiras(pessoa.id),
			                this.findByIdentificador(pessoa.identificador),
			                this.findNacionalidadesByPessoa(pessoa.id),
			                this.findPessoaDadosBancarios(pessoa.id),
			                this.findEnderecosByPessoa(pessoa.id),
			                this.findContatoTelefonesByPessoa(pessoa.id),
			                this.findPessoaAfirmacoes(pessoa.id),
			                this.findMatrimonioByPessoa(pessoa.id),
			                this.findFiliacaoByPessoa(pessoa.id),
			                this.findPessoaRespostaSuitabilityByPessoa(pessoa.id),
			                this.findPessoasRelacionadasPessoaPapel(pessoa.id, idPapelProcurador)];
			
			return $q(function(resolve,reject){
				
				//Objeto contendo todas as abas e uma lista de erros para cada uma.
				var abas = {
					documentos : {
						erros:[]
					},
					infFinanceiras : {
						erros:[]
					},
					dadosPessoais : {
						erros:[]
					},
					dadosBancarios : {
						erros:[]
					},
					enderecos : {
						erros:[]
					},
					contatos : {
						erros:[]
					},
					afirmacoes : {
						erros:[]
					},
					filiacaoConjuge : {
						erros:[]
					},
					perfil : {
						erros:[]
					},
					pessoasRelacionadas : {
						erros:[]
					},					
					hasErrors:function(){
						if(this.documentos.erros.length
								|| this.infFinanceiras.erros.length
								|| this.dadosPessoais.erros.length
								|| this.dadosBancarios.erros.length
								|| this.enderecos.erros.length
								|| this.contatos.erros.length
								|| this.afirmacoes.erros.length
								|| this.filiacaoConjuge.erros.length
								|| this.perfil.erros.length
								|| this.pessoasRelacionadas.erros.length)
							return true;
						else 
							return false;
					}
				};
				
				$q.all(services).then(function(retornos){
					
					var documentos = retornos[0].data;
					var infFinanceiras = retornos[1].data;
					var pessoa = retornos[2];
					var nacionalidades = retornos[3].data;
					var dadosBancarios = retornos[4].data;
					var enderecos = retornos[5].data;
					var contatos = retornos[6].data;
					var afirmacoes = retornos[7].data;
					var pessoaMatrimonio = retornos[8].data;
					var filiacaoConjuge = retornos[9].data;
					var perfil = retornos[10].data;
					var pessoasRelacionadas = retornos[11].data;
					
					//Validações DOCUMENTOS
					if(pessoa.tipoPessoa == 'F' && !documentos.length) {
						abas.documentos.erros.push({
							mensagem:'Ao menos um documento para PF deve ser informado!'							
						});
					}
					
					//Validações INFORMAÇÕES FINANCEIRAS
					if(pessoa.tipoPessoa == 'F' && !infFinanceiras.length) {
						abas.infFinanceiras.erros.push({
							mensagem:'Ao menos um rendimento deve ser informado!'
						});							
					}
					
					if(pessoa.tipoPessoa == 'F' && infFinanceiras.length > 0) {
						infFinanceiras.forEach(function(rendimentoPessoa){
							if(!rendimentoPessoa.referencia){						
								abas.infFinanceiras.erros.push({
									mensagem:'Os campos valor atual e referência devem ser informados para o rendimento ' + rendimentoPessoa.descricaoRendimento + '!'
								});
							}
						});						
					}
					
					if(pessoa.tipoPessoa == 'J' && (!infFinanceiras.length || !infFinanceiras[0].dataBaseFaturamento)){					
						abas.infFinanceiras.erros.push({
							mensagem:'Os campos de intervalo do faturamento médio mensal devem ser informados!',
							campo:'faturamentoMensal'
						});
					}
					
					if(pessoa.tipoPessoa == 'J' && (!infFinanceiras.length || !infFinanceiras[0].dataBaseCapitalSocial)){					
						abas.infFinanceiras.erros.push({
							mensagem:'O campo data base do patrimônio líquido deve ser informado!',
							campo:'capitalSocial'
						});
					}
					
					if(pessoa.tipoPessoa == 'J' && (!infFinanceiras.length || !infFinanceiras[0].dataBasePatrimonioLiquido)){						
						abas.infFinanceiras.erros.push({
							mensagem:'O campo data base do faturamento mensal deve ser informado!',
							campo:'patrimonioLiquido'
						});
					}
					
					if(pessoa.tipoPessoa == 'J' && (!infFinanceiras.length || !infFinanceiras[0].porteEmpresa)){						
						abas.infFinanceiras.erros.push({
							mensagem:'O campo data base do faturamento mensal deve ser informado!',
							campo:'porteEmpresa'
						});
					}					
					
					if(pessoa.tipoPessoa == 'J' && (!infFinanceiras.length || !infFinanceiras[0].faturamentoBrutoAnual)){						
						abas.infFinanceiras.erros.push({
							mensagem:'O campo data base do faturamento mensal deve ser informado!',
							campo:'vlFaturamentoBrutoAnual'
						});
					}	
					
					if(pessoa.tipoPessoa == 'J' && (!infFinanceiras.length || !infFinanceiras[0].faturamentoMensal)){						
						abas.infFinanceiras.erros.push({
							mensagem:'O campo data base do faturamento mensal deve ser informado!',
							campo:'vlFaturamentoMensal'
						});
					}
					
					if(pessoa.tipoPessoa == 'J' && (!infFinanceiras.length || !infFinanceiras[0].patrimonioLiquido)){						
						abas.infFinanceiras.erros.push({
							mensagem:'O campo data base do faturamento mensal deve ser informado!',
							campo:'vlPatrimonioLiquido'
						});
					}						
					
					//Validações DADOS PESSOAIS
					if(!pessoa.dataNascConstituicao) {
						abas.dadosPessoais.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'dataNascConstituicao'
						});
					}
					
					if(pessoa.tipoPessoa == 'F' && !pessoa.sexo ) {
						abas.dadosPessoais.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'sexo'
						});
					}
					 
					if(!pessoa.nomeRazao){
						
						abas.dadosPessoais.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'nome'
						});
					}
					
					if(pessoa.tipoPessoa == 'F' && nacionalidades.length){
						//retorna o numero de nacionalidades abdicadas
						var numNA = nacionalidades.filter(function(nacionalidade){
							return nacionalidade.abdicouNacionalidade == 1;
						}).length;
						
						if(numNA == nacionalidades.length){
							abas.dadosPessoais.erros.push({
								mensagem:'Ao menos uma nacionalidade sem abdicação deve ser informada!'							
							});
						}
					}
					
					//Dados EMPRESA
					if(pessoa.tipoPessoa == 'J' && !pessoa.pais){
						abas.dadosPessoais.erros.push({
							mensagem:'Os campos obrigatórios devem ser preenchidos!',
							campo:'pais'
						});
					}
					
					//Validações ENDERECOS
					if(!enderecos.length) {
						abas.enderecos.erros.push({
							mensagem:'Ao menos um endereço deve ser informado!'
						});							
					}
					
					var contCorresp = 0; // contador para saber se a lista de endereço tem mais que um endereço para correspondencia.
					enderecos.forEach(function(endereco){
						if(endereco.enderecoCorrespondencia == '1'){						
							contCorresp = contCorresp + 1;
						}
					});
					
					if(contCorresp == 0) {
						abas.enderecos.erros.push({
							mensagem:'Ao menos um endereço para correspondência deve ser informado!'
						});							
					}
					
					if(contCorresp > 1) {
						abas.enderecos.erros.push({
							mensagem:'Somente um endereço para correspondência deve ser informado!'
						});							
					}
						
					//Validações CONTATOS TELEFONES
					if(!contatos.length) {
						abas.contatos.erros.push({
							mensagem:'Ao menos um telefone deve ser informado!'
						});							
					}
					
					//Validações AFIRMACOES
					if(!afirmacoes.autorizaConsultaSCR
					|| !afirmacoes.autorizaCorrespondencia
					|| !afirmacoes.autorizaEnvioExtrato
					|| !afirmacoes.pessoaPoliticaExposta
					|| !afirmacoes.relacionamentoPessoaExposta) {
						abas.afirmacoes.erros.push({
							mensagem:'Todas as respostas das afirmações devem ser informadas!'
						});							
					}
					
					//Validações DADOS BANCÁRIOS
					if(!dadosBancarios.length) {
						
						abas.dadosBancarios.erros.push({
							mensagem:'Ao menos uma conta bancária deve ser informada!'
						});
						
					} else {
						
						var qtdePrefLiquid = dadosBancarios.filter(function(dadosBancario){
							return dadosBancario.preferenciaLiquidacao == 'S';
						}).length;
						
						if(!qtdePrefLiquid || qtdePrefLiquid > 1) {
							abas.dadosBancarios.erros.push({
								mensagem:'Ao menos uma, e somente uma, conta bancária como preferência de liquidação deve ser informada!'
							});
						}
						
					}
					
					//Validações FILIAÇÃO/CONJUGE
					if(pessoa.tipoPessoa == 'F' && !filiacaoConjuge.nomeMae) {
						abas.filiacaoConjuge.erros.push({
							campo:'nomeMae',
							mensagem:'Os campos obrigatórios devem ser preenchidos!'
						});
					}
					
					if(pessoa.estadoCivil == 'Casado(a)') {
						if(!pessoaMatrimonio.nomeConjuge) {
							abas.filiacaoConjuge.erros.push({
								campo:'nomeConjuge',
								mensagem:'Os campos obrigatórios devem ser preenchidos!'
							});						
						}
						
						if(!pessoaMatrimonio.cpfConjuge) {
							abas.filiacaoConjuge.erros.push({
								campo:'cpfConjuge',
								mensagem:'Os campos obrigatórios devem ser preenchidos!'
							});
						}
						
						if(!pessoaMatrimonio.regimeCasamento) {
							abas.filiacaoConjuge.erros.push({
								campo:'regimeCasamento',
								mensagem:'Os campos obrigatórios devem ser preenchidos!'
							});
						}
					}
					
					//Validações AFIRMACOES
					if(pessoa.papeis.some(function(papel){
						return papel.descricao == 'Cotista';
					}) && !perfil.length) {
						abas.perfil.erros.push({
							mensagem:'Todas as respostas do Perfil Investidor devem ser informadas!'
						});							
					}
					
					//Validações PESSOASRELACIONADAS					
					if (pessoa.tipoPessoa == 'F' && pessoa.dataNascConstituicao != null){
						var anoNascConstituicao = pessoa.dataNascConstituicao.split("/");
						var idade = new Date().getFullYear() - anoNascConstituicao[2];
						
						if (idade > 15 && idade < 18 && !pessoasRelacionadas.length){						
							abas.pessoasRelacionadas.erros.push({
								mensagem:'O cliente é menor de 18 anos. Um procurador deve ser informado!'
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
		
		gerarPdf: function(pessoa){
			return $http({
				method:'GET',
				responseType: 'arraybuffer',
				url:PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/gerarPdf/' + pessoa.id
			})
		},
		
		/**
		 * Insere uma nova pessoa
		 * 
		 * @param pessoa a pessoa com as informações
		 */
		insertPessoa : function(pessoa){
			var infPessoa = angular.copy(pessoa);
			
			infPessoa.dataNascConstituicao = infPessoa.dataNascConstituicao && typeof infPessoa.dataNascConstituicao == "object" ? moment(infPessoa.dataNascConstituicao).format('DD/MM/YYYY') : infPessoa.dataNascConstituicao;  
			infPessoa.dataInicioRelacionamento = infPessoa.dataInicioRelacionamento && typeof infPessoa.dataInicioRelacionamento == "object" ? moment(infPessoa.dataInicioRelacionamento).format('DD/MM/YYYY') : infPessoa.dataInicioRelacionamento;
			infPessoa.dataFimRelacionamento = infPessoa.dataFimRelacionamento && typeof infPessoa.dataFimRelacionamento == "object" ? moment(infPessoa.dataFimRelacionamento).format('DD/MM/YYYY') : infPessoa.dataFimRelacionamento;
			
			return $q(function(resolve,reject){
				
				$http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/', infPessoa).success(function(p){
					if(p) {
						p.tipo = p.papeis.map(function(papel){
							return papel.descricao;
						}).join('/');
						resolve(p);
					} else {
						resolve();
					}
				}).error(reject);
				
			});
		},
		
		//DADOS EMPRESA
		/**
		 * Retorna os dados da empresa da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui os dados empresariais.
		 */
		findDadosEmpresaByPessoa : function(idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa + '/dados-empresa');
		},
		
		/**
		 * Insere os dados empresariais da  pessoa
		 * 
		 * @param pessoaDadosEmpresa os dados empresariais da pessoa contendo as informações
		 */
		insertPessoaDadosEmpresa : function(pessoaDadosEmpresa){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/dados-empresa/', pessoaDadosEmpresa);
		},
		
		//NACIONALIDADE
		/**
		 * Retorna as nacionalidades da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui as nacionalidades.
		 */
		findNacionalidadesByPessoa : function (idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa+'/nacionalidade');
		},
		
		/**
		 * Insere os dados empresariais da  pessoa
		 * 
		 * @param pessoaDadosEmpresa os dados empresariais da pessoa contendo as informações
		 */
		insertPessoaPerfil : function(perfil){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/perfil/', perfil);
		},
		
		//NACIONALIDADE
		/**
		 * Retorna as nacionalidades da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui as nacionalidades.
		 */
		findPerfilByPessoa : function (idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa+'/perfil');
		},
		
		/**
		 * Insere uma nacionaliade pra pessoa
		 * 
		 * @param pessoaNacionalidade a nacionalidade da pessoa contendo as informações
		 */
		insertPessoaNacionalidade : function (pessoaNacionalidade){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/nacionalidade/', pessoaNacionalidade);
		},
		
		/**
		 * Excluir a nacionalidade de uma pessoa pelo id da nacionalidade.
		 *
		 *@param idNacionalidade o id que referencia a nacionalidade da pessoa
		 */
		excluirPessoaNacionalidade : function (idPessoaNacionalidade){
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/nacionalidade/' + idPessoaNacionalidade);
		},
		
		//DOCUMENTOS
		/**
		 * Retorna os documentos da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui os documentos.
		 */
		findDocumentosByPessoa : function (idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa+'/documento');
		},
			
		/**
		 * Insere um documento pra pessoa
		 * 
		 * @param pessoaDocumento o documento da pessoa contendo as informações
		 */
		insertPessoaDocumento : function (pessoaDocumento){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/documento/', pessoaDocumento);
		},
		
		/**
		 * Excluir o documento de uma pessoa pelo id do documento.
		 *
		 *@param idDocumento o id que referencia o documento da pessoa
		 */
		excluirPessoaDocumento : function (idPessoaDocumento){
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/documento/' + idPessoaDocumento);
		},
		
		//ENDERECO
		/**
		 * Retorna os enderecos da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui os enderecos.
		 */
		findEnderecosByPessoa : function (idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa+'/endereco');
		},
			
		findEnderecoByIdentificadorAndTipoEndereco : function (identificador, tpEndereco){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ identificador+'/endereco/' + tpEndereco);
		},
		
		findPessoaEnderecoByTipoFundo : function(identificador) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/findPessoaEnderecoByTipoFundo/'+ identificador);
		},
		
		/**
		 * Retorna os enderecos da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui os enderecos.
		 */
		findEnderecosByPessoaSemEnderecoFundo : function (idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa+'/endereco-sem-fundo');
		},
			
		/**
		 * Insere um endereco pra pessoa
		 * 
		 * @param pessoaEndereco o telefone da pessoa contendo as informações
		 */
		insertPessoaEndereco : function (pessoaEndereco){
			
			var pessoaEnd = angular.copy(pessoaEndereco);
			
			if(pessoaEndereco.pais){
				if(pessoaEndereco.pais.nome){
					pessoaEnd.pais = pessoaEndereco.pais.nome;
				}
			}
			
			if(pessoaEndereco.estado){
				if(pessoaEndereco.estado.nome){
					pessoaEnd.estado = pessoaEndereco.estado.nome ? pessoaEndereco.estado.nome : pessoaEndereco.estado;
				}
			}
			
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/endereco/', pessoaEnd);
		},
		
		/**
		 * Excluir o endereco de uma pessoa pelo id do endereco.
		 *
		 *@param idEndereco o id que referencia o endereco da pessoa
		 */
		deletePessoaEndereco : function (idPessoaEndereco){
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/endereco/' + idPessoaEndereco);
		},
		
		//Questionario Suitability
		/**
		 * Retorna a resposta Suitability da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui os enderecos.
		 */
		findPessoaRespostaSuitabilityByPessoa : function (idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa+'/suitability');
		},
		
		/**
		 * Retorna o resultado Suitability da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui os enderecos.
		 */
		findPessoaResultadoSuitabilityByPessoa : function (idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa+'/suitability/resultado');
		},
			
		/**
		 * Insere um endereco pra pessoa
		 * 
		 * @param pessoaEndereco o telefone da pessoa contendo as informações
		 */
		insertPessoaRespostaSuitability : function (pessoaResposta){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/suitability/', pessoaResposta);
		},
		
		//Questionario Fatca
		/**
		 * Retorna a resposta Fatca da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui os enderecos.
		 */
		findPessoaRespostaFatcaByPessoa : function (idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa+'/fatca');
		},
			
		/**
		 * Insere um resposta Fatca pra pessoa
		 * 
		 * @param pessoaEndereco o telefone da pessoa contendo as informações
		 */
		insertPessoaRespostaFatca : function (pessoaResposta){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/fatca/', pessoaResposta);
		},
		
		//DADOS PROFISSIONAIS
		/**
		 * Retorna os dados profissionais da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui os dados profissionais.
		 */
		findDadosProfissionaisByPessoa : function(idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa + '/dados-profissionais');
		},
		
		/**
		 * Insere os dados profissionais da pessoa
		 * 
		 * @param pessoaDadosProfissionais o dado profissional da pessoa contendo as informações
		 */
		insertPessoaDadosProfissionais : function(pessoaDadosProfissionais){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/dadosProfissionais/', pessoaDadosProfissionais);
		},
		
		//RAMO ATIVIDADE
		/**
		 * Retorna a descrição de um ramo atraves do cnae
		 * 
		 * @param cnae o CNAE para obter o seu ramo atividade
		 */
		findRamoAtividade : function(cnae){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/dados-profissionais/busca/' + cnae);
		},
		
		/**
		 * Retorna os ramos de atividade da pessoa
		 * 
		 * @param idPessoa o registro de ramo atividade para pessoa
		 */
		findRamoAtividadeByPessoa: function(idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa + '/ramo-atividade');
		},
		
		/**
		 * Insere um ramo atividade para pessoa
		 * 
		 * @param ramoAtividade o ramo atividade contendo as informações
		 */
		insertRamoAtividade : function(ramoAtividade){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/ramo-atividade/', ramoAtividade);
		},
		
		//FILIACAO
		/**
		 * Retorna a filiacao sda pessoa
		 *
		 *@param idPessoa o id da pessoa que possui a filiacao.
		 */
		findFiliacaoByPessoa : function(idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa + '/filiacao');
		},
		
		/**
		 * Insere uma filiacao pra pessoa
		 * 
		 * @param pessoaFiliacao a filiacao da pessoa contendo as informações
		 */
		insertPessoaFiliacao : function(pessoaFiliacao){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/filiacao/', pessoaFiliacao);
		},
		
		//CONJUGE
		/**
		 * Retorna os dados matrimoniais da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui o matrimonio.
		 */
		findMatrimonioByPessoa : function(idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa+'/matrimonio');
		},
		
		/**
		 * Insere um matrimonio pra pessoa
		 * 
		 * @param pessoaMatrimonio o matrimonio da pessoa contendo as informações
		 */
		insertPessoaMatrimonio : function(pessoaMatrimonio){
			var matrimonio = angular.copy(pessoaMatrimonio);
			matrimonio.dataNascimento = matrimonio.dataNascimento && typeof matrimonio.dataNascimento == "object"  ? moment(matrimonio.dataNascimento).format('DD/MM/YYYY') : matrimonio.dataNascimento;  
		
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/matrimonio/', matrimonio);
		},
		
		//TELEFONES
		/**
		 * Retorna os telefones da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui os telefones.
		 */
		findContatoTelefonesByPessoa : function (idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa+'/contato-telefones');
		},
			
		/**
		 * Insere um telefone pra pessoa
		 * 
		 * @param pessoaTelefone o telefone da pessoa contendo as informações
		 */
		insertPessoaContatoTelefone : function (pessoaContatoTelefone){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/contato-telefone/', pessoaContatoTelefone);
		},
		
		/**
		 * Excluir o telefone de uma pessoa pelo id do telefone.
		 *
		 *@param idTelefone o id que referencia o telefone da pessoa
		 */
		excluirPessoaContatoTelefone : function (idPessoaContatoTelefone){
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/contato-telefone/' + idPessoaContatoTelefone);
		},
		
		//CONTATOS
		/**
		 * Retorna os contatos da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui os contatos.
		 */
		findContatoEmailsByPessoa : function (idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa+'/contato-emails');
		},
			
		/**
		 * Insere um contato pra pessoa
		 * 
		 * @param pessoaContato o contato da pessoa contendo as informações
		 */
		insertPessoaContatoEmail : function (pessoaContatoEmail){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/contato-email/', pessoaContatoEmail);
		},
		
		/**
		 * Excluir o contato de uma pessoa pelo id do contato.
		 *
		 *@param idContato o id que referencia o contato da pessoa
		 */
		excluirPessoaContatoEmail : function (idPessoaContatoEmail){
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/contato-email/' + idPessoaContatoEmail);
		},
		
		//IMOVEL
		/**
		 * Retorna os imoveis da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui os imoveis.
		 */
		findImoveisByPessoa : function (idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa+'/imovel');
		},
		
		/**
		 * Insere um imovel pra pessoa
		 * 
		 * @param pessoaImovel o imoel da pessoa contendo as informações
		 */
		insertPessoaImovel: function (pessoaImovel){
			
			var pessoaImo = angular.copy(pessoaImovel);
			if(pessoaImo.pais && pessoaImo.pais.nome){
				pessoaImo.pais = pessoaImo.pais.nome;
			}
			if(pessoaImo.uf && pessoaImo.uf.id){
				pessoaImo.uf = pessoaImo.uf.id ? pessoaImo.uf.id : pessoaImo.uf; 
			}
			
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/imovel/', pessoaImo);
			
		},
		
		/**
		 * Excluir o imovel de uma pessoa pelo id do imovel.
		 *
		 *@param idMovel o id que referencia o imovel da pessoa
		 */
		excluirPessoaImovel : function (idPessoaImovel){
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/imovel/' + idPessoaImovel);
		},
				
		//BEM
		/**
		 * Retorna os bens da pessoa
		 *
		 *@param idPessoa o id da pessoa que possui os bens.
		 */
		findBensByPessoa : function (idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/'+ idPessoa+'/bem');
		},
				
		/**
		 * Insere um bem pra pessoa
		 * 
		 * @param pessoaBem o bem da pessoa contendo as informações
		 */
		insertPessoaBem: function (pessoaBem){
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/bem/', pessoaBem);
		},
		
		/**
		 * Excluir um bem de uma pessoa 
		 *
		 *@param idBem o id que referencia o bem da pessoa
		 */
		excluirPessoaBem : function (idPessoaBem){
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/bem/' + idPessoaBem);
		},
		
		//PARTICIPACAO EMPRESA
		/**
		 * Insere uma nova participação para a pessoa.
		 * 
		 * @param participacaoEmpresa a participação contendo as informações
		 */
		insertPessoaParticipacaoEmpresa : function(participacaoEmpresa) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/participacao-empresa',participacaoEmpresa);
		},
		
		/**
		 * Busca todas as participacoes da pessoa.
		 * 
		 * @param idPessoa o id da pessoa
		 * @return as participacoes
		 */
		findPessoaParticipacaoEmpresasByIdPessoa : function(idPessoa) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + idPessoa + '/pessoa-participacao-empresas');
		},
		
		/**
		 * Excluir a participação de uma pessoa.
		 * 
		 * @param idParticipacaoEmpresa o id da participação
		 */
		excluirPessoaParticipacaoEmpresa : function(idParticipacaoEmpresa) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/participacao-empresa/' + idParticipacaoEmpresa);
		},
		
		//INFORMAÇÕES FINANCEIRAS
		/**
		 * Insere uma nova informação financeira para a pessoa.
		 * 
		 * @param infFinanceira a informacao financeira
		 */
		insertPessoaInfFinanceira : function(infFinan) {
			
			var infFinanceira = angular.copy(infFinan);
			
			infFinanceira.dataBaseFaturamento =	infFinanceira.dataBaseFaturamento && typeof infFinanceira.dataBaseFaturamento == "object" ? moment(infFinanceira.dataBaseFaturamento).format('DD/MM/YYYY') : infFinanceira.dataBaseFaturamento;  
			infFinanceira.dataFaturamentoMedioMensalDe = infFinanceira.dataFaturamentoMedioMensalDe && typeof infFinanceira.dataFaturamentoMedioMensalDe == "object" ? moment(infFinanceira.dataFaturamentoMedioMensalDe).format('DD/MM/YYYY') : infFinanceira.dataFaturamentoMedioMensalDe;
			infFinanceira.dataFaturamentoMedioMensalAte = infFinanceira.dataFaturamentoMedioMensalAte && typeof infFinanceira.dataFaturamentoMedioMensalAte == "object" ? moment(infFinanceira.dataFaturamentoMedioMensalAte).format('DD/MM/YYYY') : infFinanceira.dataFaturamentoMedioMensalAte;
			infFinanceira.dataBaseCapitalSocial = infFinanceira.dataBaseCapitalSocial && typeof infFinanceira.dataBaseCapitalSocial == "object" ? moment(infFinanceira.dataBaseCapitalSocial).format('DD/MM/YYYY') : infFinanceira.dataBaseCapitalSocial;
			infFinanceira.dataBasePatrimonioLiquido = infFinanceira.dataBasePatrimonioLiquido && typeof infFinanceira.dataBasePatrimonioLiquido == "object" ? moment(infFinanceira.dataBasePatrimonioLiquido).format('DD/MM/YYYY') : infFinanceira.dataBasePatrimonioLiquido; 
			
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/informacao-financeira',infFinanceira);
		},
		
		/**
		 * Busca todas as informações financeiras da pessoa.
		 * 
		 * @param idPessoa o id da pessoa
		 * @return as informacoes financeiras da pessoa
		 */
		findPessoaInfFinanceiras : function(idPessoa) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + idPessoa + '/informacoes-financeiras');
		},
		
		/**
		 * Exclui uma informacao financeira.
		 * 
		 * @param idInfFinanceira o id da informação financeira
		 */
		excluirPessoaInfFinanceira : function(idInfFinanceira) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/informacao-financeira/' + idInfFinanceira);
		},
		
		//AFIRMACOES
		/**
		 * Busca todas as informações de afirmações da pessoa.
		 * 
		 * @param idPessoa o id da pessoa
		 * @return as informacoes financeiras da pessoa
		 */
		findPessoaAfirmacoes : function(idPessoa){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + idPessoa + '/afirmacao');
		},
		
		/**
		 * Insere ou atualiza as afirmações da pessoa
		 * 
		 * @param pessoaAfirmacao a informacao financeira
		 */
		insertPessoaAfirmacao : function(pessoaAfirmacao) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/afirmacao',pessoaAfirmacao);
		},
		
		//PESSOAS RELACIONADAS
		
		insertPessoaRelacionada : function (pessoaRelacionadas){

			var relacionamentos = angular.copy(pessoaRelacionadas);

			relacionamentos.forEach(function (relacionamento) {
				if(relacionamento.dataIniRelacionamento && typeof relacionamento.dataIniRelacionamento == 'object')
					relacionamento.dataIniRelacionamento = moment(relacionamento.dataIniRelacionamento).format('DD/MM/YYYY');
				if(relacionamento.dataFimRelacionamento && typeof relacionamento.dataFimRelacionamento == 'object')
					relacionamento.dataFimRelacionamento = moment(relacionamento.dataFimRelacionamento).format('DD/MM/YYYY');
			});

			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/relacionada/', relacionamentos);
		},
		
		findPessoasRelacionadas : function(idPessoa) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + idPessoa + '/relacionada/');
		},
		
		/**
		 * Busca todos os relacionamentos de uma pessoa por um papel especifico.
		 *
		 * @param idPessoa o id da pessoa
		 * @param idPapel o id do papel
		 * @return os relacionamentos da pessoa
		 */		
		findPessoasRelacionadasPessoaPapel : function(idPessoa, idPapel) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + idPessoa + '/' + idPapel + '/relacionada/');
		},		
		
		/**
		 * Insere novos dados bancarios para a pessoa.
		 * 
		 * @param infFinanceira os dados bancarios
		 */
		insertPessoaDadosBancario : function(dadosBancario) {
			
			var dadosBanc = angular.copy(dadosBancario);
			
			delete dadosBanc.agencia;
			delete dadosBanc.banco;
			
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/dados-bancario',dadosBanc);
		},
		
		/**
		 * Busca todos os dados bancarios da pessoa.
		 * 
		 * @param idPessoa o id da pessoa
		 */
		findPessoaDadosBancarios : function(idPessoa) { 
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' +  idPessoa + '/dados-bancarios');
		},
		
		/**
		 * Exclui os dados bancario;
		 * 
		 * @param idDadosBancario o id dos dados bancarios
		 */
		excluirPessoaDadosBancario : function(idDadosBancario) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/dados-bancario/' + idDadosBancario);
		},
		
		/**
		 * Busca todos os documentos cadastrados para a pessoa.
		 *  
		 * @param idPessoa o id da pessoa
		 */
		findPessoaDocumentos : function(idPessoa) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + idPessoa + '/documentos/');
		},
		
		/**
		 * Salva os dados de um documento de uma pessoa.
		 * 
		 * @param pessoaDocumento o documento
		 * @return o documento salvado
		 */
		insertPessoaDocumento : function(documento) {				
			documento.dataEmissao = documento.dataEmissao && typeof documento.dataEmissao == "object"  ?  moment(documento.dataEmissao).format('DD/MM/YYYY') : documento.dataEmissao;
			
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/documentos',documento);
		},
		
		/**
		 * Exclui um determinado documento de uma pessoa.
		 * 
		 * @param idPessoa o id da pessoa 
		 * @param idTipoDocumento o id do tipo de documento
		 */
		excluirPessoaDocumento : function(idPessoa, idTipoDocumento) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/documentos?idPessoa=' + idPessoa + '&idTipoDocumento=' + idTipoDocumento);
		},

		/**
		 * Busca todos os fundos cadastrados para a pessoa.
		 *  
		 * @param idPessoa o id da pessoa
		 */
		findPessoaFundos : function(idPessoa) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + idPessoa + '/fundos/');
		},
		
		/**
		 * Salva os dados de um fundo de uma pessoa.
		 * 
		 * @param pessoaFundo o fundo
		 * @return o fundo salvado
		 */
		insertPessoaFundo : function(fundo) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/fundos',fundo);
		},
		
		/**
		 * Exclui um determinado fundo de uma pessoa.
		 * 
		 * @param idPessoa o id da pessoa 
		 * @param idFundo o id do fundo
		 */
		excluirPessoaFundo : function(idPessoa, cnpjFundo) {
			return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/fundos?idPessoa=' + idPessoa + '&cnpjFundo=' + cnpjFundo);
		},
		
		/**
		 * Salva os dados referente ao patrimonio
		 * do cliente.
		 *
		 * @return {*}
		 */
		atualizaTipoDeclaracaoPessoa : function (pessoa) {
			return $http.put(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/tipo-declaracao',pessoa);
		},
		

		/**
		 * Busca todas as atualizações cadastrais da pessoa.
		 *  
		 * @param idPessoa o id da pessoa
		 */
		findPessoaAtualizacaoCadastral : function(idPessoa) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + idPessoa + '/atualizacao/');
		},
		
		/**
		 * Salva os dados referente a Atualização Cadastral.
		 *  
		 * @param idPessoa o id da pessoa
		 */
		atualizaPessoaAtualizacaoCadastral : function(idPessoa) {
			return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + idPessoa + '/atualizacao/');
		},
		
		/**
		 * Busca todos os fundos cadastrados para a pessoa.
		 *  
		 * @param idPessoa o id da pessoa
		 */
		findContatoExclusivo : function(idPessoa) {
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pessoa/' + idPessoa + '/contato-exclusivo/');
		},
		
		
		goIncluirPessoaCarregada : function(tab,pessoaPai,pessoaASerCarregada,isPessoaRelacionada,isEditandoRelacionado,funcaoVoltar) {
			
			var _papeis = [];
			
			papelService.findAll().success(function(papeis){
				_papeis = papeis.sort(function(papel1,papel2){
					return papel1.descricao > papel2.descricao;
				});
				
				$state.go('root.incluir',{
					tab:tab,
					pessoaRelacionada:isPessoaRelacionada,
					acao:'I',
					identificador:null,
					identificadorPai:pessoaPai.identificador,
					tipoPessoa:pessoaPai.tipoPessoa,
					_papeis : _papeis
				},{reload:true}).then(function(f){
					
					$timeout(function(){
						
						var scope = angular.element('#tabIncluir').scope();					
						
						scope.pessoaCtrl.pessoa = {
							identificador:pessoaASerCarregada.identificador,
							tipoPessoa:pessoaASerCarregada.tipoPessoa,
							papeis:[]
						};
						
						//Utilizado para desabilitar as checkboxes da tela de edição da pessoa relacionada
						scope.pessoaCtrl.editandoRelacionado = isEditandoRelacionado;
						
						scope.pessoaCtrl.voltar = funcaoVoltar;
						
						scope.pessoaCtrl.buildCheckboxPapeis();
						
						scope.pessoaCtrl.buscaPessoa();
						
					});
				});
				

			});
			
		}
	
	}
});