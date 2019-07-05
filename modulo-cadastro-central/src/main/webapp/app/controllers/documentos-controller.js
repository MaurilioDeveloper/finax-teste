angular.module('cadastro-central-module').controller('DocumentosCtrl', DocumentosCtrl);

DocumentosCtrl.$inject = ['$scope','$http', '$timeout','PATHCONFIG','$q','$state','notify','usSpinnerService','tipoService','pessoaService','dialogService','documentoService'];

function DocumentosCtrl($scope,$http,$timeout,PATHCONFIG,$q,$state,notify, usSpinnerService,tipoService,pessoaService, dialogService, documentoService) {
	
	var controller = this;
	
	controller.incluir = incluir;
	controller.editar = editar;
	controller.excluir = excluir;
	controller.cancelar = cancelar;
	controller.validarData = validarData;
	controller.validarGIIN = validarGIIN;
	controller.validarTipoDocumento = validarTipoDocumento;
	controller.validarDataVencimento = validarDataVencimento;
	controller.incluirDocumento = incluirDocumento;
	controller.excluirDocumento = excluirDocumento;
	controller.baixarDocumento = baixarDocumento;
	
	carregaDocumentosETiposDocumento();
	inicializaDocumento();
	
	controller.dateOptions = {
			formatDay:'dd',
			formatMonth:'MM',
			formatYear:'yyyy'
	}
	
	tipoService.getTipoEstados().success(function(estados){
		controller.estados = estados;
	});
	
	/**
	 * Salva os dados de um documento.
	 */
	function incluir() {
				
		var documento = angular.copy(controller.documento);
		
		documento.id.pessoa = {
			id:$scope.pessoaCtrl.pessoa.id
		};

		documento.filenameAnexo = $('input[type=file]').val().replace(/.*(\/|\\)/, '');
		
		pessoaService.insertPessoaDocumento(documento).success(function(documento){
			carregaDocumentosETiposDocumento();
			inicializaDocumento();
			$scope.pessoaCtrl.abas.documentos.erros = [];
		});
		
	}
	
	/**
	 * Carrega um documento para a área de edição.
	 * 
	 * @param documentoo documento a ser editado
	 */
	function editar(documento) {
		
		controller.tiposDocumento.push(documento.id.tipoDocumento);
		controller.documento = angular.copy(documento);
		
	}
	
	/**
	 * Cancela a operação de edição de documento.
	 */
	function cancelar() {
		inicializaDocumento();
		carregaDocumentosETiposDocumento();
	}
	
	/**
	 * Exclui um determinado documento da pessoa.
	 * 
	 * @param documento o documento a ser excluido
	 */
	function excluir(documento) {
		
		dialogService.show('Excluir','Deseja excluir o documento ' + documento.numeroDocumento + '?','Sim','Não').result.then(function(){
			
			pessoaService.excluirPessoaDocumento(
					documento.id.pessoa.id,
					documento.id.tipoDocumento.id).success(function(){
						carregaDocumentosETiposDocumento();
						inicializaDocumento();
					});
			
		});
		
		
	}
	
	/**
	 * Cria um novo objeto de documento.
	 */
	function inicializaDocumento() {
		
		/**
		 * Objeto que será utilizado para preenchimento
		 * dos dados da tela.
		 */
		controller.documento = {
			id:{
				tipoDocumento:{
					id:null
				}
			}
		};
		controller.tipoDocumento = {};
		controller.tipoDocumento.tipoPessoa = $scope.pessoaCtrl.pessoa.tipoPessoa;
		 $('#inputFile').val('');
		
	}
	
	/**
	 * Carrega a tabela de documentos e os tipos de documentos.
	 */
	function carregaDocumentosETiposDocumento() {
		
		$q.all([tipoService.getTiposDocumentoByTipoPessoa($scope.pessoaCtrl.pessoa.tipoPessoa),
				pessoaService.findPessoaDocumentos($scope.pessoaCtrl.pessoa.id),
				tipoService.getTiposDocumento()]).then(function(retornos){
					
			controller.documentos = retornos[1].data;
			controller.tiposDocumento = retornos[0].data;
			controller.tiposDocumento = controller.tiposDocumento.filter(function(tipoDocumento){
				return !controller.documentos.some(function(documento){
					return tipoDocumento.id == documento.id.tipoDocumento.id;
				});
			});
			controller.allDocumentosModal =  retornos[2].data;
			newOption = {id:"new", descricao:"Novo Tipo de Documento"};
			controller.tiposDocumento.unshift(newOption);
					
		});
		
	}
	
	function validarData(){
		var pastDate = moment(new Date()).subtract(120, 'years');
		if(controller.documento.dataEmissao){
			if(typeof controller.documento.dataEmissao == "string"){
				controller.documento.dataEmissao = moment(controller.documento.dataEmissao, 'DD/MM/YYYY');
			}
			if(!(controller.documento.dataEmissao >= pastDate && controller.documento.dataEmissao <= new Date())){
				if(controller.documento.dataEmissao > pastDate){
					notify({message:'A data de emissão do documento não pode ser superior à data atual!', classes:'alert-danger',position:'right'});
				}else{
					notify({message:'A data de emissão do documento não pode ser superior a 120 anos!', classes:'alert-danger',position:'right'});
				}
				controller.documento.dataEmissao = '';
			}else{
				if(controller.documento.dataEmissao._i){
					controller.documento.dataEmissao = controller.documento.dataEmissao._i;
				}
			}
		}
	}
	
	function validarDataVencimento(){
//		if(controller.documento.dataEmissao){
//			if(typeof controller.documento.dataEmissao == "string"){
//				controller.documento.dataEmissao = moment(controller.documento.dataEmissao, 'DD/MM/YYYY');
//			}
//		}
		
		if(controller.documento.dataVencimento){
			if(typeof controller.documento.dataVencimento == "string"){
				controller.documento.dataVencimento = moment(controller.documento.dataVencimento, 'DD/MM/YYYY');
			}
			if(typeof controller.documento.dataEmissao == "string"){
				controller.documento.dataEmissao = moment(controller.documento.dataEmissao, 'DD/MM/YYYY');
			}
			if(! (controller.documento.dataVencimento > controller.documento.dataEmissao)){
				notify({message:'A data de vencimento deve ser maior que a data de emissão do documento!', classes:'alert-danger',position:'right'});
				controller.documento.dataVencimento = '';
			}else{
				if(controller.documento.dataVencimento._i){
					controller.documento.dataVencimento = controller.documento.dataVencimento._i;
				}
				if(controller.documento.dataEmissao._i){
					controller.documento.dataEmissao = controller.documento.dataEmissao._i;
				}				
			}
		}
	}
	
	function validarGIIN(tipo){
		if(tipo == 'fullPath'){
			if(controller.documento.numeroDocumento.length == 19){
				//categoria da filial ou instituição financeira.
				var cf = controller.documento.numeroDocumento.substring(13,15);
				if(!(cf == 'LE' || cf == 'SL' || cf == 'ME' || cf == 'BR' || cf == 'SP' || cf == 'SF' || cf == 'SD' || cf == 'SS' || cf == 'SB')){
					notify({message:'O código GIIN é inválido!', classes:'alert-danger',position:'right'});
					controller.documento.numeroDocumento = '';
				}
			}else{
				notify({message:'O código GIIN é inválido!', classes:'alert-danger',position:'right'});
				controller.documento.numeroDocumento = '';
			}
		}else{
			controller.documento.numeroDocumento = controller.documento.numeroDocumento.toUpperCase();
			if(controller.documento.numeroDocumento.indexOf("O") !== -1){
				controller.documento.numeroDocumento = controller.documento.numeroDocumento.substring(0, controller.documento.numeroDocumento.length - 1);
			}
		}
		
	}

	function validarTipoDocumento(){
		if(controller.documento.id.tipoDocumento.id  == "new"){
			$timeout(function(){
				angular.element("#modalTipoDocumento").modal("show");	
				$scope.documentosCtrl.tipoDocumento.tipoPessoa = $scope.pessoaCtrl.pessoa.tipoPessoa;
				//$scope.pessoaCtrl.pessoa.tipoPessoa
			},250);
		}
	}
	
	function incluirDocumento(){
		
		var tipoDocumento = angular.copy(controller.tipoDocumento);
		
		documentoService.insertDocumento(tipoDocumento).success(function(tipoDocumento){
			if( angular.isObject(tipoDocumento)){
				carregaDocumentosETiposDocumento();
				inicializaDocumento();
				$timeout(function(){
					angular.element("#modalTipoDocumento").modal("hide");						
				},250);
			}else{
				notify({message:'Tipo de documento já cadastrado!', classes:'alert-danger',position:'right'});
			}	
		});
	}
	
	function excluirDocumento(documento){
		
		documentoService.excluirDocumento(documento.id).success(function(){
			carregaDocumentosETiposDocumento();
			inicializaDocumento();
		}).error(function(){
			notify({message:'Esse tipo de documento possui vínculo com outro registro e por isso não poderá ser excluído!!', classes:'alert-danger',position:'right'});
		});
	}
	
	function baixarDocumento(documento){
		var solution= documento.anexo.split(";base64,");
		var content = solution[0].split("data:");
		
        var a = document.createElement('a');
        
		var image_data = atob(solution[1]);
	    // Use typed arrays to convert the binary data to a Blob
	    var arraybuffer = new ArrayBuffer(image_data.length);
	    var view = new Uint8Array(arraybuffer);
	    for (var i=0; i<image_data.length; i++) {
	        view[i] = image_data.charCodeAt(i) & 0xff;
	    }
	    try {
	        // This is the recommended method:
	        var blob = new Blob([arraybuffer], {type: content[1]});
	    } catch (e) {
	        // The BlobBuilder API has been deprecated in favour of Blob, but older
	        // browsers don't know about the Blob constructor
	        // IE10 also supports BlobBuilder, but since the `Blob` constructor
	        //  also works, there's no need to add `MSBlobBuilder`.
	        var bb = new (window.WebKitBlobBuilder || window.MozBlobBuilder);
	        bb.append(arraybuffer);
	        var blob = bb.getBlob(content[1]); // <-- Here's the Blob
	    }

	    var string = documento.id.tipoDocumento.descricao + "_" + documento.numeroDocumento;
	    
	    a.href = window.URL.createObjectURL(blob);
	    a.download = documento.filenameAnexo;

        a.click();
	    
        
	}
	
	
}