// blockyAnimal.js

//Get the rendering context for WebGL
var gl;
var globRotVal = [0, 35];

var mousePressed = false;
var clickXLoc = 0;
var clickYLoc = 0;

var headColor;
var pantColor;
var nipColor;
var faceFeatureColor;
var torsoColor;

var headChange = true;
var headAnimate = 8.0;
var armChange = true;
var armAnimate = 17.0;
var torsoChange = true;
var torsoAnimate = 10.0;
var finalAnimate = -10.0;

var currentAngle = 1;
var ANGLE_STEP = 45.0;

// Vertex Shader Program
var VSHADER_SOURCE = 
	'attribute vec4 a_Position;\n' +
	'attribute vec4 a_Color;\n' +
	'varying vec4 v_Color;\n' + // Varying variable
	'uniform mat4 u_ModelMatrix;\n' +
	'uniform mat4 u_ProjectionMatrix;\n' +
	'uniform mat4 u_GlobalRotationMatrix;\n' +
	'void main() {\n' +
	'	gl_Position = u_ProjectionMatrix * u_GlobalRotationMatrix * u_ModelMatrix * a_Position;\n' +
	'	v_Color = a_Color;\n' + // Pass the data to the fragment shader
	'}\n';

// Fragment Shader program
var FSHADER_SOURCE = 
	'precision mediump float;\n' +
	'varying vec4 v_Color;\n' +
	'void main() {\n' +
	'	gl_FragColor = v_Color;\n' + // Set the color
	'}\n';

function main(){
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');

	gl = getWebGLContext(canvas);
	if(!gl){
		console.log('Failed to get the rendering context for WebGL');
	}

	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
		console.log('Failed to initialize shaders.');
		return;
	}

	const shaderVariables = {
  		aposition: gl.getAttribLocation(gl.program, 'a_Position'),
  		aColor: gl.getAttribLocation(gl.program, 'a_Color'),
  		uModelMatrix: gl.getUniformLocation(gl.program, 'u_ModelMatrix'),
  		uProjectionMatrix: gl.getUniformLocation(gl.program, 'u_ProjectionMatrix'),
  		uGlobalRotationMatrix: gl.getUniformLocation(gl.program, 'u_GlobalRotationMatrix')
  	}

	var verticeBuffer = initBuffers();

	var colorBuffer = colorInit();

	canvas.onmouseup = function(){
		mousePressed = false;
		clickXLoc = 0;
		clickYLoc = 0;
	}
	canvas.onmousedown = function(z){
		mousePressed = true;
		clickXLoc = z.clientX;
		clickYLoc = z.clientY;
	}
	canvas.onmousemove = function(z){
		mouseMoved(z, verticeBuffer, shaderVariables, colorBuffer);
	}

	// drawCube(verticeBuffer, colorBuffer, shaderVariables);
	
	var tick = function() {
		animate(); // Update the rotation angle
		drawAnimal(verticeBuffer, shaderVariables); // Draw the triangle
		requestAnimationFrame(tick, canvas);
	};
	tick();
}

var g_last = Date.now();
function animate(angle){
	// Calculate the elapsed time
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;
	if (headChange == true)
		headAnimate = headAnimate - .55;
	if (headChange == false)
		headAnimate = headAnimate + .55;
	if (headAnimate >= 8.0)
		headChange = true;
	if (headAnimate <= -8.0)
		headChange = false;

	if (armChange == true){
		torsoAnimate = torsoAnimate - 1.05;
		finalAnimate = finalAnimate + 1.05;
	}
	if (armChange == false){
		torsoAnimate = torsoAnimate + 1.05;
		finalAnimate = finalAnimate - 1.05;
	}

	if (armChange == true)
		armAnimate = armAnimate - 1.1;
	if (armChange == false)
		armAnimate = armAnimate + 1.1;
	if (armAnimate >= 17.0)
		armChange = true;
	if (armAnimate <= -20.0)
		armChange = false;
}

function drawAnimal(buffers, shaderVariables){
	gl.clearColor(0.37, 0.75, 0.7, 1.0);  // Clear to black, fully opaque
  	gl.clearDepth(1.0);                 // Clear everything
  	gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  	gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  	var headMatrix = new Matrix4();
  	headMatrix.setRotate(headAnimate, 0, 0, 1);
  	headMatrix.translate(0, 1.55, 0)
  	headMatrix.scale(.35, .35, .35);
  	drawCube(buffers, headColor, shaderVariables, headMatrix);

  	var leftEye = new Matrix4();
  	leftEye.setRotate(headAnimate, 0, 0, 1);
  	leftEye.translate(-.2, 1.7, .35);
  	leftEye.scale(.04, .04, .03);
  	drawCube(buffers, faceFeatureColor, shaderVariables, leftEye);

  	var rightEye = new Matrix4();
  	rightEye.setRotate(headAnimate, 0, 0, 1);
  	rightEye.translate(.2, 1.7, .35);
  	rightEye.scale(.04, .04, .03);
  	drawCube(buffers, faceFeatureColor, shaderVariables, rightEye);

  	var nose = new Matrix4();
  	nose.setRotate(headAnimate, 0, 0, 1);
  	nose.translate(0, 1.55, .35);
  	nose.scale(.02, .04, .03);
  	drawCube(buffers, faceFeatureColor, shaderVariables, nose);

  	var mouth = new Matrix4();
  	mouth.setRotate(headAnimate, 0, 0, 1);
  	mouth.translate(0, 1.36, .35);
  	mouth.scale(.04, .04, .03);
  	drawCube(buffers, faceFeatureColor, shaderVariables, mouth);

  	var neckMatrix = new Matrix4();
  	neckMatrix.setRotate(headAnimate, 0, 0, 1);
  	neckMatrix.translate(0, 1.1, 0);
  	neckMatrix.scale(.1,.12, .16);
  	drawCube(buffers, headColor, shaderVariables, neckMatrix);

  	var torsoMatrix = new Matrix4();
  	torsoMatrix.setRotate(torsoAnimate, 0, 1, 0);
  	torsoMatrix.translate(0, .4, 0);
  	torsoMatrix.scale(.7,.64, .36);
  	drawCube(buffers, torsoColor, shaderVariables, torsoMatrix);

  	var bellyButton = new Matrix4();
  	bellyButton.setRotate(torsoAnimate, 0, 1, 0);
  	bellyButton.translate(0, 0, .4);
  	bellyButton.scale(.03,.03, .03);
  	drawCube(buffers, nipColor, shaderVariables, bellyButton);

  	var rightNip = new Matrix4();
  	rightNip.setRotate(torsoAnimate, 0, 1, 0);
  	rightNip.translate(-.37, .65, .4);
  	rightNip.scale(.06,.06, .03);
  	drawCube(buffers, nipColor, shaderVariables, rightNip);

  	var leftNip = new Matrix4();
  	leftNip.setRotate(torsoAnimate, 0, 1, 0);
  	leftNip.translate(.37, .65, .4);
  	leftNip.scale(.06,.06, .03);
  	drawCube(buffers, nipColor, shaderVariables, leftNip);

  	// var leftShoulderBlock = new Matrix4();
  	// leftShoulderBlock.translate(-.74, .92, 0);
  	// leftShoulderBlock.scale(.04,.12, .36);
  	// drawCube(buffers, torsoColor, shaderVariables, leftShoulderBlock);

  	var leftArm = new Matrix4();
  	leftArm.setRotate(armAnimate, .5, .4, 0);
  	leftArm.translate(-.85, 1.41, 0);
  	leftArm.scale(.17,.66, .36);
  	drawCube(buffers, torsoColor, shaderVariables, leftArm);

  	// var rightShoulderBlock = new Matrix4();
  	// rightShoulderBlock.translate(.74, .92, 0);
  	// rightShoulderBlock.scale(.04,.12, .36);
  	// drawCube(buffers, torsoColor, shaderVariables, rightShoulderBlock);

  	var temp = armAnimate * -1;
  	var rightArm = new Matrix4();
  	rightArm.setRotate(temp, .5, -.4, 0);
  	rightArm.translate(.85, 1.41, 0);
  	rightArm.scale(.17,.66, .36);
  	drawCube(buffers, torsoColor, shaderVariables, rightArm);


  	var leftThigh = new Matrix4();
  	leftThigh.setRotate(torsoAnimate, -.8, 1, 0);
  	leftThigh.translate(-.45, -.48, 0);
  	leftThigh.scale(.25, .25, .36);
  	drawCube(buffers, pantColor, shaderVariables, leftThigh);

  	var leftLeg = new Matrix4();
  	leftLeg.setRotate(torsoAnimate, -1, 1, 0);
  	leftLeg.translate(-.45, -1.15, 0);
  	leftLeg.scale(.25, .43, .36);
  	drawCube(buffers, torsoColor, shaderVariables, leftLeg);

  	var rightThigh = new Matrix4();
  	rightThigh.setRotate(finalAnimate, -1, 1, 0);
  	rightThigh.translate(.45, -.48, 0);
  	rightThigh.scale(.25, .25, .36);
  	drawCube(buffers, pantColor, shaderVariables, rightThigh);

  	var rightLeg = new Matrix4();
  	rightLeg.setRotate(finalAnimate, -1, 1, 0);
  	//rightLeg.setRotate(45, 1, 0, 0);
  	rightLeg.translate(.45, -1.15, 0);
  	rightLeg.scale(.25, .43, .36);
  	drawCube(buffers, torsoColor, shaderVariables, rightLeg);

  	var tinyCrotch = new Matrix4();
  	tinyCrotch.setRotate(torsoAnimate, 0, 1, 0);
  	tinyCrotch.translate(0, -.33, 0);
  	tinyCrotch.scale(.25, .1, .36);
  	drawCube(buffers, pantColor, shaderVariables, tinyCrotch);
}

function colorInit(){
	const head_Color = [
    	[1,  .86,  .69,  1.0], //front
    	[1,  .86,  .69,  1.0], //back
    	[.4,  .2,  0,  1.0], //top
    	[.93,  .56,  .4,  1.0], // bottom
    	[.93,  .56,  .4,  1.0], // left
    	[.93,  .56,  .4,  1.0],    // right
  	];

  	const torso_Color = [
    	[1,  .86,  .69,  1.0],
    	[1,  .86,  .69,  1.0], 
    	[.93,  .56,  .4,  1.0], 
    	[.93,  .56,  .4,  1.0], 
    	[.93,  .56,  .4,  1.0],
    	[.93,  .56,  .4,  1.0],  
  	];

  	const pant_Color = [
    	[.04,  .4, .14,  1.0],
    	[.04,  .4, .14,  1.0],
    	[.04,  .4, .14,  1.0],
    	[.04,  .4, .14,  1.0],
    	[.04,  .4, .14,  1.0],
    	[.04,  .4, .14,  1.0]
  	];

  	const nip_Color = [
    	[.98,  .50,  .45,  1.0],
    	[.98,  .50,  .45,  1.0],
    	[.98,  .50,  .45,  1.0],
    	[.98,  .50,  .45,  1.0],
    	[.98,  .50,  .45,  1.0],
    	[.98,  .50,  .45,  1.0],   
  	];

  	const facialFeatureColor = [
    	[0,  0,  0,  1.0],
    	[0,  0,  0,  1.0],    
    	[0,  0,  0,  1.0],    
    	[0,  0,  0,  1.0],    
    	[0,  0,  0,  1.0],    
    	[0,  0,  0,  1.0],
  	];


  	headColor = getColor(head_Color);
  	pantColor = getColor(pant_Color);
  	nipColor = getColor(nip_Color);
  	faceFeatureColor = getColor(facialFeatureColor);
  	torsoColor = getColor(torso_Color);
}

function getColor(faceColors){
	var colors = [];

  	for (var j = 0; j < faceColors.length; ++j) {
    	const c = faceColors[j];

    	// Repeat each color four times for the four vertices of the face
    	colors = colors.concat(c, c, c, c);
  	}

  	const colorBuffer = gl.createBuffer();
  	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  	return colorBuffer;
}

function drawCube(buffers, colorBuffer, shaderVariables, bodyPartMatrix){
	const fieldOfView = 45;
  	const aspect = 640 / 480;
  	const zNear = 0.1;
  	const zFar = 100.0;

	var projMat = new Matrix4();
  	projMat.setPerspective(fieldOfView, aspect, zNear, zFar);
  	projMat.translate(0, 0, -6);

  	var globRotMat = new Matrix4();
  	globRotMat.setRotate(globRotVal[0], 1, 0, 0);
  	globRotMat.rotate(globRotVal[1], 0, 1, 0);

 	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
 	gl.vertexAttribPointer(shaderVariables.aposition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderVariables.aposition);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(shaderVariables.aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderVariables.aColor);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    gl.uniformMatrix4fv(shaderVariables.uProjectionMatrix, false, projMat.elements);
 	gl.uniformMatrix4fv(shaderVariables.uModelMatrix, false, bodyPartMatrix.elements);
 	gl.uniformMatrix4fv(shaderVariables.uGlobalRotationMatrix, false, globRotMat.elements);

 	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}


function initBuffers(){
	const verticeBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);

	const cubeVertices = [
		// Front face
	    -1.0, -1.0,  1.0,
	     1.0, -1.0,  1.0,
	     1.0,  1.0,  1.0,
	    -1.0,  1.0,  1.0,

	    // Back face
	    -1.0, -1.0, -1.0,
	    -1.0,  1.0, -1.0,
	     1.0,  1.0, -1.0,
	     1.0, -1.0, -1.0,

	    // Top face
	    -1.0,  1.0, -1.0,
	    -1.0,  1.0,  1.0,
	     1.0,  1.0,  1.0,
	     1.0,  1.0, -1.0,

	    // Bottom face
	    -1.0, -1.0, -1.0,
	     1.0, -1.0, -1.0,
	     1.0, -1.0,  1.0,
	    -1.0, -1.0,  1.0,

	    // Right face
	     1.0, -1.0, -1.0,
	     1.0,  1.0, -1.0,
	     1.0,  1.0,  1.0,
	     1.0, -1.0,  1.0,

	    // Left face
	    -1.0, -1.0, -1.0,
	    -1.0, -1.0,  1.0,
	    -1.0,  1.0,  1.0,
	    -1.0,  1.0, -1.0,
	];
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

	const indexBuffer = gl.createBuffer();
  	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	const indices = [
	    0,  1,  2,      0,  2,  3,    // front
	    4,  5,  6,      4,  6,  7,    // back
	    8,  9,  10,     8,  10, 11,   // top
	    12, 13, 14,     12, 14, 15,   // bottom
	    16, 17, 18,     16, 18, 19,   // right
	    20, 21, 22,     20, 22, 23,   // left
  	];

  	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  	return{
  		position: verticeBuffer,
  		indices: indexBuffer
  	};
}

function mouseMoved(z, buffer, shaderVariables, colorBuffer){
	if(mousePressed){
		yMove = (z.clientX - clickXLoc);
		xMove = (z.clientY - clickYLoc);

		globRotVal[0] = globRotVal[0] + xMove / 50;
		globRotVal[0] = globRotVal[0] % 360;
		globRotVal[1] = globRotVal[1] + yMove / 50;
		globRotVal[1] = globRotVal[1] % 360;

		drawAnimal(buffer, shaderVariables);
	}
}