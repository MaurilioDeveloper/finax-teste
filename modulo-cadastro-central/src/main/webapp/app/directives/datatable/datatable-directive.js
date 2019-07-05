angular.module('datatable',[]).directive('datatable',['$log', function($log) {
	
	return {
		restrict: 'A',
		templateUrl: '/modulo-cadastro-central/app/directives/datatable/datatable.html',
		replace: true,
		transclude: true,
		scope:{
			anchor: '@',
			rest:'@',
			restExport:'@',
			lazy:'=',
			rows:'@',
			paginator:'=paginator',
			styleClass:'@class',
			datasource:'=',
			parentDataSourceName:'@datasource',
			filterModel:'=',
			filterSubmit:'@',
			filterValidator:'&',
			maxSize:'@',
			exportSubmit:'@',
			showTotal:'@',
			rowSelector:'=',
			onError:'&',
			dontSearchOnLoad:'='
		},
		controller: 'dataTableController',
		link: function(scope, element, attrs,ctrl,transclude) {
			
			if(scope.filterValidator() == undefined)
				scope.filterValidator = function(){ return true };
				
			//Validação sendo feita pelo 'parentDataSourceName', pois o 'datasource' chegava undefined no PN mesmo quando declarado
			if(!scope.parentDataSourceName) throw new Error(
					'DataTableDirectiveError: É necessário informar o model da controller, que será o datasource para o preenchimento da tabela.');
			if(scope.lazy) {
				if(!scope.rest) throw new Error(
					'DataTableDirectiveError: Para tabelas que são carregadas sob demanada, deve ser fornecido o endereço do serviço rest correspondente ao conteúdo que será carregado. Ex.: /meucontexto/rest/elementos');
			} else {
				if(scope.rest) throw new Error(
					'DataTableDirectiveError: Foi fornecido o serviço rest corresponde ao conteúdo que será carregado, mas o atributo lazy é falso ou não foi definido.');
			}
			
			if(!scope.rows) scope.rows = 10; //Default
			if(!scope.paginator) scope.paginator = false; //Default
			if(scope.lazy) {
				if(!scope.filterModel) scope.filterModel = {}; //Default 				
			}
			if(scope.showTotal == undefined) {
				scope.showTotal = 'true'; //Default
			}
			
		}
	}
		
}]).controller('dataTableController',['$scope','$http','$interpolate','$log', '$location', '$anchorScroll','usSpinnerService', '$timeout', function($scope, $http, $interpolate, $log, $location, $anchorScroll,usSpinnerService, $timeout){
	
		var _stop = false;
		var _originalContent = []; //Varíavel de backup de todos os itens. Só é utilizado quando o carregamento não é sob demanda (lazy = false)
		var _firstTimeLoaded = false; //Flag indicando o primeiro carregamento de itens

		$scope.page = {
			page : 1,
			total : 0,
			content : []
		}
		
		if (!$scope.dontSearchOnLoad) {
			$timeout(function(){
				_load();
			});
		}
		
		//Observa por eventos de click no elemento responsável por invocar a filtragem da tabela
		angular.element($scope.filterSubmit).bind('click', function(){
			
			if($scope.lazy && $scope.filterValidator()) {
				$scope.page.page = 1;
				$scope.sortable = undefined;
				_buildRestURL();
				_getLazyData();
			}
			
		});
		
		//Observa por eventos de click no elemento responsável por invocar a exportação para relatório da página
		angular.element($scope.exportSubmit).bind('click', function() {
			if($scope.lazy) {
				_buildRestExportURL();
				_downloadData();
			}
		});
		
		$scope.$on('refreshDataTable',function(){
			_firstTimeLoaded = false;
			_load();
		});
		
		$scope.$on('cleanDataTable',function(){
			$scope.page = {
				page : 1,
				total : 0,
				content : []
			}
		});
		
		/**
		 * Ao mudar de página no datatable.
		 */
		$scope.pageChanged = function() {
			if($scope.lazy) {
				_buildRestURL();
				_getLazyData();
			}else{
				_paginate();
			}
			
			$location.hash($scope.anchor);
			$anchorScroll();
			$location.hash('');
		}	
		
		/**
		 * Realiza a ordenação de acordo com o critério
		 * de ordenação que foi requisitado.
		 * 
		 * @param sortable critério de ordenação
		 */
		this.sort = function(sortable) {
			
			$scope.sortable = sortable;
			
			if($scope.lazy) {
				_buildRestURL();
				_getLazyData();				
			} else {
				_sortInMemory();
				_filterAllByStr($scope.filterModel); //Foi realizado a ordenação, então filtra caso possua algum filtro
				if($scope.paginator) {
					_paginate(); //Pagina os itens ordenados e filtrados em memória					
				}
				$scope.$apply();
			}
			
		}
	
		/**
		 * Recupera o conteúdo sob demanda.
		 */
		function _getLazyData() {
			var loadingContent = '<i class="fa fa-spinner fa-pulse"></i>';
			var buttonContent = angular.element($scope.filterSubmit).html();
			
			angular.element($scope.filterSubmit).html(loadingContent);
			angular.element($scope.filterSubmit).attr("disabled",true);
			
			usSpinnerService.spin("spinner-1");
			$http.get(encodeURI($scope.rest)).success(function(page) {
				if(!_firstTimeLoaded) {
					_firstTimeLoaded = true; //Agora já foi carregado pela primeira vez
				}
				$scope.page = page;
				$scope.datasource = page.content;
			}).error(function(erro){
				$log.error("Não foi possível recuperar o conteudo.");
				angular.element($scope.filterSubmit).removeAttr("disabled");
				angular.element($scope.filterSubmit).html(buttonContent);
				$scope.onError({msg:erro});
			})['finally'](function(){
				usSpinnerService.stop("spinner-1");
				angular.element($scope.filterSubmit).removeAttr("disabled");
				angular.element($scope.filterSubmit).html(buttonContent);
			});
			
		}
		
		
		/**
		 * 
		 */
		function _load() {
			
			if(!$scope.lazy) {
				
				$scope.$watch('datasource',function(newDataSource,oldDataSource){
					if(newDataSource && newDataSource.length //Se existir contéudo novo
							&& !_firstTimeLoaded) { //É a primeira vez que está sendo carregado
						
						_originalContent = newDataSource; //Guarda os itens no primeiro carregamento
						_firstTimeLoaded = true; //Agora já foi carregado pela primeira vez
						
						$scope.page.content = newDataSource;
						$scope.page.total = newDataSource.length;
						
						if($scope.paginator) {
							_paginate();							
						}
						
					}
				},true);
				
				//Caso não seja carregamento sob demanda, o filter model irá atuar de maneira
				//diferente, ele será monitorado, e toda vez que houver mudança irá filtrar todo
				//o conteúdo independente da paginação.
				$scope.$watch('filterModel',function(value){
					_filterAllByStr(value);
				});
				
			} else {
				_buildRestURL();
				_getLazyData();				
			}							
		
		}
		
		/**
		 * Exporta o conteúdo para um relatório.
		 */
		function _downloadData() {
			
			var link = angular.element('<a></a>').get(0);
			link.setAttribute('href',encodeURI($scope.restExport));
			link.setAttribute('target','_self');
			angular.element(document.body).append(link);
			link.click();
			
		}
		
		/**
		 * Realiza a filtragem de todos os itens, não somente o que
		 * está sendo exibido na página atual. Será buscado em todas
		 * as propriedades de cada objeto, caso o valor de alguma propriedade case com
		 * o conteúdo pesquisado será considerado um resultado válido
		 * e portando será exibido.
		 */
		function _filterAllByStr(value) {
			
			//Garante que existe algum valor digitado no filtro
			if(value) {
				
				//Faz a filtragem do conteúdo original, o qual nunca sofre alteração
				$scope.page.content =  _originalContent.filter(function(data){
					for(prop in data) {
						if((data[prop] + '').toUpperCase().match(value.toUpperCase())){
							return true;
						}
					}
					return false;
				});
				
				if($scope.paginator) {
					$scope.page.total = $scope.page.content.length;
					_paginate();					
				} else {
					$scope.datasource = $scope.page.content;
				}
				
			//Caso o filtro esteja vazio e não seja nulo, quer dizer que o usuário
			//apagou o conteúdo do campo de filtro. 
			} else if(value != null){
				$scope.page.content = angular.copy(_originalContent); //Recupera o conteúdo original que foi guardado no primeiro carregamento
				
				if($scope.paginator) {
					$scope.page.total = $scope.page.content.length;
					_paginate();					
				} else {
					$scope.datasource = angular.copy($scope.page.content);
				}
				
			}
			
			
			
		}
		
		/**
		 * Ordena a lista de itens em memória de acordo
		 * com a coluna clicada.
		 */
		function _sortInMemory() {
			
			$scope.page.content = _originalContent;
			var column = $scope.sortable.column;
			var order = $scope.sortable.order;
			
			if(order == 'asc') {
				$scope.page.content.sort(function(data1,data2){					
					var columns = column.split('.');
					
					var d1 = "data1";
					var d2 = "data2";
					
					columns.forEach(function(column){
						d1 += '["' + column + '"]';
						d2 += '["' + column + '"]';
					});
					
					try {
						eval(d1);
					} catch(Error) {
						return -1
					}
					
					try {
						eval(d2)
					} catch(Error) {
						return 1;
					}
					
					if(eval(d1) == null) {
						return -1;
					}
					
					if(eval(d2) == null) {
						return 1;
					}
					
					
					//Se tiver o formato de uma data
					if(eval(d1) instanceof String && eval(d1).match(/\d{2}\/\d{2}\/\d{4}/)
							&& eval(d2).match(/\d{2}\/\d{2}\/\d{4}/)) {
						var date1 = moment(eval(d1),'DD/MM/YYYY');
						var date2 = moment(eval(d2),'DD/MM/YYYY');
						if(date1.isAfter(date2)) {
							return 1;
						} else if (date1.isBefore(date2)) {
							return -1;
						} else {
							return 0;
						}
					//Se for numeros
					} else if (!isNaN(parseFloat(eval(d1))) && !isNaN(parseFloat(eval(d2)))) {
						if(Number(eval(d1)) > Number(eval(d2))) {
							return 1;
						} else if(Number(eval(d1)) == Number(eval(d2))) {
							return 0;
						} else {
							return -1;
						}		
					//Se for texto
					} else {
						if(eval(d1).toUpperCase() > eval(d2).toUpperCase()) {
							return 1;
						} else if(eval(d1).toUpperCase() == eval(d2).toUpperCase()) {
							return 0;
						} else {
							return -1;
						}						
					}
					
					
				});
			} else {
				$scope.page.content.sort(function(data1,data2){
					
					var columns = column.split('.');
					
					var d1 = "data1";
					var d2 = "data2";
					
					columns.forEach(function(column){
						d1 += '["' + column + '"]';
						d2 += '["' + column + '"]';
					});
					
					try {
						eval(d1);
					} catch(Error) {
						return 1
					}
					
					try {
						eval(d2)
					} catch(Error) {
						return -1;
					}
					
					if(eval(d1) == null) {
						return 1;
					}
					
					if(eval(d2) == null) {
						return -1;
					}
					
					if(eval(d1) instanceof String && eval(d1).match(/\d{2}\/\d{2}\/\d{4}/)
							&& eval(d2).match(/\d{2}\/\d{2}\/\d{4}/)) {
						var date1 = moment(eval(d1),'DD/MM/YYYY');
						var date2 = moment(eval(d2),'DD/MM/YYYY');
						if(date1.isAfter(date2)) {
							return -1;
						} else if (date1.isBefore(date2)) {
							return 1;
						} else {
							return 0;
						}
					//Se for numeros
					} else if (!isNaN(parseFloat(eval(d1))) && !isNaN(parseFloat(eval(d2)))) {
						if(Number(eval(d1)) > Number(eval(d2))) {
							return -1;
						} else if(Number(eval(d1)) == Number(eval(d2))) {
							return 0;
						} else {
							return 1;
						}	
					} else {
						if(eval(d1).toUpperCase() > eval(d2).toUpperCase()) {
							return -1;
						} else if(eval(d1).toUpperCase() == eval(d2).toUpperCase()) {
							return 0;
						} else {
							return 1;
						}									
					}
					
				});				
			}
		
		}
		
		/**
		 * Constrói a url para chamado do serviço de carregamento
		 * de conteúdo sob demanda, de acordo com a página atual, quantidade
		 * de linhas na tabela, e os filtros caso existam.
		 * 
		 * @return a url formatada com as query params de paginação e filtragem
		 */
		
		function _buildRestURL() {
			
			//Reset URL
			var restURL = $scope.rest.split('?')[0];
			
			restURL += '?page=' + $scope.page.page + '&rows=' + $scope.rows;
			
			//Se houver filtro
			if($scope.filterModel) {
				restURL += '&filters=' + angular.toJson($scope.filterModel);
			} else {
				restURL += '&filters={}';
			}
			
			//Se houver ordenação
			if($scope.sortable) {
				restURL += '&field=' + $scope.sortable['column'] + '&order=' + $scope.sortable['order'];
			} 
			
			$scope.rest = restURL;
		}
		
		/**
		 * Constrói a url para chamado do serviço de carregamento
		 * de conteúdo que será exportado para um arquivo de relatório,
		 * de acordo com os filtros caso existam.
		 */
		function _buildRestExportURL() {
			
			//Reset URL
			var restURL = $scope.restExport.split('?')[0];
			
			restURL += '?page=' + 0 + '&rows=' + 0;
			
			//Se houver filtro
			if($scope.filterModel) {
				restURL += '&filters=' + angular.toJson($scope.filterModel);
			} else {
				restURL += '&filters={}';
			}
			
			//Se houver ordenação
			if($scope.sortable) {
				restURL += '&field=' + $scope.sortable['column'] + '&order=' + $scope.sortable['order'];
			} 
			
			$scope.restExport = restURL;
			
		}
		
		/**
		 * Realiza a paginação do conteúdo que foi recuperado
		 * e está na memória.
		 */
		function _paginate() {
			
			var _fistPageResult = ($scope.page.page - 1) * $scope.rows;
			var _lastPageResult = _fistPageResult + Number($scope.rows);
			
			$scope.datasource = $scope.page.content.slice(
					_fistPageResult, _lastPageResult);
			
		}
	
}]).directive('sortable',function(){
	return {
		require:'^datatable',
		controller: 'sortableController',
		link:function(scope,element,attrs,dataTableCtrl){
			
			element.css('cursor','pointer');
			
			var sortable = {
				column:attrs.sortable,	
				order:'none'
			}
			
			element.bind('click',function(event){
				
				element.parent().find('i').remove();
				scope.changeOrder(sortable);
				
				if(sortable.order == 'asc') 
					element.append('<i class="glyphicon glyphicon-sort-by-attributes" style="margin-left:5px"></i>');
				else 
					element.append('<i class="glyphicon glyphicon-sort-by-attributes-alt" style="margin-left:5px"></i>');
								
				dataTableCtrl.sort(sortable);					
				
			});
			
			
		}
	}
}).controller('sortableController',['$scope',function($scope) {
	
	/**
	 * Muda a ordem de ordenação.
	 * 
	 * @param sortable o elemento de ordenação
	 */
	$scope.changeOrder = function(sortable) {
		
		if(sortable.order == 'asc')
			sortable.order = 'desc';
		else 
			sortable.order = 'asc';
			
	}
	
}]).directive('datatableBody',['$timeout',function($timeout){
	
	return {
		restrict:'A',
		link:function(scope,element,attrs){
			
			$timeout(function(){
				adjustLayout();		
				bindTableHeaderAndBodyScroll();				
			});
			
			angular.element(window).resize(function(){
				setTimeout(function(){
					adjustLayout();
					bindTableHeaderAndBodyScroll();
				},500);
			});
			
			/**
			 * Recupera o elemento avô da tabela onde a diretiva está, pega
			 * a sua altura e subtrai 35px, que é o espaço ocupado pela diretiva
			 * datatable.
			 */
			function adjustLayout() {
				angular.element(element).parent().css(
						'height',angular.element(element)
							.parent().parent().height() - 35 + 'px');
			}
			
			/**
			 * Vincula o scroll horizontal realizado na tabela interna
			 * para o scroll horizontal da tabela que forma o cabeçalho.
			 * Dessa forma quando for realizado um scroll horizontal, ambos,
			 * header e table sofrerão a mesma quantidade de deslocamento.
			 */
			function bindTableHeaderAndBodyScroll() {
				
				angular.element(element).parent().unbind();
				
				var scrollLeftLimit = angular.element(element).parent().parent().find('[datatable]').find('table').width() 
				- angular.element(element).parent().parent().find('[datatable]').width();
	
				angular.element(element).parent().on('scroll',function(){
					
					if(angular.element(this).scrollLeft() <= scrollLeftLimit){
						angular.element(this).parent().find('[datatable]').scrollLeft(
								angular.element(this).scrollLeft());						
					} else {
						angular.element(this).scrollLeft(scrollLeftLimit);
					}
					
				});
				
			}
			
		}
	
	}
	
	
}]);