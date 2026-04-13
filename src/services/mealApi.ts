// TheMealDB API service

export interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  ingredients: string[];
  measures: string[];
}

interface MealDBResponse {
  meals: Record<string, string | null>[] | null;
}

/**
 * Extract ingredients and measures from the MealDB response format.
 * MealDB stores ingredients as strIngredient1..strIngredient20
 */
function extractIngredients(raw: Record<string, string | null>): { ingredients: string[]; measures: string[] } {
  const ingredients: string[] = [];
  const measures: string[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const ingredient = raw[`strIngredient${i}`];
    const measure = raw[`strMeasure${i}`];
    
    if (ingredient && ingredient.trim() !== '') {
      ingredients.push(ingredient.trim());
      measures.push(measure?.trim() || '');
    }
  }
  
  return { ingredients, measures };
}

/**
 * Parse raw MealDB API response into our Meal type.
 */
function parseMeal(raw: Record<string, string | null>): Meal {
  const { ingredients, measures } = extractIngredients(raw);
  
  return {
    idMeal: raw.idMeal || '',
    strMeal: raw.strMeal || 'Mystery Dish',
    strCategory: raw.strCategory || 'Unknown',
    strArea: raw.strArea || 'Unknown',
    strInstructions: raw.strInstructions || 'No instructions provided.',
    strMealThumb: raw.strMealThumb || '',
    strTags: raw.strTags || null,
    strYoutube: raw.strYoutube || null,
    ingredients,
    measures,
  };
}

/**
 * Fetch a random meal from TheMealDB.
 */
export async function fetchRandomMeal(): Promise<Meal> {
  const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
  
  if (!response.ok) {
    throw new Error(`MealDB API error: ${response.status}`);
  }
  
  const data: MealDBResponse = await response.json();
  
  if (!data.meals || data.meals.length === 0) {
    throw new Error('No meals found. Even MealDB has given up.');
  }
  
  return parseMeal(data.meals[0]);
}

/**
 * Search for a meal by name.
 */
export async function searchMeal(name: string): Promise<Meal | null> {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`
  );
  
  if (!response.ok) {
    throw new Error(`MealDB API error: ${response.status}`);
  }
  
  const data: MealDBResponse = await response.json();
  
  if (!data.meals || data.meals.length === 0) {
    return null;
  }
  
  return parseMeal(data.meals[0]);
}
