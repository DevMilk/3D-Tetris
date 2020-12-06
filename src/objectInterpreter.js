
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
    [0,1,2,3], //üst 0 1 2 0 2 3 -> 
	[4,5,6,7], //alt
	[0,1,5,4], //sol
	[3,7,6,2], //sağ
	[0,3,7,4], //arka
	[1,5,6,2]  //ön
	
  ]
  
  }
  for(var i=0;i<8;i++)
	  rect.colors.push(colors[i%colors.length]);
  
  return rect;
	
}
function createCube(x,y,z,a,colors){
	return createRect(x,y,z,a,a,a,colors);

}