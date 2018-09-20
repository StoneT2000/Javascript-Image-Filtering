$(document).on("ready",function(){
  $("#file").on('change',function(){
    img1 = loadImage(window.URL.createObjectURL(document.getElementById("file").files[0]),function(){
      if (img1.width >= 800){
        var sfactor = img1.width/800 
        myCanvas =createCanvas(800, img1.height/sfactor);
        cWidth=800;
        cHeight = img1.height/sfactor;
      }
      else {
         myCanvas =createCanvas(img1.width,img1.height);
        cWidth=  img1.width;
        cHeight = img1.height;
      }
     
      myCanvas.parent('imageDisplay');
      
      d = pixelDensity();
      image(img1,0,0, cWidth, cHeight)
      loadPixels();
    });
    
  })
});
var img1;
var myCanvas;
var d;
var points = [];
var cWidth;
var cHeight;
var threshold = 30;
var operator3={
  smooth:{arr:[1,1,1,
          1,1,1,
          1,1,1],type:"blur"},
  edge:{arr:[0,1,0,
       1,-4,1,
       0,1,0],type:'filter'},
  edgeLR:{arr:[0,-1,0,
         0,2,0,
         0,-1,0],type:'filter'},
  edgeUD:{arr:[0,0,0,
         -1,2,-1,
         0,0,0],type:'filter'},
  sharpen:{arr:[0,-1,0,
          -1,5,-1,
          0,-1,0],type:'filter'},
  gaussian:{arr:[1,2,1,
           2,4,2,
           1,2,1],type:'blur'},
  sobelX:{arr:[1,2,1,
              0,0,0,
              -1,-2,-1],
          type:'filter'},
  sobelY:{arr:[1,0,-1,
              2,0,-2,
              1,0,-1],
          type:'filter'},
  gx:{arr:[-1,-1,-1,
              0,0,0,
              1,1,1],
          type:'filter'},
  gy:{arr:[-1,0,1,
              -1,0,1,
              -1,0,1],
          type:'filter'}
  
}
var operator5={
  smooth:{arr:[1,1,1,
          1,1,1,
          1,1,1],type:"blur",sum:25},
  gaussian:{arr:
          [1,4,7,4,1,
           4,16,26,16,4,
           7,26,41,26,7,
           4,16,26,16,4,
           1,4,7,4,1],type:'blur',sum:273},
}
function setup(){
  myCanvas =createCanvas(500,500);
  myCanvas.parent('imageDisplay');
  d = pixelDensity();
  
}
function draw(){
  //background(250,100,20)
  fill(256,256,256)
  noStroke();

  
}
function fget(x,y){
  y=parseInt(y.toFixed(0));
  var off = ((y*d*cWidth + x)*d*4);
  var components = [ pixels[off], pixels[off + 1], pixels[off + 2], pixels[off + 3] ]
  return components;
}
function ind(x,y){
  return (y*d*cWidth + x)*d*4;
}

function changePixels3(filter_mode){
  filter(GRAY);
  loadPixels();
  if (!filter_mode){
    filter = "smooth"
  }
  var pixelsCopy = JSON.parse(JSON.stringify(pixels));
  for (k=0;k<=cWidth;k+=1){
    for (j=0;j<=cHeight;j+=1){
      //var loc = [ind(k,j-1),ind(k-1,j),ind(k,j),ind(k+1,j),ind(k,j+1)];
      var loc = [ind(k-1,j-1),ind(k,j-1),ind(k+1,j-1),ind(k-1,j),ind(k,j),ind(k+1,j),ind(k-1,j+1),ind(k,j+1),ind(k+1,j+1)];
      var rgb = smoothAvg3(k,j,pixels,filter_mode)
      pixelsCopy[loc[4]]= rgb[0];
      pixelsCopy[loc[4]+1]= rgb[1]
      pixelsCopy[loc[4]+2]= rgb[2]
      
      
    }
  }
  copyTo(pixelsCopy,pixels)
  updatePixels();
  console.log("Completed 3x3 " +  filter_mode)
}
function smoothAvg3(x,y,data,filter_mode){
  var loc =  [ind(x-1,y-1),ind(x,y-1),ind(x+1,y-1),ind(x-1,y),ind(x,y),ind(x+1,y),ind(x-1,y+1),ind(x,y+1),ind(x+1,y+1)];
  var weight = [1,1,1,
                1,1,1,
                1,1,1];
  weight = operator3[filter_mode].arr;
  var colors = [0,0,0]
  var totalWeight = 1;
  
  if (operator3[filter_mode].type == 'blur'){
    totalWeight = weight.reduce((acc,curr)=> acc+abs(curr));
  }
  
  for (i=0;i<loc.length;i++){
    colors[0]+=data[loc[i]]*weight[i]
    colors[1]+=data[loc[i]+1]*weight[i]
    colors[2]+=data[loc[i]+2]*weight[i]
    
  }
  colors[0]/=totalWeight;
  colors[1]/=totalWeight;
  colors[2]/=totalWeight;
  if (filter == "edge"){
    points.push([x,y,colors[0]]);
  }
  return colors;
}
function changePixels5(filter){
  if (!filter){
    filter = "smooth"
  }
  var pixelsCopy = JSON.parse(JSON.stringify(pixels));
  for (k=0;k<=cWidth;k+=1){
    for (j=0;j<=cHeight;j+=1){
      //var loc = [ind(k,j-1),ind(k-1,j),ind(k,j),ind(k+1,j),ind(k,j+1)];
      var loc = [ind(k-2,j-2),ind(k-1,j-2),ind(k,j-2),ind(k+1,j-2),ind(k+2,j-2),
                 ind(k-2,j-1),ind(k-1,j-1),ind(k,j-1),ind(k+1,j-1),ind(k+2,j-1),
                 ind(k-2,j),ind(k-1,j),ind(k,j),ind(k+1,j),ind(k+2,j),
                 ind(k-2,j+1),ind(k-1,j+1),ind(k,j+1),ind(k+1,j+1),ind(k+2,j+1),
                 ind(k-2,j+2),ind(k-1,j+2),ind(k,j+2),ind(k+1,j+2),ind(k+2,j+2)];
      var rgb = smoothAvg3(k,j,pixels,filter)
      pixelsCopy[loc[12]]= rgb[0];
      pixelsCopy[loc[12]+1]= rgb[1]
      pixelsCopy[loc[12]+2]= rgb[2]
    }
  }
  copyTo(pixelsCopy,pixels)
  updatePixels();
  console.log("Completed 5x5 " +  filter)
}
function smoothAvg5(x,y,data,filter){
  var loc = [ind(k-2,j-2),ind(k-1,j-2),ind(k,j-2),ind(k+1,j-2),ind(k+2,j-2),
             ind(k-2,j-1),ind(k-1,j-1),ind(k,j-1),ind(k+1,j-1),ind(k+2,j-1),
             ind(k-2,j),ind(k-1,j),ind(k,j),ind(k+1,j),ind(k+2,j),
             ind(k-2,j+1),ind(k-1,j+1),ind(k,j+1),ind(k+1,j+1),ind(k+2,j+1),
             ind(k-2,j+2),ind(k-1,j+2),ind(k,j+2),ind(k+1,j+2),ind(k+2,j+2)];
  var weight = [1,1,1,
                1,1,1,
                1,1,1];
  weight = operator5[filter].arr;
  var colors = [0,0,0]
  var totalWeight = 1;
  
  if (operator5[filter].type == 'blur'){
    //totalWeight = weight.reduce((acc,curr)=> acc+abs(curr));
    totalWeight = operator5[filter].sum;
  }
  for (i=0;i<loc.length;i++){
    colors[0]+=data[loc[i]]*weight[i]
    colors[1]+=data[loc[i]+1]*weight[i]
    colors[2]+=data[loc[i]+2]*weight[i]
    
  }
  colors[0]/=totalWeight;
  colors[1]/=totalWeight;
  colors[2]/=totalWeight;
  return colors;
}
function copyTo(arr1,arr2){
  for (index=0;index<arr2.length;index++){
    arr2[index] =  arr1[index];
  }
}

function ind1(x,y){
  //use to find position in ega array.
  return (y*d*cWidth + x)*d;
}
function edgeGradientAngle(x,y,data){
  //assume grayscale
  
  var grx = smoothAvg3(x,y,data,'sobelX')[0];
  var gry = smoothAvg3(x,y,data,'sobelY')[0];
  //remove sqrt if too slow
  return [(grx*grx + gry*gry),roundAngle(atan(gry/grx))]
  //without sqrt, large images possible used in poly are like 3s or less
}
function roundAngle(rad){
  //0: vert, 1: top right, 2:horizontal, 3:bottom right
  const api0 = 3*Math.PI/8
  const api1 = Math.PI/8
  const api2 = -Math.PI/8
  const api3 = -3*Math.PI/8
  if (rad > api0|| rad < api3){
    return 0;
  }
  else if (rad > api1){
    return 1;
  }
  else if (rad < api2){
    return 3;
  }
  else {
    return 2;
  }
}
function generateEGA(data){
  //Left right
  filter(GRAY);
  loadPixels();
  //change to grayscale first
  var pixelInfo = [];
  var stime = millis();
  for (ip=0;ip<cHeight;ip++){
    for (jp=0;jp<cWidth;jp++){

      pixelInfo.push(edgeGradientAngle(ip,jp,data));
    }
  }
  console.log("Time: " + (millis()-stime));
  return pixelInfo;
}
function supress(x,y,data){
  //data should be EGA info
  var thisIndex = ind1(x,y);
  var surrounding = neighborhoodIndices(x,y,1);
  var surroundingSameDir = [];
  var grad = data[thisIndex][0]
  var dir = data[thisIndex][1]
  //console.log(surrounding)
  for (locIndex=0;locIndex<surrounding.length;locIndex++){
    if (data[surrounding[locIndex]][1] == dir){
      surroundingSameDir.push(data[surrounding[locIndex]]);
    }
  }
  //console.log(surroundingSameDir)
  for (it=0;it<surroundingSameDir.length;it++){
    if (grad <= surroundingSameDir[it][0]){
      //console.log("Not Local Max!",grad)
      data[thisIndex][0] = 0;
      //console.log(thisIndex);
      pixels[ind(x,y)]/=10;
      pixels[ind(x,y)+1]/=10;
      pixels[ind(x,y)+2]/=10;
      return;
    }
  }
  //console.log(surroundingSameDir,"Local Max!",data[thisIndex]);
  return;
  
}
function supressEGA(data){
  for (kh=2;kh<cHeight-3;kh++){
    for (kwt=2;kwt<470-3;kwt++){
      //console.log(kwt,kh);
      supress(kwt,kh,data);
    }
  }
  updatePixels();
  console.log("complete")
}
function neighborhoodIndices(x,y,r){
  var positions = [];
  var indexed = ind1(x,y);
  for (i=-r;i<=r;i++){
    for (j=-r;j<=r;j++){
      if (i==0 && j==0){
        
      }
      else{
        positions.push(ind1(j+y,i+x));
      }
    }
  }
  return positions;
}