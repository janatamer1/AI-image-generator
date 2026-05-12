/* Smart image selection based on prompt keywords */

const IMAGE_CATEGORIES = {
  nature: [
    "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/462162/pexels-photo-462162.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  mountain: [
    "https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2104152/pexels-photo-2104152.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  ocean: [
    "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/949587/pexels-photo-949587.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/132037/pexels-photo-132037.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1535162/pexels-photo-1535162.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  city: [
    "https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/凌晨/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/凌晨/pexels-photo2.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  cyberpunk: [
    "https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3573383/pexels-photo-3573383.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  portrait: [
    "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  dog: [
    "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/257540/pexels-photo-257540.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/733416/pexels-photo-733416.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  cat: [
    "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  space: [
    "https://images.pexels.com/photos/110854/pexels-photo-110854.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1341279/pexels-photo-1341279.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  food: [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  abstract: [
    "https://images.pexels.com/photos/3573383/pexels-photo-3573383.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2881232/pexels-photo-2881232.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  architecture: [
    "https://images.pexels.com/photos/2732042/pexels-photo-2732042.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3780072/pexels-photo-3780072.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  default: [
    "https://images.pexels.com/photos/3573383/pexels-photo-3573383.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2732042/pexels-photo-2732042.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800",
  ]
};

const KEYWORD_MAP = {
  'nature': 'nature', 'forest': 'nature', 'tree': 'nature', 'jungle': 'nature', 'green': 'nature',
  'grass': 'nature', 'park': 'nature', 'garden': 'nature', 'flower': 'nature', 'leaf': 'nature',
  'sunset': 'nature', 'sunrise': 'nature', 'autumn': 'nature', 'fall': 'nature',
  'mountain': 'mountain', 'hill': 'mountain', 'peak': 'mountain', 'snow': 'mountain',
  'alpine': 'mountain', 'cliff': 'mountain', 'volcano': 'mountain',
  'ocean': 'ocean', 'sea': 'ocean', 'beach': 'ocean', 'wave': 'ocean', 'water': 'ocean',
  'lake': 'ocean', 'river': 'ocean', 'waterfall': 'ocean', 'coast': 'ocean',
  'city': 'city', 'urban': 'city', 'street': 'city', 'skyline': 'city',
  'building': 'architecture', 'night': 'city', 'downtown': 'city', 'town': 'city',
  'cyberpunk': 'cyberpunk', 'neon': 'cyberpunk', 'futuristic': 'cyberpunk',
  'sci-fi': 'cyberpunk', 'scifi': 'cyberpunk', 'cyber': 'cyberpunk', 'robot': 'cyberpunk',
  'person': 'portrait', 'portrait': 'portrait', 'face': 'portrait', 'woman': 'portrait',
  'man': 'portrait', 'people': 'portrait', 'human': 'portrait', 'girl': 'portrait',
  'boy': 'portrait', 'child': 'portrait', 'kid': 'portrait',
  'dog': 'dog', 'puppy': 'dog', 'canine': 'dog', 'golden retriever': 'dog',
  'husky': 'dog', 'labrador': 'dog', 'poodle': 'dog',
  'cat': 'cat', 'kitten': 'cat', 'feline': 'cat',
  'space': 'space', 'galaxy': 'space', 'star': 'space', 'cosmos': 'space',
  'planet': 'space', 'nebula': 'space', 'universe': 'space', 'astronaut': 'space',
  'food': 'food', 'meal': 'food', 'dish': 'food', 'burger': 'food', 'pizza': 'food',
  'salad': 'food', 'dessert': 'food', 'cake': 'food', 'coffee': 'food', 'restaurant': 'food',
  'abstract': 'abstract', 'art': 'abstract', 'pattern': 'abstract', 'texture': 'abstract',
  'colorful': 'abstract', 'paint': 'abstract', 'geometric': 'abstract',
  'architecture': 'architecture', 'interior': 'architecture', 'room': 'architecture',
  'house': 'architecture', 'modern': 'architecture', 'mansion': 'architecture',
};

function getImageForPrompt(prompt) {
  const lower = prompt.toLowerCase();
  let category = 'default';
  let longestMatch = 0;

  for (const [keyword, cat] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword) && keyword.length > longestMatch) {
      category = cat;
      longestMatch = keyword.length;
    }
  }

  const images = IMAGE_CATEGORIES[category] || IMAGE_CATEGORIES.default;
  return images[Math.floor(Math.random() * images.length)];
}

window.getImageForPrompt = getImageForPrompt;
