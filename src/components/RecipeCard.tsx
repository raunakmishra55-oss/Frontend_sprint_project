import type { Meal } from '../services/mealApi';
import './RecipeCard.css';

interface RecipeCardProps {
  meal: Meal;
  isShaking: boolean;
}

export default function RecipeCard({ meal, isShaking }: RecipeCardProps) {
  return (
    <div className={`recipe-card animate-in ${isShaking ? 'shake' : ''}`} id="recipe-card">
      <div className="recipe-card__image-section">
        <img 
          src={meal.strMealThumb} 
          alt={meal.strMeal}
          className="recipe-card__image"
          loading="eager"
        />
        <div className="recipe-card__image-overlay">
          <span className="recipe-card__category">{meal.strCategory}</span>
          <span className="recipe-card__area">{meal.strArea}</span>
        </div>
        <div className="recipe-card__target-label">🎯 TODAY'S VICTIM</div>
      </div>

      <div className="recipe-card__body">
        <h2 className="recipe-card__name">{meal.strMeal}</h2>
        
        {meal.strTags && (
          <div className="recipe-card__tags">
            {meal.strTags.split(',').map((tag) => (
              <span key={tag} className="recipe-card__tag">#{tag.trim()}</span>
            ))}
          </div>
        )}

        <div className="recipe-card__section">
          <h3 className="recipe-card__section-title">
            <span className="recipe-card__section-icon">🧂</span>
            Ingredients
          </h3>
          <ul className="recipe-card__ingredients">
            {meal.ingredients.map((ingredient, i) => (
              <li key={i} className="recipe-card__ingredient">
                <span className="recipe-card__measure">{meal.measures[i]}</span>
                <span className="recipe-card__ingredient-name">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="recipe-card__section">
          <h3 className="recipe-card__section-title">
            <span className="recipe-card__section-icon">📝</span>
            Instructions
          </h3>
          <p className="recipe-card__instructions">
            {meal.strInstructions.length > 400 
              ? meal.strInstructions.substring(0, 400) + '...' 
              : meal.strInstructions
            }
          </p>
        </div>
      </div>
    </div>
  );
}
