/* Enigma M3 pédagogique : rotors I-II-III, réflecteur B, bagues A, sans tableau de connexions. */
(()=>{"use strict";
const AL="ABCDEFGHIJKLMNOPQRSTUVWXYZ", rotorData=[
{w:"EKMFLGDQVZNTOWYHXUSPAIBRCJ",notch:"Q"},
{w:"AJDKSIRUXBLHWTMCQGZNPYFVOE",notch:"E"},
{w:"BDFHJLCPRTXVZNYEIWGAKMUSQO",notch:"V"}],reflect="YRUHQSLDPXNGOKMIEBFZCWVJAT";
const phrases=[
"LES CAROTTES SONT CUITES","LE COQ CHANTERA TROIS FOIS","LA LUNE ECLAIRE LE JARDIN",
"LE RENARD ATTEND MINUIT","LES HIRONDELLES SONT DE RETOUR",
"LE CHAT DORT SUR LE TOIT","LE VENT TOURNE A L EST","LE TRAIN PARTIRA DEMAIN"];
const seeds=["AAA","DLM","KQF","BXR","MTA","QWE","FJN","RDC"];
const clean=s=>s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Z]/g,"");
const groups=s=>(s.match(/.{1,5}/g)||[]).join(" ");
function makeMachine(seed){const pos=[...seed].map(c=>AL.indexOf(c));return {pos,step(letter){
const middleNotch=AL[pos[1]]===rotorData[1].notch,rightNotch=AL[pos[2]]===rotorData[2].notch;
if(middleNotch)pos[0]=(pos[0]+1)%26;
if(middleNotch||rightNotch)pos[1]=(pos[1]+1)%26;
pos[2]=(pos[2]+1)%26;
let v=AL.indexOf(letter);
for(let i=2;i>=0;i--)v=(AL.indexOf(rotorData[i].w[(v+pos[i])%26])-pos[i]+26)%26;
v=AL.indexOf(reflect[v]);
for(let i=0;i<3;i++){const r=rotorData[i];v=(r.w.indexOf(AL[(v+pos[i])%26])-pos[i]+26)%26}
return AL[v]}}}
const records=phrases.map((p,i)=>{const machine=makeMachine(seeds[i]),plain=clean(p);return {plain,seed:seeds[i],cipher:[...plain].map(c=>machine.step(c)).join(""),phrase:p}});
let state=null;
function render(){const root=document.querySelector("#mission-result");if(!root||root.dataset.activePole!=="2")return;
root.innerHTML=document.querySelector("#enigma-template").innerHTML;state={index:0,entered:"",result:"",machine:makeMachine(seeds[0]),solved:false};root.querySelector(".enigma-keyboard").innerHTML=[..."QWERTZUIOASDFGHJKPYXCVBNML"].map(c=>'<button type="button" data-letter="'+c+'" aria-label="Touche '+c+'">'+c+'</button>').join("");root.querySelector(".enigma-lamps").innerHTML=[..."QWERTZUIOASDFGHJKPYXCVBNML"].map(c=>'<span data-lamp="'+c+'">'+c+'</span>').join("");newMessage(0)}
function newMessage(index){if(!state)return;state.index=index;state.entered="";state.result="";state.solved=false;state.machine=makeMachine(records[index].seed);const root=document.querySelector("#mission-result"),rec=records[index];root.querySelector("#enigma-intercept").textContent=groups(rec.cipher);root.querySelector("#enigma-progress").textContent="0 / "+rec.cipher.length+" lettres";root.querySelector("#enigma-output").textContent="EN ATTENTE DE SAISIE";root.querySelector("#enigma-result").textContent="";root.querySelector("#enigma-final").hidden=true;root.querySelector("#enigma-info").textContent="Recopie le message intercepté avec le clavier physique ou celui de la machine.";root.querySelectorAll("[data-lamp]").forEach(e=>e.classList.remove("lit"));root.querySelectorAll("[data-letter]").forEach(e=>e.classList.remove("pressed"));root.querySelector("#enigma-next").textContent="Nouveau message";draw()}
function draw(){if(!state)return;const root=document.querySelector("#mission-result");state.machine.pos.forEach((n,i)=>{root.querySelector("#enigma-rotor-"+i).textContent=AL[n]});const rec=records[state.index];root.querySelector("#enigma-typed").textContent=groups(state.entered)||"_____";root.querySelector("#enigma-output").textContent=groups(state.result)||"EN ATTENTE DE SAISIE";root.querySelector("#enigma-progress").textContent=state.entered.length+" / "+rec.cipher.length+" lettres"}
function typeLetter(ch){if(!state||state.solved)return;const rec=records[state.index];if(state.entered.length>=rec.cipher.length)return;const expected=rec.cipher[state.entered.length];const root=document.querySelector("#mission-result");if(ch!==expected){root.querySelector("#enigma-info").textContent="Cette lettre ne correspond pas au message intercepté. Cherche la lettre "+expected+".";return}
state.entered+=ch;const out=state.machine.step(ch);state.result+=out;root.querySelectorAll("[data-lamp]").forEach(e=>e.classList.toggle("lit",e.dataset.lamp===out));root.querySelectorAll("[data-letter]").forEach(e=>e.classList.toggle("pressed",e.dataset.letter===ch));root.querySelector("#enigma-info").textContent="Lettre "+ch+" saisie, lampe "+out+" allumée.";draw();if(state.entered.length===rec.cipher.length){state.solved=true;root.querySelector("#enigma-final").hidden=false;root.querySelector("#enigma-final").textContent="Mission accomplie ! Message reconstitué : "+rec.phrase+". Les espaces ne figuraient pas dans le message chiffré.";root.querySelector("#enigma-info").textContent="Message entièrement déchiffré : bravo !"}}
function handleClick(e){const root=document.querySelector("#mission-result");if(!root||root.dataset.activePole!=="2")return;const key=e.target.closest("[data-letter]");if(key){typeLetter(key.dataset.letter);root.querySelector(".enigma-keyboard").focus();return}if(e.target.closest("#enigma-next")){newMessage((state.index+1)%records.length);return}if(e.target.closest("#enigma-restart")){newMessage(state.index)}}
document.addEventListener("click",handleClick);
document.addEventListener("keydown",e=>{const root=document.querySelector("#mission-result");if(!root||root.dataset.activePole!=="2"||!state||e.ctrlKey||e.metaKey||e.altKey)return;if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;const ch=e.key.toUpperCase();if(/^[A-Z]$/.test(ch)){e.preventDefault();typeLetter(ch)}else if(e.key==="Backspace"){e.preventDefault();newMessage(state.index)}});
window.CielEnigma={render};
})();
