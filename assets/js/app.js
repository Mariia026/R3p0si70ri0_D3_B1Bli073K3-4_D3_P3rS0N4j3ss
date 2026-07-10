alert("JS cargado");

// 🔴 REEMPLAZAR CON TU CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCAmvZgXrDDuOwrV-9S-YESMCHSxeQ1oeo",
  authDomain: "milist4d3l3ctu4s.firebaseapp.com",
  projectId: "milist4d3l3ctu4s",
  storageBucket: "milist4d3l3ctu4s.firebasestorage.app",
  messagingSenderId: "186844556335",
  appId: "1:186844556335:web:1205e5f87b54883b0b2ada",
  measurementId: "G-05L07HR5D9"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let todosLibros = [];
let editandoId = null;

function registrar(){
  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, pass).catch(e=>alert(e.message));
}

function login(){
  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, pass).catch(e=>alert(e.message));
}

function logout(){ auth.signOut(); }

auth.onAuthStateChanged(user=>{
  if(user){
    document.getElementById("auth").style.display="none";
    document.getElementById("app").style.display="block";
    cargarLibros();
  }else{
    document.getElementById("auth").style.display="block";
    document.getElementById("app").style.display="none";
  }
});

function guardarLocal(){
  localStorage.setItem("libros", JSON.stringify(todosLibros));
}

function cargarLocal(){
  let data = localStorage.getItem("libros");
  if(data){
    todosLibros = JSON.parse(data);
    mostrarLibros(todosLibros);
  }
}

function cargarLibros(){
  if(!navigator.onLine){
    cargarLocal();
    return;
  }

  db.collection("libros")
    .where("userId","==",auth.currentUser.uid)
    .get()
    .then(snap=>{
      todosLibros=[];
      snap.forEach(doc=>{
        let d=doc.data();
        d.id=doc.id;
        todosLibros.push(d);
      });
      guardarLocal();
      mostrarLibros(todosLibros);
    })
    .catch(()=>cargarLocal());
}

function mostrarLibros(lista){
  let c=document.getElementById("biblioteca");
  c.innerHTML="";
  lista.forEach(l=>{
    c.innerHTML+=`
    <div class="libro">
      <img src="${l.imagen||'https://via.placeholder.com/150'}">
      <h4>${l.nombre}</h4>
      <p>${l.descripcion||""}</p>
      <small>${l.estado}</small><br>
      <button onclick="toggleFavorito('${l.id}')">${l.favorito?"⭐":"☆"}</button>
      
      <button onclick="editarLibro('${l.id}')">✏️</button>
      <button onclick="eliminarLibro('${l.id}')">❌</button>
    </div>`;
  });
}

function guardarLibro(){
  let data={
    nombre:document.getElementById("nombre").value,
    imagen:document.getElementById("imagen").value,
    descripcion:document.getElementById("descripcion").value,
    estado:document.getElementById("estado").value,
    favorito:false,
    userId:auth.currentUser.uid
  };

  if(editandoId){
    db.collection("libros").doc(editandoId).update(data).then(()=>{
      editandoId=null;
      cerrarForm();
      cargarLibros();
    });
  }else{
    db.collection("libros").add(data).then(()=>{
      cerrarForm();
      cargarLibros();
    });
  }
  guardarLocal();
}

function editarLibro(id){
  let l = todosLibros.find(x => x.id === id);

  if(!l){
    alert("No se encontró el libro");
    return;
  }

  document.getElementById("nombre").value = l.nombre || "";
  document.getElementById("imagen").value = l.imagen || "";
  document.getElementById("descripcion").value = l.descripcion || "";
  document.getElementById("estado").value = l.estado || "pendiente";

  editandoId = id;

  document.getElementById("tituloForm").innerText = "Editar libro";
  abrirForm();
}









function eliminarLibro(id){
  if(!confirm("Eliminar?"))return;
  db.collection("libros").doc(id).delete().then(cargarLibros);
  guardarLocal();
}

function toggleFavorito(id){
  let l=todosLibros.find(x=>x.id===id);
  db.collection("libros").doc(id).update({favorito:!l.favorito}).then(cargarLibros);
  guardarLocal();
}

function filtrar(){
  let t=document.getElementById("buscador").value.toLowerCase();
  mostrarLibros(todosLibros.filter(l=>l.nombre.toLowerCase().includes(t)));
}

function filtrarEstado(e){
  if(e==="todos") return mostrarLibros(todosLibros);
  mostrarLibros(todosLibros.filter(l=>l.estado===e));
}

function filtrarFavoritos(){
  mostrarLibros(todosLibros.filter(l=>l.favorito));
}

function abrirForm(){ document.getElementById("modal").style.display="block"; }
function cerrarForm(){
  document.getElementById("modal").style.display="none";
  document.getElementById("nombre").value="";
  document.getElementById("imagen").value="";
  document.getElementById("descripcion").value="";
  editandoId=null;
  document.getElementById("tituloForm").innerText="Agregar libro";
}







// EXPORTAR
function exportarDatos() {
  let datos = localStorage.getItem("libros");

  if (!datos) {
    alert("No hay datos para exportar");
    return;
  }

  let blob = new Blob([datos], { type: "application/json" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "backup_biblioteca.json";
  a.click();

  URL.revokeObjectURL(url);
}

// IMPORTAR
function importarDatos(event) {
  let archivo = event.target.files[0];

  if (!archivo) return;

  let lector = new FileReader();

  lector.onload = function(e) {
    try {
      let datos = JSON.parse(e.target.result);
      localStorage.setItem("libros", JSON.stringify(datos));
      alert("Backup restaurado correctamente");

      location.reload(); // recargar la app
    } catch (error) {
      alert("Error al importar archivo");
    }
  };

  lector.readAsText(archivo);
}










if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/MiList4D3L3ctu4s/service-worker.js")
      .then(() => console.log("SW listo"))
      .catch(err => console.log("Error SW:", err));
  });
  }
