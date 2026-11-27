// 1. Supabase-Projekt anlegen und Werte unten einsetzen (siehe README).
const SUPABASE_URL = "https://fxfzicleoxawyhkudjeo.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_lVdtHyY3lWBxwbatS5htkg_G6J3x7Iy";
const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_ANON_KEY.startsWith("DEIN_");
const $ = (id) => document.getElementById(id);
let db, currentUser, properties=[], units=[], tenants=[], transactions=[];
const euro = n => new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(Number(n)||0);
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function msg(id,text){$(id).textContent=text}
function showAuth(){ $("authView").classList.remove("hidden"); $("appView").classList.add("hidden"); $("logoutBtn").classList.add("hidden");}
function showApp(){ $("authView").classList.add("hidden"); $("appView").classList.remove("hidden"); $("logoutBtn").classList.remove("hidden"); $("userEmail").textContent=currentUser.email||"";}
function tab(name){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));document.querySelectorAll(".tabpage").forEach(p=>p.classList.toggle("hidden",p.id!==name));}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>tab(b.dataset.tab)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>tab(b.dataset.go)));
async function load(){
 const [p,u,t,f]=await Promise.all([
  db.from("properties").select("*").order("created_at",{ascending:false}),
  db.from("units").select("*").order("created_at"),
  db.from("tenants").select("*").order("created_at",{ascending:false}),
  db.from("transactions").select("*").order("date",{ascending:false})
 ]);
 for(const r of [p,u,t,f]) if(r.error) throw r.error;
 properties=p.data||[];units=u.data||[];tenants=t.data||[];transactions=f.data||[];render();
}
function render(){
 $("statProperties").textContent=properties.length;$("statUnits").textContent=units.length;$("statTenants").textContent=tenants.length;
 $("overviewList").innerHTML=properties.length?properties.map(p=>`<div class="item"><h3>${esc(p.name)}</h3><p>${esc(p.address||"Keine Adresse hinterlegt")}</p><p>${units.filter(u=>u.property_id===p.id).length} Wohnungen</p></div>`).join(""):'Noch keine Immobilien angelegt.';
 $("propertyList").innerHTML=properties.map(p=>`<article class="item"><h3>${esc(p.name)}</h3><p>${esc(p.address||"Keine Adresse hinterlegt")}</p><p>${esc(p.notes||"")}</p><button class="small secondary" data-add-unit="${p.id}">+ Wohnung hinzufügen</button><div class="unitlist">${units.filter(u=>u.property_id===p.id).map(u=>`<p>🏠 ${esc(u.name)}</p>`).join("")}</div></article>`).join("");
 document.querySelectorAll("[data-add-unit]").forEach(b=>b.onclick=()=>addUnit(b.dataset.addUnit));
 const opts=units.map(u=>`<option value="${u.id}">${esc(properties.find(p=>p.id===u.property_id)?.name||"")} – ${esc(u.name)}</option>`).join("");
 $("tenantUnit").innerHTML=opts||'<option value="">Zuerst Wohnung anlegen</option>';
 $("financeProperty").innerHTML=properties.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("");
 $("tenantList").innerHTML=tenants.map(t=>`<article class="item"><h3>${esc(t.name)}</h3><p>${esc(units.find(u=>u.id===t.unit_id)?.name||"Wohnung nicht gefunden")}</p><p>${esc(t.email||"")}${t.phone?" · "+esc(t.phone):""}</p><p>Mietbeginn: ${esc(t.start_date||"–")}</p></article>`).join("")||'<div class="empty">Noch keine Mieter angelegt.</div>';
 const inc=transactions.filter(x=>x.kind==="income").reduce((a,x)=>a+Number(x.amount),0),out=transactions.filter(x=>x.kind==="expense").reduce((a,x)=>a+Number(x.amount),0);
 $("totalIncome").textContent=euro(inc);$("totalExpense").textContent=euro(out);$("balance").textContent=euro(inc-out);
 $("financeList").innerHTML=transactions.map(x=>`<article class="item"><h3>${x.kind==="income"?"＋ Einnahme":"− Ausgabe"} · ${euro(x.amount)}</h3><p>${esc(x.description)}</p><p>${esc(x.date)} · ${esc(properties.find(p=>p.id===x.property_id)?.name||"")}</p></article>`).join("")||'<div class="empty">Noch keine Buchungen.</div>';
}
async function addUnit(property_id){
 const name=prompt("Bezeichnung der Wohnung (z. B. Wohnung 1):");if(!name?.trim())return;
 const {error}=await db.from("units").insert({property_id,name:name.trim()});if(error)alert(error.message);else await load();
}
$("propertyForm").addEventListener("submit",async e=>{e.preventDefault();const d=new FormData(e.target);const {error}=await db.from("properties").insert({name:d.get("name"),address:d.get("address"),notes:d.get("notes")});if(error)msg("propertyMessage",error.message);else{e.target.reset();msg("propertyMessage","Immobilie gespeichert.");await load();}});
$("tenantForm").addEventListener("submit",async e=>{e.preventDefault();const d=new FormData(e.target);if(!d.get("unit_id"))return msg("tenantMessage","Bitte zuerst eine Wohnung anlegen.");const {error}=await db.from("tenants").insert({unit_id:d.get("unit_id"),name:d.get("name"),email:d.get("email"),phone:d.get("phone"),start_date:d.get("start_date")||null});if(error)msg("tenantMessage",error.message);else{e.target.reset();msg("tenantMessage","Mieter gespeichert.");await load();}});
$("financeForm").addEventListener("submit",async e=>{e.preventDefault();const d=new FormData(e.target);const {error}=await db.from("transactions").insert({kind:d.get("kind"),property_id:d.get("property_id")||null,description:d.get("description"),amount:Number(d.get("amount")),date:d.get("date")});if(error)msg("financeMessage",error.message);else{e.target.reset();msg("financeMessage","Buchung gespeichert.");await load();}});
$("loginBtn").onclick=async()=>{const {error}=await db.auth.signInWithPassword({email:$("email").value,password:$("password").value});msg("authMessage",error?error.message:"Anmeldung erfolgreich.");};
$("signupBtn").onclick=async()=>{const {error}=await db.auth.signUp({email:$("email").value,password:$("password").value});msg("authMessage",error?error.message:"Konto erstellt. Falls E-Mail-Bestätigung aktiviert ist, bitte Postfach prüfen.");};
$("logoutBtn").onclick=async()=>{await db.auth.signOut();currentUser=null;showAuth();};
async function start(){
 if(!configured){$("setupNotice").classList.remove("hidden");return;}
 db=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
 const {data:{session}}=await db.auth.getSession();
 if(session){currentUser=session.user;showApp();try{await load()}catch(e){alert("Daten konnten nicht geladen werden: "+e.message)}}
 db.auth.onAuthStateChange(async(_event,session)=>{if(session){currentUser=session.user;showApp();try{await load()}catch(e){console.error(e)}}else{showAuth()}});
}
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
start();