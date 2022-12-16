/***********************************************************************
							INIT METHODS								
***********************************************************************/
$(document).ready(function(){
	initMapaAmbits();
});
function initMapaAmbits(){
	$(".tab-content.cercaAmbitEspecialitzacio .js-collapseClick").on('click', function(e){
		searchParams={
			idioma : getCurrentLanguage(),
			/*tipus : ["fitxa", "grup"],*/
			ambit_especialitzacio: $(this).attr('data_ambit')
		}
		var targetElement = $(this).parents(".collapse").find(".wrap-richText");
		UOCSearchEngine.query(searchParams, targetElement);
	});
	$(".tab-content.cercaAmbitGeneral .js-collapseClick").on('click', function(e){
		searchParams={
			idioma : getCurrentLanguage(),
			/*tipus : ["fitxa", "grup"],*/
			ambit: $(this).attr('data_ambit')
		}
		var targetElement = $(this).parents(".collapse").find(".wrap-richText");
		UOCSearchEngine.query(searchParams, targetElement);
	});
}
/***********************************************************************
							UTILS METHODS								
***********************************************************************/
function getCurrentLanguage(){
	var lang = document.documentElement.lang;
	if(lang == null){
		lang = 'ca';
	}
	return lang;
}
/***********************************************************************
							GENERATE PDF								
***********************************************************************/
async function printPDF(title, description, content) {

	var printContents = $(content).html();
	var printWindow = window.open();
	printWindow.document.write('<html><head>');
	printWindow.document.write('<link rel="stylesheet" href="//cv.uoc.edu/UOC/GEFv2/gef/css/gef.css"></link>');
	printWindow.document.write('<link rel="stylesheet" type="text/css" href="/css/styles.css"></link>');
	printWindow.document.write('<link rel="stylesheet" type="text/css" href="/css/alternative.css"></link>');
	printWindow.document.write('<title>UOC R&I Print</title></head>');

	printWindow.document.write('<body><div class="pdf-rule"><img src="/img/print-logo.png" alt="logo" style="width: 100%; max-height: none !important; height: auto !important;"><div class="center">');
	printWindow.document.write('<h2>'+title+'</h2>');
	printWindow.document.write('<h4>'+description+'</h4></div>');
	printWindow.document.write(printContents);
	printWindow.document.write('</div></body></html>');

	await new Promise(r => setTimeout(r, 1000));

	printWindow.document.close();
	printWindow.print();
}

/***********************************************************************
							SEARCH METHODS								
***********************************************************************/
var UOCSearchEngine = {
	endPointURI: apiPlatacon + "/api/search",
	query: function(searchParams, targetElement){
		var url = UOCSearchEngine.buildQuery(searchParams);
		$.ajax({
			url: url,
		}).done(
			function(data, returnCode, request){
				if(data.hits.found == 0){
					targetElement.html("<p style='font-style:italic'>"+literals.results.noresults[getCurrentLanguage()]+"</p>");
				} else {
					var items=data.hits.hit;
					var result="<div class='card-in-acordeon'><div class='row'>";
					let groupsFound=false;
					//sort returned grups by name
					items.sort(function (a, b) {
						//nom_grup could be null if the element is a pdi element
						let nameGroupA = a.fields.nom_grup != null ? a.fields.nom_grup : "";
						let nameGroupB = b.fields.nom_grup != null ? b.fields.nom_grup : "";
						return nameGroupA.localeCompare(nameGroupB);
					});
					for (var i = 0; i < items.length; i++) {
						let response=UOCSearchEngine.getResultMarkup(items[i], i);
						result+=response;
						if(response) groupsFound=true;
					}
					result+="</div></div>";
					if(!groupsFound) result="<p style='font-style:italic'>"+literals.results.noresults[getCurrentLanguage()]+"</p>";
					targetElement.html(result);
				}
			}
		).fail(function(xhr, textStatus, errorThrown){
			targetElement.html("<p style='font-style:italic'>"+literals.results.connectionError[getCurrentLanguage()]+"</p>");
		});
	}, 
	buildQuery: function(searchParams){
		var queryString = "?";									
		for (var key in searchParams) {
			if(searchParams.hasOwnProperty(key)) {
				queryString += "&" + key + "=" +searchParams[key];
			}	
		}
		return UOCSearchEngine.endPointURI + queryString;
	},
	//to modify*********************************
	getResultMarkup : function(item, idx){
		var markup="";
		/*if(item.fields.content_type == "fitxa") {
			markup+="<a href='"+item.fields.url+"'>"
			markup+='<div id="'+item.id+'" class="card card-people"><div class="card__contents img-wpr"><img src="'+item.fields.imatge_url+'" alt="" class="img-wpr__cover">';
			markup+='<div class="img-wpr__contents"><p class="title">'+item.fields.nom_investigador+'</p>';
			markup+='</div><span class="author"><span class="description">'+item.fields.entradeta+'</span></span>';
			markup+='</div></div></a>';
		} else */
		if(item.fields.content_type == "grup"){
			markup='<div class="col-xs-12 col-sm-3" id="Result_'+idx+'">';
			markup+="<a href='"+item.fields.url+"'>"
			markup+='<div id="'+item.id+'" aria-label="region" class="card card-noimg"><div class="card__contents">';
			markup+='<p class="title">'+item.fields.nom_grup+'</p><p>'+item.fields.descripcio+'</p>';
			markup+='</div></div></a>';
			markup+='</div>';
			
		}
		return markup;
		
	}
}



var literals = {
	results: {
		noresults: {
			ca : "No s'ha trobat resultats amb els filtres indicats.",
			es : "No se han encontrado resultados con los filtros utilizados.",
			en : "No results found using current filters."
		},
		connectionError: {
			ca : "No s'ha pogut comunicar amb el servei de cerca.",
			es : "No se ha podido comunicar con el servicio de búsqueda",
			en : "No connection could be made since the service is not responding." 
		},
		and: {
			ca : "i ",
			es : "y ",
			en : "and " 
		}
	},
	query : {
		showing: {
			ca : "Mostrant ",
			es : "Mostrando ",
			en : "Showing " 
		},
		results: {
			ca : " resultat(s) ",
			es : " resultado/s ",
			en : " result(s) " 
		},
		matching: {
			ca : "que coincideixen amb ",
			es : "que coinciden con ",
			en : "matching " 
		}
	},
	pagination: {
		next: {
			ca : "Següent",
			es : "Siguiente",
			en : "Next"
		},
		previous: {
			ca : "Anterior",
			es : "Anterior",
			en : "Previous"
		}
	},
	fields : {
		ambit : {
			ca : "el(s) àmbit(s): ",
			es : "el/los ámbito/s: ",
			en : "area(s): " 
		},
		ods : {
			ca : "el(s) objectiu(s) ODS: ",
			es : "el/los objetivo/s ODS: ",
			en : "ODS objective(s): " 
		},
		unesco : {
			ca : "el codi UNESCO: ",
			es : "el código UNESCO: ",
			en : "UNESCO code: " 
		},
		centre : {
			ca : "el(s) centre(s): ",
			es : "el/los centro/s: ",
			en : "centre(s): " 
		},
		s: {
			ca : "el text: ",
			es : "el texto: ",
			en : "the following text: "
		}
	}
};

