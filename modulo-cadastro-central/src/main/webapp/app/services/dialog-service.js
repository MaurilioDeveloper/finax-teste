angular.module('cadastro-central-module').service('dialogService',['$modal', function($modal) {
	
	this.show = function (title, msg, positiveLabel, negativeLabel) {
		
		return  $modal.open({
	    	template: '<div class="modal-content"  >' +
	    				'<div class="modal-header">' +
	    					'<h3 class="modal-title" style="border-bottom: none;">{{title}}</h3>' +
						    '</div>' +
						    '<div class="modal-body" >' +
						        '{{msg}}' +
						    '</div>' +
						    '<div class="modal-footer">' + 
						       (positiveLabel ?  '<button class="btn btn-primary" ng-click="ok()">' + positiveLabel + '</button>' : '') +
						       (negativeLabel ? '<button class="btn btn-default" ng-click="cancelar()">' + negativeLabel + '</button>' : '') +
						    '</div>' +
						 '</div>',
            	controller: function($scope, $modalInstance){
	    		$scope.title = title;
	    		$scope.msg = msg;
	    		$scope.ok = function(){
	    			$modalInstance.close();
	    		};
	    		$scope.cancelar = function() {
	    			$modalInstance.dismiss('cancel');
	    		};
	    	}
	    });
	    
	};
	
	this.showWithWarning = function (title, msg, warning, positiveLabel, negativeLabel) {
		
		return  $modal.open({
	    	template: '<div class="modal-content"  >' +
	    				'<div class="modal-header">' +
	    					'<h3 class="modal-title" style="border-bottom: none;">{{title}}</h3>' +
						    '</div>' +
						    '<div class="modal-body" >' +
						        '{{msg}}' +
						        '<br>' +
						    	'<b>{{warning}}</b>' +
						    '<div class="modal-footer">' + 
						       (positiveLabel ?  '<button class="btn btn-primary" ng-click="ok()">' + positiveLabel + '</button>' : '') +
						       (negativeLabel ? '<button class="btn btn-default" ng-click="cancelar()">' + negativeLabel + '</button>' : '') +
						    '</div>' +
						 '</div>',
            	controller: function($scope, $modalInstance){
	    		$scope.title = title;
	    		$scope.msg = msg;
	    		$scope.warning = warning;
	    		$scope.ok = function(){
	    			$modalInstance.close();
	    		};
	    		$scope.cancelar = function() {
	    			$modalInstance.dismiss('cancel');
	    		};
	    	}
	    });
	    
	};
	
	this.showWithJustificativa = function (title, msg) {
		return  $modal.open({
	    	template: '<div class="modal-content"  >' +
	    				'<div class="modal-header">' +
	    					'<h3 class="modal-title" style="border-bottom: none;">{{title}}</h3>' +
						    '</div>' +
						    '<div class="modal-body" >' +
						        '<div class="row">' +
									'<form name="formComentario">' +
										'<div class="form-group col-lg-12 col-md-12 col-sm-12 col-xs-12"> ' +
											'<label>{{msg}}</label>'+
											'<textarea style="width: inherit; height: 100px;" ng-model="justificativaExclusao" name="inputComentario" maxlength="255"></textarea>' +
										'</div>' +
									'</form>'+
								'</div>'+
						    '</div>' +
						    '<div class="modal-footer">' +
						        '<button ng-disabled="!justificativaExclusao" class="btn btn-primary" type="button" ng-click="ok()">Concluir</button>' +
						        '<button class="btn btn-default" ng-click="cancelar()">Cancelar</button>' +
						    '</div>' +
						 '</div>',
            	controller: function($scope, $modalInstance){
		    		$scope.title = title;
		    		$scope.msg = msg;
		    		$scope.ok = function(){
		    			$modalInstance.close($scope.justificativaExclusao);
		    		};
		    		$scope.cancelar = function() {
		    			$modalInstance.dismiss('cancel');
		    		};
            	}
	    });
	    
	};
}]);