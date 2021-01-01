//Get Input From User
function getInput(text,default_val=4,min_val=1){
	do{
		var value = prompt(text,default_val);
		if(value==null)
		  return

		if (value != parseInt(value, 10)|| value <=min_val-1)
		  alert("Enter valid number");
	  
	}while(value != parseInt(value, 10) || value <=min_val-1);

	return value;
  
}
var edge_length = 0.1; //edge length of cubes
var w_count = getInput("enter width of board",5,4);
var h_count = getInput("enter height of board",4,4);
var w = edge_length*w_count;
var h = 0.05;
var d = edge_length*h_count;
var ground = -0.5;
var hill = 0.7;
var l = 0.01;
var initialAssetCoord = [-0.2,hill,0.2]
var wallLength = 1.3;
var wallPivot = 0.8;
var wallThickness = 0.051;
var wallColor = [0.3, 0.3, 0.8, 0.3]
var groundCOlor = [0.3, 0.3, 0.8, 0.8]

//First objects
var initObjects = [
	/*DÜZEY*/ createRect(-0.4,ground,0,
				w,1.5*h,d,
				[groundCOlor]),
				
				createRect(-0.451,wallPivot,0,
				wallThickness,wallLength,d,
				[wallColor]),
				
				createRect(-0.4,wallPivot,0-edge_length/2-0.01,
				w,wallLength,wallThickness,
				[wallColor]),
				
				createRect(-0.4,wallPivot,0+d,
				w,wallLength,wallThickness,
				[wallColor]),
				
				createRect(-0.4+w,wallPivot,0,
				wallThickness,wallLength,d,
				[wallColor])
				

]

//Make invisible objects such as walls
walls = [1,2,3,4];

//Get 4 indices and generate 6 indices for cube
function quad(indicesOriginal){
	let indices = indicesOriginal;
	for(var j=0;j<indices.length;j++){
		let index = indices[j];
		indices[j] = [index[0],index[1],index[2],index[0],index[2],index[3]]
	}
	indices = [].concat.apply([], indices);
	return indices;
}

//return Minimum and Maximum per coordinates of given rectangle object or vertices
function getMinMax(rectangle){
	let vertex = rectangle.vertices;
	let pivot = 0;
	let refer = 6;
	let minMaxes = [[10,-10],[10,-10],[10,-10]];
	for(var i =0;i<vertex.length;i++){
		for(var cord=0;cord<3;cord++){
			minMaxes[cord][0]   = Math.min(vertex[i][cord],minMaxes[cord][0]);
			minMaxes[cord][1] = Math.max(vertex[i][cord], minMaxes[cord][1]);
		}	
	}
	return minMaxes;
	
}
