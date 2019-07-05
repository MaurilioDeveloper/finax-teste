angular.module('cadastro-central-module').directive('fileReader', function() {
	return {
		restrict : 'A',
		scope : {
			fileReader : "="
		},
		link : function(scope, element) {
			$(element).on('change', function(changeEvent) {
				var files = changeEvent.target.files;
				if (files.length) {
					var r = new FileReader();
					r.onload = function(e) {
						// split content based on new line
						var allTextLines = e.target.result.split(/\r\n|\n/);
						var lines = [];
						
						for (var i = 0; i < allTextLines.length; i++) {
							// split content based on comma
							var data;
							if (allTextLines[i].indexOf(',') != -1) {
								data = allTextLines[i].split(',');
							} else if(allTextLines[i].indexOf(';') != -1) {
								data = allTextLines[i].split(';');
							}
							if (data != null) {
								if (data.length == 2) {
									var tarr = [];
									for (var j = 0; j < 2; j++) {
										tarr.push(data[j]);
									}
									lines.push(tarr);
								} else {
									lines = "ARQUIVO_INCORRETO";
									break;
								}
							} else {
								lines = "ARQUIVO_INCORRETO";
								break;
							}
							
						}

						scope.$apply(function() {
							scope.fileReader = lines;
						});
					};

					r.readAsText(files[0]);
				}
			});
		}
	};
});