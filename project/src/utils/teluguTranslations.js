// Telugu translations for common vegetables and products
export const teluguTranslations = {
  // Common Vegetables
  'tomato': 'టమాట',
  'tomatoes': 'టమాట',
  'onion': 'ఉల్లిపాయ',
  'onions': 'ఉల్లిపాయ',
  'potato': 'బంగాళాదుంప',
  'potatoes': 'బంగాళాదుంప',
  'carrot': 'క్యారెట్',
  'carrots': 'క్యారెట్',
  'cabbage': 'క్యాబేజీ',
  'cauliflower': 'ఫ్లవర్',
  'brinjal': 'వంకాయ',
  'eggplant': 'వంకాయ',
  'ladies finger': 'బెండకాయ',
  'okra': 'బెండకాయ',
  'bottle gourd': 'సొరకాయ',
  'ridge gourd': 'బీరకాయ',
  'snake gourd': 'పొట్లకాయ',
  'bitter gourd': 'కాకరకాయ',
  'cucumber': 'దోసకాయ',
  'green beans': 'చిక్కుడు',
  'beans': 'చిక్కుడు',
  'cluster beans': 'గోరుచిక్కుడు',
  'drumstick': 'మునగకాయ',
  'spinach': 'పాలకూర',
  'coriander': 'కొత్తిమీర',
  'mint': 'పుదీనా',
  'curry leaves': 'కరివేపాకు',
  'green chilli': 'పచ్చిమిర్చి',
  'green chillies': 'పచ్చిమిర్చి',
  'red chilli': 'ఎర్రమిర్చి',
  'red chillies': 'ఎర్రమిర్చి',
  'ginger': 'అల్లం',
  'garlic': 'వెల్లుల్లి',
  'radish': 'ముల్లంగి',
  'beetroot': 'బీట్రూట్',
  'turnip': 'నవలకూర',
  'broccoli': 'బ్రోకోలీ',
  'bell pepper': 'కాప్సికం',
  'capsicum': 'కాప్సికం',
  'green pepper': 'కాప్సికం',
  'red pepper': 'ఎర్రకాప్సికం',
  'yellow pepper': 'పసుపుకాప్సికం',
  'corn': 'మొక్కజొన్న',
  'sweet corn': 'మొక్కజొన్న',
  'peas': 'బటానీ',
  'green peas': 'బటానీ',
  'pumpkin': 'గుమ్మడికాయ',
  'ash gourd': 'బూడిదకాయ',
  'ivy gourd': 'కొండకాయ',
  'tinda': 'దొండకాయ',
  'zucchini': 'జుక్కిని',
  'lettuce': 'లెట్యూస్',
  'celery': 'సెలరీ',
  'spring onion': 'వెల్లుల్లిపొడి',
  'leek': 'లీక్',
  'fennel': 'సోంపు',
  'dill': 'సబ్బసిగ',
  'basil': 'తులసి',
  'parsley': 'పార్స్లీ',
  'fenugreek': 'మెంతులు',
  'methi': 'మెంతులు',
  'mustard greens': 'ఆవకూర',
  'amaranth': 'తోటకూర',
  'taro': 'చేమదుంప',
  'yam': 'కంద',
  'sweet potato': 'చిలగడదుంప',
  'colocasia': 'చేమదుంప',
  'raw banana': 'అరటికాయ',
  'plantain': 'అరటికాయ',
  'banana flower': 'అరటిపువ్వు',
  'banana stem': 'అరటికాడ',
  
  // Fruits (commonly sold as vegetables)
  'lemon': 'నిమ్మ',
  'lime': 'నిమ్మ',
  'raw mango': 'మామిడికాయ',
  'mango': 'మామిడి',
  
  // Grains & Pulses (mentioned in placeholder)
  'atta': 'అట్ట',
  'wheat flour': 'అట్ట',
  'dal': 'డాల్',
  'lentil': 'డాల్',
  'toor dal': 'కందిపప్పు',
  'moong dal': 'పెసరపప్పు',
  'masoor dal': 'మసూర్',
  'chana dal': 'సెనగపప్పు',
  'urad dal': 'మినుములు',
  'black gram': 'మినుములు',
  'green gram': 'పెసర',
  'red gram': 'కంది',
  
  // Beverages
  'coke': 'కోక్',
  'coca cola': 'కోక్',
  'cola': 'కోక్',
  
  // Common terms
  'organic': 'సేంద్రియ',
  'fresh': 'తాజా',
  'vegetable': 'కూరగాయ',
  'vegetables': 'కూరగాయలు',
  'leafy greens': 'ఆకుకూరలు',
  'root veggies': 'వేరుకూరలు',
  'fresh fruits': 'తాజా పళ్ళు',
};

/**
 * Get Telugu translation for a given English name
 * @param {string} englishName - The English name to translate
 * @returns {string} - The Telugu translation or the original name if not found
 */
export const getTeluguName = (englishName) => {
  if (!englishName) return '';
  
  const normalizedName = englishName.toLowerCase().trim();
  
  // Direct match
  if (teluguTranslations[normalizedName]) {
    return teluguTranslations[normalizedName];
  }
  
  // Partial match - check if any key is contained in the name
  for (const [key, telugu] of Object.entries(teluguTranslations)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return telugu;
    }
  }
  
  // Return original if no translation found
  return '';
};

/**
 * Get both English and Telugu names formatted
 * @param {string} englishName - The English name
 * @param {string} existingLocalName - Existing local name from product (if any)
 * @returns {object} - Object with english and telugu properties
 */
export const getProductNames = (englishName, existingLocalName = null) => {
  const telugu = existingLocalName || getTeluguName(englishName);
  
  return {
    english: englishName,
    telugu: telugu,
    display: telugu ? `${englishName} (${telugu})` : englishName
  };
};

