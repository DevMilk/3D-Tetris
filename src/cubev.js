"use strict";

var canvas;
var gl;

var sizeScale = 1;
var objects = []
var mainObject = null;
var mainObjectIndex = initObjects.length-1; //son tanımlanan obje ana objemiz
var GroundObject;
var cameraTheta = [0,0,0];
var camera_theta_loc;
var idle_rotation_vel = 1.0;
const gravity_speed_init = 0.001;
var gravity_speed = gravity_speed_init;
var direction = 1;
var move_scale =edge_length
var rotate_scale = 4;
var epsilon = 0.01
var GROUND_Y = -0.9+epsilon;
var cameraSpeed = 4;
const directions = {
	"RIGHT"	: [ 0,1],
	"LEFT"	: [0,-1],
	"UP"	: [ 1,1],
	"DOWN" 	: [1,-1],
	"FRONT" : [2,1],
	"BEHIND" : [2,-1]

}
var program;

class Object{
	constructor(vertex,vertexColors,indices){
		this.vertices = [];
		this.colors = [];
		this.theta = [1,1,1];
		for(var i=0;i<vertex.length;i++){
			this.vertices.push([0,0,0]);
			for(var j=0;j<3;j++)
				this.vertices[i][j] = vertex[i][j];
		}		
		
		for(i=0;i<vertexColors.length;i++)
			this.colors.push(vec4(...vertexColors[i]));
		
		this.indices = indices;
	}
	
	setTheta = function(theta){this.theta = [...theta]};
	setThetaLoc = function(thetaLoc){this.thetaLoc = thetaLoc};
	setVertices = function(vertices){ this.vertices = vertices; }
	changeTheta = function(index,new_value){this.theta[index] = new_value%360};
	getTheta = function(){ return this.theta; }
	getThetaLoc = function(){ return this.thetaLoc; }
	getVertices = function(){ return this.vertices; }
	getColors = function(){ return this.colors; }
	getIndices = function(){ return this.indices; }
		
	
	
}

function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

function lineClsn(line1,line2){
	return line1[0] <= line2[1]+epsilon && line1[1]+epsilon >= line2[0];
}

function boxClsn(){
	//ŞU AN SADECE KÜP İÇİN
	//Asset'ler küplerden oluşacak
	const [X,Y,Z] = getMinMax(objects[mainObjectIndex]);
	for(var i=0;i<objects.length-1;i++){
			let [x,y,z] = getMinMax(objects[i]);
			
			if(lineClsn(X,x) && lineClsn(Y,y) && lineClsn(Z,z))
				return true;
				
	}
	return false;
	
}

function newAsset(){
	//Yeni Asset Üret (yeni assetlerin ilk bloğunun koordinatları aynı)
	objects.push(newAsset);
	
	//Yeni Asset'in kontrolünü al
	mainObjectIndex = objects.length-1;
	
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

	if(obj.getThetaLoc()==null)
		obj.setThetaLoc(gl.getUniformLocation(program, "theta"));
	
	gl.drawElements(gl.TRIANGLES, obj.getIndices().length, gl.UNSIGNED_BYTE, 0);
	
}

window.onload = function init(){
	
	
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.2, 0.2, 0.2, 1.0 );

    gl.enable(gl.DEPTH_TEST);;
	console.log("Sahnedeki obje sayısı: ",initObjects.length);
	
	
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    for(var i=0;i<initObjects.length;i++){
		objects.push(new Object(initObjects[i].vertices,initObjects[i].colors,initObjects[i].indices));	
		buffer(objects[i]);
	}
	GroundObject = objects[1];
	camera_theta_loc = gl.getUniformLocation(program, "camera");
	mainObject = objects[mainObjectIndex];
		
	render();
}

function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	
	for(var i=0;i<objects.length;i++){
		if(getBottom(objects[i].getVertices()) > GROUND_Y && boxClsn()==false) //
			move(objects[i],gravity_speed,directions.DOWN);
		gl.uniform3fv(objects[i].getThetaLoc(), objects[i].getTheta()); //theta, html'de uniform vec3 olarak tanımlandı, uniform3fv ile değer aktarması yapıyoruz
		
		buffer(objects[i]);
		
	}

    requestAnimFrame( render );
}

window.onkeydown = function(event) {
	let key = String.fromCharCode(event.keyCode).toLowerCase();
	switch(key){
		
		//ROTATİON
		case '&': //yukarı
			//rotate(mainObject,directions.UP);
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
			
		//TODO MOVEMENT, Rotationdan sonraki directionlara bak
		case 'w':
			move(mainObject,move_scale,directions.FRONT);
			break;
		case 'a':
			move(mainObject,move_scale,directions.LEFT);
			break;
		case 's':
			move(mainObject,move_scale,directions.BEHIND);
			break;
		case 'd':
			move(mainObject,move_scale,directions.RIGHT);
			break;
		case ' ':
			gravity_speed = 0.01;
			break;
		case 'c':
			cameraTheta[0] =(cameraTheta[0]+1)%360;

			gl.uniform3fv(camera_theta_loc, cameraTheta);
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

function rotate(object,dir_enum){
	let index = 1 - dir_enum[0];
	let direction = (2*index-1)*dir_enum[1]; // 0 ise negatif, 1 ise pozitifi 
	object.changeTheta(index,object.getTheta()[index]+direction*rotate_scale); 
}

function rotateCamera(dir_enum){
	let index = 1 - dir_enum[0];
	let direction = (2*index-1)*dir_enum[1]; // 0 ise negatif, 1 ise pozitifi 
	cameraTheta[index]+=direction*cameraSpeed;
	gl.uniform3fv(camera_theta_loc, cameraTheta);
}

function move(object,move_scale,dir_enum){
	
	let index = dir_enum[0];
	let direction = dir_enum[1];
	let pay = 180 - Math.abs(object.getTheta()[1-index]);
	let direction_rotation_fix = 1;//pay/Math.abs(pay) ; //180 derece olayı var
	
	let vertices = object.getVertices();
	let prevVertices = []
	prevVertices.push( object.getVertices());
	let prev = prevVertices[0];
	for(let i=0;i<vertices.length;i++)
			vertices[i][index]+=direction*move_scale*direction_rotation_fix;
	object.setVertices(vertices);
}

//Vertice'lerden y ekseninde en aşağıda olan pixelin koordinatını döndürür