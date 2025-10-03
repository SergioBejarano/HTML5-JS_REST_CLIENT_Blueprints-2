//@author hcadavid

apimock=(function(){

	var mockdata=[];

	mockdata["johnconnor"]=	[
		{author:"johnconnor","points":[{"x":150,"y":120},{"x":215,"y":115},{"x":300,"y":200},{"x":180,"y":350}],"name":"house"},
		{author:"johnconnor","points":[{"x":340,"y":240},{"x":15,"y":215},{"x":100,"y":50},{"x":250,"y":80},{"x":400,"y":150}],"name":"gear"},
		{author:"johnconnor","points":[{"x":50,"y":50},{"x":100,"y":100},{"x":150,"y":150},{"x":200,"y":200},{"x":250,"y":250},{"x":300,"y":300}],"name":"robot"},
		{author:"johnconnor","points":[{"x":10,"y":10},{"x":20,"y":30},{"x":40,"y":60},{"x":80,"y":120},{"x":160,"y":240},{"x":320,"y":480},{"x":640,"y":960}],"name":"terminator"}
	];

	mockdata["maryweyland"]=[
		{author:"maryweyland","points":[{"x":140,"y":140},{"x":115,"y":115},{"x":200,"y":300},{"x":350,"y":250}],"name":"house2"},
		{author:"maryweyland","points":[{"x":140,"y":140},{"x":115,"y":115},{"x":90,"y":90},{"x":65,"y":65},{"x":40,"y":40}],"name":"gear2"},
		{author:"maryweyland","points":[{"x":0,"y":0},{"x":50,"y":100},{"x":100,"y":200},{"x":150,"y":300},{"x":200,"y":400},{"x":250,"y":500}],"name":"spaceship"},
		{author:"maryweyland","points":[{"x":25,"y":75},{"x":75,"y":125},{"x":125,"y":175},{"x":175,"y":225},{"x":225,"y":275},{"x":275,"y":325},{"x":325,"y":375}],"name":"alien"}
	];

	mockdata["laurarodriguez"]=[
		{author:"laurarodriguez","points":[{"x":100,"y":200},{"x":150,"y":250},{"x":200,"y":300},{"x":250,"y":350},{"x":300,"y":400}],"name":"building"},
		{author:"laurarodriguez","points":[{"x":10,"y":20},{"x":30,"y":40},{"x":50,"y":60},{"x":70,"y":80},{"x":90,"y":100},{"x":110,"y":120},{"x":130,"y":140},{"x":150,"y":160}],"name":"bridge"},
		{author:"laurarodriguez","points":[{"x":500,"y":600},{"x":400,"y":500},{"x":300,"y":400},{"x":200,"y":300},{"x":100,"y":200},{"x":50,"y":150}],"name":"tower"}
	];

	return {
		getBlueprintsByAuthor:function(authname,callback){
			callback(
				mockdata[authname]
			);
		},

		getBlueprintsByNameAndAuthor:function(authname,bpname,callback){

			callback(
				mockdata[authname].find(function(e){return e.name===bpname})
			);
		}
	}	

})();

/*
Example of use:
var fun=function(list){
	console.info(list);
}

apimock.getBlueprintsByAuthor("johnconnor",fun);
apimock.getBlueprintsByNameAndAuthor("johnconnor","house",fun);*/