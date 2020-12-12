"use strict";
var canvas;
var gl;

var sizeScale = 1;
var objects = []
var mainObject = null;
var mainObjectIndex = initObjects.length-1; //son tanımlanan obje ana objemiz
var GroundObject;
var cameraTheta = [-12,26,0,1.0];
var cameraCoord = [0,0];
var cameraCoordLoc; 
var camera_theta_loc;
var idle_rotation_vel = 1.0;
const gravity_speed_init = 0.0001;
var gravity_speed = gravity_speed_init;
var direction = 1;
var move_scale =edge_length;
var rotate_scale = 4;
var epsilon = -0.001; //en optimum görünüm için
var GROUND_Y = -0.9+epsilon;
var cameraSpeed = 4;
var ended = false;
const directions = {
	"RIGHT"	: [ 0,1],
	"LEFT"	: [0,-1],
	"UP"	: [ 1,1],
	"DOWN" 	: [1,-1],
	"FRONT" : [2,1],
	"BEHIND" : [2,-1]

}
var moveSound;
var stackSound;
var program;
var Y_LIMIT = 0.4;
var prevTime = 0; //For smoothing movement
class Object{
	constructor(obj){
		this.vertices = [];
		this.colors = [];
		for(var i=0;i<obj.vertices.length;i++){
			this.vertices.push([0,0,0]);
			for(var j=0;j<3;j++)
				this.vertices[i][j] = obj.vertices[i][j];
		}		
		
		for(i=0;i<obj.colors.length;i++)
			this.colors.push(vec4(...obj.colors[i]));
		
		this.indices = obj.indices;
		this.type = obj.type;
	}
	
	setVertices = function(vertices){ this.vertices = vertices; }
	getType = function(){ return this.type; }
	getVertices = function(){ return this.vertices; }
	getColors = function(){ return this.colors; }
	getIndices = function(){ return this.indices; }
	
	
	
}


function lineClsn(line1,line2,distance=epsilon){
	return line1[0] < line2[1]+distance && line1[1]+distance > line2[0];
}

function isColliding(obj1,obj2){
	const [X,Y,Z] = getMinMax(obj1);
	let [x,y,z] = getMinMax(obj2);
			
	if(lineClsn(X,x) && lineClsn(Y,y,0) && lineClsn(Z,z)){
		return true;
	}
	return false;
	
}

function isgameEnded(){
	for(var j=1;j<objects.length-1;j++){
		for(var k=0;k<objects[j].vertices.length;k++)
			if(objects[j].vertices[k][1]>Y_LIMIT)
				return true;
	}
	return false;
	
}
function boxClsn(mainObj){
	//ŞU AN SADECE KÜP İÇİN
	//Asset'ler küplerden oluşacak
	const [X,Y,Z] = getMinMax(mainObj);
	
	if(mainObj.type=="asset"){
		
		let cubes = parseAsset(mainObj);
		for(var j=0;j<cubes.length;j++){
			if(boxClsn(cubes[j])==true){

			//	console.log(j+" indisli küp soruna neden oldu");
				return true;
			}
		}
	}
	else{
		for(var i=0;i<objects.length-1;i++){
			let [x,y,z] = getMinMax(objects[i]);
			
			if(lineClsn(X,x) && lineClsn(Y,y,0) && lineClsn(Z,z)){
				return true;
			}
		}
	}
	return false;
	
}
function rotateS(object,dir_enum){
	
	let vertices = object.vertices;
	let temp = copy(object.vertices);
	let isVertical = dir_enum[0]; 
	let direction = dir_enum[1];
	//Jointi fixlemek için
	
	let difBefore = [];
	let pivot = vertices[0];
	let referans = vertices[6];
	for(var i=0;i<3;i++)
		difBefore.push(pivot[i]-referans[i]);
	

	for(let i=1;i<vertices.length;i++){
		
		let difZ = vertices[i][2]-pivot[2];
		if(isVertical){
			
			let difY = vertices[i][1]-pivot[1];
			vertices[i][1] += direction*(difZ-difY);
			vertices[i][2] += direction*(difY-difZ);
			
		}
		else{
			let difX = vertices[i][0]-pivot[0];
			vertices[i][0] += direction*(difZ+difX);
			vertices[i][2] += direction*(difZ-difX);
			
		}
		
	}
	let difAfter = []
	pivot = vertices[0];
	referans = vertices[6];
	for(var i=0;i<3;i++)
		difAfter.push(pivot[i]-referans[i]);
	
	let extra = [0,0,0];
	for(var i=0;i<3;i++)
		extra[i] = (difBefore[i]-difAfter[i])/2;
	
	for(let i=0;i<vertices.length;i++){
		for(let j=0;j<3;j++)
			vertices[i][j] -= extra[j];
	}
	if(boxClsn(object))
		object.vertices = temp;
	else
		object.vertices = vertices;
	
}
function detectAndDestroy(){
	
//Eğer aynı y'ye sahip w*d*4 tane vertice = w*d tane küp varsa o vertice'ler silinir 

//y değerleri üzerinde iterasyon

	let objectsToDelete = [];
	for(var i=ground+(edge_length/2);i<1;i+=edge_length*2){
		let verticesOnY = [];
		for(var j=1;j<objects.length;j++){
			let k = 0;
			let y_nx = getMinMax(objects[j])[1];
			while(k<objects[j].vertices.length && (y_nx[0]<=i && i<=y_nx[1]) ==false )
				k++;
			if(k<objects[j].vertices.length)
				verticesOnY.push(j);

		}
		
		
		
		
	console.log(verticesOnY.length,w_count*h_count)
	if(verticesOnY.length >= w_count*h_count){
		// Birden fazla itemi silerken shft etme olayı da olduğu için
		// Son indexten başa doğru silmek gerek
		for(var k =verticesOnY.length-1;k>=0;k--)
			objects.splice(verticesOnY[k],1);
		for(var j=1;j<objects.length;j++){
			move(objects[j],edge_length,directions.DOWN,true);
		}
	}
	}
	
}
function randomFromArr(arr){
	let index = Math.floor((Math.random() * (arr.length-1)));
	return arr[index];
}
function createNewAsset(){
	let blueprint = [1];
	let depth_seeds = [0,1,1,2,2]; //seeds for depth
	let hw_seeds = [1,2,2,2,3];
	let h = randomFromArr([1]);
	let w = randomFromArr(hw_seeds);
	for(let i=0;i<h;i++){
		let arr = [];
		for(let j=0;j<w;j++){
			arr.push(randomFromArr(depth_seeds));
		}

		blueprint.push(arr);
		
	}
	let colors = [] 
	for(let i=0;i<4;i++)
		colors.push([Math.random(),Math.random(),Math.random(),1]);
	console.log("Colors: ",colors);
	let obj = combineCubes(blueprint,	edge_length,colors,-0.1,0.5,0);		
						
	addToScene(obj);
	
}
function addToScene(jsonObject){
	objects.push(new Object(jsonObject));	
	buffer(objects[objects.length-1]);
}
function buffer(obj){
	
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(obj.getIndices()), gl.STATIC_DRAW);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(obj.getColors()), gl.STATIC_DRAW );
	
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(obj.getVertices()), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	
	gl.drawElements(gl.TRIANGLES, obj.getIndices().length, gl.UNSIGNED_BYTE, 0);
	
}

window.onload = function init(){
	objects = [];
	moveSound = new Audio('move.mp3');
	stackSound = new Audio("stack.mp3");
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.1,	0.04,	0.17,   1.0 );

    gl.enable(gl.DEPTH_TEST);;
	console.log("Sahnedeki obje sayısı: ",initObjects.length);
	
	
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    for(var i=0;i<initObjects.length;i++)
		addToScene(initObjects[i])
	
	console.log(initObjects[2]);
	GroundObject = objects[1];
	
	camera_theta_loc = gl.getUniformLocation(program, "camera");
	gl.uniform4fv(camera_theta_loc, cameraTheta); //init camera
	
	mainObject = objects[mainObjectIndex];
	
	cameraCoordLoc = gl.getUniformLocation(program, "cameraCoord");
    gl.uniform2fv(cameraCoordLoc, cameraCoord);
	prevTime = Date.now();
	render();
}

//MAIN

function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	
	var deltaTime = (Date.now() - prevTime)/10; //divide by 10 for normalization
	if(ended == false && boxClsn(objects[objects.length-1])==false){ //
		move(objects[objects.length-1],gravity_speed*deltaTime,directions.DOWN);
	}
	
	else if(ended ==false && boxClsn(objects[objects.length-1])==true){
		stackSound.play();
		let newCubesToAdd = parseAsset(objects.pop());
		for(var i=0;i<newCubesToAdd.length;i++)
			addToScene(newCubesToAdd[i]);
		detectAndDestroy();
		if(isgameEnded()){
			
			console.log("Game Over");
			return;
		}
		createNewAsset();
	}
	
	prevTime = Date.now();
	for(var i=0;i<objects.length;i++){		
		buffer(objects[i]);
	}
	requestAnimFrame( render );
}

var down = false;
var dragBegin;

function multiply(a, b) {
  var aNumRows = a.length, aNumCols = a[0].length,
      bNumRows = b.length, bNumCols = b[0].length,
      m = new Array(aNumRows);  // initialize array of rows
  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row
    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;             // initialize the current cell
      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
}
function getMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left)/rect.width -1/2,
      y: (event.clientY - rect.top)/rect.height -1/2
    };
}

window.onmousedown = function(event){
	console.log("event: ",event)
	dragBegin =  {
	  x: event.clientX,
	  y: event.clientY
	};
	console.log(dragBegin);
	down = true;
			
}
window.onmouseup= function(event){
	down = false;
}
window.onmousemove = function(event){
	if(!down) return;
	
	console.log(event)
	let differences = [event.clientX-dragBegin.x,event.clientY-dragBegin.y];
	let x_change = differences[0]/25;
	let y_change = differences[1]/25;
	console.log(event.button);
	if(event.buttons == 4){
		cameraCoord[0] += -x_change/10;
		cameraCoord[1] += y_change/10;
		gl.uniform2fv(cameraCoordLoc, cameraCoord);
	}
	else{
		rotateCamera(directions.LEFT,scale=x_change);
		rotateCamera(directions.UP ,scale=y_change);
	}
	dragBegin.x = event.clientX;
	dragBegin.y = event.clientY;
	/*for(var i=0;i<objects[objects.length-1].vertices.length;i++){
		move(objects[objects.length-1],move_scale*(differences[0]/(512*8)),directions.RIGHT);
	}*/
	
}
window.addEventListener('wheel', ({ deltaY }) => {

	//console.log(event.clientX,event.clientY,deltaY);
	let mousePos = getMousePos(event);
	cameraTheta[3] += deltaY/1000;
	if(deltaY>0){
		cameraCoord = [0,0];
	}
	else{
		cameraCoord[0] += -mousePos.x;
		cameraCoord[1] += mousePos.y;
	}

	gl.uniform2fv(cameraCoordLoc, cameraCoord);
	gl.uniform4fv(camera_theta_loc, cameraTheta);
});

window.onkeydown = function(event) {
	let key = String.fromCharCode(event.keyCode).toLowerCase();
	console.log(cameraTheta);
	switch(key){
		
		//ROTATİON
		case '&': //yukarı
			//objects[objects.length-1].rotate(directions.UP,1);
			rotateCamera(directions.UP);
			break;
		case '%':  //sol
			//rotate(mainObject,directions.LEFT);
			rotateCamera(directions.LEFT);
			break;
		case '(': //aşağı
			//rotate(mainObject,directions.DOWN);
			rotateCamera(directions.DOWN);
			break;
		case '\'': //sağ
			//rotate(mainObject,directions.RIGHT);
			rotateCamera(directions.RIGHT);
			break;
		case 'q':
			rotateS(objects[objects.length-1],directions.UP);
			break;
		case 'e':
			rotateS(objects[objects.length-1],directions.LEFT);
			break;
			
		//TODO MOVEMENT, Rotationdan sonraki directionlara bak
		case 'w':
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.BEHIND));
			break;
		case 'a':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.LEFT));
			break;
		case 's':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.FRONT));
			break;
		case 'd':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.RIGHT));
			break;
		case ' ':
			gravity_speed = 0.01;
			break;
			
	}
}

window.onkeyup = function(){
	let key = String.fromCharCode(event.keyCode).toLowerCase();
	
	switch(key){
		case ' ':
			gravity_speed = gravity_speed_init;
			break;
	}
}

function directionFix(dir_enum){
	//[-135,-45], [225,315] arasında, front -> left, right->front ,left-> behind, behind->right, 
	//[45,135], [-315,-225] arasında front -> right, right ->behind, left->front, behind-> left
	//[-45,45],[-405,-315], [315,360]arasında normal 
	//[-135,-225], [135,225] arasında front->behind, right->left, left->right, behind->front
	let degr = cameraTheta[1];
	let order = [directions.FRONT,directions.LEFT,directions.BEHIND,directions.RIGHT];
	function interval(dest1,dest2){
		return degr>=dest1 && degr<=dest2; 
	}
	let d = 360;
	if(interval(-45,45) || interval(-405,-315) || interval(-360,-315))
		return dir_enum;
	//-90 0 270 360
	if(interval(-135,-45) || interval(225,315)){
		return order[(order.findIndex((x)=>{return x==dir_enum})+1)%4];
	}
	
	else if(interval(45,135) || interval(-315,-225)){
		return order[(order.findIndex((x)=>{return x==dir_enum})+3)%4];
	}
	else{
		return order[(order.findIndex((x)=>{return x==dir_enum})+2)%4];
		
	}
	
	
}
function rotateCamera(dir_enum,scale=1){
	let index = 1 - dir_enum[0];
	let direction = (2*index-1)*dir_enum[1]; // 0 ise negatif, 1 ise pozitifi 
	cameraTheta[index]=(cameraTheta[index]+direction*scale*cameraSpeed)%360;
	gl.uniform4fv(camera_theta_loc, cameraTheta);
}

function move(object,move_scale,dir_enum,ignore_collusions=false){
	if(ignore_collusions==false && boxClsn(object)) //Sadece a
		return
	let index = dir_enum[0];
	let direction = dir_enum[1];
	
	let vertices = object.getVertices();
	for(let i=0;i<vertices.length;i++)
			vertices[i][index]+=direction*move_scale;
	object.setVertices(vertices);
}

//Vertice'lerden y ekseninde en aşağıda olan pixelin koordinatını döndürür