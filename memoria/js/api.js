const WILDLIFE_TAXON_IDS = [
  41964,   // Leão
  41967,   // Tigre
  43694,   // Elefante-africano
  1510582, // Girafa
  41659,   // Panda-gigante
  42983,   // Coala
  3820,    // Pinguim-imperador
  42069,   // Raposa
  20034,   // Coruja
  42048,   // Lobo
  41482,   // Golfinho
  43335,   // Zebra
  1453439, // Canguru-vermelho
  41644,   // Urso-polar
  5305,    // Águia-careca
  41653,   // Panda-vermelho
  41955,   // Chita / Guepardo
  41860    // Lontra-marinha
];

const POKEMON_IDS = [
  25,  // Pikachu
  6,   // Charizard
  1,   // Bulbasaur
  7,   // Squirtle
  133, // Eevee
  94,  // Gengar
  143, // Snorlax
  448, // Lucario
  150, // Mewtwo
  149, // Dragonite
  39,  // Jigglypuff
  54,  // Psyduck
  130, // Gyarados
  59,  // Arcanine
  131, // Lapras
  197, // Umbreon
  282, // Gardevoir
  384  // Rayquaza
];

const PT_NAME_OVERRIDES = {
  20034: 'Coruja',
  42048: 'Lobo-cinzento',
  41482: 'Golfinho',
  5305: 'Águia-americana',
  1510582: 'Girafa'
};

function formatDogBreed(url) {
  const match = url.match(/breeds\/([^/]+)\//i);
  if (!match) return 'Cachorro';
  return match[1]
    .split('-')
    .reverse()
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function fetchWildlifeAnimals() {
  const url = `https://api.inaturalist.org/v1/taxa?id=${WILDLIFE_TAXON_IDS.join(',')}&locale=pt-BR&per_page=18`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro na API iNaturalist (${response.status})`);
  }
  const data = await response.json();
  const animals = (data.results || [])
    .filter((taxon) => taxon.default_photo && taxon.default_photo.medium_url)
    .slice(0, 18)
    .map((taxon) => ({
      id: `inat-${taxon.id}`,
      name: PT_NAME_OVERRIDES[taxon.id] || taxon.preferred_common_name || taxon.name,
      detail: taxon.name,
      image: taxon.default_photo.medium_url
    }));

  if (animals.length < 18) {
    throw new Error('A API não retornou todas as 18 imagens esperadas.');
  }
  return animals;
}

async function fetchDogAnimals(count = 18) {
  const response = await fetch(`https://dog.ceo/api/breeds/image/random/${count}`);
  if (!response.ok) {
    throw new Error(`Erro na Dog CEO API (${response.status})`);
  }
  const data = await response.json();
  return (data.message || []).slice(0, count).map((imgUrl, index) => ({
    id: `dog-${index}-${imgUrl.slice(-12)}`,
    name: formatDogBreed(imgUrl),
    detail: 'Dog CEO API',
    image: imgUrl
  }));
}

async function fetchPetsMix() {
  const [catsRes, dogs] = await Promise.all([
    fetch('https://api.thecatapi.com/v1/images/search?limit=10'),
    fetchDogAnimals(8)
  ]);

  if (!catsRes.ok) {
    throw new Error(`Erro na TheCatAPI (${catsRes.status})`);
  }
  const catsData = await catsRes.json();
  const cats = catsData.slice(0, 10).map((cat, index) => ({
    id: `cat-${cat.id || index}`,
    name: `Gato #${index + 1}`,
    detail: 'TheCatAPI',
    image: cat.url
  }));

  return [...cats, ...dogs].slice(0, 18);
}

async function fetchPokemonDeck() {
  const results = await Promise.all(
    POKEMON_IDS.map(async (id) => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!response.ok) {
        throw new Error(`Erro na PokéAPI (${response.status})`);
      }
      const p = await response.json();
      const artwork =
        p.sprites?.other?.['official-artwork']?.front_default ||
        p.sprites?.front_default;
      const types = (p.types || []).map((t) => t.type.name).join(' / ');
      const formattedName = p.name.charAt(0).toUpperCase() + p.name.slice(1);

      return {
        id: `poke-${p.id}`,
        name: formattedName,
        detail: types ? `Tipo: ${types}` : 'PokéAPI',
        image: artwork,
        isArtwork: true
      };
    })
  );

  return results;
}

export function preloadImages(animals, onProgress) {
  let loaded = 0;
  const total = animals.length;

  return Promise.all(
    animals.map(
      (animal) =>
        new Promise((resolve) => {
          const img = new Image();
          const finish = () => {
            loaded += 1;
            if (onProgress) onProgress(loaded, total);
            resolve();
          };
          img.onload = finish;
          img.onerror = finish;
          img.src = animal.image;
        })
    )
  );
}

export async function fetchAnimalDeck(themeKey, onProgress) {
  let animals;
  if (themeKey === 'pokemon') {
    animals = await fetchPokemonDeck();
  } else if (themeKey === 'dogs') {
    animals = await fetchDogAnimals(18);
  } else if (themeKey === 'pets') {
    animals = await fetchPetsMix();
  } else {
    animals = await fetchWildlifeAnimals();
  }

  await preloadImages(animals, onProgress);
  return animals;
}
