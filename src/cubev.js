"use strict";
//TODO: ÇOK YAKIN OLUNCA YA DA HAVADA COLLUSION OLUNCA DURUYOR
var canvas;
var gl;

var sizeScale = 1;
var objects = []
var mainObject = null;
var mainObjectIndex = initObjects.length-1; //son tanımlanan obje ana objemiz
var GroundObject;
var cameraTheta = [-12,26,0];
var camera_theta_loc;
var idle_rotation_vel = 1.0;
const gravity_speed_init = 0.001;
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
		this.theta = [1,1,1];
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
	
	setTheta = function(theta){this.theta = [...theta]};
	setThetaLoc = function(thetaLoc){this.thetaLoc = thetaLoc};
	setVertices = function(vertices){ this.vertices = vertices; }
	changeTheta = function(index,new_value){this.theta[index] = new_value%360};
	getTheta = function(){ return this.theta; }
	getType = function(){ return this.type; }
	getThetaLoc = function(){ return this.thetaLoc; }
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
			let duzlem = [-0.1,i,-0.3]
			let y_nx = getMinMax(objects[j])[1];
			while(k<objects[j].vertices.length && (y_nx[0]<=i && i<=y_nx[1]) ==false )
				k++;
			console.log(objects[j].vertices.length)
			console.log("k: ",k);
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
			move(objects[j],edge_length,directions.DOWN);
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
	let depth_seeds = [0,0,1,1,2,2,3,4]; //seeds for depth
	let hw_seeds = [1,2,2,2,3,3,4];
	let h = randomFromArr([1]);
	let w = randomFromArr(hw_seeds);
	for(let i=0;i<h;i++){
		let arr = [];
		for(let j=0;j<w;j++){
			arr.push(randomFromArr(depth_seeds));
		}

		blueprint.push(arr);
		
	}
	let obj = combineCubes(blueprint,	edge_length,[[0.8, 0.8, 0.0, 1],[0, 0.8, 0.8, 1],[0.8, 0, 0.8, 1]],-0.1,0.5,0);		
						
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

	if(obj.getThetaLoc()==null)
		obj.setThetaLoc(gl.getUniformLocation(program, "theta"));
	
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
    gl.clearColor( 0.2, 0.2, 0.2, 1.0 );

    gl.enable(gl.DEPTH_TEST);;
	console.log("Sahnedeki obje sayısı: ",initObjects.length);
	
	
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    for(var i=0;i<initObjects.length;i++)
		addToScene(initObjects[i])
	
	console.log(initObjects[2]);
	GroundObject = objects[1];
	camera_theta_loc = gl.getUniformLocation(program, "camera");
	mainObject = objects[mainObjectIndex];
	
	gl.uniform3fv(camera_theta_loc, cameraTheta); //init camera
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
		gl.uniform3fv(objects[i].getThetaLoc(), objects[i].getTheta()); //theta, html'de uniform vec3 olarak tanımlandı, uniform3fv ile değer aktarması yapıyoruz
		
		buffer(objects[i]);
		
	}
	requestAnimFrame( render );
}

var down = false;
var dragBegin;
window.onmousemove = function(event){
	if(!down) return;
	let differences = [event.clientX-dragBegin[0],event.clientY-dragBegin[1]];
	console.log(differences[0]);
	console.log(objects[objects.length-1].vertices[0])
	for(var i=0;i<objects[objects.length-1].vertices.length;i++){
		move(objects[objects.length-1],move_scale*(differences[0]/(512*8)),directions.RIGHT);
	}
	
}

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



window.onmousedown = function(event){
	var rect = canvas.getBoundingClientRect();
    let ob =  {
      x: (event.clientX - rect.left)*2/rect.width -1,
      y: (-(event.clientY - rect.top))*2/rect.height +1
    };
	console.log(ob);
	down = true;
	dragBegin = ob;
			
}
window.onmouseup= function(event){
	down = false;
}
window.onkeydown = function(event) {
	let key = String.fromCharCode(event.keyCode).toLowerCase();
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
			move(objects[objects.length-1],move_scale,directions.FRONT);
			break;
		case 'a':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directions.LEFT);
			break;
		case 's':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directions.BEHIND);
			break;
		case 'd':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directions.RIGHT);
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

function rotate(object,dir_enum){
	if(boxClsn(object))
		return
	let index = 1 - dir_enum[0];
	let direction = (2*index-1)*dir_enum[1]; // 0 ise negatif, 1 ise pozitifi 
	object.changeTheta(index,object.getTheta()[index]+direction*rotate_scale); 
	
}

function rotateCamera(dir_enum){
	let index = 1 - dir_enum[0];
	let direction = (2*index-1)*dir_enum[1]; // 0 ise negatif, 1 ise pozitifi 
	cameraTheta[index]=(cameraTheta[index]+direction*cameraSpeed)%360;
	gl.uniform3fv(camera_theta_loc, cameraTheta);
}

function move(object,move_scale,dir_enum){
	if(boxClsn(object)) //Sadece a
		return
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