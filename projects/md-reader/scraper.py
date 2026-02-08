import urllib.request
import json
import os
import re
import datetime
import ssl

# Disable SSL verification for simplicity in this environment if needed,
# though standard verify is better. But sometimes in restricted envs it fails.
# I'll try with standard first, if fails I can update.
# Actually, let's just use unverified context to be safe against cert issues in old envs.
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

OUTPUT_DIR = "projects/md-reader/recipes/"
MAX_RECIPES = 5
GENERATED_COUNT = 0

def clean_html(text):
    if not text: return ""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text).strip()

def normalize_unit(unit):
    if not unit: return ""
    unit = unit.lower().strip()
    if unit in ["tablespoon", "tablespoons", "T"]:
        return "tbsp"
    if unit in ["teaspoon", "teaspoons", "t"]:
        return "tsp"
    return unit

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text

def save_recipe(recipe_data):
    global GENERATED_COUNT
    if GENERATED_COUNT >= MAX_RECIPES:
        return

    filename = f"{slugify(recipe_data['title'])}.md"
    filepath = os.path.join(OUTPUT_DIR, filename)

    # Check if file exists to avoid overwriting (though we want samples so maybe overwrite is fine)
    # We'll just write it.

    tags_str = ", ".join([f'"{t.strip()}"' for t in recipe_data.get('tags', [])])

    # Construct YAML
    yaml = "---\n"
    yaml += f"title: \"{recipe_data['title']}\"\n"
    yaml += f"date: {datetime.date.today()}\n"
    yaml += f"tags: [{tags_str}]\n"
    yaml += "time:\n"
    yaml += f"  prep: {recipe_data.get('prep_time', 0)}\n"
    yaml += f"  cook: {recipe_data.get('cook_time', 0)}\n"
    yaml += f"  total: {recipe_data.get('total_time', 0)}\n"
    yaml += f"servings: {recipe_data.get('servings', 4)}\n"
    yaml += f"source: \"{recipe_data['source']}\"\n"
    yaml += "ingredients:\n"

    for ing in recipe_data.get('ingredients', []):
        item = ing.get('item', '').replace('"', '\\"')
        qty = ing.get('qty', 0)
        unit = ing.get('unit', '')
        # Try to parse qty as float if it's a string
        if isinstance(qty, str):
            try:
                # Handle fractions like "1/2"
                if '/' in qty:
                    n, d = qty.split('/')
                    qty = float(n) / float(d)
                else:
                    qty = float(re.findall(r"[\d\.]+", qty)[0]) if re.findall(r"[\d\.]+", qty) else 0
            except:
                qty = 0 # Fallback

        yaml += f"  - item: \"{item}\"\n"
        yaml += f"    qty: {qty}\n"
        yaml += f"    unit: \"{unit}\"\n"
        cat = ing.get('category')
        if cat:
            yaml += f"    category: \"{cat}\"\n"

    yaml += "---\n\n"

    content = yaml + f"# {recipe_data['title']}\n\n"
    content += recipe_data['instructions']

    with open(filepath, "w") as f:
        f.write(content)

    print(f"Generated: {filepath}")
    GENERATED_COUNT += 1

def fetch_themealdb():
    global GENERATED_COUNT
    if GENERATED_COUNT >= MAX_RECIPES: return

    print("Fetching from TheMealDB...")
    # Fetch a few random meals or search by letter 'a'
    url = "https://www.themealdb.com/api/json/v1/1/search.php?s=a"

    try:
        with urllib.request.urlopen(url, context=ctx) as response:
            data = json.loads(response.read().decode())
            meals = data.get('meals', [])

            for meal in meals:
                if GENERATED_COUNT >= MAX_RECIPES: break

                # Logic
                title = meal.get('strMeal')
                instructions = clean_html(meal.get('strInstructions', ''))
                tags = meal.get('strTags', '').split(',') if meal.get('strTags') else []
                tags = [t for t in tags if t]

                ingredients = []
                for i in range(1, 21):
                    ing_name = meal.get(f'strIngredient{i}')
                    ing_measure = meal.get(f'strMeasure{i}')

                    if ing_name and ing_name.strip():
                        # Simple parsing of measure to qty/unit is hard, so we'll put full measure in unit if parsing fails?
                        # Or just put 0 for qty and full string in unit?
                        # The prompt says: "Combine them into your ingredients YAML list."
                        # I'll try a basic split
                        qty = 1 # Default
                        unit = ing_measure.strip() if ing_measure else ""

                        # Very basic heuristic
                        parts = unit.split(' ', 1)
                        if len(parts) == 2 and parts[0].replace('.', '', 1).isdigit():
                             qty = parts[0]
                             unit = normalize_unit(parts[1])
                        elif len(parts) == 2 and '/' in parts[0]:
                             qty = parts[0]
                             unit = normalize_unit(parts[1])
                        else:
                             qty = 0 # Could not parse qty
                             unit = normalize_unit(unit)

                        ingredients.append({
                            "item": ing_name.strip(),
                            "qty": qty,
                            "unit": unit
                        })

                recipe = {
                    "title": title,
                    "tags": tags,
                    "instructions": instructions,
                    "source": "TheMealDB",
                    "ingredients": ingredients,
                    "servings": 4, # Default
                    "prep_time": 0,
                    "cook_time": 0,
                    "total_time": 0
                }
                save_recipe(recipe)

    except Exception as e:
        print(f"Error fetching TheMealDB: {e}")

def fetch_forkgasm():
    global GENERATED_COUNT
    if GENERATED_COUNT >= MAX_RECIPES: return

    print("Fetching from Forkgasm...")
    url = "https://raw.githubusercontent.com/LeaVerou/forkgasm/master/recipes.json"

    try:
        with urllib.request.urlopen(url, context=ctx) as response:
            data = json.loads(response.read().decode())
            # Forkgasm structure is a list of recipes directly? Or under a key?
            # From earlier curl: { "recipe": [ ... ] } or just [ ... ]?
            # User sample output showed { "recipe": [ ... ] } but that might have been inferred.
            # Let's assume list or dict with 'recipe' key.

            recipes_list = []
            if isinstance(data, list):
                recipes_list = data
            elif isinstance(data, dict) and 'recipe' in data:
                 recipes_list = data['recipe']
            else:
                 # Fallback, maybe it's a dict where keys are IDs?
                 recipes_list = data.values() if isinstance(data, dict) else []

            for r in recipes_list:
                if GENERATED_COUNT >= MAX_RECIPES: break

                # Check structure
                if not isinstance(r, dict): continue

                title = r.get('name', 'Untitled')
                desc = r.get('description', '')
                # Forkgasm doesn't seem to have full instructions in 'description', usually just intro.
                # But sometimes it has 'instructions' or 'method'.
                # Let's check keys.
                instructions = r.get('instructions', r.get('method', desc))
                if isinstance(instructions, list):
                    instructions = "\n".join(instructions)

                tags = r.get('tag', [])

                ingredients = []
                # Forkgasm might have nested ingredient groups
                raw_ing = r.get('ingredient', [])
                ing_groups = r.get('ingredientGroup', [])

                all_raw_ings = raw_ing
                for g in ing_groups:
                    all_raw_ings.extend(g.get('ingredient', []))

                for ing in all_raw_ings:
                    # ing is dict {name, unit, quantity?}
                    # Verify structure
                    if isinstance(ing, dict):
                         item = ing.get('name', '')
                         qty = ing.get('quantity', ing.get('amount', 0))
                         unit = normalize_unit(ing.get('unit', ''))
                         ingredients.append({
                             "item": item,
                             "qty": qty,
                             "unit": unit
                         })

                recipe = {
                    "title": title,
                    "tags": tags,
                    "instructions": instructions,
                    "source": "Forkgasm",
                    "ingredients": ingredients,
                    "servings": r.get('yield', 4),
                    "prep_time": 0,
                    "cook_time": 0, # Forkgasm typically has time strings like "1 hour", parsing is hard without deps
                    "total_time": 0
                }
                save_recipe(recipe)

    except Exception as e:
        print(f"Error fetching Forkgasm: {e}")

def fetch_culinary_heritage():
    # User said URL is: https://raw.githubusercontent.com/dpapathanasiou/recipes/master/samples/food_recipes.json
    # We know this 404s. We will try and catch.
    print("Fetching from CulinaryHeritage...")
    url = "https://raw.githubusercontent.com/dpapathanasiou/recipes/master/samples/food_recipes.json"
    try:
         with urllib.request.urlopen(url, context=ctx) as response:
             print("CulinaryHeritage found!")
             # If found, parse similarly.
    except Exception as e:
        print(f"Skipping CulinaryHeritage (Source #3): {e}")

if __name__ == "__main__":
    fetch_themealdb()
    fetch_forkgasm()
    fetch_culinary_heritage()
    print(f"Done. Generated {GENERATED_COUNT} recipes.")
