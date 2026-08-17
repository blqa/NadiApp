import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Star, Calendar, MessageCircle, Plus, Edit2, Trash2, X, Info } from 'lucide-react';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqXPV9LA3j1MY6swbM-d4YqsuxGT37Q7g",
  authDomain: "nadiapp-b44ae.firebaseapp.com",
  projectId: "nadiapp-b44ae",
  storageBucket: "nadiapp-b44ae.firebasestorage.app",
  messagingSenderId: "458286198231",
  appId: "1:458286198231:web:d9801e0dd6ea4fd0ae2f92"
};

// Use global config if available (for the preview environment), otherwise use provided config
const configToUse = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : firebaseConfig;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'peli-nad-default';

const app = initializeApp(configToUse);
const db = getFirestore(app);
const auth = getAuth(app);

const initialMovies = [
  { title: "La tumba de las luciérnagas", date: "", genre: "Drama", criticScore: "9.4", publicScore: "9", luisScore: "9", nadiaScore: "8", average: "8.9", luisNotes: "Muy linda y nuestra primera pelicula", nadiaNotes: "Es un buen recuerdo por ser nuestra primer película. Le hizo falta un poco más a la peli." },
  { title: "Memorias de un caracol", date: "", genre: "Animación", criticScore: "8.1", publicScore: "8.1", luisScore: "8", nadiaScore: "9", average: "8.3", luisNotes: "Muy bonita, un poco rara pero está bien", nadiaNotes: "Me encanta el mensaje que da. Extraña, pero buena animación." },
  { title: "Anora", date: "", genre: "Drama", criticScore: "9.1", publicScore: "6.5", luisScore: "8.5", nadiaScore: "8", average: "8.0", luisNotes: "Es buena, si me gustó la verdad.", nadiaNotes: "Es buena, pero nada sorprendente." },
  { title: "Destino Final: Lazos De Sangre", date: "", genre: "Thriller", criticScore: "7.3", publicScore: "6.9", luisScore: "8", nadiaScore: "8", average: "7.6", luisNotes: "Mi primera de destino final y me agradó", nadiaNotes: "Me gusta la la relación a pelis anteriores, cumple." },
  { title: "Lilo y Stitch", date: "", genre: "Aventura", criticScore: "5.3", publicScore: "4.9", luisScore: "8", nadiaScore: "8", average: "6.6", luisNotes: "Owww.", nadiaNotes: "Bonita y graciosa." },
  { title: "Cómo entrenar a tu dragón", date: "", genre: "Aventura", criticScore: "6.1", publicScore: "7.6", luisScore: "8", nadiaScore: "8.5", average: "7.6", luisNotes: "Perfecta.", nadiaNotes: "Muy bonita animación e historia, aunque incompleta." },
  { title: "Ballerina", date: "", genre: "Acción", criticScore: "5.9", publicScore: "6.6", luisScore: "9", nadiaScore: "8", average: "7.4", luisNotes: "Muy buena pelicula, buena continuacion, me encanta.", nadiaNotes: "Buena, desconocía sus inicios." },
  { title: "Los tipos malos 2", date: "", genre: "Animación", criticScore: "6.4", publicScore: "7.7", luisScore: "7", nadiaScore: "7", average: "7.0", luisNotes: "Es buena, no ví la 1 pero está entetenida.", nadiaNotes: "Faltó ver el incio, pero entretenida." },
  { title: "La Hora De La Desaparición", date: "", genre: "Misterio", criticScore: "8.1", publicScore: "7.3", luisScore: "9", nadiaScore: "9", average: "8.4", luisNotes: "Buen suspenso y misterio, me agrada aunque le faltó algo de historia.", nadiaNotes: "Me agradó la historia, la perspectiva de c/ personaje y escenas de suspenso." },
  { title: "Haz Que Regrese", date: "", genre: "Suspenso", criticScore: "7.5", publicScore: "6.9", luisScore: "9", nadiaScore: "9", average: "8.1", luisNotes: "Muy buena honestamente, todo muy bien.", nadiaNotes: "Te provoca sensaciones y eso me agrada, algo sangrienta pero no demasiado. Buena trama." },
  { title: "Jurassic World: El renacer", date: "", genre: "Ciencia ficción", criticScore: "5", publicScore: "5.3", luisScore: "3", nadiaScore: "4", average: "4.3", luisNotes: "No he visto todas pero siento que para ser la más nueva, le faltaron muchas cosas.", nadiaNotes: "Mucho que desear, no cumple con las expectativas." },
  { title: "Sé lo que hicieron el verano pasado", date: "", genre: "Terror", criticScore: "4.2", publicScore: "4.1", luisScore: "6", nadiaScore: "7", average: "5.3", luisNotes: "Meh, está bien, pero nada increíble,", nadiaNotes: "Buena historia, buenas escenas de suspenso, le faltó un mejor final." },
  { title: "Bambi", date: "", genre: "Terror", criticScore: "TBD", publicScore: "4.8", luisScore: "0", nadiaScore: "0", average: "1.6", luisNotes: "💩", nadiaNotes: "Mala en todos los aspectos." },
  { title: "El Conjuro 4", date: "", genre: "Terror", criticScore: "5.4", publicScore: "5.7", luisScore: "8", nadiaScore: "7", average: "6.5", luisNotes: "Me gustó, está bien y me agrada la historia, pero para ser \"El conjuro\", me faltó más.", nadiaNotes: "Es buena/ entretenida, pero hizo falta más. Era una película fuerte." },
  { title: "Silent Hill: El regrso", date: "", genre: "Terror", criticScore: "3.4", publicScore: "4.4", luisScore: "3", nadiaScore: "3.5", average: "3.6", luisNotes: "Muy \"xd\" con la historia.", nadiaNotes: "Buenos personajes, malísima trama/ historia." },
  { title: "Primate", date: "", genre: "Terror", criticScore: "5.8", publicScore: "5.3", luisScore: "6", nadiaScore: "6", average: "5.8", luisNotes: "Es buena, pero le falta algo, no sé qué, pero algo le falta.", nadiaNotes: "Buena iniciativa perp mala ejecución." },
  { title: "Hoppers", date: "", genre: "Animación", criticScore: "7.3", publicScore: "7.7", luisScore: "7.5", nadiaScore: "7", average: "7.4", luisNotes: "Es muy linda, es tierna, me gustó.", nadiaNotes: "Bonita historia, linda forma de representar a los animales. De repente pierde el hilo." },
  { title: "La Casa de Papel", date: "", genre: "Acción", criticScore: "TBD", publicScore: "8.2", luisScore: "9", nadiaScore: "9", average: "8.7", luisNotes: "Muy buena, sin mas que agregar.", nadiaNotes: "La historia es buena, me agrada los giros que da a la trama." },
  { title: "Cars", date: "", genre: "Animación", criticScore: "7.3", publicScore: "7.9", luisScore: "10", nadiaScore: "10", average: "8.8", luisNotes: "<3", nadiaNotes: "<3" },
  { title: "Exit 8", date: "29/04/26", genre: "Misterio", criticScore: "7.1", publicScore: "6.5", luisScore: "2.6", nadiaScore: "2", average: "4.6", luisNotes: "Es interesante, pero nada increíble. (Me dormí)", nadiaNotes: "Demasiado repetitiva. Entiendo el concepto pero se vuelve tedioso. (Estuve a nada de dormir)." },
  { title: "No dejes a los niños solos", date: "15/05/26", genre: "Terror Psicológico", criticScore: "6", publicScore: "TBD", luisScore: "8.8", nadiaScore: "8", average: "7.6", luisNotes: "Es buena, tiene buena trama y te mantiene todo el tiempo en suspenso sin animaciones baratas.", nadiaNotes: "Me sorprendió la manera de llevar la trama, normalmente no se ven así las películas de terror mexicanas. Buena trama, buenas escenas, sin necesidad de montar algo adicional." },
  { title: "Obsesión", date: "20/05/26", genre: "Horror", criticScore: "8.2", publicScore: "9.5", luisScore: "9", nadiaScore: "8.5", average: "8.8", luisNotes: "Muy, muy buena, todo el tiempo te mantiene con la sensasión de incómodo, te atrapa, buena historia, me gustó mucho.", nadiaNotes: "Buena propuesta de terror, aún sin contar con monstruos, fantasmas o algo así. Me gustó." },
  { title: "La novia del diablo", date: "03/06/26", genre: "Terror?", criticScore: "", publicScore: "", luisScore: "0", nadiaScore: "0", average: "0.0", luisNotes: "💩💩💩", nadiaNotes: "Mala en todos los aspectos." }
];

export default function PeliNad() {
  const [movies, setMovies] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [filter, setFilter] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '', date: '', genre: '', criticScore: '', publicScore: '', 
    luisScore: '', nadiaScore: '', luisNotes: '', nadiaNotes: ''
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined') {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchMovies(currentUser);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchMovies = (currentUser) => {
    // We use a shared collection so both of you can see the same list if needed later, 
    // but for now, we'll store it under the current user's UID to ensure it works smoothly in this env.
    const moviesRef = collection(db, 'artifacts', appId, 'users', currentUser.uid, 'movies');
    const q = query(moviesRef);
    
    return onSnapshot(q, async (snapshot) => {
      if (snapshot.empty && movies.length === 0 && !loading) {
         // If database is empty, seed with initial data
         console.log("Seeding initial data...");
         seedInitialData(currentUser.uid);
      } else {
        const fetchedMovies = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by date (if available) or title
        fetchedMovies.sort((a, b) => {
           if (a.date && b.date) {
               // Basic sorting for DD/MM/YY format, could be improved
               const [da, ma, ya] = a.date.split('/');
               const [db, mb, yb] = b.date.split('/');
               const dateA = new Date(`20${ya}-${ma}-${da}`);
               const dateB = new Date(`20${yb}-${mb}-${db}`);
               return dateB - dateA;
           }
           return a.title.localeCompare(b.title);
        });

        setMovies(fetchedMovies);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching movies:", error);
      setLoading(false);
    });
  };

  const seedInitialData = async (uid) => {
    const moviesRef = collection(db, 'artifacts', appId, 'users', uid, 'movies');
    
    try {
      for (const movie of initialMovies) {
        // Calculate average for initial data just in case
        const lScore = parseFloat(movie.luisScore) || 0;
        const nScore = parseFloat(movie.nadiaScore) || 0;
        const avg = ((lScore + nScore) / 2).toFixed(1);
        
        await addDoc(moviesRef, {
            ...movie,
            average: avg
        });
      }
      console.log("Initial data seeded successfully.");
    } catch (error) {
      console.error("Error seeding initial data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calculateAverage = (luis, nadia) => {
    const lScore = parseFloat(luis) || 0;
    const nScore = parseFloat(nadia) || 0;
    
    // Only calculate if at least one has a score, else return "TBD" or "0.0"
    if (luis === "" && nadia === "") return "0.0";
    
    const count = (luis !== "" ? 1 : 0) + (nadia !== "" ? 1 : 0);
    if (count === 0) return "0.0";
    
    return ((lScore + nScore) / count).toFixed(1);
  };

  const saveMovie = async (e) => {
    e.preventDefault();
    if (!user || !formData.title) return;

    setLoading(true);
    const moviesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'movies');
    
    const average = calculateAverage(formData.luisScore, formData.nadiaScore);
    const movieData = { ...formData, average };

    try {
      if (editingMovie) {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'movies', editingMovie.id);
        await updateDoc(docRef, movieData);
      } else {
        await addDoc(moviesRef, movieData);
      }
      closeModal();
    } catch (error) {
      console.error("Error saving movie:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMovie = async (id) => {
      // In a real app we'd use a custom modal for confirmation, but for this self-contained
      // component we'll just delete directly or use a simple state-based confirm if needed.
      // For simplicity here, we'll proceed with deletion.
      if (!user) return;
      
      try {
          const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'movies', id);
          await deleteDoc(docRef);
      } catch(error) {
          console.error("Error deleting movie:", error);
      }
  }

  const openModal = (movie = null) => {
    if (movie) {
      setEditingMovie(movie);
      setFormData(movie);
    } else {
      setEditingMovie(null);
      setFormData({
        title: '', date: '', genre: '', criticScore: '', publicScore: '', 
        luisScore: '', nadiaScore: '', luisNotes: '', nadiaNotes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMovie(null);
  };

  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(filter.toLowerCase()) || 
    m.genre.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-rose-600 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Star className="fill-yellow-400 text-yellow-400" /> 
              PeliNad
            </h1>
            <p className="text-rose-100 text-sm mt-1">Nuestro diario de películas</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-white text-rose-600 hover:bg-rose-50 font-semibold py-2 px-4 rounded-full shadow-md flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nueva Película</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Search & Filter */}
        <div className="mb-8 relative">
          <input 
            type="text" 
            placeholder="Buscar por título o género..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-96 px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-rose-300 focus:border-rose-300 outline-none transition-all"
          />
        </div>

        {/* Movie Grid */}
        {loading && movies.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMovies.map(movie => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onEdit={() => openModal(movie)}
                onDelete={() => deleteMovie(movie.id)}
              />
            ))}
            
            {filteredMovies.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No se encontraron películas.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <MovieModal 
          formData={formData}
          handleInputChange={handleInputChange}
          saveMovie={saveMovie}
          closeModal={closeModal}
          isEditing={!!editingMovie}
        />
      )}
    </div>
  );
}

function MovieCard({ movie, onEdit, onDelete }) {
  // Determine color based on average score
  const getScoreColor = (score) => {
    const num = parseFloat(score);
    if (isNaN(num)) return "bg-gray-200 text-gray-700";
    if (num >= 8.5) return "bg-green-100 text-green-800 border-green-200";
    if (num >= 7.0) return "bg-blue-100 text-blue-800 border-blue-200";
    if (num >= 5.0) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow flex flex-col h-full group">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 leading-tight pr-2">{movie.title}</h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50">
              <Edit2 size={16} />
            </button>
            <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg">
            {movie.genre || 'Sin género'}
          </span>
          {movie.date && (
            <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg flex items-center gap-1">
              <Calendar size={12} /> {movie.date}
            </span>
          )}
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-2 mb-5 text-center">
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <div className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Luis</div>
            <div className="font-bold text-lg text-blue-600">{movie.luisScore || '-'}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <div className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Promedio</div>
            <div className={`font-bold text-xl inline-block px-2 py-0.5 rounded-md border ${getScoreColor(movie.average)}`}>
              {movie.average}
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <div className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Nadia</div>
            <div className="font-bold text-lg text-rose-600">{movie.nadiaScore || '-'}</div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mb-4 px-1">
          <span>Crítica: <strong>{movie.criticScore || '-'}</strong></span>
          <span>Público: <strong>{movie.publicScore || '-'}</strong></span>
        </div>

        {/* Notes */}
        <div className="space-y-3 mt-auto">
          {movie.luisNotes && (
             <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-sm text-gray-700">
               <div className="flex items-center gap-1.5 mb-1 text-blue-700 font-medium text-xs">
                 <MessageCircle size={14} /> Luis dice:
               </div>
               <p className="italic">{movie.luisNotes}</p>
             </div>
          )}
          {movie.nadiaNotes && (
             <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 text-sm text-gray-700">
               <div className="flex items-center gap-1.5 mb-1 text-rose-700 font-medium text-xs">
                 <MessageCircle size={14} /> Nadia dice:
               </div>
               <p className="italic">{movie.nadiaNotes}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MovieModal({ formData, handleInputChange, saveMovie, closeModal, isEditing }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar Película' : 'Agregar Nueva Película'}
          </h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-6 overflow-y-auto">
          <form id="movieForm" onSubmit={saveMovie} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  placeholder="Ej: La tumba de las luciérnagas"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha vista (Opcional)</label>
                <input 
                  type="text" name="date" value={formData.date} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  placeholder="DD/MM/YY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                <input 
                  type="text" name="genre" value={formData.genre} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  placeholder="Ej: Drama, Terror..."
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Ratings Grid */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-600 uppercase mb-4 flex items-center gap-2">
                    <Star size={16} /> Calificaciones (0-10)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Luis</label>
                    <input type="text" name="luisScore" value={formData.luisScore} onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" placeholder="0-10" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rose-700 mb-1">Nadia</label>
                    <input type="text" name="nadiaScore" value={formData.nadiaScore} onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-white" placeholder="0-10" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Crítica general</label>
                    <input type="text" name="criticScore" value={formData.criticScore} onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 outline-none bg-white" placeholder="Ej: 8.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Público</label>
                    <input type="text" name="publicScore" value={formData.publicScore} onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 outline-none bg-white" placeholder="Ej: 9.0" />
                  </div>
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Observaciones Luis</label>
                <textarea name="luisNotes" value={formData.luisNotes} onChange={handleInputChange} rows="2"
                  className="w-full px-4 py-2 border border-blue-200 bg-blue-50/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="¿Qué te pareció?"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-rose-700 mb-1">Observaciones Nadia</label>
                <textarea name="nadiaNotes" value={formData.nadiaNotes} onChange={handleInputChange} rows="2"
                  className="w-full px-4 py-2 border border-rose-200 bg-rose-50/30 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                  placeholder="¿Qué te pareció?"
                ></textarea>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl shrink-0">
          <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
          <button type="submit" form="movieForm" className="px-6 py-2.5 rounded-xl font-medium bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-colors">
            {isEditing ? 'Guardar Cambios' : 'Agregar Película'}
          </button>
        </div>

      </div>
    </div>
  );
}
