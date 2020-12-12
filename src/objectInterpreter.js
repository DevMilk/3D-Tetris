
  /*
  
		0 --  3
	   /|    /|
      1 |-- 2 |
	  |	4 --| 7
	  |/    |/
	  5 --  6
	  
	  0: minX, maxY, minZ
	  6: maxX,minY,maxZ

 */
 
 /*
 
								___ ___ ___
										   |
										   |
										   |
 let bitMap = [ [
				  [1, 1, 1, 0]
				  [0, 0, 1, 0]
								] ]
 combineCubes(bitMap,0.1,[0.2, 0.2, 0.2, 1.0],0,0,0);
 
 ilk index: initial
 mevcut küp, (x+edge*k, y-edge*j, z-edge*i) koordinatlarına sahip
 indis numaraları +8*(kaçıncı kez 1 olduğu) olur
 
 
			
			  
 */
 
function createRect(x,y,z,a,b,c,colors){
	let rect = 	{
  "vertices": [
        [x, y, z], 
        [x, y, z+c],  
        [x+a, y, z+c],   
        [x+a, y, z],  
		[x, y-b, z],
        [x, y-b, z+c], 
        [x+a, y-b, z+c],  
        [x+a, y-b, z]  
    ],
  "colors": [],
  "indices": [ 
    [0,1,2,3], //üst 
	[4,5,6,7], //alt
	[0,1,5,4], //sol
	[3,7,6,2], //sağ
	[0,3,7,4], //arka
	[1,5,6,2]  //ön
	
  ],
  "type":"rect"
  }
  for(var i=0;i<rect.vertices.length;i++)
	  rect.colors.push(colors[(i*4)%colors.length]);
  rect.indices = quad(rect.indices);
  return rect;
	
}
function createCube(x,y,z,a,colors){
	return createRect(x,y,z,a,a,a,colors);

}

function createAndMap(x,y,z,a,colorArr,cubes){
	let newCube = createCube(x,y,z,a,colorArr);
	for(var i=0;i<newCube.indices.length;i++)
			newCube.indices[i]+=8*cubes.length;
	return newCube;
}

function copy(object){
	
	return JSON.parse(JSON.stringify(object));
	
}
function combineCubes(blueprint,a, colorArr,initialX = 0, initialY=0, initialZ=0){
	var cubes = new Array();
	for(var i=0;i<blueprint.length;i++){
		if(Array.isArray(blueprint[i])){
			for(var j=0;j<blueprint[i].length;j++){
					for(var k=1;k<=blueprint[i][j];k++)
						cubes.push(createAndMap(initialX+a*j,initialY-a*i,initialZ-a*(k-1),a,colorArr,cubes))
			}
		}
		else 
			for(var k=1;k<=blueprint[i];k++)
				cubes.push(createAndMap(initialX+a*i,initialY,initialZ-a*(k-1),a,colorArr,cubes))
		
	}
	
	console.log(cubes);
	let combinedObject = copy(cubes[0]);
	combinedObject.vertices = combinedObject.vertices;
	combinedObject.colors = combinedObject.colors;
	combinedObject.type="asset";
	for(var i=1;i<cubes.length;i++){
		for(var j=0;j<cubes[i].vertices.length;j++){
			combinedObject.vertices.push(cubes[i].vertices[j]);
			
			combinedObject.colors.push(cubes[i].colors[j]);
		}
		
		combinedObject.indices.push(...(cubes[i].indices));
	}
	return combinedObject;
	
}

function parseAsset(asset){
	//8 color, 6 indis, 8 vertices
	let cubes = []
	let assetVertices = asset.getVertices();
	for(var j=0;j<assetVertices.length/8;j++){
		let obj = {"vertices":[],"indices":[ 
    [0,1,2,3], //üst 
	[4,5,6,7], //alt
	[0,1,5,4], //sol
	[3,7,6,2], //sağ
	[0,3,7,4], //arka
	[1,5,6,2]  //ön
	
  ],"type":"rect","colors":[]};
		obj.indices = quad(obj.indices);
		let begin = j*8;
		let edge_length = Math.abs(assetVertices[1][2]- assetVertices[0][2]);
		obj.vertices = (assetVertices.slice(begin,begin+8));
		obj.colors= (asset.colors.slice(begin,begin+8));
		cubes.push(obj);
	
	}
	return cubes;
	
}
