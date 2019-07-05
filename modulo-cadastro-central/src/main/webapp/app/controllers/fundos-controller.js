angular.module('cadastro-central-module').controller('FundosCtrl', FundosCtrl);

FundosCtrl.$inject = ['$scope', '$http', '$timeout', 'PATHCONFIG', '$q', '$state', 'notify', 'usSpinnerService', 'pessoaService', 'dialogService', 'fundoService', '$filter'];
function FundosCtrl($scope, $http, $timeout, PATHCONFIG, $q, $state, notify, usSpinnerService, pessoaService, dialogService, fundoService, $filter) {

	var controller = this;
	controller.fundo = {};
	controller.fundoModal = {};
	controller.novoFundoModal = {};
	
	
	controller.vincularFundo = function() {
		var fundo = angular.copy(controller.fundo);
		
		fundo.idPessoa = $scope.pessoaCtrl.pessoa.id;
		
		pessoaService.insertPessoaFundo(fundo)
		.success(function(fundo) {
			notify({message:'Fundo cadastrado com sucesso.', classes:'alert-success',position:'right'});
			carregaFundosPessoa();
			limparFundo();
		}).error(function(error) {
			notify({message:'Fundo já cadastrado.', classes:'alert-danger', position:'right'});
			limparFundo();
		});
		
	};

	controller.editarFundo = function(fundoEdit) {
		$timeout(function() {
			angular.element("#modalFundoDocumento").modal("show");
		}, 250);
		
		controller.novoFundoModal = {};
		controller.novoFundoModal.dataDocumento = $filter('date')(new Date(), 'dd/MM/yyyy');
		$('#inputDocumento').val('');
		controller.fundoModal = fundoEdit;
	}
	
	controller.excluirFundo = function(fundo) {
		var cnpjFormat = fundo.cnpjFundo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,"\$1.\$2.\$3\/\$4\-\$5");
		
		var modalValues = {
			titulo : 'Excluir',
			mensagem : 'Deseja excluir o fundo ' + cnpjFormat + ' ' + fundo.nomeFundo + '? Atenção todos os documentos vinculados a esse fundo, serão excluídos.',
			botaoSim : 'Sim',
			botaoNao : 'Não'
		}
		dialogService.show(modalValues.titulo, modalValues.mensagem, modalValues.botaoSim, modalValues.botaoNao)
		.result.then(function() {
			pessoaService.excluirPessoaFundo(fundo.idPessoa, fundo.cnpjFundo)
			.success(function(){
				carregaFundosPessoa();
				limparFundo();
			});
		});
	}
	
	controller.cancelar = function () {
		limparFundo();
	}
	
	controller.buscarFundo = function() {
		if(controller.fundo.cnpjFundo != null){
			fundoService.findFundoByCNPJ(controller.fundo.cnpjFundo)
			.success(function(retorno) {
				if (angular.isObject(retorno)) {
					controller.fundo.cnpjFundo = retorno.pessoa.identificador;
					controller.fundo.nomeFundo = retorno.pessoa.nomeRazao;
				} else {
					notify({message:'Fundo não Cadastrado', classes:'alert-danger',position:'right'});
					limparFundo();
				}
			});
		}
	}
	
	controller.incluirDocumento = function(form) {
		
		var data = $filter('date')(controller.novoFundoModal.dataDocumento, "yyyy-MM-dd");
		var filenameAnexo = $('#inputDocumento').val().replace(/.*(\/|\\)/, '');
		
		var request = {
			idPessoaFundo : controller.fundoModal.id,
			descricao : controller.novoFundoModal.descricao,
			anexo : controller.novoFundoModal.anexo,
			dataDocumento : data,
			filenameAnexo : filenameAnexo
		}
		
		if (form.$valid) {
			fundoService.insertPessoaFundoDocumento(request)
			.success(function(data) {
				controller.fundoModal.documentos.push(data.pessoaFundoDocRelVO);
				carregaFundosPessoa();
				
				controller.novoFundoModal.descricao = '';
				controller.novoFundoModal.anexo = '';
				controller.novoFundoModal.dataDocumento = '';
				$('#inputDocumento').val('');
			}).error(function(error) {
				console.log(error);
			});
		} else {
			notify({message:'Preencha os campos obrigatórios.', classes:'alert-danger',position:'right'});
		}
		
	}
	
	controller.validarData = function(){
		try {
			var pastDate = moment(new Date()).subtract(120, 'years');
			if (controller.novoFundoModal.dataDocumento) {
				if (typeof controller.novoFundoModal.dataDocumento == "string") {
					controller.novoFundoModal.dataDocumento = moment(controller.novoFundoModal.dataDocumento, 'DD/MM/YYYY');
				}
				if (!(controller.novoFundoModal.dataDocumento >= pastDate && controller.novoFundoModal.dataDocumento <= new Date())) {
					if (controller.novoFundoModal.dataDocumento > pastDate) {
						notify({message:'A data de emissão do documento não pode ser superior à data atual!', classes:'alert-danger',position:'right'});
					} else {
						notify({message:'A data de emissão do documento não pode ser superior a 120 anos!', classes:'alert-danger',position:'right'});
					}
					controller.novoFundoModal.dataDocumento = '';
				} else {
					if (controller.novoFundoModal.dataDocumento._i) {
						controller.novoFundoModal.dataDocumento = controller.novoFundoModal.dataDocumento._i;
					}
				}
			}
		} catch (e) {
			console.log(e);
		}
	}

	controller.excluirDocumento = function(documento, fundo) {
		var nomeFundo = '';
		var cpfCnpjFundo = '';
		var removerDocumento = false;
		
		if (fundo) {
			nomeFundo = fundo.nomeFundo;
			cpfCnpjFundo = fundo.cnpjFundo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,"\$1.\$2.\$3\/\$4\-\$5");
		} else {
			nomeFundo = controller.fundoModal.nomeFundo;
			cpfCnpjFundo = controller.fundoModal.cnpjFundo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,"\$1.\$2.\$3\/\$4\-\$5");
			removerDocumento = true;
		}

		var modalValues = {
			titulo : 'Excluir',
			mensagem : 'Deseja excluir o documento de ' + documento.descricao + ' vinculado ao fundo ' + cpfCnpjFundo + ' ' + nomeFundo + '?',
			botaoSim : 'Sim',
			botaoNao : 'Não'
		}
		dialogService.show(modalValues.titulo, modalValues.mensagem, modalValues.botaoSim, modalValues.botaoNao)
		.result.then(function() {
			fundoService.excluirDocumento(documento.id).success(function() {
				carregaFundosPessoa();
				if (removerDocumento) {
					var indiceDocumento = controller.fundoModal.documentos.indexOf(documento);
					controller.fundoModal.documentos.splice(indiceDocumento, 1);
				}
			});
		});
	}
	
	controller.baixarDocumento = function(documento) {
		fundoService.getAnexoPessoaFundoDocRel(documento.id)
		.success(function(data) {
			
			var solution= data.anexo.split(";base64,");
			var content = solution[0].split("data:");
			var a = document.createElement('a');
			var image_data = atob(solution[1]);
			var arraybuffer = new ArrayBuffer(image_data.length);
			var view = new Uint8Array(arraybuffer);
			for (var i=0; i<image_data.length; i++) {
				view[i] = image_data.charCodeAt(i) & 0xff;
			}
			try {
				var blob = new Blob([arraybuffer], {type: content[1]});
			} catch (e) {
				var bb = new (window.WebKitBlobBuilder || window.MozBlobBuilder);
				bb.append(arraybuffer);
				var blob = bb.getBlob(content[1]);
			}
			a.href = window.URL.createObjectURL(blob);
			a.download = data.filenameAnexo;
			a.click();
		}).error(function(error) {
			notify({message:'Não foi possível baixar o documento!', classes:'alert-danger',position:'right'});
			console.log(error);
		});
	}
	
	function limparFundo() {
		controller.fundo = {};
	}
	
	function carregaFundosPessoa() {
		$q.all([pessoaService.findPessoaFundos($scope.pessoaCtrl.pessoa.id)])
		.then(function(retorno) {
			controller.fundos = retorno[0].data;
		});
	}
	
	carregaFundosPessoa();

}