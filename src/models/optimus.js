import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';

// Original procedural interpretation of the 2007–2011 movie design.
// Static detail is merged per material, inside each independently animated assembly.
export function createOptimus() {
  const root = new THREE.Group();
  const parts = [], materials = new Set(), cache = new Map();
  let seed = 72007;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  function surfaceTexture(kind) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
    const c = canvas.getContext('2d');
    c.fillStyle = kind === 'flames' ? '#09278d' : '#999999'; c.fillRect(0, 0, 512, 512);
    if (kind === 'flames') {
      // Hand-drawn flame tongues with a fine silver pinstripe over cobalt lacquer.
      const path = new Path2D();
      path.moveTo(0,512);path.lineTo(0,350);
      path.bezierCurveTo(125,367,44,205,129,115);
      path.bezierCurveTo(74,273,210,249,135,359);
      path.bezierCurveTo(255,313,170,116,281,8);
      path.bezierCurveTo(216,191,365,164,267,332);
      path.bezierCurveTo(356,294,373,233,365,160);
      path.bezierCurveTo(462,263,357,356,445,399);
      path.bezierCurveTo(487,416,483,322,512,290);
      path.lineTo(512,512);path.closePath();
      c.fillStyle='#b91d20';c.fill(path);c.strokeStyle='#a3a3ac';c.lineWidth=2.2;c.stroke(path);
      c.globalAlpha=.22;
      for(let i=0;i<4000;i++){c.fillStyle=random()>.5?'#f4e1d0':'#060f2a';const n=random()*1.2;c.fillRect(random()*512,random()*512,n,n);}
      c.globalAlpha=.35;
      for(let i=0;i<120;i++){const x=random()*512,y=random()*512;c.strokeStyle='#a8afbd';c.lineWidth=.4;c.beginPath();c.moveTo(x,y);c.lineTo(x+random()*15,y-random()*4);c.stroke();}
    } else {
      const image=c.getImageData(0,0,512,512);
      for(let i=0;i<image.data.length;i+=4){const n=130+random()*65;image.data[i]=image.data[i+1]=image.data[i+2]=n;image.data[i+3]=255;}c.putImageData(image,0,0);
      c.globalAlpha=.22;for(let i=0;i<1400;i++){const y=random()*512;c.strokeStyle=random()>.5?'#fff':'#151515';c.lineWidth=.3+random()*.6;c.beginPath();const x=random()*512;c.moveTo(x,y);c.lineTo(x+random()*110,y+.7);c.stroke();}
    }
    const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;
    if(kind==='flames')t.colorSpace=THREE.SRGBColorSpace;return t;
  }
  const wear=surfaceTexture('metal'),flameMap=surfaceTexture('flames');
  function metal(color,roughness=.3){return new THREE.MeshStandardMaterial({color,metalness:1,roughness,roughnessMap:wear,bumpMap:wear,bumpScale:.006,envMapIntensity:1.15});}
  function paint(color,map=null){return new THREE.MeshPhysicalMaterial({color,map,metalness:.8,roughness:.45,roughnessMap:wear,bumpMap:wear,bumpScale:.004,clearcoat:.65,clearcoatRoughness:.34,envMapIntensity:.85});}
  const m={blue:paint('#072f9e'),red:paint('#a51219'),flame:paint('#ffffff',flameMap),steel:metal('#687587',.62),chrome:metal('#b8c3d0',.34),gunmetal:metal('#333c48',.48),black:metal('#0e1219',.6),brass:metal('#857356',.4),rubber:new THREE.MeshStandardMaterial({color:'#090b10',roughness:.88,metalness:.05,bumpMap:wear,bumpScale:.014}),glass:new THREE.MeshPhysicalMaterial({color:'#172f43',metalness:.38,roughness:.12,clearcoat:1,clearcoatRoughness:.08}),eye:new THREE.MeshStandardMaterial({color:'#a4e8ff',emissive:'#36aaff',emissiveIntensity:1.8}),lamp:new THREE.MeshStandardMaterial({color:'#ebefff',emissive:'#adceff',emissiveIntensity:.2}),amber:new THREE.MeshStandardMaterial({color:'#ef9a32',emissive:'#ff6300',emissiveIntensity:.6})};
  function mesh(g,geo,material,pos=[0,0,0],rot=[0,0,0]) { const o=new THREE.Mesh(geo,material);o.position.set(...pos);o.rotation.set(...rot);o.castShadow=o.receiveShadow=true;g.add(o);materials.add(material);return o; }
  function box(g,size,pos,material=m.steel,rot=[0,0,0],radius=.025){const key=`b${size}/${radius}`;if(!cache.has(key))cache.set(key,new RoundedBoxGeometry(...size,2,radius));return mesh(g,cache.get(key),material,pos,rot);}
  function cyl(g,r,h,pos,material=m.steel,axis='y',r2=r,n=20){const key=`c${r}/${h}/${r2}/${n}`;if(!cache.has(key))cache.set(key,new THREE.CylinderGeometry(r,r2,h,n));return mesh(g,cache.get(key),material,pos,axis==='x'?[0,0,Math.PI/2]:axis==='z'?[Math.PI/2,0,0]:[0,0,0]);}
  function rod(g,a,b,r=.04,material=m.chrome){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);const o=cyl(g,r,delta.length(),av.add(bv).multiplyScalar(.5).toArray(),material);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;}
  function plate(g,w,h,depth,pos,material=m.blue,rot=[0,0,0],profile='armor'){
    const profiles={armor:[[-.5,.35],[-.26,.5],[.4,.43],[.5,-.18],[.17,-.5],[-.4,-.34]],blade:[[-.45,.5],[.17,.43],[.5,.02],[.27,-.5],[-.17,-.4],[-.5,-.03]],window:[[-.5,.48],[.44,.5],[.5,-.4],[-.46,-.5]],toe:[[-.5,-.5],[-.39,.27],[.13,.5],[.5,.18],[.42,-.5]],shield:[[-.5,.43],[.5,.43],[.42,-.26],[0,-.5],[-.42,-.26]]};
    const key=`p${w}/${h}/${depth}/${profile}`;
    if(!cache.has(key)){const shape=new THREE.Shape();profiles[profile].forEach(([x,y],i)=>i?shape.lineTo(x*w,y*h):shape.moveTo(x*w,y*h));shape.closePath();let geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.024,bevelThickness:.022});geo.translate(0,0,-depth/2);geo=new TessellateModifier(.18,3).modify(geo);const uv=geo.attributes.uv,p=geo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)/w+.5,p.getY(i)/h+.5);const normals=geo.attributes.normal;for(let i=0;i<p.count;i++){const x=p.getX(i)/w;p.setZ(i,p.getZ(i)+.05*(1-4*x*x));const n=new THREE.Vector3(normals.getX(i)+.4*x/w*normals.getZ(i),normals.getY(i),normals.getZ(i)).normalize();normals.setXYZ(i,n.x,n.y,n.z);}cache.set(key,geo);}return mesh(g,cache.get(key),material,pos,rot);
  }
  function joint(g,r,pos,axis='z') {cyl(g,r,.17,pos,m.gunmetal,axis);cyl(g,r*.72,.19,pos,m.chrome,axis);cyl(g,r*.42,.205,pos,m.black,axis);cyl(g,r*.17,.23,pos,m.brass,axis);}
  function ribbed(g,a,b,r=.08){rod(g,a,b,r,m.gunmetal);const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b);for(let i=0;i<7;i++){const p=av.clone().lerp(bv,i/6);const o=cyl(g,r*1.14,.033,p.toArray(),m.steel);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.clone().sub(av).normalize());}}
  function bolt(g,pos){cyl(g,.022,.024,pos,m.chrome,'z',.022,6);}
  function vents(g,pos,w,h,count=7){box(g,[w,h,.04],pos,m.black);for(let i=0;i<count;i++)box(g,[w*.89,.018,.025],[pos[0],pos[1]-h*.42+i*h*.84/(count-1),pos[2]+.027],m.steel);}
  function wheel(g,pos,r=.46){const w=new THREE.Group();g.add(w);w.position.set(...pos);cyl(w,r,.29,[0,0,0],m.rubber,'x',r,40);for(const s of [-1,1]){cyl(w,r*.8,.012,[s*.151,0,0],m.black,'x');cyl(w,r*.62,.025,[s*.163,0,0],m.chrome,'x',r*.62,32);cyl(w,r*.35,.07,[s*.18,0,0],m.steel,'x');cyl(w,r*.17,.092,[s*.2,0,0],m.chrome,'x');for(let i=0;i<10;i++){const a=i*Math.PI/5;const y=Math.sin(a)*r*.46,z=Math.cos(a)*r*.46;cyl(w,.03,.014,[s*.18,y,z],m.black,'x',.03,8);}}for(let i=0;i<40;i++){const a=i*Math.PI/20;box(w,[.285,.018,.044],[0,Math.sin(a)*r,Math.cos(a)*r],m.black,[-a,0,.08],.003);}return w;}
  function rig(name,a,b,start=.15,end=.85,rotation=[0,0,0],initial=[0,0,0],arc=[0,0,0]){const g=new THREE.Group();g.name=name;root.add(g);parts.push({g,a:new THREE.Vector3(...a),b:new THREE.Vector3(...b),qa:new THREE.Quaternion().setFromEuler(new THREE.Euler(...initial)),qb:new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),arc:new THREE.Vector3(...arc),start,end});return g;}

  // Narrow mechanical core; split cab halves swing in to seal the truck cabin.
  const spine=rig('titanium spine',[0,3.72,-.05],[0,1.3,-.12],.3,.78);
  box(spine,[.42,1.82,.54],[0,0,0],m.gunmetal);
  for(let i=0;i<9;i++){const y=-.7+i*.18;plate(spine,.55,.14,.1,[0,y,.34],m.steel,[.1,0,0],'shield');cyl(spine,.058,.17,[0,y,.44],m.black,'z');}
  for(const s of [-1,1]){
    rod(spine,[s*.12,-.75,.07],[s*.8,.7,-.04],.09,m.steel);
    ribbed(spine,[s*.24,-.6,.34],[s*.7,.2,.29],.055);
    rod(spine,[s*.23,-.55,.31],[s*.79,-.03,.15],.06,m.chrome);
  }
  const waist=rig('pelvis',[0,2.93,0],[0,.76,-.45],.3,.78);
  box(waist,[.8,.44,.51],[0,0,0],m.gunmetal);
  plate(waist,.5,.65,.16,[0,-.1,.38],m.steel,[0,0,0],'shield');
  for(const s of [-1,1]){joint(waist,.2,[s*.52,-.02,0],'x');plate(waist,.47,.42,.13,[s*.41,.08,.3],m.blue,[0,s*.3,-s*.25]);cyl(waist,.1,.1,[s*.28,.26,.37],m.chrome,'z');}
  const cabRoof=rig('cab roof',[0,4.89,-.49],[0,2.51,-.01],.15,.72,[0,0,0]);
  box(cabRoof,[1.8,.12,1.13],[0,0,0],m.blue);
  for(let i=-2;i<=2;i++)box(cabRoof,[.1,.065,.11],[i*.31,.085,.49],m.amber);
  const sleeper=rig('sleeper shell',[0,4.27,-.66],[0,1.7,-.84],.28,.78);
  box(sleeper,[1.59,1.61,.48],[0,0,0],m.blue);
  for(const s of [-1,1]){vents(sleeper,[s*.48,.35,-.27],.32,.5);rod(sleeper,[s*.74,-.75,.05],[s*.74,.8,.05],.034,m.chrome);}

  for(const s of [-1,1]) {
    const chest=rig(`split cab ${s}`,[s*.6,4.52,.14],[s*.47,1.85,.19],.3,.76,[0,0,0],[.06,s*.14,s*-.15],[s*.2,.12,.12]);
    box(chest,[.87,1.15,.73],[0,-.12,-.02],m.red);
    plate(chest,.9,.65,.055,[0,.42,.405],m.chrome,[0,0,0],'window');
    plate(chest,.815,.565,.025,[0,.42,.449],m.glass,[0,0,0],'window');
    rod(chest,[-.3,.16,.482],[.24,.3,.482],.012,m.black);
    plate(chest,.71,.67,.11,[0,-.27,.42],m.red,[0,0,0],'shield');
    for(let i=0;i<3;i++)bolt(chest,[s*.27,-.08-i*.19,.5]);
    vents(chest,[-s*.18,-.29,.49],.15,.27,4);
    const door=rig(`door wing ${s}`,[s*1.01,4.32,.13],[s*.955,1.73,.15],.2,.72,[0,s*Math.PI/2,0],[0,s*.67,-s*.2],[s*.38,.1,-.15]);
    plate(door,.68,1.12,.095,[0,0,0],m.flame,[0,0,0],'window');
    plate(door,.48,.34,.025,[0,.35,.067],m.glass,[0,0,0],'window');
    box(door,[.18,.035,.024],[s*.14,-.06,.069],m.chrome);
    rod(door,[s*.29,.17,.02],[s*.45,.45,.1],.022,m.chrome);
    box(door,[.12,.26,.07],[s*.46,.44,.1],m.chrome);

    const shoulder=rig(`fender shoulder ${s}`,[s*1.5,4.48,-.05],[s*.94,.98,1.81],.16,.8,[0,0,0],[0,s*.05,-s*.28],[s*.45,.5,.2]);
    joint(shoulder,.33,[0,0,0],'x');
    plate(shoulder,.94,.76,.23,[s*.05,.11,.23],m.flame,[0,-s*.19,0]);
    plate(shoulder,.7,.25,.1,[s*.13,-.32,.23],m.blue,[0,-s*.15,s*.08]);
    // Curved fender surface carried by the shoulder into vehicle mode.
    const arch=new THREE.CylinderGeometry(.61,.61,.5,32,1,true,0,Math.PI);
    mesh(shoulder,arch,m.flame,[s*.05,-.1,-.07],[0,0,Math.PI/2]);
    rod(shoulder,[-.27,.38,0],[.3,.38,0],.032,m.chrome);
    for(let i=0;i<4;i++)bolt(shoulder,[-.26+i*.16,-.22,.37]);
    const upper=rig(`arm actuators ${s}`,[s*1.58,3.86,-.02],[s*.64,1.28,-.63],.1,.68,[Math.PI/2,0,0],[0,0,s*.1],[s*.35,.05,-.3]);
    cyl(upper,.16,.64,[0,0,0],m.gunmetal);joint(upper,.2,[0,-.31,0],'x');
    for(const dx of [-.13,.13]){rod(upper,[dx,-.25,.18],[dx,.26,.18],.047,m.chrome);cyl(upper,.073,.24,[dx,.09,.18],m.steel);}
    plate(upper,.29,.62,.075,[s*.2,0,.08],m.blue,[0,s*.6,s*.15]);
    const forearm=rig(`forearm armor ${s}`,[s*1.74,3.2,.12],[s*.65,1.25,-.24],.14,.73,[Math.PI/2,0,0],[0,-s*.12,-s*.1],[s*.55,0,.1]);
    box(forearm,[.31,.84,.36],[0,0,0],m.gunmetal);ribbed(forearm,[-s*.15,-.35,.17],[-s*.15,.35,.17],.065);
    plate(forearm,.51,1.07,.12,[s*.1,.04,.24],m.red,[0,-s*.2,0],'blade');
    plate(forearm,.43,.8,.1,[s*.3,.05,.02],m.flame,[0,s*.78,-s*.14],'blade');
    plate(forearm,.3,.35,.08,[-s*.1,-.29,.28],m.blue,[0,0,0]);
    rod(forearm,[s*.12,-.32,.34],[s*.12,.28,.34],.026,m.chrome);
    for(let i=0;i<3;i++)box(forearm,[.19,.024,.03],[0,.17-i*.13,.325],m.gunmetal);
    const hand=rig(`articulated hand ${s}`,[s*1.77,2.63,.19],[s*.55,1.2,-.7],.04,.48,[Math.PI/2,0,0],[0,0,-s*.08]);
    box(hand,[.35,.28,.22],[0,0,0],m.gunmetal);
    for(let i=0;i<4;i++){const x=-.135+i*.09;box(hand,[.069,.18,.11],[x,-.16,.06],m.steel,[.2,0,0]);box(hand,[.068,.12,.11],[x,-.27,.11],m.gunmetal,[-.75,0,0]);joint(hand,.035,[x,-.075,.13]);}
    box(hand,[.11,.22,.12],[-s*.22,-.04,.03],m.steel,[0,0,-s*.5]);
    const exhaust=rig(`exhaust stack ${s}`,[s*1.16,4.58,-.58],[s*1.08,2.15,-.65],.22,.82);
    cyl(exhaust,.083,1.83,[0,0,0],m.chrome);cyl(exhaust,.112,.64,[0,-.49,0],m.steel);cyl(exhaust,.061,.017,[0,.922,0],m.black);
    for(let i=0;i<8;i++)cyl(exhaust,.116,.019,[0,-.78+i*.078,0],m.chrome);
    const turbine=rig(`collar turbine ${s}`,[s*1.04,4.93,-.02],[s*1.04,1.64,.68],.14,.7,[0,0,0],[.22,0,s*.23]);
    cyl(turbine,.17,.36,[0,0,0],m.chrome,'z');cyl(turbine,.137,.018,[0,0,.19],m.black,'z');cyl(turbine,.047,.04,[0,0,.21],m.steel,'z');
    for(let i=0;i<7;i++){const a=i*Math.PI*2/7;box(turbine,[.025,.09,.026],[Math.cos(a)*.084,Math.sin(a)*.084,.2],m.steel,[0,0,-a+.5]);}

    const thigh=rig(`femur ${s}`,[s*.55,2.42,-.01],[s*.43,.77,-.52],.27,.79,[Math.PI/2,0,0],[0,0,-s*.065],[s*.17,.06,0]);
    rod(thigh,[0,-.48,0],[0,.45,0],.17,m.gunmetal);
    plate(thigh,.51,.8,.14,[0,-.03,.2],m.steel,[0,0,s*.07],'blade');
    plate(thigh,.27,.59,.07,[s*.26,.12,.15],m.blue,[0,s*.5,-s*.16],'blade');
    for(const dx of [-.15,.15])rod(thigh,[dx,-.37,.23],[dx,.32,.23],.041,m.chrome);
    const knee=rig(`knee ${s}`,[s*.63,1.86,.02],[s*.5,.86,-.82],.3,.82,[Math.PI/2,0,0]);
    joint(knee,.25,[0,0,.13]);plate(knee,.46,.53,.1,[0,.04,.3],m.blue,[.07,0,0],'shield');
    const shin=rig(`shin chassis ${s}`,[s*.66,1.03,-.01],[s*.56,.51,-1.78],.35,.88,[Math.PI/2,0,0],[0,0,-s*.035],[s*.26,.3,0]);
    box(shin,[.36,1.32,.37],[0,0,-.03],m.gunmetal);
    for(const dx of [-.18,.18]){rod(shin,[dx,-.58,.19],[dx,.59,.19],.058,m.chrome);cyl(shin,.083,.39,[dx,-.31,.19],m.steel);}
    plate(shin,.44,1.21,.105,[-s*.19,.02,.31],m.flame,[0,-s*.25,s*.055],'blade');
    plate(shin,.3,1.26,.13,[s*.28,.13,.14],m.blue,[0,s*.53,-s*.08],'blade');
    joint(shin,.17,[0,-.34,.33]);
    for(let i=0;i<3;i++)plate(shin,.19,.15,.04,[s*.1,.19+i*.18,.29],m.steel,[.15,0,0]);
    for(const y of [-.43,.4])wheel(shin,[s*.49,y,-.17]);
    const foot=rig(`split toe ${s}`,[s*.69,.23,.31],[s*.57,.61,-2.65],.42,.91,[Math.PI/2,0,0]);
    joint(foot,.18,[0,.16,-.11],'x');
    for(const dx of [-.21,.21]){plate(foot,.3,.88,.15,[dx,-.03,.25],m.steel,[-Math.PI/2,0,0],'toe');rod(foot,[dx,.12,-.15],[dx,.05,.53],.055,m.gunmetal);}
    plate(foot,.47,.46,.14,[0,.15,-.02],m.blue,[-.55,0,0]);
    const hood=rig(`forward hood ${s}`,[s*.48,3.99,.29],[s*.375,1.31,2.2],.39,.86,[0,0,0],[Math.PI/2,-s*.22,s*.19],[s*.45,.12,.4]);
    box(hood,[.745,.55,.83],[0,0,0],m.blue);
    plate(hood,.78,.49,.025,[s*.388,0,0],m.flame,[0,s*Math.PI/2,0],'window');
    box(hood,[.71,.027,.79],[0,.293,0],m.red);
    rod(hood,[-s*.35,.32,-.39],[-s*.35,.32,.39],.016,m.chrome);
    const rearHood=rig(`rear hood shin shell ${s}`,[s*.91,1.1,-.07],[s*.375,1.31,1.36],.3,.83,[0,0,0],[Math.PI/2,s*.32,-s*.09],[s*.4,.3,.3]);
    box(rearHood,[.745,.55,.83],[0,0,0],m.blue);
    plate(rearHood,.78,.49,.025,[s*.388,0,0],m.flame,[0,s*Math.PI/2,0],'window');
    box(rearHood,[.71,.027,.79],[0,.293,0],m.red);
    rod(rearHood,[-s*.35,.32,-.39],[-s*.35,.32,.39],.016,m.chrome);
    const frontAxle=rig(`front wheel ${s}`,[s*.71,2.83,-.45],[s*1.02,.47,1.87],.34,.87,[0,0,0],[0,0,0],[s*.45,.22,.3]);wheel(frontAxle,[0,0,0]);
    const tank=rig(`fuel tank ${s}`,[s*.78,3.31,-.43],[s*1.0,.68,-.35],.25,.8,[Math.PI/2,0,0]);
    cyl(tank,.205,.93,[0,0,0],m.chrome);for(const y of [-.31,.31])cyl(tank,.214,.041,[0,y,0],m.gunmetal);
    const step=rig(`cab step ${s}`,[s*.94,3.6,-.28],[s*1.04,.65,.37],.3,.83);
    box(step,[.35,.11,.57],[0,0,0],m.chrome);box(step,[.3,.1,.28],[0,.18,-.14],m.steel);
    for(let i=0;i<5;i++)box(step,[.27,.017,.025],[0,.064,-.23+i*.105],m.black);
  }

  const face=rig('helmet and faceplate',[0,5.32,.11],[0,1.94,-.37],0,.31);
  cyl(face,.11,.28,[0,-.4,-.03],m.chrome);
  const helmetGeo=new THREE.SphereGeometry(.34,12,10);helmetGeo.scale(1,1.32,.92);mesh(face,helmetGeo,m.blue,[0,.04,-.04]);
  plate(face,.46,.53,.12,[0,-.065,.215],m.gunmetal,[0,0,0],'shield');
  for(const s of [-1,1]){
    plate(face,.18,.67,.12,[s*.29,.11,.03],m.blue,[0,s*.12,-s*.13],'blade');
    plate(face,.083,.6,.045,[s*.325,.5,-.04],m.chrome,[0,0,-s*.035],'blade');
    plate(face,.24,.105,.03,[s*.125,.12,.335],m.steel,[0,0,-s*.18],'blade');
    plate(face,.15,.042,.025,[s*.124,.066,.362],m.eye,[0,0,-s*.13],'window');
    plate(face,.205,.33,.09,[s*.12,-.15,.335],m.chrome,[0,s*.2,s*.075],'shield');
    plate(face,.08,.29,.06,[s*.245,-.14,.25],m.blue,[0,s*.5,s*.1],'blade');
    joint(face,.093,[s*.33,-.08,-.01],'x');
    rod(face,[s*.2,-.34,.11],[s*.12,-.38,.28],.024,m.chrome);
  }
  plate(face,.15,.29,.075,[0,.35,.24],m.blue,[0,0,0],'shield');
  vents(face,[0,.38,.291],.073,.16,4);
  box(face,[.035,.31,.022],[0,-.14,.402],m.gunmetal);
  const grille=rig('radiator grille',[0,3.93,-.91],[0,1.1,2.66],.42,.91,[0,0,0],[0,0,0],[0,.2,.45]);
  box(grille,[1.47,1.05,.16],[0,0,0],m.chrome);
  box(grille,[1.31,.89,.036],[0,0,.102],m.black);
  for(let i=0;i<24;i++)box(grille,[.021,.86,.035],[-.61+i*.053,0,.133],m.chrome);
  box(grille,[1.36,.035,.036],[0,0,.153],m.chrome);
  const badge=new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),m.red);badge.scale.set(1.65,.7,.3);badge.position.set(0,.34,.158);grille.add(badge);
  const bumper=rig('front bumper',[0,4.06,-.89],[0,.49,2.76],.38,.92,[0,0,0],[Math.PI/2,0,0],[0,.3,.3]);
  box(bumper,[2.37,.25,.22],[0,0,0],m.chrome);box(bumper,[.37,.12,.016],[0,0,.124],m.black);
  for(const s of [-1,1]){const lamps=rig(`headlamps ${s}`,[s*.6,3.42,.51],[s*.98,1.1,2.55],.4,.9,[0,0,0],[0,s*.24,s*.2],[s*.3,.1,.25]);box(lamps,[.42,.24,.24],[0,0,0],m.chrome);for(const x of [-.1,.1]){box(lamps,[.16,.15,.023],[x,0,.136],m.lamp);for(let i=0;i<3;i++)box(lamps,[.006,.13,.005],[x-.045+i*.045,0,.15],m.chrome);}box(lamps,[.31,.04,.1],[0,.15,0],m.amber);}
  const chassis=rig('ladder chassis',[0,3.93,-.82],[0,.64,-.64],.3,.85,[Math.PI/2,0,0]);
  for(const s of [-1,1])box(chassis,[.12,3.42,.15],[s*.35,0,0],m.gunmetal);for(let i=0;i<8;i++)box(chassis,[.79,.068,.13],[0,-1.5+i*.42,0],m.steel);
  const hitch=rig('fifth wheel',[0,4.5,-1],[0,.98,-1.7],.3,.86,[Math.PI/2,0,0]);cyl(hitch,.37,.1,[0,0,0],m.gunmetal,'z');box(hitch,[.085,.36,.11],[0,-.21,0],m.black);

  // Bake local static geometry per assembly/material, preserving all rig pivots.
  for(const {g} of parts){g.updateMatrixWorld(true);const batches=new Map();g.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone().applyMatrix4(o.matrixWorld);const key=o.material.uuid;if(!batches.has(key))batches.set(key,{material:o.material,geometries:[]});batches.get(key).geometries.push(geo.index?geo.toNonIndexed():geo);});g.clear();for(const {material,geometries} of batches.values()){const geo=mergeGeometries(geometries,false);mesh(g,geo,material);for(const old of geometries)old.dispose();}}
  function pose(t){for(const p of parts){const v=THREE.MathUtils.smoothstep(t,p.start,p.end);p.g.position.lerpVectors(p.a,p.b,v).addScaledVector(p.arc,Math.sin(v*Math.PI));p.g.quaternion.slerpQuaternions(p.qa,p.qb,v);}}
  pose(0);
  return {root,parts,materials,pose,metadata:{name:'Optimus Prime',edition:'2007–2011 / Movie study',vehicle:'Peterbilt 379',id:'optimus-prime'}};
}
