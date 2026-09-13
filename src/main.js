import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import './style.css';

const viewport = document.querySelector('#viewport');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference:'high-performance' }); }
catch { document.querySelector('#loading').textContent='This study needs WebGL. Please enable hardware acceleration and reload.'; throw new Error('WebGL unavailable'); }
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
viewport.appendChild(renderer.domElement);
const pmrem = new THREE.PMREMGenerator(renderer);
const room = new RoomEnvironment();
scene.environment = pmrem.fromScene(room, .04).texture;
room.dispose(); pmrem.dispose();
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor=.06;
controls.minDistance=7;controls.maxDistance=22;controls.maxPolarAngle=Math.PI*.49;controls.minPolarAngle=.25;controls.enablePan=false;controls.autoRotateSpeed=.65;
scene.add(new THREE.HemisphereLight(0xb4d9ff,0x1c2432,.8));
function light(color,intensity,pos){const l=new THREE.DirectionalLight(color,intensity);l.position.set(...pos);scene.add(l);return l;}
const key=light(0xffead6,2.5,[4,9,6]);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-7,right:7,top:10,bottom:-7,near:.1,far:30});key.shadow.normalBias=.025;
light(0x79baff,2,[-5,6,-4]);light(0xffffff,1.5,[-3,4,7]);
const mat=(color,metalness=.65,roughness=.3)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
const red=mat('#b82524',.75,.27), redEdge=mat('#e03d31',.65,.28), blue=mat('#173f88',.8,.25), darkBlue=mat('#102b59',.7,.3), steel=mat('#9aa8b5',.92,.23), dark=mat('#242b32',.85,.37), black=mat('#11161a',.15,.82), glass=mat('#173b51',.8,.13), silver=mat('#c2cbd2',.9,.2);
const glow=new THREE.MeshStandardMaterial({color:0xa9edff,emissive:0x51caff,emissiveIntensity:3,metalness:.2,roughness:.2});
const amber=new THREE.MeshStandardMaterial({color:0xffbd55,emissive:0xf58217,emissiveIntensity:1.4});
const root=new THREE.Group();scene.add(root);
const parts=[];const rounded=new Map();
function box(parent,size,pos,material=steel,r=.035){const k=size.join(',')+','+r;let geo=rounded.get(k);if(!geo){geo=new RoundedBoxGeometry(...size,1,r);rounded.set(k,geo);}const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(parent,r,len,pos,material=steel,axis='y',segments=20){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,segments),material);if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;m.position.set(...pos);m.castShadow=true;parent.add(m);return m;}
function assembly(name,robot,truck,start=.1,end=.9,rot=[0,0,0]){const g=new THREE.Group();g.name=name;root.add(g);g.position.set(...robot);parts.push({g,a:new THREE.Vector3(...robot),b:new THREE.Vector3(...truck),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),start,end});return g;}
function bolts(g,x,y,z,w,h){for(const sx of [-1,1])for(const sy of [-1,1])cylinder(g,.026,.018,[x+sx*w/2,y+sy*h/2,z],silver,'z',6);}
function panel(g,size,pos,material){box(g,size,pos,material);bolts(g,...[pos[0],pos[1],pos[2]+size[2]/2+.009],size[0]-.13,size[1]-.13);}
function wheel(g,pos){const w=new THREE.Group();w.position.set(...pos);g.add(w);cylinder(w,.43,.3,[0,0,0],black,'x',32);for(const s of [-1,1]){cylinder(w,.29,.012,[s*.157,0,0],dark,'x',32);cylinder(w,.23,.022,[s*.17,0,0],silver,'x');cylinder(w,.11,.055,[s*.2,0,0],steel,'x');for(let i=0;i<8;i++){let a=i*Math.PI/4;cylinder(w,.026,.025,[s*.19,Math.sin(a)*.16,Math.cos(a)*.16],dark,'x',8);}}for(let i=0;i<32;i++){let a=i*Math.PI/16;const t=box(w,[.29,.025,.09],[0,Math.sin(a)*.427,Math.cos(a)*.427],dark,.005);t.rotation.x=-a;}return w;}

// Every primary assembly has robot and vehicle poses. Nothing crossfades.
const torso=assembly('cab core',[0,4.05,0],[0,1.59,1.15],.28,.76);
box(torso,[2.05,1.57,.92],[0,0,0],red);
box(torso,[1.76,.25,1.1],[0,.9,.01],redEdge);
for(let i=-2;i<=2;i++)box(torso,[.11,.065,.11],[i*.34,1.065,.53],amber,.02);
for(const s of [-1,1]){
 panel(torso,[.85,.75,.12],[s*.51,.33,.53],steel);
 box(torso,[.76,.63,.035],[s*.51,.34,.605],glass,.012);
 const refl=box(torso,[.028,.57,.01],[s*.51-.23,.34,.629],mat('#538698',.7,.18),.005);refl.rotation.z=-.2;
 const wiper=box(torso,[.51,.023,.025],[s*.51,.105,.648],dark,.005);wiper.rotation.z=s*.12;
 panel(torso,[.88,.53,.12],[s*.51,-.38,.53],redEdge);
 box(torso,[.2,.07,.035],[s*.72,-.28,.61],silver,.01);
 box(torso,[.17,.45,.55],[s*1.09,.1,.1],red);
 cylinder(torso,.025,.55,[s*1.3,.4,.33],steel);
 box(torso,[.2,.3,.09],[s*1.3,.67,.33],silver);
 box(torso,[.14,.24,.018],[s*1.3,.67,.385],glass,.01);
}
const grille=assembly('grille',[0,3.07,.31],[0,1.19,1.73],.35,.84);
box(grille,[1.54,.73,.2],[0,0,0],steel);
box(grille,[1.37,.57,.035],[0,0,.12],dark,.01);
for(let i=0;i<9;i++)box(grille,[1.34,.028,.025],[0,-.245+i*.061,.15],silver,.005);
box(grille,[.09,.62,.035],[0,0,.172],steel,.01);
for(const s of [-1,1]){box(grille,[.31,.29,.22],[s*.97,-.04,0],steel);for(const x of [-.075,.075])box(grille,[.11,.18,.03],[s*.97+x,-.04,.13],glow,.02);}
const bumper=assembly('bumper',[0,2.59,.32],[0,.73,1.75],.35,.88);
box(bumper,[2.43,.22,.3],[0,0,0],silver);box(bumper,[.45,.13,.012],[0,0,.159],dark,.008);
const pelvis=assembly('waist',[0,2.62,-.1],[0,.86,.02],.32,.82);
box(pelvis,[1.35,.48,.83],[0,0,0],dark);box(pelvis,[.6,.42,.16],[0,-.03,.49],blue);
for(const s of [-1,1])cylinder(pelvis,.15,.6,[s*.5,0,.48],steel,'y');
const head=assembly('head',[0,5.31,.08],[0,1.65,1.08],0,.3);
cylinder(head,.2,.25,[0,-.45,0],dark);box(head,[.7,.83,.65],[0,0,0],blue,.07);
box(head,[.52,.5,.17],[0,-.055,.36],dark,.025);
for(const s of [-1,1]){panel(head,[.17,.66,.35],[s*.42,-.05,.05],blue);box(head,[.085,.63,.12],[s*.43,.56,.04],blue,.015);box(head,[.21,.065,.06],[s*.14,.085,.468],glow,.012);cylinder(head,.105,.1,[s*.5,-.02,.08],steel,'x');}
const mask=box(head,[.45,.33,.16],[0,-.2,.463],silver,.03);mask.rotation.x=-.16;
box(head,[.105,.33,.12],[0,.39,.34],steel,.012);
for(let i=-1;i<=1;i++)box(head,[.015,.24,.015],[i*.105,-.21,.552],steel,.003);

for(const s of [-1,1]){
 const shoulder=assembly('shoulder '+s,[s*1.39,4.38,-.02],[s*.92,1.74,.85],.12,.58,[0,0,s*Math.PI/2]);
 cylinder(shoulder,.28,.5,[0,-.18,0],dark,'x');panel(shoulder,[.7,.85,.89],[s*.06,.1,0],red);
 panel(shoulder,[.49,.39,.04],[s*.06,.25,.477],redEdge);
 // A small angular insignia evokes the Autobot armor crest.
 const crest=box(shoulder,[.19,.18,.018],[s*.06,.25,.51],silver,.005);crest.rotation.z=Math.PI/4;
 for(let i=0;i<3;i++)box(shoulder,[.45,.025,.025],[s*.06,-.15-i*.075,.473],dark,.003);
 const arm=assembly('forearm '+s,[s*1.57,3.33,.03],[s*.79,1.34,.24],.08,.62,[Math.PI/2,0,s*.08]);
 cylinder(arm,.19,.6,[0,.48,0],steel);cylinder(arm,.23,.57,[0,.2,0],dark,'x');
 panel(arm,[.64,.83,.7],[0,-.2,.05],red);
 box(arm,[.42,.66,.1],[0,-.2,.45],redEdge);
 for(let i=0;i<4;i++)box(arm,[.34,.027,.017],[0,-.1-i*.11,.51],dark,.004);
 const fist=assembly('hand '+s,[s*1.57,2.58,.07],[s*.76,1.48,.51],0,.35);
 box(fist,[.49,.43,.51],[0,0,0],blue);
 for(let i=0;i<4;i++)box(fist,[.097,.26,.1],[-.165+i*.11,-.02,.3],darkBlue,.017);
 box(fist,[.16,.28,.24],[-s*.28,.01,.05],blue);
 const stack=assembly('exhaust '+s,[s*1.21,4.49,-.57],[s*1.15,1.85,.14],.22,.74);
 cylinder(stack,.095,1.65,[0,0,0],silver);cylinder(stack,.14,.59,[0,-.39,0],steel);cylinder(stack,.069,.012,[0,.831,0],black);
 for(let i=0;i<7;i++)cylinder(stack,.147,.026,[0,-.66+i*.085,0],dark);
 const thigh=assembly('upper leg '+s,[s*.53,2.13,0],[s*.51,.72,-.38],.26,.72,[Math.PI/2,0,0]);
 cylinder(thigh,.27,.65,[0,0,0],dark);panel(thigh,[.57,.71,.54],[0,0,.08],steel);
 for(const x of [-.18,.18])cylinder(thigh,.05,.6,[x,0,.38],silver);
 const leg=assembly('lower leg '+s,[s*.59,1.14,.02],[s*.55,.75,-1.24],.34,.88,[Math.PI/2,0,0]);
 box(leg,[.77,1.4,.76],[0,0,0],blue);panel(leg,[.63,1.06,.12],[0,-.02,.43],darkBlue);
 for(let i=0;i<6;i++)box(leg,[.49,.033,.035],[0,-.35+i*.13,.51],steel,.005);
 panel(leg,[.72,.29,.2],[0,.59,.43],steel);
 box(leg,[.16,1.04,.11],[s*.4,-.06,.16],blue);
 for(let y of [-.43,.35])wheel(leg,[s*.48,y,-.1]);
 const foot=assembly('foot '+s,[s*.59,.28,.3],[s*.56,.75,-2.14],.38,.9,[Math.PI/2,0,0]);
 panel(foot,[.84,.36,1.12],[0,0,.08],blue);box(foot,[.78,.09,1.09],[0,-.205,.08],dark);
 for(let i=0;i<3;i++)box(foot,[.035,.17,.026],[-.24+i*.24,0,.65],steel,.004);
 const frontWheel=assembly('front axle '+s,[s*.94,2.91,-.46],[s*1.07,.48,1.1],.35,.87);wheel(frontWheel,[0,0,0]);
 const tank=assembly('fuel tank '+s,[s*.89,2.05,-.46],[s*1.03,.66,-.17],.24,.78,[Math.PI/2,0,0]);
 cylinder(tank,.23,.74,[0,0,0],steel);for(let y of [-.25,.25])cylinder(tank,.241,.045,[0,y,0],dark);
}
const frame=assembly('chassis',[0,3.42,-.61],[0,.65,-.75],.28,.8,[Math.PI/2,0,0]);
for(const s of [-1,1])box(frame,[.13,2.7,.18],[s*.37,0,0],dark);for(let y=-1.1;y<1.2;y+=.45)box(frame,[.8,.08,.17],[0,y,0],steel);
const hitch=assembly('fifth wheel',[0,3.85,-.82],[0,1.19,-1.32],.28,.86,[Math.PI/2,0,0]);
cylinder(hitch,.41,.12,[0,0,0],dark,'z',32);box(hitch,[.1,.4,.13],[0,-.26,0],black);

const floor=new THREE.Mesh(new THREE.CircleGeometry(18,96),new THREE.ShadowMaterial({opacity:.22}));floor.rotation.x=-Math.PI/2;floor.position.y=-.013;floor.receiveShadow=true;scene.add(floor);
const platform=new THREE.Mesh(new THREE.CylinderGeometry(3.5,3.58,.10,96),mat('#080e16',.25,.8));platform.position.y=-.075;platform.receiveShadow=true;scene.add(platform);
const ring=new THREE.Mesh(new THREE.TorusGeometry(3.45,.009,6,128),mat('#647f92',.7,.4));ring.rotation.x=Math.PI/2;ring.position.y=-.016;scene.add(ring);
for(let i=0;i<60;i++){const a=i*Math.PI/30;const tick=box(scene,[.012,.004,i%5===0?.12:.05],[Math.sin(a)*3.3,-.018,Math.cos(a)*3.3],steel,.001);tick.rotation.y=a;}

const slider=document.querySelector('#transform'),play=document.querySelector('#play');
let progress=0,target=0,playing=false,direction=1,last=performance.now();
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function pose(t){for(const p of parts){const v=THREE.MathUtils.smoothstep(t,p.start,p.end);p.g.position.lerpVectors(p.a,p.b,v);p.g.quaternion.identity().slerp(p.q,v);}root.position.y=Math.sin(t*Math.PI)*.12;}
function updateUI(){const percent=Math.round(target*100);slider.value=target*1000;slider.style.setProperty('--progress',`${percent}%`);document.querySelector('#progress').innerHTML=`${percent}<span>%</span>`;const stage=Math.min(3,Math.floor(target*4));document.querySelectorAll('[data-stage]').forEach((el,i)=>el.classList.toggle('active',i===stage));document.querySelector('#phase').textContent=target===0?'Ready to roll out.':target===1?'More than meets the eye.':['Releasing armor locks.','Folding the assemblies.','Bringing it together.','Locking vehicle form.'][stage];document.querySelector('#mode').textContent=target===0?'Robot mode':target===1?'Vehicle mode':'Transformation in progress';document.querySelector('#play-label').textContent=playing?'Pause':target>=.999?'Revert':'Transform';document.querySelector('#play-icon').textContent=playing?'Ⅱ':'▶';slider.setAttribute('aria-valuetext',`${percent}% transformed`);}
slider.addEventListener('input',()=>{playing=false;target=Number(slider.value)/1000;updateUI();});
play.addEventListener('click',()=>{playing=!playing;if(playing){direction=target>=.999?-1:target<=.001?1:direction;}updateUI();});
document.querySelector('#rotate').addEventListener('click',e=>{controls.autoRotate=!controls.autoRotate;e.currentTarget.setAttribute('aria-pressed',controls.autoRotate);});
document.querySelector('#wire').addEventListener('click',e=>{const on=e.currentTarget.getAttribute('aria-pressed')!=='true';root.traverse(o=>{if(o.isMesh)o.material.wireframe=on;});e.currentTarget.setAttribute('aria-pressed',on);});
function reset(){const mobile=innerWidth<800;camera.position.set(mobile?8.9:9, mobile?6.4:6.8,mobile?13.7:14.6);controls.target.set(0,2.6,0);controls.update();}
document.querySelector('#reset').addEventListener('click',()=>{controls.autoRotate=false;document.querySelector('#rotate').setAttribute('aria-pressed','false');reset();});
function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.clearViewOffset();if(w>800)camera.setViewOffset(w,h,-w*.135,h*.10,w,h);else camera.setViewOffset(w,h,-w*.025,h*.01,w,h);camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(viewport);reset();resize();updateUI();pose(0);document.querySelector('#loading').remove();
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();playing=false;const note=document.createElement('div');note.id='loading';note.textContent='Graphics context interrupted. Reload to resume.';viewport.appendChild(note);});
function animate(now){const dt=Math.min((now-last)/1000,.05);last=now;if(playing){target=THREE.MathUtils.clamp(target+dt/8*direction,0,1);if(target===0||target===1)playing=false;updateUI();}progress=reduced?target:THREE.MathUtils.damp(progress,target,13,dt);if(Math.abs(progress-target)<.0001)progress=target;pose(progress);controls.update();renderer.render(scene,camera);requestAnimationFrame(animate);}requestAnimationFrame(animate);
// Read-only diagnostics used to verify each assembled endpoint and the animation.
window.primeStudy={get state(){return{target,progress,playing,assemblies:parts.length,meshes:renderer.info.render.calls,triangles:renderer.info.render.triangles};}};


